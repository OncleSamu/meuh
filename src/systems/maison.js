// 1.100 (étape 3) : la Maison, votre marque (voir data/maison.js).
import { state } from '../core/state.js';
import { now } from '../core/clock.js';
import { view } from '../core/view.js';
import { toast, sfx, burst } from '../core/bus.js';
import { ITEMS } from '../data/items.js';
import { MAISON, MAISON_CLIENTS, EMBLEMS, PALETTES } from '../data/maison.js';
import { PACKS, PACK, KIND_OF_TYPE, NAME_IDEAS, NAME_MAX, RECIPES_MAX } from '../data/paquets.js';
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
    state.maison = { name: 'Ma Maison', emblem: 'apple', palette: 0, rep: 0, stock: [], work: null, wait: {}, made: 0, sold: 0, n: 0, recipes: [], rn: 0 };
    sfx('level');
    burst(at, 'sparkle', 14);
    toast('La Maison ouvre son atelier : à vous de composer vos paquets', ['ui', 'heart']);
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
// 1.101.2 : un emblème est un dessin du jeu, au choix : « genre:id » (ou un simple produit)
export const emblemOk = e => /^(item|animal|machine|villager|ui):[\w-]+$/.test(String(e)) || !!ITEMS[e];
export const clientsOpen = () => MAISON_CLIENTS.filter(c => c.tier <= maisonTier());
export function setEmblem(id) {
    if (!M() || !emblemOk(id)) return false;
    M().emblem = id;
    return true;
}
export function setPalette(i) {
    if (!M() || !PALETTES[i]) return false;
    M().palette = i;
    return true;
}
// ---- l'atelier ----
export const kindOf = id => (ITEMS[id] && KIND_OF_TYPE[ITEMS[id].type]) || 'autre';
export const canPack = id => !!ITEMS[id] && !!ITEMS[id].sell && !!KIND_OF_TYPE[ITEMS[id].type];
export const stockable = () =>
    Object.values(ITEMS)
        .filter(i => canPack(i.id) && (state.inventory[i.id] || 0) > 0)
        .map(i => i.id);
// ---- les boîtes ----
export const packOpen = id => !!PACK[id] && PACK[id].tier <= maisonTier();
export const packFits = (id, items) => !!PACK[id] && (PACK[id].fits === '*' || items.every(x => PACK[id].fits.includes(kindOf(x))));
export const packCan = id => !!PACK[id] && hasCost(PACK[id].cost);
// la plus belle boîte qui convient : la plus spécialisée d'abord (un panier pour des fruits), la plus haute en palier ensuite
export function autoPack(items) {
    const ok = PACKS.filter(p => packOpen(p.id) && packFits(p.id, items));
    const spec = p => (p.fits === '*' ? 99 : p.fits.length);
    ok.sort((a, b) => spec(a) - spec(b) || b.tier - a.tier);
    return ok.length ? ok[0].id : 'carton';
}
export function kindOfSet(items) {
    const k = [...new Set(items.map(kindOf))];
    return k.length === 1 ? k[0] : 'mixte';
}
export const nameIdeas = items => NAME_IDEAS[kindOfSet(items)] || NAME_IDEAS.mixte;
// la meilleure qualité que l'on peut donner à ce paquet (toutes les unités au moins de ce rang)
export const canHaveQ = (items, q) => canHave(items, q);
export function bestQ(items) {
    for (let q = 4; q > 0; q--) if (canHave(items, q)) return q;
    return 0;
}
function canHave(items, q) {
    const need = {};
    items.forEach(id => (need[id] = (need[id] || 0) + 1));
    return Object.entries(need).every(([id, n]) => haveQ(id, q) >= n);
}
export function coffretMult(items, q, pack) {
    const kinds = new Set(items.map(kindOf));
    return MAISON.base + (kinds.size === 3 ? MAISON.variety : 0) + MAISON.quality[q] + MAISON.repMult * maisonTier() + ((PACK[pack] && PACK[pack].bonus) || 0);
}
export const coffretValue = (items, q, pack) => Math.round(items.reduce((a, id) => a + ITEMS[id].sell, 0) * coffretMult(items, q, pack));
// trois produits (le même plusieurs fois est permis si on en a assez), une boîte qui leur va et dont on a les matériaux
export function canMake(items, q, pack) {
    if (!M() || M().work || M().stock.length >= MAISON.stock || items.length !== 3) return false;
    if (items.some(id => !canPack(id))) return false;
    if (!packOpen(pack) || !packFits(pack, items) || !packCan(pack)) return false;
    return canHave(items, q);
}
const cleanName = n => String(n || '').trim().replace(/\s+/g, ' ').slice(0, NAME_MAX);
export function makeCoffret(items, q = 0, at, opts = {}) {
    const pack = opts.pack || autoPack(items);
    if (!canMake(items, q, pack)) return false;
    payCost(PACK[pack].cost);
    items.forEach(id => takeQ(id, 1, q));
    const name = cleanName(opts.name) || nameIdeas(items)[0];
    const rid = noteRecipe(items, q, pack, name);
    M().work = { items: items.slice(), q, pack, name, rid, ready: now() + MAISON.time };
    sfx('pop');
    burst(at, 'sparkle', 8);
    return true;
}
// ---- les recettes de paquets : chaque paquet composé est gardé, pour le refaire d'un geste ----
export const recipes = () => (M() && M().recipes) || [];
export const recipeAt = rid => recipes().find(r => r.id === rid);
const sameSet = (a, b) => a.slice().sort().join() === b.slice().sort().join();
function noteRecipe(items, q, pack, name) {
    const m = M();
    m.recipes = m.recipes || [];
    let r = m.recipes.find(x => x.pack === pack && x.q === q && sameSet(x.items, items));
    if (r) r.name = name;
    else {
        m.rn = (m.rn || 0) + 1;
        r = { id: m.rn, name, pack, items: items.slice(), q, made: 0, sold: 0 };
        m.recipes.push(r);
        if (m.recipes.length > RECIPES_MAX) m.recipes.splice(0, m.recipes.length - RECIPES_MAX);
    }
    return r.id;
}
export function renameRecipe(rid, n) {
    const r = recipeAt(+rid);
    n = cleanName(n);
    if (!r || !n) return false;
    r.name = n;
    if (M().work && M().work.rid === r.id) M().work.name = n;
    M().stock.forEach(c => c.rid === r.id && (c.name = n));
    return true;
}
export function dropRecipe(rid) {
    if (!recipeAt(+rid)) return false;
    M().recipes = M().recipes.filter(r => r.id !== +rid);
    return true;
}
export const canRemake = r => !!r && canMake(r.items, r.q, r.pack);
export function remake(rid, at) {
    const r = recipeAt(+rid);
    return !!r && makeCoffret(r.items, r.q, at, { pack: r.pack, name: r.name });
}
export const workLeft = () => (M() && M().work ? Math.max(0, M().work.ready - now()) : 0);
function finish() {
    const w = M().work;
    M().n++;
    const uid = M().n;
    const nm = w.name || `Coffret ${ITEMS[w.items[0]].name} & ${ITEMS[w.items[1]].name}`;
    const pack = w.pack || 'carton';
    M().stock.push({ uid, name: nm, items: w.items, q: w.q, pack, rid: w.rid || 0, value: coffretValue(w.items, w.q, pack), made: now() });
    const rc = recipeAt(w.rid);
    if (rc) rc.made++;
    M().work = null;
    M().made++;
    state.stats.coffrets = (state.stats.coffrets || 0) + 1;
    if (view.started) toast(`Un paquet est prêt : ${nm}`, ['ui', 'heart']);
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
    const rc = recipeAt(cof.rid);
    if (rc) rc.sold++;
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
