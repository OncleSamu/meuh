// Le son : effets synthétisés et musique générative (une ambiance par saison).
import { state } from '../core/state.js';
import { on } from '../core/bus.js';
import { season } from '../systems/world.js';

export const SoundEngine = (() => {
    let ctx = null,
        master,
        sfxBus,
        musicBus,
        noiseBuf,
        timer = null,
        nextT = 0,
        step = 0,
        melIdx = 5;
    const midi = n => 440 * Math.pow(2, (n - 69) / 12);
    // Une ambiance par saison : tonalité, accords, tempo et timbre de la mélodie
    const penta = (root, steps) => {
        const out = [];
        for (let n = root; n <= root + 26; n++) if (steps.includes((n - root) % 12)) out.push(n);
        return out;
    };
    const STYLES = {
        printemps: {
            root: 60,
            scale: [0, 2, 4, 7, 9],
            chords: [
                [0, 4, 7],
                [9, 12, 16],
                [5, 9, 12],
                [7, 11, 14],
            ],
            bpm: 84,
            lead: 'triangle',
            busy: 0.62,
        },
        ete: {
            root: 67,
            scale: [0, 2, 4, 7, 9],
            chords: [
                [0, 4, 7],
                [5, 9, 12],
                [7, 11, 14],
                [0, 4, 7],
            ],
            bpm: 100,
            lead: 'square',
            busy: 0.7,
        },
        automne: {
            root: 57,
            scale: [0, 3, 5, 7, 10],
            chords: [
                [0, 3, 7],
                [8, 12, 15],
                [3, 7, 10],
                [10, 14, 17],
            ],
            bpm: 76,
            lead: 'triangle',
            busy: 0.5,
        },
        hiver: {
            root: 62,
            scale: [0, 2, 4, 7, 9],
            chords: [
                [0, 3, 7],
                [10, 14, 17],
                [3, 7, 10],
                [5, 9, 12],
            ],
            bpm: 66,
            lead: 'sine',
            busy: 0.42,
        },
    };
    let style = STYLES.printemps,
        PENTA = penta(style.root, style.scale),
        EIGHTH = 60 / style.bpm / 2;
    function pickStyle() {
        const id = season().id;
        const s = STYLES[id] || STYLES.printemps;
        if (s === style) return;
        style = s;
        PENTA = penta(s.root, s.scale);
        EIGHTH = 60 / s.bpm / 2;
        melIdx = Math.min(melIdx, PENTA.length - 1);
    }
    const vol = k => (state.settings[k] === undefined ? 0.8 : state.settings[k]);

    function init() {
        if (ctx) return true;
        try {
            ctx = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            return false;
        }
        master = ctx.createGain();
        master.gain.value = 0.8;
        master.connect(ctx.destination);
        sfxBus = ctx.createGain();
        sfxBus.gain.value = state.settings.sfx ? vol('sfxVol') : 0;
        sfxBus.connect(master);
        musicBus = ctx.createGain();
        musicBus.gain.value = 0;
        musicBus.connect(master);
        noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 0.5, ctx.sampleRate);
        const d = noiseBuf.getChannelData(0);
        for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
        return true;
    }
    function tone(freq, t, dur, { type = 'sine', vol = 0.2, attack = 0.006, bus = sfxBus, glide = null } = {}) {
        const o = ctx.createOscillator(),
            g = ctx.createGain();
        o.type = type;
        o.frequency.setValueAtTime(freq, t);
        if (glide) o.frequency.exponentialRampToValueAtTime(glide, t + dur);
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(vol, t + attack);
        g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        o.connect(g);
        g.connect(bus);
        o.start(t);
        o.stop(t + dur + 0.05);
    }
    function noise(t, dur, { vol = 0.2, freq = 800, q = 1, type = 'lowpass' } = {}) {
        const s = ctx.createBufferSource();
        s.buffer = noiseBuf;
        const f = ctx.createBiquadFilter();
        f.type = type;
        f.frequency.value = freq;
        f.Q.value = q;
        const g = ctx.createGain();
        g.gain.setValueAtTime(vol, t);
        g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        s.connect(f);
        f.connect(g);
        g.connect(sfxBus);
        s.start(t);
        s.stop(t + dur + 0.02);
    }
    function play(name) {
        if (!ctx || !state.settings.sfx) return;
        const t = ctx.currentTime;
        switch (name) {
            case 'plow':
                noise(t, 0.13, { vol: 0.4, freq: 450 });
                tone(150, t, 0.1, { type: 'triangle', vol: 0.14, glide: 60 });
                break;
            case 'plant':
                tone(500, t, 0.12, { type: 'triangle', vol: 0.14, glide: 760 });
                break;
            case 'water':
                noise(t, 0.28, { vol: 0.14, freq: 2400, type: 'bandpass', q: 2 });
                tone(680, t, 0.16, { vol: 0.06, glide: 1150 });
                break;
            case 'harvest':
                tone(660, t, 0.12, { type: 'triangle', vol: 0.16 });
                tone(990, t + 0.07, 0.2, { type: 'triangle', vol: 0.14 });
                break;
            case 'coin':
                tone(1320 + Math.random() * 120, t, 0.09, { type: 'square', vol: 0.035 });
                tone(1980 + Math.random() * 120, t + 0.04, 0.18, { vol: 0.07 });
                break;
            case 'chop':
                noise(t, 0.09, { vol: 0.45, freq: 900, type: 'bandpass', q: 1.2 });
                tone(180, t, 0.08, { type: 'triangle', vol: 0.15, glide: 110 });
                break;
            case 'rock':
                noise(t, 0.08, { vol: 0.4, freq: 2600, type: 'bandpass', q: 3 });
                tone(1400, t, 0.05, { type: 'square', vol: 0.03, glide: 900 });
                break;
            case 'splash':
                noise(t, 0.35, { vol: 0.25, freq: 1200, type: 'bandpass', q: 0.8 });
                tone(300, t, 0.15, { vol: 0.05, glide: 700 });
                break;
            case 'reel':
                [600, 700, 800].forEach((f, i) => tone(f, t + i * 0.05, 0.06, { type: 'square', vol: 0.03 }));
                break;
            case 'pop':
                tone(880, t, 0.09, { vol: 0.07, glide: 1320 });
                break;
            case 'click':
                tone(440, t, 0.05, { type: 'triangle', vol: 0.08 });
                break;
            case 'error':
                tone(190, t, 0.16, { type: 'square', vol: 0.05, glide: 120 });
                break;
            case 'buy':
                tone(523, t, 0.1, { type: 'triangle', vol: 0.12 });
                tone(784, t + 0.08, 0.18, { type: 'triangle', vol: 0.12 });
                break;
            case 'feed':
                noise(t, 0.1, { vol: 0.2, freq: 1500, type: 'bandpass', q: 1.5 });
                tone(300, t + 0.05, 0.1, { type: 'triangle', vol: 0.1, glide: 420 });
                break;
            case 'machine':
                noise(t, 0.2, { vol: 0.15, freq: 300 });
                tone(220, t, 0.2, { type: 'sawtooth', vol: 0.03, glide: 330 });
                break;
            case 'level':
                [523, 659, 784, 1047, 1319, 1568].forEach((f, i) => tone(f, t + i * 0.085, 0.4, { type: 'triangle', vol: 0.13 }));
                break;
            case 'chicken':
            case 'quail':
                tone(900, t, 0.06, { type: 'square', vol: 0.04, glide: 1300 });
                tone(1000, t + 0.09, 0.07, { type: 'square', vol: 0.04, glide: 1400 });
                break;
            case 'sheep':
            case 'ewe':
                tone(420, t, 0.35, { type: 'sawtooth', vol: 0.04, glide: 380 });
                break;
            case 'cow':
                tone(160, t, 0.5, { type: 'sawtooth', vol: 0.05, glide: 120 });
                break;
            case 'pigeon':
                tone(300, t, 0.14, { type: 'sine', vol: 0.07, glide: 340 });
                tone(320, t + 0.17, 0.2, { type: 'sine', vol: 0.07, glide: 280 });
                break;
            case 'guinea':
                [0, 0.07, 0.14, 0.21].forEach(d => tone(1250, t + d, 0.05, { type: 'square', vol: 0.035, glide: 1500 }));
                break;
            case 'pheasant':
                tone(700, t, 0.1, { type: 'sawtooth', vol: 0.04, glide: 1100 });
                tone(1100, t + 0.14, 0.08, { type: 'square', vol: 0.04, glide: 900 });
                break;
            case 'ostrich':
                tone(90, t, 0.4, { type: 'sine', vol: 0.12, glide: 70 });
                tone(110, t + 0.45, 0.3, { type: 'sine', vol: 0.1, glide: 80 });
                break;
            case 'yak':
                tone(120, t, 0.35, { type: 'sawtooth', vol: 0.05, glide: 90 });
                tone(100, t + 0.2, 0.3, { type: 'sawtooth', vol: 0.04, glide: 80 });
                break;
            case 'bark':
                tone(520, t, 0.07, { type: 'square', vol: 0.05, glide: 300 });
                tone(560, t + 0.13, 0.08, { type: 'square', vol: 0.05, glide: 320 });
                break;
            case 'caw':
                tone(900, t, 0.16, { type: 'sawtooth', vol: 0.05, glide: 500 });
                tone(850, t + 0.2, 0.18, { type: 'sawtooth', vol: 0.05, glide: 450 });
                break;
            case 'horn':
                tone(392, t, 0.18, { type: 'square', vol: 0.05 });
                tone(392, t + 0.24, 0.3, { type: 'square', vol: 0.05 });
                tone(494, t + 0.24, 0.3, { type: 'square', vol: 0.03 });
                break;
            case 'thunder':
                noise(t, 1.6, { vol: 0.5, freq: 160 });
                noise(t + 0.1, 1.1, { vol: 0.25, freq: 420 });
                break;
            case 'load':
                noise(t, 0.12, { vol: 0.35, freq: 300 });
                tone(110, t, 0.14, { type: 'triangle', vol: 0.2, glide: 70 });
                break;
            case 'golden':
                [784, 988, 1175, 1568, 1976].forEach((f, i) => tone(f, t + i * 0.06, 0.3, { type: 'triangle', vol: 0.1 }));
                break;
            case 'duck':
                tone(520, t, 0.12, { type: 'square', vol: 0.05, glide: 300 });
                tone(500, t + 0.16, 0.12, { type: 'square', vol: 0.05, glide: 290 });
                break;
            case 'rabbit':
                tone(1400, t, 0.05, { vol: 0.05, glide: 1900 });
                tone(1500, t + 0.08, 0.05, { vol: 0.04, glide: 2000 });
                break;
            case 'goat':
            case 'mohairGoat':
                [0, 0.06, 0.12, 0.18, 0.24].forEach((d, i) => tone(i % 2 ? 340 : 380, t + d, 0.09, { type: 'sawtooth', vol: 0.035 }));
                break;
            case 'pig':
                noise(t, 0.18, { vol: 0.18, freq: 600, type: 'bandpass', q: 4 });
                tone(260, t, 0.16, { type: 'square', vol: 0.03, glide: 200 });
                break;
        }
    }
    function schedule() {
        while (nextT < ctx.currentTime + 0.4) {
            // la saison change l'ambiance au début de chaque cycle d'accords
            if (step % 32 === 0) pickStyle();
            const bar = Math.floor(step / 8) % 4,
                beat = step % 8,
                ch = style.chords[bar],
                root = style.root,
                bass = root - 24 - (root > 62 ? 12 : 0);
            if (beat === 0) {
                ch.forEach(n => tone(midi(root + n), nextT, EIGHTH * 8 * 0.98, { vol: 0.028, attack: 0.35, bus: musicBus }));
                tone(midi(bass + ch[0]), nextT, EIGHTH * 3.5, { type: 'triangle', vol: 0.1, bus: musicBus });
            }
            if (beat === 4) tone(midi(bass + 7 + ch[0]), nextT, EIGHTH * 3, { type: 'triangle', vol: 0.07, bus: musicBus });
            if (Math.random() < (beat % 2 === 0 ? style.busy : style.busy * 0.45)) {
                melIdx = Math.max(0, Math.min(PENTA.length - 1, melIdx + Math.round((Math.random() - 0.5) * 3.4)));
                if (beat === 0) {
                    // se pose sur une note de l'accord
                    let best = melIdx,
                        bd = 99;
                    PENTA.forEach((n, i) => {
                        if (ch.map(c => (root + c) % 12).includes(n % 12) && Math.abs(i - melIdx) < bd) {
                            bd = Math.abs(i - melIdx);
                            best = i;
                        }
                    });
                    melIdx = best;
                }
                tone(midi(PENTA[melIdx]), nextT, EIGHTH * 1.7, { type: style.lead, vol: style.lead === 'square' ? 0.018 : 0.045, bus: musicBus });
            }
            nextT += EIGHTH;
            step++;
        }
    }
    function startMusic() {
        if (!ctx || timer) return;
        nextT = ctx.currentTime + 0.15;
        pickStyle();
        musicBus.gain.setTargetAtTime(vol('musicVol'), ctx.currentTime, 0.6);
        timer = setInterval(schedule, 100);
    }
    function stopMusic() {
        if (!ctx) return;
        musicBus.gain.setTargetAtTime(0, ctx.currentTime, 0.15);
        clearInterval(timer);
        timer = null;
    }
    return {
        unlock() {
            if (!init()) return;
            if (ctx.state === 'suspended') ctx.resume();
            if (state.settings.music) startMusic();
        },
        play,
        setMusic(on) {
            if (!ctx) return;
            on ? startMusic() : stopMusic();
        },
        setSfx(on) {
            if (ctx) sfxBus.gain.value = on ? vol('sfxVol') : 0;
        },
        // volumes séparés (réglages)
        setVolumes() {
            if (!ctx) return;
            sfxBus.gain.value = state.settings.sfx ? vol('sfxVol') : 0;
            if (timer) musicBus.gain.setTargetAtTime(vol('musicVol'), ctx.currentTime, 0.1);
        },
        suspend() {
            if (ctx && ctx.state === 'running') ctx.suspend();
        },
        resume() {
            if (ctx && ctx.state === 'suspended') ctx.resume();
        },
    };
})();

// les règles annoncent les sons et les vibrations, l'interface les joue
export function setupSound() {
    on('sfx', name => SoundEngine.play(name));
    on('buzz', ms => {
        if (state.settings.haptics && navigator.vibrate && (!navigator.userActivation || navigator.userActivation.hasBeenActive))
            try {
                navigator.vibrate(ms || 8);
            } catch {
                // vibration refusée
            }
    });
    // le premier geste débloque le son (règle des navigateurs)
    const unlock = () => SoundEngine.unlock();
    window.addEventListener('pointerdown', unlock, { passive: true });
    window.addEventListener('keydown', unlock);
    document.addEventListener('visibilitychange', () => (document.hidden ? SoundEngine.suspend() : SoundEngine.resume()));
}
