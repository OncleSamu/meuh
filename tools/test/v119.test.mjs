// 1.119 : la lignée retient les caractères de chaque ancêtre.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { clock, memStore } from './helpers.mjs';
import { state, setStore, SAVE_KEY } from '../../src/core/state.js';
import { setView } from '../../src/core/view.js';
import * as G from '../../src/systems/index.js';
import { PROJECTS } from '../../src/data/village.js';
import { GENETICS } from '../../src/data/genetics.js';

const OLD = readFileSync(new URL('./fixtures/save-6.2.json', import.meta.url), 'utf8');
const tick = s => {
    for (let k = 0; k < s; k++) {
        clock.t += 1000;
        G.gameTick();
    }
};
const build = id => {
    Object.entries(PROJECTS[id].need).forEach(([k, n]) => (state.inventory[k] = Math.max(state.inventory[k] || 0, n)));
    G.giveAllToProject(id);
    return G.finishProject(id);
};
const cross = (a, b) => {
    for (let k = 0; k < 30; k++) {
        assert.ok(G.startCross(a, b));
        tick(GENETICS.crossTime + 1);
        const L = G.finishCross();
        if (L) return G.keepSeedling(L.id, 0);
    }
    return null;
};

test('un croisement note les caractères des parents et des grands-parents', () => {
    const st = memStore();
    st.setItem(SAVE_KEY, OLD);
    setStore(st);
    clock.t = JSON.parse(OLD).lastSaved + 1000;
    G.loadGame();
    setView({ started: true, tab: 'farm' });
    state.level = 44;
    state.money = 1e9;
    state.barn.lvl = 80;
    G.CHAPTER_ORDER.slice(0, G.CHAPTER_ORDER.indexOf(15)).forEach(n => G.chapterProjects(n).forEach(p => (G.projState(p.id).done = true)));
    for (const id of ['pollination', 'breeding', 'lab']) assert.ok(build(id), id);
    const v1 = cross('strawberry', 'pepper');
    assert.ok(v1);
    const v2 = cross(v1.id, 'tomato');
    assert.ok(v2);
    const p = v2.lin.find(x => x && x.lin);
    assert.ok(p, 'un parent avec ses propres parents');
    assert.equal(p.k, G.traitKey(v1.g, G.PLANT_IDS), 'le parent garde ses caractères');
    assert.equal(p.k.length, G.PLANT_IDS.length);
    // une plante sauvage n'a pas de chiffres, mais la création elle-même en a
    assert.ok(G.lineSnap(v2).k);
    // les bêtes aussi
    const cows = state.animals.filter(a => a.type === 'cow' && G.isAdult(a));
    const s = G.lineSnap(cows[0]);
    assert.equal(s.k.length, G.ANIMAL_IDS.length);
    if (process.env.DUMP119) writeFileSync(process.env.DUMP119, JSON.stringify({ ...state, lastSaved: clock.t }));
});

test('la lignée se touche : chaque ancêtre ouvre sa fiche', () => {
    const lab = readFileSync(new URL('../../src/ui/views/lab.js', import.meta.url), 'utf8');
    const gl = readFileSync(new URL('../../src/ui/genlook.js', import.meta.url), 'utf8');
    assert.match(gl, /data-act="lnNode"/);
    assert.match(lab, /\n {8}lnNode: /);
    assert.match(lab, /defineSheet\('lnNode'/);
});
