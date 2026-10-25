// 1.32 : huit cultures de l'île et trente-trois recettes.
import test from 'node:test';
import assert from 'node:assert/strict';
import { ITEMS } from '../../src/data/items.js';
import { MACHINES, RECIPES } from '../../src/data/machines.js';
import { FLAVORS } from '../../src/data/genetics.js';
import { CARNET } from '../../src/data/carnet.js';
import { CROPS_132, RECIPES_132 } from '../../src/data/v132.js';
import { SPR } from '../../src/art/index.js';

const IDS = CROPS_132.map(c => c[0]);

test('1.32 : 8 cultures de l’île et 33 recettes', () => {
    assert.equal(CROPS_132.length, 8);
    assert.equal(RECIPES_132.length, 33);
    for (const id of IDS) {
        assert.ok(ITEMS[id].island, `${id} : île`);
        assert.ok(!ITEMS[id].exotic, `${id} : pas exotique`);
        assert.equal(FLAVORS[id].length, 5, id);
        assert.ok(SPR.item(id).length > 200, id);
        for (const s of [0, 1, 2, 3]) assert.ok(SPR.plant(id, s).includes('<svg'), `${id} ${s}`);
        assert.ok(Object.values(RECIPES).filter(r => id in r.ing).length >= 3, `${id} : 3 recettes`);
    }
});

test('1.32 : chaque plat a sa machine, son dessin, son anecdote ; aucun avant sa culture', () => {
    for (const [id, name, machine, ing] of RECIPES_132) {
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
