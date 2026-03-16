import { state } from '../state.js';
import { material } from '../scene.js';
import { 
    passwordLabel, passwordInput, passwordDisplay, clockElement, adminPanel 
} from '../elements.js';
import { texture } from '../assets.js';
import { playSound } from '../audio.js';

export function handleGlobalClick(uv) {
    // Power Button Logic (Bottom Right)
    // Works globally except when already on lockscreen (or intro/timedOut technically, but intro is handled separately and timedOut is stuck)
    
    if (state.currentScreen !== 'lockscreen' && uv.x > 0.82 && uv.x < 0.90 && uv.y > 0.10 && uv.y < 0.20) {
        console.log("Power button clicked!");
        playSound('power_off');
        material.uniforms.tDiffuse.value = texture;
        state.currentScreen = 'lockscreen';
        
        // Reset State
        state.failureCount = 0;
        
        // Reset UI
        clockElement.style.display = 'block';
        passwordInput.disabled = false;
        passwordInput.value = '';
        passwordInput.style.display = 'block';
        passwordInput.focus();
        passwordDisplay.innerHTML = '';
        passwordDisplay.style.display = 'flex';
        passwordLabel.style.display = 'block';
        adminPanel.style.display = 'none';
        
        return true; // Use this to indicate the click was handled
    }
    return false;
}
