// 1.45 : les naissances au pré (L'Élevage).
import test from 'node:test';
import assert from 'node:assert/strict';
import { clock, memStore } from './helpers.mjs';
import { state, setStore } from '../../src/core/state.js';
import { setView } from '../../src/core/view.js';
import * as G from '../../src/systems/index.js';
import { BIRTHS } from '../../src/data/animals.js';

const H = 3600 * 1000;
function farm(types) {
    setStore(memStore());
    G.loadGame();
    setView({ started: false, tab: 'farm' });
    state.level = 20;
    state.animals = types.map(t => {
        const a = G.newAnimal(t);
        a.adult = true;
        a.p = 0;
        return a;
    });
    return state.pastures[0];
}

test('éteintes par défaut : aucun petit sans l’interrupteur', () => {
    const p = farm(['cow', 'cow']);
    assert.ok(!p.births);
    clock.t += 48 * H;
    assert.equal(G.birthsTick().length, 0);
    assert.equal(state.animals.length, 2);
});

test('allumées : un petit arrive à son heure, avec ses parents', () => {
    farm(['cow', 'cow']);
    G.toggleBirths(0);
    G.birthsTick(); // le compte à rebours démarre
    clock.t += G.birthHours('cow') * H - 1000;
    assert.equal(G.birthsTick().length, 0);
    clock.t += 2000;
    const [b] = G.birthsTick();
    assert.ok(b && b.type === 'cow' && b.born === 'pre' && b.adult === false);
    assert.equal(b.parents.length, 2);
    assert.equal(b.p, 0);
});

test('il faut deux adultes de la même espèce ; chevaux et abeilles à part', () => {
    farm(['cow', 'goat', 'horse', 'horse', 'bees', 'bees']);
    G.toggleBirths(0);
    G.birthsTick();
    clock.t += 30 * H;
    assert.equal(G.birthsTick().length, 0);
});

test('une longue absence : au plus quelques petits par espèce, et jamais au-delà de la place du pré', () => {
    farm(['chicken', 'chicken']);
    G.toggleBirths(0);
    G.birthsTick();
    clock.t += 30 * 24 * H;
    assert.equal(G.birthsTick().length, BIRTHS.catchUp);
    farm(Array(19).fill('chicken'));
    G.toggleBirths(0);
    G.birthsTick();
    clock.t += 30 * 24 * H;
    assert.equal(G.birthsTick().length, 1);
    assert.equal(G.pastureFree(0), 0);
});

test('la nature : pas de mutation, et les bons gènes retombent souvent vers la moyenne', () => {
    farm(['cow', 'cow']);
    const [a, b] = state.animals;
    // deux parents excellents (richesse 5 partout)
    for (const x of [a, b])
        x.g.t.rich = [
            [5, 1],
            [5, 1],
        ];
    const n = 400;
    let sum = 0;
    for (let k = 0; k < n; k++) {
        const g = G.naturalGenome(a, b, 'cow');
        sum += G.traitOf(g, 'rich');
        assert.ok(G.traitOf(g, 'rich') <= 5);
    }
    // la moitié des petits perd un point : en moyenne 4,5 environ
    assert.ok(sum / n > 4.3 && sum / n < 4.7, String(sum / n));
});

test('deux parents de la même race fixée : le petit garde la race', () => {
    farm(['goat', 'goat']);
    state.animals.forEach(a => (a.race = 'r1'));
    G.toggleBirths(0);
    G.birthsTick();
    clock.t += 24 * H;
    const [b] = G.birthsTick();
    assert.equal(b.race, 'r1');
});

test('avant le niveau 8, rien', () => {
    farm(['cow', 'cow']);
    state.level = BIRTHS.lvl - 1;
    assert.equal(G.toggleBirths(0), false);
});
