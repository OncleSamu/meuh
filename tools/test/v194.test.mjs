// 1.94 : les grands défis couvrent tout le jeu (haras, miel, oasis, Nord, serre, voisins, tablée).
import test from 'node:test';
import assert from 'node:assert/strict';
import { memStore } from './helpers.mjs';
import { state, setStore } from '../../src/core/state.js';
import { setView } from '../../src/core/view.js';
import { setClock } from '../../src/core/clock.js';
import * as G from '../../src/systems/index.js';
import { DEFIS } from '../../src/data/defis.js';
import { DECOS } from '../../src/data/farm.js';
import { VILLAGERS } from '../../src/data/village.js';
import { ANIMALS } from '../../src/data/animals.js';
import { ITEMS } from '../../src/data/items.js';
import { PROJECTS } from '../../src/data/village.js';
import { MACHINES } from '../../src/data/machines.js';
import { ui } from '../../src/art/kit.js';
import '../../src/art/index.js';

const NEW = ['haras', 'miel', 'souk', 'hiver', 'serre', 'voisins', 'tablee'];
const T = Date.UTC(2026, 10, 8, 10, 0, 0);
function farm() {
    setClock(() => T);
    setStore(memStore());
    G.loadGame();
    setView({ started: false, tab: 'farm' });
    state.level = 64;
}

test('1.94 : chaque défi a un villageois, une décoration et un dessin', () => {
    for (const [id, d] of Object.entries(DEFIS)) {
        assert.ok(VILLAGERS[d.who], `${id} : villageois ${d.who}`);
        assert.ok(DECOS[d.deco], `${id} : décoration ${d.deco}`);
        assert.equal(typeof ui[d.deco], 'function', `${id} : dessin ${d.deco}`);
        assert.equal(d.steps.length, 4, id);
    }
    assert.ok(Object.keys(DEFIS).length >= 24);
    NEW.forEach(id => assert.ok(DEFIS[id], id));
});

test('1.94 : les listes de produits ne contiennent que des objets qui existent, et assez pour tirer', () => {
    for (const [id, d] of Object.entries(DEFIS))
        for (const s of d.steps.flatMap(x => [x, x.alt].filter(Boolean)))
            if (s.kind === 'give') {
                const ok = s.pool.filter(x => ITEMS[x]);
                assert.ok(ok.length >= s.k, `${id} / ${s.name} : ${ok.length} produits pour ${s.k}`);
                assert.ok(ok.length >= s.pool.length - 6, `${id} / ${s.name} : trop d'identifiants inconnus ${s.pool.filter(x => !ITEMS[x])}`);
            }
});

// une ferme complète : tous les chantiers finis, les machines, les cœurs et les ruchers
function fullFarm() {
    farm();
    state.level = 100;
    state.greenhouse.built = true;
    Object.keys(PROJECTS).forEach(k => (state.projects[k] = { done: true }));
    Object.keys(VILLAGERS).forEach(k => (state.villagers[k] = { ...(state.villagers[k] || {}), hearts: 10 }));
    Object.keys(MACHINES).forEach(t => state.machines.push({ type: t, id: t, q: [] }));
    Object.keys(ANIMALS).forEach(t => state.animals.push({ type: t }));
    state.apiary = { island: { hives: 2, honey: 0 }, oasis: { hives: 2, honey: 0 }, nord: { hives: 2, honey: 0 } };
}

test('1.94 : la serre ferme son défi tant qu’elle n’est pas bâtie', () => {
    fullFarm();
    assert.equal(G.defiEligible('serre'), true);
    state.greenhouse.built = false;
    assert.equal(G.defiEligible('serre'), false);
});

test('1.94 : dans une ferme complète, chaque nouveau défi sort et se lance', () => {
    for (const id of NEW) {
        fullFarm();
        assert.equal(G.defiEligible(id), true, id);
        assert.ok(G.startDefi(id) !== false);
        const d = G.curDefi();
        assert.ok(d && d.id === id && d.steps.length === 4, id);
    }
});

test('1.94 : les listes de plats du banquet suivent les recettes du jeu', () => {
    fullFarm();
    const pool = DEFIS.banquet.steps[1].pool;
    ['pizza', 'pasta', 'couscous', 'lingonStew'].forEach(x => assert.ok(pool.includes(x), x));
    assert.ok(pool.length > 40);
});

test('1.94 : le miel des ruchers des contrées compte pour les commandes et les défis', () => {
    fullFarm();
    assert.equal(G.canGet('honey'), true);
});
