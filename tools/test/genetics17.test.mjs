// 1.7 : la génétique repensée (portées, but, variétés dans la bière, semer par défaut, élevage, Salon).
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { clock, memStore } from './helpers.mjs';
import { state, setStore, SAVE_KEY } from '../../src/core/state.js';
import { setView } from '../../src/core/view.js';
import * as G from '../../src/systems/index.js';
import { PROJECTS } from '../../src/data/village.js';
import { GENETICS } from '../../src/data/genetics.js';

const OLD = readFileSync(new URL('./fixtures/save-6.2.json', import.meta.url), 'utf8');
const tick = s => {
    for (let k = 0; k < s; k++) {
        clock.t += 1000;
        G.gameTick();
    }
};
const build = id => {
    Object.entries(PROJECTS[id].need).forEach(([k, n]) => (state.inventory[k] = Math.max(state.inventory[k] || 0, n)));
    G.giveAllToProject(id);
    return G.finishProject(id);
};
const homo = (g, k, v) =>
    (g.t[k] = [
        [v, 1],
        [v, 1],
    ]);

test('une ancienne partie passe aux croisements multiples', () => {
    const st = memStore();
    const old = JSON.parse(OLD);
    old.genetics = { next: 5, vars: {}, seeds: {}, stock: {}, races: {}, cross: { a: 'strawberry', b: 'pepper', until: old.lastSaved + 5000 }, breed: null };
    st.setItem(SAVE_KEY, JSON.stringify(old));
    setStore(st);
    clock.t = old.lastSaved + 1000;
    G.loadGame();
    setView({ started: true, tab: 'farm' });
    assert.equal(state.genetics.crosses.length, 1);
    assert.equal(state.genetics.cross, undefined);
    assert.deepEqual(state.genetics.breeds, []);
});

test('une portée de jeunes plants, deux pollinisations avec la ruche', () => {
    state.level = 44;
    state.money = 1e9;
    state.barn.lvl = 60;
    G.CHAPTER_ORDER.slice(0, G.CHAPTER_ORDER.indexOf(15)).forEach(n => G.chapterProjects(n).forEach(p => (G.projState(p.id).done = true)));
    for (const id of ['pollination', 'breeding']) assert.ok(build(id), id);
    assert.equal(G.litterSize(), GENETICS.litter);
    assert.equal(G.crossSlots(), 1);
    assert.equal(G.crossFree(), false, 'le croisement de l’ancienne partie occupe la place');
    tick(10);
    const L = G.finishCross() || null;
    for (const id of ['lab', 'seedbank', 'selectHive']) assert.ok(build(id), id);
    assert.equal(G.litterSize(), GENETICS.litterLab);
    assert.equal(G.crossSlots(), 2);
    assert.equal(G.breedSlots(), 3);
    assert.ok(G.startCross('strawberry', 'strawberry'));
    assert.ok(G.startCross('tomato', 'tomato'));
    assert.equal(G.startCross('carrot', 'carrot'), false, 'deux à la fois au plus');
    tick(GENETICS.crossTime + 1);
    const a = G.finishCross(),
        b = G.finishCross();
    assert.ok(a.kids.length >= 1 && a.kids.length <= GENETICS.litterLab, 'une portée de 1 à 4 jeunes plants');
    assert.ok(b);
    const f = state.inventory.fertilizer || 0;
    const v = G.keepSeedling(a.id, a.kids.length - 1);
    assert.ok(v && v.base === 'strawberry');
    assert.equal(state.inventory.fertilizer, f + a.kids.length - 1, 'les autres au compost');
    assert.ok(G.dropLitter(b.id));
    if (L) G.dropLitter(L.id);
    assert.equal(state.genetics.litters.length, 0);
});

test('viser un goût : le labo propose les parents', () => {
    const G2 = state.genetics;
    G2.chef = { base: 'carrot', need: { sweet: 5 }, qty: 5, gold: 1000, until: clock.t + 8 * 3600 * 1000 };
    assert.ok(G.setGoal('chef'));
    let plan = G.goalPlan();
    assert.equal(G.parentBase(plan.a), 'carrot');
    assert.ok(plan.trait === 'sweet' && plan.b !== 'carrot', 'un donneur sucré');
    // une variété de carotte qui porte la bonne version : on la recroise avec elle-même
    const g = G.wildPlant('carrot');
    g.t.sweet = [
        [5, 1],
        [3, 1],
    ];
    G2.vars.vc = { id: 'vc', kind: 'plant', base: 'carrot', auto: 'Carotte', g, gen: 2, fixed: false, born: clock.t };
    plan = G.goalPlan();
    assert.ok(plan.self && plan.a === 'vc');
    homo(g, 'sweet', 5);
    assert.equal(G.goalPlan().done, 'vc');
    assert.equal(G.goalScore(g), 1);
    // la commande change : le but tombe
    G2.chef = { base: 'tomato', need: { sour: 4 }, qty: 5, gold: 1000, until: clock.t + 3600 * 1000 };
    tick(1);
    assert.equal(G2.goal, null);
});

test('une variété brassée garde son propre goût', () => {
    state.level = 44;
    for (const p of ['malthouse', 'brewhall']) state.projects[p] = { given: {}, done: true };
    G.ensureBrew();
    const g = G.wildPlant('carrot');
    homo(g, 'sweet', 5);
    homo(g, 'sour', 3);
    state.genetics.vars.vb = { id: 'vb', kind: 'plant', base: 'carrot', auto: 'Carotte', name: 'Douce de Mamie', g, gen: 3, fixed: true, born: 0 };
    state.inventory.carrot = 30;
    state.genetics.stock.vb = 10;
    Object.assign(state.inventory, { maltBlond: 10, hop: 10 });
    assert.ok(G.brewVarieties().some(v => v.id === 'vb'));
    state.brew.draft = { malt: 'maltBlond', hop: 1, ings: [] };
    assert.ok(G.setDraftIng(0, 'vb'));
    const pv = G.brewPreview();
    assert.match(pv.name, /Douce de Mamie/);
    const plain = G.brewValue('maltBlond', 1, [['carrot', 1]], pv.harmony.stars);
    assert.ok(pv.value > plain, 'une variété savoureuse vaut plus');
    assert.ok(G.startBrew());
    assert.equal(state.genetics.stock.vb, 10 - 2);
    assert.equal(state.inventory.carrot, 30 - 2);
});

test('semer sa variété par défaut', () => {
    const v = state.genetics.vars.vb;
    state.genetics.seeds.vb = 1;
    assert.ok(G.setPrefer('vb'));
    assert.equal(G.preferOf('carrot'), 'vb');
    assert.equal(G.preferSeed('carrot'), 'vb', 'avec ses graines');
    assert.equal(state.genetics.seeds.vb, 0);
    const m = state.money;
    assert.equal(G.preferSeed('carrot'), 'vb', 'fixée : rachetée au conservatoire');
    assert.ok(state.money < m);
    v.fixed = false;
    assert.equal(G.preferSeed('carrot'), null);
    v.fixed = true;
    assert.ok(G.setPrefer('vb'));
    assert.equal(G.preferOf('carrot'), null);
});

test('élevage : plusieurs enclos, des jumeaux parfois', () => {
    const cows = state.animals.filter(a => a.type === 'cow' && G.isAdult(a) && !a.sick);
    while (G.herdFull()) G.buyPasture();
    G.buyPasture();
    const n0 = state.animals.length;
    assert.ok(G.startBreed(cows[0].uid, cows[1].uid));
    assert.equal(G.startBreed(cows[0].uid, cows[1].uid), false, 'déjà à l’élevage');
    const goats = state.animals.filter(a => a.type === 'goat' && G.isAdult(a) && !a.sick);
    if (goats.length >= 2) assert.ok(G.startBreed(goats[0].uid, goats[1].uid), 'un 2e enclos');
    const rnd = Math.random;
    Math.random = () => 0.01;
    tick(GENETICS.breedTime + 2);
    Math.random = rnd;
    assert.ok(state.animals.length >= n0 + 2, 'des jumeaux');
    const baby = state.animals[state.animals.length - 1];
    assert.ok(Array.isArray(G.geneEffects(baby)));
});

test('le Salon : un ruban, deux la première fois', () => {
    if (!G.salonOpen()) assert.ok(build('salonHall'));
    const G2 = state.genetics;
    G2.salonWon = {};
    G2.salon = { k: 1, crit: 'sweetFruit', end: clock.t + 1000, rivals: [{ name: 'X', score: 1 }], entry: { id: 'vb', name: 'Douce', score: 5 }, paid: false };
    const r = state.prestige.rubans;
    clock.t += 2000;
    tick(1);
    assert.equal(state.prestige.rubans, r + GENETICS.salonFirstRuban);
    assert.equal(G2.salonWon.sweetFruit, 1);
});
