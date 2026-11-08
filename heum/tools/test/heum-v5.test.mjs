// Heum 0.5 : le monde (24 parcelles, cultures, usure, silo).
import test from 'node:test';
import assert from 'node:assert/strict';
import { state, setStore, freshState, setState, SAVE_VERSION, migrate } from '../../src/core/state.js';
import { setClock } from '../../src/core/clock.js';
import { setRand } from '../../src/core/rand.js';
import * as H from '../../src/systems/index.js';
import { CROPS, MUTANTS, STABLE, plotCost } from '../../src/data/crops.js';
import { WEAR } from '../../src/data/world.js';
import { has } from '../../src/art/index.js';

let T = 1_000_000_000_000;
function fresh(level = 20) {
    T = 1_000_000_000_000;
    setClock(() => T);
    setRand(null);
    setStore({ getItem: () => null, setItem: () => {} });
    setState(freshState());
    state.level = level;
    state.money = 1e7;
    state.bunker.food = 30;
}
const wait = s => (T += s * 1000);

test('0.5 : 24 parcelles, un prix qui monte toujours', () => {
    fresh();
    assert.equal(state.plots.length, 24);
    for (let o = 4; o < 23; o++) assert.ok(plotCost(o + 1) > plotCost(o), `palier ${o}`);
    let n = 0;
    while (H.buyPlot()) n++;
    assert.equal(n, 20);
    assert.ok(state.plots.every(p => p.open));
});

test('0.5 : chaque culture rapporte plus par minute que la précédente ; dessins et graines stables présents', () => {
    const rate = c => (c.yield * c.sell - c.seed) / c.t;
    const list = Object.values(CROPS).sort((a, b) => a.lvl - b.lvl);
    for (let i = 1; i < list.length; i++) assert.ok(rate(list[i]) >= rate(list[i - 1]) * 0.99, list[i].name);
    for (const [id, c] of Object.entries(CROPS)) {
        assert.ok(has(id), `dessin ${id}`);
        if (c.mut) {
            assert.ok(MUTANTS[c.mut] && has(c.mut) && STABLE[c.mut], `mutant ${c.mut}`);
        }
    }
});

test('0.5 : on sème, récolte et vend un topinambour', () => {
    fresh();
    state.inv.topinambour = 0;
    assert.ok(H.plant(0, 'topinambour'));
    wait(301);
    H.harvest(0);
    assert.ok(H.have('topinambour') >= 2);
    H.sell('topinambour', 2);
    assert.ok(state.money > 1e7 - 40);
});

test('0.5 : le silo plafonne les produits, pas les matériaux, et s’agrandit', () => {
    fresh();
    state.inv = {};
    assert.equal(H.siloCap(), 80);
    assert.equal(H.give('rutabaga', 200), 80);
    assert.equal(H.have('rutabaga'), 80);
    assert.equal(H.give('rutabaga', 5), 0);
    H.give('metal', 500);
    assert.equal(H.have('metal'), 500);
    state.inv.compo = 10;
    assert.ok(H.upgradeSilo());
    assert.equal(H.siloCap(), 200);
    state.level = 10;
    assert.ok(!H.upgradeSilo(), 'trop bas niveau pour le grand silo');
});

test('0.5 : les machines s’usent, tombent en panne, et se réparent', () => {
    fresh();
    state.inv.scrap = 500;
    for (let k = 0; k < WEAR.max * 2 && !H.broken('sorter'); k++) {
        assert.ok(H.startJob('sorter', 'sort'), `travail ${k}`);
        wait(60);
        H.collectJob('sorter');
    }
    assert.ok(H.broken('sorter'));
    state.inv = {};
    delete state.charge.metal;
    assert.ok(!H.startJob('sorter', 'sort'));
    assert.ok(!H.repair('sorter'), 'rien en stock');
    state.inv.metal = 2;
    state.inv.elec = 1;
    assert.ok(H.repair('sorter'));
    assert.equal(H.wearOf('sorter'), 0);
    state.inv.scrap = 5;
    assert.ok(H.startJob('sorter', 'sort'));
});

test('0.5 : l’atelier de Firmin use moins les machines', () => {
    const run = () => {
        fresh();
        state.bunker.floors = 2;
        state.bunker.res = (state.bunker.res || []).concat([{ id: 'firmin', mains: 3, esprit: 1, resist: 2, lvl: 1, xp: 0, room: 'shop', ko: 0 }]);
        state.inv.scrap = 50;
        H.startJob('sorter', 'sort');
        wait(60);
        H.collectJob('sorter');
        return H.wearOf('sorter');
    };
    const withFirmin = run();
    fresh();
    state.inv.scrap = 50;
    H.startJob('sorter', 'sort');
    wait(60);
    H.collectJob('sorter');
    assert.ok(withFirmin < H.wearOf('sorter'));
});

test('0.5 : une sauvegarde 0.4 (version 3) reçoit 24 parcelles, l’usure et le silo', () => {
    const old = JSON.parse(JSON.stringify(freshState()));
    old.v = 3;
    old.plots = old.plots.slice(0, 9);
    delete old.wear;
    delete old.silo;
    const m = migrate(old);
    assert.equal(m.v, SAVE_VERSION);
    assert.equal(m.plots.length, 24);
    assert.equal(m.plots[10].open, false);
    assert.deepEqual(m.wear, {});
    assert.equal(m.silo, 0);
});
