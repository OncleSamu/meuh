// 1.40 : la Coupe de la vallée (choix du défi, platine et diamant, points, rangs, mécénat, statue, prestige).
import test from 'node:test';
import assert from 'node:assert/strict';
import { clock } from './helpers.mjs';
import { state, fromSave } from '../../src/core/state.js';
import { setView } from '../../src/core/view.js';
import * as G from '../../src/systems/index.js';
import { DEFIS } from '../../src/data/defis.js';
import { CUP_RANKS, CUP_WORKS, CUP_POINTS } from '../../src/data/cup.js';

const DAY = 864e5;
const start = () => {
    G.loadGame();
    setView({ started: false, tab: 'farm' });
    state.level = 60;
    state.money = 5e9;
    state.cup = {};
    G.ensureCup();
};
// tout livrer d'un coup ; q : la qualité des produits mis en stock (0 normal, 2 or)
const giveAll = (d, q = 0) =>
    d.steps.forEach((st, k) => {
        st.items.forEach(x => {
            state.inventory[x.id] = (state.inventory[x.id] || 0) + x.n;
            if (q) {
                const o = (state.quality[x.id] = state.quality[x.id] || { s: 0, g: 0 });
                o.g = (o.g || 0) + x.n;
            }
        });
        assert.ok(G.giveDefi(k), `étape ${k}`);
    });

test('tout livrer en or vite : diamant ; en or lentement : platine ; ordinaire : or', () => {
    start();
    G.startDefi('chateau');
    if (!state.defis.aimGold) G.toggleAimGold();
    giveAll(G.curDefi(), 2);
    assert.equal(G.curDefi().awarded, 5, 'diamant');
    assert.equal(G.cupPts(), CUP_POINTS[5]);

    start();
    G.startDefi('chateau');
    if (!state.defis.aimGold) G.toggleAimGold();
    clock.t += 8 * DAY;
    giveAll(G.curDefi(), 2);
    assert.equal(G.curDefi().awarded, 4, 'platine');

    start();
    G.startDefi('chateau');
    if (state.defis.aimGold) G.toggleAimGold();
    giveAll(G.curDefi(), 0);
    assert.equal(G.curDefi().awarded, 3, 'or');
});

test('viser le platine refuse les produits ordinaires', () => {
    start();
    G.startDefi('chateau');
    if (!state.defis.aimGold) G.toggleAimGold();
    const st = G.curDefi().steps[0];
    st.items.forEach(x => {
        state.inventory[x.id] = x.n;
        state.quality[x.id] = { s: 0, g: 0 };
    });
    assert.equal(G.giveDefi(0), false);
});

test('les rangs montent avec les points et donnent leurs bonus', () => {
    start();
    const cap = G.stallCap();
    state.cup.pts = CUP_RANKS[1].pts;
    assert.equal(G.cupRank(), 1);
    assert.equal(G.stallCap(), cap + 2);
    const l2 = G.lane2Cost('mill');
    state.cup.pts = CUP_RANKS[4].pts;
    assert.equal(G.lane2Cost('mill'), Math.round(l2 / 2 / 1000) * 1000);
    state.cup.pts = 999;
    assert.equal(G.cupRank(), CUP_RANKS.length - 1);
});

test('le mécénat : payé une fois, des points, et gardé au prestige', () => {
    start();
    const w = CUP_WORKS[0];
    Object.entries(w.cost).forEach(([k, n]) => k !== 'coins' && (state.inventory[k] = n));
    assert.ok(G.buildWork(w.id));
    assert.ok(G.workDone(w.id));
    assert.equal(G.cupPts(), w.pts);
    assert.equal(G.buildWork(w.id), false, 'une seule fois');
    state.stats.earnedRun = 1e12;
    state.prestige.rubans = state.prestige.rubans || 0;
    assert.ok(G.doPrestige());
    assert.equal(G.cupPts(), w.pts, 'la Coupe se garde');
    assert.ok(G.workDone(w.id));
    const back = fromSave(JSON.parse(JSON.stringify(state)));
    assert.equal(back.cup.pts, w.pts);
});

test('les fermes rivales de la Coupe gagnent leurs médailles à votre rythme', () => {
    start();
    for (let k = 0; k < 3; k++) G.cupOnMedal(3, 'chateau');
    const r = G.cupRanking();
    const firmin = r.find(x => x.owner === 'Firmin').pts,
        hortense = r.find(x => x.owner === 'Hortense').pts;
    assert.ok(firmin > 0 && hortense > 0);
    assert.ok(firmin >= hortense * 0.8, `${firmin} / ${hortense}`);
});

test('la statue dorée : les 17 défis en or', () => {
    start();
    state.defis = { cur: null, recent: [], trophies: {}, next: 0 };
    Object.keys(DEFIS).forEach(id => (state.defis.trophies[id] = { best: 3, n: 1, gold: 1 }));
    assert.ok(G.checkStatue());
    assert.ok(G.cupPts() >= 10);
    assert.equal(G.checkStatue(), false);
});
