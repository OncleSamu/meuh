// 1.12 : le verger — greffes, pépinière, soins, cueilleur, défi d'Odile.
import { state } from '../core/state.js';
import { now } from '../core/clock.js';
import { view } from '../core/view.js';
import { round5 } from '../core/format.js';
import { toast, sfx, burst, buzz, changed } from '../core/bus.js';
import { DAYS_PER_SEASON } from '../data/world.js';
import { GRAFTS, NURSERY, CARE, PICKER, ODILE, RARE_GRAFTS } from '../data/orchard.js';
import { earn, addXp } from './player.js';
import { hasCost, payCost } from './home.js';
import { addFriendship } from './village.js';
import { season } from './world.js';
import { qual } from './farm.js';
import { slotsOf, treeList, matOf, treeStage, pickTree, onTreePick, onOrchardPicker } from './orchard.js';

const seasonIdx = () => Math.floor((state.day - 1) / DAYS_PER_SEASON);
const treeAt = (k, z = 'farm') => {
    const s = slotsOf(z)[k];
    return s && s.tree;
};

// ---------------- la pépinière et les greffes ----------------
export const nurseryOpen = () => state.level >= NURSERY.lvl;
export function craftGraft(gid, at) {
    const g = GRAFTS[gid];
    if (!g || !g.cost || !nurseryOpen()) return false;
    if (!hasCost(g.cost)) {
        sfx('error');
        toast('Il manque du bois, de la résine ou des fruits', ['item', g.item]);
        return false;
    }
    payCost(g.cost);
    state.inventory[g.item] = (state.inventory[g.item] || 0) + 1;
    sfx('level');
    burst(at, 'sparkle', 8);
    toast(`${g.name} prêt à greffer`, ['item', g.item]);
    return true;
}
export const graftStock = gid => state.inventory[GRAFTS[gid].item] || 0;
// greffer un arbre : l'ancien greffon revient dans le sac
export function graftTree(k, gid, at, z = 'farm') {
    const t = treeAt(k, z),
        g = GRAFTS[gid];
    if (!t || !g || treeStage(t) === 'dead' || !graftStock(gid)) return false;
    if (t.g === gid) return false;
    state.inventory[g.item]--;
    if (t.g) state.inventory[GRAFTS[t.g].item] = (state.inventory[GRAFTS[t.g].item] || 0) + 1;
    t.g = gid;
    sfx('plant');
    burst(at, 'leaf', 8);
    burst(at, 'sparkle', 6);
    toast(`${g.name} : ${g.text}`, ['item', g.item]);
    changed('orchard');
    return true;
}
export function ungraftTree(k, at, z = 'farm') {
    const t = treeAt(k, z);
    if (!t || !t.g) return false;
    state.inventory[GRAFTS[t.g].item] = (state.inventory[GRAFTS[t.g].item] || 0) + 1;
    t.g = null;
    sfx('tap');
    changed('orchard');
    return true;
}

// ---------------- les soins ----------------
export const careOpen = () => state.level >= CARE.lvl;
export const isWinter = () => season().id === 'hiver';
export const canPrune = t => careOpen() && isWinter() && !(t.pr > seasonIdx()) && treeStage(t) !== 'dead';
export function pruneTree(k, at, z = 'farm') {
    const t = treeAt(k, z);
    if (!t || !canPrune(t)) {
        sfx('error');
        if (t && !isWinter()) toast('On ne taille qu’en hiver', ['ui', 'pruners']);
        return false;
    }
    t.pr = seasonIdx() + 1;
    odileCare();
    sfx('tap');
    burst(at, 'leaf', 6);
    toast('Taillé : fruits 15 % plus vite la saison prochaine', ['ui', 'pruners']);
    changed('orchard');
    return true;
}
export const manureLeft = t => (t.mn && t.mn > now() ? t.mn - now() : 0);
export function manureTree(k, at, z = 'farm') {
    const t = treeAt(k, z);
    if (!t || !careOpen() || treeStage(t) === 'dead' || manureLeft(t)) return false;
    if (!hasCost(CARE.manure.cost)) {
        sfx('error');
        toast('Il faut 2 fumiers', ['item', 'fertilizer']);
        return false;
    }
    payCost(CARE.manure.cost);
    t.mn = now() + CARE.manure.time;
    odileCare();
    sfx('tap');
    burst(at, 'dirt', 6);
    changed('orchard');
    return true;
}
export const canRejuvenate = t => careOpen() && t.drops >= CARE.rejuvenate.minDrops;
export function rejuvenateTree(k, at, z = 'farm') {
    const t = treeAt(k, z);
    if (!t || !canRejuvenate(t)) return false;
    if (!hasCost(CARE.rejuvenate.cost)) {
        sfx('error');
        toast('Il manque du bois dur, de la résine ou du fumier', ['item', 'hardwood']);
        return false;
    }
    payCost(CARE.rejuvenate.cost);
    t.mat = matOf(t);
    t.drops = Math.floor(t.drops / 2);
    sfx('level');
    burst(at, 'sparkle', 12);
    toast('L’arbre repart pour une seconde jeunesse', ['ui', 'pruners']);
    changed('orchard');
    return true;
}

// ---------------- le cueilleur ----------------
export const pickerOpen = () => state.level >= PICKER.lvl;
export const pickerLvl = () => (state.orchard.picker && state.orchard.picker.lvl) || 0;
export const pickerEvery = () => PICKER.every[pickerLvl()];
export const pickerNext = () => (pickerLvl() >= 4 ? null : pickerLvl() === 0 ? PICKER.hire : PICKER.up[pickerLvl() - 1]);
export function upgradePicker(at) {
    const c = pickerNext();
    if (!c || !pickerOpen()) return false;
    if (!hasCost(c)) {
        sfx('error');
        toast('Il manque des pièces ou des matériaux', ['villager', 'picker']);
        return false;
    }
    payCost(c);
    const o = state.orchard;
    o.picker = { lvl: pickerLvl() + 1, at: now() + PICKER.every[pickerLvl() + 1] };
    sfx('level');
    burst(at, 'sparkle', 12);
    toast(pickerLvl() === 1 ? 'Un cueilleur rejoint le verger' : `Le cueilleur est plus rapide (niveau ${pickerLvl()})`, ['villager', 'picker']);
    return true;
}
// ramasse tout ce qui est au sol ; renvoie le nombre de fruits
export function autoPick() {
    let n = 0;
    for (const z of ['farm', 'island', 'oasis', 'nord'])
        slotsOf(z).forEach((slot, k) => {
            if (!slot.tree || !slot.tree.ground) return;
            const r = pickTree(k, null, true, z);
            if (!r) return;
            n += r.qty;
            addXp(Math.floor(r.xp / 2));
        });
    if (n) state.stats.pickerFruits = (state.stats.pickerFruits || 0) + n;
    return n;
}
export function pickerTick() {
    const p = state.orchard.picker;
    if (!p || !p.lvl || now() < p.at) return false;
    p.at = now() + pickerEvery();
    return autoPick() > 0;
}
onOrchardPicker(
    () => pickerEvery() || 0,
    () => autoPick(),
);
export function pickerAfterOffline() {
    const p = state.orchard.picker;
    if (p && p.lvl) p.at = now() + pickerEvery();
}

// ---------------- Odile, l'arboricultrice : un défi par jour ----------------
export const odileOpen = () => state.level >= ODILE.lvl;
const dayKey = (t = now()) => {
    const d = new Date(t);
    return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
};
// fruits « de choix » : argent ou or, tous arbres confondus
export const choiceCount = () =>
    [...treeList('farm'), ...treeList('island'), ...treeList('oasis'), ...treeList('nord')].reduce((a, d) => a + qual(d.id).s + qual(d.id).g, 0);
function newOdile(day) {
    const roll = Math.random(),
        lvl = state.level;
    const base = { day, done: false, claimed: false, got: 0 };
    const trees = [...state.orchard.slots].filter(s => s.tree);
    if (roll < 0.15 && trees.some(s => matOf(s.tree) >= 40)) return { ...base, kind: 'veteran', need: 1 };
    if (roll < 0.3 && trees.length) return { ...base, kind: 'care', need: 1 };
    if (roll < 0.55 && lvl >= 14) return { ...base, kind: 'choice', need: 3 + Math.floor(lvl / 12) };
    return { ...base, kind: 'pick', need: 8 + Math.round(lvl / 3) };
}
export function ensureOdile() {
    if (!odileOpen()) return null;
    const o = state.orchard,
        day = dayKey();
    if (!o.odile || o.odile.day !== day) o.odile = newOdile(day);
    return o.odile;
}
export function odileProgress(g = ensureOdile()) {
    if (!g) return 0;
    if (g.kind === 'choice') return Math.min(g.need, choiceCount());
    return Math.min(g.need, g.got);
}
export function odileCheck() {
    const g = state.orchard.odile;
    if (!g || g.done || g.day !== dayKey()) return;
    if (odileProgress(g) >= g.need) {
        g.done = true;
        if (view.started) toast('Défi d’Odile réussi ! Elle vous attend au verger', ['villager', 'odile']);
    }
}
export function odileText(g = ensureOdile()) {
    if (!g) return '';
    if (g.kind === 'veteran') return 'Faire ramasser un arbre mûr (40 fruits donnés ou plus)';
    if (g.kind === 'care') return state.orchard.slots.some(s => s.tree && canPrune(s.tree)) ? 'Tailler un arbre' : 'Fumer un arbre';
    if (g.kind === 'choice') return `Lui apporter ${g.need} fruits argent ou or`;
    return `Cueillir ${g.need} fruits`;
}
export const odileReward = g => {
    const mult = g && g.kind === 'choice' ? ODILE.choiceMult : 1;
    return { coins: round5(ODILE.coins(state.level) * mult), xp: Math.round(ODILE.xp(state.level) * mult) };
};
export const odileReady = () => !!(odileOpen() && state.orchard.odile && state.orchard.odile.done && !state.orchard.odile.claimed);
// un greffon rare : or (50), double (35) ou éternel (15)
export function rollRareGraft(chance) {
    if (Math.random() >= chance) return null;
    let r = Math.random() * RARE_GRAFTS.reduce((a, x) => a + x[1], 0);
    for (const [id, w] of RARE_GRAFTS) {
        r -= w;
        if (r <= 0) return id;
    }
    return RARE_GRAFTS[0][0];
}
export function claimOdile(at) {
    const g = state.orchard.odile;
    if (!g || !g.done || g.claimed) return false;
    if (g.kind === 'choice') {
        // elle emporte les fruits : argent d'abord
        let left = g.need;
        for (const d of [...treeList('farm'), ...treeList('island'), ...treeList('oasis'), ...treeList('nord')]) {
            const q = qual(d.id);
            for (const key of ['s', 'g']) {
                const take = Math.min(left, q[key], state.inventory[d.id] || 0);
                q[key] -= take;
                state.inventory[d.id] -= take;
                left -= take;
            }
        }
    }
    g.claimed = true;
    const r = odileReward(g);
    earn(r.coins, at);
    addXp(r.xp, at);
    addFriendship('odile', ODILE.hearts, at);
    const gid = rollRareGraft(g.kind === 'choice' ? ODILE.graftChoice : ODILE.graft);
    if (gid) {
        state.inventory[GRAFTS[gid].item] = (state.inventory[GRAFTS[gid].item] || 0) + 1;
        toast(`Odile : « Une branche rare pour vous : le ${GRAFTS[gid].name.toLowerCase()}. »`, ['item', GRAFTS[gid].item]);
    } else toast('Odile : « Voilà qui est bien soigné ! »', ['villager', 'odile']);
    state.stats.odileDone = (state.stats.odileDone || 0) + 1;
    sfx('level');
    buzz(20);
    return true;
}
// appelée à chaque cueillette ; les soins comptent aussi
onTreePick((t, qty) => {
    const g = state.orchard.odile;
    if (g && !g.done && g.day === dayKey()) {
        if (g.kind === 'pick') g.got += qty;
        if (g.kind === 'veteran' && matOf(t) >= 40) g.got++;
    }
    odileCheck();
});
export function odileCare() {
    const g = state.orchard.odile;
    if (g && !g.done && g.kind === 'care' && g.day === dayKey()) {
        g.got++;
        odileCheck();
    }
}
