// 1.52 : l'étable de rondins du Grand Nord, le renne, le bœuf musqué, le lagopède, le chapitre 24.
import test from 'node:test';
import assert from 'node:assert/strict';
import { clock, memStore } from './helpers.mjs';
import { state, setStore } from '../../src/core/state.js';
import { setView } from '../../src/core/view.js';
import * as G from '../../src/systems/index.js';
import { ITEMS } from '../../src/data/items.js';
import { ANIMALS, GROW, NAMES } from '../../src/data/animals.js';
import { BARN, NORD_BEAST_IDS, NORD_PRODUCTS } from '../../src/data/nord.js';
import { PAIRS, COMICE_CAT, PASSERS } from '../../src/data/elevage.js';
import { ANIMAL_BASE } from '../../src/data/genetics.js';
import { CHAPTERS, PROJECTS, VILLAGERS, CHAPTER_ORDER } from '../../src/data/village.js';
import { TIPS } from '../../src/data/texts.js';
import { SPR } from '../../src/art/index.js';

const H = 3600 * 1000;
function nord({ barn = true } = {}) {
    setStore(memStore());
    G.loadGame();
    setView({ started: false, tab: 'farm' });
    state.level = 64;
    state.money = 100_000_000;
    state.gameTimeMinutes = 12 * 60;
    state.projects.northStove = { given: {}, done: true };
    if (barn) state.projects.northStable = { given: {}, done: true };
    G.ensureNord();
    return state.nord;
}
const beast = type => {
    const a = G.newAnimal(type);
    a.adult = true;
    a.food = 5;
    G.placeAnimal(a);
    state.animals.push(a);
    return a;
};

test('les bêtes du Nord ne vivent que dans l’étable, et seulement une fois l’étable bâtie', () => {
    nord({ barn: false });
    assert.equal(G.canBuy('animal', 'reindeer'), false);
    state.projects.northStable = { given: {}, done: true };
    assert.ok(G.buy('animal', 'reindeer', 1, null));
    const a = state.animals.at(-1);
    assert.equal(a.p, BARN.key);
    assert.equal(G.moveAnimal(state.animals.length - 1, 0), false);
    assert.ok(G.buy('animal', 'chicken', 1, null));
    assert.notEqual(state.animals.at(-1).p, BARN.key);
    G.ensurePastures();
    assert.equal(a.p, BARN.key);
});

test('l’étable a 12 places, 20 une fois agrandie ; l’oasis et le Nord ne se mélangent pas', () => {
    nord();
    for (let k = 0; k < BARN.cap[0]; k++) beast('ptarmigan');
    assert.ok(G.herdFull('reindeer'));
    assert.equal(G.herdFull('cow'), false);
    assert.equal(G.penKeyOf('dromedary') === G.penKeyOf('reindeer'), false);
    state.inventory.plank = 200;
    state.inventory.beam = 100;
    assert.ok(G.upNordBarn(null));
    assert.equal(G.herdFull('reindeer'), false);
    assert.equal(G.nordBarnCap(), BARN.cap[1]);
});

test('la nuit de gel, hors d’un poêle, le renne produit deux fois moins vite ; le bœuf musqué non', () => {
    nord();
    const r = beast('reindeer'),
        m = beast('muskox');
    state.gameTimeMinutes = 12 * 60;
    assert.equal(G.nordBeastMult(r), 1);
    state.gameTimeMinutes = 23 * 60;
    assert.equal(G.nordBeastMult(r), BARN.coldMult);
    assert.equal(G.nordBeastMult(m), 1);
});

test('un poêle allumé abrite trois bêtes frileuses, et brûle pour elles', () => {
    const N = nord();
    state.inventory.wood = 100;
    state.inventory.stone = 100;
    state.inventory.plank = 100;
    state.inventory.tools = 20;
    G.buildStove(0);
    G.feedStove(0);
    const list = [beast('reindeer'), beast('reindeer'), beast('ptarmigan'), beast('reindeer')];
    state.gameTimeMinutes = 23 * 60;
    assert.equal(G.nordShelterSlots(), 3);
    assert.equal(list.filter(G.nordSheltered).length, 3);
    const f0 = N.stoves[0].fuel;
    for (let k = 0; k < 3600; k++) G.nordTick();
    assert.ok(f0 - N.stoves[0].fuel > 0.9, 'le poêle brûle pour l’étable');
});

test('les naissances et les associations marchent dans l’étable', () => {
    nord();
    const r = beast('reindeer');
    beast('muskox');
    beast('reindeer');
    assert.ok(G.toggleBirths(BARN.key));
    G.birthsTick();
    clock.t += G.birthHours('reindeer') * H + 1000;
    const [b] = G.birthsTick();
    assert.ok(b && b.type === 'reindeer' && b.p === BARN.key);
    clock.t += 2000;
    assert.ok(G.assocMult(r) > 1);
    for (const id of ['muskoxReindeer', 'reindeerPtarmigan', 'muskoxPtarmigan'])
        assert.ok(
            PAIRS.some(P => P.id === id),
            id,
        );
});

test('chapitre 24 : Ingrid, l’étable, après le chapitre 23', () => {
    assert.ok(CHAPTERS.find(c => c.n === 24 && c.map === 'nord'));
    assert.equal(CHAPTER_ORDER.at(-1), 24);
    assert.ok(VILLAGERS.ingrid && SPR.villager('ingrid').includes('<svg'));
    assert.equal(PROJECTS.northStable.ch, 24);
    assert.ok(SPR.building('northStable', 2).length > 200);
});

test('contrôle : les trois bêtes et quatre produits ont dessins, gènes, prénoms, Comice, foire, carnet, bulles', () => {
    assert.equal(NORD_BEAST_IDS.length, 3);
    for (const id of NORD_BEAST_IDS) {
        const d = ANIMALS[id];
        assert.ok(d && d.nord && d.reqLvl === 63, id);
        assert.ok(ITEMS[d.prodId] && SPR.item(d.prodId).length > 300, `produit ${id}`);
        if (d.extra) assert.ok(ITEMS[d.extra], `second produit ${id}`);
        assert.ok(SPR.animal(id).length > 500, `dessin ${id}`);
        assert.ok(GROW[id] && NAMES[id].length >= 6 && ANIMAL_BASE[id], `croissance, prénoms, gènes ${id}`);
        assert.ok(COMICE_CAT[id], `Comice ${id}`);
        assert.ok(
            PASSERS.some(p => p.types && p.types.includes(id)),
            `foire ${id}`,
        );
        assert.ok(G.BOOK_TYPES.includes(id), `carnet des robes ${id}`);
        assert.ok(TIPS[id], `bulle ${id}`);
    }
    for (const [id] of NORD_PRODUCTS) assert.ok(ITEMS[id] && ITEMS[id].needProject === 'northStable' && SPR.item(id).length > 300, id);
});
