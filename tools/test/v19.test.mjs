// 1.9 : la déco dans un coin de parcelle, les lucioles qui ne gênent plus.
import test from 'node:test';
import assert from 'node:assert/strict';
import './helpers.mjs';
import { state } from '../../src/core/state.js';
import { setView } from '../../src/core/view.js';
import * as G from '../../src/systems/index.js';

test('une décoration se pose sur une parcelle plantée, et la culture continue', () => {
    G.loadGame();
    setView({ started: true, tab: 'farm' });
    state.level = 20;
    state.money = 1e6;
    const i = state.grid.findIndex(p => p.isUnlocked);
    const p = state.grid[i];
    Object.assign(p, { terrain: 'plowed', itemId: 'wheat', isReady: false, isWatered: false, growProgress: 0, deco: null });
    state.decorInv.well = 1;
    assert.equal(G.plotAction(p, 'deco:well', i), 'placeDeco');
    state.selectedTool = 'deco:well';
    G.doPlotAction(i, 'placeDeco');
    state.selectedTool = 'hand';
    assert.equal(p.deco, 'well');
    assert.equal(p.itemId, 'wheat', 'le blé est toujours là');
    // le puits arrose sa propre parcelle et ses voisines
    G.wellTick();
    assert.ok(p.isWatered);
    assert.ok(G.nearDeco(i, 'well'));
    // une seconde décoration sur la même parcelle : non
    state.decorInv.gnome = 1;
    assert.equal(G.plotAction(p, 'deco:gnome', i), 'decoHint');
    // récolter, replanter : la décoration reste
    p.isReady = true;
    assert.equal(G.plotAction(p, 'hand', i), 'harvest');
    G.doPlotAction(i, 'harvest');
    assert.equal(p.deco, 'well');
    // parcelle vide : la pelle reprend la décoration
    p.itemId = null;
    assert.equal(G.plotAction(p, 'shovel', i), 'pickDeco');
});

test('les lucioles se ramassent en récoltant la nuit', () => {
    G.ensureNight();
    state.level = 20;
    state.gameTimeMinutes = 23 * 60;
    state.day = 1; // printemps
    if (!G.isNight() || !G.fliesSeason()) return;
    const jar = state.night.jar;
    assert.ok(G.fireflyHarvest());
    assert.equal(state.night.jar, (jar + 1) % 20 === 0 ? 0 : jar + 1);
    state.settings.fireflies = false;
    state.night.flies = [];
    G.nightTick();
    assert.equal(state.night.flies.length, 0, 'plus de lucioles si on les coupe');
});
