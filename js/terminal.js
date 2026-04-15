import { terminalInput, terminalOutput, terminalContent } from './elements.js';
import { playSound } from './audio.js';
import { fetchLeaderboard, fetchRank, getCurrentPlayer, formatTime } from './leaderboard.js';

export function setupTerminal() {
    const prompt = "PS C:\\Users\\devjith> ";
    let history = [
        "NEXUS CORP TERMINAL v2.3.1",
        "SECURITY CLEARANCE: LEVEL 1",
        "TYPE A COMMAND TO PROCEED...",
        ""
    ];

    let cursorVisible = true;

    setInterval(() => {
        cursorVisible = !cursorVisible;
        render();
        if (terminalInput && terminalInput.offsetParent && document.activeElement !== terminalInput) {
            terminalInput.focus({ preventScroll: true });
        }
    }, 500);

    function render() {
        if (history.length > 14) {
            history = history.slice(history.length - 14);
        }
        
        let output = history.join('\n');
        const cursor = cursorVisible ? '_' : '\u00A0';
        output += '\n' + prompt + terminalInput.value + cursor;
        terminalOutput.textContent = output;
    }

    function typeLines(lines) {
        HISTORY_APPEND: for (const line of lines) {
            history.push(line);
        }
        history.push('');
        render();
    }

    const commands = {
        logs: [
            "ACCESSING LOGS...",
            "[ERROR] MOST LOGS WIPED",
            "PARTIAL ENTRY FOUND:",
            "DATE: 07/03 - SURVEILLANCE EXPANDED",
            "NODES AFFECTED: 91",
            "REST OF LOG CORRUPTED"
        ],
        status: [
            "CHECKING SYSTEM...",
            "FILES REMAINING: 12",
            "UPLOAD READY"
        ],
        clear: null,
        cls: null,
        leaderboard: null
    };

    async function renderLeaderboard() {
        const currentPlayer = getCurrentPlayer();
        const [topPlayers, rank] = await Promise.all([
            fetchLeaderboard(),
            fetchRank(currentPlayer.userId)
        ]);

        const lines = [
            'GLOBAL LEADERBOARD (TOP 10)',
            '---------------------------'
        ];

        if (!topPlayers.length) {
            lines.push('NO SCORES RECORDED YET.');
        } else {
            for (let i = 0; i < topPlayers.length; i++) {
                const entry = topPlayers[i];
                const place = String(i + 1).padStart(2, '0');
                const name = String(entry.username || 'UNKNOWN').padEnd(16, ' ');
                const bestTime = formatTime(Number(entry.best_time));
                lines.push(`${place}. ${name} ${bestTime}`);
            }
        }

        lines.push('');

        if (rank) {
            lines.push(`YOU: #${rank.rank} (${formatTime(Number(rank.best_time))})`);
        } else {
            lines.push('YOU: UNRANKED');
        }

        typeLines(lines);
    }

    render();

    terminalInput.addEventListener('input', () => {
        playSound('type');
        render();
    });

    terminalInput.addEventListener('keydown', async (e) => {
        if (e.key === 'Enter') {
            const cmd = terminalInput.value.trim().toLowerCase();

            history.push(prompt + terminalInput.value);
            terminalInput.value = '';

            if (cmd === 'clear' || cmd === 'cls') {
                history = [];
                playSound('delete');
                render();
            } else if (cmd === 'leaderboard') {
                playSound('success');
                typeLines(['QUERYING LEADERBOARD...']);

                try {
                    await renderLeaderboard();
                } catch (error) {
                    playSound('error');
                    typeLines([
                        'LEADERBOARD UNAVAILABLE',
                        String(error.message || 'REQUEST FAILED')
                    ]);
                }
            } else if (commands[cmd]) {
                playSound('success');
                typeLines(commands[cmd]);
            } else if (cmd === '') {
                render();
            } else {
                playSound('error');
                typeLines([
                    "COMMAND NOT RECOGNIZED",
                    "ACCESS LIMITED"
                ]);
            }
        }
    });

    terminalContent.addEventListener('click', () => {
        terminalInput.focus();
    });
}