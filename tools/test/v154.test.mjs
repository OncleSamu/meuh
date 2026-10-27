// 1.54 : les huit boissons de l'oasis au comptoir, et le geste du thé versé de haut.
import test from 'node:test';
import assert from 'node:assert/strict';
import { ITEMS } from '../../src/data/items.js';
import { RECIPES } from '../../src/data/machines.js';
import { BREW, NEW_DRINKS_154 } from '../../src/data/counter.js';
import { CARNET } from '../../src/data/carnet.js';
import { PROJECTS } from '../../src/data/village.js';
import { SPR } from '../../src/art/index.js';

test('1.54 : huit boissons de l’oasis, chacune avec ses gestes, son dessin et son anecdote', () => {
    assert.equal(NEW_DRINKS_154.length, 8);
    const combos = new Set();
    for (const [id, name, ing, lvl] of NEW_DRINKS_154) {
        assert.ok(BREW[id] && BREW[id].st.length >= 3, `${id} : gestes`);
        combos.add(BREW[id].st.map(s => s[0]).join('>'));
        assert.equal(ITEMS[id].name, name);
        assert.ok(ITEMS[id].sell > 0);
        assert.equal(RECIPES[id].machine, 'counter');
        assert.equal(RECIPES[id].lvl, lvl);
        assert.ok(lvl >= 58 && lvl <= 60);
        assert.ok(SPR.item(id).length > 300, `${id} : dessin`);
        assert.ok(CARNET[id] && CARNET[id].length > 80, `${id} : anecdote`);
        assert.ok(PROJECTS[ITEMS[id].needProject], id);
        for (const k of Object.keys(ing)) assert.ok(ITEMS[k], `${id} : ${k}`);
    }
    assert.equal(combos.size, 8, 'chaque boisson a sa propre combinaison de gestes');
});

test('1.54 : le lait attend l’enclos de la palmeraie, le reste le puits d’Idris', () => {
    for (const id of ['sesameMilk', 'camelDate', 'saffronMilk']) assert.equal(ITEMS[id].needProject, 'oasisPen', id);
    for (const id of ['desertTea', 'dateTea', 'jujubeTisane', 'bitterOrangeTea', 'dateCoffee']) assert.equal(ITEMS[id].needProject, 'oasisWell', id);
});

test('1.54 : le thé versé de haut sert à trois boissons, avec des réglages qui leur sont propres', () => {
    const hp = Object.entries(BREW).filter(([, d]) => d.st.some(s => s[0] === 'highpour'));
    assert.deepEqual(hp.map(h => h[0]).sort(), ['dateCoffee', 'desertTea', 'saffronMilk']);
    for (const [, d] of hp) {
        const p = d.st.find(s => s[0] === 'highpour')[1];
        assert.ok(p.w > 0 && p.w < 0.5 && p.dur >= 6 && p.speed > 0);
    }
});
