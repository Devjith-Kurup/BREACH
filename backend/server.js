import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import pg from 'pg';

dotenv.config();

const { Pool } = pg;
const app = express();
const port = Number(process.env.PORT || 3001);

if (!process.env.DATABASE_URL) {
    console.error('Missing DATABASE_URL in environment.');
    process.exit(1);
}

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

const MIN_TIME_MS = 1000;
const MAX_TIME_MS = 60 * 60 * 1000;
const USER_ID_REGEX = /^[a-zA-Z0-9_-]{8,64}$/;

app.use(cors());
app.use(express.json({ limit: '16kb' }));

const submitScoreLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many score submissions. Try again later.' }
});

function sanitizeUsername(raw) {
    return String(raw || '')
        .trim()
        .replace(/\s+/g, ' ')
        .slice(0, 24);
}

function isValidTime(time) {
    return Number.isInteger(time) && time >= MIN_TIME_MS && time <= MAX_TIME_MS;
}

app.get('/health', (_req, res) => {
    res.json({ ok: true });
});

app.post('/submit-score', submitScoreLimiter, async (req, res) => {
    const { user_id: userId, username, time } = req.body || {};
    const cleanUsername = sanitizeUsername(username);

    if (!USER_ID_REGEX.test(String(userId || ''))) {
        return res.status(400).json({ error: 'Invalid user_id format.' });
    }

    if (!cleanUsername) {
        return res.status(400).json({ error: 'Username is required.' });
    }

    if (!isValidTime(time)) {
        return res.status(400).json({ error: 'Invalid time.' });
    }

    try {
        const upsertResult = await pool.query(
            `
            INSERT INTO leaderboard (user_id, username, best_time, updated_at)
            VALUES ($1, $2, $3, NOW())
            ON CONFLICT (user_id)
            DO UPDATE SET
                username = EXCLUDED.username,
                best_time = EXCLUDED.best_time,
                updated_at = NOW()
            WHERE EXCLUDED.best_time < leaderboard.best_time
            RETURNING user_id, username, best_time, updated_at
            `,
            [userId, cleanUsername, time]
        );

        if (upsertResult.rows.length === 0) {
            const existing = await pool.query(
                'SELECT user_id, username, best_time, updated_at FROM leaderboard WHERE user_id = $1',
                [userId]
            );

            return res.json({
                updated: false,
                entry: existing.rows[0] || null
            });
        }

        return res.json({
            updated: true,
            entry: upsertResult.rows[0]
        });
    } catch (error) {
        console.error('submit-score error', error);
        return res.status(500).json({ error: 'Internal server error.' });
    }
});

app.get('/leaderboard', async (_req, res) => {
    try {
        const result = await pool.query(
            `
            SELECT user_id, username, best_time, updated_at
            FROM leaderboard
            ORDER BY best_time ASC, updated_at ASC
            LIMIT 10
            `
        );

        return res.json({ leaderboard: result.rows });
    } catch (error) {
        console.error('leaderboard error', error);
        return res.status(500).json({ error: 'Internal server error.' });
    }
});

app.get('/rank/:userId', async (req, res) => {
    const userId = String(req.params.userId || '');

    if (!USER_ID_REGEX.test(userId)) {
        return res.status(400).json({ error: 'Invalid user_id format.' });
    }

    try {
        const rankResult = await pool.query(
            `
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
            WHERE user_id = $1
            `,
            [userId]
        );

        if (rankResult.rows.length === 0) {
            return res.status(404).json({ error: 'User not found.' });
        }

        return res.json(rankResult.rows[0]);
    } catch (error) {
        console.error('rank error', error);
        return res.status(500).json({ error: 'Internal server error.' });
    }
});

app.listen(port, () => {
    console.log(`BREACH leaderboard backend listening on port ${port}`);
});
