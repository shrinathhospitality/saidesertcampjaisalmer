<?php
/**
 * Central configuration for the Sai Desert Camp & Resort CMS API.
 *
 * Path layout (see HOSTINGER-DEPLOYMENT.md for the full explanation):
 *   public_html/api/...        <- this file's directory (web-accessible, PHP executes here)
 *   public_html/uploads/...    <- web-accessible media
 *   <one level above public_html>/cms-data/...     <- JSON content store, NOT web-accessible
 *   <one level above public_html>/cms-backups/...  <- backups, NOT web-accessible
 *
 * In local dev, "public_html" is this project's public/ folder, so cms-data/ and
 * cms-backups/ end up as siblings of src/ and public/ at the repo root.
 */

// ---- Error handling: never leak PHP errors/paths to clients ----
ini_set('display_errors', '0');
ini_set('log_errors', '1');
error_reporting(E_ALL);

define('CMS_ENV', getenv('CMS_ENV') ?: 'production');
define('CMS_ROOT', dirname(__DIR__, 2));
define('WEB_ROOT', dirname(__DIR__));
define('DATA_DIR', CMS_ROOT . '/cms-data');
define('BACKUPS_DIR', CMS_ROOT . '/cms-backups');
define('UPLOADS_DIR', WEB_ROOT . '/uploads');
define('UPLOADS_IMAGES_DIR', UPLOADS_DIR . '/images');
define('UPLOADS_DOCS_DIR', UPLOADS_DIR . '/documents');
define('LOG_DIR', CMS_ROOT . '/cms-logs');

ini_set('error_log', LOG_DIR . '/php-error.log');

foreach ([DATA_DIR, BACKUPS_DIR, UPLOADS_IMAGES_DIR, UPLOADS_DOCS_DIR, LOG_DIR] as $dir) {
    if (!is_dir($dir)) {
        @mkdir($dir, 0750, true);
    }
}

// Defense-in-depth: deny-all .htaccess dropped next to the data even if it
// ends up reachable inside a web root on a different hosting layout.
foreach ([DATA_DIR, BACKUPS_DIR, LOG_DIR] as $dir) {
    $guard = $dir . '/.htaccess';
    if (is_dir($dir) && !file_exists($guard)) {
        @file_put_contents($guard, "Require all denied\nDeny from all\n");
    }
}

// ---- Uploads ----
define('MAX_UPLOAD_BYTES', (int) (getenv('CMS_MAX_UPLOAD_BYTES') ?: 8 * 1024 * 1024)); // 8MB default
define('ALLOWED_IMAGE_EXT', ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg']);
define('ALLOWED_DOC_EXT', ['pdf']);

// ---- Session / auth ----
define('SESSION_NAME', 'sdc_admin_session');
define('SESSION_LIFETIME', 60 * 60 * 8); // 8 hours
define('LOGIN_MAX_ATTEMPTS', 6);
define('LOGIN_LOCKOUT_SECONDS', 15 * 60);

// ---- CORS ----
// Same-origin admin by default. Only set CMS_ALLOWED_ORIGIN if the admin SPA
// is genuinely served from a different origin than the API.
define('ALLOWED_ORIGIN', getenv('CMS_ALLOWED_ORIGIN') ?: '');

// ---- Setup token ----
// Required once, to create the first admin account via /api/auth.php?action=setup.
// Set a real value via an environment variable on the server (or edit this file
// locally before first deploy) and remove/rotate it after setup is complete.
// See INITIAL-ADMIN-SETUP.md.
define('SETUP_TOKEN', getenv('CMS_SETUP_TOKEN') ?: '');

function is_https(): bool
{
    return (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
        || (($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https');
}

// ---- Security headers (every response) ----
header_remove('X-Powered-By');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('Referrer-Policy: strict-origin-when-cross-origin');
header("Content-Security-Policy: default-src 'none'; frame-ancestors 'none'");

if (ALLOWED_ORIGIN !== '') {
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    if ($origin === ALLOWED_ORIGIN) {
        header('Access-Control-Allow-Origin: ' . $origin);
        header('Access-Control-Allow-Credentials: true');
        header('Access-Control-Allow-Headers: Content-Type, X-CSRF-Token');
        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
        header('Vary: Origin');
    }
}

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// ---- Sessions ----
session_name(SESSION_NAME);
session_set_cookie_params([
    'lifetime' => SESSION_LIFETIME,
    'path' => '/',
    'secure' => is_https(),
    'httponly' => true,
    'samesite' => 'Lax',
]);
if (session_status() !== PHP_SESSION_ACTIVE) {
    session_start();
}
