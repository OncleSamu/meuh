// 1.18 : le Grand livre (étagère de pages, paliers, fiches, compteurs de qualité).
import test from 'node:test';
import assert from 'node:assert/strict';
import { state } from '../../src/core/state.js';
import { setView } from '../../src/core/view.js';
import * as G from '../../src/systems/index.js';
import { RECIPES } from '../../src/data/machines.js';
import { ITEMS } from '../../src/data/items.js';

test('chaque recette est dans une et une seule page du livre', () => {
    G.loadGame();
    const seen = {};
    for (const p of G.BOOK) for (const e of p.entries()) seen[e.key] = (seen[e.key] || 0) + 1;
    for (const r of Object.values(RECIPES)) if (ITEMS[r.id]) assert.equal(seen['k_' + r.id], 1, r.id);
    assert.ok(
        Object.values(seen).every(n => n === 1),
        'aucune entrée en double',
    );
    assert.ok(G.BOOK.length >= 15);
});

test('les paliers d’une page se réclament une fois, dans l’ordre des seuils', () => {
    G.loadGame();
    setView({ started: false, tab: 'farm' });
    const page = G.BOOK.find(p => p.id === 'fish');
    const goal = G.pageGoal(page, 0);
    page.entries()
        .slice(0, goal)
        .forEach(e => (state.collection[e.key] = { n: 1, best: 1, day: 1 }));
    assert.ok(G.pageTierReady(page, 0));
    assert.ok(!G.pageTierReady(page, 1));
    const money = state.money;
    assert.ok(G.claimPageTier('fish', 0));
    assert.ok(state.money > money);
    assert.ok(!G.claimPageTier('fish', 0), 'une seule fois');
    assert.ok(G.bookClaimable() >= 0);
});

test('les pages qui grandissent comptent en nombre : variétés fixées, bières, races', () => {
    G.loadGame();
    const v = G.BOOK.find(p => p.id === 'varieties');
    assert.deepEqual(v.abs, [1, 3, 6, 10]);
    assert.equal(G.pageCount(v), 0);
    assert.equal(G.pageTierReady(v, 0), false);
    state.genetics = state.genetics || { vars: {}, races: {}, next: 1 };
    state.genetics.vars.x1 = { id: 'x1', base: 'strawberry', auto: 'Fraipiment', fixed: true, g: {} };
    assert.equal(G.pageCount(v), 1);
    assert.ok(G.pageTierReady(v, 0));
    state.brew = { beers: { b1: { id: 'b1', name: 'La Blonde', stars: 3, made: 4 } } };
    const b = G.BOOK.find(p => p.id === 'beers');
    assert.equal(b.entries().length, 1);
    assert.equal(G.entryInfo('b_b1').counters[0][1], 4);
});

test('les produits d’argent et d’or sont comptés, et la fiche les affiche', () => {
    G.loadGame();
    state.qmade = {};
    state.inventory.apple = 0;
    G.addQuality('apple', 1, 3);
    G.addQuality('apple', 2, 2);
    assert.deepEqual(state.qmade.apple, { s: 3, g: 2 });
    state.collection.o_apple = { n: 1, best: 0, day: 5 };
    const info = G.entryInfo('o_apple');
    assert.equal(info.counters[1][1], 3);
    assert.equal(info.counters[2][1], 2);
});
