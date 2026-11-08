// 1.93 : le livre garde le journal des grands défis.
import test from 'node:test';
import assert from 'node:assert/strict';
import { memStore } from './helpers.mjs';
import { state, setStore } from '../../src/core/state.js';
import { setView } from '../../src/core/view.js';
import { setClock } from '../../src/core/clock.js';
import * as G from '../../src/systems/index.js';
import { DEFI } from '../../src/data/defis.js';

let T = Date.UTC(2026, 10, 8, 10, 0, 0);
function farm() {
    setClock(() => T);
    setStore(memStore());
    G.loadGame();
    setView({ started: false, tab: 'farm' });
    state.level = 64;
}

test('1.93 : un défi terminé sans médaille laisse une ligne dans le journal', () => {
    farm();
    G.startDefi('chateau');
    T += (DEFI.days + 1) * 86400000;
    G.defiTick();
    const h = G.defiHistory('chateau');
    assert.equal(h.length, 1);
    assert.equal(h[0].medal, 0);
    assert.equal(G.curDefi(), null);
});

test('1.93 : un défi médaillé laisse une ligne avec sa médaille, une seule fois', () => {
    farm();
    G.startDefi('chateau');
    const d = G.curDefi();
    d.steps.slice(0, 2).forEach(st => (st.done = true));
    T += (DEFI.days + 1) * 86400000;
    G.defiTick();
    G.defiTick();
    const h = G.defiHistory('chateau');
    assert.equal(h.length, 1);
    assert.equal(h[0].medal, 1);
    assert.equal(h[0].steps, 2);
});

test('1.93 : une ancienne sauvegarde sans journal en reçoit un, et le journal reste borné', () => {
    farm();
    state.defis = { cur: null, recent: [], trophies: { chateau: { best: 3, n: 2, gold: 1 } }, next: 0 };
    assert.deepEqual(G.defiHistory('chateau'), []);
    assert.deepEqual(state.defis.history, []);
    for (let k = 0; k < 230; k++) {
        G.startDefi('chateau');
        T += (DEFI.days + 1) * 86400000;
        G.defiTick();
    }
    assert.ok(state.defis.history.length <= 200);
});
