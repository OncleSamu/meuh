// 1.101.4 : les résidents ont cinq cœurs, comme les villageois ; ceux déjà installés rattrapent leurs histoires.
import test from 'node:test';
import assert from 'node:assert/strict';
import { memStore } from './helpers.mjs';
import { state, setStore } from '../../src/core/state.js';
import { setView } from '../../src/core/view.js';
import { setClock } from '../../src/core/clock.js';
import * as G from '../../src/systems/index.js';
import { RESIDENTS } from '../../src/data/campers.js';

const T = Date.UTC(2026, 10, 9, 12);
function farm() {
    setClock(() => T);
    setStore(memStore());
    G.loadGame();
    setView({ started: true, tab: 'farm', hidden: false });
    state.tutorial.done = true;
    state.level = 60;
    state.money = 1e10;
    for (const k of ['plank', 'stone', 'beam', 'tools']) state.inventory[k] = 1000;
    G.buildCamp();
}

test('résidents : cinq cœurs, des histoires à 2, 4 et 5, le préféré à 3', () => {
    assert.equal(RESIDENTS.hearts.length, 5);
    assert.deepEqual(RESIDENTS.stories, [2, 4, 5]);
    assert.equal(RESIDENTS.seen, 3);
});

test('résidents : un résident de la 1.100 (points déjà acquis) rattrape ses histoires et son amitié', () => {
    farm();
    state.camping.res = [];
    state.camping.asks = [{ look: 'a', name: 'Zoé', from: 'de Bretagne', profile: 'hiker', woman: true, job: 'cartographe' }];
    G.resAccept(0);
    const r = G.campRes()[0];
    r.fr = 170; // l'ancien sommet : dix cœurs
    r.stories = [];
    r.seen = false;
    assert.equal(G.resHearts(r), 5);
    assert.equal(G.residentTick(), true);
    assert.equal(r.stories.length, 3);
    assert.equal(r.seen, true);
    assert.equal(state.stats.campFriends, 1);
    assert.equal(G.residentTick(), false); // une seule fois
    assert.equal(state.stats.campFriends, 1);
});
