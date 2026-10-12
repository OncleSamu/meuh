// Bêta 4 : la génétique (croisements, variétés au champ, plats de qualité, élevage, fixation, Salon, chef).
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

test('une vieille ferme reçoit des génomes, et la station s’ouvre au niveau 33', () => {
    const st = memStore();
    st.setItem(SAVE_KEY, OLD);
    setStore(st);
    clock.t = JSON.parse(OLD).lastSaved + 1000;
    G.loadGame();
    setView({ started: true, tab: 'farm' });
    assert.ok(state.animals.every(a => a.uid && a.g && a.g.t.rich));
    state.level = 34;
    state.money = 1e9;
    state.barn.lvl = 60;
    assert.ok(G.chapterOpen(15));
    for (const id of ['pollination', 'breeding', 'lab']) assert.ok(build(id), id);
    assert.ok(G.plantLabOpen() && G.breedOpen() && G.labOpen());
});

test('un croisement donne des graines d’une nouvelle variété, qui pousse au champ', () => {
    const prev = G.crossPreview(G.wildPlant('strawberry'), G.wildPlant('pepper'));
    assert.ok(prev.sterile > 0.2 && prev.hybrid > 0);
    let v = null;
    for (let k = 0; k < 20 && !v; k++) {
        assert.ok(G.startCross('strawberry', 'pepper'));
        tick(GENETICS.crossTime + 1);
        v = G.finishCross();
    }
    assert.ok(v, 'au moins un croisement réussi');
    assert.ok(['strawberry', 'pepper'].includes(v.base));
    assert.equal(state.genetics.seeds[v.id], GENETICS.seedsPerCross);
    // semer et récolter
    state.genetics.tool = v.id;
    assert.ok(G.selectTool('var'));
    const i = state.grid.findIndex(p => p.isUnlocked && !p.itemId && !p.deco);
    state.grid[i].terrain = 'plowed';
    G.doPlotAction(i, G.plotAction(state.grid[i], 'var', i));
    assert.equal(state.grid[i].v, v.id);
    for (let k = 0; k < 40 && !state.grid[i].isReady; k++) {
        state.grid[i].isWatered = true;
        state.grid[i].pest = false;
        tick(500);
    }
    assert.ok(state.grid[i].isReady);
    G.doPlotAction(i, 'harvest');
    assert.ok(state.genetics.stock[v.id] > 0, 'des produits de la variété');
});

test('une recette faite avec de meilleurs ingrédients sort en or', () => {
    // une fraise très sucrée, toute en stock
    const g = G.wildPlant('strawberry');
    g.t.sweet = [
        [5, 1],
        [5, 1],
    ];
    g.t.sour = [
        [5, 1],
        [5, 1],
    ];
    state.genetics.vars.vt = { id: 'vt', kind: 'plant', base: 'strawberry', auto: 'Test', g, gen: 5, fixed: false };
    state.inventory.strawberry = 50;
    state.genetics.stock.vt = 50;
    state.inventory.sugar = 50;
    const m = state.machines.find(x => G.recipesOf(x.type).some(r => r.id === 'jam'));
    assert.ok(m, 'une machine qui fait la confiture');
    const i = state.machines.indexOf(m);
    m.queue = [];
    m.out = {};
    const before = (state.quality.jam || { g: 0 }).g;
    assert.ok(G.queueRecipe(i, 'jam'));
    G.advanceMachine(m, 1e5);
    G.collectMachine(i, null, true);
    assert.ok(state.quality.jam.g > before, 'confiture en or');
});

test('élevage : un petit naît avec les gènes de ses parents ; une race se fixe', () => {
    const cows = state.animals.filter(a => a.type === 'cow' && G.isAdult(a));
    assert.ok(cows.length >= 2);
    if (G.herdFull()) G.buyPasture();
    const n = state.animals.length;
    assert.ok(G.startBreed(cows[0].uid, cows[1].uid));
    tick(GENETICS.breedTime + 2);
    assert.equal(state.animals.length, n + 1);
    const baby = state.animals[n];
    assert.equal(baby.gen, 1);
    // une bête stable de 3e génération se fixe
    baby.gen = 3;
    for (const k of Object.keys(baby.g.t)) baby.g.t[k][1] = baby.g.t[k][0].slice();
    for (const k of Object.keys(baby.g.l)) baby.g.l[k][1] = baby.g.l[k][0].slice();
    assert.ok(G.canFixRace(baby));
    assert.ok(G.fixRace(baby.uid, 'Normande des prés'));
    assert.equal(Object.keys(state.genetics.races).length, 1);
});

test('le Salon et la commande du chef', () => {
    state.level = 37;
    for (const id of ['seedbank', 'selectHive', 'salonHall']) assert.ok(build(id), id);
    tick(2);
    assert.ok(state.genetics.salon && state.genetics.salon.crit);
    const c = G.salonCandidates();
    if (c.length) assert.ok(G.enterSalon(c[0].id));
    assert.ok(state.genetics.chef);
    // le Salon se termine et paie
    clock.t = state.genetics.salon.end + 1000;
    tick(2);
    assert.ok(state.genetics.salon.k > 0);
});

test('vendre la ferme garde les créations', () => {
    const races = Object.keys(state.genetics.races).length;
    state.level = 40;
    G.doPrestige('', 'none');
    assert.equal(Object.keys(state.genetics.races).length, races);
    tick(5);
});
