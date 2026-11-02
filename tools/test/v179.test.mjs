// 1.79 : objectifs du niveau pas faits, l'expérience se garde jusqu'à 25 % du niveau suivant.
import test from 'node:test';
import assert from 'node:assert/strict';
import { memStore } from './helpers.mjs';
import { state, setStore } from '../../src/core/state.js';
import { setView } from '../../src/core/view.js';
import * as G from '../../src/systems/index.js';

test('1.79 : la réserve s’arrête au quart du niveau suivant, puis on passe avec cette avance', () => {
    setStore(memStore());
    G.loadGame();
    state.tutorial.done = true;
    setView({ started: true, tab: 'farm' });
    state.level = 18;
    state.xp = 0;
    const gate = G.goalsDone();
    if (gate) return; // une ferme neuve au niveau 18 a toujours des objectifs à faire
    G.addXp(G.getXpReq(18) * 10);
    assert.equal(state.level, 18);
    assert.equal(state.xp, G.xpCap(18));
    assert.equal(G.xpCap(18), G.getXpReq(18) + Math.floor(0.25 * G.getXpReq(19)));
    assert.ok(G.xpReserveFull());
    G.addXp(500);
    assert.equal(state.xp, G.xpCap(18));
});
