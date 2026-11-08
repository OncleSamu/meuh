// Heum — le Bunker : un étage, trois habitants. Nourris, ils travaillent pour la ferme ; sans vivres, ils se mettent en veille.
import { state } from '../core/state.js';
import { now } from '../core/clock.js';
import { rnd, between } from '../core/rand.js';
import { toast, sfx, emit } from '../core/bus.js';
import { BUNKER, EXPEDITIONS } from '../data/world.js';
import { MUTANTS, FIX } from '../data/crops.js';
import { take, have, give, foodOf, addXp, spend, hasAll, takeAll, lvlOk, earn, nameOf } from './player.js';

// l'air pur dépend de la Contamination de surface
export const airPure = () => Math.max(0, Math.round(100 - state.cont * 0.8));
export const bunkerFed = () => state.bunker.food > 0 && state.cont < 85;
export const floors = () => state.bunker.floors || 1;
export const genMult = () => (bunkerFed() ? 1 + BUNKER.genBonus + (floors() >= 2 ? BUNKER.shopBonus : 0) : 1);
export const eatEvery = () => BUNKER.eatEvery / floors();
export const canMult = () => (bunkerFed() ? 1 + BUNKER.canBonus : 1);

export function bunkerTick(dt) {
    const b = state.bunker;
    if (b.food <= 0) {
        b.clock = 0;
        return;
    }
    b.clock = (b.clock || 0) + dt;
    while (b.clock >= eatEvery() && b.food > 0) {
        b.clock -= eatEvery();
        b.food--;
    }
}
export function deliver(id, n = 1) {
    const f = foodOf(id);
    const b = state.bunker;
    if (!f || have(id) < 1) return 0;
    const room = BUNKER.foodMax - b.food;
    const k = Math.min(n, have(id), Math.ceil(room / f));
    if (k <= 0) {
        toast('Le garde-manger est plein');
        return 0;
    }
    take(id, k);
    b.food = Math.min(BUNKER.foodMax, b.food + k * f);
    addXp(k);
    sfx('collect');
    return k;
}

// V2 : creuser le deuxième étage
export function dig() {
    const d = BUNKER.dig;
    if (floors() >= 2 || !lvlOk(d.lvl, 'Le deuxième étage')) return false;
    if (!hasAll(d.need) || state.money < d.money) {
        toast(`Il faut ${d.money} pièces, ${d.need.metal} métal et ${d.need.compo} composite`);
        sfx('error');
        return false;
    }
    spend(d.money);
    takeAll(d.need);
    state.bunker.floors = 2;
    addXp(30);
    sfx('build');
    emit('dig', 2);
    return true;
}

// V2 : le labo de Victor fixe un mutant en graine stable (5 mutants et 2 électroniques, 5 minutes)
export const labOpen = () => floors() >= 2;
export const labJob = () => state.lab || null;
export const labDone = () => !!state.lab && now() >= state.lab.end;
export const labLeft = () => (state.lab ? Math.max(0, (state.lab.end - now()) / 1000) : 0);
export const canFix = id => !!MUTANTS[id] && !(state.fixed || {})[id] && have(id) >= FIX.mutants && have('elec') >= FIX.elec;
export function startFix(id) {
    if (!labOpen() || state.lab || !MUTANTS[id] || (state.fixed || {})[id]) return false;
    if (!canFix(id)) {
        toast(`Victor demande ${FIX.mutants} ${nameOf(id).toLowerCase()} et ${FIX.elec} électroniques`);
        sfx('error');
        return false;
    }
    take(id, FIX.mutants);
    take('elec', FIX.elec);
    state.lab = { id, end: now() + FIX.t * 1000 };
    sfx('machine');
    return true;
}
export function collectFix() {
    if (!labDone()) return null;
    const id = state.lab.id;
    state.fixed = state.fixed || {};
    state.fixed[id] = true;
    state.lab = null;
    addXp(25);
    sfx('mutant');
    return id;
}

// V2 : les expéditions d'Odette
export const expeOpen = () => floors() >= 2;
export const expe = () => state.expe || null;
export const expeDone = () => !!state.expe && now() >= state.expe.end;
export const expeLeft = () => (state.expe ? Math.max(0, (state.expe.end - now()) / 1000) : 0);
export function sendExpe(id) {
    const e = EXPEDITIONS.find(x => x.id === id);
    if (!e || !expeOpen() || state.expe) return false;
    state.expe = { id, end: now() + e.t * 1000 };
    sfx('build');
    return true;
}
// le rapport : du matériel, parfois un spécimen mutant ou des pièces
export function collectExpe() {
    if (!expeDone()) return null;
    const e = EXPEDITIONS.find(x => x.id === state.expe.id);
    const got = {};
    for (const [id, [a, b]] of Object.entries(e.loot)) {
        const n = between(a, b);
        if (n) got[id] = n;
    }
    if (rnd() < e.rare) {
        const ids = Object.keys(MUTANTS);
        const m = ids[Math.floor(rnd() * ids.length)];
        got[m] = (got[m] || 0) + 1;
    }
    for (const [id, n] of Object.entries(got)) give(id, n, MUTANTS[id] ? 60 : undefined);
    let money = 0;
    if (e.money) earn((money = between(...e.money)));
    state.expe = null;
    addXp(Math.round(e.t / 120));
    sfx('collect');
    return { name: e.name, got, money };
}
