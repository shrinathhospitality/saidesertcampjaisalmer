<?php
require __DIR__ . '/config.php';
require __DIR__ . '/lib/response.php';
require __DIR__ . '/lib/security.php';
require __DIR__ . '/lib/json_store.php';

$method = $_SERVER['REQUEST_METHOD'];
$id = isset($_GET['id']) ? (string) $_GET['id'] : null;
$action = $_GET['action'] ?? null;

const VALID_STATUSES = ['New', 'Contacted', 'Confirmed', 'Closed'];

function enquiry_rate_limit(string $ip): void
{
    $file = LOG_DIR . '/enquiry-rate.json';
    $log = read_json_file_raw($file) ?: [];
    $now = time();
    $window = 600; // 10 minutes
    $max = 5;

    $log[$ip] = array_values(array_filter($log[$ip] ?? [], fn($ts) => $ts > $now - $window));
    if (count($log[$ip]) >= $max) {
        json_error('Too many submissions. Please try again later.', 429);
    }
    $log[$ip][] = $now;

    foreach ($log as $k => $timestamps) {
        $log[$k] = array_values(array_filter($timestamps, fn($ts) => $ts > $now - $window));
        if (empty($log[$k])) {
            unset($log[$k]);
        }
    }
    @file_put_contents($file, json_encode($log), LOCK_EX);
}

function clean_str($value, int $max = 2000): string
{
    return mb_substr(trim(strip_tags((string) $value)), 0, $max);
}

if ($method === 'POST' && $action !== 'export') {
    $body = read_json_body();

    // Honeypot: a hidden field real users never fill in. Bots that fill
    // every field will trip this and get a fake success response.
    if (trim((string) ($body['website'] ?? '')) !== '') {
        json_ok(['submitted' => true]);
    }

    $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    enquiry_rate_limit($ip);

    $name = clean_str($body['name'] ?? '', 120);
    $email = trim((string) ($body['email'] ?? ''));
    $phone = clean_str($body['phone'] ?? '', 40);
    $inquiryType = clean_str($body['inquiryType'] ?? 'General', 60);
    $message = clean_str($body['message'] ?? '', 4000);
    $sourcePage = clean_str($body['sourcePage'] ?? '', 200);

    if ($name === '' || $message === '') {
        json_error('Name and message are required', 422);
    }
    if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        json_error('A valid email is required', 422);
    }

    $record = [
        'id' => generate_id('enq'),
        'name' => $name,
        'email' => $email,
        'phone' => $phone,
        'inquiryType' => $inquiryType,
        'message' => $message,
        'sourcePage' => $sourcePage,
        'status' => 'New',
        'notes' => '',
        'createdAt' => date('c'),
        'updatedAt' => date('c'),
    ];

    $items = read_collection('enquiries');
    $items[] = $record;
    write_collection('enquiries', $items);

    json_ok(['submitted' => true, 'id' => $record['id']], 201);
}

// Everything else is admin-only.
require_auth();

if ($method === 'GET' && $action === 'export') {
    $items = read_collection('enquiries');
    header('Content-Type: text/csv; charset=utf-8');
    header('Content-Disposition: attachment; filename="enquiries-' . date('Ymd-His') . '.csv"');
    $out = fopen('php://output', 'w');
    fputcsv($out, ['ID', 'Name', 'Email', 'Phone', 'Type', 'Message', 'Source Page', 'Status', 'Notes', 'Created At']);
    foreach ($items as $item) {
        fputcsv($out, [
            $item['id'], $item['name'], $item['email'], $item['phone'] ?? '',
            $item['inquiryType'] ?? '', $item['message'], $item['sourcePage'] ?? '',
            $item['status'] ?? '', $item['notes'] ?? '', $item['createdAt'] ?? '',
        ]);
    }
    fclose($out);
    exit;
}

if ($method === 'GET') {
    $items = read_collection('enquiries');
    if ($id !== null) {
        foreach ($items as $item) {
            if ($item['id'] === $id) {
                json_ok($item);
            }
        }
        json_error('Not found', 404);
    }
    // Newest first for the admin list.
    usort($items, fn($a, $b) => strcmp($b['createdAt'] ?? '', $a['createdAt'] ?? ''));
    json_ok($items);
}

require_csrf();

if ($method === 'PUT') {
    if ($id === null) {
        json_error('Missing id', 400);
    }
    $body = read_json_body();
    $items = read_collection('enquiries');
    $found = false;
    $updated = null;
    foreach ($items as &$item) {
        if ($item['id'] === $id) {
            if (isset($body['status'])) {
                if (!in_array($body['status'], VALID_STATUSES, true)) {
                    json_error('Invalid status', 422);
                }
                $item['status'] = $body['status'];
            }
            if (isset($body['notes'])) {
                $item['notes'] = clean_str($body['notes'], 4000);
            }
            $item['updatedAt'] = date('c');
            $found = true;
            $updated = $item;
        }
    }
    unset($item);
    if (!$found) {
        json_error('Not found', 404);
    }
    write_collection('enquiries', $items);
    json_ok($updated);
}

if ($method === 'DELETE') {
    if ($id === null) {
        json_error('Missing id', 400);
    }
    $items = read_collection('enquiries');
    $before = count($items);
    $items = array_values(array_filter($items, fn($item) => $item['id'] !== $id));
    if (count($items) === $before) {
        json_error('Not found', 404);
    }
    write_collection('enquiries', $items);
    json_ok(['deleted' => true, 'id' => $id]);
}

json_error('Method not allowed', 405);
