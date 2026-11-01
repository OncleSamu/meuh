// 1.69 : les ruchers des contrées.
import test from 'node:test';
import assert from 'node:assert/strict';
import { memStore } from './helpers.mjs';
import { state, setStore } from '../../src/core/state.js';
import { setView } from '../../src/core/view.js';
import * as G from '../../src/systems/index.js';
import { ITEMS } from '../../src/data/items.js';
import { APIARY, APIARY_RUN } from '../../src/data/apiary.js';

function lands() {
    setStore(memStore());
    G.loadGame();
    setView({ started: false, tab: 'farm' });
    state.level = 64;
    G.ensureGenetics();
    for (const p of ['ferry', 'oasisWell', 'northStove']) state.projects[p] = { given: {}, done: true };
    G.ensureIsland();
    G.ensureOasis();
    G.ensureNord();
    state.money = 1e9;
    Object.assign(state.inventory, { wood: 1000, wax: 1000, stone: 1000, plank: 1000 });
}
// des arbres adultes dans une zone
function trees(z, id, n) {
    const sl = G.slotsOf(z);
    for (let k = 0; k < n; k++) {
        sl[k].open = true;
        sl[k].tree = { id, age: ITEMS[id].time * 2, drops: 0, ground: 0, prog: 0 };
    }
}

test('1.69 : un rucher s’achète dans chaque contrée, 3 ruches au plus', () => {
    lands();
    for (const land of ['island', 'oasis', 'nord']) {
        assert.ok(G.apiaryOpen(land), land);
        for (let k = 0; k < 3; k++) assert.ok(G.buyHive(land), `${land} ${k}`);
        assert.equal(G.buyHive(land), false);
        assert.equal(G.apiaryHives(land), 3);
        assert.equal(G.apiaryCap(land), 3 * APIARY_RUN.cap);
    }
    state.level = APIARY.nord.lvl - 1;
    assert.equal(G.apiaryOpen('nord'), false);
});

test('1.69 : des litchis sur l’île donnent du miel de litchi ; la ferme n’en donne jamais', () => {
    lands();
    G.buyHive('island');
    trees('island', 'lychee', 5);
    assert.equal(G.apiaryJudge('island').kind, 'lychee');
    assert.equal(G.apiaryIdle('island'), null);
    for (let k = 0; k < 600; k++) G.apiaryTick(1);
    Object.assign(state.inventory, { wood: 0, wax: 0, stone: 0, plank: 0 });
    assert.ok(G.apiaryOf('island').honey >= 1);
    const h = state.inventory.honey || 0;
    assert.ok(G.harvestApiary('island'));
    assert.ok(state.inventory.honey > h);
    assert.ok(state.genetics.stock[G.honeyProd('lychee')] > 0);
    // la même règle à la ferme ne trouve pas le litchi
    assert.equal(G.judge({ total: 5, by: { lychee: 5 } }).kind, null);
});

test('1.69 : à l’oasis, les ruches boivent à la citerne ; sans eau, rien', () => {
    lands();
    G.buyHive('oasis');
    trees('oasisV', 'argan', 4);
    state.oasis.water = 100;
    const w = state.oasis.water;
    G.apiaryTick(3600);
    assert.ok(state.oasis.water < w);
    assert.equal(G.apiaryJudge('oasis').kind, 'argan');
    state.oasis.water = 0;
    state.apiary.oasis.honey = 0;
    assert.match(G.apiaryIdle('oasis'), /citerne/);
    G.apiaryTick(3600);
    assert.equal(state.apiary.oasis.honey, 0);
});

test('1.69 : au Grand Nord, les abeilles dorment l’hiver, sauf près d’un poêle allumé', () => {
    lands();
    G.buyHive('nord');
    trees('nordV', 'spruce', 4);
    assert.equal(G.apiaryJudge('nord').kind, 'fir');
    state.day = 1; // printemps
    assert.equal(G.apiaryIdle('nord'), null);
    state.day = 3 * 12 + 1;
    if (G.season().id === 'hiver') {
        assert.match(G.apiaryIdle('nord'), /froid/);
        const k = state.nord.plots.findIndex(p => p.open && !p.id);
        state.nord.stoves[k] = { fuel: 5 };
        assert.equal(G.apiaryIdle('nord'), null);
    }
});

test('1.69 : sept miels de plus, au carnet, à l’hydromel et au livre', () => {
    lands();
    for (const k of ['lychee', 'avocado', 'tiare', 'argan', 'coriander', 'fir', 'lingonberry']) {
        assert.ok(G.HONEYS[k] && G.HONEYS[k].land && G.HONEYS[k].mamie, k);
        assert.ok(G.baseOf('mead:' + k).taste, k);
        assert.ok(G.BOOK_HONEYS.includes(k));
    }
});

test('1.69 : l’objectif du niveau 62 demande une ruche au Grand Nord', () => {
    lands();
    const g = G.makeGoals(APIARY.nord.lvl).find(x => x.kind === 'hive');
    assert.ok(g);
    assert.equal(G.goalDone(g), false);
    G.buyHive('nord');
    assert.ok(G.goalDone(g));
});
