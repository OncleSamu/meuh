// 1.107 : le domaine en grand. Huit paliers par branche, les grands travaux, la table d'hôtes.
import test from 'node:test';
import assert from 'node:assert/strict';
import { memStore } from './helpers.mjs';
import { state, setStore } from '../../src/core/state.js';
import { setView } from '../../src/core/view.js';
import { setClock } from '../../src/core/clock.js';
import * as G from '../../src/systems/index.js';
import { ITEMS } from '../../src/data/items.js';
import { RECIPES } from '../../src/data/machines.js';
import { DOMAINE, DOMAINE_IDS, DOMAINE_COINS, DOMAINE_MATS, WORKS, WORK_IDS, WORKS_COINS, WORKS_LVL, TABLE } from '../../src/data/domaine.js';

let T = Date.UTC(2026, 10, 10, 12);
function farm(lvl = 60) {
    T = Date.UTC(2026, 10, 10, 12);
    setClock(() => T);
    setStore(memStore());
    G.loadGame();
    setView({ started: true, tab: 'farm', hidden: false });
    state.tutorial.done = true;
    state.level = lvl;
    state.money = 1e11;
    for (const k of ['plank', 'paint', 'beam', 'nail', 'tools']) state.inventory[k] = 5000;
}
const dishes = () => Object.keys(ITEMS).filter(G.isDish);

test('domaine : huit paliers par branche, chacun avec son effet et son coût', () => {
    assert.equal(DOMAINE_COINS.length, 8);
    assert.equal(DOMAINE_MATS.length, 8);
    for (const b of DOMAINE_IDS) assert.equal(DOMAINE[b].steps.length, 8, b);
    for (let k = 1; k < 8; k++) assert.ok(DOMAINE_COINS[k] > DOMAINE_COINS[k - 1]);
    farm();
    for (const b of DOMAINE_IDS) {
        for (let k = 0; k < 8; k++) assert.ok(G.buyDomaine(b), `${b} ${k + 1}`);
        assert.equal(G.buyDomaine(b), false);
    }
    assert.equal(G.domTotal(), 72);
    // tout le domaine : plus d'un milliard et demi de pièces
    assert.ok(G.domSpent() > 1.5e9);
});

test('grands travaux : fermés avant le niveau 45, trois niveaux, des dizaines de millions', () => {
    farm(WORKS_LVL - 1);
    assert.equal(G.worksOpen(), false);
    assert.equal(G.buyWork('pigeon'), false);
    state.level = WORKS_LVL;
    const m = state.money;
    for (const w of WORK_IDS) {
        assert.equal(WORKS[w].fx.length, 3);
        assert.equal(WORKS[w].steps.length, 3);
        for (let k = 0; k < 3; k++) assert.ok(G.buyWork(w), `${w} ${k + 1}`);
        assert.equal(G.buyWork(w), false);
    }
    assert.equal(m - state.money, WORKS_COINS.reduce((a, b) => a + b, 0) * WORK_IDS.length);
    assert.equal(G.worksTotal(), 18);
});

test('pigeonnier et horloge : le renom monte plus haut et baisse moins vite', () => {
    farm();
    assert.equal(G.renomMax(), G.RENOM.max);
    G.buyWork('pigeon');
    assert.equal(G.renomMax(), G.RENOM.max + 2);
    for (let i = 0; i < 10; i++) G.addRenom(2);
    assert.equal(G.renomPts(), 14);
    G.buyWork('clock');
    assert.equal(G.renomDecay(), 5 * 3600000);
    T += 5 * 3600000 - 1000;
    assert.equal(G.renomPts(), 14);
    T += 2000;
    assert.equal(G.renomPts(), 13);
});

test('bibliothèque, charron et relais : l’expérience, le train et les commandes', () => {
    farm();
    const x = G.xpBonus();
    G.buyWork('library');
    assert.ok(Math.abs(G.xpBonus() / x - 1.05) < 1e-9);
    assert.equal(G.workFx('wheel'), 0);
    G.buyWork('wheel');
    G.buyWork('wheel');
    assert.equal(G.workFx('wheel'), 0.2);
    G.buyWork('post');
    assert.equal(G.workFx('post'), 0.05);
});

test('table d’hôtes : trois plats différents, deux heures, du renom ; un service par jour au niveau 1', () => {
    farm();
    const d = dishes();
    assert.ok(d.length > 100);
    assert.ok(d.every(id => RECIPES[id]));
    const menu = d.slice(0, 3);
    for (const id of d.slice(0, 6)) state.inventory[id] = 40;
    assert.equal(G.tableCan(menu), false); // pas encore construite
    G.buyWork('table');
    assert.equal(G.tableCovers(), TABLE.covers[0]);
    assert.equal(G.tableCan([menu[0], menu[0], menu[1]]), false);
    assert.ok(G.tableServe(menu));
    assert.equal(state.inventory[menu[0]], 40 - TABLE.covers[0]);
    assert.equal(G.tableServe(d.slice(3, 6)), false); // un service à la fois
    assert.equal(G.tableCollect(), false);
    T += TABLE.dur + 1;
    const m = state.money,
        r = G.renomPts();
    const got = G.tableCollect();
    assert.ok(got);
    assert.equal(state.money - m, got.pay);
    assert.equal(G.renomPts() - r, got.renom);
    assert.ok(got.renom >= 1 && got.renom <= 2);
    // plus de service aujourd'hui, un nouveau demain
    assert.equal(G.tableLeft(), 0);
    assert.equal(G.tableServe(d.slice(3, 6)), false);
    T += 24 * 3600000;
    assert.equal(G.tableLeft(), 1);
    assert.ok(G.tableServe(d.slice(3, 6)));
});

test('table d’hôtes : l’accord (trois machines différentes) donne un point de plus', () => {
    farm();
    const d = dishes();
    const byM = {};
    for (const id of d) (byM[RECIPES[id].machine] = byM[RECIPES[id].machine] || []).push(id);
    const ms = Object.keys(byM);
    assert.ok(ms.length >= 3);
    const accord = [byM[ms[0]][0], byM[ms[1]][0], byM[ms[2]][0]];
    const same = Object.values(byM).find(l => l.length >= 3).slice(0, 3);
    assert.equal(G.tableRenom(accord), TABLE.renom + TABLE.accord);
    assert.equal(G.tableRenom(same), TABLE.renom);
});

test('une ancienne sauvegarde sans grands travaux se charge', () => {
    farm();
    delete state.works;
    delete state.table;
    assert.equal(G.workLvl('table'), 0);
    assert.equal(G.tableOpen(), false);
    assert.equal(G.tableLeft(), 0);
    assert.ok(G.buyWork('table'));
    assert.equal(G.workLvl('table'), 1);
});
