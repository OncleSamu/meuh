// 1.85 : les plans du champ.
import test from 'node:test';
import assert from 'node:assert/strict';
import { memStore } from './helpers.mjs';
import { state, setStore } from '../../src/core/state.js';
import { setView } from '../../src/core/view.js';
import * as G from '../../src/systems/index.js';

function farm(lvl = 30, up = 1) {
    setStore(memStore());
    G.loadGame();
    setView({ started: false, tab: 'farm' });
    state.level = lvl;
    state.money = 100000;
    state.upgrades.plan = up;
    state.grid.forEach(p => {
        if (p.isUnlocked) p.terrain = 'plowed';
    });
}
const sow = (i, id) => {
    state.grid[i].itemId = id;
};

test('1.85 : le plan du champ est une amélioration niveau 28, 1 puis 3 puis 6 emplacements', () => {
    farm(27, 0);
    assert.ok(!G.upgradeOpen('plan'));
    state.level = 28;
    assert.ok(G.upgradeOpen('plan'));
    assert.equal(G.planSlots(), 0);
    assert.ok(!G.planOpen());
    for (const [lvl, n] of [
        [1, 1],
        [2, 3],
        [3, 6],
    ]) {
        state.upgrades.plan = lvl;
        assert.equal(G.planSlots(), n);
    }
    assert.ok(G.unlocksAt(28).some(u => /Plan du champ/.test(u.name)));
});

test('1.85 : enregistrer puis replanter tout d’un clic, sans rien remplacer', () => {
    farm();
    assert.ok(!G.savePlan(0), 'rien à enregistrer');
    sow(0, 'carrot');
    sow(1, 'carrot');
    sow(2, 'tomato');
    assert.ok(G.savePlan(0));
    assert.equal(G.planAt(0).name, 'Plan 1');
    assert.deepEqual(G.planAt(0).c, { 0: 'carrot', 1: 'carrot', 2: 'tomato' });
    assert.ok(!G.savePlan(1), 'un seul emplacement');
    // on récolte tout, sauf la parcelle 1 qui reste occupée par autre chose
    for (const i of [0, 2]) state.grid[i].itemId = null;
    state.grid[1].itemId = 'wheat';
    const r = G.planPreview(0);
    assert.equal(r.sow, 2);
    assert.equal(r.busy, 1);
    const money = state.money;
    const out = G.applyPlan(0);
    assert.equal(out.sow, 2);
    assert.equal(state.grid[0].itemId, 'carrot');
    assert.equal(state.grid[2].itemId, 'tomato');
    assert.equal(state.grid[1].itemId, 'wheat', 'rien remplacé');
    assert.ok(state.money < money, 'les graines sont payées');
    assert.ok(out.fee === 50, 'la main-d’œuvre');
});

test('1.85 : les graines en stock partent d’abord ; sans graines ni pièces, on le dit', () => {
    farm();
    sow(0, 'carrot');
    sow(1, 'carrot');
    G.savePlan(0);
    state.grid[0].itemId = null;
    state.grid[1].itemId = null;
    state.seeds.carrot = 1;
    state.money = G.planFee();
    const r = G.applyPlan(0);
    assert.equal(r.sow, 1);
    assert.equal(state.seeds.carrot, 0);
    assert.equal(r.lack.carrot, 1);
    assert.equal(state.money, 0, 'seule la main-d’œuvre est payée');
    assert.equal(state.grid[0].itemId, 'carrot');
    assert.equal(state.grid[1].itemId, null);
});

test('1.85 : la main-d’œuvre : 50 pièces, +10 tous les 5 niveaux ; sans elle, rien ne se sème', () => {
    farm(28);
    assert.equal(G.planFee(), 50);
    state.level = 32;
    assert.equal(G.planFee(), 50);
    state.level = 33;
    assert.equal(G.planFee(), 60);
    state.level = 43;
    assert.equal(G.planFee(), 80);
    state.level = 30;
    sow(0, 'carrot');
    G.savePlan(0);
    state.grid[0].itemId = null;
    state.seeds.carrot = 1;
    state.money = 49;
    assert.equal(G.applyPlan(0), null);
    assert.equal(state.grid[0].itemId, null);
    assert.equal(state.money, 49);
    assert.ok(G.planPreview(0).noFee);
});

test('1.85 : une parcelle non labourée est signalée, pas semée', () => {
    farm();
    sow(0, 'carrot');
    G.savePlan(0);
    state.grid[0].itemId = null;
    state.grid[0].terrain = 'grass';
    assert.equal(G.planPreview(0).plow, 1);
    assert.equal(G.applyPlan(0).sow, 0);
    assert.equal(state.grid[0].itemId, null);
});

test('1.85 : renommer, remplacer et effacer un plan', () => {
    farm(30, 2);
    sow(0, 'carrot');
    G.savePlan(0);
    assert.ok(G.renamePlan(0, '  Rangées  '));
    assert.equal(G.planAt(0).name, 'Rangées');
    sow(3, 'tomato');
    G.savePlan(0);
    assert.equal(G.planAt(0).name, 'Rangées', 'le nom est gardé');
    assert.equal(Object.keys(G.planAt(0).c).length, 2);
    assert.ok(G.savePlan(1));
    assert.ok(G.clearPlan(0));
    assert.equal(G.planAt(0), null);
    assert.ok(!G.renamePlan(0, 'x'));
});
