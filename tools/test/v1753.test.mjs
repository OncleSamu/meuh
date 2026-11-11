// 1.75.3 : talents pour la crêperie, la pizzeria, les pâtes, le moulin à huile et le comptoir ;
// commandes de bière payées selon le rang des bouteilles ; quatre exploits de plus.
import test from 'node:test';
import assert from 'node:assert/strict';
import { memStore } from './helpers.mjs';
import { state, setStore } from '../../src/core/state.js';
import { setView } from '../../src/core/view.js';
import * as G from '../../src/systems/index.js';
import { ACHIEVEMENTS } from '../../src/data/meta.js';

function farm() {
    setStore(memStore());
    G.loadGame();
    setView({ started: false, tab: 'farm' });
    state.level = 80;
}

test('1.75.3 : chaque machine a un ami qui la connaît, et Inès fait payer plus au comptoir', () => {
    farm();
    for (const m of ['crepery', 'pizzeria', 'pastaworks', 'oilmill']) {
        assert.equal(G.talentSpeed(m), 1);
        const vid = Object.keys(G.TALENTS).find(v => (G.TALENTS[v].m || []).includes(m));
        assert.ok(vid, m);
        state.villagers[vid] = { ...(state.villagers[vid] || {}), hearts: 5 };
        assert.ok(G.talentSpeed(m) > 1, m);
    }
    assert.equal(G.talentFx('counter'), 0);
    state.villagers.ines = { ...(state.villagers.ines || {}), hearts: 5 };
    assert.ok(G.talentFx('counter') > 0);
    assert.match(G.talentText('ines'), /comptoir/);
    assert.match(G.talentText('ines'), /machine/);
});

test('1.75.3 : une commande de bière paie plus avec des bouteilles de meilleur rang', () => {
    farm();
    const B = G.ensureBrew();
    B.beers.b1 = { id: 'b1', name: 'Test', malt: 'blonde', hop: 1, ings: [['wheat', 1]], stars: 2, value: 100, note: 0, made: 0 };
    B.stock.b1 = 6;
    const o = { id: 'o1', vid: 'gaston', malt: null, note: 0, min: 1, qty: 3 };
    const plain = G.beerOrderPay(o, 'b1');
    G.beerQual('b1').g = 3;
    const gold = G.beerOrderPay(o, 'b1');
    assert.ok(gold > plain);
    B.orders = [o];
    const m = state.income.brew || 0;
    assert.ok(G.deliverBeerOrder('o1', 'b1'));
    assert.equal((state.income.brew || 0) - m, gold);
    assert.equal(G.beerQual('b1').g, 0);
    assert.equal(B.stock.b1, 3);
});

test('1.75.3 : quatre exploits de plus, comptés', () => {
    farm();
    for (const id of ['beerOrders', 'showWins', 'foals', 'fixedVars'])
        assert.ok(
            ACHIEVEMENTS.find(a => a.id === id),
            id,
        );
    state.show = { ...(state.show || {}), wins: 3 };
    assert.equal(G.achValue(ACHIEVEMENTS.find(a => a.id === 'showWins')), 3);
});
