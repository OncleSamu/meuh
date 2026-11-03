// 1.82 : la page Élevage du livre, les qualités des poissons dans le livre.
import test from 'node:test';
import assert from 'node:assert/strict';
import { memStore } from './helpers.mjs';
import { state, setStore } from '../../src/core/state.js';
import { setView } from '../../src/core/view.js';
import * as G from '../../src/systems/index.js';

function farm() {
    setStore(memStore());
    G.loadGame();
    setView({ started: false, tab: 'animals' });
    state.level = 30;
}

test('1.82 : la page Élevage a les produits et les seconds produits, pas le compost', () => {
    farm();
    const p = G.BOOK.find(x => x.id === 'herd');
    const ids = p.entries().map(e => e.id);
    for (const id of ['egg', 'chickenMeat', 'milk', 'beef', 'whey', 'royalJelly', 'zebuBeef', 'qiviut']) assert.ok(ids.includes(id), id);
    assert.ok(!ids.includes('fertilizer'));
    assert.equal(new Set(ids).size, ids.length);
});

test('1.82 : un ramassage remplit la page Élevage', () => {
    farm();
    const a = G.newAnimal('chicken');
    a.adult = true;
    a.stack = 3;
    state.animals = [a];
    G.collectAnimal(a);
    assert.ok(state.collection.a_egg);
});

test('1.82 : la fiche d’un poisson donne ses prises par qualité', () => {
    farm();
    state.collection.f_perch = { n: 5, best: 1, day: 1 };
    state.qmade.perch = { s: 3, g: 1 };
    const i = G.entryInfo('f_perch');
    const c = Object.fromEntries(i.counters);
    assert.equal(c['Pêchés'], 5);
    assert.equal(c['En argent'], 3);
    assert.equal(c['En or'], 1);
});
