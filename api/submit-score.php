<?php

declare(strict_types=1);

require_once __DIR__ . '/common.php';

handle_preflight();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    send_json(['error' => 'Method not allowed.'], 405);
}

$body = read_json_body();

$userId = $body['user_id'] ?? null;
$username = sanitize_username($body['username'] ?? '');
$time = $body['time'] ?? null;

if (!is_valid_user_id($userId)) {
    send_json(['error' => 'Invalid user_id format.'], 400);
}

if ($username === '') {
    send_json(['error' => 'Username is required.'], 400);
}

if (is_int($time) === false && is_numeric($time)) {
    $time = (int)$time;
}

if (!is_valid_time($time)) {
    send_json(['error' => 'Invalid time.'], 400);
}

try {
    $pdo = db_connection();

    $upsertSql = <<<SQL
INSERT INTO leaderboard (user_id, username, best_time, updated_at)
VALUES (:user_id, :username, :best_time, NOW())
ON CONFLICT (user_id)
DO UPDATE SET
    username = EXCLUDED.username,
    best_time = EXCLUDED.best_time,
    updated_at = NOW()
WHERE EXCLUDED.best_time < leaderboard.best_time
RETURNING user_id, username, best_time, updated_at
SQL;

    $upsertStmt = $pdo->prepare($upsertSql);
    $upsertStmt->execute([
        ':user_id' => (string)$userId,
        ':username' => $username,
        ':best_time' => $time,
    ]);

    $entry = $upsertStmt->fetch();

    if ($entry === false) {
        $selectStmt = $pdo->prepare(
            'SELECT user_id, username, best_time, updated_at FROM leaderboard WHERE user_id = :user_id'
        );
        $selectStmt->execute([':user_id' => (string)$userId]);
        $existing = $selectStmt->fetch() ?: null;

        send_json([
            'updated' => false,
            'entry' => $existing,
        ]);
    }

    send_json([
        'updated' => true,
        'entry' => $entry,
    ]);
} catch (Throwable $error) {
    error_log('submit-score error: ' . $error->getMessage());
    send_json(['error' => 'Internal server error.'], 500);
}
