// Le château de Margaux (1.37) : mise en cuvée et classement, vente en primeur, visiteurs et accords, concours des vins.
// Le château s'ajoute à la cave : une cuvée est un état d'un lot de la cave (lot.cuv puis lot.cl), jamais une seconde liste.
import { state } from '../core/state.js';
import { now } from '../core/clock.js';
import { toast, sfx, burst } from '../core/bus.js';
import { ITEMS } from '../data/items.js';
import { QUALITY } from '../data/farm.js';
import { CAVE_ITEMS } from '../data/cave.js';
import { newChateau, CHATEAU_CLASSES, REP_TIERS, REP_MAX, PRIMEUR, TOURISM, PAIRINGS, CONTEST } from '../data/chateau.js';
import { projectDone } from './story.js';
import { tip } from './tips.js';
import { earn, addXp } from './player.js';
import { addPhoto } from './style.js';
import { qual, clampQuality } from './farm.js';
import { unitPrice } from './market.js';

export { newChateau };
export function ensureChateau() {
    const c = (state.chateau = state.chateau || newChateau());
    const n = newChateau();
    for (const k of Object.keys(n)) if (c[k] === undefined) c[k] = n[k];
    c.classes = [0, 1, 2, 3, 4].map(i => c.classes[i] || 0);
    c.medals = [0, 1, 2, 3].map(i => c.medals[i] || 0);
    return c;
}

export const chateauOpen = () => projectDone('chateauChai');
export const primeurOpen = () => projectDone('tastingRoom');
export const shopOpen = () => projectDone('chateauShop');
export const wineContestOpen = () => projectDone('harvestFest');

export const isWineLot = lot => !!lot && lot.id !== 'beer' && ['wine', 'champagne'].includes(CAVE_ITEMS[lot.id]);

// ---------------- réputation ----------------
export const repStars = () => {
    const r = ensureChateau().rep;
    let s = 0;
    REP_TIERS.forEach((t, i) => {
        if (r >= t && i > 0) s = i;
    });
    return Math.min(REP_MAX, s);
};
export const repNext = () => REP_TIERS[repStars() + 1];

// ---------------- classement ----------------
// rang de cave 2 : cru du château ; chaque rang de plus monte d'un cran, et une qualité au moins égale au rang en gagne un autre
export function classOf(lot) {
    if (!lot || lot.bad || lot.rank < 2) return 0;
    return Math.min(4, lot.rank - 1 + ((lot.q || 0) >= lot.rank ? 1 : 0));
}
export const classMult = lot =>
    (lot && lot.cl && CHATEAU_CLASSES[lot.cl] ? CHATEAU_CLASSES[lot.cl].mult : 1) * (lot && lot.md ? CONTEST.medals[lot.md].mult : 1);
export const className = c => (CHATEAU_CLASSES[c] ? CHATEAU_CLASSES[c].name : '');

// mettre un lot de la cave en cuvée du château (gratuit : le lot est goûté et classé à sa sortie)
export function canCuvee(lot) {
    return chateauOpen() && isWineLot(lot) && !lot.cuv && !lot.bad && lot.rank < 4;
}
export function makeCuvee(i) {
    const lot = state.cave.slots[i];
    if (!lot || !canCuvee(lot)) return false;
    lot.cuv = 1;
    sfx('level');
    return true;
}

// à la sortie de la cave : le classement, la réputation, le primeur réglé. Renvoie le lot à ranger en réserve (ses champs en plus)
export function settleOnExit(lot, kept, valueFn, at) {
    ensureChateau();
    const c = state.chateau;
    if (lot.cuv) {
        const cl = classOf(lot);
        if (cl) {
            kept.cl = cl;
            c.classes[cl]++;
            const before = repStars();
            c.rep += CHATEAU_CLASSES[cl].stars;
            toast(`${className(cl)} ! ${CHATEAU_CLASSES[cl].stars} point${CHATEAU_CLASSES[cl].stars > 1 ? 's' : ''} de réputation`, ['ui', 'star']);
            if (repStars() > before) toast(`Le château gagne une étoile (${repStars()} sur ${REP_MAX})`, ['ui', 'star']);
            if (cl >= 4) addPhoto('ui', 'star', 'Un cru d’exception', 'Classé par Octave');
        } else toast('Octave goûte la cuvée : pas assez vieille pour être classée.', ['ui', 'cave']);
    }
    if (lot.pr) settlePrimeur(lot, at, valueFn);
    return kept;
}

// ---------------- vente en primeur ----------------
const estimate = (lot, r, valueFn) => valueFn({ ...lot, rank: r, bad: false, pr: undefined });
export const primeurLots = () => state.cave.slots.filter(l => l && l.pr);
export const canPrimeur = lot => primeurOpen() && !!lot && !lot.bad && !lot.pr && lot.rank < 4 && primeurLots().length < PRIMEUR.maxLots;
export const primeurRanks = lot => [2, 3, 4].filter(r => r > lot.rank && r >= PRIMEUR.minRank);
export const primeurQuote = (lot, r, valueFn) => {
    const est = estimate(lot, r, valueFn);
    return { est, paid: Math.min(PRIMEUR.cap, Math.round(est * PRIMEUR.frac)) };
};
export function sellPrimeur(i, r, valueFn, at) {
    const lot = state.cave.slots[i];
    if (!lot || !canPrimeur(lot) || !primeurRanks(lot).includes(r)) return false;
    const q = primeurQuote(lot, r, valueFn);
    lot.pr = { r, paid: q.paid, est: q.est };
    earn(q.paid, at);
    state.income.cave = (state.income.cave || 0) + q.paid;
    sfx('coin');
    return true;
}
// la promesse tenue ajoute un bonus ; manquée, on rend ce qui dépasse la part de la valeur réelle (jamais plus que la somme reçue)
export function settlePrimeur(lot, at, valueFn) {
    const c = ensureChateau(),
        p = lot.pr;
    if (!p) return 0;
    delete lot.pr;
    if (!lot.bad && lot.rank >= p.r) {
        const b = Math.round(p.est * PRIMEUR.bonus);
        earn(b, at);
        c.primeur.won++;
        c.primeur.bonus += b;
        toast(`Primeur tenu : l’acheteur ajoute ${b} pièces`, ['ui', 'coin']);
        return b;
    }
    const actual = valueFn ? valueFn(lot) : 0;
    const owed = Math.min(p.paid, state.money, Math.max(0, p.paid - Math.round(actual * PRIMEUR.frac)));
    state.money -= owed;
    c.primeur.lost++;
    c.primeur.refunded = (c.primeur.refunded || 0) + owed;
    toast(owed ? `Primeur manqué : ${owed} pièces rendues à l’acheteur` : 'Primeur manqué, mais rien à rendre', ['ui', 'coin']);
    return -owed;
}

// ---------------- tourisme ----------------
const rnd = a => a[Math.floor(Math.random() * a.length)];
export const visitEvery = () => TOURISM.every / (1 + 0.4 * repStars());
export const queueMax = () => TOURISM.queue + repStars();
export const visitorWines = () => TOURISM.wines.filter(([, s]) => s <= repStars()).map(([id]) => id);

export function visitorTick() {
    if (chateauOpen()) tip('chateau');
    if (primeurOpen()) tip('primeur');
    if (!shopOpen()) return false;
    tip('visitors');
    const c = ensureChateau(),
        t = now();
    const before = c.vis.length;
    c.vis = c.vis.filter(v => v.until > t);
    let changed = c.vis.length !== before;
    if (!c.nextVisit) c.nextVisit = t + visitEvery();
    // au retour d'une absence : pas plus de visiteurs que la file n'en tient
    let guard = 0;
    while (c.nextVisit <= t && guard++ < 10) {
        if (c.vis.length < queueMax()) {
            const wine = rnd(visitorWines());
            c.vis.push({
                id: ++c.uid,
                wine,
                n: 1 + Math.floor(Math.random() * (1 + Math.min(2, repStars()))),
                pair: rnd(PAIRINGS[wine]),
                until: c.nextVisit + TOURISM.stay,
            });
            changed = true;
        }
        c.nextVisit += visitEvery();
    }
    if (c.nextVisit < t) c.nextVisit = t + visitEvery();
    return changed;
}

// le stock de la ferme seulement : jamais le coffre-fort, qui est une autre liste
export const haveWine = v => (state.inventory[v.wine] || 0) >= v.n;
export const havePair = v => (state.inventory[v.pair] || 0) >= 1;
export const visitorPrice = (v, pair) => {
    const o = qual(v.wine);
    // les bouteilles ordinaires partent d'abord
    const plain = Math.max(0, (state.inventory[v.wine] || 0) - Object.values({ s: o.s, g: o.g, p: o.p, d: o.d }).reduce((a, b) => a + (b || 0), 0));
    let sum = 0,
        left = v.n;
    const take = Math.min(plain, left);
    sum += take * unitPrice(v.wine, 0, 1);
    left -= take;
    for (const [r, k] of [
        [1, 's'],
        [2, 'g'],
        [3, 'p'],
        [4, 'd'],
    ]) {
        const t = Math.min(o[k] || 0, left);
        sum += t * unitPrice(v.wine, r, 1);
        left -= t;
    }
    const mult = TOURISM.base + TOURISM.bonus * repStars() + (pair ? TOURISM.pairBonus : 0);
    return Math.round(sum * mult);
};
export function serveVisitor(id, pair, takeFn, at) {
    const c = ensureChateau(),
        k = c.vis.findIndex(v => v.id === id);
    if (k < 0) return false;
    const v = c.vis[k];
    if (!shopOpen() || !haveWine(v) || (pair && !havePair(v))) return false;
    const gain = visitorPrice(v, pair);
    takeFn(v.wine, v.n, 0);
    clampQuality(v.wine);
    if (pair) {
        takeFn(v.pair, 1, 0);
        clampQuality(v.pair);
        c.pairs++;
    }
    c.vis.splice(k, 1);
    c.served++;
    earn(gain, at);
    state.income.cave = (state.income.cave || 0) + gain;
    addXp(Math.round(gain / 40), at);
    sfx('coin');
    burst(at, 'sparkle', 8);
    return gain;
}
export const visitorLeave = id => {
    const c = ensureChateau();
    c.vis = c.vis.filter(v => v.id !== id);
};

// ---------------- concours des vins ----------------
export const monthKey = () => {
    const d = new Date(now());
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};
export const wineContestDone = () => ensureChateau().contest.month === monthKey();
export const wineMedalOf = cl => (cl >= 3 ? 3 : cl);
export const wineContestLots = () => state.cave.reserve.filter(l => l.cl && !l.md && l.id !== 'beer');
export function enterWineContest(uid, valueFn, at) {
    const c = ensureChateau();
    const lot = state.cave.reserve.find(l => l.uid === uid);
    if (!wineContestOpen() || wineContestDone() || !lot || !lot.cl || lot.md) return false;
    const m = wineMedalOf(lot.cl);
    lot.md = m;
    c.contest = { month: monthKey(), medal: m };
    c.medals[m]++;
    const def = CONTEST.medals[m];
    const prize = Math.round(valueFn(lot) * def.prize);
    state.prestige.rubans += def.rubans;
    earn(prize, at);
    sfx('level');
    toast(`${def.name} ! ${def.rubans} ruban${def.rubans > 1 ? 's' : ''} et ${prize} pièces`, ['ui', 'trophy']);
    addPhoto('ui', 'trophy', def.name, 'Concours des vins du château');
    return true;
}

export const rankStars = lot => (lot && lot.cl ? CHATEAU_CLASSES[lot.cl].stars : 0);
export const qualityName = q => QUALITY[q].name;
export const wineName = id => ITEMS[id].name;
