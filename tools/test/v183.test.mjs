// 1.83 : le plat de la semaine de Mamie.
import test from 'node:test';
import assert from 'node:assert/strict';
import { memStore } from './helpers.mjs';
import { state, setStore } from '../../src/core/state.js';
import { setView } from '../../src/core/view.js';
import * as G from '../../src/systems/index.js';
import { RECIPES } from '../../src/data/machines.js';
import { ITEMS } from '../../src/data/items.js';

function farm(lvl = 40) {
    setStore(memStore());
    G.loadGame();
    setView({ started: false, tab: 'machines' });
    state.level = lvl;
    for (const t of ['kitchen', 'stove', 'marmite', 'pastry', 'deli', 'bakery']) if (!G.hasMachine(t)) state.machines.push(G.newMachine(t));
}

test('1.83 : pas de plat de la semaine avant le niveau 10', () => {
    farm(5);
    assert.equal(G.mamieDish(), null);
});

test('1.83 : un plat fini et rapide, d’une machine achetée, qui ne bouge pas de la semaine', () => {
    farm();
    const id = G.mamieDish();
    assert.ok(id && RECIPES[id] && ITEMS[id].type === 'artisan', 'un plat');
    assert.ok(G.recipeUnlocked(id) && G.hasMachine(RECIPES[id].machine), 'faisable');
    assert.ok(RECIPES[id].time <= G.MAMIE_MAX_TIME, 'rapide');
    // pas un ingrédient d'autre chose
    for (const r of Object.values(RECIPES)) assert.ok(!r.ing[id], `${id} sert à ${r.id}`);
    for (let k = 0; k < 20; k++) assert.equal(G.mamieDish(), id);
    assert.ok(G.isMamieDish(id));
    assert.ok(!G.isMamieDish('egg'));
});

test('1.83 : +50 % sur le prix, maîtrise double', () => {
    farm();
    const id = G.mamieDish();
    const withBonus = G.sellPrice(id);
    state.mamie.id = G.mamieChoices().find(x => x !== id);
    const without = G.sellPrice(id);
    assert.ok(withBonus > without * 1.45 && withBonus < without * 1.55, `${withBonus} contre ${without}`);
    state.mamie.id = id;
    state.mastery[id] = 0;
    G.addMastery(id, 3);
    assert.equal(state.mastery[id], 6);
    state.mamie.id = G.mamieChoices().find(x => x !== id);
    state.mastery[id] = 0;
    G.addMastery(id, 3);
    assert.equal(state.mastery[id], 3);
});

test('1.83 : le lundi suivant, un autre plat', () => {
    farm();
    const id = G.mamieDish();
    const next = G.mamieDish(G.mamieWeekEnd() + 3600000);
    assert.ok(next && next !== id);
    assert.ok(G.mamieLeftMs() > 0 && G.mamieLeftMs() <= 7 * 86400000);
});
