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

// ---------------- la foire aux bestiaux ----------------
import { FAIR, REPUTATION } from '../../src/data/elevage.js';
import { ANIMALS } from '../../src/data/animals.js';

test('la foire se remplit à l’ouverture, puis un acheteur toutes les 3 heures', () => {
    farm(['cow', 'cow', 'chicken']);
    G.fairTick();
    assert.equal(state.elevage.buyers.length, G.fairSlots());
    state.elevage.buyers.shift();
    G.fairTick();
    assert.equal(state.elevage.buyers.length, G.fairSlots() - 1);
    clock.t += FAIR.every + 1000;
    G.fairTick();
    assert.equal(state.elevage.buyers.length, G.fairSlots());
    // chacun reste un jour
    clock.t += FAIR.stay + 1000;
    G.fairTick();
    assert.ok(state.elevage.buyers.every(b => b.until > clock.t));
});

test('le prix : 0,8 × l’espèce, × 1,4 par exigence de gène, × 2 la race, plus la réputation', () => {
    farm(['cow']);
    G.ensureElevage();
    const b = { who: { kind: 'passer', id: 'jura' }, type: 'cow', count: 2, reqs: [{ k: 'gene', trait: 'rich', min: 4 }, { k: 'race' }] };
    assert.equal(G.buyerPrice(b), Math.round((ANIMALS.cow.cost * 0.8 * 1.4 * 2 * 2) / 5) * 5);
    state.elevage.rep = REPUTATION[2].pts;
    assert.equal(G.buyerPrice(b), Math.round((ANIMALS.cow.cost * 0.8 * 1.4 * 2 * 1.1 * 2) / 5) * 5);
});

test('vendre : les bêtes qui conviennent partent (les moins précieuses d’abord), pièces et réputation', () => {
    farm(['cow', 'cow', 'cow']);
    const [a, b, c] = state.animals;
    const rich = v => [
        [v, 1],
        [v, 1],
    ];
    a.g.t.rich = rich(5);
    b.g.t.rich = rich(4);
    c.g.t.rich = rich(2);
    const e = G.ensureElevage();
    e.buyers = [
        { id: 'x', who: { kind: 'passer', id: 'jura' }, type: 'cow', count: 1, reqs: [{ k: 'gene', trait: 'rich', min: 4 }], until: clock.t + FAIR.stay },
    ];
    assert.deepEqual(
        G.buyerMatches(e.buyers[0]).map(x => x.name),
        [b.name, a.name],
    );
    const m0 = state.money;
    const price = G.sellToBuyer('x');
    assert.ok(price > 0 && state.money === m0 + price);
    assert.ok(!state.animals.includes(b) && state.animals.includes(a) && state.animals.includes(c));
    assert.ok(G.elevRepPts() >= 2);
    assert.equal(state.elevage.buyers.length, 0);
});

test('une demande impossible ne vend rien', () => {
    farm(['goat']);
    const e = G.ensureElevage();
    e.buyers = [{ id: 'y', who: { kind: 'neighbor', id: 1 }, type: 'goat', count: 2, reqs: [], until: clock.t + FAIR.stay }];
    assert.equal(G.sellToBuyer('y'), false);
    assert.equal(state.animals.length, 1);
});

test('les voisins : une bête de choix par ferme et par jour, avec un bon gène', () => {
    farm(['cow']);
    state.money = 10_000_000;
    const list = G.neighborBeasts();
    assert.equal(list.length, 4);
    for (const o of list) assert.ok(o.traits.every(t => G.animalTrait(o.a, t) > G.animalBase(o.a, t)));
    const n0 = state.animals.length;
    assert.ok(G.buyNeighborBeast(list[0].k));
    assert.equal(state.animals.length, n0 + 1);
    assert.equal(G.buyNeighborBeast(list[0].k), false);
    // le lendemain, de nouvelles bêtes
    clock.t += 24 * H;
    assert.ok(G.neighborBeasts().every(o => !o.sold));
});
