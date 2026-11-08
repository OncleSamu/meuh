// Heum — le Bunker : un étage, trois habitants. Nourris, ils travaillent pour la ferme ; sans vivres, ils se mettent en veille.
import { state, newResidents } from '../core/state.js';
import { now } from '../core/clock.js';
import { rnd, between } from '../core/rand.js';
import { toast, sfx, emit } from '../core/bus.js';
import { BUNKER, EXPEDITIONS, HABITANTS, STATS } from '../data/world.js';
import { MUTANTS, FIX } from '../data/crops.js';
import { take, have, give, foodOf, addXp, spend, hasAll, takeAll, lvlOk, earn, nameOf } from './player.js';

// l'air pur dépend de la Contamination de surface
export const airPure = () => Math.max(0, Math.round(100 - state.cont * 0.8));
export const bunkerFed = () => state.bunker.food > 0 && state.cont < 85;
export const floors = () => state.bunker.floors || 1;
// ---------------- 0.4 : les habitants ----------------
export const residents = () => state.bunker.res || [];
export const roomsOpen = () => [...BUNKER.rooms, ...(floors() >= 2 ? BUNKER.rooms2 : [])];
export const roomDef = id => [...BUNKER.rooms, ...BUNKER.rooms2].find(r => r.id === id);
export const isKo = r => r.ko > 0;
export const workerOf = room => residents().find(r => r.room === room) || null;
export const incident = () => state.bunker.incident || null;
// l'efficacité d'une salle : 0 si personne, KO, incident ou plus de vivres ; 0,1 + 0,3 × la statistique sinon (2 → 0,7 ; 3 → 1 ; 5 → 1,6)
export function power(room) {
    const w = workerOf(room);
    const d = roomDef(room);
    if (!w || !d || isKo(w) || !bunkerFed()) return 0;
    if (incident() && incident().room === room) return 0;
    return 0.1 + 0.3 * w[d.stat];
}
export function log(text) {
    const j = (state.journal = state.journal || []);
    j.unshift({ t: now(), text });
    if (j.length > HABITANTS.journalMax) j.length = HABITANTS.journalMax;
}
export function assign(id, room) {
    const r = residents().find(x => x.id === id);
    if (!r || (room && !roomsOpen().some(x => x.id === room))) return false;
    const other = room && workerOf(room);
    if (other && other !== r) other.room = r.room; // ils échangent leur place
    r.room = room || null;
    sfx('tap');
    return true;
}
const levelNeed = r => HABITANTS.xpPerLvl * r.lvl;
function train(r, dt) {
    const d = r.room && roomDef(r.room);
    if (!d || isKo(r) || !bunkerFed() || r.lvl >= HABITANTS.maxLvl || (incident() && incident().room === r.room)) return;
    r.xp += dt / HABITANTS.xpEvery;
    while (r.lvl < HABITANTS.maxLvl && r.xp >= levelNeed(r)) {
        r.xp -= levelNeed(r);
        r.lvl++;
        if (r[d.stat] < HABITANTS.statCap) r[d.stat]++;
        const name = RES_NAME(r.id);
        log(`${name} passe niveau ${r.lvl} (${STATS[d.stat]} ${r[d.stat]}).`);
        toast(`${name} passe niveau ${r.lvl}`);
    }
}
const RES_NAME = id => id.charAt(0).toUpperCase() + id.slice(1);
export const resName = RES_NAME;
// le soin se fait en jeu comme hors ligne ; les KO et les incidents n'arrivent qu'en jeu
function heal() {
    for (const r of residents())
        if (r.ko && now() >= r.ko) {
            r.ko = 0;
            log(`${RES_NAME(r.id)} est remis sur pied.`);
        }
}
export const healTime = () => HABITANTS.ko.heal / (1 + power('care'));
export function exposure(dt) {
    if (state.cont < HABITANTS.ko.from) return;
    const k = ((state.cont - HABITANTS.ko.from) / 45) * (state.cont >= 85 ? 2 : 1);
    for (const r of residents()) {
        if (isKo(r) || !r.room || !bunkerFed()) continue;
        if (rnd() < (dt * HABITANTS.ko.base * k) / r.resist) {
            r.ko = now() + healTime() * 1000;
            log(`${RES_NAME(r.id)} s’évanouit : l’air est mauvais.`);
            toast(`${RES_NAME(r.id)} est KO : l’air est mauvais`);
        }
    }
}
export function maybeIncident(dt) {
    if (incident() || !bunkerFed()) return;
    const rooms = residents().filter(r => r.room && !isKo(r));
    if (!rooms.length || rnd() >= dt / HABITANTS.incidentEvery) return;
    const w = rooms[Math.floor(rnd() * rooms.length)];
    const kinds = Object.keys(HABITANTS.incidents);
    const kind = kinds[Math.floor(rnd() * kinds.length)];
    state.bunker.incident = { room: w.room, kind, at: now() };
    log(`${HABITANTS.incidents[kind].name} : ${roomDef(w.room).name}.`);
    toast(`${HABITANTS.incidents[kind].name} au Bunker`);
}
export function fixIncident() {
    const i = incident();
    if (!i) return false;
    const cost = HABITANTS.incidents[i.kind].cost;
    if (!hasAll(cost)) {
        toast('Il manque de quoi réparer');
        sfx('error');
        return false;
    }
    takeAll(cost);
    state.bunker.incident = null;
    log(`${HABITANTS.incidents[i.kind].name} réglé(e).`);
    addXp(4);
    sfx('build');
    return true;
}

export const genMult = () => (bunkerFed() ? 1 + BUNKER.genBonus * power('gen') + BUNKER.shopBonus * power('shop') : 1);
export const eatEvery = () => BUNKER.eatEvery / floors();
export const canMult = () => 1 + BUNKER.canBonus * power('kitchen');
export const wreckSpeed = () => 1 + power('dorm');
// le labo et les expéditions vont toujours, mais plus vite avec un bon équipage
export const roomSpeed = room => 0.7 + 0.3 * power(room);

export function bunkerTick(dt) {
    const b = state.bunker;
    heal();
    for (const r of residents()) train(r, dt);
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
    state.bunker.res = [...residents(), ...newResidents(2).filter(n => !residents().some(r => r.id === n.id))];
    log('Le deuxième étage est creusé : Victor, Firmin et Odette arrivent.');
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
    state.lab = { id, end: now() + (FIX.t * 1000) / roomSpeed('lab') };
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
    state.expe = { id, end: now() + (e.t * 1000) / roomSpeed('maps') };
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
