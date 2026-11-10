// 1.107 : la table d'hôtes du domaine (un des grands travaux). On compose un menu de trois plats différents de la cuisine,
// servi en deux heures : quelques pièces, de l'expérience et surtout du renom pour le domaine (le marché paie plus).
import { state } from '../core/state.js';
import { now } from '../core/clock.js';
import { dateKey } from '../core/format.js';
import { sfx, emit } from '../core/bus.js';
import { ITEMS } from '../data/items.js';
import { RECIPES } from '../data/machines.js';
import { TABLE } from '../data/domaine.js';
import { itemKind } from '../data/paquets.js';
import { workLvl } from './estate.js';
import { earn, addXp } from './player.js';
import { clampQuality } from './farm.js';
import { addRenom } from './renom.js';

export const tableOpen = () => workLvl('table') > 0;
export const tableCovers = () => TABLE.covers[Math.max(0, workLvl('table') - 1)];
export const tablePerDay = () => workLvl('table');
const today = () => dateKey(new Date(now()));
const T = () => state.table || (state.table = { menu: null, n: 0, end: 0, day: '', count: 0 });
export const tableLeft = () => (tableOpen() ? tablePerDay() - (T().day === today() ? T().count : 0) : 0);
export const tableBusy = () => !!(state.table && state.table.menu);
export const tableDone = (t = now()) => tableBusy() && t >= state.table.end;
// un plat : une recette de cuisine (pas d'artisanat, pas de boîte)
export const isDish = id => !!(RECIPES[id] && ITEMS[id] && ITEMS[id].sell > 0 && itemKind(id) === 'cuisine');
export const tableDishes = () =>
    Object.keys(state.inventory)
        .filter(id => isDish(id) && state.inventory[id] >= tableCovers())
        .sort((a, b) => ITEMS[b].sell - ITEMS[a].sell);
// l'accord : trois plats de trois machines différentes
export const tableAccord = ids => new Set(ids.map(id => RECIPES[id] && RECIPES[id].machine)).size === 3;
export const tablePay = (ids, n = tableCovers()) => Math.round(ids.reduce((a, id) => a + ITEMS[id].sell, 0) * n * TABLE.pay);
export const tableRenom = ids => TABLE.renom + (tableAccord(ids) ? TABLE.accord : 0);
export function tableCan(ids) {
    return tableOpen() && !tableBusy() && tableLeft() > 0 && ids.length === 3 && new Set(ids).size === 3 && ids.every(id => isDish(id) && (state.inventory[id] || 0) >= tableCovers());
}
export function tableServe(ids) {
    if (!tableCan(ids)) return false;
    const t = T(),
        n = tableCovers();
    for (const id of ids) {
        state.inventory[id] -= n;
        clampQuality(id);
    }
    if (t.day !== today()) Object.assign(t, { day: today(), count: 0 });
    t.count++;
    Object.assign(t, { menu: [...ids], n, end: now() + TABLE.dur });
    sfx('pop');
    return true;
}
export function tableCollect(at) {
    if (!tableDone()) return false;
    const t = state.table,
        pay = tablePay(t.menu, t.n),
        rn = tableRenom(t.menu);
    earn(pay, at);
    addXp(Math.round(pay * TABLE.xp), at);
    state.stats.tableServed = (state.stats.tableServed || 0) + 1;
    t.menu = null;
    addRenom(rn, 'table', at);
    emit('confetti');
    return { pay, renom: rn };
}
