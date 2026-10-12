// L'île : des parcelles tropicales (jamais à arroser, toujours de saison) et un verger des îles.
// Une parcelle : { open, id, prog, ready, last } ; le verger de l'île est géré par orchard.js (zone 'island').
import { state } from '../core/state.js';
import { fmt, s } from '../core/format.js';
import { emit, toast, sfx, buzz, burst, float, fly, squish, changed } from '../core/bus.js';
import { ITEMS } from '../data/items.js';
import { ISLAND } from '../data/island.js';
import { BALANCE } from '../data/progress.js';
import { speedMult, addXp, spend, rank, rollYield } from './player.js';
import { weather } from './world.js';
import { masterySpeed, addMastery } from './mastery.js';
import { barnBlocked, rollRare } from './barn.js';
import { projectDone, storyOk } from './story.js';
import { collect, record } from './book.js';
import { addQuality } from './farm.js';
import { eventProgress } from './events.js';
import { tip } from './tips.js';

const COIN = ['ui', 'coin'];

export const islandOpen = () => projectDone(ISLAND.project);
export const islandCrops = () => Object.values(ITEMS).filter(i => i.type === 'crop' && i.island);
export const islandCropOk = d => (state.level >= d.reqLvl && storyOk(d)) || state.seeds[d.id] > 0;
export const islandPlots = () => (state.island ? state.island.plots : []);
const openPlots = () => islandPlots().filter(p => p.open).length;
export const islandPlotCost = () => Math.floor(ISLAND.plotCost * Math.pow(ISLAND.plotMult, Math.max(0, openPlots() - ISLAND.plotsBase)));
export const islandRate = id => ISLAND.rate * (1 + rank('green') * 0.05) * Math.max(0.9, weather().crop) * masterySpeed(id);
export const islandGrowTime = id => ITEMS[id].time / speedMult();
export const islandPct = p => (p.ready ? 1 : p.id ? Math.min(1, p.prog / islandGrowTime(p.id)) : 0);
export const islandLeft = p => (p.id && !p.ready ? Math.max(0, (islandGrowTime(p.id) - p.prog) / islandRate(p.id)) : 0);

export function ensureIsland() {
    if (!state.island || !Array.isArray(state.island.plots)) state.island = { plots: [], orchard: [] };
    const I = state.island;
    if (!Array.isArray(I.orchard)) I.orchard = [];
    while (I.plots.length < ISLAND.plotsMax) I.plots.push({ open: false, id: null, prog: 0, ready: false, last: null });
    while (I.orchard.length < ISLAND.slotsMax) I.orchard.push({ open: false, tree: null });
    if (islandOpen()) {
        for (let k = 0; k < ISLAND.plotsBase; k++) I.plots[k].open = true;
        for (let k = 0; k < ISLAND.slotsBase; k++) I.orchard[k].open = true;
    }
}

export function buyIslandPlot(at) {
    const p = islandPlots().find(x => !x.open);
    if (!p) return false;
    const cost = islandPlotCost();
    if (state.money < cost) {
        toast(`Il faut ${fmt(cost)} pièces pour une nouvelle parcelle sur l’île`, COIN);
        sfx('error');
        return false;
    }
    spend(cost);
    p.open = true;
    sfx('buy');
    buzz(15);
    burst(at, 'sparkle', 10);
    float(at, [`-${fmt(cost)}`, COIN], 'bad', -14);
    changed('island');
    return true;
}

// planter : graines du stock, sinon achetées sur place
export function plantIsland(k, id, at, quiet) {
    const p = islandPlots()[k],
        d = ITEMS[id];
    if (!p || !p.open || p.id || !d || !d.island || d.type !== 'crop') return false;
    if (!islandCropOk(d)) {
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
    Object.assign(p, { id, prog: 0, ready: false, last: id });
    if (!quiet) {
        sfx('plant');
        burst(at, 'dirt', 6, 6);
        buzz(6);
        tip('island');
    }
    changed('island');
    return true;
}

function rollIslandQuality() {
    let x = 0.08 + 0.15 + 0.05;
    x += rank('expert') * 0.05;
    x += Math.min(0.1, state.prestige.rubans * 0.01);
    const r = Math.random();
    return r < x * 0.35 ? 2 : r < x ? 1 : 0;
}

export function harvestIsland(k, at, quiet) {
    const p = islandPlots()[k];
    if (!p || !p.ready) return null;
    if (barnBlocked()) return null;
    const d = ITEMS[p.id];
    const qty = rollYield('crop');
    state.inventory[d.id] += qty;
    state.stats.harvested += qty;
    addMastery(d.id, qty);
    const q = rollIslandQuality();
    if (q) addQuality(d.id, q, qty);
    if (q === 2) {
        state.stats.goldQ += qty;
        collect('g_' + d.id);
    }
    eventProgress('harvest', d.id, qty);
    rollRare(BALANCE.rareDrop, at);
    Object.assign(p, { id: null, prog: 0, ready: false });
    if (!quiet) {
        sfx('harvest');
        buzz(12);
        burst(at, 'sparkle', 7, -6);
        burst(at, 'leaf', 5);
        float(at, [`+${qty}`, ['item', d.id], ['q', q]], q === 2 ? 'gold' : '', -18);
        fly(at, d.id, qty);
        addXp(d.xp, at);
    }
    changed('island');
    return { id: d.id, qty, xp: d.xp };
}

// tout récolter, puis replanter chaque parcelle avec sa dernière culture
export function harvestAllIsland(at) {
    const totals = {};
    let xp = 0,
        n = 0;
    islandPlots().forEach((p, k) => {
        if (!p.ready) return;
        const r = harvestIsland(k, at, true);
        if (!r) return;
        totals[r.id] = (totals[r.id] || 0) + r.qty;
        xp += r.xp;
        emit('islandFx', { k, delay: n * 50 });
        n++;
    });
    if (!n) {
        if (!barnBlocked(true)) toast('Rien à récolter sur l’île');
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

export function replantIsland(at) {
    let n = 0;
    islandPlots().forEach((p, k) => {
        if (p.open && !p.id && p.last && plantIsland(k, p.last, at, true)) n++;
    });
    if (n) {
        sfx('plant');
        toast(`${n} parcelle${s(n)} replantée${s(n)} sur l’île`, ['item', 'pineapple']);
    } else {
        toast('Aucune parcelle à replanter (graines ou pièces manquantes ?)');
        squish(at);
    }
    return n;
}

// ---------------- le temps qui passe ----------------
function grow(p, dt) {
    if (!p.id || p.ready) return false;
    p.prog += dt * islandRate(p.id);
    if (p.prog >= islandGrowTime(p.id)) {
        p.prog = islandGrowTime(p.id);
        p.ready = true;
        return true;
    }
    return false;
}

export function islandTick() {
    if (!state.island) return false;
    let ch = false;
    islandPlots().forEach(p => {
        if (grow(p, 1)) {
            ch = true;
            emit('ripe', 'island');
        }
    });
    return ch;
}

export function islandOffline(elapsed) {
    let n = 0;
    islandPlots().forEach(p => grow(p, elapsed) && n++);
    return n;
}

export const islandReady = () => islandPlots().filter(p => p.ready).length;
export const islandEmpty = () => islandPlots().filter(p => p.open && !p.id).length;
