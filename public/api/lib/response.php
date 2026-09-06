<?php

function json_ok($data = [], int $status = 200): void
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['ok' => true, 'data' => $data], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit;
}

function json_error(string $message, int $status = 400, array $extra = []): void
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(array_merge(['ok' => false, 'error' => $message], $extra), JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit;
}

function read_json_body(): array
{
    $contentType = $_SERVER['CONTENT_TYPE'] ?? $_SERVER['HTTP_CONTENT_TYPE'] ?? '';
    if (stripos($contentType, 'application/json') === false) {
        json_error('Expected Content-Type: application/json', 415);
    }
    $raw = file_get_contents('php://input');
    if ($raw === '' || $raw === false) {
        return [];
    }
    $data = json_decode($raw, true);
    if (json_last_error() !== JSON_ERROR_NONE || !is_array($data)) {
        json_error('Malformed JSON body', 400);
    }
    return $data;
}

function require_method(array $methods): void
{
    $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
    if (!in_array($method, $methods, true)) {
        json_error('Method not allowed', 405);
    }
}
