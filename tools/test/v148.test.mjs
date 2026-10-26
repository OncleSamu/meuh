// 1.48 : l'oasis (Ferme › Voyages) : l'eau, l'ombre, la chaleur, le chadouf, les six plantes et leurs branchements.
import test from 'node:test';
import assert from 'node:assert/strict';
import { clock, memStore } from './helpers.mjs';
import { state, setStore } from '../../src/core/state.js';
import { setView } from '../../src/core/view.js';
import * as G from '../../src/systems/index.js';
import { ITEMS } from '../../src/data/items.js';
import { OASIS, OASIS_IDS } from '../../src/data/oasis.js';
import { FLAVORS } from '../../src/data/genetics.js';
import { ASSOCS } from '../../src/data/companions.js';
import { CHAPTERS, PROJECTS, VILLAGERS, CHAPTER_ORDER } from '../../src/data/village.js';
import { STORY_MAPS } from '../../src/data/meta.js';
import { TIPS } from '../../src/data/texts.js';
import { GUIDE_PAGES } from '../../src/data/guide.js';
import { SPR } from '../../src/art/index.js';
import { youngExtra, readyExtra, items, ui } from '../../src/art/kit.js';
import { MAP_BG } from '../../src/art/maps.js';

const H = 3600;
function oasis({ open = true, water } = {}) {
    setStore(memStore());
    G.loadGame();
    setView({ started: false, tab: 'farm' });
    state.level = 58;
    state.money = 10_000_000;
    state.gameTimeMinutes = 8 * 60; // le matin : pas de chaleur
    if (open) state.projects.oasisWell = { given: {}, done: true };
    G.ensureOasis();
    if (water !== undefined) state.oasis.water = water;
    return state.oasis;
}
const run = (sec, hot = false) => {
    for (let k = 0; k < sec; k++) {
        state.gameTimeMinutes = hot ? 13 * 60 : 8 * 60;
        G.oasisTick();
    }
};
// un palmier dattier adulte sur la case k
function palmAt(k) {
    const sl = G.slotsOf('oasis')[k];
    sl.tree = { id: 'date', age: ITEMS.date.time, drops: 0, ground: 0, prog: 0, gq: 0 };
    return sl.tree;
}

test('fermée tant que le puits d’Idris n’est pas rouvert, puis 8 cases', () => {
    const O = oasis({ open: false });
    assert.equal(G.oasisOpen(), false);
    assert.equal(O.plots.filter(p => p.open).length, 0);
    assert.equal(G.plantOasis(0, 'cumin', null, true), false);
    state.projects.oasisWell = { given: {}, done: true };
    G.ensureOasis();
    assert.equal(O.plots.filter(p => p.open).length, OASIS.cellsBase);
    assert.equal(G.tankCap(), OASIS.tank[0]);
    assert.ok(G.plantOasis(0, 'cumin', null, true));
});

test('une culture boit tant qu’elle pousse (litres par heure), puis plus rien', () => {
    const O = oasis({ water: 50 });
    // la source ne compte pas ici
    const spring = OASIS.spring;
    OASIS.spring = 0;
    G.plantOasis(0, 'cumin', null, true);
    let sec = 0;
    while (!O.plots[0].ready && sec < 5000) {
        run(1);
        sec++;
    }
    assert.ok(O.plots[0].ready);
    const drunk = 50 - O.water;
    assert.ok(Math.abs(drunk - (OASIS.drink.crop * sec) / 3600) < 0.01, `${drunk} en ${sec} s`);
    run(60);
    OASIS.spring = spring;
    assert.ok(Math.abs(50 - O.water - drunk) < 1e-9);
});

test('sans eau, rien ne pousse et rien ne meurt ; la source remplit la citerne', () => {
    const O = oasis({ water: 0 });
    const spring = OASIS.spring;
    OASIS.spring = 0;
    G.plantOasis(0, 'sesame', null, true);
    run(120);
    assert.equal(O.plots[0].prog, 0);
    assert.equal(O.plots[0].id, 'sesame');
    assert.ok(O.dry);
    OASIS.spring = spring;
    // jeu fermé une heure : la source donne 20 L, la plante en boit une partie
    G.oasisOffline(H);
    assert.ok(O.plots[0].prog > 0);
    assert.ok(O.water <= G.tankCap());
});

test('la chaleur de midi double la soif au soleil ; l’ombre d’un palmier la retire et boit un tiers de moins', () => {
    oasis({ water: 100 });
    G.plantOasis(5, 'cumin', null, true);
    const cool = G.cellNeed(5, 1),
        hot = G.cellNeed(5, OASIS.heatMult);
    assert.ok(Math.abs(hot / cool - 2) < 1e-9);
    palmAt(0); // la case 0 touche la case 5 (en diagonale, 4 colonnes)
    assert.ok(G.isShaded(5));
    assert.ok(Math.abs(G.cellNeed(5, OASIS.heatMult) / cool - OASIS.shade) < 1e-9);
    // un jeune palmier ne fait pas encore d'ombre
    G.slotsOf('oasis')[0].tree.age = 0;
    assert.equal(G.isShaded(5), false);
    // la case 7 n'est pas voisine de la case 0
    palmAt(0);
    assert.equal(G.isShaded(7), false);
});

test('une case porte une culture ou un arbre, pas les deux', () => {
    oasis({ water: 100 });
    assert.ok(G.plantOasis(1, 'coriander', null, true));
    assert.equal(G.plantOasisTree(1, 'jujube', null), false);
    assert.ok(G.plantOasisTree(2, 'jujube', null));
    assert.equal(G.plantOasis(2, 'cumin', null, true), false);
    // un arbre de l'oasis ne pousse pas au verger, ni sur l'île
    assert.equal(G.plantTree(0, 'date', null, 'farm'), false);
    assert.equal(G.plantTree(0, 'date', null, 'island'), false);
    assert.equal(G.plantIsland(0, 'cumin', null, true), false);
});

test('les arbres de l’oasis avancent avec l’eau, pas avec le verger', () => {
    const O = oasis({ water: 0 });
    const spring = OASIS.spring;
    OASIS.spring = 0;
    const t = palmAt(3);
    t.age = 0;
    G.orchardTick();
    run(30);
    assert.equal(t.age, 0);
    O.water = 100;
    run(30);
    assert.ok(t.age > 0);
    OASIS.spring = spring;
});

test('le chadouf : trois fois par jour, 40 litres au plus, jamais plus que la citerne', () => {
    const O = oasis({ water: 0 });
    assert.equal(G.chadoufDraw([1, 1, 1, 1, 1]), 0); // pas encore construit
    state.projects.oasisShadoof = { given: {}, done: true };
    assert.equal(G.chadoufDraw([1, 1, 1, 1, 1]), OASIS.chadouf.max);
    assert.equal(G.chadoufDraw([0.5, 0.5, 0, 0, 0]), OASIS.chadouf.perScoop);
    O.water = G.tankCap() - 5;
    assert.equal(G.chadoufDraw([1, 1, 1, 1, 1]), 5);
    assert.equal(G.chadoufLeft(), 0);
    assert.equal(G.chadoufDraw([1, 1, 1, 1, 1]), 0);
    clock.t += 24 * H * 1000;
    assert.equal(G.chadoufLeft(), OASIS.chadouf.perDay);
});

test('agrandir la citerne et creuser la source', () => {
    oasis();
    state.inventory.stone = 1000;
    state.inventory.plank = 100;
    state.inventory.beam = 100;
    state.inventory.tools = 100;
    assert.ok(G.upgradeTank(null));
    assert.equal(G.tankCap(), OASIS.tank[1]);
    assert.ok(G.upgradeTank(null));
    assert.equal(G.upgradeTank(null), false);
    assert.equal(G.springRate(), OASIS.spring);
    assert.ok(G.upgradeSpring(null));
    assert.ok(G.upgradeSpring(null));
    assert.equal(G.springRate(), OASIS.spring + 30);
    assert.equal(G.upgradeSpring(null), false);
});

test('une variété qui résiste à la soif boit moins', () => {
    oasis();
    assert.equal(G.varThirst(null), 1);
    state.genetics.vars.x = {
        id: 'x',
        base: 'cumin',
        g: {
            t: {
                drought: [
                    [5, 1],
                    [5, 1],
                ],
            },
            l: {},
        },
    };
    assert.ok(Math.abs(G.varThirst('x') - 0.55) < 1e-9);
});

test('les cultures compagnes jouent aussi à l’oasis', () => {
    oasis({ water: 100 });
    G.plantOasis(0, 'sesame', null, true);
    G.plantOasis(1, 'cumin', null, true);
    const ids = G.plotAssocs(2001).map(a => a.id);
    assert.ok(ids.includes('sesameCumin'), ids.join());
});

test('la bière blanche : coriandre et bigarade ne se battent pas, deux étoiles de plus', () => {
    oasis();
    const h = G.brewHarmony('maltBlond', 1, [
        ['coriander', 2],
        ['bitterOrange', 1],
    ]);
    assert.equal(h.classic, 'witbier');
    assert.ok(h.stars >= 2);
});

test('le chapitre 21 : trois chantiers à l’oasis, Idris, la carte, la palmeraie donne trois palmiers', () => {
    assert.equal(CHAPTER_ORDER[CHAPTER_ORDER.indexOf(20) + 1], 21);
    assert.equal(CHAPTERS[20].lvl, OASIS.lvl);
    const mine = Object.values(PROJECTS).filter(p => p.ch === 21);
    assert.equal(mine.length, 3);
    assert.ok(STORY_MAPS.some(m => m.id === 'oasis'));
    assert.ok(MAP_BG.oasis && VILLAGERS.idris && SPR.villager('idris').includes('<svg'));
    for (const p of mine) assert.ok(SPR.building(p.id, 2).length > 200, p.id);
    oasis();
    const seeds = state.seeds.date || 0,
        rub = state.prestige.rubans;
    G.applyProjectReward('oasisGrove');
    assert.equal(state.seeds.date, seeds + 3);
    assert.equal(state.prestige.rubans, rub + 5);
});

// ---------------- le contrôle : chaque plante est branchée partout ----------------
test('contrôle : les six plantes ont leurs dessins, leurs saveurs, leur place et leurs listes', () => {
    oasis();
    assert.equal(OASIS_IDS.length, 6);
    const trees = G.treeList('oasis').map(d => d.id);
    assert.deepEqual(trees.sort(), ['bitterOrange', 'date', 'jujube']);
    for (const id of OASIS_IDS) {
        const d = ITEMS[id];
        assert.ok(d && d.oasis && d.island && d.reqLvl === OASIS.lvl, id);
        assert.ok(FLAVORS[id] && FLAVORS[id].length === 5, `saveurs ${id}`);
        assert.ok(items[id], `dessin du produit ${id}`);
        if (d.type === 'crop') assert.ok(youngExtra[id] && readyExtra[id], `dessins de la plante ${id}`);
        else assert.ok(SPR.plant(id, 2).length > 300 && SPR.plant(id, 3).length > 300, `dessins de l’arbre ${id}`);
        assert.ok(G.BREWABLE.includes(id), `brasserie ${id}`);
        assert.equal(G.sourceOf(id), 'Oasis');
        assert.ok(G.specialtyOf(0).includes(id), `marché des voisins ${id}`);
        assert.ok(!G.islandCrops().some(x => x.id === id), `pas sur l’île ${id}`);
    }
    // les cultures compagnes de l'oasis
    for (const a of ['sesameCumin', 'coriandreSesame', 'cuminCoriandre'])
        assert.ok(
            ASSOCS.some(x => x.id === a),
            a,
        );
    // les textes : la page du guide, les bulles de Mamie
    assert.ok(
        GUIDE_PAGES.some(g => g.id === 'oasis'),
        'page du guide',
    );
    for (const t of ['oasis', 'oasisShade', 'oasisDry']) assert.ok(TIPS[t], t);
    // les dessins de l'eau
    for (const k of ['oaCiterne1', 'oaCiterne2', 'oaCiterne3', 'oaSource', 'oaChadouf', 'oaPuits', 'oaFoggara', 'oaOmbre', 'oaMidi', 'oaOasis', 'oaVoyages'])
        assert.ok(ui[k], k);
});

test('les commandes demandent les plantes de l’oasis une fois le puits rouvert', () => {
    oasis({ open: false });
    const before = G.questPool().map(x => x.id);
    assert.ok(!before.includes('cumin'));
    state.projects.oasisWell = { given: {}, done: true };
    assert.ok(G.questPool().some(x => x.id === 'cumin'));
});
