// 1.11 : les améliorations de bâtiments (voir data/buildings.js). state.bld = { b: { barn: 0… }, m: { mill: 0… } }
import { state } from '../core/state.js';
import { toast, sfx, buzz, burst, emit } from '../core/bus.js';
import { MACHINES } from '../data/machines.js';
import { BUILDINGS, BLD_IDS, BLD_MAX, TIER_LVL, tierCost } from '../data/buildings.js';
import { hasCost, payCost } from './home.js';

export function ensureBld() {
    if (!state.bld) state.bld = {};
    state.bld.b = state.bld.b || {};
    state.bld.m = state.bld.m || {};
    return state.bld;
}
export const bldLvl = id => (state.bld && state.bld.b && state.bld.b[id]) || 0;
export const machLvl = type => (state.bld && state.bld.m && state.bld.m[type]) || 0;
const GEMS = ['quartz', 'ruby', 'sapphire', 'emerald'];
const hash = s => [...s].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);

// ce qu'il faut pour passer au niveau suivant : { cost, lvl } ou null au maximum
export function bldNext(kind, id) {
    const cur = kind === 'm' ? machLvl(id) : bldLvl(id);
    if (cur >= BLD_MAX) return null;
    if (kind === 'm') {
        const m = MACHINES[id],
            scale = Math.max(0.4, Math.min(3, (m.cost || 6000) / 6000));
        const h = hash(id);
        return { lvl: TIER_LVL[cur], tier: cur, cost: tierCost(cur, scale, h % 2 ? 'copperIngot' : 'ironIngot', GEMS[h % 4]) };
    }
    const b = BUILDINGS[id];
    return { lvl: TIER_LVL[cur], tier: cur, cost: tierCost(cur, b.scale, b.metal, b.gem) };
}
export const bldOpen = id => {
    if (id === 'cave') return state.level >= 20;
    if (id === 'orchard' || id === 'ladder' || id === 'basket') return state.level >= 10;
    if (id === 'greenhouse') return !!(state.greenhouse && state.greenhouse.built);
    if (id === 'traps') return state.level >= 12;
    if (id === 'pens') return state.animals.length > 0;
    return true;
};
export const bldCan = (kind, id) => {
    const n = bldNext(kind, id);
    return !!n && state.level >= n.lvl && hasCost(n.cost);
};
export function upgradeBld(kind, id, at) {
    const n = bldNext(kind, id);
    if (!n || state.level < n.lvl || !hasCost(n.cost)) {
        sfx('error');
        toast(n && state.level < n.lvl ? `Cette amélioration s’ouvre au niveau ${n.lvl}` : 'Il manque des matériaux', ['item', 'beam']);
        return false;
    }
    ensureBld();
    payCost(n.cost);
    if (kind === 'm') state.bld.m[id] = machLvl(id) + 1;
    else state.bld.b[id] = bldLvl(id) + 1;
    state.stats.bldUps = (state.stats.bldUps || 0) + 1;
    sfx('level');
    buzz(30);
    burst(at, 'sparkle', 16);
    if (n.tier === 2) emit('confetti');
    if (id === 'greenhouse') ghExtra();
    toast(`${kind === 'm' ? MACHINES[id].name : BUILDINGS[id].name} : niveau ${n.tier + 1}`, kind === 'm' ? ['machine', id] : BUILDINGS[id].icon);
    return true;
}
export const bldReady = () => BLD_IDS.some(id => bldOpen(id) && bldCan('b', id)) || (state.machines || []).some(m => bldCan('m', m.type));

// ---------------- les effets ----------------
export const barnBonus = () => [0, 60, 140, 260][bldLvl('barn')];
export const penBonus = () => 4 * bldLvl('pens');
export const troughBonus = () => (bldLvl('pens') >= 2 ? 2 : 0);
export const caveBonus = () => 2 * bldLvl('cave') * (bldLvl('cave') === 3 ? 1 : 1);
export const orchardLife = base => base * (1 + 0.1 * bldLvl('orchard'));
export const orchardRate = () => 1 - 0.06 * Math.max(0, bldLvl('orchard') - 1);
export const ladderBonus = () => 2 * bldLvl('ladder');
export const basketBonus = qty => {
    const l = bldLvl('basket');
    return l ? Math.floor(qty / [0, 8, 6, 4][l]) : 0;
};
export const trapBonus = () => bldLvl('traps');
export const ghExtraPlots = () => bldLvl('greenhouse');
// les parcelles libres de la serre
export function ghExtra() {
    const g = state.greenhouse;
    if (!g || !g.built) return;
    g.plots.forEach((p, k) => {
        if (k < 3 + ghExtraPlots()) p.isUnlocked = true;
    });
}
// la machine : une place de plus dans la file par niveau, 8 % de temps en moins, un lot de bonus une fois sur cinq au niveau 3
export const mSlotsBonus = type => machLvl(type);
export const mTimeMult = type => 1 - 0.08 * machLvl(type);
export const mExtraYield = type => (machLvl(type) >= 3 && Math.random() < 0.2 ? 1 : 0);
