// Les Terres d’Asie (1.171) : des rizières en terrasses (4 colonnes × 5 rangées) irriguées en cascade
// depuis un bassin de source, des rigoles de bambou, une roue à eau en rythme, un pavillon de bambou
// (cerf sika, ver à soie, poule soie), la jonque de la soie, la mousson et la floraison des cerisiers (Hanami).
import { state, lvOk, ecoLvl } from '../core/state.js';
import { now } from '../core/clock.js';
import { fmt, s, dateKey } from '../core/format.js';
import { emit, toast, sfx, buzz, burst, float, fly, squish, changed } from '../core/bus.js';
import { ITEMS } from '../data/items.js';
import { ASIE, ASIE_GROVE, PAVILION, JUNK, ASIE_WEATHER, ASIE_IDS, ASIE_PRODUCTS } from '../data/asie.js';
import { ANIMALS } from '../data/animals.js';
import { isAdult } from './animals.js';
import { inPasture, asiaPavilionOpen, asiaPavilionCap } from './pastures.js';
import { BALANCE } from '../data/progress.js';
import { speedMult, addXp, spend, rank, rollYield, earn } from './player.js';
import { sellPrice } from './market.js';
import { RECIPES_ASIE } from '../data/ajouts/asie-cuisine.js';
import { NEW_DRINKS_ASIE } from '../data/counter.js';
import { weather } from './world.js';
import { masterySpeed, addMastery } from './mastery.js';
import { barnBlocked, rollRare } from './barn.js';
import { projectDone, storyOk } from './story.js';
import { collect, record } from './book.js';
import { addPhoto } from './style.js';
import { addQuality, ascend } from './farm.js';
import { eventProgress } from './events.js';
import { tip } from './tips.js';
import { takeVarSeed, harvestVariety, varRank, varExtra, varGrowth } from './genetics.js';
import { slotsOf, pickTree, treeStage, groundFull, advanceTree } from './orchard.js';
import { compSpeed, plotFx, compHarvest, ASIE_BASE } from './companions.js';
import { hasCost, payCost } from './home.js';

const COIN = ['ui', 'coin'];
const WATER = ['ui', 'asEau'];

// ---------------- ouverture et cases ----------------
export const asieOpen = () => projectDone(ASIE.project);
export const asieLvlOk = () => state.level >= ASIE.lvl;
export const wheelOpen = () => projectDone('asiaWheel');
export const asieCrops = () => Object.values(ITEMS).filter(i => i.type === 'crop' && i.asie);
export const asieCropOk = d => (lvOk(d) && storyOk(d)) || state.seeds[d.id] > 0;
export const asiePlots = () => (state.asie ? state.asie.plots : []);
const openCells = () => asiePlots().filter(p => p.open).length;
export const asieCellCost = () => Math.floor(ASIE.cellCost * Math.pow(ASIE.cellMult, Math.max(0, openCells() - ASIE.cellsBase)));

export function ensureAsie() {
    if (!state.asie || !Array.isArray(state.asie.plots))
        state.asie = { plots: [], orchard: [], canals: {}, water: ASIE.start, ups: {}, wheel: {} };
    if (!state.asie.junk) state.asie.junk = { load: {}, out: null, trips: 0 };
    const A = state.asie;
    if (!Array.isArray(A.orchard)) A.orchard = [];
    if (!A.canals || typeof A.canals !== 'object') A.canals = {};
    if (typeof A.water !== 'number' || Number.isNaN(A.water)) A.water = ASIE.start;
    A.ups = A.ups || {};
    A.wheel = A.wheel || {};
    while (A.plots.length < ASIE.cells) A.plots.push({ open: false, id: null, prog: 0, ready: false, last: null });
    while (A.orchard.length < ASIE.cells) A.orchard.push({ open: false, tree: null });
    if (asieOpen()) for (let k = 0; k < ASIE.cellsBase; k++) A.plots[k].open = true;
    A.plots.forEach((p, k) => (A.orchard[k].open = !!p.open));
    if (!Array.isArray(A.grove)) A.grove = [];
    while (A.grove.length < ASIE_GROVE.max) A.grove.push({ open: false, tree: null });
    if (asieOpen()) for (let k = 0; k < ASIE_GROVE.base; k++) A.grove[k].open = true;
    for (const k of Object.keys(A.canals)) if (!A.plots[+k] || !A.plots[+k].open) delete A.canals[k];
    return A;
}

export function buyAsieCell(at) {
    const p = asiePlots().find(x => !x.open);
    if (!p) return false;
    const cost = asieCellCost();
    if (state.money < cost) {
        toast(`Il faut ${fmt(cost)} pièces pour une nouvelle terrasse aux Terres d’Asie`, COIN);
        sfx('error');
        return false;
    }
    spend(cost);
    p.open = true;
    ensureAsie();
    sfx('buy');
    buzz(15);
    burst(at, 'sparkle', 10);
    float(at, [`-${fmt(cost)}`, COIN], 'bad', -14);
    changed('asie');
    return true;
}

// ---------------- bassin de source, rigoles et cascade ----------------
export const asieUp = id => !!(state.asie && state.asie.ups[id]);
export const canalAt = k => !!(state.asie && state.asie.canals[k]);
export const canalKeys = () => Object.keys((state.asie && state.asie.canals) || {}).map(Number);
export const asieBasinCap = () => ASIE.basin[asieUp('reservoir') ? 1 : 0];
export const asieWater = () => (state.asie ? Math.max(0, state.asie.water || 0) : 0);
export const asieSpringLph = () => (ASIE.spring + (asieUp('reservoir') ? ASIE.springBonus : 0)) * (monsoonOn() ? ASIE_WEATHER.monsoon.springMult : 1);
export const asieUpNext = () => ASIE.ups.find(([id]) => !asieUp(id)) || null;
export const terraceRow = k => Math.floor(k / ASIE.cols);

const cellFree = k => {
    const p = asiePlots()[k];
    return !!(p && p.open && !p.id && !(slotsOf('asie')[k] || {}).tree && !canalAt(k));
};
export const canCanal = k => cellFree(k);

// Calcule quelles cases reçoivent l'eau en cascade et leur profondeur de chute (0 à 3)
function cascadeMap() {
    const plots = asiePlots();
    const reach = new Array(ASIE.cells).fill(-1);
    const cols = ASIE.cols;
    // La rangée 0 (haute) boit directement au bassin
    for (let c = 0; c < cols; c++) if (plots[c] && plots[c].open) reach[c] = 0;
    const weir = asieUp('weir');
    // Parcours du haut vers le bas : une rigole alimentée propage la cascade vers le bas et les côtés
    for (let k = 0; k < ASIE.cells; k++) {
        if (!canalAt(k) || reach[k] < 0) continue;
        const cr = Math.floor(k / cols),
            cc = k % cols;
        // voisines gauche/droite sur la même terrasse (déversoir latéral)
        for (const dc of [-1, 1]) {
            const nc = cc + dc;
            if (nc < 0 || nc >= cols) continue;
            const nk = cr * cols + nc;
            if (plots[nk] && plots[nk].open && reach[nk] < 0) reach[nk] = 0;
        }
        // cascade verticale vers les terrasses inférieures (1 colonne, ou 3 colonnes avec le double déversoir)
        const dcs = weir ? [-1, 0, 1] : [0];
        for (let r = cr + 1; r < ASIE.cells / cols; r++) {
            for (const dc of dcs) {
                const nc = cc + dc;
                if (nc < 0 || nc >= cols) continue;
                const nk = r * cols + nc;
                if (plots[nk] && plots[nk].open) reach[nk] = Math.max(reach[nk], r - cr);
            }
        }
    }
    return reach;
}

export function isIrrigated(k) {
    const p = asiePlots()[k];
    if (!p || !p.open) return false;
    if (monsoonOn()) return true;
    if (asieWater() <= 0) return false;
    return cascadeMap()[k] >= 0;
}

export function cascadeDepth(k) {
    if (!isIrrigated(k)) return 0;
    const d = cascadeMap()[k];
    return d > 0 ? Math.min(3, d) : 0;
}

export function buildCanal(k, at) {
    if (!asieOpen() || !cellFree(k) || !hasCost(ASIE.canal.cost)) return false;
    payCost(ASIE.canal.cost);
    state.asie.canals[k] = true;
    sfx('level');
    buzz(15);
    burst(at, 'sparkle', 8);
    tip('asieCanal');
    changed('asie');
    return true;
}

export function removeCanal(k) {
    if (!canalAt(k)) return false;
    delete state.asie.canals[k];
    changed('asie');
    return true;
}

export function upgradeAsie(id, at) {
    const u = ASIE.ups.find(x => x[0] === id);
    if (!asieOpen() || !u || asieUp(id) || !hasCost(u[3])) return false;
    payCost(u[3]);
    state.asie.ups[id] = now();
    sfx('level');
    buzz(20);
    burst(at, 'sparkle', 12);
    toast(`${u[1]} : ${u[2]}`, ['ui', 'asRigoleOn']);
    changed('asie');
    return true;
}

// ---------------- la pousse et la consommation d'eau ----------------
function cellGrowing(k) {
    const p = asiePlots()[k];
    if (!p || !p.open || canalAt(k) || p.mud) return false;
    if (p.id && !p.ready) return true;
    const t = (slotsOf('asie')[k] || {}).tree;
    if (!t) return false;
    const st = treeStage(t);
    return st !== 'dead' && (st === 'young' || !groundFull(t));
}

export function asieCellMult(k) {
    if (!isIrrigated(k)) return ASIE.dry;
    return 1 + cascadeDepth(k) * ASIE.cascadeBonus;
}

export const isDryAsieCell = k => cellGrowing(k) && !isIrrigated(k);
export const asieDryCount = () => asiePlots().filter((p, k) => p.open && isDryAsieCell(k)).length;

export function asieDrainLph() {
    if (!state.asie || monsoonOn()) return 0;
    const reach = cascadeMap();
    const stoneMult = asieUp('terraceStone') ? ASIE.terraceStone : 1;
    let lph = 0;
    asiePlots().forEach((p, k) => {
        if (!cellGrowing(k) || reach[k] < 0) return;
        lph += (p.id ? ASIE.drink.crop : ASIE.drink.tree) * stoneMult;
    });
    return lph;
}

export const asieGrow = id => ITEMS[id].time / speedMult();
export const asieRate = id => ASIE.rate * (1 + rank('green') * 0.05) * Math.max(0.9, weather().crop) * masterySpeed(id);
const cropStep = (p, k) => asieRate(p.id) * (p.v ? varGrowth(p.v) : 1) * compSpeed(ASIE_BASE + k);

function step(dt) {
    const A = state.asie;
    const cap = asieBasinCap();
    const inL = (asieSpringLph() * dt) / 3600;
    const reach = cascadeMap();
    const mon = monsoonOn();
    const han = hanamiOn() ? ASIE_WEATHER.hanami.mult : 1;
    const stoneMult = asieUp('terraceStone') ? ASIE.terraceStone : 1;

    // L'eau arrive au bassin avant consommation
    A.water = Math.min(cap, Math.max(0, (A.water || 0) + inL));

    // Consommation des terrasses irriguées qui poussent
    let need = 0;
    A.plots.forEach((p, k) => {
        if (!cellGrowing(k)) return;
        if (!mon && reach[k] >= 0) need += ((p.id ? ASIE.drink.crop : ASIE.drink.tree) * stoneMult * dt) / 3600;
    });
    const hadWater = mon || A.water > 0;
    if (!mon && need > 0) A.water = Math.max(0, A.water - need);

    let crops = 0,
        fruits = 0;
    A.plots.forEach((p, k) => {
        if (!cellGrowing(k)) return;
        const irr = mon || (hadWater && reach[k] >= 0);
        const depth = irr && reach[k] > 0 ? Math.min(3, reach[k]) : 0;
        const m = (irr ? 1 + depth * ASIE.cascadeBonus : ASIE.dry) * han * (1 + 0.06 * rank('riceGrow'));
        if (p.id && !p.ready) {
            p.prog += dt * m * cropStep(p, k);
            if (p.prog >= asieGrow(p.id)) {
                p.prog = asieGrow(p.id);
                p.ready = true;
                crops++;
            }
            return;
        }
        const t = A.orchard[k].tree;
        if (t) fruits += advanceTree(t, dt * m).fell;
    });
    // Le verger d'Asie pousse au calme sans consommer le bassin ; le Hanami l'accélère
    A.grove.forEach(sl => {
        if (sl.tree) fruits += advanceTree(sl.tree, dt * han).fell;
    });
    return { crops, fruits };
}

export function asieTick() {
    if (!state.asie || !asieOpen()) return false;
    const wBefore = Math.floor(asieWater());
    const wEv = asieWeatherTick();
    const r = step(1);
    if (r.crops || r.fruits) emit('ripe', 'asie');
    if (asieWater() <= 0 && asieDryCount()) tip('asieDry');
    return !!(wEv || r.crops || r.fruits || wBefore !== Math.floor(asieWater()));
}

export function asieOffline(elapsed) {
    if (!state.asie || !asieOpen()) return { crops: 0, fruits: 0 };
    const A = state.asie,
        t = now();
    if (A.monsoonAt && A.monsoonAt < t) A.monsoonAt = t + span(ASIE_WEATHER.monsoon.every);
    if (A.hanamiAt && A.hanamiAt < t) A.hanamiAt = t + span(ASIE_WEATHER.hanami.every);
    let left = Math.min(elapsed, ASIE.offlineMax),
        crops = 0,
        fruits = 0;
    while (left > 0) {
        const dt = Math.min(120, left);
        left -= dt;
        const r = step(dt);
        crops += r.crops;
        fruits += r.fruits;
    }
    return { crops, fruits };
}

// ---------------- la roue à eau en bambou (minijeu de rythme) ----------------
const today = () => dateKey(new Date(now()));
export function wheelLeft() {
    if (!state.asie) return 0;
    const w = state.asie.wheel;
    return w.day === today() ? Math.max(0, ASIE.wheel.perDay - (w.n || 0)) : ASIE.wheel.perDay;
}
export function wheelDraw(scores, at) {
    if (!asieOpen() || !wheelOpen() || !wheelLeft()) return 0;
    const W = ASIE.wheel;
    const liters = Math.min(
        W.max,
        Math.round(
            scores
                .slice(0, W.scoops)
                .map(x => Math.max(0, Math.min(1, +x || 0)))
                .reduce((a, x) => a + x * W.perScoop, 0),
        ),
    );
    const w = state.asie.wheel;
    if (w.day !== today()) {
        w.day = today();
        w.n = 0;
    }
    w.n++;
    state.asie.water = Math.min(asieBasinCap(), (state.asie.water || 0) + liters);
    state.stats.wheelWater = (state.stats.wheelWater || 0) + liters;
    tip('asieWheel');
    if (liters) {
        sfx('water');
        burst(at, 'sparkle', 8, -4);
        float(at, [`+${liters} L`, WATER], '', -16);
    }
    changed('asie');
    return liters;
}

// ---------------- planter ----------------
export function plantAsie(k, id, at, quiet) {
    const p = asiePlots()[k],
        d = ITEMS[id];
    if (!p || !p.open || p.id || canalAt(k) || slotsOf('asie')[k].tree || !d || !d.asie || d.type !== 'crop') return false;
    if (!asieCropOk(d)) {
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
        tip('asie');
    }
    changed('asie');
    return true;
}

export function plantAsieVar(k, vid, at) {
    const p = asiePlots()[k];
    const v = state.genetics && state.genetics.vars[vid];
    if (!p || !p.open || p.id || canalAt(k) || slotsOf('asie')[k].tree || !v || !ITEMS[v.base].asie || ITEMS[v.base].type !== 'crop') return false;
    if (!takeVarSeed(vid)) {
        toast('Plus de graines de cette variété', ['ui', 'flowers']);
        return false;
    }
    Object.assign(p, { id: v.base, prog: 0, ready: false, last: v.base, v: vid });
    sfx('plant');
    burst(at, 'sparkle', 4, -4);
    changed('asie');
    return true;
}

// ---------------- récolter ----------------
function rollAsieQuality(k, vid) {
    let x = 0.08 + 0.15 + 0.05;
    x += rank('expert') * 0.05;
    x += Math.min(0.1, state.prestige.rubans * 0.01);
    x += plotFx(ASIE_BASE + k).quality;
    return varRank(vid, x);
}

export function harvestAsie(k, at, quiet) {
    const p = asiePlots()[k];
    if (!p || !p.ready || p.mud) return null;
    if (barnBlocked()) return null;
    const d = ITEMS[p.id];
    const fx = plotFx(ASIE_BASE + k);
    const qty = rollYield('crop') + (p.v ? varExtra(p.v) : 0) + (Math.random() < fx.extra ? 1 : 0);
    compHarvest(ASIE_BASE + k);
    state.inventory[d.id] += qty;
    state.stats.harvested += qty;
    state.stats.asieHarvest = (state.stats.asieHarvest || 0) + qty;
    addMastery(d.id, qty);
    const q = ascend(d.id, rollAsieQuality(k, p.v));
    if (p.v) harvestVariety(p.v, qty, q);
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
    changed('asie');
    return { id: d.id, qty, xp: d.xp };
}

export function harvestAllAsie(at) {
    const totals = {};
    let xp = 0,
        n = 0;
    const add = (r, k) => {
        totals[r.id] = (totals[r.id] || 0) + r.qty;
        xp += r.xp;
        emit('asieFx', { k, delay: n * 50 });
        n++;
    };
    asiePlots().forEach((p, k) => {
        if (!p.ready || p.mud) return;
        const r = harvestAsie(k, at, true);
        if (r) add(r, k);
    });
    slotsOf('asie').forEach((sl, k) => {
        if (!sl.tree || !sl.tree.ground) return;
        const r = pickTree(k, at, true, 'asie');
        if (r) add(r, k);
    });
    slotsOf('asieV').forEach((sl, k) => {
        if (!sl.tree || !sl.tree.ground) return;
        const r = pickTree(k, at, true, 'asieV');
        if (r) add(r, 40 + k);
    });
    if (!n) {
        if (!barnBlocked(true)) toast('Rien à récolter aux Terres d’Asie');
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

export const asieToPick = () =>
    asiePlots().filter(p => p.ready && !p.mud).length +
    slotsOf('asie').filter(sl => sl.tree && sl.tree.ground).length +
    slotsOf('asieV').filter(sl => sl.tree && sl.tree.ground).length;

export function replantAsie(at) {
    let n = 0;
    asiePlots().forEach((p, k) => {
        if (p.open && !p.id && p.last && !slotsOf('asie')[k].tree && !canalAt(k) && plantAsie(k, p.last, at, true)) n++;
    });
    if (n) {
        sfx('plant');
        toast(`${n} terrasse${s(n)} replantée${s(n)} aux Terres d’Asie`, WATER);
    } else {
        toast('Aucune terrasse à replanter (graines ou pièces manquantes ?)');
        squish(at);
    }
    return n;
}
export const asieReady = () => asiePlots().filter(p => p.ready && !p.mud).length;

// ================= Le pavillon de bambou =================
export const asieBeasts = () => (asiaPavilionOpen() ? inPasture(PAVILION.key) : []);
// Le ver à soie aime l'air humide : si le bassin est à sec, il produit deux fois moins vite
export function asieBeastMult(a) {
    if (a && a.trip && ANIMALS[a.type] && ANIMALS[a.type].asie) return 0;
    if (!a || !ANIMALS[a.type] || !ANIMALS[a.type].asie || !ANIMALS[a.type].wet || !isAdult(a)) return 1;
    return asieWater() > 0 || monsoonOn() ? 1 : PAVILION.dryMult;
}
export function asieBeastMultOffline(a) {
    return asieBeastMult(a);
}
export function upAsiePavilion(at) {
    if (!asiaPavilionOpen() || state.asie.pavilionBig || !hasCost(PAVILION.upCost)) return false;
    payCost(PAVILION.upCost);
    state.asie.pavilionBig = true;
    sfx('level');
    burst(at, 'sparkle', 12);
    toast(`${PAVILION.name} s’agrandit : ${PAVILION.cap[1]} places`, ['ui', 'asPavillon']);
    changed('animals');
    return true;
}
export const asiePavilionFree = () => asiaPavilionCap() - asieBeasts().length;

// ================= La jonque de la soie =================
export const junkOpen = () => projectDone(JUNK.project);
const ensureJunk = () => (state.asie.junk ||= { load: {}, out: null, trips: 0 });
export const junkState = () => (state.asie ? ensureJunk() : { load: {}, out: null, trips: 0 });
export const junkSikas = () => asieBeasts().filter(a => a.type === 'sika' && isAdult(a) && !a.sick && !a.trip);
export const junkLoads = () => Object.values(junkState().load).reduce((a, n) => a + n, 0);
const ASIE_GOODS = new Set([
    ...ASIE_IDS,
    ...ASIE_PRODUCTS.map(p => p[0]),
    ...RECIPES_ASIE.map(r => r[0]),
    ...NEW_DRINKS_ASIE.map(r => r[0]),
    JUNK.spice.id,
]);
export const isAsieGood = id => ASIE_GOODS.has(id);
export const junkMult = id => (id && !isAsieGood(id) ? JUNK.otherMult : JUNK.mult) * (1 + (projectDone(JUNK.lanternProject) ? JUNK.lanternBonus : 0));
export const junkValue = (load = junkState().load) =>
    Math.round((Object.entries(load).reduce((a, [id, n]) => a + n * JUNK.perLoad * sellPrice(id) * junkMult(id), 0) * (1 + 0.1 * rank('caravaner'))) / 10) * 10;
const junkFree = id => (state.inventory[id] || 0) - (junkState().load[id] || 0) * JUNK.perLoad;
export const junkGoods = () =>
    Object.keys(state.inventory).filter(
        id => ITEMS[id] && !['material', 'rare', 'seed'].includes(ITEMS[id].type) && ITEMS[id].sell > 0 && junkFree(id) >= JUNK.perLoad,
    );
export function junkAdd(id, n = 1) {
    const c = ensureJunk();
    if (c.out || !junkOpen()) return false;
    let k = 0;
    while (k < n && junkLoads() < JUNK.loads && junkFree(id) >= JUNK.perLoad) {
        c.load[id] = (c.load[id] || 0) + 1;
        k++;
    }
    if (k) changed('asie');
    return k > 0;
}
export function junkRemove(id) {
    const c = ensureJunk();
    if (c.out || !c.load[id]) return false;
    if (!--c.load[id]) delete c.load[id];
    changed('asie');
    return true;
}
export function junkSend(at) {
    const c = ensureJunk();
    if (c.out || !junkOpen() || !junkLoads() || junkSikas().length < JUNK.sikas) return false;
    for (const [id, n] of Object.entries(c.load)) if ((state.inventory[id] || 0) < n * JUNK.perLoad) return false;
    for (const [id, n] of Object.entries(c.load)) state.inventory[id] -= n * JUNK.perLoad;
    const team = junkSikas()
        .slice(0, JUNK.sikas)
        .map(a => a.uid);
    team.forEach(uid => (state.animals.find(a => a.uid === uid).trip = true));
    c.out = { load: c.load, value: junkValue(), back: now() + JUNK.time, team };
    c.load = {};
    sfx('buy');
    burst(at, 'sparkle', 10);
    toast('La jonque lève l’ancre pour le grand port d’Orient : retour dans 7 heures', ['ui', 'asJonque']);
    tip('junk');
    changed('asie');
    return true;
}
export const junkBack = () => !!(state.asie && state.asie.junk && state.asie.junk.out && now() >= state.asie.junk.out.back);
export function junkClaim(at) {
    const c = ensureJunk();
    if (!c.out || now() < c.out.back) return false;
    const { value, team } = c.out;
    earn(value, at);
    let spice = 0;
    if (Math.random() < JUNK.spice.chance) {
        spice = JUNK.spice.min + Math.floor(Math.random() * (JUNK.spice.max - JUNK.spice.min + 1));
        state.inventory[JUNK.spice.id] = (state.inventory[JUNK.spice.id] || 0) + spice;
    }
    state.animals.forEach(a => team.includes(a.uid) && delete a.trip);
    c.out = null;
    c.trips++;
    state.stats.junks = (state.stats.junks || 0) + 1;
    addXp(240 + 20 * Math.min(60, ecoLvl()), at);
    sfx('level');
    toast(`La jonque est rentrée : ${fmt(value)} pièces${spice ? ` et ${spice} étoiles de badiane` : ''}`, ['ui', 'asJonque']);
    changed('asie');
    return { value, spice };
}

// ================= La mousson et la floraison des cerisiers (Hanami) =================
export const monsoonOn = () => !!(state.asie && state.asie.monsoon && state.asie.monsoon.until > now());
export const hanamiOn = () => !!(state.asie && state.asie.hanami && state.asie.hanami.until > now());
export const mudCells = () => asiePlots().filter(p => p.mud).length;
const span = ([a, b]) => a + Math.random() * (b - a);

export function asieWeatherTick() {
    if (!state.asie || !asieOpen() || !asiaPavilionOpen()) return false;
    const A = state.asie,
        t = now();
    let changedAny = false;
    if (!A.monsoonAt) A.monsoonAt = t + span(ASIE_WEATHER.monsoon.every);
    if (t >= A.monsoonAt) {
        A.monsoonAt = t + span(ASIE_WEATHER.monsoon.every);
        const open = A.plots
            .map((p, k) => k)
            .filter(k => A.plots[k].open && !A.plots[k].mud && !canalAt(k) && (A.plots[k].id || slotsOf('asie')[k].tree));
        const n = Math.min(open.length, ASIE_WEATHER.monsoon.cells[0] + Math.floor(Math.random() * (ASIE_WEATHER.monsoon.cells[1] - ASIE_WEATHER.monsoon.cells[0] + 1)));
        for (let j = 0; j < n; j++) A.plots[open.splice(Math.floor(Math.random() * open.length), 1)[0]].mud = true;
        A.monsoon = { until: t + ASIE_WEATHER.monsoon.last };
        if (A.junk && A.junk.out) A.junk.out.back += JUNK.monsoonDelay;
        state.stats.monsoons = (state.stats.monsoons || 0) + 1;
        toast(n ? `Mousson sur les terrasses : ${n} case${s(n)} envasée${s(n)} à drainer` : 'Mousson sur les terrasses : la source coule à flots !', [
            'ui',
            'asMousson',
        ]);
        tip('monsoon');
        changedAny = true;
    }
    if (!A.hanamiAt) A.hanamiAt = t + span(ASIE_WEATHER.hanami.every);
    if (t >= A.hanamiAt && !hanamiOn()) {
        A.hanamiAt = t + span(ASIE_WEATHER.hanami.every);
        A.hanami = { until: t + ASIE_WEATHER.hanami.last };
        state.stats.hanamis = (state.stats.hanamis || 0) + 1;
        toast('Hanami ! Pluie de pétales de cerisier : tout pousse ×1,5 pendant une heure', ['ui', 'asHanami']);
        tip('hanami');
        if (state.stats.hanamis === 1) addPhoto('ui', 'asHanami', 'Floraison des cerisiers', 'Pluie de pétales aux Terres d’Asie');
        changedAny = true;
    }
    if (changedAny) changed('asie');
    return changedAny;
}

export function clearMud(k, at) {
    const p = asiePlots()[k];
    if (!p || !p.mud) return false;
    p.mud = false;
    sfx('pop');
    burst(at, 'dirt', 8, -4);
    state.stats.mudCleared = (state.stats.mudCleared || 0) + 1;
    changed('asie');
    return true;
}
