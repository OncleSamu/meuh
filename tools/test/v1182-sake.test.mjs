// 1.182 : Tests complets pour le Saké artisanal à la Brasserie (Junmai, Daiginjo, Nigori, Koshu).
import test from 'node:test';
import assert from 'node:assert/strict';
import { memStore, clock } from './helpers.mjs';
import { state, setStore } from '../../src/core/state.js';
import { setView } from '../../src/core/view.js';
import * as G from '../../src/systems/index.js';
import { SAKE, SAKE_IDS, SAKE_CLASSICS } from '../../src/data/abbey.js';
import '../../src/art/index.js';
import { SPR } from '../../src/art/index.js';
import { beerSvg, sakeSvg } from '../../src/art/abbey.js';

function bootAbbey(lvl = 40) {
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
        rice: 80,
        sugar: 30,
        honey: 30,
        ume: 20,
        yuzu: 20,
        cherry: 20,
        tea: 20,
        ginger: 20,
        lotus: 20,
        nashi: 20,
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

test('1.182 : Saké artisanal — 4 styles, 5 Grands Classiques, carafe tokkuri SVG, ui.sake, cuves, commandes & Cave', () => {
    bootAbbey(40);
    assert.equal(G.brewOpen(), true);
    assert.equal(G.sakeOpen(), true);
    assert.equal(SAKE_IDS.length, 4);
    assert.ok(SPR.ui('sake').includes('<svg'), 'icône ui.sake présente');

    // Mode saké et 4 bases + SVG carafe tokkuri sans émoji
    assert.equal(G.setDraftKind('sake'), true);
    assert.equal(state.brew.draft.malt, 'sake:junmai');
    for (const s of SAKE_IDS) {
        assert.equal(G.setDraftSake(s), true);
        assert.equal(state.brew.draft.malt, 'sake:' + s);
        const svg = sakeSvg({ malt: 'sake:' + s, ings: [['yuzu', 1]], stars: 3 });
        assert.ok(svg.startsWith('<svg') && svg.endsWith('</svg>'));
        assert.ok(!/[\u{1F300}-\u{1FAFF}]/u.test(svg));
        assert.equal(beerSvg({ malt: 'sake:' + s, ings: [['yuzu', 1]], stars: 3 }), svg);
    }

    // Les 5 Grands Classiques du maître saké tous détectés
    assert.equal(SAKE_CLASSICS.length, 5);
    for (const cl of SAKE_CLASSICS) {
        const h = G.brewHarmony('sake:daiginjo', 0, [[cl.any[0], 1]]);
        assert.equal(h.classic, cl.id, `classique saké ${cl.id} reconnu`);
    }

    // Fermenter un Yuzushu (Daiginjo + yuzu) : 10 riz, 0 houblon
    G.setDraftSake('daiginjo');
    G.setDraftIng(0, 'yuzu');
    const pv = G.brewPreview();
    assert.equal(pv.sake, true);
    assert.equal(pv.mead, false);
    assert.equal(pv.cider, false);
    assert.equal(pv.cost.rice, 10);
    assert.equal(pv.cost.hop, undefined, 'pas de houblon dans un saké');
    assert.equal(pv.harmony.classic, 'yuzushu');
    assert.match(pv.name, /^Yuzushu /);
    assert.equal(pv.time, SAKE.baseTime + SAKE.perIng);

    const hopBefore = state.inventory.hop;
    const riceBefore = state.inventory.rice;
    const sid = G.startBrew();
    assert.ok(sid);
    assert.equal(state.inventory.hop, hopBefore);
    assert.equal(state.inventory.rice, riceBefore - 10);
    const drink = G.beerOf(sid);
    assert.equal(drink.sake, true);
    assert.equal(drink.sakeKey, 'daiginjo');

    tick(pv.time + 1);
    const vatIdx = state.brew.vats.findIndex(v => v && v.bid === sid);
    assert.equal(G.collectVat(vatIdx), true);
    assert.ok(G.beerStock(sid) > 0);
    assert.ok((state.stats.sakes || 0) > 0);
    assert.equal(state.brew.book.rice, true, 'riz ajouté au Livre des bières');
    assert.equal(state.brew.book.yuzu, true, 'yuzu ajouté au Livre des bières');

    // Nigori (riz + sucre) et Koshu (riz + miel)
    G.setDraftSake('nigori');
    G.setDraftIng(0, 'cherry');
    const pvNig = G.brewPreview();
    assert.equal(pvNig.cost.rice, 6);
    assert.equal(pvNig.cost.sugar, 1);
    assert.equal(pvNig.harmony.classic, 'sakurazake');

    G.setDraftSake('koshu');
    G.setDraftIng(0, 'ume');
    const pvKoshu = G.brewPreview();
    assert.equal(pvKoshu.cost.rice, 8);
    assert.equal(pvKoshu.cost.honey, 1);
    assert.equal(pvKoshu.harmony.classic, 'umeshuClassic');

    // Retour à la bière : malt restauré
    assert.equal(G.setDraftKind('beer'), true);
    assert.equal(state.brew.draft.malt, 'maltBlond');
    G.setDraftIng(0, 'yuzu');
    const bid = G.startBrew();
    const beer = G.beerOf(bid);

    // Commandes : commande de saké stricte, et commande de bière refuse un saké
    const oSake = { sake: true, note: G.beerNote(drink), min: 0, qty: 1 };
    const oBeer = { note: G.beerNote(drink), min: 0, qty: 1 };
    assert.equal(G.beerFits(oSake, drink), true);
    assert.equal(G.beerFits(oSake, beer), false);
    assert.equal(G.beerFits(oBeer, drink), false);
    assert.match(G.beerOrderText(oSake), /saké/i);

    // Vieillissement en fût à la Cave
    G.ensureCave();
    assert.ok(G.caveBeers().some(b => b.id === sid));
    const slot = state.cave.slots.indexOf(null);
    assert.equal(G.putBeerInCave(slot, sid, 4, 'oak'), true);
    assert.equal(G.lotName(state.cave.slots[slot]), drink.name);
    assert.ok(G.lotUnit(state.cave.slots[slot]) > 0);
});
