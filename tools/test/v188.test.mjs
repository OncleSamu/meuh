// 1.88 : on choisit les bêtes à vendre à la foire.
import test from 'node:test';
import assert from 'node:assert/strict';
import { clock, memStore } from './helpers.mjs';
import { state, setStore } from '../../src/core/state.js';
import { setView } from '../../src/core/view.js';
import * as G from '../../src/systems/index.js';
import { FAIR } from '../../src/data/elevage.js';

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
    const [first] = state.animals;
    for (const a of state.animals) a.g = JSON.parse(JSON.stringify(first.g));
}
const buyer = count => ({ id: 'x', who: { kind: 'passer', id: 'jura' }, type: 'cow', count, reqs: [], until: clock.t + FAIR.stay });

test('1.88 : sans choix, le jeu propose les moins précieuses ; on peut choisir à la main', () => {
    farm(['cow', 'cow', 'cow']);
    const [a, b, c] = state.animals;
    const e = G.ensureElevage();
    e.buyers = [buyer(1)];
    const auto = G.buyerPicked(e.buyers[0])[0];
    assert.ok(!G.buyerHandPicked(e.buyers[0]));
    // je tiens à la bête proposée : je choisis une autre
    const other = [a, b, c].find(x => x !== auto);
    assert.ok(G.toggleBuyerPick('x', other.uid));
    assert.ok(G.buyerHandPicked(e.buyers[0]));
    assert.deepEqual(
        G.buyerPicked(e.buyers[0]).map(x => x.uid),
        [other.uid],
    );
    assert.ok(G.sellToBuyer('x'));
    assert.ok(!state.animals.includes(other), 'la bête choisie est vendue');
    assert.ok(state.animals.includes(auto), 'celle proposée au départ reste');
});

test('1.88 : plusieurs bêtes : retirer, remplacer, et pas de vente tant que le choix est incomplet', () => {
    farm(['cow', 'cow', 'cow', 'cow']);
    const e = G.ensureElevage();
    e.buyers = [buyer(2)];
    const b = e.buyers[0];
    const [p1, p2] = G.buyerPicked(b);
    // je retire une bête : le choix est incomplet, rien ne se vend
    G.toggleBuyerPick('x', p1.uid);
    assert.equal(G.buyerPicked(b).length, 1);
    const n = state.animals.length;
    assert.equal(G.sellToBuyer('x'), false);
    assert.equal(state.animals.length, n);
    // j'en ajoute deux autres : la plus ancienne choisie cède sa place
    const rest = state.animals.filter(a => a !== p1 && a !== p2);
    G.toggleBuyerPick('x', rest[0].uid);
    G.toggleBuyerPick('x', rest[1].uid);
    const got = G.buyerPicked(b).map(a => a.uid);
    assert.equal(got.length, 2);
    assert.ok(!got.includes(p2.uid), 'p2 a cédé sa place');
    // proposition du jeu : on repart du choix automatique
    G.resetBuyerPick('x');
    assert.ok(!G.buyerHandPicked(b));
    assert.equal(G.buyerPicked(b).length, 2);
});

test('1.88 : une bête qui ne convient pas ne peut pas être choisie', () => {
    farm(['cow', 'goat']);
    const e = G.ensureElevage();
    e.buyers = [buyer(1)];
    assert.equal(G.toggleBuyerPick('x', state.animals[1].uid), false);
    assert.equal(G.toggleBuyerPick('zzz', state.animals[0].uid), false);
});
