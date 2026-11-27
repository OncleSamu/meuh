// 1.172 : La Mine souterraine — 40 étages, 4 strates, grille 5×5 à creuser, escaliers, coffres, géodes,
// dynamite, boussole de veine, lanterne à recharge hors-ligne et ascenseur par paliers de 5 étages.
import { state, skill } from '../core/state.js';
import { now } from '../core/clock.js';
import { fmt, dateKey } from '../core/format.js';
import { emit, toast, sfx, buzz, burst, float, changed } from '../core/bus.js';
import { ITEMS } from '../data/items.js';
import { MINE_DEEP, MINE_STRATA, stratumOf, GEODES, MINE_UPS } from '../data/mine.js';
import { ensureNat, natGot, toolLvl } from './nature.js';
import { hasCost, payCost } from './home.js';
import { addXp, earn } from './player.js';
import { collect } from './book.js';
import { museumBonus, museumAddSpecimen, rollMuseumSpecimen } from './museum.js';
import { tip } from './tips.js';

export const mineDeepOpen = () => state.level >= MINE_DEEP.lvl;
export const mineUp = id => !!(state.mineDeep && state.mineDeep.ups && state.mineDeep.ups[id]);
export const mineMaxEnergy = () => MINE_DEEP.energyBase + (mineUp('lanternTank') ? 15 : 0) + (mineUp('headlamp') ? 15 : 0);
export const mineRegenSec = () => {
    const base = mineUp('winch') ? MINE_DEEP.energyRegenSec * 0.7 : MINE_DEEP.energyRegenSec;
    return Math.max(15, Math.round(base * (1 - 0.1 * skill('lanternEco'))));
};

export function mineStratumOpen(stratum) {
    const sDef = typeof stratum === 'object' ? stratum : MINE_STRATA.find(x => x.id === stratum) || stratumOf(stratum);
    const n = ensureNat();
    if (state.level < sDef.lvl) return false;
    if ((sDef.needs || []).some(k => !n.gear[k])) return false;
    if (sDef.minPick && toolLvl('mine') < sDef.minPick) return false;
    return true;
}

export function mineStratumLockText(sDef) {
    const n = ensureNat();
    if (state.level < sDef.lvl) return `Niveau ${sDef.lvl} requis`;
    if ((sDef.needs || []).some(k => !n.gear[k])) return 'Lampe et wagonnet requis (Carrière)';
    if (sDef.minPick && toolLvl('mine') < sDef.minPick) return `Pioche niveau ${sDef.minPick + 1} requise (tête de fer)`;
    return '';
}

export function ensureMineDeep() {
    if (!state.mineDeep || typeof state.mineDeep !== 'object') {
        state.mineDeep = {
            floor: 1,
            maxFloor: 1,
            energy: MINE_DEEP.energyBase,
            energyAt: now(),
            snackDay: '',
            snackN: 0,
            grid: null,
            sonarUsed: false,
            geodes: {},
            ups: {},
        };
    }
    const D = state.mineDeep;
    D.floor = Math.max(1, Math.min(MINE_DEEP.maxFloor, D.floor || 1));
    D.maxFloor = Math.max(D.floor, Math.min(MINE_DEEP.maxFloor, D.maxFloor || 1));
    D.ups = D.ups || {};
    D.geodes = D.geodes || {};
    if (typeof D.energy !== 'number' || Number.isNaN(D.energy)) D.energy = mineMaxEnergy();
    if (!D.energyAt) D.energyAt = now();
    if (!Array.isArray(D.grid) || D.grid.length !== MINE_DEEP.cells) D.grid = mineGenerateFloor(D.floor);
    return D;
}

// Recharge automatique de la lanterne (temps réel + hors-ligne)
export function mineSyncEnergy() {
    const D = ensureMineDeep();
    const max = mineMaxEnergy();
    const t = now();
    if (D.energy >= max) {
        D.energy = max;
        D.energyAt = t;
        return D.energy;
    }
    const stepMs = mineRegenSec() * 1000;
    const elapsed = Math.max(0, t - (D.energyAt || t));
    const gain = Math.floor(elapsed / stepMs);
    if (gain > 0) {
        D.energy = Math.min(max, D.energy + gain);
        D.energyAt = D.energy >= max ? t : D.energyAt + gain * stepMs;
    }
    return D.energy;
}

export const mineEnergy = () => mineSyncEnergy();
export const mineNextEnergyMs = () => {
    const D = ensureMineDeep();
    if (mineSyncEnergy() >= mineMaxEnergy()) return 0;
    return Math.max(0, (D.energyAt || now()) + mineRegenSec() * 1000 - now());
};

export function mineTick() {
    if (!state.mineDeep || !mineDeepOpen()) return false;
    const before = state.mineDeep.energy;
    mineSyncEnergy();
    return state.mineDeep.energy !== before;
}

export function mineAddGeode(id, qty = 1, at = null, quiet = false) {
    if (!GEODES[id] || qty <= 0) return false;
    const D = ensureMineDeep();
    D.geodes[id] = (D.geodes[id] || 0) + qty;
    state.stats.geodesFound = (state.stats.geodesFound || 0) + qty;
    if (!quiet) {
        if (at) float(at, [`+${qty}`, ['ui', id]], 'gold', -44);
        tip('geode');
    }
    changed('mine');
    return true;
}

const pickW = list => {
    const tot = list.reduce((a, [, w]) => a + w, 0);
    let r = Math.random() * tot;
    for (const [id, w] of list) if ((r -= w) <= 0) return id;
    return list[0][0];
};

// Génère une grille 5×5 souterraine pour l'étage donné
export function mineGenerateFloor(floor) {
    const sDef = stratumOf(floor);
    const sIdx = MINE_STRATA.indexOf(sDef);
    const pickBonus = Math.min(2, Math.floor(toolLvl('mine') / 2));
    const hardHp = Math.max(1, 2 + (sIdx >= 2 ? 1 : 0) - pickBonus);
    const cells = Array.from({ length: MINE_DEEP.cells }, () => ({
        kind: 'rock',
        ore: null,
        hp: 1,
        maxHp: 1,
        cleared: false,
        stairs: false,
        hinted: false,
    }));

    // Tirage sans remise d'indices
    const idx = Array.from({ length: MINE_DEEP.cells }, (_, i) => i);
    const take = () => idx.splice(Math.floor(Math.random() * idx.length), 1)[0];

    // 1. Escalier caché sous un rocher (sauf si dernier étage 40 : escalier ramène ou réexplore)
    const stairIdx = take();
    cells[stairIdx].stairs = true;
    cells[stairIdx].kind = 'rock';

    // 2. Coffre souterrain garanti tous les 5 étages (5, 10, 15, ..., 40) : 1 fois par jour via ascenseur
    let chestIdx = -1;
    const D = state.mineDeep;
    const chestUsedToday = !!(D && D.chestDay && D.chestDay.day === state.day && D.chestDay.floors && D.chestDay.floors[floor]);
    if (floor % MINE_DEEP.elevatorStep === 0 && !chestUsedToday) {
        chestIdx = take();
        cells[chestIdx].kind = 'chest';
        cells[chestIdx].hp = 1;
        cells[chestIdx].maxHp = 1;
    }

    // 3. Fossiles / reliques enfouis (1 à 2 par étage + compétence Œil d'archéologue)
    const relicCount = (sIdx >= 2 ? 2 : 1) + (Math.random() < 0.1 * skill('archEye') ? 1 : 0);
    const specialIndices = [];
    for (let i = 0; i < relicCount; i++) {
        const k = take();
        cells[k].kind = 'relic';
        cells[k].hp = hardHp;
        cells[k].maxHp = hardHp;
        specialIndices.push(k);
    }

    // 4. Gisements de géodes (1 à 2 par étage, bonus Treuil + Chasseur de géodes)
    const geodeCount = 1 + (Math.random() < 0.45 + (mineUp('winch') ? 0.25 : 0) + 0.12 * skill('geodeHunt') ? 1 : 0);
    for (let i = 0; i < geodeCount; i++) {
        const k = take();
        cells[k].kind = 'geode';
        cells[k].hp = hardHp;
        cells[k].maxHp = hardHp;
        specialIndices.push(k);
    }

    // 5. Veines cristallines (1 à 2 par étage)
    const veinCount = 1 + (sIdx >= 1 && Math.random() < 0.55 ? 1 : 0);
    for (let i = 0; i < veinCount; i++) {
        const k = take();
        cells[k].kind = 'vein';
        cells[k].hp = hardHp;
        cells[k].maxHp = hardHp;
    }

    // 6. Filons de minerai (4 à 5 par étage)
    const oreCount = 4 + (Math.random() < 0.5 ? 1 : 0);
    for (let i = 0; i < oreCount; i++) {
        const k = take();
        cells[k].kind = 'ore';
        cells[k].ore = pickW(sDef.ores);
        cells[k].hp = hardHp;
        cells[k].maxHp = hardHp;
    }

    // 7. Rochers durs sur une partie du reste
    for (const k of idx) {
        if (Math.random() < 0.35) {
            cells[k].kind = 'hard';
            cells[k].hp = hardHp;
            cells[k].maxHp = hardHp;
        }
    }

    // Lampe frontale : repère automatiquement une case spéciale de l'étage
    if (mineUp('headlamp')) {
        const target = chestIdx >= 0 ? chestIdx : specialIndices[0];
        if (target >= 0) cells[target].hinted = true;
    }

    return cells;
}

const giveInv = (id, q, at, cls = '', dy = -26, delay = 0) => {
    state.inventory[id] = (state.inventory[id] || 0) + q;
    natGot(id, q);
    if (ITEMS[id].type === 'gem') collect('t_' + id);
    if (ITEMS[id].type === 'ore') collect('m_' + id);
    if (at) emit('float', { at, parts: [`+${q}`, ['item', id]], cls, dy, delay });
};

function resolveCellLoot(cell, floor, at, quiet = false) {
    const sDef = stratumOf(floor);
    const sIdx = MINE_STRATA.indexOf(sDef);
    const tl = toolLvl('mine');
    const dropMult = 1 + museumBonus('mineDrop') + (mineUp('winch') ? 0.25 : 0);
    const natBonus = Math.random() < museumBonus('nature') ? 1 : 0;
    const loot = { items: {}, geodes: {}, specimens: [], coins: 0, xp: 6 + sIdx * 3 };

    state.stats.mined = (state.stats.mined || 0) + 1;
    if (floor >= 11) state.stats.deepMined = (state.stats.deepMined || 0) + 1;

    if (cell.kind === 'chest') {
        const coins = Math.round((1200 + floor * 260) * (1 + sIdx * 0.4));
        earn(coins, at);
        loot.coins = coins;
        const g = pickW(sDef.gems);
        giveInv(g, 2, at, 'gold', -42, 120);
        loot.items[g] = 2;
        const chestGeodes = 1 + (skill('archMaster') ? 1 : 0);
        mineAddGeode(sDef.geode, chestGeodes, at, true);
        loot.geodes[sDef.geode] = chestGeodes;
        const sp = rollMuseumSpecimen(sIdx, null, 0.85);
        museumAddSpecimen(sp, 1, at, quiet);
        loot.specimens.push(sp);
        loot.xp += 35;
        const D = ensureMineDeep();
        if (!D.chestDay || D.chestDay.day !== state.day) D.chestDay = { day: state.day, floors: {} };
        D.chestDay.floors[floor] = true;
        if (!quiet) {
            sfx('level');
            burst(at, 'sparkle', 14);
            toast(`Coffre de l’étage ${floor} : +${fmt(coins)} pièces, ${chestGeodes} géode${chestGeodes > 1 ? 's' : ''} et 1 spécimen !`, ['ui', 'mineChest']);
        }
    } else if (cell.kind === 'relic') {
        const sp = rollMuseumSpecimen(sIdx, null, 0.78);
        museumAddSpecimen(sp, 1, at, quiet);
        loot.specimens.push(sp);
        giveInv('stone', 2 + natBonus, at, '', -24, 0);
        loot.items.stone = 2 + natBonus;
        loot.xp += 18;
        if (!quiet) {
            sfx('golden');
            burst(at, 'sparkle', 10);
        }
    } else if (cell.kind === 'geode') {
        const qty = Math.random() < 0.15 * dropMult ? 2 : 1;
        mineAddGeode(sDef.geode, qty, at, quiet);
        loot.geodes[sDef.geode] = qty;
        giveInv('stone', 1 + natBonus, at, '', -22, 0);
        loot.items.stone = 1 + natBonus;
        loot.xp += 12;
        if (!quiet) {
            sfx('golden');
            burst(at, 'sparkle', 9);
        }
    } else if (cell.kind === 'vein') {
        const g = pickW(sDef.gems);
        const qty = 1 + (skill('prospector') ? 1 : 0) + (Math.random() < 0.2 * dropMult ? 1 : 0);
        giveInv(g, qty, at, 'gold', -36, 80);
        loot.items[g] = qty;
        state.stats.veins = (state.stats.veins || 0) + 1;
        loot.xp += 14;
        if (!quiet) {
            sfx('golden');
            burst(at, 'sparkle', 10);
        }
    } else if (cell.kind === 'ore') {
        const ore = cell.ore || pickW(sDef.ores);
        const qty = 2 + Math.floor(tl / 2) + natBonus + (Math.random() < 0.35 ? 1 : 0);
        giveInv(ore, qty, at);
        loot.items[ore] = qty;
        loot.xp += 6;
    } else {
        // rock / hard
        const qty = (cell.kind === 'hard' ? 3 : 2) + Math.floor(tl / 2) + natBonus;
        giveInv('stone', qty, at);
        loot.items.stone = qty;
        if (Math.random() < 0.28) {
            giveInv('coal', 1 + (sIdx >= 1 ? 1 : 0), at, '', -42, 100);
            loot.items.coal = 1 + (sIdx >= 1 ? 1 : 0);
        }
        // Petite chance de trouver une géode ou une gemme dans un rocher ordinaire
        if (Math.random() < 0.08 * dropMult) {
            mineAddGeode(sDef.geode, 1, at, quiet);
            loot.geodes[sDef.geode] = 1;
        }
    }
    addXp(loot.xp, at);
    return loot;
}

export function mineDig(k, at = null) {
    if (!mineDeepOpen()) return null;
    const D = ensureMineDeep();
    const cell = D.grid[k];
    if (!cell) return null;
    // Toucher un escalier déjà découvert descend à l'étage suivant !
    if (cell.cleared && cell.stairs) return mineUseStairs(at);
    if (cell.cleared) return null;

    if (mineSyncEnergy() < 1) {
        toast('Lanterne épuisée : attendez la recharge ou prenez un casse-croûte au charbon', ['ui', 'mineLantern']);
        sfx('error');
        return null;
    }
    if (D.energy >= mineMaxEnergy()) D.energyAt = now();
    D.energy--;
    cell.hp--;
    emit('swing', { at, tool: 'pickaxe' });
    burst(at, 'pebbles', 6);
    sfx('rock');
    buzz(10);
    tip('mineDeep');
    if (cell.hp > 0) {
        changed('mine');
        return { status: 'hit', hp: cell.hp };
    }
    cell.cleared = true;
    const loot = resolveCellLoot(cell, D.floor, at, false);
    if (cell.stairs) {
        sfx('level');
        toast(`Escalier trouvé vers l’étage ${Math.min(MINE_DEEP.maxFloor, D.floor + 1)} !`, ['ui', 'mineStairs']);
    }
    changed('mine');
    return { status: 'done', stairs: cell.stairs, loot };
}

export function mineUseStairs(at = null) {
    const D = ensureMineDeep();
    const stairCell = D.grid.find(c => c.stairs && c.cleared);
    if (!stairCell) return false;
    const nextFloor = D.floor >= MINE_DEEP.maxFloor ? MINE_DEEP.maxFloor : D.floor + 1;
    const nextStratum = stratumOf(nextFloor);
    if (!mineStratumOpen(nextStratum)) {
        toast(`${nextStratum.name} (étage ${nextFloor}) : ${mineStratumLockText(nextStratum)}`, ['ui', 'lock']);
        sfx('error');
        return false;
    }
    D.floor = nextFloor;
    const isNewMax = nextFloor > D.maxFloor;
    if (isNewMax) D.maxFloor = nextFloor;
    D.grid = mineGenerateFloor(D.floor);
    D.sonarUsed = false;
    sfx('level');
    buzz(14);
    burst(at, 'sparkle', 8);
    if (isNewMax && nextFloor % MINE_DEEP.elevatorStep === 0) {
        toast(`Palier d’ascenseur débloqué : étage ${nextFloor} ! Un coffre vous y attend`, ['ui', 'mineChest']);
    }
    changed('mine');
    return true;
}

export function mineElevators() {
    const D = ensureMineDeep();
    const floors = [1];
    for (let f = MINE_DEEP.elevatorStep; f <= D.maxFloor; f += MINE_DEEP.elevatorStep) {
        if (mineStratumOpen(stratumOf(f))) floors.push(f);
    }
    return floors;
}

export function mineGoFloor(floor, at = null) {
    const D = ensureMineDeep();
    const valid = mineElevators();
    if (!valid.includes(floor) || floor === D.floor) return false;
    D.floor = floor;
    D.grid = mineGenerateFloor(floor);
    D.sonarUsed = false;
    sfx('click');
    burst(at, 'sparkle', 6);
    changed('mine');
    return true;
}

export const mineBombCost = () => (mineUp('bombBelt') ? MINE_DEEP.bombCostUp : MINE_DEEP.bombCost);

// Dynamite : explose en croix (ou 3×3 avec bombBelt) sans consommer de lanterne !
export function mineBomb(centerK, at = null) {
    if (!mineDeepOpen()) return 0;
    const D = ensureMineDeep();
    const cost = mineBombCost();
    if (!hasCost(cost)) {
        toast('Il manque du charbon ou des pièces pour la dynamite', ['ui', 'mineBomb']);
        sfx('error');
        return 0;
    }
    const r0 = Math.floor(centerK / MINE_DEEP.cols),
        c0 = centerK % MINE_DEEP.cols;
    const full = mineUp('bombBelt');
    const targets = [];
    for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
            if (!full && Math.abs(dr) + Math.abs(dc) > 1) continue;
            const nr = r0 + dr,
                nc = c0 + dc;
            if (nr < 0 || nr >= MINE_DEEP.rows || nc < 0 || nc >= MINE_DEEP.cols) continue;
            const k = nr * MINE_DEEP.cols + nc;
            if (!D.grid[k].cleared) targets.push(k);
        }
    }
    if (!targets.length) return 0;
    payCost(cost);
    let foundStairs = false;
    for (const k of targets) {
        const cell = D.grid[k];
        cell.hp = 0;
        cell.cleared = true;
        resolveCellLoot(cell, D.floor, at, true);
        if (cell.stairs) foundStairs = true;
    }
    sfx('rock');
    buzz(22);
    burst(at, 'sparkle', 14);
    toast(`Boum ! ${targets.length} roches dégagées${foundStairs ? ' — escalier découvert !' : ''}`, ['ui', 'mineBomb']);
    changed('mine');
    return targets.length;
}

// Boussole de veine : révèle l'escalier et tous les gisements rares de l'étage
export function mineSonar(at = null) {
    if (!mineDeepOpen()) return false;
    const D = ensureMineDeep();
    if (D.sonarUsed) return false;
    if (!hasCost(MINE_DEEP.sonarCost)) {
        toast('Il manque du charbon ou des pièces pour la boussole', ['ui', 'mineSonar']);
        sfx('error');
        return false;
    }
    payCost(MINE_DEEP.sonarCost);
    D.sonarUsed = true;
    D.grid.forEach(c => {
        if (!c.cleared && (c.stairs || c.kind === 'geode' || c.kind === 'relic' || c.kind === 'chest' || c.kind === 'vein')) c.hinted = true;
    });
    sfx('golden');
    burst(at, 'sparkle', 10);
    toast('Boussole activée : escalier et gisements rares repérés !', ['ui', 'mineSonar']);
    changed('mine');
    return true;
}

// Casse-croûte du mineur (2×/jour, charbon -> recharge la lanterne au max)
const todayKey = () => dateKey(new Date(now()));
export function mineSnackLeft() {
    const D = ensureMineDeep();
    return D.snackDay === todayKey() ? Math.max(0, MINE_DEEP.snackPerDay - (D.snackN || 0)) : MINE_DEEP.snackPerDay;
}

export function mineSnack(at = null) {
    if (!mineDeepOpen() || !mineSnackLeft()) return false;
    const D = ensureMineDeep();
    if (mineSyncEnergy() >= mineMaxEnergy()) {
        toast('Votre lanterne est déjà pleine !', ['ui', 'mineLantern']);
        return false;
    }
    if ((state.inventory.coal || 0) < MINE_DEEP.snackCoal) {
        toast(`Il faut ${MINE_DEEP.snackCoal} charbons pour recharger la lanterne`, ['item', 'coal']);
        sfx('error');
        return false;
    }
    state.inventory.coal -= MINE_DEEP.snackCoal;
    if (D.snackDay !== todayKey()) {
        D.snackDay = todayKey();
        D.snackN = 0;
    }
    D.snackN++;
    D.energy = mineMaxEnergy();
    D.energyAt = now();
    sfx('level');
    burst(at, 'sparkle', 10);
    toast(`Lanterne rechargée (${D.energy}/${D.energy} coups) !`, ['ui', 'mineLantern']);
    changed('mine');
    return true;
}

export function mineBuyUpgrade(id, at = null) {
    const u = MINE_UPS.find(x => x.id === id);
    if (!u || !mineDeepOpen() || state.level < u.lvl || mineUp(id)) return false;
    if (!hasCost(u.cost)) {
        toast('Il manque des matériaux ou des pièces', ['ui', u.icon]);
        sfx('error');
        return false;
    }
    payCost(u.cost);
    const D = ensureMineDeep();
    D.ups[id] = now();
    if (id === 'lanternTank' || id === 'headlamp') D.energy = Math.min(mineMaxEnergy(), D.energy + 15);
    sfx('level');
    buzz(20);
    burst(at, 'sparkle', 12);
    toast(`${u.name} : installé !`, ['ui', u.icon]);
    changed('mine');
    return true;
}
