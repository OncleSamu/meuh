// 1.18 : les cinq décorations uniques des nouveaux grands défis.
import { C, E, F, FC, HL, L, P, R, SHADOW, ui } from '../kit.js';

// un cerceau de tonneau : bande foncée qui suit la panse
const hoop = (y, w) => R(32 - w / 2, y, w, 3.4, 1.4, '#7a8691', 1.6);

Object.assign(ui, {
    // le fût de la brasserie : tonneau debout, robinet et chope mousseuse dessus
    brewBarrel: () =>
        SHADOW(32, 60, 24, 3) +
        P('M13 24 Q9 40 13 55 L51 55 Q55 40 51 24Z', '#b8732f', 2.4) +
        L('M23 24 Q20 40 23 55 M32 24 L32 55 M41 24 Q44 40 41 55', 1.3, '#8a5320') +
        E(32, 24, 19, 5.5, '#d99a52', 0, 2.4) +
        E(32, 24, 14, 3.4, '#c0813c', 0, 1.2) +
        hoop(31, 40) +
        hoop(47, 40) +
        R(28, 38, 8, 6, 2, '#d8d0c2', 1.6) +
        C(32, 41, 1.6, '#3a2618') +
        HL(17, 40, 2.2, 7, 8, 0.45) +
        // la chope
        R(26, 6, 11, 14, 2.6, '#ffc83a', 2) +
        P('M37 9 Q43 9 43 14 Q43 18 37 18', 'none', 2) +
        P('M25 8 Q26 2 31 4 Q36 0 38 6 Q40 9 36 9 L27 9Z', '#fffaf0', 1.8) +
        F('M28 11 L30 11 L30 18 L28 18Z', '#fff', 0.55),

    // l'enseigne du comptoir : panneau suspendu à une potence, tasse fumante, ampoules chaudes
    neonSign: () =>
        SHADOW(32, 60, 20, 3) +
        L('M12 58 L12 6 L44 6', 4.5) +
        L('M12 58 L12 6 L44 6', 2, '#7a8691') +
        L('M22 6 L22 16 M40 6 L40 16', 2.2) +
        R(14, 16, 36, 26, 5, '#3b2a4a', 2.4) +
        R(17.5, 19.5, 29, 19, 3, 'none', 1.6) +
        FE2(32, 29) +
        // la tasse et sa vapeur
        P('M24 31 L40 31 L38 38 Q32 40 26 38Z', '#ffe08a', 1.8) +
        P('M40 32 Q44 32 43 35 Q42 37 39 36.5', 'none', 1.6) +
        L('M28 28 Q26 25 28 22 M33 28 Q31 25 33 22 M38 28 Q36 25 38 22', 1.6, '#ff9a4a') +
        [16, 24, 32, 40, 48].map(x => FC(x, 44.5, 1.5, '#ffd23f')).join('') +
        HL(20, 22, 3, 1.2, -10, 0.5),

    // le poisson trophée : écusson de bois, belle truite montée, petite plaque en cuivre
    fishTrophy: () =>
        SHADOW(32, 60, 24, 3) +
        P('M8 12 L56 12 L56 52 Q32 58 8 52Z', '#a8693a', 2.4) +
        L('M12 22 Q32 26 52 22 M12 34 Q32 38 52 34 M12 46 Q32 50 52 46', 1.1, '#8a5320') +
        // le poisson
        P('M46 30 L58 22 Q60 30 58 38Z', '#4f93bf', 2) +
        P('M12 31 C16 20 34 18 46 26 C50 29 50 33 46 36 C34 44 16 42 12 31Z', '#7ab7d8', 2.2) +
        F('M16 35 C26 41 38 40 46 34 C38 41 24 43 17 37Z', '#e8f4fa', 0.9) +
        P('M26 21 Q31 14 38 22Z', '#4f93bf', 1.8) +
        L('M20 28 Q24 25 28 28 M30 26 Q34 24 38 27', 1.2, '#3b6f93') +
        FC(19, 29, 2.4, '#fff') +
        FC(19.4, 29, 1.3, '#3a2618') +
        L('M13 33 Q16 34 18 32.5', 1.4) +
        HL(30, 24, 7, 1.6, -6, 0.5) +
        R(22, 44, 20, 6, 1.6, '#e0a24a', 1.6) +
        L('M25 47 L39 47', 1, '#8a5320'),

    // le wagonnet de la mine : benne de fer, roues, minerai et gemmes, rails
    minecart: () =>
        SHADOW(32, 60, 26, 3) +
        L('M4 56 L60 56', 3.4) +
        L('M4 56 L60 56', 1.6, '#8f8574') +
        [10, 24, 38, 52].map(x => R(x - 1.5, 55, 3, 5, 1, '#8a5a2a', 1.2)).join('') +
        // le minerai et les gemmes qui dépassent
        P('M14 28 Q18 16 26 22 Q30 12 38 20 Q46 14 50 28Z', '#5e5548', 2.2) +
        P('M26 24 L31 17 L36 24 L31 29Z', '#e2412f', 1.8) +
        P('M38 24 L42 19 L47 25 L42 29Z', '#4f93bf', 1.8) +
        FC(21, 25, 1.6, '#e8a948') +
        FC(44, 27, 1.2, '#e8a948') +
        HL(30, 20, 2, 1, -30, 0.7) +
        P('M7 28 L57 28 L52 50 Q51 52 49 52 L15 52 Q13 52 12 50Z', '#b0392f', 2.4) +
        R(7, 26, 50, 5, 2, '#7a8691', 2) +
        L('M20 34 L19 48 M32 34 L32 48 M44 34 L45 48', 1.2, '#822a22') +
        C(19, 54, 5, '#5b6670', 2) +
        C(19, 54, 1.8, '#c9d2d8', 1) +
        C(45, 54, 5, '#5b6670', 2) +
        C(45, 54, 1.8, '#c9d2d8', 1) +
        HL(14, 36, 2, 5, 8, 0.4),

    // le pupitre à champagne : planche en A, bouteilles penchées col en bas, capsules dorées
    champagneRack: () => {
        const bottle = (x, g) =>
            `<g transform="translate(${x} 0)">` +
            P('M-4 22 L4 22 L4.6 40 Q4.6 44 0 44 Q-4.6 44 -4.6 40Z', g, 2) +
            R(-2, 14, 4, 9, 1, g, 1.8) +
            R(-3, 10.5, 6, 5, 1.4, '#e8b83a', 1.8) +
            FC(-1.4, 30, 1, '#fff', 0.5) +
            `</g>`;
        return (
            SHADOW(32, 60, 24, 3) +
            P('M6 56 L22 12 L42 12 L58 56Z', '#c0813c', 2.4) +
            P('M10 54 L24 16 L40 16 L54 54Z', '#a8693a', 1.6) +
            [32, 44].map(y => E(32, y, 2.4, 2.4, '#3a2618', 0, 0)).join('') +
            `<g transform="translate(0 4) rotate(0 32 30)">` +
            [24, 32, 40].map(x => bottle(x, '#2f6f3f')).join('') +
            `</g>` +
            `<g transform="translate(0 20)">` +
            [20, 28, 36, 44].map(x => bottle(x, '#3f8a4f')).join('') +
            `</g>` +
            L('M14 54 L50 54', 2.2, '#8a5320') +
            HL(18, 46, 1.8, 6, 18, 0.4)
        );
    },
});

// la lueur de l'enseigne
function FE2(x, y) {
    return E(x, y, 15, 9.5, '#5a3b6e', 0, 0) + F(`M${x - 15} ${y} Q${x} ${y - 14} ${x + 15} ${y}`, '#ffd23f', 0.15);
}

// 1.94 : les sept décorations des nouveaux grands défis (dessins provisoires, à valider)
Object.assign(ui, {
    // la rosette du concours : cocarde rouge, fer à cheval doré, deux rubans
    horseRosette: () =>
        SHADOW(32, 60, 20, 3) +
        P('M22 34 L14 58 L24 52 L30 58 L34 38Z', '#2f6fb0', 2) +
        P('M42 34 L50 58 L40 52 L34 58 L30 38Z', '#e2412f', 2) +
        C(32, 26, 20, '#e2412f', 2.4) +
        C(32, 26, 15, '#f5d36b', 2) +
        C(32, 26, 11, '#fff3d6', 1.6) +
        L('M24 30 Q22 18 32 17 Q42 18 40 30', 3.2, '#8f8574') +
        L('M24 30 L22 33 M40 30 L42 33', 3.2, '#8f8574') +
        HL(22, 14, 6, 1.6, -30, 0.5),

    // la ruche dorée : ruche de paille en spirale, petite abeille, pot de miel
    goldenHive: () =>
        SHADOW(32, 60, 24, 3) +
        R(10, 52, 44, 6, 2, '#8a5a2a', 2) +
        P('M14 52 Q10 30 22 18 Q32 8 42 18 Q54 30 50 52Z', '#e8b83a', 2.4) +
        L('M13 46 Q32 52 51 46 M14 38 Q32 44 50 38 M17 30 Q32 35 47 30 M22 22 Q32 26 42 22', 1.6, '#b8861f') +
        E(32, 44, 6, 7, '#3a2618', 2, 0) +
        P('M52 20 Q58 14 62 20 Q58 26 52 20Z', '#fff', 1.2) +
        E(54, 21, 3, 2.4, '#f5d36b', 1.2, 0) +
        HL(22, 20, 6, 1.6, -40, 0.5),

    // la lanterne du souk : lanterne orientale ajourée, anneau, petite flamme
    souqLantern: () =>
        SHADOW(32, 60, 16, 3) +
        L('M32 2 L32 12', 2.2) +
        C(32, 6, 3.4, 'none', 2) +
        P('M22 14 L42 14 L38 20 L26 20Z', '#c88a2a', 2) +
        P('M26 20 Q14 34 26 52 L38 52 Q50 34 38 20Z', '#b0392f', 2.4) +
        F('M32 24 Q42 36 36 48 Q32 52 28 48 Q22 36 32 24Z', '#ffd23f', 0.9) +
        L('M32 20 L32 52 M22 36 L42 36', 1.3, '#822a22') +
        P('M24 52 L40 52 L38 58 L26 58Z', '#c88a2a', 2) +
        HL(24, 28, 6, 1.6, 15, 0.5),

    // le traîneau du Grand Nord : traîneau de bois, patins relevés, paquet cadeau et branche de sapin
    northSled: () =>
        SHADOW(32, 60, 26, 3) +
        L('M6 50 Q4 44 10 44 L52 44 Q60 44 58 52 Q56 56 48 56 L12 56', 3.6) +
        L('M6 50 Q4 44 10 44 L52 44 Q60 44 58 52 Q56 56 48 56 L12 56', 1.8, '#d6a65a') +
        P('M12 28 L52 28 L50 44 L14 44Z', '#a8693a', 2.4) +
        L('M16 34 L48 34', 1.2, '#8a5320') +
        R(20, 14, 14, 14, 2, '#2f6fb0', 2) +
        L('M27 14 L27 28 M20 21 L34 21', 1.8, '#f5d36b') +
        P('M42 28 L46 14 L50 28Z', '#2f6f3f', 2) +
        P('M40 28 L46 8 L52 28Z', '#3f8a4f', 2) +
        HL(24, 16, 4, 1.4, -10, 0.5),

    // l'orchidée de la serre : pot de terre cuite, tige arquée, fleurs roses
    orchidPot: () => {
        const flower = (x, y, r) =>
            [0, 72, 144, 216, 288].map(a => `<g transform="translate(${x} ${y}) rotate(${a})">${E(0, -r, r * 0.7, r, '#f08ac0', 1.6, 0)}</g>`).join('') +
            FC(x, y, r * 0.45, '#ffd23f');
        return (
            SHADOW(32, 60, 18, 3) +
            P('M20 40 L44 40 L40 58 L24 58Z', '#c0713a', 2.4) +
            R(18, 36, 28, 6, 2, '#d98a4a', 2) +
            L('M32 36 Q30 22 38 12', 2.6, '#2f6f3f') +
            P('M32 34 Q16 32 12 22 Q24 22 32 34Z', '#3f8a4f', 1.8) +
            P('M32 34 Q48 32 52 24 Q40 24 32 34Z', '#3f8a4f', 1.8) +
            flower(38, 12, 5) +
            flower(28, 20, 4) +
            flower(46, 20, 4)
        );
    },

    // le banc des voisins : banc de bois, deux petits coussins, pot de fleurs
    neighborBench: () =>
        SHADOW(32, 60, 26, 3) +
        R(8, 30, 48, 7, 2, '#c0813c', 2.2) +
        R(8, 16, 48, 7, 2, '#c0813c', 2.2) +
        L('M12 23 L12 30 M52 23 L52 30', 2.2, '#8a5320') +
        L('M12 37 L10 56 M52 37 L54 56', 3, '#8a5320') +
        R(16, 26, 12, 5, 2, '#e2412f', 1.6) +
        R(34, 26, 12, 5, 2, '#2f6fb0', 1.6) +
        P('M56 56 L62 56 L61 48 L57 48Z', '#c0713a', 1.6) +
        FC(59, 44, 3, '#f08ac0') +
        HL(14, 18, 8, 1.6, 0, 0.5),

    // le four à pizza : dôme de briques, bouche enflammée, pelle
    pizzaOven: () =>
        SHADOW(32, 60, 26, 3) +
        R(8, 48, 48, 10, 2, '#8f8574', 2.2) +
        P('M10 48 Q10 14 32 12 Q54 14 54 48Z', '#c0603a', 2.4) +
        L('M14 38 L50 38 M12 28 L52 28 M20 20 L44 20 M24 38 L24 48 M40 38 L40 48 M32 28 L32 38', 1.1, '#8a3a22') +
        P('M22 48 Q22 32 32 32 Q42 32 42 48Z', '#2a1a12', 2) +
        F('M26 48 Q26 38 32 36 Q38 38 38 48Z', '#ff9a4a', 0.95) +
        F('M29 48 Q29 42 32 40 Q35 42 35 48Z', '#ffd23f', 0.95) +
        R(26, 4, 12, 6, 2, '#8f8574', 1.8) +
        L('M52 58 L60 40', 2.4, '#8a5320') +
        HL(16, 22, 8, 1.6, 20, 0.4),
});

// 1.95 : les huit fanions des saisons de la ferme (un mât, une flamme de la couleur du thème, son emblème) : dessins provisoires
const banner = (cloth, trim, emblem) => () =>
    SHADOW(32, 60, 16, 3) +
    R(30, 6, 4, 52, 1.6, '#8a5a2a', 2) +
    FC(32, 6, 3.4, '#e8b83a') +
    P('M34 10 L58 10 L52 22 L58 34 L34 34Z', cloth, 2.4) +
    L('M36 13 L54 13', 1.4, trim) +
    emblem +
    R(22, 54, 20, 6, 2, '#8f8574', 2);
Object.assign(ui, {
    // chevaux : un fer à cheval
    bannerHaras: banner('#2f6fb0', '#9ec6ea', L('M39 30 Q37 20 45 19 Q53 20 51 30', 2.6, '#f5d36b')),
    // brasserie : une feuille de houblon
    bannerBrasserie: banner('#6f9a3a', '#c8e08a', P('M45 16 Q53 22 45 32 Q37 22 45 16Z', '#e8d27a', 1.6)),
    // oasis : un palmier
    bannerOasis: banner('#d9a02f', '#f5d98a', L('M45 32 L45 20 M45 20 Q39 18 37 22 M45 20 Q51 18 53 22 M45 20 Q40 15 38 16 M45 20 Q50 15 52 16', 2, '#2f6f3f')),
    // Grand Nord : un flocon
    bannerNord: banner('#5b8fb8', '#dff0fa', L('M45 15 L45 31 M38 19 L52 27 M38 27 L52 19', 2, '#fff')),
    // miel : une goutte dorée sur fond d'ambre
    bannerMiel: banner('#c0812a', '#f5d36b', P('M45 15 Q52 24 48 29 Q45 32 42 29 Q38 24 45 15Z', '#ffd23f', 1.6)),
    // mine : un diamant
    bannerMine: banner('#5e5548', '#a8a090', P('M39 20 L45 15 L51 20 L45 32Z', '#7fd3f5', 1.8)),
    // textile : une pelote
    bannerTextile: banner('#a8395f', '#f0a8c0', C(45, 24, 8, '#f8d6e2', 1.8) + L('M39 21 Q45 27 51 21 M40 27 Q45 22 50 28', 1.2, '#a8395f')),
    // parfums : une fleur
    bannerParfums: banner(
        '#8e62b8',
        '#d6bff0',
        [0, 72, 144, 216, 288].map(a => `<g transform="translate(45 24) rotate(${a})">${E(0, -5, 3.2, 5, '#f4e6ff', 1.2, 0)}</g>`).join('') +
            FC(45, 24, 2.4, '#ffd23f'),
    ),
});
