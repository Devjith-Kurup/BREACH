// Orchestrator for all inputs
import { camera, renderer, mesh } from './scene.js';
import { state } from './state.js';
import { passwordInput, cursor } from './elements.js';
import { resumeAudio } from './audio.js';
import { setupIntroInput } from './inputs/introInput.js';
import { setupLockscreenInput } from './inputs/lockscreenInput.js';
import { handleDesktopClick } from './inputs/desktopInput.js';
import { handleGlobalClick } from './inputs/globalInput.js';

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

export function setupInputs() {
    
    // 1. SETUP DOM LISTENERS (Intro & Lockscreen & Password)
    setupIntroInput();
    setupLockscreenInput();

    // 2. SETUP RAYCASTER (3D Scene Interactions)
    
    // Custom Cursor Logic
    document.addEventListener('mousemove', (e) => {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
    });

    window.addEventListener('click', (event) => {
        // Intro is handled by its own DOM listener in setupIntroInput
        if (state.currentScreen === 'intro') return;

        // Get mouse position relative to canvas
        const rect = renderer.domElement.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);

        // Keep password focused if on lockscreen
        if (state.currentScreen === 'lockscreen' && !passwordInput.disabled) {
            passwordInput.focus();
        }

        const intersects = raycaster.intersectObject(mesh);

        if (intersects.length > 0) {
            const uv = intersects[0].uv;
            console.log(`Clicked at x: ${uv.x.toFixed(2)}, y: ${uv.y.toFixed(2)}`);

            // 1. Check Global Inputs first (Power Button takes precedence)
            if (handleGlobalClick(uv)) return;

            // 2. Check Desktop Inputs (Icons, Windows)
            handleDesktopClick(uv);
        }
    });

    // 3. AUDIO RESUME HANDLERS
    window.addEventListener('click', resumeAudio);
    window.addEventListener('keydown', resumeAudio);
    window.addEventListener('mousemove', resumeAudio);
    window.addEventListener('focus', resumeAudio);
}
