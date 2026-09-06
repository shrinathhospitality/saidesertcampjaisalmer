<?php
require __DIR__ . '/config.php';
require __DIR__ . '/lib/response.php';
require __DIR__ . '/lib/security.php';
require __DIR__ . '/lib/json_store.php';

$type = (string) ($_GET['type'] ?? '');
if (!is_safe_segment($type)) {
    json_error('Invalid content type', 400);
}
$meta = content_type_meta($type);
if ($type === 'users' || $type === 'media') {
    json_error('Not found', 404);
}

$method = $_SERVER['REQUEST_METHOD'];
$id = isset($_GET['id']) ? (string) $_GET['id'] : null;
$action = $_GET['action'] ?? null;

function slugify(string $text): string
{
    $text = strtolower(trim($text));
    $text = preg_replace('/[^a-z0-9]+/', '-', $text);
    return trim($text, '-') ?: generate_id('item');
}

function find_index(array $items, string $id): ?int
{
    foreach ($items as $i => $item) {
        if (($item['id'] ?? null) === $id || ($item['slug'] ?? null) === $id) {
            return $i;
        }
    }
    return null;
}

/** Fields that, when present, must be non-empty strings. Kept intentionally light. */
const REQUIRED_FIELDS = [
    'pages' => ['name', 'slug'],
    'packages' => ['title', 'slug'],
    'rooms' => ['title', 'slug'],
    'activities' => ['title', 'slug'],
    'blogs' => ['title', 'slug'],
    'testimonials' => ['name'],
    'faqs' => ['question', 'answer'],
    'gallery' => ['title'],
    'navigation' => ['label'],
];

function validate_record(string $type, array $data): array
{
    // Derive the slug from the title first so a slug-required type doesn't
    // reject a payload that only supplied a title.
    $nameField = $type === 'pages' ? 'name' : 'title';
    if (isset($data['slug']) && trim((string) $data['slug']) !== '') {
        $data['slug'] = slugify((string) $data['slug']);
    } elseif (isset($data[$nameField]) && trim((string) $data[$nameField]) !== '' && in_array($type, ['pages', 'packages', 'rooms', 'activities', 'blogs'], true)) {
        $data['slug'] = slugify((string) $data[$nameField]);
    }

    $required = REQUIRED_FIELDS[$type] ?? [];
    foreach ($required as $field) {
        if (!isset($data[$field]) || trim((string) $data[$field]) === '') {
            json_error("Field '{$field}' is required", 422);
        }
    }
    if ($type === 'blogs' && isset($data['contentHtml'])) {
        $data['contentHtml'] = sanitize_rich_html((string) $data['contentHtml']);
    }
    if ($type === 'pages' && isset($data['sections']) && is_array($data['sections'])) {
        foreach ($data['sections'] as &$section) {
            if (isset($section['bodyHtml'])) {
                $section['bodyHtml'] = sanitize_rich_html((string) $section['bodyHtml']);
            }
        }
        unset($section);
    }
    return $data;
}

// ---- Singleton types (site-settings) ----
if ($meta['kind'] === 'singleton') {
    if ($method === 'GET') {
        json_ok(read_singleton($type));
    }
    require_auth();
    require_csrf();
    if ($method === 'PUT' || $method === 'POST') {
        $body = read_json_body();
        $current = read_singleton($type);
        $merged = array_replace_recursive($current, $body);
        $merged['updatedAt'] = date('c');
        write_singleton($type, $merged);
        json_ok($merged);
    }
    json_error('Method not allowed', 405);
}

// ---- Collection types ----
if ($method === 'GET') {
    $items = read_collection($type);
    if (!$meta['public']) {
        require_auth();
    }
    if ($id !== null) {
        $idx = find_index($items, $id);
        if ($idx === null) {
            json_error('Not found', 404);
        }
        json_ok($items[$idx]);
    }
    json_ok($items);
}

// Everything below mutates content: auth + CSRF required.
require_auth();
require_csrf();

if ($method === 'POST' && $action === 'reorder') {
    $body = read_json_body();
    $order = $body['order'] ?? null;
    if (!is_array($order)) {
        json_error("Body must include an 'order' array of ids", 422);
    }
    $items = read_collection($type);
    $byId = [];
    foreach ($items as $item) {
        $byId[$item['id']] = $item;
    }
    $reordered = [];
    foreach ($order as $orderedId) {
        if (isset($byId[$orderedId])) {
            $item = $byId[$orderedId];
            $item['order'] = count($reordered);
            $reordered[] = $item;
            unset($byId[$orderedId]);
        }
    }
    foreach ($byId as $leftover) {
        $leftover['order'] = count($reordered);
        $reordered[] = $leftover;
    }
    write_collection($type, $reordered);
    json_ok($reordered);
}

if ($method === 'POST' && $action === 'duplicate' && $id !== null) {
    $items = read_collection($type);
    $idx = find_index($items, $id);
    if ($idx === null) {
        json_error('Not found', 404);
    }
    $copy = $items[$idx];
    $copy['id'] = generate_id($type);
    if (isset($copy['slug'])) {
        $copy['slug'] = $copy['slug'] . '-copy-' . substr(bin2hex(random_bytes(2)), 0, 4);
    }
    if (isset($copy['title'])) {
        $copy['title'] = $copy['title'] . ' (Copy)';
    }
    $copy['status'] = $copy['status'] ?? 'draft';
    $copy['createdAt'] = date('c');
    $copy['updatedAt'] = date('c');
    $items[] = $copy;
    write_collection($type, $items);
    json_ok($copy, 201);
}

if ($method === 'POST') {
    $body = validate_record($type, read_json_body());
    $items = read_collection($type);

    $slug = $body['slug'] ?? null;
    if ($slug !== null) {
        foreach ($items as $item) {
            if (($item['slug'] ?? null) === $slug) {
                json_error('Slug already in use', 409);
            }
        }
    }

    $body['id'] = generate_id($type);
    $body['createdAt'] = date('c');
    $body['updatedAt'] = date('c');
    $body['order'] = $body['order'] ?? count($items);
    $items[] = $body;
    write_collection($type, $items);
    json_ok($body, 201);
}

if ($method === 'PUT') {
    if ($id === null) {
        json_error('Missing id', 400);
    }
    $items = read_collection($type);
    $idx = find_index($items, $id);
    if ($idx === null) {
        json_error('Not found', 404);
    }
    $body = validate_record($type, array_replace($items[$idx], read_json_body()));

    if (isset($body['slug'])) {
        foreach ($items as $i => $item) {
            if ($i !== $idx && ($item['slug'] ?? null) === $body['slug']) {
                json_error('Slug already in use', 409);
            }
        }
    }

    $body['id'] = $items[$idx]['id'];
    $body['createdAt'] = $items[$idx]['createdAt'] ?? date('c');
    $body['updatedAt'] = date('c');
    $items[$idx] = $body;
    write_collection($type, $items);
    json_ok($body);
}

if ($method === 'DELETE') {
    if ($id === null) {
        json_error('Missing id', 400);
    }
    $items = read_collection($type);
    $idx = find_index($items, $id);
    if ($idx === null) {
        json_error('Not found', 404);
    }
    $removed = $items[$idx];
    array_splice($items, $idx, 1);
    write_collection($type, $items);
    json_ok(['deleted' => true, 'id' => $removed['id']]);
}

json_error('Method not allowed', 405);
