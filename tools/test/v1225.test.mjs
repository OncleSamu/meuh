import test from 'node:test';
import assert from 'node:assert/strict';
import { clock } from './helpers.mjs';
import { state } from '../../src/core/state.js';
import * as G from '../../src/systems/index.js';
import { CARGO } from '../../src/data/commerce.js';

test('1.22.5 : un avion reparti ne revient pas si la Réception allonge le séjour', () => {
    G.loadGame();
    state.level = 40;
    state.domaine = {};
    const every = CARGO.every;
    clock.t = Math.floor(clock.t / every) * every + 1000; // début de période
    G.cargoTick();
    assert.ok(G.cargoHere(), 'là au début');
    clock.t += CARGO.stay + 60000; // il est reparti
    G.cargoTick();
    assert.equal(G.cargoHere(), false);
    state.domaine = { guests: 5 }; // la Réception allonge le séjour : il n'est plus censé être là
    G.cargoTick();
    assert.equal(G.cargoHere(), false, 'pas de retour dans la même période');
    clock.t += every; // période suivante
    G.cargoTick();
    assert.ok(G.cargoHere(), 'revient à la période suivante');
});
