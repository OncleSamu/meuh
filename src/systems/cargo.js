// 1.8 : l'avion-cargo. Il se pose toutes les 48 heures (temps réel, même jeu fermé) et reste 24 heures.
// Six soutes énormes : trois produits de la ferme, trois de l'atelier. Chaque unité chargée paie tout de suite ;
// l'avion plein donne un gros bonus. Les soutes se remplissent petit à petit.
import { state, scaleLvl } from '../core/state.js';
import { visitor } from '../core/visits.js';
import { view } from '../core/view.js';
import { pickRand, round5 } from '../core/format.js';
import { toast, sfx, buzz, burst } from '../core/bus.js';
import { ITEMS } from '../data/items.js';
import { RECIPES } from '../data/machines.js';
import { CARGO, RARE } from '../data/commerce.js';
import { questPool, itemWeight } from './orders.js';
import { earn, addXp } from './player.js';
import { clampQuality } from './farm.js';
import { giveRare } from './barn.js';
import { stayOf, domStepSum } from './estate.js';

export const holdCount = () => CARGO.holds + domStepSum('cargo', 'hold');
export const cargoOpen = () => state.level >= CARGO.lvl;
const V = visitor(CARGO.every, () => stayOf(CARGO.stay, CARGO.every));
const cycle = V.cycle;
export const cargoArrive = V.arrive;
export const cargoLeave = V.leave;
export const cargoHere = t => cargoOpen() && V.here(t);

function pickWeighted(list) {
    let x = Math.random() * list.reduce((a, i) => a + itemWeight(i.id), 0);
    for (const i of list) if ((x -= itemWeight(i.id)) <= 0) return i;
    return list[list.length - 1];
}
function makeHolds() {
    const pool = questPool();
    const raw = pool.filter(i => !RECIPES[i.id]),
        made = pool.filter(i => RECIPES[i.id]);
    const out = [];
    const take = (list, n) => {
        for (let k = 0; k < n; k++) {
            const left = list.filter(i => !out.includes(i));
            if (left.length) out.push(pickWeighted(left));
        }
    };
    take(raw, 3);
    take(made, holdCount() - out.length);
    take(pool, holdCount() - out.length);
    const value = CARGO.value(scaleLvl());
    return out.map(it => ({
        id: it.id,
        qty: Math.max(CARGO.min, Math.min(CARGO.max, Math.round((value * (0.8 + Math.random() * 0.4)) / Math.max(1, it.sell)))),
        got: 0,
    }));
}
export const holdPay = (h, n) => round5(ITEMS[h.id].sell * n * CARGO.pay);
export const cargoTotal = () => (state.cargo && state.cargo.holds ? state.cargo.holds.reduce((a, h) => a + holdPay(h, h.qty), 0) : 0);
export const cargoBonus = () => round5(cargoTotal() * (CARGO.bonus + domStepSum('cargo', 'bonus')));
export const cargoBonusXp = () => Math.round(cargoBonus() * CARGO.xp);
export const cargoFull = () => !!(state.cargo && state.cargo.holds && state.cargo.holds.every(h => h.got >= h.qty));

// à chaque seconde (et au retour) : un nouvel avion au début de chaque période
export function cargoTick() {
    if (!cargoOpen()) return false;
    const k = cycle();
    const c = (state.cargo = state.cargo || { k: -1, holds: [], done: false });
    if (!cargoHere()) {
        if (c.holds.length && c.k === k) {
            c.holds = [];
            return true;
        }
        return false;
    }
    if (c.k === k) return false;
    Object.assign(c, { k, holds: makeHolds(), done: false });
    if (view.started && !view.hidden) {
        toast('L’avion-cargo vient de se poser : 24 heures pour remplir ses soutes !', ['ui', 'plane']);
        sfx('horn');
    }
    return true;
}

// charger une soute avec tout ce qu'on peut (ou n unités)
export function loadHold(i, at, n) {
    const c = state.cargo;
    const h = c && cargoHere() && c.holds[i];
    if (!h || c.done) return false;
    const can = Math.min(state.inventory[h.id] || 0, h.qty - h.got, n || Infinity);
    if (can <= 0) return false;
    state.inventory[h.id] -= can;
    clampQuality(h.id);
    h.got += can;
    const gold = holdPay(h, can);
    earn(gold, at);
    addXp(Math.round(gold * CARGO.xp), at);
    state.income.trucks = (state.income.trucks || 0) + gold;
    sfx('load');
    buzz(10);
    if (at) burst(at, 'crumbs', 8);
    if (cargoFull()) {
        c.done = true;
        const bonus = cargoBonus();
        earn(bonus, at);
        addXp(cargoBonusXp(), at);
        for (let j = 0; j < CARGO.mats; j++) giveRare(pickRand(RARE), 2, at);
        state.stats.cargos = (state.stats.cargos || 0) + 1;
        state.income.trucks += bonus;
        sfx('level');
        toast('Avion-cargo plein ! Le pilote décolle avec un gros bonus', ['ui', 'plane']);
    }
    return true;
}
export const cargoReady = () =>
    cargoHere() && state.cargo && !state.cargo.done ? state.cargo.holds.filter(h => h.got < h.qty && (state.inventory[h.id] || 0) > 0).length : 0;
