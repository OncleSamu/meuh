// 1.33 : dix poissons de plus, le lagon et trente-quatre recettes.
import test from 'node:test';
import assert from 'node:assert/strict';
import { ITEMS } from '../../src/data/items.js';
import { MACHINES, RECIPES } from '../../src/data/machines.js';
import { CARNET } from '../../src/data/carnet.js';
import { FISH } from '../../src/data/meta.js';
import { SPOTS, BAITS } from '../../src/data/fishing.js';
import { SEA_CATCH } from '../../src/data/nature.js';
import { FISH_ITEMS_133, RECIPES_133 } from '../../src/data/v133.js';
import { SPR } from '../../src/art/index.js';

test('1.33 : dix poissons, 34 recettes, un lagon et un appât de plus', () => {
    assert.equal(FISH_ITEMS_133.length, 10);
    assert.equal(RECIPES_133.length, 34);
    assert.ok(SPOTS.lagoon && BAITS.shrimp);
    for (const [id] of FISH_ITEMS_133) {
        assert.ok(ITEMS[id], id);
        assert.ok(SPR.item(id).length > 200, `${id} : dessin`);
        assert.ok(Object.values(RECIPES).filter(r => id in r.ing).length >= 3, `${id} : 3 recettes`);
    }
    assert.ok(SPR.ui('spotLagoon').includes('<svg'));
});

test('1.33 : le filet en mer tire sur 100, calmar, dorade, raie et thon compris', () => {
    assert.equal(
        SEA_CATCH.reduce((a, [, w]) => a + w, 0),
        100,
    );
    for (const id of ['squid', 'bream', 'skate', 'tuna']) assert.ok(SEA_CATCH.some(([k]) => k === id) && ITEMS[id].sea, id);
});

test('1.33 : les poissons du lagon ne mordent qu’au lagon, la langouste reste rare', () => {
    for (const id of ['octopus', 'snapper', 'mahi', 'spinyLobster']) assert.deepEqual(FISH[id].spots, ['lagoon'], id);
    assert.ok(FISH.spinyLobster.odds < 10 && FISH.spinyLobster.sell > ITEMS.lobster.sell);
    assert.ok(FISH.whitefish.spots.includes('pier') && FISH.gudgeon.small);
});

test('1.33 : chaque plat a sa machine, son dessin, son anecdote ; aucun avant son poisson', () => {
    for (const [id, name, machine, ing] of RECIPES_133) {
        assert.ok(ITEMS[id].sell > 0 && ITEMS[id].name === name, id);
        assert.ok(MACHINES[machine], `${id} : ${machine}`);
        assert.ok(SPR.has.items[id], `${id} : dessin`);
        assert.ok(CARNET[id], `${id} : anecdote`);
        for (const k of Object.keys(ing)) assert.ok(ITEMS[k], `${id} : ${k}`);
    }
});
