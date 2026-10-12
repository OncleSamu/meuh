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

test('chaque recette et chaque chantier peut être fait avant le niveau 40', () => {
    const ok = new Set(Object.values(ITEMS).filter(i => i.type !== 'artisan' && (i.reqLvl || 0) <= 40).map(i => i.id));
    let grew = true;
    while (grew) {
        grew = false;
        for (const r of Object.values(RECIPES))
            if (!ok.has(r.id) && MACHINES[r.machine] && MACHINES[r.machine].reqLvl <= 40 && Object.keys(r.ing).every(k => ok.has(k))) {
                ok.add(r.id);
                grew = true;
            }
    }
    assert.deepEqual(Object.keys(RECIPES).filter(id => !ok.has(id)), []);
    for (const p of Object.values(PROJECTS)) for (const k of Object.keys(p.need)) assert.ok(ok.has(k), `${p.id} : ${k}`);
});
