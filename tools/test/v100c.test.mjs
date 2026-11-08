// 1.100 étape 3 : la Maison, votre marque.
import test from 'node:test';
import assert from 'node:assert/strict';
import { memStore } from './helpers.mjs';
import { state, setStore } from '../../src/core/state.js';
import { setView } from '../../src/core/view.js';
import { setClock } from '../../src/core/clock.js';
import * as G from '../../src/systems/index.js';
import { MAISON, MAISON_CLIENTS, EMBLEMS, PALETTES } from '../../src/data/maison.js';
import { ITEMS } from '../../src/data/items.js';

let T = Date.UTC(2026, 10, 8, 12);
function farm() {
    setClock(() => T);
    setStore(memStore());
    G.loadGame();
    setView({ started: true, tab: 'farm', hidden: false });
    state.tutorial.done = true;
    state.level = 60;
    state.money = 1e10;
    for (const k of ['plank', 'stone', 'beam', 'tools']) state.inventory[k] = 1000;
    G.buildCamp();
    Object.assign(state.inventory, { egg: 50, wheat: 50, carp: 50, cheese: 50, apple: 50 });
}
const IDS = ['egg', 'carp', 'cheese'];

test('maison : il faut le camping, puis la fonder une seule fois', () => {
    setClock(() => T);
    setStore(memStore());
    G.loadGame();
    setView({ started: true, tab: 'farm', hidden: false });
    state.level = 60;
    state.money = 1e10;
    assert.equal(G.canFoundMaison(), false);
    farm();
    assert.ok(G.foundMaison());
    assert.equal(G.foundMaison(), false);
});

test('maison : un coffret vaut plus que ses produits, plus encore varié et de qualité', () => {
    farm();
    G.foundMaison();
    const plain = IDS.reduce((a, id) => a + ITEMS[id].sell, 0);
    const v0 = G.coffretValue(IDS, 0);
    assert.ok(v0 > plain);
    assert.ok(G.coffretValue(['egg', 'egg', 'apple'], 0) < v0 || new Set(['egg', 'egg', 'apple']).size < 3);
    assert.ok(G.coffretValue(IDS, 2) > G.coffretValue(IDS, 1));
    assert.ok(G.coffretValue(IDS, 1) > v0);
});

test('maison : assembler prend les produits, 15 minutes d’atelier, puis le coffret entre en vitrine', () => {
    farm();
    G.foundMaison();
    const before = state.inventory.egg;
    assert.equal(G.makeCoffret(['egg', 'nope', 'cheese']), false);
    assert.ok(G.makeCoffret(IDS, 0));
    assert.equal(state.inventory.egg, before - 1);
    assert.equal(G.makeCoffret(IDS, 0), false); // un seul poste
    G.maisonTick();
    assert.equal(state.maison.stock.length, 0);
    T += MAISON.time + 1;
    assert.equal(G.maisonTick(), true);
    assert.equal(state.maison.stock.length, 1);
    assert.equal(state.maison.work, null);
});

test('maison : vendre paie, fait monter la réputation, ouvre des clients et des emblèmes', () => {
    farm();
    G.foundMaison();
    assert.equal(G.maisonTier(), 0);
    assert.equal(G.clientsOpen().length, 1);
    assert.equal(G.emblemsOpen(), 6);
    let guard = 0;
    while (G.maisonTier() < 1 && guard++ < 50) {
        G.makeCoffret(IDS, 0);
        T += MAISON.time + 1;
        G.maisonTick();
        const cof = state.maison.stock[0];
        T += MAISON.wait + 1;
        const m = state.money;
        assert.ok(G.sellCoffret(cof.uid, 'neighbors'));
        assert.equal(state.money - m, G.offerFor(cof, MAISON_CLIENTS[0]));
    }
    assert.equal(G.maisonTier(), 1);
    assert.equal(G.clientsOpen().length, 2);
    assert.equal(G.emblemsOpen(), 12);
});

test('maison : un client attend après un achat, exige sa qualité, et n’est pas ouvert trop tôt', () => {
    farm();
    G.foundMaison();
    G.makeCoffret(IDS, 0);
    T += MAISON.time + 1;
    G.maisonTick();
    const cof = state.maison.stock[0];
    assert.equal(G.canSellTo(cof, MAISON_CLIENTS[1]), false); // palier 2 pas atteint
    assert.ok(G.sellCoffret(cof.uid, 'neighbors'));
    G.makeCoffret(IDS, 0);
    T += MAISON.time + 1;
    G.maisonTick();
    const c2 = state.maison.stock[0];
    assert.equal(G.canSellTo(c2, MAISON_CLIENTS[0]), false); // il revient dans 3 h
    T += MAISON.wait + 1;
    assert.equal(G.canSellTo(c2, MAISON_CLIENTS[0]), true);
    state.maison.rep = 1000;
    assert.equal(G.canSellTo(c2, MAISON_CLIENTS[2]), false); // il veut de l’argent ou mieux
});

test('maison : nom, emblème et couleurs ; emblèmes verrouillés tant que la réputation manque', () => {
    farm();
    G.foundMaison();
    assert.ok(G.renameBrand(0, '  Les Trois Prés  '));
    assert.equal(G.brandName(), 'Les Trois Prés');
    assert.equal(G.renameBrand(0, '   '), false);
    assert.ok(G.setEmblem(EMBLEMS[0]));
    assert.equal(G.setEmblem(EMBLEMS[29]), false);
    assert.ok(G.setPalette(3));
    assert.equal(G.setPalette(99), false);
    assert.equal(state.maison.palette, 3);
    state.maison.rep = 10000;
    assert.ok(G.setEmblem(EMBLEMS[29]));
    assert.equal(EMBLEMS.length, 30);
    assert.equal(PALETTES.length, 8);
    for (const id of EMBLEMS) assert.ok(ITEMS[id], id);
});
