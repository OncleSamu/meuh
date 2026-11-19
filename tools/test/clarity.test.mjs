// Contrôles de la refonte de lisibilité : levels.js unique, recherche globale, frise des étapes et guide brasserie.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { memStore } from './helpers.mjs';
import { state, setStore } from '../../src/core/state.js';
import { setView } from '../../src/core/view.js';
import * as G from '../../src/systems/index.js';
import { ITEMS } from '../../src/data/items.js';
import { ANIMALS } from '../../src/data/animals.js';
import { MACHINES, RECIPES } from '../../src/data/machines.js';
import { LEVELS } from '../../src/data/levels.js';
import { PAIRS, CLASSICS, MEAD_CLASSICS } from '../../src/data/abbey.js';

function fresh() {
    setStore(memStore());
    G.loadGame();
    setView({ started: true, tab: 'farm', hidden: false });
    state.tutorial.done = true;
}

test('levels.js : tous les niveaux appliqués correspondent exactement à la source de vérité', () => {
    for (const [id, l] of Object.entries(LEVELS.items)) assert.equal(ITEMS[id].reqLvl, l, `item ${id}`);
    for (const [id, l] of Object.entries(LEVELS.animals)) assert.equal(ANIMALS[id].reqLvl, l, `animal ${id}`);
    for (const [id, l] of Object.entries(LEVELS.machines)) assert.equal(MACHINES[id].reqLvl, l, `machine ${id}`);
    for (const [id, l] of Object.entries(LEVELS.recipes)) assert.equal(RECIPES[id].lvl, l, `recette ${id}`);
});

test('navigation : tuile Chercher, frise des prochaines étapes, recherche ateliers/animaux et guide brasserie présents', () => {
    fresh();
    const menuSrc = readFileSync(new URL('../../src/ui/sheets/menu.js', import.meta.url), 'utf8');
    const infoSrc = readFileSync(new URL('../../src/ui/sheets/info.js', import.meta.url), 'utf8');
    const brewSrc = readFileSync(new URL('../../src/ui/views/brewery.js', import.meta.url), 'utf8');

    assert.ok(menuSrc.includes('data-act="openSearch"'), 'tuile Chercher dans le menu');
    assert.ok(menuSrc.includes('nextMilestones') && menuSrc.includes('lv-next'), 'frise des prochaines étapes dans Niveaux');
    assert.ok(infoSrc.includes('function machineCard') && infoSrc.includes('function animalCard'), 'recherche ateliers et animaux');
    assert.ok(infoSrc.includes('guideMach:') && infoSrc.includes('guideAnim:'), 'actions guideMach et guideAnim');
    assert.ok(brewSrc.includes('brew-guide') && brewSrc.includes('CLASSIC_HINTS'), 'guide des accords et classiques à la brasserie');
    assert.ok(Object.keys(PAIRS).length >= 6 && CLASSICS.length === 5 && MEAD_CLASSICS.length === 4);
});
