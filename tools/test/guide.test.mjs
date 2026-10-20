// Le Guide du fermier : pages cohérentes (liens, icônes, destinations).
import test from 'node:test';
import assert from 'node:assert/strict';
import { GUIDE_CATS, GUIDE_PAGES } from '../../src/data/guide.js';

test('guide : ids uniques, catégories valides, liens existants', () => {
    const ids = GUIDE_PAGES.map(g => g.id);
    assert.equal(new Set(ids).size, ids.length);
    const cats = GUIDE_CATS.map(c => c.id);
    for (const g of GUIDE_PAGES) {
        assert.ok(cats.includes(g.cat), `${g.id} : catégorie ${g.cat}`);
        assert.ok(g.name && g.intro && g.secs.length, `${g.id} : incomplet`);
        for (const s of g.secs) assert.ok(s.h && (s.t || (s.b && s.b.length)), `${g.id} : section vide`);
        for (const r of g.see || []) assert.ok(ids.includes(r), `${g.id} → ${r} inconnu`);
    }
    for (const c of cats)
        assert.ok(
            GUIDE_PAGES.some(g => g.cat === c),
            `catégorie vide : ${c}`,
        );
});

test('guide : chaque icône existe', async () => {
    const { SPR } = await import('../../src/art/index.js');
    const map = { item: 'items', animal: 'animals', machine: 'machines', ui: 'ui', villager: 'people' };
    const all = [...GUIDE_CATS.map(c => [c.id, c.icon]), ...GUIDE_PAGES.map(g => [g.id, g.icon])];
    for (const [id, [kind, name]] of all) assert.ok(SPR.has[map[kind]] && SPR.has[map[kind]][name], `${id} : icône ${kind}/${name}`);
});
