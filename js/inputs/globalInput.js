import { state } from '../state.js';
import { material } from '../scene.js';
import { 
    passwordLabel, passwordInput, passwordDisplay, clockElement, adminPanel, nexusExposedMessage
} from '../elements.js';
import { texture } from '../assets.js';
import { playSound } from '../audio.js';
import { stopNetworkTyping } from './desktopInput.js';
import { resetRunState } from '../leaderboard.js';

export function handleGlobalClick(uv) {
    if (state.currentScreen !== 'lockscreen' && uv.x > 0.82 && uv.x < 0.90 && uv.y > 0.10 && uv.y < 0.20) {
        stopNetworkTyping();
        playSound('power_off');
        material.uniforms.tDiffuse.value = texture;
        state.currentScreen = 'lockscreen';

        state.failureCount = 0;
        state.isFolderRedUnlocked = false;
        state.isFolderGreenUnlocked = false;
        state.isFolderYellowUnlocked = false;
        state.hasShownNexusExposed = false;
        resetRunState();

        state.hasClosedMiniWindow = false;

        clockElement.style.display = 'block';
        passwordInput.disabled = false;
        passwordInput.value = '';
        passwordInput.style.display = 'block';
        passwordInput.focus();
        passwordDisplay.innerHTML = '';
        passwordDisplay.style.display = 'flex';
        passwordLabel.style.display = 'block';
        passwordLabel.textContent = 'ENTER PASSWORD';
        adminPanel.style.display = 'none';

        // Hide the textfile secret message if visible
        const secretMsg = document.getElementById('textfile-secret-message');
        if (secretMsg) secretMsg.style.display = 'none';

        if (nexusExposedMessage) {
            nexusExposedMessage.style.display = 'none';
            nexusExposedMessage.classList.remove('show');
        }

        return true;
    }
    return false;
}
