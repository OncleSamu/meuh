// 1.67 : les miels de fleurs. Les abeilles butinent ce qui est en fleur ; si une fleur domine, le miel prend son nom.
// Ruche posée dans le champ : ses 8 voisines. Ruches du pré (ruche d'élevage) : tout le champ, la serre et,
// au printemps, les arbres du verger.
import { state } from '../core/state.js';
import { toast } from '../core/bus.js';
import { ITEMS } from '../data/items.js';
import { HONEYS, HONEY_RULE, HONEY_OF } from '../data/honey.js';
import { speedMult } from './player.js';
import { season } from './world.js';
import { harvestVariety } from './genetics.js';
import { tip } from './tips.js';

export { HONEYS };
// une parcelle en fleur : la moitié de sa pousse au moins (ou prête)
const inBloom = p => !!(p && p.isUnlocked && p.itemId && ITEMS[p.itemId] && (p.isReady || p.growProgress >= ITEMS[p.itemId].time / speedMult() / 2));
// compte les fleurs : { total, by: { plante: n } }
function tally(plots, trees = []) {
    const by = {};
    let total = 0;
    for (const p of plots) {
        if (!p || !p.isUnlocked) continue;
        if (p.deco === 'flowers') {
            total += 3; // un parterre : des fleurs de toutes sortes
            continue;
        }
        if (!inBloom(p)) continue;
        total++;
        by[p.itemId] = (by[p.itemId] || 0) + 1;
    }
    for (const id of trees) {
        total++;
        by[id] = (by[id] || 0) + 1;
    }
    return { total, by };
}
// le miel que donne ce mélange : { kind (ou null : toutes fleurs), share, flower, n, need }
// 1.69 : land : la contrée du rucher (null : la ferme) ; un miel ne vient que de sa contrée
export function judge({ total, by }, land = null) {
    let best = null,
        n = 0;
    for (const [id, c] of Object.entries(by)) if (HONEY_OF[id] && (HONEYS[HONEY_OF[id]].land || null) === land && c > n) [best, n] = [id, c];
    const share = total ? n / total : 0;
    const ok = best && share >= HONEY_RULE.share && n >= HONEY_RULE.min;
    // ce qu'il manque pour y arriver : des parcelles de cette fleur (assez pour 4, et pour la moitié)
    const need = best ? Math.max(0, HONEY_RULE.min - n, Math.ceil(total * HONEY_RULE.share - n), total - 2 * n) : HONEY_RULE.min;
    return { kind: ok ? HONEY_OF[best] : null, flower: best, share, n, need: ok ? 0 : need };
}
const springTrees = () =>
    season().id === 'printemps' && state.orchard && Array.isArray(state.orchard.slots)
        ? state.orchard.slots.filter(s => s && s.tree && s.tree.id && HONEY_OF[s.tree.id]).map(s => s.tree.id)
        : [];
// une ruche posée dans le champ (case i)
export function hiveHoney(i, nb) {
    return judge(tally(nb.map(j => state.grid[j])));
}
// les ruches du pré
export function pastureHoney() {
    const gh = (state.greenhouse && state.greenhouse.built && state.greenhouse.plots) || [];
    return judge(tally([...state.grid, ...gh], springTrees()));
}

// le produit « miel de fleur » dans le registre des variétés et des races (genetics.rv)
export function honeyProd(kind) {
    const G = state.genetics;
    if (!G || !HONEYS[kind]) return null;
    G.rv = G.rv || {};
    const id = 'H' + kind;
    if (!G.rv[id]) G.rv[id] = { id, kind: 'honey', honey: kind, base: 'honey' };
    return id;
}
// n pots viennent d'entrer dans le stock de miel : la part d'un miel de fleur garde son nom
export function addHoney(kind, n) {
    if (!kind || !(n > 0)) return;
    const id = honeyProd(kind);
    if (!id) return;
    harvestVariety(id, n, 0);
    const s = (state.stats.honeyKinds = state.stats.honeyKinds || {});
    if (!s[kind]) {
        tip('honeyKinds');
        toast(`Premier ${HONEYS[kind].name.toLowerCase()} : les ${flowerName(HONEYS[kind].flower)} dominent autour des ruches`, ['item', 'honey_' + kind]);
    }
    s[kind] = (s[kind] || 0) + n;
}
// la fleur, en mots : « lavande », « pommiers » (un arbre)
export const flowerName = id => (ITEMS[id].type === 'tree' ? ITEMS[id].seedName.toLowerCase() + 's' : ITEMS[id].name.toLowerCase());
export const honeyName = kind => (HONEYS[kind] ? HONEYS[kind].name : 'Miel toutes fleurs');
// une phrase pour la ruche : « Miel de lavande (70 % de lavande) » ou ce qu'il manque
export function honeyForecast(j) {
    if (j.kind) return `${honeyName(j.kind)} (${Math.round(j.share * 100)} % de ${flowerName(HONEYS[j.kind].flower)})`;
    if (j.flower && HONEY_OF[j.flower])
        return `Toutes fleurs : encore ${j.need} ${flowerName(j.flower)} en fleur pour un ${honeyName(HONEY_OF[j.flower]).toLowerCase()}`;
    return 'Toutes fleurs : aucune fleur à miel ne domine';
}

// les miels de fleurs déjà récoltés
export const honeyLog = () => Object.keys(state.stats.honeyKinds || {}).filter(k => HONEYS[k]);
