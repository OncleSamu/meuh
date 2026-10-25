// 1.43 : la pêche en plusieurs tirages, le record ; le comptoir (séries, gestes).
import test from 'node:test';
import assert from 'node:assert/strict';
import { clock } from './helpers.mjs';
import { state } from '../../src/core/state.js';
import { setView } from '../../src/core/view.js';
import * as G from '../../src/systems/index.js';
import { BREW } from '../../src/data/counter.js';

const fight = id => {
    G.loadGame();
    setView({ started: false, tab: 'farm' });
    state.level = 60;
    G.ensurePond();
    const f = G.fishing;
    Object.assign(f, {
        phase: 'reel',
        id,
        spot: 'bank',
        bait: null,
        width: 0.3,
        t0: clock.t,
        speed: 1,
        fight: 'calm',
        need: G.fightStops(id),
        got: 0,
        miss: 0,
        allPerfect: true,
    });
    return f;
};
const hit = f => (f.center = G.reelPos());
const miss = f => (f.center = G.reelPos() > 0.5 ? 0.15 : 0.85);

test('un esturgeon demande trois tirages, un gardon un seul', () => {
    assert.equal(G.fightStops('roach'), 1);
    assert.equal(G.fightStops('trout'), 2);
    assert.equal(G.fightStops('sturgeon'), 3);
    const f = fight('sturgeon');
    const n = state.inventory.sturgeon;
    hit(f);
    G.fishAction();
    assert.equal(f.phase, 'reel');
    assert.equal(f.got, 1);
    hit(f);
    G.fishAction();
    hit(f);
    G.fishAction();
    assert.equal(f.phase, 'idle');
    assert.equal(state.inventory.sturgeon, n + 1);
});

test('un raté tend la ligne, deux la cassent', () => {
    const f = fight('pike');
    const n = state.inventory.pike;
    miss(f);
    G.fishAction();
    assert.equal(f.phase, 'reel', 'la ligne tient');
    assert.equal(f.miss, 1);
    miss(f);
    G.fishAction();
    assert.equal(f.phase, 'idle');
    assert.equal(state.inventory.pike, n, 'il s’est échappé');
});

test('un nouveau record est signalé', () => {
    const f = fight('roach');
    state.collection.f_roach = { n: 3, best: 0.11 };
    hit(f);
    G.fishAction();
    assert.equal(f.phase, 'idle');
    assert.equal(G.fishing.last.record, G.fishing.last.w > 0.11);
});

test('comptoir : la série de boissons parfaites fait monter le pourboire', () => {
    G.loadGame();
    state.level = 60;
    const C = G.ensureCounter();
    C.streak = 0;
    assert.equal(G.streakMult(), 1);
    C.streak = 3;
    assert.ok(Math.abs(G.streakMult() - 1.2) < 1e-9);
    C.streak = 20;
    assert.ok(Math.abs(G.streakMult() - 1.5) < 1e-9);
});

test('comptoir : presque chaque boisson a sa propre suite de gestes', () => {
    const combos = new Set(Object.values(BREW).map(b => b.st.map(s => s[0]).join('+')));
    assert.ok(combos.size >= 15, `${combos.size} combinaisons`);
    const plain = Object.values(BREW).filter(b => b.st.map(s => s[0]).join('+') === 'temp+steep').length;
    assert.ok(plain <= 6, `${plain} boissons font seulement température et infusion`);
});
