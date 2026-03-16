import { state } from '../state.js';
import { material } from '../scene.js';
import { 
    passwordInput, passwordDisplay, passwordLabel, clockElement, 
    introTextElement, adminPanel, accessBtn 
} from '../elements.js';
import { pcTexture, desktopTexture, timedOutTexture } from '../assets.js';
import { playSound, startDeadSound } from '../audio.js';

export function setupLockscreenInput() {
    // --- ACCESS BUTTON ---
    accessBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (!accessBtn.disabled) {
            playSound('access_granted');
            material.uniforms.tDiffuse.value = pcTexture;
            state.currentScreen = 'pc';
            adminPanel.style.display = 'none';
            state.isPcUnlocked = true;
        }
    });

    // --- PASSWORD INPUT ---
    passwordInput.addEventListener('input', (e) => {
        if (e.inputType === 'deleteContentBackward') {
            playSound('delete');
        } else {
            playSound('type');
        }
        passwordDisplay.innerHTML = '';
        const length = passwordInput.value.length;
        for (let i = 0; i < length; i++) {
            const dot = document.createElement('div');
            dot.className = 'password-dot';
            passwordDisplay.appendChild(dot);
        }

        if (length === 4) {
            if (passwordInput.value === 'asas') {
                state.failureCount = 0;
                passwordInput.disabled = true;

                setTimeout(() => {
                    playSound('success');
                    material.uniforms.tDiffuse.value = desktopTexture;
                    state.currentScreen = 'desktop';
                    state.hasClosedMiniWindow = false;

                    passwordInput.style.display = 'none';
                    passwordDisplay.style.display = 'none';
                    passwordLabel.style.display = 'none';
                    passwordInput.blur();
                }, 500);
            } else {
                playSound('error');
                passwordInput.disabled = true;
                state.failureCount++;

                if (state.failureCount >= 3) {
                    setTimeout(() => {
                        playSound('glitch');
                        startDeadSound();
                        material.uniforms.tDiffuse.value = timedOutTexture;
                        state.currentScreen = 'timedOut';
                        passwordInput.style.display = 'none';
                        passwordDisplay.style.display = 'none';
                        passwordLabel.style.display = 'none';
                        clockElement.style.display = 'none';
                        introTextElement.textContent = "";
                        passwordInput.blur();
                    }, 500);
                }

                let shakeDuration = 300;
                let startTime = Date.now();

                function doShake() {
                    let elapsed = Date.now() - startTime;
                    if (elapsed < shakeDuration) {
                        material.uniforms.uShake.value = 1.0 - (elapsed / shakeDuration);
                        requestAnimationFrame(doShake);
                    } else {
                        material.uniforms.uShake.value = 0.0;
                        if (state.failureCount >= 3) return;
                        passwordInput.value = '';
                        passwordDisplay.innerHTML = '';
                        passwordInput.disabled = false;
                        passwordInput.focus();
                    }
                }
                doShake();
            }
        }
    });
}
