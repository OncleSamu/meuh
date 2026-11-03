// 1.81 : la viande plus facile (15 %, ration d'engraissement, « Bon éleveur ») et de la qualité du produit ramassé.
import test from 'node:test';
import assert from 'node:assert/strict';
import { memStore } from './helpers.mjs';
import { state, setStore } from '../../src/core/state.js';
import { setView } from '../../src/core/view.js';
import * as G from '../../src/systems/index.js';
import { EXTRA_DROP, ANIMALS } from '../../src/data/animals.js';
import { RECIPES, MACHINES } from '../../src/data/machines.js';
import { ITEMS } from '../../src/data/items.js';
import { CARNET } from '../../src/data/carnet.js';
import { SPR } from '../../src/art/index.js';
import { PRODUCTS_181, RECIPES_181 } from '../../src/data/ajouts/seconds.js';

function farm() {
    setStore(memStore());
    G.loadGame();
    setView({ started: false, tab: 'animals' });
    state.level = 30;
    const a = G.newAnimal('cow');
    a.adult = true;
    state.animals = [a];
    return a;
}

test('1.81 : la ration se fait au moulin, se donne à une bête à viande et dure 2 h', () => {
    const a = farm();
    assert.ok(RECIPES.ration && RECIPES.ration.machine === 'mill');
    assert.equal(EXTRA_DROP.chance, 0.15);
    state.inventory.ration = 1;
    assert.ok(G.giveMeatRation(a));
    assert.equal(state.inventory.ration, 0);
    assert.ok(G.meatRationOn(a));
    assert.ok(G.meatRationLeftMs(a) > 1.9 * 3600000);
    assert.equal(G.giveMeatRation(a), false);
    // toutes les bêtes ont un second produit : la poule aussi prend la ration
    const hen = G.newAnimal('chicken');
    state.inventory.ration = 1;
    assert.ok(G.giveMeatRation(hen));
    assert.equal(G.giveMeatRation(hen), false);
});

test('1.81 : chaque bête a un second produit, chacun a au moins trois recettes', () => {
    for (const a of Object.values(ANIMALS)) assert.ok(a.extra && ITEMS[a.extra], `${a.id} sans second produit`);
    for (const [id] of PRODUCTS_181) {
        const n = Object.values(RECIPES).filter(r => r.ing[id]).length;
        assert.ok(n >= 3, `${id} : ${n} recettes`);
    }
    for (const [id, , machine] of RECIPES_181) {
        const r = RECIPES[id];
        assert.ok(r && r.machine === machine && ITEMS[id].sell > 0, id);
        assert.ok(SPR.item(id).length > 300, `${id} : dessin`);
        assert.ok(CARNET[id], `${id} : anecdote`);
        assert.ok(r.lvl >= MACHINES[machine].reqLvl, `${id} avant sa machine`);
    }
    for (const [id] of PRODUCTS_181) assert.ok(SPR.item(id).length > 300, `${id} : dessin`);
    // les bêtes de l'oasis et du Nord donnent des produits qui restent chez elles
    assert.equal(ITEMS.zebuBeef.needProject, 'oasisPen');
    assert.equal(ITEMS.muskoxMeat.needProject, 'northStable');
});

test('1.81 : le compost du cheval n’a pas de qualité ; Yvette ne vend que de la viande', () => {
    farm();
    state.qmade = {};
    const h = G.newAnimal('horse');
    h.stack = 30;
    h.ready = true;
    G.collectAnimal(h);
    assert.ok(!state.qmade.fertilizer);
    const yv = G.specialtyOf(2);
    for (const id of ['whey', 'goatHorn', 'royalFleece', 'royalJelly', 'fertilizer']) assert.ok(!yv.includes(id), id);
});

test('1.81 : avec la ration, bien plus de viande ; elle prend la qualité du produit', () => {
    const a = farm();
    let plain = 0,
        fed = 0;
    for (let k = 0; k < 200; k++) {
        a.stack = 10;
        state.inventory.milk = 0;
        state.inventory.beef = 0;
        plain += G.collectAnimal(a).extra;
    }
    a.ration = Date.now() + 3600000;
    for (let k = 0; k < 200; k++) {
        a.stack = 10;
        state.inventory.milk = 0;
        state.inventory.beef = 0;
        fed += G.collectAnimal(a).extra;
    }
    assert.ok(fed > plain * 2, `${plain} → ${fed}`);
});
