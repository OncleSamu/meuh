// 1.55 : les huit boissons de l'oasis au comptoir, et le geste du thé versé de haut.
import test from 'node:test';
import assert from 'node:assert/strict';
import { ITEMS } from '../../src/data/items.js';
import { RECIPES } from '../../src/data/machines.js';
import { BREW, NEW_DRINKS_155 } from '../../src/data/counter.js';
import { CARNET } from '../../src/data/carnet.js';
import { PROJECTS } from '../../src/data/village.js';
import { SPR } from '../../src/art/index.js';

test('1.55 : huit boissons du Grand Nord, chacune avec ses gestes, son dessin et son anecdote', () => {
    assert.equal(NEW_DRINKS_155.length, 8);
    const combos = new Set();
    for (const [id, name, ing, lvl] of NEW_DRINKS_155) {
        assert.ok(BREW[id] && BREW[id].st.length >= 3, `${id} : gestes`);
        combos.add(BREW[id].st.map(s => s[0]).join('>'));
        assert.equal(ITEMS[id].name, name);
        assert.ok(ITEMS[id].sell > 0);
        assert.equal(RECIPES[id].machine, 'counter');
        assert.equal(RECIPES[id].lvl, lvl);
        assert.ok(lvl === 60);
        assert.ok(SPR.item(id).length > 300, `${id} : dessin`);
        assert.ok(CARNET[id] && CARNET[id].length > 80, `${id} : anecdote`);
        assert.ok(PROJECTS[ITEMS[id].needProject], id);
        for (const k of Object.keys(ing)) assert.ok(ITEMS[k], `${id} : ${k}`);
    }
    assert.equal(combos.size, 8, 'chaque boisson a sa propre combinaison de gestes');
});

test('1.55 : le poêle de Tuomas ouvre les boissons, le traîneau le lait de renne', () => {
    for (const [id, , , , , tag] of NEW_DRINKS_155) assert.equal(ITEMS[id].needProject, tag === 'sled' ? 'northSled' : 'northStove', id);
});
