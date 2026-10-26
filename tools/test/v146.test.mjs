// 1.46 : le carnet des robes, les associations au pré, les robes des bêtes des voisins.
import test from 'node:test';
import assert from 'node:assert/strict';
import { clock, memStore } from './helpers.mjs';
import { state, setStore } from '../../src/core/state.js';
import { setView } from '../../src/core/view.js';
import * as G from '../../src/systems/index.js';
import { PAIRS, ROBEBOOK } from '../../src/data/elevage.js';

function farm(types, level = 30) {
    setStore(memStore());
    G.loadGame();
    setView({ started: false, tab: 'farm' });
    state.level = level;
    state.animals = types.map(t => {
        const a = G.newAnimal(t);
        a.adult = true;
        a.p = 0;
        return a;
    });
}
const show = (a, kind, v) =>
    (a.g.l[kind] = [
        [v, 1],
        [v, 1],
    ]);

test('le carnet note chaque nouvelle robe visible, une seule fois, avec des pièces', () => {
    farm(['cow', 'cow']);
    const [a, b] = state.animals;
    show(a, 'color', 2);
    show(b, 'pattern', 1);
    const m = state.money;
    const f = G.scanRobes();
    assert.equal(f.length, 2);
    assert.ok(state.money > m);
    assert.ok(G.hasRobe('cow', 'c', 2) && G.hasRobe('cow', 'p', 1));
    assert.equal(G.robeCount('cow'), 2);
    assert.equal(G.scanRobes().length, 0);
});

test('une robe cachée (récessive) ne compte pas', () => {
    farm(['sheep']);
    const [a] = state.animals;
    a.g.l.color = [
        [0, 1],
        [3, 0],
    ];
    assert.equal(G.scanRobes().length, 0);
});

test('une espèce complète donne un ruban', () => {
    farm(['goat']);
    const [a] = state.animals;
    const h = G.ensureHerdbook();
    h.robes.goat = { c: G.ROBE_COLORS.filter(i => i !== 4), p: [...G.ROBE_PATTERNS] };
    show(a, 'color', 4);
    const r = state.prestige.rubans;
    G.scanRobes();
    assert.equal(state.prestige.rubans, r + ROBEBOOK.rubans);
    assert.ok(h.done.goat);
});

test('les associations : les poules avec les vaches pondent plus vite ; dindes et poules se gênent', () => {
    farm(['chicken', 'cow', 'turkey']);
    const [hen, cow, turkey] = state.animals;
    const P = id => PAIRS.find(x => x.id === id);
    assert.ok(Math.abs(G.assocMult(hen) - (1 + P('hensCows').f)) < 1e-9);
    assert.equal(G.assocMult(cow), 1);
    assert.ok(Math.abs(G.assocMult(turkey) - (1 + P('turkeysHens').f)) < 1e-9);
    // dans un autre pré, plus d'effet
    clock.t += 2000;
    cow.p = 1;
    state.pastures.push({ name: 'Pré 2' });
    assert.equal(G.assocMult(hen), 1);
    assert.equal(G.pastureAssocs(0).length, 1);
});

test('une association rencontrée entre au carnet', () => {
    farm(['sheep', 'alpaca']);
    clock.t += 2000;
    const f = G.scanAssocs();
    assert.deepEqual(
        f.map(x => x.id),
        ['alpacaSheep'],
    );
    assert.equal(G.scanAssocs().length, 0);
});

test('avant le niveau des associations, aucun effet', () => {
    farm(['chicken', 'cow'], 5);
    clock.t += 2000;
    assert.equal(G.assocMult(state.animals[0]), 1);
});

test('les bêtes de choix des voisins : souvent une robe visible, plus chère', () => {
    let looks = 0;
    for (let k = 0; k < 40; k++) {
        farm(['cow']);
        clock.t += 24 * 3600 * 1000;
        for (const o of G.neighborBeasts()) {
            if (!o.look) continue;
            looks++;
            const l = G.looksOf(o.a.g);
            assert.ok(l.color || l.pattern);
        }
    }
    assert.ok(looks > 30, String(looks));
});

// ---------------- 1.47 : les variétés dans les carnets du potager et du verger ----------------
test('une variété colorée entre au carnet du potager (ou du verger pour un arbre)', () => {
    farm([], 45);
    G.ensureGenetics();
    const g = G.wildPlant('carrot');
    g.l.color = [
        [6, 1],
        [6, 1],
    ];
    const t = G.wildPlant('apple');
    t.l.pattern = [
        [2, 1],
        [2, 1],
    ];
    state.genetics.vars = { v1: { id: 'v1', base: 'carrot', g, gen: 1 }, v2: { id: 'v2', base: 'apple', g: t, gen: 1 } };
    const m = state.money;
    const f = G.scanPlantRobes();
    assert.equal(f.length, 2);
    assert.ok(state.money > m);
    assert.ok(G.hasPlantRobe('carrot', 'c', 6) && G.hasPlantRobe('apple', 'p', 2));
    assert.deepEqual(G.plantBookTypes('crop'), ['carrot']);
    assert.deepEqual(G.plantBookTypes('tree'), ['apple']);
    assert.equal(G.scanPlantRobes().length, 0);
});

test('le concours du potager remplace tout de suite un ancien Salon sur un critère de bête', () => {
    farm([], 45);
    G.ensureGenetics();
    state.projects.pollination = { done: true };
    state.genetics.salon = { k: Math.floor(clock.t / (2 * 24 * 3600 * 1000)), crit: 'coat', end: clock.t + 1e8, rivals: [], entry: null, paid: false };
    G.ensureSalon();
    assert.equal(G.salonCrit().kind, 'plant');
});
