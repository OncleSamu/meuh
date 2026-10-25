// Bêta 3 : l'île (chapitres parallèles, plantations, verger des îles, recettes).
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { clock, memStore } from './helpers.mjs';
import { state, setStore, SAVE_KEY } from '../../src/core/state.js';
import { setView } from '../../src/core/view.js';
import * as G from '../../src/systems/index.js';
import { ITEMS } from '../../src/data/items.js';
import { RECIPES, MACHINES } from '../../src/data/machines.js';
import { PROJECTS } from '../../src/data/village.js';

const OLD = readFileSync(new URL('./fixtures/save-6.2.json', import.meta.url), 'utf8');

test('toutes les recettes de l’île ont des ingrédients et une machine connus', () => {
    for (const r of Object.values(RECIPES)) {
        assert.ok(ITEMS[r.id], 'produit ' + r.id);
        assert.ok(MACHINES[r.machine], 'machine ' + r.machine);
        for (const k of Object.keys(r.ing)) assert.ok(ITEMS[k], `${r.id} : ingrédient ${k}`);
    }
    for (const p of Object.values(PROJECTS)) for (const k of Object.keys(p.need)) assert.ok(ITEMS[k], `${p.id} : ${k}`);
    const isl = Object.values(RECIPES).filter(r => ITEMS[r.id].island);
    assert.equal(isl.length, 59); // 1.34 : trois cafés et le thé à l'hibiscus de plus
});

test('l’île se débloque par le bac, après l’abbaye (une seule histoire)', () => {
    const st = memStore();
    st.setItem(SAVE_KEY, OLD);
    setStore(st);
    clock.t = JSON.parse(OLD).lastSaved + 1000;
    G.loadGame();
    setView({ started: true, tab: 'farm' });
    // l'ancien niveau 31 passe à l'échelle des 50 niveaux, sans rien perdre
    assert.ok(state.level >= 37 && state.level <= 40, 'niveau converti : ' + state.level);
    assert.ok(G.chapterOpen(6), 'le chapitre commencé reste ouvert');
    // 1.6 : l'abbaye vient entre le port et l'île
    assert.equal(G.chapterAfter(13), 18);
    assert.equal(G.chapterNum(13), 11);
    assert.equal(G.chapterOpen(13), false, 'l’île attend la fin de l’abbaye');
    state.level = Math.max(state.level, 39);
    for (const p of Object.values(PROJECTS)) if ([1, 2, 3, 4, 5, 6, 7, 8, 17, 18].includes(p.ch)) state.projects[p.id] = { given: {}, done: true };
    assert.ok(G.chapterOpen(13), 'le chapitre de l’île est ouvert (abbaye finie, niveau 38)');
    assert.equal(G.islandOpen(), false);
    // réparer le bac
    state.money = 1e9;
    Object.keys(PROJECTS.ferry.need).forEach(k => (state.inventory[k] = 999));
    G.giveAllToProject('ferry');
    assert.ok(G.finishProject('ferry'));
    assert.ok(G.islandOpen());
    assert.ok(G.islandPlots().filter(p => p.open).length >= 6);
});

test('les cultures de l’île poussent sans arrosage, et pas dans le champ', () => {
    const k = G.islandPlots().findIndex(p => p.open && !p.id);
    assert.ok(G.plantIsland(k, 'pineapple'));
    for (let s = 0; s < 2000; s++) {
        clock.t += 1000;
        G.gameTick();
    }
    assert.ok(G.islandPlots()[k].ready);
    state.barn.lvl = 50;
    const before = state.inventory.pineapple;
    assert.ok(G.harvestIsland(k, null, true));
    assert.ok(state.inventory.pineapple > before);
    const plot = state.grid.find(p => p.isUnlocked && !p.itemId);
    assert.equal(G.plantSeed(plot, 'sweetPotato'), false);
});

test('le verger de l’île n’accepte que les arbres tropicaux', () => {
    const k = G.slotsOf('island').findIndex(x => x.open && !x.tree);
    assert.equal(G.plantTree(k, 'apple', null, 'island'), false);
    assert.ok(G.plantTree(k, 'banana', null, 'island'));
    const kf = state.orchard.slots.findIndex(x => x.open && !x.tree);
    assert.equal(G.plantTree(kf, 'mango', null, 'farm'), false);
    G.advanceTree(G.slotsOf('island')[k].tree, 3000);
    assert.ok(G.slotsOf('island')[k].tree.ground > 0);
    assert.ok(G.livingTrees('banana') > 0);
    assert.ok(
        G.questPool().some(i => i.id === 'banana'),
        'les bananes peuvent être commandées',
    );
});
