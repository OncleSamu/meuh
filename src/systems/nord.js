// Le Grand Nord (1.51) : une grille de cases où l'on plante cultures et arbres du Nord, et des poêles qui les réchauffent.
// Une case k : state.nord.plots[k] (culture : { open, id, prog, ready, last, v }), state.nord.orchard[k] (arbre : { open, tree })
// et state.nord.stoves[k] (poêle : { fuel } en heures de feu).
// Hors d'un poêle allumé, une plante pousse au ralenti (et pas du tout la nuit de gel) ; un poêle chauffe les cases autour de lui.
// Il brûle du bois (une bûche, une heure), mais seulement s'il y a quelque chose à réchauffer. Rien ne meurt : tout attend le feu.
import { state, lvOk } from '../core/state.js';
import { now } from '../core/clock.js';
import { fmt, s, dateKey } from '../core/format.js';
import { emit, toast, sfx, buzz, burst, float, fly, squish, changed } from '../core/bus.js';
import { ITEMS } from '../data/items.js';
import { NORD, BARN, SLED, WEATHER, NORD_IDS, NORD_PRODUCTS } from '../data/nord.js';
import { ANIMALS } from '../data/animals.js';
import { isAdult } from './animals.js';
import { inPasture, nordBarnOpen, nordBarnCap } from './pastures.js';
import { BALANCE } from '../data/progress.js';
import { speedMult, addXp, spend, rank, rollYield, earn } from './player.js';
import { sellPrice } from './market.js';
import { RECIPES_153 } from '../data/v153.js';
import { hour, weather } from './world.js';
import { masterySpeed, addMastery } from './mastery.js';
import { barnBlocked, rollRare } from './barn.js';
import { projectDone, storyOk } from './story.js';
import { collect, record } from './book.js';
import { addQuality, ascend } from './farm.js';
import { eventProgress } from './events.js';
import { tip } from './tips.js';
import { takeVarSeed, harvestVariety, varExtra, varGrowth, varCold } from './genetics.js';
import { slotsOf, plantTree, pickTree, treeStage, groundFull, advanceTree } from './orchard.js';
import { compSpeed, plotFx, compHarvest, NORD_BASE } from './companions.js';
import { hasCost, payCost } from './home.js';

const COIN = ['ui', 'coin'];
const FLAME = ['ui', 'noChaleur'];

// ---------------- ouverture et cases ----------------
export const nordOpen = () => projectDone(NORD.project);
export const nordLvlOk = () => state.level >= NORD.lvl;
export const chopOpen = () => projectDone('northWood');
export const nordCrops = () => Object.values(ITEMS).filter(i => i.type === 'crop' && i.nord);
export const nordCropOk = d => (lvOk(d) && storyOk(d)) || state.seeds[d.id] > 0;
export const nordPlots = () => (state.nord ? state.nord.plots : []);
const openCells = () => nordPlots().filter(p => p.open).length;
export const nordCellCost = () => Math.floor(NORD.cellCost * Math.pow(NORD.cellMult, Math.max(0, openCells() - NORD.cellsBase)));

export function ensureNord() {
    if (!state.nord || !Array.isArray(state.nord.plots)) state.nord = { plots: [], orchard: [], stoves: {}, ups: {}, chop: {} };
    if (!state.nord.sled) state.nord.sled = { load: {}, out: null, trips: 0 };
    const N = state.nord;
    if (!Array.isArray(N.orchard)) N.orchard = [];
    if (!N.stoves || typeof N.stoves !== 'object') N.stoves = {};
    N.ups = N.ups || {};
    N.chop = N.chop || {};
    while (N.plots.length < NORD.cells) N.plots.push({ open: false, id: null, prog: 0, ready: false, last: null });
    while (N.orchard.length < NORD.cells) N.orchard.push({ open: false, tree: null });
    if (nordOpen()) for (let k = 0; k < NORD.cellsBase; k++) N.plots[k].open = true;
    // une case ouverte l'est pour les cultures comme pour les arbres
    N.plots.forEach((p, k) => (N.orchard[k].open = !!p.open));
    for (const k of Object.keys(N.stoves)) if (!N.plots[+k] || !N.plots[+k].open) delete N.stoves[k];
    return N;
}

export function buyNordCell(at) {
    const p = nordPlots().find(x => !x.open);
    if (!p) return false;
    const cost = nordCellCost();
    if (state.money < cost) {
        toast(`Il faut ${fmt(cost)} pièces pour une nouvelle case au Grand Nord`, COIN);
        sfx('error');
        return false;
    }
    spend(cost);
    p.open = true;
    ensureNord();
    sfx('buy');
    buzz(15);
    burst(at, 'sparkle', 10);
    float(at, [`-${fmt(cost)}`, COIN], 'bad', -14);
    changed('nord');
    return true;
}

// ---------------- les cases voisines ----------------
export function nordNeighbors(k, r = 1) {
    const c = NORD.cols,
        row = Math.floor(k / c),
        col = k % c,
        out = [];
    for (let dr = -r; dr <= r; dr++)
        for (let dc = -r; dc <= r; dc++) {
            if (!dr && !dc) continue;
            const rr = row + dr,
                cc = col + dc;
            if (rr < 0 || cc < 0 || cc >= c || rr * c + cc >= NORD.cells) continue;
            out.push(rr * c + cc);
        }
    return out;
}

// ---------------- les poêles et le bois ----------------
export const nordUp = id => !!(state.nord && state.nord.ups[id]);
export const stoveAt = k => (state.nord && state.nord.stoves[k]) || null;
export const stoveKeys = () => Object.keys((state.nord && state.nord.stoves) || {}).map(Number);
export const stoveRadius = () => (nordUp('iron') ? 2 : NORD.stove.radius);
export const stoveCap = () => NORD.stove.fuelCap[nordUp('logbox') ? 1 : 0];
export const stoveBurn = () => (nordUp('insulation') ? NORD.insulation : 1);
export const stoveLit = k => !!(stoveAt(k) && stoveAt(k).fuel > 0);
export const stoveCost = () => NORD.stove.cost;
export const nordUpNext = () => NORD.ups.find(([id]) => !nordUp(id)) || null;
const cellFree = k => {
    const p = nordPlots()[k];
    return !!(p && p.open && !p.id && !(slotsOf('nord')[k] || {}).tree && !stoveAt(k));
};
export const canStove = k => cellFree(k);

export function buildStove(k, at) {
    if (!nordOpen() || !cellFree(k) || !hasCost(NORD.stove.cost)) return false;
    payCost(NORD.stove.cost);
    state.nord.stoves[k] = { fuel: 0 };
    sfx('level');
    buzz(15);
    burst(at, 'sparkle', 8);
    tip('nordStove');
    changed('nord');
    return true;
}
// reprend le poêle (le bois qu'il contient revient à la grange, pas le prix du poêle) : la case redevient libre
export function removeStove(k) {
    const st = stoveAt(k);
    if (!st) return false;
    state.inventory.wood = (state.inventory.wood || 0) + Math.floor(st.fuel / NORD.stove.woodHours);
    delete state.nord.stoves[k];
    changed('nord');
    return true;
}
// jette des bûches dans un poêle : une bûche = une heure de feu, jusqu'à la réserve du poêle
export function feedStove(k, at, quiet) {
    const st = stoveAt(k);
    if (!st) return 0;
    const room = stoveCap() - st.fuel;
    const logs = Math.min(state.inventory.wood || 0, Math.floor(room / NORD.stove.woodHours));
    if (logs <= 0) {
        if (!quiet) {
            toast(room < NORD.stove.woodHours ? 'Le poêle est plein' : 'Plus de bois : coupez-en à la forêt ou fendez des bûches', ['item', 'wood']);
            squish(at);
        }
        return 0;
    }
    state.inventory.wood -= logs;
    st.fuel += logs * NORD.stove.woodHours;
    if (!quiet) {
        sfx('plant');
        burst(at, 'sparkle', 6, -4);
        float(at, [`+${logs}`, ['item', 'wood']], '', -14);
    }
    changed('nord');
    return logs;
}
export function feedAllStoves(at) {
    let n = 0;
    for (const k of stoveKeys()) n += feedStove(k, at, true);
    if (n) {
        sfx('plant');
        toast(`${n} bûche${s(n)} dans les poêles`, ['item', 'wood']);
    } else toast(stoveKeys().length ? 'Rien à ajouter : poêles pleins, ou plus de bois' : 'Aucun poêle : posez-en un sur une case libre', ['item', 'wood']);
    return n;
}
export const nordFuel = () => stoveKeys().reduce((a, k) => a + stoveAt(k).fuel, 0);
export function upgradeNord(id, at) {
    const n = NORD.ups.find(u => u[0] === id);
    if (!nordOpen() || !n || nordUp(id) || !hasCost(n[3])) return false;
    payCost(n[3]);
    state.nord.ups[id] = now();
    sfx('level');
    buzz(20);
    burst(at, 'sparkle', 12);
    toast(`${n[1]} : ${n[2]}`, ['ui', 'noPoeleOn']);
    changed('nord');
    return true;
}

// ---------------- le froid ----------------
export const isFrost = (h = hour()) => h >= NORD.frost[0] || h < NORD.frost[1];
// une case est au chaud si un poêle allumé est assez proche
export const isWarm = k => nordNeighbors(k, stoveRadius()).some(j => stoveLit(j));
// ce que la case attend pour avancer : une culture qui pousse, un arbre qui n'a pas le sol plein
export function cellGrowing(k) {
    const p = nordPlots()[k];
    if (!p || !p.open || stoveAt(k)) return false;
    if (p.id && !p.ready) return true;
    const t = (slotsOf('nord')[k] || {}).tree;
    if (!t) return false;
    const st = treeStage(t);
    return st !== 'dead' && (st === 'young' || !groundFull(t));
}
// la vitesse de la case : 1 au chaud ; hors d'un poêle, un tiers de la vitesse le jour (selon le gène), rien la nuit de gel
export function cellMult(k, cold) {
    if (isWarm(k)) return 1;
    const p = nordPlots()[k];
    const t = (slotsOf('nord')[k] || {}).tree;
    const v = (p && p.id && !p.ready ? p.v : t && t.v) || null;
    if (cold === undefined && isFrost() && !auroraOn()) return 0;
    return Math.min(1, (cold === undefined ? NORD.cold : cold) * varCold(v));
}
export const isChilly = k => cellGrowing(k) && !isWarm(k);
export const nordChilly = () => nordPlots().filter((p, k) => p.open && isChilly(k)).length;

// ---------------- la pousse ----------------
export const nordGrow = id => ITEMS[id].time / speedMult();
export const nordRate = id => NORD.rate * (1 + rank('green') * 0.05) * Math.max(0.9, weather().crop) * masterySpeed(id);
const cropStep = (p, k) => nordRate(p.id) * (p.v ? varGrowth(p.v) : 1) * compSpeed(NORD_BASE + k);

// avance le Grand Nord de dt secondes ; cold : la vitesse hors poêle imposée (jeu fermé)
function step(dt, cold) {
    const N = state.nord;
    const lit = new Set(stoveKeys().filter(k => N.stoves[k].fuel > 0));
    const aur = auroraOn() ? WEATHER.aurora.mult : 1;
    const mults = N.plots.map((p, k) => (p.open && !p.snow && cellGrowing(k) ? cellMult(k, cold) * aur : 0));
    // un poêle ne brûle que s'il y a une case à réchauffer autour de lui
    // la nuit de gel, les premiers poêles allumés abritent aussi les bêtes frileuses de l'étable (3 par poêle)
    const sheltering = isFrost() ? new Set([...lit].sort((x, y) => x - y).slice(0, Math.ceil(coldBeasts().length / BARN.shelterPerStove))) : new Set();
    for (const k of lit) {
        const warms = sheltering.has(k) || nordNeighbors(k, stoveRadius()).some(j => cellGrowing(j));
        if (warms) N.stoves[k].fuel = Math.max(0, N.stoves[k].fuel - (dt / 3600) * stoveBurn() * (blizzardOn() ? WEATHER.blizzard.burn : 1));
    }
    let crops = 0,
        fruits = 0;
    N.plots.forEach((p, k) => {
        const m = mults[k];
        if (!m) return;
        if (p.id && !p.ready) {
            p.prog += dt * m * cropStep(p, k);
            if (p.prog >= nordGrow(p.id)) {
                p.prog = nordGrow(p.id);
                p.ready = true;
                crops++;
            }
            return;
        }
        const t = N.orchard[k].tree;
        if (t) fruits += advanceTree(t, dt * m).fell;
    });
    return { crops, fruits };
}

export function nordTick() {
    if (!state.nord || !nordOpen()) return false;
    const fuel = Math.floor(nordFuel() * 10);
    const w = nordWeatherTick();
    const r = step(1);
    if (r.crops || r.fruits) emit('ripe', 'nord');
    if (isFrost() && nordChilly()) tip('nordCold');
    return !!(w || r.crops || r.fruits || fuel !== Math.floor(nordFuel() * 10));
}

// jeu fermé : les poêles brûlent, les plantes avancent (la vitesse moyenne d'une journée hors poêle)
export function nordOffline(elapsed) {
    if (!state.nord || !nordOpen()) return { crops: 0, fruits: 0 };
    let left = Math.min(elapsed, NORD.offlineMax),
        crops = 0,
        fruits = 0;
    while (left > 0) {
        const dt = Math.min(120, left);
        left -= dt;
        const r = step(dt, NORD.offlineCold);
        crops += r.crops;
        fruits += r.fruits;
    }
    return { crops, fruits };
}

// ---------------- fendre le bois ----------------
const today = () => dateKey(new Date(now()));
export function chopLeft() {
    if (!state.nord) return 0;
    const c = state.nord.chop;
    return c.day === today() ? Math.max(0, NORD.chop.perDay - (c.n || 0)) : NORD.chop.perDay;
}
// une séance : swings coups, chacun de 0 à 1
export function chopDraw(scores, at) {
    if (!nordOpen() || !chopOpen() || !chopLeft()) return 0;
    const C = NORD.chop;
    const logs = Math.min(
        C.max,
        Math.round(
            scores
                .slice(0, C.swings)
                .map(x => Math.max(0, Math.min(1, +x || 0)))
                .reduce((a, x) => a + x * C.perSwing, 0),
        ),
    );
    const c = state.nord.chop;
    if (c.day !== today()) {
        c.day = today();
        c.n = 0;
    }
    c.n++;
    state.inventory.wood = (state.inventory.wood || 0) + logs;
    state.stats.chopped = (state.stats.chopped || 0) + logs;
    tip('chop');
    if (logs) {
        sfx('chop');
        burst(at, 'dirt', 8, -4);
        float(at, [`+${logs}`, ['item', 'wood']], '', -16);
    }
    changed('nord');
    return logs;
}

// ---------------- planter ----------------
export function plantNord(k, id, at, quiet) {
    const p = nordPlots()[k],
        d = ITEMS[id];
    if (!p || !p.open || p.id || stoveAt(k) || slotsOf('nord')[k].tree || !d || !d.nord || d.type !== 'crop') return false;
    if (!nordCropOk(d)) {
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
        tip('nord');
    }
    changed('nord');
    return true;
}
export function plantNordVar(k, vid, at) {
    const p = nordPlots()[k];
    const v = state.genetics && state.genetics.vars[vid];
    if (!p || !p.open || p.id || stoveAt(k) || slotsOf('nord')[k].tree || !v || !ITEMS[v.base].nord || ITEMS[v.base].type !== 'crop') return false;
    if (!takeVarSeed(vid)) {
        toast('Plus de graines de cette variété', ['ui', 'flowers']);
        return false;
    }
    Object.assign(p, { id: v.base, prog: 0, ready: false, last: v.base, v: vid });
    sfx('plant');
    burst(at, 'sparkle', 4, -4);
    changed('nord');
    return true;
}
// un arbre sur une case : le verger du Nord (orchard.js, zone 'nord')
export function plantNordTree(k, id, at) {
    const p = nordPlots()[k];
    if (!p || !p.open || p.id || stoveAt(k)) return false;
    if (!plantTree(k, id, at, 'nord')) return false;
    tip('nord');
    changed('nord');
    return true;
}

// ---------------- récolter ----------------
function rollNordQuality(k) {
    let x = 0.08 + 0.15 + 0.05;
    x += rank('expert') * 0.05;
    x += Math.min(0.1, state.prestige.rubans * 0.01);
    x += plotFx(NORD_BASE + k).quality;
    const r = Math.random();
    return r < x * 0.35 ? 2 : r < x ? 1 : 0;
}
export function harvestNord(k, at, quiet) {
    const p = nordPlots()[k];
    if (!p || !p.ready || p.snow) return null;
    if (barnBlocked()) return null;
    const d = ITEMS[p.id];
    const fx = plotFx(NORD_BASE + k);
    const qty = rollYield('crop') + (p.v ? varExtra(p.v) : 0) + (Math.random() < fx.extra ? 1 : 0);
    compHarvest(NORD_BASE + k);
    state.inventory[d.id] += qty;
    if (p.v) harvestVariety(p.v, qty);
    state.stats.harvested += qty;
    state.stats.nordHarvest = (state.stats.nordHarvest || 0) + qty;
    addMastery(d.id, qty);
    const q = ascend(d.id, rollNordQuality(k));
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
    changed('nord');
    return { id: d.id, qty, xp: d.xp };
}

// tout récolter : les cultures mûres et les fruits au pied des arbres
export function harvestAllNord(at) {
    const totals = {};
    let xp = 0,
        n = 0;
    const add = (r, k) => {
        totals[r.id] = (totals[r.id] || 0) + r.qty;
        xp += r.xp;
        emit('nordFx', { k, delay: n * 50 });
        n++;
    };
    nordPlots().forEach((p, k) => {
        if (!p.ready) return;
        const r = harvestNord(k, at, true);
        if (r) add(r, k);
    });
    slotsOf('nord').forEach((sl, k) => {
        if (!sl.tree || !sl.tree.ground) return;
        const r = pickTree(k, at, true, 'nord');
        if (r) add(r, k);
    });
    if (!n) {
        if (!barnBlocked(true)) toast('Rien à récolter au Grand Nord');
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
export const nordToPick = () => nordPlots().filter(p => p.ready).length + slotsOf('nord').filter(sl => sl.tree && sl.tree.ground).length;

export function replantNord(at) {
    let n = 0;
    nordPlots().forEach((p, k) => {
        if (p.open && !p.id && p.last && !slotsOf('nord')[k].tree && plantNord(k, p.last, at, true)) n++;
    });
    if (n) {
        sfx('plant');
        toast(`${n} case${s(n)} replantée${s(n)} au Grand Nord`, FLAME);
    } else {
        toast('Aucune case à replanter (graines ou pièces manquantes ?)');
        squish(at);
    }
    return n;
}
export const nordReady = () => nordPlots().filter(p => p.ready).length;

// ================= 1.52 : l'étable de rondins =================
export const nordBeasts = () => (nordBarnOpen() ? inPasture(BARN.key) : []);
// les bêtes adultes qui craignent le gel (pas le bœuf musqué)
const coldBeasts = () => nordBeasts().filter(a => isAdult(a) && ANIMALS[a.type].cold);
export const nordLitStoves = () => stoveKeys().filter(stoveLit).length;
export const nordShelterSlots = () => nordLitStoves() * BARN.shelterPerStove;
export function nordSheltered(a) {
    const i = coldBeasts().indexOf(a);
    return i >= 0 && i < nordShelterSlots();
}
// la vitesse d'une bête du Nord : la nuit de gel, hors d'un poêle, deux fois moins vite
export function nordBeastMult(a) {
    if (a && a.trip && ANIMALS[a.type] && ANIMALS[a.type].nord) return 0;
    if (!a || !ANIMALS[a.type] || !ANIMALS[a.type].nord || !ANIMALS[a.type].cold || !isAdult(a)) return 1;
    return isFrost() && !nordSheltered(a) ? BARN.coldMult : 1;
}
export function upNordBarn(at) {
    if (!nordBarnOpen() || state.nord.barnBig || !hasCost(BARN.upCost)) return false;
    payCost(BARN.upCost);
    state.nord.barnBig = true;
    sfx('level');
    burst(at, 'sparkle', 12);
    toast(`${BARN.name} s’agrandit : ${BARN.cap[1]} places`, ['ui', 'noPoeleOn']);
    changed('animals');
    return true;
}
export const nordBarnFree = () => nordBarnCap() - nordBeasts().length;

// ================= 1.52.1 : le traîneau =================
export const sledOpen = () => projectDone(SLED.project);
const ensureSled = () => (state.nord.sled ||= { load: {}, out: null, trips: 0 });
export const sledState = () => (state.nord ? ensureSled() : { load: {}, out: null, trips: 0 });
export const sledReindeer = () => nordBeasts().filter(a => a.type === 'reindeer' && isAdult(a) && !a.sick && !a.trip);
export const sledLoads = () => Object.values(sledState().load).reduce((a, n) => a + n, 0);
// les produits du Nord : plantes, produits des bêtes, cardamome
const NORD_GOODS = new Set([...NORD_IDS, ...NORD_PRODUCTS.map(p => p[0]), ...RECIPES_153.map(r => r[0]), SLED.spice.id]);
export const isNordGood = id => NORD_GOODS.has(id);
export const sledMult = id => (id && !isNordGood(id) ? SLED.otherMult : SLED.mult) * (1 + (projectDone(SLED.iceProject) ? SLED.iceBonus : 0));
export const sledValue = (load = sledState().load) =>
    Math.round(Object.entries(load).reduce((a, [id, n]) => a + n * SLED.perLoad * sellPrice(id) * sledMult(id), 0) / 10) * 10;
const sledFree = id => (state.inventory[id] || 0) - (sledState().load[id] || 0) * SLED.perLoad;
export const sledGoods = () =>
    Object.keys(state.inventory).filter(
        id => ITEMS[id] && !['material', 'rare', 'seed'].includes(ITEMS[id].type) && ITEMS[id].sell > 0 && sledFree(id) >= SLED.perLoad,
    );
export function sledAdd(id, n = 1) {
    const c = ensureSled();
    if (c.out || !sledOpen()) return false;
    let k = 0;
    while (k < n && sledLoads() < SLED.loads && sledFree(id) >= SLED.perLoad) {
        c.load[id] = (c.load[id] || 0) + 1;
        k++;
    }
    if (k) changed('nord');
    return k > 0;
}
export function sledRemove(id) {
    const c = ensureSled();
    if (c.out || !c.load[id]) return false;
    if (!--c.load[id]) delete c.load[id];
    changed('nord');
    return true;
}
export function sledSend(at) {
    const c = ensureSled();
    if (c.out || !sledOpen() || !sledLoads() || sledReindeer().length < SLED.reindeer) return false;
    for (const [id, n] of Object.entries(c.load)) if ((state.inventory[id] || 0) < n * SLED.perLoad) return false;
    for (const [id, n] of Object.entries(c.load)) state.inventory[id] -= n * SLED.perLoad;
    const team = sledReindeer()
        .slice(0, SLED.reindeer)
        .map(a => a.uid);
    team.forEach(uid => (state.animals.find(a => a.uid === uid).trip = true));
    c.out = { load: c.load, value: sledValue(), back: now() + SLED.time, team };
    c.load = {};
    sfx('buy');
    burst(at, 'sparkle', 10);
    toast('Le traîneau part pour la grande ville du Sud : retour dans 8 heures', ['ui', 'noTraineau']);
    tip('sled');
    changed('nord');
    return true;
}
export const sledBack = () => !!(state.nord && state.nord.sled && state.nord.sled.out && now() >= state.nord.sled.out.back);
export function sledClaim(at) {
    const c = ensureSled();
    if (!c.out || now() < c.out.back) return false;
    const { value, team } = c.out;
    earn(value, at);
    let spice = 0;
    if (Math.random() < SLED.spice.chance) {
        spice = SLED.spice.min + Math.floor(Math.random() * (SLED.spice.max - SLED.spice.min + 1));
        state.inventory[SLED.spice.id] = (state.inventory[SLED.spice.id] || 0) + spice;
    }
    state.animals.forEach(a => team.includes(a.uid) && delete a.trip);
    c.out = null;
    c.trips++;
    state.stats.sleds = (state.stats.sleds || 0) + 1;
    addXp(220 + 20 * Math.min(60, state.level), at);
    sfx('level');
    toast(`Le traîneau est rentré : ${fmt(value)} pièces${spice ? ` et ${spice} gousses de cardamome` : ''}`, ['ui', 'noTraineau']);
    changed('nord');
    return { value, spice };
}

// ================= 1.52.2 : le blizzard et l'aurore boréale =================
export const blizzardOn = () => !!(state.nord && state.nord.blizzard && state.nord.blizzard.until > now());
export const auroraOn = () => !!(state.nord && state.nord.aurora && state.nord.aurora.until > now());
export const snowedCells = () => nordPlots().filter(p => p.snow).length;
const span = ([a, b]) => a + Math.random() * (b - a);
// le blizzard : quelques cases au froid disparaissent sous la neige (un appui les dégage), les poêles brûlent deux fois plus, le traîneau est retardé
// l'aurore : la nuit de gel, pendant une heure, tout pousse une fois et demie plus vite, même hors d'un poêle
export function nordWeatherTick() {
    if (!state.nord || !nordOpen() || !nordBarnOpen()) return false;
    const N = state.nord,
        t = now();
    let changedAny = false;
    if (!N.stormAt) N.stormAt = t + span(WEATHER.blizzard.every);
    if (t >= N.stormAt) {
        N.stormAt = t + span(WEATHER.blizzard.every);
        const open = N.plots
            .map((p, k) => k)
            .filter(k => N.plots[k].open && !N.plots[k].snow && !isWarm(k) && !stoveAt(k) && (N.plots[k].id || slotsOf('nord')[k].tree));
        const n = Math.min(open.length, WEATHER.blizzard.cells[0] + Math.floor(Math.random() * (WEATHER.blizzard.cells[1] - WEATHER.blizzard.cells[0] + 1)));
        for (let j = 0; j < n; j++) N.plots[open.splice(Math.floor(Math.random() * open.length), 1)[0]].snow = true;
        N.blizzard = { until: t + WEATHER.blizzard.last };
        if (N.sled && N.sled.out) N.sled.out.back += SLED.blizzardDelay;
        state.stats.blizzards = (state.stats.blizzards || 0) + 1;
        toast(n ? `Blizzard sur le Grand Nord : ${n} case${s(n)} sous la neige, à dégager` : 'Blizzard sur le Grand Nord : les poêles brûlent deux fois plus', [
            'ui',
            'noBlizzard',
        ]);
        tip('blizzard');
        changedAny = true;
    }
    if (!N.auroraAt) N.auroraAt = t + span(WEATHER.aurora.every);
    if (t >= N.auroraAt && isFrost() && !auroraOn()) {
        N.auroraAt = t + span(WEATHER.aurora.every);
        N.aurora = { until: t + WEATHER.aurora.last };
        state.stats.auroras = (state.stats.auroras || 0) + 1;
        toast('Aurore boréale ! Pendant une heure, tout pousse plus vite', ['ui', 'noAurore']);
        tip('aurora');
        changedAny = true;
    }
    if (changedAny) changed('nord');
    return changedAny;
}
export function clearSnow(k, at) {
    const p = nordPlots()[k];
    if (!p || !p.snow) return false;
    p.snow = false;
    sfx('pop');
    burst(at, 'dirt', 8, -4);
    state.stats.snowCleared = (state.stats.snowCleared || 0) + 1;
    changed('nord');
    return true;
}
