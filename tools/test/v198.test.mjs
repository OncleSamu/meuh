// 1.98 : la fabrique d'habitants et les commerces du village.
import test from 'node:test';
import assert from 'node:assert/strict';
import { memStore } from './helpers.mjs';
import { state, setStore } from '../../src/core/state.js';
import { setView } from '../../src/core/view.js';
import { setClock } from '../../src/core/clock.js';
import * as G from '../../src/systems/index.js';
import { COMMERCES, COMMERCE } from '../../src/data/commerces.js';
import { ITEMS } from '../../src/data/items.js';
import { MACHINES } from '../../src/data/machines.js';
import { ANIMALS } from '../../src/data/animals.js';
import { PROJECTS } from '../../src/data/village.js';
import { habitantArt, isHabitant, lookOf, idOf, randomId, randomLook, TRAIT_COUNT, TRAITS } from '../../src/art/habitants.js';
import { art } from '../../src/ui/icons.js';

let T = Date.UTC(2026, 10, 8, 12);
function farm() {
    setClock(() => T);
    setStore(memStore());
    G.loadGame();
    setView({ started: false, tab: 'farm' });
    state.level = 64;
    Object.keys(PROJECTS).forEach(k => (state.projects[k] = { done: true }));
    Object.keys(MACHINES).forEach(t => state.machines.push({ type: t, id: t, q: [] }));
    Object.keys(ANIMALS).forEach(t => state.animals.push({ type: t }));
    state.money = 1e9;
    state.inventory.plank = state.inventory.stone = state.inventory.beam = state.inventory.ironIngot = 500;
}

test('1.98 : un visage = un identifiant, et deux tirages identiques donnent le même dessin', () => {
    const id = randomId(42);
    assert.ok(isHabitant(id));
    assert.equal(randomId(42), id);
    assert.equal(idOf(lookOf(id)), id);
    assert.equal(habitantArt(id), habitantArt(id));
    assert.ok(art('villager', id).includes('<svg'));
    assert.equal(isHabitant('odette'), false);
});

test('1.98 : tous les traits possibles se dessinent sans erreur', () => {
    for (const t of TRAITS)
        for (let v = 0; v < TRAIT_COUNT[t]; v++) {
            const look = randomLook(7);
            look[t] = v;
            assert.ok(habitantArt(idOf(look)).length > 200, `${t}=${v}`);
        }
    // la variété : beaucoup de visages différents sur 500 tirages
    const ids = new Set(Array.from({ length: 500 }, (_, i) => randomId(i * 31 + 5)));
    assert.ok(ids.size > 480);
});

test('1.98 : chaque commerce a un métier, des matériaux connus et assez de produits', () => {
    for (const [id, d] of Object.entries(COMMERCES)) {
        Object.keys(d.mats).forEach(m => assert.ok(ITEMS[m], `${id} : ${m}`));
        assert.ok(
            d.machines.every(m => MACHINES[m]),
            id,
        );
    }
    assert.equal(Object.keys(COMMERCES).length, 8);
});

test('1.98 : reprendre un commerce coûte des pièces et des matériaux, une seule fois, au bon niveau', () => {
    farm();
    state.level = 20;
    assert.equal(G.canTakeOver('boulanger'), false);
    state.level = 64;
    const money = state.money;
    assert.equal(G.takeOver('boulanger'), true);
    assert.equal(state.money, money - COMMERCES.boulanger.cost);
    assert.equal(state.inventory.plank, 500 - COMMERCES.boulanger.mats.plank);
    assert.equal(G.takeOver('boulanger'), false);
    const c = G.commerceOf('boulanger');
    assert.ok(isHabitant(c.look) && c.name && c.order && c.order.n === COMMERCE.qty);
});

test('1.98 : livrer paie 1,5 fois, monte la confiance, puis la commande suivante attend', () => {
    farm();
    G.takeOver('forgeron');
    const c = G.commerceOf('forgeron');
    assert.equal(G.deliverCommerce('forgeron'), false, 'rien en stock');
    state.inventory[c.order.item] = c.order.n;
    const value = G.commerceValue(c);
    assert.ok(value >= ITEMS[c.order.item].sell * c.order.n * 1.4);
    const money = state.money;
    assert.equal(G.deliverCommerce('forgeron'), true);
    assert.ok(state.money >= money + value - 1);
    assert.equal(c.order, null);
    G.commerceTick();
    assert.equal(c.order, null, 'pas avant 4 h');
    T += COMMERCE.wait + 1000;
    G.commerceTick();
    assert.ok(c.order);
    for (let i = 0; i < 30; i++) c.n++;
    assert.equal(G.commerceFid(c), 3);
    assert.ok(G.commerceQty(c) > COMMERCE.qty);
});

test('1.98 : « une autre » change de produit et « changer d’allure » de visage', () => {
    farm();
    G.takeOver('tisserand');
    const c = G.commerceOf('tisserand');
    const item = c.order.item;
    assert.equal(G.otherOrder('tisserand'), true);
    assert.notEqual(c.order.item, item);
    const look = c.look;
    G.rerollLook('tisserand');
    assert.notEqual(c.look, look);
});
