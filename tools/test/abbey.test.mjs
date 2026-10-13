// L'abbaye (1.6) : composer une bière, la brasser, la nommer, la vendre, la faire vieillir en fût.
import test from 'node:test';
import assert from 'node:assert/strict';
import { clock } from './helpers.mjs';
import { state } from '../../src/core/state.js';
import { setView } from '../../src/core/view.js';
import * as G from '../../src/systems/index.js';
import { PROJECTS, CHAPTERS } from '../../src/data/village.js';
import { ITEMS } from '../../src/data/items.js';
import { ABBEY, CELLAR } from '../../src/data/abbey.js';

const tick = s => {
    for (let k = 0; k < s; k++) {
        clock.t += 1000;
        G.gameTick();
    }
};
const finishChapter = n => Object.values(PROJECTS).forEach(p => p.ch === n && (state.projects[p.id] = { given: {}, done: true }));

test('l’abbaye vient après le port, l’île après l’abbaye', () => {
    G.loadGame();
    setView({ started: true, tab: 'farm' });
    assert.equal(G.chapterAfter(17), 8);
    assert.equal(G.chapterAfter(13), 18);
    assert.equal(CHAPTERS[16].lvl, ABBEY.lvl);
    assert.ok(G.BREWABLE.length >= 80, 'chaque culture et chaque fruit peut aller dans une bière');
    assert.equal(G.brewOpen(), false);
});

test('composer et brasser une bière à un ingrédient', () => {
    state.level = 40;
    for (const n of [1, 2, 3, 4, 5, 6, 7, 8]) finishChapter(n);
    state.projects.malthouse = { given: {}, done: true };
    state.projects.brewhall = { given: {}, done: true };
    G.ensureBrew();
    assert.equal(G.brewSlots(), 1);
    assert.equal(state.brew.vats.length, 2);
    Object.assign(state.inventory, { maltBlond: 20, maltBlack: 20, hop: 40, raspberry: 40, cacao: 40, chestnut: 40, lemon: 40 });
    G.setDraftMalt('maltBlond');
    G.setDraftHop(1);
    assert.ok(G.setDraftIng(0, 'raspberry'));
    assert.equal(G.setDraftIng(1, 'lemon'), false, 'un seul ingrédient avant les cuves');
    const pv = G.brewPreview();
    assert.ok(pv.harmony.stars >= 2, 'une blonde à la framboise s’accorde bien');
    assert.ok(pv.value > 0);
    const bid = G.startBrew();
    assert.ok(bid);
    assert.equal(state.inventory.raspberry, 40 - ABBEY.ingPerDose);
    assert.equal(G.collectVat(0), false, 'pas encore prête');
    tick(G.brewTime([['raspberry', 1]]) + 1);
    assert.ok(G.collectVat(0));
    assert.equal(G.beerStock(bid), ABBEY.bottles);
    assert.ok(state.brew.book.raspberry);
    // rebrasser la même recette garde la même bière
    assert.equal(G.startBrew(), bid);
    // renommer, vendre
    assert.ok(G.renameBeer(bid, 'La Rouge du cloître'));
    assert.equal(G.beerOf(bid).name, 'La Rouge du cloître');
    const m = state.money;
    assert.ok(G.sellBeer(bid, 2));
    assert.equal(state.money, m + G.beerOf(bid).value * 2);
});

test('trois ingrédients, l’accord et le vieillissement en fût', () => {
    state.projects.fermenters = { given: {}, done: true };
    state.projects.labelshop = { given: {}, done: true };
    state.projects.barrelcellar = { given: {}, done: true };
    G.ensureBrew();
    assert.equal(G.brewSlots(), 3);
    assert.equal(state.brew.vats.length, 3);
    G.setDraftMalt('maltBlack');
    G.setDraftHop(2);
    state.brew.draft.ings = [];
    assert.ok(G.setDraftIng(0, 'cacao'));
    assert.ok(G.setDraftIng(1, 'chestnut'));
    assert.ok(G.setDraftIng(2, 'lemon'));
    assert.equal(G.setDraftIng(2, 'cacao'), false, 'pas deux fois le même ingrédient');
    G.setDraftDose(0, 3);
    const pv = G.brewPreview();
    assert.match(pv.name, /^Noire /);
    const bid = G.startBrew();
    const vat = state.brew.vats.findIndex(v => v && v.bid === bid);
    tick(G.brewTime(pv.ings) + 1);
    assert.ok(G.collectVat(vat));
    // en fût de chêne : la valeur monte à chaque étape
    state.money = 1e7;
    assert.ok(G.putInBarrel(0, bid, 6, 'oak'));
    assert.equal(G.beerStock(bid), 0);
    const v0 = G.barrelValue(state.brew.barrels[0]);
    clock.t += CELLAR.steps[0] * 1000 + 1000;
    G.cellarTick();
    const b = state.brew.barrels[0];
    assert.ok(b.stage >= 1);
    if (!b.turned) assert.ok(G.barrelValue(b) > v0);
    assert.ok(G.takeFromBarrel(0));
    const aged = G.myBeers().find(x => x.aged && x.aged.from === bid);
    assert.ok(aged, 'une bière de garde entre dans « Mes bières »');
    assert.equal(G.beerStock(aged.id), 6);
});

test('la malterie et l’orge', () => {
    assert.ok(ITEMS.barley && ITEMS.barley.reqLvl < ABBEY.lvl);
    for (const m of ['maltBlond', 'maltAmber', 'maltBrown', 'maltBlack']) assert.ok(G.recipeUnlocked(m), m);
});

test('vendre la ferme garde les recettes et le livre, pas les bouteilles', () => {
    const n = Object.keys(state.brew.beers).length;
    state.level = 50;
    state.stats.earnedRun = 1e6;
    assert.ok(G.doPrestige('', 'none'));
    assert.equal(Object.keys(state.brew.beers).length, n);
    assert.ok(state.brew.book.raspberry);
    assert.equal(
        Object.values(state.brew.stock).reduce((a, b) => a + b, 0),
        0,
    );
});
