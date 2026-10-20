// 1.19.1 : Armand, chef du Grand Hôtel. Une fois par semaine (temps réel, même jeu fermé) il passe trois jours.
// Le joueur lui déclare un produit phare (au moins une étoile de maîtrise) ; Armand en demande de 10 à 1200 d'un coup, jamais plus que ce que vaut le niveau du joueur.
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
import { stayOf, domStepSum } from './estate.js';
import { masteryKnown, masteryStars, masteryMult, masteryExtra } from './mastery.js';

export const armandOpen = () => state.level >= ARMAND.lvl;
const V = visitor(ARMAND.every, () => stayOf(ARMAND.stay, ARMAND.every));
const cycle = V.cycle;
export const armandArrive = V.arrive;
export const armandLeave = V.leave;
export const armandHere = t => armandOpen() && V.here(t);
// 1.20 : la Suite d'Armand (domaine) ouvre jusqu'à 4 produits phares, garde la commande en cours d'une visite à l'autre et paie 10 % de plus.
export const armandSlots = () => 1 + domStepSum('armand', 'slot');
const keepOn = () => domStepSum('armand', 'keep') > 0;
// { k, flags: [produit|null], fid: { produit: n }, orders: [commande|null] } ; l'ancienne forme (un produit, une commande) est convertie
const A = () => {
    const a = (state.armand = state.armand || { k: -1, flags: [], fid: {}, orders: [] });
    if ('flagship' in a || 'order' in a) {
        a.flags = [a.flagship || null];
        a.orders = [a.order || null];
        delete a.flagship;
        delete a.order;
    }
    a.flags = a.flags || [];
    a.orders = a.orders || [];
    while (a.flags.length < armandSlots()) a.flags.push(null);
    while (a.orders.length < armandSlots()) a.orders.push(null);
    return a;
};

export const armandFlagship = (slot = 0) => (state.armand ? A().flags[slot] : null) || null;
export const armandFid = id => (state.armand && state.armand.fid && state.armand.fid[id]) || 0;
export const armandOrder = (slot = 0) => {
    if (!state.armand) return null;
    const o = A().orders[slot];
    return o && ITEMS[o.id] ? o : null;
};
// il attend encore quelque chose
export const armandPending = () => {
    for (let i = 0; i < armandSlots(); i++) {
        const o = armandOrder(i);
        if (o && o.got < o.qty) return true;
    }
    return false;
};
// les produits qu'on peut déclarer « produit phare » (un même produit ne peut pas occuper deux places)
// 1.21.2 : la commande vaut au plus ce que permet le niveau (valeur × maîtrise × fidélité) ; un produit trop cher pour ce budget (moins de 10 unités) ne se choisit pas
const armandRaw = id => {
    const boost = (1 + 0.1 * masteryStars(id) + 0.1 * masteryExtra(id)) * (1 + ARMAND.fidQty * armandFid(id));
    return (ARMAND.value(scaleLvl()) * boost) / Math.max(1, ITEMS[id].sell);
};
export const armandCandidates = () => masteryKnown().filter(id => masteryStars(id) >= 1 && armandRaw(id) >= ARMAND.min);

export const armandQty = id => Math.max(ARMAND.min, Math.min(ARMAND.max, Math.round(armandRaw(id) / 5) * 5));
export const armandRate = id => ARMAND.pay * masteryMult(id) * (1 + ARMAND.fidPay * armandFid(id)) * (1 + domStepSum('armand', 'pay'));
export const armandPay = (o, n) => round5(ITEMS[o.id].sell * n * armandRate(o.id));
export const armandTotal = o => (o ? armandPay(o, o.qty) : 0);
export const armandBonus = o => round5(armandTotal(o) * ARMAND.bonus);
export const armandBonusXp = o => Math.round(armandBonus(o) * ARMAND.xp);

// un produit devenu trop cher pour le budget du niveau (ancienne sauvegarde) ne donne pas de commande
const makeOrder = id => (armandRaw(id) < ARMAND.min ? null : { id, qty: armandQty(id), got: 0, done: false });

// à chaque seconde (et au retour) : une nouvelle visite au début de chaque semaine
export function armandTick() {
    if (!armandOpen()) return false;
    const k = cycle();
    const a = A();
    if (!armandHere()) {
        if (!a.orders.some(Boolean)) return false;
        // il repart : sans la Suite, les commandes disparaissent ; avec elle, seules les commandes finies s'effacent
        const next = a.orders.map(o => (keepOn() && o && !o.done ? o : null));
        const changed = next.some((o, i) => o !== a.orders[i]);
        a.orders = next;
        return changed;
    }
    if (a.k === k) return false;
    a.k = k;
    a.orders = a.flags.map((id, i) => {
        if (!id || !ITEMS[id]) return null;
        const old = a.orders[i];
        return keepOn() && old && old.id === id && !old.done ? old : makeOrder(id);
    });
    if (view.started && !view.hidden) {
        toast('Armand, du Grand Hôtel, est de passage : trois jours pour le servir !', ['villager', 'armand']);
        sfx('horn');
    }
    return true;
}

// déclarer (ou changer) un produit phare : libre tant que rien n'est livré sur cette place
export const armandCanChange = (slot = 0) => {
    const o = armandOrder(slot);
    return slot < armandSlots() && (!o || o.got === 0);
};
export function setFlagship(id, slot = 0) {
    if (!armandOpen() || !ITEMS[id] || !armandCandidates().includes(id) || !armandCanChange(slot)) return false;
    const a = A();
    if (a.flags.some((f, i) => f === id && i !== slot)) return false;
    a.flags[slot] = id;
    a.orders[slot] = armandHere() ? makeOrder(id) : null;
    sfx('ok');
    return true;
}

// livrer tout ce qu'on a (ou n unités) sur une place
export function deliverArmand(at, slot = 0, n) {
    const a = state.armand;
    const o = a && armandHere() && a.k === cycle() && armandOrder(slot);
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
        const bonus = armandBonus(o);
        earn(bonus, at);
        addXp(armandBonusXp(o), at);
        for (let j = 0; j < ARMAND.mats; j++) giveRare(pickRand(RARE), 2, at);
        a.fid[o.id] = Math.min(ARMAND.fidMax, armandFid(o.id) + 1);
        state.stats.armands = (state.stats.armands || 0) + 1;
        state.income.trucks += bonus;
        sfx('level');
        toast('Commande d’Armand complète ! Le Grand Hôtel vous récompense', ['villager', 'armand']);
    }
    return true;
}
