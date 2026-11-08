// Heum — le cœur qui bat : chaque seconde en jeu, et un rattrapage neutre au retour.
// Hors ligne (ou jeu en arrière-plan) : les cultures poussent, les bêtes produisent, l'épave se regarnit, le bunker mange.
// 0.3 : la jauge de Contamination reste où on l'a laissée, rien ne se propage, rien ne se perd.
import { state, load, save } from '../core/state.js';
import { now } from '../core/clock.js';
import { contDecay } from './contamination.js';
import { rebelTick } from './plots.js';
import { animalTick } from './menagerie.js';
import { wreckTick } from './recycling.js';
import { bunkerTick } from './bunker.js';

// en jeu : tout avance, la jauge redescend, les Rebelles s'agitent
export function tick(dt) {
    if (dt <= 0) return;
    contDecay(dt);
    animalTick(dt);
    wreckTick(dt);
    bunkerTick(dt);
    rebelTick(Math.min(dt, 5));
}
// absent : tout avance sauf la jauge et les Rebelles
export function away(dt) {
    if (dt <= 0) return;
    animalTick(dt);
    wreckTick(dt);
    bunkerTick(dt);
}
// le temps écoulé depuis la dernière sauvegarde (reprise après une pause, page rechargée)
export function catchUp() {
    const gone = Math.max(0, (now() - (state.last || now())) / 1000);
    if (gone < 2) return 0;
    away(gone);
    state.last = now();
    return gone;
}
// 'none' : première partie ; 'ok' ; 'bad' : sauvegarde illisible, laissée intacte
export function loadGame() {
    const status = load();
    const gone = status === 'ok' ? catchUp() : 0;
    if (status !== 'bad') save();
    return { status, ok: status === 'ok', away: gone };
}
