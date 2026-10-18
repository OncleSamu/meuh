// 1.15 : vin de table, millésimes, cépages, vendanges.
import test from 'node:test';
import assert from 'node:assert/strict';
import { state } from '../../src/core/state.js';
import { setView } from '../../src/core/view.js';
import * as G from '../../src/systems/index.js';
import { ITEMS } from '../../src/data/items.js';
import { RECIPES } from '../../src/data/machines.js';
import { CAVE_ITEMS } from '../../src/data/cave.js';
import { SPR } from '../../src/art/index.js';

const start = () => {
    G.loadGame();
    setView({ started: false, tab: 'farm' });
    state.level = 50;
    state.money = 1e9;
    state.bld = null;
    state.barn.lvl = 12;
    G.ensureOrchard();
    state.orchard.slots.forEach(x => (x.tree = null));
};

test('le vin de table : objet, recette au pressoir niveau 31, cave et dessin', () => {
    assert.ok(ITEMS.tableWine && RECIPES.tableWine);
    assert.equal(RECIPES.tableWine.machine, 'press');
    assert.equal(RECIPES.tableWine.lvl, 31);
    assert.equal(CAVE_ITEMS.tableWine, 'wine');
    assert.ok(SPR.item('tableWine').includes('<svg'));
});

test('les millésimes : même année, même qualité ; le lot garde son année', () => {
    start();
    state.day = 1;
    const y = G.gameYear();
    assert.equal(G.vintageQ(y), G.vintageQ(y));
    const seen = new Set([...Array(40).keys()].map(i => G.vintageQ(i + 1)));
    assert.ok(seen.size >= 3);
    G.ensureCave();
    state.inventory.tableWine = 3;
    assert.ok(G.putInCave(0, 'tableWine', 3));
    const lot = state.cave.slots[0];
    assert.equal(lot.vy, y);
    assert.ok(G.vintageOf(lot));
    assert.ok(G.lotUnit(lot) > 0);
    G.takeOut(0);
    assert.equal(state.cave.reserve.at(-1).vy, y);
});

test('un cépage : planté, récolté et bouturé', () => {
    start();
    G.ensureGenetics && G.ensureGenetics();
    const g = state.genetics;
    g.vars.v1 = { id: 'v1', base: 'grape', g: G.wildPlant('grape'), gen: 1, fixed: true, auto: 'Cépage test' };
    g.seeds.v1 = 2;
    g.prefer = { grape: 'v1' };
    assert.ok(G.plantTree(0, 'grape', null));
    const t = state.orchard.slots[0].tree;
    assert.equal(t.v, 'v1');
    t.ground = 4;
    G.pickTree(0, null, true);
    assert.ok(g.stock.v1 >= 4);
    t.mat = 100;
    G.leaveCutting(t);
    assert.equal(state.orchard.cuttings.at(-1).v, 'v1');
});

test('les vendanges : on livre les raisins puis on réclame', () => {
    start();
    state.stats = state.stats || {};
    G.seasonJump && G.seasonJump('automne');
    const pick = () => {
        for (let d = 1; d < 400; d++) {
            state.day = d;
            if (G.vendActive()) return true;
        }
        return false;
    };
    assert.ok(pick());
    const v = G.vendState();
    assert.ok(v && !v.claimed);
    state.inventory.grape = v.need;
    G.giveVend();
    assert.ok(G.vendDone(v));
    const before = state.inventory.tableWine || 0;
    assert.ok(G.claimVend());
    assert.equal(state.inventory.tableWine, before + G.vendReward().bottles);
    assert.ok(!G.claimVend());
});
