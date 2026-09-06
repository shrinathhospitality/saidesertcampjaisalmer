<?php
require __DIR__ . '/config.php';
require __DIR__ . '/lib/response.php';
require __DIR__ . '/lib/security.php';
require __DIR__ . '/lib/json_store.php';

$action = $_GET['action'] ?? ($_SERVER['REQUEST_METHOD'] === 'GET' ? 'session' : null);

function find_user(array $users, string $username): ?array
{
    foreach ($users as $user) {
        if (strcasecmp($user['username'], $username) === 0) {
            return $user;
        }
    }
    return null;
}

switch ($action) {
    case 'session':
        require_method(['GET']);
        $user = current_user();
        if (!$user) {
            json_ok(['authenticated' => false]);
        }
        json_ok([
            'authenticated' => true,
            'user' => ['id' => $user['id'], 'username' => $user['username'], 'role' => $user['role']],
            'mustChangePassword' => (bool) ($user['mustChangePassword'] ?? false),
            'csrfToken' => issue_csrf_token(),
        ]);
        break;

    case 'login':
        require_method(['POST']);
        $body = read_json_body();
        $username = trim((string) ($body['username'] ?? ''));
        $password = (string) ($body['password'] ?? '');
        if ($username === '' || $password === '') {
            json_error('Username and password are required', 422);
        }

        $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
        $rateKey = $ip . ':' . strtolower($username);
        login_rate_limit_check($rateKey);

        $users = read_collection('users');
        $user = find_user($users, $username);
        $valid = $user && password_verify($password, $user['passwordHash']);

        login_rate_limit_hit($rateKey, (bool) $valid);

        if (!$valid) {
            json_error('Invalid username or password', 401);
        }

        session_regenerate_id(true);
        $_SESSION['user'] = ['id' => $user['id'], 'username' => $user['username'], 'role' => $user['role'] ?? 'admin', 'mustChangePassword' => $user['mustChangePassword'] ?? false];
        $_SESSION['login_time'] = time();
        issue_csrf_token();

        foreach ($users as &$u) {
            if ($u['id'] === $user['id']) {
                $u['lastLoginAt'] = date('c');
            }
        }
        unset($u);
        write_collection('users', $users);

        json_ok([
            'user' => ['id' => $user['id'], 'username' => $user['username'], 'role' => $user['role'] ?? 'admin'],
            'mustChangePassword' => (bool) ($user['mustChangePassword'] ?? false),
            'csrfToken' => $_SESSION['csrf_token'],
        ]);
        break;

    case 'logout':
        require_method(['POST']);
        $_SESSION = [];
        session_destroy();
        json_ok(['loggedOut' => true]);
        break;

    case 'change-password':
        require_method(['POST']);
        $authUser = require_auth();
        require_csrf();
        $body = read_json_body();
        $current = (string) ($body['currentPassword'] ?? '');
        $new = (string) ($body['newPassword'] ?? '');
        if (strlen($new) < 10) {
            json_error('New password must be at least 10 characters', 422);
        }

        $users = read_collection('users');
        $found = false;
        foreach ($users as &$u) {
            if ($u['id'] === $authUser['id']) {
                if (!password_verify($current, $u['passwordHash'])) {
                    json_error('Current password is incorrect', 401);
                }
                $u['passwordHash'] = password_hash($new, PASSWORD_DEFAULT);
                $u['mustChangePassword'] = false;
                $u['updatedAt'] = date('c');
                $found = true;
            }
        }
        unset($u);
        if (!$found) {
            json_error('User not found', 404);
        }
        write_collection('users', $users);
        $_SESSION['user']['mustChangePassword'] = false;
        json_ok(['changed' => true]);
        break;

    case 'setup':
        require_method(['POST']);
        $users = read_collection('users');
        if (!empty($users)) {
            json_error('Setup has already been completed', 403);
        }
        if (SETUP_TOKEN === '') {
            json_error('Setup is disabled: no CMS_SETUP_TOKEN configured on the server', 403);
        }
        $body = read_json_body();
        $token = (string) ($body['setupToken'] ?? '');
        $username = trim((string) ($body['username'] ?? ''));
        $password = (string) ($body['password'] ?? '');

        if (!hash_equals(SETUP_TOKEN, $token)) {
            json_error('Invalid setup token', 403);
        }
        if (!preg_match('/^[a-zA-Z0-9._-]{3,40}$/', $username)) {
            json_error('Username must be 3-40 characters (letters, numbers, . _ -)', 422);
        }
        if (strlen($password) < 10) {
            json_error('Password must be at least 10 characters', 422);
        }

        $newUser = [
            'id' => generate_id('user'),
            'username' => $username,
            'passwordHash' => password_hash($password, PASSWORD_DEFAULT),
            'role' => 'admin',
            'mustChangePassword' => false,
            'createdAt' => date('c'),
            'updatedAt' => date('c'),
            'lastLoginAt' => null,
        ];
        write_collection('users', [$newUser]);
        json_ok(['created' => true, 'username' => $username]);
        break;

    default:
        json_error('Unknown auth action', 404);
}
