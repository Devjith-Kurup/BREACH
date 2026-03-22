import { terminalInput, terminalOutput, terminalContent } from './elements.js';
import { playSound } from './audio.js';

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
        cls: null
    };

    render();

    terminalInput.addEventListener('input', () => {
        playSound('type');
        render();
    });

    terminalInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const cmd = terminalInput.value.trim().toLowerCase();

            history.push(prompt + terminalInput.value);
            terminalInput.value = '';

            if (cmd === 'clear' || cmd === 'cls') {
                history = [];
                playSound('delete');
                render();
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