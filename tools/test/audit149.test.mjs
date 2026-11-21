// 1.149 : Grand Nettoyage & Fluidité — tests de non-régression de l'audit complet.
import test from 'node:test';
import assert from 'node:assert/strict';
import { memStore } from './helpers.mjs';
import { state, setStore, fromSave } from '../../src/core/state.js';
import { setView } from '../../src/core/view.js';
import { setClock } from '../../src/core/clock.js';
import * as G from '../../src/systems/index.js';
import { GUIDE_PAGES } from '../../src/data/guide.js';
import { BREWFEST } from '../../src/data/brewfest.js';
import { ITEMS } from '../../src/data/items.js';
import { PRESTIGE_LVL } from '../../src/data/progress.js';

let T = Date.UTC(2026, 10, 20, 12);
function farm(lvl = 80) {
    T = Date.UTC(2026, 10, 20, 12);
    setClock(() => T);
    setStore(memStore());
    G.loadGame();
    setView({ started: false, tab: 'farm', hidden: false });
    state.tutorial.done = true;
    state.level = lvl;
    state.money = 1e9;
    state.barn.lvl = 14;
    for (const k of ['plank', 'paint', 'beam', 'nail', 'tools']) state.inventory[k] = 500;
}

test('1.149 : fromSave rejette les valeurs null/NaN/négatives et protège les objets', () => {
    const sv = {
        money: 500,
        level: NaN,
        day: -5,
        xp: Infinity,
        gameTimeMinutes: NaN,
        grid: [],
        stats: null,
        settings: [],
        inventory: { wheat: -10, carrot: NaN, milk: 7 },
        seeds: { wheat: -3, carrot: 4 },
    };
    const st = fromSave(sv);
    assert.equal(st.level, 1);
    assert.equal(st.day, 1);
    assert.equal(st.xp, 0);
    assert.equal(typeof st.stats, 'object');
    assert.ok(!Array.isArray(st.settings));
    assert.equal(st.inventory.wheat, 0);
    assert.equal(st.inventory.carrot, 0);
    assert.equal(st.inventory.milk, 7);
    assert.equal(st.seeds.wheat, 0);
    assert.equal(st.seeds.carrot, 4);
});

test('1.149 : brasserie interdit le cumul produit + variété au-delà du stock de base', () => {
    farm(55);
    G.ensureGenetics();
    G.ensureBrew();
    const vid = 'v_test_wheat';
    state.genetics.vars[vid] = { id: vid, base: 'wheat', name: 'Blé doré', traits: { flavor: 3 } };
    state.genetics.stock[vid] = 5;
    state.inventory.wheat = 5;
    state.inventory.maltBlond = 50;
    state.inventory.hops = 50;
    state.inventory.yeast = 50;
    // Avec 5 blés total en stock, on ne peut pas mettre 4 wheat + 4 v:v_test_wheat (= 8 > 5)
    const prev = G.brewPreview({ malt: 'maltBlond', hop: 1, ings: [['wheat', 4], ['v:' + vid, 4]] });
    assert.ok(prev.miss.length > 0);
});

test('1.149 : concours de bière garde le score qualité sur les 2 dernières bouteilles Diamant', () => {
    farm(60);
    state.projects.brewhall = { done: true };
    G.ensureBrew();
    const bid = 'b_diag';
    state.brew.beers[bid] = { id: bid, name: 'Diamant test', malt: 'maltBlond', hop: 1, ings: [['wheat', 2]], stars: 3, value: 500, made: 2 };
    state.brew.stock[bid] = BREWFEST.bottles;
    state.brew.q[bid] = { s: 0, g: 0, p: 0, d: BREWFEST.bottles };
    const before = G.festScore(bid);
    G.festTick();
    assert.equal(G.enterFest(bid), true);
    assert.equal(state.brew.fest.entry.score, before.total);
});

test('1.149 : retraite d’un cheval rend son harnachement à la grange et bloque sa vente', () => {
    farm(60);
    for (const k of ['wood', 'stone', 'brick', 'iron']) state.inventory[k] = 500;
    G.ensureHaras();
    G.upgradeStable();
    G.ensureShow();
    const horse = G.newAnimal('horse', 0);
    horse.adult = true;
    state.animals.push(horse);
    assert.equal(G.lodge(horse.uid), true);
    const rec = G.rec(horse);
    rec.eq = { shoes: 'ironShoes', saddle: 'dressSaddle' };
    G.champWon(horse.uid, 3);
    const beforeShoes = state.inventory.ironShoes || 0;
    const beforeSaddle = state.inventory.dressSaddle || 0;
    assert.equal(G.retire(horse.uid), true);
    assert.equal(state.inventory.ironShoes, beforeShoes + 1);
    assert.equal(state.inventory.dressSaddle, beforeSaddle + 1);
    assert.equal(Object.keys(rec.eq).length, 0);
    assert.ok(G.animalSellBlock(horse));
});

test('1.149 : vente d’un cheval non retraité rend aussi son harnachement et bloque s’il est en balade', () => {
    farm(60);
    for (const k of ['wood', 'stone', 'brick', 'iron']) state.inventory[k] = 500;
    G.ensureHaras();
    G.upgradeStable();
    const horse = G.newAnimal('horse', 0);
    horse.adult = true;
    state.animals.push(horse);
    assert.equal(G.lodge(horse.uid), true);
    const rec = G.rec(horse);
    rec.rando = { until: T + 3600000 };
    assert.ok(G.animalSellBlock(horse));
    rec.rando = null;
    rec.eq = { bridle: 'bridle' };
    const before = state.inventory.bridle || 0;
    assert.equal(G.unlodge(horse.uid), true);
    assert.ok(G.sellAnimal(state.animals.indexOf(horse)) > 0);
    assert.equal(state.inventory.bridle, before + 1);
});

test('1.149 : cave champagne sans soin (c === 0.3) a bien un risque de casse et putInCave recale la qualité', () => {
    farm(60);
    G.ensureCave();
    state.inventory.redWine = 5;
    state.quality.redWine = { s: 0, g: 5, p: 0, d: 0 };
    assert.equal(G.putInCave(0, 'redWine', 3), true);
    assert.equal(state.inventory.redWine, 2);
    assert.ok(state.quality.redWine.g <= 2);
    // Champagne sans soin (care = 0.3)
    const odds = G.lotOdds({ id: 'champagne', n: 1, rank: 1, bad: false, care: 0.3 });
    assert.ok(odds.rot > 0);
});

test('1.149 : plantAll n’essaie pas de planter une culture ghOnly sur le champ principal ni un arbre en serre', () => {
    farm(60);
    state.greenhouse.built = true;
    G.ensureGhPlots();
    const ghCrop = Object.values(ITEMS).find(i => i.ghOnly);
    assert.ok(ghCrop);
    state.seeds[ghCrop.id] = 10;
    state.selectedTool = ghCrop.id;
    state.grid[0].isUnlocked = true;
    state.grid[0].isPlowed = true;
    state.grid[0].itemId = null;
    G.plantAll();
    assert.equal(state.grid[0].itemId, null);
    assert.equal(state.greenhouse.plots[0].itemId, ghCrop.id);
});

test('1.149 : commande de parfum paie bouteille par bouteille selon les qualités réellement consommées', () => {
    farm(60);
    G.ensurePerfume();
    const pid = 'p_mix';
    state.perfume.creations[pid] = {
        id: pid,
        name: 'Test Mix',
        family: 'floral',
        head: 'bergamot',
        heart: 'rose',
        base: 'cedar',
        method: 'enfleurage',
        conc: 'parfum',
        stars: 3,
        value: 1000,
        made: 2,
    };
    state.perfume.stock[pid] = 2;
    state.perfume.q[pid] = { s: 0, g: 0, p: 0, d: 1 }; // 1 diamant (×2.5) + 1 ordinaire (×1.0)
    const ord = { id: 'o1', qty: 2, family: 'floral', minStars: 1, vid: 'odette' };
    const payMixed = G.perfumeOrderPay(ord, pid);
    state.perfume.q[pid] = { s: 0, g: 0, p: 0, d: 2 };
    const payAllDiam = G.perfumeOrderPay(ord, pid);
    assert.ok(payMixed < payAllDiam);
});

test('1.149 : prestige préserve la famille, bloque les doublons de récompenses et nettoie les anciens défis', () => {
    farm(PRESTIGE_LVL);
    state.stats.earnedRun = 100000;
    state.bookTiers = { k_bread: 2 };
    state.qmade = { bread: 1 };
    state.duos = { 'odette-marcel': { step: 2, done: true } };
    state.herdbook = { robes: { cow: ['pie'] } };
    state.fseasonLog = [{ season: 'fleurs', rank: 1 }];
    state.me = { name: 'Ferme Test', look: 'm1' };
    state.family = { spouse: 'odette', gen: 2, kids: [], kin: [{ id: 'k1', name: 'Léo', grow: 999, metier: 'cuisinier' }], elders: [{ gen: 1 }] };
    G.ensureDefis();
    state.defis.mini = { id: 'm1' };
    state.defis.offer = ['chateau'];
    G.ensureBrew();
    state.brew.orders = [{ id: 'bo1' }];
    state.brew.demand = { b1: 0.5 };
    assert.equal(G.doPrestige(), true);
    assert.deepEqual(state.bookTiers, { k_bread: 2 });
    assert.deepEqual(state.qmade, { bread: 1 });
    assert.ok(state.family && state.family.gen === 2 && state.family.elders.length === 1);
    assert.equal(state.me.name, 'Ferme Test');
    assert.equal(state.defis.mini, null);
    assert.equal(state.defis.offer, null);
    assert.deepEqual(state.brew.orders, []);
    assert.deepEqual(state.brew.demand, {});
});

test('1.149 : kidMetierMult reste actif pour les enfants devenus kin après transmission', () => {
    farm(60);
    state.family = {
        spouse: 'odette',
        gen: 2,
        kids: [],
        kin: [{ id: 'k1', name: 'Léo', grow: 999, metier: 'cuisinier' }],
    };
    assert.ok(G.kidMetierMult('bread') > 1);
});

test('1.149 : orchardOffline est borné même après une très longue absence', () => {
    farm(60);
    G.ensureOrchard();
    state.orchard.slots[0].tree = { id: 'apple', age: 1000, stage: 2, ground: 0, nextFruit: 0, planted: T - 10000 };
    const t0 = Date.now();
    const res = G.orchardOffline(10 * 365 * 86400); // 10 ans
    assert.ok(Date.now() - t0 < 500);
    assert.ok(res && typeof res.fell === 'number');
});

test('1.149 : le Guide dispose de pages dédiées Camping et La Maison', () => {
    const ids = GUIDE_PAGES.map(p => p.id);
    assert.ok(ids.includes('camping'));
    assert.ok(ids.includes('maison'));
});
