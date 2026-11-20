// 1.150 : tests complets de La Grande Table Étoilée (Village › Table).
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { state, newState, setState } from '../../src/core/state.js';
import { setClock } from '../../src/core/clock.js';
import * as G from '../../src/systems/index.js';
import { sprite } from '../../src/art/index.js';
import { gtableRoomSvg } from '../../src/art/gtable.js';
import { GTABLE_LVL, GTABLE_HALLS, GTABLE_STYLES, GTABLE_RANKS } from '../../src/data/gtable.js';
import { GUIDE_PAGES } from '../../src/data/guide.js';

function freshFarm(lvl = 30) {
    setClock(() => 1_800_000_000_000);
    setState(newState());
    state.level = lvl;
    state.money = 5_000_000;
    state.inventory.plank = 300;
    state.inventory.stone = 300;
    state.inventory.beam = 100;
    G.ensureVillagers();
}

test('1.150 : icône cloche étoilée, salle SVG et page Guide présents', () => {
    const icoSvg = sprite('ui', 'gtable');
    assert.ok(icoSvg.includes('<svg') && icoSvg.length > 200);
    const room = gtableRoomSvg({ style: 'cristal', stars: 3, open: true, scented: true });
    assert.ok(room.includes('gt-room-svg') && room.includes('</svg>'));
    assert.ok(GUIDE_PAGES.some(p => p.id === 'gtable' && p.go === 'village/table'));
    assert.ok(G.unlocksAt(GTABLE_LVL).some(u => u.go === 'village/table'));
});

test('1.150 : ouverture au niveau 26, fondation, service complet, critique anonyme et Livre d’Or', () => {
    freshFarm(25);
    assert.equal(G.gtableOpen(), false);
    assert.equal(G.canBuildGTable(), false);

    state.level = GTABLE_LVL;
    assert.equal(G.gtableOpen(), true);
    assert.equal(G.canBuildGTable(), true);
    assert.equal(G.buildGTable(), true);
    assert.equal(G.gtableBuilt(), true);
    assert.equal(G.gtableHallDef().tables, GTABLE_HALLS[0].tables);

    // Préparer des plats, desserts, boissons et un coffret Maison VIP
    state.inventory.soup = 10;
    state.inventory.grilledFish = 10;
    state.inventory.pie = 10;
    state.inventory.redWine = 10;
    state.maison = { name: 'Maison Test', emblem: 'apple', palette: 0, rep: 0, stock: [{ id: 1, name: 'Coffret Terroir', val: 800, items: ['apple', 'cheese', 'honey'], q: 2, pack: 'carton' }], work: null, wait: {}, made: 1, sold: 0, n: 1, recipes: [], rn: 0 };

    assert.equal(G.gtableReadyToOpen(), true);
    assert.equal(G.openGTableService(), true);
    assert.equal(G.gtableTablesWaiting(), 3);

    // Vérifier qu'un critique anonyme est bien présent au 1er service
    assert.ok(state.gtable.service.tables.some(t => t.isCritic));

    // Comparer évaluation avec et sans accord boisson / cadeau Maison
    const baseEv = G.evaluateGTablePlate({ themeId: 'terroir', mainId: 'soup' });
    const fullEv = G.evaluateGTablePlate({ themeId: 'terroir', mainId: 'soup', sideId: 'pie', drinkKey: 'item:redWine', vipBoxIdx: 0 });
    assert.ok(fullEv.score > baseEv.score + 20);
    assert.ok(fullEv.pay > baseEv.pay * 2);

    // Servir les 3 tables
    const moneyBefore = state.money;
    for (let i = 0; i < 3; i++) {
        const tbl = state.gtable.service.tables[i];
        const mainId = tbl.themeId === 'mer' ? 'grilledFish' : 'soup';
        const vipBoxIdx = i === 0 ? 0 : -1;
        assert.equal(G.serveGTable(i, { mainId, sideId: 'pie', drinkKey: 'item:redWine', vipBoxIdx }), true);
    }

    // Le service se clôt automatiquement, paie, consomme le coffret VIP et publie la chronique du critique
    assert.equal(state.gtable.service, null);
    assert.ok(state.money > moneyBefore);
    assert.equal(state.maison.stock.length, 0);
    assert.equal(state.gtable.services, 1);
    assert.equal(state.gtable.covers, 3);
    assert.equal(state.gtable.reviews.length, 1);
    assert.ok(state.gtable.lastReport && state.gtable.lastReport.review);
    assert.ok(G.gtableCooldownLeft() > 0);
    assert.ok(state.income.gtable > 0);
});

test('1.150 : brigade (villageois + enfant adulte), parfum d’ambiance, rangs, agrandissement et Prestige', () => {
    freshFarm(60);
    assert.equal(G.buildGTable(), true);

    // Donner 3 cœurs à Mamie Odette et créer un enfant adulte
    state.villagers.odette.hearts = 3;
    state.family = {
        spouse: 'gaston',
        kids: [{ id: 1, name: 'Camille', bornAt: 0, grow: 100000, joy: 100 }],
    };

    const chefCands = G.gtableBrigadeCandidates('chef');
    assert.ok(chefCands.some(c => c.key === 'v:odette'));
    assert.ok(chefCands.some(c => c.key === 'k:1'));
    assert.equal(G.setGTableBrigade('chef', 'v:odette'), true);
    assert.equal(state.gtable.brigade.chef, 'v:odette');

    // Synergie Parfumerie : diffuser un parfum en salle
    state.perfume = {
        creations: { p1: { id: 'p1', name: 'Brise de Vallée', stars: 3, made: 2, head: 'lemon', heart: 'lavender', base: 'honey' } },
        stock: { p1: 2 },
        q: {},
        vats: [],
        orders: [],
        demand: {},
        signature: 'p1',
    };
    assert.equal(G.setGTableScent('p1'), true);
    assert.ok(G.gtableScentBonus() >= 10);
    // Signature ne consomme pas de flacon
    assert.equal(state.perfume.stock.p1, 2);

    // Simuler les critères de Bib Gourmand et finir un service pour monter de rang
    state.gtable.services = GTABLE_RANKS[1].need.services - 1;
    state.gtable.criticsWon = GTABLE_RANKS[1].need.critics;
    for (let k = 0; k < GTABLE_RANKS[1].need.dishes; k++) state.gtable.dishes['dish_' + k] = { n: 1, best: 80 };
    state.inventory.soup = 5;
    state.inventory.pie = 5;
    state.inventory.redWine = 5;
    state.gtable.nextAt = 0;
    assert.equal(G.openGTableService(), true);
    for (let i = 0; i < 3; i++) {
        assert.equal(G.serveGTable(i, { mainId: 'soup', sideId: 'pie', drinkKey: 'item:redWine' }), true);
    }
    assert.equal(G.gtableRank(), 1);
    assert.equal(G.gtableStyleDef().id, 'vichy');
    assert.equal(G.setGTableStyle(GTABLE_STYLES[1].id), true);
    assert.equal(G.gtableStyleDef().id, 'lin');
    assert.equal(G.upgradeGTableHall(), true);
    assert.equal(G.gtableHallDef().tables, 4);

    // Banquet du terroir
    assert.equal(G.runGTableBanquet('vendanges', { mainId: 'soup', sideId: 'pie', drinkKey: 'item:redWine' }), true);
    assert.equal(state.stats.gtableBanquets, 1);

    // Prestige conserve le rang, les styles, les chroniques et le palmarès
    if (!state.gtable.reviews.length) state.gtable.reviews.push({ criticId: 'valmont', criticName: 'Henri de Valmont', score: 92, won: true, day: 10, season: 'Printemps', quote: 'Bravo !' });
    state.level = 80;
    state.stats.earnedRun = 50_000_000;
    assert.equal(G.doPrestige(), true);
    assert.equal(state.gtable.rank, 1);
    assert.equal(state.gtable.style, 'lin');
    assert.ok(state.gtable.reviews.length >= 1);
    assert.equal(state.gtable.service, null);
});

test('1.150 : câblage UI complet (onglet Village › Table, actions, stats)', () => {
    const appSrc = fs.readFileSync(path.resolve('src/ui/app.js'), 'utf8');
    const mainSrc = fs.readFileSync(path.resolve('src/main.js'), 'utf8');
    const viewSrc = fs.readFileSync(path.resolve('src/ui/views/gtable.js'), 'utf8');
    assert.ok(appSrc.includes("['table', 'Table', ['ui', 'gtable']"));
    assert.ok(mainSrc.includes('setupGTable()'));
    assert.ok(viewSrc.includes("defineView('village/table'"));
    assert.ok(viewSrc.includes("defineSheet('gtableServe'"));
});
