// 1.104.5 : corrections de l'audit 1.104.
import test from 'node:test';
import assert from 'node:assert/strict';
import { memStore } from './helpers.mjs';
import { state, setStore } from '../../src/core/state.js';
import { setView } from '../../src/core/view.js';
import { setClock } from '../../src/core/clock.js';
import * as G from '../../src/systems/index.js';
import { MAISON } from '../../src/data/maison.js';
import { RESIDENTS } from '../../src/data/campers.js';

let T = Date.UTC(2026, 10, 10, 12);
function farm() {
    T = Date.UTC(2026, 10, 10, 12);
    setClock(() => T);
    setStore(memStore());
    G.loadGame();
    setView({ started: true, tab: 'farm', hidden: false });
    state.tutorial.done = true;
    state.level = 80;
    state.money = 1e10;
    for (const k of ['plank', 'stone', 'beam', 'tools', 'nail', 'paint', 'cloth', 'hempRope']) state.inventory[k] = 1000;
    G.buildCamp();
    Object.assign(state.inventory, { egg: 50, carp: 50, cheese: 50, apple: 50, pear: 50, strawberry: 50, wheat: 50, wood: 50 });
    G.foundMaison();
    state.maison.rep = MAISON.rep[3];
}
const made = items => {
    assert.ok(G.makeCoffret(items, 0));
    T += MAISON.times[3] + 1;
    G.maisonTick();
    return state.maison.stock[state.maison.stock.length - 1];
};

test('audit 1 : un wagon de paquets paie selon la valeur réelle des paquets chargés', () => {
    farm();
    const c = made(['apple', 'pear', 'strawberry']);
    const val = G.pkValue(c);
    state.truck.status = 'here';
    state.truck.expiresAt = T + 3600e3;
    state.truck.slots = [
        { id: 'apple', qty: 1, loaded: false, gold: 10, xp: 1 },
        { id: 'pear', qty: 1, loaded: false, gold: 10, xp: 1 },
        { id: 'paquet', pk: { kind: 'any', q: 0 }, qty: 1, mult: 1, loaded: false, gold: 999999, xp: 1 },
    ];
    const m = state.money;
    assert.ok(G.loadSlot(2, null));
    assert.ok(state.money - m < 999999);
    assert.ok(Math.abs(state.truck.slots[2].gold - val * 1.6) <= 5);
});

test('audit 2 : un paquet sans valeur ne rapporte presque pas d’expérience', () => {
    farm();
    assert.ok(G.pkXp(30) < 50);
    assert.ok(G.pkXp(state.level * MAISON.xpRef) >= MAISON.xp);
});

test('audit 3 : bois, pierre et matériaux bruts ne vont pas dans un paquet', () => {
    farm();
    for (const id of ['wood', 'stone', 'hardwood', 'solidOak', 'resin', 'cutStone']) assert.equal(G.canPack(id), false, id);
    assert.ok(G.canPack('goldIngot') && G.canPack('ruby'));
});

test('audit 4 : les bonus des résidents sont plafonnés', () => {
    farm();
    state.camping.res = [];
    for (let k = 0; k < 12; k++) state.camping.res.push({ name: 'I' + k, job: 'instituteur', fr: RESIDENTS.hearts[4], likes: [], stories: [] });
    assert.equal(G.resBonus('xp'), G.RES_CAPS.xp);
});

test('audit 6 et 8 : carton par défaut sans produit ; les vieux paquets reçoivent leur boîte', () => {
    farm();
    assert.equal(G.autoPack([]), 'carton');
    state.maison.stock.push({ uid: 77, name: 'Vieux coffret', items: ['apple', 'pear', 'egg'], q: 0, value: 1 });
    G.maisonTick();
    assert.equal(state.maison.stock.find(c => c.uid === 77).pack, 'carton');
});
