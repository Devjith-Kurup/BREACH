export const vertexShader = `
varying vec2 vUv;
void main(){
    vUv = uv;
    gl_Position = vec4(position,1.0);
}
`;

export const fragmentShader = `
uniform sampler2D tDiffuse;
uniform float time;
uniform float uIsLockscreen;
uniform float uIsTimedOut;
uniform float uShake;
varying vec2 vUv;

void main(){

    vec2 uv = vUv;

    /* Screen Shake (only when uShake > 0) */
    uv.x += (sin(time * 100.0) * 0.005) * uShake;

    /* CRT barrel distortion */
    vec2 center = uv - 0.5;
    float dist = dot(center,center);
    uv += center * dist * 0.3;

    /* Glitch effect */
    if (uIsTimedOut > 0.5) {
            float glitchTime = time * 10.0;
            float noise = fract(sin(dot(vec2(floor(uv.y * 20.0), floor(glitchTime)), vec2(12.9898, 78.233))) * 43758.5453);
            if (noise > 0.98) {
                uv.x += (fract(sin(glitchTime) * 43758.5453) - 0.5) * 0.03;
            }
    }

    /* chromatic aberration */
    float aberration = 0.002;
    if (uIsTimedOut > 0.5) {
        aberration = 0.003 + 0.002 * sin(time * 10.0);
    }

    float r = texture2D(tDiffuse, uv + vec2(aberration,0)).r;
    float g = texture2D(tDiffuse, uv).g;
    float b = texture2D(tDiffuse, uv - vec2(aberration,0)).b;

    vec3 color = vec3(r,g,b);

    /* scanlines */
    float scan = sin(uv.y*800.0)*0.04;
    color -= scan;

    /* vignette */
    float vig = smoothstep(0.8,0.2,length(vUv-0.5));
    color *= vig;

    /* flicker */
    color *= 1.0 + sin(time*40.0)*0.01;

    /* Red light glow on lockscreen */
    if (uIsLockscreen > 0.5) {
        float distToLight = distance(uv, vec2(0.88, 0.90));
        float glow = 1.0 - smoothstep(0.0, 0.04, distToLight);
        glow *= 0.4 + 0.2 * sin(time * 6.0);
        color += vec3(glow, 0.0, 0.0);

        /* Orange balls glow */
        vec3 tColor = texture2D(tDiffuse, uv).rgb;
        // Orange is high Red, medium Green, low Blue
        float isOrange = smoothstep(0.6, 1.0, tColor.r) * smoothstep(0.2, 0.55, tColor.g) * (1.0 - smoothstep(0.6, 1.0, tColor.g)) * (1.0 - smoothstep(0.1, 0.4, tColor.b));
        float orangePulse = 0.8 + 0.4 * sin(time * 4.0);
        // Add orange glow (Red + partial Green)
        color += vec3(isOrange * orangePulse * 1.5, isOrange * orangePulse * 0.2, 0.0);
    }

    gl_FragColor = vec4(color,1.0);
}
`;
