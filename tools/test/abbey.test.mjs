// L'abbaye (1.6) : composer une bière, la brasser, la nommer, la vendre, la faire vieillir en fût.
import test from 'node:test';
import assert from 'node:assert/strict';
import { clock } from './helpers.mjs';
import { state } from '../../src/core/state.js';
import { setView } from '../../src/core/view.js';
import * as G from '../../src/systems/index.js';
import { PROJECTS, CHAPTERS } from '../../src/data/village.js';
import { ITEMS } from '../../src/data/items.js';
import { ABBEY } from '../../src/data/abbey.js';

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
    assert.ok(state.money > m + G.beerOf(bid).value * 1.9 && state.money <= m + G.beerOf(bid).value * 2, 'deux bouteilles, la seconde un peu moins chère');
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
    // 1.6.3 : en fût de chêne, à la cave ; la valeur monte à chaque étape
    state.money = 1e7;
    G.ensureCave();
    const slot = state.cave.slots.indexOf(null);
    assert.ok(
        G.caveBeers().some(b => b.id === bid),
        'la bière peut descendre à la cave',
    );
    assert.ok(G.putBeerInCave(slot, bid, 6, 'oak'));
    assert.equal(G.beerStock(bid), 0);
    const lot = state.cave.slots[slot];
    assert.equal(lot.id, 'beer');
    assert.equal(G.lotName(lot), G.beerOf(bid).name);
    assert.equal(G.lotUnit(lot), Math.round(G.beerValue(bid)));
    assert.ok(G.caveLotMax() >= 8);
});

test('1.6.3 : les fûts de l’ancien cellier reviennent dans « Mes bières »', () => {
    const bid = Object.keys(state.brew.beers)[0];
    state.brew.barrels = [{ bid, n: 4, k: 'oak', stage: 1, next: clock.t + 1e9, turned: false }, null];
    G.ensureCave();
    assert.equal(state.brew.barrels.length, 0);
    const aged = G.myBeers().find(x => x.aged && x.aged.from === bid);
    assert.ok(aged, 'une bière de garde entre dans « Mes bières »');
    assert.equal(G.beerStock(aged.id), 4);
    // 1.7 : un nom trop long est raccourci au mot près, sans couper l'âge
    assert.ok(aged.name.length <= 22 && aged.name.endsWith('élevée'), aged.name);
});

test('la malterie et l’orge', () => {
    assert.ok(ITEMS.barley && ITEMS.barley.reqLvl < ABBEY.lvl);
    for (const m of ['maltBlond', 'maltAmber', 'maltBrown', 'maltBlack']) assert.ok(G.recipeUnlocked(m), m);
});

test('vendre la ferme garde les recettes et le livre, pas les bouteilles', () => {
    const n = Object.keys(state.brew.beers).length;
    state.level = 60;
    state.stats.earnedRun = 1e6;
    assert.ok(G.doPrestige('', 'none'));
    assert.equal(Object.keys(state.brew.beers).length, n);
    assert.ok(state.brew.book.raspberry);
    assert.equal(
        Object.values(state.brew.stock).reduce((a, b) => a + b, 0),
        0,
    );
});

test('1.6.2 : étoiles secrètes, rebrasser, boucle, demande et commandes de bière', () => {
    state.level = 40;
    for (const p of ['malthouse', 'brewhall', 'fermenters', 'labelshop', 'barrelcellar']) state.projects[p] = { given: {}, done: true };
    G.ensureBrew();
    assert.ok(!G.BREWABLE.includes('hop'), 'le houblon n’est pas un ingrédient');
    Object.assign(state.inventory, { maltAmber: 40, hop: 60, apple: 60, quince: 60, honey: 20 });
    const d = {
        malt: 'maltAmber',
        hop: 1,
        ings: [
            ['apple', 2],
            ['quince', 1],
        ],
    };
    state.brew.draft = d;
    const pv = G.brewPreview();
    if (!pv.known) assert.ok(pv.secret && pv.hints.length, 'une recette nouvelle cache ses étoiles');
    const bid = G.startBrew();
    assert.ok(bid);
    assert.equal(G.brewPreview().secret, false, 'après le premier brassin, les étoiles se voient');
    // la cuve en boucle relance la même bière
    const i = state.brew.vats.findIndex(v => v && v.bid === bid);
    assert.ok(G.toggleVatLoop(i));
    const apples = state.inventory.apple;
    clock.t += G.brewTime(d.ings) * 1000 + 1000;
    G.brewTick();
    assert.equal(G.beerStock(bid) >= 6, true);
    assert.ok(
        state.brew.vats.some(v => v && v.bid === bid && v.loop),
        'relancée',
    );
    assert.ok(state.inventory.apple < apples);
    // rebrasser depuis « Mes bières »
    assert.ok(G.rebrew(bid));
    // la demande : le prix baisse quand on vend beaucoup, puis remonte
    state.brew.stock[bid] = 60;
    const p0 = G.beerPrice(bid);
    G.sellBeer(bid, 30);
    assert.ok(G.beerPrice(bid) < p0);
    clock.t += 24 * 3600 * 1000;
    assert.ok(G.beerPrice(bid) > p0 * 0.95);
    // une commande de bière que notre bière remplit
    const b = G.beerOf(bid);
    state.brew.orders = [{ id: 'oTest', vid: 'hugues', malt: b.malt, note: G.beerNote(b), min: Math.min(1, b.stars), qty: 3 }];
    assert.equal(G.beerOrderMatches(state.brew.orders[0])[0].id, bid);
    const m = state.money,
        before = state.stats.beerOrders || 0;
    assert.ok(G.deliverBeerOrder('oTest'));
    assert.ok(state.money > m);
    assert.equal(state.stats.beerOrders, before + 1);
    assert.equal(state.brew.orders.length, 0);
    // de nouvelles commandes arrivent avec le temps
    clock.t += 3600 * 1000;
    G.brewTick();
    assert.ok(state.brew.orders.length >= 1);
});
