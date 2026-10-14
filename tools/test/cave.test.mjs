// 1.6.3 : la cave moins corvée et plus utile (un soin par étape, hygromètre, lots plus grands, trophées, commandes).
import test from 'node:test';
import assert from 'node:assert/strict';
import { clock } from './helpers.mjs';
import { state } from '../../src/core/state.js';
import { setView } from '../../src/core/view.js';
import * as G from '../../src/systems/index.js';
import { CAVE_H, CAVE_AUTO } from '../../src/data/cave.js';

const ready = () => {
    G.loadGame();
    setView({ started: true, tab: 'farm' });
    state.level = 30;
    state.money = 1e7;
    G.ensureCave();
};

test('un soin par étape suffit', () => {
    ready();
    state.inventory.cheese = 40;
    assert.ok(G.putInCave(0, 'cheese', 8));
    const lot = state.cave.slots[0];
    assert.equal(G.careNeeded(lot), false, 'tout juste mis en cave : déjà soigné pour cette étape');
    assert.equal(G.careLevel(lot), 1);
    // l'étape passe : un soin pour la suivante
    clock.t = lot.next + 1000;
    G.caveTick();
    const l2 = state.cave.slots[0];
    if (l2 && !l2.bad) {
        assert.equal(G.careNeeded(l2), true);
        assert.equal(G.careLevel(l2), 0.6, 'soigné à l’étape précédente');
        assert.ok(G.careLot(0));
        assert.equal(G.careNeeded(l2), false);
        // une demi-étape plus tard, toujours rien à faire
        clock.t += 1 * CAVE_H;
        assert.equal(G.careNeeded(l2), false);
        assert.equal(G.careLevel(l2), 1);
    }
});

test('l’hygromètre garde le climat dans la bonne zone', () => {
    const c = state.cave;
    c.gear.hygro = true;
    c.temp = 95;
    c.hum = 5;
    state.weather = 'heat';
    c.climAt = clock.t;
    clock.t += 12 * CAVE_H;
    G.caveTick();
    assert.ok(c.temp >= CAVE_AUTO[0] && c.temp <= CAVE_AUTO[1], `température ${c.temp}`);
    assert.ok(c.hum >= CAVE_AUTO[0] && c.hum <= CAVE_AUTO[1], `humidité ${c.hum}`);
    assert.ok(G.climOk());
});

test('les lots grandissent avec les étagères, la voûte donne deux places', () => {
    const c = state.cave;
    c.shelves = 0;
    assert.equal(G.caveLotMax(), 8);
    c.shelves = 2;
    assert.equal(G.caveLotMax(), 12);
    c.shelves = 6;
    assert.equal(G.caveLotMax(), 20);
    const n = G.caveSlots();
    c.gear.vault = true;
    assert.equal(G.caveSlots(), n + 2);
});

test('un lot légendaire devient un trophée, avec un ruban la première fois', () => {
    const c = state.cave;
    const i = c.slots.indexOf(null);
    state.inventory.comte = 20;
    assert.ok(G.putInCave(i, 'comte', 10));
    c.slots[i].rank = 4;
    const r = state.prestige.rubans;
    assert.ok(G.takeOut(i));
    assert.equal(state.prestige.rubans, r + 1);
    assert.ok(c.legends.cheese && c.legends.cheese.n === 1);
    // le deuxième ne donne plus de ruban
    const j = c.slots.indexOf(null);
    assert.ok(G.putInCave(j, 'comte', 10));
    c.slots[j].rank = 4;
    G.takeOut(j);
    assert.equal(state.prestige.rubans, r + 1);
    assert.equal(c.legends.cheese.n, 2);
    assert.equal(G.caveLegends().length, 1);
});

test('les commandes de la cave se livrent depuis la réserve', () => {
    const c = state.cave;
    state.villagers.gaston = state.villagers.gaston || { pts: 0, hearts: 0, giftDay: 0 };
    c.reserve = [{ uid: 999, id: 'cheese', n: 6, rank: 2, bad: false }];
    c.orders = [{ id: 'cT', vid: 'gaston', item: 'cheese', min: 1, n: 4 }];
    assert.match(G.caveOrderText(c.orders[0]), /fromage/i);
    assert.equal(G.caveOrdersReady(), 1);
    const m = state.money,
        before = state.stats.caveOrders || 0;
    assert.ok(G.deliverCaveOrder('cT'));
    assert.ok(state.money > m);
    assert.equal(state.stats.caveOrders, before + 1);
    assert.equal(c.reserve[0].n, 2, 'le lot est entamé, pas vidé');
    // trop jeune : ne convient pas
    c.orders = [{ id: 'cU', vid: 'gaston', item: 'cheese', min: 3, n: 2 }];
    assert.equal(G.caveOrderLot(c.orders[0]), null);
    // de nouvelles commandes arrivent avec le temps
    c.orders = [];
    c.nextOrder = 0;
    assert.ok(G.caveOrderTick());
    assert.equal(c.orders.length, 1);
});

test('les résultats d’une vente vue de loin restent jusqu’à « Vu ! »', () => {
    const c = state.cave;
    c.lastSale = { big: true, results: [], until: clock.t - 1000, keep: true };
    assert.ok(G.lastSaleShown());
    G.dismissAuction();
    assert.equal(G.lastSaleShown(), null);
    c.lastSale = { big: false, results: [], until: clock.t - 1000, keep: false };
    assert.equal(G.lastSaleShown(), null);
});
