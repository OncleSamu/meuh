// Le commerce : magasin, matériaux de construction, marché, prix et annulation d'une vente.
import { herdFull, placeAnimal } from './pastures.js';
import { state, scaleLvl, lvOk } from '../core/state.js';
import { now } from '../core/clock.js';
import { view } from '../core/view.js';
import { fmt } from '../core/format.js';
import { emit, toast, sfx, buzz, float, squish } from '../core/bus.js';
import { ITEMS } from '../data/items.js';
import { ANIMALS } from '../data/animals.js';
import { MACHINES } from '../data/machines.js';
import { DECOS, MAT, QUALITY } from '../data/farm.js';
import { HOT_MULT, MARKET_RECOVER, UNDO_MS } from '../data/commerce.js';
import { BALANCE } from '../data/progress.js';
import { masteryMult, dropMult, demandFloor } from './mastery.js';
import { priceMult, rank, earn, spend } from './player.js';
import { eventActive, eventProgress } from './events.js';
import { clampQuality, qual } from './farm.js';
import { questPool, isOpen } from './orders.js';
import { projectsNeed, storyOk } from './story.js';
import { isLocked } from './stall.js';
import { challengeOn } from './prestige.js';
import { hasMachine, newMachine } from './workshop.js';
import { newAnimal } from './animals.js';
import { tip } from './tips.js';
import { defiNeed } from './defis.js';

const COIN = ['ui', 'coin'];

// ---------------- les prix ----------------
export const marketMult = () => Math.max(BALANCE.marketEnd, BALANCE.marketStart - BALANCE.marketSlope * (scaleLvl() - 1));
export const sellPrice = id => Math.floor(ITEMS[id].sell * masteryMult(id) * marketMult() * priceMult());
export const demand = id => (state.market.f[id] === undefined ? 1 : state.market.f[id]);
export const dropPer = id => 0.0075 * (1 + Math.log10(ITEMS[id].sell)) * (rank('trader') ? 0.5 : 1) * dropMult(id);
export const eventSellMult = () => (eventActive('ete') ? 1.25 : 1);
export const unitPrice = (id, q = 0, f = demand(id)) =>
    Math.max(
        1,
        Math.floor(
            ITEMS[id].sell * masteryMult(id) * marketMult() * priceMult() * QUALITY[q].mult * f * (state.market.hot === id ? HOT_MULT : 1) * eventSellMult(),
        ),
    );
export const sellableKeys = () => Object.keys(ITEMS).filter(k => ITEMS[k].sell && state.inventory[k] > 0);

// Vend n unités (or d'abord, puis argent, puis ordinaire) ; sans apply, calcule seulement
export function sellBatch(id, n, apply) {
    clampQuality(id);
    const q = qual(id),
        inv = state.inventory[id];
    let left = Math.min(n, inv),
        f = demand(id),
        gain = 0;
    const take = { g: Math.min(q.g, left) };
    left -= take.g;
    take.s = Math.min(q.s, left);
    left -= take.s;
    take.n = left;
    const seq = [
        [2, take.g],
        [1, take.s],
        [0, take.n],
    ];
    for (const [ql, cnt] of seq)
        for (let k = 0; k < cnt; k++) {
            gain += unitPrice(id, ql, f);
            f = Math.max(Math.min(f, demandFloor(id)), f - dropPer(id));
        }
    const sold = take.g + take.s + take.n;
    if (apply) {
        q.g -= take.g;
        q.s -= take.s;
        state.inventory[id] -= sold;
        state.income.market += gain;
        state.sold[id] = (state.sold[id] || 0) + gain;
        state.market.f[id] = f;
        eventProgress('sell', null, gain);
    }
    return { gain, sold, take };
}

export function pickHot() {
    const pool = questPool().filter(i => i.sell);
    state.market.hot = pool.length ? pool[Math.floor(Math.random() * pool.length)].id : null;
    state.market.hotDay = state.day;
    if (state.market.hot && view.started) toast(`Produit du jour au marché : ${ITEMS[state.market.hot].name.toLowerCase()} +50 %`, ['item', state.market.hot]);
}

export function marketTick() {
    let changed = false;
    for (const id of Object.keys(state.market.f)) {
        const f = state.market.f[id] + MARKET_RECOVER;
        if (f >= 1) delete state.market.f[id];
        else state.market.f[id] = f;
        changed = true;
    }
    if (state.market.hotDay !== state.day) pickHot();
    return changed;
}

// Quantité gardée pour les commandes, le train, la montgolfière, les chantiers et la fête en cours
export function reservedQty(id) {
    // pas de réserve pendant le tutoriel : il apprend justement à vendre
    if (!state.settings.reserve || !state.tutorial.done) return 0;
    let n = 0;
    state.quests.forEach(q => {
        if (isOpen(q)) q.items.forEach(x => x.id === id && (n += x.qty));
    });
    if (state.balloon.status === 'here') state.balloon.items.forEach(x => x.id === id && (n += x.qty));
    if (state.incident && state.incident.type === 'express') state.incident.items.forEach(x => x.id === id && (n += x.qty));
    n += projectsNeed(id);
    n += defiNeed(id);
    if (state.truck.status === 'here')
        state.truck.slots.forEach(sl => {
            if (!sl.loaded && sl.id === id) n += sl.qty;
        });
    if (eventActive())
        state.event.goals.forEach(x => {
            if (x.type === 'deliver' && x.item === id) n += Math.max(0, x.target - x.prog);
        });
    return Math.min(n, state.inventory[id]);
}
export const sellableQty = id => (isLocked(id) ? 0 : state.inventory[id] - reservedQty(id));

export function toggleReserve() {
    state.settings.reserve = !state.settings.reserve;
    sfx('click');
}

function marketClosed() {
    if (!challengeOn('noMarket')) return false;
    toast('Défi « Marché fermé » : livrez plutôt des commandes et des trains', ['ui', 'flag']);
    sfx('error');
    return true;
}

// qty = 0 : tout ce qui n'est pas gardé pour les commandes
export function sellItem(id, qty, at) {
    if (marketClosed()) return false;
    if (isLocked(id)) {
        toast(`${ITEMS[id].name} est verrouillé : déverrouillez-le dans la grange pour le vendre`, ['ui', 'lock']);
        sfx('error');
        return false;
    }
    const have = qty ? state.inventory[id] : sellableQty(id);
    if (!have || !ITEMS[id].sell) return false;
    const f0 = state.market.f[id];
    const r = sellBatch(id, qty || have, true);
    rememberSale([{ id, take: r.take, gain: r.gain, f0 }]);
    sfx('click');
    buzz(8);
    earn(r.gain, at);
    return r;
}

export function sellAll(at) {
    if (marketClosed()) return 0;
    let total = 0;
    const parts = [];
    sellableKeys().forEach(k => {
        // les matériaux de la nature (bois, pierre, minerais, lingots, gemmes) se vendent un par un
        if (['ore', 'ingot', 'gem'].includes(ITEMS[k].type) || k === 'wood' || k === 'stone') return;
        const n = sellableQty(k);
        if (n <= 0) return;
        const f0 = state.market.f[k];
        const r = sellBatch(k, n, true);
        total += r.gain;
        parts.push({ id: k, take: r.take, gain: r.gain, f0 });
    });
    if (parts.length) rememberSale(parts);
    if (!total) {
        toast('Rien à vendre');
        squish(at);
        return 0;
    }
    emit('marketFx');
    buzz(20);
    earn(total, at);
    return total;
}

// ---------------- annuler une vente (5 secondes) ----------------
let lastSale = null;
export const pendingSale = () => (lastSale && now() - lastSale.at < UNDO_MS ? lastSale : null);

export function rememberSale(parts) {
    const gain = parts.reduce((a, p) => a + p.gain, 0);
    if (!gain) return;
    const n = parts.reduce((a, p) => a + p.take.g + p.take.s + p.take.n, 0);
    lastSale = { parts, gain, n, day: state.day, at: now() };
    emit('sale', lastSale);
}

export function undoSale() {
    const sl = pendingSale();
    if (!sl) return false;
    lastSale = null;
    if (state.money < sl.gain) {
        toast('Cet argent a déjà été dépensé : impossible d’annuler', COIN);
        sfx('error');
        return false;
    }
    sl.parts.forEach(p => {
        const q = qual(p.id);
        state.inventory[p.id] += p.take.g + p.take.s + p.take.n;
        q.g += p.take.g;
        q.s += p.take.s;
        if (p.f0 === undefined) delete state.market.f[p.id];
        else state.market.f[p.id] = p.f0;
        state.sold[p.id] = Math.max(0, (state.sold[p.id] || 0) - p.gain);
    });
    state.money -= sl.gain;
    state.stats.earned -= sl.gain;
    state.stats.earnedRun -= sl.gain;
    state.income.market -= sl.gain;
    if (state.dayEarn[sl.day]) state.dayEarn[sl.day] -= sl.gain;
    if (eventActive()) state.event.goals.forEach(x => x.type === 'sell' && !x.claimed && (x.prog = Math.max(0, x.prog - sl.gain)));
    emit('undo', sl.gain);
    sfx('click');
    toast('Vente annulée : les produits sont de retour dans la grange', ['ui', 'barn']);
    return true;
}

// ---------------- matériaux de construction ----------------
export const matCost = (type, id) => (MAT[type] && MAT[type][id]) || null;
export const hasMats = m => !m || Object.entries(m).every(([k, n]) => state.inventory[k] >= n);
export const payMats = m => {
    if (m) Object.entries(m).forEach(([k, n]) => (state.inventory[k] -= n));
};

export function matMissing(m) {
    const miss = Object.entries(m)
        .filter(([k, n]) => state.inventory[k] < n)
        .map(([k, n]) => `${n - state.inventory[k]} ${k === 'wood' ? 'bois' : 'pierre'}`);
    const where = Object.keys(m).some(k => k === 'stone' && state.inventory.stone < m.stone) ? 'cassez des rochers' : 'coupez des arbres';
    return `Il manque ${miss.join(' et ')} : ${where} dans l’onglet Nature`;
}

// ---------------- le magasin ----------------
export const shopDef = (type, id) => (type === 'animal' ? ANIMALS[id] : type === 'machine' ? MACHINES[id] : type === 'placedeco' ? DECOS[id] : ITEMS[id]);

// peut-on acheter (sans le dire) ?
export function canBuy(type, id, qty = 1) {
    const d = shopDef(type, id);
    if (!d || !lvOk(d) || !storyOk(d)) return false;
    if (type === 'machine' && hasMachine(id)) return false;
    if (type === 'animal' && (challengeOn('noAnimals') || herdFull())) return false;
    return state.money >= d.cost * qty && hasMats(matCost(type, id));
}

export function buy(type, id, qty = 1, at) {
    const d = shopDef(type, id);
    if (!d || !lvOk(d) || !storyOk(d)) return false;
    if (type === 'machine' && hasMachine(id)) return false;
    const total = d.cost * qty;
    if (type === 'animal' && challengeOn('noAnimals')) {
        toast('Défi « Sans animaux » : pas d’animaux sur cette ferme', ['ui', 'flag']);
        sfx('error');
        return false;
    }
    if (type === 'animal' && herdFull()) {
        toast('Tous vos prés sont pleins : achetez un nouveau pré dans l’onglet Animaux', ['ui', 'flowers']);
        sfx('error');
        return false;
    }
    if (state.money < total) {
        toast('Pas assez d’argent', COIN);
        sfx('error');
        return false;
    }
    const mc = matCost(type, id);
    if (!hasMats(mc)) {
        toast(matMissing(mc), ['item', 'wood']);
        sfx('error');
        return false;
    }
    spend(total);
    payMats(mc);
    if (type === 'feed') state.inventory.feed += qty;
    else if (type === 'compost') state.inventory.fertilizer += qty;
    else if (type === 'seed') state.seeds[id] += qty;
    else if (type === 'animal') {
        const a = newAnimal(id);
        placeAnimal(a);
        state.animals.push(a);
    } else if (type === 'machine') state.machines.push(newMachine(id));
    else if (type === 'placedeco') state.decorInv[id] = (state.decorInv[id] || 0) + 1;
    sfx('buy');
    buzz(10);
    squish(at);
    float(at, [`-${fmt(total)}`, COIN], 'bad', -16);
    const icon =
        type === 'animal'
            ? ['animal', id]
            : type === 'machine'
              ? ['machine', id]
              : type === 'seed'
                ? ['seed', id]
                : type === 'placedeco'
                  ? ['ui', id]
                  : ['item', id];
    const to = type === 'animal' ? 'animals' : type === 'machine' ? 'machines' : 'farm';
    emit('flyIcon', { at, icon, to });
    if (type === 'animal') {
        toast(`Bébé ${d.name.toLowerCase()} arrive au pâturage : dites bonjour à ${state.animals[state.animals.length - 1].name} !`, ['animal', id]);
        sfx(id);
    } else if (type === 'placedeco') toast(`${d.name} ajouté à votre barre d’outils : posez-le dans le champ`, ['ui', id]);
    else if (type === 'machine') {
        toast(`${d.name} installé(e) à l’atelier`, ['machine', id]);
        tip('machine');
    }
    return true;
}
