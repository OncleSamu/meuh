// Revue 1.15.4 : ce que l'audit a trouvé.
import test from 'node:test';
import assert from 'node:assert/strict';
import { state, newState, fromSave } from '../../src/core/state.js';
import * as G from '../../src/systems/index.js';
import { ITEMS } from '../../src/data/items.js';
import { RECIPES } from '../../src/data/machines.js';

test('lvKeep et moved131 survivent à un rechargement', () => {
    const s = newState();
    s.lvKeep = { carrot: true };
    s.moved131 = true;
    const back = fromSave(JSON.parse(JSON.stringify(s)));
    assert.deepEqual(back.lvKeep, { carrot: true });
    assert.equal(back.moved131, true);
});

test('aucune recette ne vaut moins que ses ingrédients', () => {
    for (const r of Object.values(RECIPES)) {
        const cost = Object.entries(r.ing).reduce((a, [k, q]) => a + (ITEMS[k].sell || 0) * q, 0);
        const out = ITEMS[r.id] && ITEMS[r.id].sell;
        if (out && cost) assert.ok(out >= cost, `${r.id} : ${out} < ${cost}`);
    }
});

test('Débiter les morts : un appui libère toutes les places', () => {
    G.loadGame();
    state.level = 50;
    state.barn.lvl = 12;
    G.ensureOrchard();
    state.orchard.slots.forEach(x => (x.tree = null));
    for (let k = 0; k < 3; k++) {
        state.orchard.slots[k].open = true;
        state.orchard.slots[k].tree = { id: 'apple', age: 0, drops: 500, ground: 0, prog: 0, gq: 0 };
    }
    const before = state.inventory.wood;
    assert.equal(G.deadTrees('farm'), 3);
    assert.equal(G.fellDeadTrees(null), 3);
    assert.equal(G.deadTrees('farm'), 0);
    assert.ok(state.inventory.wood > before);
    assert.equal(G.fellDeadTrees(null), 0);
});
