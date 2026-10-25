import test from 'node:test';
import assert from 'node:assert/strict';
import { clock } from './helpers.mjs';
import { state } from '../../src/core/state.js';
import * as G from '../../src/systems/index.js';
import { FORM, STABLE, RANDO } from '../../src/data/haras.js';

const setup = (n = 1) => {
    G.loadGame();
    state.level = 45;
    state.money = 1e9;
    for (const id of ['plank', 'beam', 'nail', 'stone', 'paint', 'carrot']) state.inventory[id] = 999;
    state.animals = [];
    for (let k = 0; k < n; k++) {
        const a = G.newAnimal('horse');
        a.adult = true;
        a.stack = 0;
        state.animals.push(a);
    }
    G.ensureGenetics();
    G.ensurePastures();
    return state.animals;
};

test('1.23 : les écuries se construisent au niveau 45 et s’agrandissent trois fois', () => {
    setup();
    state.level = 44;
    assert.equal(G.stableCanUp(), false);
    state.level = 45;
    assert.ok(G.upgradeStable());
    assert.equal(G.boxCount(), 4);
    G.upgradeStable();
    G.upgradeStable();
    assert.equal(G.boxCount(), 12);
    assert.equal(G.stableNext(), null);
    assert.equal(G.upgradeStable(), false);
    assert.equal(STABLE.length, 4);
});

test('1.23 : un cheval logé quitte les prés mais reste dans la ferme', () => {
    const [a] = setup();
    G.upgradeStable();
    const before = G.pastureLoad(0);
    assert.ok(G.lodge(a.uid));
    assert.equal(G.pastureLoad(0), before - 1);
    G.ensurePastures();
    assert.equal(a.box, true, 'l’entretien des prés ne le renvoie pas dehors');
    assert.ok(G.unlodge(a.uid));
    assert.equal(G.pastureLoad(0), before);
});

test('1.23 : pas plus de chevaux que de boxes, et pas de box sans écurie', () => {
    const hs = setup(6);
    assert.equal(G.lodge(hs[0].uid), false, 'pas encore d’écurie');
    G.upgradeStable();
    hs.slice(0, 5).forEach(a => G.lodge(a.uid));
    assert.equal(G.lodged().length, 4);
    assert.equal(G.boxFree(), 0);
});

test('1.23 : le plafond d’une aptitude vaut 40 + 12 × le gène', () => {
    const [a] = setup();
    for (const [d, k] of [
        ['galop', 'speed'],
        ['endurance', 'robust'],
        ['dressage', 'docile'],
        ['saut', 'jump'],
    ]) {
        a.g.t[k] = [
            [5, 1],
            [5, 1],
        ];
        assert.equal(G.aptCap(a, d), 100);
        a.g.t[k] = [
            [2, 1],
            [2, 1],
        ];
        assert.equal(G.aptCap(a, d), 64);
    }
    a.g.t.jump = [
        [0, 1],
        [0, 1],
    ];
    assert.equal(G.aptCap(a, 'saut'), 40);
});

test('1.23 : s’entraîner coûte de la forme, monte jusqu’au plafond et pas au-delà', () => {
    const [a] = setup();
    G.upgradeStable();
    G.lodge(a.uid);
    assert.equal(G.formOf(a), FORM.max);
    const g = G.trainHorse(a.uid, 'galop', null);
    assert.ok(g >= 1);
    assert.equal(G.formOf(a), FORM.max - 1);
    assert.equal(G.aptOf(a, 'galop'), g);
    // tout le monde au plafond : plus rien ne monte
    G.rec(a).pts.galop = G.aptCap(a, 'galop');
    assert.equal(G.trainHorse(a.uid, 'galop', null), 0);
    assert.equal(G.aptOf(a, 'galop'), G.aptCap(a, 'galop'));
    // pas de forme : pas d’entraînement
    for (let k = 0; k < 6; k++) G.trainHorse(a.uid, 'saut', null);
    assert.equal(G.formOf(a), 0);
    assert.equal(G.trainHorse(a.uid, 'dressage', null), 0);
});

test('1.23 : la forme remonte d’une pastille toutes les 30 minutes, jeu fermé compris', () => {
    const [a] = setup();
    G.upgradeStable();
    G.lodge(a.uid);
    for (let k = 0; k < 5; k++) G.trainHorse(a.uid, 'saut', null);
    assert.equal(G.formOf(a), 0);
    clock.t += FORM.every + 1000;
    assert.equal(G.formOf(a), 1);
    clock.t += 10 * FORM.every;
    assert.equal(G.formOf(a), FORM.max);
});

test('1.23 : près du plafond le gain diminue, la ration l’augmente', () => {
    const [a] = setup();
    G.upgradeStable();
    G.lodge(a.uid);
    a.love = 0;
    const low = G.trainGain(a, 'galop', 1);
    G.rec(a).pts.galop = Math.floor(G.aptCap(a, 'galop') * 0.95);
    assert.ok(G.trainGain(a, 'galop', 1) < low);
    G.rec(a).pts.galop = 0;
    assert.ok(G.giveRation(a.uid, 'carrot'));
    assert.ok(G.trainGain(a, 'galop', 1) >= low);
    assert.ok(G.rationLeftMs(a) > 0);
});

test('1.23 : le brossage donne un cœur, puis attend 2 heures (1.24.3)', () => {
    const [a] = setup();
    G.upgradeStable();
    G.lodge(a.uid);
    a.love = 0;
    assert.ok(G.brushHorse(a.uid));
    assert.equal(a.love, 1);
    assert.equal(G.brushHorse(a.uid), false);
    state.day++;
    assert.equal(G.brushHorse(a.uid), false);
    clock.t += 2 * 3600 * 1000 + 1000;
    assert.ok(G.brushHorse(a.uid));
});

test('1.23 : la randonnée dure 2 heures et rapporte des trouvailles et de l’endurance', () => {
    const [a] = setup();
    G.upgradeStable();
    G.lodge(a.uid);
    assert.ok(G.startRando(a.uid));
    assert.equal(G.trainHorse(a.uid, 'galop', null), 0, 'en randonnée, pas d’entraînement');
    assert.equal(G.unlodge(a.uid), false, 'ni retour au pré');
    assert.equal(G.collectRando(a.uid), null, 'pas encore rentré');
    clock.t += RANDO.hours * 3600000 + 1000;
    const before = Object.values(state.inventory).reduce((x, n) => x + n, 0);
    const r = G.collectRando(a.uid);
    assert.ok(r && Object.keys(r.got).length);
    assert.equal(G.aptOf(a, 'endurance'), RANDO.endurance);
    assert.ok(Object.values(state.inventory).reduce((x, n) => x + n, 0) > before);
    assert.equal(G.onRando(a), false);
});

test('1.23 : un vieux cheval a la docilité et la détente d’un cheval sauvage', () => {
    G.loadGame();
    state.level = 45;
    const a = G.newAnimal('horse');
    state.animals = [a];
    a.g.t.docile = [
        [0, 1],
        [0, 1],
    ];
    delete a.g.t.jump;
    state.genetics.v123 = false;
    G.ensureGenetics();
    assert.equal(G.traitOf(a.g, 'docile'), 2);
    assert.equal(G.traitOf(a.g, 'jump'), 2);
});
