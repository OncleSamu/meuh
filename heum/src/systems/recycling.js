// Heum — le Recyclage : fouiller l'épave, trier la ferraille, faire tourner les machines.
import { state } from '../core/state.js';
import { now } from '../core/clock.js';
import { rnd, between } from '../core/rand.js';
import { toast, sfx } from '../core/bus.js';
import { MACHINES, WRECK, SCRAP_TYPES, CONT } from '../data/world.js';
import { give, takeAll, hasAll, addXp, lvlOk, nameOf, mixCharge } from './player.js';
import { addCont } from './contamination.js';
import { bunkerFed, genMult } from './bunker.js';

export function wreckTick(dt) {
    const w = state.wreck;
    if (w.charges >= WRECK.max) {
        w.clock = 0;
        return;
    }
    const every = WRECK.every / (bunkerFed() ? 2 : 1);
    w.clock = (w.clock || 0) + dt;
    while (w.clock >= every && w.charges < WRECK.max) {
        w.clock -= every;
        w.charges++;
    }
}
export const wreckLeft = () => (state.wreck.charges >= WRECK.max ? 0 : WRECK.every / (bunkerFed() ? 2 : 1) - (state.wreck.clock || 0));
export function search() {
    const w = state.wreck;
    if (w.charges <= 0) {
        toast('L’épave est vide pour l’instant : elle se regarnit avec le temps');
        sfx('error');
        return 0;
    }
    w.charges--;
    const n = between(...WRECK.find);
    give('scrap', n);
    addXp(1);
    sfx('scrap');
    return n;
}

export const recipeOf = (m, rid) => MACHINES[m].recipes.find(r => r.id === rid);
export const jobOf = m => state.machines[m] || null;
export const jobDone = m => !!jobOf(m) && now() >= jobOf(m).end;
export const jobLeft = m => (jobOf(m) ? Math.max(0, (jobOf(m).end - now()) / 1000) : 0);
export function startJob(m, rid) {
    const d = MACHINES[m],
        r = d && recipeOf(m, rid);
    if (!r || !lvlOk(d.lvl, d.name) || (r.lvl && !lvlOk(r.lvl, r.name))) return false;
    if (jobOf(m)) {
        toast(`${d.name} est déjà occupé`);
        return false;
    }
    if (!hasAll(r.in)) {
        toast(
            `Il manque : ${Object.entries(r.in)
                .map(([id, n]) => `${n} ${nameOf(id).toLowerCase()}`)
                .join(', ')}`,
        );
        sfx('error');
        return false;
    }
    const charge = mixCharge(r.in);
    takeAll(r.in);
    const t = now();
    state.machines[m] = { r: rid, start: t, end: t + (r.t * 1000) / genMult(), charge };
    sfx('machine');
    return true;
}
// trier : 5 ferrailles brutes donnent 4 pièces triées (le reste part en poussière)
const W = { metal: 40, plastic: 30, elec: 15, compo: 15 };
function sortScrap() {
    const out = {};
    for (let k = 0; k < 4; k++) {
        let x = rnd() * 100;
        const id = SCRAP_TYPES.find(s => (x -= W[s]) < 0) || 'metal';
        out[id] = (out[id] || 0) + 1;
    }
    return out;
}
export function collectJob(m) {
    if (!jobDone(m)) return null;
    const r = recipeOf(m, jobOf(m).r);
    const jobCharge = jobOf(m).charge || 0;
    delete state.machines[m];
    let got = {};
    if (r.out === 'sorted') got = sortScrap();
    else if (r.out === 'purify') addCont(-CONT.purifier);
    else got = { [r.out]: 1 };
    const ch = jobCharge;
    for (const [id, n] of Object.entries(got)) give(id, n, ch);
    addXp(3);
    sfx('collect');
    return got;
}
