// 1.55 : les huit boissons de l'oasis au comptoir, et le geste du thé versé de haut.
import test from 'node:test';
import assert from 'node:assert/strict';
import { ITEMS } from '../../src/data/items.js';
import { RECIPES } from '../../src/data/machines.js';
import { BREW, NEW_DRINKS_154, NEW_DRINKS_155 } from '../../src/data/counter.js';
import { CARNET } from '../../src/data/carnet.js';
import { PROJECTS } from '../../src/data/village.js';
import { SPR } from '../../src/art/index.js';

test('1.55 : huit boissons du Grand Nord, chacune avec ses gestes, son dessin et son anecdote', () => {
    assert.equal(NEW_DRINKS_155.length, 8);
    const combos = new Set();
    for (const [id, name, ing, lvl] of NEW_DRINKS_155) {
        assert.ok(BREW[id] && BREW[id].st.length >= 3, `${id} : gestes`);
        combos.add(BREW[id].st.map(s => s[0]).join('>'));
        assert.equal(ITEMS[id].name, name);
        assert.ok(ITEMS[id].sell > 0);
        assert.equal(RECIPES[id].machine, 'counter');
        assert.equal(RECIPES[id].lvl, lvl);
        assert.ok(lvl === 60);
        assert.ok(SPR.item(id).length > 300, `${id} : dessin`);
        assert.ok(CARNET[id] && CARNET[id].length > 80, `${id} : anecdote`);
        assert.ok(PROJECTS[ITEMS[id].needProject], id);
        for (const k of Object.keys(ing)) assert.ok(ITEMS[k], `${id} : ${k}`);
    }
    assert.equal(combos.size, 8, 'chaque boisson a sa propre combinaison de gestes');
});

test('1.55 : le poêle de Tuomas ouvre les boissons, le traîneau le lait de renne', () => {
    for (const [id, , , , , tag] of NEW_DRINKS_155) assert.equal(ITEMS[id].needProject, tag === 'sled' ? 'northSled' : 'northStove', id);
});

// ---------------- audit 1.55 : le Grand Nord quand on revient après une absence ----------------
import { clock, memStore } from './helpers.mjs';
import { state, setStore } from '../../src/core/state.js';
import { setView } from '../../src/core/view.js';
import * as G from '../../src/systems/index.js';
import { ANIMALS } from '../../src/data/animals.js';
import { BARN } from '../../src/data/nord.js';

const nordFarm = () => {
    setStore(memStore());
    G.loadGame();
    setView({ started: true, tab: 'farm' });
    state.level = 60;
    for (const id of ['northStove', 'northStable']) state.projects[id] = { given: {}, done: true };
    G.ensureNord();
    G.ensurePastures();
};

test('audit 1.55 : au retour d’une longue absence, pas de blizzard ni d’aurore tombés d’un coup', () => {
    nordFarm();
    state.nord.stormAt = clock.t + 1000;
    state.nord.auroraAt = clock.t + 1000;
    state.lastSaved = clock.t;
    clock.t += 5 * 24 * 3600 * 1000;
    G.offlineProgress();
    G.nordWeatherTick();
    assert.equal(G.blizzardOn(), false);
    assert.ok(state.nord.stormAt > clock.t && state.nord.auroraAt > clock.t);
});

test('audit 1.55 : une bête frileuse compte la nuit de gel pour sa part de la journée, pas selon l’heure du retour', () => {
    nordFarm();
    const a = G.newAnimal('reindeer');
    a.adult = true;
    const mid = G.nordBeastMultOffline(a);
    assert.ok(mid > BARN.coldMult && mid < 1);
    const m = G.newAnimal('muskox');
    m.adult = true;
    assert.equal(G.nordBeastMultOffline(m), 1, 'le bœuf musqué ne craint pas le froid');
    assert.ok(ANIMALS.reindeer.cold && !ANIMALS.muskox.cold);
});

test('audit 1.55 : « ce que débloque un niveau » ne plante plus sur un niveau inconnu', () => {
    assert.deepEqual(G.unlocksAt(undefined), []);
    assert.deepEqual(G.unlocksAt(0), []);
    assert.ok(G.unlocksAt(60).length > 1);
});

test('audit 1.55 : le traîneau et la caravane paient plein tarif les boissons de leur contrée', () => {
    for (const [id] of NEW_DRINKS_155) assert.ok(G.isNordGood(id), id);
    for (const [id] of NEW_DRINKS_154) assert.ok(G.isOasisGood(id), id);
    assert.ok(!G.isNordGood('desertTea') && !G.isOasisGood('ryeKvas'), 'chacune dans sa contrée');
});
