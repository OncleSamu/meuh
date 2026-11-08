// 1.100 (étape 3) : la Maison, votre marque (voir data/maison.js).
import { state } from '../core/state.js';
import { now } from '../core/clock.js';
import { view } from '../core/view.js';
import { toast, sfx, burst } from '../core/bus.js';
import { ITEMS } from '../data/items.js';
import { MAISON, MAISON_CLIENTS, EMBLEMS, PALETTES } from '../data/maison.js';
import { hasCost, payCost } from './home.js';
import { earn, addXp } from './player.js';
import { haveQ, takeQ } from './defis.js';
import { campBuilt } from './camping.js';

const M = () => state.maison;
export const maisonOpen = () => campBuilt();
export const maisonBuilt = () => !!state.maison;
export const canFoundMaison = () => maisonOpen() && !state.maison && hasCost(MAISON.cost);
export function foundMaison(at) {
    if (!canFoundMaison()) return false;
    payCost(MAISON.cost);
    state.maison = { name: 'Ma Maison', emblem: 'apple', palette: 0, rep: 0, stock: [], work: null, wait: {}, made: 0, sold: 0, n: 0 };
    sfx('level');
    burst(at, 'sparkle', 14);
    toast('La Maison ouvre son atelier : à vous de composer vos coffrets', ['ui', 'heart']);
    return true;
}
export const brandName = () => (M() ? M().name : '');
export function renameBrand(_, n) {
    n = String(n || '').trim().slice(0, 22);
    if (!M() || !n) return false;
    M().name = n;
    return true;
}
// ---- la réputation ----
export const maisonTier = () => (M() ? MAISON.rep.filter(v => M().rep >= v).length - 1 : 0);
export const maisonNext = () => (M() ? MAISON.rep[maisonTier() + 1] : null);
export const emblemsOpen = () => Math.min(EMBLEMS.length, 6 + 6 * maisonTier());
export const clientsOpen = () => MAISON_CLIENTS.filter(c => c.tier <= maisonTier());
export function setEmblem(id) {
    if (!M() || EMBLEMS.indexOf(id) < 0 || EMBLEMS.indexOf(id) >= emblemsOpen()) return false;
    M().emblem = id;
    return true;
}
export function setPalette(i) {
    if (!M() || !PALETTES[i]) return false;
    M().palette = i;
    return true;
}
// ---- l'atelier ----
const kindOf = id => MAISON.kinds[ITEMS[id].type] || 'autre';
export const stockable = () =>
    Object.values(ITEMS)
        .filter(i => i.sell && MAISON.kinds[i.type] && (state.inventory[i.id] || 0) > 0)
        .map(i => i.id);
export function coffretMult(items, q) {
    const kinds = new Set(items.map(kindOf));
    return MAISON.base + (kinds.size === 3 ? MAISON.variety : 0) + MAISON.quality[q] + MAISON.repMult * maisonTier();
}
export const coffretValue = (items, q) => Math.round(items.reduce((a, id) => a + ITEMS[id].sell, 0) * coffretMult(items, q));
// trois produits (deux fois le même est permis seulement si on en a deux)
export function canMake(items, q) {
    if (!M() || M().work || M().stock.length >= MAISON.stock || items.length !== 3) return false;
    if (items.some(id => !ITEMS[id] || !ITEMS[id].sell || !MAISON.kinds[ITEMS[id].type])) return false;
    const need = {};
    items.forEach(id => (need[id] = (need[id] || 0) + 1));
    return Object.entries(need).every(([id, n]) => haveQ(id, q) >= n);
}
export function makeCoffret(items, q = 0, at) {
    if (!canMake(items, q)) return false;
    items.forEach(id => takeQ(id, 1, q));
    M().work = { items: items.slice(), q, ready: now() + MAISON.time };
    sfx('pop');
    burst(at, 'sparkle', 8);
    return true;
}
export const workLeft = () => (M() && M().work ? Math.max(0, M().work.ready - now()) : 0);
function finish() {
    const w = M().work;
    M().n++;
    const uid = M().n;
    const nm = `Coffret ${ITEMS[w.items[0]].name} & ${ITEMS[w.items[1]].name}`;
    M().stock.push({ uid, name: nm, items: w.items, q: w.q, value: coffretValue(w.items, w.q), made: now() });
    M().work = null;
    M().made++;
    state.stats.coffrets = (state.stats.coffrets || 0) + 1;
    if (view.started) toast(`Un coffret est prêt : ${nm}`, ['ui', 'heart']);
}
// ---- la vente ----
export const clientReady = c => now() >= ((M() && M().wait[c.id]) || 0);
export const canSellTo = (cof, c) => !!cof && c.tier <= maisonTier() && clientReady(c) && cof.q >= c.minQ;
export const offerFor = (cof, c) => Math.round(cof.value * c.pay);
export function sellCoffret(uid, cid, at) {
    const cof = M() && M().stock.find(x => x.uid === uid);
    const c = MAISON_CLIENTS.find(x => x.id === cid);
    if (!cof || !c || !canSellTo(cof, c)) return false;
    M().stock = M().stock.filter(x => x !== cof);
    M().wait[c.id] = now() + MAISON.wait;
    earn(offerFor(cof, c), at);
    const before = maisonTier();
    M().rep += 1 + (cof.q > c.minQ ? 1 : 0) + (new Set(cof.items.map(kindOf)).size === 3 ? 1 : 0);
    M().sold++;
    state.stats.coffretsSold = (state.stats.coffretsSold || 0) + 1;
    addXp(MAISON.xp, at);
    sfx('coin');
    burst(at, 'sparkle', 10);
    if (maisonTier() > before && view.started) {
        sfx('level');
        const nc = MAISON_CLIENTS.find(x => x.tier === maisonTier());
        toast(`La réputation de ${M().name} grandit${nc ? ` : ${nc.name} s’intéresse à vous` : ''}`, ['ui', 'heart']);
    }
    return true;
}
export function maisonTick() {
    if (!M()) return false;
    if (M().work && now() >= M().work.ready && M().stock.length < MAISON.stock) {
        finish();
        return true;
    }
    return false;
}
export const maisonReady = () =>
    !M() ? 0 : (M().work && now() >= M().work.ready ? 1 : 0) + M().stock.filter(c => clientsOpen().some(k => canSellTo(c, k))).length;
