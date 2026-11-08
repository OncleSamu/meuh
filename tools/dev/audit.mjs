// Audit d'état : ferme de niveau 64 complète, 72 h simulées (jeu + absence), recherche de valeurs impossibles.
// usage : node tools/dev/audit.mjs
import { setClock } from '../../src/core/clock.js';
import { state, setStore, fromSave } from '../../src/core/state.js';
import { setView } from '../../src/core/view.js';
import * as G from '../../src/systems/index.js';
import { ITEMS } from '../../src/data/items.js';
import { PROJECTS } from '../../src/data/village.js';

let now = Date.UTC(2026, 10, 8, 8, 0, 0);
setClock(() => now);
setStore(null);
G.loadGame();
setView({ started: false, tab: 'farm' });
state.level = 64;
state.money = 50_000_000;
state.barn.lvl = 50;
for (const p of Object.values(PROJECTS)) state.projects[p.id] = { given: {}, done: true };
for (const k of Object.keys(ITEMS)) state.inventory[k] = 60;
G.normalizeState();

const bad = new Set();
function scan(o, path, depth = 0) {
    if (depth > 9 || o === null || typeof o !== 'object') return;
    for (const [k, v] of Object.entries(o)) {
        const p = `${path}.${k}`;
        if (typeof v === 'number') {
            if (Number.isNaN(v)) bad.add(`NaN ${p}`);
            else if (!Number.isFinite(v) && !/next|until|due|end|deadline/i.test(k)) bad.add(`infini ${p}`);
            else if (v < 0 && /^(inventory|seeds|products|stock)\./.test(p.replace(/^state\./, ''))) bad.add(`négatif ${p}=${v}`);
        } else if (v && typeof v === 'object') scan(v, p, depth + 1);
    }
}
const check = when => {
    scan(state, 'state');
    if (!Number.isFinite(state.money) || state.money < 0) bad.add(`argent ${state.money} (${when})`);
};
const errs = [];
const origErr = console.error;
console.error = (...a) => errs.push(a.join(' ').slice(0, 160));

for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 5) {
        now += 5 * 60 * 1000;
        try {
            G.gameTick();
        } catch (e) {
            errs.push(`gameTick: ${e.message}`);
        }
    }
    check(`jeu h${h}`);
}
for (const away of [3, 12, 24, 48]) {
    state.lastSaved = now;
    now += away * 3600 * 1000;
    try {
        G.offlineProgress();
    } catch (e) {
        errs.push(`absence ${away} h : ${e.message}`);
    }
    check(`absence ${away} h`);
}
// aller-retour de sauvegarde
const json = JSON.stringify(state);
const back = fromSave(JSON.parse(json));
scan(back, 'rechargé');
const again = JSON.stringify(back);
console.error = origErr;
console.log('taille de la sauvegarde :', Math.round(json.length / 1024), 'ko ; relue :', Math.round(again.length / 1024), 'ko');
console.log('valeurs impossibles :', bad.size ? [...bad].slice(0, 25) : 'aucune');
console.log('erreurs capturées :', errs.length ? [...new Set(errs)].slice(0, 15) : 'aucune');
