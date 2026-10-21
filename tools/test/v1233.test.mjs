import test from 'node:test';
import assert from 'node:assert/strict';
import * as G from '../../src/systems/index.js';
import { DRESSAGE, RAID } from '../../src/data/haras.js';

const trace = (jit = 0, off = 0, rand = Math.random) => {
    const d = G.newDressage();
    for (let guard = 0; !d.done && guard < 10; guard++) {
        const p = d.fig.path;
        G.dressMove(d, p[0][0], p[0][1]);
        for (const q of p) G.dressMove(d, q[0] + off + (rand() - 0.5) * jit, q[1] + off + (rand() - 0.5) * jit);
        G.dressFinishFig(d);
    }
    return d;
};
const raid = (plan, form = 3) => {
    const r = G.newRaid(form);
    for (let k = 0; k < 40000 && !r.done; k++) {
        r.event = null;
        G.setGait(r, plan[Math.min(r.i, plan.length - 1)]);
        G.stepRaid(r, 0.05);
    }
    return r;
};

test('hasGame : les quatre disciplines ont leur mini-jeu', () => {
    for (const d of ['galop', 'saut', 'dressage', 'endurance']) assert.ok(G.hasGame(d), d);
    assert.ok(!G.hasGame('autre'));
});
test('dressage : un tracé parfait donne une très bonne note, quatre figures', () => {
    const d = trace();
    assert.equal(d.scores.length, DRESSAGE.figures.length);
    assert.ok(G.dressageScore(d) > 0.9);
    assert.ok(G.dressageNotes(d).cover > 0.95);
});
test('dressage : plus le doigt s’écarte, plus la note baisse', () => {
    const s = [0, 25, 40].map(o => G.dressageScore(trace(0, o)));
    assert.ok(s[0] > s[1] && s[1] > s[2]);
    assert.ok(s[2] < 0.3);
});
test('dressage : le doigt tremblant perd en régularité', () => {
    let k = 1;
    const rand = () => (k = (k * 16807) % 2147483647) / 2147483647;
    assert.ok(G.dressageNotes(trace(10, 0, rand)).smooth < G.dressageNotes(trace()).smooth);
});
test('dressage : il faut partir du point de départ et on ne peut pas couper', () => {
    const d = G.newDressage();
    const p = d.fig.path;
    G.dressMove(d, 300, 100);
    assert.equal(d.fig.started, false);
    G.dressMove(d, p[0][0], p[0][1]);
    assert.ok(d.fig.started);
    G.dressMove(d, p[p.length - 1][0], p[p.length - 1][1]);
    assert.ok(d.fig.idx <= DRESSAGE.window);
    assert.ok(!G.dressFigDone(d));
});
test('dressage : sans bouger, la figure ne rapporte rien', () => {
    const d = G.newDressage();
    G.dressFinishFig(d);
    assert.equal(d.scores[0], 0);
    assert.equal(d.i, 1);
});
test('raid : trois étapes, les bonnes allures battent les mauvaises', () => {
    const ideal = raid(['galop', 'pas', 'trot']);
    assert.equal(ideal.scores.length, RAID.stages.length);
    assert.ok(ideal.done);
    const s = G.raidScore(ideal);
    assert.ok(s > 0.8);
    for (const bad of [['galop'], ['pas'], ['trot']]) assert.ok(G.raidScore(raid(bad)) < s, bad[0]);
});
test('raid : la forme relève la limite de pouls et aide le trot dans la côte', () => {
    assert.ok(G.raidLimit(5) > G.raidLimit(0));
    assert.ok(G.raidScore(raid(['trot'], 5)) > G.raidScore(raid(['trot'], 0)));
});
test('raid : le pouls monte avec l’allure, la côte l’augmente, le contrôle le fait redescendre', () => {
    const r = G.newRaid(3);
    G.setGait(r, 'galop');
    for (let k = 0; k < 100; k++) G.stepRaid(r, 0.1);
    const plat = r.p;
    assert.ok(plat > RAID.gaits.trot.p);
    assert.ok(G.raidTarget({ ...r, i: 1 }, 'galop') > G.raidTarget(r, 'galop'));
    const r2 = G.newRaid(3);
    G.setGait(r2, 'trot');
    let ev = null;
    for (let k = 0; k < 5000 && !ev; k++) {
        G.stepRaid(r2, 0.05);
        ev = r2.event;
    }
    assert.ok(ev && r2.p < ev.pulse);
    assert.equal(r2.i, 1);
});
test('raid : au-dessus de la limite, le cheval ralentit', () => {
    const r = G.newRaid(0);
    r.p = r.lim - 1;
    const v1 = G.raidSpeed(r);
    r.p = r.lim + 5;
    assert.ok(G.raidSpeed(r) < v1);
});
