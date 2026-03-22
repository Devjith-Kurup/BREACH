import { camera, renderer, mesh } from './scene.js';
import { state } from './state.js';
import { passwordInput, cursor, terminalInput } from './elements.js';
import { resumeAudio } from './audio.js';
import { setupIntroInput } from './inputs/introInput.js';
import { setupLockscreenInput } from './inputs/lockscreenInput.js';
import { handleDesktopClick } from './inputs/desktopInput.js';
import { handleGlobalClick } from './inputs/globalInput.js';
import * as THREE from 'three';

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

export function setupInputs() {
    
    setupIntroInput();
    setupLockscreenInput();

    
    document.addEventListener('mousemove', (e) => {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
    });

    document.addEventListener('mousedown', () => cursor.classList.add('clicked'));
    document.addEventListener('mouseup', () => cursor.classList.remove('clicked'));
    document.addEventListener('mouseleave', () => cursor.classList.remove('clicked'));

    window.addEventListener('click', (event) => {
        if (state.currentScreen === 'intro') return;

        const rect = renderer.domElement.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);

        if (state.currentScreen === 'lockscreen' && !passwordInput.disabled) {
            passwordInput.focus();
        }

        if (state.currentScreen === 'terminal') {
            terminalInput.focus();
        }

        const intersects = raycaster.intersectObject(mesh);

        if (intersects.length > 0) {
            const uv = intersects[0].uv;

            if (handleGlobalClick(uv)) return;

            handleDesktopClick(uv);
        }
    });

    window.addEventListener('click', resumeAudio, { once: true });
    window.addEventListener('keydown', resumeAudio, { once: true });
}
