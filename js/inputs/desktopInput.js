import { state } from '../state.js';
import { material } from '../scene.js';
import { adminPanel, passwordInput, passwordDisplay, passwordLabel, networkTextElement, terminalInput, textContent } from '../elements.js';
import { 
    desktopTexture, desktop2Texture,
    terminalTexture, textFileTexture, folderGreenTexture, folderGreenLockedTexture, folderRedTexture, folderRedLockedTexture,
    folderYellowTexture, folderYellowLockedTexture, pcTexture, pc2Texture, pcLockedTexture, networkTexture, network2Texture
} from '../assets.js';
import { playSound, playJimboSound } from '../audio.js';

const networkContent = `NETWORK =>
[=========================] 100%

> CONNECTION ESTABLISHED
> IP: 192.168.0.105 (LOCAL)

NODES:
- A8F2 (OFFLINE)
- B2C1 (ONLINE)
- X9E3 (UNKNOWN)

> TRAFFIC MONITORED
> FIREWALL: COMPROMISED

> WARNING: UNSTABLE
> AUTO-TERMINATION FAILED

> CONTROL INTERFACE NOT FOUND
`;

const networkDisconnectedContent = ` NETWORK =>
> CONNECTION LOST
> SIGNAL TERMINATED

> TRAFFIC: 0 KB/s
> TRACKING INTERRUPTED`;

let networkTypingInterval = null;

function startNetworkTyping() {
    stopNetworkTyping();
    networkTextElement.style.display = 'block';
    networkTextElement.textContent = '';
    
    const contentToType = state.isDisconnected ? networkDisconnectedContent : networkContent;

    let index = 0;
    networkTypingInterval = setInterval(() => {
        if (index < contentToType.length) {
            const char = contentToType.charAt(index);
            networkTextElement.textContent += char;
            index++;
            if (char !== ' ' && char !== '\n' && index % 3 === 0) {
                 playSound('type');
            }
        } else {
             clearInterval(networkTypingInterval);
             networkTypingInterval = null;
        }
    }, 30);
}

export function stopNetworkTyping() {
    if (networkTypingInterval) {
        clearInterval(networkTypingInterval);
        networkTypingInterval = null;
    }
    networkTextElement.style.display = 'none';
    networkTextElement.textContent = '';
}

window.disconnect = () => {
    playSound('disconnect');
    console.log("Disconnecting...");
    state.isDisconnected = true;
    if (state.currentScreen === 'pc') {
         material.uniforms.tDiffuse.value = pc2Texture;
    } else if (state.currentScreen === 'network') {
         material.uniforms.tDiffuse.value = network2Texture;
         startNetworkTyping();
    }
    console.log("disconnected from the network");
};

window.connect = () => {
    playSound('connect');
    console.log("Connecting...");
    state.isDisconnected = false;
    if (state.currentScreen === 'pc') {
         material.uniforms.tDiffuse.value = pcTexture;
    } else if (state.currentScreen === 'network') {
         material.uniforms.tDiffuse.value = networkTexture;
         startNetworkTyping();
    }
    console.log("connected to the network");
};

export function handleDesktopClick(uv) {
    
    

    if (state.currentScreen === 'desktop' || state.currentScreen === 'desktop2') {
        if (state.currentScreen === 'desktop' && uv.x > 0.80 && uv.x < 0.88 && uv.y > 0.55 && uv.y < 0.60) {
            playSound('close');
            state.hasClosedMiniWindow = true;
            material.uniforms.tDiffuse.value = desktop2Texture;
            state.currentScreen = 'desktop2';
            return;
        }

        const col1XMin = 0.12, col1XMax = 0.20;
        const col2XMin = 0.26, col2XMax = 0.34;
        const row1YMin = 0.78, row1YMax = 0.88; 
        const row2YMin = 0.65, row2YMax = 0.75;
        const row3YMin = 0.53, row3YMax = 0.63;
        const row4YMin = 0.41, row4YMax = 0.51;

        if (uv.x > col2XMin && uv.x < col2XMax && uv.y > row3YMin && uv.y < row3YMax - 0.02) {
            playSound('open');
            material.uniforms.tDiffuse.value = terminalTexture;
            state.currentScreen = 'terminal';
            terminalInput.focus();
        }
        else if (uv.x > col2XMin && uv.x < col2XMax && uv.y > row4YMin && uv.y < row4YMax - 0.02) {
            playJimboSound();
        }
        else if (uv.x > col2XMin && uv.x < col2XMax && uv.y > row1YMin && uv.y < row1YMax - 0.03) {
            playSound('open');
            material.uniforms.tDiffuse.value = textFileTexture;
            state.currentScreen = 'textfile';
            textContent.textContent = "PROJECT BREACH\n\n System Log: 2045-05-12\n Access Granted. System Integrity 98%.\n Remember to update the firewall protocols.\n Unauthorized access detected in sector 7.";
            textContent.classList.add('puzzle-mode');
        }
        else if (uv.x > col2XMin && uv.x < col2XMax && uv.y > row2YMin && uv.y < row2YMax - 0.03) {
            playSound('open');
            material.uniforms.tDiffuse.value = textFileTexture;
            state.currentScreen = 'textfile';
            textContent.innerHTML = 'I hid everything across the system.\nThree locks. Three folders.\n\n<span style="text-shadow: 2px 2px #ffff00">\nThe system has a heartbeat.\nFind where it breathes.\nThe vitals hold the first key.</span>\n\n<span style="text-shadow: 2px 2px #00ff00">\nI left a trace in the logs.\nA date I will never forget.\nThe terminal remembers.</span>\n\n<span style="text-shadow: 2px 2px #ff0000">\nThe network went dark.\nCount the silence.\nThen check what remains.</span>';
            textContent.classList.remove('puzzle-mode');
        }
        else if (uv.x > col1XMin && uv.x < col1XMax && uv.y > row1YMin - 0.02 && uv.y < row1YMax - 0.04) {
            playSound('open');
            if (state.isPcUnlocked) {
                material.uniforms.tDiffuse.value = state.isDisconnected ? pc2Texture : pcTexture;
                state.currentScreen = 'pc';
            } else {
                material.uniforms.tDiffuse.value = pcLockedTexture;
                state.currentScreen = 'pclocked';
                adminPanel.style.display = 'block';
            }
        }
        else if (uv.x > col1XMin && uv.x < col1XMax && uv.y > row2YMin && uv.y < row2YMax - 0.02) {
            playSound('open');
            if (state.isFolderYellowUnlocked) {
                material.uniforms.tDiffuse.value = folderYellowTexture;
                state.currentScreen = 'folder';
            } else {
                material.uniforms.tDiffuse.value = folderYellowLockedTexture;
                state.currentScreen = 'folderYellowLocked';
                state.failureCount = 0;
                
                
                passwordInput.style.display = 'block';
                passwordInput.value = '';
                passwordInput.disabled = false;
                passwordInput.focus();

                passwordDisplay.innerHTML = '';
                passwordDisplay.style.display = 'flex';
                passwordDisplay.style.opacity = '1';

                passwordLabel.style.display = 'block';
                passwordLabel.style.opacity = '1';
                passwordLabel.textContent = 'ENTER THE PASSWORD';
            }
        }
        else if (uv.x > col1XMin && uv.x < col1XMax && uv.y > row3YMin && uv.y < row3YMax - 0.02) {
            playSound('open');
            if (state.isFolderGreenUnlocked) {
                material.uniforms.tDiffuse.value = folderGreenTexture;
                state.currentScreen = 'folder';
            } else {
                material.uniforms.tDiffuse.value = folderGreenLockedTexture;
                state.currentScreen = 'folderGreenLocked';
                state.failureCount = 0;
                
                
                passwordInput.style.display = 'block';
                passwordInput.value = '';
                passwordInput.disabled = false;
                passwordInput.focus();

                passwordDisplay.innerHTML = '';
                passwordDisplay.style.display = 'flex';
                passwordDisplay.style.opacity = '1';

                passwordLabel.style.display = 'block';
                passwordLabel.style.opacity = '1';
                passwordLabel.textContent = 'ENTER THE PASSWORD';
            }
        }
        else if (uv.x > col1XMin && uv.x < col1XMax && uv.y > row4YMin && uv.y < row4YMax - 0.02) {
            playSound('open');
            if (state.isFolderRedUnlocked) {
                material.uniforms.tDiffuse.value = folderRedTexture;
                state.currentScreen = 'folder';
            } else {
                material.uniforms.tDiffuse.value = folderRedLockedTexture;
                state.currentScreen = 'folderRedLocked';
                state.failureCount = 0; 
                
                
                passwordInput.style.display = 'block';
                passwordInput.value = '';
                passwordInput.disabled = false;
                passwordInput.focus();

                passwordDisplay.innerHTML = '';
                passwordDisplay.style.display = 'flex';
                passwordDisplay.style.opacity = '1';

                passwordLabel.style.display = 'block';
                passwordLabel.style.opacity = '1';
                passwordLabel.textContent = 'ENTER THE PASSWORD';
            }
        }

    } else if (['terminal','textfile','folder','folderRedLocked','folderGreenLocked','folderYellowLocked','pc','pclocked'].includes(state.currentScreen)) {
        const closeArea = { xMin: 0.82, xMax: 0.87, yMin: 0.86, yMax: 0.92 };

        if (uv.x > closeArea.xMin && uv.x < closeArea.xMax && uv.y > closeArea.yMin && uv.y < closeArea.yMax) {
            playSound('close');

            if (state.currentScreen === 'folderRedLocked' || state.currentScreen === 'folderGreenLocked' || state.currentScreen === 'folderYellowLocked') {
                passwordInput.style.display = 'none';
                passwordDisplay.style.display = 'none';
                passwordLabel.style.display = 'none';
                passwordInput.value = '';
                passwordDisplay.innerHTML = '';
                passwordInput.blur();
            }

            if (state.hasClosedMiniWindow) {
                material.uniforms.tDiffuse.value = desktop2Texture;
                state.currentScreen = 'desktop2';
            } else {
                material.uniforms.tDiffuse.value = desktopTexture;
                state.currentScreen = 'desktop';
            }
            adminPanel.style.display = 'none';
        }

        if (state.currentScreen === 'pc') {
            const col1XMin = 0.12, col1XMax = 0.20;
            const row1YMin = 0.78, row1YMax = 0.88;
            
            
            if (uv.x > col1XMin && uv.x < col1XMax + 0.08 && uv.y > row1YMin - 0.08 && uv.y < row1YMax - 0.04) {
                 playSound('open');
                 material.uniforms.tDiffuse.value = state.isDisconnected ? network2Texture : networkTexture;
                 state.currentScreen = 'network';
                 startNetworkTyping();
            }
        }
    } else if (state.currentScreen === 'network') {
        
        const closeArea = { xMin: 0.82, xMax: 0.87, yMin: 0.77, yMax: 0.83 };
        if (uv.x > closeArea.xMin && uv.x < closeArea.xMax && uv.y > closeArea.yMin && uv.y < closeArea.yMax) {
            playSound('close');
            material.uniforms.tDiffuse.value = state.isDisconnected ? pc2Texture : pcTexture;
            state.currentScreen = 'pc';
            stopNetworkTyping();
        }
    }
}
