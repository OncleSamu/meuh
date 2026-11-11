// 1.107 : le domaine en grand. Huit paliers par branche, les dépendances.
import test from 'node:test';
import assert from 'node:assert/strict';
import { memStore } from './helpers.mjs';
import { state, setStore } from '../../src/core/state.js';
import { setView } from '../../src/core/view.js';
import { setClock } from '../../src/core/clock.js';
import * as G from '../../src/systems/index.js';
import { DOMAINE, DOMAINE_IDS, DOMAINE_COINS, DOMAINE_MATS, WORKS, WORK_IDS, WORKS_COINS, WORKS_LVL } from '../../src/data/domaine.js';

let T = Date.UTC(2026, 10, 10, 12);
function farm(lvl = 80) {
    T = Date.UTC(2026, 10, 10, 12);
    setClock(() => T);
    setStore(memStore());
    G.loadGame();
    setView({ started: true, tab: 'farm', hidden: false });
    state.tutorial.done = true;
    state.level = lvl;
    state.money = 1e11;
    for (const k of ['plank', 'paint', 'beam', 'nail', 'tools']) state.inventory[k] = 5000;
}

test('domaine : huit paliers par branche, chacun avec son effet et son coût', () => {
    assert.equal(DOMAINE_COINS.length, 8);
    assert.equal(DOMAINE_MATS.length, 8);
    for (const b of DOMAINE_IDS) assert.equal(DOMAINE[b].steps.length, 8, b);
    for (let k = 1; k < 8; k++) assert.ok(DOMAINE_COINS[k] > DOMAINE_COINS[k - 1]);
    farm();
    for (const b of DOMAINE_IDS) {
        for (let k = 0; k < 8; k++) assert.ok(G.buyDomaine(b), `${b} ${k + 1}`);
        assert.equal(G.buyDomaine(b), false);
    }
    assert.equal(G.domTotal(), 72);
    // tout le domaine : plus d'un milliard et demi de pièces
    assert.ok(G.domSpent() > 1.5e9);
});

test('dépendances : fermés avant le niveau 45, trois niveaux, des dizaines de millions', () => {
    farm(WORKS_LVL - 1);
    assert.equal(G.worksOpen(), false);
    assert.equal(G.buyWork('pigeon'), false);
    state.level = WORKS_LVL;
    const m = state.money;
    for (const w of WORK_IDS) {
        assert.equal(WORKS[w].fx.length, 3);
        assert.equal(WORKS[w].steps.length, 3);
        for (let k = 0; k < 3; k++) assert.ok(G.buyWork(w), `${w} ${k + 1}`);
        assert.equal(G.buyWork(w), false);
    }
    assert.equal(m - state.money, WORKS_COINS.reduce((a, b) => a + b, 0) * WORK_IDS.length);
    assert.equal(G.worksTotal(), 18);
});

test('pigeonnier et horloge : le renom monte plus haut et baisse moins vite', () => {
    farm();
    assert.equal(G.renomMax(), G.RENOM.max);
    G.buyWork('pigeon');
    assert.equal(G.renomMax(), G.RENOM.max + 2);
    for (let i = 0; i < 10; i++) G.addRenom(2);
    assert.equal(G.renomPts(), 14);
    G.buyWork('clock');
    assert.equal(G.renomDecay(), 5 * 3600000);
    T += 5 * 3600000 - 1000;
    assert.equal(G.renomPts(), 14);
    T += 2000;
    assert.equal(G.renomPts(), 13);
});

test('bibliothèque, charron et relais : l’expérience, le train et les commandes', () => {
    farm();
    const x = G.xpBonus();
    G.buyWork('library');
    assert.ok(Math.abs(G.xpBonus() / x - 1.05) < 1e-9);
    assert.equal(G.workFx('wheel'), 0);
    G.buyWork('wheel');
    G.buyWork('wheel');
    assert.equal(G.workFx('wheel'), 0.2);
    G.buyWork('post');
    assert.equal(G.workFx('post'), 0.1);
});

test('table d’hôtes : un plancher pour le renom (2, 4 puis 6 points), sans mécanique à jouer', () => {
    farm();
    assert.equal(G.renomPts(), 0);
    G.buyWork('table');
    assert.equal(G.renomPts(), 2);
    assert.equal(G.renomNext(), 0);
    G.addRenom(3);
    assert.equal(G.renomPts(), 5);
    assert.ok(G.renomNext() > 0);
    T += 100 * 3600000;
    assert.equal(G.renomPts(), 2);
    G.buyWork('table');
    G.buyWork('table');
    assert.equal(G.renomPts(), 6);
    assert.equal(G.tableServe, undefined);
});

test('une ancienne sauvegarde sans grands travaux se charge', () => {
    farm();
    delete state.works;
    assert.equal(G.workLvl('table'), 0);
    assert.ok(G.buyWork('table'));
    assert.equal(G.workLvl('table'), 1);
});

test('domaine : les boutons « Construire » ont bien leur action (1.107.4)', async () => {
    const { readFileSync } = await import('node:fs');
    const src = readFileSync(new URL('../../src/ui/views/village.js', import.meta.url), 'utf8');
    for (const act of ['buyDomaine', 'buyWork', 'domTab', 'domaine']) {
        assert.ok(new RegExp(`act: '${act}'|data-act="${act}"|'${act}'\\)`).test(src), `bouton ${act}`);
        assert.ok(new RegExp(`\\n {8}${act}: `).test(src), `action ${act}`);
    }
});

test('brasserie : les feuilles de tri des ingrédients et des miels ont leurs actions (1.108)', async () => {
    const { readFileSync } = await import('node:fs');
    const src = readFileSync(new URL('../../src/ui/views/brewery.js', import.meta.url), 'utf8');
    for (const act of ['brewPick', 'brewSet', 'brewHoneyPick', 'brewHoneySet'])
        assert.ok(new RegExp(`\\n {8}${act}: `).test(src), `action ${act}`);
    for (const sheet of ['brewPick', 'brewHoneyPick']) assert.ok(src.includes(`defineSheet('${sheet}'`), sheet);
});
