import test from 'node:test';
import assert from 'node:assert/strict';
import { state } from '../../src/core/state.js';
import * as G from '../../src/systems/index.js';
import { MACHINES, RECIPES } from '../../src/data/machines.js';
import { EQUIP, SHOW, FORM } from '../../src/data/haras.js';
import { ITEMS } from '../../src/data/items.js';
import { clock } from './helpers.mjs';

const horse = () => {
    G.loadGame();
    state.level = 50;
    state.money = 1e9;
    for (const id of ['plank', 'beam', 'nail', 'stone', 'paint']) state.inventory[id] = 999;
    const a = G.newAnimal('horse');
    a.adult = true;
    state.animals = [a];
    G.ensureGenetics();
    G.ensurePastures();
    G.upgradeStable();
    G.lodge(a.uid);
    for (const d of SHOW.rot) G.rec(a).pts[d] = 40;
    G.rec(a).spec = null;
    a.love = 0;
    return a;
};

test('1.24.1 : la sellerie existe avec ses neuf recettes et leurs objets', () => {
    assert.ok(MACHINES.saddlery);
    const ids = Object.keys(EQUIP.items);
    assert.equal(ids.length, 9);
    for (const id of ids) {
        assert.ok(ITEMS[id], id);
        assert.equal(RECIPES[id].machine, 'saddlery');
    }
});
test('1.24.1 : équiper retire du stock, remplacer rend l’ancien objet', () => {
    const a = horse();
    state.inventory.shoeIron = 1;
    state.inventory.shoeSilver = 1;
    assert.ok(G.equip(a.uid, 'shoeIron'));
    assert.equal(state.inventory.shoeIron, 0);
    assert.equal(G.equippedItem(a, 'fers'), 'shoeIron');
    assert.ok(G.equip(a.uid, 'shoeSilver'));
    assert.equal(state.inventory.shoeIron, 1);
    assert.ok(G.unequip(a.uid, 'fers'));
    assert.equal(state.inventory.shoeSilver, 1);
    assert.ok(!G.equip(a.uid, 'bridle'));
});
test('1.24.1 : l’équipement ajoute des points d’aptitude et de présentation à la note de concours', () => {
    const a = horse();
    const base = G.showNote(a, 'dressage', 0.5).note;
    state.inventory.saddleDress = 1;
    state.inventory.bridle = 1;
    state.inventory.saddlePad = 1;
    G.equip(a.uid, 'saddleDress');
    G.equip(a.uid, 'bridle');
    G.equip(a.uid, 'saddlePad');
    assert.equal(G.equipApt(a, 'dressage'), 9);
    assert.equal(G.equipPres(a), 5);
    assert.ok(G.showNote(a, 'dressage', 0.5).note > base + 4);
    assert.equal(G.equipApt(a, 'saut'), 0);
    assert.equal(G.rec(a).pts.dressage, 40);
});
test('1.24.1 : la couverture d’hiver fait remonter la forme plus vite', () => {
    const a = horse();
    state.inventory.winterBlanket = 1;
    G.rec(a).form = 0;
    G.rec(a).t = clock.t;
    assert.equal(Math.round(G.formEvery(a)), FORM.every);
    G.equip(a.uid, 'winterBlanket');
    assert.ok(G.formEvery(a) < FORM.every);
    clock.t += FORM.every;
    assert.ok(G.formOf(a) >= 1);
    clock.t += FORM.every * 2;
    assert.ok(G.formOf(a) >= 3);
});
