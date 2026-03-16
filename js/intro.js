import { introTextElement, continueHint } from './elements.js';
import { playSound } from './audio.js';

const fullIntroText = `Your contact, Devjith,
was a data analyst at
NEXUS CORP.

Devjith discovered the company
has been running a mass
surveillance operation on
thousands of people and
selling the data.

Before being arrested on
fabricated charges, Devjith
managed to hide the
evidence deep inside
the company's system.

You have remote access
to a NEXUS CORP terminal.

Find the evidence.
Expose the company.
Free Devjith.

USE DEV TOOLS TO SURVIVE.`;

let charIndex = 0;

export function typeWriter() {
    if (charIndex >= fullIntroText.length) {
        // Ensure explicit finish
        continueHint.style.visibility = 'visible';
        return;
    }

    // Check if we manually skipped
    if (introTextElement.textContent.length === fullIntroText.length) {
        continueHint.style.visibility = 'visible';
        return;
    }

    introTextElement.textContent += fullIntroText.charAt(charIndex);

    // Play typing sound (check for spaces to avoid too much noise?)
    if (fullIntroText.charAt(charIndex) !== ' ' && fullIntroText.charAt(charIndex) !== '\n') {
        playSound('type');
    }

    charIndex++;

    let delay = 35;
    // Pause longer on periods or new lines for natural feel
    if (fullIntroText.charAt(charIndex - 1) === '.' || fullIntroText.charAt(charIndex - 1) === '\n') {
        delay = 150;
    }

    setTimeout(typeWriter, delay);
}

export function getCurrentCharIndex() {
    return charIndex;
}

export function setCharIndex(index) {
    charIndex = index;
}

export function getFullIntroText() {
    return fullIntroText;
}

export function initIntro() {
    introTextElement.textContent = "> SYSTEM DETECTED.\n> CLICK TO INITIALIZE CONNECTION_";
    introTextElement.style.animation = "blink 1s infinite";
    introTextElement.style.cursor = "pointer";
}
