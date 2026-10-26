// 1.51 : le Grand Nord (Ferme › Voyages) : le froid, les poêles, le bois, les six plantes et leurs branchements.
import test from 'node:test';
import assert from 'node:assert/strict';
import { memStore } from './helpers.mjs';
import { state, setStore } from '../../src/core/state.js';
import { setView } from '../../src/core/view.js';
import * as G from '../../src/systems/index.js';
import { ITEMS } from '../../src/data/items.js';
import { NORD, NORD_IDS } from '../../src/data/nord.js';
import { FLAVORS } from '../../src/data/genetics.js';
import { ASSOCS } from '../../src/data/companions.js';
import { CHAPTERS, PROJECTS, CHAPTER_ORDER } from '../../src/data/village.js';
import { STORY_MAPS } from '../../src/data/meta.js';
import { GUIDE_PAGES } from '../../src/data/guide.js';
import { SPR } from '../../src/art/index.js';
import { MAP_BG } from '../../src/art/maps.js';

function nord({ open = true } = {}) {
    setStore(memStore());
    G.loadGame();
    setView({ started: false, tab: 'farm' });
    state.level = 60;
    state.money = 10_000_000;
    state.gameTimeMinutes = 12 * 60; // midi : pas de gel
    state.inventory.stone = 100;
    state.inventory.plank = 100;
    state.inventory.tools = 20;
    state.inventory.beam = 100;
    state.inventory.wood = 400;
    if (open) state.projects.northStove = { given: {}, done: true };
    G.ensureNord();
    return state.nord;
}
const run = (sec, h = 12) => {
    for (let k = 0; k < sec; k++) {
        state.gameTimeMinutes = h * 60;
        G.nordTick();
    }
};

test('fermé tant que le poêle de Tuomas n’est pas rallumé', () => {
    nord({ open: false });
    assert.equal(G.nordOpen(), false);
    state.projects.northStove = { given: {}, done: true };
    assert.equal(G.nordOpen(), true);
});

test('huit cases au départ, vingt au plus', () => {
    const N = nord();
    assert.equal(N.plots.length, NORD.cells);
    assert.equal(N.plots.filter(p => p.open).length, NORD.cellsBase);
});

test('un poêle chauffe les huit cases autour, pas les autres', () => {
    nord();
    assert.ok(G.buildStove(5));
    G.feedStove(5);
    assert.ok(G.stoveLit(5));
    assert.equal(G.isWarm(4), true);
    assert.equal(G.isWarm(0), true); // diagonale
    assert.equal(G.isWarm(19), false);
});

test('hors d’un poêle : lent le jour, rien la nuit de gel', () => {
    nord();
    assert.equal(G.cellMult(19), NORD.cold);
    state.gameTimeMinutes = 23 * 60;
    assert.equal(G.cellMult(19), 0);
});

test('une culture au chaud pousse à pleine vitesse, la nuit aussi', () => {
    const N = nord();
    assert.ok(G.buildStove(0));
    G.feedStove(0);
    state.seeds.rye = 2;
    assert.ok(G.plantNord(4, 'rye'));
    assert.ok(G.plantNord(7, 'rye'));
    run(60, 23);
    assert.ok(N.plots[4].prog >= 59);
    assert.equal(N.plots[7].prog, 0);
});

test('le poêle brûle une bûche par heure, et seulement s’il y a quelque chose à chauffer', () => {
    const N = nord();
    G.buildStove(0);
    G.feedStove(0);
    const f0 = N.stoves[0].fuel;
    run(3600);
    assert.equal(N.stoves[0].fuel, f0); // rien ne pousse autour
    state.seeds.rye = 1;
    G.plantNord(4, 'rye');
    run(360); // le seigle met 600 s : le poêle brûle encore
    assert.ok(Math.abs(f0 - N.stoves[0].fuel - 0.1) < 0.01);
});

test('la caisse à bûches double la réserve, l’isolation économise du bois', () => {
    nord();
    G.buildStove(5);
    assert.equal(G.stoveCap(), NORD.stove.fuelCap[0]);
    assert.ok(G.upgradeNord('logbox'));
    assert.equal(G.stoveCap(), NORD.stove.fuelCap[1]);
    const b0 = G.stoveBurn();
    assert.ok(G.upgradeNord('insulation'));
    assert.ok(G.stoveBurn() < b0);
});

test('reprendre un poêle rend le bois qu’il contient', () => {
    nord();
    G.buildStove(5);
    G.feedStove(5);
    const w = state.inventory.wood;
    G.removeStove(5);
    assert.ok(state.inventory.wood > w);
    assert.equal(G.stoveAt(5), null);
});

test('le jeu fermé rattrape la pousse, au plus trois jours', () => {
    const N = nord();
    state.seeds.rye = 1;
    G.plantNord(7, 'rye');
    G.nordOffline(20 * 24 * 3600);
    assert.ok(N.plots[7].ready);
});

test('fendre le bois : trois fois par jour, bûches selon les coups', () => {
    nord();
    state.projects.northWood = { given: {}, done: true };
    const w = state.inventory.wood;
    assert.equal(G.chopLeft(), NORD.chop.perDay);
    G.chopDraw([1, 1, 1, 1, 1]);
    assert.ok(state.inventory.wood > w && state.inventory.wood - w <= NORD.chop.max);
    assert.equal(G.chopLeft(), NORD.chop.perDay - 1);
});

test('six plantes branchées : dessin, goûts, nom, niveau', () => {
    assert.equal(NORD_IDS.length, 6);
    for (const id of NORD_IDS) {
        const d = ITEMS[id];
        assert.ok(d && d.nord && d.island && d.needProject === 'northStove', id);
        assert.equal(d.reqLvl, 60, id);
        assert.ok(FLAVORS[id], `${id} : goûts`);
        assert.ok(SPR.item(id).length > 300, `${id} : dessin`);
    }
});

test('trois cultures et trois arbres', () => {
    assert.equal(NORD_IDS.filter(id => ITEMS[id].type === 'crop').length, 3);
    assert.equal(NORD_IDS.filter(id => ITEMS[id].type === 'tree').length, 3);
});

test('un arbre du Grand Nord se plante sur une case libre', () => {
    nord();
    state.seeds.spruce = 1;
    assert.ok(G.plantNordTree(7, 'spruce'));
    assert.ok(G.slotsOf('nord')[7].tree);
    assert.equal(G.canStove(7), false);
});

test('chapitre 23, Tuomas, trois chantiers, carte du Nord', () => {
    assert.ok(CHAPTERS.find(c => c.n === 23));
    assert.equal(CHAPTER_ORDER[CHAPTER_ORDER.length - 1], 23);
    for (const p of ['northStove', 'northWood', 'northGreenhouse']) assert.equal(PROJECTS[p].map, 'nord', p);
    assert.equal(STORY_MAPS.find(m => m.id === 'nord').openChapter, 22);
    assert.ok(MAP_BG.nord);
});

test('trois associations du Grand Nord, la sahti en brasserie, une page de guide', () => {
    assert.ok(ASSOCS.filter(a => a.id && /Airelle|Chicoutai/.test(a.id)).length >= 2);
    assert.ok(GUIDE_PAGES.find(p => p.id === 'nord'));
});
