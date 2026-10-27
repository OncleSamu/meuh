// 1.52.1 : le traîneau, le relais, le marché de glace, la cardamome.
import test from 'node:test';
import assert from 'node:assert/strict';
import { clock, memStore } from './helpers.mjs';
import { state, setStore } from '../../src/core/state.js';
import { setView } from '../../src/core/view.js';
import * as G from '../../src/systems/index.js';
import { ITEMS } from '../../src/data/items.js';
import { SLED } from '../../src/data/nord.js';
import { PROJECTS } from '../../src/data/village.js';
import { STORY_MAPS } from '../../src/data/meta.js';
import { TIPS } from '../../src/data/texts.js';
import { SPR } from '../../src/art/index.js';

function nord() {
    setStore(memStore());
    G.loadGame();
    setView({ started: false, tab: 'farm' });
    state.level = 60;
    state.money = 100_000_000;
    for (const id of ['northStove', 'northStable', 'northSled']) state.projects[id] = { given: {}, done: true };
    G.ensureNord();
}
const team = n => {
    for (let k = 0; k < n; k++) {
        const a = G.newAnimal('reindeer');
        a.adult = true;
        a.food = 5;
        G.placeAnimal(a);
        state.animals.push(a);
    }
};

test('le traîneau : quatre rennes, des charges de 10, retour en 8 heures', () => {
    nord();
    state.inventory.rye = 100;
    assert.ok(G.sledAdd('rye', 3));
    assert.equal(G.sledLoads(), 3);
    team(3);
    assert.equal(G.sledSend(null), false);
    team(1);
    const value = G.sledValue();
    assert.equal(value, Math.round((30 * G.sellPrice('rye') * SLED.mult) / 10) * 10);
    assert.ok(G.sledSend(null));
    assert.equal(state.inventory.rye, 70);
    assert.equal(G.sledClaim(null), false);
    assert.ok(state.animals.filter(a => a.trip).length === 4);
    clock.t += SLED.time + 1000;
    const m0 = state.money;
    const r = G.sledClaim(null);
    assert.equal(r.value, value);
    assert.ok(state.money >= m0 + value);
    assert.equal(state.animals.filter(a => a.trip).length, 0);
});

test('tarif : plein pour le Nord, modeste pour le reste, +15 % avec le marché de glace', () => {
    nord();
    assert.equal(G.sledMult('rye'), SLED.mult);
    assert.equal(G.sledMult('reindeerMilk'), SLED.mult);
    assert.equal(G.sledMult('cardamom'), SLED.mult);
    assert.equal(G.sledMult('wheat'), SLED.otherMult);
    state.projects.northIce = { given: {}, done: true };
    assert.ok(Math.abs(G.sledMult('rye') / SLED.mult - (1 + SLED.iceBonus)) < 1e-9);
});

test('chapitre 24 : trois chantiers, le dernier fait la fête, dessins et cardamome', () => {
    for (const id of ['northStable', 'northSled', 'northIce']) {
        assert.equal(PROJECTS[id].ch, 24, id);
        assert.equal(PROJECTS[id].map, 'nord', id);
        assert.ok(SPR.building(id, 2).length > 200, id);
    }
    assert.equal(STORY_MAPS.find(m => m.id === 'nord').party, 'northIce');
    assert.ok(ITEMS.cardamom && SPR.item('cardamom').length > 300);
    assert.ok(TIPS.sled);
});
