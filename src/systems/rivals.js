// 1.39 : le moteur des fermes rivales (concours de la semaine).
// Les rivales sont calées sur le joueur : leur but de la semaine est la moyenne de vos trois derniers concours,
// multipliée par leur caractère. Elles jouent par séances (chacune à ses heures), avec de bons et de mauvais jours,
// et réagissent dans les deux derniers jours : coup de collier si elles sont juste derrière vous, elles lâchent si vous êtes loin.
// Tout est tiré d'une graine par concours et par rivale : recharger la partie ne change rien.
import { state } from '../core/state.js';
import { RIVALS } from '../data/village.js';

// caractère de chaque ferme (même ordre que RIVALS) : force et heures de travail
export const RIVAL_STYLE = [
    { f: 0.75, hours: [7, 12, 18] }, // Hortense, les Tilleuls : tôt le matin, régulière
    { f: 0.9, hours: [9, 20] }, // Bastien, Bellevue
    { f: 1, hours: [8, 14, 21] }, // Yvette, les Trois Chênes
    { f: 1.05, hours: [19, 22] }, // Firmin, le Moulin Rouge : le soir, par gros paquets
];
export const RIVAL_CFG = {
    leagueBump: 0.06, // +6 % par ligue
    firstBase: 0.7, // sans historique : 70 % de la cible du niveau
    floor: 0.2, // au moins 20 % de la cible
    hist: 3, // la moyenne des 3 derniers concours
    rushMs: 48 * 3600 * 1000, // les deux derniers jours
    rush: 1.25, // coup de collier quand elles sont juste derrière
    near: 0.12, // « juste derrière » : à moins de 12 % de votre score
    giveUp: 0.6, // elles lâchent quand elles ont plus de 40 % de retard
    offDay: 0.1, // une journée sans rien faire
    bigOdds: 0.06, // un gros coup (×2,2)
    form: 0.15, // la forme de la semaine : ±15 %
};

function seedRand(seed) {
    let a = seed >>> 0;
    return () => {
        a = (a + 0x6d2b79f5) >>> 0;
        let t = a;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

// les séances d'une rivale pendant le concours : [{ t, w }] (w : la part du but de la semaine, sans réaction)
export function rivalSessions(c, k) {
    const rnd = seedRand(Math.floor(c.start / 1000) + k * 7919);
    const st = RIVAL_STYLE[k] || RIVAL_STYLE[0];
    const list = [];
    const day0 = Math.floor(c.start / 864e5) * 864e5;
    for (let d = day0; d < c.end; d += 864e5) {
        const off = rnd() < RIVAL_CFG.offDay;
        for (const h of st.hours) {
            const t = d + h * 3600e3 + (rnd() - 0.5) * 90 * 60e3;
            let w = off ? 0 : 0.5 + rnd();
            const big = !off && rnd() < RIVAL_CFG.bigOdds;
            if (big) w *= 2.2;
            if (t > c.start && t <= c.end) list.push({ t, w, big });
        }
    }
    // la forme de la semaine : de 85 % à 115 % de son niveau habituel
    const form = 1 - RIVAL_CFG.form + 2 * RIVAL_CFG.form * rnd();
    const sum = list.reduce((a, x) => a + x.w, 0) || 1;
    list.forEach(x => (x.w = (x.w / sum) * form));
    return list;
}

// le score « normal » d'une semaine, figé au début du concours
export function rivalBase(target) {
    const h = (state.contestHist || []).slice(-RIVAL_CFG.hist);
    if (!h.length) return Math.round(target * RIVAL_CFG.firstBase);
    // jamais sous 20 % de la cible : une semaine sans jouer ne rend pas les rivales ridicules
    return Math.round(Math.max(target * RIVAL_CFG.floor, h.reduce((a, b) => a + b, 0) / h.length));
}
export const rivalGoal = (c, k) => (c.base0 || 0) * (RIVAL_STYLE[k] || RIVAL_STYLE[0]).f * (1 + RIVAL_CFG.leagueBump * (c.league || 0)) * (c.win || 1);

// fait avancer les rivales jusqu'à t ; me : votre score maintenant. Renvoie les événements nouveaux.
export function advanceRivals(c, t, me) {
    if (!c.riv) c.riv = RIVALS.map(() => ({ s: 0, n: 0 }));
    const events = [];
    RIVALS.forEach((r, k) => {
        const R = c.riv[k];
        const ses = rivalSessions(c, k);
        const goal = rivalGoal(c, k);
        while (R.n < ses.length && ses[R.n].t <= t) {
            const x = ses[R.n++];
            let gain = goal * x.w;
            if (x.t > c.end - RIVAL_CFG.rushMs && me > 0) {
                const gap = me - R.s;
                if (gap >= 0 && gap <= me * RIVAL_CFG.near) gain *= RIVAL_CFG.rush;
                else if (gap > me * 0.4) gain *= RIVAL_CFG.giveUp;
            }
            gain = Math.round(gain);
            if (!gain) continue;
            const before = R.s;
            R.s += gain;
            if (before <= me && R.s > me && me > 0) events.push({ t: x.t, k, kind: 'pass', gain });
            else if (x.big) events.push({ t: x.t, k, kind: 'big', gain });
        }
    });
    if (events.length) {
        c.feed = [...(c.feed || []), ...events].sort((a, b) => a.t - b.t).slice(-6);
    }
    return events;
}

export const rivalEventText = e => {
    const r = RIVALS[e.k];
    return e.kind === 'pass'
        ? `${r.owner} (${r.name}) marque ${e.gain} points et passe devant vous !`
        : `${r.owner} (${r.name}) fait un gros coup : +${e.gain} points.`;
};
