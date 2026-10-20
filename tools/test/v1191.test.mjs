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
test('Armand : quantités bornées 10..1200, paiement fixe', () => {
    fresh();
    for (const id of Object.keys(ITEMS).filter(i => ITEMS[i].sell)) {
        const q = G.armandQty(id);
        assert.ok(q >= ARMAND.min && q <= ARMAND.max, id + ' ' + q);
    }
    assert.ok(G.armandRate('apple') >= ARMAND.pay);
});
test('Armand : la commande ne dépasse jamais le budget du niveau', () => {
    fresh();
    for (const lvl of [22, 35, 50]) {
        state.level = lvl;
        for (const id of Object.keys(ITEMS).filter(i => ITEMS[i].sell)) {
            const q = G.armandQty(id);
            const total = ITEMS[id].sell * q * ARMAND.pay;
            // sans étoile ni fidélité : au plus la valeur du niveau (+ une unité d'arrondi), sauf le minimum de 10 d'un produit trop cher, alors non éligible
            const eligible = q > ARMAND.min || ITEMS[id].sell * ARMAND.min <= ARMAND.value(G.scaleLvl ? G.scaleLvl() : lvl);
            if (eligible && q < ARMAND.max)
                assert.ok(total <= ARMAND.value(lvl) * ARMAND.pay * 1.2 + ITEMS[id].sell * ARMAND.pay, `${id} niv ${lvl} : ${total}`);
        }
    }
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
        assert.ok(G.deliverArmand(null, 0, 4));
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
        assert.ok(G.deliverArmand(null, 0, 2));
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

test('Agenda : visiteurs ouverts, présents d’abord, puis par date', () => {
    fresh();
    const a = G.agenda();
    assert.ok(a.length >= 3);
    assert.ok(a.some(e => e.id === 'armand') && a.some(e => e.id === 'fete'));
    const firstAway = a.findIndex(e => !e.here);
    assert.ok(a.slice(firstAway < 0 ? a.length : firstAway).every(e => !e.here));
    for (let i = 1; i < a.length; i++) if (a[i].here === a[i - 1].here) assert.ok(a[i].at >= a[i - 1].at);
    state.level = 3;
    assert.ok(!G.agenda().some(e => e.id === 'armand' || e.id === 'cargo'));
});

test('Domaine : fermé avant le niveau 25, achat, effets cumulés et séjours bornés', async () => {
    const { DOMAINE_COINS } = await import('../../src/data/domaine.js');
    const { MACHINE_SLOTS } = await import('../../src/data/machines.js');
    fresh();
    state.level = 24;
    state.money = 1e9;
    state.inventory.beam = state.inventory.plank = state.inventory.tools = state.inventory.nail = state.inventory.paint = 500;
    assert.equal(G.domaineOpen(), false);
    assert.equal(G.buyDomaine('barn'), false);
    state.level = 30;
    const cap = G.barnCap(),
        q = G.machineSlots('oven');
    assert.ok(G.buyDomaine('barn'));
    assert.equal(G.barnCap(), cap + 100);
    assert.ok(G.buyDomaine('kitchen'));
    assert.equal(G.machineSlots('oven'), q + 1);
    const o = G.extraOrders(),
        s = G.extraStall();
    G.buyDomaine('trade');
    assert.equal(G.extraOrders(), o + 1);
    G.buyDomaine('trade');
    assert.equal(G.extraStall(), s + 1);
    // une branche se termine après 5 paliers, au prix prévu
    const m0 = state.money;
    for (let k = 0; k < 5; k++) assert.ok(G.buyDomaine('guests'), 'palier ' + (k + 1));
    assert.equal(G.buyDomaine('guests'), false);
    assert.equal(
        m0 - state.money,
        DOMAINE_COINS.reduce((a, b) => a + b, 0),
    );
    // le séjour double, mais ne couvre jamais tout l'intervalle
    assert.equal(G.stayMult(), 2);
    assert.equal(G.stayOf(3600000), 7200000);
    assert.equal(G.stayOf(24 * 3600000, 48 * 3600000), 47 * 3600000);
    assert.ok(MACHINE_SLOTS > 0);
});

test('Domaine : annexes, cargo, quai et Suite d’Armand', () => {
    fresh();
    state.level = 40;
    state.money = 1e10;
    for (const k of ['beam', 'plank', 'tools', 'nail', 'paint']) state.inventory[k] = 999;
    // annexes : une cuve, un siège, une étagère, une nasse, une place de sélection
    const v = G.vatCount(),
        sl = G.salonDef().seats,
        c = G.caveSlots ? G.caveSlots() : null,
        t = G.trapMax(),
        b = G.breedSlots();
    for (let k = 0; k < 5; k++) assert.ok(G.buyDomaine('annex'));
    assert.equal(G.salonDef().seats, sl + 1);
    assert.equal(G.trapMax(), t + 1);
    assert.equal(G.breedSlots(), b + 1);
    if (G.brewOpen()) assert.equal(G.vatCount(), v + 1);
    if (c !== null) assert.equal(G.caveSlots(), c + 2);
    // cargo : 3 soutes de plus au palier 4 ; bonus +20 % au palier 3
    const h = G.holdCount();
    for (let k = 0; k < 5; k++) assert.ok(G.buyDomaine('cargo'));
    assert.equal(G.holdCount(), h + 4);
    // quai : le bateau revient plus vite
    const away = G.boatAway();
    for (let k = 0; k < 5; k++) assert.ok(G.buyDomaine('quay'));
    assert.ok(G.boatAway() < away);
    // Armand : 2e, 3e, 4e produits phares et paiement +10 %
    const r = G.armandRate('apple');
    for (let k = 0; k < 5; k++) assert.ok(G.buyDomaine('armand'));
    assert.equal(G.armandSlots(), 4);
    assert.ok(Math.abs(G.armandRate('apple') / r - 1.1) < 1e-9);
    state.mastery.apple = 1000;
    state.mastery.milk = 1000;
    const base = Math.floor(Date.now() / ARMAND.every) * ARMAND.every;
    setClock(() => base + 1000);
    try {
        G.armandTick();
        assert.ok(G.setFlagship('apple', 0));
        assert.equal(G.setFlagship('apple', 1), false, 'pas deux fois le même produit');
        assert.ok(G.setFlagship('milk', 1));
        state.inventory.apple = 7;
        assert.ok(G.deliverArmand(null, 0, 7));
        // il repart : sa commande entamée est gardée pour la visite suivante
        setClock(() => base + ARMAND.stay * 3);
        G.armandTick();
        assert.equal(G.armandOrder(0).got, 7);
        assert.equal(G.armandOrder(1).got, 0);
        setClock(() => base + ARMAND.every + 1000);
        G.armandTick();
        assert.equal(G.armandOrder(0).got, 7);
        assert.equal(G.armandOrder(1).got, 0);
    } finally {
        setClock(() => Date.now());
    }
});

test('Liste des nouveautés par niveau : Armand (22) et le domaine (25)', () => {
    fresh();
    assert.ok(G.unlocksAt(ARMAND.lvl).some(u => /Armand/.test(u.name)));
    assert.ok(G.unlocksAt(25).some(u => /domaine/.test(u.name)));
    assert.ok(G.unlocksAt(25).some(u => u.big));
});
