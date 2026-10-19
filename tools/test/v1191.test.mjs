import test from 'node:test';
import assert from 'node:assert/strict';
import { state } from '../../src/core/state.js';
import { setClock } from '../../src/core/clock.js';
import * as G from '../../src/systems/index.js';
import { ARMAND } from '../../src/data/commerce.js';
import { ITEMS } from '../../src/data/items.js';

const fresh = () => {
    G.loadGame();
    state.level = 30;
    state.armand = null;
};
test('Armand : fermé avant le niveau 22', () => {
    fresh();
    state.level = ARMAND.lvl - 1;
    assert.equal(G.armandOpen(), false);
    assert.equal(G.armandTick(), false);
    assert.equal(G.setFlagship('apple'), false);
});
test('Armand : quantités bornées 60..1200 et paiement fixe', () => {
    fresh();
    for (const id of Object.keys(ITEMS).filter(i => ITEMS[i].sell)) {
        const q = G.armandQty(id);
        assert.ok(q >= ARMAND.min && q <= ARMAND.max, id + ' ' + q);
    }
    assert.ok(G.armandRate('apple') >= ARMAND.pay);
});
test('Armand : produit phare, commande, livraison, fidélité', () => {
    fresh();
    const id = 'apple';
    state.mastery[id] = 1000;
    assert.ok(G.armandCandidates().includes(id));
    // se placer pendant une visite
    const t = Math.floor(Date.now() / ARMAND.every) * ARMAND.every + 1000;
    setClock(() => t);
    try {
        G.armandTick();
        assert.equal(G.armandOrder(), null);
        assert.ok(G.setFlagship(id));
        const o = G.armandOrder();
        assert.equal(o.id, id);
        state.inventory[id] = 10;
        const m = state.money;
        assert.ok(G.deliverArmand(null, 4));
        assert.equal(o.got, 4);
        assert.ok(state.money > m);
        assert.equal(G.armandCanChange(), false);
        assert.equal(G.setFlagship('apple'), false);
        state.inventory[id] = o.qty;
        G.deliverArmand(null);
        assert.ok(o.done);
        assert.equal(G.armandFid(id), 1);
    } finally {
        setClock(() => Date.now());
    }
});

test('Armand : une ancienne sauvegarde sans Armand se recharge', () => {
    fresh();
    assert.equal(G.armandFid('apple'), 0);
    assert.equal(G.armandOrder(), null);
});
test('Armand : on peut changer de produit avant la première livraison, pas après ; absent, rien à livrer', () => {
    fresh();
    state.mastery.apple = 1000;
    state.mastery.milk = 1000;
    const base = Math.floor(Date.now() / ARMAND.every) * ARMAND.every;
    setClock(() => base + 1000);
    try {
        G.armandTick();
        assert.ok(G.setFlagship('apple'));
        assert.ok(G.setFlagship('milk'));
        assert.equal(G.armandOrder().id, 'milk');
        state.inventory.milk = 5;
        assert.ok(G.deliverArmand(null, 2));
        assert.equal(G.setFlagship('apple'), false);
        // il repart : la commande disparaît, on peut rechoisir, plus de livraison possible
        setClock(() => base + ARMAND.stay + 1000);
        G.armandTick();
        assert.equal(G.armandOrder(), null);
        assert.equal(G.deliverArmand(null), false);
        assert.ok(G.setFlagship('apple'));
        // la visite suivante repart d'une commande neuve
        setClock(() => base + ARMAND.every + 1000);
        G.armandTick();
        assert.equal(G.armandOrder().id, 'apple');
        assert.equal(G.armandOrder().got, 0);
    } finally {
        setClock(() => Date.now());
    }
});
