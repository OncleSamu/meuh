// 1.16 : récompenses des chantiers à l'échelle des 50 niveaux.
import test from 'node:test';
import assert from 'node:assert/strict';
import { state } from '../../src/core/state.js';
import * as G from '../../src/systems/index.js';
import { PROJECTS, CHAPTERS } from '../../src/data/village.js';

const start = () => {
    G.loadGame();
    state.level = 50;
    state.money = 0;
};

test("l'expérience d'un chantier grandit avec le niveau du chapitre", () => {
    start();
    const first = G.projectXp(PROJECTS.station);
    const last = G.projectXp(Object.values(PROJECTS).find(p => p.ch === 12));
    assert.ok(first >= 300);
    assert.ok(last > 5000, `chantier du dernier chapitre : ${last}`);
    for (const p of Object.values(PROJECTS)) assert.ok(G.projectXp(p) >= 150 + G.chapterNum(p.ch) * 150);
});

test('le dernier chantier d’un chapitre rapporte pièces et ruban, une seule fois', () => {
    start();
    const n = 5;
    const ps = Object.values(PROJECTS).filter(p => p.ch === n);
    state.story.keep = { ...(state.story.keep || {}), [n]: true };
    const before = state.prestige.rubans;
    ps.forEach(p => {
        Object.entries(p.need).forEach(([k, q]) => (state.inventory[k] = q + 5));
        G.giveAllToProject(p.id);
        assert.ok(G.finishProject(p.id), p.id);
    });
    assert.ok(G.chapterDone(n));
    assert.equal(state.prestige.rubans, before + 1);
    assert.ok(state.money >= 500 + CHAPTERS[n - 1].lvl ** 2 * 8 - 5);
    assert.equal(G.chapterBonus(n), null);
});
