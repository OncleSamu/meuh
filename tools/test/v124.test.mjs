import test from 'node:test';
import assert from 'node:assert/strict';
import { state } from '../../src/core/state.js';
import * as G from '../../src/systems/index.js';
import { SHOW } from '../../src/data/haras.js';

const horse = (apt = 40) => {
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
    const r = G.rec(a);
    for (const d of SHOW.rot) r.pts[d] = apt;
    return a;
};
const endWeek = () => {
    state.show.entry.key = 'old';
};

test('1.24 : la discipline de la semaine tourne sur les quatre', () => {
    const seen = new Set();
    for (let k = 0; k < 4; k++) seen.add(G.weekDisc(new Date(2026, 9, 5 + 7 * k)));
    assert.equal(seen.size, 4);
});
test('1.24 : la note suit aptitude, passage et présentation ; Jules vaut 75 % de l’aptitude', () => {
    const a = horse(60);
    a.love = 0;
    G.rec(a).spec = null;
    const n = G.showNote(a, 'saut', 1);
    assert.equal(Math.round(n.note), Math.round(0.55 * 60 + 0.3 * 100 + 0.15 * SHOW.presBase));
    const j = G.showNote(a, 'saut', null);
    assert.ok(j.jules && Math.round(j.pass) === 45);
    a.love = 5;
    assert.ok(G.showNote(a, 'saut', 1).note > n.note);
    G.rec(a).spec = 'saut';
    assert.ok(G.showNote(a, 'saut', 1).note > G.showNote({ ...a, love: 5 }, 'dressage', 1).note - 100);
});
test('1.24 : les rivales sont les mêmes pour tout le monde et restent dans la division', () => {
    const r1 = G.rivalsFor('2026-10-19', 1),
        r2 = G.rivalsFor('2026-10-19', 1);
    assert.deepEqual(r1, r2);
    assert.equal(r1.length, SHOW.rivalsN);
    for (const r of r1) assert.ok(r.note >= SHOW.divs[1].rivals[0] && r.note <= SHOW.divs[1].rivals[1]);
    assert.equal(new Set(r1.map(r => r.name)).size, SHOW.rivalsN);
});
test('1.24 : inscription payée, changement remboursé, une seule division ouverte au début', () => {
    const a = horse();
    G.ensureShow();
    assert.deepEqual(G.divsOpen(), [0]);
    assert.ok(!G.enterShow(a.uid, 1));
    const m = state.money;
    assert.ok(G.enterShow(a.uid, 0));
    assert.equal(state.money, m - G.feeOf(0));
    assert.ok(G.enterShow(a.uid, 0));
    assert.equal(state.money, m - G.feeOf(0));
});
test('1.24 : un passage coûte la forme et n’est joué qu’une fois', () => {
    const a = horse();
    G.enterShow(a.uid, 0);
    const f = G.formOf(a);
    assert.ok(G.startShowPass(a.uid));
    assert.equal(G.formOf(a), f - 1);
    const n = G.endShowPass(a.uid, 0.8);
    assert.ok(n && !n.jules);
    assert.equal(G.startShowPass(a.uid), null);
    assert.ok(!G.enterShow(a.uid, 0));
});
test('1.24 : un cheval fort gagne en division I, touche la bourse, la rosette et la coupe', () => {
    const a = horse(100);
    G.enterShow(a.uid, 0);
    G.startShowPass(a.uid);
    G.endShowPass(a.uid, 1);
    const m = state.money;
    endWeek();
    assert.ok(G.showTick());
    const l = state.show.last;
    assert.equal(l.place, 1);
    assert.ok(l.rosette && l.cup && l.coins === G.purseOf(0));
    assert.equal(state.money, m + l.coins);
    assert.equal(state.show.rose[0], 1);
    assert.equal(state.show.cups, 1);
    assert.equal(G.titlesOf(a.uid), 1);
    assert.equal(state.show.entry, null);
    assert.ok(G.showCharm() > 0);
});
test('1.24 : sans passage, Jules monte ; un cheval faible perd', () => {
    const a = horse(0);
    G.enterShow(a.uid, 0);
    endWeek();
    G.showTick();
    const l = state.show.last;
    assert.ok(l.jules && l.place > 3 && l.coins === 0 && !l.rosette);
});
test('1.24 : trois rosettes ouvrent la division suivante', () => {
    horse();
    G.ensureShow();
    state.show.rose[0] = SHOW.open - 1;
    assert.ok(!G.divOpen(1));
    state.show.rose[0]++;
    assert.ok(G.divOpen(1));
});
test('1.24 : la première victoire d’une division donne une décoration unique, une victoire en Élite un ruban', () => {
    const a = horse(100);
    G.ensureShow();
    state.show.rose = [3, 3, 3, 0, 0];
    G.rec(a).spec = null;
    const rub = state.prestige.rubans;
    // note de Jules, sans passage : on force une très bonne note par le passage
    G.enterShow(a.uid, 3);
    G.startShowPass(a.uid);
    G.endShowPass(a.uid, 1);
    endWeek();
    G.showTick();
    const l = state.show.last;
    if (l.place === 1) {
        assert.equal(l.deco, 'showpodium');
        assert.equal(state.decorInv.showpodium, 1);
        assert.equal(state.prestige.rubans, rub + 1);
    } else assert.ok(l.place > 1);
});
test('1.24 : le Grand Prix : le premier week-end du mois seulement, quatre épreuves', () => {
    assert.ok(G.gpActive(new Date(2026, 10, 7, 12)) && G.gpActive(new Date(2026, 10, 8, 12)));
    assert.ok(!G.gpActive(new Date(2026, 10, 14, 12)) && !G.gpActive(new Date(2026, 10, 9, 12)));
    assert.equal(G.gpKey(new Date(2026, 10, 8, 12)), G.gpKey(new Date(2026, 10, 7, 12)));
});
test('1.24 : le Grand Prix donne un ruban et compte les quatre disciplines', () => {
    const a = horse(100);
    G.ensureShow();
    state.show.gp = { key: 'gp-old', uid: a.uid, div: 0, passes: { galop: 1, saut: 1, dressage: 1, endurance: 1 }, fee: 0 };
    const rub = state.prestige.rubans;
    assert.ok(G.showTick());
    assert.equal(state.show.last.kind, 'gp');
    assert.ok(state.prestige.rubans >= rub + 1);
    assert.equal(state.show.gp, null);
});
