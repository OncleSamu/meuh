// 1.66 : Armand marchande. Une offre, des demandes, son humeur ; jamais plus de trois tours.
import test from 'node:test';
import assert from 'node:assert/strict';
import './helpers.mjs';
import { state } from '../../src/core/state.js';
import { setClock } from '../../src/core/clock.js';
import * as G from '../../src/systems/index.js';
import { ARMAND } from '../../src/data/commerce.js';

const base = Math.floor(Date.UTC(2026, 9, 12) / ARMAND.every) * ARMAND.every;
function visit(id = 'apple', fid = 0) {
    G.loadGame();
    state.level = 30;
    state.armand = null;
    state.mastery[id] = 1000;
    setClock(() => base + 1000);
    G.armandTick();
    G.setFlagship(id);
    if (fid) state.armand.fid[id] = fid;
    const o = G.armandOrder();
    delete o.mood;
    return o;
}
const rnd = Math.random;
function withRandom(v, fn) {
    Math.random = () => v;
    try {
        return fn();
    } finally {
        Math.random = rnd;
    }
}

test('1.66 : une nouvelle commande se discute ; accepter tout de suite = le prix d’avant', () => {
    const o = visit();
    assert.ok(G.armandTalking(o));
    const before = G.armandPay(o, o.qty);
    assert.equal(G.deliverArmand(null, 0, 1), false, 'pas de livraison avant l’accord');
    assert.equal(G.armandTalk(0, 'yes'), 'yes');
    assert.ok(G.armandDealt(o));
    assert.equal(G.armandPay(o, o.qty), before);
});

test('1.66 : un « oui » à +10 % paie 10 % de plus ; une contre-proposition à mi-chemin', () => {
    let o = visit();
    const unit = G.armandPay(o, 1);
    assert.equal(
        withRandom(0, () => G.armandTalk(0, 'up10')),
        'yes',
    );
    assert.ok(Math.abs(G.armandPay(o, 1) / unit - 1.1) < 0.02);
    o = visit();
    assert.equal(
        withRandom(0.99, () => G.armandTalk(0, 'up10')),
        'counter',
    );
    assert.equal(o.counter.pm, 1.05);
    assert.equal(G.armandTalk(0, 'yes'), 'yes');
    assert.equal(o.pm, 1.05);
});

test('1.66 : trop gourmand, il repart pour la semaine ; jamais plus de trois tours ; fidélité jamais négative', () => {
    const o = visit('apple', 1);
    let r;
    for (let i = 0; i < 5 && G.armandTalking(o); i++) r = withRandom(0.99, () => G.armandTalk(0, 'up25'));
    assert.equal(r, 'off');
    assert.ok(o.round <= ARMAND.talk.rounds);
    assert.ok(G.armandOff(o));
    assert.ok(G.armandFid('apple') >= 0);
    assert.equal(G.deliverArmand(null, 0, 1), false);
    assert.equal(G.armandTalk(0, 'yes'), false, 'plus de discussion cette semaine');
    // la visite suivante repart d'une offre neuve
    setClock(() => base + ARMAND.every + 1000);
    G.armandTick();
    assert.ok(G.armandTalking(G.armandOrder()));
});

test('1.66 : moins de quantité : accepté, sans fidélité gagnée à la fin', () => {
    const o = visit('apple');
    const q = o.qty;
    assert.equal(G.armandTalk(0, 'less'), 'yes');
    assert.ok(o.qty < q);
    state.inventory.apple = o.qty;
    G.deliverArmand(null, 0);
    assert.ok(o.done);
    assert.equal(G.armandFid('apple'), 0);
});

test('1.66 : prudent (+10 %, puis on accepte sa proposition), on gagne en moyenne 3 à 12 % ; gourmand, on perd', () => {
    const run = (strategy, fid) => {
        let sum = 0;
        for (let i = 0; i < 4000; i++) {
            const o = visit('apple', fid);
            const r = G.armandTalk(0, strategy);
            if (r === 'counter') G.armandTalk(0, 'yes');
            sum += G.armandDealt(o) ? o.pm : 0;
        }
        return sum / 4000;
    };
    const prudent0 = run('up10', 0),
        prudent5 = run('up10', 5),
        greedy = run('up25', 0);
    assert.ok(prudent0 > 1.03 && prudent0 < 1.12, `prudent, fidélité 0 : ${prudent0}`);
    assert.ok(prudent5 > 1.03 && prudent5 < 1.12, `prudent, fidélité 5 : ${prudent5}`);
    assert.ok(greedy < 1, `gourmand : ${greedy}`);
});

test('1.66 : une commande d’avant la 1.66 (sans négociation) est conclue', () => {
    const o = visit();
    delete o.deal;
    assert.ok(G.armandDealt(o));
    state.inventory.apple = 3;
    assert.ok(G.deliverArmand(null, 0, 3));
    setClock(() => Date.now());
});
