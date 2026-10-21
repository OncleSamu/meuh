import test from 'node:test';
import assert from 'node:assert/strict';
import { state } from '../../src/core/state.js';
import { on } from '../../src/core/bus.js';
import * as G from '../../src/systems/index.js';
import { SHOW, STUD, DRESSAGE } from '../../src/data/haras.js';

const stable = (n = 4, apt = 60) => {
    G.loadGame();
    state.level = 50;
    state.money = 1e9;
    for (const id of ['plank', 'beam', 'nail', 'stone', 'paint']) state.inventory[id] = 999;
    state.animals = [];
    for (let i = 0; i < n; i++) {
        const a = G.newAnimal('horse');
        a.adult = true;
        state.animals.push(a);
    }
    G.ensureGenetics();
    G.ensurePastures();
    G.upgradeStable();
    state.animals.forEach(a => {
        G.lodge(a.uid);
        for (const d of SHOW.rot) G.rec(a).pts[d] = apt;
    });
    G.ensureShow();
    return state.animals;
};
const endWeek = () => state.show.entries.forEach(e => (e.key = 'old'));

test('1.24.3 : trois chevaux différents par semaine, pas un quatrième', () => {
    const hs = stable(4);
    assert.ok(G.enterShow(hs[0].uid, 0));
    assert.ok(G.enterShow(hs[1].uid, 0));
    assert.ok(G.enterShow(hs[2].uid, 0));
    assert.equal(G.entriesLeft(), 0);
    assert.ok(!G.enterShow(hs[3].uid, 0));
    // réinscrire le même cheval ne prend pas de place de plus
    assert.ok(G.enterShow(hs[0].uid, 0));
    assert.equal(G.entriesNow().length, 3);
    // retirer rembourse et libère une place
    const m = state.money;
    assert.ok(G.withdrawShow(hs[2].uid));
    assert.equal(state.money, m + G.feeOf(0));
    assert.ok(G.enterShow(hs[3].uid, 0));
});
test('1.24.3 : vos chevaux d’une même division courent entre eux (un seul vainqueur)', () => {
    const hs = stable(3, 100);
    hs.forEach(a => {
        G.enterShow(a.uid, 0);
        G.startShowPass(a.uid);
        G.endShowPass(a.uid, 1);
    });
    endWeek();
    assert.ok(G.showTick());
    const res = G.lastResults();
    assert.equal(res.length, 3);
    assert.deepEqual(res.map(r => r.place).sort(), [1, 2, 3]);
    assert.equal(state.show.rose[0], 2); // 1er et 2e
    assert.equal(state.show.entries.length, 0);
    assert.ok(G.showUnseen());
    G.showSeen();
    assert.ok(!G.showUnseen());
});
test('1.24.3 : une ancienne inscription unique est reprise', () => {
    stable(1);
    state.show = {
        rose: [0, 0, 0, 0, 0],
        cups: 0,
        wins: 0,
        titles: {},
        div: 0,
        entry: { key: 'x', uid: 'a1', div: 0, disc: 'galop', passage: null, fee: 10 },
        gp: null,
        last: null,
        gpDone: 0,
    };
    G.ensureShow();
    assert.equal(state.show.entries.length, 1);
    assert.equal(state.show.entry, undefined);
});
test('1.24.3 : un cheval doué a un mini-jeu plus facile', () => {
    assert.ok(G.galopRate(0.5, 1) > G.galopRate(0.5, 0));
    const [a1, b1] = G.galopZone(1),
        [a0, b0] = G.galopZone(0);
    assert.ok(b1 - a1 > b0 - a0);
    assert.ok(G.sautDur(0, 1) > G.sautDur(0, 0));
    assert.ok(G.sautWindows(3, 1).perfect > G.sautWindows(3, 0).perfect);
    assert.ok(G.newDressage(1).tol > DRESSAGE.tol && G.newDressage(0).tol < DRESSAGE.tol);
    assert.ok(G.newRaid(3, 1).lim > G.newRaid(3, 0).lim);
    // à 0,5, rien ne change
    assert.equal(G.newDressage(0.5).tol, DRESSAGE.tol);
    assert.deepEqual(G.galopZone(0.5), G.galopZone());
});
test('1.24.3 : la fiche de naissance est annoncée et on peut nommer le poulain', () => {
    const [a, b] = stable(2);
    let got = null;
    on('foal', f => (got = f));
    const baby = G.newAnimal('horse');
    baby.uid = 'foal1';
    baby.g = G.crossGenomes(a.g, b.g).g;
    state.animals.push(baby);
    G.studBorn(baby, a, b);
    assert.equal(got && got.uid, 'foal1');
    assert.ok(G.nameHorse('foal1', '  Éclair de lune '));
    assert.equal(baby.name, 'Éclair de lune');
    assert.ok(!G.nameHorse('foal1', a.name));
    assert.ok(STUD.famous === 3);
});
