// 1.68 : l'hydromel à la brasserie : un miel à la place du malt, pas de houblon, jusqu'à 4 ingrédients.
import test from 'node:test';
import assert from 'node:assert/strict';
import { memStore, clock } from './helpers.mjs';
import { state, setStore } from '../../src/core/state.js';
import { setView } from '../../src/core/view.js';
import * as G from '../../src/systems/index.js';
import { MEAD } from '../../src/data/abbey.js';

function abbey(lvl = 50) {
    setStore(memStore());
    G.loadGame();
    setView({ started: false, tab: 'farm' });
    state.level = lvl;
    G.ensureGenetics();
    for (const p of ['malthouse', 'brewhall', 'fermenters', 'labelshop', 'barrelcellar']) state.projects[p] = { given: {}, done: true };
    G.ensureBrew();
    Object.assign(state.inventory, { honey: 40, apple: 40, raspberry: 40, vanilla: 40, lemon: 40, mint: 40, walnut: 40, hop: 40, maltBlond: 20 });
}
const tick = s => {
    for (let k = 0; k < s; k++) {
        clock.t += 1000;
        G.gameTick();
    }
};

test('1.68 : l’hydromel s’ouvre au niveau 42 avec la brasserie', () => {
    abbey(40);
    assert.equal(G.meadOpen(), false);
    assert.equal(G.setDraftKind('mead'), false);
    state.level = MEAD.lvl;
    assert.equal(G.meadOpen(), true);
    assert.ok(G.setDraftKind('mead'));
    assert.equal(state.brew.draft.malt, 'mead:all');
    assert.equal(G.brewSlots('mead:all'), Math.min(4, G.brewSlots() + 1));
    // retour à la bière : on retrouve son malt
    assert.ok(G.setDraftKind('beer'));
    assert.equal(state.brew.draft.malt, 'maltBlond');
});

test('1.68 : brasser un cyser : 6 pots de miel, pas de houblon, un classique, un nom, un cruchon', () => {
    abbey();
    G.setDraftKind('mead');
    assert.ok(G.setDraftIng(0, 'apple'));
    const pv = G.brewPreview();
    assert.equal(pv.cost.honey, MEAD.honeyPerBrew);
    assert.equal(pv.cost.hop, undefined, 'pas de houblon');
    assert.equal(pv.harmony.classic, 'cyser');
    assert.match(pv.name, /^Cyser /);
    assert.equal(pv.time, MEAD.baseTime + MEAD.perIng);
    const hop = state.inventory.hop;
    const bid = G.startBrew();
    assert.ok(bid);
    assert.equal(state.inventory.honey, 40 - MEAD.honeyPerBrew);
    assert.equal(state.inventory.hop, hop);
    const b = G.beerOf(bid);
    assert.equal(b.mead, true);
    assert.equal(b.honey, 'all');
    tick(pv.time + 1);
    const vat = state.brew.vats.findIndex(v => v && v.bid === bid);
    assert.ok(G.collectVat(vat));
    assert.ok(state.brew.book.Hall, 'la page du miel toutes fleurs');
    assert.ok(state.brew.book.apple);
    assert.ok(G.beerStock(bid) > 0);
});

test('1.68 : un hydromel au miel de fleur prend ce miel, et 4 ingrédients', () => {
    abbey();
    G.addHoney('lavender', 10);
    assert.ok(G.meadHoneys().includes('lavender'));
    G.setDraftKind('mead');
    assert.ok(G.setDraftHoney('lavender'));
    for (const [k, id] of ['raspberry', 'lemon', 'mint', 'vanilla'].entries()) assert.ok(G.setDraftIng(k, id), id);
    const pv = G.brewPreview();
    assert.equal(pv.ings.length, Math.min(4, G.brewSlots() + 1));
    assert.equal(pv.cost.Hlavender, MEAD.honeyPerBrew);
    assert.match(pv.name, /lavande/);
    const id = G.honeyProd('lavender');
    const bid = G.startBrew();
    assert.ok(bid);
    G.clampVarieties();
    assert.equal(state.genetics.stock[id], 10 - MEAD.honeyPerBrew);
    assert.equal(G.beerOf(bid).honey, 'lavender');
});

test('1.68 : les commandes d’hydromel ne prennent que des hydromels ; une commande de bière, que des bières', () => {
    abbey();
    G.setDraftKind('mead');
    G.setDraftIng(0, 'apple');
    const mid = G.startBrew();
    G.setDraftKind('beer');
    G.setDraftIng(0, 'apple');
    const bid = G.startBrew();
    const m = G.beerOf(mid),
        b = G.beerOf(bid);
    const om = { mead: true, note: G.beerNote(m), min: 0, qty: 1 },
        ob = { note: G.beerNote(b), min: 0, qty: 1 };
    assert.ok(G.beerFits(om, m));
    assert.equal(G.beerFits(om, b), false);
    assert.ok(G.beerFits(ob, b));
    assert.equal(G.beerFits(ob, m), false);
    assert.match(G.beerOrderText(om), /hydromel/);
});

test('1.68 : un hydromel descend à la cave comme une bière, et garde son nom', () => {
    abbey();
    state.money = 1e7;
    G.setDraftKind('mead');
    G.setDraftIng(0, 'apple');
    G.setDraftIng(1, 'vanilla');
    const pv = G.brewPreview();
    const bid = G.startBrew();
    tick(pv.time + 1);
    G.collectVat(state.brew.vats.findIndex(v => v && v.bid === bid));
    G.ensureCave();
    assert.ok(G.caveBeers().some(b => b.id === bid));
    const slot = state.cave.slots.indexOf(null);
    assert.ok(G.putBeerInCave(slot, bid, 4, 'oak'));
    assert.equal(G.lotName(state.cave.slots[slot]), G.beerOf(bid).name);
    assert.ok(G.lotUnit(state.cave.slots[slot]) > 0);
});

test('1.68 : les anciennes bières ne changent pas', () => {
    abbey();
    G.setDraftMalt('maltBlond');
    G.setDraftHop(2);
    G.setDraftIng(0, 'raspberry');
    const pv = G.brewPreview();
    assert.equal(pv.mead, false);
    assert.ok(pv.cost.hop > 0);
    assert.ok(pv.cost.maltBlond > 0);
    assert.equal(G.brewSlots(), 3);
});

test('1.68 : au niveau 42, l’objectif « un hydromel » mène à la brasserie et se coche à la mise en bouteille', () => {
    abbey(MEAD.lvl);
    const g = G.makeGoals(MEAD.lvl).find(x => x.kind === 'mead');
    assert.ok(g);
    assert.equal(G.goalDone(g), false);
    assert.match(G.lvGoalText(g), /hydromel/);
    G.setDraftKind('mead');
    G.setDraftIng(0, 'apple');
    const bid = G.startBrew();
    tick(G.brewPreview().time + 1);
    G.collectVat(state.brew.vats.findIndex(v => v && v.bid === bid));
    assert.ok(G.goalDone(g));
});
