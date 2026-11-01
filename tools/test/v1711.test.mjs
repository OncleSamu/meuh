// 1.71.1 : un objectif « préparer » un produit sans prix de vente (nourriture, planches…) se valide.
import test from 'node:test';
import assert from 'node:assert/strict';
import { memStore } from './helpers.mjs';
import { state, setStore } from '../../src/core/state.js';
import { setView } from '../../src/core/view.js';
import * as G from '../../src/systems/index.js';

test('1.71.1 : préparer de la nourriture valide l’objectif, même sans maîtrise', () => {
    setStore(memStore());
    G.loadGame();
    setView({ started: false, tab: 'farm' });
    const g = { kind: 'make', id: 'feed', n: 1, base: 0, mbase: 0 };
    state.inventory.feed = 0;
    assert.equal(G.goalDone(g), false);
    G.addMastery('feed', 3);
    assert.ok(G.goalDone(g));
    // un ancien objectif (sans compteur) : le stock suffit
    const old = { kind: 'make', id: 'plank', n: 1, base: 0 };
    state.inventory.plank = 2;
    assert.ok(G.goalDone(old));
});

test('1.71.1 : comice, foire, livre généalogique, ruchers, duos et compteurs survivent au rechargement', async () => {
    const { writeSave } = await import('../../src/core/state.js');
    setStore(memStore());
    G.loadGame();
    Object.assign(state, {
        comice: { a: 1 },
        elevage: { b: 2 },
        herdbook: { c: 3 },
        apiary: { island: { hives: 2, honey: 1.5 } },
        duos: { 'hugues-agnes': { step: 1, given: {} } },
    });
    G.addMastery('feed', 4);
    writeSave();
    G.loadGame();
    assert.deepEqual(state.comice, { a: 1 });
    assert.deepEqual(state.elevage, { b: 2 });
    assert.deepEqual(state.herdbook, { c: 3 });
    assert.equal(state.apiary.island.hives, 2);
    assert.equal(state.duos['hugues-agnes'].step, 1);
    assert.equal(state.made.feed, 4);
});
