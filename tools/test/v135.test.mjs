// 1.35 : six animaux de plus, onze produits et trente-six recettes.
import test from 'node:test';
import assert from 'node:assert/strict';
import './helpers.mjs';
import * as G from '../../src/systems/index.js';
import { ITEMS } from '../../src/data/items.js';
import { MACHINES, RECIPES } from '../../src/data/machines.js';
import { ANIMALS, GROW, NAMES } from '../../src/data/animals.js';
import { ANIMAL_BASE, FEATURES } from '../../src/data/genetics.js';
import { CARNET } from '../../src/data/carnet.js';
import { CAVE_ITEMS } from '../../src/data/cave.js';
import { ANIMALS_135, PRODUCTS_135, RECIPES_135 } from '../../src/data/v135.js';
import { SPR } from '../../src/art/index.js';

test('1.35 : 23 animaux, onze produits, 36 recettes', () => {
    assert.equal(Object.keys(ANIMALS).length, 29); // 1.52 : les trois bêtes du Grand Nord
    assert.equal(ANIMALS_135.length, 6);
    assert.equal(PRODUCTS_135.length, 11);
    assert.equal(RECIPES_135.length, 36);
});

test('1.35 : chaque animal a ses noms, sa croissance, ses gènes, son dessin et son produit', () => {
    for (const [id] of ANIMALS_135) {
        const a = ANIMALS[id];
        assert.ok(ITEMS[a.prodId], `${id} : produit`);
        if (a.extra) assert.ok(ITEMS[a.extra], `${id} : second produit`);
        assert.ok(GROW[id] > 0 && NAMES[id].length >= 6 && ANIMAL_BASE[id].length === 7, id);
        assert.ok(SPR.animal(id).includes('<svg'), `${id} : dessin`);
        const b = G.newAnimal(id);
        assert.ok(b.g && b.name, `${id} : une bête naît avec ses gènes`);
        assert.ok(G.animalTime(b) > 0, id);
    }
    assert.ok(FEATURES.coat.species.includes('yak') && FEATURES.coat.species.includes('mohairGoat'));
    for (const t of ['yak', 'mohairGoat']) for (const c of [0, 1, 2]) assert.ok(SPR.animal(`${t}~${c}`).length > 300, `${t} toison ${c}`);
});

test('1.35 : chaque produit sert à trois recettes au moins, a un dessin ; le yack entre en cave', () => {
    for (const [id] of PRODUCTS_135) {
        assert.ok(SPR.item(id).length > 200, `${id} : dessin`);
        assert.ok(Object.values(RECIPES).filter(r => id in r.ing).length >= 3, `${id} : 3 recettes`);
    }
    assert.equal(CAVE_ITEMS.yakCheese, 'cheese');
});

test('1.35 : chaque plat a sa machine, son dessin, son anecdote, son voisin ; aucun avant son animal', () => {
    for (const [id, name, machine, ing] of RECIPES_135) {
        assert.ok(ITEMS[id].sell > 0 && ITEMS[id].name === name, id);
        assert.ok(MACHINES[machine], `${id} : ${machine}`);
        assert.ok(SPR.has.items[id], `${id} : dessin`);
        assert.ok(CARNET[id], `${id} : anecdote`);
        assert.ok(G.dishOwner(id) >= 0, `${id} : un voisin`);
        for (const k of Object.keys(ing)) {
            assert.ok(ITEMS[k], `${id} : ${k}`);
            const an = ANIMALS_135.find(a => a[2] === k || a[7] === k);
            if (an) assert.ok(RECIPES[id].lvl >= ANIMALS[an[0]].reqLvl, `${id} avant ${an[0]}`);
        }
    }
});
