// 1.183 : Tests complets de la refonte des Transports & Commandes.
import test from 'node:test';
import assert from 'node:assert/strict';
import { memStore } from './helpers.mjs';
import { state, setStore } from '../../src/core/state.js';
import { setView } from '../../src/core/view.js';
import { setClock } from '../../src/core/clock.js';
import * as G from '../../src/systems/index.js';
import { ORDER_STREAK } from '../../src/data/commerce.js';

let T = Date.UTC(2026, 10, 26, 12);
function setupFarm(lvl = 80) {
    T = Date.UTC(2026, 10, 26, 12);
    setClock(() => T);
    setStore(memStore());
    G.loadGame();
    setView({ started: true, tab: 'village', hidden: false });
    state.tutorial.done = true;
    state.level = lvl;
    state.money = 1e9;
    for (const pid of Object.keys(state.projects || {})) state.projects[pid] = { done: true };
    for (const pid of ['station', 'inn', 'quay', 'shipyard', 'bakery', 'townhall', 'brewhall']) {
        state.projects[pid] = { done: true };
    }
    state.inventory.wheat = 500;
    state.inventory.carrot = 500;
    state.inventory.milk = 500;
    state.inventory.egg = 500;
    state.inventory.apple = 500;
    state.inventory.cheese = 500;
    state.inventory.sugar = 500;
    state.inventory.honey = 500;
    state.inventory.almond = 500;
    state.inventory.rice = 500;
    state.inventory.yuzu = 500;
    state.inventory.tomato = 500;
}

test('1.183 : réserve automatique protège Bateau, Avion-cargo et Armand sans fuiter les IDs spécialisés', () => {
    setupFarm(60);
    state.settings.reserve = true;
    // Bateau avec 1 caisse non chargée et 1 chargée
    state.boat = {
        status: 'here',
        expiresAt: T + 3600e3,
        port: 'capitale',
        items: [
            { id: 'yuzu', qty: 25, loaded: false, gold: 500, xp: 20 },
            { id: 'rice', qty: 15, loaded: true, gold: 400, xp: 15 },
        ],
    };
    // Avion-cargo actif
    state.cargo = {
        k: Math.floor(T / (48 * 3600e3)),
        done: false,
        holds: [
            { id: 'almond', qty: 50, got: 20 },
            { id: 'confCustom', cf: { kind: 'nougat', minStars: 1 }, qty: 3, got: 0, est: 500 },
            { id: 'brewCustom', br: { drink: 'sake', minStars: 1 }, qty: 3, got: 0, est: 500 },
        ],
    };
    // Armand actif
    const armCycle = Math.floor(T / (7 * 24 * 3600e3));
    state.armand = {
        k: armCycle,
        flags: ['sugar'],
        fid: {},
        orders: [{ id: 'sugar', qty: 100, got: 40, done: false, deal: 'ok', pm: 1 }],
    };
    state.quests = [];
    state.truck.status = 'away';
    state.balloon.status = 'away';

    assert.equal(G.reservedQty('yuzu'), 25, 'caisse bateau non chargée réservée');
    assert.equal(G.reservedQty('rice'), 0, 'caisse bateau déjà chargée non réservée');
    if (G.cargoHere()) assert.equal(G.reservedQty('almond'), 30, 'reste soute avion réservé');
    if (G.armandHere()) assert.equal(G.reservedQty('sugar'), 60, 'reste commande Armand réservé');

    // wantedItems ne doit jamais contenir d'ID synthétique
    state.inventory.yuzu = 5;
    state.inventory.almond = 5;
    state.inventory.sugar = 5;
    const w = G.wantedItems();
    assert.equal(w.has('yuzu'), true);
    assert.equal(w.has('confCustom'), false);
    assert.equal(w.has('brewCustom'), false);
    assert.equal(w.has('paquet'), false);
    assert.equal(w.has('perfumeCustom'), false);
});

test('1.183 : Bateau de livraison — 3 ports, chargement caisse par caisse, verrouillage du port, bonus + Renom et dismissBoat', () => {
    setupFarm(80);
    // Vérifie le scaling haut niveau
    assert.ok(G.boatCrateTarget(80) > 50000, 'boatCrateTarget suit la courbe exponentielle au niveau 80');
    assert.ok(G.setBoatPort('iles'), 'choix du port Routes lointaines');
    assert.equal(G.boatPortId(), 'iles');

    state.boat = {
        status: 'here',
        expiresAt: T + 3600e3,
        port: 'iles',
        items: [
            { id: 'wheat', qty: 10, loaded: false, gold: 1000, xp: 40 },
            { id: 'carrot', qty: 10, loaded: false, gold: 2000, xp: 50 },
        ],
    };
    assert.equal(G.boatCanChangePort(), true);
    assert.equal(G.boatReady(), 2);

    const m0 = state.money;
    const renom0 = G.renomPts();
    assert.ok(G.loadBoatCrate(0, null), 'chargement de la 1re caisse');
    assert.equal(state.boat.items[0].loaded, true);
    assert.equal(G.boatCanChangePort(), false, 'port verrouillé dès la 1re caisse chargée');
    assert.equal(G.setBoatPort('cote'), false);
    assert.ok(state.money > m0, 'paiement immédiat de la caisse');

    // Charger la 2e caisse -> cargo complet + bonus + Renom + départ
    const boats0 = state.stats.boats || 0;
    assert.ok(G.loadBoatCrate(1, null), 'chargement de la 2e caisse');
    assert.equal(state.boat.status, 'away');
    assert.equal(state.stats.boats, boats0 + 1);
    assert.ok(G.renomPts() >= renom0 + 2, 'Routes lointaines donne +2 Renom');

    // Test dismissBoat
    state.boat.status = 'here';
    state.boat.items = [{ id: 'wheat', qty: 10, loaded: false, gold: 500, xp: 20 }];
    assert.ok(G.dismissBoat());
    assert.equal(state.boat.status, 'away');
});

test('1.183 : Train et Avion-cargo acceptent Confiseries et Boissons de la Brasserie + dismissTruck', () => {
    setupFarm(80);
    // Prépare un stock de confiserie (nougat) et de saké
    G.ensureConf();
    const cfId = 'cf_test_nougat';
    state.confiserie.creations[cfId] = { id: cfId, kind: 'nougat', name: 'Nougat Test', stars: 3, value: 400, made: 10 };
    state.confiserie.stock[cfId] = 10;

    G.ensureBrew();
    const brId = 'br_test_sake';
    state.brew.beers[brId] = { id: brId, malt: 'sake:daiginjo', name: 'Yuzushu Test', stars: 3, value: 500, made: 10 };
    state.brew.stock[brId] = 10;

    assert.equal(G.cfTransportOk(), true);
    assert.equal(G.brTransportOk(), true);
    assert.equal(G.cfHave({ kind: 'nougat', minStars: 2 }), 10);
    assert.equal(G.brHave({ drink: 'sake', minStars: 2 }), 10);

    // Train avec 1 wagon confiserie + 1 wagon saké + 1 wagon blé
    state.truck = {
        status: 'here',
        expiresAt: T + 3600e3,
        gold: 5000,
        xp: 100,
        slots: [
            { id: 'wheat', qty: 5, loaded: false, gold: 500, xp: 20 },
            { id: 'confCustom', cf: { kind: 'nougat', minStars: 2 }, qty: 3, mult: 2.4, loaded: false, gold: 2000, xp: 50 },
            { id: 'brewCustom', br: { drink: 'sake', minStars: 2 }, qty: 3, mult: 2.4, loaded: false, gold: 2500, xp: 50 },
        ],
    };
    assert.equal(G.slotHave(state.truck.slots[1]), true);
    assert.equal(G.slotHave(state.truck.slots[2]), true);
    assert.ok(G.loadSlot(1, null));
    assert.equal(state.confiserie.stock[cfId], 7);
    assert.ok(G.loadSlot(2, null));
    assert.equal(state.brew.stock[brId], 7);
    // Test dismissTruck avant de charger le 3e wagon
    assert.ok(G.dismissTruck());
    assert.equal(state.truck.status, 'away');

    // Avion-cargo avec soute confiserie et soute saké
    state.cargo = {
        k: Math.floor(T / (48 * 3600e3)),
        done: false,
        holds: [
            { id: 'confCustom', cf: { kind: 'nougat', minStars: 1 }, qty: 4, got: 0, est: 600 },
            { id: 'brewCustom', br: { drink: 'sake', minStars: 1 }, qty: 4, got: 0, est: 700 },
        ],
    };
    if (G.cargoHere()) {
        assert.ok(G.loadHold(0, null));
        assert.equal(state.confiserie.stock[cfId], 3);
        assert.ok(G.loadHold(1, null));
        assert.equal(state.brew.stock[brId], 3);
        assert.equal(state.cargo.done, true);
    }
});

test('1.183 : Montgolfière express (qualité, artisanat, +2 Renom, dismissBalloon) & Tableau (commandes dorées + série de 5)', () => {
    setupFarm(60);
    // Ajoute des produits en qualité Or
    G.addQuality('wheat', 2, 10);
    G.addQuality('carrot', 1, 10);

    // Montgolfière prestige avec ligne Or
    state.balloon = {
        status: 'here',
        expiresAt: T + 3600e3,
        prestige: true,
        renom: 2,
        gold: 4000,
        xp: 200,
        mats: ['plank', 'nail'],
        items: [
            { id: 'wheat', qty: 2, q: 2 },
            { id: 'carrot', qty: 3, q: 1 },
        ],
    };
    assert.equal(G.hasAll(state.balloon.items), true);
    const r0 = G.renomPts();
    assert.ok(G.sendBalloon(null));
    assert.equal(state.balloon.status, 'away');
    assert.ok(G.renomPts() >= r0 + 2, 'Montgolfière express rapporte +2 Renom');

    // dismissBalloon
    state.balloon.status = 'here';
    state.balloon.items = [{ id: 'wheat', qty: 5 }];
    assert.ok(G.dismissBalloon());
    assert.equal(state.balloon.status, 'away');

    // Tableau des commandes : commande dorée + série quotidienne de 5 livraisons
    state.orderStreak = { day: state.day, n: ORDER_STREAK.step - 1 };
    state.quests = [
        {
            items: [{ id: 'wheat', qty: 2, q: 2 }],
            gold: 2000,
            xp: 80,
            vid: 'paul',
            mat: null,
            goldOrder: true,
            wait: 0,
        },
    ];
    assert.equal(G.checkQuestReady(state.quests[0]), true);
    const mBefore = state.money;
    const rBefore = G.renomPts();
    assert.ok(G.turnInQuest(0, null));
    assert.equal(G.orderStreak(), ORDER_STREAK.step);
    assert.equal(state.stats.goldOrders, 1);
    assert.ok(state.money >= mBefore + 2000 + Math.round((2000 * ORDER_STREAK.bonus) / 5) * 5, 'prime de série +15 % ajoutée');
    assert.ok(G.renomPts() >= Math.min(G.renomMax(), rBefore + 1), 'série de 5 donne +1 Renom');
});
