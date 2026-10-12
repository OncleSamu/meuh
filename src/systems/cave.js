// La cave (Atelier | Cave) : vieillissement par étapes, climat et soins, réserve, salle des ventes.
import { state } from '../core/state.js';
import { now } from '../core/clock.js';
import { view } from '../core/view.js';
import { fmt } from '../core/format.js';
import { toast, sfx, buzz, burst } from '../core/bus.js';
import { ITEMS } from '../data/items.js';
import { VILLAGERS } from '../data/village.js';
import {
    CAVE_LVL,
    CAVE_H,
    CAVE_FAMILIES,
    CAVE_ITEMS,
    CAVE_MULT,
    CAVE_TURNED,
    CAVE_GOOD,
    CAVE_ROT,
    CAVE_LEGEND_RISK,
    CAVE_LOT_MAX,
    CAVE_SLOTS_START,
    CAVE_IDEAL,
    CAVE_NUDGE,
    CAVE_SHELVES,
    CAVE_GEAR,
    AUCTION_SMALL_EVERY,
    AUCTION_BIG_HOUR,
    AUCTION_SMALL_LIVE,
    AUCTION_BIG_LIVE,
    AUCTION_SMALL_LOTS,
    AUCTION_BIG_LOTS,
    NEGOCIANT,
    BIDDERS,
    AUCTION_FINDS,
} from '../data/cave.js';
import { projectDone, chapterDone } from './story.js';
import { addXp, earn, spend } from './player.js';
import { season } from './world.js';
import { tip } from './tips.js';
import { record, collect } from './book.js';
import { addPhoto } from './style.js';
import { addFriendship } from './village.js';
import { hasMats } from './market.js';

export const caveOpen = () => state.level >= CAVE_LVL;
export const caveFam = id => CAVE_FAMILIES[CAVE_ITEMS[id]];
export const caveSlots = () => CAVE_SLOTS_START + 2 * state.cave.shelves + (projectDone('affinage') ? 4 : 0);
export const caveStep = id => (CAVE_ITEMS[id] === 'cider' && projectDone('cidery') ? 4 * CAVE_H : caveFam(id).step);
export const rankName = lot => (lot.bad ? 'Tourné' : caveFam(lot.id).ranks[lot.rank]);
export const lotUnit = lot => Math.round(ITEMS[lot.id].sell * CAVE_MULT[lot.rank] * (lot.bad ? CAVE_TURNED : 1));
export const lotValue = lot => lotUnit(lot) * lot.n;
export const lotLeft = lot => Math.max(0, (lot.next - now()) / 1000);
const caveUid = () => (state.cave.uid = (state.cave.uid || 0) + 1);

export function ensureCave() {
    const c = state.cave;
    while (c.slots.length < caveSlots()) c.slots.push(null);
    if (!c.climAt) c.climAt = now();
    ensureAuction();
}

// ---------------- soins ----------------
// 1 si le lot a été soigné pendant l'étape en cours, puis baisse jusqu'à 0
export function careLevel(lot, t = now()) {
    const step = caveStep(lot.id),
        since = t - lot.care;
    return since <= step * 0.8 ? 1 : Math.max(0, 1 - (since - step * 0.8) / (step * 1.2));
}
export const careNeeded = lot => !lot.bad && now() - lot.care >= caveStep(lot.id) * 0.5;
export const caveCareCount = () => (caveOpen() ? state.cave.slots.filter(l => l && careNeeded(l)).length : 0);

export function careLot(i, at) {
    const lot = state.cave.slots[i];
    if (!lot || !careNeeded(lot)) return false;
    lot.care = now();
    sfx('pop');
    buzz(8);
    burst(at, 'sparkle', 6);
    addXp(4 + lot.rank * 3, at);
    toast(caveFam(lot.id).careDone, ['ui', caveFam(lot.id).careIcon]);
    return true;
}

export function careAll(at) {
    const list = state.cave.slots.filter(l => l && careNeeded(l));
    if (!list.length) return false;
    list.forEach(l => (l.care = now()));
    sfx('pop');
    burst(at, 'sparkle', 10);
    addXp(
        list.reduce((a, l) => a + 4 + l.rank * 3, 0),
        at,
    );
    toast(`${list.length} lot${list.length > 1 ? 's' : ''} soigné${list.length > 1 ? 's' : ''}`, ['ui', 'cave']);
    return true;
}

// ---------------- climat ----------------
export const climTarget = () => {
    const sid = season().id,
        w = state.weather;
    const temp = { printemps: 50, ete: 74, automne: 44, hiver: 24 }[sid] + (w === 'heat' ? 10 : w === 'snow' ? -8 : 0);
    const hum = 50 + ({ rain: 22, storm: 26, heat: -22, snow: 6, cloud: 8, cloudy: 4 }[w] || 0);
    return { temp, hum };
};
const climDrift = () => 4 * (state.cave.gear.hygro ? 0.6 : 1) * (state.cave.gear.vault ? 0.5 : 1);
export const inBand = v => v >= CAVE_IDEAL[0] && v <= CAVE_IDEAL[1];
const climOff = v => Math.max(0, CAVE_IDEAL[0] - v, v - CAVE_IDEAL[1]);
export const climFit = () => Math.max(0, 1 - (climOff(state.cave.temp) + climOff(state.cave.hum)) / 40);
export const climOk = () => inBand(state.cave.temp) && inBand(state.cave.hum);

export function nudgeClimate(kind, dir) {
    const c = state.cave;
    c[kind] = Math.max(0, Math.min(100, c[kind] + dir * CAVE_NUDGE));
    sfx('click');
    buzz(6);
}

// ---------------- vieillissement ----------------
function famBonus(lot) {
    const f = CAVE_ITEMS[lot.id];
    let b = 0;
    if (f === 'cheese' && projectDone('affinage')) b += 0.06;
    if ((f === 'wine' || f === 'cider') && projectDone('cooperage')) b += 0.06;
    if ((f === 'wine' || f === 'cider') && state.cave.gear.oldBarrel) b += 0.04;
    if (lot.boost > 0) b += 0.15;
    b += (lot.q || 0) * 0.04;
    return b;
}

// chances de la prochaine étape : { good, bad, rot, stay }
export function lotOdds(lot, c = careLevel(lot), f = climFit()) {
    const champ = CAVE_ITEMS[lot.id] === 'champagne';
    const riskMul = (1.6 - 0.8 * c) * (1.5 - 0.5 * f);
    if (lot.rank >= 4) {
        const rot = Math.min(0.6, CAVE_LEGEND_RISK.rot * riskMul + (champ && c < 0.3 ? 0.12 : 0)),
            bad = Math.min(0.6, CAVE_LEGEND_RISK.bad * riskMul);
        return { good: 0, bad, rot, stay: Math.max(0, 1 - rot - bad) };
    }
    const good = Math.max(0.05, Math.min(0.95, CAVE_GOOD[lot.rank] + 0.14 * (c - 0.6) + 0.12 * (f - 0.7) + famBonus(lot)));
    const rot = Math.min(1 - good, CAVE_ROT[lot.rank] * riskMul + (champ && c < 0.3 ? 0.12 : 0));
    return { good, bad: Math.max(0, 1 - good - rot), rot, stay: 0 };
}

// une étape : bien vieillir, tourner ou se perdre
function stepLot(i, t, sum) {
    const c = state.cave,
        lot = c.slots[i];
    const o = lotOdds(lot, careLevel(lot, t), climFit());
    const r = Math.random();
    lot.next += caveStep(lot.id);
    if (lot.boost > 0) lot.boost--;
    lot.tasted = 0;
    if (r < o.rot) {
        c.slots[i] = null;
        state.inventory.fertilizer = (state.inventory.fertilizer || 0) + lot.n;
        sum.rot.push(lot);
        state.stats.caveRot = (state.stats.caveRot || 0) + 1;
    } else if (r < o.rot + o.bad) {
        lot.bad = true;
        sum.bad.push(lot);
    } else if (r < o.rot + o.bad + o.good) {
        lot.rank++;
        lot.flash = 'up';
        sum.up.push(lot);
    }
}

// le temps passe dans la cave (aussi pendant l'absence) : climat par tranches de 10 minutes
export function caveTick(t = now()) {
    const sum = { up: [], bad: [], rot: [] };
    if (!caveOpen()) return sum;
    ensureCave();
    const c = state.cave,
        CH = 10 * 60 * 1000;
    let guard = 0;
    while (c.climAt + CH <= t && guard++ < 2000) {
        c.climAt += CH;
        const tg = climTarget(),
            d = climDrift();
        ['temp', 'hum'].forEach(k => {
            const diff = (k === 'temp' ? tg.temp : tg.hum) - c[k];
            c[k] += Math.sign(diff) * Math.min(Math.abs(diff), d);
        });
        c.slots.forEach((lot, i) => {
            let g = 0;
            while (c.slots[i] === lot && lot && !lot.bad && lot.next <= c.climAt && g++ < 50) stepLot(i, c.climAt, sum);
        });
    }
    if (guard >= 2000) c.climAt = t;
    // les étapes échues depuis la dernière tranche de climat
    c.slots.forEach((lot, i) => {
        let g = 0;
        while (c.slots[i] === lot && lot && !lot.bad && lot.next <= t && g++ < 50) stepLot(i, t, sum);
    });
    if (view.started && sum.up.length + sum.bad.length + sum.rot.length) {
        if (sum.rot.length) {
            const l = sum.rot[0];
            toast(
                CAVE_ITEMS[l.id] === 'champagne'
                    ? `Une bouteille a sauté : ${ITEMS[l.id].name.toLowerCase()} perdu (au compost)`
                    : `${ITEMS[l.id].name} perdu en cave (au compost)`,
                ['ui', 'rot'],
            );
        } else if (sum.bad.length) toast(`${ITEMS[sum.bad[0].id].name} a mal vieilli : il a tourné`, ['ui', 'cave']);
        else {
            const l = sum.up[0];
            toast(`${ITEMS[l.id].name} : « ${rankName(l)} » !`, ['item', l.id]);
            sfx('pop');
        }
        tip('caveStep');
    }
    return sum;
}

// ---------------- mettre en cave, goûter, sortir ----------------
export const caveCandidates = () => Object.keys(CAVE_ITEMS).filter(id => state.inventory[id] > 0);

export function putInCave(slot, id, n, at) {
    const c = state.cave;
    n = Math.max(1, Math.min(n, CAVE_LOT_MAX));
    if (!id || c.slots[slot] || !(state.inventory[id] >= n)) return false;
    // les produits de qualité partent en premier : un lot tout en or (ou en argent) vieillit mieux
    const qq = state.quality[id];
    let lq = 0;
    if (qq && qq.g >= n) {
        qq.g -= n;
        lq = 2;
    } else if (qq && qq.s >= n) {
        qq.s -= n;
        lq = 1;
    }
    state.inventory[id] -= n;
    const t = now();
    c.slots[slot] = { uid: caveUid(), id, n, rank: 0, bad: false, next: t + caveStep(id), care: t, boost: 0, put: t, q: lq };
    sfx('pop');
    burst(at, 'sparkle', 8);
    if (CAVE_ITEMS[id] === 'champagne') tip('champagne');
    return true;
}

export function tasteLot(i, at) {
    const lot = state.cave.slots[i];
    if (!lot || lot.n < 2 || lot.bad || lot.tasted) return false;
    lot.n--;
    lot.tasted = 1;
    sfx('pop');
    burst(at, 'sparkle', 5);
    return true;
}

export const boostKind = lot =>
    !lot || lot.bad ? null : CAVE_ITEMS[lot.id] === 'cheese' ? 'ferment' : ['wine', 'champagne'].includes(CAVE_ITEMS[lot.id]) ? 'yeast' : null;

export function boostLot(i) {
    const lot = state.cave.slots[i],
        k = boostKind(lot);
    if (!k || !(state.inventory[k] > 0) || lot.boost > 0) return false;
    state.inventory[k]--;
    lot.boost = 3;
    sfx('level');
    toast(`${ITEMS[k].name} ajouté : 3 étapes plus sûres`, ['item', k]);
    return true;
}

export function takeOut(i, at) {
    const c = state.cave,
        lot = c.slots[i];
    if (!lot) return false;
    c.slots[i] = null;
    c.reserve.push({ uid: lot.uid, id: lot.id, n: lot.n, rank: lot.rank, bad: lot.bad });
    state.stats.caveLots = (state.stats.caveLots || 0) + 1;
    if (!lot.bad) record('lot', lotValue(lot));
    if (!lot.bad && lot.rank >= 3) collect('cave_' + lot.id);
    if (!lot.bad && lot.rank >= 4) {
        state.stats.caveLegend = (state.stats.caveLegend || 0) + 1;
        addPhoto('item', lot.id, `${ITEMS[lot.id].name} légendaire`, 'Sorti de la cave');
    }
    sfx(lot.rank >= 3 && !lot.bad ? 'level' : 'harvest');
    burst(at, 'sparkle', 4 + lot.rank * 3);
    addXp(Math.round(lotValue(lot) * (lot.bad ? 0.01 : 0.04)), at);
    return true;
}

// ---------------- réserve : négociant ou enchères ----------------
export function sellNegociant(uid, at) {
    const c = state.cave,
        k = c.reserve.findIndex(l => l.uid === uid);
    if (k < 0) return false;
    const lot = c.reserve[k];
    c.reserve.splice(k, 1);
    const gain = Math.round(lotValue(lot) * NEGOCIANT);
    earn(gain, at);
    state.income.cave = (state.income.cave || 0) + gain;
    sfx('coin');
    return true;
}

// ---------------- salle des ventes ----------------
export const hallOpen = () => projectDone('auctionHall');
const nextBoundary = every => Math.ceil((now() + 1) / every) * every;
const nextEvening = () => {
    const d = new Date(now());
    d.setHours(AUCTION_BIG_HOUR, 0, 0, 0);
    while (d.getTime() <= now()) d.setDate(d.getDate() + 1);
    return d.getTime();
};

export function ensureAuction() {
    const c = state.cave;
    if (c.auction && !c.auction.over) return;
    const small = nextBoundary(AUCTION_SMALL_EVERY);
    const big = hallOpen() ? nextEvening() : Infinity;
    const isBig = big <= small;
    c.auction = {
        big: isBig,
        startAt: isBig ? big : small,
        deposits: [],
        finds: isBig ? pickFinds() : [],
        lots: null,
        over: false,
        results: [],
    };
}

function pickFinds() {
    const pool = Object.keys(AUCTION_FINDS).filter(
        k => !(AUCTION_FINDS[k].once && (state.cave.gear[k] || state.decorInv[k] || state.grid.some(p => p.deco === k))),
    );
    const out = [];
    while (out.length < 3 && pool.length) out.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
    return out;
}
export const findValue = k =>
    k === 'vintage' ? Math.round(ITEMS.redWine.sell * CAVE_MULT[3] * 3) : Math.round(AUCTION_FINDS[k].value * (1 + state.level * 0.02));
export const depositMax = () => (state.cave.auction.big ? AUCTION_BIG_LOTS : AUCTION_SMALL_LOTS);
export const auctionStartsIn = () => Math.max(0, (state.cave.auction.startAt - now()) / 1000);

export function depositLot(uid) {
    const c = state.cave,
        a = c.auction;
    if (a.lots || a.over || a.deposits.length >= depositMax()) return false;
    const k = c.reserve.findIndex(l => l.uid === uid);
    if (k < 0) return false;
    const lot = c.reserve.splice(k, 1)[0];
    a.deposits.push({ lot, reserve: Math.round((lotValue(lot) * 0.8) / 10) * 10 });
    sfx('click');
    tip('auction');
    return true;
}

export function withdrawLot(uid) {
    const a = state.cave.auction;
    if (a.lots) return false;
    const k = a.deposits.findIndex(d => d.lot.uid === uid);
    if (k < 0) return false;
    state.cave.reserve.push(a.deposits.splice(k, 1)[0].lot);
    sfx('click');
    return true;
}

export function setReserve(uid, dir) {
    const d = state.cave.auction.deposits.find(x => x.lot.uid === uid);
    if (!d || state.cave.auction.lots) return false;
    const v = lotValue(d.lot);
    d.reserve = Math.round(Math.max(v * 0.5, Math.min(v * 2, d.reserve + dir * v * 0.1)) / 10) * 10;
    sfx('click');
    return true;
}

// qui vient à la vente
export function bidderPool(big) {
    return Object.entries(BIDDERS)
        .filter(([id, b]) => (b.big ? big : !b.villager || !VILLAGERS[id].ch || chapterDone(VILLAGERS[id].ch - 1)))
        .map(([id]) => id);
}
const bidderBudget = id => (20000 + state.level * 3000) * BIDDERS[id].budget;
export const bidderName = id => (id === 'you' ? 'Vous' : BIDDERS[id] ? BIDDERS[id].name : '');

function makeNpcs(fam, value, big) {
    const pool = bidderPool(big).sort(() => Math.random() - 0.5);
    const want = (big ? 3 : 2) + Math.floor(Math.random() * 2) + Math.floor(state.cave.cote / 40);
    const cote = 1 + state.cave.cote / 200;
    return pool
        .filter(id => BIDDERS[id].taste[fam] || Math.random() < 0.35)
        .slice(0, want)
        .map(id => ({
            who: id,
            max: Math.min(bidderBudget(id), value * (BIDDERS[id].taste[fam] || 1) * (0.85 + Math.random() * 0.45) * cote * (big ? 1.15 : 1)),
        }));
}

function startAuction(a) {
    const t0 = a.startAt,
        live = a.big ? AUCTION_BIG_LIVE : AUCTION_SMALL_LIVE;
    a.lots = [
        ...a.deposits.map(d => {
            const v = lotValue(d.lot);
            return {
                kind: 'sell',
                lot: d.lot,
                reserve: d.reserve,
                value: v,
                price: Math.round(Math.max(d.reserve * 0.7, v * 0.5) / 10) * 10,
                leader: null,
                npcs: makeNpcs(d.lot.bad ? 'none' : CAVE_ITEMS[d.lot.id], d.lot.bad ? v * 0.7 : v, a.big),
                next: t0 + 1500 + Math.random() * 4000,
                end: t0 + live,
                bids: 0,
            };
        }),
        ...a.finds.map(k => {
            const v = findValue(k);
            return {
                kind: 'buy',
                find: k,
                value: v,
                price: Math.round((v * 0.6) / 10) * 10,
                leader: null,
                // les collectionneurs s'emballent moins pour les lots rares que pour vos grands crus
                npcs: makeNpcs(k === 'ferment' ? 'cheese' : k === 'yeast' ? 'champagne' : 'wine', v * 0.8, true),
                next: t0 + 2000 + Math.random() * 5000,
                end: t0 + live,
                bids: 0,
            };
        }),
    ];
    a.simAt = t0;
    if (view.started && now() - t0 < 10000) {
        toast(a.big ? 'La grande vente commence !' : 'La vente aux enchères commence !', ['ui', 'gavel']);
        sfx('level');
    }
}

// une seconde de vente : les enchérisseurs surenchérissent tant que leur limite le permet
function auctionStep(a, t) {
    a.lots.forEach(l => {
        if (l.done || t < l.next) return;
        const step = l.leader ? 1 + 0.05 + Math.random() * 0.06 : 1;
        const ask = Math.round((l.price * step) / 10) * 10;
        const can = l.npcs.filter(n => n.who !== l.leader && n.max >= ask);
        if (!can.length) {
            l.next = Infinity;
            return;
        }
        // les plus motivés enchérissent plus souvent
        can.sort((x, y) => y.max - x.max);
        const n = can[Math.random() < 0.6 ? 0 : Math.floor(Math.random() * can.length)];
        l.price = ask;
        l.leader = n.who;
        l.bids++;
        l.flash = t;
        l.next = t + 1500 + Math.random() * 3500;
        if (l.end - t < 5000) l.end = t + 5000; // une enchère de dernière seconde prolonge la vente
    });
    a.lots.forEach(l => {
        if (!l.done && t >= l.end) closeLot(a, l);
    });
}

function closeLot(a, l) {
    l.done = true;
    const c = state.cave;
    if (l.kind === 'sell') {
        if (l.leader && l.price >= l.reserve) {
            l.sold = true;
            earn(l.price, null);
            state.income.cave = (state.income.cave || 0) + l.price;
            state.stats.auctionSold = (state.stats.auctionSold || 0) + 1;
            record('auction', l.price);
            c.cote = Math.max(0, Math.min(100, c.cote + (l.lot.bad ? -3 : l.lot.rank * 2)));
            addXp(Math.round(l.price / 60));
            if (BIDDERS[l.leader].villager && state.villagers[l.leader]) addFriendship(l.leader, 2 + l.lot.rank, null);
        } else c.reserve.push(l.lot);
    } else if (l.leader === 'you') {
        if (state.money >= l.price) {
            spend(l.price);
            giveFind(l.find);
            l.won = true;
        } else l.leader = null;
    }
    a.results.push(l);
}

function giveFind(k) {
    const c = state.cave;
    if (k === 'ferment' || k === 'yeast') state.inventory[k] = (state.inventory[k] || 0) + 2;
    else if (k === 'oldBarrel') c.gear.oldBarrel = true;
    else if (k === 'oldPress') state.decorInv.oldPress = (state.decorInv.oldPress || 0) + 1;
    else if (k === 'vintage') c.reserve.push({ uid: caveUid(), id: 'redWine', n: 3, rank: 3, bad: false });
}

export function auctionTick(t = now()) {
    if (!caveOpen()) return false;
    ensureCave();
    const a = state.cave.auction;
    if (a.over) return false;
    if (!a.lots) {
        if (t < a.startAt) return false;
        if (!a.deposits.length && !a.finds.length) {
            a.over = true;
            ensureAuction();
            return true;
        }
        startAuction(a);
    }
    let guard = 0;
    while (a.simAt + 1000 <= t && guard++ < 4000 && !a.lots.every(l => l.done)) {
        a.simAt += 1000;
        auctionStep(a, a.simAt);
    }
    if (a.lots.every(l => l.done)) {
        a.over = true;
        // les résultats restent affichés une demi-heure, la vente suivante s'ouvre aussitôt
        state.cave.lastSale = { big: a.big, results: a.results, until: t + 30 * 60 * 1000 };
        const sold = a.results.filter(l => l.sold);
        if (view.started && now() - a.simAt < 60000) {
            sfx('level');
            toast(
                sold.length
                    ? `Adjugé ! ${sold.length} lot${sold.length > 1 ? 's' : ''} vendu${sold.length > 1 ? 's' : ''} pour ${fmt(sold.reduce((x, l) => x + l.price, 0))} pièces`
                    : 'Vente close : aucun lot vendu',
                ['ui', 'gavel'],
            );
        }
        a.deposits = [];
        ensureAuction();
    }
    return true;
}

export const bidAsk = l => (l.leader ? Math.round((l.price * 1.08) / 10) * 10 : l.price);

export function playerBid(k, at) {
    const a = state.cave.auction,
        l = a.lots && a.lots[k];
    if (!l || l.done || l.kind !== 'buy' || l.leader === 'you') return false;
    const ask = bidAsk(l);
    if (state.money < ask) {
        toast('Pas assez d’argent pour enchérir', ['ui', 'coin']);
        sfx('error');
        return false;
    }
    const t = now();
    l.price = ask;
    l.leader = 'you';
    l.bids++;
    l.flash = t;
    l.next = t + 1500 + Math.random() * 2500;
    if (l.end - t < 8000) l.end = t + 8000;
    sfx('click');
    buzz(10);
    burst(at, 'sparkle', 5);
    return true;
}

export function dismissAuction() {
    state.cave.lastSale = null;
}

// ---------------- équipement ----------------
export const shelfCost = () => CAVE_SHELVES[state.cave.shelves];

export function buyShelf(at) {
    const cost = shelfCost();
    if (cost === undefined || state.money < cost) return false;
    spend(cost);
    state.cave.shelves++;
    ensureCave();
    sfx('level');
    burst(at, 'sparkle', 10);
    toast('Nouvelle étagère : +2 places en cave', ['ui', 'cave']);
    return true;
}

export function buyCaveGear(k, at) {
    const g = CAVE_GEAR[k];
    if (state.cave.gear[k] || state.money < g.cost || (g.mats && !hasMats(g.mats))) return false;
    spend(g.cost);
    if (g.mats) Object.entries(g.mats).forEach(([m, n]) => (state.inventory[m] -= n));
    state.cave.gear[k] = true;
    sfx('level');
    burst(at, 'sparkle', 10);
    toast(`${g.name} installé`, ['ui', g.icon]);
    return true;
}
