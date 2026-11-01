// 1.61 : les objectifs de niveau. À chaque niveau, une ou deux petites tâches tirées de ce qu'il vient d'ouvrir
// (une machine à acheter, une culture à récolter, une bête à acheter, un arbre à planter, une recette à préparer).
// L'expérience continue de s'accumuler, mais le niveau suivant attend que les objectifs soient faits.
// Jamais d'objectif qui dépend du hasard ou d'un chantier pas encore fini ; sans nouveauté accessible : deux commandes du village.
import { state, lvOk } from '../core/state.js';
import { view } from '../core/view.js';
import { ITEMS } from '../data/items.js';
import { ANIMALS } from '../data/animals.js';
import { MACHINES, RECIPES } from '../data/machines.js';
import { MAX_LEVEL } from '../data/progress.js';
import { MEAD } from '../data/abbey.js';
import { APIARY } from '../data/apiary.js';
const LAND_PROJECT = { island: 'ferry', oasis: 'oasisWell', nord: 'northStove' };

// lu directement dans l'état (pas d'import des autres systèmes : goals.js est chargé par player.js)
const projectDone = id => !!(state.projects[id] && state.projects[id].done);
const masteryCount = id => (state.mastery && state.mastery[id]) || 0;
const treesOf = id =>
    [state.orchard && state.orchard.slots, state.island && state.island.orchard, state.oasis && state.oasis.grove, state.nord && state.nord.grove]
        .filter(Boolean)
        .flat()
        .filter(sl => sl && sl.tree && sl.tree.id === id).length;

export const GOALS_FROM = 2; // le niveau 1 est celui du tutoriel

// ce qui se fait vraiment à ce niveau : pas d'objet exotique, pas de contrée pas encore ouverte
const reachable = d => !!d && lvOk(d) && (!d.needProject || projectDone(d.needProject)) && !d.exotic;
const owns = type => state.machines.some(m => m.type === type);
const ingOk = r => Object.keys(r.ing).every(k => reachable(ITEMS[k]) || (RECIPES[k] && lvOk(RECIPES[k], RECIPES[k].lvl)));

export function makeGoals(L) {
    if (L < GOALS_FROM || L >= MAX_LEVEL) return [];
    const out = [];
    const push = g => out.length < 2 && !out.some(x => x.kind === g.kind && x.id === g.id) && out.push(g);
    // 1.68 : l'hydromel s'ouvre à la brasserie
    if (L === MEAD.lvl && projectDone('brewhall')) push({ kind: 'mead', n: 1 });
    // 1.69 : le rucher d'une contrée déjà ouverte
    for (const [land, a] of Object.entries(APIARY)) if (L === a.lvl && projectDone(LAND_PROJECT[land])) push({ kind: 'hive', id: land });
    // une machine du niveau, et une de ses recettes
    const mach = Object.values(MACHINES).find(m => m.reqLvl === L && reachable({ ...m, reqLvl: m.reqLvl }) && m.id !== 'counter');
    if (mach) {
        push({ kind: 'machine', id: mach.id });
        const r = Object.values(RECIPES).find(x => x.machine === mach.id && lvOk(x, x.lvl) && !x.teacher && !x.fete && !x.holiday && ingOk(x));
        if (r) push({ kind: 'make', id: r.id, n: 1 });
    }
    // une culture du niveau : la récolter
    const gh = !!(state.greenhouse && state.greenhouse.plots && state.greenhouse.plots.length);
    const crop = Object.values(ITEMS).find(d => d.type === 'crop' && d.reqLvl === L && reachable(d) && !d.island && !d.oasis && !d.nord && (!d.ghOnly || gh));
    if (crop) push({ kind: 'make', id: crop.id, n: 5 });
    // une bête du niveau : en avoir une
    const beast = Object.values(ANIMALS).find(a => a.reqLvl === L && !a.oasis && !a.nord && !a.needProject && a.id !== 'horse');
    if (beast) push({ kind: 'animal', id: beast.id });
    // un arbre du niveau : le planter
    const tree = Object.values(ITEMS).find(d => d.type === 'tree' && d.reqLvl === L && reachable(d) && !d.island && !d.oasis && !d.nord);
    if (tree) push({ kind: 'tree', id: tree.id });
    // une recette du niveau dans une machine qu'on a déjà
    const rec = Object.values(RECIPES).find(x => x.lvl === L && owns(x.machine) && !x.teacher && !x.fete && !x.holiday && x.machine !== 'counter' && ingOk(x));
    if (rec) push({ kind: 'make', id: rec.id, n: 1 });
    if (!out.length) push({ kind: 'orders', n: 2 });
    // le point de départ de chaque compteur
    for (const g of out)
        g.base = g.kind === 'make' ? masteryCount(g.id) : g.kind === 'orders' ? state.stats.orders || 0 : g.kind === 'mead' ? state.stats.meads || 0 : 0;
    return out;
}

// les objectifs du niveau en cours (créés à l'arrivée au niveau, ou au premier chargement)
export function levelGoals() {
    if (!state.lvGoals || state.lvGoals.lvl !== state.level) state.lvGoals = { lvl: state.level, list: makeGoals(state.level) };
    return state.lvGoals.list;
}

export function goalProgress(g) {
    if (g.kind === 'machine') return [owns(g.id) ? 1 : 0, 1];
    if (g.kind === 'animal') return [state.animals.some(a => a.type === g.id) ? 1 : 0, 1];
    if (g.kind === 'tree') return [treesOf(g.id) > 0 ? 1 : 0, 1];
    if (g.kind === 'orders') return [Math.min(g.n, (state.stats.orders || 0) - g.base), g.n];
    if (g.kind === 'hive') return [(state.apiary && state.apiary[g.id] && state.apiary[g.id].hives) > 0 ? 1 : 0, 1];
    if (g.kind === 'mead') return [Math.max(0, Math.min(g.n, (state.stats.meads || 0) - g.base)), g.n];
    return [Math.max(0, Math.min(g.n, masteryCount(g.id) - g.base)), g.n];
}
export const goalDone = g => {
    const [a, b] = goalProgress(g);
    return a >= b;
};
export const goalsDone = () => levelGoals().every(goalDone);
// le passage de niveau n'attend que pendant une vraie partie (pas pour les essais et le robot)
export const levelGate = () => !view.started || !state.tutorial.done || goalsDone();

export function lvGoalText(g) {
    const [a, b] = goalProgress(g);
    const cnt = b > 1 ? ` (${Math.min(a, b)}/${b})` : '';
    if (g.kind === 'machine') return `Acheter : ${MACHINES[g.id].name.toLowerCase()}`;
    if (g.kind === 'animal') return `Avoir un animal : ${ANIMALS[g.id].name.toLowerCase()}`;
    if (g.kind === 'tree') return `Planter : ${ITEMS[g.id].seedName.toLowerCase()}`;
    if (g.kind === 'orders') return `Livrer ${g.n} commandes du village${cnt}`;
    if (g.kind === 'mead') return 'Mettre en bouteille un hydromel à la brasserie';
    if (g.kind === 'hive') return `Poser une ruche : ${APIARY[g.id].name.toLowerCase()}`;
    const d = ITEMS[g.id];
    return `${d.type === 'crop' || d.type === 'tree' ? 'Récolter' : RECIPES[g.id] ? 'Préparer' : 'Produire'} ${g.n > 1 ? g.n + ' × ' : ''}${d.name.toLowerCase()}${cnt}`;
}
export const lvGoalIcon = g =>
    g.kind === 'machine'
        ? ['machine', g.id]
        : g.kind === 'animal'
          ? ['animal', g.id]
          : g.kind === 'orders'
            ? ['ui', 'scroll']
            : g.kind === 'mead'
              ? ['item', 'mead']
              : g.kind === 'hive'
                ? ['ui', APIARY[g.id].icon]
                : ['item', g.id];
