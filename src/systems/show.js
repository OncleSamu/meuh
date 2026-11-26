// Les concours du haras (1.24 → 1.180 Concours hippiques 2.0) :
// - Concours Express quotidiens (3 épreuves/jour, jugement immédiat, mini-jeu ou Jules, Éperons d'or, rosettes & titres)
// - Concours de la semaine & Grand Prix du mois (100 % rétrocompatibles + Éperons d'or)
// - Échauffement tactique avant le départ (+4 à +8 pts et mini-jeu plus tolérant)
// - Pouvoirs permanents des chevaux Titrés & Grands Champions (forme, entraînement, crin, randonnées, lignée)
// - Boutique des Éperons d'or & Palmarès à 5 paliers permanents conservés au Prestige.

import { state, ecoLvl } from '../core/state.js';
import { now } from '../core/clock.js';
import { dateKey, fmt } from '../core/format.js';
import { emit, toast, sfx, buzz } from '../core/bus.js';
import {
    SHOW,
    DISC,
    DISCIPLINES,
    FORM,
    SHOW_EXPRESS,
    SHOW_PREPS,
    SHOW_SHOP,
    SHOW_PALM_TIERS,
} from '../data/haras.js';
import { DECOS } from '../data/farm.js';
import { ITEMS } from '../data/items.js';
import { weekStart, weekKey } from './events.js';
import { earn, addXp } from './player.js';
import { addPhoto } from './style.js';
import { champWon } from './stud.js';
import { tip } from './tips.js';
import { ensureTcg } from './tcg.js';
import { harasOpen, horseByUid, lodged, aptOf, aptCap, rec, startPass, equipApt, equipPres } from './haras.js';
import { showWinsTotal, showPalmTotals } from './showfx.js';

export const showOpen = () => harasOpen();
export function ensureShow() {
    if (!state.show) {
        state.show = {
            rose: [0, 0, 0, 0, 0],
            cups: 0,
            wins: 0,
            titles: {},
            div: 0,
            entries: [],
            gp: null,
            last: null,
            lastAll: null,
            gpDone: 0,
        };
    }
    const s = state.show;
    s.rose ||= [0, 0, 0, 0, 0];
    s.titles ||= {};
    // 1.24.3 : trois inscriptions par semaine (une ancienne inscription unique devient la première)
    if (!s.entries) s.entries = s.entry ? [s.entry] : [];
    delete s.entry;
    // 1.180 : champs Concours hippiques 2.0
    if (!Number.isFinite(s.spurs)) s.spurs = 0;
    s.palmClaimed ||= {};
    if (!Number.isFinite(s.goldOatsUntil)) s.goldOatsUntil = 0;
    if (!Number.isFinite(s.elixirs)) s.elixirs = 0;
    s.preps ||= {};
    if (!Array.isArray(s.express)) s.express = [];
    return s;
}
const clamp = (x, a = 0, b = 100) => Math.max(a, Math.min(b, x));

export function showSpurs() {
    return ensureShow().spurs;
}

// ---------------- 1.180 : échauffement tactique avant le départ ----------------
export const SHOW_PREP_BY_ID = Object.fromEntries(SHOW_PREPS.map(p => [p.id, p]));
export function prepOf(uid) {
    const id = state.show && state.show.preps && state.show.preps[uid];
    return id ? SHOW_PREP_BY_ID[id] || null : null;
}
export function prepBonus(uid, disc) {
    const p = prepOf(uid);
    if (!p) return 0;
    return p.prefDiscs.includes(disc) ? p.prefBonus : p.bonus;
}
export function prepMiniBonus(uid) {
    const p = prepOf(uid);
    return p ? p.miniBoost : 0;
}
export function prepCostMode(p) {
    if (p.item && (state.inventory[p.item] || 0) >= p.qty) return 'item';
    return 'coins';
}
export function canApplyPrep(uid, prepId) {
    const a = horseByUid(uid);
    const p = SHOW_PREP_BY_ID[prepId];
    if (!showOpen() || !a || !a.box || !p) return false;
    if (ensureShow().preps[uid] === prepId) return false;
    if (p.item && (state.inventory[p.item] || 0) >= p.qty) return true;
    return state.money >= p.coins;
}
export function applyPrep(uid, prepId, at) {
    if (!canApplyPrep(uid, prepId)) {
        sfx('error');
        return false;
    }
    const p = SHOW_PREP_BY_ID[prepId];
    const a = horseByUid(uid);
    if (p.item && (state.inventory[p.item] || 0) >= p.qty) {
        state.inventory[p.item] -= p.qty;
    } else {
        state.money -= p.coins;
    }
    ensureShow().preps[uid] = prepId;
    sfx('pop');
    toast(`${a.name} : ${p.name.toLowerCase()} prêt pour le prochain départ`, p.icon);
    emit('changed', 'show');
    return true;
}
export function consumePrep(uid) {
    if (state.show && state.show.preps && state.show.preps[uid]) {
        delete state.show.preps[uid];
    }
}

// ---------------- le calendrier ----------------
export const weekIdx = (d = weekStart()) => Math.floor(d.getTime() / (7 * 864e5));
export const weekDisc = (d = weekStart()) => SHOW.rot[((weekIdx(d) % 4) + 4) % 4];
export const showEndsIn = () => (weekStart().getTime() + 7 * 864e5 - now()) / 1000;
// le Grand Prix : le premier week-end du mois (le samedi du 1er au 7, et son dimanche)
const isGpDay = d => (d.getDay() === 6 && d.getDate() <= 7) || (d.getDay() === 0 && d.getDate() <= 8);
const dayStart = d => new Date(d.getFullYear(), d.getMonth(), d.getDate());
export const gpActive = (d = new Date(now())) => isGpDay(d);
export const gpKey = (d = new Date(now())) => (isGpDay(d) ? 'gp-' + dateKey(dayStart(new Date(d.getTime() - (d.getDay() === 0 ? 864e5 : 0)))) : null);
// la date (ms) de la fin du Grand Prix en cours ou du début du prochain
export function gpAt(from = new Date(now())) {
    if (isGpDay(from)) {
        const d = dayStart(from);
        return d.getTime() + (d.getDay() === 6 ? 2 : 1) * 864e5;
    }
    for (let k = 0; k < 40; k++) {
        const d = new Date(from.getFullYear(), from.getMonth(), from.getDate() + k);
        if (isGpDay(d) && d.getDay() === 6) return d.getTime();
    }
    return from.getTime() + 7 * 864e5;
}

// ---------------- les divisions et la note ----------------
export const divOpen = i => i === 0 || ensureShow().rose[i - 1] >= SHOW.open;
export const divsOpen = () => SHOW.divs.map((d, i) => i).filter(divOpen);
export const purseOf = (div, mult = 1) =>
    Math.round((SHOW.divs[div].purse * mult * (1 + ecoLvl() / 60) * (1 + showPalmTotals().purse)) / 10) * 10;
export const feeOf = (div, mult = 1) => Math.ceil(purseOf(div, mult) * SHOW.fee);
// la note prévue d'un cheval dans une discipline ; `pass` : le passage joué (0 à 1), ou null quand Jules monte
export function showNote(a, disc, pass = null) {
    const apt = clamp(aptOf(a, disc) + equipApt(a, disc));
    const p = pass == null ? SHOW.jules * apt : clamp(pass * 100);
    const pres = clamp(SHOW.presBase + SHOW.presLove * Math.min(5, a.love || 0) + equipPres(a));
    const spec = rec(a).spec === disc ? SHOW.spec : 1;
    const prep = a ? prepBonus(a.uid, disc) : 0;
    const palm = showPalmTotals().note;
    const note = clamp((SHOW.wApt * apt + SHOW.wPass * p + SHOW.wPres * pres) * spec + prep + palm);
    return { apt, pass: p, pres, spec: spec > 1, prep, palm, note, jules: pass == null };
}
// la note qu'on peut espérer avec un bon passage (affichée avant l'inscription)
export const showHope = (a, disc) => showNote(a, disc, 0.75).note;

// cinq rivales, tirées de la clé de la semaine : toujours les mêmes pour tout le monde
function seeded(key) {
    let h = 2166136261;
    for (const c of key) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
    return () => {
        h = Math.imul(h ^ (h >>> 15), 2246822507);
        h = Math.imul(h ^ (h >>> 13), 3266489909);
        return ((h ^= h >>> 16) >>> 0) / 4294967296;
    };
}
export function rivalsFor(key, div) {
    const r = seeded(key + '|' + div),
        [lo, hi] = SHOW.divs[div].rivals;
    const pool = [...SHOW.names];
    return Array.from({ length: SHOW.rivalsN }, () => ({
        name: pool.splice(Math.floor(r() * pool.length), 1)[0],
        note: Math.round((lo + (hi - lo) * r()) * 10) / 10,
    }));
}
export function ranking(key, div, myNote, myName, more = []) {
    const list = rivalsFor(key, div);
    if (myNote != null) list.push({ name: myName, note: Math.round(myNote * 10) / 10, me: true });
    more.forEach(m => list.push({ name: m.name, note: Math.round(m.note * 10) / 10, me: true, uid: m.uid }));
    return list.sort((x, y) => y.note - x.note || (y.me ? 1 : 0) - (x.me ? 1 : 0));
}

// ---------------- 1.180 : Concours Express quotidiens (3 épreuves/jour, jugement immédiat) ----------------
export function expressList() {
    const s = ensureShow();
    const today = dateKey(new Date(now()));
    if (s.expressKey !== today || s.express.length !== SHOW_EXPRESS.perDay) {
        const r = seeded('show-ex|' + today);
        const pool = [...SHOW_EXPRESS.themes];
        const picked = [];
        const usedDiscs = new Set();
        while (picked.length < SHOW_EXPRESS.perDay && pool.length) {
            // privilégier des disciplines variées dans les 3 épreuves du jour
            const fresh = pool.filter(t => !usedDiscs.has(t.disc));
            const src = fresh.length ? fresh : pool;
            const t = src[Math.floor(r() * src.length)];
            pool.splice(pool.indexOf(t), 1);
            usedDiscs.add(t.disc);
            picked.push({
                idx: picked.length,
                id: t.id,
                disc: t.disc,
                name: t.name,
                sub: t.sub,
                done: false,
                result: null,
            });
        }
        s.expressKey = today;
        s.express = picked;
    }
    return s.express;
}
export function expressLeft() {
    return expressList().filter(e => !e.done).length;
}
export function startExpressPass(uid, idx) {
    const list = expressList();
    const ev = list[idx];
    if (!showOpen() || !ev || ev.done) return null;
    return startPass(uid);
}
export function finishExpress(uid, idx, div, passScore, at = null) {
    const s = ensureShow();
    const list = expressList();
    const ev = list[idx];
    const a = horseByUid(uid);
    if (!showOpen() || !ev || ev.done || !a || !divOpen(div)) return null;

    const sn = showNote(a, ev.disc, passScore);
    const key = `ex-${s.expressKey}-${idx}`;
    const ranks = ranking(key, div, sn.note, a.name);
    const place = ranks.findIndex(x => x.me) + 1;
    const crush = place === 1 && ranks.length > 1 && ranks[0].note - ranks[1].note >= SHOW.crush;
    const coins = place <= 3 ? Math.round(purseOf(div, SHOW_EXPRESS.purseMult) * SHOW_EXPRESS.places[place - 1]) : 0;
    const baseSpurs = place <= 3 ? SHOW_EXPRESS.spurs[place - 1] : 0;
    const spurs = baseSpurs + (place === 1 && (div >= 3 || crush) ? 1 : 0);
    const xp = place <= 3 ? SHOW_EXPRESS.xp[place - 1] + div * 12 : 12 + div * 4;
    const rosette = place === 1;

    const out = {
        kind: 'express',
        key,
        idx,
        evName: ev.name,
        div,
        disc: ev.disc,
        uid,
        name: a.name,
        place,
        note: Math.round(sn.note * 10) / 10,
        list: ranks.map(x => ({ name: x.name, note: x.note, me: !!x.me, mine: !!x.me })),
        coins,
        spurs,
        xp,
        rosette,
        cup: place === 1,
        crush,
        ribbon: 0,
        deco: null,
        jules: passScore == null,
        seen: false,
    };

    consumePrep(uid);
    if (coins) {
        earn(coins, at);
        state.income.haras = (state.income.haras || 0) + coins;
    }
    if (spurs) s.spurs += spurs;
    if (rosette) s.rose[div] += crush ? 2 : 1;
    if (place === 1) {
        s.cups++;
        s.wins++;
        s.titles[uid] = (s.titles[uid] || 0) + 1;
        out.ribbon += champWon(uid, div);
        const dId = div > 0 ? SHOW.decos[div - 1] : null;
        if (dId && !s['deco' + div]) {
            s['deco' + div] = true;
            state.decorInv[dId] = (state.decorInv[dId] || 0) + 1;
            out.deco = dId;
        }
    }
    if (out.ribbon) state.prestige.rubans += out.ribbon;
    addXp(xp, at);

    ev.done = true;
    ev.result = out;
    s.expressLast = out;
    tip('show');
    if (place === 1) {
        sfx('level');
        buzz(25);
    } else {
        sfx('pop');
    }
    toast(
        place === 1
            ? `${a.name} remporte « ${ev.name} » ! +${fmt(coins)} pièces, +${spurs} Éperons`
            : `${a.name} finit ${place}e sur « ${ev.name} »${spurs ? ` (+${spurs} Éperon${spurs > 1 ? 's' : ''})` : ''}`,
        ['ui', place === 1 ? 'hCup2' : 'hCup0'],
    );
    emit('changed', 'show');
    return out;
}
export function runExpressJules(uid, idx, div, at = null) {
    if (!startExpressPass(uid, idx)) return null;
    return finishExpress(uid, idx, div, null, at);
}

// ---------------- 1.180 : Boutique des Éperons & Palmarès ----------------
export function canBuyShowShop(itemId, uid = null) {
    const s = ensureShow();
    const item = SHOW_SHOP.find(x => x.id === itemId);
    if (!showOpen() || !item || s.spurs < item.cost) return false;
    if (itemId === 'fullCare') return lodged().length > 0;
    if (itemId === 'manual') {
        const a = horseByUid(uid);
        if (!a || !a.box) return false;
        return DISCIPLINES.some(d => aptOf(a, d.id) < aptCap(a, d.id));
    }
    return true;
}

export function buyShowShop(itemId, uid = null, at = null) {
    if (!canBuyShowShop(itemId, uid)) {
        sfx('error');
        return false;
    }
    const s = ensureShow();
    const item = SHOW_SHOP.find(x => x.id === itemId);
    s.spurs -= item.cost;

    if (itemId === 'goldOats') {
        const base = Math.max(now(), s.goldOatsUntil || 0);
        s.goldOatsUntil = base + 4 * 3600000;
        sfx('level');
        toast('Avoine dorée active pour 4 h : forme ×2 et +35 % entraînement !', ['item', 'oat']);
    } else if (itemId === 'fullCare') {
        const horses = lodged();
        for (const a of horses) {
            const r = rec(a);
            r.form = FORM.max;
            r.t = now();
            if ((a.love || 0) < 5) a.love = (a.love || 0) + 1;
        }
        sfx('level');
        toast(`Soin complet : ${horses.length} cheval${horses.length > 1 ? 'aux' : ''} remis à 5/5 de forme !`, ['ui', 'hForme']);
    } else if (itemId === 'manual') {
        const a = horseByUid(uid);
        const r = rec(a);
        const pref = r.spec && DISC[r.spec] && aptOf(a, r.spec) < aptCap(a, r.spec) ? r.spec : null;
        const target = pref || DISCIPLINES.find(d => aptOf(a, d.id) < aptCap(a, d.id))?.id;
        if (target) {
            const cap = aptCap(a, target);
            const before = aptOf(a, target);
            r.pts[target] = Math.min(cap, before + 6);
            const gained = r.pts[target] - before;
            sfx('level');
            toast(`${a.name} progresse : +${gained} pts en ${DISC[target].name.toLowerCase()} !`, DISC[target].icon);
        }
    } else if (itemId === 'elixir') {
        s.elixirs = (s.elixirs || 0) + 1;
        sfx('level');
        toast('Élixir de galop ajouté : actif à la prochaine naissance de poulain !', ['ui', 'sparkle']);
    } else if (itemId === 'booster') {
        const T = ensureTcg();
        T.freePacks = (T.freePacks || 0) + 1;
        state.prestige.rubans += 1;
        sfx('level');
        toast('Pack reçu : +1 booster MeuhCG et +1 ruban de Prestige !', ['ui', 'ribbon']);
    }
    emit('changed', 'show');
    emit('changed', 'haras');
    return true;
}

export function showPalmState() {
    const s = ensureShow();
    const wins = showWinsTotal();
    return SHOW_PALM_TIERS.map(t => {
        const reached = wins >= t.need;
        const claimed = !!s.palmClaimed[t.id];
        return { ...t, wins, reached, claimed, canClaim: reached && !claimed };
    });
}

export function claimShowPalm(tierId, at = null) {
    const s = ensureShow();
    const tier = SHOW_PALM_TIERS.find(t => t.id === tierId);
    if (!tier || showWinsTotal() < tier.need || s.palmClaimed[tierId]) return false;
    s.palmClaimed[tierId] = true;
    state.prestige.rubans += tier.rubans;
    s.spurs += tier.spurs;
    addXp(tier.need * 10, at);
    sfx('level');
    buzz(28);
    toast(`Palier « ${tier.name} » débloqué ! +${tier.rubans} rubans, +${tier.spurs} Éperons`, ['ui', 'hCouronne']);
    emit('changed', 'show');
    return true;
}

// ---------------- s'inscrire, jouer (concours hebdomadaire & Grand Prix) ----------------
// 1.24.3 : jusqu'à trois chevaux différents par semaine, chacun dans sa division
export const entriesNow = () => ensureShow().entries.filter(e => e.key === weekKey());
export const entryOf = uid => entriesNow().find(e => e.uid === uid) || null;
export const entriesLeft = () => SHOW.entries - entriesNow().length;
export function enterShow(uid, div, at) {
    const s = ensureShow(),
        a = horseByUid(uid);
    if (!showOpen() || !a || !a.box || !divOpen(div)) return false;
    const e = entryOf(uid);
    if (e && e.passage != null) return toast('Le passage de ce cheval est déjà joué', ['ui', 'hCup0']), false;
    if (!e && entriesLeft() <= 0) return toast(`${SHOW.entries} chevaux au plus par semaine`, ['ui', 'hCup0']), sfx('error'), false;
    const fee = feeOf(div);
    // changer de division avant le passage : l'inscription est remboursée
    const back = e ? e.fee : 0;
    if (state.money + back < fee) return toast('Pas assez de pièces pour l’inscription', ['ui', 'coin']), sfx('error'), false;
    state.money += back - fee;
    s.div = div;
    const ne = { key: weekKey(), uid, div, disc: weekDisc(), passage: null, fee };
    if (e) s.entries[s.entries.indexOf(e)] = ne;
    else s.entries.push(ne);
    tip('show');
    sfx('pop');
    emit('changed', 'show');
    return true;
}
// retirer un cheval avant son passage : l'inscription est remboursée
export function withdrawShow(uid) {
    const s = ensureShow(),
        e = entryOf(uid);
    if (!e || e.passage != null) return false;
    state.money += e.fee;
    s.entries.splice(s.entries.indexOf(e), 1);
    emit('changed', 'show');
    return true;
}
export function startShowPass(uid) {
    const e = entryOf(uid);
    if (!e || e.passage != null) return null;
    return startPass(uid);
}
export function endShowPass(uid, score) {
    const e = entryOf(uid);
    if (!e || e.passage != null) return null;
    e.passage = clamp(score, 0, 1);
    e.prepUsed = prepBonus(uid, e.disc);
    consumePrep(uid);
    addXp(15);
    emit('changed', 'show');
    return showNote(horseByUid(uid), e.disc, e.passage);
}
// le Grand Prix : un cheval, les quatre épreuves
export const gpOf = () => {
    const g = ensureShow().gp;
    return g && g.key === gpKey() ? g : null;
};
export function enterGp(uid, div) {
    const s = ensureShow(),
        a = horseByUid(uid);
    const key = gpKey();
    if (!showOpen() || !key || !a || !a.box || !divOpen(div)) return false;
    if (s.gp && s.gp.key === key) return false;
    const fee = feeOf(div, SHOW.gpMult);
    if (state.money < fee) return toast('Pas assez de pièces pour l’inscription', ['ui', 'coin']), sfx('error'), false;
    state.money -= fee;
    s.gp = { key, uid, div, passes: {}, fee };
    sfx('pop');
    emit('changed', 'show');
    return true;
}
export function startGpPass(uid, disc) {
    const g = gpOf();
    if (!g || g.uid !== uid || g.passes[disc] != null) return null;
    return startPass(uid);
}
export function endGpPass(uid, disc, score) {
    const g = gpOf();
    if (!g || g.uid !== uid || g.passes[disc] != null) return null;
    g.passes[disc] = clamp(score, 0, 1);
    addXp(15);
    emit('changed', 'show');
    return showNote(horseByUid(uid), disc, g.passes[disc]);
}

// ---------------- les résultats ----------------
export function showCharm() {
    const s = state.show;
    if (!s) return 0;
    return Math.min(SHOW.charmCap, s.cups * SHOW.cupCharm + s.rose.reduce((x, y) => x + y, 0) * SHOW.roseCharm);
}
// la note d'une inscription (moyenne des quatre épreuves au Grand Prix)
function entryNote(e, kind) {
    const a = horseByUid(e.uid);
    const discs = kind === 'gp' ? SHOW.rot : [e.disc];
    const notes = discs.map(d => {
        if (!a) return 0;
        const base = showNote(a, d, kind === 'gp' ? (e.passes[d] ?? null) : e.passage).note;
        return clamp(base + (kind !== 'gp' && e.prepUsed ? e.prepUsed : 0));
    });
    return notes.reduce((x, y) => x + y, 0) / notes.length;
}
// `list` : le classement commun quand plusieurs de vos chevaux courent dans la même division
function settle(e, kind, shared = null) {
    const s = ensureShow(),
        a = horseByUid(e.uid);
    const note = entryNote(e, kind);
    const played = kind === 'gp' ? Object.keys(e.passes).length : e.passage != null ? 1 : 0;
    const list = shared || ranking(e.key, e.div, note, a ? a.name : 'Votre cheval');
    const place = shared ? list.findIndex(x => x.uid === e.uid) + 1 : list.findIndex(x => x.me) + 1;
    const mult = kind === 'gp' ? SHOW.gpMult : 1;
    const coins = place <= 3 ? Math.round(purseOf(e.div, mult) * SHOW.places[place - 1]) : 0;
    const spurs = place <= 3 ? [6, 4, 2][place - 1] * mult : 0;
    const rosette = place <= 2;
    // 1.24.5 : une victoire écrasante (loin devant la 2e) compte deux rosettes : les divisions trop faciles passent vite
    const crush = place === 1 && list.length > 1 && list[0].note - list[1].note >= SHOW.crush;
    const out = {
        kind,
        key: e.key,
        div: e.div,
        disc: kind === 'gp' ? null : e.disc,
        uid: e.uid,
        name: a ? a.name : 'Votre cheval',
        place,
        note: Math.round(note * 10) / 10,
        list: list.map(x => ({ name: x.name, note: x.note, me: x.me && (!shared || x.uid === e.uid), mine: !!x.me })),
        coins,
        spurs,
        rosette,
        cup: place === 1,
        crush,
        ribbon: 0,
        deco: null,
        jules: played === 0,
        seen: false,
    };
    if (coins) {
        earn(coins, null);
        state.income.haras = (state.income.haras || 0) + coins;
    }
    if (spurs) s.spurs += spurs;
    if (rosette) s.rose[e.div] += crush ? 2 : 1;
    if (place === 1) {
        s.cups++;
        s.wins++;
        s.titles[e.uid] = (s.titles[e.uid] || 0) + 1;
        if (e.div >= 3) out.ribbon++;
        out.ribbon += champWon(e.uid, e.div);
        const dId = e.div > 0 ? SHOW.decos[e.div - 1] : null;
        if (dId && !s['deco' + e.div]) {
            s['deco' + e.div] = true;
            state.decorInv[dId] = (state.decorInv[dId] || 0) + 1;
            out.deco = dId;
        }
        addPhoto('ui', 'hCup2', kind === 'gp' ? 'Grand Prix gagné' : `${DISC[e.disc].name} gagné`, `${SHOW.divs[e.div].name} · ${out.name}`);
    }
    if (kind === 'gp') {
        s.gpDone++;
        out.ribbon += 1;
        consumePrep(e.uid);
        s.lastAll = [...(s.lastAll || []).filter(l => !l.seen), out];
    }
    state.prestige.rubans += out.ribbon;
    addXp(40 + e.div * 20, null);
    s.last = out;
    emit('changed', 'show');
    if (out.cup) {
        sfx('level');
        buzz(30);
    }
    toast(place === 1 ? `${out.name} gagne le ${kind === 'gp' ? 'Grand Prix' : 'concours'} !` : `Résultats du concours : ${out.name} finit ${place}e`, [
        'ui',
        place === 1 ? 'hCup2' : 'hCup0',
    ]);
    return out;
}
// à chaque tour de jeu : un concours dont la semaine est finie est jugé (même si le jeu était fermé pendant des jours)
export function showTick() {
    if (!state.show) return false;
    let changed = false;
    const s = state.show;
    ensureShow();
    const old = s.entries.filter(e => e.key !== weekKey());
    if (old.length) {
        s.entries = s.entries.filter(e => e.key === weekKey());
        // un classement par semaine et par division : vos chevaux courent contre les rivales et entre eux
        const outs = [];
        const groups = {};
        old.forEach(e => (groups[e.key + '|' + e.div] ||= []).push(e));
        for (const g of Object.values(groups)) {
            const more = g.map(e => ({ uid: e.uid, name: (horseByUid(e.uid) || {}).name || 'Votre cheval', note: entryNote(e, 'week') }));
            const list = ranking(g[0].key, g[0].div, null, '', more);
            g.forEach(e => outs.push(settle(e, 'week', list)));
        }
        outs.sort((x, y) => x.place - y.place);
        s.lastAll = outs;
        s.last = outs[0];
        changed = true;
    }
    if (s.gp && s.gp.key !== gpKey()) {
        settle(s.gp, 'gp');
        s.gp = null;
        changed = true;
    }
    return changed;
}
export const lastResults = () => {
    const s = state.show;
    if (!s) return [];
    const base = s.lastAll && s.lastAll.length ? s.lastAll : s.last ? [s.last] : [];
    const ex = s.expressLast && !s.expressLast.seen ? [s.expressLast] : [];
    return [...ex, ...base];
};
export const showUnseen = () => lastResults().some(l => !l.seen) || showPalmState().some(t => t.canClaim);
export function showSeen() {
    lastResults().forEach(l => (l.seen = true));
    if (state.show && state.show.last) state.show.last.seen = true;
    if (state.show && state.show.expressLast) state.show.expressLast.seen = true;
    emit('changed', 'show');
}
export function showPrepItemLabel(p) {
    if (p.item && ITEMS[p.item] && (state.inventory[p.item] || 0) >= p.qty) return `${p.qty} × ${ITEMS[p.item].name.toLowerCase()}`;
    return `${fmt(p.coins)} pièces`;
}
export function showDecoName(id) {
    return (DECOS[id] && DECOS[id].name) || '';
}
