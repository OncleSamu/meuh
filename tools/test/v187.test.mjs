// 1.87 : les compteurs par rang dans les fiches du livre (variétés, bières et hydromels).
import test from 'node:test';
import assert from 'node:assert/strict';
import { memStore } from './helpers.mjs';
import { state, setStore } from '../../src/core/state.js';
import { setView } from '../../src/core/view.js';
import * as G from '../../src/systems/index.js';

function farm() {
    setStore(memStore());
    G.loadGame();
    setView({ started: false, tab: 'farm' });
    state.level = 80;
    state.money = 1e9;
    G.ensureGenetics();
}

test('1.87 : la fiche d’une variété compte ses récoltes par rang', () => {
    farm();
    const id = 'vTest';
    state.genetics.vars[id] = { id, kind: 'plant', base: 'carrot', auto: 'Test', name: null, g: G.wildPlant('carrot'), gen: 3, fixed: false };
    G.harvestVariety(id, 4, 0);
    G.harvestVariety(id, 2, 1);
    G.harvestVariety(id, 3, 4);
    const e = G.entryInfo('v_' + id);
    assert.ok(e, 'la fiche existe');
    const c = Object.fromEntries(e.counters);
    assert.equal(c['Récoltées'], 9);
    assert.equal(c['En argent'], 2);
    assert.equal(c['En or'], 0);
    assert.equal(c['En diamant'], 3);
});

test('1.87 : la fiche d’une bière compte ses bouteilles par rang', () => {
    farm();
    const B = G.ensureBrew();
    B.beers.b1 = { id: 'b1', name: 'Ma blonde', value: 100, made: 0, stars: 1, ings: [], malt: 'maltBlond' };
    B.vats[0] = { bid: 'b1', n: 6, q: 3, until: 0 };
    assert.ok(G.collectVat(0));
    B.vats[0] = { bid: 'b1', n: 2, q: 4, until: 0 };
    assert.ok(G.collectVat(0));
    B.vats[0] = { bid: 'b1', n: 5, q: 0, until: 0 };
    assert.ok(G.collectVat(0));
    const e = G.entryInfo('b_b1');
    assert.ok(e, 'la fiche existe');
    const c = Object.fromEntries(e.counters);
    assert.equal(c['Brassées'], 13);
    assert.equal(c['En platine'], 6);
    assert.equal(c['En diamant'], 2);
    assert.equal(c['En argent'], 0);
});
