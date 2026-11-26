// 1.178 : Suite de tests complète pour l'Atelier Confiserie (Chocolat, Caramel, Berlingots).
import test from 'node:test';
import assert from 'node:assert/strict';
import { memStore } from './helpers.mjs';
import { state, setStore } from '../../src/core/state.js';
import { setClock } from '../../src/core/clock.js';
import { setView } from '../../src/core/view.js';
import * as G from '../../src/systems/index.js';
import { CONF_LVL, CONF_KINDS, CONF_SHAPES, CONF_CLASSICS } from '../../src/data/confiserie.js';
import { confSvg, confUiIcon } from '../../src/art/confiserie.js';
import { SPR } from '../../src/art/index.js';
import { ACHIEVEMENTS } from '../../src/data/meta.js';
import { GUIDE_PAGES } from '../../src/data/guide.js';

function boot(lvl = CONF_LVL) {
    setStore(memStore());
    setClock(() => 1_700_000_000_000);
    G.loadGame();
    setView({ started: false, tab: 'machines' });
    state.level = lvl;
    state.money = 500_000;
}

test('1.178 : déblocage calme au niveau 54 + unlocksAt + guide + exploits', () => {
    assert.equal(CONF_LVL, 54);
    boot(53);
    assert.equal(G.confOpen(), false);
    assert.equal(G.confKettleCount(), 0);

    boot(54);
    assert.equal(G.confOpen(), true);
    assert.equal(G.confKettleCount(), 2);

    const unl = G.unlocksAt(54);
    assert.ok(unl.some(u => u.go === 'machines/confiserie'), 'unlocksAt(54) annonce la Confiserie');
    assert.ok(GUIDE_PAGES.some(g => g.id === 'confiserie' && g.lvl === 54), 'page de guide présente');
    assert.ok(ACHIEVEMENTS.some(a => a.id === 'confiseries'), 'succès confiseries présent');
    assert.ok(ACHIEVEMENTS.some(a => a.id === 'confOrders'), 'succès confOrders présent');
});

test('1.178 : art SVG — 12 formes + icône UI ui.confiserie, zéro émoji', () => {
    const icon = confUiIcon();
    assert.ok(icon.includes('<path') || icon.includes('<rect') || icon.includes('<circle'));
    assert.ok(SPR.ui('confiserie').includes('<svg'));
    assert.equal(Object.keys(CONF_SHAPES).length, 12);
    for (const [id, sh] of Object.entries(CONF_SHAPES)) {
        const s = confSvg({ kind: sh.kind, shape: id, baseCol: '#5b3019', baseCol2: '#3a1b0b', accentCol: '#f2c14e', mirror: true, classic: true });
        assert.ok(s.startsWith('<svg') && s.endsWith('</svg>'), `SVG valide pour ${id}`);
        assert.ok(!/[\u{1F300}-\u{1FAFF}]/u.test(s), `aucun émoji dans ${id}`);
    }
});

test('1.178 : 24 Grands Classiques (6 par métier) tous détectables', () => {
    assert.equal(CONF_CLASSICS.length, 24);
    for (const k of ['chocolate', 'caramel', 'berlingot', 'nougat']) {
        const list = CONF_CLASSICS.filter(c => c.kind === k);
        assert.equal(list.length, 6, `6 classiques pour ${k}`);
        for (const cl of list) {
            const base = cl.bases[0] === 'honey' ? 'honey:all' : cl.bases[0];
            const m = G.confClassicMatch(k, base, [cl.any[0]]);
            assert.ok(m && m.id === cl.id, `classique ${cl.id} reconnu`);
            const h = G.confHarmony(k, base, [cl.any[0]]);
            assert.equal(h.stars, 3, `classique ${cl.id} donne 3★`);
        }
    }
});

test('1.178 : mini-jeu 3★ Finition Miroir (+1 qualité jusqu’à Diamant) + Caramel au miel de fleur + Variété du Labo', () => {
    boot(60);
    G.ensureGenetics();
    state.genetics.bestFirst = true;

    // 1. Chocolat Noir + Orange (Orangettes Confites) avec ingrédients Platine -> 3★ mini-jeu => Diamant !
    state.inventory.cacao = 20;
    state.inventory.sugar = 20;
    state.inventory.orange = 20;
    state.quality.cacao = { s: 0, g: 0, p: 20, d: 0 };
    state.quality.sugar = { s: 0, g: 0, p: 20, d: 0 };
    state.quality.orange = { s: 0, g: 0, p: 20, d: 0 };

    G.setConfBase('chocolate', 'dark');
    G.setConfShape('chocolate', 'tablette');
    G.toggleConfIng('chocolate', 'orange');
    const pv = G.confPreview('chocolate');
    assert.equal(pv.can, true);
    assert.equal(pv.harmony.classic?.id, 'orangette');
    assert.equal(pv.q, 3, 'qualité de base Platine');

    const res = G.finishConfMini('chocolate', 3);
    assert.ok(res);
    assert.equal(res.mirror, true);
    assert.equal(res.q, 4, '3★ Finition Miroir monte de Platine à Diamant');
    assert.equal(G.confStock(res.id), CONF_KINDS.chocolate.batch);
    assert.equal(G.confQual(res.id).d, CONF_KINDS.chocolate.batch);
    assert.equal(G.confBestQuality(res.id), 4);

    // 2. Caramel au miel : tous les 30 miels du jeu sélectionnables (même hors stock) + miel de lavande en stock + variété du Labo
    assert.ok(G.confAllHoneys().length >= 30, 'tous les miels du jeu disponibles');
    assert.ok(G.setConfBase('caramel', 'honey:yuzu'), 'miel de yuzu sélectionnable même à 0 en stock');
    state.inventory.honey = 10;
    state.inventory.apple = 10;
    G.addHoney('lavender', 6);
    const bases = G.confBasesFor('caramel');
    assert.ok(bases.includes('honey:lavender'), 'miel de lavande proposé en base Caramel');
    assert.ok(G.setConfBase('caramel', 'honey:lavender'));

    const vid = 'v_test_apple';
    state.genetics.vars[vid] = { id: vid, base: 'apple', name: 'Pomme Dorée', fixed: true, g: G.parentGenome('apple') };
    state.genetics.stock[vid] = 5;
    state.genetics.q[vid] = { s: 0, g: 5, p: 0, d: 0 };

    G.toggleConfIng('caramel', vid);
    const pv2 = G.confPreview('caramel');
    assert.equal(pv2.can, true);
    const res2 = G.finishConfMini('caramel', 2);
    assert.ok(res2);
    assert.equal(res2.mirror, false);
    assert.equal(G.confStock(res2.id), CONF_KINDS.caramel.batch);
});

test('1.178 : chaudrons passifs, hors-ligne, ventes, commandes, cadeaux, coffre-fort, Livre et Prestige', () => {
    let nowMs = 1_700_000_000_000;
    setStore(memStore());
    setClock(() => nowMs);
    G.loadGame();
    setView({ started: false, tab: 'machines' });
    state.level = 60;
    state.money = 100_000;
    G.ensureVault();

    // Donner du stock pour berlingots
    state.inventory.sugar = 40;
    state.inventory.lemon = 20;
    state.inventory.strawberry = 20;
    G.setConfBase('berlingot', 'sugar');
    G.toggleConfIng('berlingot', 'lemon');

    // Cuisson passive au chaudron
    assert.equal(G.startConfKettle('berlingot'), true);
    assert.equal(G.confReadyCount(), 0);

    // Avancer le temps hors-ligne
    nowMs += 3600 * 1000;
    const done = G.confOffline();
    assert.equal(done, 1);
    assert.equal(G.confReadyCount(), 1);
    const got = G.collectConfKettle(0);
    assert.ok(got && got.qty === CONF_KINDS.berlingot.batch);

    // Renommer & Favori
    assert.equal(G.renameConf(got.id, 'Berlingots Royaux'), true);
    assert.equal(G.confOf(got.id).name, 'Berlingots Royaux');
    assert.equal(G.toggleConfFav(got.id), true);
    assert.equal(G.isConfFav(got.id), true);

    // Livre de la ferme : page Confiseries
    const pg = G.BOOK.find(p => p.id === 'confiseries');
    assert.ok(pg, 'page Confiseries présente dans BOOK');
    assert.equal(pg.entries().length, 1);
    const fiche = G.entryInfo('cf_' + got.id);
    assert.ok(fiche && fiche.lines.some(l => l[0] === 'Métier'));

    // Coffre-fort : ranger et reprendre
    const stockBefore = G.confStock(got.id);
    assert.equal(G.vaultPutConf(got.id), true);
    assert.equal(G.confStock(got.id), stockBefore - 1);
    const slotIdx = G.vaultList().findIndex(s => s && s.kind === 'confiserie');
    assert.ok(slotIdx >= 0);
    assert.ok(G.vaultSlotValue(G.vaultList()[slotIdx]) > 0);
    assert.equal(G.vaultTake(slotIdx), true);
    assert.equal(G.confStock(got.id), stockBefore);

    // Cadeau à un villageois
    const vid = Object.keys(state.villagers)[0] || 'gaston';
    assert.equal(G.giftConf(vid, got.id), true);
    assert.equal(state.stats.confGifts, 1);
    assert.equal(G.giftConf(vid, got.id), false, 'un seul cadeau confiserie par jour et villageois');

    // Commande gourmande
    state.confiserie.orders = [{ id: 'co_test', vid: 'lucie', kind: 'berlingot', minStars: 1, minQ: 0, qty: 2 }];
    assert.equal(G.confOrdersReady(), 1);
    const moneyBefore = state.money;
    assert.equal(G.deliverConfOrder('co_test', got.id), true);
    assert.ok(state.money > moneyBefore);
    assert.equal(state.stats.confOrders, 1);
    assert.ok((state.income.confiserie || 0) > 0);

    // Vente directe & stats
    assert.equal(G.sellConf(got.id, 1), true);
    const st = G.statsData();
    assert.ok(st.sources.some(([label, v]) => label === 'Confiserie' && v > 0));

    // Grimoire : 8 découvertes -> palier réclamable
    for (let i = 0; i < 8; i++) state.confiserie.grimoire['test_' + i] = true;
    assert.ok(G.confGrimoireClaimable() >= 1);
    assert.equal(G.claimConfGrimoire(), true);

    // Prestige : créations et Grimoire conservés, stock et chaudrons vidés
    state.level = 100;
    state.money = 10_000_000;
    state.stats.earnedRun = 10_000_000;
    const grimBefore = Object.keys(state.confiserie.grimoire).length;
    assert.equal(G.doPrestige(), true);
    assert.ok(state.confiserie, 'confiserie conservée au Prestige');
    assert.ok(state.confiserie.creations[got.id], 'créations conservées');
    assert.equal(Object.keys(state.confiserie.grimoire).length, grimBefore, 'grimoire conservé');
    assert.deepEqual(state.confiserie.stock, {}, 'stock remis à zéro');
    assert.deepEqual(state.confiserie.kettles, [], 'chaudrons vidés');
});
