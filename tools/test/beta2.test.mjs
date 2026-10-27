// Bêta 2 : le verger (vie d'un arbre, fruits au sol, bois) et les prés (20 bêtes, achat, déménagement).
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { clock, memStore } from './helpers.mjs';
import { state, setStore, SAVE_KEY } from '../../src/core/state.js';
import { setView } from '../../src/core/view.js';
import * as G from '../../src/systems/index.js';
import { ORCHARD, PASTURE } from '../../src/data/farm.js';

const OLD = readFileSync(new URL('./fixtures/save-6.2.json', import.meta.url), 'utf8');

function loadOld() {
    const st = memStore();
    st.setItem(SAVE_KEY, OLD);
    setStore(st);
    clock.t = JSON.parse(OLD).lastSaved + 1000;
    G.loadGame();
    setView({ started: true, tab: 'farm' });
}

test('les arbres du champ déménagent au verger, en pleine forme', () => {
    const old = JSON.parse(OLD);
    const trees = old.grid.filter(p => p.itemId && ['apple', 'cherry', 'orange', 'peach', 'grape', 'olive'].includes(p.itemId)).length;
    loadOld();
    assert.ok(
        state.grid.every(p => !p.itemId || G.treeList().every(t => t.id !== p.itemId)),
        'plus d’arbre dans le champ',
    );
    const moved = state.orchard.slots.filter(x => x.tree);
    assert.equal(moved.length, trees);
    assert.ok(moved.every(x => G.treeStage(x.tree) === 'adult'));
    assert.ok(G.openSlots() >= ORCHARD.base);
});

test('les prés accueillent tout le troupeau d’une vieille ferme', () => {
    const n = state.animals.length;
    assert.equal(state.pastures.length, Math.ceil(n / PASTURE.cap));
    state.pastures.forEach((p, k) => assert.ok(G.pastureLoad(k) <= PASTURE.cap));
});

test('un arbre grandit, donne ses fruits, attend quand le sol est plein, puis meurt en bois', () => {
    state.money = 1e9;
    const k = state.orchard.slots.findIndex(x => x.open && !x.tree);
    assert.ok(G.plantTree(k, 'apple'));
    const t = state.orchard.slots[k].tree;
    assert.equal(G.treeStage(t), 'young');
    G.advanceTree(t, 1e6);
    assert.equal(t.ground, ORCHARD.groundMax, 'sol plein');
    const drops = t.drops;
    G.advanceTree(t, 1e5);
    assert.equal(t.drops, drops, 'sol plein : l’arbre attend');
    // on ramasse jusqu'à la fin de sa vie
    let guard = 0;
    while (G.treeStage(t) !== 'dead' && guard++ < 1000) {
        t.ground = 0;
        G.advanceTree(t, 1e4);
    }
    assert.equal(G.treeStage(t), 'dead');
    const wood = state.inventory.wood;
    t.ground = 0;
    assert.ok(G.fellTree(k));
    assert.ok(state.inventory.wood > wood, 'du bois');
    assert.equal(state.orchard.slots[k].tree, null);
});

test('ramasser met les fruits en grange', () => {
    state.barn.lvl = 50;
    const k = state.orchard.slots.findIndex(x => x.open && !x.tree);
    G.plantTree(k, 'cherry');
    const t = state.orchard.slots[k].tree;
    G.advanceTree(t, 1e5);
    const before = state.inventory.cherry,
        n = t.ground;
    const r = G.pickTree(k, null, true);
    assert.equal(r.qty, n);
    assert.equal(state.inventory.cherry, before + n);
});

test('20 bêtes par pré, achat d’un pré, déménagement', () => {
    state.money = 1e9;
    while (!G.herdFull()) G.buy('animal', 'chicken', 1);
    assert.equal(G.canBuy('animal', 'chicken'), false);
    const k = G.buyPasture();
    assert.equal(k, state.pastures.length - 1);
    G.buy('animal', 'chicken', 1);
    assert.equal(state.animals[state.animals.length - 1].p, k);
    const i = state.animals.findIndex(a => (a.p || 0) === 0);
    assert.ok(G.moveAnimal(i, k));
    assert.equal(state.animals[i].p, k);
    assert.equal(
        G.moveAnimal(
            state.animals.findIndex(a => a.p === k),
            1,
        ),
        false,
        'un pré plein refuse',
    );
});

test('vendre la ferme repart avec un pré et un verger fermé', () => {
    state.level = 64;
    state.money = 1e9;
    G.doPrestige('', 'none');
    assert.equal(state.pastures.length, 1);
    assert.ok(state.orchard && state.orchard.slots.every(x => !x.tree));
    for (let s = 0; s < 30; s++) {
        clock.t += 1000;
        G.gameTick();
    }
});
