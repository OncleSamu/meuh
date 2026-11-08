// 1.100 étape 1 : le camping de la vallée.
import test from 'node:test';
import assert from 'node:assert/strict';
import { memStore } from './helpers.mjs';
import { state, setStore } from '../../src/core/state.js';
import { setView } from '../../src/core/view.js';
import { setClock } from '../../src/core/clock.js';
import * as G from '../../src/systems/index.js';
import { CAMPING, CAMP_UPGRADES } from '../../src/data/camping.js';
import { isHabitant } from '../../src/art/habitants.js';

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
}

test('camping : se bâtit au niveau 57, pas avant, une seule fois', () => {
    farm();
    state.level = 50;
    assert.equal(G.canBuildCamp(), false);
    state.level = 60;
    assert.ok(G.buildCamp());
    assert.equal(G.campPitches(), CAMPING.pitches);
    assert.equal(G.buildCamp(), false);
});

test('camping : les campeurs arrivent, jamais plus que d’emplacements, visage de la fabrique, prénoms distincts', () => {
    farm();
    G.buildCamp();
    for (let i = 0; i < 12; i++) {
        T += 3600000;
        G.campTick();
        state.camping.guests.forEach(g => (g.leave = T + 1e9));
        state.camping.next = T;
    }
    const gs = G.campGuests();
    assert.equal(gs.length, CAMPING.pitches);
    assert.ok(gs.every(g => isHabitant(g.look) && g.wants.length >= 2 && g.from));
    assert.equal(new Set(gs.map(g => g.name)).size, gs.length);
});

test('camping : vendre prend le produit et paie plus que sa valeur', () => {
    farm();
    G.buildCamp();
    const g = G.newGuest();
    const id = g.wants[0].item;
    assert.equal(G.sellTo(0, 0), false);
    state.inventory[id] = 1;
    const m = state.money;
    assert.ok(G.sellTo(0, 0));
    assert.ok(state.money - m >= G.priceOf(id) * 0.99);
    assert.ok(G.priceOf(id) > 0);
    assert.equal(state.inventory[id] || 0, 0);
    assert.equal(G.sellTo(0, 0), false);
});

test('camping : tout vendu = ravi + pourboire ; rien vendu = déçu', () => {
    farm();
    G.buildCamp();
    const a = G.newGuest();
    const b = G.newGuest();
    a.wants.forEach(w => (w.done = true));
    assert.equal(G.guestMood(a), 2);
    assert.equal(G.guestMood(b), 0);
    const m = state.money;
    a.leave = b.leave = T;
    state.camping.next = T + 1e9;
    G.campTick();
    assert.equal(G.campGuests().length, 0);
    assert.ok(state.money > m);
    assert.equal(state.camping.past.length, 2);
    assert.equal(state.stats.campHappy, 1);
});

test('camping : emplacements jusqu’à 12, améliorations une fois, l’épicerie se remplit hors ligne', () => {
    farm();
    G.buildCamp();
    const c0 = G.pitchCost();
    assert.ok(G.addPitch());
    assert.ok(G.pitchCost() > c0);
    while (G.addPitch());
    assert.equal(G.campPitches(), CAMPING.maxPitches);
    assert.equal(G.pitchCost(), 0);
    for (const id of Object.keys(CAMP_UPGRADES)) assert.ok(G.buyUp(id), id);
    assert.equal(G.buyUp('shop'), false);
    T += 3 * 3600000;
    G.campTick();
    const till = G.tillAmount();
    assert.ok(till > 0);
    const m = state.money;
    assert.ok(G.collectTill());
    assert.equal(state.money - m, till);
    T += 100 * 3600000;
    G.campTick();
    assert.ok(G.tillAmount() <= CAMPING.tillHours * state.level * CAMPING.tillRate * CAMPING.maxPitches + 1);
});

test('camping : les améliorations changent vraiment les chiffres', () => {
    farm();
    G.buildCamp();
    const gap = G.campGap()[0];
    const id = G.newGuest().wants[0].item;
    const p = G.priceOf(id);
    G.buyUp('play');
    G.buyUp('common');
    assert.ok(G.campGap()[0] < gap);
    assert.ok(G.priceOf(id) > p);
});
