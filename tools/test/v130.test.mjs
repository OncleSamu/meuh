// 1.30 : quatorze cultures, la marmite et soixante-quatre recettes.
import test from 'node:test';
import assert from 'node:assert/strict';
import { ITEMS } from '../../src/data/items.js';
import { MACHINES, RECIPES } from '../../src/data/machines.js';
import { SOILS } from '../../src/data/farm.js';
import { FLAVORS } from '../../src/data/genetics.js';
import { ASSOCS } from '../../src/data/companions.js';
import { CARNET } from '../../src/data/carnet.js';
import { CROPS_130, RECIPES_130 } from '../../src/data/v130.js';
import { RATION } from '../../src/data/haras.js';
import { NMARKET } from '../../src/data/commerce.js';
import { SPR } from '../../src/art/index.js';

const IDS = CROPS_130.map(c => c[0]);

test('1.30 : 14 cultures, 64 recettes et la marmite', () => {
    assert.equal(CROPS_130.length, 14);
    assert.equal(RECIPES_130.length, 64);
    assert.equal(new Set(RECIPES_130.map(r => r[0])).size, 64);
    assert.equal(Object.keys(RECIPES).length, 558);
    assert.equal(MACHINES.marmite.reqLvl, 8);
});

test('1.30 : chaque culture est dans les trois tables (sol, saveurs, compagnes) et se dessine', () => {
    for (const id of IDS) {
        assert.equal(ITEMS[id].type, 'crop', id);
        const soils = Object.values(SOILS).filter(s => s.crops.includes(id));
        assert.equal(soils.length, 1, `${id} : un seul sol`);
        assert.equal(FLAVORS[id].length, 5, `${id} : saveurs`);
        assert.ok(
            FLAVORS[id].some(n => n > 0),
            id,
        );
        for (const s of [0, 1, 2, 3]) assert.ok(SPR.plant(id, s).includes('<svg'), `${id} ${s}`);
        assert.ok(SPR.item(id).length > 200, `${id} : produit`);
    }
    for (const id of ['favePdt', 'navetPois', 'brocoliBetterave', 'echaloteCarotte', 'butternutMais', 'chanvre', 'faveEchalote'])
        assert.ok(
            ASSOCS.some(a => a.id === id),
            id,
        );
});

test('1.30 : chaque culture sert dans au moins 3 recettes, chaque plat a son dessin et son anecdote', () => {
    for (const id of IDS) {
        const n = Object.values(RECIPES).filter(r => id in r.ing).length;
        assert.ok(n >= 3, `${id} : ${n} recettes`);
    }
    for (const [id, name, machine, ing] of RECIPES_130) {
        assert.ok(ITEMS[id].sell > 0 && ITEMS[id].name === name, id);
        assert.ok(MACHINES[machine], `${id} : machine ${machine}`);
        for (const k of Object.keys(ing)) assert.ok(ITEMS[k], `${id} : ingrédient ${k}`);
        assert.ok(SPR.has.items[id], `${id} : dessin`);
        assert.ok(CARNET[id], `${id} : anecdote`);
    }
    assert.ok(SPR.has.machines.marmite);
});

test('1.30 : une recette ne s’ouvre jamais avant sa culture, l’avoine nourrit les chevaux, Firmin vend les farines', () => {
    for (const [id, , , ing] of RECIPES_130)
        for (const k of Object.keys(ing)) if (IDS.includes(k)) assert.ok(RECIPES[id].lvl >= ITEMS[k].reqLvl, `${id} avant ${k}`);
    assert.ok(RATION.items.includes('oat'));
    for (const id of ['oatFlour', 'favaFlour', 'chickpeaFlour', 'hempOil']) assert.ok(NMARKET.firmin.includes(id), id);
});
