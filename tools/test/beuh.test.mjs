// 1.154 : BEUH — Le Sous-Sol (Meuh underground caché en easter egg).
// Vérifie l'isolation totale vis-à-vis de la surface, la boucle de jeu, les raids, le blanchiment,
// la persistance (sauvegarde + Prestige) et la validité de tous les sprites SVG.
import test from 'node:test';
import assert from 'node:assert/strict';
import { state, newState, setState, fromSave } from '../../src/core/state.js';
import { MAX_LEVEL, PRESTIGE_LVL } from '../../src/data/progress.js';
import {
    BEUH_FRONT_IDS,
    BEUH_FRONTS,
    BEUH_MAX_PLOTS,
    BEUH_RECIPE_IDS,
    BEUH_RECIPES,
    BEUH_STATION_IDS,
    BEUH_STATIONS,
    BEUH_STRAIN_IDS,
    BEUH_STRAINS,
    BEUH_UPGRADE_IDS,
    BEUH_UPGRADES,
} from '../../src/data/beuh.js';
import { beuhEmptyPotSvg, beuhIconSvg, beuhLogoSvg, beuhPlantSvg } from '../../src/art/beuh.js';
import * as G from '../../src/systems/index.js';

const {
    beuhBuyFront,
    beuhBuySeed,
    beuhBuyStation,
    beuhBuyUpgrade,
    beuhCanCraft,
    beuhCollectCraft,
    beuhDismissClient,
    beuhEndgame,
    beuhExpandPlot,
    beuhHarvest,
    beuhLaunderRate,
    beuhLayLow,
    beuhOffline,
    beuhPlant,
    beuhQuickSell,
    beuhSellClient,
    beuhStartCraft,
    beuhTick,
    beuhUnlock,
    beuhUnlocked,
    beuhWater,
    doPrestige,
} = G;

function resetGame() {
    setState(newState());
}

test('1.154 : détection fin de jeu, isolation avant déverrouillage et initialisation propre', () => {
    resetGame();
    assert.equal(beuhEndgame(), false);
    assert.equal(beuhUnlocked(), false);
    assert.equal(beuhTick(10), false);
    assert.equal(beuhOffline(600), 0);
    assert.equal(state.beuh, undefined);

    // Fin de jeu par niveau max
    state.level = MAX_LEVEL;
    assert.equal(beuhEndgame(), true);
    state.level = 1;
    assert.equal(beuhEndgame(), false);

    // Fin de jeu par Prestige
    state.stats.prestiges = 1;
    assert.equal(beuhEndgame(), true);

    // Déverrouillage : ne touche pas à l'argent ni au niveau de surface
    const surfaceMoney = state.money;
    assert.equal(beuhUnlock(), true);
    assert.equal(beuhUnlocked(), true);
    assert.equal(state.money, surfaceMoney);
    assert.equal(state.beuh.plots.length, 6);
    assert.equal(state.beuh.clients.length, 3);
    assert.ok(state.beuh.stations.roulage);
});

test('1.154 : boucle culture (planter, arroser, pousser, récolter, agrandir) et atelier', () => {
    resetGame();
    beuhUnlock();
    const B = state.beuh;
    assert.equal(beuhBuySeed('rondpoint', 2), true);
    assert.equal(beuhPlant(0, 'rondpoint'), true);
    assert.equal(beuhWater(0), true);
    assert.equal(beuhWater(0), false, 'déjà arrosé');

    // Temps de pousse accéléré par l'arrosage (x1.5)
    beuhTick(BEUH_STRAINS.rondpoint.time);
    assert.equal(B.plots[0].ready, true);
    assert.equal(beuhHarvest(0), true);
    assert.ok((B.inv.rondpoint || 0) >= 1);
    assert.equal(B.plots[0].strain, null);

    // Agrandir les pots jusqu'à BEUH_MAX_PLOTS
    B.dirty = 1e8;
    while (B.plots.length < BEUH_MAX_PLOTS) assert.equal(beuhExpandPlot(), true);
    assert.equal(beuhExpandPlot(), false, 'plafond de pots atteint');

    // Atelier clandestin : craft sur table de roulage
    B.inv.rondpoint = 4;
    assert.equal(beuhCanCraft('sachet'), true);
    assert.equal(beuhStartCraft('sachet'), true);
    assert.equal(beuhCanCraft('sachet'), false, 'poste déjà occupé');
    beuhTick(BEUH_RECIPES.sachet.time);
    assert.equal(B.stations.roulage.ready.length, 1);
    assert.equal(beuhCollectCraft('roulage'), 1);
    assert.equal(B.inv.sachet, 1);

    // Achat d'un 2e poste au bon rang
    B.lvl = 5;
    assert.equal(beuhBuyStation('presse'), true);
    assert.ok(B.stations.presse);
});

test('1.154 : clients nocturnes, négociation, flic en civil, descente et blanchiment', () => {
    resetGame();
    beuhUnlock();
    const B = state.beuh;

    // Client normal négocié (+25 %)
    B.clients[0] = {
        uid: 1,
        name: 'Dédé',
        sub: 'Test',
        look: 'h00000000000',
        item: 'rondpoint',
        qty: 2,
        pay: 200,
        xp: 20,
        heat: 5,
        shady: false,
        expires: Date.now() + 60000,
    };
    B.inv.rondpoint = 10;
    const beforeDirty = B.dirty;
    assert.equal(beuhSellClient(0, true), true);
    assert.equal(B.dirty, beforeDirty + 250);

    // Client louche : renvoi propre sans perte
    B.clients[0] = {
        uid: 2,
        name: 'Inspecteur Moustache',
        sub: 'Test',
        look: 'h00000000000',
        item: 'rondpoint',
        qty: 1,
        pay: 200,
        xp: 10,
        heat: 40,
        shady: true,
        expires: Date.now() + 60000,
    };
    assert.equal(beuhDismissClient(0), true);
    assert.match(B.lastNotice, /piège/);

    // Vente express
    assert.equal(beuhQuickSell('rondpoint', 2), true);

    // Descente de police à chaleur >= 100 : cash sale amputé, cash propre 100 % intact
    B.dirty = 10000;
    B.clean = 5555;
    B.heat = 95;
    B.clients[0] = {
        uid: 3,
        name: 'Inspecteur Moustache',
        sub: 'Piège',
        look: 'h00000000000',
        item: 'rondpoint',
        qty: 1,
        pay: 100,
        xp: 10,
        heat: 30,
        shady: true,
        expires: Date.now() + 60000,
    };
    assert.equal(beuhSellClient(0, false), true);
    assert.equal(B.stats.raids, 1);
    assert.equal(B.clean, 5555, 'le cash propre reste intouché lors des descentes');
    assert.equal(B.heat, 20);
    assert.ok(B.dirty < 10000);

    // Profil bas
    B.heat = 50;
    assert.equal(beuhLayLow(), true);
    assert.ok(B.heat < 50);

    // Blanchiment passif via la Laverie + progression hors ligne
    B.lvl = 3;
    B.dirty = 2000;
    const cleanBefore = B.clean;
    assert.equal(beuhBuyFront('laverie'), true);
    assert.equal(beuhLaunderRate(), BEUH_FRONTS.laverie.rate);
    assert.equal(beuhBuyUpgrade('led'), true);
    beuhOffline(60);
    assert.ok(B.clean > cleanBefore, 'le blanchiment convertit le cash sale en cash propre');
    assert.ok(B.stats.laundered > 0);
});

test('1.154 : persistance dans la sauvegarde (fromSave) et conservation après un Prestige', () => {
    resetGame();
    beuhUnlock();
    state.beuh.lvl = 7;
    state.beuh.clean = 4321;
    state.beuh.inv.sachet = 3;

    // Aller-retour sauvegarde JSON
    const raw = JSON.parse(JSON.stringify(state));
    const restored = fromSave(raw);
    assert.ok(restored.beuh);
    assert.equal(restored.beuh.found, true);
    assert.equal(restored.beuh.lvl, 7);
    assert.equal(restored.beuh.clean, 4321);
    assert.equal(restored.beuh.inv.sachet, 3);

    // Conservation à travers un Prestige de la ferme de surface
    setState(restored);
    state.level = PRESTIGE_LVL;
    state.stats.earnedRun = 100000;
    assert.equal(doPrestige(), true);
    assert.equal(beuhUnlocked(), true);
    assert.equal(state.beuh.lvl, 7);
    assert.equal(state.beuh.clean, 4321);
});

test('1.154 : intégrité des données BEUH et de tous les sprites SVG', () => {
    assert.equal(BEUH_STRAIN_IDS.length, 10);
    assert.equal(BEUH_STATION_IDS.length, 5);
    assert.equal(BEUH_RECIPE_IDS.length, 15);
    assert.equal(BEUH_FRONT_IDS.length, 6);
    assert.equal(BEUH_UPGRADE_IDS.length, 6);

    for (const rid of BEUH_RECIPE_IDS) {
        const r = BEUH_RECIPES[rid];
        assert.ok(BEUH_STATIONS[r.station], `poste invalide pour ${rid}`);
        assert.ok(r.lvl >= BEUH_STATIONS[r.station].lvl, `${rid} avant son poste`);
        let ingVal = 0;
        for (const [k, q] of Object.entries(r.ing)) {
            const src = BEUH_STRAINS[k] || BEUH_RECIPES[k];
            assert.ok(src, `ingrédient inconnu ${k} dans ${rid}`);
            ingVal += src.sell * q;
        }
        assert.ok(r.sell > ingVal, `marge négative sur ${rid} (${r.sell} <= ${ingVal})`);
    }

    for (const uid of BEUH_UPGRADE_IDS) {
        assert.ok(['dirty', 'clean'].includes(BEUH_UPGRADES[uid].currency));
    }

    const checkSvg = (label, svg) => {
        assert.ok(typeof svg === 'string' && svg.includes('<svg') && svg.length > 150, `SVG manquant : ${label}`);
        assert.ok(!/undefined|NaN/.test(svg), `SVG corrompu : ${label}`);
    };

    checkSvg('logo', beuhLogoSvg());
    checkSvg('emptyPot', beuhEmptyPotSvg());
    for (const sid of BEUH_STRAIN_IDS) {
        for (const st of [0, 1, 2]) checkSvg(`plant:${sid}:${st}`, beuhPlantSvg(sid, st));
        checkSvg(`icon:${sid}`, beuhIconSvg(sid));
    }
    for (const id of ['dirty', 'clean', 'heat', ...BEUH_RECIPE_IDS, ...BEUH_STATION_IDS, ...BEUH_FRONT_IDS]) {
        checkSvg(`icon:${id}`, beuhIconSvg(id));
    }
});
