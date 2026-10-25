// Audit 1.0 : petites vérifications transverses (textes, données).
import test from 'node:test';
import assert from 'node:assert/strict';
import { pluralFr, qtyName } from '../../src/core/format.js';
import { ITEMS } from '../../src/data/items.js';
import { RECIPES, MACHINES } from '../../src/data/machines.js';
import { PROJECTS } from '../../src/data/village.js';

test('pluriel des noms de produits', () => {
    assert.equal(pluralFr('Pomme de terre'), 'Pommes de terre');
    assert.equal(pluralFr('Patate douce'), 'Patates douces');
    assert.equal(pluralFr('Gâteau de Savoie'), 'Gâteaux de Savoie');
    assert.equal(pluralFr('Noix de coco'), 'Noix de coco');
    assert.equal(pluralFr('Chou'), 'Choux');
    assert.equal(qtyName(1, 'Oignon'), '1 oignon');
    assert.equal(qtyName(5, 'Oignon'), '5 oignons');
});

test('chaque recette et chaque chantier peut être fait au plus tard au niveau 60', () => {
    const ok = new Set(
        Object.values(ITEMS)
            .filter(i => i.type !== 'artisan' && (i.reqLvl || 0) <= 60)
            .map(i => i.id),
    );
    let grew = true;
    while (grew) {
        grew = false;
        for (const r of Object.values(RECIPES))
            if (!ok.has(r.id) && MACHINES[r.machine] && MACHINES[r.machine].reqLvl <= 60 && Object.keys(r.ing).every(k => ok.has(k))) {
                ok.add(r.id);
                grew = true;
            }
    }
    assert.deepEqual(
        Object.keys(RECIPES).filter(id => !ok.has(id)),
        [],
    );
    for (const p of Object.values(PROJECTS)) for (const k of Object.keys(p.need)) assert.ok(ok.has(k), `${p.id} : ${k}`);
});

test('1.4.1 : ce que demande un chantier est débloqué avant son chapitre', async () => {
    const { ANIMALS } = await import('../../src/data/animals.js');
    const { CHAPTERS } = await import('../../src/data/village.js');
    const prodBy = {};
    for (const a of Object.values(ANIMALS)) prodBy[a.prodId] = Math.min(prodBy[a.prodId] || 99, a.reqLvl);
    // produits qui attendent un chantier ou l'île : ils arrivent avec leur propre chapitre
    const gated = id => {
        const it = ITEMS[id],
            r = RECIPES[id];
        if (it.needProject || it.island) return true;
        return !!r && (!!MACHINES[r.machine].needProject || Object.keys(r.ing).some(gated));
    };
    const memo = {};
    const lvlOf = id => {
        if (memo[id] !== undefined) return memo[id];
        memo[id] = 0;
        let l = Math.min(ITEMS[id].reqLvl || 99, prodBy[id] || 99);
        const r = RECIPES[id];
        if (r) l = Math.min(l, Math.max(r.lvl || 1, MACHINES[r.machine].reqLvl, ...Object.keys(r.ing).map(lvlOf)));
        return (memo[id] = l === 99 ? 0 : l);
    };
    for (const p of Object.values(PROJECTS)) {
        const c = CHAPTERS[p.ch - 1].lvl;
        for (const k of Object.keys(p.need)) if (!gated(k)) assert.ok(lvlOf(k) <= Math.max(2, c - 1), `${p.id} (niveau ${c}) : ${k} au niveau ${lvlOf(k)}`);
    }
});

test('aucune règle exportée deux fois sous le même nom (sinon elle disparaît de systems/index.js)', async () => {
    const fs = await import('node:fs');
    const dir = new URL('../../src/systems/', import.meta.url);
    const seen = {};
    for (const f of fs.readdirSync(dir)) {
        if (f === 'index.js') continue;
        for (const k of Object.keys(await import(new URL(f, dir)))) (seen[k] = seen[k] || []).push(f);
    }
    assert.deepEqual(
        Object.entries(seen).filter(([, v]) => v.length > 1),
        [],
    );
});

test('1.8 : une machine par niveau, avec au moins une recette faisable et ses matériaux', async () => {
    const { MAT } = await import('../../src/data/farm.js');
    const { NATURE } = await import('../../src/data/nature.js');
    const { ANIMALS } = await import('../../src/data/animals.js');
    const { CHAPTERS } = await import('../../src/data/village.js');
    const prodBy = {};
    for (const a of Object.values(ANIMALS)) prodBy[a.prodId] = Math.min(prodBy[a.prodId] || 99, a.reqLvl);
    const projLvl = p => CHAPTERS[PROJECTS[p].ch - 1].lvl;
    const avail = id => {
        const r = RECIPES[id];
        if (r) return Math.max(r.lvl, MACHINES[r.machine].reqLvl, MACHINES[r.machine].needProject ? projLvl(MACHINES[r.machine].needProject) : 0);
        const it = ITEMS[id];
        return Math.min(Math.max(it.reqLvl || 1, it.needProject ? projLvl(it.needProject) : 0), prodBy[id] || 99);
    };
    const seen = {};
    for (const m of Object.values(MACHINES)) {
        assert.ok(!seen[m.reqLvl], `niveau ${m.reqLvl} : ${seen[m.reqLvl]} et ${m.id}`);
        seen[m.reqLvl] = m.id;
        const rs = Object.values(RECIPES).filter(r => r.machine === m.id);
        assert.ok(
            rs.every(r => r.lvl >= m.reqLvl),
            `${m.id} : une recette avant la machine`,
        );
        const ok = rs.filter(
            r =>
                r.lvl <= m.reqLvl &&
                !r.teacher &&
                !r.fete &&
                !r.holiday &&
                Object.keys(r.ing).every(k => avail(k) <= Math.max(m.reqLvl, m.needProject ? projLvl(m.needProject) : 0)),
        );
        assert.ok(ok.length >= 1, `${m.id} (niveau ${m.reqLvl}) : aucune recette faisable à son ouverture`);
        const mats = MAT.machine[m.id] || {};
        if (mats.wood) assert.ok(m.reqLvl >= NATURE.forest.lvl, `${m.id} : du bois avant la forêt`);
        if (mats.stone) assert.ok(m.reqLvl >= NATURE.mine.lvl, `${m.id} : de la pierre avant la mine`);
    }
});
