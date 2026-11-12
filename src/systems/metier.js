// 1.114 : les spécialités de ferme (voir data/metiers.js).
// state.metier = { id, r: { [métier]: { rank, base: {clé: valeur au début du rang}, kept: {clé: acquis quand le métier dort} } },
//                  c: { crop, animal, fruit, dish, drink, fish }, changes, at }
import { state, ecoLvl } from '../core/state.js';
import { now } from '../core/clock.js';
import { toast, sfx, emit } from '../core/bus.js';
import { ITEMS } from '../data/items.js';
import { RECIPES } from '../data/machines.js';
import { itemKind } from '../data/paquets.js';
import { METIERS, METIER_RANKS, METIER_FX, METIER_CHANGE, DRINK_MACHINES, METIER_DEMAND, METIER_CLIENT, METIER_SIGN, CLIENTS } from '../data/metiers.js';
import { dateKey } from '../core/format.js';
import { BALANCE } from '../data/progress.js';

const M = () => state.metier || (state.metier = { id: null, r: {}, c: {}, changes: 0, at: 0 });
const slot = id => M().r[id] || (M().r[id] = { rank: 0, base: {}, kept: {} });

// ---- à quel métier appartient un produit ----
const isDrink = id => !!(RECIPES[id] && DRINK_MACHINES.includes(RECIPES[id].machine));
export function metierOf(id) {
    const d = ITEMS[id];
    if (!d) return null;
    if (d.type === 'crop') return 'maraicher';
    if (d.type === 'tree' || id === 'honey' || id[0] === 'H') return 'arbo';
    if (d.type === 'fish' || itemKind(id) === 'mer') return 'pecheur';
    if (d.type === 'product') return 'eleveur';
    if (isDrink(id)) return 'vigneron';
    if (d.type === 'artisan' && itemKind(id) === 'cuisine') return 'cuisinier';
    return null;
}
const COUNTER = { maraicher: 'crop', eleveur: 'animal', arbo: 'fruit', cuisinier: 'dish', vigneron: 'drink', pecheur: 'fish' };
// appelé à chaque production (récolte, ramassage, pêche, atelier) : les compteurs tournent toujours, quel que soit le métier actif
export function metierCount(id, qty) {
    const m = metierOf(id);
    if (!m || !(qty > 0)) return;
    const c = M().c,
        k = COUNTER[m];
    c[k] = (c[k] || 0) + qty;
}

// ---- le métier actif et ses rangs ----
export const metierId = () => (state.metier && METIERS[state.metier.id] ? state.metier.id : null);
export const metierRankOf = id => (state.metier && state.metier.r[id] ? state.metier.r[id].rank : 0);
export const metierRank = () => (metierId() ? metierRankOf(metierId()) : 0);
// le rang qui compte pour les bonus d'un métier : zéro s'il dort
export const metierActive = id => (metierId() === id ? metierRankOf(id) : 0);
const read = key => (key[0] === 'c' ? M().c[key.slice(2)] : state.stats[key.slice(2)]) || 0;
export const metierLessons = (id = metierId()) => (id && metierRankOf(id) < METIER_RANKS ? METIERS[id].lessons[metierRankOf(id)] : []);
export function lessonDone(l, id = metierId()) {
    const s = slot(id);
    const got = id === metierId() ? read(l.key) - (s.base[l.key] || 0) : s.kept[l.key] || 0;
    return Math.max(0, Math.min(l.n, Math.floor(got)));
}
export const metierCanRank = () => !!metierId() && metierRank() < METIER_RANKS && metierLessons().every(l => lessonDone(l) >= l.n);
const startRank = id => {
    const s = slot(id);
    s.base = {};
    s.kept = {};
    for (const l of metierLessons(id)) s.base[l.key] = read(l.key);
};
export function metierRankUp() {
    if (!metierCanRank()) return false;
    const id = metierId(),
        s = slot(id);
    s.rank++;
    startRank(id);
    state.stats.metierRanks = (state.stats.metierRanks || 0) + 1;
    sfx('level');
    emit('confetti');
    toast(s.rank >= METIER_RANKS ? `${METIERS[id].master} : le plus haut rang !` : `${METIERS[id].name}, rang ${s.rank}`, METIERS[id].icon);
    return true;
}

// ---- choisir, changer ----
export const metierChangeCost = () => (M().changes < 1 ? 0 : METIER_CHANGE.coins(Math.round(ecoLvl())));
export const metierChangeWait = (t = now()) => (M().changes < 1 || !M().at ? 0 : Math.max(0, M().at + METIER_CHANGE.wait - t));
export const metierCanChange = () => metierChangeWait() <= 0 && state.money >= metierChangeCost();
export function chooseMetier(id) {
    if (!METIERS[id] || id === metierId()) return false;
    const m = M(),
        first = !metierId();
    if (!first) {
        if (!metierCanChange()) {
            sfx('error');
            return false;
        }
        state.money -= metierChangeCost();
        // l'ancien métier s'endort : on garde ce qui était acquis dans ses leçons en cours
        const old = slot(m.id);
        old.kept = {};
        for (const l of metierLessons(m.id)) old.kept[l.key] = Math.max(0, read(l.key) - (old.base[l.key] || 0));
        m.changes++;
        m.at = now();
    }
    m.id = id;
    // le nouveau reprend là où il en était
    const s = slot(id),
        kept = s.kept || {};
    s.base = {};
    for (const l of metierLessons(id)) s.base[l.key] = read(l.key) - Math.min(l.n, kept[l.key] || 0);
    s.kept = {};
    sfx('ok');
    toast(first ? `Votre ferme se spécialise : ${METIERS[id].name.toLowerCase()}` : `Nouveau métier : ${METIERS[id].name.toLowerCase()}. L’ancien garde ses rangs, ses bonus dorment.`, METIERS[id].icon);
    return true;
}

// ---- les bonus ----
export const metierPriceRate = (id = metierId()) => {
    const r = metierActive(id);
    return r ? METIERS[id].rate * r + (r >= METIER_RANKS ? METIER_FX.master : 0) : 0;
};
// le prix d'un produit au marché et à l'étal
export const metierPrice = item => {
    const id = metierId();
    return id && metierOf(item) === id ? 1 + metierPriceRate(id) + (signature() === item ? METIER_SIGN.pay : 0) : 1;
};
// les bouteilles de cave et les bières du vigneron
export const metierCellar = () => 1 + metierPriceRate('vigneron') * (metierId() === 'vigneron' ? 1 : 0);
const mine = item => !!metierId() && metierOf(item) === metierId();
export const metierOrderPay = items => (metierRank() >= METIER_FX.orders.rank && items.some(mine) ? 1 + METIER_FX.orders.pay : 1);
export const metierTransportPay = item => (metierRank() >= METIER_FX.transport.rank && mine(item) ? 1 + METIER_FX.transport.pay : 1);
export const metierPerks = (id = metierId()) => {
    if (!id) return [];
    const d = METIERS[id],
        pct = n => Math.round(n * 100);
    return [
        { rank: 1, text: `Le marché et l’étal paient ${d.what} ${pct(d.rate)} % de plus par rang (${pct(d.rate * METIER_RANKS)} % au rang 10)` },
        { rank: METIER_FX.orders.rank, text: `Une commande du village qui en contient paie ${pct(METIER_FX.orders.pay)} % de plus` },
        { rank: METIER_CLIENT.rank, text: `${CLIENTS[id].name}, ${CLIENTS[id].who}, passe une commande par jour, payée ${METIER_CLIENT.pay} fois` },
        { rank: METIER_SIGN.rank, text: `Votre produit signature : un produit du métier que vous maîtrisez, vendu ${pct(METIER_SIGN.pay)} % plus cher` },
        { rank: METIER_FX.transport.rank, text: `Le train et l’avion-cargo les paient ${pct(METIER_FX.transport.pay)} % de plus` },
        { rank: METIER_RANKS, text: `${d.master} : encore ${pct(METIER_FX.master)} % de prix, et le titre sur votre carte de visite` },
    ];
};
export const metierTitle = () => {
    const id = metierId();
    if (!id) return '';
    return metierRank() >= METIER_RANKS ? METIERS[id].master : `${METIERS[id].name}, rang ${metierRank()}`;
};

// ---------------- 1.115 : le monde réagit ----------------
// la part des commandes, wagons et soutes qui demandent un produit du métier
export const metierDemand = () => (metierId() ? Math.min(METIER_DEMAND.max, METIER_DEMAND.base + METIER_DEMAND.per * metierRank()) : 0);
// choisit dans une liste un produit du métier, une fois sur metierDemand() (sinon null : on tire comme d'habitude)
export function metierPick(list, rnd = Math.random) {
    const id = metierId();
    if (!id || rnd() >= metierDemand()) return null;
    const mine = list.filter(i => metierOf(i.id || i) === id);
    return mine.length ? mine[Math.floor(rnd() * mine.length)] : null;
}

// le produit signature (rang 5)
export const signature = () => {
    const m = state.metier;
    return m && m.id && m.sig && m.sig[m.id] && metierRank() >= METIER_SIGN.rank ? m.sig[m.id] : null;
};
export const signatureWait = (t = now()) => {
    const m = state.metier;
    const at = m && m.sigAt && m.sigAt[metierId()];
    return at ? Math.max(0, at + METIER_SIGN.change - t) : 0;
};
export function setSignature(item, can = () => true) {
    const id = metierId();
    if (!id || metierRank() < METIER_SIGN.rank || metierOf(item) !== id || !can(item) || signatureWait() > 0) return false;
    const m = M();
    m.sig = m.sig || {};
    m.sigAt = m.sigAt || {};
    if (m.sig[id] === item) return false;
    if (m.sig[id]) m.sigAt[id] = now();
    m.sig[id] = item;
    sfx('ok');
    toast(`Votre produit signature : ${ITEMS[item].name}`, ['item', item]);
    return true;
}

// le client attitré (rang 4) : une commande par jour
export const clientOf = (id = metierId()) => (id ? CLIENTS[id] : null);
export const clientOpen = () => metierRank() >= METIER_CLIENT.rank;
const today = () => dateKey(new Date(now()));
// pool : les produits qu'on peut demander (questPool d'orders.js), qty(it, valeur) : la quantité pour une valeur donnée
export function clientOrder(pool, qtyFor, target, xpBonus = 1) {
    if (!clientOpen()) return null;
    const m = M(),
        id = metierId();
    if (m.client && m.client.day === today() && m.client.m === id) return m.client;
    const mine = pool.filter(i => metierOf(i.id) === id);
    if (!mine.length) return null;
    const n = Math.min(mine.length, METIER_CLIENT.items[Math.random() < 0.5 ? 0 : 1]);
    const picks = [];
    const sig = signature();
    if (sig && mine.some(i => i.id === sig)) picks.push(mine.find(i => i.id === sig));
    while (picks.length < n) {
        const it = mine[Math.floor(Math.random() * mine.length)];
        if (!picks.includes(it)) picks.push(it);
    }
    const items = picks.map(it => ({ id: it.id, qty: qtyFor(it, target * (0.7 + Math.random() * 0.6)) }));
    const value = items.reduce((a, x) => a + ITEMS[x.id].sell * x.qty, 0);
    m.client = {
        day: today(),
        m: id,
        items,
        gold: Math.round((value * BALANCE.orderPay * METIER_CLIENT.pay * (1 + metierPriceRate())) / 5) * 5,
        xp: Math.max(5, Math.round(value * BALANCE.orderXp * xpBonus)),
        done: false,
    };
    return m.client;
}
export const clientDone = () => !!(state.metier && state.metier.client && state.metier.client.day === today() && state.metier.client.done);
