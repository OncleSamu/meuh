// 1.31 : sept arbres et trente recettes.
import test from 'node:test';
import assert from 'node:assert/strict';
import { ITEMS } from '../../src/data/items.js';
import { MACHINES, RECIPES } from '../../src/data/machines.js';
import { FLAVORS } from '../../src/data/genetics.js';
import { TREE_SEASON } from '../../src/data/orchard.js';
import { CARNET } from '../../src/data/carnet.js';
import { TREES_131, RECIPES_131 } from '../../src/data/v131.js';
import { SPR } from '../../src/art/index.js';

const IDS = TREES_131.map(t => t[0]);

test('1.31 : 7 arbres (5 à la ferme, 2 aux îles) et 30 recettes', () => {
    assert.equal(TREES_131.length, 7);
    assert.equal(RECIPES_131.length, 30);
    assert.equal(IDS.filter(id => ITEMS[id].island).length, 2);
    assert.equal(Object.values(ITEMS).filter(i => i.type === 'tree').length, 40); // 1.51 : les trois arbres du Grand Nord
    assert.equal(ITEMS.mirabelle.seedName, 'Mirabellier');
});

test('1.31 : chaque arbre a ses saveurs, sa saison (sauf les îles) et ses dessins', () => {
    for (const id of IDS) {
        assert.equal(ITEMS[id].type, 'tree', id);
        assert.equal(FLAVORS[id].length, 5, id);
        if (ITEMS[id].island) assert.ok(!TREE_SEASON[id], `${id} : l'île n'a pas de saison`);
        else assert.ok(TREE_SEASON[id], `${id} : saison`);
        for (const s of [0, 1, 2, 3, 4]) assert.ok(SPR.plant(id, s).includes('<svg'), `${id} ${s}`);
        assert.ok(SPR.item(id).length > 200, id);
        assert.ok(Object.values(RECIPES).filter(r => id in r.ing).length >= 3, `${id} : 3 recettes`);
    }
});

test('1.31 : chaque plat a sa machine, son dessin, son anecdote ; aucun avant son fruit', () => {
    for (const [id, name, machine, ing] of RECIPES_131) {
        assert.ok(ITEMS[id].sell > 0 && ITEMS[id].name === name, id);
        assert.ok(MACHINES[machine], `${id} : ${machine}`);
        assert.ok(SPR.has.items[id], `${id} : dessin`);
        assert.ok(CARNET[id], `${id} : anecdote`);
        for (const k of Object.keys(ing)) {
            assert.ok(ITEMS[k], `${id} : ${k}`);
            if (IDS.includes(k)) assert.ok(RECIPES[id].lvl >= ITEMS[k].reqLvl, `${id} avant ${k}`);
        }
    }
});
