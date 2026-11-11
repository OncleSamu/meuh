// 1.65 : essais aléatoires (graine fixe) : les stocks et les rangs des variétés, des races, du coffre et des cépages restent cohérents
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { memStore } from './helpers.mjs';
import { state, setStore } from '../../src/core/state.js';
import { setView } from '../../src/core/view.js';
import * as G from '../../src/systems/index.js';
import { RECIPES } from '../../src/data/machines.js';
setStore(memStore());
G.loadGame();
setView({ started: false, tab: 'farm' });
state.level = 80;
state.money = 1e12;
state.tutorial.done = true;
G.ensureGenetics();
G.ensureVault();
G.ensureCave();
for (const p of ['chai', 'chateauChai']) state.projects[p] = { given: {}, done: true };
state.barn.lvl = 200;
const Gn = state.genetics;
const mk = (id, base) => {
    const g = G.wildPlant(base);
    g.t.sweet = [
        [4, 1],
        [5, 1],
    ];
    Gn.vars[id] = { id, kind: 'plant', base, auto: id, name: id, g, gen: 3, fixed: true };
};
['carrot', 'grape', 'tomato', 'apple'].forEach((b, i) => {
    mk('v' + i, b);
    mk('w' + i, b);
});
const cg = G.wildAnimal('cow');
Gn.races.r1 = { id: 'r1', name: 'Race', type: 'cow', g: cg };
const rv = G.raceProd('r1', 'milk');
const bases = ['carrot', 'grape', 'tomato', 'apple', 'milk', 'honey'];
const vids = [...Object.keys(Gn.vars), rv, G.honeyProd('lavender'), G.honeyProd('chestnut')];
for (const t of ['winery', 'press', 'dairy', 'kitchen']) state.machines.push(G.newMachine(t));
let seed = 12345;
const rnd = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
const R = n => Math.floor(rnd() * n),
    pick = a => a[R(a.length)];
let bad = 0,
    made = 0;
const msgs = [];
function check(op) {
    G.clampVarieties();
    for (const b of bases) {
        const inv = state.inventory[b] || 0,
            q = state.quality[b] || {};
        const qs = ['s', 'g', 'p', 'd'].reduce((a, k) => a + (q[k] || 0), 0);
        const vs = vids.filter(v => G.vdef(v).base === b);
        const vsum = vs.reduce((a, v) => a + (Gn.stock[v] || 0), 0);
        const errs = [];
        if (inv < 0) errs.push('stock négatif');
        if (qs > inv) errs.push(`rangs ${qs} > stock ${inv}`);
        if (vsum > inv) errs.push(`variétés ${vsum} > stock ${inv}`);
        for (const k of ['s', 'g', 'p', 'd']) {
            const s = vs.reduce((a, v) => a + (G.varQual(v)[k] || 0), 0);
            if (s > (q[k] || 0)) errs.push(`rang ${k} variétés ${s} > espèce ${q[k] || 0}`);
            if ((q[k] || 0) < 0) errs.push('rang négatif ' + k);
        }
        for (const v of vs) {
            const r = G.varRanks(v);
            if (r.some(x => x < 0)) errs.push('rang de variété négatif ' + v);
            if (G.varRanked(v) > (Gn.stock[v] || 0)) errs.push('classées > stock ' + v);
        }
        const vn = vs.reduce((a, v) => a + G.varRanks(v)[0], 0);
        if (vn > inv - qs) errs.push(`normales variétés ${vn} > normales espèce ${inv - qs}`);
        if (errs.length && bad++ < 5) msgs.push(op + ' ' + b + ' ' + errs.join(' ; '));
    }
    for (const e of Object.values(state.cepage ? state.cepage.stock : {})) if (e.some(x => x < 0) && bad++ < 5) msgs.push(op + ' cépage négatif');
}
const ops = {
    harvestVar() {
        const v = pick(vids),
            b = G.vdef(v).base,
            n = 1 + R(6),
            r = R(5);
        state.inventory[b] = (state.inventory[b] || 0) + n;
        if (r) G.addQuality(b, r, n);
        G.harvestVariety(v, n, r);
    },
    harvestPlain() {
        const b = pick(bases),
            n = 1 + R(8),
            r = R(5);
        state.inventory[b] = (state.inventory[b] || 0) + n;
        if (r) G.addQuality(b, r, n);
    },
    orchardArr() {
        const v = pick(vids.filter(x => x[0] !== 'R')),
            b = G.vdef(v).base;
        const got = [R(3), R(3), R(3), R(2), R(2)];
        const n = got.reduce((a, c) => a + c, 0);
        if (!n) return;
        state.inventory[b] = (state.inventory[b] || 0) + n;
        for (let r = 1; r <= 4; r++) if (got[r]) G.addQuality(b, r, got[r]);
        G.harvestVariety(v, n, got);
    },
    sellBatch() {
        const b = pick(bases);
        G.sellBatch(b, 1 + R(10), true);
    },
    sellVar() {
        const v = pick(vids.filter(x => x[0] !== 'R'));
        G.sellVariety(v, 1 + R(4));
    },
    orderTake() {
        const b = pick(bases);
        const n = Math.min(state.inventory[b] || 0, 1 + R(5));
        state.inventory[b] -= n;
        G.clampQuality(b);
    },
    vaultPutVar() {
        const v = pick(vids),
            b = G.vdef(v).base,
            r = R(5);
        const have = G.vaultStock(b, r, v);
        if (have) G.vaultPut(b, r, 1 + R(have), v);
    },
    vaultPutPlain() {
        const b = pick(bases),
            r = R(5);
        const have = G.vaultStock(b, r);
        if (have) G.vaultPut(b, r, 1 + R(have));
    },
    vaultTake() {
        const l = G.vaultList();
        const k = l.findIndex(s => s && s.kind === 'item');
        if (k >= 0) G.vaultTake(k, 1 + R(l[k].n));
    },
    cookBest() {
        Gn.bestFirst = rnd() < 0.7;
        const r = pick(Object.values(RECIPES).filter(x => Object.keys(x.ing).some(k => bases.includes(k)) && G.canCook(x.id)));
        if (r) G.takeIngredients(r.id);
    },
    cepage() {
        const t = pick(['winery', 'press', 'dairy']);
        const i = state.machines.findIndex(m => m.type === t);
        const m = state.machines[i];
        if (!m) return;
        m.queue.length = 0;
        m.qq = [];
        m.qv = undefined;
        const fr = G.machineCepFruits(m.type);
        for (const v of vids.filter(x => fr.includes(G.vdef(x).base))) {
            const b = G.vdef(v).base,
                r = R(5);
            state.inventory[b] = (state.inventory[b] || 0) + 8;
            if (r) G.addQuality(b, r, 8);
            G.harvestVariety(v, 8, r);
        }
        const vs = G.cepVarieties(fr);
        m.cep = vs.length ? pick(vs).id : null;
        const r = pick(Object.values(RECIPES).filter(x => x.machine === m.type && G.isCepRecipe(x.id)));
        if (r) {
            for (const [k, n] of Object.entries(r.ing)) if (!bases.includes(k)) state.inventory[k] = (state.inventory[k] || 0) + n;
            if (G.queueRecipe(i, r.id)) {
                if (rnd() < 0.2 && m.queue.length > 1) G.cancelQueued(i, m.queue.length - 1);
                G.advanceMachine(m, 1e7);
                const b0 = G.cepBottles().reduce((a, e) => a + G.cepCount(e.id), 0);
                G.collectMachine(i);
                made += G.cepBottles().reduce((a, e) => a + G.cepCount(e.id), 0) - b0;
            }
        }
    },
    cepSell() {
        const l = G.cepBottles();
        if (l.length) G.sellCepage(pick(l).id, 1 + R(3));
    },
    cepCave() {
        const l = G.cepBottles();
        const s = state.cave.slots.findIndex(x => !x);
        if (l.length && s >= 0) G.putCepageInCave(s, pick(l).id, 1 + R(3));
        else if (s < 0) state.cave.slots[R(state.cave.slots.length)] = null;
    },
    brew() {
        /* la brasserie : une variété de raisin dans un brassin */
    },
};
const names = Object.keys(ops);
test('1.65 : 4 000 gestes au hasard : stocks, rangs, variétés, races, coffre et cépages restent cohérents', () => {
    for (let i = 0; i < 4000; i++) {
        const o = pick(names);
        try {
            ops[o]();
        } catch (e) {
            bad++;
            msgs.push('ERREUR ' + o + ' ' + e.message);
        }
        check(o);
    }
    assert.equal(bad, 0, msgs.join('\n'));
    assert.ok(made > 0, 'des cépages ont été faits');
});
