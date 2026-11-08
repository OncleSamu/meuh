// Heum — l'état de la partie : un seul objet, sauvegardé tel quel dans le téléphone (clé « heumSave », séparée de Meuh).
import { now } from './clock.js';
import { RESIDENTS } from '../data/world.js';

export const SAVE_KEY = 'heumSave';
export const SAVE_VERSION = 4;

// 0.4 : les habitants présents selon le nombre d'étages creusés
export function newResidents(floors) {
    return RESIDENTS.filter(r => r.floor <= floors).map(r => ({
        id: r.id,
        mains: r.mains,
        esprit: r.esprit,
        resist: r.resist,
        lvl: 1,
        xp: 0,
        room: r.room,
        ko: 0,
    }));
}
export function freshState() {
    const t = now();
    return {
        v: SAVE_VERSION,
        level: 1,
        xp: 0,
        money: 60,
        // la Contamination de la ferme, de 0 à 100
        cont: 8,
        plots: Array.from({ length: 24 }, (_, i) => ({ open: i < 4, crop: null, at: 0, rebel: false })),
        inv: { rutabaga: 4 },
        animals: [],
        wreck: { charges: 8, at: t },
        machines: {},
        bunker: { food: 6, at: t, res: newResidents(1), incident: null },
        journal: [],
        wear: {}, // 0.5 : l'usure de chaque machine
        silo: 0, // 0.5 : le niveau du silo
        caravan: { seed: Math.floor(Math.random() * 1e6) },
        seen: {},
        charge: {}, // 0.3 : la charge toxique moyenne de chaque produit en stock
        stats: { harvests: 0, mutants: 0, sold: 0 },
        last: t,
        started: t,
    };
}

export let state = freshState();
export const setState = s => (state = s);

// ---------------- la sauvegarde ----------------
// 0.3 : une sauvegarde qu'on ne sait pas lire n'est JAMAIS écrasée ; une copie de secours est gardée à chaque chargement.
const BAK = SAVE_KEY + '.bak';
let store = null;
let locked = false; // vrai quand la sauvegarde présente est illisible : on n'écrit plus rien par-dessus
export const setStore = s => {
    store = s;
    locked = false;
};
export const isLocked = () => locked;

// les migrations : de la version n à n + 1
const MIGRATIONS = {
    1: s => ({ ...s, v: 2, charge: s.charge || {} }),
    3: s => ({
        ...s,
        v: 4,
        plots: [...s.plots, ...Array.from({ length: Math.max(0, 24 - s.plots.length) }, () => ({ open: false, crop: null, at: 0, rebel: false }))],
        wear: {},
        silo: 0,
    }),
    2: s => ({ ...s, v: 3, journal: [], bunker: { ...s.bunker, res: newResidents((s.bunker && s.bunker.floors) || 1), incident: null } }),
};
export function migrate(s) {
    if (!s || typeof s !== 'object' || typeof s.v !== 'number') return null;
    while (s.v < SAVE_VERSION) {
        const m = MIGRATIONS[s.v];
        if (!m) return null;
        s = m(s);
    }
    return s.v === SAVE_VERSION ? s : null;
}
export function save() {
    if (!store || locked) return false;
    state.last = now();
    try {
        store.setItem(SAVE_KEY, JSON.stringify(state));
        return true;
    } catch {
        return false;
    }
}
// renvoie 'none' (pas de partie), 'ok', ou 'bad' (illisible : on la garde intacte et on ne sauvegarde plus)
export function load() {
    let raw = null;
    try {
        raw = store && store.getItem(SAVE_KEY);
    } catch {}
    if (!raw) return 'none';
    let s = null;
    try {
        s = migrate(JSON.parse(raw));
    } catch {}
    if (!s) {
        locked = true;
        try {
            store.setItem(BAK, raw);
        } catch {}
        return 'bad';
    }
    state = Object.assign(freshState(), s);
    try {
        store.setItem(BAK, raw);
    } catch {}
    return 'ok';
}
export function wipe() {
    locked = false;
    state = freshState();
    save();
}
// la sauvegarde brute (pour l'export), et la reprise d'un fichier
export const rawSave = () => {
    try {
        return (store && (store.getItem(SAVE_KEY) || store.getItem(BAK))) || JSON.stringify(state);
    } catch {
        return JSON.stringify(state);
    }
};
export function importSave(text) {
    let s = null;
    try {
        s = migrate(JSON.parse(text));
    } catch {}
    if (!s) return false;
    locked = false;
    state = Object.assign(freshState(), s);
    save();
    return true;
}
