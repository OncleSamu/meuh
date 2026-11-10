// 1.105 : audit total. Les objectifs de niveau ne demandent plus rien qui dépende de la chance ou d'un bâtiment que rien n'annonce.
import test from 'node:test';
import assert from 'node:assert/strict';
import { memStore } from './helpers.mjs';
import { state, setStore } from '../../src/core/state.js';
import { setView } from '../../src/core/view.js';
import * as G from '../../src/systems/index.js';
import { ITEMS } from '../../src/data/items.js';
import { MACHINES, RECIPES } from '../../src/data/machines.js';
import { FISH } from '../../src/data/meta.js';
import { PROJECTS } from '../../src/data/village.js';

function farm() {
    setStore(memStore());
    G.loadGame();
    setView({ started: false, tab: 'farm', hidden: false });
    state.tutorial.done = true;
    for (const p of Object.values(PROJECTS)) state.projects[p.id] = { given: {}, done: true };
}
const deep = (id, f, d = 0) => {
    f(id);
    const r = RECIPES[id];
    if (r && d < 3) Object.keys(r.ing).forEach(k => deep(k, f, d + 1));
};

test('objectifs de niveau : jamais de pierre précieuse, de poisson rare, de produit de serre sans serre, ni d’emballerie', () => {
    farm();
    // deux fermes : sans aucune machine (l'objectif « acheter la machine du niveau »), puis avec toutes (« une recette du niveau »)
    for (const all of [false, true]) {
        if (all) for (const m of Object.keys(MACHINES)) state.machines.push(G.newMachine(m));
        for (let L = 2; L < 64; L++) {
            state.level = L;
            for (const g of G.makeGoals(L)) {
                if (g.kind === 'machine') assert.notEqual(g.id, 'emballerie');
                if (g.kind !== 'make' || !RECIPES[g.id]) continue;
                assert.notEqual(RECIPES[g.id].machine, 'emballerie', g.id);
                deep(g.id, k => {
                    const d = ITEMS[k];
                    assert.notEqual(d.type, 'gem', `${g.id} demande ${k}`);
                    if (d.type === 'fish') assert.ok(FISH[k].odds >= 10, `${g.id} demande ${k}, trop rare`);
                    assert.ok(!d.ghOnly, `${g.id} demande ${k}, qui ne pousse qu'en serre`);
                });
            }
        }
    }
});

test('objectifs de niveau : la truite fumée reste un objectif possible (poisson courant de la berge)', () => {
    farm();
    state.machines.push(G.newMachine('smokehouse'));
    state.level = 13;
    assert.ok(G.makeGoals(13).some(g => g.id === 'smokedTrout'));
});

test('astuces : toute l’astuce se touche pour la fermer', async () => {
    const { hint } = await import('../../src/ui/kit.js').catch(() => ({}));
    if (!hint) return; // l'interface ne se charge pas hors navigateur
    assert.match(hint('Une astuce de test 1.105'), /class="hint"[^>]*data-act="hintHide"/);
});
