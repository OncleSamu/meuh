// 1.100 : les dernières recettes : chaque produit de la ferme sert trois fois au moins.
import test from 'node:test';
import assert from 'node:assert/strict';
import { ITEMS } from '../../src/data/items.js';
import { RECIPES } from '../../src/data/machines.js';
import { CARNET } from '../../src/data/carnet.js';
import { RECIPES_100 } from '../../src/data/ajouts/dernieres.js';
import { art } from '../../src/ui/icons.js';

test('1.100 : chaque culture, arbre, poisson et produit animal sert à trois recettes au moins', () => {
    const cnt = {};
    for (const r of Object.values(RECIPES)) for (const k of Object.keys(r.ing || {})) cnt[k] = (cnt[k] || 0) + 1;
    const low = Object.values(ITEMS)
        .filter(i => ['crop', 'tree', 'fish', 'product'].includes(i.type) && (cnt[i.id] || 0) < 3)
        .map(i => `${i.id} (${cnt[i.id] || 0})`);
    assert.deepEqual(low, []);
});

test('1.100 : seize recettes de plus, avec dessin, anecdote, ingrédients connus et prix', () => {
    assert.equal(RECIPES_100.length, 16);
    for (const [id, name, machine, ing] of RECIPES_100) {
        assert.ok(ITEMS[id] && ITEMS[id].name === name && ITEMS[id].sell > 0, id);
        assert.equal(RECIPES[id].machine, machine, id);
        assert.ok(CARNET[id] && CARNET[id].length > 40, `${id} : anecdote`);
        for (const k of Object.keys(ing)) assert.ok(ITEMS[k], `${id} : ${k}`);
        const svg = art('item', id);
        assert.ok(svg.includes('<svg') && !svg.includes('undefined'), `${id} : dessin`);
    }
});

test('1.100 : quatre pizzas, quatre plats au four en terre, trois pâtes de baies de plus', () => {
    const n = m => RECIPES_100.filter(r => r[2] === m).length;
    assert.equal(n('pizzeria'), 4);
    assert.equal(n('earthOven'), 4);
    assert.equal(n('berryKettle'), 3);
});
