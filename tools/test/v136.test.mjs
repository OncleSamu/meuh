// 1.36 : soixante niveaux. Tout est réparti, rien ne se perd, les anciennes parties gardent ce qu'elles avaient ouvert.
import test from 'node:test';
import { RECIPES_153 } from '../../src/data/v153.js';
import { NEW_DRINKS_154 } from '../../src/data/counter.js';
import { RECIPES_150 } from '../../src/data/v150.js';
import assert from 'node:assert/strict';
import './helpers.mjs';
import * as G from '../../src/systems/index.js';
import { state, scaleLvl } from '../../src/core/state.js';
import { ITEMS } from '../../src/data/items.js';
import { MACHINES, RECIPES } from '../../src/data/machines.js';
import { ANIMALS } from '../../src/data/animals.js';
import { MAX_LEVEL, PRESTIGE_LVL } from '../../src/data/progress.js';
import { CHAPTERS } from '../../src/data/village.js';
import { HARAS_LVL } from '../../src/data/haras.js';
import { LV60_ITEM, LV60_ANIMAL, LV60_MACH, LV60_REC } from '../../src/data/levels60.js';

test('1.36 : soixante niveaux, les grandes étapes à leur place', () => {
    assert.equal(MAX_LEVEL, 60);
    assert.equal(PRESTIGE_LVL, 60);
    assert.equal(HARAS_LVL, 45);
    assert.deepEqual(
        [9, 10, 11, 12].map(n => CHAPTERS.find(c => c.n === n).lvl),
        [50, 52, 53, 54],
    );
    assert.equal(CHAPTERS.find(c => c.n === 16).lvl, 43, 'le Salon ne bouge pas');
});

test('1.36 : le début de partie (niveaux 1 à 20) ne bouge pas', () => {
    for (const t of [LV60_ITEM, LV60_ANIMAL, LV60_MACH, LV60_REC]) for (const [id, l] of Object.entries(t)) assert.ok(l > 20, `${id} : ${l}`);
    for (const t of [ITEMS, ANIMALS, MACHINES])
        for (const d of Object.values(t)) if (d.lv135 !== undefined) assert.ok(d.lv135 > 20 && d.reqLvl >= d.lv135, d.id);
    for (const r of Object.values(RECIPES)) if (r.lv135 !== undefined) assert.ok(r.lv135 > 20 && r.lvl >= r.lv135, r.id);
});

test('1.36 : chaque niveau de 2 à 60 ouvre quelque chose, aucune recette au-delà du 60', () => {
    for (let l = 2; l <= MAX_LEVEL; l++) assert.ok(G.unlocksAt(l).length > 1, `niveau ${l} vide`);
    for (const r of Object.values(RECIPES)) assert.ok(r.lvl <= MAX_LEVEL, `${r.id} : ${r.lvl}`);
    for (const m of Object.values(MACHINES)) assert.ok(m.reqLvl <= MAX_LEVEL, m.id);
});

test('1.36 : un rythme à peu près égal (recettes, plantes, animaux, machines)', () => {
    const per = (vals, from, to) => vals.filter(l => l >= from && l <= to).length;
    // 1.50 : la cuisine de l'oasis arrive d'un bloc avec son voyage (chapitres 21 et 22) : hors du compte par niveau
    // 1.53 : celle du Grand Nord aussi (chapitres 23 et 24)
    const oasis = new Set([...RECIPES_150.map(r => r[0]), ...RECIPES_153.map(r => r[0]), ...NEW_DRINKS_154.map(r => r[0])]);
    const rec = Object.values(RECIPES)
        .filter(r => !oasis.has(r.id))
        .map(r => r.lvl);
    for (let l = 21; l <= MAX_LEVEL; l++) assert.ok(per(rec, l, l) <= 20, `niveau ${l} : ${per(rec, l, l)} recettes`);
    const plants = Object.values(ITEMS)
        .filter(i => (i.type === 'crop' || i.type === 'tree') && i.reqLvl > 1)
        .map(i => i.reqLvl);
    for (const [a, b] of [
        [21, 30],
        [31, 40],
        [41, 50],
        [51, 60],
    ])
        assert.ok(per(plants, a, b) >= 9, `plantes ${a}-${b}`);
    const an = Object.values(ANIMALS).map(a => a.reqLvl);
    for (const [a, b] of [
        [11, 20],
        [21, 30],
        [31, 40],
        [41, 50],
        [51, 60],
    ])
        assert.ok(per(an, a, b) >= 3, `animaux ${a}-${b}`);
    // 1.53 : les trois machines du Grand Nord arrivent d'un bloc au niveau 60
    const mach = Object.values(MACHINES)
        .filter(m => !['tiledStove', 'taigaPot', 'berryKettle'].includes(m.id))
        .map(m => m.reqLvl);
    assert.ok(per(mach, 51, 60) >= 2, 'machines 51-60');
    assert.equal(new Set(mach).size, mach.length, 'une machine par niveau');
});

test('1.36 : la courbe d’expérience s’étire sur 60 niveaux, les gains gardent l’échelle d’avant', () => {
    for (let l = 2; l < 60; l++) assert.ok(G.getXpReq(l) >= G.getXpReq(l - 1), `niveau ${l}`);
    const total = G.xpToReach(60);
    assert.ok(total > G.xpToReach(50, G.getXpReq50) && total < G.xpToReach(50, G.getXpReq50) * 1.4, `total ${total}`);
    state.level = 60;
    assert.ok(Math.abs(scaleLvl() - 40) < 1e-9, 'le niveau 60 vaut l’ancien niveau 50');
    state.level = 1;
    assert.equal(scaleLvl(), 1);
});

const asOld = (level, extra = {}) => {
    G.loadGame();
    Object.assign(state, { level, xp: 0, lv136: false, lvKeep: {}, ...extra });
    G.normalizeState();
};

test('1.36 : une partie des niveaux 20 à 46 garde son expérience totale et tout ce qu’elle avait ouvert', () => {
    for (const lv of [20, 30, 44, 46]) {
        asOld(lv, { xp: 100 });
        const was = G.xpToReach(lv, G.getXpReq50) + 100;
        assert.ok(state.lv136);
        assert.ok(state.level >= lv && state.level <= 60, `niveau ${state.level}`);
        assert.ok(Math.abs(G.xpToReach(state.level) + state.xp - was) <= 10, 'expérience totale gardée');
        for (const o of [ITEMS, ANIMALS, MACHINES])
            for (const d of Object.values(o))
                if (d.lv135 !== undefined && d.lv135 <= lv) assert.ok(d.reqLvl <= state.level || state.lvKeep[d.id], `${d.id} (niveau ${lv}) refermé`);
        for (const r of Object.values(RECIPES))
            if (r.lv135 !== undefined && r.lv135 <= lv) assert.ok(r.lvl <= state.level || state.lvKeep[r.id], `${r.id} (niveau ${lv}) refermée`);
    }
});

test('1.36 : une partie du niveau 50 monte, les étoiles redeviennent de l’expérience', () => {
    asOld(50, { xp: 10, renown: 0 });
    assert.ok(state.level > 50 && state.level <= 60, 'niveau ' + state.level);
    assert.equal(state.renown, 0);
    asOld(50, { xp: 10, renown: 3 });
    const a = state.level;
    assert.ok(a > 50);
    asOld(50, { xp: 0, renown: 400 });
    assert.equal(state.level, 60);
    assert.ok(state.renown > 0 && state.renown < 400);
    assert.ok(state.stats.maxLevel >= 50);
});

test('1.36 : un chapitre commencé avant le déplacement reste ouvert', () => {
    G.loadGame();
    state.story.seen[9] = true;
    state.lv136 = false;
    state.level = 46;
    G.normalizeState();
    assert.ok(state.story.keep[9]);
});
