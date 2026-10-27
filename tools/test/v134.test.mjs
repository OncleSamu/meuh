// 1.34 : sept boissons du comptoir et huit produits de cave.
import test from 'node:test';
import assert from 'node:assert/strict';
import { ITEMS } from '../../src/data/items.js';
import { RECIPES } from '../../src/data/machines.js';
import { CAVE_ITEMS } from '../../src/data/cave.js';
import { BREW, NEW_DRINKS, NEW_DRINKS_134 } from '../../src/data/counter.js';
import { CARNET } from '../../src/data/carnet.js';
import { RECIPES_134 } from '../../src/data/v134.js';
import { SPR } from '../../src/art/index.js';

test('1.34 : le comptoir passe à 41 boissons, chacune avec un geste et un dessin', () => {
    assert.equal(NEW_DRINKS_134.length, 7);
    assert.equal(Object.values(RECIPES).filter(r => r.machine === 'counter').length, 57);
    for (const [id, name] of NEW_DRINKS_134) {
        assert.ok(BREW[id] && BREW[id].st.length >= 2, `${id} : geste`);
        assert.equal(ITEMS[id].name, name);
        assert.ok(SPR.item(id).length > 200, `${id} : dessin`);
        assert.ok(CARNET[id], `${id} : anecdote`);
    }
    assert.ok(NEW_DRINKS.length + NEW_DRINKS_134.length >= 29);
});

test('1.34 : les cafés restent derrière la brûlerie, l’hibiscus avec l’île', () => {
    for (const id of ['macchiato', 'frappe', 'spicedCoffee']) assert.equal(ITEMS[id].needProject, 'roasting', id);
    assert.ok(ITEMS.hibiscusTea.island);
    assert.ok(!ITEMS.chicoryCoffee.island && !ITEMS.mandarinTea.island && !ITEMS.hempTisane.island);
});

test('1.34 : huit produits de cave, tous dans une famille existante', () => {
    const ids = ['truffleBrie', 'pepperCheese', ...RECIPES_134.map(r => r[0])];
    assert.equal(ids.length, 8);
    for (const id of ids) assert.ok(CAVE_ITEMS[id], id);
    assert.equal(CAVE_ITEMS.coppa, 'charcuterie');
    for (const [id] of RECIPES_134) {
        assert.ok(SPR.item(id).length > 200, id);
        assert.ok(CARNET[id], `${id} : anecdote`);
    }
    // le fromage aux fleurs d'alpage dépasse ses cousins
    assert.ok(ITEMS.alpineFlowerCheese.sell > ITEMS.beaufort.sell && ITEMS.alpineFlowerCheese.sell > ITEMS.comte.sell);
});
