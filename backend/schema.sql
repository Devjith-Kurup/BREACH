CREATE TABLE IF NOT EXISTS leaderboard (
    user_id TEXT PRIMARY KEY,
    username TEXT NOT NULL,
    best_time INTEGER NOT NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_leaderboard_best_time ON leaderboard (best_time ASC);
