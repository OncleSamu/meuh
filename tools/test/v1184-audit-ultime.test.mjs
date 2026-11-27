// 1.184 : Tests complets de l'Audit Ultime (Phases 1 à 4).
import test from 'node:test';
import assert from 'node:assert/strict';
import { clock, memStore } from './helpers.mjs';
import { state, setStore, getStore, SAVE_KEY } from '../../src/core/state.js';
import { setView } from '../../src/core/view.js';
import * as G from '../../src/systems/index.js';
import { RECIPES } from '../../src/data/machines.js';
import { DEFI } from '../../src/data/defis.js';
import { METIER_IDS } from '../../src/data/metiers.js';
import { TCG_CARDS, TCG_LEAGUES } from '../../src/data/tcg.js';
import { MUSEUM_EXHIBIT_IDS } from '../../src/data/museum.js';
import { SPR } from '../../src/art/index.js';

function fresh(lvl = 100) {
    setStore(memStore());
    G.loadGame();
    setView({ started: false, tab: 'farm' });
    state.level = lvl;
    state.money = 50_000_000;
    state.stats.earnedRun = 50_000_000;
    G.ensureTeam();
    G.ensureIsland();
}

test('Phase 1 : Series 10 MeuhCG sprites utilisent ui et se dessinent', () => {
    const s10 = TCG_CARDS.filter(c => c.series === 'profondeurs');
    assert.ok(s10.length >= 25);
    for (const c of s10) {
        if (c.spr[0] === 'ui') assert.ok(SPR.has.ui[c.spr[1]], `ui.${c.spr[1]} existe`);
        else if (c.spr[0] === 'item') assert.ok(SPR.has.items[c.spr[1]], `item.${c.spr[1]} existe`);
    }
    assert.equal(TCG_LEAGUES[4].icon[0], 'ui');
    assert.ok(SPR.has.ui[TCG_LEAGUES[4].icon[1]]);
});

test('Phase 1 : Prestige préserve skills161 et ne réinitialise pas les compétences au rechargement', () => {
    fresh(100);
    assert.ok(G.doPrestige('', 'none'));
    assert.equal(state.skills161, true);
    assert.equal(state.lv1174, true);
    state.level = 10;
    state.skills.green = 2;
    getStore().setItem(SAVE_KEY, JSON.stringify(state));
    G.loadGame();
    assert.equal(state.skills.green, 2);
});

test('Phase 1 : Mine étage 5/40 empêche le farm infini de coffre le même jour', () => {
    fresh(65);
    const D = G.ensureMineDeep();
    D.maxFloor = 10;
    D.floor = 1;
    D.energy = 100;
    assert.ok(G.mineGoFloor(5));
    const idx = D.grid.findIndex(c => c.kind === 'chest');
    assert.ok(idx >= 0, 'coffre présent à la 1re visite étage 5');
    D.grid[idx].state = 'open';
    assert.ok(G.mineDig(idx));
    // Impossible de relancer le même étage 5
    assert.equal(G.mineGoFloor(5), false);
    // Retour étage 1 puis étage 5 le même jour : plus de coffre !
    assert.ok(G.mineGoFloor(1));
    assert.ok(G.mineGoFloor(5));
    assert.equal(D.grid.some(c => c.kind === 'chest'), false);
});

test('Phase 2 : Pot de peinture fabricable dès niv. 18, Défis dès niv. 75, 7e Métier Artisan', () => {
    assert.ok(RECIPES.paint);
    assert.equal(RECIPES.paint.lvl, 18);
    assert.equal(RECIPES.paint.machine, 'marmite');
    assert.equal(DEFI.lvl, 75);
    assert.equal(METIER_IDS.length, 7);
    assert.ok(METIER_IDS.includes('artisan'));
    assert.equal(G.metierOf('vase'), 'artisan');
});

test('Phase 2 : Étal 2.0 vend par rang de qualité et restitue la qualité si retiré', () => {
    fresh(40);
    state.inventory.wheat = 5;
    G.addQuality('wheat', 2, 3);
    const pStd = G.stallUnit('wheat', 1, 0);
    const pGold = G.stallUnit('wheat', 1, 2);
    assert.ok(pGold > pStd, 'qualité or mieux payée à l’étal');
    assert.equal(G.stallQualityStock('wheat', 2), 3);
    assert.ok(G.listStall(0, 'wheat', 2, 1, null, 2));
    assert.equal(G.qual('wheat').g, 1);
    assert.ok(G.cancelStall(0));
    assert.equal(G.qual('wheat').g, 3);
});

test('Phase 2 : Musée Tout casser (museumCrackEveryGeode)', () => {
    fresh(30);
    const D = G.ensureMineDeep();
    D.geodes = { geodeStone: 2, geodeAmethyst: 1 };
    const opened = G.museumCrackEveryGeode();
    assert.equal(opened, 3);
    assert.equal(G.museumGeodeTotal(), 0);
});

test('Phase 3 : Équipe 2.0 (Camille Intendante des Contrées + Milo ruches/filet de mer)', () => {
    fresh(95);
    assert.ok(SPR.villager('camille').includes('<svg'));
    for (const k of ['tools', 'solidOak', 'cutStone', 'ironIngot', 'silverIngot']) state.inventory[k] = 100;
    assert.ok(G.upgradeCamille());
    assert.equal(G.camilleLvl(), 1);
    state.projects.ferry = { done: true };
    G.ensureIsland();
    const p0 = G.islandPlots()[0];
    p0.open = true;
    p0.id = 'pineapple';
    p0.ready = true;
    state.seeds.pineapple = 5;
    const res = G.camillePass();
    assert.ok(res && res.harvested >= 1 && res.planted >= 1);
});

test('Phase 3 : Île 2.0 (Goélette des îles + Lagon aux perles)', () => {
    fresh(50);
    state.projects.ferry = { done: true };
    G.ensureIsland();
    assert.ok(SPR.has.ui.schooner && SPR.has.ui.lagoon);
    const lag = G.harvestLagoon();
    assert.ok(lag && Object.keys(lag.got).length >= 1);
    assert.equal(G.lagoonReady(), false);

    state.inventory.pineapple = 10;
    assert.ok(G.schoonerAdd('pineapple', 6));
    assert.equal(G.schoonerLoads(), 6);
    assert.ok(G.schoonerSend());
    clock.t += 4 * 3600 * 1000;
    assert.equal(G.schoonerBack(), true);
    const moneyBefore = state.money;
    assert.ok(G.schoonerClaim());
    assert.ok(state.money > moneyBefore);
});

test('Phase 4 : La Maison 2.0 — Coffrets Prestige Multi-Ateliers dès niv. 62', () => {
    fresh(65);
    assert.equal(G.prestigeBoxOpen(), true);
    // Préparer 1 bière, 1 douceur, 1 parfum
    const B = G.ensureBrew();
    B.beers.b1 = { id: 'b1', name: 'Ambrée', malt: 'barleyMalt', hop: 'hop', ings: [['honey', 1]], stars: 3, value: 400 };
    B.stock.b1 = 2;
    state.inventory.darkChoc = 2;
    const P = G.ensurePerfume();
    P.creations.p1 = { id: 'p1', name: 'Bois d’Or', family: 'boise', stars: 3, value: 600 };
    P.stock.p1 = 2;

    assert.ok(G.setPrestigeSlot('drink', 'beer:b1'));
    assert.ok(G.setPrestigeSlot('conf', 'item:darkChoc'));
    assert.ok(G.setPrestigeSlot('perf', 'perf:p1'));
    const pv = G.prestigeBoxPreview();
    assert.equal(pv.ready, true);
    assert.equal(pv.theme.id, 'royalAbbaye');
    const moneyBefore = state.money;
    const crafted = G.craftPrestigeBox();
    assert.ok(crafted && state.money > moneyBefore);
    assert.equal(G.prestigeBookCount(), 1);
});

test('Phase 4 : Grande Aile des Expéditions du Musée', () => {
    fresh(65);
    const M = G.ensureMuseum();
    assert.equal(G.MUSEUM_EXPEDITIONS.length, 3);
    for (const id of MUSEUM_EXHIBIT_IDS.slice(0, 16)) {
        M.bag[id] = 1;
        G.museumDonate(id);
    }
    assert.equal(G.museumExpedOpen(), true);
    state.inventory.ironOre = 5;
    state.inventory.copperOre = 5;
    const D = G.ensureMineDeep();
    D.geodes.geodeStone = 2;
    assert.ok(G.museumStartExped('galeries'));
    clock.t += 3 * 3600 * 1000;
    assert.equal(G.museumExpedReady(), true);
    const res = G.museumClaimExped();
    assert.ok(res && res.coins === 12000 && res.renom === 1);
});

test('Phase 4 : Prestige 2.0 (rendement doux rubans, conservation métier/Maison & Boutique des Rubans)', () => {
    fresh(100);
    assert.equal(G.effectiveRubans(10), 10);
    assert.equal(G.effectiveRubans(15), 15);
    assert.ok(G.effectiveRubans(100) < 60 && G.effectiveRubans(100) > 45);

    state.prestige.rubans = 20;
    const slotsBefore = G.vaultSlots();
    assert.ok(G.buyRibbonPerk('vaultPlus'));
    assert.equal(state.prestige.rubans, 14);
    assert.equal(G.vaultSlots(), slotsBefore + 10);

    G.chooseMetier('artisan');
    assert.ok(G.doPrestige('', 'none'));
    assert.equal(G.ribbonHas('vaultPlus'), true);
    assert.equal(G.metierId(), 'artisan');
});
