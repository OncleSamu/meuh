// 1.150 : Visages de la vallée — couverture complète du générateur d'habitants enrichi (151 éléments, base 36 rétrocompatible base 12).
import test from 'node:test';
import assert from 'node:assert/strict';
import {
    EYES,
    HAIRS,
    SHIRTS,
    SKINS,
    TRAIT_COUNT,
    TRAIT_LABELS,
    TRAIT_NAMES,
    TRAITS,
    habitantArt,
    idOf,
    isHabitant,
    lookOf,
    randomId,
} from '../../src/art/habitants.js';

test('1.150 : rétrocompatibilité complète avec les anciens identifiants base 12', () => {
    const legacyIds = ['h514012302620', 'h078533425934', 'h122000102120', 'h200000000000'];
    for (const id of legacyIds) {
        assert.equal(isHabitant(id), true, `ID historique rejeté : ${id}`);
        const look = lookOf(id);
        assert.equal(idOf(look), id, `Aller-retour cassé pour ${id}`);
        const svg = habitantArt(id);
        assert.ok(svg.length > 100 && !svg.includes('undefined') && !svg.includes('NaN'));
    }
    // Vérification exacte des valeurs décodées pour un ID historique connu
    const k = lookOf('h514012302620');
    assert.deepEqual(k, {
        skin: 5,
        hair: 1,
        hairColor: 4,
        beard: 0,
        nose: 1,
        eyes: 2,
        eyeColor: 3,
        glasses: 0,
        hat: 2,
        shirt: 6,
        collar: 2,
        extra: 0,
    });
});

test('1.150 : encodage base 36 valide et réversible pour tous les indices étendus', () => {
    const maxLook = {};
    for (const t of TRAITS) maxLook[t] = TRAIT_COUNT[t] - 1;
    const maxId = idOf(maxLook);
    assert.equal(maxId.length, 13);
    assert.equal(isHabitant(maxId), true);
    assert.deepEqual(lookOf(maxId), maxLook);

    const svg = habitantArt(maxId);
    assert.ok(svg.length > 100 && !svg.includes('undefined') && !svg.includes('NaN'));
});

test('1.150 : chaque variante des 12 traits (151 éléments) rend un SVG propre sans undefined ni NaN', () => {
    const total = TRAITS.reduce((sum, t) => sum + TRAIT_COUNT[t], 0);
    assert.equal(total, 151);
    assert.equal(SKINS.length, TRAIT_COUNT.skin);
    assert.equal(HAIRS.length, TRAIT_COUNT.hairColor);
    assert.equal(EYES.length, TRAIT_COUNT.eyeColor);
    assert.equal(SHIRTS.length, TRAIT_COUNT.shirt);

    const base = lookOf('h122000100100');
    for (const t of TRAITS) {
        assert.ok(TRAIT_NAMES[t], `Nom manquant pour ${t}`);
        if (TRAIT_LABELS[t]) {
            assert.equal(TRAIT_LABELS[t].length, TRAIT_COUNT[t], `Nombre de libellés incorrect pour ${t}`);
        }
        for (let i = 0; i < TRAIT_COUNT[t]; i++) {
            const id = idOf({ ...base, [t]: i });
            assert.equal(isHabitant(id), true);
            const svg = habitantArt(id);
            assert.ok(svg.length > 80, `SVG trop court pour ${t}=${i}`);
            assert.ok(!svg.includes('undefined'), `undefined dans le SVG pour ${t}=${i}`);
            assert.ok(!svg.includes('NaN'), `NaN dans le SVG pour ${t}=${i}`);
        }
    }
});

test('1.150 : randomId couvre correctement les modes féminin, masculin, âgé et neutre', () => {
    for (const opts of [{}, { female: true }, { male: true }, { old: true }]) {
        let greyCount = 0;
        for (let seed = 1; seed <= 40; seed++) {
            const id = randomId(seed * 7919, opts);
            assert.equal(isHabitant(id), true);
            const svg = habitantArt(id);
            assert.ok(!svg.includes('undefined') && !svg.includes('NaN'));
            const k = lookOf(id);
            if (opts.female) assert.equal(k.beard, 0);
            if (opts.old && [7, 8, 10].includes(k.hairColor)) greyCount++;
        }
        if (opts.old) assert.ok(greyCount >= 20, `Trop peu de cheveux gris/blancs en mode âgé : ${greyCount}/40`);
    }
});
