// 1.80 : les poissons ont une qualité (taille, ferrage parfait, nasses, filet) et une maîtrise.
import test from 'node:test';
import assert from 'node:assert/strict';
import { memStore } from './helpers.mjs';
import { state, setStore } from '../../src/core/state.js';
import { setView } from '../../src/core/view.js';
import * as G from '../../src/systems/index.js';
import { FISH } from '../../src/data/meta.js';

function farm() {
    setStore(memStore());
    G.loadGame();
    setView({ started: false, tab: 'farm' });
    state.level = 30;
    G.ensurePond();
}
const fishId = () => Object.keys(FISH).find(id => !FISH[id].junk && id !== 'goldfish' && FISH[id].w);

test('1.80 : un trophée sort en or, une belle prise parfaite aussi, une petite prise normale', () => {
    farm();
    const id = fishId(),
        [a, b] = FISH[id].w;
    G.landFish(id, b, null, false);
    assert.equal(G.qual(id).g, 1);
    G.landFish(id, a + (b - a) * 0.5, null, true);
    assert.equal(G.qual(id).g, 2);
    G.landFish(id, a, null, false);
    assert.equal(G.qual(id).s, 0);
    assert.equal(G.masteryKind(id), 'fish');
    assert.equal(G.masteryCount(id), 3);
});

test('1.80 : la maîtrise des poissons part des prises déjà faites', () => {
    setStore(memStore());
    G.loadGame();
    const id = fishId();
    state.collection['f_' + id] = { n: 300, best: 1 };
    G.ensurePond();
    delete state.pond.m180;
    G.ensurePond();
    assert.equal(G.masteryCount(id), 300);
    assert.equal(G.masteryStars(id), 2);
});
