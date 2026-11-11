// 1.85 : les plans du champ (main-d'œuvre : 50 pièces par replantage, +10 tous les 5 niveaux après le 28). On enregistre la disposition de ses cultures, et un clic replante tout au même endroit.
// Une amélioration de ferme (Plan du champ) ouvre 1 emplacement, puis 3, puis 6. Les graines se paient comme d'habitude
// (en stock d'abord, achetées sinon) ; un plan ne remplace jamais ce qui pousse déjà, et ne laboure pas.
import { state, lvOk } from '../core/state.js';
import { s } from '../core/format.js';
import { emit, toast, sfx, buzz, float, squish, changed } from '../core/bus.js';
import { ITEMS } from '../data/items.js';
import { getPlot, allPlots, resetPlot } from './farm.js';
import { storyOk } from './story.js';
import { preferSeed, varSelfWater } from './genetics.js';
import { tip } from './tips.js';
import { ecoLvl } from '../core/state.js';

export const PLAN_SLOTS = [0, 1, 3, 6];
export const planSlots = () => PLAN_SLOTS[Math.min(state.upgrades.plan || 0, PLAN_SLOTS.length - 1)];
export const planOpen = () => planSlots() > 0;
const list = () => (state.plans ||= []);
export const planAt = k => (k >= 0 && k < planSlots() && list()[k]) || null;

// un plan : { name, c: { index de la parcelle: culture }, rows } ; les parcelles de la serre ont l'index 1000 + k
export function savePlan(k, at) {
    if (k < 0 || k >= planSlots()) return false;
    const c = {};
    for (const [p, i] of allPlots()) {
        const d = p.isUnlocked && p.itemId && ITEMS[p.itemId];
        if (d && d.type === 'crop' && !d.island) c[i] = p.itemId;
    }
    const n = Object.keys(c).length;
    if (!n) {
        toast('Rien de planté à enregistrer : semez d’abord votre disposition', ['ui', 'plan']);
        sfx('error');
        return false;
    }
    const old = list()[k];
    list()[k] = { name: (old && old.name) || `Plan ${k + 1}`, c, rows: state.grid.length };
    sfx('level');
    buzz(15);
    if (at) float(at, [`${n} parcelle${s(n)} enregistrée${s(n)}`], 'gold', -20);
    tip('plans');
    changed('farm');
    return true;
}

export function renamePlan(k, name) {
    const p = planAt(+k);
    name = String(name || '')
        .trim()
        .slice(0, 22);
    if (!p || !name) return false;
    p.name = name;
    return true;
}

export function clearPlan(k) {
    if (!planAt(k)) return false;
    list()[k] = null;
    changed('farm');
    return true;
}

// la main-d'œuvre d'un replantage : 50 pièces au niveau 28, 10 de plus tous les 5 niveaux
export const planFee = () => 50 + 10 * Math.max(0, Math.floor((ecoLvl() - 28) / 5));

// peut-on semer cette culture maintenant (graines en stock, ou de quoi les acheter) avec cet argent ?
function canSow(id, money = state.money, stock = state.seeds[id] || 0) {
    const d = ITEMS[id];
    if (!d || d.island) return false;
    if ((!lvOk(d) || !storyOk(d)) && !(stock > 0)) return false;
    return stock > 0 || (d.type === 'crop' && !d.exotic && money >= d.cost);
}

// ce que le plan ferait aujourd'hui : { sow, busy, plow, lack: { culture: n } }
export function planPreview(k) {
    const pl = planAt(k);
    const r = { sow: 0, busy: 0, plow: 0, lack: {}, total: 0, fee: 0, seeds: 0 };
    if (!pl) return r;
    const seeds = { ...state.seeds };
    let money = state.money - planFee();
    for (const key of Object.keys(pl.c).sort((a, b) => a - b)) {
        const i = +key,
            id = pl.c[key],
            p = getPlot(i),
            d = ITEMS[id];
        r.total++;
        if (!p || !p.isUnlocked || p.itemId) {
            r.busy++;
            continue;
        }
        if (i < 1000 && p.terrain !== 'plowed') {
            r.plow++;
            continue;
        }
        if (i < 1000 && d.ghOnly) {
            r.busy++;
            continue;
        }
        if (!canSow(id, money, seeds[id] || 0)) {
            r.lack[id] = (r.lack[id] || 0) + 1;
            continue;
        }
        if (seeds[id] > 0) seeds[id]--;
        else {
            money -= d.cost;
            r.seeds += d.cost;
        }
        r.sow++;
    }
    if (r.sow) r.fee = planFee();
    if (state.money < planFee()) r.noFee = true;
    return r;
}

// replante le plan sur les parcelles vides et labourées
export function applyPlan(k, at) {
    const pl = planAt(k);
    if (!pl) return null;
    const out = { sow: 0, busy: 0, plow: 0, lack: {}, spent: 0, fee: 0 };
    const before = state.money;
    if (state.money < planFee()) {
        toast(`Il faut ${planFee()} pièces de main-d’œuvre pour replanter`, ['ui', 'coin']);
        sfx('error');
        return null;
    }
    state.money -= planFee();
    out.fee = planFee();
    for (const key of Object.keys(pl.c).sort((a, b) => a - b)) {
        const i = +key,
            id = pl.c[key],
            p = getPlot(i),
            d = ITEMS[id];
        if (!p || !p.isUnlocked || p.itemId) {
            out.busy++;
            continue;
        }
        if (i < 1000 && p.terrain !== 'plowed') {
            out.plow++;
            continue;
        }
        if (i < 1000 && d.ghOnly) {
            out.busy++;
            continue;
        }
        if (!canSow(id)) {
            out.lack[id] = (out.lack[id] || 0) + 1;
            continue;
        }
        if (state.seeds[id] > 0) state.seeds[id]--;
        else state.money -= d.cost;
        resetPlot(p, id);
        if (i >= 1000) p.isWatered = true;
        const pv = d.type === 'crop' && preferSeed(id);
        if (pv) {
            p.v = pv;
            if (varSelfWater(pv)) p.isWatered = true;
        }
        emit('plotFx', { i, kind: 'sparkle', delay: out.sow * 30 });
        out.sow++;
    }
    if (!out.sow) state.money += out.fee;
    out.spent = Math.max(0, before - state.money);
    if (!out.sow) out.fee = 0;
    if (out.sow) {
        sfx('plant');
        buzz(15);
        if (at) float(at, [`${out.sow} semée${s(out.sow)}`], 'gold', -20);
        changed('farm');
    } else squish(at);
    const lack = Object.values(out.lack).reduce((a, b) => a + b, 0);
    const why = [
        out.busy ? `${out.busy} déjà occupée${s(out.busy)}` : '',
        out.plow ? `${out.plow} à labourer` : '',
        lack ? `${lack} sans graines ni pièces` : '',
        out.fee ? `main-d’œuvre ${out.fee} pièces` : '',
    ].filter(Boolean);
    toast(
        out.sow
            ? `${pl.name} : ${out.sow} parcelle${s(out.sow)} semée${s(out.sow)}${why.length ? ' · ' + why.join(', ') : ''}`
            : `${pl.name} : rien à semer${why.length ? ' · ' + why.join(', ') : ''}`,
        ['ui', 'plan'],
    );
    return out;
}
