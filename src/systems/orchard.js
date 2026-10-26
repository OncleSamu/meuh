// Le verger : des arbres qui grandissent, laissent tomber leurs fruits, vieillissent puis meurent en donnant du bois.
// Un emplacement : { open, tree } ; un arbre : { id, age, drops, ground, prog, gq } où
//   age    = secondes de croissance (adulte quand age atteint le temps de culture),
//   drops  = fruits déjà tombés dans sa vie (vieux puis mort selon ORCHARD.life),
//   ground = fruits au pied de l'arbre, prog = avancée vers le fruit suivant, gq = fruits dorés au sol.
import { state, lvOk } from '../core/state.js';
import { now } from '../core/clock.js';
import { fmt, s } from '../core/format.js';
import { emit, toast, sfx, buzz, burst, float, fly, squish, changed } from '../core/bus.js';
import { ITEMS } from '../data/items.js';
import { ORCHARD, treeWood } from '../data/farm.js';
import { ISLAND } from '../data/island.js';
import { DAYS_PER_SEASON } from '../data/world.js';
import { BALANCE } from '../data/progress.js';
import { speedMult, addXp, spend, rank, rollYield } from './player.js';
import { cropRate, season, weather, dayInSeason } from './world.js';
import { masterySpeed, addMastery } from './mastery.js';
import { barnBlocked, rollRare } from './barn.js';
import { storyOk } from './story.js';
import { preferSeed, harvestVariety } from './genetics.js';
import { collect, record } from './book.js';
import { addQuality, ascend } from './farm.js';
import { eventProgress } from './events.js';
import { tip } from './tips.js';
import { orchardLife, orchardRate, ladderBonus, basketBonus } from './buildings.js';
import { MATURE, GRAFTS, CARE, TREE_SEASON, SEASON_IN, SEASON_OUT, BLOOM, REMARK } from '../data/orchard.js';

const COIN = ['ui', 'coin'];

// trois vergers : celui de la ferme ('farm'), celui de l'île ('island') et les arbres de l'oasis ('oasis', 1.48)
export const slotsOf = (z = 'farm') =>
    z === 'island' ? (state.island && state.island.orchard) || [] : z === 'oasis' ? (state.oasis && state.oasis.orchard) || [] : state.orchard.slots;
// sous les tropiques et à l'oasis : pas d'hiver
export const isIslandTree = id => !!ITEMS[id].island;
export const treeZone = d => (d.oasis ? 'oasis' : d.island ? 'island' : 'farm');
export const ZONE_WHERE = { farm: 'au verger', island: 'sur l’île', oasis: 'à l’oasis' };
export const treeList = (z = 'farm') => Object.values(ITEMS).filter(i => i.type === 'tree' && treeZone(i) === z);
export const orchardOpen = () => state.level >= ORCHARD.lvl || state.orchard.slots.some(x => x.open);
export const openSlots = z => slotsOf(z).filter(x => x.open).length;
export const slotCost = (z = 'farm') =>
    z === 'island'
        ? Math.floor(ISLAND.slotCost * Math.pow(ISLAND.slotMult, Math.max(0, openSlots(z) - ISLAND.slotsBase)))
        : Math.floor(ORCHARD.cost * Math.pow(ORCHARD.mult, Math.max(0, openSlots(z) - ORCHARD.base)));
export const treeUnlocked = d => (lvOk(d) && storyOk(d)) || state.seeds[d.id] > 0;

// 1.12 : maturité, greffon et soins
export const matOf = t => (t.mat === undefined ? t.drops : t.mat);
export const maturity = t => Math.min(1, matOf(t) / MATURE.at);
export const matStars = t => {
    const m = maturity(t);
    return m < MATURE.stars[0] ? 1 : m < MATURE.stars[1] ? 2 : 3;
};
export const graftOf = t => (t.g && GRAFTS[t.g]) || null;
const isManured = t => !!t.mn && now() < t.mn;
const seasonIdx = () => Math.floor((state.day - 1) / DAYS_PER_SEASON);
export const isPruned = t => t.pr === seasonIdx();
// la vitesse gagnée par les soins, le greffon et l'échelle réunis (jamais plus de MATURE.cap)
export const careRate = t => {
    const g = graftOf(t);
    return Math.min(MATURE.cap, (g && g.rate ? g.rate : 1) * (isPruned(t) ? CARE.prune.rate : 1) * (isManured(t) ? CARE.manure.rate : 1));
};
const lifeOf = t => {
    const g = graftOf(t);
    if (g && g.eternal) return Infinity;
    return orchardLife(ORCHARD.life) * (g && g.life ? g.life : 1);
};
// 1.13 : la saison de l'espèce, la floraison et ses ruches
export const treeSeasonOf = id => TREE_SEASON[id] || null;
export const seasonMult = t => {
    const sid = treeSeasonOf(t.id);
    if (!sid || isIslandTree(t.id)) return 1;
    return season().id === sid ? SEASON_IN : SEASON_OUT;
};
export const bloomOn = () => state.level >= BLOOM.lvl && season().id === 'printemps' && dayInSeason() <= BLOOM.days;
export const hiveCount = () => state.grid.filter(p => p.deco === 'hive' && p.isUnlocked).length;
// la chance d'un fruit en plus donnée par les ruches : toute la saison du printemps, doublée pendant la floraison
export const pollination = () => {
    if (state.level < BLOOM.lvl || season().id !== 'printemps') return 0;
    return Math.min(BLOOM.cap, hiveCount() * BLOOM.perHive * (bloomOn() ? 2 : 1));
};
export const remOf = t => (t.rem && REMARK.kinds[t.rem]) || null;
export const groundMax = () => ORCHARD.groundMax + ladderBonus();
export const lifeMax = lifeOf;
// l'état d'un arbre : 'young', 'adult', 'old' ou 'dead'
export function treeStage(t) {
    const d = ITEMS[t.id];
    if (t.drops >= lifeOf(t)) return 'dead';
    if (t.age < d.time) return 'young';
    return t.drops >= lifeOf(t) * ORCHARD.oldAt ? 'old' : 'adult';
}
export const treeLife = t => (lifeOf(t) === Infinity ? 1 : Math.max(0, 1 - t.drops / lifeOf(t)));

// vitesse : saison (l'arbre dort à moitié en hiver), météo, compétences, thème, maîtrise, vieillesse
// sur l'île, pas d'hiver : toujours la même douceur (seule la météo du jour joue un peu)
export const treeRate = t =>
    (isIslandTree(t.id) ? ISLAND.rate * (1 + rank('green') * 0.05) * Math.max(0.9, weather().crop) : cropRate(t.id)) *
    masterySpeed(t.id) *
    careRate(t) *
    seasonMult(t) *
    (treeStage(t) === 'old' ? ORCHARD.oldRate : 1);
export const fruitTime = t => (ITEMS[t.id].time * ORCHARD.fruitRate * orchardRate() * (graftOf(t) && graftOf(t).slow ? graftOf(t).slow : 1)) / speedMult();
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
export const groundFull = t => t.ground >= groundMax();

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

// branchés par orchardplus.js (Hortense, cueilleur) sans import circulaire
const pickHooks = [];
let pickerEveryHook = () => 0,
    autoPickHook = () => 0;
export const onTreePick = fn => pickHooks.push(fn);
export const onOrchardPicker = (every, pick) => {
    pickerEveryHook = every;
    autoPickHook = pick;
};

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
    if (treeZone(d) !== z) {
        toast(treeZone(d) !== 'farm' ? `Le ${d.seedName.toLowerCase()} ne pousse que ${ZONE_WHERE[treeZone(d)]}` : 'Cet arbre préfère le verger de la ferme', [
            'item',
            id,
        ]);
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
    const vid = preferSeed(id);
    if (vid) {
        slot.tree.v = vid;
        toast('Un cépage de votre labo !', ['item', id]);
    }
    if (z === 'farm' && state.level >= REMARK.lvl && Math.random() < REMARK.chance) {
        slot.tree.rem = Math.random() < 0.5 ? 'gold' : 'twin';
        toast(`Un jeune plant étrange : ${REMARK.kinds[slot.tree.rem].name.toLowerCase()} !`, ['item', id]);
        state.stats.remarkable = (state.stats.remarkable || 0) + 1;
    }
    sfx('plant');
    burst(at, 'dirt', 8, 6);
    burst(at, 'leaf', 5);
    buzz(8);
    tip('orchard');
    changed('orchard');
    return true;
}

// qualité d'un fruit tombé : saison, compétences, rubans
function rollTreeQuality(id, t) {
    const g = t && graftOf(t);
    let x = 0.08 + 0.15 + (t ? MATURE.quality * maturity(t) : 0);
    if (state.weather === 'sun' || state.weather === 'rain') x += 0.05;
    x += rank('expert') * 0.05;
    x += Math.min(0.1, state.prestige.rubans * 0.01);
    if (season().id === 'hiver' && !ITEMS[id].island) x -= 0.1;
    const r = Math.random();
    if (g && g.gold && Math.random() < g.gold) return 2;
    if (t && remOf(t) && remOf(t).gold && Math.random() < remOf(t).gold) return 2;
    return r < x * 0.35 ? 2 : r < x ? 1 : 0;
}

// ramasser les fruits au pied d'un arbre ; renvoie { id, qty } ou null
export function pickTree(k, at, quiet, z = 'farm') {
    const slot = slotsOf(z)[k],
        t = slot && slot.tree;
    if (!t || !t.ground) return null;
    if (barnBlocked(quiet)) return null;
    const d = ITEMS[t.id];
    const qty = t.ground + basketBonus(t.ground);
    state.inventory[t.id] += qty;
    state.stats.harvested += qty;
    const sk = z === 'island' ? 'islandHarvest' : z === 'oasis' ? 'oasisHarvest' : 'orchardFruits';
    state.stats[sk] = (state.stats[sk] || 0) + qty;
    addMastery(t.id, qty);
    collect('o_' + t.id);
    const got = [0, 0, 0, 0, 0];
    for (let j = 0; j < qty; j++) got[ascend(t.id, rollTreeQuality(t.id, t))]++;
    const silver = got[1],
        gold = got[2] + got[3] + got[4];
    if (z === 'farm' && silver + gold) state.stats.orchardQual = (state.stats.orchardQual || 0) + silver + gold;
    for (let r = 1; r <= 4; r++) if (got[r]) addQuality(t.id, r, got[r]);
    if (gold) {
        state.stats.goldQ += gold;
        collect('g_' + t.id);
    }
    if (t.v) harvestVariety(t.v, qty);
    eventProgress('harvest', t.id, qty);
    pickHooks.forEach(fn => fn(t, qty, silver, gold));
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
// un arbre mûr (50 fruits donnés) laisse une bouture : son greffon et un tiers de sa maturité
export function leaveCutting(t) {
    if (matOf(t) < MATURE.cutMin) return false;
    const o = state.orchard;
    o.cuttings = o.cuttings || [];
    o.cuttings.push({ id: t.id, g: t.g || null, rem: t.rem || null, v: t.v || null, mat: Math.floor(matOf(t) * MATURE.cutKeep) });
    toast(`Une bouture de ${ITEMS[t.id].seedName.toLowerCase()} garde la lignée de l’arbre`, ['item', 'cutting']);
    return true;
}
// replanter une bouture sur une place libre
export function plantCutting(k, ci, at, z = 'farm') {
    const slot = slotsOf(z)[k],
        c = (state.orchard.cuttings || [])[ci];
    if (!slot || !slot.open || slot.tree || !c) return false;
    if (treeZone(ITEMS[c.id]) !== z) {
        toast(
            treeZone(ITEMS[c.id]) !== 'farm'
                ? `Cette bouture ne pousse que ${ZONE_WHERE[treeZone(ITEMS[c.id])]}`
                : 'Cette bouture préfère le verger de la ferme',
            ['item', 'cutting'],
        );
        return false;
    }
    state.orchard.cuttings.splice(ci, 1);
    slot.tree = { id: c.id, age: 0, drops: 0, ground: 0, prog: 0, gq: 0, mat: c.mat, g: c.g || null, rem: c.rem || null, v: c.v || null };
    sfx('plant');
    burst(at, 'dirt', 8, 6);
    burst(at, 'leaf', 5);
    changed('orchard');
    return true;
}

export function fellTree(k, at, z = 'farm', quiet = false) {
    const slot = slotsOf(z)[k],
        t = slot && slot.tree;
    if (!t) return false;
    if (t.ground && !pickTree(k, at, true, z)) return false;
    const d = ITEMS[t.id];
    const dead = treeStage(t) === 'dead';
    leaveCutting(t);
    const wood = dead ? treeWood(d) : treeStage(t) === 'young' ? 0 : Math.round(treeWood(d) * ORCHARD.felledWood * treeLife(t));
    if (wood) state.inventory.wood += wood;
    // 1.14 : un arbre adulte laisse aussi du bois fruitier, qui parfume le fumoir
    const fw = treeStage(t) === 'young' ? 0 : Math.max(1, Math.round(wood / 10));
    if (fw) state.inventory.fruitWood = (state.inventory.fruitWood || 0) + fw;
    slot.tree = null;
    state.stats.felled = (state.stats.felled || 0) + 1;
    if (quiet) {
        changed('orchard');
        return { wood, fw };
    }
    sfx('chop');
    buzz(20);
    burst(at, 'leaf', 10);
    burst(at, 'dirt', 6);
    if (wood) {
        float(at, [`+${wood}`, ['item', 'wood']], '', -22);
        fly(at, 'wood', Math.min(3, wood));
    }
    toast(
        dead
            ? `Le vieux ${d.seedName.toLowerCase()} donne ${wood} bois et ${fw} bois fruitier. La place est libre.`
            : `${d.seedName} abattu${wood ? ` : ${wood} bois` : ''}`,
        ['item', 'wood'],
    );
    changed('orchard');
    return true;
}

// 1.15.4 : débiter d'un coup tous les arbres morts d'un verger
export function fellDeadTrees(at, z = 'farm') {
    let n = 0,
        wood = 0,
        fw = 0;
    slotsOf(z).forEach((slot, k) => {
        if (!slot.tree || treeStage(slot.tree) !== 'dead') return;
        const r = fellTree(k, at, z, true);
        if (!r) return;
        n++;
        wood += r.wood;
        fw += r.fw;
    });
    if (!n) return 0;
    sfx('chop');
    buzz(20);
    burst(at, 'leaf', 10);
    float(at, [`+${wood}`, ['item', 'wood']], '', -22);
    toast(`${n} vieux arbre${n > 1 ? 's' : ''} débité${n > 1 ? 's' : ''} : ${wood} bois et ${fw} bois fruitier. Les places sont libres.`, ['item', 'wood']);
    return n;
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
    while (dt > 0 && t.drops < lifeOf(t) && guard++ < 500) {
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
        t.mat = matOf(t) + 1;
        const g = graftOf(t);
        t.ground = Math.min(
            groundMax(),
            t.ground +
                rollYield('crop') +
                ((g && g.double) || (remOf(t) && remOf(t).double) ? 1 : 0) +
                (Math.random() < MATURE.extra * maturity(t) + pollination() ? 1 : 0),
        );
        fell++;
    }
    return { fell, rot };
}

// les arbres de l'oasis avancent avec l'eau (oasis.js) : orchardTick ne s'en occupe pas
const tickSlots = () => [...state.orchard.slots, ...slotsOf('island')];
const allSlots = () => [...tickSlots(), ...slotsOf('oasis')];

export function orchardTick() {
    let ch = false;
    for (const slot of tickSlots()) {
        const t = slot.tree;
        if (!t) continue;
        const before = treeStage(t);
        const r = advanceTree(t, 1);
        const after = treeStage(t);
        if (r.fell || r.rot || before !== after) ch = true;
        if (r.fell) emit('ripe', 'orchard');
        if (before !== 'dead' && after === 'dead')
            toast(`Un ${ITEMS[t.id].seedName.toLowerCase()} est mort de vieillesse : débitez-le en bois ${ZONE_WHERE[treeZone(ITEMS[t.id])]}`, [
                'item',
                'wood',
            ]);
    }
    return ch;
}

export function orchardOffline(elapsed) {
    let fell = 0,
        dead = 0,
        picked = 0;
    // avec un cueilleur, le temps passe par tranches : il ramasse entre deux
    const every = pickerEveryHook() / 1000;
    let left = elapsed;
    while (left > 0) {
        const dt = every > 0 ? Math.min(every, left) : left;
        left -= dt;
        for (const slot of tickSlots()) {
            if (!slot.tree) continue;
            const was = treeStage(slot.tree);
            fell += advanceTree(slot.tree, dt).fell;
            if (was !== 'dead' && treeStage(slot.tree) === 'dead') dead++;
        }
        if (every > 0) picked += autoPickHook();
    }
    return { fell, dead, picked };
}

// ---------------- résumés ----------------
export const fruitsOnGround = z => slotsOf(z).reduce((a, x) => a + (x.tree ? x.tree.ground : 0), 0);
export const deadTrees = z => slotsOf(z).filter(x => x.tree && treeStage(x.tree) === 'dead').length;
export const livingTrees = id => allSlots().filter(x => x.tree && x.tree.id === id && treeStage(x.tree) !== 'dead').length;
export const treeCountText = z => {
    const n = slotsOf(z).filter(x => x.tree).length;
    return `${n} arbre${s(n)} · ${openSlots(z)} place${s(openSlots(z))}`;
};
