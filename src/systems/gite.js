// 1.100 : le gîte et la table d'hôtes (voir data/gite.js).
import { state } from '../core/state.js';
import { now } from '../core/clock.js';
import { view } from '../core/view.js';
import { toast, sfx, burst } from '../core/bus.js';
import { RECIPES } from '../data/machines.js';
import { ITEMS } from '../data/items.js';
import { GITE, COMMENTS } from '../data/gite.js';
import { FIRST_NAMES } from '../data/commerces.js';
import { randomId, rng } from '../art/habitants.js';
import { hasMats, payMats } from './market.js';
import { earn, spend, addXp } from './player.js';
import { canGet, haveQ, takeQ } from './defis.js';

export const giteOpen = () => state.level >= GITE.lvl;
export const giteBuilt = () => !!state.gite;
export const giteGuests = () => (state.gite ? state.gite.guests : []);
export const giteRooms = () => (state.gite ? state.gite.rooms : 0);
export const giteFree = () => giteRooms() - giteGuests().length;
export const canBuildGite = () => giteOpen() && !state.gite && state.money >= GITE.cost && hasMats(GITE.mats);
export function buildGite(at) {
    if (!canBuildGite()) return false;
    spend(GITE.cost);
    payMats(GITE.mats);
    state.gite = { rooms: GITE.rooms, guests: [], reviews: [], next: now(), hosted: 0 };
    sfx('level');
    burst(at, 'sparkle', 14);
    toast('Le gîte ouvre ses portes !', ['ui', 'heart']);
    return true;
}
export const roomCost = () => (state.gite && state.gite.rooms < GITE.maxRooms ? GITE.roomCost(state.gite.rooms + 1) : 0);
export const canAddRoom = () => !!state.gite && state.gite.rooms < GITE.maxRooms && state.money >= roomCost();
export function addRoom() {
    if (!canAddRoom()) return false;
    spend(roomCost());
    state.gite.rooms++;
    sfx('level');
    return true;
}
// réputation : moyenne des derniers avis (0 sans avis)
export function giteRep() {
    const r = state.gite ? state.gite.reviews : [];
    return r.length ? r.reduce((a, x) => a + x.stars, 0) / r.length : 0;
}
const fastIdx = () => GITE.fastAt.filter(v => giteRep() >= v).length - 1;
export const giteGap = () => GITE.gap.map(x => x * GITE.fast[Math.max(0, fastIdx())]);

const pool = machines =>
    Object.values(RECIPES)
        .filter(r => machines.includes(r.machine) && ITEMS[r.id] && ITEMS[r.id].sell)
        .map(r => r.id);
function pick(machines) {
    const all = pool(machines);
    const ok = all.filter(canGet);
    const l = ok.length ? ok : all;
    return l[Math.floor(Math.random() * l.length)];
}
export function newGuest(t = now()) {
    const g = state.gite;
    const seed = (Date.now() ^ (g.hosted * 7919) ^ Math.floor(Math.random() * 1e6)) >>> 0;
    const r = rng(seed);
    const woman = r() < 0.5;
    const stay = GITE.stay[0] + Math.random() * (GITE.stay[1] - GITE.stay[0]);
    const wants = [{ item: pick(GITE.plats), done: false }];
    if (stay >= 24 * 3600000) wants.push({ item: pick(GITE.desserts), done: false });
    const guest = { look: randomId(seed, woman ? { female: true } : { male: true }), name: FIRST_NAMES[Math.floor(r() * FIRST_NAMES.length)], arrive: t, leave: t + stay, wants };
    g.guests.push(guest);
    g.hosted++;
    if (view.started) toast(`${guest.name} arrive au gîte`, ['ui', 'heart']);
    return guest;
}
export const canServe = (g, i) => !!g.wants[i] && !g.wants[i].done && haveQ(g.wants[i].item, 0) >= 1;
export function serve(gi, i, at) {
    const g = giteGuests()[gi];
    if (!g || !canServe(g, i)) return false;
    takeQ(g.wants[i].item, 1, 0);
    g.wants[i].done = true;
    sfx('coin');
    burst(at, 'sparkle', 8);
    return true;
}
export const guestStars = g => {
    const n = g.wants.filter(w => w.done).length;
    return n === g.wants.length ? 5 : n === 0 ? 1 : 3;
};
export const guestPay = g => {
    const meals = g.wants.filter(w => w.done).reduce((a, w) => a + ITEMS[w.item].sell * GITE.mealPay, 0);
    const base = state.level * GITE.night * Math.max(0.5, (g.leave - g.arrive) / (24 * 3600000)) + meals;
    return Math.round((base * (1 + GITE.tip[guestStars(g) - 1])) / 10) * 10;
};
function leave(g, at) {
    const stars = guestStars(g);
    const gold = guestPay(g);
    const rv = state.gite.reviews;
    const txt = COMMENTS[stars];
    rv.unshift({ name: g.name, look: g.look, stars, text: txt[Math.floor(Math.random() * txt.length)], gold });
    rv.length = Math.min(rv.length, GITE.keep);
    state.gite.guests = state.gite.guests.filter(x => x !== g);
    earn(gold, at);
    addXp(GITE.xp * (stars === 5 ? 1 : 0.5), at);
    state.stats.gitesGuests = (state.stats.gitesGuests || 0) + 1;
    if (stars === 5) state.stats.gite5 = (state.stats.gite5 || 0) + 1;
    if (view.started) toast(`${g.name} repart ${'★'.repeat(stars)} : ${gold} pièces`, ['ui', 'coin']);
}
export function giteTick() {
    if (!state.gite) return false;
    let changed = false;
    for (const g of state.gite.guests.slice()) if (now() >= g.leave) (leave(g), (changed = true));
    if (view.started && !view.hidden && giteFree() > 0 && now() >= state.gite.next) {
        newGuest();
        const [a, b] = giteGap();
        state.gite.next = now() + a + Math.random() * (b - a);
        changed = true;
    }
    return changed;
}
export const giteReady = () => (state.gite ? state.gite.guests.filter(g => g.wants.some((_, i) => canServe(g, i))).length : 0);
