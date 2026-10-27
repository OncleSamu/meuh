// 1.59 : l'audit. Nombres et durées lisibles, typographie, noms uniques, dessins complets.
import test from 'node:test';
import assert from 'node:assert/strict';
import { fmt, formatDuration } from '../../src/core/format.js';
import { frenchSpaces } from '../../src/ui/typo.js';
import { ITEMS } from '../../src/data/items.js';
import { RECIPES } from '../../src/data/machines.js';
import { SPR } from '../../src/art/index.js';
import * as G from '../../src/systems/index.js';

const NB = ' ';

test('les très grands nombres restent lisibles, jamais en écriture scientifique', () => {
    assert.equal(fmt(2.5e9), '2,5 Md');
    assert.equal(fmt(1.2e12).replace(/\s/g, ' '), '1 200 Md');
    assert.equal(fmt(8.6e63), '∞');
    assert.ok(!/e\+/.test(fmt(1e20)));
});

test('une durée ronde s’écrit ronde', () => {
    assert.equal(formatDuration(45 * 60), '45 min');
    assert.equal(formatDuration(2 * 3600), '2 h');
    assert.equal(formatDuration(3600 + 5 * 60), '1 h 05');
    assert.equal(formatDuration(61), '1 min 01');
});

test('l’affichage : apostrophe typographique, durées et comptes insécables, grands nombres groupés', () => {
    assert.equal(frenchSpaces("L'école"), 'L’école');
    assert.equal(frenchSpaces('dans 1 h 11'), `dans 1${NB}h${NB}11`);
    assert.equal(frenchSpaces('(1 / 3)'), `(1${NB}/${NB}3)`);
    assert.equal(frenchSpaces('13113 dorés').replace(/\s/g, ' '), '13 113 dorés');
    assert.equal(frenchSpaces('2026'), '2026');
    assert.equal(frenchSpaces('Bot v14212'), 'Bot v14212');
});

test('deux produits n’ont jamais le même nom', () => {
    const seen = {};
    for (const [id, d] of Object.entries(ITEMS)) {
        assert.ok(!seen[d.name], `${d.name} : ${seen[d.name]} et ${id}`);
        seen[d.name] = id;
    }
});

test('aucun dessin ne contient « undefined »', () => {
    for (const id of Object.keys(ITEMS)) assert.ok(!/undefined|NaN/.test(SPR.item(id)), id);
});

test('les recettes d’une machine : une liste rangée une fois, complète', () => {
    const n = Object.values(RECIPES).filter(r => r.machine === 'bakery').length;
    assert.equal(G.recipesOf('bakery').length, n);
    assert.equal(G.recipesOf('bakery'), G.recipesOf('bakery'));
});
