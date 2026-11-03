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

test('1.83.3 : la liste des niveaux parle du plat de Mamie au niveau 10', () => {
    farm();
    assert.ok(G.unlocksAt(10).some(u => /plat de la semaine/.test(u.name) && u.go === 'village/orders'));
    assert.ok(!G.unlocksAt(11).some(u => /plat de la semaine/.test(u.name)));
});

test('1.83 : pas de plat de la semaine avant le niveau 10', () => {
    farm(5);
    assert.equal(G.mamieDish(), null);
});

test('1.83 : un plat fini et rapide, d’une machine achetée, qui ne bouge pas de la semaine', () => {
    farm();
    const id = G.mamieDish();
    assert.ok(id && RECIPES[id] && ITEMS[id].type === 'artisan', 'un plat');
    // la baguette, le pain, les pâtes… ne sont plus écartés parce qu'ils servent d'ingrédient
    assert.ok(G.mamieChoices().includes('baguette') || !G.hasMachine('bakery'), 'baguette possible');
    assert.ok(G.recipeUnlocked(id) && G.hasMachine(RECIPES[id].machine), 'faisable');
    assert.ok(RECIPES[id].time <= G.MAMIE_MAX_TIME, 'rapide');
    for (let k = 0; k < 20; k++) assert.equal(G.mamieDish(), id);
    assert.ok(G.isMamieDish(id));
    assert.ok(!G.isMamieDish('egg'));
});

test('1.83.4 : la maîtrise compte double ; le marché ne donne plus de bonus', () => {
    farm();
    const id = G.mamieDish();
    const withDish = G.sellPrice(id);
    state.mamie.id = G.mamieChoices().find(x => x !== id);
    assert.equal(G.sellPrice(id), withDish, 'la vente au marché est la même');
    state.mamie.id = id;
    state.mastery[id] = 0;
    G.addMastery(id, 3);
    assert.equal(state.mastery[id], 6);
    state.mamie.id = G.mamieChoices().find(x => x !== id);
    state.mastery[id] = 0;
    G.addMastery(id, 3);
    assert.equal(state.mastery[id], 3);
});

test('1.83.4 : on livre le plat à Mamie : +50 %, payé tout de suite, compté, plafonné', () => {
    farm();
    const id = G.mamieDish();
    assert.equal(G.mamieMade(), 0);
    state.inventory[id] = 80;
    const coins = state.money,
        base = G.sellPrice(id);
    assert.equal(G.mamieStock(), 80);
    assert.equal(G.mamieRoom(), G.MAMIE_CAP);
    assert.ok(G.deliverMamie(null, 10));
    assert.equal(state.inventory[id], 70);
    assert.equal(G.mamieMade(), 10);
    const gain = state.money - coins;
    assert.ok(gain >= Math.floor(base * 1.5) * 10 - 10 && gain <= base * 1.5 * 10 + 10, `${gain} pour 10 à ${base}`);
    assert.ok(G.deliverMamie(null, 500));
    assert.equal(G.mamieMade(), G.MAMIE_CAP);
    assert.equal(state.inventory[id], 80 - G.MAMIE_CAP);
    assert.equal(G.mamieRoom(), 0);
    assert.ok(!G.deliverMamie(null, 1));
    G.mamieDish(G.mamieWeekEnd() + 3600000);
    assert.equal(state.mamie.n, 0);
});

test('1.83.2 : boissons, vins et bières peuvent être le plat de la semaine', () => {
    farm(60);
    state.projects.chai = { done: true };
    state.machines.push(G.newMachine('counter'), G.newMachine('winery'));
    const list = G.mamieChoices();
    assert.ok(
        list.some(id => RECIPES[id] && RECIPES[id].machine === 'counter'),
        'boissons du comptoir',
    );
    assert.ok(
        list.some(id => RECIPES[id] && RECIPES[id].machine === 'winery'),
        'vins',
    );
    // une bière brassée entre dans la liste, avec +50 % sur la bouteille
    state.brew = { beers: { b1: { id: 'b1', name: 'Ma blonde', value: 100, made: 4 } }, stock: {}, demand: {}, vats: [], q: {} };
    assert.ok(G.mamieChoices().includes('beer:b1'));
    state.mamie = { w: G.mamieWeek(), id: 'beer:b1', n: 0 };
    const market = G.beerPrice('b1');
    state.brew.stock.b1 = 8;
    assert.equal(G.mamieStock(), 8);
    const coins = state.money;
    assert.ok(G.deliverMamie(null, 6));
    assert.equal(G.mamieMade(), 6);
    assert.equal(state.brew.stock.b1, 2);
    assert.ok(state.money - coins >= market * 1.4 * 6, `${state.money - coins} contre ${market}`);
    assert.equal(G.mamieInfo().name, 'Ma blonde');
});

test('1.83 : le lundi suivant, un autre plat', () => {
    farm();
    const id = G.mamieDish();
    const next = G.mamieDish(G.mamieWeekEnd() + 3600000);
    assert.ok(next && next !== id);
    assert.ok(G.mamieLeftMs() > 0 && G.mamieLeftMs() <= 7 * 86400000);
});
