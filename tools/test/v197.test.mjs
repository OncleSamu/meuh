// 1.97 : le matériel de la cave sert à quelque chose.
import test from 'node:test';
import assert from 'node:assert/strict';
import { memStore } from './helpers.mjs';
import { state, setStore } from '../../src/core/state.js';
import { setView } from '../../src/core/view.js';
import { setClock } from '../../src/core/clock.js';
import * as G from '../../src/systems/index.js';
import { CAVE_GEAR, CAVE_GEAR_FX } from '../../src/data/cave.js';
import { ITEMS } from '../../src/data/items.js';
import { ui } from '../../src/art/kit.js';
import '../../src/art/index.js';

const T = Date.UTC(2026, 10, 8, 12);
function cave() {
    setClock(() => T);
    setStore(memStore());
    G.loadGame();
    setView({ started: false, tab: 'cave' });
    state.level = 40;
    G.ensureCave();
    state.cave.temp = 50;
    state.cave.hum = 50;
}
const lot = () => ({ uid: 1, id: 'comte', n: 4, rank: 1, q: 0, care: T - 1, next: T + 1e9 });

test('1.97 : chaque équipement existe avec un prix, un dessin et des matériaux connus', () => {
    assert.ok(Object.keys(CAVE_GEAR).length >= 7);
    for (const [k, g] of Object.entries(CAVE_GEAR)) {
        assert.equal(typeof ui[g.icon], 'function', k);
        Object.keys(g.mats || {}).forEach(m => assert.ok(ITEMS[m], `${k} : ${m}`));
    }
});

test('1.97 : l’aide de cave relève le soin, les caisses les lots, le registre la valeur', () => {
    cave();
    const l = lot();
    l.care = T - 1e12; // soin très en retard
    assert.equal(G.careLevel(l), 0.3);
    state.cave.gear.aide = true;
    assert.equal(G.careLevel(l), CAVE_GEAR_FX.aideCare);
    const m = G.caveLotMax();
    state.cave.gear.crates = true;
    assert.equal(G.caveLotMax(), m + CAVE_GEAR_FX.crates);
    const v = G.lotUnit(lot());
    state.cave.gear.ledger = true;
    assert.ok(G.lotUnit(lot()) > v);
});

test('1.97 : le sas réduit les pertes, la sonde les mauvaises étapes, sans casser les probabilités', () => {
    cave();
    const l = lot();
    const base = G.lotOdds(l);
    state.cave.gear.airlock = true;
    state.cave.gear.probe = true;
    const o = G.lotOdds(l);
    assert.ok(o.rot < base.rot);
    assert.ok(o.bad < base.bad);
    assert.ok(o.stay > 0);
    assert.ok(Math.abs(o.good + o.bad + o.rot + o.stay - 1) < 1e-9);
    assert.equal(o.good, base.good);
    // lot légendaire aussi
    const L = { ...l, rank: 4 };
    state.cave.gear = {};
    const lb = G.lotOdds(L);
    state.cave.gear.airlock = true;
    state.cave.gear.probe = true;
    const lo = G.lotOdds(L);
    assert.ok(lo.rot < lb.rot && lo.bad < lb.bad);
    assert.ok(Math.abs(lo.bad + lo.rot + lo.stay - 1) < 1e-9);
});

test('1.97 : l’achat débite pièces et matériaux, une seule fois', () => {
    cave();
    state.money = 1e6;
    state.inventory.plank = 100;
    assert.equal(G.buyCaveGear('crates'), true);
    assert.equal(state.inventory.plank, 60);
    assert.equal(G.buyCaveGear('crates'), false);
    assert.equal(state.cave.gear.crates, true);
});
