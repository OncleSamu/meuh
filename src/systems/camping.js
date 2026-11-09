// 1.100 (étape 1) : le camping de la vallée (voir data/camping.js).
import { state } from '../core/state.js';
import { now } from '../core/clock.js';
import { view } from '../core/view.js';
import { toast, sfx, burst } from '../core/bus.js';
import { RECIPES } from '../data/machines.js';
import { ITEMS } from '../data/items.js';
import { CAMPING, WANTS, PROFILES, ORIGINS, FIRST_NAMES, CAMP_UPGRADES } from '../data/camping.js';
import { randomId, rng } from '../art/habitants.js';
import { hasCost, payCost } from './home.js';
import { earn, addXp } from './player.js';
import { canGet, haveQ, takeQ } from './defis.js';

export const campOpen = () => state.level >= CAMPING.lvl;
export const campBuilt = () => !!state.camping;
export const campGuests = () => (state.camping ? state.camping.guests : []);
export const campPitches = () => (state.camping ? state.camping.pitches : 0);
export const campFree = () => campPitches() - campGuests().length;
export const canBuildCamp = () => campOpen() && !state.camping && hasCost(CAMPING.cost);
export function buildCamp(at) {
    if (!canBuildCamp()) return false;
    payCost(CAMPING.cost);
    state.camping = { pitches: CAMPING.pitches, guests: [], past: [], next: now(), hosted: 0, up: {}, till: 0, tillAt: now() };
    sfx('level');
    burst(at, 'sparkle', 14);
    toast('Le camping de la vallée ouvre ses portes !', ['ui', 'heart']);
    return true;
}
export const campUp = id => !!(state.camping && state.camping.up[id]);
export const upCan = id => !!state.camping && !campUp(id) && hasCost(CAMP_UPGRADES[id].cost);
export function buyUp(id) {
    if (!upCan(id)) return false;
    payCost(CAMP_UPGRADES[id].cost);
    state.camping.up[id] = 1;
    state.camping.tillAt = now();
    sfx('level');
    toast(`${CAMP_UPGRADES[id].name} : aménagé !`, ['ui', 'heart']);
    return true;
}
export const pitchCost = () => (state.camping && state.camping.pitches < CAMPING.maxPitches ? CAMPING.pitchCost(state.camping.pitches + 1) : 0);
export const canAddPitch = () => !!state.camping && state.camping.pitches < CAMPING.maxPitches && state.money >= pitchCost();
export function addPitch() {
    if (!canAddPitch()) return false;
    payCost({ coins: pitchCost() });
    state.camping.pitches++;
    state.camping.tillAt = state.camping.tillAt || now();
    sfx('level');
    return true;
}
const mult = k => Object.keys(state.camping ? state.camping.up : {}).reduce((a, id) => a * (CAMP_UPGRADES[id][k] || 1), 1);
const tipRate = () => CAMPING.tip + Object.keys(state.camping.up).reduce((a, id) => a + (CAMP_UPGRADES[id].tip || 0), 0);
export const campGap = () => CAMPING.gap.map(x => x * mult('gap'));

// ---- les envies ----
const memo = {};
function pool(kind) {
    if (!memo[kind]) {
        const w = WANTS[kind];
        memo[kind] = w.types
            ? Object.values(ITEMS).filter(i => w.types.includes(i.type) && i.sell).map(i => i.id)
            : Object.values(RECIPES).filter(r => w.machines.includes(r.machine) && ITEMS[r.id] && ITEMS[r.id].sell && !r.fete && !r.holiday).map(r => r.id);
    }
    return memo[kind];
}
export function pickWant(kind, taken, r) {
    const all = pool(kind).filter(id => !taken.includes(id));
    const ok = all.filter(canGet);
    const l = ok.length ? ok : all;
    return l.length ? l[Math.floor(r() * l.length)] : null;
}
export function newGuest(t = now(), seed) {
    const c = state.camping;
    seed = seed ?? (Date.now() ^ (c.hosted * 7919) ^ Math.floor(Math.random() * 1e6)) >>> 0;
    const r = rng(seed);
    const pid = Object.keys(PROFILES)[Math.floor(r() * Object.keys(PROFILES).length)];
    const woman = r() < 0.5;
    const stay = (CAMPING.stay[0] + r() * (CAMPING.stay[1] - CAMPING.stay[0])) * mult('stay');
    const taken = [];
    const wants = [];
    for (const k of PROFILES[pid].wants) {
        const id = pickWant(k, taken, r);
        if (id) {
            taken.push(id);
            wants.push({ item: id, done: false });
        }
    }
    const used = [...c.guests, ...(c.res || []), ...(c.asks || [])].map(g => g.name);
    const names = FIRST_NAMES.filter(n => !used.includes(n));
    const g = {
        look: randomId(seed, woman ? { female: true } : { male: true }),
        name: names[Math.floor(r() * names.length)] || FIRST_NAMES[0],
        from: ORIGINS[Math.floor(r() * ORIGINS.length)],
        profile: pid,
        woman,
        arrive: t,
        leave: t + stay,
        wants,
    };
    c.guests.push(g);
    c.hosted++;
    if (view.started) toast(`${g.name} ${g.from} plante sa tente au camping`, ['ui', 'heart']);
    return g;
}
export const priceOf = id => Math.round(ITEMS[id].sell * CAMPING.pay * mult('pay'));
export const canSell = (g, i) => !!g.wants[i] && !g.wants[i].done && haveQ(g.wants[i].item, 0) >= 1;
export function sellTo(gi, i, at) {
    const g = campGuests()[gi];
    if (!g || !canSell(g, i)) return false;
    const w = g.wants[i];
    takeQ(w.item, 1, 0);
    w.done = true;
    earn(priceOf(w.item), at);
    state.stats.campSales = (state.stats.campSales || 0) + 1;
    sfx('coin');
    burst(at, 'sparkle', 8);
    return true;
}
export const guestMood = g => {
    const n = g.wants.filter(w => w.done).length;
    return n === g.wants.length ? 2 : n > 0 ? 1 : 0; // 0 déçu, 1 content, 2 ravi
};
export const MOODS = ['Déçu', 'Content', 'Ravi'];
var leaveHook;
export function setLeaveHook(f) {
    leaveHook = f;
}
function leave(g, at) {
    const mood = guestMood(g);
    const tip = mood === 2 ? Math.round(g.wants.reduce((a, w) => a + priceOf(w.item), 0) * tipRate()) : 0;
    const c = state.camping;
    c.past.unshift({ name: g.name, look: g.look, from: g.from, profile: g.profile, woman: g.woman, mood });
    if (mood === 2 && leaveHook) leaveHook(g);
    c.past.length = Math.min(c.past.length, CAMPING.keep);
    c.guests = c.guests.filter(x => x !== g);
    if (tip) earn(tip, at);
    addXp(CAMPING.xp * (mood === 2 ? 1 : mood === 1 ? 0.5 : 0.2), at);
    state.stats.campGuests = (state.stats.campGuests || 0) + 1;
    if (mood === 2) state.stats.campHappy = (state.stats.campHappy || 0) + 1;
    if (view.started) toast(`${g.name} repart ${MOODS[mood].toLowerCase()}${tip ? ` · pourboire ${tip}` : ''}`, ['ui', 'coin']);
}
// ---- l'épicerie : une caisse qui se remplit hors ligne ----
export const tillCap = () => CAMPING.tillHours * tillPerHour();
const tillPerHour = () => state.level * CAMPING.tillRate * (state.camping ? state.camping.pitches : 0);
export function tillTick() {
    const c = state.camping;
    if (!c || !c.up.shop) return;
    const dt = Math.max(0, now() - (c.tillAt || now())) / 3600000;
    c.tillAt = now();
    c.till = Math.min(tillCap(), (c.till || 0) + dt * tillPerHour());
}
export const tillAmount = () => (state.camping && state.camping.up.shop ? Math.floor(state.camping.till || 0) : 0);
export function collectTill(at) {
    const n = tillAmount();
    if (n <= 0) return false;
    state.camping.till = 0;
    earn(n, at);
    sfx('coin');
    return true;
}
export function campTick() {
    const c = state.camping;
    if (!c) return false;
    let changed = false;
    for (const g of c.guests.slice()) if (now() >= g.leave) (leave(g, null), (changed = true));
    tillTick();
    if (view.started && !view.hidden && campFree() > 0 && now() >= c.next) {
        newGuest();
        const [a, b] = campGap();
        c.next = now() + a + Math.random() * (b - a);
        changed = true;
    }
    return changed;
}
export const campReady = () => (state.camping ? state.camping.guests.filter(g => g.wants.some((_, i) => canSell(g, i))).length + (tillAmount() > 0 ? 1 : 0) : 0);
