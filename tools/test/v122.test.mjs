import test from 'node:test';
import assert from 'node:assert/strict';
import { state } from '../../src/core/state.js';
import * as G from '../../src/systems/index.js';
import { LOOKS, PLANT_TRAITS, ANIMAL_TRAITS } from '../../src/data/genetics.js';

const fresh = () => {
    G.loadGame();
    state.level = 40;
    G.ensureGenetics();
};

test('1.22 : les génomes sauvages portent les caractères discrets et une finition vide', () => {
    fresh();
    const t = G.wildPlant('tomato');
    for (const tr of PLANT_TRAITS.filter(x => x.extra)) assert.ok(t.t[tr.id], tr.id);
    assert.equal(G.traitOf(t, 'regrow'), 3, 'la tomate repousse déjà');
    assert.equal(G.traitOf(G.wildPlant('wheat'), 'regrow'), 0);
    const a = G.wildAnimal('cow', true);
    for (const tr of ANIMAL_TRAITS.filter(x => x.extra)) assert.ok(a.t[tr.id], tr.id);
    assert.equal(G.looksOf(a).finish, 0);
});

test('1.22 : les vieux génomes sont complétés au chargement', () => {
    fresh();
    const g = G.wildPlant('carrot');
    delete g.t.regrow;
    delete g.l.finish;
    state.genetics.vars.v1 = { id: 'v1', kind: 'plant', base: 'carrot', g };
    G.ensureGenetics();
    assert.ok(g.t.regrow && g.l.finish);
});

test('1.22 : les mutations donnent de nouvelles apparences valides, les finitions restent rares', () => {
    fresh();
    const P = G.wildPlant('carrot'),
        A = G.wildAnimal('cow', false);
    const seen = new Set();
    let fin = 0;
    for (let i = 0; i < 4000; i++) {
        for (const base of [P, A]) {
            const { g } = G.crossGenomes(base, base, 1);
            const l = G.looksOf(g);
            assert.ok(l.size < LOOKS.size.length && l.color < LOOKS.color.length && l.pattern < LOOKS.pattern.length && l.finish < LOOKS.finish.length);
            if (base === A) assert.notEqual(l.size, 6, 'pas de gros fruit sur une bête');
            if (l.finish) fin++;
            seen.add(l.color + ':' + l.pattern);
        }
    }
    assert.ok(fin > 0 && fin < 8000 * 0.2, 'finitions rares : ' + fin);
    assert.ok(
        [...seen].some(s => +s.split(':')[0] >= 7),
        'couleurs nouvelles',
    );
});

test('1.22 : effets des caractères discrets', () => {
    fresh();
    const g = G.wildPlant('wheat');
    g.t.regrow = [
        [5, 1],
        [5, 1],
    ];
    g.t.pest = [
        [5, 1],
        [5, 1],
    ];
    state.genetics.vars.vx = { id: 'vx', kind: 'plant', base: 'wheat', g };
    let r = 0,
        p = 0;
    for (let i = 0; i < 2000; i++) {
        if (G.varRegrow('vx')) r++;
        if (G.varPestGuard('vx')) p++;
    }
    assert.ok(r > 600 && r < 1000, 'repousse ~40 % : ' + r);
    assert.ok(p > 1000 && p < 1400, 'anti-nuisibles ~60 % : ' + p);
    const a = { type: 'cow', g: G.wildAnimal('cow', false) };
    assert.equal(G.animalFertile(a, a), 0);
    a.g.t.fertile = [
        [4, 1],
        [4, 1],
    ];
    assert.ok(Math.abs(G.animalFertile(a, a) - 0.2) < 1e-9);
});

test('1.22 : la note de robe compte les apparences rares', () => {
    fresh();
    const crit = { trait: 'looks' };
    const base = G.wildAnimal('cow', false);
    const rare = G.wildAnimal('cow', false);
    rare.l.color = [
        [9, 1],
        [9, 1],
    ];
    rare.l.finish = [
        [3, 1],
        [3, 1],
    ];
    assert.ok(G.salonScore(crit, { g: rare }) > G.salonScore(crit, { g: base }) + 2);
});

test('1.22 : un contrat de saison dure au moins 13 jours, même en fin de saison', () => {
    fresh();
    state.level = 40;
    state.day = 12; // dernier jour de la saison
    state.contract = null;
    assert.ok(G.ensureContract());
    assert.ok(G.contractDaysLeft(state.contract) >= 13);
    state.day += 5;
    assert.equal(G.ensureContract(), false, 'toujours le même contrat');
    state.day = state.contract.endDay + 1;
    assert.ok(G.ensureContract(), 'un nouveau après la fin');
    // ancien contrat sans fin : il reçoit le délai minimal
    state.contract = { key: 0, item: 'wheat', qty: 10, given: 0, done: false, coins: 1, xp: 1 };
    state.day = 12;
    G.ensureContract();
    assert.ok(state.contract.endDay >= 25);
});
