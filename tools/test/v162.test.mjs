// 1.62 : les cépages. Le rang des produits de chaque variété, les traits de qualité partout, les vins de cépage.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { memStore } from './helpers.mjs';
import { state, setStore } from '../../src/core/state.js';
import { setView } from '../../src/core/view.js';
import * as G from '../../src/systems/index.js';
import { RECIPES } from '../../src/data/machines.js';

function farm() {
    setStore(memStore());
    G.loadGame();
    setView({ started: false, tab: 'farm' });
    state.level = 80;
    state.money = 1e9;
    G.ensureGenetics();
    state.genetics.bestFirst = true;
}
function makeVar(id, base, sweet = 5) {
    const g = G.wildPlant(base);
    g.t.sweet = [
        [sweet, 1],
        [sweet, 1],
    ];
    state.genetics.vars[id] = { id, kind: 'plant', base, auto: 'Test ' + id, name: null, g, gen: 3, fixed: false };
    return state.genetics.vars[id];
}
// récolte n unités d'une variété au rang r (comme le champ : l'espèce et la variété ensemble)
function harvest(vid, n, r) {
    const base = state.genetics.vars[vid].base;
    state.inventory[base] = (state.inventory[base] || 0) + n;
    if (r) G.addQuality(base, r, n);
    G.harvestVariety(vid, n, r);
}
const total = (base, f) => (state.quality[base] && state.quality[base][f]) || 0;

test('1.62 : une variété garde le rang de ses récoltes, et la grange le sait', () => {
    farm();
    makeVar('vA', 'carrot');
    harvest('vA', 5, 3);
    harvest('vA', 2, 0);
    assert.deepEqual(G.varRanks('vA'), [2, 0, 0, 5, 0]);
    // le verger : un tableau de rangs
    makeVar('vB', 'apple');
    state.inventory.apple = (state.inventory.apple || 0) + 4;
    G.addQuality('apple', 2, 1);
    G.addQuality('apple', 4, 1);
    G.harvestVariety('vB', 4, [2, 0, 1, 0, 1]);
    assert.deepEqual(G.varRanks('vB'), [2, 0, 1, 0, 1]);
});

test('1.62 : au marché, l’espèce part d’abord et les variétés en dernier, avec leur rang', () => {
    farm();
    makeVar('vA', 'carrot');
    state.inventory.carrot = 0;
    state.quality.carrot = { s: 0, g: 0, p: 0, d: 0 };
    harvest('vA', 3, 3);
    state.inventory.carrot += 4;
    G.addQuality('carrot', 2, 4);
    const r = G.sellBatch('carrot', 5, true);
    assert.equal(r.sold, 5);
    assert.equal(state.inventory.carrot, 2);
    assert.deepEqual(G.varRanks('vA'), [0, 0, 0, 2, 0], 'une seule unité de la variété vendue');
    assert.equal(total('carrot', 'p'), 2);
    assert.equal(total('carrot', 'g'), 0);
});

test('1.62 : vendre sa variété : chaque unité au prix de son rang, les plus basses d’abord', () => {
    farm();
    const v = makeVar('vA', 'carrot');
    state.inventory.carrot = 0;
    state.quality.carrot = { s: 0, g: 0, p: 0, d: 0 };
    harvest('vA', 2, 0);
    harvest('vA', 1, 3);
    const one = G.varietyPrice(v);
    const value = G.varietyValue(v);
    assert.ok(value > one * 3, 'le platine vaut plus');
    const gain = G.sellVariety('vA', 2);
    assert.equal(gain, one * 2, 'les deux normales');
    assert.deepEqual(G.varRanks('vA'), [0, 0, 0, 1, 0]);
});

test('1.62 : à l’atelier, une variété en platine apporte son goût et son rang', () => {
    farm();
    makeVar('vA', 'tomato', 5);
    state.inventory.tomato = 0;
    state.quality.tomato = { s: 0, g: 0, p: 0, d: 0 };
    const normal = G.varUnitPts(0, 2.4),
        plat = G.varUnitPts(3, 2.4);
    assert.ok(plat > normal && plat > 3 && plat <= 4);
    harvest('vA', 30, 3);
    // une recette où la tomate est le seul ingrédient
    const r = Object.values(RECIPES).find(x => Object.keys(x.ing).length === 1 && x.ing.tomato);
    assert.ok(r, 'une recette à la tomate seule');
    const pv = G.previewBatch(r.id);
    assert.ok(pv.q >= 3, 'platine ou mieux');
    const before = state.genetics.stock.vA;
    G.takeIngredients(r.id);
    assert.equal(state.genetics.stock.vA, before - r.ing.tomato);
    assert.equal(total('tomato', 'p'), G.varRanks('vA')[3], 'rangs de l’espèce et de la variété ensemble');
});

test('1.62 : le recalage garde les rangs des variétés sous ceux de l’espèce', () => {
    farm();
    makeVar('vA', 'carrot');
    state.inventory.carrot = 0;
    state.quality.carrot = { s: 0, g: 0, p: 0, d: 0 };
    harvest('vA', 4, 2);
    // une commande prend 3 carottes sans regarder les variétés
    state.inventory.carrot -= 3;
    G.clampVarieties();
    assert.equal(state.genetics.stock.vA, 1);
    assert.ok(G.varRanks('vA')[2] <= total('carrot', 'g'));
    assert.ok(G.varRanked('vA') <= state.genetics.stock.vA);
});

test('1.62 : verger et contrées : Maturation lente et Chance comptent', () => {
    farm();
    const v = makeVar('vL', 'apple');
    v.g.t.luck = [
        [25, 1],
        [25, 1],
    ];
    let gold = 0;
    for (let i = 0; i < 400; i++) if (G.varRank('vL', 0) === 2) gold++;
    assert.ok(gold > 200, `la chance donne de l'or (${gold}/400)`);
    assert.equal(G.varRank(null, 0, 0.5), 0);
});

test('1.62 : un vin de cépage : la variété choisie à la cuverie, son rang, sa cuvée, sa cave et son château', () => {
    farm();
    state.level = 80;
    state.projects.chai = { given: {}, done: true };
    makeVar('vR', 'grape', 6);
    state.inventory.grape = 0;
    state.quality.grape = { s: 0, g: 0, p: 0, d: 0 };
    harvest('vR', 8, 3);
    state.inventory.grape += 10; // du raisin ordinaire à côté
    state.inventory.redWine = state.inventory.redWine || 0;
    const before = state.inventory.redWine;
    state.machines.push(G.newMachine('winery'));
    const i = state.machines.length - 1,
        m = state.machines[i];
    assert.ok(G.isCepRecipe('redWine') && G.isCepRecipe('cider') && !G.isCepRecipe('champagne'));
    assert.deepEqual(G.machineCepFruits('winery'), ['grape']);
    m.cep = 'vR';
    assert.ok(G.queueRecipe(i, 'redWine'));
    assert.equal(G.varRanks('vR')[3], 4, 'quatre raisins de la variété pris');
    assert.equal(state.inventory.grape, 14);
    G.advanceMachine(m, 1e7);
    G.collectMachine(i);
    assert.equal(state.inventory.redWine, before, 'le vin de cépage ne va pas dans la grange');
    const list = G.cepBottles();
    assert.equal(list.length, 1);
    const e = list[0];
    assert.equal(G.cepName(e), 'Vin rouge « Test vR »');
    assert.ok(G.cepRanks(e.id)[3] + G.cepRanks(e.id)[4] >= 1, `en platine ou mieux : ${G.cepRanks(e.id)}`);
    assert.ok(G.cepPrice(e.id, 3) > G.cepPrice(e.id, 0));
    // en cave
    G.ensureCave();
    const n = G.cepCount(e.id);
    assert.ok(G.putCepageInCave(0, e.id, n));
    const lot = state.cave.slots[0];
    assert.ok(lot.q >= 3);
    assert.equal(G.lotName(lot), 'Vin rouge « Test vR »');
    assert.equal(G.cepCount(e.id), 0);
    // au château : un cran de plus pour une grande cuvée de cépage, une médaille de mieux
    lot.rank = 2;
    assert.equal(G.classOf(lot), Math.min(4, 1 + 1 + 1));
    assert.equal(G.lotMedal({ cl: 1, cep: lot.cep }), 2);
    // sans cépage choisi : un vin ordinaire
    m.cep = null;
    state.inventory.grape += 4;
    assert.ok(G.queueRecipe(i, 'redWine'));
    G.advanceMachine(m, 1e7);
    G.collectMachine(i);
    assert.ok(state.inventory.redWine > before);
});

test('1.62 : vendre ses bouteilles de cépage : les plus basses d’abord', () => {
    farm();
    makeVar('vR', 'grape');
    const e = G.addCepage('redWine', 'vR', 2, 0);
    G.addCepage('redWine', 'vR', 1, 4);
    const gain = G.sellCepage(e.id, 2);
    assert.equal(gain, 2 * G.cepPrice(e.id, 0));
    assert.deepEqual(G.cepRanks(e.id), [0, 0, 0, 0, 1]);
});

// ---------------- 1.63 : le coffre et les variétés, les fromages de race ----------------
test('1.63 : une variété au coffre garde son nom et son rang, et revient telle quelle', () => {
    farm();
    state.level = 80;
    makeVar('vA', 'carrot');
    state.inventory.carrot = 0;
    state.quality.carrot = { s: 0, g: 0, p: 0, d: 0 };
    harvest('vA', 3, 3);
    state.inventory.carrot += 5; // des carottes ordinaires
    G.ensureVault();
    assert.equal(G.vaultStock('carrot', 3), 0, 'les carottes ordinaires n’ont pas de platine');
    assert.equal(G.vaultStock('carrot', 3, 'vA'), 3);
    assert.ok(G.vaultPut('carrot', 3, 2, 'vA'));
    const k = G.vaultList().findIndex(s => s && s.v === 'vA');
    const s = G.vaultList()[k];
    assert.equal(G.vaultSlotName(s), 'Carotte « Test vA »');
    assert.ok(G.vaultSlotValue(s) > 0);
    assert.deepEqual(G.varRanks('vA'), [0, 0, 0, 1, 0]);
    assert.equal(state.inventory.carrot, 6);
    // une vente au marché ne touche pas au coffre
    G.sellBatch('carrot', 6, true);
    assert.equal(G.vaultList()[k].n, 2);
    G.vaultTake(k, 2);
    assert.deepEqual(G.varRanks('vA'), [0, 0, 0, 2, 0]);
    assert.equal(total('carrot', 'p'), 2);
});

test('1.63 : le lait d’une race fixée garde sa race, et fait un fromage de race', () => {
    farm();
    state.level = 80;
    const G2 = state.genetics;
    const g = G.wildAnimal('cow');
    for (const t of ['rich', 'soft', 'aroma'])
        if (g.t[t])
            g.t[t] = [
                [5, 1],
                [5, 1],
            ];
    G2.races.r1 = { id: 'r1', name: 'Normande des Prés', type: 'cow', g };
    const rv = G.raceProd('r1', 'milk');
    state.inventory.milk = 0;
    state.quality.milk = { s: 0, g: 0, p: 0, d: 0 };
    state.inventory.milk += 6;
    G.addQuality('milk', 2, 6);
    G.harvestVariety(rv, 6, 2);
    state.inventory.milk += 4; // du lait ordinaire
    assert.ok(G.raceMult(G.vdef(rv)) > 1);
    // la laiterie : on choisit la race
    assert.equal(G.cepFruit('cheese'), 'milk');
    assert.ok(G.machineCepRace('dairy'));
    assert.ok(G.cepVarieties(['milk']).some(v => v.id === rv));
    state.machines.push(G.newMachine('dairy'));
    const i = state.machines.length - 1,
        m = state.machines[i];
    m.cep = rv;
    const cheese0 = state.inventory.cheese || 0;
    assert.ok(G.queueRecipe(i, 'cheese'));
    assert.equal(
        G.varRanks(rv).reduce((a, b) => a + b, 0),
        4,
        'deux laits de race pris',
    );
    G.advanceMachine(m, 1e7);
    G.collectMachine(i);
    assert.equal(state.inventory.cheese || 0, cheese0, 'le fromage de race a son propre stock');
    const e = G.cepBottles().find(x => x.race);
    assert.ok(e);
    assert.equal(G.cepName(e), 'Fromage « Normande des Prés »');
    assert.ok(G.cepRanks(e.id)[2] >= 1, 'en or');
    // un fromage ordinaire ne prend jamais le lait de race
    m.cep = null;
    assert.ok(G.queueRecipe(i, 'cheese'));
    assert.equal(
        G.varRanks(rv).reduce((a, b) => a + b, 0),
        4,
    );
    // en cave : le nom de la race
    G.ensureCave();
    assert.ok(G.putCepageInCave(0, e.id, 1));
    assert.equal(G.lotName(state.cave.slots[0]), 'Fromage « Normande des Prés »');
});
