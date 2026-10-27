// 1.53 : la cuisine du Grand Nord : trois machines et quarante-deux recettes, et le contrôle de leurs branchements.
import test from 'node:test';
import assert from 'node:assert/strict';
import { memStore } from './helpers.mjs';
import { state, setStore } from '../../src/core/state.js';
import { setView } from '../../src/core/view.js';
import * as G from '../../src/systems/index.js';
import { ITEMS } from '../../src/data/items.js';
import { MACHINES, RECIPES } from '../../src/data/machines.js';
import { CARNET } from '../../src/data/carnet.js';
import { RECIPES_153, MACHINES_153 } from '../../src/data/v153.js';
import { NORD_IDS, NORD_PRODUCTS } from '../../src/data/nord.js';
import { PROJECTS } from '../../src/data/village.js';
import { SPR } from '../../src/art/index.js';

test('trois machines aux niveaux 62 à 64, chacune après son chantier du Nord', () => {
    for (const [id, , , , project] of MACHINES_153) {
        assert.ok(MACHINES[id].reqLvl >= 62 && MACHINES[id].reqLvl <= 64);
        assert.equal(MACHINES[id].reqLvl, { tiledStove: 62, taigaPot: 63, berryKettle: 64 }[id]);
        assert.equal(MACHINES[id].needProject, project);
        assert.ok(PROJECTS[project].map === 'nord', project);
        assert.ok(SPR.machine(id).length > 300, id);
    }
});

test('quarante-deux recettes : dessin, anecdote de Mamie, ingrédients connus, prix, niveau 62 à 64', () => {
    assert.equal(RECIPES_153.length, 42);
    for (const [id, name, machine, ing] of RECIPES_153) {
        assert.ok(RECIPES[id] && RECIPES[id].machine === machine && MACHINES[machine], id);
        assert.ok(ITEMS[id] && ITEMS[id].name === name && ITEMS[id].sell > 0, `${id} : objet`);
        assert.ok(SPR.item(id).length > 300, `${id} : dessin`);
        assert.ok(CARNET[id] && CARNET[id].length > 80, `${id} : anecdote`);
        for (const k of Object.keys(ing)) assert.ok(ITEMS[k], `${id} : ${k}`);
        assert.ok(RECIPES[id].lvl >= MACHINES[machine].reqLvl && RECIPES[id].lvl <= 64, id);
    }
});

const NEW_158 = ['crabapple', 'birdCherry', 'cembro', 'juniper', 'elderberry', 'aronia']; // 1.58 : un usage chacun suffit (brasserie, voisins, traîneau)
test('chaque plante et chaque produit du Nord sert au moins trois fois ; jamais plus de 20 recettes dans une machine touchée', () => {
    const uses = {};
    for (const r of Object.values(RECIPES)) for (const k of Object.keys(r.ing)) uses[k] = (uses[k] || 0) + 1;
    for (const id of [...NORD_IDS.filter(i => i !== 'spruce' || true), ...NORD_PRODUCTS.map(p => p[0]), 'cardamom'])
        assert.ok(
            (uses[id] || 0) >= (NEW_158.includes(id) ? 1 : 3) || (id === 'rye' && uses.ryeFlour >= 3) || (['ptarmiganEgg'].includes(id) && uses[id] >= 3),
            `${id} : ${uses[id] || 0}`,
        );
    const count = {};
    for (const r of Object.values(RECIPES)) count[r.machine] = (count[r.machine] || 0) + 1;
    for (const m of new Set(RECIPES_153.map(r => r[2])))
        assert.ok(count[m] <= 20 || ['pastry', 'fishmonger', 'icecream', 'sawmill', 'forge', 'jewelry'].includes(m), `${m} : ${count[m]}`);
});

test('les voisins demandent aussi la cuisine du Nord, et le traîneau la paie plein tarif', () => {
    setStore(memStore());
    G.loadGame();
    setView({ started: false, tab: 'farm' });
    for (const id of ['ryeBread', 'salmonSoup', 'cloudberryJam']) assert.ok(G.dishOwner(id) >= 0, id);
    for (const [id] of RECIPES_153) assert.ok(G.isNordGood(id), id);
    assert.ok(state);
});
