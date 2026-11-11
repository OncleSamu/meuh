// 1.103 : la Maison prend son envol. Un prix juste (la qualité de chaque produit compte), des commandes de paquets,
// la renommée (atelier plus rapide, file d'attente), les vrais campeurs comme clients.
import test from 'node:test';
import assert from 'node:assert/strict';
import { memStore } from './helpers.mjs';
import { state, setStore } from '../../src/core/state.js';
import { setView } from '../../src/core/view.js';
import { setClock } from '../../src/core/clock.js';
import * as G from '../../src/systems/index.js';
import { MAISON, MAISON_CLIENTS, MAISON_ORDERS } from '../../src/data/maison.js';
import { QUALITY } from '../../src/data/farm.js';
import { ITEMS } from '../../src/data/items.js';
import { STARS } from '../../src/data/camping.js';

let T = Date.UTC(2026, 10, 9, 12);
function farm() {
    T = Date.UTC(2026, 10, 9, 12);
    setClock(() => T);
    setStore(memStore());
    G.loadGame();
    setView({ started: true, tab: 'farm', hidden: false });
    state.tutorial.done = true;
    state.level = 80;
    state.money = 1e10;
    for (const k of ['plank', 'stone', 'beam', 'tools', 'nail', 'paint', 'cloth', 'hempRope']) state.inventory[k] = 1000;
    G.buildCamp();
    state.camping.guests = [];
    Object.assign(state.inventory, { egg: 50, wheat: 50, carp: 50, cheese: 50, apple: 50, pear: 50, strawberry: 50 });
    G.foundMaison();
}
const IDS = ['egg', 'carp', 'cheese'];
const FRUITS = ['apple', 'pear', 'strawberry'];

test('prix juste : un paquet diamant vaut plus que ses trois produits diamant vendus seuls', () => {
    farm();
    const raw = IDS.reduce((a, id) => a + ITEMS[id].sell, 0) * QUALITY[4].mult;
    assert.ok(G.coffretValue(IDS, 4, 'carton') > raw);
    for (let q = 1; q <= 4; q++) assert.ok(G.coffretValue(IDS, q, 'carton') > G.coffretValue(IDS, q - 1, 'carton'));
});

test('atelier : une file d’attente selon la renommée, les paquets s’enchaînent même hors ligne', () => {
    farm();
    assert.equal(G.slotsMax(), 1);
    assert.ok(G.makeCoffret(IDS, 0));
    assert.equal(G.makeCoffret(IDS, 0), false); // palier 1 : un seul à la fois
    state.maison.rep = MAISON.rep[2]; // palier 3
    assert.equal(G.slotsMax(), 3);
    assert.ok(G.makeCoffret(IDS, 0));
    assert.ok(G.makeCoffret(FRUITS, 0));
    assert.equal(G.makeCoffret(IDS, 0), false);
    assert.equal(G.queue().length, 2);
    T += 3 * MAISON.times[0] + 10; // trois paquets finis hors ligne
    G.maisonTick();
    assert.equal(state.maison.stock.length, 3);
    assert.equal(state.maison.work, null);
    assert.equal(G.queue().length, 0);
});

test('atelier : plus rapide avec la renommée', () => {
    farm();
    assert.equal(G.workTime(), 15 * 60000);
    state.maison.rep = MAISON.rep[5];
    assert.equal(G.workTime(), 5 * 60000);
    assert.equal(G.slotsMax(), 6);
});

test('commandes : trois à la fois ; une livraison paie 2,2 fois et est remplacée plus tard', () => {
    farm();
    G.maisonTick();
    assert.equal(G.orders().length, MAISON_ORDERS.max);
    state.maison.orders[0] = { who: 'Lucie', why: 'pour son mariage', kind: 'frais', q: 0 };
    G.makeCoffret(IDS, 0); // œuf, carpe, fromage : pas tout frais
    T += MAISON.time + 1;
    G.maisonTick();
    const mixed = state.maison.stock[0];
    assert.equal(G.orderFits(mixed, state.maison.orders[0]), false);
    G.makeCoffret(FRUITS, 0);
    T += MAISON.time + 1;
    G.maisonTick();
    const fruit = state.maison.stock[1];
    assert.ok(G.orderFits(fruit, state.maison.orders[0]));
    const m = state.money,
        rep = state.maison.rep;
    const pay = G.orderPay(fruit, state.maison.orders[0]);
    assert.ok(pay >= Math.round(G.pkValue(fruit) * MAISON_ORDERS.pay) - 1);
    assert.ok(G.deliverOrder(0, fruit.uid));
    assert.equal(state.money - m, pay);
    assert.equal(state.maison.rep - rep, MAISON_ORDERS.rep);
    assert.ok(state.maison.orders[0].due);
    T += MAISON_ORDERS.gap + 1;
    G.maisonTick();
    assert.ok(!state.maison.orders[0].due);
});

test('commandes : une qualité exigée, « trois genres », et passer une commande', () => {
    farm();
    G.maisonTick();
    const o = { who: 'Le maire', why: 'x', kind: 'mixte', q: 2 };
    state.maison.orders[1] = o;
    const cof = { uid: 99, items: IDS, q: 1, pack: 'carton' };
    assert.equal(G.orderFits(cof, o), false);
    cof.q = 2;
    assert.equal(G.orderFits(cof, o), true);
    assert.ok(G.skipOrder(1));
    assert.equal(G.skipOrder(1), false);
    T += MAISON_ORDERS.skip + 1;
    G.maisonTick();
    assert.ok(!state.maison.orders[1].due);
});

test('campeurs : un paquet chacun par séjour ; un remarquable veut de l’argent et paie plus', () => {
    farm();
    state.maison.rep = MAISON.rep[1];
    const c = MAISON_CLIENTS.find(k => k.camp);
    const g = G.newGuest(T, 5);
    delete g.star;
    G.makeCoffret(IDS, 0);
    T += MAISON.times[1] + 1;
    G.maisonTick();
    const cof = state.maison.stock[0];
    assert.ok(G.canSellTo(cof, c));
    const m = state.money;
    const offer = G.offerFor(cof, c, g);
    assert.ok(G.sellToGuest(cof.uid, 0));
    assert.equal(state.money - m, offer);
    assert.equal(g.pk, 1);
    // il n'en achète pas un deuxième
    G.makeCoffret(IDS, 0);
    T += MAISON.times[1] + 1;
    G.maisonTick();
    assert.equal(G.canSellToGuest(state.maison.stock[0], g), false);
    assert.equal(G.canSellTo(state.maison.stock[0], c), false);
    // un campeur remarquable
    const s = G.newGuest(T, 6, { star: 1 });
    const si = G.campGuests().indexOf(s);
    assert.equal(G.canSellToGuest(state.maison.stock[0], s), false); // qualité normale
    const silver = { ...state.maison.stock[0], uid: 500, q: STARS.q };
    state.maison.stock.push(silver);
    assert.ok(G.canSellToGuest(silver, s));
    assert.equal(G.offerFor(silver, c, s), Math.round(G.pkValue(silver) * c.pay * STARS.pay));
    assert.ok(G.sellToGuest(500, si));
});
