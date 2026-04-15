import { state } from './state.js';

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1']);
const STORAGE_USER_ID = 'breach_user_id';
const STORAGE_USERNAME = 'breach_username';
const STORAGE_LAST_SUBMITTED_TIME = 'breach_last_submitted_time';
const MIN_TIME_MS = 1000;
const MAX_TIME_MS = 60 * 60 * 1000;

function normalizeApiBase(value) {
    const raw = String(value || '').trim();
    if (!raw) return '';
    return raw.replace(/\/+$/, '');
}

function resolveApiBase() {
    const runtimeConfigBase = normalizeApiBase(window.BREACH_RUNTIME_CONFIG && window.BREACH_RUNTIME_CONFIG.apiBase);
    const legacyConfigBase = normalizeApiBase(window.BREACH_API_BASE);

    if (runtimeConfigBase) return runtimeConfigBase;
    if (legacyConfigBase) return legacyConfigBase;

    if (LOCAL_HOSTS.has(String(window.location.hostname || '').toLowerCase())) {
        return '/api';
    }

    return '';
}

const API_BASE = resolveApiBase();

function buildApiUrl(path) {
    if (!API_BASE) {
        throw new Error('Leaderboard backend is not configured. Set window.BREACH_RUNTIME_CONFIG.apiBase to your hosted API URL.');
    }

    return `${API_BASE}${path}`;
}

function sanitizeUsername(raw) {
    return String(raw || '')
        .trim()
        .replace(/\s+/g, ' ')
        .slice(0, 24);
}

function generateUserId() {
    if (window.crypto && typeof window.crypto.randomUUID === 'function') {
        return window.crypto.randomUUID();
    }

    return `u_${Date.now()}_${Math.random().toString(36).slice(2, 12)}`;
}

function isValidTime(time) {
    return Number.isInteger(time) && time >= MIN_TIME_MS && time <= MAX_TIME_MS;
}

function getOrCreateUserId() {
    let userId = localStorage.getItem(STORAGE_USER_ID);

    if (!userId) {
        userId = generateUserId();
        localStorage.setItem(STORAGE_USER_ID, userId);
    }

    return userId;
}

export function ensurePlayerIdentity() {
    const userId = getOrCreateUserId();
    let username = sanitizeUsername(localStorage.getItem(STORAGE_USERNAME));

    while (!username) {
        const input = window.prompt('Enter a username for the global leaderboard (max 24 chars):', 'Agent');
        username = sanitizeUsername(input);

        if (!username) {
            window.alert('A username is required for leaderboard submissions.');
        }
    }

    localStorage.setItem(STORAGE_USERNAME, username);

    return { userId, username };
}

export function getCurrentPlayer() {
    const userId = getOrCreateUserId();
    const username = sanitizeUsername(localStorage.getItem(STORAGE_USERNAME));

    return {
        userId,
        username
    };
}

export function formatTime(timeMs) {
    if (!isValidTime(timeMs)) return '--';

    const minutes = Math.floor(timeMs / 60000);
    const seconds = Math.floor((timeMs % 60000) / 1000);
    const milliseconds = timeMs % 1000;

    return `${minutes}:${String(seconds).padStart(2, '0')}.${String(milliseconds).padStart(3, '0')}`;
}

export function startRunTimer() {
    if (!state.runStartedAt) {
        state.runStartedAt = Date.now();
        state.runCompletedAt = 0;
        state.lastCompletionTime = 0;
        state.scoreSubmitted = false;
    }
}

export function resetRunState() {
    state.runStartedAt = 0;
    state.runCompletedAt = 0;
    state.lastCompletionTime = 0;
    state.scoreSubmitted = false;
}

export async function submitScore(result) {
    const { userId, username } = ensurePlayerIdentity();
    const time = Number(result && result.time);

    if (!isValidTime(time)) {
        throw new Error('Invalid completion time.');
    }

    const response = await fetch(buildApiUrl('/submit-score.php'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            user_id: userId,
            username,
            time
        })
    });

    if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error || 'Failed to submit score.');
    }

    localStorage.setItem(STORAGE_LAST_SUBMITTED_TIME, String(time));
    return response.json();
}

export async function fetchLeaderboard() {
    const response = await fetch(buildApiUrl('/leaderboard.php'));

    if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error || 'Failed to fetch leaderboard.');
    }

    const body = await response.json();
    return Array.isArray(body.leaderboard) ? body.leaderboard : [];
}

export async function fetchRank(userId) {
    const resolvedUserId = userId || getOrCreateUserId();
    const response = await fetch(buildApiUrl(`/rank.php?user_id=${encodeURIComponent(resolvedUserId)}`));

    if (response.status === 404) {
        return null;
    }

    if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error || 'Failed to fetch rank.');
    }

    return response.json();
}

export function checkAndSubmitCompletion() {
    const hasCompletedAllFolders = state.isFolderRedUnlocked && state.isFolderGreenUnlocked && state.isFolderYellowUnlocked;
    const hasSafeNetworkState = state.isDisconnected === false;

    if (!hasCompletedAllFolders || !hasSafeNetworkState) {
        return;
    }

    if (!state.runStartedAt || state.scoreSubmitted) {
        return;
    }

    const completionTime = Date.now() - state.runStartedAt;

    if (!isValidTime(completionTime)) {
        return;
    }

    state.runCompletedAt = Date.now();
    state.lastCompletionTime = completionTime;
    state.scoreSubmitted = true;

    submitScore({ time: completionTime }).catch((error) => {
        console.error('Leaderboard submission failed:', error);
        state.scoreSubmitted = false;
    });
}
