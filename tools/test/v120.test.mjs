// 1.120 : le concours de bière de la saison, le catalogue de semences, le millésime de l'année.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { clock, memStore } from './helpers.mjs';
import { state, setStore } from '../../src/core/state.js';
import { setView } from '../../src/core/view.js';
import * as G from '../../src/systems/index.js';
import { BREWFEST, SEEDCAT } from '../../src/data/brewfest.js';
import { DAYS_PER_SEASON } from '../../src/data/world.js';

const fresh = () => {
    setStore(memStore());
    G.loadGame();
    setView({ started: true, tab: 'farm' });
    state.tutorial.done = true;
    state.level = 60;
    state.money = 1e7;
    state.day = 1;
};

test('concours de bière : un thème par saison, une note sur 20, le prix à la fin de la saison', () => {
    fresh();
    state.projects.brewhall = { done: true };
    G.ensureBrew();
    const B = state.brew;
    const theme = G.festTheme();
    assert.equal(theme, BREWFEST.themes[0]);
    // une bière trois étoiles du goût du thème, et une autre qui n'en est pas
    B.beers.b1 = { id: 'b1', name: 'Aigrelette', malt: 'maltBlond', hop: 1, ings: [], stars: 3, value: 100, note: theme.note };
    B.beers.b2 = { id: 'b2', name: 'Douce', malt: 'maltBlond', hop: 1, ings: [], stars: 1, value: 100, note: (theme.note + 1) % 5 };
    B.stock.b1 = 5;
    B.stock.b2 = 1;
    assert.equal(G.festScore('b1').total, 3 * BREWFEST.w.star + BREWFEST.w.theme);
    assert.equal(G.festScore('b2').theme, 0);
    assert.deepEqual(
        G.festCandidates().map(c => c.id),
        ['b1'],
        'il faut deux bouteilles',
    );
    assert.ok(G.festTick());
    G.fest().rivals.forEach(r => (r.score = 5));
    assert.ok(G.enterFest('b1'));
    assert.equal(B.stock.b1, 5 - BREWFEST.bottles, 'le jury goûte deux bouteilles');
    assert.equal(G.festRank(G.fest()), 1);
    assert.equal(G.enterFest('b2'), false);
    // la saison passe : le prix tombe, un nouveau thème arrive
    const money = state.money;
    state.day = 1 + DAYS_PER_SEASON;
    assert.ok(G.festTick());
    assert.ok(state.money > money, 'des pièces');
    assert.equal(state.stats.festWins, 1);
    assert.equal(G.festTheme(), BREWFEST.themes[1]);
    assert.equal(G.fest().entry, null);
    assert.equal(G.fest().last.r, 1);
    assert.equal(G.festTick(), false, 'une seule fois par saison');
});

test('catalogue de semences : commandes avec le temps, livrées avec ses graines', () => {
    fresh();
    G.ensureGenetics();
    assert.equal(G.catOpen(), false);
    state.projects.seedbank = { done: true };
    assert.ok(G.catOpen());
    const g = G.wildPlant('tomato');
    g.t.sweet = [
        [5, 1],
        [5, 1],
    ];
    const plain = { id: 'v2', kind: 'plant', base: 'tomato', auto: 'Tomate simple', g: G.wildPlant('tomato'), gen: 4, fixed: true };
    state.genetics.vars.v1 = { id: 'v1', kind: 'plant', base: 'tomato', auto: 'Tomate sucrée', g, gen: 4, fixed: true };
    state.genetics.vars.v2 = plain;
    state.genetics.vars.v3 = { ...plain, id: 'v3', fixed: false };
    assert.ok(G.varMerit(state.genetics.vars.v1) > 0);
    assert.equal(G.varMerit(plain), 0);
    assert.ok(G.catPay(state.genetics.vars.v1, 10) > G.catPay(plain, 10), 'une variété réputée se paie mieux');
    assert.equal(G.toggleCat('v3'), false, 'pas une variété non fixée');
    assert.ok(G.toggleCat('v1'));
    assert.ok(G.inCat('v1'));
    // la première commande arrive vite, puis une toutes les deux heures, trois au plus même après une longue absence
    assert.ok(G.catTick());
    assert.equal(G.catOrders().length, 1);
    clock.t += SEEDCAT.every * 50;
    G.catTick();
    assert.equal(G.catOrders().length, SEEDCAT.max);
    const o = G.catOrders()[0];
    state.genetics.seeds.v1 = 0;
    assert.equal(G.deliverCat(o.id), false);
    state.genetics.seeds.v1 = 100;
    const money = state.money;
    assert.ok(G.deliverCat(o.id));
    assert.equal(state.genetics.seeds.v1, 100 - o.n);
    assert.equal(state.money - money, G.catPay(state.genetics.vars.v1, o.n));
    assert.equal(G.catOrders().length, SEEDCAT.max - 1);
    // trois variétés au plus
    for (const id of ['v2', 'v4', 'v5']) state.genetics.vars[id] = { ...plain, id };
    assert.ok(G.toggleCat('v2'));
    assert.ok(G.toggleCat('v4'));
    assert.equal(G.toggleCat('v5'), false);
    // une variété qui disparaît sort du catalogue
    delete state.genetics.vars.v4;
    assert.deepEqual(G.catIds(), ['v1', 'v2']);
});

test('millésime de l’année : la bouteille la plus chère sortie entre au palmarès', () => {
    fresh();
    G.ensureCave();
    state.inventory.cheese = 40;
    state.inventory.comte = 40;
    assert.ok(G.putInCave(0, 'cheese', 8));
    assert.ok(G.takeOut(0));
    const M = G.ensureMill();
    assert.equal(M.y, 1);
    assert.ok(M.best);
    const first = M.best.u;
    const money = state.money;
    state.day = 1 + DAYS_PER_SEASON * 4;
    assert.ok(G.millTick());
    assert.equal(M.y, 2);
    assert.equal(M.best, null);
    assert.equal(M.list.length, 1);
    assert.equal(M.list[0].u, first);
    assert.ok(state.money >= money + G.millPrize(M.list[0]));
    assert.equal(state.stats.millesimes, 1);
    // une année sans bouteille ne laisse rien au palmarès
    state.day = 1 + DAYS_PER_SEASON * 8;
    assert.ok(G.millTick());
    assert.equal(M.list.length, 1);
});

test('1.120 : les écrans et leurs actions existent', () => {
    const lab = readFileSync(new URL('../../src/ui/views/lab.js', import.meta.url), 'utf8');
    const brew = readFileSync(new URL('../../src/ui/views/brewery.js', import.meta.url), 'utf8');
    const cave = readFileSync(new URL('../../src/ui/views/cave.js', import.meta.url), 'utf8');
    for (const a of ['catToggle', 'catDeliver']) assert.match(lab, new RegExp(`\\n {8}${a}: `));
    assert.match(brew, /\n {8}festEnter: /);
    assert.match(cave, /millHtml\(\)/);
});
