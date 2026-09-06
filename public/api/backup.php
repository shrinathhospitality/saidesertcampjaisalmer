<?php
require __DIR__ . '/config.php';
require __DIR__ . '/lib/response.php';
require __DIR__ . '/lib/security.php';
require __DIR__ . '/lib/json_store.php';

require_auth();

$action = $_GET['action'] ?? null;
$manualDir = BACKUPS_DIR . '/manual';
$indexPath = $manualDir . '/index.json';
if (!is_dir($manualDir)) {
    mkdir($manualDir, 0750, true);
}

function backup_index(): array
{
    global $indexPath;
    return read_json_file($indexPath, []);
}

function save_backup_index(array $items): void
{
    global $indexPath;
    write_json_file($indexPath, $items);
}

function data_files_for_backup(): array
{
    $files = glob(DATA_DIR . '/*.json') ?: [];
    return array_values(array_filter($files, fn($f) => basename($f) !== '.htaccess'));
}

function use_zip(): bool
{
    return class_exists('ZipArchive');
}

if ($action === 'list' && $_SERVER['REQUEST_METHOD'] === 'GET') {
    $items = backup_index();
    usort($items, fn($a, $b) => strcmp($b['createdAt'], $a['createdAt']));
    json_ok($items);
}

if ($action === 'create' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    require_csrf();
    $body = read_json_body();
    $includeMedia = (bool) ($body['includeMedia'] ?? false);

    $stamp = date('Ymd-His');
    $id = 'backup-' . $stamp;
    $ext = use_zip() ? 'zip' : 'tar.gz';
    $archivePath = $manualDir . '/' . $id . '.' . $ext;

    $manifest = [
        'version' => 1,
        'createdAt' => date('c'),
        'includesMedia' => $includeMedia,
        'dataFiles' => array_map('basename', data_files_for_backup()),
    ];
    $manifestTmp = sys_get_temp_dir() . '/' . $id . '-manifest.json';
    file_put_contents($manifestTmp, json_encode($manifest, JSON_PRETTY_PRINT));

    $mediaFiles = [];
    if ($includeMedia) {
        foreach (['images', 'documents'] as $sub) {
            foreach (glob(UPLOADS_DIR . "/{$sub}/*") ?: [] as $f) {
                if (is_file($f)) {
                    $mediaFiles[] = [$f, "uploads/{$sub}/" . basename($f)];
                }
            }
        }
    }

    if (use_zip()) {
        $zip = new ZipArchive();
        if ($zip->open($archivePath, ZipArchive::CREATE | ZipArchive::OVERWRITE) !== true) {
            json_error('Unable to create backup archive', 500);
        }
        $zip->addFile($manifestTmp, 'manifest.json');
        foreach (data_files_for_backup() as $f) {
            $zip->addFile($f, 'data/' . basename($f));
        }
        foreach ($mediaFiles as [$src, $rel]) {
            $zip->addFile($src, $rel);
        }
        $zip->close();
    } else {
        $tarPath = $manualDir . '/' . $id . '.tar';
        $phar = new PharData($tarPath);
        $phar->addFile($manifestTmp, 'manifest.json');
        foreach (data_files_for_backup() as $f) {
            $phar->addFile($f, 'data/' . basename($f));
        }
        foreach ($mediaFiles as [$src, $rel]) {
            $phar->addFile($src, $rel);
        }
        $phar->compress(Phar::GZ);
        unset($phar);
        @unlink($tarPath);
    }
    @unlink($manifestTmp);

    if (!file_exists($archivePath)) {
        json_error('Backup archive was not created', 500);
    }

    $entry = [
        'id' => $id,
        'filename' => basename($archivePath),
        'format' => $ext,
        'includesMedia' => $includeMedia,
        'sizeBytes' => filesize($archivePath),
        'createdAt' => $manifest['createdAt'],
        'createdBy' => current_user()['username'] ?? 'unknown',
    ];
    $items = backup_index();
    $items[] = $entry;
    save_backup_index($items);

    json_ok($entry, 201);
}

if ($action === 'download' && $_SERVER['REQUEST_METHOD'] === 'GET') {
    $id = (string) ($_GET['id'] ?? '');
    if (!is_safe_segment($id)) {
        json_error('Invalid backup id', 400);
    }
    $items = backup_index();
    $found = null;
    foreach ($items as $item) {
        if ($item['id'] === $id) {
            $found = $item;
        }
    }
    if (!$found) {
        json_error('Not found', 404);
    }
    $path = realpath($manualDir . '/' . $found['filename']);
    if ($path === false || dirname($path) !== realpath($manualDir)) {
        json_error('Invalid backup file', 400);
    }
    header('Content-Type: application/octet-stream');
    header('Content-Disposition: attachment; filename="' . basename($path) . '"');
    header('Content-Length: ' . filesize($path));
    readfile($path);
    exit;
}

if ($action === 'restore' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    require_csrf();
    $id = (string) ($_GET['id'] ?? '');
    if (!is_safe_segment($id)) {
        json_error('Invalid backup id', 400);
    }
    $items = backup_index();
    $found = null;
    foreach ($items as $item) {
        if ($item['id'] === $id) {
            $found = $item;
        }
    }
    if (!$found) {
        json_error('Backup not found', 404);
    }
    $archivePath = realpath($manualDir . '/' . $found['filename']);
    if ($archivePath === false || dirname($archivePath) !== realpath($manualDir)) {
        json_error('Invalid backup file', 400);
    }

    $extractDir = sys_get_temp_dir() . '/restore-' . $id . '-' . bin2hex(random_bytes(4));
    mkdir($extractDir, 0750, true);

    if ($found['format'] === 'zip') {
        if (!class_exists('ZipArchive')) {
            json_error('Server no longer supports ZIP extraction', 500);
        }
        $zip = new ZipArchive();
        if ($zip->open($archivePath) !== true) {
            json_error('Backup archive could not be opened', 500);
        }
        $zip->extractTo($extractDir);
        $zip->close();
    } else {
        $phar = new PharData($archivePath);
        $phar->extractTo($extractDir, null, true);
    }

    $manifestPath = $extractDir . '/manifest.json';
    if (!file_exists($manifestPath)) {
        json_error('Backup is missing manifest.json and cannot be trusted', 422);
    }
    $manifest = json_decode(file_get_contents($manifestPath), true);
    if (!is_array($manifest) || ($manifest['version'] ?? null) !== 1) {
        json_error('Backup manifest is invalid or from an unsupported version', 422);
    }

    // Pre-restore safety net.
    $preRestoreDir = BACKUPS_DIR . '/pre-restore';
    if (!is_dir($preRestoreDir)) {
        mkdir($preRestoreDir, 0750, true);
    }
    $preStamp = date('Ymd-His');
    foreach (data_files_for_backup() as $f) {
        @copy($f, "{$preRestoreDir}/{$preStamp}-" . basename($f));
    }

    $restoredFiles = [];
    foreach (($manifest['dataFiles'] ?? []) as $fname) {
        if (!is_safe_segment(pathinfo($fname, PATHINFO_FILENAME)) && !preg_match('/^[a-zA-Z0-9_-]+\.json$/', $fname)) {
            continue;
        }
        $src = $extractDir . '/data/' . $fname;
        if (!file_exists($src)) {
            continue;
        }
        $decoded = json_decode(file_get_contents($src), true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            continue; // Skip corrupt entries inside the backup rather than aborting the whole restore.
        }
        $dest = DATA_DIR . '/' . basename($fname);
        $tmp = $dest . '.restore-' . bin2hex(random_bytes(4));
        file_put_contents($tmp, json_encode($decoded, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE));
        rename($tmp, $dest);
        $restoredFiles[] = basename($fname);
    }

    // Recursively remove the temp extraction directory.
    $rrmdir = function (string $dir) use (&$rrmdir) {
        foreach (scandir($dir) ?: [] as $f) {
            if ($f === '.' || $f === '..') continue;
            $path = "{$dir}/{$f}";
            is_dir($path) ? $rrmdir($path) : @unlink($path);
        }
        @rmdir($dir);
    };
    $rrmdir($extractDir);

    json_ok(['restored' => true, 'files' => $restoredFiles, 'preRestoreBackupPrefix' => $preStamp]);
}

json_error('Unknown backup action', 404);
