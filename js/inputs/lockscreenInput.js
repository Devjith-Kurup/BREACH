import { state } from '../state.js';
import { material } from '../scene.js';
import { 
    passwordInput, passwordDisplay, passwordLabel, clockElement, 
    introTextElement, adminPanel, accessBtn 
} from '../elements.js';
import { pcTexture, pc2Texture, desktopTexture, timedOutTexture, folderRedTexture, folderGreenTexture, folderYellowTexture } from '../assets.js';
import { playSound, startDeadSound } from '../audio.js';

export function setupLockscreenInput() {
    
    accessBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (!accessBtn.disabled) {
            playSound('access_granted');
            material.uniforms.tDiffuse.value = state.isDisconnected ? pc2Texture : pcTexture;
            state.currentScreen = 'pc';
            adminPanel.style.display = 'none';
            state.isPcUnlocked = true;
        }
    });

    
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
            const val = passwordInput.value;
            let isCorrect = false;

            if (state.currentScreen === 'lockscreen' && val === 'asas') {
                isCorrect = true;
            } else if (['folderRedLocked', 'folderGreenLocked', 'folderYellowLocked'].includes(state.currentScreen) && val === '1234') { 
                isCorrect = true;
            }

            if (isCorrect) {
                state.failureCount = 0;
                passwordInput.disabled = true;

                setTimeout(() => {
                    playSound('success');
                    
                    if (state.currentScreen === 'lockscreen') {
                        material.uniforms.tDiffuse.value = desktopTexture;
                        state.currentScreen = 'desktop';
                        state.hasClosedMiniWindow = false;
                    } else if (state.currentScreen === 'folderRedLocked') {
                        material.uniforms.tDiffuse.value = folderRedTexture; 
                        state.currentScreen = 'folder';
                        state.isFolderRedUnlocked = true;
                    } else if (state.currentScreen === 'folderGreenLocked') {
                        material.uniforms.tDiffuse.value = folderGreenTexture; 
                        state.currentScreen = 'folder';
                        state.isFolderGreenUnlocked = true;
                    } else if (state.currentScreen === 'folderYellowLocked') {
                        material.uniforms.tDiffuse.value = folderYellowTexture; 
                        state.currentScreen = 'folder';
                        state.isFolderYellowUnlocked = true;
                    }

                    passwordInput.style.display = 'none';
                    passwordDisplay.style.display = 'none';
                    passwordLabel.style.display = 'none';
                    passwordInput.blur();
                }, 500);
            } else {
                playSound('error');
                passwordInput.disabled = true;
                
                
                if (['lockscreen', 'folderRedLocked', 'folderGreenLocked', 'folderYellowLocked'].includes(state.currentScreen)) {
                    state.failureCount++;
                }

                
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
                        
                        
                        if (['lockscreen', 'folderRedLocked', 'folderGreenLocked', 'folderYellowLocked'].includes(state.currentScreen) && state.failureCount >= 3) return;
                        
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
