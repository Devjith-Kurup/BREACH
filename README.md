# NEXUS BREACH

An atmospheric browser-based hacking puzzle game built with Three.js and vanilla JavaScript.

Status: Live and hosted on itch.io.

Asset style: Pixel art.

## Overview

NEXUS BREACH simulates a stylized infiltration flow with:

- Intro boot sequence
- Runtime-generated lockscreen password
- Click-based desktop navigation
- Three puzzle-locked folders
- In-game terminal commands and clues
- Optional global leaderboard backend (PHP or Node)
- Audio and shader effects

The core game runs in-browser with no build step.

## Live Build

This game is currently hosted on itch.io:

https://devjith.itch.io/nexus-breach

## Tech Stack

- HTML5
- CSS3
- JavaScript (ES modules)
- Three.js (CDN)
- Optional backend: PHP + Postgres or Node + Postgres

## Quick Start

### Option 1: VS Code Task

Run task: `Start Local Server`, then open:

http://localhost:8000

### Option 2: Manual Static Server

From project root:

```powershell
python -m http.server 8000
```

Then open:

http://localhost:8000

## Leaderboard Backends

The frontend leaderboard client supports external APIs. Locally, it defaults to `/api` on localhost.

### PHP Backend (included)

PHP endpoints are in:

- [api/common.php](api/common.php)
- [api/submit-score.php](api/submit-score.php)
- [api/leaderboard.php](api/leaderboard.php)
- [api/rank.php](api/rank.php)

1. Create [backend/.env](backend/.env):

```env
DATABASE_URL=postgres://USER:PASSWORD@HOST:5432/DB_NAME
CORS_ALLOWED_ORIGINS=http://localhost:8000,https://devjith.itch.io
```

2. Apply [backend/schema.sql](backend/schema.sql) to your DB.
3. Start PHP from project root:

```powershell
php -S localhost:8000 -t .
```

### Node Backend (legacy/alternative)

Node server is in [backend/server.js](backend/server.js).

```powershell
cd backend
npm install
npm run start
```

If running Node on a different origin, set API base in frontend config (below).

## Frontend API Configuration

For hosted static deployments (for example itch.io), set API origin in [js/runtime-config.js](js/runtime-config.js):

```js
window.BREACH_RUNTIME_CONFIG = {
		apiBase: 'https://your-backend.example.com/api'
};
```

Behavior:

- On `localhost`/`127.0.0.1`: defaults to `/api`
- On non-local hosts: requires explicit `apiBase`

Legacy override also works:

```html
<script>
	window.BREACH_API_BASE = 'http://localhost:3001';
</script>
```

## Controls

- Mouse move: custom cursor movement
- Left click: interact with hotspots
- Keyboard: password and terminal input

## Terminal Commands

- `logs`
- `status`
- `leaderboard`
- `clear`
- `cls`

## Walkthrough

This section includes puzzle hints and direct solutions.

### High-Level Path

1. Start the intro and reach the lockscreen.
2. Unlock the main desktop using the runtime lockscreen code.
3. Open text/terminal/network clues to derive folder passwords.
4. Unlock Yellow, Green, and Red folders.
5. After all three unlock, the game displays **NEXUS EXPOSED**.

### Clue Sources

- Main puzzle prompt appears in the desktop text file view.
- `logs` and `status` terminal commands reveal key numbers.
- Network panel shows affected/offline node context.
- Settings panel includes SYSTEM ID and BUILD VERSION.

### Folder Solutions (Spoilers)

1. Yellow folder: `4823`
2. Green folder: `7391`
3. Red folder: `5612`

### End State

When all three folder flags are unlocked, a full-screen black overlay displays **NEXUS EXPOSED**.

## Project Structure

```text
BREACH/
	index.html
	style.css
	api/
		common.php
		submit-score.php
		leaderboard.php
		rank.php
	backend/
		server.js
		schema.sql
	js/
		runtime-config.js
		main.js
		scene.js
		shader.js
		state.js
		assets.js
		audio.js
		elements.js
		intro.js
		terminal.js
		input.js
		inputs/
			introInput.js
			lockscreenInput.js
			desktopInput.js
			globalInput.js
```

## Troubleshooting

- Audio does not play until first interaction due to browser autoplay policies.
- ES modules require HTTP serving (do not open as `file://`).
- If leaderboard fails on hosted static pages, set `apiBase` in [js/runtime-config.js](js/runtime-config.js).
- If PHP endpoints return `403 Origin not allowed`, update `CORS_ALLOWED_ORIGINS` in [backend/.env](backend/.env).