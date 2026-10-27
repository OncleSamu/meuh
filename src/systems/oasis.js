// L'oasis (1.48) : une grille de cases où l'on plante cultures et arbres de l'oasis, et la citerne qui les fait boire.
// Une case k : state.oasis.plots[k] (culture : { open, id, prog, ready, last, v }) et state.oasis.orchard[k] (arbre : { open, tree }).
// L'eau : la source remplit la citerne (même jeu fermé), le chadouf aussi ; chaque plante boit en poussant, deux fois plus
// au soleil de midi à 16 h ; une case voisine d'un sorgho bien levé est à l'ombre (un tiers de moins, pas de chaleur).
// Sans eau, rien ne meurt : tout attend.
import { state, lvOk } from '../core/state.js';
import { now } from '../core/clock.js';
import { fmt, s, dateKey } from '../core/format.js';
import { emit, toast, sfx, buzz, burst, float, fly, squish, changed } from '../core/bus.js';
import { ITEMS } from '../data/items.js';
import { OASIS, PEN, CARAVAN, STORM, OASIS_IDS, OASIS_PRODUCTS } from '../data/oasis.js';
import { RECIPES_150 } from '../data/v150.js';
import { NEW_DRINKS_154 } from '../data/counter.js';
import { ANIMALS } from '../data/animals.js';
import { BALANCE } from '../data/progress.js';
import { speedMult, addXp, spend, rank, rollYield, earn } from './player.js';
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
import { inPasture, enclosOpen, isOasisBeast, pastureFree } from './pastures.js';
import { sellPrice } from './market.js';
import { isAdult } from './animals.js';

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
export const springRate = () =>
    OASIS.spring + OASIS.springUps.reduce((a, [id, , l]) => a + (state.oasis && state.oasis.ups[id] ? l : 0), 0) + (noriaZebu() ? PEN.noria.lph : 0);
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
// 1.58 : le sorgho fait l'ombre, plus le palmier dattier : debout (levé de moitié ou mûr), tant qu'on ne l'a pas récolté
const shadeCrop = p => !!p && p.id === OASIS.shadeCrop && !p.sand && (p.ready || p.prog >= ITEMS[p.id].time * OASIS.shadeFrom);
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
export const isShaded = k => cellNeighbors(k).some(j => shadeCrop(oasisPlots()[j]));

// ---------------- ce que boit une case (litres par seconde) ----------------
export const cropGrowTime = id => ITEMS[id].time / speedMult();
export const oasisRate = id => OASIS.rate * (1 + rank('green') * 0.05) * Math.max(0.9, weather().crop) * masterySpeed(id);
const cropStep = (p, k) => oasisRate(p.id) * (p.v ? varGrowth(p.v) : 1) * compSpeed(OASIS_BASE + k);
// le facteur de soif : l'ombre, la chaleur (heat : 1 hors des heures chaudes), la variété
function thirst(k, v, heat) {
    const f = isShaded(k) ? OASIS.shade : heat;
    return f * varThirst(v);
}
export function cellNeed(k, heat = isHot() ? OASIS.heatMult : 1) {
    const p = oasisPlots()[k];
    if (p && p.sand) return 0; // ensablée : elle attend qu'on la dégage
    if (p && p.id && !p.ready) return (OASIS.drink.crop / 3600) * thirst(k, p.v, heat);
    const t = (slotsOf('oasis')[k] || {}).tree;
    if (!t) return 0;
    const st = treeStage(t);
    if (st === 'dead' || (st !== 'young' && groundFull(t))) return 0;
    return (OASIS.drink.tree / 3600) * thirst(k, t.v, heat);
}
// litres par heure que boit toute l'oasis en ce moment
export const oasisDrink = () => oasisPlots().reduce((a, p, k) => a + (p.open ? cellNeed(k) : 0), 0) * 3600;
export const isThirsty = k => cellNeed(k) > 0 && oasisWater() < 0.01;

// avance l'oasis de dt secondes ; renvoie ce qui est arrivé
function step(dt, heat) {
    const O = state.oasis;
    O.water = Math.min(tankCap(), O.water + (springRate() * dt) / 3600);
    const needs = O.plots.map((p, k) => (p.open ? cellNeed(k, heat) * dt : 0));
    // 1.49 : les bêtes de l'enclos boivent à la même citerne
    const beasts = (penDrink() * dt) / 3600;
    const total = needs.reduce((a, b) => a + b, 0) + beasts;
    const f = total > 0 ? Math.min(1, O.water / total) : 1;
    O.water = Math.max(0, O.water - total * f);
    O.dry = total > 0 && f < 1;
    O.penF = beasts > 0 ? f : 1;
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
        if (id === OASIS.shadeCrop) tip('oasisShade');
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

// ================= 1.49 : l'enclos de la palmeraie =================
export const penBeasts = () => (enclosOpen() ? inPasture(PEN.key) : []);
export const noriaBuilt = () => !!(state.oasis && state.oasis.noria);
export const noriaZebu = () => (noriaBuilt() ? penBeasts().find(a => a.noria && a.type === 'zebu' && isAdult(a)) || null : null);
// litres par heure que boivent les bêtes adultes de l'enclos
export const penDrink = () => penBeasts().reduce((s2, a) => s2 + (isAdult(a) ? ANIMALS[a.type].drink || 0 : 0), 0);
// les sorghos debout abritent chacun quelques bêtes du soleil de midi
export const standingShade = () => oasisPlots().filter(p => p.open && shadeCrop(p)).length;
export const penShadeSlots = () => standingShade() * PEN.shadePerCrop;
export function penShaded(a) {
    const list = penBeasts().filter(b => isAdult(b) && !b.noria);
    const i = list.indexOf(a);
    return i >= 0 && i < penShadeSlots();
}
// la vitesse d'une bête de l'oasis : l'eau, la chaleur de midi au soleil, la noria
export function oasisBeastMult(a) {
    if (!a || !isOasisBeast(a.type)) return 1;
    if (a.noria || a.trip) return 0;
    let m = state.oasis && typeof state.oasis.penF === 'number' ? state.oasis.penF : 1;
    if (isHot() && !PEN.heatProof.includes(a.type) && !penShaded(a)) m *= PEN.heatMult;
    return m;
}
export function buildNoria(at) {
    if (!enclosOpen() || noriaBuilt() || !hasCost(PEN.noria.cost)) return false;
    payCost(PEN.noria.cost);
    state.oasis.noria = true;
    sfx('level');
    burst(at, 'water', 12);
    toast('La noria est montée : attelez un zébu, et la source donne 8 litres de plus par heure', ['ui', 'oaNoria']);
    changed('oasis');
    return true;
}
// atteler (ou dételer) un zébu : un seul à la fois ; attelé, il ne donne plus de lait
export function toggleNoria(uid) {
    const a = state.animals.find(x => x.uid === uid);
    if (!a || a.type !== 'zebu' || !noriaBuilt() || !isAdult(a)) return false;
    if (a.noria) a.noria = false;
    else {
        penBeasts().forEach(b => (b.noria = false));
        a.noria = true;
    }
    toast(a.noria ? `${a.name} tourne la noria : +${PEN.noria.lph} L/h à la source` : `${a.name} retourne brouter`, ['ui', 'oaNoria']);
    changed('animals');
    return true;
}
export function enclosUpgrade(at) {
    if (!enclosOpen() || state.oasis.penBig || !hasCost(PEN.upCost)) return false;
    payCost(PEN.upCost);
    state.oasis.penBig = true;
    sfx('level');
    burst(at, 'sparkle', 12);
    toast(`${PEN.name} s’agrandit : ${PEN.cap[1]} places`, ['ui', 'oaEnclos']);
    changed('animals');
    return true;
}
export const penFree = () => pastureFree(PEN.key);

// ================= 1.49 : les caravanes =================
export const caravanOpen = () => projectDone(CARAVAN.project);
export const caravanCamels = () => penBeasts().filter(a => a.type === 'dromedary' && isAdult(a) && !a.noria && !a.sick && !a.trip);
const ensureCaravan = () => (state.oasis.caravan ||= { load: {}, out: null, trips: 0 });
export const caravanState = () => (state.oasis ? ensureCaravan() : { load: {}, out: null, trips: 0 });
export const caravanLoads = () => Object.values(caravanState().load).reduce((a, n) => a + n, 0);
// les produits de l'oasis : plantes, laines et laits, recettes des trois machines, épices rares
const OASIS_GOODS = new Set([
    ...OASIS_IDS,
    ...OASIS_PRODUCTS.map(p => p[0]),
    ...RECIPES_150.map(r => r[0]),
    ...NEW_DRINKS_154.map(r => r[0]),
    CARAVAN.spice.id,
]);
export const isOasisGood = id => OASIS_GOODS.has(id);
// le prix de la caravane : × le grossiste ; sans produit, le tarif de l'oasis
export const caravanMult = id => (id && !isOasisGood(id) ? CARAVAN.otherMult : CARAVAN.mult) * (1 + (projectDone('soukStalls') ? CARAVAN.soukBonus : 0));
// ce que rapportera la caravane chargée
export const caravanValue = (load = caravanState().load) =>
    Math.round(Object.entries(load).reduce((a, [id, n]) => a + n * CARAVAN.perLoad * sellPrice(id) * caravanMult(id), 0) / 10) * 10;
// les produits qu'on peut charger : ceux de la grange, par 10
export const caravanGoods = () =>
    Object.keys(state.inventory).filter(
        id => ITEMS[id] && !['material', 'rare', 'seed'].includes(ITEMS[id].type) && ITEMS[id].sell > 0 && freeStock(id) >= CARAVAN.perLoad,
    );
const freeStock = id => (state.inventory[id] || 0) - (caravanState().load[id] || 0) * CARAVAN.perLoad;
export function caravanAdd(id, n = 1) {
    const c = ensureCaravan();
    if (c.out || !caravanOpen()) return false;
    let k = 0;
    while (k < n && caravanLoads() < CARAVAN.loads && freeStock(id) >= CARAVAN.perLoad) {
        c.load[id] = (c.load[id] || 0) + 1;
        k++;
    }
    if (k) changed('oasis');
    return k > 0;
}
export function caravanRemove(id) {
    const c = ensureCaravan();
    if (c.out || !c.load[id]) return false;
    if (!--c.load[id]) delete c.load[id];
    changed('oasis');
    return true;
}
export function caravanSend(at) {
    const c = ensureCaravan();
    if (c.out || !caravanOpen() || !caravanLoads() || caravanCamels().length < CARAVAN.camels) return false;
    for (const [id, n] of Object.entries(c.load)) {
        if ((state.inventory[id] || 0) < n * CARAVAN.perLoad) return false;
    }
    for (const [id, n] of Object.entries(c.load)) state.inventory[id] -= n * CARAVAN.perLoad;
    const camels = caravanCamels()
        .slice(0, CARAVAN.camels)
        .map(a => a.uid);
    camels.forEach(uid => (state.animals.find(a => a.uid === uid).trip = true));
    c.out = { load: c.load, value: caravanValue(), back: now() + CARAVAN.time, camels };
    c.load = {};
    sfx('buy');
    burst(at, 'sparkle', 10);
    toast(`La caravane part au souk de la ville : retour dans 6 heures`, ['ui', 'oaCaravane']);
    tip('caravan');
    changed('oasis');
    return true;
}
export const caravanBack = () => !!(state.oasis && state.oasis.caravan && state.oasis.caravan.out && now() >= state.oasis.caravan.out.back);
export function caravanClaim(at) {
    const c = ensureCaravan();
    if (!c.out || now() < c.out.back) return false;
    const { value, camels } = c.out;
    earn(value, at);
    let spice = 0;
    if (Math.random() < CARAVAN.spice.chance) {
        spice = CARAVAN.spice.min + Math.floor(Math.random() * (CARAVAN.spice.max - CARAVAN.spice.min + 1));
        state.inventory[CARAVAN.spice.id] = (state.inventory[CARAVAN.spice.id] || 0) + spice;
    }
    state.animals.forEach(a => camels.includes(a.uid) && delete a.trip);
    c.out = null;
    c.trips++;
    state.stats.caravans = (state.stats.caravans || 0) + 1;
    addXp(200 + 20 * Math.min(60, state.level), at);
    sfx('level');
    toast(`La caravane est rentrée : ${fmt(value)} pièces${spice ? ` et ${spice} pistils de safran du souk` : ''}`, ['ui', 'oaCaravane']);
    changed('oasis');
    return { value, spice };
}

// ================= 1.49 : la tempête de sable =================
// tous les 30 à 60 heures, quelques cases au soleil s'ensablent : la plante attend qu'on la dégage d'un appui
export function sandstormTick() {
    if (!state.oasis || !oasisOpen() || state.level < PEN_LVL) return false;
    const O = state.oasis,
        t = now();
    if (!O.stormAt) O.stormAt = t + STORM.every[0] + Math.random() * (STORM.every[1] - STORM.every[0]);
    if (t < O.stormAt) return false;
    O.stormAt = t + STORM.every[0] + Math.random() * (STORM.every[1] - STORM.every[0]);
    const sunny = O.plots.map((p, k) => k).filter(k => O.plots[k].open && !isShaded(k) && !O.plots[k].sand && (O.plots[k].id || slotsOf('oasis')[k].tree));
    const n = Math.min(sunny.length, STORM.cells[0] + Math.floor(Math.random() * (STORM.cells[1] - STORM.cells[0] + 1)));
    for (let j = 0; j < n; j++) {
        const k = sunny.splice(Math.floor(Math.random() * sunny.length), 1)[0];
        O.plots[k].sand = true;
    }
    // une caravane en route prend une heure de retard
    if (O.caravan && O.caravan.out) O.caravan.out.back += CARAVAN.stormDelay;
    state.stats.storms = (state.stats.storms || 0) + 1;
    if (n) {
        toast(`Tempête de sable sur l’oasis : ${n} case${s(n)} ensablée${s(n)}, à dégager`, ['ui', 'oaTempete']);
        tip('sandstorm');
    }
    changed('oasis');
    return true;
}
export function clearSand(k, at) {
    const p = oasisPlots()[k];
    if (!p || !p.sand) return false;
    p.sand = false;
    sfx('pop');
    burst(at, 'dirt', 8, -4);
    state.stats.sandCleared = (state.stats.sandCleared || 0) + 1;
    changed('oasis');
    return true;
}
const PEN_LVL = 61;
