<?php

declare(strict_types=1);

const MIN_TIME_MS = 1000;
const MAX_TIME_MS = 3600000;

function get_allowed_origins(): array
{
    static $allowedOrigins = null;

    if (is_array($allowedOrigins)) {
        return $allowedOrigins;
    }

    load_env_file(__DIR__ . '/../backend/.env');

    $rawOrigins = getenv('CORS_ALLOWED_ORIGINS');
    if ($rawOrigins === false || trim((string)$rawOrigins) === '') {
        $rawOrigins = 'http://localhost:8000,http://127.0.0.1:8000';
    }

    $allowedOrigins = array_values(array_filter(array_map(
        static fn (string $origin): string => rtrim(trim($origin), '/'),
        explode(',', (string)$rawOrigins)
    )));

    return $allowedOrigins;
}

function get_request_origin(): string
{
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    return is_string($origin) ? rtrim(trim($origin), '/') : '';
}

function is_origin_allowed(string $origin): bool
{
    if ($origin === '') {
        return true;
    }

    foreach (get_allowed_origins() as $allowedOrigin) {
        if ($allowedOrigin === '*') {
            return true;
        }

        if ($allowedOrigin === $origin) {
            return true;
        }
    }

    return false;
}

function apply_cors_headers(): void
{
    $origin = get_request_origin();

    header('Vary: Origin');
    if ($origin !== '' && is_origin_allowed($origin)) {
        header('Access-Control-Allow-Origin: ' . $origin);
    }

    header('Access-Control-Allow-Headers: Content-Type');
    header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
}

function reject_disallowed_origin(): void
{
    http_response_code(403);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['error' => 'Origin not allowed.']);
    exit;
}

function send_json(array $payload, int $statusCode = 200): void
{
    $origin = get_request_origin();
    if (!is_origin_allowed($origin)) {
        reject_disallowed_origin();
    }

    http_response_code($statusCode);
    header('Content-Type: application/json; charset=utf-8');
    apply_cors_headers();
    echo json_encode($payload);
    exit;
}

function handle_preflight(): void
{
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        $origin = get_request_origin();
        if (!is_origin_allowed($origin)) {
            reject_disallowed_origin();
        }

        apply_cors_headers();
        http_response_code(204);
        exit;
    }
}

function load_env_file(string $path): void
{
    if (!is_file($path)) {
        return;
    }

    $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    if ($lines === false) {
        return;
    }

    foreach ($lines as $line) {
        $trimmed = trim($line);
        if ($trimmed === '' || str_starts_with($trimmed, '#')) {
            continue;
        }

        $splitPos = strpos($trimmed, '=');
        if ($splitPos === false) {
            continue;
        }

        $key = trim(substr($trimmed, 0, $splitPos));
        $value = trim(substr($trimmed, $splitPos + 1));
        $value = trim($value, "\"'");

        if ($key !== '' && getenv($key) === false) {
            putenv($key . '=' . $value);
            $_ENV[$key] = $value;
        }
    }
}

function get_database_url(): string
{
    load_env_file(__DIR__ . '/../backend/.env');

    $databaseUrl = getenv('DATABASE_URL');
    if ($databaseUrl === false || trim($databaseUrl) === '') {
        send_json(['error' => 'Missing DATABASE_URL in environment.'], 500);
    }

    return $databaseUrl;
}

function db_connection(): PDO
{
    static $pdo = null;

    if ($pdo instanceof PDO) {
        return $pdo;
    }

    $databaseUrl = get_database_url();

    try {
        $pdo = new PDO($databaseUrl, null, null, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ]);
    } catch (Throwable $error) {
        error_log('DB connection error: ' . $error->getMessage());
        send_json(['error' => 'Internal server error.'], 500);
    }

    return $pdo;
}

function sanitize_username(mixed $raw): string
{
    $value = trim((string)$raw);
    $value = preg_replace('/\s+/', ' ', $value) ?? '';
    return mb_substr($value, 0, 24);
}

function is_valid_user_id(mixed $userId): bool
{
    return preg_match('/^[a-zA-Z0-9_-]{8,64}$/', (string)$userId) === 1;
}

function is_valid_time(mixed $time): bool
{
    if (!is_int($time)) {
        return false;
    }

    return $time >= MIN_TIME_MS && $time <= MAX_TIME_MS;
}

function read_json_body(): array
{
    $rawBody = file_get_contents('php://input');
    if ($rawBody === false || $rawBody === '') {
        return [];
    }

    $decoded = json_decode($rawBody, true);
    return is_array($decoded) ? $decoded : [];
}
