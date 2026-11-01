// 1.69 : le rucher de chaque contrée (île, oasis, Grand Nord). 1 à 3 ruches qui ne butinent que leur contrée :
// les parcelles en fleur (à mi-pousse) et les arbres du verger qui portent. Même règle que la ferme (1.67) :
// une fleur qui fait la moitié de ce qui fleurit, avec 4 parcelles ou arbres, donne son miel.
// Île : toute l'année. Oasis : les ruches boivent à la citerne. Nord : printemps et été, ou un poêle allumé.
// state.apiary[land] = { hives, honey } (honey : pots en réserve, avec leur fraction).
import { state } from '../core/state.js';
import { fmt } from '../core/format.js';
import { toast, sfx, buzz, burst, float, fly, changed } from '../core/bus.js';
import { ITEMS } from '../data/items.js';
import { APIARY, APIARY_LANDS, APIARY_RUN } from '../data/apiary.js';
import { HONEYS } from '../data/honey.js';
import { speedMult, addXp } from './player.js';
import { season } from './world.js';
import { barnBlocked } from './barn.js';
import { eventProgress } from './events.js';
import { tip } from './tips.js';
import { hasCost, payCost } from './home.js';
import { slotsOf, treeStage } from './orchard.js';
import { islandOpen, islandPlots } from './island.js';
import { oasisOpen, oasisPlots } from './oasis.js';
import { nordOpen, nordPlots, stoveKeys, stoveLit } from './nord.js';
import { judge, addHoney, honeyForecast } from './honey.js';

export { APIARY, APIARY_LANDS };
const OPEN = { island: islandOpen, oasis: oasisOpen, nord: nordOpen };
const PLOTS = { island: islandPlots, oasis: oasisPlots, nord: nordPlots };
const ZONES = { island: ['island'], oasis: ['oasis', 'oasisV'], nord: ['nord', 'nordV'] };

export const apiaryOpen = land => !!(APIARY[land] && OPEN[land]() && state.level >= APIARY[land].lvl);
export function apiaryOf(land) {
    const A = (state.apiary = state.apiary || {});
    const r = (A[land] = A[land] || { hives: 0, honey: 0 });
    r.hives = Math.max(0, Math.min(APIARY[land].cost.length, r.hives | 0));
    if (!(r.honey >= 0)) r.honey = 0;
    return r;
}
export const apiaryHives = land => (state.apiary && state.apiary[land] ? state.apiary[land].hives : 0);
export const apiaryNext = land => APIARY[land].cost[apiaryHives(land)] || null;
export const apiaryCap = land => apiaryHives(land) * APIARY_RUN.cap;

// ce qui fleurit dans la contrée : { total, by }
export function landBloom(land) {
    const by = {};
    let total = 0;
    const add = id => {
        total++;
        by[id] = (by[id] || 0) + 1;
    };
    for (const p of PLOTS[land]() || [])
        if (p && p.open && p.id && ITEMS[p.id] && !p.sand && !p.snow && (p.ready || p.prog >= ITEMS[p.id].time / speedMult() / 2)) add(p.id);
    for (const z of ZONES[land])
        for (const sl of slotsOf(z))
            if (sl && sl.tree && ITEMS[sl.tree.id]) {
                const st = treeStage(sl.tree);
                if (st === 'adult' || st === 'old') add(sl.tree.id);
            }
    return { total, by };
}
export const apiaryJudge = land => judge(landBloom(land), land);
// pourquoi les abeilles ne travaillent pas (ou null)
export function apiaryIdle(land) {
    if (!apiaryHives(land)) return 'Pas encore de ruche';
    if (land === 'oasis' && !(state.oasis && state.oasis.water >= 0.01)) return 'La citerne est vide : les abeilles ont soif';
    if (land === 'nord' && !['printemps', 'ete'].includes(season().id) && !stoveKeys().some(stoveLit))
        return 'Trop froid : les abeilles attendent le printemps, ou un poêle allumé au champ de neige';
    if (!landBloom(land).total) return 'Rien ne fleurit : plantez des cultures et des arbres dans la contrée';
    return null;
}
// pots par seconde
export function apiaryRate(land) {
    if (apiaryIdle(land)) return 0;
    const f = Math.min(1, landBloom(land).total / APIARY_RUN.full);
    return (apiaryHives(land) * Math.max(0.25, f) * speedMult()) / APIARY_RUN.every;
}

// avance les ruchers de dt secondes
export function apiaryTick(dt = 1) {
    if (!state.apiary) return false;
    let ch = false;
    for (const land of APIARY_LANDS) {
        const r = state.apiary[land];
        if (!r || !r.hives || !apiaryOpen(land)) continue;
        const cap = apiaryCap(land);
        if (r.honey >= cap) continue;
        const rate = apiaryRate(land);
        if (!rate) continue;
        let t = dt;
        // l'oasis : les ruches boivent à la citerne (une part du temps si l'eau manque)
        if (land === 'oasis') {
            const need = (APIARY.oasis.drink * r.hives * dt) / 3600;
            const got = Math.min(need, state.oasis.water);
            state.oasis.water -= got;
            t = need > 0 ? (dt * got) / need : dt;
        }
        const before = Math.floor(r.honey);
        r.honey = Math.min(cap, r.honey + rate * t);
        if (Math.floor(r.honey) !== before) ch = true;
    }
    return ch;
}

export function buyHive(land, at) {
    if (!apiaryOpen(land)) return false;
    const c = apiaryNext(land);
    if (!c) return false;
    if (!hasCost(c)) {
        toast('Il manque de quoi bâtir la ruche', ['ui', APIARY[land].icon]);
        sfx('error');
        return false;
    }
    payCost(c);
    const r = apiaryOf(land);
    r.hives++;
    tip('apiary');
    sfx('buy');
    buzz(15);
    if (at) burst(at, 'sparkle', 10);
    toast(r.hives === 1 ? `${APIARY[land].name} : la première ruche est posée` : `${APIARY[land].name} : ${r.hives} ruches`, ['ui', APIARY[land].icon]);
    changed('apiary');
    return true;
}

export function harvestApiary(land, at) {
    const r = apiaryOf(land);
    const jars = Math.floor(r.honey);
    if (jars < 1) return false;
    if (barnBlocked()) return false;
    r.honey -= jars;
    state.inventory.honey = (state.inventory.honey || 0) + jars;
    const kind = apiaryJudge(land).kind;
    addHoney(kind, jars);
    state.stats.honey = (state.stats.honey || 0) + jars;
    state.stats.apiaryHoney = (state.stats.apiaryHoney || 0) + jars;
    eventProgress('harvest', 'honey', jars);
    addXp(jars * APIARY_RUN.xp, at);
    sfx('harvest');
    buzz(12);
    if (at) {
        burst(at, 'sparkle', 8, -10);
        float(at, [`+${jars}`, ['item', kind ? 'honey_' + kind : 'honey']], '', -24);
        fly(at, 'honey', jars);
    }
    if (kind) toast(`${HONEYS[kind].name} ×${fmt(jars)}`, ['item', 'honey_' + kind]);
    return true;
}
export const apiaryReady = () =>
    APIARY_LANDS.reduce((a, l) => a + (apiaryOpen(l) ? Math.floor((state.apiary && state.apiary[l] && state.apiary[l].honey) || 0) : 0), 0);
export const apiaryForecast = land => honeyForecast(apiaryJudge(land));
// les miels de la contrée (pour l'interface)
export const landHoneys = land => Object.entries(HONEYS).filter(([, h]) => h.land === land);
