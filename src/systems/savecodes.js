// Codes de sauvegarde (export, import) et copies de secours.
import { state, BACKUP_KEY, SAVE_KEY, getStore } from '../core/state.js';
import { now } from '../core/clock.js';
import { fmt } from '../core/format.js';

const b64url = bytes => {
    let str = '';
    bytes.forEach(b => (str += String.fromCharCode(b)));
    return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};
const unb64url = str => {
    const raw = atob(str.replace(/-/g, '+').replace(/_/g, '/'));
    return Uint8Array.from(raw, c => c.charCodeAt(0));
};

// le code d'une ferme : « MEUH1. » + JSON compressé (ou « MEUH0. » sans compression)
export async function packSave(json) {
    const bytes = new TextEncoder().encode(json);
    if (typeof CompressionStream !== 'undefined') {
        const out = await new Response(new Blob([bytes]).stream().pipeThrough(new CompressionStream('deflate'))).arrayBuffer();
        return 'MEUH1.' + b64url(new Uint8Array(out));
    }
    return 'MEUH0.' + b64url(bytes);
}

export async function unpackSave(code) {
    code = code.trim();
    if (code.startsWith('{')) return code;
    const m = code.match(/^MEUH([01])\.([A-Za-z0-9_-]+)$/);
    if (!m) throw new Error('format');
    const bytes = unb64url(m[2]);
    if (m[1] === '0') return new TextDecoder().decode(bytes);
    if (typeof DecompressionStream === 'undefined') throw new Error('compression');
    const out = await new Response(new Blob([bytes]).stream().pipeThrough(new DecompressionStream('deflate'))).arrayBuffer();
    return new TextDecoder().decode(out);
}

// une sauvegarde lisible ? renvoie l'objet, ou lève une erreur
export async function readCode(text) {
    const json = await unpackSave(text);
    const sv = JSON.parse(json);
    if (typeof sv !== 'object' || !Array.isArray(sv.grid) || typeof sv.money !== 'number') throw new Error('contenu');
    return { json, save: sv };
}

export function saveSummary(sv) {
    const animals = (sv.animals || []).length,
        machines = (sv.machines || []).length;
    return `Niveau ${sv.level || 1} · ${fmt(sv.money || 0)} pièces · ${animals} ${animals > 1 ? 'animaux' : 'animal'} · ${machines} machine${machines > 1 ? 's' : ''}${sv.prestige && sv.prestige.rubans ? ` · ${sv.prestige.rubans} ruban${sv.prestige.rubans > 1 ? 's' : ''}` : ''}`;
}

// ---------------- copies de secours ----------------
// Les 3 dernières copies de la ferme : une toutes les 10 minutes de jeu, et avant chaque
// geste risqué (importer, recommencer, restaurer).
const BACKUP_MAX = 3,
    BACKUP_EVERY = 10 * 60 * 1000;
let lastBackupAt = 0;

export function readBackups() {
    try {
        const v = JSON.parse(getStore().getItem(BACKUP_KEY) || '[]');
        return Array.isArray(v) ? v : v && v.data ? [v] : [];
    } catch {
        return [];
    }
}

export function pushBackup(force) {
    const store = getStore();
    if (!store) return;
    if (!force && lastBackupAt && now() - lastBackupAt < BACKUP_EVERY) return;
    const list = readBackups();
    lastBackupAt = list.length ? list[0].at : 0;
    if (!force && list.length && now() - list[0].at < BACKUP_EVERY) return;
    lastBackupAt = now();
    list.unshift({ at: now(), data: JSON.stringify(state) });
    try {
        store.setItem(BACKUP_KEY, JSON.stringify(list.slice(0, BACKUP_MAX)));
    } catch {
        // stockage indisponible
    }
}

// remplace la sauvegarde (la ferme actuelle part d'abord en secours) ; il faut ensuite recharger
export function replaceSave(json) {
    pushBackup(true);
    try {
        getStore().setItem(SAVE_KEY, json);
        return true;
    } catch {
        return false;
    }
}

export function eraseSave() {
    pushBackup(true);
    try {
        getStore().removeItem(SAVE_KEY);
    } catch {
        // stockage indisponible
    }
}

export const backupAgo = at => {
    const m = Math.round((now() - at) / 60000);
    return m < 1 ? 'à l’instant' : m < 60 ? `il y a ${m} min` : m < 1440 ? `il y a ${Math.round(m / 60)} h` : `il y a ${Math.round(m / 1440)} j`;
};
