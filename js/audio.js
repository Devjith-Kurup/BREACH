const audioCtx = new (window.AudioContext || window.webkitAudioContext)({ latencyHint: 'interactive' });

export function resumeAudio() {
    if (audioCtx.state === 'suspended') {
        audioCtx.resume().catch(e => console.log('Auto-play prevented by browser', e));
    }
}

let deadSoundOscillator = null;
let deadSoundGain = null;

export function startDeadSound() {
    if (deadSoundOscillator) return;

    deadSoundOscillator = audioCtx.createOscillator();
    deadSoundGain = audioCtx.createGain();

    deadSoundOscillator.type = 'sine';
    deadSoundOscillator.frequency.setValueAtTime(2000, audioCtx.currentTime);

    deadSoundGain.gain.setValueAtTime(0, audioCtx.currentTime);
    deadSoundGain.gain.linearRampToValueAtTime(0.005, audioCtx.currentTime + 2.0); // Slow fade in, very quiet

    deadSoundOscillator.connect(deadSoundGain);
    deadSoundGain.connect(audioCtx.destination);

    deadSoundOscillator.start();
}

export function playJimboSound() {
    const audio = new Audio('assets/jimbo.mp3');
    audio.play().catch(e => console.error("Error playing jimbo sound:", e));
}

export function playSound(type) {
    if (audioCtx.state === 'suspended') {
        audioCtx.resume().catch(() => {});
    }
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    const now = audioCtx.currentTime;

    if (type === 'open') {
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(600, now);
        oscillator.frequency.exponentialRampToValueAtTime(1200, now + 0.1);
        gainNode.gain.setValueAtTime(0.1, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        oscillator.start(now);
        oscillator.stop(now + 0.1);
    } else if (type === 'close') {
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(1200, now);
        oscillator.frequency.exponentialRampToValueAtTime(600, now + 0.1);
        gainNode.gain.setValueAtTime(0.1, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        oscillator.start(now);
        oscillator.stop(now + 0.1);
    } else if (type === 'type') {
        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(800, now);
        gainNode.gain.setValueAtTime(0.05, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
        oscillator.start(now);
        oscillator.stop(now + 0.03);
    } else if (type === 'delete') {
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(300, now);
        gainNode.gain.setValueAtTime(0.05, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        oscillator.start(now);
        oscillator.stop(now + 0.05);
    } else if (type === 'success') {
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(400, now);
        oscillator.frequency.setValueAtTime(800, now + 0.1);
        gainNode.gain.setValueAtTime(0.05, now);
        gainNode.gain.linearRampToValueAtTime(0.05, now + 0.1);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        oscillator.start(now);
        oscillator.stop(now + 0.3);
    } else if (type === 'power_off') {
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(200, now);
        oscillator.frequency.exponentialRampToValueAtTime(50, now + 0.4);
        gainNode.gain.setValueAtTime(0.2, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        oscillator.start(now);
        oscillator.stop(now + 0.4);
    } else if (type === 'error') { 
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(150, now);
        oscillator.frequency.linearRampToValueAtTime(100, now + 0.1);
        gainNode.gain.setValueAtTime(0.2, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        oscillator.start(now);
        oscillator.stop(now + 0.15);
    } else if (type === 'access_granted') {
        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(600, now);
        oscillator.frequency.linearRampToValueAtTime(1200, now + 0.1);
        gainNode.gain.setValueAtTime(0.1, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        oscillator.start(now);
        oscillator.stop(now + 0.3);
    } else if (type === 'glitch') {
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(100, now);
        oscillator.frequency.linearRampToValueAtTime(800, now + 0.1);
        oscillator.frequency.linearRampToValueAtTime(50, now + 0.2);
        oscillator.frequency.linearRampToValueAtTime(400, now + 0.3);

        gainNode.gain.setValueAtTime(0.2, now);
        gainNode.gain.linearRampToValueAtTime(0.0, now + 0.05);
        gainNode.gain.linearRampToValueAtTime(0.2, now + 0.1);
        gainNode.gain.linearRampToValueAtTime(0.0, now + 0.15);
        gainNode.gain.linearRampToValueAtTime(0.2, now + 0.2);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

        oscillator.start(now);
        oscillator.stop(now + 0.5);
    }
}
