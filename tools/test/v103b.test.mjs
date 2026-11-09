// 1.103.1 : offrir un paquet à un villageois ; un villageois demande un de vos paquets déjà créés.
import test from 'node:test';
import assert from 'node:assert/strict';
import { memStore } from './helpers.mjs';
import { state, setStore } from '../../src/core/state.js';
import { setView } from '../../src/core/view.js';
import { setClock } from '../../src/core/clock.js';
import * as G from '../../src/systems/index.js';
import { MAISON, MAISON_ORDERS, PK_GIFT } from '../../src/data/maison.js';
import { VILLAGERS } from '../../src/data/village.js';

let T = Date.UTC(2026, 10, 9, 12);
function farm() {
    T = Date.UTC(2026, 10, 9, 12);
    setClock(() => T);
    setStore(memStore());
    G.loadGame();
    setView({ started: true, tab: 'farm', hidden: false });
    state.tutorial.done = true;
    state.level = 60;
    state.money = 1e10;
    for (const k of ['plank', 'stone', 'beam', 'tools', 'nail', 'paint', 'cloth', 'hempRope']) state.inventory[k] = 1000;
    G.buildCamp();
    Object.assign(state.inventory, { egg: 50, carp: 50, cheese: 50, apple: 50, pear: 50, strawberry: 50 });
    G.foundMaison();
}
const made = items => {
    assert.ok(G.makeCoffret(items, 0));
    T += MAISON.time + 1;
    G.maisonTick();
    return state.maison.stock[state.maison.stock.length - 1];
};
const vid = () => G.presentVillagers()[0];

test('cadeau : un paquet compte, plus avec ce que le villageois aime ; un cadeau par jour', () => {
    farm();
    const v = vid();
    const likes = VILLAGERS[v].likes.filter(id => ['egg', 'carp', 'cheese', 'apple', 'pear', 'strawberry'].includes(id));
    const cof = made(['egg', 'carp', 'cheese']);
    const pts = G.pkGiftPts(v, cof);
    assert.ok(pts >= PK_GIFT.base);
    if (likes.some(id => cof.items.includes(id))) assert.ok(pts > PK_GIFT.base);
    const before = state.villagers[v].pts;
    assert.ok(G.giftPaquet(v, cof.uid));
    assert.ok(state.villagers[v].pts > before);
    assert.equal(state.maison.stock.length, 0);
    const c2 = made(['apple', 'pear', 'strawberry']);
    assert.equal(G.giftPaquet(v, c2.uid), false); // déjà un cadeau aujourd'hui
    assert.equal(G.giveGift(v, 'apple'), false);
});

test('demande : un villageois commande un de vos paquets, on le livre, il gagne de l’amitié', () => {
    farm();
    const cof = made(['apple', 'pear', 'strawberry']);
    let o = null;
    for (let s = 0; s < 50 && !o; s++) {
        const x = G.newOrder(s / 50);
        if (x.kind === 'recipe') o = x;
    }
    assert.ok(o, 'une demande de villageois');
    assert.equal(o.rid, cof.rid);
    assert.ok(VILLAGERS[o.vid]);
    G.maisonTick();
    state.maison.orders[0] = o;
    assert.ok(G.orderFits(cof, o));
    const other = made(['egg', 'carp', 'cheese']);
    assert.equal(G.orderFits(other, o), false);
    const before = state.villagers[o.vid].pts;
    assert.ok(G.deliverOrder(0, cof.uid));
    assert.ok(state.villagers[o.vid].pts >= before + MAISON_ORDERS.friend);
});

test('demande : rien à demander sans recette', () => {
    farm();
    for (let s = 0; s < 30; s++) assert.notEqual(G.newOrder(s / 30).kind, 'recipe');
});

test('équilibrage 1.103.2 : un paquet aux voisins vaut plus qu’aux campeurs, les ventes rapportent de l’expérience', async () => {
    const { CAMPING } = await import('../../src/data/camping.js');
    const { ITEMS } = await import('../../src/data/items.js');
    farm();
    const ids = ['apple', 'pear', 'strawberry'];
    const raw = ids.reduce((a, id) => a + ITEMS[id].sell, 0);
    assert.ok(G.coffretValue(ids, 0, 'carton') > raw * CAMPING.pay);
    assert.ok(G.pkXp(1000) >= 700);
    assert.equal(CAMPING.tillRate, 40);
});
