// 1.81 : la viande plus facile (15 %, ration d'engraissement, « Bon éleveur ») et de la qualité du produit ramassé.
import test from 'node:test';
import assert from 'node:assert/strict';
import { memStore } from './helpers.mjs';
import { state, setStore } from '../../src/core/state.js';
import { setView } from '../../src/core/view.js';
import * as G from '../../src/systems/index.js';
import { EXTRA_DROP } from '../../src/data/animals.js';
import { RECIPES } from '../../src/data/machines.js';

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
    const hen = G.newAnimal('chicken');
    state.inventory.ration = 1;
    assert.equal(G.giveMeatRation(hen), false);
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
