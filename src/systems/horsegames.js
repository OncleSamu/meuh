// Les mini-jeux du haras (1.23.2 et 1.23.3) : la règle pure du galop, du saut, du dressage et du raid, sans interface. L'écran les fait tourner et les dessine.
import { GALOP, SAUT, DRESSAGE, RAID } from '../data/haras.js';

const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));

// ---------------- le galop ----------------
// on tient pour accélérer, on relâche pour ralentir ; à l'entrée de chaque virage l'allure doit être dans le vert ;
// le sprint final récompense la vitesse. `rand` donne le rythme des rivales (injectable pour les tests).
export function newGalop(rand = Math.random) {
    return {
        kind: 'galop',
        t: 0,
        dist: 0,
        v: 0.3,
        hold: false,
        turnsDone: [],
        turnIdx: 0,
        rivals: Array.from({ length: GALOP.rivals }, () => GALOP.rivalMin + rand() * (GALOP.rivalMax - GALOP.rivalMin)),
        rivalDist: Array(GALOP.rivals).fill(0),
        done: false,
        sprintSum: 0,
        sprintT: 0,
    };
}
export const galopRate = v => GALOP.rateMin + (GALOP.rateMax - GALOP.rateMin) * v;
export const galopTurnAhead = g => (g.turnIdx < GALOP.turns.length ? GALOP.turns[g.turnIdx] - g.dist : null);
// la note d'un virage : 1 dans la zone verte, qui retombe vers 0 à mesure qu'on s'en éloigne
export const turnScore = v => {
    const [a, b] = GALOP.zone;
    const out = v < a ? a - v : v > b ? v - b : 0;
    return clamp(1 - out / GALOP.fall);
};
export function stepGalop(g, dt) {
    if (g.done) return g;
    g.t += dt;
    g.v = clamp(g.v + (g.hold ? GALOP.up : -GALOP.down) * dt);
    const rate = galopRate(g.v);
    g.dist += rate * dt;
    g.rivalDist = g.rivalDist.map((d, i) => d + g.rivals[i] * dt);
    while (g.turnIdx < GALOP.turns.length && g.dist >= GALOP.turns[g.turnIdx]) {
        g.turnsDone.push(turnScore(g.v));
        g.turnIdx++;
    }
    if (g.dist >= GALOP.length - GALOP.sprint) {
        g.sprintSum += g.v * dt;
        g.sprintT += dt;
    }
    if (g.dist >= GALOP.length) {
        g.dist = GALOP.length;
        g.done = true;
    }
    return g;
}
export const galopRank = g => 1 + g.rivalDist.filter(d => d > g.dist).length;
export function galopScore(g) {
    const turns = g.turnsDone.length ? g.turnsDone.reduce((x, y) => x + y, 0) / g.turnsDone.length : 0;
    const time = clamp((GALOP.tMax - g.t) / (GALOP.tMax - GALOP.tMin));
    const sprint = g.sprintT ? g.sprintSum / g.sprintT : 0;
    return clamp(GALOP.wTurn * turns + GALOP.wTime * time + GALOP.wSprint * sprint);
}

// ---------------- le saut ----------------
// un anneau se resserre de 1 à 0 ; on appuie quand il touche la cible (au rayon `target`).
export function newSaut() {
    return { kind: 'saut', i: 0, results: [], faults: 0, done: false, eliminated: false };
}
export const sautDur = i => SAUT.t0 + (SAUT.t1 - SAUT.t0) * (i / Math.max(1, SAUT.obstacles - 1));
export const sautWindows = i => {
    const k = i / Math.max(1, SAUT.obstacles - 1);
    return { perfect: SAUT.perfect - SAUT.shrink * k, good: SAUT.good - SAUT.shrink * k };
};
// le rayon de l'anneau à l'instant `t` de l'obstacle `i` (1 au départ, 0 à la fin)
export const ringAt = (i, t) => clamp(1 - t / sautDur(i));
// note d'un appui : 'parfait' | 'bon' | 'faute' ; t = null si le joueur n'a pas appuyé
export function judgeJump(i, t) {
    if (t == null) return 'faute';
    const r = ringAt(i, t),
        w = sautWindows(i),
        d = Math.abs(r - SAUT.target);
    return d <= w.perfect ? 'parfait' : d <= w.good ? 'bon' : 'faute';
}
export function recordJump(s, verdict) {
    if (s.done) return s;
    s.results.push(verdict);
    if (verdict === 'faute') s.faults++;
    s.i++;
    if (s.faults >= SAUT.maxFaults) {
        s.done = true;
        s.eliminated = true;
    } else if (s.i >= SAUT.obstacles) s.done = true;
    return s;
}
export function sautScore(s) {
    const pts = s.results.reduce((x, v) => x + (v === 'parfait' ? 1 : v === 'bon' ? SAUT.goodValue : 0), 0);
    return clamp(pts / SAUT.obstacles);
}
export const sautSeq = i => SAUT.seq[i % SAUT.seq.length];

// ---------------- le dressage (1.23.3) ----------------
// chaque figure est un tracé de points (espacés d'environ 6 pixels) dans le manège de 360 × 520
const bez = (p0, p1, p2, p3, n = 24) =>
    Array.from({ length: n + 1 }, (_, i) => {
        const t = i / n,
            u = 1 - t;
        return [0, 1].map(k => u * u * u * p0[k] + 3 * u * u * t * p1[k] + 3 * u * t * t * p2[k] + t * t * t * p3[k]);
    });
const seg = (a, b, step = 6) => {
    const n = Math.max(1, Math.round(Math.hypot(b[0] - a[0], b[1] - a[1]) / step));
    return Array.from({ length: n + 1 }, (_, i) => [a[0] + ((b[0] - a[0]) * i) / n, a[1] + ((b[1] - a[1]) * i) / n]);
};
const PATHS = {
    volte: () => {
        const c = [110, 340],
            r = 70,
            n = 72;
        return [
            ...seg([180, 430], [180, 340]),
            ...Array.from({ length: n + 1 }, (_, i) => [c[0] + r * Math.cos((i / n) * Math.PI * 2), c[1] - r * Math.sin((i / n) * Math.PI * 2)]).slice(1),
        ];
    },
    serpentine: () => [
        ...seg([180, 430], [180, 380]),
        ...bez([180, 380], [300, 380], [300, 320], [180, 300]).slice(1),
        ...bez([180, 300], [60, 280], [60, 220], [180, 200]).slice(1),
        ...bez([180, 200], [300, 180], [300, 130], [180, 110]).slice(1),
    ],
    diagonale: () => seg([60, 410], [300, 110]),
    huit: () =>
        Array.from({ length: 97 }, (_, i) => {
            const t = (i / 96) * Math.PI * 2;
            return [180 + 100 * Math.sin(t), 260 + 100 * Math.sin(t) * Math.cos(t)];
        }),
};
const pathCache = {};
export const figPath = id => (pathCache[id] ||= PATHS[id]());
const hyp = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
const newFig = id => ({ id, path: figPath(id), started: false, idx: 0, precSum: 0, precN: 0, turnSum: 0, turnN: 0, last: null, head: null, finished: false });
export function newDressage() {
    return { kind: 'dress', i: 0, fig: newFig(DRESSAGE.figures[0]), scores: [], notes: [], done: false };
}
// la tête de la figure en cours : un point du doigt (ou du cheval) à chaque mouvement
export function dressMove(d, x, y) {
    const f = d.fig;
    if (d.done || f.finished) return d;
    if (!f.started) {
        if (hyp([x, y], f.path[0]) > DRESSAGE.start) return d;
        f.started = true;
        f.last = [x, y];
        return d;
    }
    let best = f.idx,
        bd = Infinity;
    for (let k = f.idx; k <= Math.min(f.path.length - 1, f.idx + DRESSAGE.window); k++) {
        const dd = hyp([x, y], f.path[k]);
        if (dd < bd) (bd = dd), (best = k);
    }
    if (bd <= DRESSAGE.tol * 1.5) f.idx = best;
    f.precSum += Math.max(0, 1 - bd / DRESSAGE.tol);
    f.precN++;
    const dx = x - f.last[0],
        dy = y - f.last[1];
    if (Math.hypot(dx, dy) >= DRESSAGE.step) {
        const h = Math.atan2(dy, dx);
        if (f.head != null) {
            let diff = Math.abs(h - f.head);
            if (diff > Math.PI) diff = 2 * Math.PI - diff;
            f.turnSum += diff;
            f.turnN++;
        }
        f.head = h;
        f.last = [x, y];
    }
    return d;
}
export const dressFigDone = d => d.fig.idx >= Math.floor((d.fig.path.length - 1) * DRESSAGE.end);
export const figStats = f => ({
    cover: f.path.length > 1 ? f.idx / (f.path.length - 1) : 0,
    prec: f.precN ? f.precSum / f.precN : 0,
    smooth: f.turnN ? clamp(1 - f.turnSum / f.turnN / DRESSAGE.smoothMax) : f.started ? 1 : 0,
});
export function dressFinishFig(d) {
    const f = d.fig;
    if (d.done || f.finished) return d;
    f.finished = true;
    const st = figStats(f);
    st.score = clamp(Math.min(1, st.cover / DRESSAGE.end) * (DRESSAGE.wPrec * st.prec + DRESSAGE.wSmooth * st.smooth));
    d.notes.push(st);
    d.scores.push(st.score);
    d.i++;
    if (d.i >= DRESSAGE.figures.length) d.done = true;
    else d.fig = newFig(DRESSAGE.figures[d.i]);
    return d;
}
export const dressageScore = d => (d.scores.length ? d.scores.reduce((x, y) => x + y, 0) / DRESSAGE.figures.length : 0);
export const dressageNotes = d => {
    const n = Math.max(1, d.notes.length),
        m = k => d.notes.reduce((x, s) => x + s[k], 0) / DRESSAGE.figures.length;
    return { prec: m('prec'), smooth: m('smooth'), cover: m('cover'), n };
};

// ---------------- le raid d'endurance (1.23.3) ----------------
export const raidLimit = form => RAID.limitBase + RAID.limitForm * clamp(form, 0, 5);
export function newRaid(form = 3) {
    return {
        kind: 'raid',
        i: 0,
        pos: 0,
        t: 0,
        stageT: 0,
        over: 0,
        gait: 'trot',
        p: RAID.rest,
        lim: raidLimit(form),
        scores: [],
        vets: [],
        times: [],
        event: null,
        done: false,
    };
}
export const raidStage = r => RAID.stages[Math.min(r.i, RAID.stages.length - 1)];
export const raidTarget = (r, gait = r.gait) => RAID.gaits[gait].p + RAID.terrain[raidStage(r).terrain].add;
export const raidSpeed = (r, gait = r.gait) => {
    const base = RAID.gaits[gait].v * RAID.terrain[raidStage(r).terrain].mult[gait];
    return r.p > r.lim ? base * RAID.over : base;
};
export const raidVet = p => clamp(1 - (p - RAID.vetOk) / RAID.vetSpan);
export const raidStageScore = (st, time, overFrac) => {
    const tm = clamp((st.slow - time) / (st.slow - st.fast));
    return clamp(RAID.wTime * tm + RAID.wCalm * (1 - clamp(overFrac * 2)));
};
export function setGait(r, gait) {
    if (RAID.gaits[gait]) r.gait = gait;
    return r;
}
// une étape finie : la note, le contrôle, la récupération ; `event` prévient l'écran (il s'efface en lisant r.event = null)
export function stepRaid(r, dt) {
    if (r.done || r.event) return r;
    const st = raidStage(r);
    r.t += dt;
    r.stageT += dt;
    if (r.p > r.lim) r.over += dt;
    r.pos += raidSpeed(r) * dt;
    r.p += (raidTarget(r) - r.p) * Math.min(1, RAID.rate * dt);
    if (r.pos >= st.len) {
        const score = raidStageScore(st, r.stageT, r.over / Math.max(0.1, r.stageT)),
            vet = raidVet(r.p);
        r.scores.push(score);
        r.vets.push(vet);
        r.times.push(r.stageT);
        r.event = { type: 'stage', stage: r.i, score, vet, pulse: Math.round(r.p), time: r.stageT };
        r.i++;
        r.pos = 0;
        r.stageT = 0;
        r.over = 0;
        r.p = RAID.rest + (r.p - RAID.rest) * RAID.recover;
        if (r.i >= RAID.stages.length) r.done = true;
    }
    return r;
}
export function raidScore(r) {
    if (!r.scores.length) return 0;
    const n = RAID.stages.length,
        s = r.scores.reduce((x, y) => x + y, 0) / n,
        v = r.vets.reduce((x, y) => x + y, 0) / n;
    return clamp((1 - RAID.wVet) * s + RAID.wVet * v);
}
