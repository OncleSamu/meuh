// Heum — le cœur qui bat : chaque seconde en jeu, et un rattrapage neutre au retour.
// Hors ligne : les cultures poussent, les bêtes produisent, l'épave se regarnit, la jauge redescend.
// Rien ne se propage et rien ne se perd.
import { state, load, save } from '../core/state.js';
import { now } from '../core/clock.js';
import { contDecay } from './contamination.js';
import { rebelTick } from './plots.js';
import { animalTick } from './menagerie.js';
import { wreckTick } from './recycling.js';
import { bunkerTick } from './bunker.js';

export function tick(dt) {
    if (dt <= 0) return;
    contDecay(dt);
    animalTick(dt);
    wreckTick(dt);
    bunkerTick(dt);
    rebelTick(Math.min(dt, 5));
}
// l'absence : on avance tout sauf les Rebelles
export function catchUp() {
    const away = Math.max(0, (now() - (state.last || now())) / 1000);
    if (away < 2) return 0;
    contDecay(away);
    animalTick(away);
    wreckTick(away);
    bunkerTick(away);
    return away;
}
export function loadGame() {
    const ok = load();
    const away = ok ? catchUp() : 0;
    save();
    return { ok, away };
}
