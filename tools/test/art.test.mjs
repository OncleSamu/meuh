// Les dessins (1.2.7) : chaque sprite du jeu se dessine sans erreur, bâtiments à leurs trois états.
import test from 'node:test';
import assert from 'node:assert/strict';
import { SPR } from '../../src/art/index.js';
import { BLD } from '../../src/art/kit.js';
import { ITEMS } from '../../src/data/items.js';

const ok = (s, what) => assert.ok(typeof s === 'string' && s.includes('<svg') && s.length > 200, what);

test('chaque produit, bête, machine, villageois et plante se dessine', () => {
    for (const id of Object.keys(SPR.has.items)) ok(SPR.item(id), 'item ' + id);
    for (const id of Object.keys(SPR.has.animals)) ok(SPR.animal(id), 'animal ' + id);
    for (const id of Object.keys(SPR.has.machines)) ok(SPR.machine(id), 'machine ' + id);
    for (const id of Object.keys(SPR.has.people)) ok(SPR.villager(id), 'villager ' + id);
    for (const [id, d] of Object.entries(ITEMS))
        if (d.type === 'crop' || d.type === 'tree') for (const s of [0, 1, 2, 3]) ok(SPR.plant(id, s), `plant ${id} ${s}`);
});

test('chaque bâtiment se dessine en ruine, en chantier et rénové', () => {
    for (const id of Object.keys(BLD)) for (const s of [0, 1, 2]) ok(SPR.building(id, s), `building ${id} ${s}`);
});
