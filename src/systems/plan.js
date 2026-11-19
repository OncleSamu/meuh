// 1.133 : le plan de production. On choisit un plat (ou plusieurs avec le Tableau d'intendance du domaine,
// une bière maison, ou toute une commande en un clic) : le jeu calcule toute la chaîne (stock déduit),
// lance les étapes intermédiaires sur les machines libres, ramasse ce qu'elles font, et lance les produits finaux
// (ou les brassins en cuve) dès que leurs ingrédients sont prêts. Les produits bruts sont seulement signalés.
import { state } from '../core/state.js';
import { now } from '../core/clock.js';
import { view } from '../core/view.js';
import { toast, sfx } from '../core/bus.js';
import { ITEMS } from '../data/items.js';
import { RECIPES, MACHINES } from '../data/machines.js';
import { PROJECTS, VILLAGERS } from '../data/village.js';
import { recipeUnlocked, recipeTime, hasMachine, queueQuiet, collectMachine } from './workshop.js';
import { machineSlots } from './home.js';
import { planCap } from './estate.js';
import { brewOpen, meadOpen, beerOf, brewCost, brewTime, ingHave, ingBase, recipeOf, startBrew, vatReady, collectVat, ensureBrew, vatCount } from './brewery.js';
import { projectOpen, projectDone, givenOf } from './story.js';
import { isOpen } from './orders.js';

export const PLAN_QTYS = [1, 5, 10, 25, 50];
export const PLAN_MAX = 200;
export const PLAN_DEPTH = 8;
export const planOf = () => state.plan || null;
// les recettes qu'on peut mettre en plan : ouvertes, faites sur une machine qu'on possède
export const plannable = id => !!RECIPES[id] && recipeUnlocked(id) && hasMachine(RECIPES[id].machine);
// une bière maison (ou un hydromel) non vieillie qu'on peut mettre en plan
export const brewPlannable = bid => {
    if (!brewOpen()) return false;
    const b = beerOf(bid);
    return !!(b && !b.aged && b.ings && b.ings.length && (!b.mead || meadOpen()));
};
const outQty = id => (RECIPES[id] && RECIPES[id].outQty) || 1;
const slotsOf = type => state.machines.filter(m => m.type === type).length * Math.max(1, Math.min(2, machineSlots(type)));

// normalise un plan (ancien format plat unique ou nouveau format multi-produits / bière) en liste d'entrées
export function planEntries(p = planOf()) {
    if (!p) return [];
    if (Array.isArray(p.items) && p.items.length) return p.items;
    return [p];
}
const isBeerEntry = e => e && e.kind === 'beer';
const beerCostOf = bid => {
    const b = beerOf(bid);
    return b ? brewCost(b.malt, b.hop, b.ings) : {};
};
// résumé sûr pour l'interface et le récapitulatif d'absence (plat unique, bière, ou commande multi-produits)
export function planInfo(p = planOf()) {
    if (!p) return null;
    const list = planEntries(p);
    if (p.label) return { icon: ['ui', 'loop'], title: p.label, multi: list.length > 1 || isBeerEntry(list[0]) };
    if (list.length === 1) {
        const e = list[0];
        if (isBeerEntry(e)) {
            const b = beerOf(e.bid);
            return {
                icon: ['ui', 'beer'],
                title: `${e.n} brassin${e.n > 1 ? 's' : ''} · ${b ? b.name : 'bière maison'}`,
                multi: false,
                beer: b || null,
            };
        }
        const name = ITEMS[e.id] ? ITEMS[e.id].name.toLowerCase() : e.id;
        return { icon: ['item', e.id], title: `${e.n} ${name}`, multi: false };
    }
    return { icon: ['ui', 'loop'], title: `Plan · ${list.length} produits`, multi: true };
}

// ce qui est en route sur les machines (en file ou prêt à ramasser)
export function coming(id) {
    let n = 0;
    for (const m of state.machines) {
        for (const q of m.queue) if (q === id) n += outQty(id);
        if (m.out && m.out[id]) n += m.out[id] * outQty(id);
    }
    return n;
}

// l'arbre d'un produit pour une quantité, stock et production en cours déduits
// noeud : { id, need, have, make (lancements à faire), raw, blocked, kids }
export function planTree(id, qty, pool = {}, depth = 0) {
    const avail = id in pool ? pool[id] : (ITEMS[id] ? (state.inventory[id] || 0) + coming(id) : ingHave(id));
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
// l'arbre d'un plat unique (ce qui reste à lancer)
export function rootFor(id, left) {
    const r = RECIPES[id];
    const root = { id, need: left, have: 0, make: left, raw: false, blocked: null, kids: [] };
    const pool = {};
    root.kids = Object.entries(r.ing).map(([k, n]) => planTree(k, n * left, pool, 1));
    return root;
}
// l'arbre unifié pour une liste d'entrées (plats et/ou bières maison) avec déduplication du stock partagé
export function treeForEntries(entries, extraRaws = []) {
    const pool = {};
    const kids = [];
    const targets = [];
    for (const e of entries) {
        const left = Math.max(0, (e.n || 0) - (e.queued || 0));
        if (!left) continue;
        if (isBeerEntry(e)) {
            const b = beerOf(e.bid);
            if (!b) continue;
            const cost = brewCost(b.malt, b.hop, b.ings);
            const ekids = Object.entries(cost).map(([k, q]) => planTree(k, q * left, pool, 1));
            kids.push(...ekids);
            targets.push({ kind: 'beer', bid: e.bid, make: left });
        } else if (RECIPES[e.id]) {
            const r = RECIPES[e.id];
            const ekids = Object.entries(r.ing).map(([k, q]) => planTree(k, q * left, pool, 1));
            kids.push(...ekids);
            targets.push({ kind: 'recipe', id: e.id, make: left });
        }
    }
    for (const x of extraRaws || []) {
        const miss = Math.max(0, x.n - (state.inventory[x.id] || 0));
        if (miss > 0) kids.push({ id: x.id, need: x.n, have: x.n - miss, make: 0, raw: true, missing: miss, blocked: null, kids: [] });
    }
    return { multi: true, targets, kids };
}
export function planNow() {
    const p = planOf();
    if (!p) return null;
    const list = planEntries(p);
    if (list.length === 1 && !isBeerEntry(list[0]) && !(p.raws && p.raws.length)) return rootFor(list[0].id, list[0].n - list[0].queued);
    return treeForEntries(list, p.raws);
}
// avant de lancer : ce que coûterait un plat, une bière, ou une liste d'entrées
export const prodPreview = (id, n) => planSummary(rootFor(id, n));
export const beerPreview = (bid, n) => planSummary(treeForEntries([{ kind: 'beer', bid, n, queued: 0 }]));
export const prodMultiPreview = (entries, extraRaws = []) => planSummary(treeForEntries(entries, extraRaws));

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
                if (x.blocked && !blocked.some(b => b.id === x.id)) blocked.push(x);
            }
        }),
    );
    const list = Object.entries(steps).map(([id, n]) => ({ id, n, machine: RECIPES[id].machine }));
    // une estimation : le temps de la machine la plus chargée, plus les produits finaux (ou les brassins)
    const load = {};
    list.forEach(s => (load[s.machine] = (load[s.machine] || 0) + (recipeTime(s.id) * s.n) / Math.max(1, slotsOf(s.machine))));
    let finTime = 0;
    if (tree.multi) {
        const finLoad = {};
        let vatTime = 0;
        for (const t of tree.targets) {
            if (t.kind === 'beer') {
                const b = beerOf(t.bid);
                if (b) vatTime += (brewTime(b.ings, b.malt) * t.make) / Math.max(1, vatCount());
            } else {
                const fin = RECIPES[t.id];
                if (fin) finLoad[fin.machine] = (finLoad[fin.machine] || 0) + (recipeTime(t.id) * t.make) / Math.max(1, slotsOf(fin.machine));
            }
        }
        finTime = Math.max(vatTime, 0, ...Object.values(finLoad));
    } else if (tree.id && RECIPES[tree.id]) {
        const fin = RECIPES[tree.id];
        finTime = (recipeTime(tree.id) * tree.make) / Math.max(1, slotsOf(fin.machine));
    }
    const time = Math.max(0, ...Object.values(load)) + finTime;
    return { steps: list, raws: Object.entries(raws).map(([id, n]) => ({ id, n })), blocked, time };
}

// ce que le plan garde de côté (pour qu'il ne parte pas au marché) ; calculé au plus une fois par demi-seconde
let resCache = null;
export function planReserve(id) {
    const p = planOf();
    if (!p) return 0;
    if (!resCache || resCache.p !== p || resCache.q !== p.queued || now() - resCache.t > 500) {
        const map = {};
        const t = planNow();
        if (t) {
            t.kids.forEach(k =>
                walk(k, x => {
                    const key = ITEMS[x.id] ? x.id : ingBase(x.id);
                    if (key) map[key] = (map[key] || 0) + x.have;
                }),
            );
        }
        resCache = { p, q: p.queued, t: now(), map };
    }
    return resCache.map[id] || 0;
}

// ---------------- les gestes ----------------
export function startPlan(id, n) {
    if (!plannable(id) || !(n > 0)) return false;
    state.plan = { id, n: Math.min(PLAN_MAX, Math.round(n)), queued: 0, at: now() };
    resCache = null;
    sfx('click');
    planTick(true);
    return true;
}
export function startBeerPlan(bid, n) {
    if (!brewPlannable(bid) || !(n > 0)) return false;
    const qty = Math.min(PLAN_MAX, Math.round(n));
    state.plan = {
        id: 'beer:' + bid,
        n: qty,
        queued: 0,
        at: now(),
        items: [{ kind: 'beer', bid, n: qty, queued: 0 }],
    };
    resCache = null;
    sfx('click');
    planTick(true);
    return true;
}
// lance un plan multi-produits (plats et/ou bières) ; hors commande, limité par le Tableau d'intendance du domaine
export function startMultiPlan(entries, opts = {}) {
    if (!Array.isArray(entries) || !entries.length) return false;
    const merged = [];
    for (const raw of entries) {
        const qty = Math.min(PLAN_MAX, Math.round(raw.n || 0));
        if (!(qty > 0)) continue;
        if (raw.kind === 'beer' || raw.bid) {
            const bid = raw.bid || raw.id;
            if (!brewPlannable(bid)) continue;
            const prev = merged.find(x => x.kind === 'beer' && x.bid === bid);
            if (prev) prev.n = Math.min(PLAN_MAX, prev.n + qty);
            else merged.push({ kind: 'beer', bid, n: qty, queued: 0 });
        } else {
            if (!plannable(raw.id)) continue;
            const prev = merged.find(x => x.kind === 'recipe' && x.id === raw.id);
            if (prev) prev.n = Math.min(PLAN_MAX, prev.n + qty);
            else merged.push({ kind: 'recipe', id: raw.id, n: qty, queued: 0 });
        }
    }
    if (!merged.length) return false;
    const cap = opts.order ? merged.length : planCap();
    const items = merged.slice(0, cap);
    if (items.length === 1 && items[0].kind === 'recipe' && !opts.label && !(opts.raws && opts.raws.length)) {
        return startPlan(items[0].id, items[0].n);
    }
    const first = items[0];
    const total = items.reduce((a, x) => a + x.n, 0);
    state.plan = {
        id: first.kind === 'beer' ? 'beer:' + first.bid : first.id,
        n: total,
        queued: 0,
        at: now(),
        ...(opts.label ? { label: opts.label } : {}),
        ...(opts.raws && opts.raws.length ? { raws: opts.raws.map(r => ({ id: r.id, n: r.n })) } : {}),
        items,
    };
    resCache = null;
    sfx('click');
    planTick(true);
    return true;
}
export function stopPlan() {
    if (!state.plan) return false;
    state.plan = null;
    resCache = null;
    return true;
}

// ---------------- planifier toute une commande en 1 clic ----------------
function buildOrderPlan(label, lines) {
    const need = {};
    for (const x of lines) {
        if (!x || !x.id || !(x.qty > 0)) continue;
        need[x.id] = (need[x.id] || 0) + x.qty;
    }
    const items = [];
    const raws = [];
    const blocked = [];
    for (const [id, qty] of Object.entries(need)) {
        const miss = Math.max(0, qty - (state.inventory[id] || 0));
        if (!miss) continue;
        if (plannable(id)) {
            items.push({ kind: 'recipe', id, n: Math.min(PLAN_MAX, Math.ceil(miss / outQty(id))) });
        } else if (RECIPES[id]) {
            blocked.push({ id, n: miss });
        } else if (ITEMS[id]) {
            raws.push({ id, n: qty });
        }
    }
    return { label, items, raws, blocked };
}
export function orderPlanData(kind, ref) {
    if (kind === 'train') {
        const t = state.truck;
        if (!t || t.status !== 'here') return null;
        return buildOrderPlan(
            'Train de marchandises',
            t.slots.filter(sl => !sl.loaded && !sl.pk).map(sl => ({ id: sl.id, qty: sl.qty })),
        );
    }
    if (kind === 'balloon') {
        const b = state.balloon;
        if (!b || b.status !== 'here') return null;
        return buildOrderPlan('Montgolfière', b.items || []);
    }
    if (kind === 'boat') {
        const b = state.boat;
        if (!b || b.status !== 'here') return null;
        return buildOrderPlan('Bateau de livraison', b.items || []);
    }
    if (kind === 'project') {
        const p = PROJECTS[ref];
        if (!p || !projectOpen(ref) || projectDone(ref)) return null;
        const lines = Object.entries(p.need)
            .map(([id, n]) => ({ id, qty: Math.max(0, n - givenOf(ref, id)) }))
            .filter(x => x.qty > 0);
        return buildOrderPlan(`Chantier · ${p.name}`, lines);
    }
    if (kind === 'quest') {
        const q = state.quests && state.quests[ref];
        if (!isOpen(q)) return null;
        const v = VILLAGERS[q.vid];
        return buildOrderPlan(`Commande de ${v ? v.name : 'villageois'}`, q.items || []);
    }
    return null;
}
export const canPlanOrder = (kind, ref) => {
    const d = orderPlanData(kind, ref);
    return !!(d && d.items.length);
};
export function startOrderPlan(kind, ref) {
    const d = orderPlanData(kind, ref);
    if (!d || !d.items.length) return false;
    const ok = startMultiPlan(d.items, { label: d.label, raws: d.raws, order: true });
    if (ok && view.started) toast(`Plan lancé : ${d.label}`, ['ui', 'loop']);
    return ok;
}

// une entrée du plan peut-elle partir maintenant ?
export function entryReady(e) {
    if (!e) return false;
    const left = (e.n || 0) - (e.queued || 0);
    if (left <= 0) return true;
    if (isBeerEntry(e)) {
        const cost = beerCostOf(e.bid);
        return Object.entries(cost).every(([k, q]) => ingHave(k) >= q);
    }
    const r = RECIPES[e.id];
    return !!r && Object.entries(r.ing).every(([k, n]) => (state.inventory[k] || 0) >= n * left);
}
// le plat final peut-il partir en entier (compatibilité : vrai si au moins une cible en attente est prête) ?
export function finalReady() {
    const p = planOf();
    if (!p) return false;
    const list = planEntries(p);
    return list.some(e => e.queued < e.n && (e.go || entryReady(e)));
}

// ---------------- le tick (toutes les 3 secondes) ----------------
let last = 0;
export function planTick(force) {
    const p = planOf();
    if (!p) return false;
    if (!force && now() - last < 3000) return false;
    last = now();
    let ch = false;
    const list = planEntries(p);
    const tree = planNow();
    const parts = new Set();
    if (tree) tree.kids.forEach(k => walk(k, x => !x.raw && parts.add(x.id)));
    // 1. on ramasse ce que les machines ont fait pour le plan
    state.machines.forEach((m, i) => {
        if (m.out && Object.keys(m.out).some(k => m.out[k] > 0 && parts.has(k)) && collectMachine(i, null, true)) ch = true;
    });
    // 2. les produits finaux (et brassins) prêts à partir
    for (const e of list) {
        if (e.queued >= e.n) continue;
        if (isBeerEntry(e)) {
            if (!brewPlannable(e.bid)) continue;
            const B = ensureBrew();
            const rec = recipeOf(e.bid);
            while (e.queued < e.n && entryReady(e)) {
                if (!B.vats.some(v => !v)) {
                    const rdy = B.vats.findIndex(v => v && v.bid === e.bid && vatReady(v));
                    if (rdy >= 0 && collectVat(rdy)) ch = true;
                    else break;
                }
                if (startBrew(null, rec, true)) {
                    e.queued++;
                    ch = true;
                } else break;
            }
        } else {
            if (!e.go && entryReady(e)) e.go = true;
            if (e.go && RECIPES[e.id]) {
                state.machines.forEach((m, i) => {
                    while (e.queued < e.n && m.type === RECIPES[e.id].machine && queueQuiet(i, e.id)) {
                        e.queued++;
                        ch = true;
                    }
                });
            }
        }
    }
    if (Array.isArray(p.items)) p.queued = list.reduce((a, e) => a + e.queued, 0);
    if (list.every(e => e.queued >= e.n)) {
        const info = planInfo(p);
        state.stats.plans = (state.stats.plans || 0) + 1;
        if (view.started && info) toast(`Plan terminé : ${info.title}`, info.icon);
        sfx('level');
        state.plan = null;
        resCache = null;
        return true;
    }
    // si toutes les cibles restantes sont déjà en train d'être lancées (go), plus besoin de préparer d'étapes
    if (list.every(e => e.queued >= e.n || (!isBeerEntry(e) && e.go))) return ch;
    // 3. les étapes : du plus profond au plus proche, sur les machines libres
    const freshTree = planNow();
    const steps = [];
    const visit = (x, d) => {
        x.kids.forEach(k => visit(k, d + 1));
        if (!x.raw && x.make && !x.blocked) steps.push({ id: x.id, n: x.make, d });
    };
    if (freshTree) freshTree.kids.forEach(k => visit(k, 1));
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
