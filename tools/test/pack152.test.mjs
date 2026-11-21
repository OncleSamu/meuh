// 1.152 : Le Capybara & Nouvelles Récoltes — vérification des 10 nouveautés, 2 produits, 33 recettes, dessins, Carnet et élevage.
import test from 'node:test';
import assert from 'node:assert/strict';
import { ITEMS } from '../../src/data/items.js';
import { ANIMALS, GROW, NAMES } from '../../src/data/animals.js';
import { MACHINES, RECIPES } from '../../src/data/machines.js';
import { CARNET } from '../../src/data/carnet.js';
import { ANIMAL_BASE, FLAVORS } from '../../src/data/genetics.js';
import { COMICE_CAT } from '../../src/data/elevage.js';
import { NOT_MEAT_181 } from '../../src/data/ajouts/seconds.js';
import { ANIMALS_152, CROPS_152, PRODUCTS_152, RECIPES_152, TREES_152 } from '../../src/data/ajouts/pack152.js';
import { HONEYS, HONEY_COL, HONEY_OF } from '../../src/data/honey.js';
import { PERFUME_CLASSICS, PERFUME_NOTES } from '../../src/data/perfume.js';
import { SPR } from '../../src/art/index.js';

test('1.152 : le Capybara est branché partout (élevage, produits non-viande, Comice, gènes, dessin)', () => {
    assert.equal(ANIMALS_152.length, 1);
    const a = ANIMALS.capybara;
    assert.ok(a && a.prodId === 'watercress' && a.extra === 'waterLily');
    assert.ok(ITEMS.watercress && ITEMS.waterLily);
    assert.ok(NOT_MEAT_181.has('waterLily'));
    assert.ok(GROW.capybara > 0);
    assert.ok(NAMES.capybara && NAMES.capybara.length >= 5);
    assert.ok(ANIMAL_BASE.capybara && ANIMAL_BASE.capybara.length === 7);
    assert.ok(COMICE_CAT.capybara);
    const svg = SPR.animal('capybara');
    assert.ok(svg.includes('<svg') && !/undefined|NaN/.test(svg));
    for (const [pid] of PRODUCTS_152) {
        const n = Object.values(RECIPES).filter(r => r.ing[pid]).length;
        assert.ok(n >= 3, `${pid} doit avoir au moins 3 recettes (${n})`);
        assert.ok(SPR.item(pid).length > 200 && !/undefined|NaN/.test(SPR.item(pid)));
    }
});

test('1.152 : les 7 plantes et 2 arbres ont leurs stades, saveurs, zones et au moins 3 recettes chacun', () => {
    assert.equal(CROPS_152.length, 7);
    assert.equal(TREES_152.length, 2);
    assert.equal(ITEMS.wasabi.ghOnly, true);
    assert.equal(ITEMS.lemongrass.island, true);
    assert.equal(ITEMS.cinnamon.island, true);
    assert.equal(ITEMS.nutmeg.island, true);
    for (const [id] of [...CROPS_152, ...TREES_152]) {
        assert.ok(ITEMS[id], `Objet manquant : ${id}`);
        assert.ok(FLAVORS[id], `Saveurs manquantes : ${id}`);
        assert.ok(SPR.item(id).length > 200 && !/undefined|NaN/.test(SPR.item(id)), `Dessin objet ${id}`);
        for (const st of [0, 1, 2]) {
            const p = SPR.plant(id, st);
            assert.ok(p.includes('<svg') && !/undefined|NaN/.test(p), `Dessin plante ${id} stade ${st}`);
        }
        const n = Object.values(RECIPES).filter(r => r.ing[id]).length;
        assert.ok(n >= 3, `${id} doit avoir au moins 3 recettes (${n})`);
    }
});

test('1.152 : les 33 recettes ont un dessin propre, une anecdote dans le Carnet et une marge saine', () => {
    assert.equal(RECIPES_152.length, 33);
    for (const [id, , machine] of RECIPES_152) {
        const r = RECIPES[id];
        assert.ok(r && r.machine === machine, `Recette ${id}`);
        assert.ok(r.lvl >= MACHINES[machine].reqLvl, `${id} avant sa machine`);
        const it = ITEMS[id];
        assert.ok(it && it.sell > 0, `Prix de ${id}`);
        const cost = Object.entries(r.ing).reduce((s, [k, q]) => s + (ITEMS[k].sell || 0) * q, 0);
        assert.ok(it.sell > cost, `Marge négative sur ${id}`);
        assert.ok(CARNET[id] && CARNET[id].length > 30, `Anecdote manquante : ${id}`);
        const svg = SPR.item(id);
        assert.ok(svg.length > 200 && !/undefined|NaN/.test(svg), `Dessin recette ${id}`);
    }
});

test('1.153 : 4 nouveaux miels de fleurs (thym, camomille, fenouil, cannelier) et 6 nouvelles essences de parfumerie', () => {
    for (const k of ['thyme', 'chamomile', 'fennel', 'cinnamon']) {
        assert.ok(HONEYS[k] && HONEYS[k].mamie && HONEY_COL[k], `Miel ${k}`);
        assert.equal(HONEY_OF[k], k);
        const svg = SPR.item('honey_' + k);
        assert.ok(svg.includes('<svg') && svg.length > 250 && !/undefined|NaN/.test(svg), `Pot de miel ${k}`);
    }
    assert.equal(HONEYS.cinnamon.land, 'island');
    for (const [id, tier] of [
        ['thyme', 'head'],
        ['lemongrass', 'head'],
        ['chamomile', 'heart'],
        ['waterLily', 'heart'],
        ['cinnamon', 'base'],
        ['nutmeg', 'base'],
    ]) {
        assert.equal(PERFUME_NOTES[id]?.tier, tier, `Essence ${id}`);
    }
    const classicIds = PERFUME_CLASSICS.map(c => c.id);
    assert.ok(classicIds.includes('etang') && classicIds.includes('epices'));
});
