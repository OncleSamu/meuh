// L'oasis (1.48) : une grille de cases où l'on plante cultures et arbres de l'oasis, et la citerne qui les fait boire.
// Une case k : state.oasis.plots[k] (culture : { open, id, prog, ready, last, v }) et state.oasis.orchard[k] (arbre : { open, tree }).
// L'eau : la source remplit la citerne (même jeu fermé), le chadouf aussi ; chaque plante boit en poussant, deux fois plus
// au soleil de midi à 16 h ; une case voisine d'un palmier dattier adulte est à l'ombre (un tiers de moins, pas de chaleur).
// Sans eau, rien ne meurt : tout attend.
import { state, lvOk } from '../core/state.js';
import { now } from '../core/clock.js';
import { fmt, s, dateKey } from '../core/format.js';
import { emit, toast, sfx, buzz, burst, float, fly, squish, changed } from '../core/bus.js';
import { ITEMS } from '../data/items.js';
import { OASIS } from '../data/oasis.js';
import { BALANCE } from '../data/progress.js';
import { speedMult, addXp, spend, rank, rollYield } from './player.js';
import { hour, weather } from './world.js';
import { masterySpeed, addMastery } from './mastery.js';
import { barnBlocked, rollRare } from './barn.js';
import { projectDone, storyOk } from './story.js';
import { collect, record } from './book.js';
import { addQuality, ascend } from './farm.js';
import { eventProgress } from './events.js';
import { tip } from './tips.js';
import { takeVarSeed, harvestVariety, varExtra, varGrowth, varThirst } from './genetics.js';
import { slotsOf, plantTree, pickTree, treeStage, groundFull, advanceTree } from './orchard.js';
import { compSpeed, plotFx, compHarvest, OASIS_BASE } from './companions.js';
import { hasCost, payCost } from './home.js';

const COIN = ['ui', 'coin'];
const DROP = ['ui', 'drop'];

// ---------------- ouverture et cases ----------------
export const oasisOpen = () => projectDone(OASIS.project);
export const oasisLvlOk = () => state.level >= OASIS.lvl;
export const chadoufOpen = () => projectDone('oasisShadoof');
export const oasisCrops = () => Object.values(ITEMS).filter(i => i.type === 'crop' && i.oasis);
export const oasisCropOk = d => (lvOk(d) && storyOk(d)) || state.seeds[d.id] > 0;
export const oasisPlots = () => (state.oasis ? state.oasis.plots : []);
export const oasisCellOpen = k => !!(state.oasis && state.oasis.plots[k] && state.oasis.plots[k].open);
const openCells = () => oasisPlots().filter(p => p.open).length;
export const oasisCellCost = () => Math.floor(OASIS.cellCost * Math.pow(OASIS.cellMult, Math.max(0, openCells() - OASIS.cellsBase)));

export function ensureOasis() {
    if (!state.oasis || !Array.isArray(state.oasis.plots)) state.oasis = { plots: [], orchard: [], water: OASIS.start, tank: 0, ups: {}, chad: {} };
    const O = state.oasis;
    if (!Array.isArray(O.orchard)) O.orchard = [];
    O.ups = O.ups || {};
    O.chad = O.chad || {};
    if (typeof O.water !== 'number' || !(O.water >= 0)) O.water = OASIS.start;
    O.tank = Math.max(0, Math.min(OASIS.tank.length - 1, O.tank | 0));
    while (O.plots.length < OASIS.cells) O.plots.push({ open: false, id: null, prog: 0, ready: false, last: null });
    while (O.orchard.length < OASIS.cells) O.orchard.push({ open: false, tree: null });
    if (oasisOpen()) for (let k = 0; k < OASIS.cellsBase; k++) O.plots[k].open = true;
    // une case ouverte l'est pour les cultures comme pour les arbres
    O.plots.forEach((p, k) => (O.orchard[k].open = !!p.open));
    O.water = Math.min(O.water, tankCap());
    return O;
}

export function buyOasisCell(at) {
    const p = oasisPlots().find(x => !x.open);
    if (!p) return false;
    const cost = oasisCellCost();
    if (state.money < cost) {
        toast(`Il faut ${fmt(cost)} pièces pour une nouvelle case à l’oasis`, COIN);
        sfx('error');
        return false;
    }
    spend(cost);
    p.open = true;
    ensureOasis();
    sfx('buy');
    buzz(15);
    burst(at, 'sparkle', 10);
    float(at, [`-${fmt(cost)}`, COIN], 'bad', -14);
    changed('oasis');
    return true;
}

// ---------------- l'eau ----------------
export const tankCap = () => OASIS.tank[(state.oasis && state.oasis.tank) || 0];
export const oasisWater = () => (state.oasis ? state.oasis.water : 0);
export const tankNext = () => {
    const t = (state.oasis && state.oasis.tank) || 0;
    return t + 1 < OASIS.tank.length ? { cap: OASIS.tank[t + 1], cost: OASIS.tankCost[t] } : null;
};
// litres par heure à la source
export const springRate = () => OASIS.spring + OASIS.springUps.reduce((a, [id, , l]) => a + (state.oasis && state.oasis.ups[id] ? l : 0), 0);
export const springUpNext = () => OASIS.springUps.find(([id]) => !(state.oasis && state.oasis.ups[id])) || null;

export function upgradeTank(at) {
    const n = tankNext();
    if (!oasisOpen() || !n || !hasCost(n.cost)) return false;
    payCost(n.cost);
    state.oasis.tank++;
    sfx('level');
    buzz(20);
    burst(at, 'water', 12);
    toast(`La citerne s’agrandit : ${tankCap()} litres`, ['ui', 'oaCiterne']);
    changed('oasis');
    return true;
}
export function upgradeSpring(at) {
    const n = springUpNext();
    if (!oasisOpen() || !n || !hasCost(n[3])) return false;
    payCost(n[3]);
    state.oasis.ups[n[0]] = now();
    sfx('level');
    buzz(20);
    burst(at, 'water', 12);
    toast(`${n[1]} : la source donne ${springRate()} litres par heure`, ['ui', n[0] === 'deep' ? 'oaPuits' : 'oaFoggara']);
    changed('oasis');
    return true;
}

// ---------------- la chaleur et l'ombre ----------------
export const isHot = (h = hour()) => h >= OASIS.heat[0] && h < OASIS.heat[1];
const shadePalm = t => t && t.id === OASIS.palm && (treeStage(t) === 'adult' || treeStage(t) === 'old');
// les huit voisines d'une case
export function cellNeighbors(k) {
    const c = OASIS.cols,
        r = Math.floor(k / c),
        col = k % c,
        out = [];
    for (let dr = -1; dr <= 1; dr++)
        for (let dc = -1; dc <= 1; dc++) {
            if (!dr && !dc) continue;
            const rr = r + dr,
                cc = col + dc;
            if (rr < 0 || cc < 0 || cc >= c || rr * c + cc >= OASIS.cells) continue;
            out.push(rr * c + cc);
        }
    return out;
}
export const isShaded = k => cellNeighbors(k).some(j => shadePalm((slotsOf('oasis')[j] || {}).tree));

// ---------------- ce que boit une case (litres par seconde) ----------------
export const cropGrowTime = id => ITEMS[id].time / speedMult();
export const oasisRate = id => OASIS.rate * (1 + rank('green') * 0.05) * Math.max(0.9, weather().crop) * masterySpeed(id);
const cropStep = (p, k) => oasisRate(p.id) * (p.v ? varGrowth(p.v) : 1) * compSpeed(OASIS_BASE + k);
// le facteur de soif : l'ombre, la chaleur (heat : 1 hors des heures chaudes), la variété
function thirst(k, palm, v, heat) {
    const f = isShaded(k) ? OASIS.shade : palm ? 1 : heat;
    return f * varThirst(v);
}
export function cellNeed(k, heat = isHot() ? OASIS.heatMult : 1) {
    const p = oasisPlots()[k];
    if (p && p.id && !p.ready) return (OASIS.drink.crop / 3600) * thirst(k, false, p.v, heat);
    const t = (slotsOf('oasis')[k] || {}).tree;
    if (!t) return 0;
    const st = treeStage(t);
    if (st === 'dead' || (st !== 'young' && groundFull(t))) return 0;
    const palm = t.id === OASIS.palm;
    return ((palm ? OASIS.drink.palm : OASIS.drink.tree) / 3600) * thirst(k, palm, t.v, heat);
}
// litres par heure que boit toute l'oasis en ce moment
export const oasisDrink = () => oasisPlots().reduce((a, p, k) => a + (p.open ? cellNeed(k) : 0), 0) * 3600;
export const isThirsty = k => cellNeed(k) > 0 && oasisWater() < 0.01;

// avance l'oasis de dt secondes ; renvoie ce qui est arrivé
function step(dt, heat) {
    const O = state.oasis;
    O.water = Math.min(tankCap(), O.water + (springRate() * dt) / 3600);
    const needs = O.plots.map((p, k) => (p.open ? cellNeed(k, heat) * dt : 0));
    const total = needs.reduce((a, b) => a + b, 0);
    const f = total > 0 ? Math.min(1, O.water / total) : 1;
    O.water = Math.max(0, O.water - total * f);
    O.dry = total > 0 && f < 1;
    let crops = 0,
        fruits = 0;
    O.plots.forEach((p, k) => {
        if (!p.open || !needs[k]) return;
        if (p.id && !p.ready) {
            p.prog += dt * f * cropStep(p, k);
            if (p.prog >= cropGrowTime(p.id)) {
                p.prog = cropGrowTime(p.id);
                p.ready = true;
                crops++;
            }
            return;
        }
        const t = O.orchard[k].tree;
        if (t && f > 0) fruits += advanceTree(t, dt * f).fell;
    });
    return { crops, fruits };
}

export function oasisTick() {
    if (!state.oasis || !oasisOpen()) return false;
    const was = Math.floor(state.oasis.water),
        dry = !!state.oasis.dry;
    const r = step(1, isHot() ? OASIS.heatMult : 1);
    if (r.crops || r.fruits) emit('ripe', 'oasis');
    if (!dry && state.oasis.dry) tip('oasisDry');
    return !!(r.crops || r.fruits || was !== Math.floor(state.oasis.water) || dry !== !!state.oasis.dry);
}

// jeu fermé : la source coule, les plantes boivent (la chaleur moyenne d'une journée)
export function oasisOffline(elapsed) {
    if (!state.oasis || !oasisOpen()) return { crops: 0, fruits: 0 };
    let left = Math.min(elapsed, OASIS.offlineMax),
        crops = 0,
        fruits = 0;
    while (left > 0) {
        const dt = Math.min(120, left);
        left -= dt;
        const r = step(dt, OASIS.offlineHeat);
        crops += r.crops;
        fruits += r.fruits;
    }
    return { crops, fruits };
}

// ---------------- le chadouf ----------------
const today = () => dateKey(new Date(now()));
export function chadoufLeft() {
    if (!state.oasis) return 0;
    const c = state.oasis.chad;
    return c.day === today() ? Math.max(0, OASIS.chadouf.perDay - (c.n || 0)) : OASIS.chadouf.perDay;
}
// une séance : scoops seaux bien remontés (sur OASIS.chadouf.scoops), chacun de 0 à 1
export function chadoufDraw(scores, at) {
    if (!oasisOpen() || !chadoufOpen() || !chadoufLeft()) return 0;
    const C = OASIS.chadouf;
    const litres = Math.min(
        C.max,
        Math.round(
            scores
                .slice(0, C.scoops)
                .map(x => Math.max(0, Math.min(1, +x || 0)))
                .reduce((a, x) => a + x * C.perScoop, 0),
        ),
    );
    const c = state.oasis.chad;
    if (c.day !== today()) {
        c.day = today();
        c.n = 0;
    }
    c.n++;
    const room = tankCap() - state.oasis.water;
    const got = Math.min(room, litres);
    state.oasis.water += got;
    state.stats.chadouf = (state.stats.chadouf || 0) + got;
    tip('chadouf');
    if (got) {
        sfx('water');
        burst(at, 'water', 10, -4);
        float(at, [`+${Math.round(got)} L`, DROP], '', -16);
    }
    if (litres > got) toast('La citerne est pleine : le reste retourne au puits', DROP);
    changed('oasis');
    return got;
}

// ---------------- planter ----------------
export function plantOasis(k, id, at, quiet) {
    const p = oasisPlots()[k],
        d = ITEMS[id];
    if (!p || !p.open || p.id || slotsOf('oasis')[k].tree || !d || !d.oasis || d.type !== 'crop') return false;
    if (!oasisCropOk(d)) {
        if (!quiet) toast(`${d.seedName} : débloqué au niveau ${d.reqLvl}`, ['ui', 'lock']);
        return false;
    }
    if (state.seeds[id] > 0) state.seeds[id]--;
    else if (state.money >= d.cost) {
        spend(d.cost);
        if (!quiet) float(at, [`-${d.cost}`, COIN], 'bad', -14);
    } else {
        if (!quiet) {
            toast('Pas assez d’argent pour des graines', COIN);
            sfx('error');
        }
        return false;
    }
    Object.assign(p, { id, prog: 0, ready: false, last: id, v: null });
    if (!quiet) {
        sfx('plant');
        burst(at, 'dirt', 6, 6);
        buzz(6);
        tip('oasis');
    }
    changed('oasis');
    return true;
}
export function plantOasisVar(k, vid, at) {
    const p = oasisPlots()[k];
    const v = state.genetics && state.genetics.vars[vid];
    if (!p || !p.open || p.id || slotsOf('oasis')[k].tree || !v || !ITEMS[v.base].oasis || ITEMS[v.base].type !== 'crop') return false;
    if (!takeVarSeed(vid)) {
        toast('Plus de graines de cette variété', ['ui', 'flowers']);
        return false;
    }
    Object.assign(p, { id: v.base, prog: 0, ready: false, last: v.base, v: vid });
    sfx('plant');
    burst(at, 'sparkle', 4, -4);
    changed('oasis');
    return true;
}
// un arbre sur une case : le verger de l'oasis (orchard.js, zone 'oasis')
export function plantOasisTree(k, id, at) {
    const p = oasisPlots()[k];
    if (!p || !p.open || p.id) return false;
    if (!plantTree(k, id, at, 'oasis')) return false;
    if (id === OASIS.palm) tip('oasisShade');
    changed('oasis');
    return true;
}

// ---------------- récolter ----------------
function rollOasisQuality(k) {
    let x = 0.08 + 0.15 + 0.05;
    x += rank('expert') * 0.05;
    x += Math.min(0.1, state.prestige.rubans * 0.01);
    x += plotFx(OASIS_BASE + k).quality;
    const r = Math.random();
    return r < x * 0.35 ? 2 : r < x ? 1 : 0;
}
export function harvestOasis(k, at, quiet) {
    const p = oasisPlots()[k];
    if (!p || !p.ready) return null;
    if (barnBlocked()) return null;
    const d = ITEMS[p.id];
    const fx = plotFx(OASIS_BASE + k);
    const qty = rollYield('crop') + (p.v ? varExtra(p.v) : 0) + (Math.random() < fx.extra ? 1 : 0);
    compHarvest(OASIS_BASE + k);
    state.inventory[d.id] += qty;
    if (p.v) harvestVariety(p.v, qty);
    state.stats.harvested += qty;
    state.stats.oasisHarvest = (state.stats.oasisHarvest || 0) + qty;
    addMastery(d.id, qty);
    const q = ascend(d.id, rollOasisQuality(k));
    if (q) addQuality(d.id, q, qty);
    if (q >= 2) {
        state.stats.goldQ += qty;
        collect('g_' + d.id);
    }
    eventProgress('harvest', d.id, qty);
    rollRare(BALANCE.rareDrop, at);
    Object.assign(p, { id: null, prog: 0, ready: false, v: null, lastCrop: d.id, lastAt: now() });
    if (!quiet) {
        sfx('harvest');
        buzz(12);
        burst(at, 'sparkle', 7, -6);
        burst(at, 'leaf', 5);
        float(at, [`+${qty}`, ['item', d.id], ['q', q]], q === 2 ? 'gold' : '', -18);
        fly(at, d.id, qty);
        addXp(d.xp, at);
    }
    changed('oasis');
    return { id: d.id, qty, xp: d.xp };
}

// tout récolter : les cultures mûres et les fruits au pied des arbres
export function harvestAllOasis(at) {
    const totals = {};
    let xp = 0,
        n = 0;
    const add = (r, k) => {
        totals[r.id] = (totals[r.id] || 0) + r.qty;
        xp += r.xp;
        emit('oasisFx', { k, delay: n * 50 });
        n++;
    };
    oasisPlots().forEach((p, k) => {
        if (!p.ready) return;
        const r = harvestOasis(k, at, true);
        if (r) add(r, k);
    });
    slotsOf('oasis').forEach((sl, k) => {
        if (!sl.tree || !sl.tree.ground) return;
        const r = pickTree(k, at, true, 'oasis');
        if (r) add(r, k);
    });
    if (!n) {
        if (!barnBlocked(true)) toast('Rien à récolter à l’oasis');
        squish(at);
        return 0;
    }
    sfx('harvest');
    buzz(15);
    float(
        at,
        Object.keys(totals).flatMap(id => [`+${totals[id]}`, ['item', id]]),
        '',
        -20,
    );
    addXp(xp, at);
    record(
        'harvest',
        Object.values(totals).reduce((a, b) => a + b, 0),
    );
    return n;
}
export const oasisToPick = () => oasisPlots().filter(p => p.ready).length + slotsOf('oasis').filter(sl => sl.tree && sl.tree.ground).length;

export function replantOasis(at) {
    let n = 0;
    oasisPlots().forEach((p, k) => {
        if (p.open && !p.id && p.last && !slotsOf('oasis')[k].tree && plantOasis(k, p.last, at, true)) n++;
    });
    if (n) {
        sfx('plant');
        toast(`${n} case${s(n)} replantée${s(n)} à l’oasis`, ['ui', 'oaOasis']);
    } else {
        toast('Aucune case à replanter (graines ou pièces manquantes ?)');
        squish(at);
    }
    return n;
}

export const oasisReady = () => oasisPlots().filter(p => p.ready).length;
