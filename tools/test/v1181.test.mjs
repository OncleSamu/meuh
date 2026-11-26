// 1.181 : Tests complets pour Nougats & Calissons (Confiserie) et Cidres & Poirés artisanaux (Brasserie).
import test from 'node:test';
import assert from 'node:assert/strict';
import { memStore, clock } from './helpers.mjs';
import { state, setStore } from '../../src/core/state.js';
import { setView } from '../../src/core/view.js';
import * as G from '../../src/systems/index.js';
import { CONF_KINDS, CONF_SHAPES, CONF_CLASSICS } from '../../src/data/confiserie.js';
import { CIDER, CIDER_IDS, CIDER_CLASSICS } from '../../src/data/abbey.js';
import '../../src/art/index.js';
import { confSvg } from '../../src/art/confiserie.js';
import { beerSvg, ciderSvg } from '../../src/art/abbey.js';

function bootAbbey(lvl = 60) {
    setStore(memStore());
    G.loadGame();
    setView({ started: false, tab: 'machines' });
    state.level = lvl;
    state.money = 500_000;
    G.ensureGenetics();
    for (const p of ['malthouse', 'brewhall', 'fermenters', 'labelshop', 'barrelcellar']) {
        state.projects[p] = { given: {}, done: true };
    }
    G.ensureBrew();
    Object.assign(state.inventory, {
        apple: 60,
        pear: 60,
        raspberry: 40,
        quince: 30,
        cinnamon: 30,
        lavender: 30,
        cherry: 30,
        yuzu: 30,
        honey: 40,
        egg: 40,
        almond: 40,
        melon: 30,
        sugar: 50,
        pistachio: 30,
        orange: 30,
        fig: 30,
        sesame: 30,
        hop: 40,
        maltBlond: 30,
    });
}

const tick = s => {
    for (let k = 0; k < s; k++) {
        clock.t += 1000;
        G.gameTick();
    }
};

test('1.181 : Nougats & Calissons — 3 bases, 30 miels de fleurs, 3 formes SVG, 6 Grands Classiques, Finition Miroir & Coffre-fort', () => {
    bootAbbey(60);
    G.ensureVault();
    state.genetics.bestFirst = true;

    // Toutes les bases fixes + les 30 miels (nhoney:)
    const bases = G.confBasesFor('nougat');
    assert.ok(bases.includes('nougatBlanc'));
    assert.ok(bases.includes('nougatNoir'));
    assert.ok(bases.includes('calisson'));
    assert.ok(bases.includes('nhoney:lavender'), 'miel de lavande sélectionnable pour le nougat');
    assert.ok(bases.includes('nhoney:yuzu'), 'miel de yuzu sélectionnable pour le nougat');

    // Les 3 nouvelles silhouettes SVG sans émoji
    for (const sh of ['nougat', 'calisson', 'bouchee']) {
        assert.equal(CONF_SHAPES[sh].kind, 'nougat');
        const svg = confSvg({ kind: 'nougat', shape: sh, baseCol: '#f7f0df', baseCol2: '#dfd2b5', accentCol: '#749c48', mirror: true, classic: true });
        assert.ok(svg.startsWith('<svg') && svg.endsWith('</svg>'));
        assert.ok(!/[\u{1F300}-\u{1FAFF}]/u.test(svg));
    }

    // Les 6 Grands Classiques Nougat tous détectés et 3★
    const nClassics = CONF_CLASSICS.filter(c => c.kind === 'nougat');
    assert.equal(nClassics.length, 6);
    for (const cl of nClassics) {
        const m = G.confClassicMatch('nougat', cl.bases[0], [cl.any[0]]);
        assert.ok(m && m.id === cl.id, `classique ${cl.id} détecté`);
        assert.equal(G.confHarmony('nougat', cl.bases[0], [cl.any[0]]).stars, 3);
    }

    // Nougat au miel de lavande + pistache -> déclenche Nougat de Montélimar !
    G.addHoney('lavender', 10);
    assert.equal(G.setConfBase('nougat', 'nhoney:lavender'), true);
    assert.equal(G.setConfShape('nougat', 'nougat'), true);
    assert.equal(G.toggleConfIng('nougat', 'pistachio'), true);
    const pv = G.confPreview('nougat');
    assert.equal(pv.can, true);
    assert.equal(pv.harmony.classic?.id, 'nougatMontelimar');
    assert.equal(pv.name, 'Nougat de Montélimar');

    // Finition Miroir (3★ mini-jeu Le Montage en Neige)
    const res = G.finishConfMini('nougat', 3);
    assert.ok(res);
    assert.equal(res.mirror, true);
    assert.equal(res.qty, CONF_KINDS.nougat.batch);
    assert.equal(G.confStock(res.id), CONF_KINDS.nougat.batch);
    assert.equal(state.confiserie.grimoire['C:nougatMontelimar'], true);

    // Calisson d'Aix au chaudron passif
    G.clearConfIngs('nougat');
    assert.equal(G.setConfBase('nougat', 'calisson'), true);
    assert.equal(G.setConfShape('nougat', 'calisson'), true);
    assert.equal(G.toggleConfIng('nougat', 'orange'), true);
    const pvCal = G.confPreview('nougat');
    assert.equal(pvCal.harmony.classic?.id, 'calissonAix');
    assert.equal(G.startConfKettle('nougat'), true);

    // Commande gourmande de nougat + coffre-fort
    state.confiserie.orders = [{ id: 'co_nougat', vid: 'yasmine', kind: 'nougat', minStars: 2, minQ: 0, qty: 2 }];
    assert.equal(G.confOrdersReady(), 1);
    assert.equal(G.deliverConfOrder('co_nougat', res.id), true);
    assert.equal(G.vaultPutConf(res.id), true);
});

test('1.181 : Cidres & Poirés artisanaux — 4 bases, 5 Grands Classiques, bouteille champenoise SVG, cuves, commandes & Cave', () => {
    bootAbbey(40); // niveau 40 : sous l'hydromel mais brasserie ouverte -> cidre déjà accessible !
    assert.equal(G.brewOpen(), true);
    assert.equal(G.ciderOpen(), true);
    assert.equal(G.meadOpen(), false);
    assert.equal(CIDER_IDS.length, 4);

    // Passer en mode Cidre et tester les 4 bases
    assert.equal(G.setDraftKind('cider'), true);
    assert.equal(state.brew.draft.malt, 'cider:sweet');
    for (const c of CIDER_IDS) {
        assert.equal(G.setDraftCider(c), true);
        assert.equal(state.brew.draft.malt, 'cider:' + c);
        const svg = ciderSvg({ malt: 'cider:' + c, ings: [['cinnamon', 1]], stars: 3 });
        assert.ok(svg.startsWith('<svg') && svg.endsWith('</svg>'));
        assert.equal(beerSvg({ malt: 'cider:' + c, ings: [['cinnamon', 1]], stars: 3 }), svg);
    }

    // Tous les 5 Grands Classiques du cidrier sont détectés
    assert.equal(CIDER_CLASSICS.length, 5);
    for (const cl of CIDER_CLASSICS) {
        const h = G.brewHarmony('cider:sweet', 0, [[cl.any[0], 1]]);
        assert.equal(h.classic, cl.id, `classique cidre ${cl.id} reconnu`);
    }

    // Brasser un Cidre de glace (Cidre brut + coing) : 6 pommes, 0 houblon
    G.setDraftCider('brut');
    G.setDraftIng(0, 'quince');
    const pv = G.brewPreview();
    assert.equal(pv.cider, true);
    assert.equal(pv.mead, false);
    assert.equal(pv.cost.apple, 6);
    assert.equal(pv.cost.hop, undefined, 'pas de houblon dans un cidre');
    assert.equal(pv.harmony.classic, 'iceCider');
    assert.match(pv.name, /^Cidre de glace /);
    assert.equal(pv.time, CIDER.baseTime + CIDER.perIng);

    const hopBefore = state.inventory.hop;
    const appleBefore = state.inventory.apple;
    const cid = G.startBrew();
    assert.ok(cid);
    assert.equal(state.inventory.hop, hopBefore);
    assert.equal(state.inventory.apple, appleBefore - 6);
    const drink = G.beerOf(cid);
    assert.equal(drink.cider, true);
    assert.equal(drink.ciderKey, 'brut');

    tick(pv.time + 1);
    const vatIdx = state.brew.vats.findIndex(v => v && v.bid === cid);
    assert.equal(G.collectVat(vatIdx), true);
    assert.ok(G.beerStock(cid) > 0);
    assert.ok((state.stats.ciders || 0) > 0);
    assert.equal(state.brew.book.apple, true, 'pomme ajoutée au Livre des bières');
    assert.equal(state.brew.book.quince, true, 'coing ajouté au Livre des bières');

    // Cidre rosé (pommes + framboises) et Poiré (poires)
    G.setDraftCider('rose');
    G.setDraftIng(0, 'cherry');
    const pvRose = G.brewPreview();
    assert.equal(pvRose.cost.apple, 4);
    assert.equal(pvRose.cost.raspberry, 2);
    assert.equal(pvRose.harmony.classic, 'orchardRed');

    G.setDraftCider('perry');
    G.setDraftIng(0, 'lavender');
    const pvPerry = G.brewPreview();
    assert.equal(pvPerry.cost.pear, 6);
    assert.equal(pvPerry.harmony.classic, 'floralPerry');

    // Retour à la bière : malt restauré
    assert.equal(G.setDraftKind('beer'), true);
    assert.equal(state.brew.draft.malt, 'maltBlond');
    G.setDraftIng(0, 'quince');
    const bid = G.startBrew();
    const beer = G.beerOf(bid);

    // Commandes : une commande de cidre n'accepte que des cidres ; une commande de bière n'accepte pas un cidre
    const oCider = { cider: true, note: G.beerNote(drink), min: 0, qty: 1 };
    const oBeer = { note: G.beerNote(drink), min: 0, qty: 1 };
    assert.equal(G.beerFits(oCider, drink), true);
    assert.equal(G.beerFits(oCider, beer), false);
    assert.equal(G.beerFits(oBeer, drink), false);
    assert.match(G.beerOrderText(oCider), /cidre/i);

    // Vieillissement en fût à la Cave
    G.ensureCave();
    assert.ok(G.caveBeers().some(b => b.id === cid));
    const slot = state.cave.slots.indexOf(null);
    assert.equal(G.putBeerInCave(slot, cid, 4, 'oak'), true);
    assert.equal(G.lotName(state.cave.slots[slot]), drink.name);
    assert.ok(G.lotUnit(state.cave.slots[slot]) > 0);
});
