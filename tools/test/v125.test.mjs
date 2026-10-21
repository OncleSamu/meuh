import test from 'node:test';
import assert from 'node:assert/strict';
import { state } from '../../src/core/state.js';
import * as G from '../../src/systems/index.js';
import { ASSOCS, COMP_TIERS, COMP_LVL } from '../../src/data/companions.js';
import { ITEMS } from '../../src/data/items.js';
import './helpers.mjs';

const field = (lvl = 50) => {
    G.loadGame();
    state.level = lvl;
    state.money = 1e9;
    state.grid.forEach(p => {
        p.isUnlocked = true;
        p.terrain = 'plowed';
        p.itemId = null;
        p.lastCrop = null;
        p.deco = null;
    });
};
const plant = (i, id) => {
    G.resetPlot(state.grid[i], id);
    state.grid[i].isWatered = true;
};

test('1.25 : 42 associations bien formées, cultures existantes', () => {
    assert.equal(ASSOCS.length, 42);
    for (const a of ASSOCS) {
        for (const id of [...a.a, ...(a.b === '*' ? [] : a.b), ...(a.c || [])]) assert.ok(ITEMS[id] && ITEMS[id].type === 'crop', `${a.id} : ${id}`);
        assert.ok(G.assocLvl(a) >= COMP_LVL && G.assocLvl(a) <= 50, a.id);
    }
    assert.equal(new Set(ASSOCS.map(a => a.id)).size, ASSOCS.length);
});
test('1.25 : voisines du champ (6 colonnes) et de la serre (4 colonnes)', () => {
    field();
    assert.deepEqual(
        G.compNeighbors(0).sort((a, b) => a - b),
        [1, 6],
    );
    assert.deepEqual(
        G.compNeighbors(7).sort((a, b) => a - b),
        [1, 6, 8, 13],
    );
    assert.ok(!G.compNeighbors(5).includes(6)); // pas de saut de rangée
    state.greenhouse.plots = Array.from({ length: 8 }, () => ({ isUnlocked: true, itemId: null }));
    assert.deepEqual(
        G.compNeighbors(1001).sort((a, b) => a - b),
        [1000, 1002, 1005],
    );
});
test('1.25 : tomate et basilic : qualité ; pomme de terre à côté : nuisibles', () => {
    field();
    plant(0, 'tomato');
    plant(1, 'basil');
    plant(6, 'potato');
    const fx = G.plotFx(0);
    assert.ok(Math.abs(fx.quality - 0.12) < 1e-9);
    assert.ok(Math.abs(fx.pest - 1.5) < 1e-9);
    assert.equal(G.linkKind(0, 1), 'good');
    assert.equal(G.linkKind(0, 6), 'bad');
});
test('1.25 : la pousse suit les associations (plotRate) et reste plafonnée', () => {
    field();
    plant(7, 'carrot');
    const base = G.plotRate(state.grid[7], 7);
    plant(8, 'radish');
    plant(6, 'lettuce');
    plant(1, 'peas');
    plant(13, 'leek');
    const fx = G.plotFx(7);
    assert.ok(fx.speed > 0 && fx.speed <= 0.3 + 1e-9);
    assert.ok(Math.abs(G.plotRate(state.grid[7], 7) / base - (1 + fx.speed)) < 1e-9);
});
test('1.25 : lavande et engrais vert ne profitent qu’à la voisine', () => {
    field();
    plant(0, 'lavender');
    plant(1, 'wheat');
    assert.ok(G.plotFx(1).extra > 0);
    assert.equal(G.plotFx(0).extra, 0);
    plant(2, 'peas');
    assert.ok(G.plotFx(1).speed > 0);
    assert.equal(G.plotFx(2).speed, 0);
});
test('1.25 : les trois sœurs', () => {
    field();
    plant(7, 'corn');
    plant(8, 'greenBean');
    plant(13, 'pumpkin');
    assert.ok(G.inTrio(7));
    assert.ok(G.plotAssocs(7).some(a => a.id === 'troisSoeurs'));
    assert.ok(G.plotFx(7).extra >= 0.25);
    assert.ok(!G.inTrio(8)); // le haricot ne touche pas la citrouille
});
test('1.25 : rien avant le niveau 9, et une association attend son niveau', () => {
    field(8);
    plant(0, 'carrot');
    plant(1, 'onion');
    assert.deepEqual(G.plotAssocs(0), []);
    field(12);
    plant(0, 'tomato');
    plant(1, 'basil'); // basilic : niveau 15
    assert.deepEqual(G.plotAssocs(0), []);
});
test('1.25 : la récolte découvre l’association, « Tout récolter » ne la casse pas', () => {
    field();
    plant(0, 'carrot');
    plant(1, 'onion');
    state.grid[0].isReady = state.grid[1].isReady = true;
    state.settings.autoReplant = false;
    G.harvestPlot(state.grid[0]);
    assert.ok(G.ensureComp().seen.carotteOignon);
    // la carotte vient d'être récoltée : l'oignon compte encore sur elle
    assert.ok(G.plotAssocs(1).some(a => a.id === 'carotteOignon'));
});
test('1.25 : carnet et conseil de Mamie', () => {
    field();
    const c = G.ensureComp();
    for (const a of ASSOCS.slice(0, 5)) c.seen[a.id] = 1;
    assert.ok(G.tierReady());
    const m = state.money;
    assert.ok(G.claimTier());
    assert.equal(state.money - m, COMP_TIERS[0].coins);
    assert.ok(!G.tierReady());
    const d = G.mamieDefi();
    assert.ok(d && d.need >= 4);
    d.got = d.need;
    d.done = true;
    assert.ok(G.claimMamie());
    assert.ok(!G.claimMamie());
});
