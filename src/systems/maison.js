// 1.100 (étape 3) : la Maison, votre marque (voir data/maison.js).
import { state } from '../core/state.js';
import { now } from '../core/clock.js';
import { view } from '../core/view.js';
import { toast, sfx, burst } from '../core/bus.js';
import { ITEMS } from '../data/items.js';
import { MAISON, MAISON_CLIENTS, PALETTES, MAISON_ORDERS, ORDER_WHO, PK_GIFT, ASK_WHY } from '../data/maison.js';
import { VILLAGERS } from '../data/village.js';
import { LOVES, GIFT_PTS } from '../data/friends.js';
import { QUALITY } from '../data/farm.js';
import { STARS } from '../data/camping.js';
import { PACKS, PACK, NAME_IDEAS, NAME_MAX, RECIPES_MAX, BOX_VALUE, itemKind, normKind } from '../data/paquets.js';
import { hasCost, payCost } from './home.js';
import { earn, addXp } from './player.js';
import { haveQ, takeQ } from './defis.js';
import { campBuilt, campGuests } from './camping.js';
import { presentVillagers } from './home.js';
import { addFriendship } from './village.js';
import { isBirthday } from './friends.js';

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
export const kindOf = id => itemKind(id) || 'autre';
export const canPack = id => !!ITEMS[id] && !!ITEMS[id].sell && !ITEMS[id].box && !!itemKind(id);
export const stockable = () =>
    Object.values(ITEMS)
        .filter(i => canPack(i.id) && (state.inventory[i.id] || 0) > 0)
        .map(i => i.id);
// ---- les boîtes ----
export const packOpen = id => !!PACK[id] && PACK[id].tier <= maisonTier();
export const packFits = (id, items) => !!PACK[id] && (PACK[id].fits === '*' || items.every(x => PACK[id].fits.includes(kindOf(x))));
// 1.104 : il faut une boîte fabriquée à l'emballerie (le carton est toujours là)
export const boxStock = id => (PACK[id] && PACK[id].item ? state.inventory[PACK[id].item] || 0 : Infinity);
export const packCan = id => !!PACK[id] && boxStock(id) >= 1;
// la plus belle boîte qui convient : la plus spécialisée d'abord (un panier pour des fruits), la plus haute en palier ensuite
export function autoPack(items) {
    const ok = PACKS.filter(p => packOpen(p.id) && packFits(p.id, items) && packCan(p.id));
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
    return MAISON.base + (kinds.size === 3 ? MAISON.variety : 0) + MAISON.repMult * maisonTier() + ((PACK[pack] && PACK[pack].bonus) || 0);
}
// 1.103 : chaque produit compte avec sa qualité, comme partout ailleurs ; un paquet ne fait jamais perdre de valeur
// 1.104 : la boîte compte aussi, 1,5 fois sa valeur
const boxValue = pack => (PACK[pack] && PACK[pack].item && ITEMS[PACK[pack].item] ? ITEMS[PACK[pack].item].sell * BOX_VALUE : 0);
export const coffretValue = (items, q, pack) => Math.round(items.reduce((a, id) => a + ITEMS[id].sell, 0) * ((QUALITY[q] && QUALITY[q].mult) || 1) * coffretMult(items, q, pack) + boxValue(pack));
export const pkValue = c => coffretValue(c.items, c.q, c.pack || 'carton');
// ---- 1.103 : l'atelier va plus vite et lance plusieurs paquets à la suite ----
export const workTime = () => MAISON.times[maisonTier()] || MAISON.time;
export const slotsMax = () => MAISON.slots[maisonTier()] || 1;
export const queue = () => (M() && M().queue) || [];
export const busyCount = () => (M() ? (M().work ? 1 : 0) + queue().length : 0);
export const slotFree = () => !!M() && busyCount() < slotsMax();
// trois produits (le même plusieurs fois est permis si on en a assez), une boîte qui leur va et dont on a les matériaux
export function canMake(items, q, pack) {
    if (!M() || !slotFree() || M().stock.length + busyCount() >= MAISON.stock || items.length !== 3) return false;
    if (items.some(id => !canPack(id))) return false;
    if (!packOpen(pack) || !packFits(pack, items) || !packCan(pack)) return false;
    return canHave(items, q);
}
const cleanName = n => String(n || '').trim().replace(/\s+/g, ' ').slice(0, NAME_MAX);
export function makeCoffret(items, q = 0, at, opts = {}) {
    const pack = opts.pack || autoPack(items);
    if (!canMake(items, q, pack)) return false;
    if (PACK[pack].item) state.inventory[PACK[pack].item]--;
    items.forEach(id => takeQ(id, 1, q));
    const name = cleanName(opts.name) || nameIdeas(items)[0];
    const rid = noteRecipe(items, q, pack, name);
    const job = { items: items.slice(), q, pack, name, rid };
    if (M().work) {
        M().queue = M().queue || [];
        M().queue.push(job);
    } else M().work = { ...job, ready: now() + workTime() };
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
    M().stock.push({ uid, name: nm, items: w.items, q: w.q, pack, rid: w.rid || 0, value: coffretValue(w.items, w.q, pack), made: Math.min(now(), w.ready) });
    const rc = recipeAt(w.rid);
    if (rc) rc.made++;
    // le suivant de la file démarre là où le précédent s'est fini (rattrapage hors ligne)
    const nx = M().queue && M().queue.shift();
    M().work = nx ? { ...nx, ready: w.ready + workTime() } : null;
    M().made++;
    state.stats.coffrets = (state.stats.coffrets || 0) + 1;
    if (view.started) toast(`Un paquet est prêt : ${nm}`, ['ui', 'heart']);
}
// ---- la vente ----
// 1.103 : « les campeurs », ce sont les vrais campeurs du camping : un paquet chacun par séjour
export const camperFor = cof => {
    const ok = campGuests().filter(g => !g.pk && (g.star == null || cof.q >= STARS.q));
    return ok.find(g => g.star != null) || ok[0] || null;
};
export const pkBuyers = () => campGuests().filter(g => !g.pk).length;
export const clientReady = c => (c.camp ? pkBuyers() > 0 : now() >= ((M() && M().wait[c.id]) || 0));
export const canSellTo = (cof, c) => !!cof && c.tier <= maisonTier() && cof.q >= c.minQ && (c.camp ? !!camperFor(cof) : clientReady(c));
export const offerFor = (cof, c, g) => {
    if (c.camp) g = g || camperFor(cof);
    return Math.round(pkValue(cof) * c.pay * (g && g.star != null ? STARS.pay : 1));
};
// 1.103.2 : l'expérience d'une vente de paquet
export const pkXp = pay => Math.round(MAISON.xp + pay * MAISON.xpPay);
function takeCoffret(cof, at, pay, rep) {
    M().stock = M().stock.filter(x => x !== cof);
    earn(pay, at);
    const before = maisonTier();
    M().rep += rep;
    M().sold++;
    const rc = recipeAt(cof.rid);
    if (rc) rc.sold++;
    state.stats.coffretsSold = (state.stats.coffretsSold || 0) + 1;
    sfx('coin');
    burst(at, 'sparkle', 10);
    if (maisonTier() > before && view.started) {
        sfx('level');
        const nc = MAISON_CLIENTS.find(x => x.tier === maisonTier());
        toast(`La réputation de ${M().name} grandit${nc ? ` : ${nc.name} s’intéresse à vous` : ''}`, ['ui', 'heart']);
    }
}
const repOf = (cof, minQ) => 1 + (cof.q > minQ ? 1 : 0) + (new Set(cof.items.map(kindOf)).size === 3 ? 1 : 0);
// vendre à un campeur précis (depuis sa fiche au camping)
export const canSellToGuest = (cof, g) => !!cof && !!g && !g.pk && maisonTier() >= 1 && (g.star == null || cof.q >= STARS.q);
export function sellToGuest(uid, gi, at) {
    const cof = M() && M().stock.find(x => x.uid === uid);
    const g = campGuests()[gi];
    const c = MAISON_CLIENTS.find(x => x.camp);
    if (!cof || !canSellToGuest(cof, g)) return false;
    const pay = offerFor(cof, c, g);
    g.pk = 1;
    takeCoffret(cof, at, pay, repOf(cof, 0) + (g.star != null ? 2 : 0));
    addXp(pkXp(pay), at);
    return true;
}
export function sellCoffret(uid, cid, at) {
    const cof = M() && M().stock.find(x => x.uid === uid);
    const c = MAISON_CLIENTS.find(x => x.id === cid);
    if (!cof || !c || !canSellTo(cof, c)) return false;
    if (c.camp) return sellToGuest(uid, campGuests().indexOf(camperFor(cof)), at);
    M().wait[c.id] = now() + MAISON.wait;
    const pay = offerFor(cof, c);
    takeCoffret(cof, at, pay, repOf(cof, c.minQ));
    addXp(pkXp(pay), at);
    return true;
}
// ---- 1.103 : les commandes de paquets ----
export const orders = () => (M() && M().orders) || [];
export const orderFits = (cof, o) =>
    !!cof && !!o && !o.due && cof.q >= o.q && (o.kind === 'recipe' ? cof.rid === o.rid || sameSet(cof.items, o.items || []) : o.kind === 'any' || (o.kind === 'mixte' ? new Set(cof.items.map(kindOf)).size === 3 : cof.items.every(id => kindOf(id) === normKind(o.kind))));
export const orderPay = (cof, o) => Math.round(pkValue(cof) * MAISON_ORDERS.pay * (1 + 0.1 * o.q));
export const orderReady = o => !o.due && M().stock.some(c => orderFits(c, o));
export function newOrder(seed = Math.random()) {
    let x = Math.floor(seed * 1e9) >>> 0;
    const r = () => ((x = (x * 1103515245 + 12345) >>> 0) / 4294967296);
    // 1.103.1 : un villageois demande un de vos paquets déjà créés
    const vs = presentVillagers().filter(v => !orders().some(o => o.vid === v));
    if (recipes().length && vs.length && r() < MAISON_ORDERS.asks) {
        const rc = recipes()[Math.floor(r() * recipes().length)];
        const vid = vs[Math.floor(r() * vs.length)];
        return { who: VILLAGERS[vid].name, vid, why: ASK_WHY[Math.floor(r() * ASK_WHY.length)], kind: 'recipe', rid: rc.id, items: rc.items.slice(), name: rc.name, pack: rc.pack, q: rc.q };
    }
    const used = orders().map(o => o.who);
    const pool = ORDER_WHO.filter(w => !used.includes(w[0]));
    const [who, why] = pool[Math.floor(r() * pool.length)] || ORDER_WHO[0];
    const kind = MAISON_ORDERS.kinds[Math.floor(r() * MAISON_ORDERS.kinds.length)];
    const q = Math.min(4, Math.floor(r() * (maisonTier() + 1)));
    return { who, why, kind, q };
}
function ordersTick() {
    const m = M();
    if (!m.orders) m.orders = [];
    let changed = false;
    while (m.orders.length < MAISON_ORDERS.max) (m.orders.push(newOrder()), (changed = true));
    m.orders.forEach((o, i) => {
        if (o.due && now() >= o.due) {
            m.orders[i] = newOrder();
            changed = true;
        }
    });
    return changed;
}
export function deliverOrder(oi, uid, at) {
    const o = orders()[oi];
    const cof = M() && M().stock.find(x => x.uid === uid);
    if (!o || !orderFits(cof, o)) return false;
    const pay = orderPay(cof, o);
    takeCoffret(cof, at, pay, MAISON_ORDERS.rep);
    addXp(Math.round(pkXp(pay) * MAISON_ORDERS.xp), at);
    if (o.vid && state.villagers[o.vid]) addFriendship(o.vid, MAISON_ORDERS.friend, at);
    M().orders[oi] = { due: now() + MAISON_ORDERS.gap };
    M().odone = (M().odone || 0) + 1;
    state.stats.coffretOrders = (state.stats.coffretOrders || 0) + 1;
    if (view.started && o.vid) toast(`« ${o.name} » livré à ${o.who} : +${MAISON_ORDERS.friend} d’amitié`, ['villager', o.vid]);
    else if (view.started) toast(`${o.who} est ravi${o.who.startsWith('La ') || o.who.startsWith('Madame') || o.who === 'Lucie' ? 'e' : ''} de son paquet !`, ['ui', 'heart']);
    return true;
}
export function skipOrder(oi) {
    const o = orders()[oi];
    if (!o || o.due) return false;
    M().orders[oi] = { due: now() + MAISON_ORDERS.skip };
    return true;
}
// le meilleur paquet de l'étagère pour une commande (le moins cher qui convient, pour garder les beaux)
export const bestPkFor = o => M().stock.filter(c => orderFits(c, o)).sort((a, b) => pkValue(a) - pkValue(b))[0] || null;
export function maisonTick() {
    if (!M()) return false;
    let changed = ordersTick();
    // plusieurs paquets peuvent s'être finis hors ligne
    for (let k = 0; k < 10 && M().work && now() >= M().work.ready && M().stock.length < MAISON.stock; k++) {
        finish();
        changed = true;
    }
    return changed;
}
export const maisonReady = () =>
    !M() ? 0 : M().stock.filter(c => clientsOpen().some(k => canSellTo(c, k))).length + orders().filter(o => !o.due && M().stock.some(c => orderFits(c, o))).length;

// ---- 1.103.1 : offrir un paquet à un villageois (son cadeau du jour) ----
export const pkGiftPts = (vid, cof) => {
    if (!cof || !VILLAGERS[vid]) return 0;
    const likes = VILLAGERS[vid].likes;
    let pts = PK_GIFT.base;
    cof.items.forEach(id => (pts += id === LOVES[vid] ? PK_GIFT.love : likes.includes(id) ? PK_GIFT.like : 0));
    return pts * (isBirthday(vid) ? GIFT_PTS.birthday : 1);
};
export const pkGiftable = vid => !!M() && M().stock.length > 0 && !!state.villagers[vid] && state.villagers[vid].giftDay !== state.day;
export function giftPaquet(vid, uid, at) {
    const cof = M() && M().stock.find(x => x.uid === uid);
    const v = state.villagers[vid];
    if (!cof || !v || v.giftDay === state.day) return false;
    const pts = pkGiftPts(vid, cof);
    M().stock = M().stock.filter(x => x !== cof);
    v.giftDay = state.day;
    if (cof.items.includes(LOVES[vid])) v.love = true;
    addFriendship(vid, pts, at);
    state.stats.coffretGifts = (state.stats.coffretGifts || 0) + 1;
    sfx('buy');
    burst(at, 'sparkle', 14);
    toast(`${VILLAGERS[vid].name} : « Quel joli paquet, merci ! » +${pts} d’amitié`, ['villager', vid]);
    return true;
}

// ---- 1.104.1 : les paquets dans les transports (train de marchandises, avion-cargo) ----
// une demande : { kind, q } comme une commande de la Maison ; on charge les paquets de l'étagère qui conviennent, les moins chers d'abord
export const pkTransportOk = () => !!M() && maisonTier() >= 1 && recipes().length > 0;
export function pkReq() {
    const kind = MAISON_ORDERS.kinds[Math.floor(Math.random() * MAISON_ORDERS.kinds.length)];
    return { kind, q: Math.min(4, Math.floor(Math.random() * Math.min(3, maisonTier() + 1))) };
}
const KIND_SHORT = { champ: 'du verger et du champ', animaux: 'des animaux', mer: 'de la mer', cuisine: 'de la cuisine', artisanat: 'd’artisanat', mixte: 'de trois genres', any: '' };
export const pkReqTxt = req => `Paquet${KIND_SHORT[normKind(req.kind)] ? ' ' + KIND_SHORT[normKind(req.kind)] : ''}${req.q ? `, ${QUALITY[req.q].name} ou mieux` : ''}`;
// une étiquette courte pour le wagon : « frais · or+ » (rien pour « n'importe quel paquet »)
const KIND_TAG = { champ: 'verger', animaux: 'animaux', mer: 'mer', cuisine: 'cuisine', artisanat: 'artisanat', mixte: '3 genres', any: '' };
export const pkReqTag = req => [KIND_TAG[normKind(req.kind)], req.q ? `${QUALITY[req.q].name}+` : ''].filter(Boolean).join(' · ');
// ce que vaut à peu près un paquet de ce genre (pour annoncer le prix) : la moyenne de vos recettes
export function pkEstimate(req) {
    const vals = recipes().map(r => coffretValue(r.items, Math.max(r.q, req.q), r.pack));
    return Math.max(300, Math.round(vals.reduce((a, v) => a + v, 0) / Math.max(1, vals.length)));
}
const fitsReq = (c, req) => orderFits(c, { kind: req.kind, q: req.q });
export const pkHave = req => (M() ? M().stock.filter(c => fitsReq(c, req)).length : 0);
// retire n paquets qui conviennent (les moins chers) ; la réputation monte comme pour une vente
export function pullPk(req, n) {
    if (pkHave(req) < n) return 0;
    const list = M()
        .stock.filter(c => fitsReq(c, req))
        .sort((a, b) => pkValue(a) - pkValue(b))
        .slice(0, n);
    M().stock = M().stock.filter(c => !list.includes(c));
    list.forEach(c => {
        const rc = recipeAt(c.rid);
        if (rc) rc.sold++;
    });
    M().rep += 2 * n;
    M().sold += n;
    state.stats.coffretsSold = (state.stats.coffretsSold || 0) + n;
    state.stats.coffretShipped = (state.stats.coffretShipped || 0) + n;
    return n;
}
