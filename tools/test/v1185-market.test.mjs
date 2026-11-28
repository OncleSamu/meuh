import test from 'node:test';
import assert from 'node:assert/strict';
import { memStore } from './helpers.mjs';
import { state, newState, setState, setStore } from '../../src/core/state.js';
import * as G from '../../src/systems/index.js';

function fresh(lvl = 30) {
    setStore(memStore());
    setState(newState());
    state.level = lvl;
    state.money = 500000;
    state.tutorial.done = true;
}

test('1.185 : sellAllPreview et sellAll respectent le filtre de famille', () => {
    fresh(30);
    state.settings.reserve = false;
    state.inventory.wheat = 10;
    state.inventory.milk = 10;
    state.inventory.bread = 10;

    const allPrev = G.sellAllPreview();
    const cropPrev = G.sellAllPreview(t => t === 'crop' || t === 'tree');
    const prodPrev = G.sellAllPreview(t => t === 'product');

    assert.ok(allPrev.total > cropPrev.total, 'le total global doit dépasser les seules récoltes');
    assert.ok(cropPrev.total > 0 && cropPrev.count === 10, 'aperçu récoltes exact');
    assert.ok(prodPrev.total > 0 && prodPrev.count === 10, 'aperçu bêtes exact');

    // Vendre uniquement les récoltes laisse le lait et le pain intacts
    const gained = G.sellAll(null, t => t === 'crop' || t === 'tree');
    assert.equal(gained, cropPrev.total, 'le gain réel doit correspondre exactement à l’aperçu');
    assert.equal(state.inventory.wheat, 0, 'le blé a été vendu');
    assert.equal(state.inventory.milk, 10, 'le lait est resté intact');
    assert.equal(state.inventory.bread, 10, 'le pain est resté intact');
});

test('1.185 : un produit verrouillé est exclu de sellAllPreview et sellAll', () => {
    fresh(30);
    state.settings.reserve = false;
    state.inventory.wheat = 10;
    state.inventory.carrot = 10;
    G.toggleLock('wheat');

    const prev = G.sellAllPreview(t => t === 'crop');
    assert.equal(prev.count, 10, 'seules les carottes doivent être comptées');
    G.sellAll(null, t => t === 'crop');
    assert.equal(state.inventory.wheat, 10, 'le blé verrouillé est protégé');
    assert.equal(state.inventory.carrot, 0, 'les carottes sont vendues');
});

test('1.185 : achat par lot de 50 (graines et consommables) et revente de graines', () => {
    fresh(30);
    state.seeds.wheat = 0;
    state.inventory.feed = 0;
    assert.equal(G.buy('seed', 'wheat', 50), true, 'achat de 50 graines de blé');
    assert.equal(state.seeds.wheat, 50);
    assert.equal(G.buy('feed', 'feed', 50), true, 'achat de 50 sacs de nourriture');
    assert.equal(state.inventory.feed, 50);

    const before = state.money;
    assert.equal(G.sellSeeds('wheat', 0), true, 'revente des 50 graines');
    assert.equal(state.seeds.wheat, 0);
    assert.ok(state.money > before, 'pièces créditées lors de la revente');
});
