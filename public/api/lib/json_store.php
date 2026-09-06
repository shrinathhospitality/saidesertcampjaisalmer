<?php
/**
 * JSON content storage: atomic, lockable, backed up, and corruption-aware.
 *
 * Every write:
 *   1. Verifies the existing file (if any) still parses. If it doesn't, the
 *      write is refused so we never silently clobber a corrupted file.
 *   2. Copies the current file into cms-backups/auto/ before writing.
 *   3. Writes to a temp file under an exclusive lock, then renames it into
 *      place (atomic on the same filesystem) so readers never see a partial file.
 */

const CONTENT_TYPES = [
    'site-settings' => ['file' => 'site-settings.json', 'kind' => 'singleton', 'public' => true],
    'navigation' => ['file' => 'navigation.json', 'kind' => 'collection', 'public' => true],
    'pages' => ['file' => 'pages.json', 'kind' => 'collection', 'public' => true],
    'packages' => ['file' => 'packages.json', 'kind' => 'collection', 'public' => true],
    'rooms' => ['file' => 'rooms.json', 'kind' => 'collection', 'public' => true],
    'activities' => ['file' => 'activities.json', 'kind' => 'collection', 'public' => true],
    'amenities' => ['file' => 'amenities.json', 'kind' => 'collection', 'public' => true],
    'gallery' => ['file' => 'gallery.json', 'kind' => 'collection', 'public' => true],
    'testimonials' => ['file' => 'testimonials.json', 'kind' => 'collection', 'public' => true],
    'faqs' => ['file' => 'faqs.json', 'kind' => 'collection', 'public' => true],
    'blogs' => ['file' => 'blogs.json', 'kind' => 'collection', 'public' => true],
    'enquiries' => ['file' => 'enquiries.json', 'kind' => 'collection', 'public' => false],
    'users' => ['file' => 'users.json', 'kind' => 'collection', 'public' => false],
    'media' => ['file' => 'media.json', 'kind' => 'collection', 'public' => true],
];

function content_type_meta(string $type): array
{
    if (!isset(CONTENT_TYPES[$type])) {
        json_error("Unknown content type: {$type}", 404);
    }
    return CONTENT_TYPES[$type];
}

function data_file_path(string $type): string
{
    $meta = content_type_meta($type);
    return DATA_DIR . '/' . $meta['file'];
}

function generate_id(string $prefix = ''): string
{
    $id = bin2hex(random_bytes(6)) . dechex(time());
    return $prefix !== '' ? $prefix . '-' . $id : $id;
}

/**
 * Reads a JSON file. Returns null if missing, and throws a 500 (rather than
 * silently returning an empty structure) if the file exists but is corrupt,
 * because guessing at recovery here could destroy data.
 */
function read_json_file(string $path, $default)
{
    if (!file_exists($path)) {
        return $default;
    }
    $fp = fopen($path, 'rb');
    if ($fp === false) {
        json_error('Unable to read content file', 500);
    }
    flock($fp, LOCK_SH);
    $raw = stream_get_contents($fp);
    flock($fp, LOCK_UN);
    fclose($fp);

    if (trim($raw) === '') {
        return $default;
    }
    $data = json_decode($raw, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        error_log("Corrupt JSON detected at {$path}: " . json_last_error_msg());
        json_error('Stored content is corrupted and was left untouched. Restore from a backup.', 500);
    }
    return $data;
}

function backup_before_write(string $path): void
{
    if (!file_exists($path)) {
        return;
    }
    $autoDir = BACKUPS_DIR . '/auto';
    if (!is_dir($autoDir)) {
        mkdir($autoDir, 0750, true);
    }
    $name = basename($path);
    $stamp = date('Ymd-His');
    @copy($path, "{$autoDir}/{$stamp}-{$name}");

    // Keep only the most recent 50 auto-backups per file to bound disk use.
    $pattern = $autoDir . '/*-' . $name;
    $matches = glob($pattern) ?: [];
    if (count($matches) > 50) {
        usort($matches, fn($a, $b) => filemtime($a) <=> filemtime($b));
        foreach (array_slice($matches, 0, count($matches) - 50) as $old) {
            @unlink($old);
        }
    }
}

/**
 * Atomic write: verify -> backup -> write temp -> rename. Never truncates
 * the live file before the new content is fully and successfully written.
 */
function write_json_file(string $path, $data): void
{
    // Refuse to write over a currently-corrupt file.
    if (file_exists($path)) {
        $raw = @file_get_contents($path);
        if ($raw !== false && trim($raw) !== '') {
            json_decode($raw);
            if (json_last_error() !== JSON_ERROR_NONE) {
                json_error('Refusing to overwrite a corrupted content file. Restore from backup first.', 500);
            }
        }
    }

    $dir = dirname($path);
    if (!is_dir($dir)) {
        mkdir($dir, 0750, true);
    }

    backup_before_write($path);

    $json = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    if ($json === false) {
        json_error('Failed to encode content as JSON', 500);
    }

    $tmp = $path . '.tmp-' . bin2hex(random_bytes(4));
    $fp = fopen($tmp, 'wb');
    if ($fp === false) {
        json_error('Unable to write content file', 500);
    }
    flock($fp, LOCK_EX);
    fwrite($fp, $json);
    fflush($fp);
    flock($fp, LOCK_UN);
    fclose($fp);

    if (!rename($tmp, $path)) {
        @unlink($tmp);
        json_error('Unable to save content file', 500);
    }
    @chmod($path, 0640);
}

function read_collection(string $type): array
{
    $data = read_json_file(data_file_path($type), []);
    return is_array($data) ? $data : [];
}

function write_collection(string $type, array $items): void
{
    write_json_file(data_file_path($type), array_values($items));
}

function read_singleton(string $type): array
{
    $data = read_json_file(data_file_path($type), []);
    return is_array($data) ? $data : [];
}

function write_singleton(string $type, array $data): void
{
    write_json_file(data_file_path($type), $data);
}
