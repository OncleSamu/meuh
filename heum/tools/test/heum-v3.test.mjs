// Heum 0.3 : fondations (sauvegarde, reprise) et cœur (charge, paliers, échelle de valeur).
import test from 'node:test';
import assert from 'node:assert/strict';
import { state, setStore, freshState, setState, SAVE_VERSION, migrate, isLocked, save, importSave, rawSave } from '../../src/core/state.js';
import { setClock } from '../../src/core/clock.js';
import { setRand } from '../../src/core/rand.js';
import * as H from '../../src/systems/index.js';
import { CROPS, MUTANTS } from '../../src/data/crops.js';

let T = 1_000_000_000_000;
const mem = (init = {}) => {
    const m = { ...init };
    return { getItem: k => m[k] ?? null, setItem: (k, v) => (m[k] = v), dump: () => m };
};
function fresh(level = 12) {
    T = 1_000_000_000_000;
    setClock(() => T);
    setRand(null);
    setStore(mem());
    setState(freshState());
    state.level = level;
    state.money = 5000;
}
const wait = s => (T += s * 1000);

test('0.3 : une sauvegarde de la V2 (version 1) est reprise et migrée', () => {
    const old = JSON.parse(JSON.stringify(freshState()));
    old.v = 1;
    delete old.charge;
    old.money = 777;
    const st = mem({ heumSave: JSON.stringify(old) });
    setClock(() => T);
    setStore(st);
    const r = H.loadGame();
    assert.equal(r.status, 'ok');
    assert.equal(state.money, 777);
    assert.equal(state.v, SAVE_VERSION);
    assert.deepEqual(state.charge, {});
});

test('0.3 : une sauvegarde illisible n’est jamais écrasée', () => {
    const st = mem({ heumSave: '{pas du json' });
    setClock(() => T);
    setStore(st);
    const r = H.loadGame();
    assert.equal(r.status, 'bad');
    assert.ok(isLocked());
    save();
    assert.equal(st.dump().heumSave, '{pas du json', 'toujours là');
    assert.equal(st.dump()['heumSave.bak'], '{pas du json', 'copie de secours');
    // une version du futur est aussi laissée intacte
    const fut = mem({ heumSave: JSON.stringify({ v: 99 }) });
    setStore(fut);
    assert.equal(H.loadGame().status, 'bad');
    assert.equal(migrate({ v: 99 }), null);
});

test('0.3 : export puis import d’un fichier de sauvegarde', () => {
    fresh();
    state.money = 4242;
    save();
    const txt = rawSave();
    state.money = 1;
    assert.ok(importSave(txt));
    assert.equal(state.money, 4242);
    assert.ok(!importSave('nimportequoi'));
});

test('0.3 : hors ligne, la jauge reste où elle est, mais les bêtes et le bunker avancent', () => {
    fresh();
    state.cont = 50;
    H.buyAnimal('hen');
    state.bunker.food = 5;
    state.last = T;
    wait(3600);
    const gone = H.catchUp();
    assert.ok(gone >= 3599);
    assert.equal(state.cont, 50, 'la jauge n’a pas bougé');
    assert.ok(state.bunker.food < 5, 'les habitants ont mangé');
    assert.ok(state.animals[0].charge > 0, 'la poule s’est chargée');
});

test('0.3 : en jeu, la jauge redescend d’un point toutes les 4 minutes', () => {
    fresh();
    state.cont = 20;
    H.tick(240);
    assert.equal(state.cont, 19);
});

test('0.3 : la charge d’un produit vient de la parcelle, et se mélange avec le stock', () => {
    fresh();
    state.cont = 40;
    state.inv.veil = 1;
    H.setGear(0, 'veil');
    H.plant(0, 'lentil');
    H.plant(1, 'lentil');
    wait(121);
    H.harvest(0);
    assert.equal(H.chargeOf('lentil'), 20, 'parcelle voilée : 40 − 20');
    H.harvest(1);
    assert.equal(H.chargeOf('lentil'), 30, 'moyenne de 20 (×2) et 40 (×2)');
    H.take('lentil', 4);
    assert.equal(H.chargeOf('lentil'), 0, 'stock vide : plus de charge');
});

test('0.3 : ce qu’on fabrique hérite de la charge des ingrédients', () => {
    fresh();
    state.inv.rutabaga = 3;
    state.charge.rutabaga = 60;
    state.inv.metal = 1;
    assert.ok(H.startJob('reactor', 'canRuta'));
    wait(200);
    H.collectJob('reactor');
    assert.equal(H.chargeOf('canRuta'), 60);
});

test('0.3 : le déchet critique ne vaut plus que 8 pièces', () => {
    fresh();
    assert.equal(H.baseSell('waste'), 8);
});

test('0.3 : arracher un Rebelle coûte 1 métal, ou 15 pièces', () => {
    fresh();
    state.plots[0].rebel = true;
    state.inv.metal = 1;
    assert.ok(H.uproot(0));
    assert.equal(H.have('metal'), 0);
    state.plots[0].rebel = true;
    const m = state.money;
    assert.ok(H.uproot(0));
    assert.equal(state.money, m - 15);
    state.plots[0].rebel = true;
    state.money = 3;
    assert.ok(!H.uproot(0));
    assert.ok(state.plots[0].rebel);
});

test('0.3 : chaque culture débloquée rapporte plus par minute que la précédente', () => {
    const net = c => (c.yield * c.sell - c.seed) / c.t;
    const order = Object.values(CROPS).sort((a, b) => a.lvl - b.lvl);
    for (let k = 1; k < order.length; k++) assert.ok(net(order[k]) > net(order[k - 1]), `${order[k].name} > ${order[k - 1].name}`);
    for (const m of Object.values(MUTANTS)) assert.ok(m.sell >= CROPS[m.of].sell * 2.9, `${m.name} vaut ≥ 3 fois sa culture`);
});
