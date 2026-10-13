// Le verger : des arbres qui grandissent, laissent tomber leurs fruits, vieillissent puis meurent en donnant du bois.
// Un emplacement : { open, tree } ; un arbre : { id, age, drops, ground, prog, gq } où
//   age    = secondes de croissance (adulte quand age atteint le temps de culture),
//   drops  = fruits déjà tombés dans sa vie (vieux puis mort selon ORCHARD.life),
//   ground = fruits au pied de l'arbre, prog = avancée vers le fruit suivant, gq = fruits dorés au sol.
import { state, lvOk } from '../core/state.js';
import { fmt, s } from '../core/format.js';
import { emit, toast, sfx, buzz, burst, float, fly, squish, changed } from '../core/bus.js';
import { ITEMS } from '../data/items.js';
import { ORCHARD, treeWood } from '../data/farm.js';
import { ISLAND } from '../data/island.js';
import { BALANCE } from '../data/progress.js';
import { speedMult, addXp, spend, rank, rollYield } from './player.js';
import { cropRate, season, weather } from './world.js';
import { masterySpeed, addMastery } from './mastery.js';
import { barnBlocked, rollRare } from './barn.js';
import { storyOk } from './story.js';
import { collect, record } from './book.js';
import { addQuality } from './farm.js';
import { eventProgress } from './events.js';
import { tip } from './tips.js';

const COIN = ['ui', 'coin'];

// deux vergers : celui de la ferme ('farm') et celui de l'île ('island')
export const slotsOf = (z = 'farm') => (z === 'island' ? (state.island && state.island.orchard) || [] : state.orchard.slots);
export const isIslandTree = id => !!ITEMS[id].island;
export const treeList = (z = 'farm') => Object.values(ITEMS).filter(i => i.type === 'tree' && !!i.island === (z === 'island'));
export const orchardOpen = () => state.level >= ORCHARD.lvl || state.orchard.slots.some(x => x.open);
export const openSlots = z => slotsOf(z).filter(x => x.open).length;
export const slotCost = (z = 'farm') =>
    z === 'island'
        ? Math.floor(ISLAND.slotCost * Math.pow(ISLAND.slotMult, Math.max(0, openSlots(z) - ISLAND.slotsBase)))
        : Math.floor(ORCHARD.cost * Math.pow(ORCHARD.mult, Math.max(0, openSlots(z) - ORCHARD.base)));
export const treeUnlocked = d => (lvOk(d) && storyOk(d)) || state.seeds[d.id] > 0;

// l'état d'un arbre : 'young', 'adult', 'old' ou 'dead'
export function treeStage(t) {
    const d = ITEMS[t.id];
    if (t.drops >= ORCHARD.life) return 'dead';
    if (t.age < d.time) return 'young';
    return t.drops >= ORCHARD.life * ORCHARD.oldAt ? 'old' : 'adult';
}
export const treeLife = t => Math.max(0, 1 - t.drops / ORCHARD.life);

// vitesse : saison (l'arbre dort à moitié en hiver), météo, compétences, thème, maîtrise, vieillesse
// sur l'île, pas d'hiver : toujours la même douceur (seule la météo du jour joue un peu)
export const treeRate = t =>
    (isIslandTree(t.id) ? ISLAND.rate * (1 + rank('green') * 0.05) * Math.max(0.9, weather().crop) : cropRate(t.id)) *
    masterySpeed(t.id) *
    (treeStage(t) === 'old' ? ORCHARD.oldRate : 1);
export const fruitTime = t => (ITEMS[t.id].time * ORCHARD.fruitRate) / speedMult();
export const treeGrowPct = t => Math.min(1, t.age / ITEMS[t.id].time);
export const treeFruitPct = t => Math.min(1, t.prog / fruitTime(t));
// secondes réelles avant le prochain événement (adulte, ou fruit suivant)
export function treeLeft(t) {
    const st = treeStage(t),
        r = treeRate(t) || 1;
    if (st === 'young') return Math.max(0, (ITEMS[t.id].time - t.age) / (r * speedMult()));
    if (st === 'dead') return 0;
    return Math.max(0, (fruitTime(t) - t.prog) / r);
}
// sol plein : l'arbre attend qu'on ramasse, et ses fruits pourrissent peu à peu
export const groundFull = t => t.ground >= ORCHARD.groundMax;

export function newOrchard() {
    return { slots: Array.from({ length: ORCHARD.max }, () => ({ open: false, tree: null })), rotten: 0 };
}

// Ouvre le verger, et y déménage les arbres plantés dans le champ (anciennes sauvegardes)
export function ensureOrchard() {
    if (!state.orchard || !Array.isArray(state.orchard.slots)) state.orchard = newOrchard();
    const o = state.orchard;
    while (o.slots.length < ORCHARD.max) o.slots.push({ open: false, tree: null });
    const moved = [];
    state.grid.forEach(p => {
        if (!p.itemId || !ITEMS[p.itemId] || ITEMS[p.itemId].type !== 'tree') return;
        moved.push({ id: p.itemId, age: ITEMS[p.itemId].time, drops: 0, ground: p.isReady ? 1 : 0, prog: 0, gq: 0 });
        p.itemId = null;
        p.isReady = false;
        p.isWatered = false;
        p.growProgress = 0;
        p.fert = false;
        p.terrain = 'plowed';
    });
    (state.greenhouse.plots || []).forEach(p => {
        if (p.itemId && ITEMS[p.itemId] && ITEMS[p.itemId].type === 'tree') p.itemId = null;
    });
    if (state.level >= ORCHARD.lvl) for (let k = 0; k < ORCHARD.base; k++) o.slots[k].open = true;
    for (const t of moved) {
        const slot = o.slots.find(x => x.open && !x.tree) || o.slots.find(x => !x.open);
        if (!slot) break;
        slot.open = true;
        slot.tree = t;
    }
    return moved.length;
}

// ---------------- gestes ----------------
export function buySlot(at, z = 'farm') {
    const slot = slotsOf(z).find(x => !x.open);
    if (!slot) return false;
    const cost = slotCost(z);
    if (state.money < cost) {
        toast(`Il faut ${fmt(cost)} pièces pour un nouvel emplacement`, COIN);
        sfx('error');
        return false;
    }
    spend(cost);
    slot.open = true;
    sfx('buy');
    buzz(15);
    burst(at, 'sparkle', 10);
    float(at, [`-${fmt(cost)}`, COIN], 'bad', -14);
    changed('orchard');
    return true;
}

// planter un arbre : un plant du stock, sinon acheté sur place
export function plantTree(k, id, at, z = 'farm') {
    const slot = slotsOf(z)[k],
        d = ITEMS[id];
    if (!slot || !slot.open || slot.tree || !d || d.type !== 'tree') return false;
    if (!!d.island !== (z === 'island')) {
        toast(d.island ? `Le ${d.seedName.toLowerCase()} ne pousse que sur l’île` : 'Cet arbre préfère le verger de la ferme', ['item', id]);
        sfx('error');
        return false;
    }
    if (!treeUnlocked(d)) {
        toast(`${d.seedName} : débloqué au niveau ${d.reqLvl}`, ['ui', 'lock']);
        sfx('error');
        return false;
    }
    if (state.seeds[id] > 0) state.seeds[id]--;
    else if (state.money >= d.cost) {
        spend(d.cost);
        float(at, [`-${fmt(d.cost)}`, COIN], 'bad', -14);
    } else {
        toast(`Il faut ${fmt(d.cost)} pièces pour un ${d.seedName.toLowerCase()}`, COIN);
        sfx('error');
        return false;
    }
    slot.tree = { id, age: 0, drops: 0, ground: 0, prog: 0, gq: 0 };
    sfx('plant');
    burst(at, 'dirt', 8, 6);
    burst(at, 'leaf', 5);
    buzz(8);
    tip('orchard');
    changed('orchard');
    return true;
}

// qualité d'un fruit tombé : saison, compétences, rubans
function rollTreeQuality(id) {
    let x = 0.08 + 0.15;
    if (state.weather === 'sun' || state.weather === 'rain') x += 0.05;
    x += rank('expert') * 0.05;
    x += Math.min(0.1, state.prestige.rubans * 0.01);
    if (season().id === 'hiver' && !ITEMS[id].island) x -= 0.1;
    const r = Math.random();
    return r < x * 0.35 ? 2 : r < x ? 1 : 0;
}

// ramasser les fruits au pied d'un arbre ; renvoie { id, qty } ou null
export function pickTree(k, at, quiet, z = 'farm') {
    const slot = slotsOf(z)[k],
        t = slot && slot.tree;
    if (!t || !t.ground) return null;
    if (barnBlocked()) return null;
    const d = ITEMS[t.id];
    const qty = t.ground;
    state.inventory[t.id] += qty;
    state.stats.harvested += qty;
    state.stats[z === 'island' ? 'islandHarvest' : 'orchardFruits'] = (state.stats[z === 'island' ? 'islandHarvest' : 'orchardFruits'] || 0) + qty;
    addMastery(t.id, qty);
    let gold = 0,
        silver = 0;
    for (let j = 0; j < qty; j++) {
        const q = rollTreeQuality(t.id);
        if (q === 2) gold++;
        else if (q === 1) silver++;
    }
    if (silver) addQuality(t.id, 1, silver);
    if (gold) {
        addQuality(t.id, 2, gold);
        state.stats.goldQ += gold;
        collect('g_' + t.id);
    }
    eventProgress('harvest', t.id, qty);
    t.ground = 0;
    t.gq = 0;
    rollRare(BALANCE.rareDrop, at);
    if (!quiet) {
        sfx('harvest');
        buzz(12);
        burst(at, 'sparkle', 7, -6);
        burst(at, 'leaf', 5);
        float(at, [`+${qty}`, ['item', t.id], ['q', gold ? 2 : silver ? 1 : 0]], gold ? 'gold' : '', -18);
        fly(at, t.id, Math.min(qty, 3));
        addXp(d.xp * qty, at);
    }
    changed('orchard');
    return { id: t.id, qty, xp: d.xp * qty };
}

export function pickAllTrees(at, z = 'farm') {
    const totals = {};
    let xp = 0,
        n = 0;
    slotsOf(z).forEach((slot, k) => {
        if (!slot.tree || !slot.tree.ground) return;
        const r = pickTree(k, at, true, z);
        if (!r) return;
        totals[r.id] = (totals[r.id] || 0) + r.qty;
        xp += r.xp;
        emit('treeFx', { k, z, item: r.id, delay: n * 60 });
        n++;
    });
    if (!n) {
        if (!barnBlocked(true)) toast('Aucun fruit à ramasser');
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

// un arbre mort se débite en bois ; un arbre vivant peut être abattu (moins de bois, fruits ramassés d'abord)
export function fellTree(k, at, z = 'farm') {
    const slot = slotsOf(z)[k],
        t = slot && slot.tree;
    if (!t) return false;
    if (t.ground && !pickTree(k, at, true, z)) return false;
    const d = ITEMS[t.id];
    const dead = treeStage(t) === 'dead';
    const wood = dead ? treeWood(d) : treeStage(t) === 'young' ? 0 : Math.round(treeWood(d) * ORCHARD.felledWood * treeLife(t));
    if (wood) state.inventory.wood += wood;
    slot.tree = null;
    state.stats.felled = (state.stats.felled || 0) + 1;
    sfx('chop');
    buzz(20);
    burst(at, 'leaf', 10);
    burst(at, 'dirt', 6);
    if (wood) {
        float(at, [`+${wood}`, ['item', 'wood']], '', -22);
        fly(at, 'wood', Math.min(3, wood));
    }
    toast(dead ? `Le vieux ${d.seedName.toLowerCase()} donne ${wood} bois. La place est libre.` : `${d.seedName} abattu${wood ? ` : ${wood} bois` : ''}`, [
        'item',
        'wood',
    ]);
    changed('orchard');
    return true;
}

// ---------------- le temps qui passe ----------------
// avance un arbre de dt secondes ; renvoie le nombre de fruits tombés (et de fruits pourris)
export function advanceTree(t, dt) {
    let fell = 0,
        rot = 0;
    const d = ITEMS[t.id],
        sm = speedMult();
    // croissance du jeune plant
    if (t.age < d.time) {
        const need = (d.time - t.age) / (treeRate(t) * sm || 1);
        if (dt < need) {
            t.age += dt * treeRate(t) * sm;
            return { fell, rot };
        }
        dt -= need;
        t.age = d.time;
    }
    // fruits ; quand le sol est plein l'arbre attend, et de temps en temps un fruit au sol pourrit
    let guard = 0;
    while (dt > 0 && t.drops < ORCHARD.life && guard++ < 500) {
        const r = treeRate(t) || 0.0001;
        if (groundFull(t)) {
            const need = (fruitTime(t) * ORCHARD.rotEvery - (t.rot || 0)) / r;
            if (dt < need) {
                t.rot = (t.rot || 0) + dt * r;
                break;
            }
            dt -= need;
            t.rot = 0;
            t.ground--;
            rot++;
            state.orchard.rotten = (state.orchard.rotten || 0) + 1;
            if (Math.random() < 0.5) state.inventory.fertilizer = (state.inventory.fertilizer || 0) + 1;
            continue;
        }
        const need = (fruitTime(t) - t.prog) / r;
        if (dt < need) {
            t.prog += dt * r;
            break;
        }
        dt -= need;
        t.prog = 0;
        t.drops++;
        t.ground = Math.min(ORCHARD.groundMax, t.ground + rollYield('crop'));
        fell++;
    }
    return { fell, rot };
}

const allSlots = () => [...state.orchard.slots, ...slotsOf('island')];

export function orchardTick() {
    let ch = false;
    for (const slot of allSlots()) {
        const t = slot.tree;
        if (!t) continue;
        const before = treeStage(t);
        const r = advanceTree(t, 1);
        const after = treeStage(t);
        if (r.fell || r.rot || before !== after) ch = true;
        if (r.fell) emit('ripe', 'orchard');
        if (before !== 'dead' && after === 'dead')
            toast(`Un ${ITEMS[t.id].seedName.toLowerCase()} est mort de vieillesse : débitez-le en bois ${ITEMS[t.id].island ? 'sur l’île' : 'au verger'}`, [
                'item',
                'wood',
            ]);
    }
    return ch;
}

export function orchardOffline(elapsed) {
    let fell = 0,
        dead = 0;
    for (const slot of allSlots()) {
        if (!slot.tree) continue;
        const was = treeStage(slot.tree);
        fell += advanceTree(slot.tree, elapsed).fell;
        if (was !== 'dead' && treeStage(slot.tree) === 'dead') dead++;
    }
    return { fell, dead };
}

// ---------------- résumés ----------------
export const fruitsOnGround = z => slotsOf(z).reduce((a, x) => a + (x.tree ? x.tree.ground : 0), 0);
export const deadTrees = z => slotsOf(z).filter(x => x.tree && treeStage(x.tree) === 'dead').length;
export const livingTrees = id => allSlots().filter(x => x.tree && x.tree.id === id && treeStage(x.tree) !== 'dead').length;
export const treeCountText = z => {
    const n = slotsOf(z).filter(x => x.tree).length;
    return `${n} arbre${s(n)} · ${openSlots(z)} place${s(openSlots(z))}`;
};
