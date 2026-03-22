import { state } from '../state.js';
import { mesh } from '../scene.js';
import { introScreen, introTextElement, continueHint, passwordLabel, passwordInput, passwordDisplay, clockElement } from '../elements.js';
import { playSound, resumeAudio } from '../audio.js';
import { typeWriter, getCurrentCharIndex, setCharIndex, getFullIntroText } from '../intro.js';

export function setupIntroInput() {
    introScreen.addEventListener('click', (e) => {
        e.stopPropagation();

        if (!state.isSystemBooted) {
            state.isSystemBooted = true;
            resumeAudio();
            playSound('connect');

            introTextElement.style.animation = "none";
            introTextElement.style.cursor = "default";
            introTextElement.textContent = "";
            setTimeout(typeWriter, 500);
            return;
        }

        const fullIntroText = getFullIntroText();
        const charIndex = getCurrentCharIndex();

        if (charIndex < fullIntroText.length) {
            continueHint.style.visibility = 'visible';
            setCharIndex(fullIntroText.length);
            introTextElement.textContent = fullIntroText;
            return;
        }

        playSound('type');
        introScreen.style.opacity = '0';
        introScreen.style.pointerEvents = 'none';

        setTimeout(() => {
            passwordLabel.style.display = 'block';
            passwordInput.style.display = 'block';
            void passwordLabel.offsetWidth;
            passwordLabel.style.opacity = '1';
            passwordDisplay.style.opacity = '1';
            if (clockElement) clockElement.style.opacity = '1';
        }, 300);

        setTimeout(() => {
            introScreen.style.display = 'none';
            passwordInput.disabled = false;
            passwordInput.focus();
        }, 800);

        let startTime = Date.now();
        const zoomDuration = 1500;
        mesh.scale.set(0.01, 0.01, 1);
        state.currentScreen = 'lockscreen';

        function zoomIn() {
            let elapsed = Date.now() - startTime;
            let t = Math.min(elapsed / zoomDuration, 1);
            const ease = 1 - Math.pow(1 - t, 4);
            const scale = 0.01 + (0.99 * ease);
            mesh.scale.set(scale, scale, 1);
            if (elapsed < zoomDuration) {
                requestAnimationFrame(zoomIn);
            } else {
                mesh.scale.set(1, 1, 1);
            }
        }
        zoomIn();
    });
}
