// Heum — l'état de la partie : un seul objet, sauvegardé tel quel dans le téléphone (clé « heumSave », séparée de Meuh).
import { now } from './clock.js';

export const SAVE_KEY = 'heumSave';
export const SAVE_VERSION = 1;

export function freshState() {
    const t = now();
    return {
        v: SAVE_VERSION,
        level: 1,
        xp: 0,
        money: 60,
        // la Contamination de la ferme, de 0 à 100
        cont: 8,
        plots: Array.from({ length: 9 }, (_, i) => ({ open: i < 4, crop: null, at: 0, rebel: false })),
        inv: { rutabaga: 4 },
        animals: [],
        wreck: { charges: 8, at: t },
        machines: {},
        bunker: { food: 6, at: t },
        caravan: { seed: Math.floor(Math.random() * 1e6) },
        seen: {},
        stats: { harvests: 0, mutants: 0, sold: 0 },
        last: t,
        started: t,
    };
}

export let state = freshState();
export const setState = s => (state = s);

// le stockage : localStorage dans le navigateur, une mémoire dans les tests
let store = null;
export const setStore = s => (store = s);
export function save() {
    if (!store) return;
    state.last = now();
    try {
        store.setItem(SAVE_KEY, JSON.stringify(state));
    } catch {}
}
export function load() {
    let raw = null;
    try {
        raw = store && store.getItem(SAVE_KEY);
    } catch {}
    if (!raw) return false;
    try {
        const s = JSON.parse(raw);
        if (!s || s.v !== SAVE_VERSION) return false;
        state = Object.assign(freshState(), s);
        return true;
    } catch {
        return false;
    }
}
export function wipe() {
    state = freshState();
    save();
}
