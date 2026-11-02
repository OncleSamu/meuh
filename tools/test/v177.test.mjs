// 1.77 : la Ferme légendaire demande dix exploits qui couvrent tout le jeu ; 20 rubans.
import test from 'node:test';
import assert from 'node:assert/strict';
import { memStore } from './helpers.mjs';
import { state, setStore } from '../../src/core/state.js';
import { setView } from '../../src/core/view.js';
import * as G from '../../src/systems/index.js';
import { LEGEND_GOALS, LEGEND_RUBANS } from '../../src/data/meta.js';

test('1.77 : dix exploits, une nouvelle ferme n’en a aucun, une ferme déjà légendaire le reste', () => {
    setStore(memStore());
    G.loadGame();
    setView({ started: false, tab: 'farm' });
    assert.equal(LEGEND_GOALS.length, 10);
    assert.equal(LEGEND_RUBANS, 20);
    const goals = G.legendGoals();
    assert.equal(goals.length, 10);
    assert.ok(goals.every(g => !g.ok && typeof g.v === 'string'));
    assert.equal(G.legendReady(), false);
    state.legend = true;
    assert.equal(G.legendReady(), false);
    assert.equal(G.claimLegend(), false);
});

test('1.77 : chaque exploit se valide', () => {
    setStore(memStore());
    G.loadGame();
    state.cup = { ...(state.cup || {}), pts: 40 };
    state.show = { ...(state.show || {}), best: { h1: 3 } };
    state.cave = { ...(state.cave || {}), legends: { wine: { n: 1 } } };
    for (let k = 0; k < 20; k++) state.villagers['v' + k] = { hearts: 5 };
    const ok = Object.fromEntries(G.legendGoals().map(g => [g.id, g.ok]));
    assert.equal(ok.cup, true);
    assert.equal(ok.haras, true);
    assert.equal(ok.cave, true);
    assert.equal(ok.friends, true);
    assert.equal(ok.level, false);
});
