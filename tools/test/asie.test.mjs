// 1.171 : Les Terres d'Asie (Ferme › Voyages) : rizières en terrasses, irrigation en cascade,
// rigoles de bambou, roue à eau en rythme, verger d'Asie, pavillon de bambou (cerf sika, ver à soie,
// poule soie), jonque de la soie, mousson & Hanami, chapitres 25-26, 3 ateliers, 41 recettes & 6 boissons.
import test from 'node:test';
import assert from 'node:assert/strict';
import { memStore } from './helpers.mjs';
import { state, setStore } from '../../src/core/state.js';
import { setView } from '../../src/core/view.js';
import { setClock } from '../../src/core/clock.js';
import * as G from '../../src/systems/index.js';
import { ANIMALS } from '../../src/data/animals.js';
import { MACHINES, RECIPES } from '../../src/data/machines.js';
import { ASIE, ASIE_CROPS, ASIE_TREES, ASIE_IDS, ASIE_BEAST_IDS, ASIE_PRODUCTS, PAVILION, JUNK, ASIE_WEATHER } from '../../src/data/asie.js';
import { MACHINES_ASIE, RECIPES_ASIE } from '../../src/data/ajouts/asie-cuisine.js';
import { NEW_DRINKS_ASIE } from '../../src/data/counter.js';
import { FLAVORS, ANIMAL_BASE } from '../../src/data/genetics.js';
import { ASSOCS } from '../../src/data/companions.js';
import { CHAPTERS, PROJECTS, CHAPTER_ORDER, VILLAGERS } from '../../src/data/village.js';
import { STORY_MAPS } from '../../src/data/meta.js';
import { APIARY, APIARY_LANDS } from '../../src/data/apiary.js';
import { LAND_HONEYS, HONEY_COL } from '../../src/data/honey.js';
import { CARNET } from '../../src/data/carnet.js';
import { TIPS } from '../../src/data/texts.js';
import { GUIDE_PAGES } from '../../src/data/guide.js';
import { SPR } from '../../src/art/index.js';
import { MAP_BG } from '../../src/art/maps.js';

const setNow = t => setClock(() => t);

function asie({ open = true, pavilion = false, junk = false, wheel = false } = {}) {
    setStore(memStore());
    setNow(1_700_000_000_000);
    G.loadGame();
    setView({ started: false, tab: 'farm' });
    state.level = 80;
    state.money = 100_000_000;
    state.inventory.stone = 600;
    state.inventory.plank = 400;
    state.inventory.tools = 80;
    state.inventory.beam = 400;
    state.inventory.wood = 800;
    state.inventory.ironBar = 100;
    state.inventory.feed = 200;
    if (open) state.projects.asiaSluice = { given: {}, done: true };
    if (wheel) state.projects.asiaWheel = { given: {}, done: true };
    if (pavilion) state.projects.asiaPavilion = { given: {}, done: true };
    if (junk) state.projects.asiaJunk = { given: {}, done: true };
    G.ensureAsie();
    return state.asie;
}

const run = sec => {
    for (let k = 0; k < sec; k++) G.asieTick();
};

test('fermé tant que la vanne de Mei n’est pas ouverte', () => {
    asie({ open: false });
    assert.equal(G.asieOpen(), false);
    state.projects.asiaSluice = { given: {}, done: true };
    assert.equal(G.asieOpen(), true);
});

test('huit terrasses au départ, vingt au plus', () => {
    const A = asie();
    assert.equal(A.plots.length, ASIE.cells);
    assert.equal(A.plots.filter(p => p.open).length, ASIE.cellsBase);
    assert.ok(G.buyAsieCell());
    assert.equal(A.plots.filter(p => p.open).length, ASIE.cellsBase + 1);
});

test('irrigation en cascade : rangée haute boit au bassin, rigole cascade avec +10 % par palier (max +30 %)', () => {
    const A = asie();
    // Ouvrir toutes les terrasses pour tester les 5 paliers (0..4)
    A.plots.forEach(p => (p.open = true));
    G.ensureAsie();

    // Rangée 0 (0..3) irriguée sans bonus de chute, rangées basses sèches sans rigole
    assert.equal(G.isIrrigated(0), true);
    assert.equal(G.cascadeDepth(0), 0);
    assert.equal(G.asieCellMult(0), 1);
    assert.equal(G.isIrrigated(4), false);
    assert.equal(G.asieCellMult(4), ASIE.dry);

    // Pose d'une rigole en bambou en (0, 1) -> index 1
    assert.ok(G.buildCanal(1));
    assert.equal(G.canalAt(1), true);
    // Colonne 1 sous la rigole : paliers 1 (+10%), 2 (+20%), 3 (+30%), 4 (plafonné à +30%)
    assert.equal(G.isIrrigated(5), true);
    assert.equal(G.cascadeDepth(5), 1);
    assert.equal(G.asieCellMult(5), 1.1);
    assert.equal(G.cascadeDepth(9), 2);
    assert.equal(G.asieCellMult(9), 1.2);
    assert.equal(G.cascadeDepth(13), 3);
    assert.equal(G.asieCellMult(13), 1.3);
    assert.equal(G.cascadeDepth(17), 3);
    assert.equal(G.asieCellMult(17), 1.3);
    // Colonne 2 en bas encore au sec sans double déversoir
    assert.equal(G.isIrrigated(6), false);

    // Amélioration Double déversoir (weir) : cascade sur 3 colonnes (-1, 0, +1)
    assert.ok(G.upgradeAsie('weir'));
    assert.equal(G.isIrrigated(4), true);
    assert.equal(G.isIrrigated(6), true);
    assert.equal(G.cascadeDepth(6), 1);
    assert.equal(G.isIrrigated(7), false);

    // Retirer la rigole libère la terrasse
    assert.ok(G.removeCanal(1));
    assert.equal(G.canalAt(1), false);
    assert.equal(G.isIrrigated(5), false);
});

test('améliorations du bassin : murets de pierre (-25 % conso) et grand réservoir (360 L, +14 L/h)', () => {
    asie();
    assert.equal(G.asieBasinCap(), ASIE.basin[0]);
    const baseSpring = G.asieSpringLph();
    assert.equal(baseSpring, ASIE.spring);
    state.seeds.lotus = 2;
    assert.ok(G.plantAsie(0, 'lotus'));
    const drainBefore = G.asieDrainLph();
    assert.ok(drainBefore > 0);

    assert.ok(G.upgradeAsie('terraceStone'));
    assert.ok(Math.abs(G.asieDrainLph() - drainBefore * ASIE.terraceStone) < 1e-6);

    assert.ok(G.upgradeAsie('reservoir'));
    assert.equal(G.asieBasinCap(), ASIE.basin[1]);
    assert.equal(G.asieSpringLph(), ASIE.spring + ASIE.springBonus);
});

test('pousse plus vite en cascade qu’au sec, et récolte/replantation fonctionnent', () => {
    const A = asie();
    A.plots.forEach(p => (p.open = true));
    G.ensureAsie();
    assert.ok(G.buildCanal(0));
    state.seeds.lotus = 5;
    assert.ok(G.plantAsie(12, 'lotus')); // palier 3 (+30 %)
    assert.ok(G.plantAsie(15, 'lotus')); // au sec (0.35)
    run(120);
    assert.ok(A.plots[12].prog > A.plots[15].prog * 3);

    // Rattrapage hors-ligne jusqu'à maturité
    const off = G.asieOffline(3600);
    assert.ok(off.crops >= 1);
    assert.equal(A.plots[12].ready, true);
    assert.ok(G.asieReady() >= 1);
    assert.ok(G.harvestAllAsie() >= 1);
    assert.ok(state.inventory.lotus >= 1);
    assert.ok(G.replantAsie() >= 1);
});

test('roue à eau en bambou : 3 séances par jour, remplit le bassin sans dépasser la capacité', () => {
    const A = asie({ wheel: true });
    A.water = 10;
    assert.equal(G.wheelLeft(), ASIE.wheel.perDay);
    const got = G.wheelDraw([1, 1, 1, 1, 1, 1]);
    assert.equal(got, ASIE.wheel.max);
    assert.equal(G.wheelLeft(), ASIE.wheel.perDay - 1);
    assert.equal(A.water, 10 + got);
    G.wheelDraw([1, 1, 1, 1, 1, 1]);
    G.wheelDraw([1, 1, 1, 1, 1, 1]);
    assert.equal(G.wheelLeft(), 0);
    assert.equal(G.wheelDraw([1, 1, 1, 1, 1, 1]), 0);
    assert.ok(A.water <= G.asieBasinCap());
});

test('verger des Terres d’Asie : 6 arbres et zone asieV séparée', () => {
    asie();
    const list = G.treeList('asieV');
    assert.equal(list.length, ASIE_TREES.length);
    assert.ok(G.slotsOf('asieV').filter(s => s.open).length >= 3);
    state.seeds.yuzu = 1;
    assert.ok(G.plantTree(0, 'yuzu', null, 'asieV'));
    assert.equal(G.slotsOf('asieV')[0].tree.id, 'yuzu');
});

test('pavillon de bambou : isolé des autres enclos, agrandissable 12 -> 20, ver à soie sensible au bassin sec', () => {
    const A = asie({ pavilion: true });
    assert.equal(G.asiaPavilionOpen(), true);
    assert.equal(G.asiaPavilionCap(), PAVILION.cap[0]);
    for (const id of ASIE_BEAST_IDS) {
        assert.ok(G.buy('animal', id, 1, null), `achat ${id}`);
    }
    assert.equal(G.asieBeasts().length, 3);
    assert.equal(G.inPasture(PAVILION.key).length, 3);
    assert.equal(G.inPasture(0).length, 0);

    // Rendre les bêtes adultes
    const sw = G.asieBeasts().find(a => a.type === 'silkworm');
    const sk = G.asieBeasts().find(a => a.type === 'sika');
    sw.adult = true;
    sk.adult = true;
    A.water = 50;
    assert.equal(G.asieBeastMult(sw), 1);
    A.water = 0;
    assert.equal(G.asieBeastMult(sw), PAVILION.dryMult);
    assert.equal(G.asieBeastMult(sk), 1); // le cerf sika ne craint pas la sécheresse

    assert.ok(G.upAsiePavilion());
    assert.equal(G.asiaPavilionCap(), PAVILION.cap[1]);
});

test('jonque de la soie : 3 cerfs sika adultes, 18×10 charges, ×2,7 sur produits d’Asie, +15 % avec lanternes, retour 7 h', () => {
    const A = asie({ pavilion: true, junk: true });
    assert.equal(G.junkOpen(), true);
    for (let i = 0; i < 3; i++) G.buy('animal', 'sika', 1, null);
    G.asieBeasts().forEach(a => (a.adult = true));
    assert.equal(G.junkSikas().length, 3);

    state.inventory.yuzuMochi = 30;
    assert.ok(G.junkAdd('yuzuMochi', 2));
    assert.equal(G.junkLoads(), 2);
    const baseMult = G.junkMult('yuzuMochi');
    assert.equal(baseMult, JUNK.mult);
    assert.equal(G.junkMult('wheat'), JUNK.otherMult);

    state.projects.asiaLanterns = { given: {}, done: true };
    assert.ok(Math.abs(G.junkMult('yuzuMochi') - JUNK.mult * (1 + JUNK.lanternBonus)) < 1e-6);

    const expectedVal = G.junkValue();
    assert.ok(G.junkSend());
    assert.equal(G.junkSikas().length, 0); // partis en mer
    assert.equal(G.junkBack(), false);

    // Avancer de 7 heures
    setNow(A.junk.out.back + 1000);
    assert.equal(G.junkBack(), true);
    const beforeMoney = state.money;
    const res = G.junkClaim();
    assert.ok(res);
    assert.equal(res.value, expectedVal);
    assert.ok(state.money >= beforeMoney + expectedVal);
    assert.equal(G.junkSikas().length, 3); // revenus
});

test('mousson & Hanami : mousson irrigue tout, multiplie la source, envasement drainable, retarde la jonque ; Hanami ×1,5', () => {
    const A = asie({ pavilion: true, junk: true });
    for (let i = 0; i < 3; i++) G.buy('animal', 'sika', 1, null);
    G.asieBeasts().forEach(a => (a.adult = true));
    state.inventory.lotus = 20;
    G.junkAdd('lotus', 1);
    G.junkSend();
    const backBefore = A.junk.out.back;

    state.seeds.lotus = 4;
    G.plantAsie(0, 'lotus');
    G.plantAsie(4, 'lotus');
    A.water = 0;
    assert.equal(G.isIrrigated(4), false);

    // Déclencher mousson et Hanami
    A.monsoonAt = 1_700_000_000_000 - 1;
    A.hanamiAt = 1_700_000_000_000 - 1;
    G.asieWeatherTick();
    assert.equal(G.monsoonOn(), true);
    assert.equal(G.hanamiOn(), true);
    assert.equal(G.isIrrigated(4), true);
    assert.equal(G.asieSpringLph(), ASIE.spring * ASIE_WEATHER.monsoon.springMult);
    assert.equal(A.junk.out.back, backBefore + JUNK.monsoonDelay);

    // Drainage d'une case envasée
    const muddyIdx = A.plots.findIndex(p => p.mud);
    if (muddyIdx >= 0) {
        assert.ok(G.clearMud(muddyIdx));
        assert.equal(A.plots[muddyIdx].mud, false);
    }
});

test('données complètes : chapitres 25-26, villageois, 3 ateliers, 41 recettes, 6 boissons, rucher, carnet, guide, sprites', () => {
    assert.ok(CHAPTERS.find(c => c.n === 25 && c.map === 'asie'));
    assert.ok(CHAPTERS.find(c => c.n === 26 && c.map === 'asie'));
    assert.equal(CHAPTER_ORDER.at(-2), 25);
    assert.equal(CHAPTER_ORDER.at(-1), 26);
    assert.ok(VILLAGERS.mei && VILLAGERS.kenji);
    assert.ok(STORY_MAPS.some(m => m.id === 'asie'));
    assert.ok(MAP_BG.asie && MAP_BG.asie.length > 100);
    for (const pid of ['asiaSluice', 'asiaWheel', 'asiaGrove', 'asiaPavilion', 'asiaJunk', 'asiaLanterns']) {
        assert.ok(PROJECTS[pid], `projet ${pid}`);
    }

    assert.equal(MACHINES_ASIE.length, 3);
    for (const [mid] of MACHINES_ASIE) {
        assert.ok(MACHINES[mid], `machine ${mid}`);
        assert.ok(SPR.machine(mid).length > 120, `sprite machine ${mid}`);
    }
    assert.equal(RECIPES_ASIE.length, 41);
    assert.equal(NEW_DRINKS_ASIE.length, 6);

    // Chaque matière première d'Asie est utilisée dans au moins 3 recettes
    const rawAsie = [...ASIE_CROPS.map(c => c[0]), ...ASIE_TREES.map(t => t[0]), ...ASIE_PRODUCTS.map(p => p[0]), 'starAnise'];
    for (const id of rawAsie) {
        const uses = Object.values(RECIPES).filter(r => r.ing && r.ing[id]).length;
        assert.ok(uses >= 3, `${id} utilisé ${uses} fois (< 3)`);
        assert.ok(SPR.item(id).length > 120, `sprite item ${id}`);
    }

    // Toutes les recettes et boissons d'Asie ont une anecdote Carnet (> 80 chars) et un sprite
    for (const [id] of [...RECIPES_ASIE, ...NEW_DRINKS_ASIE]) {
        assert.ok(RECIPES[id], `recette ${id}`);
        assert.ok(CARNET[id] && CARNET[id].length > 80, `carnet ${id}`);
        assert.ok(SPR.item(id).length > 120, `sprite ${id}`);
    }

    // Génétique, rucher, miels, associations, tips, guide
    for (const id of ASIE_IDS) assert.ok(FLAVORS[id], `flavor ${id}`);
    for (const id of ASIE_BEAST_IDS) {
        assert.ok(ANIMALS[id] && ANIMALS[id].asie, `animal ${id}`);
        assert.ok(ANIMAL_BASE[id], `ANIMAL_BASE ${id}`);
        assert.ok(SPR.animal(id).length > 120, `sprite animal ${id}`);
    }
    assert.ok(APIARY.asie && APIARY_LANDS.includes('asie'));
    assert.ok(LAND_HONEYS.yuzu && LAND_HONEYS.lotus);
    assert.ok(HONEY_COL.yuzu && HONEY_COL.lotus);
    assert.ok(ASSOCS.some(a => a.id === 'lotusBambou'));
    const gPage = GUIDE_PAGES.find(p => p.id === 'asie');
    assert.ok(gPage && gPage.secs.length >= 6);
    for (const k of ['asie', 'asieCanal', 'asieWheel', 'asieDry', 'asieGrove', 'monsoon', 'hanami', 'junk', 'sika', 'silkworm', 'silkie']) {
        assert.ok(TIPS[k], `tip ${k}`);
    }
});
