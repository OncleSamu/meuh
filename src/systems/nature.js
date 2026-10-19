// La nature : forêt et mine (la pêche est dans fishing.js).
import { state } from '../core/state.js';
import { now } from '../core/clock.js';
import { emit, toast, sfx, buzz, burst, float } from '../core/bus.js';
import { NATURE, TOOL_MAX, DEPTHS, MINE_GEAR, VEIN_HITS, SPECIES, FOREST_SLOTS, MINE_SLOTS, FORAGE, TOOL_HEADS } from '../data/nature.js';
import { ITEMS } from '../data/items.js';
import { season } from './world.js';
import { hasCost, payCost } from './home.js';
import { addXp, speedMult } from './player.js';
import { collect } from './book.js';

// l'état de la nature (1.11) : profondeur de la mine, équipement, charbonnière, ouvriers, carnet, défi de Gaspard
export function ensureNat() {
    if (!state.nat) state.nat = {};
    const n = state.nat;
    n.depth = DEPTHS[n.depth] ? n.depth : 'quarry';
    n.gear = n.gear || { lamp: false, cart: false };
    n.kiln = n.kiln === undefined ? null : n.kiln;
    n.workers = n.workers || { lumber: { lvl: 0, at: 0 }, miner: { lvl: 0, at: 0 } };
    n.log = n.log || {};
    n.logClaimed = n.logClaimed || {};
    n.gaspard = n.gaspard || null;
    return n;
}
const countFor = (table, lvl) => table.reduce((n, [l, c]) => (lvl >= l ? c : n), 0);
export const forestSlots = () => countFor(FOREST_SLOTS, state.level) || FOREST_SLOTS[0][1];
export const mineSlots = () => countFor(MINE_SLOTS, state.level) || MINE_SLOTS[0][1];
export const depthOpen = id => {
    const d = DEPTHS[id],
        n = ensureNat();
    return state.level >= d.lvl && (d.needs || []).every(k => n.gear[k]);
};
export const depthNow = () => DEPTHS[ensureNat().depth];
const pick = list => {
    const total = list.reduce((a, [, w]) => a + w, 0);
    let r = Math.random() * total;
    for (const [id, w] of list) if ((r -= w) < 0) return id;
    return list[0][0];
};
export const speciesOpen = () => Object.keys(SPECIES).filter(id => state.level >= SPECIES[id].lvl);
// tire le contenu d'un emplacement qui repousse
function reroll(kind, sl) {
    if (kind === 'forest') {
        const ids = speciesOpen();
        sl.sp = ids[Math.floor(Math.random() * ids.length)] || 'oak';
        sl.big = Math.random() < 0.25;
    } else {
        sl.ore = pick(depthNow().ores);
        sl.big = Math.random() < 0.25;
        sl.gem = Math.random() < 0.2; // une veine
    }
    sl.hp = slotHp(kind, sl);
}
export function ensureNature() {
    ensureNat();
    ['forest', 'mine'].forEach(k => {
        if (!Array.isArray(state[k])) state[k] = [];
        const want = k === 'forest' ? forestSlots() : mineSlots();
        while (state[k].length < want) {
            const sl = { hp: NATURE[k].hp, until: 0, gem: false };
            state[k].push(sl);
            reroll(k, sl);
        }
        // une ancienne partie : on donne une essence ou un minerai aux emplacements qui n'en ont pas
        state[k].forEach(sl => {
            if (k === 'forest' && !sl.sp) reroll(k, sl);
            if (k === 'mine' && !sl.ore) reroll(k, sl);
        });
    });
    state.tools = { axe: 0, pick: 0, ...(state.tools || {}) };
}
export function setDepth(id) {
    const n = ensureNat();
    if (!depthOpen(id) || n.depth === id) return false;
    n.depth = id;
    state.mine.forEach(sl => {
        sl.until = 0;
        reroll('mine', sl);
    });
    sfx('click');
    return true;
}
export function buyGear(k, at) {
    const n = ensureNat();
    if (n.gear[k] || state.level < DEPTHS.gallery.lvl) return false;
    const c = MINE_GEAR[k].cost;
    if (!hasCost(c)) {
        toast('Il manque quelque chose pour l’équipement', ['ui', MINE_GEAR[k].icon]);
        sfx('error');
        return false;
    }
    payCost(c);
    n.gear[k] = true;
    sfx('level');
    burst(at, 'sparkle', 10);
    toast(`${MINE_GEAR[k].name} : acheté`, ['ui', MINE_GEAR[k].icon]);
    return true;
}
// compte ce qu'on ramasse (carnet du mineur et du bûcheron, défi de Gaspard)
export function natGot(id, q) {
    const n = ensureNat();
    n.log[id] = (n.log[id] || 0) + q;
}

// ---------------- outils et ressources de tailles différentes ----------------
export const toolKey = kind => (kind === 'forest' ? 'axe' : 'pick');
export const toolLvl = kind => state.tools[toolKey(kind)] || 0;
// coups nécessaires : un gros arbre, un filon ou une veine demandent plus d'efforts, un bon outil moins
const hpBase = kind => (kind === 'forest' ? NATURE.forest.hp : depthNow().hp);
export const slotHp = (kind, sl) =>
    Math.max(1, hpBase(kind) + (sl.big ? 2 : 0) + (sl.gem && kind === 'mine' ? VEIN_HITS : 0) - Math.min(toolLvl(kind), 3) - (toolLvl(kind) > 3 ? 1 : 0));
// niveaux 1 à 3 : des outils et des pièces ; 4 à 6 : une tête en fer, en argent ou en or
export const toolHead = kind => (toolLvl(kind) >= 3 ? TOOL_HEADS[toolLvl(kind) - 3] : null);
export const toolCost = kind => {
    const l = toolLvl(kind),
        h = toolHead(kind);
    if (!h) return { tools: l + 1, coins: 400 * Math.pow(l + 1, 2) };
    return { tools: h.tools, coins: h.coins, [h.ing]: h.n };
};
export const toolOpen = kind => !toolHead(kind) || state.level >= toolHead(kind).lvl;
export const slotUp = sl => !sl.until || now() >= sl.until;

export function upgradeTool(kind, at) {
    const lvl = toolLvl(kind),
        c = toolCost(kind);
    if (lvl >= TOOL_MAX || !toolOpen(kind)) return false;
    if (!hasCost(c)) {
        toast('Il manque des outils, des lingots ou des pièces', ['item', 'tools']);
        sfx('error');
        return false;
    }
    payCost(c);
    state.tools[toolKey(kind)]++;
    sfx('level');
    buzz(20);
    burst(at, 'sparkle', 12);
    toast(`${kind === 'forest' ? 'Hache' : 'Pioche'} améliorée : niveau ${toolLvl(kind) + 1}`, ['ui', kind === 'forest' ? 'axe' : 'pickaxe']);
    return true;
}

const give = (id, q, at, cls = '', dy = -30, delay = 0) => {
    state.inventory[id] = (state.inventory[id] || 0) + q;
    natGot(id, q);
    if (ITEMS[id].type === 'gem') collect('t_' + id);
    emit('float', { at, parts: [`+${q}`, ['item', id]], cls, dy, delay });
};

// Un coup de hache ou de pioche ; renvoie 'down' (repousse), 'hit' ou 'done'
export function hitSlot(kind, k, at) {
    ensureNature();
    const sl = state[kind][k],
        N = NATURE[kind];
    if (state.level < N.lvl) return false;
    if (!slotUp(sl)) {
        float(at, [kind === 'forest' ? 'Ça repousse…' : 'Plus rien ici…'], '', -20);
        sfx('click');
        return 'down';
    }
    const max = slotHp(kind, sl);
    if (sl.hp > max) sl.hp = max;
    sl.hp--;
    emit('swing', { at, tool: kind === 'forest' ? 'axe' : 'pickaxe' });
    burst(at, kind === 'forest' ? 'chips' : 'pebbles', 6);
    sfx(kind === 'forest' ? 'chop' : 'rock');
    buzz(10);
    if (sl.hp > 0) return 'hit';
    // ressource obtenue
    const tl = toolLvl(kind),
        bonus = Math.random() < state.upgrades.yield * 0.1 ? 2 : 0;
    const stoneQty = 2 + Math.floor(Math.random() * 2) + (sl.big ? 3 : 0) + tl + bonus;
    state.stats[kind === 'forest' ? 'chopped' : 'mined']++;
    let xp = kind === 'forest' ? 4 : 6;
    if (kind === 'forest') {
        const sp = SPECIES[sl.sp] || SPECIES.oak;
        give('wood', stoneQty + (sp.wood || 0), at);
        const [id, p, a, b] = sp.extra;
        if (Math.random() < p + (sl.big ? 0.2 : 0)) give(id, a + Math.floor(Math.random() * (b - a + 1)), at, '', -48, 150);
        state.nat.lastSpecies = sl.sp;
        // la cueillette de saison
        const list = FORAGE.by[season().id];
        if (state.level >= FORAGE.lvl && list && Math.random() < FORAGE.chance) {
            const f = list[Math.floor(Math.random() * list.length)];
            give(f, 1, at, 'gold', -66, 300);
            toast(`Cueillette : ${ITEMS[f].name.toLowerCase()} sous l’arbre`, ['item', f]);
        }
        if (Math.random() < 0.05) {
            state.seeds.apple++;
            toast('Une jeune pousse de pommier était cachée sous l’arbre !', ['seed', 'apple']);
        }
    } else {
        const d = depthNow(),
            ore = sl.ore || 'stone';
        if (ore === 'stone') give('stone', stoneQty, at);
        else {
            // un minerai se garde plus rare que la pierre
            const q = 1 + Math.floor(Math.random() * 2) + (sl.big ? 1 : 0) + Math.floor(tl / 2) + (bonus ? 1 : 0) + (sl.gem ? 1 : 0);
            give(ore, q, at);
            give('stone', 1 + Math.floor(Math.random() * 2), at, '', -44, 120);
            xp += 3;
        }
        // une pierre précieuse : une veine en donne toujours une
        if (sl.gem || Math.random() < (sl.big ? 0.4 : 0.11)) {
            const g = pick(d.gems);
            give(g, 1, at, 'gold', -56, 250);
            sfx('golden');
            burst(at, 'sparkle', 12);
            xp += 4;
        }
        state.nat.lastOre = ore;
    }
    if (sl.gem && kind === 'mine') state.stats.veins = (state.stats.veins || 0) + 1;
    addXp(xp, at);
    gaspardHit(kind, sl);
    sl.until = now() + ((sl.big ? 1.6 : 1) * N.regrow * 1000) / speedMult();
    reroll(kind, sl);
    return 'done';
}
// branché plus tard par natureplus.js (défi de Gaspard) ; évite un import circulaire
let gaspardHit = () => {};
export const onNatureHit = fn => (gaspardHit = fn);
