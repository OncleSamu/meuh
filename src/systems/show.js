// Les concours du haras (1.24) : le concours de la semaine, le Grand Prix du mois, les cinq divisions, la note d'un passage,
// les résultats contre cinq rivales et les récompenses. La règle est ici, l'écran est dans ui/views/show.js.
import { state } from '../core/state.js';
import { now } from '../core/clock.js';
import { dateKey } from '../core/format.js';
import { emit, toast, sfx, buzz } from '../core/bus.js';
import { SHOW, DISC } from '../data/haras.js';
import { weekStart, weekKey } from './events.js';
import { earn, addXp } from './player.js';
import { addPhoto } from './style.js';
import { champWon } from './stud.js';
import { tip } from './tips.js';
import { harasOpen, horseByUid, aptOf, rec, startPass, equipApt, equipPres } from './haras.js';

export const showOpen = () => harasOpen();
export function ensureShow() {
    if (!state.show) state.show = { rose: [0, 0, 0, 0, 0], cups: 0, wins: 0, titles: {}, div: 0, entries: [], gp: null, last: null, lastAll: null, gpDone: 0 };
    const s = state.show;
    s.rose ||= [0, 0, 0, 0, 0];
    s.titles ||= {};
    // 1.24.3 : trois inscriptions par semaine (une ancienne inscription unique devient la première)
    if (!s.entries) s.entries = s.entry ? [s.entry] : [];
    delete s.entry;
    return s;
}
const clamp = (x, a = 0, b = 100) => Math.max(a, Math.min(b, x));

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
export const purseOf = (div, mult = 1) => Math.round((SHOW.divs[div].purse * mult * (1 + state.level / 50)) / 10) * 10;
export const feeOf = (div, mult = 1) => Math.ceil(purseOf(div, mult) * SHOW.fee);
// la note prévue d'un cheval dans une discipline ; `pass` : le passage joué (0 à 1), ou null quand Jules monte
export function showNote(a, disc, pass = null) {
    const apt = clamp(aptOf(a, disc) + equipApt(a, disc));
    const p = pass == null ? SHOW.jules * apt : clamp(pass * 100);
    const pres = clamp(SHOW.presBase + SHOW.presLove * Math.min(5, a.love || 0) + equipPres(a));
    const spec = rec(a).spec === disc ? SHOW.spec : 1;
    const note = clamp((SHOW.wApt * apt + SHOW.wPass * p + SHOW.wPres * pres) * spec);
    return { apt, pass: p, pres, spec: spec > 1, note, jules: pass == null };
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

// ---------------- s'inscrire, jouer ----------------
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
    addXp(10);
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
    addXp(10);
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
    const notes = discs.map(d => (a ? showNote(a, d, kind === 'gp' ? (e.passes[d] ?? null) : e.passage).note : 0));
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
        rosette,
        cup: place === 1,
        crush,
        ribbon: 0,
        deco: null,
        jules: played === 0,
        seen: false,
    };
    if (coins) earn(coins, null);
    if (rosette) s.rose[e.div] += crush ? 2 : 1;
    if (place === 1) {
        s.cups++;
        s.wins++;
        s.titles[e.uid] = (s.titles[e.uid] || 0) + 1;
        if (e.div === 3) out.ribbon++;
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
    return s.lastAll && s.lastAll.length ? s.lastAll : s.last ? [s.last] : [];
};
export const showUnseen = () => lastResults().some(l => !l.seen);
export function showSeen() {
    lastResults().forEach(l => (l.seen = true));
    if (state.show && state.show.last) state.show.last.seen = true;
    emit('changed', 'show');
}
export const titlesOf = uid => (state.show && state.show.titles[uid]) || 0;
