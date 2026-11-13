// 1.131 : le camping. Les campeurs achètent par lots ; la réputation du camping monte avec les campeurs ravis.
import test from 'node:test';
import assert from 'node:assert/strict';
import { memStore } from './helpers.mjs';
import { state, setStore } from '../../src/core/state.js';
import { setView } from '../../src/core/view.js';
import { setClock } from '../../src/core/clock.js';
import * as G from '../../src/systems/index.js';
import { LOTS, CAMP_REP, CAMPING } from '../../src/data/camping.js';

let T = Date.UTC(2026, 10, 13, 12);
function camp(level = CAMPING.lvl) {
    setClock(() => T);
    setStore(memStore());
    G.loadGame();
    setView({ started: true, tab: 'farm', hidden: false });
    state.tutorial.done = true;
    state.level = 80;
    state.money = 1e10;
    for (const k of ['plank', 'stone', 'beam', 'tools']) state.inventory[k] = 1000;
    assert.ok(G.buildCamp());
    state.camping.guests = [];
    state.camping.res = [];
    state.camping.asks = [];
    state.level = level;
}

test('un campeur achète par lots, selon son profil et le niveau', () => {
    camp();
    const g = G.newGuest(T, 11, { plain: true });
    for (const w of g.wants) assert.equal(w.n, LOTS[g.profile]);
    state.level = CAMPING.lvl + LOTS.perLvl * 2;
    assert.equal(G.lotSize('family'), LOTS.family + 2);
    state.level = 200;
    assert.equal(G.lotSize('family'), LOTS.family + LOTS.maxExtra);
    // une vieille tente (sans lot) : un seul exemplaire
    assert.equal(G.wantN({ item: 'apple', done: false }), 1);
});

test('vendre un lot : tout d’un coup, ou ce qu’on a, puis le reste', () => {
    camp();
    const g = G.newGuest(T, 12, { plain: true });
    const w = g.wants[0];
    const n = G.wantN(w);
    state.inventory[w.item] = n - 1;
    const m0 = state.money;
    assert.equal(G.sellNow(g, 0), n - 1);
    assert.ok(G.sellTo(0, 0));
    assert.equal(w.sold, n - 1);
    assert.equal(w.done, false);
    assert.equal(state.money - m0, G.priceOf(w.item, g) * (n - 1));
    assert.equal(G.guestMood(g), 1, 'un lot entamé : content');
    state.inventory[w.item] = 5;
    assert.ok(G.sellTo(0, 0));
    assert.equal(w.done, true);
    assert.equal(state.inventory[w.item], 4);
});

test('la réputation : ravi la fait monter, déçu la fait baisser, chaque palier aide', () => {
    camp();
    assert.equal(G.campRepTier(), 0);
    const tip0 = G.starChance();
    // un campeur ravi
    const g = G.newGuest(T, 13, { plain: true });
    g.wants.forEach((w, i) => {
        state.inventory[w.item] = 50;
        G.sellTo(0, i);
    });
    g.leave = T;
    T += 1000;
    G.campTick();
    assert.equal(G.campRep(), CAMP_REP.gain[2]);
    // un déçu
    const h = G.newGuest(T, 14, { plain: true });
    h.leave = T;
    T += 1000;
    G.campTick();
    assert.equal(G.campRep(), CAMP_REP.gain[2] + CAMP_REP.gain[0]);
    state.camping.rep = CAMP_REP.tiers[2].n;
    assert.equal(G.campRepTier(), 2);
    assert.equal(G.campRepName(), CAMP_REP.tiers[2].name);
    assert.ok(Math.abs(G.starChance() - tip0 - 2 * CAMP_REP.starChance) < 1e-9);
    assert.ok(CAMPING.lvl > 0);
});
