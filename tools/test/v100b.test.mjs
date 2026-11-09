// 1.100 étape 2 : les résidents du camping.
import test from 'node:test';
import assert from 'node:assert/strict';
import { memStore } from './helpers.mjs';
import { state, setStore } from '../../src/core/state.js';
import { setView } from '../../src/core/view.js';
import { setClock } from '../../src/core/clock.js';
import * as G from '../../src/systems/index.js';
import { RESIDENTS } from '../../src/data/campers.js';
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
    G.buildCamp();
    RESIDENTS.askChance = 1;
}
function happyLeave() {
    const g = G.newGuest();
    g.wants.forEach(w => (w.done = true));
    g.leave = T;
    state.camping.next = T + 1e9;
    G.campTick();
}

test('résidents : un campeur ravi demande à rester, pas un campeur déçu', () => {
    farm();
    const b = G.newGuest();
    b.leave = T;
    state.camping.next = T + 1e9;
    G.campTick();
    assert.equal(G.campAsks().length, 0);
    happyLeave();
    assert.equal(G.campAsks().length, 1);
    assert.ok(isHabitant(G.campAsks()[0].look) && G.campAsks()[0].job);
});

test('résidents : accueillir coûte une cabane, refuser ne coûte rien, maximum 12', () => {
    farm();
    happyLeave();
    const m = state.money;
    assert.ok(G.resAccept(0));
    assert.equal(m - state.money, RESIDENTS.cabin(1));
    assert.equal(G.campRes().length, 1);
    const r = G.campRes()[0];
    assert.equal(r.likes.length >= 2, true);
    assert.ok(r.order);
    happyLeave();
    assert.ok(G.resDecline(0));
    assert.equal(G.campAsks().length, 0);
    for (let i = 0; i < 20; i++) {
        state.camping.asks.push({ look: r.look, name: 'X' + i, from: 'de nulle part', profile: 'hiker', woman: false, job: 'cartographe' });
        G.resAccept(0);
    }
    assert.equal(G.campRes().length, RESIDENTS.max);
});

test('résidents : les cadeaux font monter les cœurs, les histoires se débloquent, le préféré se révèle', () => {
    farm();
    happyLeave();
    G.resAccept(0);
    const r = G.campRes()[0];
    assert.equal(G.resHearts(r), 0);
    assert.equal(r.seen, false);
    let guard = 0;
    while (G.resHearts(r) < 5 && guard++ < 60) {
        T += RESIDENTS.gift.cool + 1;
        state.inventory[r.loved] = 1;
        assert.ok(G.resGift(0, r.loved));
        assert.equal(G.resGift(0, r.loved), false); // un cadeau toutes les 6 h
    }
    assert.equal(G.resHearts(r), 5);
    assert.equal(r.stories.length, 3);
    assert.equal(r.seen, true);
    for (const s of r.stories) {
        assert.ok(!s.includes('{') && s.includes(r.name.split(' ')[0]) || s.length > 20);
        assert.ok(!s.includes('undefined'));
    }
    assert.equal(state.stats.campFriends, 1);
});

test('résidents : livrer la commande paie plus et rapporte de l’amitié, puis une nouvelle arrive', () => {
    farm();
    happyLeave();
    G.resAccept(0);
    const r = G.campRes()[0];
    assert.equal(G.resCanDeliver(r), false);
    state.inventory[r.order.item] = 10;
    const m = state.money;
    const v = G.resOrderValue(r);
    assert.ok(v > 0 && G.resDeliver(0));
    assert.equal(state.money - m, v);
    assert.equal(r.order, null);
    assert.ok(r.fr > 0);
    T += RESIDENTS.order.wait + 1;
    G.residentTick();
    assert.ok(r.order);
});

test('résidents : faire partir demande une confirmation', () => {
    farm();
    happyLeave();
    G.resAccept(0);
    assert.ok(G.resLeave(0));
    assert.equal(G.campRes().length, 1);
    assert.ok(G.resConfirming(G.campRes()[0]));
    assert.ok(G.resLeave(0));
    assert.equal(G.campRes().length, 0);
});

test('résidents : le nom d’un résident n’est pas repris par un nouveau campeur demandeur', () => {
    farm();
    happyLeave();
    G.resAccept(0);
    const name = G.campRes()[0].name;
    for (let i = 0; i < 30; i++) {
        const g = G.newGuest();
        assert.notEqual(g.name, name);
        state.camping.guests.length = 0;
    }
});
