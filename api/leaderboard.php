<?php

declare(strict_types=1);

require_once __DIR__ . '/common.php';

handle_preflight();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    send_json(['error' => 'Method not allowed.'], 405);
}

try {
    $pdo = db_connection();

    $stmt = $pdo->query(
        'SELECT user_id, username, best_time, updated_at FROM leaderboard ORDER BY best_time ASC, updated_at ASC LIMIT 10'
    );

    $rows = $stmt->fetchAll();

    send_json([
        'leaderboard' => is_array($rows) ? $rows : [],
    ]);
} catch (Throwable $error) {
    error_log('leaderboard error: ' . $error->getMessage());
    send_json(['error' => 'Internal server error.'], 500);
}
