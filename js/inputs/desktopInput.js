import { state } from '../state.js';
import { material } from '../scene.js';
import { adminPanel } from '../elements.js';
import { 
    desktopTexture, desktop2Texture,
    terminalTexture, textFileTexture, folderGreenTexture, folderRedTexture,
    folderYellowTexture, pcTexture, pcLockedTexture
} from '../assets.js';
import { playSound, playJimboSound } from '../audio.js';

export function handleDesktopClick(uv) {
    // --- PC Unlocked Check Logic Helper ---
    // Actually this logic is simpler here since we just switch textures based on state

    if (state.currentScreen === 'desktop' || state.currentScreen === 'desktop2') {
        if (state.currentScreen === 'desktop' && uv.x > 0.80 && uv.x < 0.90 && uv.y > 0.50 && uv.y < 0.58) {
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
        }
        else if (uv.x > col2XMin && uv.x < col2XMax && uv.y > row4YMin && uv.y < row4YMax - 0.02) {
            playJimboSound();
        }
        else if (uv.x > col2XMin && uv.x < col2XMax && 
                ((uv.y > row1YMin && uv.y < row1YMax - 0.03) || 
                 (uv.y > row2YMin && uv.y < row2YMax - 0.03))) {
            playSound('open');
            material.uniforms.tDiffuse.value = textFileTexture;
            state.currentScreen = 'textfile';
        }
        else if (uv.x > col1XMin && uv.x < col1XMax && uv.y > row1YMin - 0.02 && uv.y < row1YMax - 0.04) {
            playSound('open');
            if (state.isPcUnlocked) {
                material.uniforms.tDiffuse.value = pcTexture;
                state.currentScreen = 'pc';
            } else {
                material.uniforms.tDiffuse.value = pcLockedTexture;
                state.currentScreen = 'pclocked';
                adminPanel.style.display = 'block';
            }
        }
        else if (uv.x > col1XMin && uv.x < col1XMax && uv.y > row2YMin && uv.y < row2YMax - 0.02) {
            playSound('open');
            material.uniforms.tDiffuse.value = folderYellowTexture;
            state.currentScreen = 'folder';
        }
        else if (uv.x > col1XMin && uv.x < col1XMax && uv.y > row3YMin && uv.y < row3YMax - 0.02) {
            playSound('open');
            material.uniforms.tDiffuse.value = folderGreenTexture;
            state.currentScreen = 'folder';
        }
        else if (uv.x > col1XMin && uv.x < col1XMax && uv.y > row4YMin && uv.y < row4YMax - 0.02) {
            playSound('open');
            material.uniforms.tDiffuse.value = folderRedTexture;
            state.currentScreen = 'folder';
        }

    } else if (['terminal','textfile','folder','pc','pclocked'].includes(state.currentScreen)) {
        const closeArea = { xMin: 0.82, xMax: 0.87, yMin: 0.86, yMax: 0.92 };

        if (uv.x > closeArea.xMin && uv.x < closeArea.xMax && uv.y > closeArea.yMin && uv.y < closeArea.yMax) {
            playSound('close');
            if (state.hasClosedMiniWindow) {
                material.uniforms.tDiffuse.value = desktop2Texture;
                state.currentScreen = 'desktop2';
            } else {
                material.uniforms.tDiffuse.value = desktopTexture;
                state.currentScreen = 'desktop';
            }
            adminPanel.style.display = 'none';
        }
    }
}
