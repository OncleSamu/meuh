// 1.89 : dire aux abeilles de ne pas faire de miel.
import test from 'node:test';
import assert from 'node:assert/strict';
import { memStore } from './helpers.mjs';
import { state, setStore } from '../../src/core/state.js';
import { setView } from '../../src/core/view.js';
import * as G from '../../src/systems/index.js';

function farm() {
    setStore(memStore());
    G.loadGame();
    setView({ started: false, tab: 'farm' });
    state.level = 40;
}

test('1.89 : les ruches du champ ne font plus de miel quand les abeilles se reposent', () => {
    farm();
    const i = 14;
    state.grid.forEach(p => (p.isUnlocked = true));
    state.grid[i].deco = 'hive';
    // des fleurs autour de la ruche
    for (const j of [i - 1, i + 1, i - 6, i + 6]) state.grid[j].itemId = 'sunflower';
    state.grid[i].honey = 0;
    G.honeyTick(100000);
    const made = state.grid[i].honey;
    assert.ok(made > 0, 'elles font du miel normalement');
    state.settings.hiveRest = true;
    state.grid[i].honey = 0;
    G.honeyTick(100000);
    assert.equal(state.grid[i].honey, 0, 'au repos : rien');
    state.grid[i].honey = 2;
    assert.ok(G.handleHive(i, null), 'le miel déjà en pot se récolte');
});

test('1.89 : le rucher d’une contrée peut être mis au repos, puis réveillé', () => {
    farm();
    const r = G.apiaryOf('island');
    r.hives = 1;
    assert.ok(G.toggleHiveRest('island'));
    assert.ok(r.rest);
    assert.match(G.apiaryIdle('island'), /se reposent/);
    assert.equal(G.apiaryRate('island'), 0);
    G.toggleHiveRest('island');
    assert.ok(!r.rest);
    assert.ok(!/se reposent/.test(G.apiaryIdle('island') || ''));
    r.hives = 0;
    assert.equal(G.toggleHiveRest('island'), false, 'sans ruche, rien à régler');
});

test('1.89 : la ruche d’élevage au repos ne produit rien et ne mange pas', () => {
    farm();
    const a = G.newAnimal('bees');
    a.adult = true;
    a.food = 3;
    a.stack = 0;
    state.animals = [a];
    assert.ok(G.toggleBeeRest(a.uid));
    assert.ok(G.isResting(a));
    for (let k = 0; k < 5000; k++) G.animalsTick();
    assert.equal(a.stack, 0);
    assert.equal(a.food, 3);
    G.animalsOffline(100000);
    assert.equal(a.stack, 0);
    G.toggleBeeRest(a.uid);
    assert.ok(!G.isResting(a));
    G.animalsOffline(100000);
    assert.ok(a.stack > 0, 'réveillée, elle travaille');
    const cow = G.newAnimal('cow');
    state.animals.push(cow);
    assert.equal(G.toggleBeeRest(cow.uid), false);
});
