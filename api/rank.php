<?php

declare(strict_types=1);

require_once __DIR__ . '/common.php';

handle_preflight();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    send_json(['error' => 'Method not allowed.'], 405);
}

$userId = $_GET['user_id'] ?? '';

if (!is_valid_user_id($userId)) {
    send_json(['error' => 'Invalid user_id format.'], 400);
}

try {
    $pdo = db_connection();

    $sql = <<<SQL
WITH ranked AS (
    SELECT
        user_id,
        username,
        best_time,
        updated_at,
        RANK() OVER (ORDER BY best_time ASC, updated_at ASC) AS rank
    FROM leaderboard
)
SELECT user_id, username, best_time, updated_at, rank
FROM ranked
WHERE user_id = :user_id
SQL;

    $stmt = $pdo->prepare($sql);
    $stmt->execute([':user_id' => (string)$userId]);

    $entry = $stmt->fetch();

    if ($entry === false) {
        send_json(['error' => 'User not found.'], 404);
    }

    send_json($entry);
} catch (Throwable $error) {
    error_log('rank error: ' . $error->getMessage());
    send_json(['error' => 'Internal server error.'], 500);
}
