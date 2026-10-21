// Les mini-jeux du haras (1.23.2) : la règle pure du galop et du saut, sans interface. L'écran les fait tourner et les dessine.
import { GALOP, SAUT } from '../data/haras.js';

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
