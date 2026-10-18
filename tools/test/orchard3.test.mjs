// Le verger vivant (1.13) : saisons des espèces, floraison, gelée, grande cueillette, carnet, concours du panier, fête du cidre, arbres remarquables.
import test from 'node:test';
import assert from 'node:assert/strict';
import { clock } from './helpers.mjs';
import { state, fromSave } from '../../src/core/state.js';
import { setView } from '../../src/core/view.js';
import * as G from '../../src/systems/index.js';
import { ITEMS } from '../../src/data/items.js';
import { TREE_SEASON, REMARK } from '../../src/data/orchard.js';
import { SPR } from '../../src/art/index.js';

const SPRING = 3,
    SUMMER = 15,
    AUTUMN = 27,
    WINTER = 39;
const start = () => {
    G.loadGame();
    setView({ started: false, tab: 'farm' });
    state.level = 44;
    state.money = 1e9;
    state.day = SPRING;
    state.gameTimeMinutes = 8 * 60;
    for (const k of Object.keys(state.inventory)) state.inventory[k] = 0;
    state.barn.lvl = 12;
    state.orchard = null;
    G.ensureOrchard();
    state.orchard.slots.forEach(s => (s.tree = null));
};
const plant = (id = 'apple') => {
    const k = state.orchard.slots.findIndex(x => x.open && !x.tree);
    assert.ok(G.plantTree(k, id));
    const t = state.orchard.slots[k].tree;
    t.age = ITEMS[id].time;
    return { k, t };
};

test('les nouveaux dessins existent', () => {
    for (const id of ['blossom', 'orchardTorch', 'orchardBook', 'remGold', 'remTwin']) assert.ok(SPR.ui(id).includes('<svg'), id);
});

test('chaque arbre de la ferme a sa saison ; les arbres de l’île restent toute l’année', () => {
    for (const d of Object.values(ITEMS).filter(i => i.type === 'tree')) {
        if (d.island) assert.equal(TREE_SEASON[d.id], undefined, d.id);
        else assert.ok(TREE_SEASON[d.id], `saison de ${d.id}`);
    }
});

test('dans sa saison, un arbre produit plus vite que hors saison', () => {
    start();
    const { t } = plant('apple');
    state.day = AUTUMN;
    const inSeason = G.treeRate(t);
    state.day = SUMMER;
    const out = G.treeRate(t);
    assert.ok(inSeason > out * 1.3, `${inSeason} > ${out}`);
    state.day = WINTER;
    assert.ok(G.treeRate(t) < inSeason);
});

test('la floraison : les ruches du champ donnent plus de fruits en plus', () => {
    start();
    state.day = SPRING;
    assert.equal(G.bloomOn(), true);
    assert.equal(G.pollination(), 0, 'sans ruche');
    state.grid[0].deco = 'hive';
    state.grid[0].isUnlocked = true;
    state.grid[1].deco = 'hive';
    state.grid[1].isUnlocked = true;
    assert.equal(G.hiveCount(), 2);
    assert.ok(G.pollination() > 0.1);
    state.day = SPRING + 4;
    assert.equal(G.bloomOn(), false);
    assert.ok(G.pollination() > 0 && G.pollination() < 0.13, 'la pollinisation continue, moins forte');
    state.day = SUMMER;
    assert.equal(G.pollination(), 0);
    for (const p of [state.grid[0], state.grid[1]]) p.deco = null;
});

test('la gelée : prévenue, les torches protègent, sinon quelques fruits perdus (jamais l’arbre)', () => {
    start();
    state.day = SPRING;
    const trees = [plant('cherry'), plant('cherry'), plant('cherry'), plant('cherry')];
    // trouver un printemps avec gelée
    let f = null;
    for (let s = 0; s < 20 && !f; s++) {
        state.day = 1 + s * 48;
        const fr = G.lifeTick() && state.orchard.frost;
        if (state.orchard.frost && state.orchard.frost.on) f = state.orchard.frost;
        void fr;
    }
    assert.ok(f, 'une gelée est prévue un printemps sur deux');
    state.day = 1 + (f.s % 1000) * 12 + f.day - 1;
    state.gameTimeMinutes = 8 * 60;
    assert.equal(G.frostStatus(), 'warn');
    for (const { t } of trees) t.ground = 5;
    state.inventory.pineTorch = 2;
    assert.ok(G.lightTorches());
    assert.equal(state.inventory.pineTorch, 0);
    state.gameTimeMinutes = 23 * 60;
    G.lifeTick();
    assert.equal(f.done, true);
    assert.ok(
        trees.every(({ t }) => t.ground === 5),
        'tous protégés',
    );
    // sans torche
    start();
    const ts = [plant('cherry'), plant('cherry')];
    state.day = 1;
    for (let s = 0; s < 20; s++) {
        state.day = 1 + s * 48;
        G.lifeTick();
        if (state.orchard.frost && state.orchard.frost.on) break;
    }
    const g2 = state.orchard.frost;
    state.day = g2.s * 12 + g2.day;
    state.gameTimeMinutes = 23 * 60;
    for (const { t } of ts) t.ground = 6;
    G.lifeTick();
    assert.equal(g2.done, true);
    assert.ok(ts.every(({ t }) => t.ground === 3 && G.treeStage(t) !== 'dead'));
});

test('la grande cueillette : un panier de la saison à remplir, récompense et greffon', () => {
    start();
    state.day = AUTUMN + 4;
    state.level = 40;
    assert.ok(G.harvestActive());
    plant('apple');
    const c = G.harvestState();
    assert.ok(c && Object.keys(c.need).length >= 1);
    assert.equal(G.harvestReady(), false);
    for (const id of Object.keys(c.need)) c.got[id] = c.need[id];
    assert.ok(G.harvestReady());
    const coins = state.money;
    assert.ok(G.claimHarvest());
    assert.ok(state.money > coins);
    assert.equal(G.claimHarvest(), false);
    state.day = SPRING;
    assert.equal(G.harvestActive(), false);
});

test('le carnet du verger compte les fruits et donne des médailles', () => {
    start();
    const { k, t } = plant('apple');
    t.ground = 7;
    G.pickTree(k, null, true);
    const l = G.logOf('apple');
    assert.equal(l.n, 7);
    assert.equal(l.best, 7);
    l.n = 100;
    assert.ok(G.logCan('apple'));
    const coins = state.money;
    assert.ok(G.claimLog('apple'));
    assert.ok(state.money > coins);
    assert.equal(G.logCan('apple'), false);
    l.n = 500;
    assert.ok(G.logCan('apple'));
});

test('le concours du panier : un week-end, des points, un classement, un prix', () => {
    start();
    clock.t = Date.UTC(2026, 9, 17, 9, 0, 0); // samedi 17 octobre 2026
    G.lifeTick();
    const c = state.orchard.contest;
    assert.ok(c, 'le concours s’ouvre le samedi');
    const { k, t } = plant(c.id);
    t.ground = 4;
    G.pickTree(k, null, true);
    assert.ok(c.score >= 4);
    assert.equal(G.basketRivals(c).length, 4);
    clock.t = Date.UTC(2026, 9, 21, 9, 0, 0); // le mercredi suivant
    G.lifeTick();
    assert.ok(state.orchard.lastContest && state.orchard.lastContest.rank >= 1);
    assert.ok(G.basketResultReady());
    assert.ok(G.claimBasket());
    assert.equal(G.basketResultReady(), false);
});

test('la fête du cidre : livrer des pommes et des poires, récupérer des bouteilles', () => {
    start();
    state.day = AUTUMN;
    const f = G.feteState();
    assert.ok(f && f.need.apple && f.need.pear);
    state.inventory.apple = f.need.apple;
    state.inventory.pear = f.need.pear;
    assert.ok(G.giveFete('apple') && G.giveFete('pear'));
    assert.ok(G.feteDone(f) && G.feteReady());
    const cider = state.inventory.cider;
    assert.ok(G.claimFete());
    assert.ok(state.inventory.cider > cider);
    assert.equal(G.claimFete(), false);
    state.day = WINTER;
    assert.equal(G.feteActive(), false);
});

test('arbres remarquables : un jeune plant bizarre, doré ou jumeau, qui passe par la bouture', () => {
    start();
    const old = Math.random;
    Math.random = () => 0.01;
    const { k, t } = plant('apple');
    Math.random = old;
    assert.ok(t.rem, 'plant remarquable');
    assert.ok(REMARK.kinds[t.rem]);
    t.mat = 60;
    t.ground = 0;
    G.fellTree(k);
    assert.equal(state.orchard.cuttings[0].rem, t.rem);
    assert.ok(G.plantCutting(k, 0));
    assert.equal(state.orchard.slots[k].tree.rem, t.rem);
    state.level = 20;
    const k2 = state.orchard.slots.findIndex(x => x.open && !x.tree);
    Math.random = () => 0.01;
    G.plantTree(k2, 'apple');
    Math.random = old;
    assert.ok(!state.orchard.slots[k2].tree.rem, 'pas avant le niveau 34');
});

test('la sauvegarde garde gelée, cueillette, carnet, concours et fête', () => {
    start();
    state.day = AUTUMN + 4;
    plant('apple');
    G.harvestState();
    G.feteState();
    state.orchard.log = { apple: { n: 12, best: 3, gold: 1, old: 5 } };
    const o = fromSave(JSON.parse(JSON.stringify(state))).orchard;
    assert.ok(o.cueil && o.fete);
    assert.equal(o.log.apple.n, 12);
});
