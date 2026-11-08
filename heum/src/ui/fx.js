// Heum — les effets : messages, nombres qui s'envolent, petits sons.
import { on } from '../core/bus.js';
import { ico } from './kit.js';

let toastBox;
export function toast(text) {
    const t = document.createElement('div');
    t.className = 'toast';
    t.textContent = text;
    toastBox.appendChild(t);
    setTimeout(() => t.classList.add('out'), 2600);
    setTimeout(() => t.remove(), 3100);
}
export function floatAt(el, html, cls = '') {
    if (!el || !el.getBoundingClientRect) return;
    const r = el.getBoundingClientRect();
    const f = document.createElement('div');
    f.className = 'float ' + cls;
    f.innerHTML = html;
    f.style.left = r.left + r.width / 2 + 'px';
    f.style.top = r.top + r.height / 3 + 'px';
    document.body.appendChild(f);
    setTimeout(() => f.remove(), 1200);
}
export const floatItems = (el, got) => floatAt(el, got.map(([id, n]) => `+${n}${ico(id)}`).join(' '));

// des sons faits main, très courts (WebAudio), activés au premier appui
let ctx = null;
const NOTES = {
    plant: [[330, 0.06]],
    harvest: [
        [440, 0.06],
        [660, 0.08],
    ],
    mutant: [
        [520, 0.08],
        [780, 0.08],
        [1040, 0.12],
    ],
    waste: [[160, 0.15]],
    uproot: [
        [220, 0.08],
        [180, 0.08],
    ],
    coin: [
        [880, 0.05],
        [1320, 0.07],
    ],
    collect: [
        [600, 0.06],
        [800, 0.06],
    ],
    scrap: [
        [260, 0.04],
        [200, 0.05],
    ],
    machine: [
        [300, 0.05],
        [360, 0.05],
    ],
    toxic: [
        [200, 0.08],
        [300, 0.08],
        [240, 0.1],
    ],
    level: [
        [523, 0.1],
        [659, 0.1],
        [784, 0.16],
    ],
    error: [[150, 0.1]],
    build: [
        [392, 0.06],
        [523, 0.08],
    ],
    animal: [
        [700, 0.05],
        [900, 0.06],
    ],
};
function play(name) {
    const seq = NOTES[name];
    if (!seq || !ctx) return;
    let t = ctx.currentTime;
    for (const [f, d] of seq) {
        const o = ctx.createOscillator(),
            g = ctx.createGain();
        o.type = name === 'waste' || name === 'error' ? 'sawtooth' : 'triangle';
        o.frequency.value = f;
        g.gain.setValueAtTime(0.07, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + d);
        o.connect(g).connect(ctx.destination);
        o.start(t);
        o.stop(t + d);
        t += d * 0.9;
    }
}
export function setupFx() {
    toastBox = document.getElementById('toasts');
    on('toast', ({ text }) => toast(text));
    on('sfx', name => {
        try {
            play(name);
        } catch {}
    });
    on('buzz', ms => navigator.vibrate && navigator.vibrate(ms));
    const unlock = () => {
        try {
            ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
            if (ctx.state === 'suspended') ctx.resume();
        } catch {}
    };
    document.addEventListener('pointerdown', unlock, { once: false, passive: true });
}
