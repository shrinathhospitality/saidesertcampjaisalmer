<?php

function current_user(): ?array
{
    return $_SESSION['user'] ?? null;
}

function require_auth(): array
{
    $user = current_user();
    if (!$user) {
        json_error('Authentication required', 401);
    }
    // Idle/absolute session expiry beyond the cookie lifetime itself.
    if (($_SESSION['login_time'] ?? 0) + SESSION_LIFETIME < time()) {
        session_unset();
        session_destroy();
        json_error('Session expired', 401);
    }
    return $user;
}

function issue_csrf_token(): string
{
    if (empty($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf_token'];
}

function require_csrf(): void
{
    $sent = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';
    $expected = $_SESSION['csrf_token'] ?? '';
    if ($expected === '' || $sent === '' || !hash_equals($expected, $sent)) {
        json_error('Invalid or missing CSRF token', 403);
    }
}

/**
 * File-based login rate limiter (no DB available). Keyed by IP + username.
 */
function login_rate_limit_check(string $key): void
{
    $file = LOG_DIR . '/login-attempts.json';
    $attempts = read_json_file_raw($file) ?: [];
    $now = time();
    $entry = $attempts[$key] ?? ['count' => 0, 'first' => $now, 'locked_until' => 0];

    if (($entry['locked_until'] ?? 0) > $now) {
        $wait = $entry['locked_until'] - $now;
        json_error("Too many attempts. Try again in {$wait}s.", 429);
    }
}

function login_rate_limit_hit(string $key, bool $success): void
{
    $file = LOG_DIR . '/login-attempts.json';
    $attempts = read_json_file_raw($file) ?: [];
    $now = time();
    $entry = $attempts[$key] ?? ['count' => 0, 'first' => $now, 'locked_until' => 0];

    if ($success) {
        unset($attempts[$key]);
    } else {
        if ($now - ($entry['first'] ?? $now) > LOGIN_LOCKOUT_SECONDS) {
            $entry = ['count' => 0, 'first' => $now, 'locked_until' => 0];
        }
        $entry['count'] = ($entry['count'] ?? 0) + 1;
        if ($entry['count'] >= LOGIN_MAX_ATTEMPTS) {
            $entry['locked_until'] = $now + LOGIN_LOCKOUT_SECONDS;
        }
        $attempts[$key] = $entry;
    }

    // Prune old entries so the file doesn't grow unbounded.
    foreach ($attempts as $k => $v) {
        if (($v['locked_until'] ?? 0) < $now && ($now - ($v['first'] ?? 0)) > LOGIN_LOCKOUT_SECONDS) {
            unset($attempts[$k]);
        }
    }

    @file_put_contents($file, json_encode($attempts, JSON_PRETTY_PRINT), LOCK_EX);
}

function read_json_file_raw(string $path)
{
    if (!file_exists($path)) {
        return null;
    }
    $raw = @file_get_contents($path);
    if ($raw === false || trim($raw) === '') {
        return null;
    }
    $data = json_decode($raw, true);
    return json_last_error() === JSON_ERROR_NONE ? $data : null;
}

/**
 * A conservative allowlist HTML sanitizer for rich-text (blog) content.
 * No external library required (uses DOMDocument, bundled with PHP).
 */
function sanitize_rich_html(string $html): string
{
    $allowedTags = [
        'p', 'br', 'strong', 'em', 'b', 'i', 'u', 's', 'blockquote',
        'ul', 'ol', 'li', 'h2', 'h3', 'h4', 'a', 'img', 'figure', 'figcaption', 'hr', 'span',
    ];
    $allowedAttrs = [
        'a' => ['href', 'title', 'target', 'rel'],
        'img' => ['src', 'alt', 'width', 'height', 'loading'],
        'span' => ['class'],
    ];

    $doc = new DOMDocument();
    libxml_use_internal_errors(true);
    $doc->loadHTML('<?xml encoding="utf-8" ?><div>' . $html . '</div>', LIBXML_NOERROR | LIBXML_NOWARNING);
    libxml_clear_errors();

    $body = $doc->getElementsByTagName('div')->item(0);
    if (!$body) {
        return '';
    }

    $walk = function (DOMNode $node) use (&$walk, $doc, $allowedTags, $allowedAttrs) {
        $children = iterator_to_array($node->childNodes);
        foreach ($children as $child) {
            if ($child instanceof DOMText) {
                continue;
            }
            if (!($child instanceof DOMElement)) {
                $node->removeChild($child);
                continue;
            }
            $tag = strtolower($child->tagName);
            if (!in_array($tag, $allowedTags, true)) {
                // Unwrap disallowed tags but keep their text/children.
                while ($child->firstChild) {
                    $node->insertBefore($child->firstChild, $child);
                }
                $node->removeChild($child);
                continue;
            }
            foreach (iterator_to_array($child->attributes ?? []) as $attr) {
                $name = strtolower($attr->name);
                $allowed = $allowedAttrs[$tag] ?? [];
                $isEventHandler = str_starts_with($name, 'on');
                if ($isEventHandler || !in_array($name, $allowed, true)) {
                    $child->removeAttribute($attr->name);
                    continue;
                }
                if ($name === 'href' || $name === 'src') {
                    $value = trim($attr->value);
                    if (preg_match('/^\s*(javascript|data|vbscript):/i', $value)) {
                        $child->removeAttribute($attr->name);
                    }
                }
                if ($name === 'target') {
                    $child->setAttribute('rel', 'noopener noreferrer');
                }
            }
            $walk($child);
        }
    };

    $walk($body);

    $out = '';
    foreach (iterator_to_array($body->childNodes) as $child) {
        $out .= $doc->saveHTML($child);
    }
    return trim($out);
}

/**
 * Basic SVG sanitizer: strips scripts, event handlers, external references,
 * and anything outside a small safe tag/attribute allowlist. Used for
 * uploaded SVG media only.
 */
function sanitize_svg(string $svg): ?string
{
    $allowedTags = ['svg', 'path', 'g', 'circle', 'rect', 'ellipse', 'line', 'polyline', 'polygon', 'defs', 'title', 'desc', 'linearGradient', 'radialGradient', 'stop'];
    $doc = new DOMDocument();
    libxml_use_internal_errors(true);
    $loaded = $doc->loadXML($svg, LIBXML_NONET);
    libxml_clear_errors();
    if (!$loaded) {
        return null;
    }

    $root = $doc->documentElement;
    if (!$root || strtolower($root->tagName) !== 'svg') {
        return null;
    }

    $strip = function (DOMNode $node) use (&$strip, $allowedTags) {
        $children = iterator_to_array($node->childNodes);
        foreach ($children as $child) {
            if ($child instanceof DOMComment || $child instanceof DOMProcessingInstruction) {
                $node->removeChild($child);
                continue;
            }
            if ($child instanceof DOMElement) {
                $tag = strtolower(preg_replace('/^.*:/', '', $child->tagName));
                if (!in_array($tag, $allowedTags, true)) {
                    $node->removeChild($child);
                    continue;
                }
                foreach (iterator_to_array($child->attributes ?? []) as $attr) {
                    $name = strtolower($attr->name);
                    if (str_starts_with($name, 'on') || $name === 'href' || $name === 'xlink:href') {
                        $child->removeAttribute($attr->name);
                    }
                }
                $strip($child);
            }
        }
    };
    $strip($root);

    // Remove any <script> that might have survived under a namespaced tag name.
    foreach (['script'] as $bad) {
        $nodes = $doc->getElementsByTagName($bad);
        for ($i = $nodes->length - 1; $i >= 0; $i--) {
            $n = $nodes->item($i);
            $n->parentNode->removeChild($n);
        }
    }

    return $doc->saveXML();
}

/**
 * Ensures a value is a "safe" single path segment: no slashes, no dots-only,
 * no traversal. Used for content type names, ids, and upload ids.
 */
function is_safe_segment(string $value): bool
{
    return (bool) preg_match('/^[a-zA-Z0-9][a-zA-Z0-9_-]{0,80}$/', $value);
}
