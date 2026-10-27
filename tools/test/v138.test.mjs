// 1.38 : le rééquilibrage (visiteurs du château, cave, étal, commandes).
import test from 'node:test';
import assert from 'node:assert/strict';
import './helpers.mjs';
import { state } from '../../src/core/state.js';
import { setView } from '../../src/core/view.js';
import * as G from '../../src/systems/index.js';
import { ITEMS } from '../../src/data/items.js';
import { REP_TIERS } from '../../src/data/chateau.js';

const start = () => {
    G.loadGame();
    setView({ started: false, tab: 'farm' });
    state.level = 64;
    G.ensureCave();
    G.ensureChateau();
};

test('les visiteurs du château paient au moins 1,5 fois la vraie valeur du vin', () => {
    start();
    state.inventory.redWine = 10;
    const v = { id: 'x', wine: 'redWine', pair: 'cheese', n: 2 };
    const p = G.visitorPrice(v, false);
    assert.ok(p >= Math.floor(ITEMS.redWine.sell * 1.5 * 2) - 2, `${p} pour 2 bouteilles de ${ITEMS.redWine.sell}`);
    assert.ok(G.visitorPrice(v, true) > p, "l'accord paie plus");
    assert.ok(p > G.unitPrice('redWine', 0, 1) * 2 * 2, 'bien plus que le grossiste');
});

test('la réputation du château agrandit la cave', () => {
    start();
    state.chateau.rep = 0;
    const slots = G.caveSlots(),
        lot = G.caveLotMax();
    state.chateau.rep = REP_TIERS[5];
    assert.equal(G.caveSlots(), slots + 2);
    assert.equal(G.caveLotMax(), lot + 4);
});

test("l'étal prend plus d'exemplaires en fin de partie", () => {
    start();
    state.level = 30;
    assert.equal(G.stallCap(), 10);
    state.level = 45;
    assert.equal(G.stallCap(), 12);
    state.level = 64;
    assert.equal(G.stallCap(), 16);
});
