import test from 'node:test';
import assert from 'node:assert/strict';
import { state } from '../../src/core/state.js';
import * as G from '../../src/systems/index.js';
import { COAT, STUD, SHOW } from '../../src/data/haras.js';
import { sprite } from '../../src/art/index.js';

const coat = o => {
    const c = {};
    for (const k of Object.keys(COAT.freq)) c[k] = [false, false];
    c.belleface = [true, true];
    c.lave = [true, true];
    for (const [k, v] of Object.entries(o)) c[k] = v;
    return c;
};
const horse = () => {
    G.loadGame();
    state.level = 50;
    state.money = 1e9;
    for (const id of ['plank', 'beam', 'nail', 'stone', 'paint']) state.inventory[id] = 999;
    const a = G.newAnimal('horse');
    a.adult = true;
    state.animals = [a];
    G.ensureGenetics();
    G.ensurePastures();
    G.upgradeStable();
    G.lodge(a.uid);
    return a;
};

test('1.24.2 : les gènes donnent les robes attendues', () => {
    const T = [
        [{ E: [true, false], A: [true, true], Br: [true, true] }, 'bai'],
        [{ E: [true, true], A: [true, true] }, 'baibrun'],
        [{ E: [true, true] }, 'noir'],
        [{}, 'alezan'],
        [{ E: [true, true], A: [true, true], Br: [true, true], G: [true, false] }, 'gris'],
        [{ Cr: [true, false] }, 'palomino'],
        [{ Cr: [true, true], E: [true, true] }, 'creme'],
        [{ E: [true, true], A: [true, true], Br: [true, true], Cr: [true, false] }, 'isabelle'],
        [{ E: [true, true], A: [true, true], Br: [true, true], Rn: [true, false] }, 'rouan'],
        [{ Rn: [true, false] }, 'aubere'],
        [{ E: [true, true], A: [true, true], Br: [true, true], D: [false, true] }, 'louvet'],
    ];
    for (const [g, r] of T) assert.equal(G.robeOf(coat(g)), r);
});
test('1.24.2 : marques dominantes, récessives, et ce que la belle face cache', () => {
    const m = o => G.marksOf(coat(o));
    assert.deepEqual(m({ etoile: [true, false] }), ['etoile']);
    assert.deepEqual(m({ etoile: [true, true], liste: [true, false] }), ['liste']);
    assert.deepEqual(m({ liste: [true, true], belleface: [false, false] }), ['belleface']);
    assert.ok(m({ balzanes: [false, true], pie: [true, false] }).includes('pie'));
    assert.ok(m({ lave: [false, false] }).includes('lave')); // alezan
    assert.ok(!m({ E: [true, true], lave: [false, false] }).includes('lave')); // noir
});
test('1.24.2 : un poulain reçoit un allèle de chaque parent', () => {
    const A = coat({ E: [true, true] }),
        B = coat({ E: [false, false] });
    for (let i = 0; i < 20; i++) {
        const c = G.crossCoat(A, B, 0);
        assert.equal(c.E[0], true);
        assert.equal(c.E[1], false);
    }
    // les mutations existent mais restent rares
    let n = 0;
    for (let i = 0; i < 2000; i++) n += G.crossCoat(A, A, 0.05).E.filter(x => !x).length;
    assert.ok(n > 20 && n < 400, String(n));
});
test('1.24.2 : chaque cheval a des gènes de robe ; le croisement en transmet', () => {
    const a = horse();
    assert.ok(a.g.coat);
    const b = G.newAnimal('horse');
    b.adult = true;
    state.animals.push(b);
    G.ensureGenetics();
    const { g } = G.crossGenomes(a.g, b.g);
    assert.ok(g.coat && G.robeOf(g.coat));
    assert.ok(G.coatText(g));
});
test('1.24.2 : le dessin d’un cheval porte sa robe, son âge et son équipement', () => {
    const base = sprite('animal', 'horse');
    const bai = sprite('animal', 'horse~@bai.etoile');
    const gris = sprite('animal', 'horse~@gris.');
    assert.notEqual(bai, gris);
    assert.ok(gris.includes('#c9ced6'));
    assert.notEqual(sprite('animal', 'horse~@bai.etoile.0'), bai);
    assert.notEqual(sprite('animal', 'horseSjump~@bai.'), sprite('animal', 'horseS~@bai.'));
    assert.ok(base.length > 100);
    for (const k of ['hSaillie', 'hRetraite', 'hArbre', 'hEcusson', 'hCouronne', 'hCadre', 'hPoulain']) assert.ok(sprite('ui', k).length > 100, k);
});
test('1.24.2 : la retraite demande un titre Élite, rapporte chaque jour et se limite', () => {
    const a = horse();
    assert.ok(G.retireWhy(a));
    state.show = { rose: [0, 0, 0, 0, 0], cups: 0, wins: 0, titles: {}, best: { [a.uid]: 2 }, div: 0, entry: null, gp: null, last: null, gpDone: 0 };
    assert.ok(G.retireWhy(a));
    state.show.best[a.uid] = STUD.champDiv;
    assert.equal(G.retireWhy(a), '');
    assert.ok(G.retire(a.uid));
    assert.ok(G.isRetired(a) && !a.box);
    assert.ok(!G.lodge(a.uid));
    assert.equal(G.retired().length, 1);
    // un jour de plus : la saillie paie
    const s = G.ensureStud();
    s.day -= 3;
    const m = state.money;
    assert.ok(G.studTick());
    assert.equal(state.money - m, 3 * G.studIncome(a));
    assert.ok(!G.studTick());
});
test('1.24.2 : un poulain d’un reproducteur hérite de points et de la lignée de champions', () => {
    const a = horse();
    const b = G.newAnimal('horse');
    b.adult = true;
    state.animals.push(b);
    G.ensureGenetics();
    state.show = { rose: [0, 0, 0, 0, 0], cups: 0, wins: 0, titles: {}, best: { [a.uid]: 3 }, div: 0, entry: null, gp: null, last: null, gpDone: 0 };
    G.rec(a).spec = 'galop';
    a.chain = 3;
    G.retire(a.uid);
    const baby = G.newAnimal('horse');
    baby.uid = 'ax';
    baby.g = G.crossGenomes(a.g, b.g).g;
    state.animals.push(baby);
    G.studBorn(baby, a, b);
    assert.equal(baby.sire, a.uid);
    assert.equal(baby.pc, 3);
    assert.equal(G.rec(baby).pts.galop, Math.min(G.aptCap(baby, 'galop'), STUD.foalPts));
    // le poulain gagne en Élite : 4e champion de suite, un ruban
    const r0 = state.prestige.rubans || 0;
    assert.equal(G.champWon(baby.uid, 3), STUD.famousRibbons);
    assert.equal(baby.chain, 4);
    assert.equal(G.champWon(baby.uid, 4), 0);
    assert.ok(r0 >= 0 && G.ensureStud().famous === 1);
});
test('1.24.2 : nom d’élevage et collection', () => {
    horse();
    assert.equal(G.studName(), STUD.defaultName);
    assert.ok(G.setStudName('  Les Prés Verts  '));
    assert.equal(G.studName(), 'Les Prés Verts');
    assert.ok(!G.setStudName('   '));
    G.studTick();
    assert.ok(G.robesSeen() >= 1 && G.robesSeen() <= G.robesAll());
    assert.ok(SHOW.divs.length > STUD.champDiv);
});
