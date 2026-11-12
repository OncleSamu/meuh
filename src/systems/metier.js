// 1.114 : les spécialités de ferme (voir data/metiers.js).
// state.metier = { id, r: { [métier]: { rank, base: {clé: valeur au début du rang}, kept: {clé: acquis quand le métier dort} } },
//                  c: { crop, animal, fruit, dish, drink, fish }, changes, at }
import { state, ecoLvl } from '../core/state.js';
import { now } from '../core/clock.js';
import { toast, sfx, emit } from '../core/bus.js';
import { ITEMS } from '../data/items.js';
import { RECIPES } from '../data/machines.js';
import { itemKind } from '../data/paquets.js';
import { METIERS, METIER_RANKS, METIER_FX, METIER_CHANGE, DRINK_MACHINES } from '../data/metiers.js';

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
    return id && metierOf(item) === id ? 1 + metierPriceRate(id) : 1;
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
        { rank: METIER_FX.transport.rank, text: `Le train et l’avion-cargo les paient ${pct(METIER_FX.transport.pay)} % de plus` },
        { rank: METIER_RANKS, text: `${d.master} : encore ${pct(METIER_FX.master)} % de prix, et le titre sur votre carte de visite` },
    ];
};
export const metierTitle = () => {
    const id = metierId();
    if (!id) return '';
    return metierRank() >= METIER_RANKS ? METIERS[id].master : `${METIERS[id].name}, rang ${metierRank()}`;
};
