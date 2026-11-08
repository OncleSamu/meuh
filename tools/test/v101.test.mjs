// 1.101 : les commandes du village vont à des villageois différents, et la cave a ses propres icônes.
import test from 'node:test';
import assert from 'node:assert/strict';
import { memStore } from './helpers.mjs';
import { state, setStore } from '../../src/core/state.js';
import { setView } from '../../src/core/view.js';
import { setClock } from '../../src/core/clock.js';
import * as G from '../../src/systems/index.js';
import { CAVE_GEAR } from '../../src/data/cave.js';
import { art } from '../../src/ui/icons.js';

test('1.101 : pas deux commandes ouvertes pour le même villageois', () => {
    setClock(() => Date.UTC(2026, 10, 8, 12));
    setStore(memStore());
    G.loadGame();
    setView({ started: false, tab: 'farm' });
    state.level = 40;
    for (let k = 0; k < 40; k++) {
        const qs = [];
        for (let i = 0; i < 6; i++) {
            state.quests = qs.slice();
            const o = G.makeOrder();
            if (o) qs.push(o);
        }
        const ids = qs.map(q => q.vid);
        assert.equal(new Set(ids).size, ids.length);
    }
});

test('1.101 : chaque équipement de la cave a son icône', () => {
    const icons = Object.values(CAVE_GEAR).map(g => g.icon);
    assert.equal(new Set(icons).size, icons.length);
    for (const i of icons) assert.ok(art('ui', i).includes('<'), i);
});
