// L'Élevage (1.45) : les naissances au pré. Deux adultes de la même espèce dans un pré peuvent avoir un petit,
// de temps en temps, même jeu fermé, si l'éleveur a allumé les naissances de ce pré (éteintes par défaut).
// La nature, pas l'éleveur : pas de mutation, et chaque bon gène peut retomber vers la moyenne de l'espèce.
// Choisir les parents, viser une mutation, fixer une race : c'est l'étable de sélection (labo).
import { state, scaleLvl } from '../core/state.js';
import { now } from '../core/clock.js';
import { view } from '../core/view.js';
import { toast, sfx, changed } from '../core/bus.js';
import { GROW, BIRTHS } from '../data/animals.js';
import { isAdult, newAnimal } from './animals.js';
import { isAway } from './port.js';
import { inPasture, pastureFree, penOf, penKeys } from './pastures.js';
import { crossGenomes, lineSnap, breeding, animalBase } from './genetics.js';
import { addXp } from './player.js';
import { tip } from './tips.js';

export const birthsOpen = () => state.level >= BIRTHS.lvl;
export const birthsOn = k => !!(penOf(k) && penOf(k).births);
// le temps entre deux naissances d'une espèce dans un pré (en heures réelles) : plus long pour les grosses bêtes
export const birthHours = type => Math.min(BIRTHS.maxH, BIRTHS.minH + (GROW[type] || 600) / BIRTHS.growDiv);
const canParent = a => isAdult(a) && !a.sick && !isAway(a) && !a.box && !breeding(a.uid);

// les espèces d'un pré qui peuvent avoir un petit : { type: [parents possibles] }
export function birthPairs(k) {
    const by = {};
    inPasture(k).forEach(a => {
        if (BIRTHS.skip.includes(a.type) || !canParent(a)) return;
        (by[a.type] = by[a.type] || []).push(a);
    });
    for (const t in by) if (by[t].length < 2) delete by[t];
    return by;
}

export function toggleBirths(k) {
    const p = penOf(k);
    if (!p || !birthsOpen()) return false;
    p.births = !p.births;
    // le compte à rebours repart de zéro à chaque allumage
    p.nb = {};
    toast(
        p.births
            ? `Naissances allumées dans ${p.name.replace(/^Le /, 'le ')} : deux bêtes de la même espèce y auront parfois un petit`
            : `Naissances éteintes dans ${p.name.replace(/^Le /, 'le ')}`,
        ['ui', 'heart'],
    );
    changed('animals');
    return true;
}

// dans combien de temps (ms) la prochaine naissance possible du pré, ou null
export function nextBirthIn(k) {
    if (!birthsOn(k)) return null;
    const p = penOf(k),
        t = now();
    const waits = Object.keys(birthPairs(k)).map(type => (p.nb && p.nb[type] ? Math.max(0, p.nb[type] - t) : birthHours(type) * 3600000));
    return waits.length ? Math.min(...waits) : null;
}

// un parent tiré au hasard, les bêtes aimées un peu plus souvent
function pickParent(list, not) {
    const pool = list.filter(a => a !== not);
    let x = Math.random() * pool.reduce((s, a) => s + 1 + (a.love || 0) * 0.3, 0);
    for (const a of pool) if ((x -= 1 + (a.love || 0) * 0.3) <= 0) return a;
    return pool[pool.length - 1];
}

// les gènes d'un petit né au pré : ceux des parents, sans mutation, et chaque bon gène a une chance sur deux de redescendre d'un point
export function naturalGenome(a, b, type) {
    const { g } = crossGenomes(a.g, b.g, 0);
    const base = { type };
    for (const k in g.t) {
        const lo = animalBase(base, k);
        if (g.t[k].some(al => al[0] > lo) && Math.random() < BIRTHS.regress) g.t[k] = g.t[k].map(([v, d]) => [v > lo ? v - 1 : v, d]);
    }
    return g;
}

function bornInPasture(k, type, list) {
    const a = pickParent(list),
        b = pickParent(list, a);
    const baby = newAnimal(type);
    baby.g = a.g && b.g ? naturalGenome(a, b, type) : baby.g;
    baby.gen = Math.max(a.gen || 0, b.gen || 0) + 1;
    baby.parents = [a.name, b.name];
    baby.lin = [lineSnap(a, true), lineSnap(b, true)];
    baby.born = 'pre';
    // deux parents de la même race fixée : le petit la garde (le travail du labo se prolonge au pré)
    if (a.race && a.race === b.race) baby.race = a.race;
    baby.p = k;
    state.animals.push(baby);
    state.stats.births = (state.stats.births || 0) + 1;
    state.stats.preBirths = (state.stats.preBirths || 0) + 1;
    addXp(BIRTHS.xp + scaleLvl() * 2);
    return baby;
}

// la seconde de jeu (et le retour d'absence) : les naissances arrivées à leur heure ; renvoie les petits nés
export function birthsTick(max = BIRTHS.catchUp) {
    if (!birthsOpen() || !Array.isArray(state.pastures)) return [];
    const t = now(),
        born = [];
    penKeys().forEach(k => {
        const p = penOf(k);
        if (!p || !p.births) return;
        p.nb = p.nb || {};
        const pairs = birthPairs(k);
        // une espèce qui n'a plus de couple repart de zéro le jour où elle en retrouve un
        for (const type in p.nb) if (!pairs[type]) delete p.nb[type];
        for (const type in pairs) {
            if (!p.nb[type]) p.nb[type] = t + birthHours(type) * 3600000;
            let n = 0;
            while (t >= p.nb[type] && n < max && pastureFree(k) > 0) {
                born.push(bornInPasture(k, type, pairs[type]));
                p.nb[type] += birthHours(type) * 3600000;
                n++;
            }
            // pré plein ou trop de retard : la prochaine attend son tour normal
            if (t >= p.nb[type]) p.nb[type] = t + birthHours(type) * 3600000;
        }
    });
    if (born.length && view.started) {
        const [x] = born;
        toast(
            born.length > 1
                ? `${born.length} petits sont nés au pré`
                : `${x.name} ${BIRDS.includes(x.type) ? 'a éclos' : 'est né' + (FEM.includes(x.type) ? 'e' : '')} au pré, ${FEM.includes(x.type) ? 'fille' : 'petit'} de ${x.parents.join(' et ')}`,
            ['animal', x.type],
        );
        sfx(x.type);
        changed('animals');
    }
    return born;
}
// les espèces dont on parle au féminin (comme dans la vente)
const FEM = ['cow', 'goat', 'chicken', 'ewe', 'guinea', 'ostrich', 'mohairGoat', 'quail'];
const BIRDS = ['chicken', 'duck', 'quail', 'goose', 'turkey', 'pigeon', 'guinea', 'pheasant', 'ostrich', 'peacock'];

// la bulle de Mamie : au niveau des naissances, quand un pré a déjà un couple
export function birthsTip() {
    if (!birthsOpen() || !view.started) return;
    if (state.pastures.some((p, k) => Object.keys(birthPairs(k)).length)) tip('births');
}
