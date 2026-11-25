// 1.176 : L’Asie partout — Parfumerie, Brasserie & Hydromel, TCG Série 9 & Cave d’affinage.
import test from 'node:test';
import assert from 'node:assert/strict';
import { memStore } from './helpers.mjs';
import { state, setStore, newState, setState } from '../../src/core/state.js';
import { setView } from '../../src/core/view.js';
import * as G from '../../src/systems/index.js';
import { PERFUME_NOTES, PERFUME_CLASSICS, PERFUME_ORDERS } from '../../src/data/perfume.js';
import { CLASSICS, MEAD_BASES, MEAD_CLASSICS } from '../../src/data/abbey.js';
import { CAVE_ITEMS } from '../../src/data/cave.js';
import { TCG_SERIES, TCG_SET_IDS, TCG_CARDS, TCG_VILLAGER_DUELS, TCG_DUOS, TCG_CARD_BACKS } from '../../src/data/tcg.js';
import { SPR } from '../../src/art/index.js';

function fullFarm() {
    setStore(memStore());
    G.loadGame();
    setView({ started: false, tab: 'farm', hidden: false });
    state.tutorial.done = true;
    state.level = 100;
    state.money = 1e9;
    state.barn.lvl = 14;
    for (const p of ['brewhall', 'fermenters', 'labelshop', 'barrelcellar', 'asiaSluice', 'asiaPavilion', 'asiaGrove']) {
        state.projects[p] = { done: true };
    }
}

test('1.176 : Parfumerie — 6 essences d’Asie, classique Jardins de Lotus et Mei au Salon', () => {
    for (const id of ['yuzu', 'kumquat', 'lotus', 'ume', 'ginkgo', 'bambooShoot']) {
        assert.ok(PERFUME_NOTES[id], `note ${id} présente dans PERFUME_NOTES`);
    }
    assert.ok(PERFUME_CLASSICS.some(c => c.id === 'jardinsAsie'));
    assert.ok(PERFUME_ORDERS.villagers.includes('mei'));
    fullFarm();
    G.ensurePerfume();
    for (const id of ['yuzu', 'kumquat', 'lotus', 'ume', 'ginkgo', 'bambooShoot']) state.inventory[id] = 30;
    assert.ok(G.setPerfumeNote('head', 'yuzu'));
    assert.ok(G.setPerfumeNote('heart', 'lotus'));
    assert.ok(G.setPerfumeNote('base', 'ginkgo'));
    const pv = G.perfumePreview();
    assert.equal(pv.harmony.classic, 'jardinsAsie');
    assert.equal(pv.name, 'Jardins de Lotus');
    assert.equal(pv.harmony.stars, 3);
    assert.equal(G.perfumeClassic('kumquat', 'ume', 'bambooShoot')?.id, 'jardinsAsie');
});

test('1.176 : Brasserie & Hydromel — Bière au yuzu, miels lotus & yuzu et Hydromel impérial', () => {
    assert.ok(CLASSICS.some(c => c.id === 'yuzuAle'));
    assert.ok(MEAD_BASES.lotus && MEAD_BASES.yuzu, 'bases hydromel lotus et yuzu');
    assert.ok(MEAD_CLASSICS.some(c => c.id === 'imperialMead'));
    fullFarm();
    state.inventory.maltBlond = 20;
    state.inventory.hop = 20;
    state.inventory.yuzu = 20;
    state.inventory.lotus = 20;
    const beerPv = G.brewPreview({
        malt: 'maltBlond',
        hop: 1,
        ings: [
            ['yuzu', 1],
            ['lotus', 1],
        ],
    });
    assert.equal(beerPv.harmony.classic, 'yuzuAle');
    assert.equal(beerPv.harmony.stars, 3);

    // Hydromel au miel de yuzu + lotus -> Hydromel impérial
    const meadPv = G.brewPreview({ malt: 'mead:yuzu', hop: 0, ings: [['lotus', 1]] });
    assert.equal(meadPv.harmony.classic, 'imperialMead');
    assert.equal(G.baseOf('mead:lotus').honey, 'lotus');
    assert.equal(G.baseOf('mead:yuzu').honey, 'yuzu');
});

test('1.176 : TCG Série 9 · Terres d’Asie — 35 cartes, Mei & Kenji, 2 Duos secrets et dos Laque & Cerisier', () => {
    assert.ok(TCG_SERIES.asie && TCG_SET_IDS.includes('asie'));
    const asieCards = TCG_CARDS.filter(c => c.series === 'asie');
    assert.equal(asieCards.length, 35);
    for (const c of asieCards) {
        const [kind, sid] = c.spr;
        const svg = SPR[kind](sid);
        assert.ok(svg.includes('<svg') && !/undefined|NaN/.test(svg), `sprite ${c.id}`);
    }
    assert.ok(TCG_VILLAGER_DUELS.some(v => v.id === 'v_mei'));
    assert.ok(TCG_VILLAGER_DUELS.some(v => v.id === 'v_kenji'));
    assert.ok(TCG_DUOS.some(d => d.id === 'terrasses'));
    assert.ok(TCG_DUOS.some(d => d.id === 'soie'));
    assert.ok(TCG_CARD_BACKS.some(b => b.id === 'sakura'));

    setState(newState());
    G.loadGame();
    const T = G.ensureTcg();
    T.tokens = 500;
    const pack = G.tcgOpenPack('asie');
    assert.ok(pack && pack.cards.length === 5);
    assert.ok(pack.cards.every(x => TCG_CARDS.find(c => c.id === x.id).series === 'asie'));
    G.tcgClosePack();

    // Duos Terrasses & Soie + duels contre Mei et Kenji
    for (const c of TCG_CARDS) T.cards[c.id] = 1;
    const duos = G.tcgDeckDuos(['z30', 'z31', 'z21', 'z25', 'z01']);
    assert.ok(duos.some(d => d.id === 'terrasses'));
    assert.ok(duos.some(d => d.id === 'soie'));
    assert.equal(G.tcgSetCardBack('sakura'), true);
    assert.equal(G.tcgCardBack(), 'sakura');
    T.deck = ['z01', 'z02', 'z03', 'z20', 'z30'];
    assert.equal(G.tcgStartDuel('v_mei'), true);
    G.tcgEndDuel();
    assert.equal(G.tcgStartDuel('v_kenji'), true);
    G.tcgEndDuel();
});

test('1.176 : Cave d’affinage — Caillé de sika, Poiré de nashi et Liqueur d’ume', () => {
    assert.equal(CAVE_ITEMS.sikaTofuCheese, 'cheese');
    assert.equal(CAVE_ITEMS.nashiCider, 'cider');
    assert.equal(CAVE_ITEMS.umeshu, 'cider');
    fullFarm();
    G.ensureCave();
    state.inventory.sikaTofuCheese = 8;
    state.inventory.nashiCider = 8;
    state.inventory.umeshu = 8;
    const cands = G.caveCandidates();
    assert.ok(cands.includes('sikaTofuCheese'));
    assert.ok(cands.includes('nashiCider'));
    assert.ok(cands.includes('umeshu'));
    assert.ok(G.putInCave(0, 'sikaTofuCheese', 2));
    assert.ok(G.putInCave(1, 'nashiCider', 2));
    assert.ok(G.putInCave(2, 'umeshu', 2));
});
