// 1.172 : La Mine souterraine (40 étages, 4 strates, grille 5×5, outils tactiques, améliorations)
// et Le Musée de la vallée (Menu › Collections › Musée : 4 ailes, 32 pièces, géodes, paliers, bonus permanents).
import test from 'node:test';
import assert from 'node:assert/strict';
import { memStore } from './helpers.mjs';
import { state, setStore } from '../../src/core/state.js';
import { setView } from '../../src/core/view.js';
import { setClock } from '../../src/core/clock.js';
import * as G from '../../src/systems/index.js';
import { MINE_DEEP, MINE_STRATA, GEODE_IDS, MINE_UPS } from '../../src/data/mine.js';
import { MUSEUM_WINGS, MUSEUM_EXHIBITS, MUSEUM_EXHIBIT_IDS, MUSEUM_BY_WING, MUSEUM_MILESTONES } from '../../src/data/museum.js';
import { DECOS } from '../../src/data/farm.js';
import { GUIDE_PAGES } from '../../src/data/guide.js';
import { TIPS } from '../../src/data/texts.js';
import { SPR } from '../../src/art/index.js';

const setNow = t => setClock(() => t);

function setupMineMuseum({ lvl = 60, gear = true, pick = 4 } = {}) {
    setStore(memStore());
    setNow(1_700_000_000_000);
    G.loadGame();
    setView({ started: false, tab: 'farm' });
    state.level = lvl;
    state.money = 5_000_000;
    state.tools.pick = pick;
    if (gear) {
        G.ensureNat();
        state.nat.gear.lamp = true;
        state.nat.gear.cart = true;
    }
    Object.assign(state.inventory, {
        coal: 200,
        ironIngot: 40,
        copperIngot: 40,
        silverIngot: 40,
        goldIngot: 40,
        quartz: 20,
    });
    G.ensureMineDeep();
    G.ensureMuseum();
    return { D: state.mineDeep, M: state.museum };
}

test('mine souterraine : ouverte au niveau 8, 4 strates et verrouillages d’équipement/pioche', () => {
    setupMineMuseum({ lvl: 7, gear: false, pick: 0 });
    assert.equal(G.mineDeepOpen(), false);
    state.level = 8;
    assert.equal(G.mineDeepOpen(), true);
    assert.equal(G.mineStratumOpen(MINE_STRATA[0]), true);
    assert.equal(G.mineStratumOpen(MINE_STRATA[1]), false); // niveau 18 + lampe/wagonnet
    state.level = 20;
    assert.equal(G.mineStratumOpen(MINE_STRATA[1]), false); // manque lampe/wagonnet
    state.nat.gear.lamp = true;
    state.nat.gear.cart = true;
    assert.equal(G.mineStratumOpen(MINE_STRATA[1]), true);
    state.level = 60;
    assert.equal(G.mineStratumOpen(MINE_STRATA[3]), false); // manque pioche niv. 4+ (pick >= 3)
    state.tools.pick = 3;
    assert.equal(G.mineStratumOpen(MINE_STRATA[3]), true);
});

test('grille 5×5 : escalier caché garanti, coffre tous les 5 étages, fouille et descente', () => {
    const { D } = setupMineMuseum();
    assert.equal(D.grid.length, MINE_DEEP.cells);
    const stairK = D.grid.findIndex(c => c.stairs);
    assert.ok(stairK >= 0, 'escalier présent');
    const e0 = G.mineEnergy();
    const res = G.mineDig(stairK);
    assert.ok(res && res.status === 'done' && res.stairs);
    assert.equal(G.mineEnergy(), e0 - 1);

    // Toucher l'escalier découvert descend à l'étage 2
    assert.ok(G.mineUseStairs());
    assert.equal(D.floor, 2);
    assert.equal(D.maxFloor, 2);

    // Vérifier coffre garanti à l'étage 5 et déblocage de l'ascenseur
    D.floor = 4;
    D.grid = G.mineGenerateFloor(4);
    const s4 = D.grid.findIndex(c => c.stairs);
    D.grid[s4].cleared = true;
    assert.ok(G.mineUseStairs());
    assert.equal(D.floor, 5);
    assert.ok(D.grid.some(c => c.kind === 'chest'), 'coffre à l’étage 5');
    assert.ok(G.mineElevators().includes(5));
    assert.ok(G.mineGoFloor(1));
    assert.equal(D.floor, 1);
    assert.ok(G.mineGoFloor(5));
    assert.equal(D.floor, 5);
});

test('outils tactiques : dynamite, boussole, recharge lanterne hors-ligne, casse-croûte et 4 améliorations', () => {
    const { D } = setupMineMuseum();
    // Boussole révèle l'escalier et les gisements rares
    assert.ok(G.mineSonar());
    const stairCell = D.grid.find(c => c.stairs);
    assert.equal(stairCell.hinted, true);
    assert.equal(G.mineSonar(), false); // une fois par étage

    // Dynamite dégage la croix autour du centre (5 cases) sans consommer la lanterne
    const eBefore = G.mineEnergy();
    const cleared = G.mineBomb(12);
    assert.equal(cleared, 5);
    assert.equal(G.mineEnergy(), eBefore);

    // Améliorations : Caisse de dynamite -> carré 3×3 (9 cases), Réservoir +15 coups, Lampe frontale +15 coups, Treuil
    for (const u of MINE_UPS) assert.ok(G.mineBuyUpgrade(u.id), `upgrade ${u.id}`);
    assert.equal(G.mineMaxEnergy(), MINE_DEEP.energyBase + 30);

    D.grid = G.mineGenerateFloor(1);
    assert.equal(G.mineBomb(12), 9); // 3×3 complet avec bombBelt

    // Recharge hors-ligne + casse-croûte au charbon (2×/jour)
    D.energy = 5;
    D.energyAt = 1_700_000_000_000;
    setNow(1_700_000_000_000 + G.mineRegenSec() * 3 * 1000 + 500);
    assert.equal(G.mineEnergy(), 8);
    assert.equal(G.mineSnackLeft(), 2);
    assert.ok(G.mineSnack());
    assert.equal(G.mineEnergy(), G.mineMaxEnergy());
    assert.equal(G.mineSnackLeft(), 1);
});

test('Musée : 32 pièces en 4 ailes, dons, vente des doublons, paliers et bonus permanents (XP & Prix)', () => {
    setupMineMuseum();
    assert.equal(MUSEUM_WINGS.length, 4);
    assert.equal(MUSEUM_EXHIBIT_IDS.length, 32);

    // Avant dons : bonus à 0 %
    assert.equal(G.museumBonus('xp'), 0);
    assert.equal(G.museumBonus('sell'), 0);
    const basePriceMult = G.priceMult();

    // Donner 4 fossiles (moitié de Paléontologie -> +5 % XP) + 1 doublon vendable
    const fossils = MUSEUM_BY_WING.fossils;
    for (let i = 0; i < 4; i++) G.museumAddSpecimen(fossils[i], 1, null, true);
    G.museumAddSpecimen(fossils[0], 2, null, true); // 2 doublons
    assert.equal(G.museumDonateReady(), 4);
    assert.equal(G.museumDonateAll(), 4);
    assert.equal(G.museumWingBonusPct('fossils'), 5);
    assert.equal(G.museumBonus('xp'), 0.05);

    // Vente des doublons
    const dupeVal = G.museumDupeValue();
    assert.equal(dupeVal, 2 * MUSEUM_EXHIBITS[fossils[0]].sell);
    assert.equal(G.museumSellDupes(), dupeVal);
    assert.equal(G.museumDupeValue(), 0);

    // Compléter Reliques (8/8 -> +6 % prix de vente dans priceMult)
    for (const id of MUSEUM_BY_WING.relics) G.museumAddSpecimen(id, 1, null, true);
    assert.equal(G.museumDonateAll(), 8);
    assert.equal(G.museumWingBonusPct('relics'), 6);
    assert.ok(Math.abs(G.priceMult() / basePriceMult - 1.06) < 1e-6);

    // Palier 12 dons débloque la déco exclusive museumFossil dans state.decorInv
    assert.equal(G.museumDonatedCount(), 12);
    assert.ok(G.museumClaimMilestone(12));
    assert.equal(state.decorInv.museumFossil, 1);
    assert.equal(G.museumClaimMilestone(12), false); // pas de double réclamation
});

test('Atelier de géodes et géode mystère du jour', () => {
    const { D } = setupMineMuseum();
    D.maxFloor = 25;
    assert.equal(G.museumShopGeodeId(), 'geodeCrystal');
    assert.equal(G.museumShopLeft(), 1);
    assert.ok(G.museumBuyGeode());
    assert.equal(G.museumShopLeft(), 0);
    assert.equal(G.museumGeodeTotal(), 1);

    const res = G.museumCrackGeode('geodeCrystal');
    assert.ok(res && (res.kind === 'specimen' || res.kind === 'item'));
    assert.equal(G.museumGeodeTotal(), 0);
    assert.equal(state.museum.geodesCracked, 1);
});

test('Prestige conserve les dons, paliers du Musée et les équipements/records de la Mine', () => {
    const { D } = setupMineMuseum({ lvl: 100 });
    D.maxFloor = 35;
    G.mineBuyUpgrade('lanternTank');
    G.museumAddSpecimen('msAmmonite', 1, null, true);
    G.museumDonate('msAmmonite', null, true);
    state.stats.earnedRun = 1_000_000;
    assert.ok(G.doPrestige());
    assert.equal(G.museumHasDonated('msAmmonite'), true);
    assert.equal(state.mineDeep.maxFloor, 35);
    assert.equal(G.mineUp('lanternTank'), true);
});

test('données & sprites : 32 pièces, 4 géodes, 3 décos, Anatole, icônes UI, tips et guide sans undefined', () => {
    const uiKeys = [
        'museum',
        'mineDeep',
        'mineStairs',
        'mineBomb',
        'mineSonar',
        'mineChest',
        'mineLantern',
        'mineRelicRock',
        'mineGeodeRock',
        'curatorAnatole',
        'museumFossil',
        'museumCrystal',
        'museumTrophy',
        ...GEODE_IDS,
        ...MUSEUM_EXHIBIT_IDS,
    ];
    for (const k of uiKeys) {
        const s = SPR.ui(k);
        assert.ok(s && s.includes('<svg') && s.length > 120, `sprite ui.${k}`);
        assert.ok(!s.includes('undefined') && !s.includes('NaN'), `svg propre ui.${k}`);
    }
    for (const d of ['museumFossil', 'museumCrystal', 'museumTrophy']) assert.ok(DECOS[d], `deco ${d}`);
    for (const m of MUSEUM_MILESTONES) assert.ok(m.at >= 4 && m.at <= 32);
    for (const t of ['mineDeep', 'geode', 'museum', 'museumWing']) assert.ok(TIPS[t], `tip ${t}`);
    const gPage = GUIDE_PAGES.find(p => p.id === 'museum');
    assert.ok(gPage && gPage.secs.length >= 3);
});
