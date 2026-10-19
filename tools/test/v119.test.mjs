import test from 'node:test';
import assert from 'node:assert/strict';
import { state } from '../../src/core/state.js';
import * as G from '../../src/systems/index.js';
import { MASTERY_EXTRA, MASTERY_TIERS } from '../../src/data/progress.js';

test('maîtrise étendue : platine et diamant, la demande baisse moins et reste plus haute', () => {
    G.loadGame();
    state.level = 50;
    const id = 'appleJuice' in state.inventory ? 'appleJuice' : 'juice';
    const t = MASTERY_TIERS[G.masteryKind(id)],
        x = MASTERY_EXTRA[G.masteryKind(id)];
    assert.ok(x[0] > t[2] && x[1] > x[0]);
    state.mastery[id] = t[2];
    assert.equal(G.masteryStars(id), 3);
    assert.equal(G.masteryExtra(id), 0);
    const p0 = G.masteryMult(id),
        d0 = G.dropPer(id);
    state.mastery[id] = x[0];
    assert.equal(G.masteryExtra(id), 1);
    assert.ok(G.masteryMult(id) > p0);
    assert.ok(G.dropPer(id) < d0);
    state.mastery[id] = x[1];
    assert.equal(G.masteryExtra(id), 2);
    assert.equal(G.demandFloor(id), 0.55);
    // vendre beaucoup ne fait jamais descendre la demande sous le plancher, ni ne la relève
    state.inventory[id] = 5000;
    state.market.f[id] = 1;
    G.sellBatch(id, 5000, true);
    assert.ok(state.market.f[id] >= 0.55 - 1e-9 && state.market.f[id] <= 1);
    state.mastery[id] = t[2];
    state.inventory[id] = 5000;
    state.market.f[id] = 1;
    G.sellBatch(id, 5000, true);
    assert.ok(state.market.f[id] >= 0.25 - 1e-9 && state.market.f[id] < 0.55, 'sans rang, plancher à 25 %');
});
