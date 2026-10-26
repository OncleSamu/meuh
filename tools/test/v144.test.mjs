// 1.44 : une sauvegarde abîmée se répare depuis la copie de secours, et une vieille ferme se recharge à l'identique.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { clock, memStore } from './helpers.mjs';
import { state, setStore, SAVE_KEY, BACKUP_KEY, BROKEN_KEY, writeSave } from '../../src/core/state.js';
import { loadGame } from '../../src/systems/game.js';
import * as G from '../../src/systems/index.js';

const OLD = readFileSync(new URL('./fixtures/save-6.2.json', import.meta.url), 'utf8');

function farmWithBackup() {
    const store = memStore();
    setStore(store);
    loadGame();
    state.money = 12345;
    state.level = 9;
    writeSave();
    G.pushBackup(true);
    return store;
}

test('une sauvegarde tronquée (coupure en pleine écriture) revient depuis la copie de secours', () => {
    const store = farmWithBackup();
    const raw = store.getItem(SAVE_KEY);
    store.setItem(SAVE_KEY, raw.slice(0, raw.length / 2));
    const fresh = loadGame();
    assert.equal(fresh, false);
    assert.equal(state.money, 12345);
    assert.equal(state.level, 9);
    assert.ok(G.loadIssue && G.loadIssue.restored);
    // la sauvegarde abîmée est gardée de côté, jamais effacée
    assert.equal(store.getItem(BROKEN_KEY), raw.slice(0, raw.length / 2));
});

test('une sauvegarde qui fait planter le chargement revient aussi depuis la copie', () => {
    const store = farmWithBackup();
    store.setItem(SAVE_KEY, JSON.stringify({ grid: 'pas une grille', money: 'beaucoup' }));
    loadGame();
    assert.equal(state.money, 12345);
    assert.ok(G.loadIssue && G.loadIssue.restored);
});

test('sans copie lisible : nouvelle ferme, et la sauvegarde abîmée reste de côté', () => {
    const store = memStore();
    setStore(store);
    store.setItem(SAVE_KEY, '{"grid":[');
    store.setItem(BACKUP_KEY, 'n’importe quoi');
    const fresh = loadGame();
    assert.equal(fresh, true);
    assert.ok(G.loadIssue && G.loadIssue.lost);
    assert.equal(store.getItem(BROKEN_KEY), '{"grid":[');
});

test('une partie normale ne signale rien', () => {
    farmWithBackup();
    loadGame();
    assert.equal(G.loadIssue, null);
});

test('une vieille ferme (6.2) se recharge à l’identique une fois mise à jour', () => {
    const store = memStore();
    setStore(store);
    store.setItem(SAVE_KEY, OLD);
    clock.t = JSON.parse(OLD).lastSaved + 1000;
    loadGame();
    writeSave();
    const once = store.getItem(SAVE_KEY);
    loadGame();
    writeSave();
    assert.equal(store.getItem(SAVE_KEY), once);
});

test('la grange : la peinture ne monte qu’à partir du troisième agrandissement', () => {
    assert.equal(G.barnUpCost(0).paint, 1);
    assert.equal(G.barnUpCost(1).paint, 1);
    assert.equal(G.barnUpCost(2).paint, 2);
    assert.equal(G.barnUpCost(5).paint, 5);
});
