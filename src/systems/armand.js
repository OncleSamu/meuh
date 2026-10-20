// 1.19.1 : Armand, chef du Grand Hôtel. Une fois par semaine (temps réel, même jeu fermé) il passe trois jours.
// Le joueur lui déclare un produit phare (au moins une étoile de maîtrise) ; Armand en demande 60 à 1200 d'un coup.
// Chaque unité livrée paie tout de suite à prix fixe ; la commande finie donne un bonus, des matériaux rares et +1 de fidélité.
import { state, scaleLvl } from '../core/state.js';
import { visitor } from '../core/visits.js';
import { view } from '../core/view.js';
import { pickRand, round5 } from '../core/format.js';
import { toast, sfx, buzz, burst } from '../core/bus.js';
import { ITEMS } from '../data/items.js';
import { ARMAND, RARE } from '../data/commerce.js';
import { earn, addXp } from './player.js';
import { clampQuality } from './farm.js';
import { giveRare } from './barn.js';
import { stayOf } from './home.js';
import { masteryKnown, masteryStars, masteryMult, masteryExtra } from './mastery.js';

export const armandOpen = () => state.level >= ARMAND.lvl;
const V = visitor(ARMAND.every, () => stayOf(ARMAND.stay, ARMAND.every));
const cycle = V.cycle;
export const armandArrive = V.arrive;
export const armandLeave = V.leave;
export const armandHere = t => armandOpen() && V.here(t);
const A = () => (state.armand = state.armand || { k: -1, flagship: null, fid: {}, order: null });

export const armandFlagship = () => (state.armand && state.armand.flagship) || null;
export const armandFid = id => (state.armand && state.armand.fid && state.armand.fid[id]) || 0;
export const armandOrder = () => (state.armand && state.armand.order && ITEMS[state.armand.order.id] ? state.armand.order : null);
// il attend encore quelque chose
export const armandPending = () => {
    const o = armandOrder();
    return !!o && o.got < o.qty;
};
// les produits qu'on peut déclarer « produit phare »
export const armandCandidates = () => masteryKnown().filter(id => masteryStars(id) >= 1);

export const armandQty = id => {
    const it = ITEMS[id];
    const boost = (1 + 0.1 * masteryStars(id) + 0.1 * masteryExtra(id)) * (1 + ARMAND.fidQty * armandFid(id));
    const raw = (ARMAND.value(scaleLvl()) * boost) / Math.max(1, it.sell);
    return Math.max(ARMAND.min, Math.min(ARMAND.max, Math.round(raw / 5) * 5));
};
export const armandRate = id => ARMAND.pay * masteryMult(id) * (1 + ARMAND.fidPay * armandFid(id));
export const armandPay = (o, n) => round5(ITEMS[o.id].sell * n * armandRate(o.id));
export const armandTotal = () => (armandOrder() ? armandPay(armandOrder(), armandOrder().qty) : 0);
export const armandBonus = () => round5(armandTotal() * ARMAND.bonus);
export const armandBonusXp = () => Math.round(armandBonus() * ARMAND.xp);

const makeOrder = id => ({ id, qty: armandQty(id), got: 0, done: false });

// à chaque seconde (et au retour) : une nouvelle visite au début de chaque semaine
export function armandTick() {
    if (!armandOpen()) return false;
    const k = cycle();
    const a = A();
    if (!armandHere()) {
        if (a.order && a.k === k) {
            a.order = null;
            return true;
        }
        return false;
    }
    if (a.k === k) return false;
    a.k = k;
    a.order = a.flagship && ITEMS[a.flagship] ? makeOrder(a.flagship) : null;
    if (view.started && !view.hidden) {
        toast('Armand, du Grand Hôtel, est de passage : trois jours pour le servir !', ['villager', 'armand']);
        sfx('horn');
    }
    return true;
}

// déclarer (ou changer) son produit phare : libre quand il est absent, ou présent sans rien d'encore livré
export const armandCanChange = () => {
    const o = armandOrder();
    return !armandHere() || !o || o.got === 0;
};
export function setFlagship(id) {
    if (!armandOpen() || !ITEMS[id] || !armandCandidates().includes(id) || !armandCanChange()) return false;
    const a = A();
    a.flagship = id;
    if (armandHere()) a.order = makeOrder(id);
    sfx('ok');
    return true;
}

// livrer tout ce qu'on a (ou n unités)
export function deliverArmand(at, n) {
    const a = state.armand;
    const o = a && armandHere() && a.k === cycle() && armandOrder();
    if (!o || o.done) return false;
    const can = Math.min(state.inventory[o.id] || 0, o.qty - o.got, n || Infinity);
    if (can <= 0) return false;
    state.inventory[o.id] -= can;
    clampQuality(o.id);
    o.got += can;
    const gold = armandPay(o, can);
    earn(gold, at);
    addXp(Math.round(gold * ARMAND.xp), at);
    state.income.trucks = (state.income.trucks || 0) + gold;
    sfx('load');
    buzz(10);
    if (at) burst(at, 'crumbs', 8);
    if (o.got >= o.qty) {
        o.done = true;
        const bonus = armandBonus();
        earn(bonus, at);
        addXp(armandBonusXp(), at);
        for (let j = 0; j < ARMAND.mats; j++) giveRare(pickRand(RARE), 2, at);
        a.fid[o.id] = Math.min(ARMAND.fidMax, armandFid(o.id) + 1);
        state.stats.armands = (state.stats.armands || 0) + 1;
        state.income.trucks += bonus;
        sfx('level');
        toast('Commande d’Armand complète ! Le Grand Hôtel vous récompense', ['villager', 'armand']);
    }
    return true;
}
