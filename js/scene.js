import { gameContainer } from './elements.js';
import { texture } from './assets.js';
import { fragmentShader, vertexShader } from './shader.js';

export const scene = new THREE.Scene();
export const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

export const renderer = new THREE.WebGLRenderer();
renderer.setSize(660, 660);

gameContainer.appendChild(renderer.domElement);

export const material = new THREE.ShaderMaterial({
    uniforms: {
        tDiffuse: { value: texture },
        time: { value: 0 },
        uIsLockscreen: { value: 1.0 },
        uIsTimedOut: { value: 0.0 },
        uShake: { value: 0.0 }
    },
    vertexShader: vertexShader,
    fragmentShader: fragmentShader
});

const geometry = new THREE.PlaneGeometry(2, 2);
export const mesh = new THREE.Mesh(geometry, material);

scene.add(mesh);
