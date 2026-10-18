// La nature repensée (1.11) : minerais, essences, ouvriers, charbonnière, Gaspard, bâtiments améliorés.
import test from 'node:test';
import assert from 'node:assert/strict';
import { clock } from './helpers.mjs';
import { state, fromSave } from '../../src/core/state.js';
import { setView } from '../../src/core/view.js';
import * as G from '../../src/systems/index.js';
import { ITEMS } from '../../src/data/items.js';
import { RECIPES, MACHINES } from '../../src/data/machines.js';
import { WORKER_EVERY, KILN, SPECIES } from '../../src/data/nature.js';
import { BUILDINGS, BLD_IDS } from '../../src/data/buildings.js';
import { SPR } from '../../src/art/index.js';

const NEW = [
    'coal',
    'ironOre',
    'copperOre',
    'silverOre',
    'goldOre',
    'ironIngot',
    'copperIngot',
    'silverIngot',
    'goldIngot',
    'cutStone',
    'hardwood',
    'solidOak',
    'resin',
    'birchSap',
    'birchSyrup',
    'quartz',
    'ruby',
    'sapphire',
    'emerald',
];
const used = id => Object.values(RECIPES).filter(r => r.ing[id]).length;
const start = () => {
    G.loadGame();
    setView({ started: false, tab: 'farm' });
    state.level = 44;
    state.money = 1e7;
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
        'goldIngot',
        'solidOak',
        'quartz',
        'ruby',
        'sapphire',
        'emerald',
        'hardwood',
    ])
        state.inventory[k] = 200;
    state.nat = null;
    state.bld = null;
    G.ensureNature();
};

test('chaque matériau de la nature se dessine, se produit et sert à quelque chose', () => {
    for (const id of NEW) {
        assert.ok(ITEMS[id], id);
        assert.ok(SPR.item(id).includes('<svg'), id);
    }
    // les minerais, les lingots et les pierres servent dans au moins une recette (ou aux bâtiments)
    for (const id of NEW.filter(i => !['birchSyrup', 'solidOak'].includes(i)))
        assert.ok(used(id) >= 1 || ['ironIngot', 'copperIngot', 'cutStone', 'hardwood'].includes(id), id);
    for (const g of ['quartz', 'ruby', 'sapphire', 'emerald']) assert.ok(used(g) >= 2, `${g} sert dans ${used(g)} recettes`);
    // les nouvelles recettes ont leur machine et des ingrédients qui existent
    for (const id of [
        'cutStone',
        'ironIngot',
        'goldIngot',
        'rubyRing',
        'emeraldRing',
        'crystalVase',
        'ironPan',
        'goldenBell',
        'pineTorch',
        'solidOak',
        'resinCandle',
        'birchSyrup',
        'syrupCrepe',
        'birchGingerbread',
    ]) {
        assert.ok(RECIPES[id] && ITEMS[id] && MACHINES[RECIPES[id].machine], id);
        assert.ok(
            Object.keys(RECIPES[id].ing).every(k => ITEMS[k]),
            id,
        );
        assert.ok(SPR.item(id).includes('<svg'), id);
    }
    for (const k of ['mineQuarry', 'mineGallery', 'mineCave', 'charcoalKiln', 'lamp', 'cart', 'granary', 'trough']) assert.ok(SPR.ui(k).includes('<svg'), k);
    assert.ok(SPR.villager('gaspard').includes('<svg'));
    for (const k of Object.values(SPECIES)) assert.ok(SPR.item(k.art).includes('<svg'));
});

test('la mine a trois profondeurs : la galerie veut une lampe et un wagonnet', () => {
    start();
    assert.ok(G.depthOpen('quarry'));
    assert.equal(G.depthOpen('gallery'), false);
    assert.equal(G.setDepth('gallery'), false);
    assert.ok(G.buyGear('lamp') && G.buyGear('cart'));
    assert.ok(G.depthOpen('gallery') && G.depthOpen('cave'));
    state.level = 17;
    assert.equal(G.depthOpen('gallery'), false, 'pas avant le niveau 18');
    state.level = 44;
    assert.ok(G.setDepth('cave'));
    // une veine donne toujours une pierre précieuse et du minerai, en cassant la roche
    const sl = state.mine[0];
    Object.assign(sl, { gem: true, ore: 'goldOre', big: false, until: 0 });
    sl.hp = 1;
    const before = ['ruby', 'sapphire', 'emerald', 'quartz', 'nugget'].reduce((a, k) => a + (state.inventory[k] || 0), 0);
    const gold = state.inventory.goldOre || 0;
    assert.equal(G.hitSlot('mine', 0), 'done');
    assert.ok(state.inventory.goldOre > gold);
    assert.equal(
        ['ruby', 'sapphire', 'emerald', 'quartz', 'nugget'].reduce((a, k) => a + (state.inventory[k] || 0), 0),
        before + 1,
    );
    // à la carrière, jamais d'argent
    G.setDepth('quarry');
    for (const s of state.mine) assert.ok(['stone', 'coal'].includes(s.ore));
});

test('la forêt : des essences, du bois dur, de la résine, de la sève', () => {
    start();
    assert.ok(G.forestSlots() >= 8);
    const got = {};
    for (let n = 0; n < 200; n++) {
        const k = n % state.forest.length,
            sl = state.forest[k];
        sl.until = 0;
        sl.hp = 1;
        const before = { ...state.inventory };
        G.hitSlot('forest', k);
        for (const id of ['hardwood', 'resin', 'birchSap']) if (state.inventory[id] > before[id]) got[id] = 1;
    }
    assert.deepEqual(Object.keys(got).sort(), ['birchSap', 'hardwood', 'resin']);
    assert.ok(Object.values(state.forest).some(s => SPECIES[s.sp]));
});

test('le bûcheron et le mineur rapportent une charge toutes les 2 heures, même jeu fermé', () => {
    start();
    assert.ok(G.hireWorker('lumber') && G.hireWorker('miner'));
    assert.equal(G.hireWorker('lumber'), false, 'une seule embauche');
    assert.equal(G.loadsReady('lumber'), 0);
    clock.t += 2 * WORKER_EVERY + 1000;
    assert.equal(G.loadsReady('lumber'), 2);
    const wood = state.inventory.wood;
    const got = G.collectLoads('lumber');
    assert.ok(got.wood > 0 && state.inventory.wood > wood);
    assert.equal(G.loadsReady('lumber'), 0);
    // le plafond de charges garde 3 charges au niveau 1
    clock.t += 10 * WORKER_EVERY;
    assert.equal(G.loadsReady('miner'), 3);
    // le mineur rapporte du minerai selon ce que la mine a ouvert
    G.buyGear('lamp');
    G.buyGear('cart');
    const load = G.loadOf('miner');
    assert.ok(load.stone && load.coal);
    assert.ok(G.upgradeWorker('lumber') && G.workerLvl('lumber') === 2);
});

test('la charbonnière : du bois devient du charbon', () => {
    start();
    assert.ok(G.buildKiln());
    const wood = state.inventory.wood;
    assert.ok(G.kilnLight());
    assert.equal(state.inventory.wood, wood - KILN.wood);
    assert.equal(G.kilnReady(), false);
    clock.t += KILN.time + 1000;
    const coal = state.inventory.coal;
    assert.ok(G.kilnTake());
    assert.equal(state.inventory.coal, coal + KILN.coal);
});

test('Gaspard : un défi par jour, une récompense', () => {
    start();
    const g = G.ensureGaspard();
    assert.ok(g && G.gaspardText(g).length > 5);
    Object.assign(g, { kind: 'get', id: 'wood', need: 3, from: state.nat.log.wood || 0, done: false, claimed: false });
    state.nat.log.wood = (state.nat.log.wood || 0) + 3;
    G.gaspardCheck();
    assert.ok(G.gaspardReady());
    const h = state.villagers.gaspard ? state.villagers.gaspard.pts : 0;
    assert.ok(G.claimGaspard());
    assert.ok(state.villagers.gaspard.pts > h);
    assert.ok(!G.gaspardReady());
    clock.t += 24 * 3600000;
    assert.notEqual(G.ensureGaspard().day, g.day);
});

test('les bâtiments s’améliorent en trois niveaux avec les matériaux de la nature', () => {
    start();
    state.greenhouse.built = true;
    G.ensureGhPlots();
    // la grange
    const cap = G.barnCap();
    assert.ok(G.upgradeBld('b', 'barn'));
    assert.equal(G.barnCap(), cap + 60);
    state.level = 21;
    assert.equal(G.upgradeBld('b', 'barn'), false, 'le niveau 2 s’ouvre au niveau 22');
    state.level = 44;
    assert.ok(G.upgradeBld('b', 'barn') && G.upgradeBld('b', 'barn'));
    assert.equal(G.bldNext('b', 'barn'), null);
    assert.equal(G.barnCap(), cap + 260);
    // les prés : 24 bêtes, puis l'abreuvoir
    const pen = G.penCap();
    assert.ok(G.upgradeBld('b', 'pens'));
    assert.equal(G.penCap(), pen + 4);
    const food = G.maxFood();
    G.upgradeBld('b', 'pens');
    assert.equal(G.maxFood(), food + 2);
    // une machine : une place de plus, plus vite
    state.machines.push(G.newMachine('mill'));
    const slots = G.machineSlots('mill'),
        t = G.recipeTime(Object.keys(RECIPES).find(k => RECIPES[k].machine === 'mill'));
    assert.ok(G.upgradeBld('m', 'mill'));
    assert.equal(G.machineSlots('mill'), slots + 1);
    assert.ok(G.recipeTime(Object.keys(RECIPES).find(k => RECIPES[k].machine === 'mill')) < t);
    // la serre : des parcelles libres, les nasses : une de plus
    const gh = G.ghUnlocked();
    assert.ok(G.upgradeBld('b', 'greenhouse'));
    assert.equal(G.ghUnlocked(), Math.max(gh, 3 + 1));
    for (const id of BLD_IDS) assert.ok(G.bldNext('b', id) === null || G.bldNext('b', id).cost.coins > 0, id);
    assert.ok(BUILDINGS.barn.lines.length === 3);
});

test('le marché : « tout vendre » garde le bois, la pierre et les lingots', () => {
    start();
    state.inventory.wood = 50;
    state.inventory.ironIngot = 5;
    state.inventory.ruby = 2;
    state.inventory.bread = 3;
    assert.ok(ITEMS.wood.sell > 0 && ITEMS.ironIngot.sell > 0);
    G.sellAll();
    assert.equal(state.inventory.wood, 50);
    assert.equal(state.inventory.ironIngot, 5);
    assert.equal(state.inventory.ruby, 2);
    // mais un par un, on peut
    const m = state.money;
    G.sellItem('ironIngot', 2);
    assert.ok(state.money >= m);
    assert.equal(state.inventory.ironIngot, 3);
});

test('la sauvegarde garde la nature et les bâtiments', () => {
    start();
    G.ensureNat();
    G.ensureBld();
    state.bld.b.barn = 2;
    state.nat.workers.lumber = { lvl: 2, at: 123 };
    const copy = fromSave(JSON.parse(JSON.stringify(state)));
    assert.deepEqual(copy.bld, state.bld);
    assert.deepEqual(copy.nat, state.nat);
});
