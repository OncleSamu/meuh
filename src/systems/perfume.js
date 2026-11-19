// 1.142 : L'Atelier du Parfumeur (L'Orgue à parfums).
// Pyramide olfactive (Tête · Cœur · Fond), 3 méthodes d'extraction, 3 concentrations,
// macération active en 3 étapes avec soins, flacons SVG sur mesure, salon de commandes et Orgue à remplir.
import { state } from '../core/state.js';
import { now } from '../core/clock.js';
import { toast, sfx, buzz, burst, float, emit, changed } from '../core/bus.js';
import { pickRand } from '../core/format.js';
import { ITEMS } from '../data/items.js';
import { QUALITY, QX } from '../data/farm.js';
import { HONEYS, HONEY_COL } from '../data/honey.js';
import { VILLAGERS } from '../data/village.js';
import { LOVES, GIFT_PTS } from '../data/friends.js';
import { RARE } from '../data/commerce.js';
import {
    PERFUME,
    PERFUME_LVL,
    FACETS,
    PERFUME_PAIRS,
    METHODS,
    METHOD_IDS,
    CONCENTRATIONS,
    CONC_IDS,
    STAGES,
    PERFUME_TOUCHES,
    PERFUME_SIGN,
    PERFUME_GIFT,
    FAMILIES,
    FAMILY_IDS,
    PERFUME_NOTES,
    HEAD_NOTES,
    HEART_NOTES,
    BASE_NOTES,
    ALL_NOTE_IDS,
    PERFUME_CLASSICS,
    BOTTLES,
    CAPS,
    PERFUME_ORDERS,
    PERFUME_ORGAN,
} from '../data/perfume.js';
import { mixHex } from '../art/perfume.js';
import { domLvl } from './estate.js';
import { earn, addXp } from './player.js';
import { addFriendship } from './village.js';
import { isBirthday } from './friends.js';
import { addRenom, RENOM } from './renom.js';
import { clampQuality, qual } from './farm.js';
import { varName, clampVarieties, scoreTier, takeVarUnits, varRanks, plainRanks, QK, vdef, vdefMult } from './genetics.js';
import { giveRare } from './barn.js';

export const perfumeOpen = () => state.level >= PERFUME_LVL;
export const perfumeVatCount = () => {
    if (!perfumeOpen()) return 0;
    const kl = domLvl('kitchen');
    return Math.min(PERFUME.maxVats, PERFUME.vatsBase + (kl >= 2 ? 1 : 0) + (kl >= 5 ? 1 : 0));
};

// ---------------- essences (items, variétés du labo, miels de fleurs) ----------------
const VAR = id => (state.genetics && (state.genetics.vars[id] || vdef(id))) || null;
const isHoneyKey = id => typeof id === 'string' && /^H[a-z]/.test(id) && !!HONEYS[id.slice(1)];
export const perfumeNoteBase = id => (isHoneyKey(id) ? 'honey' : VAR(id) ? VAR(id).base : id);
export const perfumeNoteDef = id => PERFUME_NOTES[perfumeNoteBase(id)] || null;
export const perfumeNoteName = id =>
    isHoneyKey(id)
        ? HONEYS[id.slice(1)].name
        : VAR(id)
          ? varName(VAR(id))
          : ITEMS[id]
            ? ITEMS[id].name
            : 'essence inconnue';
export function perfumeNoteHave(id) {
    if (isHoneyKey(id) || VAR(id)) {
        clampVarieties();
        const base = perfumeNoteBase(id);
        return Math.min((state.genetics && state.genetics.stock[id]) || 0, state.inventory[base] || 0);
    }
    return state.inventory[id] || 0;
}
export function perfumeNoteColor(id) {
    if (isHoneyKey(id)) return HONEY_COL[id.slice(1)] || '#e8b339';
    const d = perfumeNoteDef(id);
    return d ? d.col : '#d988b9';
}
export function perfumeNoteVec(id) {
    const d = perfumeNoteDef(id);
    if (!d) return [0, 0, 0, 0, 0];
    const v = [...d.v];
    // une variété fixée ou un miel de fleur renforce sa note dominante (+1)
    if (VAR(id) || isHoneyKey(id)) {
        const top = v.indexOf(Math.max(...v));
        v[top] += 1;
    }
    return v;
}
function noteValue(id) {
    const base = perfumeNoteBase(id);
    const sell = (ITEMS[base] && ITEMS[base].sell) || 40;
    const v = VAR(id);
    return v ? Math.round(sell * vdefMult(v)) : isHoneyKey(id) ? Math.round(sell * 1.4) : sell;
}

const bestOn = () => !!(state.genetics && state.genetics.bestFirst);
function takeNote(id, n) {
    const v = VAR(id);
    const base = perfumeNoteBase(id);
    let points = 0;
    if (v || isHoneyKey(id)) {
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
    state.inventory[base] = Math.max(0, (state.inventory[base] || 0) - n);
    clampQuality(base);
    return points;
}
function previewQuality(ids, qty) {
    let points = 0,
        units = 0;
    for (const id of ids) {
        if (!id) continue;
        units += qty;
        const v = VAR(id);
        let left = qty;
        const have = v || isHoneyKey(id) ? varRanks(id) : bestOn() ? plainRanks(id) : null;
        if (have) {
            for (const r of [4, 3, 2, 1]) {
                const t = Math.min(left, have[r]);
                left -= t;
                points += t * r;
            }
        }
    }
    return units ? scoreTier(points / units) : 0;
}

// les variétés & miels de fleurs disponibles pour un étage donné
export function perfumeTierSpecials(tier) {
    if (!state.genetics) return [];
    const list = [];
    const allowed = tier === 'head' ? HEAD_NOTES : tier === 'heart' ? HEART_NOTES : BASE_NOTES;
    for (const v of Object.values(state.genetics.vars || {})) {
        if (v && allowed.includes(v.base) && perfumeNoteHave(v.id) > 0) list.push(v.id);
    }
    if (tier === 'base') {
        for (const h of Object.keys(HONEYS)) {
            const k = 'H' + h;
            if (perfumeNoteHave(k) > 0) list.push(k);
        }
    }
    return list;
}

// ---------------- état ----------------
export function ensurePerfume() {
    const P = (state.perfume = state.perfume || {});
    P.next = P.next || 1;
    P.creations = P.creations || {};
    P.sig = P.sig || {};
    P.stock = P.stock || {};
    P.q = P.q || {};
    P.organ = P.organ || {};
    P.organClaimed = P.organClaimed || 0;
    P.organRibbon = !!P.organRibbon;
    P.signature = P.signature || null;
    P.vats = P.vats || [];
    P.demand = P.demand || {};
    P.orders = P.orders || [];
    P.nextOrder = P.nextOrder || 0;
    P.draft = P.draft || {
        head: 'lemon',
        heart: 'lavender',
        base: 'resin',
        method: 'enfleurage',
        conc: 'fraiche',
        bottle: 'apothicaire',
        cap: 'or',
    };
    if (!METHODS[P.draft.method]) P.draft.method = 'enfleurage';
    if (!CONCENTRATIONS[P.draft.conc]) P.draft.conc = 'fraiche';
    if (!BOTTLES[P.draft.bottle]) P.draft.bottle = 'apothicaire';
    if (!CAPS[P.draft.cap]) P.draft.cap = 'or';
    const want = perfumeVatCount();
    while (P.vats.length < want) P.vats.push(null);
    return P;
}

// ---------------- calcul de la pyramide olfactive ----------------
const topIdx = v => v.indexOf(Math.max(...v));
const capFirst = t => (t ? t[0].toUpperCase() + t.slice(1) : '');

export function perfumeProfile(head, heart, base, method = 'enfleurage') {
    const p = [0, 0, 0, 0, 0];
    const m = METHODS[method] || METHODS.enfleurage;
    for (const [tier, id] of [
        ['head', head],
        ['heart', heart],
        ['base', base],
    ]) {
        if (!id) continue;
        const mult = m.tier === tier ? 1.25 : 1;
        perfumeNoteVec(id).forEach((x, k) => (p[k] += Math.round(x * mult)));
    }
    p[m.facet] += m.boost;
    return p;
}

export function perfumeClassic(head, heart, base) {
    const hb = perfumeNoteBase(head),
        cb = perfumeNoteBase(heart),
        bb = perfumeNoteBase(base);
    return PERFUME_CLASSICS.find(c => c.head.includes(hb) && c.heart.includes(cb) && c.base.includes(bb)) || null;
}

export function perfumeFamily(head, heart, base, method = 'enfleurage') {
    const hb = perfumeNoteBase(head),
        cb = perfumeNoteBase(heart);
    const hd = PERFUME_NOTES[hb],
        cd = PERFUME_NOTES[cb];
    if ((hd && hd.tag === 'boreal') || (cd && cd.tag === 'boreal')) return 'boreal';
    const p = perfumeProfile(head, heart, base, method);
    const top = topIdx(p);
    if (top === 0) return hd && hd.tag === 'aromatique' ? 'aromatique' : 'hesperide';
    if (top === 1) return 'floral';
    if (top === 2) return 'boise';
    if (top === 3) return 'oriental';
    return 'gourmand';
}

export function perfumeHarmony(head, heart, base, method = 'enfleurage') {
    if (!head || !heart || !base) return { stars: 0, reasons: ['Choisissez une note de tête, une de cœur et une de fond.'], classic: null };
    const m = METHODS[method] || METHODS.enfleurage;
    const p = perfumeProfile(head, heart, base, method);
    const order = p.map((v, k) => [v, k]).sort((a, b) => b[0] - a[0]);
    const [a, b] = [order[0][1], order[1][1]];
    const reasons = [];
    let score = 0;

    // 1. Grand classique
    const classic = perfumeClassic(head, heart, base);
    if (classic) {
        reasons.push(classic.text);
        score += 2;
    }

    // 2. Accord des deux facettes principales
    if (order[1][0] >= order[0][0] * 0.35 && order[1][0] > 0) {
        const pair = PERFUME_PAIRS[`${Math.min(a, b)}-${Math.max(a, b)}`] || 0;
        if (pair > 0) {
            score += 1;
            reasons.push(`${FACETS[a]} et ${FACETS[b].toLowerCase()} s’accordent à merveille.`);
        } else if (pair < 0) {
            score -= 1;
            reasons.push(`${FACETS[a]} et ${FACETS[b].toLowerCase()} se heurtent.`);
        }
    } else {
        reasons.push(`Facette dominante : ${FACETS[a].toLowerCase()}.`);
    }

    // 3. Cohérence de la méthode d'extraction avec l'étage qu'elle amplifie
    const targetId = m.tier === 'head' ? head : m.tier === 'heart' ? heart : base;
    const targetTop = topIdx(perfumeNoteVec(targetId));
    if (targetTop === m.facet) {
        score += 1;
        reasons.push(`La ${m.name.toLowerCase()} sublime l’étage ${m.tier === 'head' ? 'de tête' : m.tier === 'heart' ? 'de cœur' : 'de fond'}.`);
    } else {
        reasons.push(`La ${m.name.toLowerCase()} apporte une touche ${FACETS[m.facet].toLowerCase()}.`);
    }

    // 4. Richesse de la pyramide (3 étages aux facettes variées)
    const tops = [topIdx(perfumeNoteVec(head)), topIdx(perfumeNoteVec(heart)), topIdx(perfumeNoteVec(base))];
    if (new Set(tops).size === 3) {
        score += 1;
        reasons.push('Pyramide riche : trois facettes distinctes qui se répondent.');
    }

    return { stars: Math.max(0, Math.min(3, score)), reasons, classic: classic ? classic.id : null };
}

export function perfumeCost(head, heart, base, conc = 'fraiche') {
    const qty = (CONCENTRATIONS[conc] || CONCENTRATIONS.fraiche).qty;
    const c = {};
    for (const id of [head, heart, base]) {
        if (id) c[id] = (c[id] || 0) + qty;
    }
    return c;
}

export function perfumeStageSec(method = 'enfleurage', conc = 'fraiche') {
    const m = METHODS[method] || METHODS.enfleurage;
    const c = CONCENTRATIONS[conc] || CONCENTRATIONS.fraiche;
    return Math.round(c.stageSec * m.timeMult);
}

export function perfumeValue(head, heart, base, method, conc, stars) {
    const m = METHODS[method] || METHODS.enfleurage;
    const c = CONCENTRATIONS[conc] || CONCENTRATIONS.fraiche;
    const raw = (noteValue(head) + noteValue(heart) + noteValue(base)) * c.qty;
    const baseVal = (raw * PERFUME.priceMult + c.stageSec * 0.25) / c.bottles;
    const v = baseVal * m.valMult * c.valMult * PERFUME.harmony[Math.max(0, Math.min(3, stars))];
    return Math.max(25, Math.round(v / 5) * 5);
}

export function perfumeAutoName(head, heart, base, conc, classicId) {
    if (classicId) {
        const cl = PERFUME_CLASSICS.find(x => x.id === classicId);
        if (cl) return cl.name;
    }
    const prefix = conc === 'extrait' ? 'Extrait' : conc === 'toilette' ? 'Parfum' : 'Eau';
    const hn = perfumeNoteName(heart).toLowerCase();
    const bn = perfumeNoteName(base).toLowerCase();
    return `${prefix} ${hn} & ${bn}`;
}

const sigOf = d => `${d.head}|${d.heart}|${d.base}|${d.method}|${d.conc}`;

export function perfumePreview(d = ensurePerfume().draft) {
    const P = ensurePerfume();
    const ok3 = !!(d.head && d.heart && d.base);
    const harmony = perfumeHarmony(d.head, d.heart, d.base, d.method);
    const family = ok3 ? perfumeFamily(d.head, d.heart, d.base, d.method) : 'floral';
    const profile = perfumeProfile(d.head, d.heart, d.base, d.method);
    const cost = perfumeCost(d.head, d.heart, d.base, d.conc);
    const miss = Object.entries(cost).filter(([id, n]) => perfumeNoteHave(id) < n);
    const sig = sigOf(d);
    const known = P.sig[sig] || null;
    const color = ok3 ? mixHex(perfumeNoteColor(d.head), perfumeNoteColor(d.heart), perfumeNoteColor(d.base)) : '#d988b9';
    const stageSec = perfumeStageSec(d.method, d.conc);
    const conc = CONCENTRATIONS[d.conc] || CONCENTRATIONS.fraiche;
    const value = ok3 ? perfumeValue(d.head, d.heart, d.base, d.method, d.conc, harmony.stars) : 0;
    const name = known ? P.creations[known].name : ok3 ? perfumeAutoName(d.head, d.heart, d.base, d.conc, harmony.classic) : '';
    const q = ok3 ? previewQuality([d.head, d.heart, d.base], conc.qty) : 0;
    const freeVat = P.vats.findIndex(v => !v);
    return {
        ok3,
        harmony,
        family,
        profile,
        cost,
        miss,
        known,
        secret: !known,
        color,
        stageSec,
        totalSec: stageSec * STAGES.length,
        bottles: conc.bottles,
        value,
        name,
        q,
        freeVat,
    };
}

// ---------------- composer ----------------
export function setPerfumeNote(tier, id) {
    const P = ensurePerfume();
    if (!['head', 'heart', 'base'].includes(tier)) return false;
    const allowed = tier === 'head' ? HEAD_NOTES : tier === 'heart' ? HEART_NOTES : BASE_NOTES;
    if (id && !allowed.includes(perfumeNoteBase(id))) return false;
    P.draft[tier] = id;
    return true;
}
export function setPerfumeMethod(m) {
    if (!METHODS[m]) return false;
    ensurePerfume().draft.method = m;
    return true;
}
export function setPerfumeConc(c) {
    if (!CONCENTRATIONS[c]) return false;
    ensurePerfume().draft.conc = c;
    return true;
}
export function setPerfumeBottle(b) {
    if (!BOTTLES[b]) return false;
    ensurePerfume().draft.bottle = b;
    return true;
}
export function setPerfumeCap(c) {
    if (!CAPS[c]) return false;
    ensurePerfume().draft.cap = c;
    return true;
}

// propose la meilleure pyramide faisable avec le stock actuel
export function applyBestPerfume() {
    const P = ensurePerfume();
    const qty = (CONCENTRATIONS[P.draft.conc] || CONCENTRATIONS.fraiche).qty;
    const heads = HEAD_NOTES.filter(id => perfumeNoteHave(id) >= qty);
    const hearts = HEART_NOTES.filter(id => perfumeNoteHave(id) >= qty);
    const bases = BASE_NOTES.filter(id => perfumeNoteHave(id) >= qty);
    if (!heads.length || !hearts.length || !bases.length) return null;
    let best = null;
    for (const h of heads) {
        for (const c of hearts) {
            for (const b of bases) {
                for (const m of METHOD_IDS) {
                    const har = perfumeHarmony(h, c, b, m);
                    const val = perfumeValue(h, c, b, m, P.draft.conc, har.stars);
                    const score = har.stars * 10000 + (har.classic ? 5000 : 0) + val;
                    if (!best || score > best.score) best = { head: h, heart: c, base: b, method: m, score };
                }
            }
        }
    }
    if (!best) return null;
    Object.assign(P.draft, { head: best.head, heart: best.heart, base: best.base, method: best.method });
    return best;
}

// ---------------- macération, soins et mise en flacon ----------------
export function startPerfume(at, d = ensurePerfume().draft) {
    if (!perfumeOpen()) return false;
    const P = ensurePerfume();
    const pv = perfumePreview(d);
    if (!pv.ok3 || pv.miss.length || pv.freeVat < 0) {
        if (pv.miss.length) {
            toast(`Il manque : ${pv.miss.map(([id, n]) => `${n - perfumeNoteHave(id)} ${perfumeNoteName(id).toLowerCase()}`).join(', ')}`, [
                'item',
                perfumeNoteBase(pv.miss[0][0]),
            ]);
            sfx('error');
        }
        return false;
    }
    let points = 0,
        units = 0;
    for (const [id, n] of Object.entries(pv.cost)) {
        points += takeNote(id, n);
        units += n;
    }
    const q = units ? scoreTier(points / units) : 0;
    const sig = sigOf(d);
    let pid = P.sig[sig];
    if (!pid) {
        pid = 'p' + P.next++;
        P.sig[sig] = pid;
        P.creations[pid] = {
            id: pid,
            name: pv.name,
            head: d.head,
            heart: d.heart,
            base: d.base,
            method: d.method,
            conc: d.conc,
            bottle: d.bottle || 'apothicaire',
            cap: d.cap || 'or',
            stars: pv.harmony.stars,
            family: pv.family,
            classic: pv.harmony.classic || null,
            color: pv.color,
            value: pv.value,
            made: 0,
            qmade: { s: 0, g: 0, p: 0, d: 0 },
            day: state.day,
            fav: false,
        };
    } else {
        // met à jour le flaconnage choisi si le joueur change de silhouette/bouchon
        P.creations[pid].bottle = d.bottle || P.creations[pid].bottle;
        P.creations[pid].cap = d.cap || P.creations[pid].cap;
    }
    P.vats[pv.freeVat] = {
        pid,
        stage: 0,
        stageSec: pv.stageSec,
        stageUntil: now() + pv.stageSec * 1000,
        cared: [false, false, false],
        finesse: 0,
        careBonus: 0,
        n: pv.bottles,
        q,
    };
    sfx('machine');
    buzz(15);
    if (at) burst(at, 'sparkle', 8);
    changed('perfume');
    return pid;
}

export const perfumeVatReady = v => !!v && v.stage >= STAGES.length;
export const perfumeVatCanCare = v => !!v && v.stage < STAGES.length && !v.cared[v.stage];

export function carePerfumeVat(i, choiceOrAt, maybeAt) {
    const P = ensurePerfume();
    const v = P.vats[i];
    if (!perfumeVatCanCare(v)) return false;
    const isChoice = choiceOrAt === 0 || choiceOrAt === 1 || choiceOrAt === 'quick' || choiceOrAt === 'deep';
    const at = isChoice ? maybeAt : choiceOrAt;
    const st = STAGES[v.stage];
    const ch = isChoice ? (choiceOrAt === 1 || choiceOrAt === 'deep' ? st.choices[1] : st.choices[0]) : st.choices[0];
    v.cared[v.stage] = ch.id;
    v.finesse = (v.finesse || 0) + 1;
    v.careBonus = (v.careBonus || 0) + ch.bonus;
    if (ch.speed > 0) {
        const left = Math.max(0, v.stageUntil - now());
        v.stageUntil = now() + Math.round(left * (1 - ch.speed));
    }
    sfx('pop');
    buzz(10);
    if (at) burst(at, 'sparkle', 10);
    toast(`${ch.name} · finesse ${v.finesse}/${STAGES.length} (+${Math.round(v.careBonus * 100)} %)`, ['ui', 'perfume']);
    changed('perfume');
    return true;
}

function advanceVat(v, t) {
    let ch = false;
    while (v && v.stage < STAGES.length && t >= v.stageUntil) {
        v.stage++;
        if (v.stage < STAGES.length) v.stageUntil += v.stageSec * 1000;
        ch = true;
    }
    return ch;
}

export function perfumeQual(pid) {
    const P = ensurePerfume();
    const q = (P.q[pid] = P.q[pid] || { s: 0, g: 0, p: 0, d: 0 });
    let over = q.s + q.g + q.p + q.d - (P.stock[pid] || 0);
    for (const k of ['s', 'g', 'p', 'd']) {
        if (over <= 0) break;
        const t = Math.min(q[k], over);
        q[k] -= t;
        over -= t;
    }
    return q;
}

function vatTouch(v) {
    if (!v || (v.finesse || 0) < STAGES.length) return null;
    const modes = (v.cared || []).map(x => (x === 'deep' ? 'deep' : x ? 'quick' : null)).filter(Boolean);
    if (modes.length < STAGES.length) return null;
    if (modes.every(m => m === 'deep')) return 'deep';
    if (modes.every(m => m === 'quick')) return 'quick';
    return 'mix';
}

export function bottlePerfume(i, at) {
    const P = ensurePerfume();
    const v = P.vats[i];
    if (!perfumeVatReady(v)) return false;
    const p = P.creations[v.pid];
    P.vats[i] = null;
    // 3 soins parfaits élèvent le rang qualité d'un cran (jusqu'à Diamant) et signent la touche du parfum
    const q = Math.min(4, (v.q || 0) + (v.finesse >= STAGES.length ? 1 : 0));
    const bonus = typeof v.careBonus === 'number' && v.careBonus > 0 ? v.careBonus : (v.finesse || 0) * PERFUME.careBonus;
    const baseVal = perfumeValue(p.head, p.heart, p.base, p.method, p.conc, p.stars);
    p.bestBonus = Math.max(p.bestBonus || 0, bonus);
    p.bestFinesse = Math.max(p.bestFinesse || 0, v.finesse || 0);
    p.value = Math.max(25, Math.round((baseVal * (1 + p.bestBonus)) / 5) * 5);
    const touch = vatTouch(v);
    if (touch && (!p.touch || touch === 'deep' || (touch === 'mix' && p.touch === 'quick'))) p.touch = touch;
    perfumeQual(v.pid);
    P.stock[v.pid] = (P.stock[v.pid] || 0) + v.n;
    p.qmade = p.qmade || { s: 0, g: 0, p: 0, d: 0 };
    if (q) {
        P.q[v.pid][QX.keys[q]] += v.n;
        p.qmade[QX.keys[q]] = (p.qmade[QX.keys[q]] || 0) + v.n;
    }
    p.made += v.n;
    state.stats.perfumes = (state.stats.perfumes || 0) + v.n;

    // Découvertes dans l'Orgue du Parfumeur
    let news = 0;
    for (const key of [perfumeNoteBase(p.head), perfumeNoteBase(p.heart), perfumeNoteBase(p.base), 'F:' + p.family, ...(p.classic ? ['C:' + p.classic] : [])]) {
        if (!P.organ[key]) {
            P.organ[key] = true;
            news++;
        }
    }
    const xp = Math.round(v.stageSec * STAGES.length * 0.08 + 18) * (0.85 + p.stars * 0.25);
    addXp(Math.round(xp), at);
    if (at) float(at, [`+${v.n}`, ['ui', 'perfume']], '', -20);
    if (touch) toast(`Touche « ${PERFUME_TOUCHES[touch]} » obtenue sur ${p.name} !`, ['ui', 'sparkle']);
    if (news) toast(`Orgue du Parfumeur : ${organCount()} / ${organTotal()} découvertes`, ['ui', 'perfume']);
    sfx('level');
    buzz(20);
    emit('perfume', p.id);
    changed('perfume');
    return true;
}

// ---------------- collection, vente, demande, renommage ----------------
export const perfumeOf = pid => state.perfume && state.perfume.creations[pid];
export const myPerfumes = () => (state.perfume ? Object.values(state.perfume.creations || {}) : []);
export const perfumeStock = pid => (state.perfume && state.perfume.stock[pid]) || 0;
export const isPerfumeFav = pid => !!(perfumeOf(pid) && perfumeOf(pid).fav);
export function togglePerfumeFav(pid) {
    const p = perfumeOf(pid);
    if (!p) return false;
    p.fav = !p.fav;
    return true;
}
export function renamePerfume(pid, name) {
    const p = perfumeOf(pid);
    const n = String(name || '').trim().slice(0, 22);
    if (!p || !n) return false;
    p.name = n;
    return true;
}
export function loadPerfumeDraft(pid) {
    const p = perfumeOf(pid);
    if (!p) return false;
    const P = ensurePerfume();
    Object.assign(P.draft, {
        head: p.head,
        heart: p.heart,
        base: p.base,
        method: p.method,
        conc: p.conc,
        bottle: p.bottle,
        cap: p.cap,
    });
    return true;
}

const demandNow = pid => {
    const d = state.perfume && state.perfume.demand && state.perfume.demand[pid];
    return d ? d.n * Math.pow(0.5, (now() - d.t) / 1000 / PERFUME.demandHalf) : 0;
};
export const perfumeDemandMult = pid => Math.max(PERFUME.demandFloor, 1 - PERFUME.demandPer * demandNow(pid));
export const perfumePrice = pid => {
    const p = perfumeOf(pid);
    return p ? Math.max(10, Math.round((p.value * perfumeDemandMult(pid)) / 5) * 5) : 0;
};

export function sellPerfume(pid, n, at) {
    const P = ensurePerfume();
    const p = perfumeOf(pid);
    const have = P.stock[pid] || 0;
    n = Math.min(have, n);
    if (!p || n <= 0) return false;
    const q = perfumeQual(pid);
    P.stock[pid] = have - n;
    // les meilleurs flacons partent ou les ordinaires d'abord selon bestFirst ; ici ordinaires d'abord pour garder le prestige
    let left = n;
    let total = 0;
    const unit = perfumePrice(pid);
    const ord = Math.max(0, have - (q.s + q.g + q.p + q.d));
    const takeOrd = Math.min(left, ord);
    total += takeOrd * unit;
    left -= takeOrd;
    for (const [r, k] of [
        [1, 's'],
        [2, 'g'],
        [3, 'p'],
        [4, 'd'],
    ]) {
        if (left <= 0) break;
        const t = Math.min(left, q[k]);
        q[k] -= t;
        left -= t;
        total += Math.round(t * unit * QUALITY[r].mult);
    }
    P.demand[pid] = { n: demandNow(pid) + n, t: now() };
    state.income.perfume = (state.income.perfume || 0) + total;
    earn(total, at);
    sfx('coin');
    changed('perfume');
    return true;
}

// ---------------- Parfum signature de la ferme ----------------
export function perfumeSignature() {
    const P = state.perfume;
    if (!P || !P.signature) return null;
    const p = P.creations && P.creations[P.signature];
    return p && p.made > 0 && p.stars >= PERFUME_SIGN.minStars ? p : null;
}
export function setPerfumeSignature(pid) {
    const P = ensurePerfume();
    if (!pid || P.signature === pid) {
        P.signature = null;
        toast('Parfum signature retiré', ['ui', 'perfume']);
        changed('perfume');
        return true;
    }
    const p = perfumeOf(pid);
    if (!p || !p.made || p.stars < PERFUME_SIGN.minStars) return false;
    P.signature = pid;
    const pct = Math.round(perfumeSignatureSalonBonus() * 100);
    toast(`« ${p.name} » devient votre Parfum signature (+${pct} % au Salon, +${PERFUME_SIGN.giftBonus} amitié) !`, ['ui', 'perfume']);
    sfx('level');
    changed('perfume');
    return true;
}
export function perfumeSignatureSalonBonus() {
    const s = perfumeSignature();
    return s ? PERFUME_SIGN.salonBonus[Math.min(3, s.stars)] || 0 : 0;
}

// ---------------- Offrir un parfum à un villageois (cadeau du jour) ----------------
export function perfumeGiftPts(vid, pid) {
    const p = perfumeOf(pid);
    const v = VILLAGERS[vid];
    if (!p || !v) return 0;
    let pts = PERFUME_GIFT.base[p.conc] || 3;
    if (p.stars >= 3) pts += PERFUME_GIFT.star3;
    if (p.classic) pts += PERFUME_GIFT.classic;
    const notes = [perfumeNoteBase(p.head), perfumeNoteBase(p.heart), perfumeNoteBase(p.base)];
    if (notes.some(id => id === LOVES[vid] || (v.likes && v.likes.includes(id)))) pts += PERFUME_GIFT.matchNote;
    if (state.perfume && state.perfume.signature === pid) pts += PERFUME_SIGN.giftBonus;
    return pts * (isBirthday(vid) ? GIFT_PTS.birthday : 1);
}
export function perfumeGiftable(vid) {
    if (!perfumeOpen() || !state.perfume) return [];
    return myPerfumes()
        .filter(p => perfumeStock(p.id) > 0)
        .sort((a, b) => perfumeGiftPts(vid, b.id) - perfumeGiftPts(vid, a.id) || b.value - a.value);
}
export function giftPerfume(vid, pid, at) {
    const P = ensurePerfume();
    const p = perfumeOf(pid);
    const v = state.villagers && state.villagers[vid];
    const have = P.stock[pid] || 0;
    if (!p || !v || v.giftDay === state.day || have < 1) return false;
    const pts = perfumeGiftPts(vid, pid);
    // consomme un flacon ordinaire d'abord (ou le plus bas rang) pour préserver les flacons diamant
    const q = perfumeQual(pid);
    P.stock[pid] = have - 1;
    const ord = Math.max(0, have - (q.s + q.g + q.p + q.d));
    if (ord <= 0) {
        for (const k of ['s', 'g', 'p', 'd']) {
            if (q[k] > 0) {
                q[k]--;
                break;
            }
        }
    }
    v.giftDay = state.day;
    addFriendship(vid, pts, at);
    state.stats.perfumeGifts = (state.stats.perfumeGifts || 0) + 1;
    sfx('buy');
    if (at) burst(at, 'sparkle', 14);
    toast(`${VILLAGERS[vid].name} : « Quel parfum raffiné, merci ! » +${pts} d’amitié`, ['villager', vid]);
    changed('perfume');
    return true;
}

// ---------------- Coffre-fort (rangement / reprise d'un flacon précieux) ----------------
export function takePerfumeForVault(pid) {
    const P = ensurePerfume();
    const p = perfumeOf(pid);
    const have = P.stock[pid] || 0;
    if (!p || have < 1) return null;
    const q = perfumeQual(pid);
    // range le meilleur flacon disponible en priorité (diamant -> platine -> or -> argent -> ordinaire)
    let rank = 0;
    for (const [r, k] of [
        [4, 'd'],
        [3, 'p'],
        [2, 'g'],
        [1, 's'],
    ]) {
        if (q[k] > 0) {
            q[k]--;
            rank = r;
            break;
        }
    }
    P.stock[pid] = have - 1;
    changed('perfume');
    return {
        pid,
        name: p.name,
        bottle: p.bottle,
        cap: p.cap,
        color: p.color,
        stars: p.stars,
        classic: p.classic || null,
        family: p.family,
        conc: p.conc,
        value: p.value,
        q: rank,
    };
}
export function restorePerfumeFromVault(pf) {
    if (!pf || !pf.pid) return false;
    const P = ensurePerfume();
    if (!P.creations[pf.pid]) {
        P.creations[pf.pid] = {
            id: pf.pid,
            name: pf.name,
            head: 'lemon',
            heart: 'lavender',
            base: 'resin',
            method: 'enfleurage',
            conc: pf.conc || 'fraiche',
            bottle: pf.bottle || 'apothicaire',
            cap: pf.cap || 'or',
            stars: pf.stars || 0,
            family: pf.family || 'floral',
            classic: pf.classic || null,
            color: pf.color || '#d988b9',
            value: pf.value || 50,
            made: 1,
            qmade: { s: 0, g: 0, p: 0, d: 0 },
            day: state.day,
            fav: false,
        };
    }
    P.stock[pf.pid] = (P.stock[pf.pid] || 0) + 1;
    if (pf.q) {
        const q = perfumeQual(pf.pid);
        q[QX.keys[pf.q]] = (q[QX.keys[pf.q]] || 0) + 1;
    }
    changed('perfume');
    return true;
}

// ---------------- Salon : commandes « Portrait olfactif » ----------------
function makePerfumeOrder(t) {
    const vid = pickRand(PERFUME_ORDERS.villagers);
    const family = pickRand(FAMILY_IDS);
    const minStars = Math.random() < 0.35 ? 2 : 1;
    const conc = Math.random() < 0.35 ? pickRand(['toilette', 'extrait']) : null;
    const qty = conc === 'extrait' ? 1 : 1 + Math.floor(Math.random() * 2);
    return {
        id: 'po' + Math.floor(t) + Math.floor(Math.random() * 999),
        vid,
        family,
        minStars,
        conc,
        qty,
    };
}
export function perfumeOrderText(o) {
    const fam = FAMILIES[o.family];
    const parts = [`un parfum ${fam ? fam.name.toLowerCase() : 'floral'}`];
    if (o.conc) parts.push(`en ${CONCENTRATIONS[o.conc].name.toLowerCase()}`);
    if (o.minStars >= 2) parts.push(`d’au moins ${o.minStars} étoiles`);
    return `${o.qty} flacon${o.qty > 1 ? 's' : ''} d’${parts.join(', ').replace(/^un /, '')}`;
}
export function perfumeOrderMatches(o) {
    if (!o) return [];
    const rankConc = c => CONC_IDS.indexOf(c);
    return myPerfumes()
        .filter(
            p =>
                perfumeStock(p.id) >= o.qty &&
                p.family === o.family &&
                p.stars >= (o.minStars || 0) &&
                (!o.conc || rankConc(p.conc) >= rankConc(o.conc)),
        )
        .sort((a, b) => b.value - a.value);
}
export function perfumeOrderPay(o, pid) {
    const p = perfumeOf(pid);
    if (!p) return 0;
    const q = perfumeQual(pid);
    let bestQ = 0;
    for (const [r, k] of [
        [4, 'd'],
        [3, 'p'],
        [2, 'g'],
        [1, 's'],
    ]) {
        if (q[k] >= o.qty) {
            bestQ = r;
            break;
        }
    }
    const signMult = 1 + perfumeSignatureSalonBonus();
    return Math.round((p.value * o.qty * PERFUME_ORDERS.payMult * signMult * QUALITY[bestQ].mult) / 5) * 5;
}
export function deliverPerfumeOrder(oid, pid, at) {
    const P = ensurePerfume();
    const idx = P.orders.findIndex(x => x.id === oid);
    if (idx < 0) return false;
    const o = P.orders[idx];
    const matches = perfumeOrderMatches(o);
    const pick = pid ? matches.find(m => m.id === pid) : matches[0];
    if (!pick) return false;
    const pay = perfumeOrderPay(o, pick.id);
    // consomme les meilleurs flacons d'abord pour les commandes de prestige
    const q = perfumeQual(pick.id);
    P.stock[pick.id] -= o.qty;
    let left = o.qty;
    for (const k of ['d', 'p', 'g', 's']) {
        if (left <= 0) break;
        const t = Math.min(left, q[k]);
        q[k] -= t;
        left -= t;
    }
    P.orders.splice(idx, 1);
    state.income.perfume = (state.income.perfume || 0) + pay;
    earn(pay, at);
    addXp(Math.round(60 + pay * 0.04), at);
    if (VILLAGERS[o.vid]) addFriendship(o.vid, 2);
    addRenom(RENOM.order || 1);
    state.stats.perfumeOrders = (state.stats.perfumeOrders || 0) + 1;
    sfx('level');
    buzz(20);
    if (at) burst(at, 'sparkle', 14);
    toast(`${VILLAGERS[o.vid] ? VILLAGERS[o.vid].name : 'Client'} est ravi de « ${pick.name} » !`, ['ui', 'perfume']);
    changed('perfume');
    return true;
}
export function dismissPerfumeOrder(oid) {
    const P = ensurePerfume();
    const idx = P.orders.findIndex(x => x.id === oid);
    if (idx < 0) return false;
    P.orders.splice(idx, 1);
    return true;
}
export const perfumeOrdersReady = () => (perfumeOpen() && state.perfume ? state.perfume.orders.filter(o => perfumeOrderMatches(o).length > 0).length : 0);

// ---------------- L'Orgue du Parfumeur (collection & récompenses) ----------------
export const organTotal = () => ALL_NOTE_IDS.length + FAMILY_IDS.length + PERFUME_CLASSICS.length;
export const organCount = () => (state.perfume && state.perfume.organ ? Object.keys(state.perfume.organ).length : 0);
export const organClaimable = () => {
    if (!perfumeOpen() || !state.perfume) return 0;
    const tiers = Math.floor(organCount() / PERFUME_ORGAN.step);
    return Math.max(0, tiers - (state.perfume.organClaimed || 0));
};
export function claimOrgan(at) {
    if (!organClaimable()) return false;
    const P = ensurePerfume();
    P.organClaimed = (P.organClaimed || 0) + 1;
    const coins = PERFUME_ORGAN.coins * P.organClaimed;
    earn(coins, at);
    addXp(PERFUME_ORGAN.xp * P.organClaimed, at);
    giveRare(pickRand(RARE), 2, at);
    if (!P.organRibbon && organCount() >= organTotal() && P.organClaimed * PERFUME_ORGAN.step >= organTotal()) {
        P.organRibbon = true;
        state.prestige.rubans++;
        toast('Orgue du Parfumeur complet : +1 ruban !', ['ui', 'perfume']);
    } else {
        toast(`Palier de l’Orgue : +${coins.toLocaleString('fr-FR')} pièces !`, ['ui', 'perfume']);
    }
    sfx('level');
    if (at) burst(at, 'sparkle', 16);
    return true;
}

// ---------------- ticks & hors-ligne ----------------
export function perfumeTick() {
    if (!perfumeOpen()) return false;
    const P = ensurePerfume();
    const t = now();
    let ch = false;
    for (const v of P.vats) {
        if (v && advanceVat(v, t)) ch = true;
    }
    if (!P.nextOrder) P.nextOrder = t + 30000;
    if (P.orders.length < PERFUME_ORDERS.max && t >= P.nextOrder) {
        P.orders.push(makePerfumeOrder(t));
        P.nextOrder = t + PERFUME_ORDERS.every * 1000;
        ch = true;
    }
    return ch;
}
export function perfumeOffline() {
    if (!perfumeOpen() || !state.perfume) return 0;
    const P = ensurePerfume();
    const t = now();
    let ready = 0;
    for (const v of P.vats) {
        if (!v) continue;
        advanceVat(v, t);
        if (perfumeVatReady(v)) ready++;
    }
    return ready;
}
export const perfumeCareCount = () => (perfumeOpen() && state.perfume ? state.perfume.vats.filter(perfumeVatCanCare).length : 0);
export const perfumeReadyCount = () => (perfumeOpen() && state.perfume ? state.perfume.vats.filter(perfumeVatReady).length : 0);
export const perfumePending = () => perfumeReadyCount() + perfumeOrdersReady() + (organClaimable() ? 1 : 0);
export const capFirstWord = capFirst;
