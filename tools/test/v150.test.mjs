// 1.50 : la cuisine de l'oasis : trois machines et trente-huit recettes, et le contrôle de leurs branchements.
import test from 'node:test';
import assert from 'node:assert/strict';
import { memStore } from './helpers.mjs';
import { state, setStore } from '../../src/core/state.js';
import { setView } from '../../src/core/view.js';
import * as G from '../../src/systems/index.js';
import { ITEMS } from '../../src/data/items.js';
import { MACHINES, RECIPES } from '../../src/data/machines.js';
import { CARNET } from '../../src/data/carnet.js';
import { RECIPES_150, MACHINES_150 } from '../../src/data/v150.js';
import { OASIS_IDS, OASIS_PRODUCTS } from '../../src/data/oasis.js';
import { SPR } from '../../src/art/index.js';

test('trois machines, aux niveaux 58, 59 et 60, après le puits d’Idris', () => {
    assert.deepEqual(
        MACHINES_150.map(m => [m[0], MACHINES[m[0]].reqLvl]),
        [
            ['earthOven', 58],
            ['tajine', 59],
            ['orientalSweets', 60],
        ],
    );
    for (const [id] of MACHINES_150) {
        assert.equal(MACHINES[id].needProject, 'oasisWell');
        assert.ok(SPR.machine(id).length > 300, id);
    }
});

test('trente-huit recettes : dessin, anecdote de Mamie, ingrédients connus, prix', () => {
    assert.equal(RECIPES_150.length, 38);
    for (const [id, name, machine, ing] of RECIPES_150) {
        assert.ok(RECIPES[id] && RECIPES[id].machine === machine, id);
        assert.ok(ITEMS[id] && ITEMS[id].name === name && ITEMS[id].sell > 0, `${id} : objet`);
        assert.ok(SPR.item(id).length > 300, `${id} : dessin`);
        assert.ok(CARNET[id], `${id} : anecdote`);
        for (const k of Object.keys(ing)) assert.ok(ITEMS[k], `${id} : ${k}`);
        assert.ok(RECIPES[id].lvl >= 58 && RECIPES[id].lvl <= 60, `${id} : niveau ${RECIPES[id].lvl}`);
    }
});

test('chaque plante et chaque produit de l’oasis sert au moins une fois ; jamais plus de 20 recettes dans une machine qui reçoit l’oasis', () => {
    const used = new Set(RECIPES_150.flatMap(r => Object.keys(r[3])));
    for (const id of [...OASIS_IDS, ...OASIS_PRODUCTS.map(p => p[0])]) assert.ok(used.has(id), id);
    const count = {};
    for (const r of Object.values(RECIPES)) count[r.machine] = (count[r.machine] || 0) + 1;
    for (const m of new Set(RECIPES_150.map(r => r[2]))) assert.ok(count[m] <= 20, `${m} : ${count[m]}`);
});

test('les voisins demandent aussi la cuisine de l’oasis', () => {
    setStore(memStore());
    G.loadGame();
    setView({ started: false, tab: 'farm' });
    assert.ok(G.dishOwner('kesra') >= 0 && G.dishOwner('halva') >= 0 && G.dishOwner('harira') >= 0);
    assert.ok(state);
});
