import { test } from 'node:test';
import assert from 'node:assert/strict';
import { frenchSpaces } from '../../src/ui/typo.js';

test('1.57 : les ? ! : ; et les guillemets collent au mot qui les précède', () => {
    assert.equal(frenchSpaces('Bravo ! Prêt ?'), 'Bravo ! Prêt ?');
    assert.equal(frenchSpaces('Niveau : 64 ; fini'), 'Niveau : 64 ; fini');
    assert.equal(frenchSpaces('dit « oui » ici'), 'dit « oui » ici');
    assert.equal(frenchSpaces('rien à changer'), 'rien à changer');
    assert.equal(frenchSpaces('déjà : fait'), 'déjà : fait');
});

import { clock, memStore } from './helpers.mjs';
import { state, setStore } from '../../src/core/state.js';
import { setView } from '../../src/core/view.js';
import * as G from '../../src/systems/index.js';
import { TIPS } from '../../src/data/texts.js';

function nordNight() {
    setStore(memStore());
    G.loadGame();
    setView({ started: false, tab: 'farm' });
    state.level = 64;
    state.money = 100_000_000;
    for (const id of ['northStove', 'northStable', 'northSled']) state.projects[id] = { given: {}, done: true };
    G.ensureNord();
    Object.assign(state.inventory, { wood: 200, stone: 200, plank: 200, tools: 30 });
    state.gameTimeMinutes = 12 * 60;
    G.buildStove(0);
    G.feedStove(0);
    state.gameTimeMinutes = 23 * 60;
}

test('1.57 : la première aurore va dans l’album, une seule fois', () => {
    nordNight();
    state.nord.auroraAt = clock.t - 1;
    G.nordWeatherTick();
    assert.equal(G.auroraOn(), true);
    assert.equal(state.album.filter(p => p.id === 'noAurore').length, 1);
    state.nord.aurora = null;
    state.nord.auroraAt = clock.t - 1;
    G.nordWeatherTick();
    assert.equal(state.album.filter(p => p.id === 'noAurore').length, 1, 'pas de seconde photo');
});

test('1.57 : un mot de Mamie aux niveaux 61 et 64', () => {
    assert.ok(TIPS.lvl61 && TIPS.lvl64);
    setStore(memStore());
    G.loadGame();
    setView({ started: false, tab: 'farm' });
    state.tutorial.done = true;
    state.level = 60;
    state.xp = 0;
    G.addXp(10_000_000);
    assert.ok(state.tips.lvl61 && state.tips.lvl64);
});
