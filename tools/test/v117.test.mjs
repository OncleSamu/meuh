// 1.17 : le comptoir (thés et cafés au doigt, clients du village, salon).
import test from 'node:test';
import assert from 'node:assert/strict';
import { clock } from './helpers.mjs';
import { state } from '../../src/core/state.js';
import { setView } from '../../src/core/view.js';
import * as G from '../../src/systems/index.js';
import { ITEMS } from '../../src/data/items.js';
import { RECIPES, MACHINES } from '../../src/data/machines.js';
import { BREW, NEW_DRINKS, OLD_DRINKS, CLIENT } from '../../src/data/counter.js';
import { PROJECTS } from '../../src/data/village.js';

test('chaque boisson a ses gestes, son prix et sa recette au comptoir', () => {
    assert.ok(MACHINES.counter && !MACHINES.teahouse && !MACHINES.roastery);
    const ids = [...OLD_DRINKS, ...NEW_DRINKS.map(d => d[0])];
    assert.equal(ids.length, 34);
    for (const id of ids) {
        assert.ok(BREW[id] && BREW[id].st.length >= 2, 'gestes ' + id);
        assert.ok(ITEMS[id] && ITEMS[id].sell > 0, 'produit ' + id);
        assert.equal(RECIPES[id].machine, 'counter', id);
    }
    // le café reste derrière la brûlerie de l'île
    assert.equal(ITEMS.espresso.needProject, 'roasting');
    assert.equal(ITEMS.coffee.needProject, 'roasting');
    assert.equal(RECIPES.coffee.machine, 'dryer');
});

test('un comptoir : préparer pour le stock, servir un client, les gains sont raisonnables', () => {
    G.loadGame();
    state.level = 50;
    state.money = 1e6;
    state.barn.lvl = 50;
    for (const p of Object.values(PROJECTS)) state.projects[p.id] = { given: {}, done: true };
    for (const r of Object.values(RECIPES)) if (r.machine === 'counter') for (const k of Object.keys(r.ing)) state.inventory[k] = 50;
    state.machines.push(G.newMachine('counter'));
    setView({ started: true, tab: 'machines', sub: 'counter', hidden: false });
    G.ensureCounter();
    assert.ok(G.counterOwned());
    // le stock
    clock.t += 20000;
    const before = state.inventory.greenTea;
    assert.ok(G.counterStart('greenTea'));
    G.counterFinish('greenTea', 3, null, null);
    assert.ok(state.inventory.greenTea >= before - 3 + 1, 'au moins une boisson de plus');
    assert.ok(state.quality.greenTea && state.quality.greenTea.g >= 1, 'trois étoiles = qualité or');
    // le repos entre deux préparations
    assert.equal(G.counterStart('greenTea'), false, 'il faut laisser le comptoir se reposer');
    clock.t += 9000;
    assert.ok(G.counterStart('greenTea'));
    // un client arrive, on le sert
    for (let s = 0; s < 400 && !G.counterSeats().length; s++) {
        clock.t += 1000;
        G.counterTick(1);
    }
    assert.ok(G.counterSeats().length > 0, 'un client est arrivé');
    const c = G.counterSeats()[0];
    state.inventory[c.drink] = Math.max(state.inventory[c.drink], 2);
    const money = state.money,
        pts = state.villagers[c.vid].pts;
    assert.ok(G.counterServe(0, null));
    assert.ok(state.money > money, 'le client paie');
    assert.ok(state.villagers[c.vid].pts > pts || state.villagers[c.vid].hearts > 0, 'et devient plus ami');
    // jamais plus de pourboires que le plafond du jour
    assert.ok(G.ensureCounter().tips <= CLIENT.tipMax);
});

test('les clients ne patientent qu’au salon, et partent si on les oublie', () => {
    const C = G.ensureCounter();
    C.seats = [{ vid: 'odette', drink: 'greenTea', left: 2 }];
    setView({ tab: 'farm', sub: '' });
    G.counterTick(5);
    assert.equal(C.seats.length, 1, 'ailleurs dans le jeu, personne ne s’impatiente');
    setView({ tab: 'machines', sub: 'counter' });
    G.counterTick(5);
    assert.equal(G.ensureCounter().seats.length, 0, 'au salon, il repart');
});

test('agrandir le salon et poser un décor', () => {
    const C = G.ensureCounter();
    state.money = 1e6;
    state.inventory.plank = 99;
    state.inventory.paint = 99;
    const seats = G.salonDef().seats;
    assert.ok(G.upgradeSalon());
    assert.ok(G.salonDef().seats > seats);
    const pat = G.patienceMax();
    assert.ok(G.buyDecor('plant'));
    assert.equal(G.buyDecor('plant'), false, 'un décor ne s’achète qu’une fois');
    assert.ok(G.patienceMax() > pat);
    assert.equal(C.decor.plant, true);
});

test('un salon de thé et une brûlerie d’avant deviennent un comptoir, sans rien perdre', () => {
    state.machines = [
        { type: 'teahouse', queue: ['greenTea'], progress: 0, out: { greenTea: 2 }, last: 'greenTea' },
        { type: 'roastery', queue: [], progress: 0, out: { coffee: 1 }, last: null },
    ];
    state.inventory.greenTea = 0;
    state.inventory.coffee = 0;
    G.migrateCounter();
    assert.deepEqual(
        state.machines.map(m => m.type),
        ['counter'],
    );
    assert.equal(state.inventory.greenTea, 3, 'les boissons prêtes et celles en cours sont rendues');
    assert.equal(state.inventory.coffee, 1);
});
