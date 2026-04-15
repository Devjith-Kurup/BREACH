import { scene, camera, renderer, material } from './scene.js';
import { state } from './state.js';
import { textContent, miniWindowText, pcLabels, clockElement, networkMenuLabel, terminalContent } from './elements.js';
import { setupInputs } from './input.js';
import { initIntro } from './intro.js';
import { setupTerminal } from './terminal.js';
import { ensurePlayerIdentity } from './leaderboard.js';

function generateLockscreenPassword() {
    const password = Math.floor(1000 + Math.random() * 9000).toString();
    state.lockscreenPassword = password;

    // Add to DOM for devtools visibility
    const debugElement = document.createElement('div');
    debugElement.id = 'debug-lockscreen-password';
    debugElement.style.display = 'none';
    debugElement.textContent = `Lockscreen Password: ${password}`;
    document.body.appendChild(debugElement);
}

generateLockscreenPassword();

ensurePlayerIdentity();
initIntro();
setupInputs();
setupTerminal();

function updateClock() {
    const now = new Date();
    let hours = now.getHours();
    const isAm = hours < 12;
    hours = hours % 12;
    hours = hours ? hours : 12;
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const ampm = isAm ? 'AM' : 'PM';
    clockElement.textContent = `${hours}:${minutes} ${ampm}`;
}
setInterval(updateClock, 1000);
updateClock();

function animate() {
    requestAnimationFrame(animate);

    material.uniforms.time.value += 0.01;
    material.uniforms.uIsLockscreen.value = (state.currentScreen === 'lockscreen' || state.currentScreen === 'timedOut') ? 1.0 : 0.0;
    material.uniforms.uIsTimedOut.value = (state.currentScreen === 'timedOut') ? 1.0 : 0.0;
    
    textContent.style.display = (state.currentScreen === 'textfile') ? 'block' : 'none';
    miniWindowText.style.display = (state.currentScreen === 'desktop') ? 'block' : 'none';
    pcLabels.style.display = (state.currentScreen === 'pc') ? 'block' : 'none';
    if (networkMenuLabel) networkMenuLabel.style.display = (state.currentScreen === 'network') ? 'block' : 'none';
    if (terminalContent) terminalContent.style.display = (state.currentScreen === 'terminal') ? 'block' : 'none';

    renderer.render(scene, camera);
}

animate();
