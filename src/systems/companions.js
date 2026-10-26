// Les cultures compagnes (1.25) : les associations entre parcelles voisines, leurs effets, le carnet du potager
// et le conseil de Mamie. Les effets passent par farm.js (pousse, qualité, récolte) et incidents.js (nuisibles).
import { state } from '../core/state.js';
import { now } from '../core/clock.js';
import { dateKey, pickRand } from '../core/format.js';
import { emit, toast, sfx, buzz } from '../core/bus.js';
import { ITEMS } from '../data/items.js';
import { COLS } from '../data/farm.js';
import { OASIS } from '../data/oasis.js';
import { NORD } from '../data/nord.js';
import { ASSOCS, ASSOC, COMP_LVL, COMP_FX, COMP_CAP, COMP_TIERS, MAMIE, isBad } from '../data/companions.js';
import { earn, addXp } from './player.js';
import { tip } from './tips.js';

export const compOpen = () => state.level >= COMP_LVL;
export function ensureComp() {
    const c = (state.compan ||= { seen: {}, tiers: 0, defi: null, found: 0 });
    c.seen ||= {};
    return c;
}
// le niveau où une association devient possible : la plus tardive de ses cultures (la plus précoce d'une famille)
const lvOfList = l => Math.min(...l.map(id => (ITEMS[id] ? ITEMS[id].reqLvl : 99)));
export const assocLvl = a => Math.max(COMP_LVL, lvOfList(a.a), a.b === '*' ? 0 : lvOfList(a.b), a.c ? lvOfList(a.c) : 0);

// ---------------- la géométrie : les voisines d'une parcelle (champ : 6 colonnes, serre : 4) ----------------
const GH_COLS = 4;
// 1.48 : les cases de l'oasis (indices à partir de 2000, 4 colonnes)
export const OASIS_BASE = 2000;
// 1.51 : les cases du Grand Nord (indices à partir de 3000, 4 colonnes)
export const NORD_BASE = 3000;
const zoneOf = i =>
    i >= NORD_BASE
        ? { list: (state.nord && state.nord.plots) || [], cols: NORD.cols, k: i - NORD_BASE, base: NORD_BASE, oasis: true }
        : i >= OASIS_BASE
          ? { list: (state.oasis && state.oasis.plots) || [], cols: OASIS.cols, k: i - OASIS_BASE, base: OASIS_BASE, oasis: true }
          : i >= 1000
            ? { list: state.greenhouse.plots, cols: GH_COLS, k: i - 1000, base: 1000 }
            : { list: state.grid, cols: COLS, k: i, base: 0 };
export function compNeighbors(i) {
    const { list, cols, k, base } = zoneOf(i);
    const out = [];
    const r = Math.floor(k / cols),
        c = k % cols;
    if (c > 0) out.push(k - 1);
    if (c < cols - 1 && k + 1 < list.length) out.push(k + 1);
    if (r > 0) out.push(k - cols);
    if (k + cols < list.length) out.push(k + cols);
    return out.map(j => base + j);
}
// la culture d'une parcelle (ou celle qu'on vient d'y récolter : « Tout récolter » ne casse pas les associations)
export function cropAt(i) {
    const { list, k, oasis } = zoneOf(i);
    const p = list[k];
    if (oasis) {
        if (!p || !p.open) return null;
        if (p.id) return p.id;
        return p.lastCrop && now() - (p.lastAt || 0) < 4000 ? p.lastCrop : null;
    }
    if (!p || p.isUnlocked === false) return null;
    if (p.itemId && ITEMS[p.itemId] && ITEMS[p.itemId].type === 'crop') return p.itemId;
    if (p.lastCrop && now() - (p.lastAt || 0) < 4000) return p.lastCrop;
    return null;
}
const has = (l, id) => l === '*' || l.includes(id);
// les associations de deux cultures voisines, vues depuis `me` : celles dont `me` profite (ou souffre)
export function pairAssocs(me, other) {
    if (!me || !other || me === other) return [];
    return ASSOCS.filter(a => {
        if (a.fx === 't' || state.level < assocLvl(a)) return false;
        const ab = has(a.a, me) && has(a.b, other),
            ba = has(a.a, other) && has(a.b, me);
        if (a.to === 'b') return ba && !has(a.a, me); // seule la seconde en profite
        return ab || ba;
    });
}
// les trois sœurs : la parcelle et ses voisines réunissent maïs, haricot et citrouille
const TRIO = ASSOC.troisSoeurs;
const trioSet = [...TRIO.a, ...TRIO.b, ...TRIO.c];
export function inTrio(i) {
    const me = cropAt(i);
    if (!me || !trioSet.includes(me) || state.level < assocLvl(TRIO)) return false;
    const around = new Set([me, ...compNeighbors(i).map(cropAt)]);
    return trioSet.every(id => around.has(id));
}
// toutes les associations actives sur une parcelle (une seule fois chacune)
export function plotAssocs(i) {
    if (!compOpen()) return [];
    const me = cropAt(i);
    if (!me) return [];
    const ids = new Set();
    for (const j of compNeighbors(i)) pairAssocs(me, cropAt(j)).forEach(a => ids.add(a.id));
    if (inTrio(i)) ids.add('troisSoeurs');
    return [...ids].map(id => ASSOC[id]);
}
export function plotFx(i) {
    const fx = { speed: 0, quality: 0, extra: 0, pest: 1 };
    for (const a of plotAssocs(i)) {
        const e = COMP_FX[a.fx];
        fx.speed += e.speed || 0;
        fx.quality += e.quality || 0;
        fx.extra += e.extra || 0;
        if (e.pest) fx.pest *= e.pest;
    }
    const cl = (x, [lo, hi]) => Math.max(lo, Math.min(hi, x));
    fx.speed = cl(fx.speed, COMP_CAP.speed);
    fx.quality = cl(fx.quality, COMP_CAP.quality);
    fx.extra = cl(fx.extra, COMP_CAP.extra);
    fx.pest = cl(fx.pest, COMP_CAP.pest);
    return fx;
}
export const compSpeed = i => 1 + plotFx(i).speed;
// le lien entre deux parcelles voisines, pour la feuille dessinée entre elles : 'good', 'bad', 'mix' ou ''
export function linkKind(i, j) {
    if (!compOpen()) return '';
    const a = cropAt(i),
        b = cropAt(j);
    const l = [...pairAssocs(a, b), ...pairAssocs(b, a)];
    if (!l.length) return '';
    const bad = l.some(isBad),
        good = l.some(x => !isBad(x));
    return bad && good ? 'mix' : bad ? 'bad' : 'good';
}

// ---------------- la récolte : découvertes et conseil de Mamie ----------------
export function compHarvest(i) {
    if (!compOpen()) return [];
    const list = plotAssocs(i);
    if (!list.length) return [];
    const c = ensureComp();
    const fresh = list.filter(a => !c.seen[a.id]);
    fresh.forEach(a => (c.seen[a.id] = 1));
    if (fresh.length) {
        c.found = Object.keys(c.seen).length;
        sfx('pop');
        toast(`Carnet du potager : ${fresh.map(a => a.name.toLowerCase()).join(', ')}${fresh.some(isBad) ? ' (à éviter !)' : ''}`, ['ui', 'cpCarnet']);
        tip('companions');
        emit('changed', 'compan');
    }
    const d = mamieDefi();
    if (d && !d.done && list.some(a => a.id === d.id)) {
        d.got = Math.min(d.need, d.got + 1);
        if (d.got >= d.need) {
            d.done = true;
            toast('Mamie est ravie : conseil suivi ! Récupérez la récompense au champ', ['villager', 'odette']);
        }
        emit('changed', 'compan');
    }
    return fresh;
}

// ---------------- le carnet ----------------
export const seenCount = () => Object.keys(ensureComp().seen).length;
export const compNextTier = () => COMP_TIERS[ensureComp().tiers] || null;
export const tierReady = () => !!compNextTier() && seenCount() >= compNextTier().n;
export function claimTier() {
    const c = ensureComp(),
        t = compNextTier();
    if (!t || seenCount() < t.n) return false;
    c.tiers++;
    if (t.coins) earn(t.coins, null);
    if (t.fert) state.inventory.fertilizer = (state.inventory.fertilizer || 0) + t.fert;
    if (t.seeds) state.seeds.saffron = (state.seeds.saffron || 0) + t.seeds;
    if (t.ruban) state.prestige.rubans += t.ruban;
    sfx('level');
    buzz(30);
    toast(`Carnet du potager : récompense des ${t.n} associations !`, ['ui', 'cpCarnet']);
    emit('changed', 'compan');
    return true;
}

// ---------------- le conseil de Mamie : un défi par vrai jour ----------------
export function mamieDefi() {
    if (!compOpen()) return null;
    const c = ensureComp();
    const key = dateKey(new Date(now()));
    if (!c.defi || c.defi.key !== key) {
        const pool = ASSOCS.filter(a => !isBad(a) && state.level >= assocLvl(a));
        if (!pool.length) return null;
        const unseen = pool.filter(a => !c.seen[a.id]);
        const a = unseen.length && Math.random() < 0.5 ? pickRand(unseen) : pickRand(pool);
        const need = MAMIE.need[0] + Math.floor(Math.random() * (MAMIE.need[1] - MAMIE.need[0] + 1));
        c.defi = { key, id: a.id, need, got: 0, done: false, claimed: false };
    }
    return c.defi;
}
export function claimMamie(at) {
    const d = mamieDefi();
    if (!d || !d.done || d.claimed) return false;
    d.claimed = true;
    earn(MAMIE.coins(state.level), at);
    addXp(MAMIE.xp(state.level), at);
    state.seeds.saffron = (state.seeds.saffron || 0) + MAMIE.seeds;
    let fert = 0;
    if (Math.random() < MAMIE.fertChance) {
        fert = 3;
        state.inventory.fertilizer = (state.inventory.fertilizer || 0) + fert;
    }
    sfx('level');
    toast(`Merci ! ${MAMIE.seeds} graines de safran${fert ? ' et 3 composts' : ''} en plus des pièces`, ['villager', 'odette']);
    emit('changed', 'compan');
    return true;
}
export const mamieReady = () => {
    const d = state.compan && state.compan.defi;
    return !!(d && d.done && !d.claimed);
};
// une phrase pour une parcelle (appui long) : « Tomate : basilic (qualité +12), pomme de terre (pucerons ×1,5) »
export function plotSummary(i) {
    const me = cropAt(i);
    if (!me) return '';
    const parts = [];
    for (const j of compNeighbors(i)) {
        const o = cropAt(j);
        pairAssocs(me, o).forEach(a => parts.push([a, o]));
    }
    if (inTrio(i)) parts.push([TRIO, null]);
    return parts;
}
