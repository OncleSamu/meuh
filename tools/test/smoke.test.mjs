import test from 'node:test';
import assert from 'node:assert/strict';
import { clock } from './helpers.mjs';
import { state } from '../../src/core/state.js';
import { setView } from '../../src/core/view.js';
import { loadGame, gameTick, offlineProgress } from '../../src/systems/game.js';
import { doPlotAction, plotAction } from '../../src/systems/farm.js';
import { sellAll } from '../../src/systems/market.js';

test('une partie neuve se charge et tourne une heure sans erreur', () => {
    loadGame();
    setView({ started: true, tab: 'farm' });
    state.tutorial.done = true;
    assert.equal(state.level, 1);
    assert.equal(state.money, 100);
    // labourer et planter du blé sur les parcelles de départ
    state.selectedTool = 'wheat';
    for (let i = 0; i < 6; i++) {
        doPlotAction(i, plotAction(state.grid[i], 'wheat', i));
        doPlotAction(i, plotAction(state.grid[i], 'wheat', i));
        doPlotAction(i, plotAction(state.grid[i], 'wheat', i));
    }
    assert.ok(state.grid.slice(0, 6).every(p => p.itemId === 'wheat'));
    for (let s = 0; s < 3600; s++) {
        clock.t += 1000;
        gameTick();
        for (let i = 0; i < 6; i++) {
            const a = plotAction(state.grid[i], 'wheat', i);
            if (a === 'harvest' || a === 'water' || a === 'plant') doPlotAction(i, a);
        }
        if (s % 120 === 0) sellAll();
    }
    assert.ok(state.stats.harvested > 20, 'des récoltes : ' + state.stats.harvested);
    assert.ok(state.level >= 2, 'niveau ' + state.level);
});

test('l’absence fait avancer la ferme', () => {
    state.lastSaved = clock.t;
    clock.t += 3 * 3600 * 1000;
    const r = offlineProgress();
    assert.ok(r && r.elapsed >= 3 * 3600 - 1);
    assert.ok(Array.isArray(r.lines));
});
