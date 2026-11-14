// 1.136 : confort. Remplir une file, tout livrer, programmes de l'atelier, plan pendant l'absence.
import test from 'node:test';
import assert from 'node:assert/strict';
import { memStore } from './helpers.mjs';
import { state, setStore } from '../../src/core/state.js';
import { setView } from '../../src/core/view.js';
import { setClock } from '../../src/core/clock.js';
import * as G from '../../src/systems/index.js';

let T = Date.UTC(2026, 10, 14, 9);
function farm() {
    setClock(() => T);
    setStore(memStore());
    G.loadGame();
    setView({ started: false, tab: 'farm', hidden: false });
    state.tutorial.done = true;
    state.level = 40;
    state.money = 1e9;
    state.villagers.gaston = { ...(state.villagers.gaston || {}), hearts: 5 };
    state.barn.lvl = 12;
    state.machines = [];
    for (const t of ['pastaworks', 'kitchen', 'dairy', 'mill']) state.machines.push(G.newMachine(t));
    Object.assign(state.inventory, { flour: 40, egg: 20, tomato: 60, carrot: 20, milk: 40, wheat: 60, pasta: 0, sauce: 0, cheese: 0, lasagna: 0 });
}

test('un appui long remplit la file, selon la place et les ingrédients', () => {
    farm();
    const i = state.machines.findIndex(m => m.type === 'dairy');
    const slots = G.machineSlots('dairy');
    assert.equal(G.fillQueue(i, 'cheese', null), slots);
    assert.equal(state.machines[i].queue.length, slots);
    assert.equal(G.fillQueue(i, 'cheese', null), 0, 'file pleine');
    // pas assez d'ingrédients pour toute la file : on lance ce qu'on peut
    farm();
    state.inventory.milk = 2;
    const n = G.fillQueue(i, 'cheese', null);
    assert.ok(n >= 1 && n < slots);
});

test('tout livrer : chaque commande revérifie le stock', () => {
    farm();
    G.ensureQuests();
    const open = state.quests.filter(q => G.isOpen(q));
    assert.ok(open.length >= 2);
    open.forEach(q => q.items.forEach(x => (state.inventory[x.id] = 0)));
    assert.equal(G.questsReady(), 0);
    assert.equal(G.turnInAll(null), 0);
    open.forEach(q => q.items.forEach(x => (state.inventory[x.id] = (state.inventory[x.id] || 0) + x.qty)));
    const ready = G.questsReady();
    assert.equal(ready, open.length);
    const m0 = state.money;
    assert.equal(G.turnInAll(null), ready);
    assert.ok(state.money > m0);
    assert.equal(G.questsReady(), 0);
    open.forEach(q => q.items.forEach(x => assert.ok(state.inventory[x.id] >= 0)));
});

test('un programme retient les files et les relance', () => {
    farm();
    assert.equal(G.savePreset(0), false, 'rien à retenir');
    const d = state.machines.findIndex(m => m.type === 'dairy');
    const p = state.machines.findIndex(m => m.type === 'pastaworks');
    G.queueRecipe(d, 'cheese', null);
    G.queueRecipe(d, 'cheese', null);
    G.queueRecipe(p, 'pasta', null);
    assert.ok(G.savePreset(0));
    assert.equal(G.presetSize(0), 3);
    state.machines.forEach(m => (m.queue = []));
    assert.equal(G.runPreset(0, null), 3);
    assert.deepEqual(state.machines[d].queue, ['cheese', 'cheese']);
    // sans lait : on lance ce qui peut l'être
    state.machines.forEach(m => (m.queue = []));
    state.inventory.milk = 0;
    assert.equal(G.runPreset(0, null), 1);
    assert.ok(G.dropPreset(0));
    assert.equal(G.runPreset(0, null), 0);
});

test('le plan de production continue pendant l’absence', () => {
    farm();
    assert.ok(G.startPlan('lasagna', 10));
    state.lastSaved = T;
    T += 3 * 3600 * 1000;
    const r = G.offlineProgress();
    assert.equal(G.planOf(), null, 'plan terminé au retour');
    assert.ok(r.lines.some(l => /Plan terminé/.test(l[1])));
    const lasagnas = state.machines.filter(m => m.type === 'pastaworks').reduce((a, m) => a + m.queue.filter(x => x === 'lasagna').length + (m.out.lasagna || 0), 0) + state.inventory.lasagna;
    assert.equal(lasagnas, 10);
});
