// 1.37.1 : le deuxième poste des machines (deux lots à la fois).
import test from 'node:test';
import assert from 'node:assert/strict';
import { state } from '../../src/core/state.js';
import { setView } from '../../src/core/view.js';
import * as G from '../../src/systems/index.js';
import { RECIPES } from '../../src/data/machines.js';

const start = () => {
    G.loadGame();
    setView({ started: false, tab: 'farm' });
    state.level = 60;
    state.money = 1e9;
    state.machines.push(G.newMachine('mill'));
    const i = state.machines.length - 1;
    const rid = Object.keys(RECIPES).find(r => RECIPES[r].machine === 'mill' && Object.keys(RECIPES[r].ing).length === 1);
    for (const k of Object.keys(RECIPES[rid].ing)) state.inventory[k] = 100;
    return { i, rid, m: state.machines[i] };
};

test('deuxième poste : payant, puis deux lots tournent ensemble', () => {
    const { i, rid, m } = start();
    const t = G.recipeTime(rid);
    const cost = G.lane2Cost('mill');
    const before = state.money;
    assert.ok(G.buyLane2(i));
    assert.equal(state.money, before - cost);
    assert.ok(!G.buyLane2(i), 'une seule fois');
    G.queueRecipe(i, rid);
    G.queueRecipe(i, rid);
    G.queueRecipe(i, rid);
    G.advanceMachine(m, t + 0.5);
    assert.equal(m.out[rid], 2, 'les deux premiers lots sortent en même temps');
    assert.equal(m.queue.length, 1);
    G.advanceMachine(m, t);
    assert.equal(m.out[rid], 3);
});

test('sans deuxième poste, les lots restent à la suite', () => {
    const { i, rid, m } = start();
    const t = G.recipeTime(rid);
    G.queueRecipe(i, rid);
    G.queueRecipe(i, rid);
    G.advanceMachine(m, t + 0.5);
    assert.equal(m.out[rid], 1);
});

test('deuxième poste : un long temps hors-ligne vide la file au double de vitesse', () => {
    const { i, rid, m } = start();
    const t = G.recipeTime(rid);
    G.buyLane2(i);
    for (let k = 0; k < 4; k++) G.queueRecipe(i, rid);
    G.advanceMachine(m, t * 2 + 1);
    assert.equal(m.out[rid], 4);
    assert.equal(m.queue.length, 0);
});

test('les pousses en trop se revendent (hors grange)', () => {
    start();
    state.seeds.apple = 7;
    const used = G.barnUsed(),
        money = state.money;
    assert.ok(G.sellSeeds('apple', 0));
    assert.equal(state.seeds.apple, 0);
    assert.equal(state.money, money + 7 * G.seedBackPrice('apple'));
    assert.equal(G.barnUsed(), used);
});
