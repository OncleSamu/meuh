// 1.128 : les petites demandes des enfants, les anniversaires des petits-enfants.
import test from 'node:test';
import assert from 'node:assert/strict';
import { clock, memStore } from './helpers.mjs';
import { state, setStore } from '../../src/core/state.js';
import { setView } from '../../src/core/view.js';
import * as G from '../../src/systems/index.js';
import { ASKS, BDAY } from '../../src/data/family.js';
import { ITEMS } from '../../src/data/items.js';

const H = 3600000;
function setup() {
    setStore(memStore());
    G.loadGame();
    setView({ started: true, tab: 'farm' });
    state.tutorial.done = true;
    state.level = 45;
    G.ensureFamily();
    Object.assign(state.family, { spouse: 'tiago', aff: 80, affAt: clock.t, rooms: { bedroom: 1, nursery: 1, kidsroom: 2 } });
    const k = { id: 'k1', name: 'Hugo', girl: false, born: clock.t - 100 * H, at: clock.t, grow: 100, joy: 50, care: {}, find: clock.t, task: null, look: 'h510030200000', askNext: clock.t };
    state.family.kids.push(k);
    return k;
}

test('les produits demandés existent', () => {
    for (const p of ASKS.pools) for (const id of p || []) assert.ok(ITEMS[id], id);
});

test('une petite demande : on la donne, l’enfant rend des pièces', () => {
    const k = setup();
    G.familyTick();
    const a = G.askOf(k);
    assert.ok(a, 'la demande arrive');
    assert.ok(ASKS.pools[1].includes(a.item));
    assert.equal(a.n, ASKS.qty[1] + 3);
    assert.equal(G.askCan(k), false);
    state.inventory[a.item] = a.n + 1;
    assert.ok(G.familyReady() >= 1);
    const m0 = state.money;
    const coins = G.askCoins(a);
    assert.ok(coins > 0);
    assert.ok(G.answerAsk('k1'));
    assert.equal(state.inventory[a.item], 1);
    assert.ok(state.money >= m0 + coins);
    assert.ok(k.joy >= 50 + ASKS.joy - 1);
    assert.equal(G.askOf(k), null);
    G.familyTick();
    assert.equal(G.askOf(k), null, 'pas tout de suite une autre');
});

test('une demande oubliée s’en va, un peu de bonheur avec', () => {
    const k = setup();
    k.joy = 80;
    G.familyTick();
    assert.ok(G.askOf(k));
    clock.t += ASKS.last + 1000;
    const j = G.kidJoy(k);
    G.familyTick();
    assert.equal(k.ask, null);
    assert.ok(Math.abs(k.joy - (j - ASKS.miss)) < 0.5);
    // on peut aussi dire non
    clock.t += ASKS.every;
    G.familyTick();
    assert.ok(G.askOf(k));
    assert.ok(G.refuseAsk('k1'));
    assert.equal(G.askOf(k), null);
});

test('l’anniversaire d’un petit-enfant', () => {
    const k = setup();
    Object.assign(k, { grow: 260, spouse: { name: 'Clara', look: 'h1210403a1000', woman: true } });
    k.gk = [{ id: 'k1g1', name: 'Léo', girl: false, born: clock.t - 10 * H, look: 'h415020100000', gen: 2 }];
    k.gkAt = clock.t;
    const g = k.gk[0];
    assert.equal(G.gkBdayToday(g), false);
    clock.t += BDAY.every - 10 * H;
    assert.ok(G.gkBdayToday(g));
    assert.equal(G.gkCelebrate('k1', 'k1g1'), false, 'il faut un gâteau');
    state.inventory.spongeCake = 1;
    assert.equal(G.gkBdays(), 1);
    assert.ok(G.gkCelebrate('k1', 'k1g1'));
    assert.equal(G.gkBdayToday(g), false);
    // un oubli passe sans tristesse
    clock.t += BDAY.every + BDAY.window + 1000;
    G.familyTick();
    assert.equal(g.bd, 2);
});
