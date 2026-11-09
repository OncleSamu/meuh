// 1.104.1 : les boîtes de l'emballerie dans les demandes ; des paquets de la Maison dans le train et l'avion-cargo.
import test from 'node:test';
import assert from 'node:assert/strict';
import { memStore } from './helpers.mjs';
import { state, setStore } from '../../src/core/state.js';
import { setView } from '../../src/core/view.js';
import { setClock } from '../../src/core/clock.js';
import * as G from '../../src/systems/index.js';
import { MAISON } from '../../src/data/maison.js';

let T = Date.UTC(2026, 10, 9, 12);
function farm() {
    T = Date.UTC(2026, 10, 9, 12);
    setClock(() => T);
    setStore(memStore());
    G.loadGame();
    setView({ started: true, tab: 'farm', hidden: false });
    state.tutorial.done = true;
    state.level = 62;
    state.money = 1e10;
    for (const k of ['plank', 'stone', 'beam', 'tools', 'nail', 'paint', 'cloth', 'hempRope']) state.inventory[k] = 1000;
    G.buildCamp();
    Object.assign(state.inventory, { egg: 50, carp: 50, cheese: 50, apple: 50, pear: 50, strawberry: 50 });
    G.foundMaison();
    state.maison.rep = MAISON.rep[3];
}
const made = items => {
    assert.ok(G.makeCoffret(items, 0));
    T += MAISON.times[3] + 1;
    G.maisonTick();
    return state.maison.stock[state.maison.stock.length - 1];
};

test('boîtes : demandées par les villageois dès qu’on a l’emballerie', () => {
    farm();
    assert.equal(G.questPool().some(i => i.id.startsWith('box')), false);
    state.machines.push(G.newMachine('emballerie'));
    assert.ok(G.questPool().some(i => i.id === 'boxCagette'));
});

test('train : un wagon de paquets se charge depuis l’étagère', () => {
    farm();
    made(['apple', 'pear', 'strawberry']);
    made(['apple', 'pear', 'strawberry']);
    assert.ok(G.pkTransportOk());
    state.truck.status = 'here';
    state.truck.expiresAt = T + 3600e3;
    state.truck.slots = [
        { id: 'apple', qty: 1, loaded: false, gold: 10, xp: 1 },
        { id: 'pear', qty: 1, loaded: false, gold: 10, xp: 1 },
        { id: 'paquet', pk: { kind: 'frais', q: 0 }, qty: 2, loaded: false, gold: 5000, xp: 100 },
    ];
    assert.equal(G.slotHave(state.truck.slots[2]), true);
    const m = state.money;
    assert.ok(G.loadSlot(2, null));
    assert.equal(state.maison.stock.length, 0);
    assert.ok(state.money - m >= 5000);
    assert.equal(G.wantedItems().has('paquet'), false);
});

test('avion-cargo : une soute de paquets, payée au chargement', () => {
    farm();
    made(['egg', 'carp', 'cheese']);
    state.cargo = { k: 0, holds: [{ id: 'paquet', pk: { kind: 'any', q: 0 }, qty: 3, got: 0, est: 1000 }], done: false };
    assert.equal(G.holdHave(state.cargo.holds[0]), 1);
    assert.ok(G.holdPay(state.cargo.holds[0], 1) > 0);
});

test('genres 1.104.3 : chaque produit est rangé selon son origine', async () => {
    const { itemKind, normKind } = await import('../../src/data/paquets.js');
    const want = { apple: 'champ', truffle: 'champ', cardamom: 'champ', egg: 'animaux', antler: 'animaux', wool: 'animaux', carp: 'mer', tuna: 'mer', shrimp: 'mer', cheese: 'cuisine', bread: 'cuisine', honeyPot: 'cuisine', cloth: 'artisanat', ruby: 'trésor', goldIngot: 'trésor' };
    for (const [id, k] of Object.entries(want)) assert.equal(itemKind(id), k, id);
    assert.equal(normKind('frais'), 'champ');
    assert.equal(normKind('fabriqué'), 'cuisine');
});
