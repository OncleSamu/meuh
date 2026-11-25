// 1.178 : Moteur de l'Atelier Confiserie (Chocolat, Caramel & Berlingots).
// Composition libre avec variétés du Labo + miels de fleurs, 3 mini-jeux inédits, qualités Ordinaire→Diamant, Grimoire, Commandes, Cadeaux & Coffre-fort.

import { state, skill } from '../core/state.js';
import { now } from '../core/clock.js';
import { toast, sfx, emit } from '../core/bus.js';
import { ITEMS } from '../data/items.js';
import { FLAVORS } from '../data/genetics.js';
import { HONEYS, HONEY_COL } from '../data/honey.js';
import { QUALITY, QX } from '../data/farm.js';
import { VILLAGERS } from '../data/village.js';
import { PAIRS } from '../data/abbey.js';
import {
    CONF_LVL,
    CONF_KINDS,
    CONF_KIND_IDS,
    CONF_BASES,
    CONF_SHAPES,
    CONF_EXTRA,
    CONF_NOTE_COL,
    CONF_CLASSICS,
    CONF_HARMONY,
    CONF_MINI_MULT,
    CONF_ORDERS,
    CONF_GRIMOIRE,
    CONF_PREFS,
    CONF_DEMAND,
} from '../data/confiserie.js';
import { earn, addXp } from './player.js';
import { clampQuality, qual } from './farm.js';
import { addFriendship } from './village.js';
import { addRenom, RENOM } from './renom.js';
import { domLvl } from './estate.js';
import { honeyProd } from './honey.js';
import { varName, traitOf, FLAVOR_IDS, clampVarieties, takeVarUnits, varRanks, plainRanks, QK, vdef, vdefMult } from './genetics.js';

const pickRand = arr => arr[Math.floor(Math.random() * arr.length)];
const bestOn = () => !!(state.genetics && state.genetics.bestFirst);
const VAR = id => (state.genetics && (state.genetics.vars[id] || vdef(id))) || null;
const isHoneyKey = id => typeof id === 'string' && /^H[a-z]/.test(id) && !!HONEYS[id.slice(1)];

// ---------------- Ouverture & Chaudrons ----------------
export const confOpen = () => state.level >= CONF_LVL;
export const confKettleCount = () => {
    if (!confOpen()) return 0;
    const k = domLvl('kitchen');
    return 2 + (k >= 2 ? 1 : 0) + (k >= 5 ? 1 : 0);
};

// ---------------- Bases (y compris miels de fleurs pour Caramel) ----------------
export const isHoneyBase = b => typeof b === 'string' && b.startsWith('honey:');
export const baseHoneyId = b => (isHoneyBase(b) ? b.slice(6) : null);

export function confBaseDef(baseId) {
    if (!isHoneyBase(baseId)) return CONF_BASES[baseId] || CONF_BASES.dark;
    const h = baseHoneyId(baseId);
    const col = HONEY_COL[h] || HONEY_COL.all || '#e8b339';
    const hName = h === 'all' ? 'Miel toutes fleurs' : HONEYS[h] ? HONEYS[h].name : 'Miel de fleur';
    const costItem = h === 'all' ? 'honey' : honeyProd(h) || 'H' + h;
    return {
        id: baseId,
        kind: 'caramel',
        name: `Caramel au ${hName}`,
        short: h === 'all' ? 'Miel' : hName.replace(/^Miel (de |d’)/i, ''),
        cost: { [costItem]: 2, sugar: 2 },
        col,
        col2: '#a86a18',
        taste: [4, 1, 0, 0, 1],
        likes: [0, 1, 3, 4],
        text: 'rondeur miellée, sublime fleurs, épices et fruits du verger',
        isHoney: true,
        honey: h,
    };
}

export function confBasesFor(kind) {
    const fixed = Object.values(CONF_BASES)
        .filter(b => b.kind === kind)
        .map(b => b.id);
    if (kind !== 'caramel') return fixed;
    const honeys = ['honey:all', ...Object.keys(HONEYS).filter(k => state.genetics && (state.genetics.stock['H' + k] || 0) > 0).map(k => 'honey:' + k)];
    return [...fixed, ...honeys];
}

// ---------------- Ingrédients éligibles (cultures, arbres, extra + variétés du Labo) ----------------
export const CONF_ING_IDS = [
    ...Object.values(ITEMS)
        .filter(i => (i.type === 'crop' || i.type === 'tree') && FLAVORS[i.id] && i.id !== 'hop')
        .map(i => i.id),
    ...Object.keys(CONF_EXTRA).filter(id => ITEMS[id]),
];

export const confIngBase = id => (isHoneyKey(id) ? 'honey' : VAR(id) ? VAR(id).base : id);
export const confIngName = id =>
    isHoneyKey(id) ? HONEYS[id.slice(1)].name : VAR(id) ? varName(VAR(id)) : ITEMS[id] ? ITEMS[id].name : 'ingrédient';
export const confIngFlavor = id =>
    VAR(id) && VAR(id).g && VAR(id).g.t ? FLAVOR_IDS.map(k => traitOf(VAR(id).g, k)) : FLAVORS[confIngBase(id)] || CONF_EXTRA[id] || [0, 0, 0, 0, 0];
const confIngValue = id => {
    if (isHoneyKey(id)) return Math.round((ITEMS.honey?.sell || 0) * 1.45);
    if (VAR(id)) return (ITEMS[VAR(id).base]?.sell || 0) * vdefMult(VAR(id));
    if (id in CONF_EXTRA) return Math.round((ITEMS[id]?.sell || 0) * 0.35);
    return ITEMS[id]?.sell || 0;
};

export function confIngHave(id) {
    if (isHoneyKey(id) || VAR(id)) {
        clampVarieties();
        const base = confIngBase(id);
        return Math.min((state.genetics && state.genetics.stock[id]) || 0, state.inventory[base] || 0);
    }
    return state.inventory[id] || 0;
}

export function confAvailableIngs() {
    const out = [];
    for (const id of CONF_ING_IDS) {
        if ((state.inventory[id] || 0) > 0) out.push(id);
    }
    if (state.genetics && state.genetics.vars) {
        clampVarieties();
        for (const v of Object.values(state.genetics.vars)) {
            if (v && CONF_ING_IDS.includes(v.base) && confIngHave(v.id) > 0) out.push(v.id);
        }
    }
    return out;
}

// ---------------- État & initialisation ----------------
export function ensureConf() {
    if (!state.confiserie || typeof state.confiserie !== 'object') {
        state.confiserie = {
            drafts: {
                chocolate: { base: 'dark', ings: [], shape: 'tablette' },
                caramel: { base: 'salted', ings: [], shape: 'papillote' },
                berlingot: { base: 'sugar', ings: [], shape: 'berlingot' },
            },
            kettles: [],
            creations: {},
            stock: {},
            q: {},
            grimoire: {},
            grimoireClaimed: 0,
            grimoireRibbon: false,
            orders: [],
            nextOrder: 0,
            demand: {},
            gifts: { day: state.day || 1, given: {} },
            nextId: 1,
        };
    }
    const C = state.confiserie;
    C.drafts = C.drafts || {};
    if (!C.drafts.chocolate) C.drafts.chocolate = { base: 'dark', ings: [], shape: 'tablette' };
    if (!C.drafts.caramel) C.drafts.caramel = { base: 'salted', ings: [], shape: 'papillote' };
    if (!C.drafts.berlingot) C.drafts.berlingot = { base: 'sugar', ings: [], shape: 'berlingot' };
    C.kettles = Array.isArray(C.kettles) ? C.kettles : [];
    const nK = confKettleCount();
    while (C.kettles.length < nK) C.kettles.push(null);
    C.creations = C.creations || {};
    C.stock = C.stock || {};
    C.q = C.q || {};
    C.grimoire = C.grimoire || {};
    if (!Number.isFinite(C.grimoireClaimed)) C.grimoireClaimed = 0;
    C.orders = Array.isArray(C.orders) ? C.orders : [];
    C.demand = C.demand || {};
    const day = state.day || 1;
    if (!C.gifts || C.gifts.day !== day) C.gifts = { day, given: {} };
    if (!Number.isFinite(C.nextId)) C.nextId = 1;
    return C;
}

export const confDraft = kind => ensureConf().drafts[kind] || ensureConf().drafts.chocolate;

export function setConfBase(kind, baseId) {
    const d = confDraft(kind);
    if (!confBasesFor(kind).includes(baseId)) return false;
    d.base = baseId;
    sfx('click');
    return true;
}
export function setConfShape(kind, shapeId) {
    const d = confDraft(kind);
    const s = CONF_SHAPES[shapeId];
    if (!s || s.kind !== kind) return false;
    d.shape = shapeId;
    sfx('click');
    return true;
}
export function toggleConfIng(kind, ingId) {
    const d = confDraft(kind);
    const max = CONF_KINDS[kind]?.maxIngs || 2;
    const idx = d.ings.indexOf(ingId);
    if (idx >= 0) {
        d.ings.splice(idx, 1);
    } else {
        if (d.ings.length >= max) d.ings.shift();
        d.ings.push(ingId);
    }
    sfx('click');
    return true;
}
export function clearConfIngs(kind) {
    const d = confDraft(kind);
    d.ings = [];
    sfx('click');
    return true;
}

// ---------------- Harmonie, Grands Classiques & Prévisualisation ----------------
const topNote = v => {
    let best = 0;
    for (let i = 1; i < 5; i++) if ((v[i] || 0) > (v[best] || 0)) best = i;
    return best;
};

export function confClassicMatch(kind, baseId, ings) {
    const bKey = isHoneyBase(baseId) ? 'honey' : baseId;
    const bases = ings.map(confIngBase);
    return CONF_CLASSICS.find(c => c.kind === kind && c.bases.includes(bKey) && c.any.some(id => bases.includes(id))) || null;
}

export function confHarmony(kind, baseId, ings) {
    if (!ings.length) return { stars: 0, classic: null, reasons: ['Choisissez au moins un ingrédient.'] };
    const b = confBaseDef(baseId);
    const reasons = [];
    let score = 1;
    const tops = ings.map(id => topNote(confIngFlavor(id)));
    if (tops.some(t => b.likes.includes(t))) {
        score += 1;
        reasons.push(`Belle affinité avec ${b.short}.`);
    }
    const classic = confClassicMatch(kind, baseId, ings);
    if (classic) {
        score += 2;
        reasons.unshift(classic.text);
        return { stars: Math.max(0, Math.min(3, score)), classic, reasons };
    }
    let clash = false;
    for (let i = 0; i < tops.length; i++) {
        for (let j = i + 1; j < tops.length; j++) {
            const pair = `${Math.min(tops[i], tops[j])}-${Math.max(tops[i], tops[j])}`;
            if ((PAIRS[pair] || 0) < 0) clash = true;
        }
    }
    if (clash) {
        score -= 1;
        reasons.push('Deux notes s’entrechoquent un peu.');
    } else if (ings.length >= 2 && new Set(tops).size >= 2) {
        score += 1;
        reasons.push('Bel équilibre de saveurs !');
    }
    return { stars: Math.max(0, Math.min(3, score)), classic: null, reasons };
}

function confCost(baseId, ings) {
    const b = confBaseDef(baseId);
    const cost = { ...b.cost };
    for (const id of ings) cost[id] = (cost[id] || 0) + 2;
    return cost;
}

function confIngQuality(cost, ings) {
    let pts = 0,
        units = 0;
    for (const [id, n] of Object.entries(cost)) {
        units += n;
        const v = VAR(id);
        let left = n;
        const have = v ? varRanks(id) : bestOn() ? plainRanks(id) : null;
        if (have) {
            for (const r of [4, 3, 2, 1]) {
                const t = Math.min(left, have[r]);
                left -= t;
                pts += t * r;
            }
        }
    }
    // si pas d'ingrédients en stock, retourner 0 proprement
    if (!units || !ings.length) return 0;
    return Math.min(4, Math.floor(pts / units + 0.35));
}

function confAutoName(kind, baseId, ings, classic) {
    if (classic) return classic.name;
    const b = confBaseDef(baseId);
    const main = ings.length ? confIngName(ings[0]).toLowerCase() : '';
    const pref = kind === 'chocolate' ? b.name : kind === 'caramel' ? b.name : 'Berlingots';
    return main ? `${pref} · ${main}` : pref;
}

export function confPreview(kind) {
    const d = confDraft(kind);
    const kDef = CONF_KINDS[kind];
    const b = confBaseDef(d.base);
    const ings = d.ings.filter(Boolean).slice(0, kDef.maxIngs);
    const h = confHarmony(kind, d.base, ings);
    const cost = confCost(d.base, ings);
    // Vérifier le stock par base réelle (une variété partage l'inventaire de sa plante)
    const byBase = {};
    for (const [id, n] of Object.entries(cost)) {
        const bi = confIngBase(id);
        byBase[bi] = (byBase[bi] || 0) + n;
    }
    const miss = Object.entries(cost).filter(([id, n]) => confIngHave(id) < n || (state.inventory[confIngBase(id)] || 0) < byBase[confIngBase(id)]);
    const rawVal = Object.entries(cost).reduce((s, [id, n]) => s + confIngValue(id) * n, 0);
    const basePieceVal = Math.max(45, Math.round(((rawVal * 1.48 * CONF_HARMONY[h.stars]) / kDef.batch) * 1.15));
    const mainTop = ings.length ? topNote(confIngFlavor(ings[0])) : 0;
    const accentCol = CONF_NOTE_COL[mainTop] || '#f5c842';
    const time = Math.round((kDef.baseTime + kDef.perIng * ings.length) * (1 - 0.06 * skill('speed')));
    const q = confIngQuality(cost, ings);
    const freeKettle = ensureConf().kettles.findIndex(v => !v);
    return {
        kind,
        base: d.base,
        baseDef: b,
        shape: d.shape,
        ings,
        harmony: h,
        cost,
        miss,
        can: ings.length > 0 && miss.length === 0,
        batch: kDef.batch,
        value: basePieceVal,
        time,
        q,
        freeKettle,
        name: confAutoName(kind, d.base, ings, h.classic),
        baseCol: b.col,
        baseCol2: b.col2,
        accentCol,
    };
}

// Meilleur accord automatique avec le stock du joueur
export function applyBestConf(kind) {
    const avail = confAvailableIngs();
    if (!avail.length) {
        toast('Aucun ingrédient de confiserie en stock.', ['ui', 'confiserie']);
        return false;
    }
    const d = confDraft(kind);
    let best = null;
    for (const bId of confBasesFor(kind)) {
        const b = confBaseDef(bId);
        const baseOk = Object.entries(b.cost).every(([id, n]) => confIngHave(id) >= n);
        if (!baseOk) continue;
        for (const id of avail.slice(0, 60)) {
            if (confIngHave(id) < 2) continue;
            const h = confHarmony(kind, bId, [id]);
            const sc = h.stars * 100 + (h.classic ? 500 : 0) + confIngValue(id);
            if (!best || sc > best.sc) best = { bId, ings: [id], sc };
        }
    }
    if (!best) {
        toast('Il manque des ingrédients de base en stock pour cette confiserie.', ['ui', 'confiserie']);
        return false;
    }
    d.base = best.bId;
    d.ings = best.ings;
    sfx('pop');
    return true;
}

// ---------------- Prélèvement & Enregistrement d'une création ----------------
function takeConfIng(id, n) {
    const v = VAR(id);
    const isH = isHoneyKey(id);
    const base = isH ? 'honey' : v ? v.base : id;
    let points = 0;
    if (v || isH) {
        const got = takeVarUnits(id, n, true);
        points = got.reduce((a, c, r) => a + c * r, 0);
    } else if (bestOn() && state.quality[base]) {
        const q = qual(base),
            free = plainRanks(base);
        let left = n;
        for (const r of [4, 3, 2, 1]) {
            const t = Math.min(left, free[r]);
            q[QK[r]] -= t;
            left -= t;
            points += t * r;
        }
    }
    state.inventory[base] -= n;
    clampQuality(base);
    return points;
}

function consumeCost(cost) {
    let pts = 0,
        units = 0;
    for (const [id, n] of Object.entries(cost)) {
        units += n;
        pts += takeConfIng(id, n);
    }
    return units ? Math.min(4, Math.floor(pts / units + 0.35)) : 0;
}

function confSig(kind, base, ings, shape) {
    return `${kind}|${base}|${shape}|${[...ings].sort().join(',')}`;
}

function addConfQuality(C, cid, qRank, qty) {
    if (qRank <= 0 || qty <= 0) return;
    const k = QX.keys[qRank];
    if (!k) return;
    C.q[cid] = C.q[cid] || { s: 0, g: 0, p: 0, d: 0 };
    C.q[cid][k] = (C.q[cid][k] || 0) + qty;
}

function registerBatch(C, pv, baseQ, miniStars) {
    const mirror = miniStars >= 3;
    const finalQ = Math.min(4, baseQ + (mirror ? 1 : 0));
    const sig = confSig(pv.kind, pv.base, pv.ings, pv.shape);
    let existing = Object.values(C.creations).find(x => x.sig === sig);
    const val = Math.round(pv.value * CONF_MINI_MULT[miniStars || 0]);
    if (!existing) {
        const id = 'cf' + C.nextId++;
        existing = {
            id,
            sig,
            kind: pv.kind,
            base: pv.base,
            shape: pv.shape,
            ings: [...pv.ings],
            bases: pv.ings.map(confIngBase),
            name: pv.name,
            stars: pv.harmony.stars,
            classic: pv.harmony.classic ? pv.harmony.classic.id : null,
            baseCol: pv.baseCol,
            baseCol2: pv.baseCol2,
            accentCol: pv.accentCol,
            value: val,
            mirror,
            bestMini: miniStars || 0,
            fav: false,
            made: 0,
        };
        C.creations[id] = existing;
    } else {
        if (val > existing.value) existing.value = val;
        if (mirror) existing.mirror = true;
        if ((miniStars || 0) > (existing.bestMini || 0)) existing.bestMini = miniStars;
    }
    existing.made = (existing.made || 0) + pv.batch;
    C.stock[existing.id] = (C.stock[existing.id] || 0) + pv.batch;
    addConfQuality(C, existing.id, finalQ, pv.batch);

    // Statistiques & Grimoire
    state.stats.confiseries = (state.stats.confiseries || 0) + pv.batch;
    let news = 0;
    for (const id of pv.ings) {
        const bi = confIngBase(id);
        if (!C.grimoire[bi]) {
            C.grimoire[bi] = true;
            news++;
        }
    }
    if (existing.classic && !C.grimoire['C:' + existing.classic]) {
        C.grimoire['C:' + existing.classic] = true;
        news++;
        toast(`Grand Classique découvert : ${existing.name} !`, ['ui', 'confiserie']);
    } else if (news) {
        toast(`Grimoire du Confiseur : +${news} découverte${news > 1 ? 's' : ''} !`, ['ui', 'confiserie']);
    }
    addXp(Math.round(35 + pv.harmony.stars * 18 + (miniStars || 0) * 15));
    return { id: existing.id, qty: pv.batch, q: finalQ, mirror };
}

// Lancement direct par mini-jeu (prêt aussitôt avec bonus finition miroir +1 qualité sur 3★ !)
export function finishConfMini(kind, stars) {
    if (!confOpen()) return null;
    const C = ensureConf();
    const pv = confPreview(kind);
    if (!pv.can) return null;
    const st = Math.max(1, Math.min(3, Math.round(stars || 1)));
    const baseQ = consumeCost(pv.cost);
    const res = registerBatch(C, pv, baseQ, st);
    sfx(st >= 3 ? 'level' : 'harvest');
    emit('changed', 'confiserie');
    return res;
}

// Lancement en atelier passif dans un chaudron libre
export function startConfKettle(kind) {
    if (!confOpen()) return false;
    const C = ensureConf();
    const pv = confPreview(kind);
    if (!pv.can || pv.freeKettle < 0) return false;
    const baseQ = consumeCost(pv.cost);
    const t = now();
    C.kettles[pv.freeKettle] = {
        kind,
        pv: {
            kind: pv.kind,
            base: pv.base,
            shape: pv.shape,
            ings: [...pv.ings],
            harmony: { stars: pv.harmony.stars, classic: pv.harmony.classic ? { id: pv.harmony.classic.id } : null },
            batch: pv.batch,
            value: pv.value,
            name: pv.name,
            baseCol: pv.baseCol,
            baseCol2: pv.baseCol2,
            accentCol: pv.accentCol,
        },
        baseQ,
        start: t,
        until: t + pv.time * 1000,
        ready: false,
    };
    sfx('machine');
    emit('changed', 'confiserie');
    return true;
}

export function collectConfKettle(idx) {
    const C = ensureConf();
    const k = C.kettles[idx];
    if (!k || (!k.ready && now() < k.until)) return null;
    C.kettles[idx] = null;
    const res = registerBatch(C, k.pv, k.baseQ, 0);
    sfx('harvest');
    emit('changed', 'confiserie');
    return res;
}

// ---------------- Stock, Qualités, Vente, Renommage & Favoris ----------------
export const confOf = id => (state.confiserie && state.confiserie.creations && state.confiserie.creations[id]) || null;
export const confStock = id => (state.confiserie && state.confiserie.stock && state.confiserie.stock[id]) || 0;
export const confQual = id => (state.confiserie && state.confiserie.q && state.confiserie.q[id]) || { s: 0, g: 0, p: 0, d: 0 };
export const myConfs = () => (state.confiserie && state.confiserie.creations ? Object.values(state.confiserie.creations) : []);

export function confBestQuality(cid) {
    const q = confQual(cid);
    if (q.d > 0) return 4;
    if (q.p > 0) return 3;
    if (q.g > 0) return 2;
    if (q.s > 0) return 1;
    return 0;
}

function pullConfUnits(C, cid, qty, minQ = 0) {
    const total = C.stock[cid] || 0;
    if (total < qty) return null;
    const q = (C.q[cid] = C.q[cid] || { s: 0, g: 0, p: 0, d: 0 });
    const ord = Math.max(0, total - (q.s + q.g + q.p + q.d));
    const avail = [ord, q.s, q.g, q.p, q.d];
    const elig = avail.slice(minQ).reduce((a, b) => a + b, 0);
    if (elig < qty) return null;
    let left = qty,
        multSum = 0,
        topQ = 0;
    // Prélever en commençant par le rang minimal suffisant (pour préserver les Diamants quand non requis)
    for (let r = minQ; r <= 4 && left > 0; r++) {
        const take = Math.min(left, avail[r]);
        if (take > 0) {
            if (r > 0) q[QX.keys[r]] -= take;
            left -= take;
            multSum += take * QUALITY[r].mult;
            if (r > topQ) topQ = r;
        }
    }
    C.stock[cid] = total - qty;
    return { multSum, topQ };
}

function demandMult(C, cid) {
    const d = C.demand[cid];
    if (!d || !d.n) return 1;
    const elapsed = Math.max(0, (now() - d.at) / 1000);
    const eff = d.n * Math.pow(0.5, elapsed / CONF_DEMAND.half);
    return Math.max(CONF_DEMAND.floor, 1 - eff * CONF_DEMAND.per);
}

export function confPrice(cid) {
    const c = confOf(cid);
    if (!c) return 0;
    const C = ensureConf();
    return Math.max(10, Math.round((c.value * demandMult(C, cid)) / 5) * 5);
}

export function sellConf(cid, qty = 1) {
    const C = ensureConf();
    const c = confOf(cid);
    if (!c || qty <= 0) return false;
    const pulled = pullConfUnits(C, cid, qty, 0);
    if (!pulled) return false;
    const unit = confPrice(cid);
    const total = Math.round(unit * pulled.multSum);
    const d = C.demand[cid] || { n: 0, at: now() };
    const elapsed = Math.max(0, (now() - d.at) / 1000);
    C.demand[cid] = { n: d.n * Math.pow(0.5, elapsed / CONF_DEMAND.half) + qty, at: now() };
    state.income.confiserie = (state.income.confiserie || 0) + total;
    earn(total);
    addXp(Math.round(qty * 8));
    sfx('coin');
    emit('changed', 'confiserie');
    return true;
}

export function renameConf(cid, name) {
    const c = confOf(cid);
    const clean = String(name || '').trim().slice(0, 36);
    if (!c || !clean) return false;
    c.name = clean;
    return true;
}

export const isConfFav = cid => !!(confOf(cid) && confOf(cid).fav);

export function toggleConfFav(cid) {
    const c = confOf(cid);
    if (!c) return false;
    c.fav = !c.fav;
    return true;
}

export function loadConfDraft(cid) {
    const c = confOf(cid);
    if (!c) return false;
    const d = confDraft(c.kind);
    d.base = confBasesFor(c.kind).includes(c.base) ? c.base : confBasesFor(c.kind)[0];
    d.shape = CONF_SHAPES[c.shape] ? c.shape : d.shape;
    d.ings = [...(c.ings || [])];
    sfx('click');
    return c.kind;
}

// ---------------- Cadeaux aux villageois ----------------
export function confGiftPts(vid, cid) {
    const c = confOf(cid);
    if (!c) return 0;
    let pts = 2 + c.stars;
    if (CONF_PREFS[vid] === c.kind) pts += 2;
    if (c.mirror) pts += 1;
    return pts;
}

export function giftConf(vid, cid) {
    const C = ensureConf();
    const c = confOf(cid);
    if (!c || !VILLAGERS[vid] || C.gifts.given[vid]) return false;
    const pulled = pullConfUnits(C, cid, 1, 0);
    if (!pulled) return false;
    C.gifts.given[vid] = true;
    const pts = confGiftPts(vid, cid);
    addFriendship(vid, pts);
    state.stats.confGifts = (state.stats.confGifts || 0) + 1;
    sfx('pop');
    toast(`${VILLAGERS[vid].name} se régale avec ${c.name} (+${pts} amitié) !`, ['ui', 'confiserie']);
    emit('changed', 'confiserie');
    return true;
}

// ---------------- Coffre-fort ----------------
export function takeConfForVault(cid) {
    const C = ensureConf();
    const c = confOf(cid);
    if (!c || confStock(cid) < 1) return null;
    // Prélever la meilleure qualité disponible pour exposer au coffre
    const topQ = confBestQuality(cid);
    const pulled = pullConfUnits(C, cid, 1, topQ);
    if (!pulled) return null;
    return {
        cid: c.id,
        name: c.name,
        kind: c.kind,
        shape: c.shape,
        baseCol: c.baseCol,
        baseCol2: c.baseCol2,
        accentCol: c.accentCol,
        stars: c.stars,
        classic: c.classic,
        mirror: c.mirror,
        q: topQ,
        value: Math.round(c.value * QUALITY[topQ].mult),
    };
}

export function restoreConfFromVault(cf) {
    if (!cf || !cf.cid) return false;
    const C = ensureConf();
    C.stock[cf.cid] = (C.stock[cf.cid] || 0) + 1;
    if (cf.q) addConfQuality(C, cf.cid, cf.q, 1);
    emit('changed', 'confiserie');
    return true;
}

// ---------------- Commandes gourmandes ----------------
function makeConfOrder(t) {
    const vid = pickRand(CONF_ORDERS.villagers);
    const kind = Math.random() < 0.55 && CONF_PREFS[vid] ? CONF_PREFS[vid] : pickRand(CONF_KIND_IDS);
    const minStars = Math.random() < 0.4 ? 2 : 1;
    const minQ = Math.random() < 0.3 ? 1 : 0;
    const qty = 2 + Math.floor(Math.random() * 4);
    return {
        id: 'co' + Math.floor(t) + Math.floor(Math.random() * 999),
        vid,
        kind,
        minStars,
        minQ,
        qty,
    };
}

export function confOrderText(o) {
    const k = CONF_KINDS[o.kind]?.name.toLowerCase() || 'confiserie';
    const parts = [`${o.qty} × ${k}`];
    if (o.minStars >= 2) parts.push(`${o.minStars}★+`);
    if (o.minQ > 0) parts.push(`qualité ${QUALITY[o.minQ].name}+`);
    return parts.join(' · ');
}

export function confOrderMatches(o) {
    if (!o) return [];
    const C = ensureConf();
    return myConfs().filter(c => {
        if (c.kind !== o.kind || c.stars < (o.minStars || 0)) return false;
        const total = C.stock[c.id] || 0;
        if (total < o.qty) return false;
        if (!o.minQ) return true;
        const q = confQual(c.id);
        const ord = Math.max(0, total - (q.s + q.g + q.p + q.d));
        const avail = [ord, q.s, q.g, q.p, q.d];
        return avail.slice(o.minQ).reduce((a, b) => a + b, 0) >= o.qty;
    });
}

export function confOrderPay(o, cid) {
    const c = confOf(cid);
    if (!c) return 0;
    const qMult = QUALITY[Math.max(o.minQ || 0, confBestQuality(cid))]?.mult || 1;
    return Math.round((c.value * o.qty * qMult * CONF_ORDERS.payMult * (1 + 0.06 * skill('hospitality'))) / 5) * 5;
}

export function deliverConfOrder(oid, cid) {
    const C = ensureConf();
    const idx = C.orders.findIndex(o => o.id === oid);
    if (idx < 0) return false;
    const o = C.orders[idx];
    const c = confOf(cid);
    if (!c || c.kind !== o.kind || c.stars < (o.minStars || 0)) return false;
    const pulled = pullConfUnits(C, cid, o.qty, o.minQ || 0);
    if (!pulled) return false;
    const pay = Math.round((c.value * pulled.multSum * CONF_ORDERS.payMult * (1 + 0.06 * skill('hospitality'))) / 5) * 5;
    C.orders.splice(idx, 1);
    state.income.confiserie = (state.income.confiserie || 0) + pay;
    earn(pay);
    addXp(90 + o.qty * 15);
    addFriendship(o.vid, 3);
    addRenom(RENOM.order || 2);
    state.stats.confOrders = (state.stats.confOrders || 0) + 1;
    sfx('coin');
    toast(`Commande gourmande livrée : +${pay} pièces !`, ['ui', 'confiserie']);
    emit('changed', 'confiserie');
    return true;
}

export function dismissConfOrder(oid) {
    const C = ensureConf();
    const idx = C.orders.findIndex(o => o.id === oid);
    if (idx < 0) return false;
    C.orders.splice(idx, 1);
    sfx('click');
    emit('changed', 'confiserie');
    return true;
}

// ---------------- Grimoire du Confiseur ----------------
export const confGrimoireCount = () => Object.keys((state.confiserie && state.confiserie.grimoire) || {}).length;
export const confGrimoireTotal = () => CONF_ING_IDS.length + CONF_CLASSICS.length;
export const confGrimoireClaimable = () => {
    const C = state.confiserie;
    if (!C) return 0;
    return Math.max(0, Math.floor(confGrimoireCount() / CONF_GRIMOIRE.step) - (C.grimoireClaimed || 0));
};

export function claimConfGrimoire() {
    const C = ensureConf();
    if (confGrimoireClaimable() <= 0) return false;
    C.grimoireClaimed = (C.grimoireClaimed || 0) + 1;
    state.income.confiserie = (state.income.confiserie || 0) + CONF_GRIMOIRE.coins;
    earn(CONF_GRIMOIRE.coins);
    addXp(CONF_GRIMOIRE.xp);
    if (!C.grimoireRibbon && confGrimoireCount() >= confGrimoireTotal() && C.grimoireClaimed >= Math.floor(confGrimoireTotal() / CONF_GRIMOIRE.step)) {
        C.grimoireRibbon = true;
        state.prestige.rubans = (state.prestige.rubans || 0) + 1;
        toast('Grimoire du Confiseur complet : +1 ruban de Prestige !', ['ui', 'confiserie']);
    } else {
        toast(`Grimoire du Confiseur : +${CONF_GRIMOIRE.coins} pièces et +${CONF_GRIMOIRE.xp} XP !`, ['ui', 'confiserie']);
    }
    sfx('level');
    emit('changed', 'confiserie');
    return true;
}

// ---------------- Tick, Hors-ligne & Pastilles ----------------
export function confReadyCount() {
    const C = state.confiserie;
    if (!C || !Array.isArray(C.kettles)) return 0;
    const t = now();
    return C.kettles.filter(k => k && (k.ready || t >= k.until)).length;
}
export function confOrdersReady() {
    const C = state.confiserie;
    if (!C || !Array.isArray(C.orders)) return 0;
    return C.orders.filter(o => confOrderMatches(o).length > 0).length;
}
export function confBadge() {
    if (!confOpen()) return 0;
    return confReadyCount() + confOrdersReady() + (confGrimoireClaimable() > 0 ? 1 : 0);
}

export function confTick() {
    if (!confOpen()) return false;
    const C = ensureConf();
    const t = now();
    let dirty = false;
    for (const k of C.kettles) {
        if (k && !k.ready && t >= k.until) {
            k.ready = true;
            dirty = true;
        }
    }
    if (C.orders.length < CONF_ORDERS.max && t >= (C.nextOrder || 0)) {
        C.orders.push(makeConfOrder(t));
        C.nextOrder = t + CONF_ORDERS.every * 1000;
        dirty = true;
    }
    return dirty;
}

export function confOffline() {
    if (!confOpen() || !state.confiserie) return 0;
    const C = ensureConf();
    const t = now();
    let done = 0;
    for (const k of C.kettles) {
        if (k && !k.ready && t >= k.until) {
            k.ready = true;
            done++;
        }
    }
    while (C.orders.length < CONF_ORDERS.max && t >= (C.nextOrder || 0)) {
        C.orders.push(makeConfOrder(t));
        C.nextOrder = t + CONF_ORDERS.every * 1000;
    }
    return done;
}
