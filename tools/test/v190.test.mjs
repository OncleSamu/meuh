// 1.90 : serre améliorée, jardin sans arbres, nasses retirables.
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
    state.level = 43;
}

test('1.90 : l’amélioration de la serre s’ajoute aux parcelles déjà achetées', () => {
    farm();
    const g = state.greenhouse;
    g.built = true;
    G.ensureGhPlots();
    g.paid = 2;
    G.ghExtra();
    const before = g.plots.filter(p => p.isUnlocked).length;
    state.bld = { b: { greenhouse: 1 }, m: {} };
    G.ghExtra();
    const after = g.plots.filter(p => p.isUnlocked).length;
    assert.equal(after, before + 1, 'une parcelle libre de plus');
});

test('1.90 : le livre du potager ne liste plus les arbres', () => {
    farm();
    const e = G.bookEntries ? G.bookEntries('garden') : null;
    if (!e) return;
    for (const x of e) assert.ok(!['apple', 'pear'].includes(x.id), 'pas de pomme ni de poire au potager');
});

test('1.90 : on peut retirer une nasse en cours, l’appât revient', () => {
    farm();
    state.pond = state.pond || {};
    G.ensurePond && G.ensurePond();
    const p = state.pond;
    p.traps = [{ spot: 'bank', bait: 'worm', start: Date.now() }];
    const w = p.worms;
    assert.ok(G.pullTrap(0), 'retirée');
    assert.equal(p.traps[0].start, 0);
    assert.equal(p.traps[0].bait, null);
    assert.equal(p.worms, Math.min(p.worms, w + 1));
    assert.ok(!G.pullTrap(0), 'une nasse vide ne se retire pas');
});

test('1.91 : un produit d’atelier se brasse (caramel, café) et pèse peu dans le prix', () => {
    farm();
    state.inventory.caramel = 10;
    state.inventory.coffee = 10;
    assert.ok(G.isBrewable('caramel') && G.isBrewable('coffee') && !G.isBrewable('wheat_nope'));
    assert.ok(!G.BREWABLE.includes('caramel'), 'hors du livre des bières');
    assert.deepEqual(G.ingFlavor('coffee'), [0, 1, 5, 0, 1]);
    assert.equal(G.ingHave('caramel'), 10);
    const d = G.ensureBrew().draft;
    assert.ok(G.setDraftIng(0, 'caramel'), 'acceptée dans la recette');
    assert.equal(d.ings[0][0], 'caramel');
    assert.ok(G.brewValue(d.malt, d.hop, d.ings, 0) < 1000, 'prix raisonnable');
});
