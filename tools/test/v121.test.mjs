// 1.121 : chaque trait visible d'une espèce change vraiment son dessin ; les caractères ont leurs propres icônes.
import test from 'node:test';
import assert from 'node:assert/strict';
import { FEATURES, featuresOf, PLANT_TRAITS, ANIMAL_TRAITS } from '../../src/data/genetics.js';
import { art } from '../../src/ui/icons.js';

test('chaque variante de chaque trait visible se voit sur le dessin', () => {
    for (const [k, F] of Object.entries(FEATURES))
        for (const sp of F.species) {
            const fs = featuresOf(sp);
            const key = v => {
                const a = fs.map(() => 0);
                a[fs.indexOf(k)] = v;
                return v ? `${sp}~${a.join('')}` : sp;
            };
            const seen = new Set([art('animal', key(0))]);
            F.list.forEach((n, v) => {
                if (!v) return;
                const s = art('animal', key(v));
                // « sans cornes » peut être l'allure naturelle d'une espèce sans cornes (le mouton)
                if (!(k === 'horns' && v === 1)) assert.ok(!seen.has(s), `${sp} : ${F.name} ${n} ne se voit pas`);
                seen.add(s);
            });
        }
});

test('les icônes des caractères existent et ne sont plus empruntées', () => {
    for (const t of [...PLANT_TRAITS, ...ANIMAL_TRAITS]) assert.ok(art(...t.icon).length > 50, t.id);
    const own = { late: 'gLate', luck: 'gLuck', soft: 'gSoft', fertile: 'gFertile', health: 'gHealth', social: 'gSocial', curious: 'gCurious' };
    for (const [id, ic] of Object.entries(own)) assert.ok([...PLANT_TRAITS, ...ANIMAL_TRAITS].some(t => t.id === id && t.icon[1] === ic), id);
    assert.ok(art('ui', 'seedPack').length > 50);
});
