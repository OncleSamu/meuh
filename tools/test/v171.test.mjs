// 1.71 : les exploits à jour.
import test from 'node:test';
import assert from 'node:assert/strict';
import { memStore } from './helpers.mjs';
import { state, setStore } from '../../src/core/state.js';
import { setView } from '../../src/core/view.js';
import * as G from '../../src/systems/index.js';
import { ACHIEVEMENTS } from '../../src/data/meta.js';
import { ACH_REWARDS } from '../../src/data/progress.js';

function farm(lvl) {
    setStore(memStore());
    G.loadGame();
    setView({ started: false, tab: 'farm' });
    state.level = lvl;
}

test('1.71 : 39 exploits, des paliers croissants, des ids uniques', () => {
    assert.equal(ACHIEVEMENTS.length, 39);
    assert.equal(new Set(ACHIEVEMENTS.map(a => a.id)).size, 39);
    for (const a of ACHIEVEMENTS) assert.ok(a.tiers[0] < a.tiers[1] && a.tiers[1] < a.tiers[2], a.id);
});

test('1.71 : la récompense suit le niveau, jamais moins qu’avant', () => {
    farm(1);
    for (let t = 0; t < 3; t++) {
        assert.ok(G.achReward(t).coins >= ACH_REWARDS[t].coins);
        assert.ok(G.achReward(t).xp >= ACH_REWARDS[t].xp);
    }
    farm(64);
    assert.ok(G.achReward(2).coins > 2e6);
    assert.equal(G.achReward(2).ruban, 2);
    const r0 = state.prestige.rubans;
    state.stats.beers = 30;
    assert.ok(G.claimAchievement('beers'));
    assert.equal(state.prestige.rubans, r0);
    state.stats.beers = 400;
    assert.ok(G.claimAchievement('beers'));
    assert.equal(state.prestige.rubans, r0 + 1);
});

test('1.71 : les valeurs calculées (produits adorés, miels, contrées)', () => {
    farm(64);
    G.ensureVillagers();
    for (const v of ['gaston', 'lucie', 'paul']) state.villagers[v].love = true;
    const a = ACHIEVEMENTS.find(x => x.id === 'lovesFound');
    assert.equal(G.achValue(a), 3);
    assert.ok(G.achClaimable(a));
    state.stats.honeyKinds = { lavender: 3, fir: 1, argan: 2 };
    assert.equal(G.achValue(ACHIEVEMENTS.find(x => x.id === 'honeyKinds')), 3);
    Object.assign(state.stats, { islandHarvest: 20, oasisHarvest: 20, nordHarvest: 10 });
    assert.equal(G.achValue(ACHIEVEMENTS.find(x => x.id === 'landHarvest')), 50);
});
