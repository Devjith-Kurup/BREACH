import * as THREE from 'three';

const SETTINGS_SYSTEM_ID = '48F2';
const SETTINGS_BUILD_ID = '23.9.1';

export const settingsTexture = new THREE.TextureLoader().load(
	'assets/settings.png',
	(loadedTexture) => {
		const sourceImage = loadedTexture.image;
		if (!sourceImage || typeof document === 'undefined') {
			return;
		}

		const canvas = document.createElement('canvas');
		const width = Number(sourceImage.width) || 1920;
		const height = Number(sourceImage.height) || 1080;
		canvas.width = width;
		canvas.height = height;

		const ctx = canvas.getContext('2d');
		if (!ctx) {
			return;
		}

		ctx.drawImage(sourceImage, 0, 0, width, height);

		const headingSize = Math.max(26, Math.round(width * 0.02));
		const valueSize = Math.max(34, Math.round(width * 0.027));
		const left = Math.round(width * 0.17);
		const top = Math.round(height * 0.25);
		const lineGap = Math.round(height * 0.085);

		ctx.fillStyle = '#000000';
		ctx.shadowColor = 'transparent';
		ctx.shadowBlur = 0;

		ctx.font = `600 ${headingSize}px "Courier New", monospace`;
		ctx.fillText('SYSTEM ID', left, top);

		ctx.font = `700 ${valueSize}px "Courier New", monospace`;
		ctx.fillText(SETTINGS_SYSTEM_ID, left, top + Math.round(height * 0.037));

		const secondRow = top + lineGap;
		ctx.font = `600 ${headingSize}px "Courier New", monospace`;
		ctx.fillText('BUILD VERSION', left, secondRow);

		ctx.font = `700 ${valueSize}px "Courier New", monospace`;
		ctx.fillText(SETTINGS_BUILD_ID, left, secondRow + Math.round(height * 0.037));

		loadedTexture.image = canvas;
		loadedTexture.needsUpdate = true;
	}
);

export const texture = new THREE.TextureLoader().load("assets/lockscreen.png");
export const desktopTexture = new THREE.TextureLoader().load("assets/screen.png");
export const desktop2Texture = new THREE.TextureLoader().load("assets/screen2.png");
export const timedOutTexture = new THREE.TextureLoader().load("assets/timedOut.png");
export const terminalTexture = new THREE.TextureLoader().load("assets/terminal.png");
export const textFileTexture = new THREE.TextureLoader().load("assets/textfile.png");
export const folderGreenTexture = new THREE.TextureLoader().load("assets/folderGreen.png");
export const folderGreenLockedTexture = new THREE.TextureLoader().load("assets/folderGreenlocked.png");
export const folderRedTexture = new THREE.TextureLoader().load("assets/folderRed.png");
export const folderRedLockedTexture = new THREE.TextureLoader().load("assets/folderRedlocked.png");
export const folderYellowTexture = new THREE.TextureLoader().load("assets/folderYellow.png");
export const folderYellowLockedTexture = new THREE.TextureLoader().load("assets/folderYellowlocked.png");
export const pcTexture = new THREE.TextureLoader().load("assets/pc.png");
export const pc2Texture = new THREE.TextureLoader().load("assets/pc2.png");
export const pcLockedTexture = new THREE.TextureLoader().load("assets/pcLocked.png");
export const networkTexture = new THREE.TextureLoader().load("assets/network.png");
export const network2Texture = new THREE.TextureLoader().load("assets/network2.png");
