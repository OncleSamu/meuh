// 1.78 : un nombre de petits voulus par pré ; atteint, les naissances s'éteignent seules.
import test from 'node:test';
import assert from 'node:assert/strict';
import { clock, memStore } from './helpers.mjs';
import { state, setStore } from '../../src/core/state.js';
import { setView } from '../../src/core/view.js';
import * as G from '../../src/systems/index.js';

const H = 3600 * 1000;
function farm(n) {
    setStore(memStore());
    G.loadGame();
    setView({ started: false, tab: 'farm' });
    state.level = 20;
    state.animals = Array.from({ length: n }, () => {
        const a = G.newAnimal('chicken');
        a.adult = true;
        a.p = 0;
        return a;
    });
    return state.pastures[0];
}

test('1.78 : 3 petits voulus, puis les naissances s’éteignent', () => {
    const p = farm(2);
    G.toggleBirths(0);
    assert.ok(G.setBirthLimit(3));
    assert.equal(G.birthsLeft(0), 3);
    G.birthsTick();
    let born = 0;
    for (let k = 0; k < 20; k++) {
        clock.t += G.birthHours('chicken') * H + 1000;
        born += G.birthsTick().length;
    }
    assert.equal(born, 3);
    assert.equal(p.births, false);
    assert.equal(G.birthsLeft(0), 0);
    // rallumer repart pour 3 de plus
    G.toggleBirths(0);
    assert.equal(G.birthsLeft(0), 3);
});

test('1.78 : sans limite par défaut, et une limite inconnue est refusée', () => {
    farm(2);
    assert.equal(G.birthLimit(), 0);
    assert.equal(G.birthsLeft(0), null);
    assert.equal(G.setBirthLimit(7), false);
});
