// 1.100 : le gîte et la table d'hôtes.
import test from 'node:test';
import assert from 'node:assert/strict';
import { memStore } from './helpers.mjs';
import { state, setStore } from '../../src/core/state.js';
import { setView } from '../../src/core/view.js';
import { setClock } from '../../src/core/clock.js';
import * as G from '../../src/systems/index.js';
import { GITE } from '../../src/data/gite.js';
import { isHabitant } from '../../src/art/habitants.js';

let T = Date.UTC(2026, 10, 8, 12);
function farm() {
    setClock(() => T);
    setStore(memStore());
    G.loadGame();
    setView({ started: true, tab: 'farm', hidden: false });
    state.tutorial.done = true;
    state.level = 40;
    state.money = 1e9;
    state.inventory.plank = state.inventory.stone = state.inventory.beam = 500;
}

test('1.100 : le gîte se bâtit au niveau 35, pas avant', () => {
    farm();
    state.level = 30;
    assert.equal(G.canBuildGite(), false);
    state.level = 40;
    assert.ok(G.buildGite());
    assert.equal(G.giteRooms(), GITE.rooms);
    assert.equal(G.buildGite(), false);
});

test('1.100 : les clients arrivent, jamais plus que de chambres, avec un visage de la fabrique', () => {
    farm();
    G.buildGite();
    for (let i = 0; i < 10; i++) {
        T += 10 * 3600000 / 10;
        G.giteTick();
        state.gite.guests.forEach(g => (g.leave = T + 1e9));
        state.gite.next = T;
    }
    assert.equal(G.giteGuests().length, GITE.rooms);
    assert.ok(G.giteGuests().every(g => isHabitant(g.look) && g.wants.length >= 1));
});

test('1.100 : tout servi = 5 étoiles et pourboire ; rien servi = 1 étoile, moins payé', () => {
    farm();
    G.buildGite();
    const a = G.newGuest(), b = G.newGuest();
    a.wants.forEach(w => (w.done = true));
    assert.equal(G.guestStars(a), 5);
    assert.equal(G.guestStars(b), 1);
    assert.ok(G.guestPay(a) > G.guestPay(b));
    const m = state.money;
    a.leave = b.leave = T;
    state.gite.next = T + 1e9;
    G.giteTick();
    assert.equal(G.giteGuests().length, 0);
    assert.ok(state.money > m);
    assert.equal(state.gite.reviews.length, 2);
    assert.equal(state.gite.reviews[0].stars, 1);
    assert.equal(G.giteRep(), 3);
});

test('1.100 : servir prend un plat en stock', () => {
    farm();
    G.buildGite();
    const g = G.newGuest();
    const id = g.wants[0].item;
    assert.equal(G.serve(0, 0), false);
    state.inventory[id] = 1;
    assert.ok(G.serve(0, 0));
    assert.equal(state.inventory[id] || 0, 0);
    assert.equal(G.serve(0, 0), false);
});

test('1.100 : chambres en plus, jusqu’à 8, et bonne réputation = arrivées plus rapides', () => {
    farm();
    G.buildGite();
    const c0 = G.roomCost();
    assert.ok(G.addRoom());
    assert.ok(G.roomCost() > c0);
    while (G.addRoom());
    assert.equal(G.giteRooms(), GITE.maxRooms);
    assert.equal(G.roomCost(), 0);
    const slow = G.giteGap()[0];
    state.gite.reviews = [{ stars: 5 }, { stars: 5 }];
    assert.ok(G.giteGap()[0] < slow);
});
