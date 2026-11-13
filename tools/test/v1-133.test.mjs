// 1.133 : le plan de production. Toute la chaîne d'un plat, lancée sur les machines ; le plat final part quand tout est prêt.
import test from 'node:test';
import assert from 'node:assert/strict';
import { memStore } from './helpers.mjs';
import { state, setStore } from '../../src/core/state.js';
import { setView } from '../../src/core/view.js';
import { setClock } from '../../src/core/clock.js';
import * as G from '../../src/systems/index.js';
import { RECIPES } from '../../src/data/machines.js';

let T = Date.UTC(2026, 10, 13, 22);
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
    for (const t of ['pastaworks', 'kitchen', 'dairy', 'mill', 'coop']) state.machines.push(G.newMachine(t));
    Object.assign(state.inventory, { flour: 40, egg: 20, tomato: 60, carrot: 20, milk: 40, pasta: 0, sauce: 0, cheese: 0, lasagna: 0 });
}
const run = (sec = 20000) => {
    for (let i = 0; i < sec && G.planOf(); i++) {
        T += 1000;
        G.gameTick();
    }
};

test('l’arbre : toute la chaîne, stock déduit', () => {
    farm();
    state.inventory.cheese = 3;
    const s = G.prodPreview('lasagna', 10);
    const by = Object.fromEntries(s.steps.map(x => [x.id, x.n]));
    assert.equal(by.pasta, 10);
    assert.equal(by.sauce, 10);
    assert.equal(by.cheese, 7, 'trois fromages déjà en grange');
    assert.deepEqual(s.raws, [], 'tout le brut est là');
    assert.ok(s.time > 0);
    state.inventory.tomato = 12;
    const s2 = G.prodPreview('lasagna', 10);
    assert.deepEqual(s2.raws, [{ id: 'tomato', n: 28 }]);
});

test('le plan lance les étapes, ramasse, puis lance les 10 plats d’un coup', () => {
    farm();
    assert.ok(G.plannable('lasagna'));
    assert.ok(G.startPlan('lasagna', 10));
    const q = t => state.machines.filter(m => m.type === t).reduce((a, m) => a + m.queue.length, 0);
    assert.ok(q('pastaworks') > 0 && q('kitchen') > 0 && q('dairy') > 0, 'les trois machines tournent');
    assert.equal(state.machines.find(m => m.type === 'pastaworks').queue.includes('lasagna'), false, 'le plat attend ses ingrédients');
    // les ingrédients gardés ne partent pas au marché
    assert.ok(G.reservedQty('tomato') > 0 || G.reservedQty('carrot') > 0 || G.coming('sauce') > 0);
    run();
    assert.equal(G.planOf(), null, 'plan terminé');
    const lasagnas = state.machines.filter(m => m.type === 'pastaworks').reduce((a, m) => a + m.queue.filter(x => x === 'lasagna').length + (m.out.lasagna || 0), 0);
    assert.equal(lasagnas, 10);
});

test('un produit brut qui manque : le plan attend, puis reprend tout seul', () => {
    farm();
    state.inventory.tomato = 12;
    G.startPlan('lasagna', 10);
    run(3000);
    assert.ok(G.planOf(), 'le plan attend les tomates');
    assert.ok(G.planSummary().raws.some(r => r.id === 'tomato'));
    state.inventory.tomato += 40;
    run();
    assert.equal(G.planOf(), null);
});

test('une étape bloquée est signalée ; on peut arrêter le plan', () => {
    farm();
    state.villagers.gaston.hearts = 0;
    const s = G.prodPreview('lasagna', 5);
    if (RECIPES.sauce.teacher) assert.ok(s.blocked.some(b => b.id === 'sauce' && b.blocked === 'recipe'));
    state.villagers.gaston.hearts = 5;
    G.startPlan('lasagna', 5);
    assert.ok(G.stopPlan());
    assert.equal(G.planOf(), null);
});
