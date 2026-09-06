<?php
require __DIR__ . '/config.php';
require __DIR__ . '/lib/response.php';
require __DIR__ . '/lib/security.php';
require __DIR__ . '/lib/json_store.php';

$method = $_SERVER['REQUEST_METHOD'];
$id = isset($_GET['id']) ? (string) $_GET['id'] : null;

const MIME_BY_EXT = [
    'jpg' => 'image/jpeg',
    'jpeg' => 'image/jpeg',
    'png' => 'image/png',
    'webp' => 'image/webp',
    'gif' => 'image/gif',
    'svg' => 'image/svg+xml',
    'pdf' => 'application/pdf',
];

function media_kind(string $ext): string
{
    return $ext === 'pdf' ? 'document' : 'image';
}

if ($method === 'GET') {
    $items = read_collection('media');
    if ($id !== null) {
        foreach ($items as $item) {
            if ($item['id'] === $id) {
                json_ok($item);
            }
        }
        json_error('Not found', 404);
    }
    json_ok($items);
}

require_auth();
require_csrf();

if ($method === 'POST') {
    if (!isset($_FILES['file']) || $_FILES['file']['error'] === UPLOAD_ERR_NO_FILE) {
        json_error('No file uploaded', 422);
    }
    $file = $_FILES['file'];
    if ($file['error'] !== UPLOAD_ERR_OK) {
        json_error('Upload failed (error code ' . $file['error'] . ')', 400);
    }
    if ($file['size'] <= 0 || $file['size'] > MAX_UPLOAD_BYTES) {
        json_error('File exceeds the maximum upload size of ' . round(MAX_UPLOAD_BYTES / 1048576, 1) . 'MB', 413);
    }
    if (!is_uploaded_file($file['tmp_name'])) {
        json_error('Invalid upload', 400);
    }

    $originalName = (string) $file['name'];
    // Reject anything with more than one extension-like segment or a
    // disallowed extension anywhere in the name (defeats "shell.php.jpg").
    $segments = explode('.', strtolower($originalName));
    if (count($segments) > 2) {
        foreach (array_slice($segments, 1, -1) as $middle) {
            if (preg_match('/^(php\d?|phtml|phar|exe|sh|cgi|asp|aspx|jsp|js|htaccess)$/', $middle)) {
                json_error('Filename is not allowed', 422);
            }
        }
    }
    $ext = pathinfo($originalName, PATHINFO_EXTENSION);
    $ext = strtolower($ext);

    $isImage = in_array($ext, ALLOWED_IMAGE_EXT, true);
    $isDoc = in_array($ext, ALLOWED_DOC_EXT, true);
    if (!$isImage && !$isDoc) {
        json_error('Unsupported file type. Allowed: ' . implode(', ', array_merge(ALLOWED_IMAGE_EXT, ALLOWED_DOC_EXT)), 422);
    }

    $finfo = new finfo(FILEINFO_MIME_TYPE);
    $detectedMime = $finfo->file($file['tmp_name']);
    $expectedMime = MIME_BY_EXT[$ext] ?? null;

    $newName = generate_id('media') . '.' . $ext;

    if ($ext === 'svg') {
        $raw = file_get_contents($file['tmp_name']);
        if ($raw === false || (stripos($raw, '<svg') === false)) {
            json_error('File does not look like a valid SVG', 422);
        }
        $clean = sanitize_svg($raw);
        if ($clean === null) {
            json_error('SVG could not be safely sanitized and was rejected', 422);
        }
        $destDir = UPLOADS_IMAGES_DIR;
        $dest = $destDir . '/' . $newName;
        if (file_put_contents($dest, $clean) === false) {
            json_error('Unable to save file', 500);
        }
    } else {
        // Loosely verify the real file content matches an image/pdf signature
        // family; browsers can send inaccurate client MIME types, so we only
        // hard-fail on a clear mismatch (e.g. an executable masquerading as .png).
        $looksRight = $expectedMime !== null && (
            $detectedMime === $expectedMime ||
            ($isImage && str_starts_with((string) $detectedMime, 'image/')) ||
            ($isDoc && $detectedMime === 'application/pdf')
        );
        if (!$looksRight) {
            json_error("File content does not match its extension (detected {$detectedMime})", 422);
        }

        $destDir = $isImage ? UPLOADS_IMAGES_DIR : UPLOADS_DOCS_DIR;
        $dest = $destDir . '/' . $newName;
        if (file_exists($dest)) {
            json_error('Filename collision, please retry', 500);
        }
        if (!move_uploaded_file($file['tmp_name'], $dest)) {
            json_error('Unable to store uploaded file', 500);
        }
        @chmod($dest, 0640);
    }

    $publicPath = '/uploads/' . ($isImage ? 'images' : 'documents') . '/' . $newName;
    $record = [
        'id' => generate_id('media'),
        'filename' => $newName,
        'originalName' => $originalName,
        'url' => $publicPath,
        'kind' => media_kind($ext),
        'mime' => $expectedMime,
        'size' => $file['size'],
        'title' => (string) ($_POST['title'] ?? pathinfo($originalName, PATHINFO_FILENAME)),
        'alt' => (string) ($_POST['alt'] ?? ''),
        'uploadedBy' => current_user()['username'] ?? 'unknown',
        'createdAt' => date('c'),
        'updatedAt' => date('c'),
    ];

    $items = read_collection('media');
    $items[] = $record;
    write_collection('media', $items);
    json_ok($record, 201);
}

if ($method === 'PUT') {
    if ($id === null) {
        json_error('Missing id', 400);
    }
    $body = read_json_body();
    $items = read_collection('media');
    $found = false;
    foreach ($items as &$item) {
        if ($item['id'] === $id) {
            $item['title'] = isset($body['title']) ? (string) $body['title'] : $item['title'];
            $item['alt'] = isset($body['alt']) ? (string) $body['alt'] : $item['alt'];
            $item['updatedAt'] = date('c');
            $found = true;
            $updated = $item;
        }
    }
    unset($item);
    if (!$found) {
        json_error('Not found', 404);
    }
    write_collection('media', $items);
    json_ok($updated);
}

if ($method === 'DELETE') {
    if ($id === null) {
        json_error('Missing id', 400);
    }
    $items = read_collection('media');
    $target = null;
    $remaining = [];
    foreach ($items as $item) {
        if ($item['id'] === $id) {
            $target = $item;
        } else {
            $remaining[] = $item;
        }
    }
    if ($target === null) {
        json_error('Not found', 404);
    }
    $path = ($target['kind'] === 'document' ? UPLOADS_DOCS_DIR : UPLOADS_IMAGES_DIR) . '/' . $target['filename'];
    if (is_file($path)) {
        @unlink($path);
    }
    write_collection('media', $remaining);
    json_ok(['deleted' => true, 'id' => $id]);
}

json_error('Method not allowed', 405);
