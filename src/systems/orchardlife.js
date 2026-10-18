// 1.13 et 1.14 : les saisons du verger (gelée, grande cueillette) et sa vie (carnet, concours du panier, fête du cidre).
import { state } from '../core/state.js';
import { now } from '../core/clock.js';
import { view } from '../core/view.js';
import { round5 } from '../core/format.js';
import { toast, sfx, emit } from '../core/bus.js';
import { ITEMS } from '../data/items.js';
import { DAYS_PER_SEASON } from '../data/world.js';
import { RIVALS } from '../data/village.js';
import { GRAFTS, TREE_SEASON, FROST, HARVEST, ORCHARD_LOG, BASKET_CONTEST, CIDER_FETE } from '../data/orchard.js';
import { earn, addXp } from './player.js';
import { addFriendship } from './village.js';
import { season, dayInSeason, hour } from './world.js';
import { clampQuality } from './farm.js';
import { fishWeek, isWeekend, weekendEnd } from './fishing.js';
import { slotsOf, treeStage, matOf, onTreePick, livingTrees } from './orchard.js';
import { rollRareGraft } from './orchardplus.js';

const seasonIdx = () => Math.floor((state.day - 1) / DAYS_PER_SEASON);
const hash = n => {
    let h = (n * 2654435761) >>> 0;
    h ^= h >>> 15;
    return (h * 2246822519) >>> 0;
};
function rng(seed) {
    let a = seed >>> 0;
    return () => {
        a = (a + 0x6d2b79f5) >>> 0;
        let t = a;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}
const orch = () => state.orchard;
const farmTrees = () => slotsOf('farm').filter(x => x.tree && treeStage(x.tree) !== 'dead');
const seasonTrees = sid =>
    Object.values(ITEMS)
        .filter(d => d.type === 'tree' && !d.island && TREE_SEASON[d.id] === sid && d.reqLvl <= state.level)
        .sort((a, b) => a.reqLvl - b.reqLvl);
const giveGraft = gid => {
    state.inventory[GRAFTS[gid].item] = (state.inventory[GRAFTS[gid].item] || 0) + 1;
    return GRAFTS[gid].name.toLowerCase();
};

// ---------------- la gelée de printemps ----------------
export const frostOpen = () => state.level >= FROST.lvl;
function ensureFrost() {
    if (!frostOpen() || season().id !== 'printemps') return orch().frost || null;
    const o = orch(),
        s = seasonIdx();
    if (!o.frost || o.frost.s !== s) {
        const h = hash(s + 11);
        o.frost = { s, on: h % 2 === 0, day: 5 + ((h >> 4) % 6), lit: 0, done: false, warned: false };
    }
    return o.frost;
}
// 'warn' pendant les deux jours avant et le jour dit jusqu'à la fin de soirée
export function frostStatus() {
    const f = ensureFrost();
    if (!f || !f.on || f.done || f.s !== seasonIdx()) return null;
    const d = dayInSeason();
    if (d >= f.day - FROST.warnDays && d <= f.day) return 'warn';
    return null;
}
export const torchStock = () => state.inventory[FROST.torch] || 0;
export const torchNeed = () => Math.ceil(farmTrees().length / FROST.cover);
export function lightTorches(at) {
    const f = orch().frost;
    if (!f || frostStatus() !== 'warn' || f.lit) return false;
    const n = Math.min(torchStock(), torchNeed());
    if (!n) {
        sfx('error');
        toast('Il faut des torches de résine (la scierie, ou l’atelier)', ['item', FROST.torch]);
        return false;
    }
    state.inventory[FROST.torch] -= n;
    f.lit = n * FROST.cover;
    sfx('level');
    toast(`${n} torche${n > 1 ? 's' : ''} allumée${n > 1 ? 's' : ''} : ${Math.min(f.lit, farmTrees().length)} arbres protégés`, ['item', FROST.torch]);
    void at;
    return true;
}
// la gelée tombe : les arbres non protégés perdent quelques fruits (jamais l'arbre)
function frostHit(auto) {
    const f = orch().frost;
    if (auto && !f.lit && torchStock()) {
        const n = Math.min(torchStock(), torchNeed());
        state.inventory[FROST.torch] -= n;
        f.lit = n * FROST.cover;
    }
    let hit = 0;
    farmTrees().forEach((sl, i) => {
        if (i < f.lit) return;
        sl.tree.ground = Math.max(0, sl.tree.ground - FROST.loss);
        sl.tree.prog = 0;
        hit++;
    });
    f.done = true;
    f.hit = hit;
    if (view.started)
        toast(hit ? `La gelée a touché ${hit} arbre${hit > 1 ? 's' : ''} : quelques fruits perdus` : 'La gelée n’a fait aucun dégât, bravo !', [
            'item',
            FROST.torch,
        ]);
    return hit;
}
function frostTick(auto) {
    const o = orch();
    if (!frostOpen()) return false;
    const f = ensureFrost();
    if (!f) return false;
    let ch = false;
    if (f.on && !f.done) {
        const cur = seasonIdx();
        const sid = season().id;
        if (cur > f.s || (sid === 'printemps' && (dayInSeason() > f.day || (dayInSeason() === f.day && hour() >= FROST.hitHour)))) {
            frostHit(auto);
            ch = true;
        } else if (!f.warned && frostStatus() === 'warn') {
            f.warned = true;
            ch = true;
            if (view.started) toast('Gelée en vue au verger ! Allumez des torches de résine avant la fin du jour', ['item', FROST.torch]);
        }
    }
    void o;
    return ch;
}

// ---------------- la grande cueillette d'automne ----------------
export const harvestOpen = () => state.level >= HARVEST.lvl;
export const harvestActive = () => harvestOpen() && season().id === 'automne' && dayInSeason() >= HARVEST.from;
function ensureHarvest() {
    const o = orch();
    if (!harvestActive()) return o.cueil || null;
    const s = seasonIdx();
    if (!o.cueil || o.cueil.s !== s) {
        const list = seasonTrees('automne');
        const pick = [...list.filter(d => livingTrees(d.id) > 0), ...list.filter(d => !livingTrees(d.id))].slice(0, 2);
        if (!pick.length) return o.cueil || null;
        const base = Math.round(HARVEST.base + state.level * HARVEST.per);
        o.cueil = { s, need: Object.fromEntries(pick.map((d, k) => [d.id, k ? Math.round(base * 0.7) : base])), got: {}, claimed: false };
    }
    return o.cueil;
}
export const harvestState = () => ensureHarvest();
export const harvestDone = c => !!c && Object.keys(c.need).every(id => (c.got[id] || 0) >= c.need[id]);
export const harvestReady = () => !!(orch().cueil && !orch().cueil.claimed && harvestDone(orch().cueil));
export const harvestReward = () => ({ coins: round5(HARVEST.coins(state.level)), xp: HARVEST.xp(state.level) });
export function claimHarvest(at) {
    const c = orch().cueil;
    if (!c || c.claimed || !harvestDone(c)) return false;
    c.claimed = true;
    const r = harvestReward();
    earn(r.coins, at);
    addXp(r.xp, at);
    const g = rollRareGraft(1);
    toast(`Grande cueillette réussie : un ${giveGraft(g)} en cadeau !`, ['item', GRAFTS[g].item]);
    state.stats.harvestsDone = (state.stats.harvestsDone || 0) + 1;
    sfx('level');
    emit('confetti');
    return true;
}

// ---------------- le carnet du verger ----------------
export const logOpen = () => state.level >= ORCHARD_LOG.lvl;
export const logOf = id => (orch().log && orch().log[id]) || null;
export const logIds = () => Object.keys(orch().log || {}).sort((a, b) => ITEMS[a].reqLvl - ITEMS[b].reqLvl);
export const logStep = id => {
    const l = logOf(id);
    return l ? ORCHARD_LOG.steps.filter(s => l.n >= s).length : 0;
};
export const logCan = id => logStep(id) > ((orch().logClaimed && orch().logClaimed[id]) || 0);
export const logReady = () => logOpen() && logIds().some(logCan);
export function claimLog(id, at) {
    if (!logCan(id)) return false;
    const o = orch();
    o.logClaimed = o.logClaimed || {};
    const k = o.logClaimed[id] || 0;
    o.logClaimed[id] = k + 1;
    earn(ORCHARD_LOG.coins[k], at);
    sfx('level');
    toast(`Carnet du verger : médaille ${['de bronze', 'd’argent', 'd’or'][k]} pour le ${ITEMS[id].seedName.toLowerCase()}`, ['item', id]);
    return true;
}

// ---------------- le concours du plus beau panier ----------------
export const basketOpen = () => state.level >= BASKET_CONTEST.lvl;
export function basketId(week = fishWeek()) {
    let list = seasonTrees(season().id);
    if (!list.length) list = seasonTrees('automne');
    if (!list.length) list = [ITEMS.apple];
    return list[(week * 7) % list.length].id;
}
export function basketRivals(c, t = now()) {
    const end = weekendEnd(c.endAt ? c.endAt - 1 : t);
    const progress = Math.min(1, Math.max(0.35, 1 - (end - t) / (2 * 86400000)));
    const top = 50 + state.level * 4;
    return RIVALS.map((r, k) => {
        const rnd = rng(c.week * 1000 + k + 5);
        const frac = Math.min(0.97, Math.max(0.2, 0.3 + rnd() * 0.5 + (r.f - 0.75) * 0.25));
        return { name: r.name, owner: r.owner, avatar: r.avatar, w: Math.round(top * frac * progress) };
    });
}
export const basketRank = (c, t) => (c.score ? 1 + basketRivals(c, t).filter(r => r.w > c.score).length : 0);
function basketTick() {
    if (!basketOpen()) return false;
    const o = orch(),
        wk = fishWeek();
    let ch = false;
    if (o.contest && o.contest.week !== wk) {
        const c = o.contest,
            end = weekendEnd(c.startAt || 0);
        if (c.score > 0)
            o.lastContest = { ...c, endAt: end, rank: basketRank({ ...c, endAt: end }, end), rivals: basketRivals({ ...c, endAt: end }, end), seen: false };
        o.contest = null;
        ch = true;
    }
    if (!o.contest && isWeekend()) {
        o.contest = { week: wk, id: basketId(wk), score: 0, startAt: now() };
        if (view.started) toast(`Concours du plus beau panier ce week-end : ${ITEMS[o.contest.id].name.toLowerCase()} !`, ['item', o.contest.id]);
        ch = true;
    }
    return ch;
}
export const basketPrize = rank => {
    const pz = BASKET_CONTEST.prize[rank - 1];
    return { coins: pz ? round5(pz.coins(state.level)) : 0, rubans: pz ? pz.rubans : 0, graft: pz ? pz.graft : 0, xp: BASKET_CONTEST.xp(state.level) };
};
export const basketResultReady = () => !!(orch().lastContest && !orch().lastContest.seen);
export function claimBasket(at) {
    const c = orch().lastContest;
    if (!c || c.seen) return false;
    c.seen = true;
    const g = basketPrize(c.rank);
    if (g.coins) earn(g.coins, at);
    if (g.rubans) state.prestige.rubans += g.rubans;
    addXp(g.xp, at);
    const gid = g.graft ? rollRareGraft(g.graft) : null;
    if (gid) toast(`Un ${giveGraft(gid)} pour la ${c.rank === 1 ? 'victoire' : 'place d’honneur'} !`, ['item', GRAFTS[gid].item]);
    if (c.rank === 1) {
        state.stats.basketContests = (state.stats.basketContests || 0) + 1;
        emit('confetti');
    }
    sfx(c.rank <= 3 ? 'level' : 'pop');
    return true;
}

// ---------------- la fête du cidre ----------------
export const feteOpen = () => state.level >= CIDER_FETE.lvl;
export const feteActive = () => feteOpen() && season().id === 'automne';
export function feteState() {
    const o = orch();
    if (!feteActive()) return o.fete && o.fete.s === seasonIdx() ? o.fete : null;
    const s = seasonIdx();
    if (!o.fete || o.fete.s !== s) {
        const extra = Math.floor(state.level / 3);
        o.fete = { s, need: { apple: CIDER_FETE.need[0] + extra, pear: CIDER_FETE.need[1] + extra }, given: {}, claimed: false };
    }
    return o.fete;
}
export const feteDone = f => !!f && Object.keys(f.need).every(id => (f.given[id] || 0) >= f.need[id]);
export const feteReady = () => {
    const f = orch().fete;
    return !!(f && f.s === seasonIdx() && !f.claimed && feteDone(f));
};
export function giveFete(id, at) {
    const f = feteState();
    if (!f || f.claimed || !f.need[id]) return false;
    const n = Math.min(state.inventory[id] || 0, f.need[id] - (f.given[id] || 0));
    if (n <= 0) {
        sfx('error');
        return false;
    }
    state.inventory[id] -= n;
    clampQuality(id);
    f.given[id] = (f.given[id] || 0) + n;
    sfx('pop');
    void at;
    if (feteDone(f) && view.started) toast('La pressée est prête ! Récupérez vos bouteilles', ['item', 'cider']);
    return true;
}
export const feteReward = () => ({ coins: round5(CIDER_FETE.coins(state.level)), xp: CIDER_FETE.xp(state.level), cider: CIDER_FETE.cider });
export function claimFete(at) {
    const f = orch().fete;
    if (!f || f.claimed || !feteDone(f)) return false;
    f.claimed = true;
    const r = feteReward();
    earn(r.coins, at);
    addXp(r.xp, at);
    state.inventory.cider = (state.inventory.cider || 0) + r.cider;
    addFriendship('odile', CIDER_FETE.hearts, at);
    state.stats.fetes = (state.stats.fetes || 0) + 1;
    sfx('level');
    emit('confetti');
    return true;
}

// ---------------- à chaque cueillette ----------------
onTreePick((t, qty, silver, gold) => {
    const o = orch();
    if (!o.log) o.log = {};
    const l = (o.log[t.id] = o.log[t.id] || { n: 0, best: 0, gold: 0, old: 0 });
    l.n += qty;
    l.best = Math.max(l.best, qty);
    l.gold += gold;
    l.old = Math.max(l.old, matOf(t));
    if (o.cueil && !o.cueil.claimed && o.cueil.s === seasonIdx() && o.cueil.need[t.id]) {
        o.cueil.got[t.id] = (o.cueil.got[t.id] || 0) + qty;
        if (harvestDone(o.cueil) && view.started) toast('Grande cueillette : le panier est plein ! Passez au verger', ['item', t.id]);
    }
    const c = o.contest;
    if (c && c.id === t.id && isWeekend() && c.week === fishWeek()) {
        const w = BASKET_CONTEST.weight;
        c.score += (qty - silver - gold) * w[0] + silver * w[1] + gold * w[2];
    }
});

// à chaque seconde, et au retour (auto : les torches s'allument seules si on en a)
export function lifeTick() {
    let ch = false;
    if (frostTick(false)) ch = true;
    if (harvestOpen()) ensureHarvest();
    if (feteOpen()) feteState();
    if (basketTick()) ch = true;
    return ch;
}
export function lifeAfterOffline() {
    frostTick(true);
    lifeTick();
}
