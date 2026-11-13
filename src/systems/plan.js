// 1.133 : le plan de production. On choisit un plat et une quantité ; le jeu calcule toute la chaîne (stock déduit),
// lance les étapes intermédiaires sur les machines libres, ramasse ce qu'elles font, et lance le plat final
// quand il y a de quoi faire toute la quantité voulue. Les produits bruts (champ, bêtes…) sont seulement signalés.
import { state } from '../core/state.js';
import { now } from '../core/clock.js';
import { view } from '../core/view.js';
import { toast, sfx } from '../core/bus.js';
import { ITEMS } from '../data/items.js';
import { RECIPES, MACHINES } from '../data/machines.js';
import { recipeUnlocked, recipeTime, hasMachine, queueQuiet, collectMachine } from './workshop.js';
import { machineSlots } from './home.js';

export const PLAN_QTYS = [1, 5, 10, 25];
export const PLAN_DEPTH = 8;
export const planOf = () => state.plan || null;
// les recettes qu'on peut mettre en plan : ouvertes, faites sur une machine qu'on possède
export const plannable = id => !!RECIPES[id] && recipeUnlocked(id) && hasMachine(RECIPES[id].machine);
const outQty = id => RECIPES[id].outQty || 1;

// ce qui est en route sur les machines (en file ou prêt à ramasser)
export function coming(id) {
    let n = 0;
    for (const m of state.machines) {
        for (const q of m.queue) if (q === id) n += outQty(id);
        if (m.out && m.out[id]) n += m.out[id] * outQty(id);
    }
    return n;
}

// l'arbre d'un plat pour une quantité, stock et production en cours déduits
// noeud : { id, need, have, make (lancements à faire), raw, blocked, kids }
export function planTree(id, qty, pool = {}, depth = 0) {
    const avail = id in pool ? pool[id] : (state.inventory[id] || 0) + coming(id);
    const have = Math.min(avail, qty);
    pool[id] = avail - have;
    const rest = qty - have;
    const r = RECIPES[id];
    const node = { id, need: qty, have, make: 0, raw: !r, blocked: null, kids: [] };
    if (!rest) return node;
    if (!r) return { ...node, missing: rest };
    if (!recipeUnlocked(id)) node.blocked = 'recipe';
    else if (!hasMachine(r.machine)) node.blocked = 'machine';
    node.make = Math.ceil(rest / outQty(id));
    if (depth < PLAN_DEPTH) node.kids = Object.entries(r.ing).map(([k, n]) => planTree(k, n * node.make, pool, depth + 1));
    return node;
}
// l'arbre du plan en cours (le plat final : ce qui reste à lancer)
export function rootFor(id, left) {
    const r = RECIPES[id];
    const root = { id, need: left, have: 0, make: left, raw: false, blocked: null, kids: [] };
    const pool = {};
    root.kids = Object.entries(r.ing).map(([k, n]) => planTree(k, n * left, pool, 1));
    return root;
}
export function planNow() {
    const p = planOf();
    return p ? rootFor(p.id, p.n - p.queued) : null;
}
// avant de lancer : ce que coûterait un plan
export const prodPreview = (id, n) => planSummary(rootFor(id, n));
const walk = (node, fn) => {
    fn(node);
    node.kids.forEach(k => walk(k, fn));
};
// la liste à plat : les étapes à lancer (par machine) et les produits bruts qui manquent
export function planSummary(tree = planNow()) {
    const steps = {},
        raws = {},
        blocked = [];
    if (!tree) return { steps: [], raws: [], blocked, time: 0 };
    tree.kids.forEach(k =>
        walk(k, x => {
            if (x.raw && x.missing) raws[x.id] = (raws[x.id] || 0) + x.missing;
            else if (!x.raw && x.make) {
                steps[x.id] = (steps[x.id] || 0) + x.make;
                if (x.blocked) blocked.push(x);
            }
        }),
    );
    const list = Object.entries(steps).map(([id, n]) => ({ id, n, machine: RECIPES[id].machine }));
    // une estimation : le temps de la machine la plus chargée, plus le plat final
    const load = {};
    list.forEach(s => (load[s.machine] = (load[s.machine] || 0) + (recipeTime(s.id) * s.n) / Math.max(1, slotsOf(s.machine))));
    const fin = RECIPES[tree.id];
    const time = Math.max(0, ...Object.values(load)) + (recipeTime(tree.id) * tree.make) / Math.max(1, slotsOf(fin.machine));
    return { steps: list, raws: Object.entries(raws).map(([id, n]) => ({ id, n })), blocked, time };
}
const slotsOf = type => state.machines.filter(m => m.type === type).length * Math.max(1, Math.min(2, machineSlots(type)));
// ce que le plan garde de côté (pour qu'il ne parte pas au marché) ; calculé au plus une fois par demi-seconde
let resCache = null;
export function planReserve(id) {
    const p = planOf();
    if (!p) return 0;
    if (!resCache || resCache.p !== p || resCache.q !== p.queued || now() - resCache.t > 500) {
        const map = {};
        const t = planNow();
        t.kids.forEach(k => walk(k, x => (map[x.id] = (map[x.id] || 0) + x.have)));
        // le plat final en attente : ses ingrédients directs sont gardés aussi
        resCache = { p, q: p.queued, t: now(), map };
    }
    return resCache.map[id] || 0;
}

// ---------------- les gestes ----------------
export function startPlan(id, n) {
    if (!plannable(id) || !(n > 0)) return false;
    state.plan = { id, n: Math.min(99, Math.round(n)), queued: 0, at: now() };
    sfx('click');
    planTick(true);
    return true;
}
export function stopPlan() {
    if (!state.plan) return false;
    state.plan = null;
    return true;
}
// le plat final peut-il partir en entier (tous ses ingrédients pour la quantité qui reste) ?
export function finalReady() {
    const p = planOf();
    if (!p) return false;
    const left = p.n - p.queued;
    return Object.entries(RECIPES[p.id].ing).every(([k, n]) => (state.inventory[k] || 0) >= n * left);
}

// ---------------- le tick (toutes les 3 secondes) ----------------
let last = 0;
export function planTick(force) {
    const p = planOf();
    if (!p) return false;
    if (!force && now() - last < 3000) return false;
    last = now();
    let ch = false;
    const tree = planNow();
    const parts = new Set();
    tree.kids.forEach(k => walk(k, x => !x.raw && parts.add(x.id)));
    // 1. on ramasse ce que les machines ont fait pour le plan
    state.machines.forEach((m, i) => {
        if (m.out && Object.keys(m.out).some(k => m.out[k] > 0 && parts.has(k)) && collectMachine(i, null, true)) ch = true;
    });
    // 2. le plat final, dès qu'il y a de quoi faire toute la quantité
    if (!p.go && finalReady()) p.go = true;
    if (p.go) {
        state.machines.forEach((m, i) => {
            while (p.queued < p.n && m.type === RECIPES[p.id].machine && queueQuiet(i, p.id)) {
                p.queued++;
                ch = true;
            }
        });
        if (p.queued >= p.n) {
            if (view.started) toast(`Plan terminé : les ${p.n} ${ITEMS[p.id].name.toLowerCase()} sont lancés`, ['item', p.id]);
            sfx('level');
            state.plan = null;
            return true;
        }
        return ch;
    }
    // 3. les étapes : du plus profond au plus proche, sur les machines libres
    const steps = [];
    const visit = (x, d) => {
        x.kids.forEach(k => visit(k, d + 1));
        if (!x.raw && x.make && !x.blocked) steps.push({ id: x.id, n: x.make, d });
    };
    tree.kids.forEach(k => visit(k, 1));
    steps.sort((a, b) => b.d - a.d);
    for (const s of steps) {
        let left = s.n;
        state.machines.forEach((m, i) => {
            while (left > 0 && m.type === RECIPES[s.id].machine && queueQuiet(i, s.id)) {
                left--;
                ch = true;
            }
        });
    }
    return ch;
}
export const planMachineName = id => MACHINES[RECIPES[id].machine].name;
