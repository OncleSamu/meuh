// 1.92 : revue complète (enchères, statistiques, plats rangés, grandes recettes de bière).
import test from 'node:test';
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { memStore } from './helpers.mjs';
import { state, setStore } from '../../src/core/state.js';
import { setView } from '../../src/core/view.js';
import * as G from '../../src/systems/index.js';
import { RECIPES } from '../../src/data/machines.js';
import { CLASSICS } from '../../src/data/abbey.js';

function farm() {
    setStore(memStore());
    G.loadGame();
    setView({ started: false, tab: 'farm' });
    state.level = 80;
}

test('1.92 : les tourtes et pâtés salés se cuisent à la boulangerie', () => {
    for (const id of ['pigeonPie', 'pheasantPate', 'kidPie']) assert.equal(RECIPES[id].machine, 'bakery', id);
});

test('1.92 : cinq grandes recettes de bière, sans doublon d’ingrédients', () => {
    assert.equal(CLASSICS.length, 5);
    const keys = CLASSICS.map(c => [...c.ings].sort().join('+'));
    assert.equal(new Set(keys).size, 5);
    assert.ok(CLASSICS.find(c => c.id === 'stout').ings.includes('coffee'));
});

test('1.92 : une enchère sans preneur n’a plus d’échéance infinie (Infinity deviendrait null à la sauvegarde)', () => {
    const src = readFileSync(new URL('../../src/systems/cave.js', import.meta.url), 'utf8');
    assert.ok(!/l\.next = Infinity/.test(src));
    assert.equal(JSON.parse(JSON.stringify({ next: Infinity })).next, null);
});

test('1.92 : les statistiques montrent le haras, la brasserie, le comptoir et le labo', () => {
    farm();
    state.stats.foals = 2;
    state.stats.trained = 5;
    state.stats.beerOrders = 3;
    state.stats.clients = 7;
    const labels = G.statsData().groups.flatMap(g => g[1].map(r => r[0]));
    for (const l of ['Poulains nés', 'Entraînements', 'Commandes de bière', 'Clients du comptoir']) assert.ok(labels.includes(l), l);
});
