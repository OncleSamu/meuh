// 1.109 : 80 niveaux. Les nouveautés des niveaux 30 à 64 sont étirées sur 30 à 80, l'économie garde l'ancienne échelle.
import test from 'node:test';
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { memStore } from './helpers.mjs';
import { state, setStore, scaleLvl, ecoLvl, lvOk, writeSave } from '../../src/core/state.js';
import { setView } from '../../src/core/view.js';
import * as G from '../../src/systems/index.js';
import { ITEMS } from '../../src/data/items.js';
import { ANIMALS } from '../../src/data/animals.js';
import { MACHINES, RECIPES } from '../../src/data/machines.js';
import { MAX_LEVEL } from '../../src/data/progress.js';
import { lv80, lv80Hi, oldLvl, WIDTH, MAX_NEW } from '../../src/data/lv80.js';
import { CAMPING } from '../../src/data/camping.js';
import { CHAPTERS } from '../../src/data/village.js';

function fresh() {
    setStore(memStore());
    G.loadGame();
    setView({ started: true, tab: 'farm', hidden: false });
    state.tutorial.done = true;
}

test('80 niveaux : rien ne bouge avant le 30, chaque ancien niveau devient une tranche de 1 à 3 niveaux', () => {
    assert.equal(MAX_LEVEL, 80);
    assert.equal(MAX_NEW, 80);
    for (let l = 1; l <= 30; l++) assert.equal(lv80(l), l);
    for (let l = 31; l <= 64; l++) {
        assert.ok(WIDTH[l] >= 1 && WIDTH[l] <= 3);
        assert.equal(lv80(l), lv80Hi(l - 1) + 1, `niveau ${l}`);
    }
    assert.equal(lv80Hi(64), 80);
    for (const d of Object.values(ITEMS)) if (!d.lv108) assert.ok((d.reqLvl || 0) <= 30, d.id);
    for (const r of Object.values(RECIPES)) if (r.lvl < 30) assert.equal(r.lv108, undefined, r.id);
});

test('80 niveaux : l’ancien niveau équivalent, et l’économie qui garde son échelle', () => {
    for (let l = 1; l <= 64; l++) assert.equal(oldLvl(lv80(l)), l);
    assert.equal(oldLvl(80), 64);
    let prev = 0;
    for (let n = 1; n <= 80; n++) {
        assert.ok(oldLvl(n) >= prev, `niveau ${n}`);
        prev = oldLvl(n);
    }
    fresh();
    for (const l of [10, 30, 45, 57, 64]) {
        state.level = lv80(l);
        assert.equal(ecoLvl(), l);
        const old = l <= 57 ? 1 + ((l - 1) * 39) / 59 : 1 + (56 * 39) / 59 + ((l - 57) * 2.6) / 7;
        assert.ok(Math.abs(scaleLvl() - old) < 1e-9, `échelle au niveau ${l}`);
    }
});

test('80 niveaux : pas de zone creuse (8 à 20 recettes par niveau de 30 à 80)', () => {
    const count = {};
    for (const r of Object.values(RECIPES)) count[r.lvl] = (count[r.lvl] || 0) + 1;
    for (let l = 30; l <= 80; l++) assert.ok(count[l] >= 8 && count[l] <= 20, `niveau ${l} : ${count[l]} recettes`);
    for (const r of Object.values(RECIPES)) assert.ok(r.lvl <= 80, r.id);
    // au plus trois niveaux de suite sans machine, culture, arbre ni bête
    let dry = 0;
    for (let l = 30; l <= 80; l++) {
        const big =
            Object.values(MACHINES).some(m => m.reqLvl === l) ||
            Object.values(ANIMALS).some(a => a.reqLvl === l) ||
            Object.values(ITEMS).some(i => (i.type === 'crop' || i.type === 'tree') && i.reqLvl === l);
        dry = big ? 0 : dry + 1;
        assert.ok(dry <= 3, `niveau ${l} : ${dry} niveaux de suite sans nouveauté hors recettes`);
    }
});

test('80 niveaux : une machine s’ouvre avec des recettes, une recette jamais avant sa machine ni ses ingrédients', () => {
    const prodBy = {};
    for (const a of Object.values(ANIMALS)) for (const k of [a.prodId, a.extra]) if (k) prodBy[k] = Math.min(prodBy[k] ?? 999, a.reqLvl);
    for (const m of Object.values(MACHINES)) {
        if (m.reqLvl < 30) continue;
        const mine = Object.values(RECIPES).filter(r => r.machine === m.id);
        if (mine.length) assert.ok(mine.some(r => r.lvl === m.reqLvl), `${m.id} sans recette au niveau ${m.reqLvl}`);
    }
    for (const r of Object.values(RECIPES)) {
        assert.ok(r.lvl >= MACHINES[r.machine].reqLvl, `${r.id} avant sa machine`);
        for (const k of Object.keys(r.ing)) {
            const l = RECIPES[k] ? RECIPES[k].lvl : Math.max((ITEMS[k] && ITEMS[k].reqLvl) || 0, prodBy[k] || 0);
            assert.ok(l <= r.lvl, `${r.id} (${r.lvl}) avant ${k} (${l})`);
        }
    }
});

test('80 niveaux : les grandes étapes à leur nouvelle place', () => {
    assert.equal(CAMPING.lvl, lv80(57));
    assert.equal(MACHINES.emballerie.reqLvl, lv80(58));
    assert.equal(MACHINES.earthOven.reqLvl, lv80(59));
    assert.equal(MACHINES.berryKettle.reqLvl, lv80(64));
    assert.ok(MACHINES.berryKettle.reqLvl <= 80);
    for (let k = 1; k < CHAPTERS.length; k++) assert.ok(CHAPTERS[k].lvl <= 80);
});

test('80 niveaux : l’expérience ne change pas avant le 30, puis monte régulièrement', () => {
    for (let l = 1; l < 30; l++) assert.equal(G.getXpReq(l), G.getXpReq64(l));
    assert.ok(G.getXpReq(30) > G.getXpReq(29));
    for (let l = 31; l < 80; l++) assert.ok(G.getXpReq(l) > G.getXpReq(l - 1), `niveau ${l}`);
});

test('80 niveaux : une partie d’avant au-dessus du niveau 30 arrive au début de sa tranche et garde ce qu’elle avait', () => {
    for (const lv of [25, 30, 45, 58, 64]) {
        fresh();
        Object.assign(state, { level: lv, xp: 500, lv1109: false, lvKeep: {} });
        state.stats.maxLevel = lv;
        G.normalizeState();
        assert.ok(state.lv1109);
        assert.equal(state.level, lv >= 64 ? 80 : lv80(lv), `niveau ${lv}`);
        for (const r of Object.values(RECIPES)) if ((r.lv108 ?? r.lvl) <= lv) assert.ok(r.lvl <= state.level || state.lvKeep[r.id], `${r.id} refermée (niveau ${lv})`);
        for (const d of Object.values(ITEMS)) if (d.reqLvl && (d.lv108 ?? d.reqLvl) <= lv) assert.ok(lvOk(d), `${d.id} refermé (niveau ${lv})`);
        for (const m of Object.values(MACHINES)) if ((m.lv108 ?? m.reqLvl) <= lv) assert.ok(lvOk(m), `${m.id} refermée (niveau ${lv})`);
    }
});

test('1.110 : une bouture se vend (moitié du prix du jeune arbre), les simples d’un coup, jamais celles à greffon', () => {
    fresh();
    state.orchard.cuttings = [
        { id: 'apple', g: null, rem: null, v: null, mat: 10 },
        { id: 'apple', g: null, rem: null, v: null, mat: 20 },
        { id: 'apple', g: 'gold', rem: null, v: null, mat: 30 },
        { id: 'pear', g: null, rem: null, v: null, mat: 5 },
    ];
    assert.equal(G.cuttingPrice(state.orchard.cuttings[0]), ITEMS.apple.cost / 2);
    assert.ok(G.cuttingPrice(state.orchard.cuttings[2]) > G.cuttingPrice(state.orchard.cuttings[0]));
    let m = state.money;
    assert.equal(G.sellPlainCuttings('apple'), 2);
    assert.equal(state.money - m, ITEMS.apple.cost);
    assert.deepEqual(state.orchard.cuttings.map(c => c.id + (c.g || '')), ['applegold', 'pear']);
    m = state.money;
    assert.ok(G.sellCutting(0));
    assert.equal(state.money - m, Math.round((ITEMS.apple.cost * 0.75) / 5) * 5);
    assert.equal(G.sellCutting(5), false);
    assert.equal(G.sellPlainCuttings(null), 1);
    assert.equal(state.orchard.cuttings.length, 0);
    const src = readFileSync(new URL('../../src/ui/views/orchard2.js', import.meta.url), 'utf8');
    for (const act of ['cuttingsSheet', 'sellCutting', 'sellCuttingsOf', 'sellCuttingsAll']) assert.ok(new RegExp(`\\n {8}${act}: `).test(src), `action ${act}`);
});

test('1.111 : l’amélioration de la serre ajoute des parcelles même à une serre complète', () => {
    fresh();
    state.greenhouse.built = true;
    G.ensureGhPlots();
    assert.equal(state.greenhouse.plots.length, 12);
    state.greenhouse.plots.forEach(p => (p.isUnlocked = true));
    state.greenhouse.paid = 6;
    state.bld = state.bld || {};
    state.bld.b = { ...(state.bld.b || {}), greenhouse: 2 };
    assert.equal(G.ghExtraPlots(), 2);
    G.ghExtra();
    assert.equal(state.greenhouse.plots.length, 14);
    assert.equal(G.ghUnlocked(), 14);
    // une serre à 8 parcelles (6 + 2 achetées) passe à 10, sans rien perdre
    fresh();
    state.greenhouse.built = true;
    G.ensureGhPlots();
    state.greenhouse.plots.forEach((p, k) => (p.isUnlocked = k < 8));
    state.greenhouse.paid = 2;
    state.bld = state.bld || {};
    state.bld.b = { ...(state.bld.b || {}), greenhouse: 2 };
    G.ensureGhPlots();
    assert.equal(G.ghUnlocked(), 10);
    assert.equal(state.greenhouse.plots.length, 14);
});

test('1.111 : Théo et le cueilleur se mettent en pause', () => {
    fresh();
    state.farmhand = { lvl: 1, t: 0 };
    assert.ok(G.handZone().length > 0);
    assert.ok(G.toggleHand());
    assert.equal(G.handPaused(), true);
    assert.equal(G.handZone().length, 0);
    assert.equal(G.handOffline(3600).zone.size, 0);
    G.toggleHand();
    assert.ok(G.handZone().length > 0);
    state.orchard.picker = { lvl: 1, at: 0 };
    assert.ok(G.togglePicker());
    assert.equal(G.pickerPaused(), true);
    assert.equal(G.pickerTick(), false);
    assert.ok(G.togglePicker());
    assert.equal(G.pickerPaused(), false);
});

test('1.112 : une visite d’Armand donne au plus 60 % du niveau en expérience, les pièces ne changent pas', async () => {
    const { ARMAND } = await import('../../src/data/commerce.js');
    const { setClock } = await import('../../src/core/clock.js');
    fresh();
    state.level = 22;
    state.xp = 0;
    const id = 'apple';
    state.mastery[id] = 1000;
    const t = Math.floor(Date.now() / ARMAND.every) * ARMAND.every + 1000;
    setClock(() => t);
    try {
        G.armandTick();
        assert.ok(G.setFlagship(id));
        const o = G.armandOrder();
        G.armandTalk(0, 'yes');
        state.inventory[id] = o.qty;
        const total = G.xpToReach(state.level) + state.xp;
        const m = state.money;
        const cap = G.armandXpCap();
        assert.equal(cap, Math.round(0.6 * G.getXpReq(22)));
        state.lvGoals = { lvl: 22, list: [] };
        assert.ok(G.deliverArmand(null));
        assert.ok(o.done);
        const got = G.xpToReach(state.level) + state.xp - total;
        assert.ok(got > cap * 0.9 && got <= cap, `expérience ${got} pour un plafond de ${cap}`);
        assert.ok(state.money - m >= G.armandTotal(o), 'les pièces ne sont pas plafonnées');
    } finally {
        setClock(() => Date.now());
    }
});

test('1.113 : la carte de visite (personnage et nom de ferme)', async () => {
    const { randomId, isHabitant } = await import('../../src/art/habitants.js');
    fresh();
    assert.equal(G.identitySet(), false);
    assert.equal(G.farmName(), G.DEFAULT_FARM);
    assert.ok(isHabitant(G.meLook()));
    assert.equal(G.setIdentity('pas un visage', 'X'), false);
    const look = randomId(42);
    assert.ok(G.setIdentity(look, '   Les   Trois  Chênes  et beaucoup trop de lettres   '));
    assert.equal(G.identitySet(), true);
    assert.equal(G.meLook(), look);
    assert.equal(G.farmName(), 'Les Trois Chênes et be');
    assert.ok(G.farmName().length <= G.FARM_NAME_MAX);
    assert.ok(G.setIdentity(look, ''));
    assert.equal(G.farmName(), G.DEFAULT_FARM);
    // elle survit à la sauvegarde
    G.setIdentity(look, 'Le Clos');
    writeSave();
    G.loadGame();
    assert.equal(G.farmName(), 'Le Clos');
    assert.equal(G.meLook(), look);
});
