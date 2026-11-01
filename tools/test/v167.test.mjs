// 1.67 : les miels de fleurs.
import test from 'node:test';
import assert from 'node:assert/strict';
import { memStore } from './helpers.mjs';
import { state, setStore } from '../../src/core/state.js';
import { setView } from '../../src/core/view.js';
import * as G from '../../src/systems/index.js';
import { RECIPES } from '../../src/data/machines.js';
import { ITEMS } from '../../src/data/items.js';

function farm() {
    setStore(memStore());
    G.loadGame();
    setView({ started: false, tab: 'farm' });
    state.level = 40;
    G.ensureGenetics();
}
// pose une culture en fleur (prête) sur la case j
const bloom = (j, id) => Object.assign(state.grid[j], { isUnlocked: true, itemId: id, isReady: true, growProgress: ITEMS[id].time, deco: null });

test('1.67 : une ruche entourée de lavande donne du miel de lavande ; un champ mélangé, du toutes fleurs', () => {
    farm();
    const i = 7;
    const nb = G.neighbors(i);
    nb.forEach(j => Object.assign(state.grid[j], { isUnlocked: true, itemId: null, deco: null }));
    nb.slice(0, 5).forEach(j => bloom(j, 'lavender'));
    let r = G.hiveHoney(i, nb);
    assert.equal(r.kind, 'lavender');
    assert.ok(/lavande/.test(G.honeyForecast(r)));
    nb.slice(0, 5).forEach((j, k) => bloom(j, k % 2 ? 'wheat' : 'lavender'));
    r = G.hiveHoney(i, nb);
    assert.equal(r.kind, null);
    assert.ok(r.need > 0);
});

test('1.67 : le miel de fleur fait partie du stock de miel ; les recettes au miel marchent ; il part en dernier ; il se vend plus cher', () => {
    farm();
    state.inventory.honey = 10;
    G.addHoney('chestnut', 6);
    const id = G.honeyProd('chestnut');
    assert.equal(state.genetics.stock[id], 6);
    assert.equal(G.varName(G.vdef(id)), 'Miel de châtaignier');
    assert.ok(G.vdefMult(G.vdef(id)) > 1);
    // une recette au miel prend d'abord le miel ordinaire
    const r = Object.values(RECIPES).find(x => x.ing.honey && Object.keys(x.ing).length === 1) || Object.values(RECIPES).find(x => x.ing.honey);
    for (const k of Object.keys(r.ing)) if (k !== 'honey') state.inventory[k] = (state.inventory[k] || 0) + 10;
    const before = state.genetics.stock[id];
    G.takeIngredients(r.id);
    G.clampVarieties();
    if (r.ing.honey <= 4) assert.equal(state.genetics.stock[id], before, 'le miel de fleur reste');
    // vendu à sa valeur
    const plain = G.unitPrice('honey');
    const gain = G.sellVariety(id, 1);
    assert.ok(gain > plain, `${gain} > ${plain}`);
    assert.ok(state.stats.honeyKinds.chestnut >= 6);
    assert.deepEqual(G.honeyLog(), ['chestnut']);
});

test('1.67 : au coffre, un miel de fleur garde son nom', () => {
    farm();
    state.level = 40;
    state.inventory.honey = 5;
    G.addHoney('lavender', 5);
    G.ensureVault();
    const id = G.honeyProd('lavender');
    assert.ok(G.vaultPut('honey', 0, 3, id));
    const s = G.vaultList().find(x => x && x.v === id);
    assert.equal(G.vaultSlotName(s), 'Miel de lavande');
});
