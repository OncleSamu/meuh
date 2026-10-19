// 1.18 : les cinq décorations uniques des nouveaux grands défis.
import { C, E, F, FC, HL, L, P, R, SHADOW, ui } from './kit.js';

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
