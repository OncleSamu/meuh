// Le verger 1.12 : maturité, greffons, boutures, soins, cueilleur, Odile, échelle et panier.
import test from 'node:test';
import assert from 'node:assert/strict';
import { clock } from './helpers.mjs';
import { state, fromSave } from '../../src/core/state.js';
import { setView } from '../../src/core/view.js';
import * as G from '../../src/systems/index.js';
import { ITEMS } from '../../src/data/items.js';
import { ORCHARD } from '../../src/data/farm.js';
import { GRAFTS, MATURE, PICKER } from '../../src/data/orchard.js';
import { SPR } from '../../src/art/index.js';

const start = () => {
    G.loadGame();
    setView({ started: false, tab: 'farm' });
    state.level = 44;
    state.money = 1e9;
    for (const k of Object.keys(state.inventory)) state.inventory[k] = 0;
    for (const k of [
        'wood',
        'stone',
        'plank',
        'beam',
        'nail',
        'tools',
        'coal',
        'cutStone',
        'ironIngot',
        'copperIngot',
        'silverIngot',
        'solidOak',
        'quartz',
        'emerald',
        'hardwood',
        'resin',
        'fertilizer',
    ])
        state.inventory[k] = 500;
    state.inventory.apple = 20;
    state.inventory.pear = 20;
    state.bld = null;
    state.barn.lvl = 12;
    state.upgrades.yield = 0;
    state.orchard.cuttings = [];
    state.orchard.picker = null;
    state.orchard.odile = null;
    state.orchard.slots.forEach(s => (s.tree = null));
    G.ensureOrchard();
};
const plant = (id = 'apple') => {
    const k = state.orchard.slots.findIndex(x => x.open && !x.tree);
    assert.ok(G.plantTree(k, id));
    const t = state.orchard.slots[k].tree;
    t.age = ITEMS[id].time;
    return { k, t };
};

test('les greffons et le reste du verger se dessinent', () => {
    for (const id of ['cutting', ...Object.values(GRAFTS).map(g => g.item)]) assert.ok(SPR.item(id).includes('<svg'), id);
    for (const g of Object.values(GRAFTS)) assert.ok(ITEMS[g.item], g.item);
    for (const id of ['pruners', 'ladder', 'nursery']) assert.ok(SPR.ui(id).includes('<svg'), id);
    for (const id of ['odile', 'picker']) assert.ok(SPR.villager(id).includes('<svg'), id);
});

test('la maturité grandit avec les fruits donnés et donne des étoiles', () => {
    start();
    const { t } = plant();
    assert.equal(G.matStars(t), 1);
    G.advanceTree(t, 1e5);
    assert.ok(G.matOf(t) > 0);
    t.mat = MATURE.at;
    assert.equal(G.maturity(t), 1);
    assert.equal(G.matStars(t), 3);
    t.mat = 40;
    assert.equal(G.matStars(t), 2);
});

test('un arbre mûr donne plus de fruits que le même arbre jeune', () => {
    start();
    const a = plant().t,
        b = plant().t;
    a.mat = 0;
    b.mat = MATURE.at;
    let fa = 0,
        fb = 0;
    for (let i = 0; i < 600; i++) {
        for (const t of [a, b]) {
            t.mat = t === a ? 0 : MATURE.at;
            t.ground = 0;
            t.drops = 0;
            t.prog = G.fruitTime(t) - 0.0001;
            G.advanceTree(t, 0.01);
            if (t === a) fa += t.ground;
            else fb += t.ground;
        }
    }
    assert.ok(fb > fa * 1.1, `mûr ${fb} > jeune ${fa}`);
});

test('greffer : doré, double, éternel ; l’ancien greffon revient au sac', () => {
    start();
    const { k, t } = plant();
    state.inventory.graftEternal = 1;
    state.inventory.graftGold = 1;
    assert.ok(G.graftTree(k, 'eternal'));
    assert.equal(t.g, 'eternal');
    assert.equal(state.inventory.graftEternal, 0);
    t.drops = 1e6;
    assert.notEqual(G.treeStage(t), 'dead', 'l’arbre éternel ne meurt jamais');
    assert.equal(G.treeLife(t), 1);
    assert.ok(G.graftTree(k, 'gold'));
    assert.equal(state.inventory.graftEternal, 1, 'rendu');
    assert.ok(G.ungraftTree(k));
    assert.equal(t.g, null);
    // le double : deux fruits d’un coup
    state.inventory.graftDouble = 1;
    t.drops = 0;
    G.graftTree(k, 'double');
    t.ground = 0;
    t.prog = G.fruitTime(t) * 5;
    G.advanceTree(t, 1);
    assert.ok(t.ground >= 2, 'deux fruits');
});

test('pépinière : précoce et robuste se fabriquent, précoce va plus vite et vit moins', () => {
    start();
    const { k, t } = plant();
    const rate = G.treeRate(t),
        life = G.lifeMax(t);
    assert.ok(G.craftGraft('early') && G.craftGraft('robust'));
    assert.equal(state.inventory.graftEarly, 1);
    state.inventory.graftEarly = 1;
    G.graftTree(k, 'early');
    assert.ok(G.treeRate(t) > rate);
    assert.ok(G.lifeMax(t) < life);
    state.inventory.graftRobust = 1;
    G.graftTree(k, 'robust');
    assert.ok(G.lifeMax(t) > life);
    state.level = 16;
    assert.equal(G.craftGraft('early'), false, 'la pépinière s’ouvre au niveau 17');
});

test('bouture : un vieil arbre en laisse une, qui garde greffon et un tiers de maturité', () => {
    start();
    const { k, t } = plant();
    t.mat = 60;
    t.g = 'gold';
    t.ground = 0;
    assert.ok(G.fellTree(k));
    const c = state.orchard.cuttings;
    assert.equal(c.length, 1);
    assert.equal(c[0].g, 'gold');
    assert.equal(c[0].mat, 20);
    assert.ok(G.plantCutting(k, 0));
    const n = state.orchard.slots[k].tree;
    assert.equal(n.g, 'gold');
    assert.equal(n.mat, 20);
    assert.equal(state.orchard.cuttings.length, 0);
    // un jeune arbre n'en laisse pas
    const m = state.orchard.slots[k].tree;
    m.mat = 10;
    m.ground = 0;
    G.fellTree(k);
    assert.equal(state.orchard.cuttings.length, 0);
});

test('les soins : tailler en hiver, fumer, rajeunir', () => {
    start();
    const { k, t } = plant();
    state.day = 1;
    assert.equal(G.pruneTree(k), false, 'pas de taille hors hiver');
    state.day = 12 * 3 + 2;
    assert.equal(G.isWinter(), true);
    assert.ok(G.pruneTree(k));
    assert.equal(G.isPruned(t), false, 'l’effet vient à la saison suivante');
    state.day = 12 * 4 + 2;
    assert.equal(G.isPruned(t), true);
    const pruned = G.treeRate(t);
    t.pr = undefined;
    const base = G.treeRate(t);
    assert.ok(pruned > base * 1.1, 'taillé : plus vite');
    assert.ok(G.manureTree(k));
    assert.ok(G.treeRate(t) > base * 1.2);
    assert.equal(G.manureTree(k), false, 'déjà fumé');
    clock.t += 4000000;
    assert.ok(G.treeRate(t) <= base * 1.01, 'le fumier a fini son effet');
    t.drops = 80;
    t.mat = 80;
    t.g = 'gold';
    assert.ok(G.rejuvenateTree(k));
    assert.equal(t.drops, 40);
    assert.equal(t.mat, 80);
    assert.equal(t.g, 'gold');
    t.drops = 10;
    assert.equal(G.rejuvenateTree(k), false);
});

test('l’échelle et le panier : plus de fruits au sol, un fruit offert de temps en temps', () => {
    start();
    const { k, t } = plant();
    assert.equal(G.groundMax(), ORCHARD.groundMax);
    assert.ok(G.upgradeBld('b', 'ladder'));
    assert.equal(G.groundMax(), ORCHARD.groundMax + 2);
    G.advanceTree(t, 1e6);
    assert.equal(t.ground, ORCHARD.groundMax + 2);
    assert.ok(G.upgradeBld('b', 'basket'));
    assert.equal(G.basketBonus(8), 1);
    assert.equal(G.basketBonus(7), 0);
    const inv = state.inventory.apple,
        n = t.ground;
    G.pickTree(k, null, true);
    assert.equal(state.inventory.apple, inv + n + Math.floor(n / 8));
});

test('le cueilleur ramasse seul, en ligne et hors ligne', () => {
    start();
    state.level = 22;
    const { t } = plant();
    assert.equal(G.pickerLvl(), 0);
    assert.ok(G.upgradePicker());
    assert.equal(G.pickerLvl(), 1);
    t.ground = 3;
    const inv = state.inventory.apple;
    clock.t += PICKER.every[1] + 1000;
    assert.ok(G.pickerTick());
    assert.equal(t.ground, 0);
    assert.ok(state.inventory.apple >= inv + 3);
    // hors ligne : plusieurs tours
    t.ground = 0;
    t.drops = 0;
    const before = state.inventory.apple;
    const r = G.orchardOffline(3 * 3600);
    assert.ok(r.picked > ORCHARD.groundMax, 'plus que le sol plein : il a ramassé plusieurs fois');
    assert.ok(state.inventory.apple > before);
    // sans cueilleur, le sol reste plein
    start();
    const u = plant().t;
    G.orchardOffline(3 * 3600);
    assert.equal(u.ground, ORCHARD.groundMax);
});

test('Odile : un défi par jour, une récompense, parfois un greffon rare', () => {
    start();
    state.level = 9;
    assert.equal(G.ensureOdile(), null, 'au niveau 10');
    state.level = 30;
    plant();
    let g = G.ensureOdile();
    assert.ok(g && !g.done);
    g.kind = 'pick';
    g.need = 5;
    g.got = 0;
    const k = state.orchard.slots.findIndex(x => x.tree);
    state.orchard.slots[k].tree.ground = 5;
    G.pickTree(k, null, true);
    assert.ok(g.done, 'cueillette réussie');
    const coins = state.money;
    // forcer le greffon rare
    const oldRandom = Math.random;
    Math.random = () => 0;
    assert.ok(G.claimOdile());
    Math.random = oldRandom;
    assert.ok(state.money > coins);
    assert.ok(state.inventory.graftGold >= 1, 'greffon doré en cadeau');
    assert.equal(G.claimOdile(), false);
    // défi de choix : des fruits argent ou or consommés
    g = state.orchard.odile;
    Object.assign(g, { kind: 'choice', need: 3, done: false, claimed: false });
    state.inventory.apple = 10;
    state.quality.apple = { s: 2, g: 1 };
    G.odileCheck();
    assert.ok(g.done);
    G.claimOdile();
    assert.equal(state.inventory.apple, 7);
    assert.equal(state.quality.apple.s + state.quality.apple.g, 0);
    assert.ok(G.rollRareGraft(1));
});

test('la sauvegarde garde les greffons, boutures, cueilleur et défi', () => {
    start();
    state.level = 30;
    const { t } = plant();
    t.g = 'robust';
    t.mat = 33;
    state.orchard.cuttings = [{ id: 'apple', g: 'gold', mat: 12 }];
    G.upgradePicker();
    G.ensureOdile();
    const o = fromSave(JSON.parse(JSON.stringify(state))).orchard;
    assert.equal(o.cuttings[0].g, 'gold');
    assert.equal(o.picker.lvl, 1);
    assert.ok(o.odile);
    assert.equal(o.slots.find(s => s.tree).tree.g, 'robust');
});
