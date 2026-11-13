// 1.98 : la fabrique d'habitants. Un visage se décrit par une chaîne de 12 chiffres (base 12) collée derrière « h » :
// l'identifiant EST le dessin, donc rien à enregistrer et un nouvel habitant est un simple tirage.
// Traits (dans l'ordre) : peau, coiffure, couleur de cheveux, barbe, nez, yeux, couleur des yeux, lunettes, chapeau, chemise, col, détail.
import { C, E, F, FC, HL, L, O, P, R } from './kit.js';

export const TRAITS = ['skin', 'hair', 'hairColor', 'beard', 'nose', 'eyes', 'eyeColor', 'glasses', 'hat', 'shirt', 'collar', 'extra'];
export const TRAIT_COUNT = { skin: 6, hair: 8, hairColor: 9, beard: 6, nose: 4, eyes: 4, eyeColor: 5, glasses: 3, hat: 6, shirt: 10, collar: 4, extra: 5 };
export const TRAIT_NAMES = {
    skin: 'Teint',
    hair: 'Coiffure',
    hairColor: 'Cheveux',
    beard: 'Barbe',
    nose: 'Nez',
    eyes: 'Regard',
    eyeColor: 'Yeux',
    glasses: 'Lunettes',
    hat: 'Chapeau',
    shirt: 'Vêtement',
    collar: 'Col',
    extra: 'Détail',
};
export const SKINS = ['#fbdcc0', '#f6cfa6', '#e8b88a', '#c98f62', '#a06a45', '#6e4730'];
export const HAIRS = ['#2b2220', '#4a2f1e', '#6b3d1e', '#8a4b24', '#c4521f', '#e3c06a', '#f2dc9c', '#b9b9c2', '#ececf2'];
const EYES = ['#3b2a20', '#7a4a22', '#4f8a4f', '#4a78b8', '#8a98a8'];
const SHIRTS = ['#e2412f', '#2f6fb0', '#6cc04a', '#e8b83a', '#b58ad6', '#f08ac0', '#5aa9a0', '#8a5a2a', '#f1ece0', '#5c5c6e'];

const hex = (c, k) => {
    const n = parseInt(c.slice(1), 16);
    const f = v => Math.max(0, Math.min(255, Math.round(v * k)));
    return `#${[(n >> 16) & 255, (n >> 8) & 255, n & 255].map(v => f(v).toString(16).padStart(2, '0')).join('')}`;
};

export const isHabitant = id => typeof id === 'string' && /^h[0-9ab]{12}$/.test(id);
export const lookOf = id => Object.fromEntries(TRAITS.map((t, i) => [t, parseInt(id[i + 1], 12) % TRAIT_COUNT[t]]));
export const idOf = look => 'h' + TRAITS.map(t => (look[t] % TRAIT_COUNT[t]).toString(12)).join('');

// un tirage : un nombre entre 0 et 1 à chaque appel (le même pour la même graine)
export function rng(seed) {
    let s = seed >>> 0 || 1;
    return () => {
        s = (Math.imul(s ^ (s >>> 15), 2246822507) + 0x9e3779b9) >>> 0;
        s = Math.imul(s ^ (s >>> 13), 3266489909) >>> 0;
        return ((s ^ (s >>> 16)) >>> 0) / 4294967296;
    };
}
// âge : 0 jeune, 1 adulte, 2 âgé (pilote la barbe, les cheveux gris et la coiffure quand on ne choisit pas)
export function randomLook(seed, o = {}) {
    const r = rng(seed);
    const pick = t => Math.floor(r() * TRAIT_COUNT[t]);
    const look = Object.fromEntries(TRAITS.map(t => [t, pick(t)]));
    // la plupart des gens n'ont ni chapeau, ni lunettes, ni détail : on les rend plus rares
    if (r() < 0.55) look.hat = 0;
    if (r() < 0.65) look.glasses = 0;
    if (r() < 0.4) look.extra = 0;
    if (r() < 0.4) look.beard = 0;
    if (o.female) {
        look.beard = 0;
        look.hair = [2, 3, 4, 5, 6, 7][Math.floor(r() * 6)];
    }
    if (o.male) look.hair = [0, 1, 1, 4, 7][Math.floor(r() * 5)];
    if (o.old) look.hairColor = r() < 0.7 ? 7 + Math.floor(r() * 2) : look.hairColor;
    Object.assign(look, o.fix || {});
    return look;
}
export const randomId = (seed, o) => idOf(randomLook(seed, o));

// ---- les morceaux ----
const hairBack = (h, c) => {
    const d = hex(c, 0.8);
    switch (h) {
        case 2: // mi-long
            return P('M16 30 C12 14 52 14 48 30 L51 54 L40 50 L24 50 L13 54Z', c);
        case 3: // chignon
            return C(32, 11.5, 6.5, c);
        case 5: // queue de cheval
            return P('M44 22 Q58 24 54 42 Q50 34 44 32Z', c) + F('M50 28 Q54 34 52 40', d, 0.5);
        case 6: // tresses
            return (
                P('M17 30 Q10 42 15 56 L20 56 Q18 44 21 32Z', c) +
                P('M47 30 Q54 42 49 56 L44 56 Q46 44 43 32Z', c) +
                R(14, 54, 7, 4, 2, '#e2412f', 1.4) +
                R(43, 54, 7, 4, 2, '#e2412f', 1.4)
            );
        case 4: // bouclé
            return [18, 24, 32, 40, 46].map((x, i) => C(x, i % 2 ? 13 : 16, 6.5, c)).join('') + C(15, 26, 5.5, c) + C(49, 26, 5.5, c);
        default:
            return '';
    }
};
const hairFront = (h, c) => {
    switch (h) {
        case 1: // court
            return P('M18 30 C16 13 48 13 46 30 C44 22 38 19 32 19 C26 19 20 22 18 30Z', c);
        case 2:
        case 5:
        case 6:
            return P('M18 30 C16 13 48 13 46 30 C42 23 36 21 32 21 C26 21 21 24 18 30Z', c);
        case 3:
            return P('M18 30 C16 14 48 14 46 30 C44 22 38 19 32 19 C26 19 20 22 18 30Z', c);
        case 4:
            return '';
        case 7: // mèche sur le côté
            return (
                P('M18 31 C15 13 49 12 46 28 C43 25 40 21 33 20 C28 24 23 25 18 31Z', c) + P('M33 20 C40 20 44 24 46 28 C44 24 40 23 33 20Z', hex(c, 0.8), 1)
            );
        default:
            return h === 0 ? F('M20 24 Q32 16 44 24 Q32 20 20 24Z', hex(c, 0.9), 0.35) : '';
    }
};
const beardArt = (b, c) => {
    const d = hex(c, 0.85);
    switch (b) {
        case 1: // barbe de trois jours
            return F('M19 32 C20 42 26 46 32 46 C38 46 44 42 45 32 C42 40 36 42 32 42 C28 42 22 40 19 32Z', hex(c, 1), 0.45);
        case 2: // courte
            return P('M18 33 C19 44 25 48 32 48 C39 48 45 44 46 33 C43 40 38 41 32 41 C26 41 21 40 18 33Z', d);
        case 3: // grande barbe
            return P('M17 32 C16 48 24 56 32 56 C40 56 48 48 47 32 C44 41 38 43 32 43 C26 43 20 41 17 32Z', d);
        case 4: // moustache
            return P('M23 37 C26 33 30 34 32 36.5 C34 34 38 33 41 37 C38 40 35 38 32 38 C29 38 26 40 23 37Z', d, 1.8);
        case 5: // bouc
            return P('M26 40 C28 38 36 38 38 40 C38 46 35 50 32 50 C29 50 26 46 26 40Z', d);
        default:
            return '';
    }
};
const noseArt = n => {
    const sk = '#c98a62';
    return [
        L('M32 31.2 Q33.6 33.6 31.6 34.2', 1.3, sk), // petit
        C(32, 33, 2.4, '#e9b48a', 1.4), // rond
        L('M32 28 Q35 34 31 35.6', 1.5, sk), // long
        L('M32 28.5 Q36 32 34 35 Q32 34.6 30.6 35', 1.5, sk), // crochu
    ][n];
};
const eyesArt = (shape, iris) => {
    const w = '#fff';
    switch (shape) {
        case 1: // grands yeux ronds
            return (
                C(27, 30, 2.7, w, 1.2) +
                C(37, 30, 2.7, w, 1.2) +
                FC(27, 30.3, 1.5, iris) +
                FC(37, 30.3, 1.5, iris) +
                FC(26.4, 29.4, 0.6, w) +
                FC(36.4, 29.4, 0.6, w)
            );
        case 2: // yeux fermés, souriants
            return L('M24.5 30.5 Q27 27.5 29.5 30.5', 1.8) + L('M34.5 30.5 Q37 27.5 39.5 30.5', 1.8);
        case 3: // yeux en amande, sourcils marqués
            return (
                E(27, 30, 2.6, 1.7, w, 0, 1.1) +
                E(37, 30, 2.6, 1.7, w, 0, 1.1) +
                FC(27, 30, 1.3, iris) +
                FC(37, 30, 1.3, iris) +
                FC(27, 30, 0.6, O) +
                FC(37, 30, 0.6, O)
            );
        default: // yeux ordinaires, brillants
            return (
                E(27, 30, 1.9, 2.4, iris === EYES[0] ? O : iris, 0, 0) +
                E(37, 30, 1.9, 2.4, iris === EYES[0] ? O : iris, 0, 0) +
                FC(27.7, 29.1, 0.75, w) +
                FC(37.7, 29.1, 0.75, w)
            );
    }
};
const glassesArt = g =>
    g === 1
        ? C(27, 30, 4.4, 'none', 1.7) + C(37, 30, 4.4, 'none', 1.7) + L('M31.4 30 L32.6 30', 1.7)
        : g === 2
          ? R(22.4, 26.6, 9, 7, 2, 'none', 1.7) + R(32.6, 26.6, 9, 7, 2, 'none', 1.7) + L('M31.4 29.5 L32.6 29.5', 1.7)
          : '';
const hatArt = h => {
    switch (h) {
        case 1: // casquette
            return P('M17 25 C17 10 47 10 47 25Z', '#2f6fb0') + P('M17 25 Q10 26 12 29 Q26 26 47 25Z', '#1f4f84', 1.8) + HL(27, 15, 5, 1.6, -15, 0.4);
        case 2: // chapeau de paille
            return P('M6 25 C6 20 58 20 58 25 C58 30 6 30 6 25Z', '#e8c76a') + P('M17 24 C16 8 48 8 47 24Z', '#f1d98a') + R(17, 18, 30, 4, 1, '#c0392b', 1.4);
        case 3: // béret
            return P('M14 22 C12 10 44 6 52 16 C54 22 40 24 14 22Z', '#c0392b') + L('M33 8 L35 4', 2.2);
        case 4: // bonnet
            return P('M17 25 C16 8 48 8 47 25Z', '#5aa9a0') + R(15, 22, 34, 6, 3, '#3f8480', 1.8) + C(32, 6, 3.4, '#f1ece0', 1.6);
        case 5: // toque
            return R(19, 18, 26, 6, 2, '#fff', 1.8) + P('M19 18 C12 16 13 5 21 7 C22 1 32 0 33 6 C37 1 46 3 44 9 C51 9 51 17 45 18Z', '#fff');
        default:
            return '';
    }
};
const shirtArt = (shirt, collar) => {
    const s = SHIRTS[shirt];
    const base =
        P('M8 66 C8 51 19 45 32 45 C45 45 56 51 56 66Z', s) +
        F('M10 62 C12 54 18 50 24 49 C18 53 14 58 13 66 L9 66Z', 'rgba(0,0,0,.12)') +
        HL(20, 52, 4, 1.6, -30, 0.35);
    const extra = [
        '',
        P('M22 46 L32 57 L42 46 L39 45 L32 51 L25 45Z', '#f1ece0', 1.8), // col en V
        P('M16 66 L16 52 L24 46 L40 46 L48 52 L48 66Z', '#4a6fa5', 2) +
            L('M24 46 L24 66 M40 46 L40 66', 1.6, '#2f4f80') +
            R(27, 56, 10, 7, 1.5, '#3b5f95', 1.4), // salopette
        P('M20 47 L32 53 L44 47 L42 52 L32 59 L22 52Z', '#e8b83a', 2), // foulard
    ][collar];
    return base + extra + R(28, 38, 8, 9, 3, 'SKIN', 2);
};
const extraArt = x =>
    [
        '',
        [24, 27, 26, 38, 41, 39].map((p, i) => FC(p, i % 3 === 1 ? 35.5 : 34, 0.7, '#c46a3a')).join(''), // taches de rousseur
        FC(18, 35, 1.5, '#f5d36b') + FC(46, 35, 1.5, '#f5d36b'), // boucles d'oreilles
        L('M22 23 Q25 21 28 23 M36 23 Q39 21 42 23', 1.8, '#4a2f1e'), // gros sourcils
        P('M30 14 Q32 6 34 14 Q32 11 30 14Z', '#e2412f', 1.2), // petit nœud sur la tête
    ][x];

export function habitantArt(id) {
    const k = lookOf(id);
    const skin = SKINS[k.skin],
        hair = HAIRS[k.hairColor];
    const sk = s => s.replace(/SKIN/g, skin);
    const face =
        E(18, 31, 2.8, 3.8, skin, 0, 2) +
        E(46, 31, 2.8, 3.8, skin, 0, 2) +
        L('M17.6 29.5 Q16.6 31 17.8 32.6 M46.4 29.5 Q47.4 31 46.2 32.6', 1.1, hex(skin, 0.8)) +
        C(32, 30, 14, skin) +
        F('M40 38 Q45 33 45.6 27 Q47 36 39 42 Q36 43.5 33 43.8 Q37 42 40 38Z', hex(skin, 0.92), 0.7) +
        eyesArt(k.eyes, EYES[k.eyeColor]) +
        noseArt(k.nose) +
        (k.beard === 2 || k.beard === 3 ? '' : P('M28.2 36.2 Q32 40.6 35.8 36.2 Q32 37.4 28.2 36.2Z', '#b5523f', 1.6)) +
        FC(23.5, 34.2, 2.7, '#f49a8f', 0.45) +
        FC(40.5, 34.2, 2.7, '#f49a8f', 0.45);
    const smileUnderBeard = k.beard === 2 || k.beard === 3 ? L('M29 39.4 Q32 41.4 35 39.4', 1.5, '#7a3a2a') : '';
    return (
        sk(hairBack(k.hair, hair) ? hairBack(k.hair, hair) : '') +
        sk(shirtArt(k.shirt, k.collar)) +
        sk(face) +
        sk(beardArt(k.beard, hair)) +
        smileUnderBeard +
        extraArt(k.extra) +
        sk(hairFront(k.hair, hair)) +
        glassesArt(k.glasses) +
        hatArt(k.hat)
    );
}
