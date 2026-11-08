// 1.99 : les crises de la vallée.
import test from 'node:test';
import assert from 'node:assert/strict';
import { memStore } from './helpers.mjs';
import { state, setStore } from '../../src/core/state.js';
import { setView } from '../../src/core/view.js';
import { setClock } from '../../src/core/clock.js';
import * as G from '../../src/systems/index.js';
import { CRISIS, CRISES } from '../../src/data/crises.js';

let T = Date.UTC(2026, 10, 8, 12);
function farm() {
    setClock(() => T);
    setStore(memStore());
    G.loadGame();
    setView({ started: true, tab: 'farm', hidden: false });
    state.tutorial.done = true;
    state.level = 40;
    state.money = 1e9;
    state.crisis = null;
    state.nextCrisis = 0;
}

test('1.99 : rien avant le niveau 30', () => {
    farm();
    state.level = 20;
    assert.equal(G.crisisTick(), false);
    assert.equal(state.crisis, null);
});

test('1.99 : la première crise arrive après un jour, avec 12 h d’alerte', () => {
    farm();
    G.crisisTick();
    assert.ok(state.nextCrisis > T);
    T = state.nextCrisis + 1;
    assert.equal(G.crisisTick(), true);
    assert.equal(G.crisisPhase(), 'warn');
    assert.equal(G.crisisMult('crop'), 1);
    assert.equal(G.crisisMult('market'), 1);
});

test('1.99 : pendant la crise, seul son genre est ralenti ; préparé, moins fort', () => {
    farm();
    G.startCrisis('drought');
    assert.equal(G.crisisMult('crop'), 1);
    T += CRISIS.warn + 1;
    assert.equal(G.crisisPhase(), 'on');
    assert.equal(G.crisisMult('crop'), CRISES.drought.mult);
    assert.equal(G.crisisMult('animal'), 1);
    assert.equal(G.crisisMult('market'), 1);
    const w = G.cropRate('wheat');
    farm();
    G.startCrisis('drought');
    assert.ok(G.prepareCrisis());
    T += CRISIS.warn + 1;
    assert.equal(G.crisisMult('crop'), CRISES.drought.prepMult);
    assert.ok(G.cropRate('wheat') > 0 && w > 0);
});

test('1.99 : on ne se prépare qu’une fois, et il faut l’argent', () => {
    farm();
    G.startCrisis('slump');
    state.money = 0;
    assert.equal(G.prepareCrisis(), false);
    state.money = 1e9;
    const before = state.money;
    assert.ok(G.prepareCrisis());
    assert.equal(before - state.money, G.crisisCost());
    assert.equal(G.prepareCrisis(), false);
});

test('1.99 : fin de crise : récompense si prêt, rien de perdu, prochaine dans 3 à 5 jours', () => {
    farm();
    G.startCrisis('epidemic');
    G.prepareCrisis();
    const paid = state.crisis.paid;
    const m = state.money;
    T += CRISIS.warn + CRISIS.last + 1;
    assert.equal(G.crisisTick(), true);
    assert.equal(state.crisis, null);
    assert.equal(state.money - m, Math.round(paid * CRISIS.reward));
    assert.equal(state.stats.crisesReady, 1);
    assert.ok(state.nextCrisis - T >= CRISIS.gap[0] - 5 && state.nextCrisis - T <= CRISIS.gap[1] + 5);
});

test('1.99 : la crise ralentit vraiment les bêtes et les prix', () => {
    farm();
    state.animals.push({ type: 'cow' });
    const a = state.animals[state.animals.length - 1];
    const t0 = G.animalTime(a), p0 = G.marketMult();
    G.startCrisis('epidemic');
    T += CRISIS.warn + 1;
    assert.ok(G.animalTime(a) > t0);
    farm();
    G.startCrisis('slump');
    T += CRISIS.warn + 1;
    assert.ok(G.marketMult() < p0);
});

test('1.99 : on ne tire pas deux fois de suite la même', () => {
    farm();
    for (let i = 0; i < 20; i++) {
        const last = state.lastCrisis;
        state.crisis = null;
        G.startCrisis();
        if (last) assert.notEqual(state.crisis.type, last);
    }
});
