// 1.142 : L'Atelier du Parfumeur (pyramide olfactive, 3 méthodes, 3 concentrations, macération active à soins, flacons SVG, Salon, Orgue, doc).
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { memStore } from './helpers.mjs';
import { state, setStore } from '../../src/core/state.js';
import { setView } from '../../src/core/view.js';
import { setClock } from '../../src/core/clock.js';
import * as G from '../../src/systems/index.js';
import { ITEMS } from '../../src/data/items.js';
import {
    PERFUME_LVL,
    PERFUME_NOTES,
    PERFUME_CLASSICS,
    BOTTLE_IDS,
    CAP_IDS,
    STAGES,
    CONCENTRATIONS,
} from '../../src/data/perfume.js';
import { perfumeSvg } from '../../src/art/perfume.js';
import { SPR } from '../../src/art/index.js';

let T = Date.UTC(2026, 10, 19, 12);
function farm(lvl = 60) {
    T = Date.UTC(2026, 10, 19, 12);
    setClock(() => T);
    setStore(memStore());
    G.loadGame();
    setView({ started: false, tab: 'farm', hidden: false });
    state.tutorial.done = true;
    state.level = lvl;
    state.money = 1e9;
    state.barn.lvl = 14;
    for (const k of ['plank', 'paint', 'beam', 'nail', 'tools']) state.inventory[k] = 500;
    for (const id of Object.keys(PERFUME_NOTES)) state.inventory[id] = 30;
}

test('données et SVG : 41 essences valides, 5 flacons × 4 bouchons + icône UI perfume', () => {
    assert.equal(Object.keys(PERFUME_NOTES).length, 41);
    for (const id of Object.keys(PERFUME_NOTES)) assert.ok(ITEMS[id], `essence ${id} dans ITEMS`);
    for (const b of BOTTLE_IDS) {
        for (const c of CAP_IDS) {
            const s = perfumeSvg({ bottle: b, cap: c, color: '#c47dd9', stars: 3, classic: 'provence' });
            assert.ok(s.startsWith('<svg') && s.includes('</svg>') && s.length > 200, `SVG ${b}/${c}`);
        }
    }
    assert.ok(SPR.has.ui.perfume && SPR.ui('perfume').includes('<svg'));
});

test('ouverture niveau 54 et dame-jeannes qui grandissent avec Cuisines et ateliers (Domaine)', () => {
    farm(PERFUME_LVL - 1);
    assert.equal(G.perfumeOpen(), false);
    assert.equal(G.perfumeVatCount(), 0);
    assert.equal(G.startPerfume(), false);
    state.level = PERFUME_LVL;
    assert.equal(G.perfumeOpen(), true);
    assert.equal(G.perfumeVatCount(), 2);
    for (let k = 0; k < 2; k++) G.buyDomaine('kitchen');
    assert.equal(G.perfumeVatCount(), 3);
    for (let k = 0; k < 3; k++) G.buyDomaine('kitchen');
    assert.equal(G.perfumeVatCount(), 4);
});

test('pyramide, grands classiques, macération 3 étapes avec soins, mise en flacon et Orgue', () => {
    farm(60);
    G.ensurePerfume();
    // Eau de Provence : lemon · lavender · resin (Grand classique)
    assert.ok(G.setPerfumeNote('head', 'lemon'));
    assert.ok(G.setPerfumeNote('heart', 'lavender'));
    assert.ok(G.setPerfumeNote('base', 'resin'));
    assert.ok(G.setPerfumeMethod('enfleurage'));
    assert.ok(G.setPerfumeConc('extrait'));
    assert.ok(G.setPerfumeBottle('cristal'));
    assert.ok(G.setPerfumeCap('or'));

    const pv = G.perfumePreview();
    assert.equal(pv.harmony.classic, 'provence');
    assert.equal(pv.harmony.stars, 3);
    assert.equal(pv.name, 'Eau de Provence');
    assert.equal(pv.bottles, CONCENTRATIONS.extrait.bottles);

    const pid = G.startPerfume();
    assert.ok(pid);
    assert.equal(state.inventory.lemon, 30 - CONCENTRATIONS.extrait.qty);
    const v = state.perfume.vats[0];
    assert.equal(v.stage, 0);
    assert.ok(G.perfumeVatCanCare(v));

    // Soigner et franchir les 3 étapes
    for (let s = 0; s < STAGES.length; s++) {
        assert.ok(G.carePerfumeVat(0), `soin étape ${s}`);
        assert.equal(G.perfumeVatCanCare(v), false, 'un seul soin par étape');
        T = v.stageUntil + 1000;
        G.perfumeTick();
    }
    assert.ok(G.perfumeVatReady(v), 'prêt après les 3 étapes');
    assert.equal(v.finesse, 3);

    const valBefore = G.perfumeOf(pid).value;
    assert.ok(G.bottlePerfume(0));
    assert.equal(state.perfume.vats[0], null);
    assert.equal(G.perfumeStock(pid), CONCENTRATIONS.extrait.bottles);
    assert.ok(G.perfumeOf(pid).value > valBefore, 'les 3 soins bonifient la valeur');
    assert.equal(G.perfumeQual(pid).s, CONCENTRATIONS.extrait.bottles, '3 soins parfaits élèvent la qualité d’un cran');
    assert.equal(state.stats.perfumes, CONCENTRATIONS.extrait.bottles);
    // 3 essences + 1 famille + 1 classique = 5 découvertes dans l'Orgue
    assert.equal(G.organCount(), 5);

    // Renommer, favori, vendre (la demande baisse légèrement le prix)
    assert.ok(G.renamePerfume(pid, 'Provence Royale'));
    assert.equal(G.perfumeOf(pid).name, 'Provence Royale');
    assert.ok(G.togglePerfumeFav(pid));
    assert.equal(G.isPerfumeFav(pid), true);
    const p1 = G.perfumePrice(pid);
    const moneyBefore = state.money;
    assert.ok(G.sellPerfume(pid, 2));
    assert.ok(state.money > moneyBefore);
    assert.ok(G.perfumePrice(pid) <= p1);
});

test('Salon (commandes Portrait olfactif), meilleur accord, hors-ligne et Orgue réclamable', () => {
    farm(60);
    G.ensurePerfume();
    assert.ok(G.applyBestPerfume());
    const pid = G.startPerfume();
    assert.ok(pid);
    // Progression hors-ligne : 2 heures plus tard, la macération est terminée
    T += 2 * 3600 * 1000;
    assert.equal(G.perfumeOffline(), 1);
    assert.ok(G.bottlePerfume(0));
    const p = G.perfumeOf(pid);

    // On crée une commande du Salon qui correspond exactement à ce parfum
    state.perfume.orders = [{ id: 'po1', vid: 'claire', family: p.family, minStars: 1, conc: null, qty: 1 }];
    assert.equal(G.perfumeOrdersReady(), 1);
    const matches = G.perfumeOrderMatches(state.perfume.orders[0]);
    assert.ok(matches.some(x => x.id === pid));
    const moneyBefore = state.money;
    assert.ok(G.deliverPerfumeOrder('po1', pid));
    assert.ok(state.money > moneyBefore);
    assert.equal(state.stats.perfumeOrders, 1);
    assert.equal(state.perfume.orders.length, 0);

    // Orgue : dès 6 découvertes, 1 palier est réclamable
    state.perfume.organ = { lemon: true, orange: true, lavender: true, tiare: true, resin: true, vanilla: true };
    assert.equal(G.organClaimable(), 1);
    assert.ok(G.claimOrgan());
    assert.equal(G.organClaimable(), 0);

    // Ancienne sauvegarde sans state.perfume
    delete state.perfume;
    assert.ok(G.ensurePerfume());
    assert.equal(G.myPerfumes().length, 0);
});

test('UI et documentation en jeu (1.142) : actions, onglet, barre des niveaux, guide, changelog et stats', async () => {
    const viewSrc = readFileSync(new URL('../../src/ui/views/perfume.js', import.meta.url), 'utf8');
    const appSrc = readFileSync(new URL('../../src/ui/app.js', import.meta.url), 'utf8');
    for (const act of ['perfPick', 'perfSet', 'perfMethod', 'perfConc', 'perfBottle', 'perfCap', 'perfBest', 'perfStart', 'carePerf', 'bottlePerf', 'sellPerf', 'perfOrder', 'perfOrganClaim']) {
        assert.match(viewSrc, new RegExp(`\\n {8}${act}: `), `action ${act} dans views/perfume.js`);
    }
    assert.ok(appSrc.includes("['perfume', 'Parfums'"), 'onglet Parfums enregistré dans Atelier');
    assert.ok(appSrc.includes("'machines/perfume': 'perfume'"), 'aide contextuelle branchée');

    const ver = readFileSync(new URL('../../VERSION', import.meta.url), 'utf8').trim();
    const { CHANGELOG } = await import('../../src/data/changelog.js');
    const { GUIDE_PAGES } = await import('../../src/data/guide.js');
    assert.equal(CHANGELOG[0].v, ver);
    assert.ok(
        G.unlocksAt(PERFUME_LVL).some(u => /Atelier du Parfumeur/.test(u.name)),
        'Atelier du Parfumeur dans la barre des niveaux (54)',
    );
    assert.ok(GUIDE_PAGES.some(p => p.id === 'perfume'), 'page guide perfume présente');
    assert.equal(PERFUME_CLASSICS.length, 6);
});
