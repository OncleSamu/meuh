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
import { pkTransportOk, pkReq, pkEstimate, pkHave, pullPk } from './maison.js';
import { pfTransportOk, pfReq, pfEstimate, pfHave, pullPf } from './perfume.js';
import { cfTransportOk, cfReq, cfEstimate, cfHave, pullCf } from './confiserie.js';
import { brTransportOk, brReq, brEstimate, brHave, pullBr } from './brewery.js';
import { wagonTarget } from './orders.js';
import { metierTransportPay } from './metier.js';

export const holdCount = () => CARGO.holds + domStepSum('cargo', 'hold');
export const cargoOpen = () => state.level >= CARGO.lvl;
const V = visitor(CARGO.every, () => stayOf(CARGO.stay, CARGO.every));
const cycle = V.cycle;
export const cargoArrive = V.arrive;
export const cargoLeave = V.leave;
// 1.22 : un avion déjà reparti ne revient pas dans la même période si la Réception allonge son séjour
export const cargoHere = t => cargoOpen() && V.here(t) && !(state.cargo && state.cargo.gone === cycle(t));

function pickWeighted(list) {
    let x = Math.random() * list.reduce((a, i) => a + itemWeight(i.id), 0);
    for (const i of list) if ((x -= itemWeight(i.id)) <= 0) return i;
    return list[list.length - 1];
}
function makeSpecHold(kind) {
    if (kind === 'pk') {
        const pk = pkReq();
        return { id: 'paquet', pk, qty: 2 + Math.floor(Math.random() * 3), got: 0, est: Math.round(pkEstimate(pk) * CARGO_PK_PAY) };
    }
    if (kind === 'pf') {
        const pf = pfReq();
        return { id: 'perfumeCustom', pf, qty: 2 + Math.floor(Math.random() * 3), got: 0, est: Math.round(pfEstimate(pf) * CARGO_PF_PAY) };
    }
    if (kind === 'cf') {
        const cf = cfReq();
        return { id: 'confCustom', cf, qty: 3 + Math.floor(Math.random() * 4), got: 0, est: Math.round(cfEstimate(cf) * CARGO_CF_PAY) };
    }
    const br = brReq();
    return { id: 'brewCustom', br, qty: 3 + Math.floor(Math.random() * 4), got: 0, est: Math.round(brEstimate(br) * CARGO_BR_PAY) };
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
    // 1.106 : comme le train, une soute suit la production de la ferme (trois wagons par soute au moins),
    // et les soutes de l'atelier préfèrent les produits de valeur (120 par soute au plus quand c'est possible)
    const value = Math.max(CARGO.value(scaleLvl()), 3 * wagonTarget());
    const fine = made.filter(i => i.sell >= value / 120);
    take(raw, 3);
    take(fine.length >= 6 ? fine : made, holdCount() - out.length);
    take(pool, holdCount() - out.length);
    const holds = out.map(it => ({
        id: it.id,
        qty: Math.max(CARGO.min, Math.min(CARGO.max, Math.round((value * (0.8 + Math.random() * 0.4)) / Math.max(1, it.sell)))),
        got: 0,
    }));
    // 1.104.1, 1.146 & 1.183 : jusqu'à deux soutes spécialisées (paquets, parfums, confiseries, brasserie)
    const specPool = [];
    if (pkTransportOk()) specPool.push(['pk', CARGO_PK]);
    if (pfTransportOk()) specPool.push(['pf', CARGO_PF]);
    if (cfTransportOk()) specPool.push(['cf', CARGO_CF]);
    if (brTransportOk()) specPool.push(['br', CARGO_BR]);
    if (specPool.length && holds.length) {
        const first = pickRand(specPool);
        if (Math.random() < Math.min(0.75, first[1] + (specPool.length - 1) * 0.1)) {
            holds[holds.length - 1] = makeSpecHold(first[0]);
            const rest = specPool.filter(x => x[0] !== first[0]);
            if (rest.length && holds.length >= 2 && Math.random() < 0.45) {
                const second = pickRand(rest);
                holds[holds.length - 2] = makeSpecHold(second[0]);
            }
        }
    }
    return holds;
}
const CARGO_PK = 0.5,
    CARGO_PK_PAY = 1.6,
    CARGO_PF = 0.45,
    CARGO_PF_PAY = 1.75,
    CARGO_CF = 0.45,
    CARGO_CF_PAY = 1.75,
    CARGO_BR = 0.45,
    CARGO_BR_PAY = 1.7;
const isSpecHold = h => !!(h && (h.pk || h.pf || h.cf || h.br));
const haveFor = h => (h.pk ? pkHave(h.pk) : h.pf ? pfHave(h.pf) : h.cf ? cfHave(h.cf) : h.br ? brHave(h.br) : state.inventory[h.id] || 0);
export const holdHave = h => haveFor(h);
export const holdPay = (h, n) => round5((isSpecHold(h) ? h.est : ITEMS[h.id].sell * metierTransportPay(h.id)) * n * CARGO.pay);
export const cargoTotal = () => (state.cargo && state.cargo.holds ? state.cargo.holds.reduce((a, h) => a + holdPay(h, h.qty), 0) : 0);
export const cargoBonus = () => round5(cargoTotal() * (CARGO.bonus + domStepSum('cargo', 'bonus')));
// 1.106 : les soutes ont grossi, pas l'expérience : elle se compte sur la quantité qu'une soute demandait avant
const xpScale = h => (isSpecHold(h) ? 1 : Math.min(1, Math.max(CARGO.min, Math.min(CARGO.max, Math.round(CARGO.value(scaleLvl()) / Math.max(1, ITEMS[h.id].sell)))) / h.qty));
export const cargoBonusXp = () =>
    state.cargo && state.cargo.holds ? Math.round(state.cargo.holds.reduce((a, h) => a + holdPay(h, h.qty) * xpScale(h), 0) * (CARGO.bonus + domStepSum('cargo', 'bonus')) * CARGO.xp) : 0;
export const cargoFull = () => !!(state.cargo && state.cargo.holds && state.cargo.holds.every(h => h.got >= h.qty));

// à chaque seconde (et au retour) : un nouvel avion au début de chaque période
export function cargoTick() {
    if (!cargoOpen()) return false;
    const k = cycle();
    const c = (state.cargo = state.cargo || { k: -1, holds: [], done: false });
    if (!cargoHere()) {
        if (c.k === k && !V.here()) c.gone = k;
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
    const can = Math.min(haveFor(h), h.qty - h.got, n || Infinity);
    if (can <= 0) return false;
    let val = 0;
    if (h.pk) val = pullPk(h.pk, can);
    else if (h.pf) val = pullPf(h.pf, can);
    else if (h.cf) val = pullCf(h.cf, can);
    else if (h.br) val = pullBr(h.br, can);
    else {
        state.inventory[h.id] -= can;
        clampQuality(h.id);
    }
    h.got += can;
    // 1.104.5 & 1.183 : une soute spécialisée paie selon la valeur réelle des lots chargés
    const gold = h.pk
        ? round5(val * CARGO_PK_PAY * CARGO.pay)
        : h.pf
          ? round5(val * CARGO_PF_PAY * CARGO.pay)
          : h.cf
            ? round5(val * CARGO_CF_PAY * CARGO.pay)
            : h.br
              ? round5(val * CARGO_BR_PAY * CARGO.pay)
              : holdPay(h, can);
    earn(gold, at);
    // l'expérience reste à l'échelle d'avant la 1.106
    addXp(Math.round(gold * CARGO.xp * xpScale(h)), at);
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
    cargoHere() && state.cargo && !state.cargo.done ? state.cargo.holds.filter(h => h.got < h.qty && haveFor(h) > 0).length : 0;
