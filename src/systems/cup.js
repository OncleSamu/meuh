// La Coupe de la vallée (1.40) : points, rangs, mécénat, statue, et les fermes rivales qui gagnent leurs médailles à votre rythme.
import { state } from '../core/state.js';
import { now } from '../core/clock.js';
import { view } from '../core/view.js';
import { fmt } from '../core/format.js';
import { emit, toast, sfx, buzz, burst } from '../core/bus.js';
import { RIVALS } from '../data/village.js';
import { DEFIS } from '../data/defis.js';
import { CUP_POINTS, STATUE_POINTS, CUP_RANKS, CUP_WORKS, CUP_RIVALS } from '../data/cup.js';
import { RIVAL_STYLE } from './rivals.js';
import { hasCost, payCost } from './home.js';
import { addPhoto } from './style.js';

export function ensureCup() {
    if (!state.cup || typeof state.cup !== 'object') state.cup = {};
    const c = state.cup;
    c.pts = c.pts || 0;
    c.works = c.works || {};
    c.riv = Array.isArray(c.riv) && c.riv.length === RIVALS.length ? c.riv : RIVALS.map(() => 0);
    c.hist = c.hist || [];
    c.log = c.log || [];
    return c;
}
export const cupPts = () => (state.cup && state.cup.pts) || 0;
export const cupRankAt = pts => CUP_RANKS.reduce((r, R, k) => (pts >= R.pts ? k : r), 0);
export const cupRank = () => cupRankAt(cupPts());
export const cupRankName = (k = cupRank()) => CUP_RANKS[k].name;
export const cupNext = () => CUP_RANKS[cupRank() + 1] || null;
export const cupHas = k => cupRank() >= k; // un bonus de rang (voir CUP_RANKS)

function addPts(n, why, at) {
    const c = ensureCup();
    const before = cupRank();
    c.pts += n;
    c.log = [...c.log, { t: now(), n, why }].slice(-8);
    const after = cupRank();
    if (after > before && view.started) {
        const R = CUP_RANKS[after];
        emit('celebrate', {
            icon: ['ui', 'cupRank' + after],
            title: `${R.name} !`,
            sub: 'La Coupe de la vallée vous fait monter d’un rang.',
            lines: [[['ui', 'star'], R.bonus]],
        });
        addPhoto('ui', 'cupRank' + after, R.name, 'Coupe de la vallée');
        sfx('level');
    } else if (n && view.started) toast(`Coupe de la vallée : +${n} point${n > 1 ? 's' : ''} (${why})`, ['ui', 'cupRank' + after]);
    return after > before;
}

// une médaille de grand défi (0 si aucune) : vos points, puis ceux des rivales, calées sur votre rythme
export function cupOnMedal(medal, defiId) {
    const c = ensureCup();
    const n = CUP_POINTS[medal] || 0;
    c.hist = [...c.hist, n].slice(-CUP_RIVALS.hist);
    if (n) addPts(n, `${['', 'bronze', 'argent', 'or', 'platine', 'diamant'][medal]} · ${DEFIS[defiId] ? DEFIS[defiId].name : 'grand défi'}`);
    const avg = c.hist.length ? c.hist.reduce((a, b) => a + b, 0) / c.hist.length : CUP_RIVALS.firstPts;
    c.riv = c.riv.map((p, k) => {
        const form = 1 - CUP_RIVALS.form + 2 * CUP_RIVALS.form * Math.random();
        return p + Math.max(0, Math.round(Math.max(avg, 1) * RIVAL_STYLE[k].f * form));
    });
    checkStatue();
}

// la grande statue : les 17 grands défis gagnés au moins une fois en or
export const statueProgress = () => {
    const T = (state.defis && state.defis.trophies) || {};
    return Object.keys(DEFIS).filter(id => T[id] && T[id].best >= 3).length;
};
export function checkStatue() {
    const c = ensureCup();
    if (c.statue || statueProgress() < Object.keys(DEFIS).length) return false;
    c.statue = now();
    addPts(STATUE_POINTS, 'la grande statue dorée');
    return true;
}

// ---------------- le mécénat ----------------
export const workDone = id => !!(state.cup && state.cup.works && state.cup.works[id]);
export const workCan = id => {
    const w = CUP_WORKS.find(x => x.id === id);
    return !!w && !workDone(id) && hasCost(w.cost);
};
export function buildWork(id, at) {
    const w = CUP_WORKS.find(x => x.id === id);
    if (!w || workDone(id)) return false;
    if (!hasCost(w.cost)) {
        toast('Il manque des pièces ou des matériaux pour ces grands travaux', ['building', id]);
        sfx('error');
        return false;
    }
    payCost(w.cost);
    ensureCup().works[id] = now();
    buzz(40);
    burst(at, 'sparkle', 20);
    addPts(w.pts, w.name.toLowerCase(), at);
    if (view.started)
        emit('celebrate', {
            icon: ['building', id],
            title: `${w.name} est bâti !`,
            sub: `« ${w.mamie} » (Mamie Odette)`,
            lines: [[['ui', 'cupRank' + cupRank()], `+${w.pts} points de Coupe · ${fmt(cupPts())} en tout`]],
        });
    return true;
}

// le classement de la Coupe : vous et les quatre fermes rivales
export function cupRanking() {
    const c = ensureCup();
    const list = RIVALS.map((r, k) => ({ name: r.name, owner: r.owner, pts: c.riv[k], rank: cupRankAt(c.riv[k]) }));
    list.push({ name: 'Votre ferme', pts: c.pts, rank: cupRank(), me: true });
    return list.sort((a, b) => b.pts - a.pts || (a.me ? -1 : 1));
}
