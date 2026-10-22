import test from 'node:test';
import assert from 'node:assert/strict';
import { state } from '../../src/core/state.js';
import * as G from '../../src/systems/index.js';
import { QUALITY, QX } from '../../src/data/farm.js';

const fresh = () => {
    G.loadGame();
    state.level = 50;
    state.money = 1e8;
    state.barn.lvl = 30;
    state.quality = {};
    state.qmade = {};
    state.genetics.bestFirst = true;
};

test('1.28 : cinq rangs de qualité, platine et diamant paient plus que l’or', () => {
    assert.equal(QUALITY.length, 5);
    assert.ok(QUALITY[3].mult > QUALITY[2].mult && QUALITY[4].mult > QUALITY[3].mult);
});

test('1.28 : une unité en or ne monte que si le produit est maîtrisé', () => {
    fresh();
    state.mastery = { wheat: 0 };
    for (let i = 0; i < 300; i++) assert.equal(G.ascend('wheat', 2), 2, 'sans maîtrise or : jamais');
    assert.equal(G.ascend('wheat', 1), 1);
    state.mastery = { wheat: 12000 }; // maîtrise or
    const seen = new Set();
    for (let i = 0; i < 4000; i++) seen.add(G.ascend('wheat', 2));
    assert.ok(seen.has(3), 'platine possible');
    assert.ok(!seen.has(4), 'pas de diamant avant la maîtrise platine');
    state.mastery = { wheat: 90000 }; // maîtrise diamant
    const s2 = new Set();
    for (let i = 0; i < 4000; i++) s2.add(G.ascend('wheat', 2));
    assert.ok(s2.has(4), 'diamant possible');
});

test('1.28 : le stock garde ses rangs, la vente prend le plus haut d’abord', () => {
    fresh();
    state.inventory.wheat = 20;
    G.addQuality('wheat', 1, 3);
    G.addQuality('wheat', 2, 2);
    G.addQuality('wheat', 3, 2);
    G.addQuality('wheat', 4, 1);
    const q = G.qual('wheat');
    assert.deepEqual([q.s, q.g, q.p, q.d], [3, 2, 2, 1]);
    assert.equal(state.qmade.wheat.d, 1);
    assert.equal(G.haveQ('wheat', 1), 8);
    assert.equal(G.haveQ('wheat', 2), 5);
    const r = G.sellBatch('wheat', 4, false);
    assert.deepEqual([r.take.d, r.take.p, r.take.g, r.take.s, r.take.n], [1, 2, 1, 0, 0]);
    assert.ok(G.sellBatch('wheat', 1, false).gain > G.unitPrice('wheat', 2, 1), 'le diamant vaut plus que l’or');
    G.takeQ('wheat', 3, 2);
    assert.deepEqual([q.s, q.g, q.p, q.d], [3, 0, 1, 1], 'on retire le plus bas rang qui convient');
});

test('1.28 : un trop-plein d’inventaire retire les plus bas rangs d’abord', () => {
    fresh();
    state.inventory.wheat = 5;
    state.quality.wheat = { s: 4, g: 2, p: 1, d: 1 };
    G.clampQuality('wheat');
    const q = state.quality.wheat;
    assert.equal(q.s + q.g + q.p + q.d, 5);
    assert.equal(q.d, 1);
    assert.equal(q.p, 1);
});

test('1.28 : un plat sort en platine ou en diamant avec des ingrédients de ce rang', () => {
    fresh();
    state.inventory.wheat = 30;
    state.quality.wheat = { s: 0, g: 30, p: 0, d: 0 };
    assert.equal(G.previewBatch('flour').q, 2);
    state.quality.wheat = { s: 0, g: 0, p: 30, d: 0 };
    assert.equal(G.previewBatch('flour').q, 3);
    state.quality.wheat = { s: 0, g: 0, p: 0, d: 30 };
    const p = G.previewBatch('flour');
    assert.equal(p.q, 4);
    assert.ok(p.d > 0);
    assert.equal(G.takeIngredients('flour'), 4);
    assert.equal(state.quality.wheat.d, 30 - 3);
    assert.equal(G.scoreTier(QX.platScore), 3);
    assert.equal(G.scoreTier(QX.diamScore), 4);
});

test('1.28 : une récolte de blé en platine arrive dans la grange', () => {
    fresh();
    state.inventory.wheat = 0;
    G.addQuality('wheat', 3, 4);
    state.inventory.wheat = 4;
    assert.equal(G.qual('wheat').p, 4);
});

test('1.28 : un lot de cave garde sa qualité et la rend plus chère', () => {
    fresh();
    state.cave = state.cave || {};
    G.ensureCave();
    state.cave.slots = state.cave.slots.map(() => null);
    state.inventory.redWine = 8;
    state.quality.redWine = { s: 0, g: 8, p: 0, d: 0 };
    assert.equal(G.putQuality('redWine', 8), 2);
    assert.ok(G.putInCave(0, 'redWine', 8, null));
    const lot = state.cave.slots[0];
    assert.equal(lot.q, 2);
    assert.equal(state.quality.redWine.g, 0);
    const plain = { ...lot, q: 0 };
    assert.ok(G.lotUnit(lot) > G.lotUnit(plain));
    lot.rank = 4;
    assert.ok(G.rankName(lot).includes('or'));
    G.takeOut(0, null);
    assert.equal(state.cave.reserve[state.cave.reserve.length - 1].q, 2, 'le lot sorti garde son or');
});

test('1.28 : une bière brassée avec des ingrédients de rang garde ce rang jusqu’à la cave', () => {
    fresh();
    for (const p of ['brewhall', 'fermenters', 'barrelcellar']) state.projects[p] = { done: true };
    G.ensureBrew();
    const B = state.brew;
    const ing = G.BREWABLE[0];
    const draft = { malt: 'maltBlond', hop: 1, ings: [[ing, 1]] };
    const cost = G.brewPreview(draft).cost;
    for (const [id, n] of Object.entries(cost)) state.inventory[id] = n * 40;
    state.quality[ing] = { s: 0, g: 0, p: 0, d: 0 };
    assert.equal(G.brewPreview(draft).q, 0);
    state.quality[ing] = { s: 0, g: 0, p: 0, d: state.inventory[ing] };
    assert.equal(G.brewPreview(draft).q, 4);
    const bid = G.startBrew(null, draft, true);
    assert.ok(bid, 'la bière est lancée');
    const vat = B.vats.find(v => v && v.bid === bid);
    assert.equal(vat.q, 4);
    vat.until = 0;
    assert.ok(G.collectVat(B.vats.indexOf(vat)));
    const n = G.beerStock(bid);
    assert.equal(G.beerQual(bid).d, n);
    // le lot de cave garde le diamant
    G.ensureCave();
    state.cave.slots = state.cave.slots.map(() => null);
    assert.equal(G.beerPutQuality(bid, 2), 4);
    assert.ok(G.putBeerInCave(0, bid, 2, 'oak', null));
    assert.equal(state.cave.slots[0].q, 4);
    assert.equal(G.beerQual(bid).d, n - 2);
    // la vente rapporte plus qu'une bière normale
    const base = G.beerPrice(bid);
    const money = state.money;
    G.sellBeer(bid, 1, null);
    assert.ok(state.money - money > base * 2, 'un diamant vaut ×2,8');
});

test('1.29 : le coffre-fort garde produits (avec leur rang) et lots de cave', () => {
    fresh();
    state.level = 20;
    G.ensureVault();
    assert.equal(G.vaultSlots(), 6);
    state.inventory.wheat = 30;
    state.quality.wheat = { s: 5, g: 3, p: 0, d: 2 };
    assert.equal(G.vaultStock('wheat', 0), 20);
    assert.equal(G.vaultStock('wheat', 4), 2);
    assert.equal(G.vaultPut('wheat', 4, 2), 2);
    assert.equal(state.inventory.wheat, 28);
    assert.equal(state.quality.wheat.d, 0);
    assert.equal(G.vaultPut('wheat', 0, 10), 10);
    assert.equal(state.inventory.wheat, 18);
    assert.equal(G.qCount(state.quality.wheat), 8, 'les rangs restants sont intacts');
    assert.equal(G.vaultUsed(), 2);
    assert.ok(G.vaultTotal() > 0);
    // on les reprend avec leur rang
    const k = G.vaultList().findIndex(s => s && s.q === 4);
    assert.equal(G.vaultTake(k, 2), 2);
    assert.equal(state.quality.wheat.d, 2);
    assert.equal(state.inventory.wheat, 20);
    // un emplacement garde 99 unités au plus
    state.inventory.wheat = 250;
    state.quality.wheat = { s: 0, g: 0, p: 0, d: 0 };
    G.vaultPut('wheat', 0, 250);
    assert.ok(G.vaultList().every(s => !s || s.n <= 99));
    // rien ne se range sous le niveau d'ouverture
    state.level = 14;
    assert.equal(G.vaultPut('wheat', 0, 1), false);
});

test('1.29 : un lot de cave passe de la réserve au coffre et revient', () => {
    fresh();
    state.level = 30;
    G.ensureCave();
    G.ensureVault();
    const lot = { uid: 777, id: 'champagneRose', n: 3, rank: 4, bad: false, q: 4 };
    state.cave.reserve.push(lot);
    const v = G.lotValue(lot);
    assert.equal(G.vaultPutLot(777), true);
    assert.equal(state.cave.reserve.length, 0);
    assert.ok(G.vaultTotal() >= v - 1);
    assert.deepEqual(
        G.bottleLots().map(l => l.uid),
        [777],
        'une bouteille du coffre reste nommable',
    );
    assert.equal(G.vaultTake(G.vaultList().findIndex(s => s && s.kind === 'lot')), true);
    assert.equal(state.cave.reserve[0].uid, 777);
    assert.equal(state.cave.reserve[0].q, 4);
});

test('1.29 : agrandir le coffre coûte des pièces, le prestige le vide mais garde sa taille', () => {
    fresh();
    state.level = 30;
    state.money = 1e9;
    G.ensureVault();
    assert.ok(G.upgradeVault());
    assert.equal(G.vaultSlots(), 10);
    for (let i = 0; i < 6; i++) G.upgradeVault();
    assert.equal(G.vaultLvl(), 4);
    assert.equal(G.vaultSlots(), 22);
    assert.equal(G.upgradeVault(), false);
});
