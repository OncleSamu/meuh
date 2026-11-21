// 1.98 : la fabrique d'habitants. Un visage se décrit par une chaîne de 12 chiffres (base 36, rétrocompatible base 12) collée derrière « h » :
// l'identifiant EST le dessin, donc rien à enregistrer et un nouvel habitant est un simple tirage.
// Traits (dans l'ordre) : peau, coiffure, couleur de cheveux, barbe, nez, yeux, couleur des yeux, lunettes, chapeau, chemise, col, détail.
import { C, E, F, FC, FE, HL, L, O, P, R } from './kit.js';

export const TRAITS = ['skin', 'hair', 'hairColor', 'beard', 'nose', 'eyes', 'eyeColor', 'glasses', 'hat', 'shirt', 'collar', 'extra'];
export const TRAIT_COUNT = {
    skin: 10,
    hair: 20,
    hairColor: 16,
    beard: 11,
    nose: 7,
    eyes: 10,
    eyeColor: 10,
    glasses: 8,
    hat: 18,
    shirt: 16,
    collar: 12,
    extra: 13,
};
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
export const TRAIT_LABELS = {
    hair: [
        'Chauve / ras',
        'Court',
        'Mi-long',
        'Chignon',
        'Bouclé',
        'Queue de cheval',
        'Tresses',
        'Mèche de côté',
        'Carré droit',
        'Long ondulé',
        'Double chignons',
        'Houppe rétro',
        'Ébouriffé',
        'Afro',
        'Frange & long',
        'Raie au milieu',
        'Couronne tressée',
        'Crête souple',
        'Tresse d’épaule',
        'Couronne dégarnie',
    ],
    beard: [
        'Aucune',
        '3 jours',
        'Courte',
        'Grande barbe',
        'Moustache',
        'Bouc',
        'Moustache guidon',
        'Favoris',
        'Collier de marin',
        'Barbe tressée',
        'Mousquetaire',
    ],
    nose: ['Petit', 'Rond', 'Long', 'Crochu', 'Bouton', 'Trompette', 'Large'],
    eyes: ['Brillant', 'Grands yeux', 'Souriant', 'En amande', 'Clin d’œil', 'Cils longs', 'Rêveur', 'Étoilé', 'Malicieux', 'Surpris'],
    glasses: ['Aucune', 'Rondes', 'Rectangulaires', 'Soleil', 'Demi-lunes', 'Monocle', 'Œil de chat', 'Aviateur'],
    hat: [
        'Aucun',
        'Casquette',
        'Chapeau de paille',
        'Béret',
        'Bonnet',
        'Toque',
        'Cowboy',
        'Couronne de fleurs',
        'Bob',
        'Capeline',
        'Gavroche',
        'Bandana',
        'Chapka',
        'Apiculteur',
        'Couronne dorée',
        'Canotier',
        'Chapeau pointu',
        'Serre-tête fleuri',
    ],
    collar: [
        'Simple',
        'Col en V',
        'Salopette',
        'Foulard',
        'Tablier de ferme',
        'Écharpe d’hiver',
        'Gilet boutonné',
        'Marinière',
        'Nœud papillon',
        'Col roulé',
        'Veste de chef',
        'Collier de perles',
    ],
    extra: [
        'Aucun',
        'Taches de rousseur',
        'Puces dorées',
        'Gros sourcils',
        'Petit nœud',
        'Brin de paille',
        'Grain de beauté',
        'Pansement',
        'Fleur à l’oreille',
        'Créoles dorées',
        'Joues rosées',
        'Barrette étoile',
        'Médaillon cœur',
    ],
};
export const SKINS = ['#fbdcc0', '#f6cfa6', '#e8b88a', '#c98f62', '#a06a45', '#6e4730', '#ffe8d6', '#efc194', '#b47c52', '#523222'];
export const HAIRS = [
    '#2b2220',
    '#4a2f1e',
    '#6b3d1e',
    '#8a4b24',
    '#c4521f',
    '#e3c06a',
    '#f2dc9c',
    '#b9b9c2',
    '#ececf2',
    '#942e24',
    '#7a767a',
    '#d9874c',
    '#9a7bc4',
    '#2d4d7c',
    '#df7ea6',
    '#4d8c6a',
];
export const EYES = ['#3b2a20', '#7a4a22', '#4f8a4f', '#4a78b8', '#8a98a8', '#c88420', '#2e9e9b', '#7c52a8', '#247a4b', '#6faee0'];
export const SHIRTS = [
    '#e2412f',
    '#2f6fb0',
    '#6cc04a',
    '#e8b83a',
    '#b58ad6',
    '#f08ac0',
    '#5aa9a0',
    '#8a5a2a',
    '#f1ece0',
    '#5c5c6e',
    '#8a2434',
    '#2e6b46',
    '#e87a2a',
    '#233b63',
    '#f06a5b',
    '#d4be96',
];

const hex = (c, k) => {
    const n = parseInt(c.slice(1), 16);
    const f = v => Math.max(0, Math.min(255, Math.round(v * k)));
    return `#${[(n >> 16) & 255, (n >> 8) & 255, n & 255].map(v => f(v).toString(16).padStart(2, '0')).join('')}`;
};

// Base 36 : 0-9, a-b restent identiques à l'ancienne base 12 (100 % rétrocompatible avec les anciennes sauvegardes)
export const isHabitant = id => typeof id === 'string' && /^h[0-9a-z]{12}$/.test(id);
export const lookOf = id => Object.fromEntries(TRAITS.map((t, i) => [t, parseInt(id[i + 1], 36) % TRAIT_COUNT[t]]));
export const idOf = look => 'h' + TRAITS.map(t => ((((look[t] || 0) % TRAIT_COUNT[t]) + TRAIT_COUNT[t]) % TRAIT_COUNT[t]).toString(36)).join('');

// un tirage : un nombre entre 0 et 1 à chaque appel (le même pour la même graine)
export function rng(seed) {
    let s = seed >>> 0 || 1;
    return () => {
        s = (Math.imul(s ^ (s >>> 15), 2246822507) + 0x9e3779b9) >>> 0;
        s = Math.imul(s ^ (s >>> 13), 3266489909) >>> 0;
        return ((s ^ (s >>> 16)) >>> 0) / 4294967296;
    };
}
// chapeaux courants pour les tirages aléatoires (couronne et chapeau pointu restent rares)
const COMMON_HATS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 15, 17];
const FEMALE_HAIRS = [2, 3, 4, 5, 6, 7, 8, 9, 10, 14, 15, 16, 18];
const MALE_HAIRS = [0, 1, 1, 4, 7, 11, 12, 13, 15, 17, 19];
// 1.151 : tenues de saison pour les campeurs (optionnel, sans effet si o.season est absent)
const SEASON_STYLE = {
    printemps: {
        hatRate: 0.48,
        hatsF: [7, 7, 17, 2, 3, 8],
        hatsM: [2, 3, 8, 15, 1],
        collars: [0, 1, 2, 3, 4],
        shirts: [2, 3, 4, 5, 6, 8, 14, 15],
        extras: [8, 8, 5, 1, 11],
        extraRate: 0.42,
    },
    ete: {
        hatRate: 0.64,
        hatsF: [2, 2, 9, 9, 15, 8, 11],
        hatsM: [2, 2, 8, 15, 1, 11, 6],
        glasses: [3, 3, 7],
        glassesRate: 0.42,
        collars: [0, 7, 7, 3, 1],
        shirts: [0, 1, 2, 3, 6, 8, 12, 14],
        extras: [5, 5, 1, 8, 9],
        extraRate: 0.35,
    },
    automne: {
        hatRate: 0.52,
        hatsF: [3, 3, 10, 4, 6],
        hatsM: [3, 10, 10, 4, 6],
        collars: [6, 6, 2, 9, 4, 1],
        shirts: [7, 10, 11, 12, 13, 15, 3],
        extras: [1, 3, 5, 6],
        extraRate: 0.25,
    },
    hiver: {
        hatRate: 0.74,
        hatsF: [12, 12, 4, 4, 3, 10],
        hatsM: [12, 12, 4, 4, 10, 3],
        collars: [5, 5, 5, 9, 9, 6],
        shirts: [10, 11, 13, 9, 8, 1, 7],
        extras: [10, 10, 3, 2],
        extraRate: 0.44,
    },
};

// âge : 0 jeune, 1 adulte, 2 âgé (pilote la barbe, les cheveux gris et la coiffure quand on ne choisit pas)
export function randomLook(seed, o = {}) {
    const r = rng(seed);
    const pick = t => Math.floor(r() * TRAIT_COUNT[t]);
    const from = arr => arr[Math.floor(r() * arr.length)];
    const look = Object.fromEntries(TRAITS.map(t => [t, pick(t)]));
    // teintes naturelles privilégiées (10 % de chance d'une couleur fantaisie)
    if (r() < 0.9) look.hairColor = Math.floor(r() * 12);
    // la plupart des gens n'ont ni chapeau, ni lunettes, ni détail : on les rend plus rares
    if (r() < 0.55) look.hat = 0;
    else if (r() < 0.92) look.hat = from(COMMON_HATS);
    if (r() < 0.65) look.glasses = 0;
    if (r() < 0.45) look.extra = 0;
    if (r() < 0.45) look.beard = 0;
    if (o.female) {
        look.beard = 0;
        look.hair = from(FEMALE_HAIRS);
    }
    if (o.male) look.hair = from(MALE_HAIRS);
    if (o.old) look.hairColor = r() < 0.75 ? from([7, 8, 10]) : look.hairColor;
    const st = o.season && SEASON_STYLE[o.season];
    if (st) {
        const hats = o.male ? st.hatsM : o.female ? st.hatsF : [...st.hatsF, ...st.hatsM];
        look.hat = r() < st.hatRate ? from(hats) : 0;
        if (st.glasses && r() < st.glassesRate) look.glasses = from(st.glasses);
        if (r() < 0.72) look.collar = from(st.collars);
        if (r() < 0.7) look.shirt = from(st.shirts);
        if (st.extras && r() < st.extraRate) look.extra = from(st.extras);
    }
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
        case 4: // bouclé
            return [18, 24, 32, 40, 46].map((x, i) => C(x, i % 2 ? 13 : 16, 6.5, c)).join('') + C(15, 26, 5.5, c) + C(49, 26, 5.5, c);
        case 5: // queue de cheval
            return P('M44 22 Q58 24 54 42 Q50 34 44 32Z', c) + F('M50 28 Q54 34 52 40', d, 0.5);
        case 6: // tresses
            return (
                P('M17 30 Q10 42 15 56 L20 56 Q18 44 21 32Z', c) +
                P('M47 30 Q54 42 49 56 L44 56 Q46 44 43 32Z', c) +
                R(14, 54, 7, 4, 2, '#e2412f', 1.4) +
                R(43, 54, 7, 4, 2, '#e2412f', 1.4)
            );
        case 8: // carré droit
            return P('M15 28 C14 14 50 14 49 28 L50 43 Q46 45 42 43 L22 43 Q18 45 14 43Z', c);
        case 9: // long ondulé
            return (
                P('M15 28 C12 13 52 13 49 28 C53 38 49 48 53 58 L41 55 L23 55 L11 58 C15 48 11 38 15 28Z', c) +
                L('M15 38 Q13 45 16 52 M49 38 Q51 45 48 52', 1.4, d)
            );
        case 10: // double chignons
            return C(16, 15, 6.5, c) + C(48, 15, 6.5, c) + HL(14.5, 13, 2, 1.2, -25, 0.3) + HL(46.5, 13, 2, 1.2, -25, 0.3);
        case 13: // afro
            return (
                C(32, 24, 18.5, c) +
                [15, 22, 32, 42, 49].map((x, i) => C(x, i % 2 ? 12 : 17, 7, c)).join('') +
                C(14, 29, 6, c) +
                C(50, 29, 6, c)
            );
        case 14: // frange & long
            return P('M16 28 C13 13 51 13 48 28 L51 56 L39 52 L25 52 L13 56Z', c);
        case 15: // raie au milieu
            return P('M16 28 C14 14 50 14 48 28 L49 41 L15 41Z', c);
        case 16: // couronne tressée
            return P('M16 30 C13 14 51 14 48 30 L49 46 L15 46Z', c);
        case 18: // tresse sur l'épaule
            return (
                P('M16 28 C13 13 51 13 48 28 L49 42 L15 42Z', c) +
                C(47, 36, 4.4, c, 1.8) +
                C(46, 43, 4.2, c, 1.8) +
                C(44, 50, 3.8, c, 1.8) +
                P('M41 54 L47 54 L45 60 L43 60Z', c, 1.6) +
                R(41, 52.5, 6.5, 3, 1.4, '#e8b83a', 1.3)
            );
        default:
            return '';
    }
};
const hairFront = (h, c) => {
    const d = hex(c, 0.8);
    switch (h) {
        case 1: // court
            return P('M18 30 C16 13 48 13 46 30 C44 22 38 19 32 19 C26 19 20 22 18 30Z', c);
        case 2:
        case 5:
        case 6:
        case 9:
        case 18:
            return P('M18 30 C16 13 48 13 46 30 C42 23 36 21 32 21 C26 21 21 24 18 30Z', c);
        case 3:
        case 10:
            return P('M18 30 C16 14 48 14 46 30 C44 22 38 19 32 19 C26 19 20 22 18 30Z', c);
        case 4:
        case 13:
            return '';
        case 7: // mèche sur le côté
            return (
                P('M18 31 C15 13 49 12 46 28 C43 25 40 21 33 20 C28 24 23 25 18 31Z', c) +
                P('M33 20 C40 20 44 24 46 28 C44 24 40 23 33 20Z', d, 1)
            );
        case 8: // carré droit avec frange douce
            return P('M17 29 C16 13 48 13 47 29 L44 25 L20 25Z', c) + L('M26 22 L25 25 M37 22 L38 25', 1.3, d);
        case 11: // houppe rétro (pompadour)
            return P('M18 29 C16 15 24 7 35 8 C46 9 50 18 46 29 C43 21 37 19 30 19 C24 19 20 22 18 29Z', c) + HL(33, 13, 5.5, 1.8, -10, 0.35);
        case 12: // ébouriffé / épis
            return P('M18 29 L16 20 L22 22 L21 12 L29 18 L34 10 L38 18 L45 13 L44 22 L48 20 L46 29 C42 22 37 20 32 20 C26 20 21 22 18 29Z', c);
        case 14: // frange droite
            return P('M17 28 C16 13 48 13 47 28 L45 24 L19 24Z', c) + L('M24 20 L24 24 M32 20 L32 24 M40 20 L40 24', 1.2, d);
        case 15: // raie au milieu
            return (
                P('M17 31 C16 14 32 13 32 20 C27 22 21 25 17 31Z', c) +
                P('M47 31 C48 14 32 13 32 20 C37 22 43 25 47 31Z', c)
            );
        case 16: // couronne tressée
            return (
                P('M18 30 C16 14 48 14 46 30 C42 23 36 21 32 21 C26 21 21 24 18 30Z', c) +
                [21, 26.5, 32, 37.5, 43].map(x => E(x, 16.5, 3.6, 2.5, c, x < 32 ? -18 : x > 32 ? 18 : 0, 1.6)).join('')
            );
        case 17: // crête souple
            return (
                P('M24 22 C23 11 28 7 32 8 C36 7 41 11 40 22 C37 19 27 19 24 22Z', c) +
                F('M18 28 Q19 21 24 21 L23 26Z M46 28 Q45 21 40 21 L41 26Z', d, 0.45)
            );
        case 19: // couronne dégarnie (tempes)
            return (
                P('M15 30 C14 23 18 21 21 24 C20 27 19 29 17 31Z', c, 1.8) +
                P('M49 30 C50 23 46 21 43 24 C44 27 45 29 47 31Z', c, 1.8) +
                HL(28, 20, 4, 1.6, -20, 0.35)
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
        case 6: // moustache guidon
            return (
                P('M20 35.5 Q22 39 27 38 Q30 37.5 32 36.5 Q34 37.5 37 38 Q42 39 44 35.5 Q42 36.5 38 35.5 Q34 34 32 35.8 Q30 34 26 35.5 Q22 36.5 20 35.5Z', d, 1.6)
            );
        case 7: // favoris
            return P('M17 28 L22 30 L22 39 Q18 39 17 35Z', d, 1.8) + P('M47 28 L42 30 L42 39 Q46 39 47 35Z', d, 1.8);
        case 8: // collier de marin
            return P('M18 31 C18 45 25 50 32 50 C39 50 46 45 46 31 C44 39 40 44 32 44 C24 44 20 39 18 31Z', d);
        case 9: // barbe tressée
            return (
                P('M18 33 C18 45 25 50 32 50 C39 50 46 45 46 33 C43 40 38 42 32 42 C26 42 21 40 18 33Z', d) +
                P('M27 49 L37 49 L35 59 L32 61 L29 59Z', d, 1.8) +
                R(28.5, 55, 7, 2.8, 1.2, '#f5d36b', 1.3)
            );
        case 10: // mousquetaire (moustache + bouc pointu)
            return (
                P('M23 36.8 C26 33.5 30 34 32 36.2 C34 34 38 33.5 41 36.8 C38 39.2 35 37.6 32 37.6 C29 37.6 26 39.2 23 36.8Z', d, 1.6) +
                P('M28 41 L36 41 L32 50Z', d, 1.8)
            );
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
        FE(32, 33.3, 1.6, 1.1, '#d89b72', 0.85), // bouton
        L('M31.5 30 Q33.8 33 30.5 33.8', 1.5, sk) + FC(32.5, 32.8, 0.8, '#fff', 0.45), // trompette
        E(32, 33.4, 3.2, 1.9, '#e0a57c', 0, 1.3), // large
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
        case 4: // clin d'œil
            return (
                E(27, 30, 1.9, 2.4, iris === EYES[0] ? O : iris, 0, 0) +
                FC(27.7, 29.1, 0.75, w) +
                L('M34.5 30.4 Q37 28 39.5 30.4', 1.8)
            );
        case 5: // cils longs
            return (
                C(27, 30, 2.6, w, 1.2) +
                C(37, 30, 2.6, w, 1.2) +
                FC(27, 30.2, 1.5, iris) +
                FC(37, 30.2, 1.5, iris) +
                FC(26.4, 29.4, 0.65, w) +
                FC(36.4, 29.4, 0.65, w) +
                L('M24.5 28.4 L23 27 M25.6 27.5 L24.8 26 M39.5 28.4 L41 27 M38.4 27.5 L39.2 26', 1.3)
            );
        case 6: // rêveur / mi-clos
            return (
                E(27, 30.5, 2.4, 1.5, w, 0, 1.1) +
                E(37, 30.5, 2.4, 1.5, w, 0, 1.1) +
                FC(27, 30.6, 1.2, iris) +
                FC(37, 30.6, 1.2, iris) +
                L('M24.2 29.2 L29.8 29.2 M34.2 29.2 L39.8 29.2', 1.6)
            );
        case 7: // étoilé
            return (
                C(27, 30, 2.7, iris === EYES[0] ? O : iris, 1.1) +
                C(37, 30, 2.7, iris === EYES[0] ? O : iris, 1.1) +
                F('M27 28.2 L27.5 29.5 L28.8 30 L27.5 30.5 L27 31.8 L26.5 30.5 L25.2 30 L26.5 29.5Z', '#fff') +
                F('M37 28.2 L37.5 29.5 L38.8 30 L37.5 30.5 L37 31.8 L36.5 30.5 L35.2 30 L36.5 29.5Z', '#fff')
            );
        case 8: // malicieux
            return (
                E(27, 30.2, 2.2, 2, iris === EYES[0] ? O : iris, 0, 0) +
                E(37, 30.2, 2.2, 2, iris === EYES[0] ? O : iris, 0, 0) +
                FC(27.7, 29.4, 0.7, w) +
                FC(37.7, 29.4, 0.7, w) +
                L('M24 26.5 L29.5 27.6 M40 26.5 L34.5 27.6', 1.6)
            );
        case 9: // surpris
            return (
                C(27, 30.2, 3, w, 1.2) +
                C(37, 30.2, 3, w, 1.2) +
                FC(27, 30.2, 1.2, iris === EYES[0] ? O : iris) +
                FC(37, 30.2, 1.2, iris === EYES[0] ? O : iris) +
                L('M24.2 25.4 Q27 23.6 29.8 25.4 M34.2 25.4 Q37 23.6 39.8 25.4', 1.4)
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
const glassesArt = g => {
    switch (g) {
        case 1: // rondes
            return C(27, 30, 4.4, 'none', 1.7) + C(37, 30, 4.4, 'none', 1.7) + L('M31.4 30 L32.6 30', 1.7);
        case 2: // rectangulaires
            return R(22.4, 26.6, 9, 7, 2, 'none', 1.7) + R(32.6, 26.6, 9, 7, 2, 'none', 1.7) + L('M31.4 29.5 L32.6 29.5', 1.7);
        case 3: // soleil
            return (
                R(21.6, 26.5, 9.6, 7.2, 2.8, '#262124', 1.7) +
                R(32.8, 26.5, 9.6, 7.2, 2.8, '#262124', 1.7) +
                L('M31.2 29 L32.8 29', 1.8) +
                L('M23.5 28.4 L26 31.8 M34.7 28.4 L37.2 31.8', 1.4, 'rgba(255,255,255,.55)')
            );
        case 4: // demi-lunes
            return (
                P('M22.5 30.2 L31.2 30.2 C31.2 34.4 22.5 34.4 22.5 30.2Z', 'rgba(255,255,255,.22)', 1.5) +
                P('M32.8 30.2 L41.5 30.2 C41.5 34.4 32.8 34.4 32.8 30.2Z', 'rgba(255,255,255,.22)', 1.5) +
                L('M31.2 30.5 L32.8 30.5', 1.5)
            );
        case 5: // monocle doré
            return C(37, 30, 4.6, 'rgba(255,255,255,.18)', 1.7) + L('M41.5 31 Q43.5 38 41.5 46', 1.2, '#e8b83a');
        case 6: // œil de chat
            return (
                P('M21.2 27.2 Q26 26 31 28.6 Q30.2 34 25.5 33.4 Q22 32.5 21.2 27.2Z', 'none', 1.7) +
                P('M42.8 27.2 Q38 26 33 28.6 Q33.8 34 38.5 33.4 Q42 32.5 42.8 27.2Z', 'none', 1.7) +
                L('M31 29.2 L33 29.2', 1.6)
            );
        case 7: // aviateur
            return (
                P('M21.8 27.2 L31 27.2 Q31.2 33.8 26.8 34.2 Q22.2 34 21.8 27.2Z', 'rgba(90,140,160,.42)', 1.6) +
                P('M33 27.2 L42.2 27.2 Q41.8 34 37.2 34.2 Q32.8 33.8 33 27.2Z', 'rgba(90,140,160,.42)', 1.6) +
                L('M29.8 27.2 L34.2 27.2 M31 29 L33 29', 1.5, '#d9a432')
            );
        default:
            return '';
    }
};
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
        case 6: // cowboy
            return (
                P('M6 22 Q16 28 32 26 Q48 28 58 22 Q54 19 46 21 L18 21 Q10 19 6 22Z', '#9a5b2c', 1.8) +
                P('M18 22 C18 9 27 8 32 12 C37 8 46 9 46 22Z', '#b56e38') +
                R(18.5, 18.5, 27, 3.2, 1, '#5a3216', 1.3)
            );
        case 7: // couronne de fleurs
            return (
                L('M16 22 Q32 16 48 22', 3.4, '#4f9e3a') +
                C(20, 20.5, 3.2, '#f08ac0', 1.3) +
                FC(20, 20.5, 1.1, '#ffd23f') +
                C(28, 18.2, 3.5, '#fff', 1.3) +
                FC(28, 18.2, 1.3, '#ffd23f') +
                C(36, 18.2, 3.4, '#e2412f', 1.3) +
                FC(36, 18.2, 1.2, '#ffd23f') +
                C(44, 20.5, 3.2, '#ffd23f', 1.3) +
                FC(44, 20.5, 1.1, '#e87a2a')
            );
        case 8: // bob
            return (
                P('M12 25 C12 20 52 20 52 25 C50 28 14 28 12 25Z', '#7a9a58', 1.8) +
                P('M18 22 L20 11 Q32 9 44 11 L46 22Z', '#92b56c') +
                L('M18 21.5 L46 21.5', 1.6, '#4f6b36')
            );
        case 9: // capeline
            return (
                P('M4 26 C4 18 60 18 60 26 C56 30 8 30 4 26Z', '#f2d99d', 1.8) +
                P('M18 23 C18 10 46 10 46 23Z', '#f8e6b8') +
                R(18, 18.5, 28, 3.8, 1.2, '#df7ea6', 1.4)
            );
        case 10: // casquette gavroche
            return (
                P('M14 23 C14 11 49 10 50 22 C44 25 20 25 14 23Z', '#8a5a36') +
                P('M17 23 Q32 28 47 23 Q32 25 17 23Z', '#5e3b22', 1.6) +
                C(32, 12.5, 2, '#5e3b22', 1.3)
            );
        case 11: // bandana
            return (
                P('M16 24 C18 13 46 13 48 24 Q32 20 16 24Z', '#d63b30') +
                P('M46 20 L55 17 L53 23 L47 23Z', '#b52b22', 1.6) +
                FC(25, 19, 1.1, '#fff', 0.8) +
                FC(32, 17.5, 1.1, '#fff', 0.8) +
                FC(39, 19, 1.1, '#fff', 0.8)
            );
        case 12: // chapka du Grand Nord
            return (
                P('M16 24 C16 9 48 9 48 24Z', '#6b4228') +
                R(14, 18, 36, 8, 4, '#ede4d4', 1.8) +
                R(13, 24, 6.5, 14, 3, '#6b4228', 1.6) +
                R(44.5, 24, 6.5, 14, 3, '#6b4228', 1.6)
            );
        case 13: // chapeau d'apiculteur
            return (
                P('M10 24 C10 19 54 19 54 24 C52 27 12 27 10 24Z', '#f4ebd4', 1.8) +
                P('M18 22 C18 11 46 11 46 22Z', '#faf5e8') +
                F('M14 25 L50 25 L48 44 Q32 48 16 44Z', '#fff', 0.25) +
                L('M14 25 L16 44 M50 25 L48 44 M16 44 Q32 48 48 44', 1.1, 'rgba(58,38,24,.35)')
            );
        case 14: // couronne dorée
            return (
                P('M18 22 L19 10 L26 16 L32 8 L38 16 L45 10 L46 22Z', '#ffd23f', 1.8) +
                FC(24, 18.5, 1.4, '#e2412f') +
                FC(32, 17.8, 1.6, '#2f6fb0') +
                FC(40, 18.5, 1.4, '#4f9e3a')
            );
        case 15: // canotier
            return (
                P('M9 23 C9 19 55 19 55 23 C55 26 9 26 9 23Z', '#f0d68a', 1.8) +
                R(18, 13, 28, 10, 2, '#f5e2a4', 1.8) +
                R(18, 18.5, 28, 3.8, 0.8, '#233b63', 1.3)
            );
        case 16: // chapeau pointu de fête
            return (
                P('M7 24 C7 19 57 19 57 24 C55 28 9 28 7 24Z', '#593b7a', 1.8) +
                P('M18 22 L31 3 L46 22Z', '#6e4a96') +
                R(20, 18, 24, 3.5, 1, '#3b2554', 1.2) +
                R(29.5, 17.5, 5, 4.5, 1, '#ffd23f', 1.2)
            );
        case 17: // serre-tête fleuri
            return (
                L('M17 26 C18 11 46 11 47 26', 2.6, '#e2412f') +
                C(23, 15.5, 3, '#fff', 1.3) +
                FC(23, 15.5, 1.2, '#ffd23f') +
                C(41, 15.5, 3, '#fff', 1.3) +
                FC(41, 15.5, 1.2, '#ffd23f')
            );
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
        // 4: tablier de ferme
        P('M18 66 L20 51 L44 51 L46 66Z', '#fbf6ea', 1.8) +
            L('M22 46 L22 52 M42 46 L42 52', 2.4, '#fbf6ea') +
            L('M22 46 L22 52 M42 46 L42 52', 1.2, O) +
            R(27, 57, 10, 6, 1.5, '#efe4cc', 1.3),
        // 5: écharpe d'hiver
        R(19, 44, 26, 8, 4, '#c0392b', 1.8) +
            P('M36 51 L44 51 L46 64 L38 64Z', '#c0392b', 1.8) +
            L('M25 45 L25 51 M33 45 L33 51 M39 56 L45 56 M39 60 L45 60', 1.6, '#f5d36b'),
        // 6: gilet boutonné
        P('M14 66 L17 48 L27 46 L29 66Z', '#704a2b', 1.8) +
            P('M50 66 L47 48 L37 46 L35 66Z', '#704a2b', 1.8) +
            FC(32, 53, 1.4, '#f5d36b') +
            FC(32, 59, 1.4, '#f5d36b'),
        // 7: marinière
        L('M12 52 L52 52 M10 57 L54 57 M9 62 L55 62', 2.2, '#233b63'),
        // 8: nœud papillon
        P('M24 46 L32 52 L40 46 L37 45 L32 49 L27 45Z', '#fff', 1.6) +
            P('M26 49 L32 52 L26 55Z M38 49 L32 52 L38 55Z', '#c0392b', 1.5) +
            C(32, 52, 2, '#e2412f', 1.4),
        // 9: col roulé
        R(25, 42.5, 14, 6.5, 3, hex(s, 0.85), 1.8) + L('M27 45.8 L37 45.8', 1.2, hex(s, 0.65)),
        // 10: veste de chef
        P('M12 66 C12 51 20 46 32 46 C44 46 52 51 52 66Z', '#fff', 1.8) +
            L('M35 47 L35 66', 1.5, '#d8d2c5') +
            FC(28, 53, 1.3, O) +
            FC(36, 53, 1.3, O) +
            FC(28, 59, 1.3, O) +
            FC(36, 59, 1.3, O),
        // 11: collier de perles
        [23, 26.5, 30, 34, 37.5, 41].map((x, i) => C(x, 48 + Math.sin(((i + 0.5) / 6) * Math.PI) * 4.5, 2, '#fff8ee', 1.2)).join(''),
    ][collar];
    return base + extra + R(28, 38, 8, 9, 3, 'SKIN', 2);
};
const extraArt = x =>
    [
        '',
        [24, 27, 26, 38, 41, 39].map((p, i) => FC(p, i % 3 === 1 ? 35.5 : 34, 0.7, '#c46a3a')).join(''), // taches de rousseur
        FC(18, 35, 1.5, '#f5d36b') + FC(46, 35, 1.5, '#f5d36b'), // puces dorées
        L('M22 23 Q25 21 28 23 M36 23 Q39 21 42 23', 1.8, '#4a2f1e'), // gros sourcils
        P('M30 14 Q32 6 34 14 Q32 11 30 14Z', '#e2412f', 1.2), // petit nœud sur la tête
        // 5: brin de paille
        L('M34.5 37.5 L44.5 41.5', 1.7, '#e8b83a') + FE(45, 41.8, 2.2, 1.1, '#f5d36b', 1, 22),
        // 6: grain de beauté
        FC(37.2, 36.2, 0.9, '#4a2f1e'),
        // 7: pansement sur la joue
        R(36.2, 33.4, 6.2, 3, 1.2, '#f5d7b3', 1.2) + FC(39.3, 34.9, 0.7, '#d9a47c'),
        // 8: fleur à l'oreille
        C(46, 26, 3.2, '#f08ac0', 1.3) + FC(46, 26, 1.2, '#ffd23f'),
        // 9: créoles dorées
        C(17.5, 36.2, 2.6, 'none', 1.4) + C(46.5, 36.2, 2.6, 'none', 1.4) + L('M16 37.5 Q17.5 39.2 19 37.5 M45 37.5 Q46.5 39.2 48 37.5', 1.4, '#f5d36b'),
        // 10: joues rosées prononcées
        FE(23.5, 34.5, 3.4, 2.2, '#f06a7c', 0.48) + FE(40.5, 34.5, 3.4, 2.2, '#f06a7c', 0.48),
        // 11: barrette étoile
        P('M40 21 L41.2 23.4 L43.8 23.8 L41.9 25.5 L42.4 28 L40 26.8 L37.6 28 L38.1 25.5 L36.2 23.8 L38.8 23.4Z', '#ffd23f', 1.1),
        // 12: médaillon cœur
        L('M27 45 Q32 51 37 45', 1.1, '#e8b83a') + P('M32 52.8 C29.5 50.8 29.8 48.8 32 50.2 C34.2 48.8 34.5 50.8 32 52.8Z', '#e2412f', 1.1),
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
        (k.beard === 2 || k.beard === 3 || k.beard === 9 ? '' : P('M28.2 36.2 Q32 40.6 35.8 36.2 Q32 37.4 28.2 36.2Z', '#b5523f', 1.6)) +
        FC(23.5, 34.2, 2.7, '#f49a8f', 0.45) +
        FC(40.5, 34.2, 2.7, '#f49a8f', 0.45);
    const smileUnderBeard = k.beard === 2 || k.beard === 3 || k.beard === 9 ? L('M29 39.4 Q32 41.4 35 39.4', 1.5, '#7a3a2a') : '';
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
