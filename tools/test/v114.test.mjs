// 1.14 : bois fruitier, décorations en matériaux, cuve, enclos, manoir, poisson au mur.
import test from 'node:test';
import assert from 'node:assert/strict';
import { state } from '../../src/core/state.js';
import { setView } from '../../src/core/view.js';
import * as G from '../../src/systems/index.js';
import { ITEMS } from '../../src/data/items.js';
import { RECIPES } from '../../src/data/machines.js';
import { DECOS } from '../../src/data/farm.js';
import { HOUSE } from '../../src/data/progress.js';
import { SPR } from '../../src/art/index.js';

const start = () => {
    G.loadGame();
    setView({ started: false, tab: 'farm' });
    state.level = 60;
    state.money = 1e9;
    state.bld = null;
    state.barn.lvl = 12;
    G.ensureOrchard();
    state.orchard.slots.forEach(x => (x.tree = null));
    for (const k of [
        'wood',
        'stone',
        'plank',
        'beam',
        'nail',
        'tools',
        'coal',
        'cutStone',
        'ironIngot',
        'copperIngot',
        'silverIngot',
        'solidOak',
        'quartz',
        'emerald',
        'ruby',
        'sapphire',
        'paint',
    ])
        state.inventory[k] = 300;
};

test('le bois fruitier se dessine ; un arbre abattu en laisse', () => {
    start();
    assert.ok(ITEMS.fruitWood && SPR.item('fruitWood').includes('<svg'));
    const k = state.orchard.slots.findIndex(x => x.open && !x.tree);
    assert.ok(G.plantTree(k, 'apple'));
    const t = state.orchard.slots[k].tree;
    t.age = ITEMS.apple.time;
    t.ground = 0;
    state.inventory.fruitWood = 0;
    assert.ok(G.fellTree(k));
    assert.ok(state.inventory.fruitWood >= 1);
});

test('le fumoir : le bois fruitier fait sortir un lot en argent', () => {
    start();
    state.machines.push(G.newMachine('smokehouse'));
    const i = state.machines.length - 1;
    const rid = Object.keys(RECIPES).find(r => RECIPES[r].machine === 'smokehouse' && Object.keys(RECIPES[r].ing).length === 1);
    for (const [k, n] of Object.entries(RECIPES[rid].ing)) state.inventory[k] = n * 4;
    state.inventory.fruitWood = 2;
    const old = Math.random;
    Math.random = () => 0;
    assert.ok(G.queueRecipe(i, rid));
    Math.random = old;
    assert.equal(state.inventory.fruitWood, 1, 'un bout de bois brûlé');
    assert.equal(state.machines[i].qq[0], 1, 'lot en argent');
});

test('les décorations en matériaux : cloche, banc, lanterne', () => {
    start();
    for (const id of ['copperBell', 'oakBench', 'ironLamp']) {
        assert.ok(DECOS[id] && SPR.ui(id).includes('<svg'), id);
        assert.ok(G.matCost('placedeco', id), id);
        const n = state.decorInv[id] || 0;
        assert.ok(G.buy('placedeco', id, 1), id);
        assert.equal(state.decorInv[id], n + 1);
    }
    state.grid[5].isUnlocked = true;
    state.grid[5].deco = 'copperBell';
    assert.ok(G.decoGrowth(5) > 1.07);
    state.grid[5].deco = null;
});

test('la cuve de brasserie et les enclos du laboratoire se gagnent au Chantier', () => {
    start();
    state.projects.brewhall = { done: true, given: {} };
    state.projects.lab = { done: true, given: {} };
    const v = G.vatCount(),
        b = G.breedSlots();
    assert.ok(G.bldOpen('brewery') && G.bldOpen('labPens'));
    assert.ok(G.upgradeBld('b', 'brewery'));
    assert.equal(G.vatCount(), v + 1);
    assert.ok(G.upgradeBld('b', 'labPens'));
    assert.equal(G.breedSlots(), b + 1);
});

test('le manoir : un septième niveau de maison', () => {
    start();
    assert.equal(HOUSE.length, 7);
    assert.ok(SPR.farmhouse(6).includes('<svg'));
    state.house.lvl = 5;
    const barn = G.barnCap(),
        stall = G.extraStall();
    assert.ok(G.upgradeHouse());
    assert.equal(G.houseLvl(), 6);
    assert.equal(G.barnCap(), barn + 80);
    assert.equal(G.extraStall(), stall + 1);
    assert.equal(G.houseNext(), null);
});

test('le poisson au mur : +20 de charme', () => {
    start();
    assert.equal(G.wallFish(), null);
    const id = Object.keys(G.wallCandidates()).length ? G.wallCandidates()[0].id : null;
    assert.equal(id, null, 'aucune prise : rien à accrocher');
    state.collection.f_trout = { n: 3, best: 1.2 };
    const list = G.wallCandidates();
    assert.ok(list.length && list[0].id === 'trout');
    const charm = G.charmScore();
    assert.ok(G.hangFish('trout'));
    assert.equal(G.wallFish().id, 'trout');
    assert.equal(G.charmScore(), charm + G.WALL_CHARM);
});
