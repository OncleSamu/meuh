// 1.171 : La cuisine, l'artisanat et les boissons des Terres d'Asie.
// Trois ateliers (wok de fonte, panier vapeur, atelier de douceurs d'Asie), 41 recettes et 6 boissons du comptoir.
import { C, E, F, FC, HL, L, P, R, SHADOW, items, machines, bottle, jar } from '../kit.js';
import { plate as basePlate, bowl as baseBowl, steamF, scoop } from '../items2.js';

const plate = (extra = '') => basePlate(46) + extra;
const bowl = (fill, extra = '') => baseBowl(fill, 30, '#3c7a62') + extra;

const wokBowl = (fill, extra = '') =>
    SHADOW(32, 57, 24, 3) +
    P('M8 32 Q10 54 32 54 Q54 54 56 32Z', '#2f323a', 2.2) +
    E(32, 32, 24, 8, fill, 0, 2) +
    L('M6 30 L10 34 M58 30 L54 34', 2.6, '#5a3a22') +
    extra +
    steamF;

const bambooTray = (extra = '') =>
    SHADOW(32, 57, 25, 3) +
    E(32, 47, 25, 9, '#b88a4a', 0, 2.2) +
    R(7, 36, 50, 12, 5, '#d6aa64', 2.2) +
    E(32, 36, 25, 8.5, '#ebd09a', 0, 2) +
    L('M9 42 Q32 48 55 42', 1.4, '#9a6e34') +
    extra +
    steamF;

const teacup = (col, extra = '') =>
    SHADOW(32, 58, 17, 3) +
    P('M16 26 L19 52 Q32 58 45 52 L48 26Z', '#f4ede0', 2.2) +
    E(32, 26, 16, 5.5, col, 0, 2) +
    L('M18 38 Q32 42 46 38 M19 45 Q32 49 45 45', 1.2, '#3c7a62') +
    extra +
    steamF;

const icedGlass = (col, extra = '') =>
    SHADOW(32, 58, 15, 3) +
    P('M19 18 L22 54 Q32 57 42 54 L45 18Z', '#e4f6fc', 2.2) +
    P('M20 24 L22.5 53 Q32 56 41.5 53 L44 24Z', col, 1.2) +
    R(24, 28, 7, 7, 1.5, 'rgba(255,255,255,.65)', 1) +
    R(33, 34, 7, 7, 1.5, 'rgba(255,255,255,.6)', 1) +
    L('M36 22 L42 10', 2.2, '#c83c34') +
    extra +
    HL(23, 36, 1.8, 10, 0, 0.55);

const mochiBall = (x, y, col, inner = '') =>
    C(x, y, 10.5, col, 1.8) +
    F(`M${x - 8} ${y + 3} Q${x} ${y + 11} ${x + 8} ${y + 3} Q${x} ${y + 8} ${x - 8} ${y + 3}Z`, 'rgba(0,0,0,.1)', 0.9) +
    inner +
    HL(x - 3.5, y - 3.5, 2.8, 1.4, -20, 0.55);

const D = {
    // ---------------- 13 recettes dans les ateliers existants ----------------
    silkKimono: () =>
        SHADOW(32, 59, 22, 3) +
        P('M12 20 L22 14 L32 22 L42 14 L52 20 L56 36 L44 36 L44 56 L20 56 L20 36 L8 36Z', '#d84c5c', 2.2) +
        L('M22 14 L36 36 M42 14 L28 36', 2.4, '#fff4e0') +
        R(20, 34, 24, 7, 1.5, '#f2c64a', 1.8) +
        FC(26, 46, 2.5, '#ffd8e4', 0.9) +
        FC(38, 48, 2.5, '#ffd8e4', 0.9),
    silkiePillow: () =>
        SHADOW(32, 57, 24, 3) +
        P('M10 24 Q32 16 54 24 Q58 38 54 50 Q32 56 10 50 Q6 38 10 24Z', '#fffbf0', 2.2) +
        P('M15 28 Q32 22 49 28 Q52 38 49 46 Q32 51 15 46 Q12 38 15 28Z', '#f2e8d4', 1) +
        C(32, 37, 4, '#e8a8b8', 1.2) +
        HL(22, 29, 5, 2, -8, 0.65),
    silkieQuilt: () =>
        SHADOW(32, 58, 24, 3) +
        R(8, 22, 48, 30, 8, '#fdf6e6', 2.2) +
        L('M8 32 L56 32 M8 42 L56 42 M20 22 L20 52 M32 22 L32 52 M44 22 L44 52', 1.3, '#d8ccb4') +
        R(8, 46, 48, 8, 4, '#c84c54', 1.8) +
        HL(18, 27, 6, 2, 0, 0.6),
    goldenSilkParasol: () =>
        SHADOW(32, 59, 18, 3) +
        L('M32 16 L32 56', 2.6, '#6e4a2a') +
        P('M8 34 Q32 10 56 34 Q44 30 32 34 Q20 30 8 34Z', '#f4c644', 2.2) +
        L('M32 18 L16 32 M32 18 L24 33 M32 18 L40 33 M32 18 L48 32', 1.2, '#b88218') +
        C(32, 16, 2.5, '#c83c34', 1.3),
    goldenObi: () =>
        SHADOW(32, 57, 23, 3) +
        R(10, 26, 44, 18, 4, '#2c5a6c', 2.2) +
        R(24, 22, 16, 26, 4, '#f2c442', 2.2) +
        P('M12 44 L18 56 L26 44Z M52 44 L46 56 L38 44Z', '#f2c442', 1.8) +
        L('M12 32 L52 32 M12 38 L52 38', 1.3, '#f6d878') +
        FC(32, 35, 3, '#c83c34', 0.9),
    silkFan: () =>
        SHADOW(32, 58, 22, 3) +
        P('M32 52 L10 24 Q32 8 54 24Z', '#fce2ea', 2.2) +
        P('M32 52 L14 28 Q32 15 50 28Z', '#f6b8cc', 1) +
        L('M32 52 L18 20 M32 52 L25 16 M32 52 L32 14 M32 52 L39 16 M32 52 L46 20', 1.2, '#9a7442') +
        C(32, 52, 3, '#8a5a2e', 1.4) +
        FC(32, 26, 3.2, '#d84c5c', 0.9),
    velvetCarving: () =>
        SHADOW(32, 58, 18, 3) +
        R(18, 48, 28, 8, 3, '#6e4a2a', 2) +
        P('M24 48 Q22 30 32 16 Q42 30 40 48Z', '#d6a878', 2.2) +
        C(32, 24, 5, '#e8c49a', 1.6) +
        L('M28 18 L24 10 M36 18 L40 10', 2, '#c89668') +
        HL(29, 32, 2.2, 6, 0, 0.5),
    velvetElixir: () => bottle('#b86a2a', 'velvetAntler', '#f4e6d2', '#7a3c1a'),
    umeshu: () => bottle('#d89a36', 'ume', '#f8f2d8', '#b84254'),
    yuzuSorbet: () =>
        SHADOW(32, 58, 18, 3) +
        P('M18 38 L24 54 L40 54 L46 38Z', '#e4eef4', 2.2) +
        scoop(26, 34, 7.5, '#f4d044', '#fff5b8') +
        scoop(38, 34, 7.5, '#f08c28', '#ffd89a') +
        scoop(32, 24, 7.5, '#f8dc62', '#fff8c8') +
        P('M32 14 Q38 10 42 15 Q36 18 32 14Z', '#4c983c', 1.2),
    nashiCider: () => bottle('#e6c858', 'nashi', '#f8f6dc', '#8a6a2a'),
    velvetAmulet: () =>
        SHADOW(32, 58, 16, 3) +
        L('M22 14 Q32 4 42 14', 2, '#f2c442') +
        C(32, 36, 15, '#c89262', 2.2) +
        C(32, 36, 11, '#f4c644', 1.6) +
        C(32, 36, 6, '#3c9a7c', 1.4) +
        HL(27, 29, 3, 1.5, -30, 0.65),
    sikaTofuCheese: () =>
        plate(
            R(18, 28, 28, 18, 4, '#fffaf0', 2) +
                R(20, 24, 24, 10, 3, '#fffdf8', 1.8) +
                C(32, 26, 4.5, '#f2c82e', 1.3) +
                P('M34 22 Q40 18 43 22 Q38 25 34 22Z', '#4c983c', 1.1),
        ),

    // ---------------- 10 recettes du Wok de fonte ----------------
    bambooStirFry: () =>
        wokBowl(
            '#8a5228',
            R(16, 26, 10, 5, 2, '#e8d492', 1.3) +
                R(30, 25, 11, 5, 2, '#4ca858', 1.3) +
                R(38, 29, 10, 5, 2, '#e8d492', 1.3) +
                C(25, 32, 3.5, '#5cc062', 1.2),
        ),
    shiitakeNoodles: () =>
        wokBowl(
            '#c89a4e',
            L('M14 30 Q24 24 34 30 T50 30 M16 34 Q26 28 36 34 T48 34', 2.2, '#f2d478') +
                E(24, 27, 6, 4, '#7a4a2a', -10, 1.4) +
                E(40, 29, 6, 4, '#7a4a2a', 15, 1.4) +
                FC(32, 31, 2, '#4ca858'),
        ),
    lotusCrisps: () =>
        plate(
            C(24, 34, 8.5, '#e8b674', 1.8) +
                C(38, 35, 8.5, '#dca45c', 1.8) +
                C(31, 27, 8, '#f0c482', 1.8) +
                FC(31, 27, 1.4, '#7a4a20') +
                FC(28, 25, 1.2, '#7a4a20') +
                FC(34, 25, 1.2, '#7a4a20') +
                FC(28, 29, 1.2, '#7a4a20') +
                FC(34, 29, 1.2, '#7a4a20'),
        ),
    ginkgoRice: () =>
        wokBowl(
            '#f8f0d8',
            E(22, 29, 4, 3, '#f2d458', -15, 1.2) +
                E(34, 27, 4, 3, '#f2d458', 20, 1.2) +
                E(42, 31, 4, 3, '#f2d458', -10, 1.2) +
                FC(28, 33, 2.2, '#f6a828') +
                FC(38, 34, 2, '#4ca858'),
        ),
    bokChoyWok: () =>
        wokBowl(
            '#4a7a38',
            P('M16 32 Q24 22 34 28 Q26 36 16 32Z', '#f6f2e2', 1.4) +
                P('M30 30 Q40 20 48 30 Q40 36 30 30Z', '#58b862', 1.4) +
                C(32, 28, 3.2, '#e8c464', 1.2),
        ),
    yuzuDuckWok: () =>
        wokBowl(
            '#8a3e24',
            E(23, 30, 7, 4, '#b84c32', -15, 1.4) +
                E(37, 29, 7, 4, '#b84c32', 12, 1.4) +
                C(44, 32, 4.5, '#f2c82e', 1.3) +
                R(26, 25, 9, 4, 1.5, '#e8d492', 1.2),
        ),
    fiveSpiceBeef: () =>
        wokBowl(
            '#6e3422',
            E(22, 30, 6.5, 4, '#8e4228', -10, 1.4) +
                E(36, 31, 6.5, 4, '#8e4228', 15, 1.4) +
                C(30, 26, 4.5, '#5a2a14', 1.3) +
                FC(42, 28, 2.5, '#4ca858'),
        ),
    shrimpLotusWok: () =>
        wokBowl(
            '#d88a5a',
            P('M18 30 Q22 22 30 26 Q26 32 22 32Z', '#f27868', 1.5) +
                P('M36 28 Q42 22 48 28 Q42 34 38 32Z', '#f27868', 1.5) +
                C(32, 31, 5.5, '#f4e6cf', 1.4) +
                FC(32, 31, 1.2, '#8a6a4a'),
        ),
    shiitakeTofuWok: () =>
        wokBowl(
            '#7a4824',
            R(18, 26, 9, 8, 2, '#f8f0d8', 1.5) +
                R(34, 27, 9, 8, 2, '#f8f0d8', 1.5) +
                E(29, 28, 6, 3.8, '#7a4a2a', 0, 1.4) +
                FC(45, 30, 2.2, '#4ca858'),
        ),
    silkieFriedRice: () =>
        wokBowl(
            '#f2d478',
            FC(20, 30, 2.2, '#5ca848') +
                FC(28, 27, 2.5, '#f4a828') +
                FC(36, 31, 2.2, '#5ca848') +
                FC(43, 29, 2.5, '#f4a828') +
                FC(31, 33, 2, '#e87868'),
        ),

    // ---------------- 9 recettes du Panier vapeur ----------------
    shiitakeBao: () =>
        bambooTray(
            C(24, 34, 9, '#fffaf0', 1.8) +
                C(40, 34, 9, '#fffaf0', 1.8) +
                C(32, 27, 9.5, '#fffdf6', 1.8) +
                L('M29 24 L35 24 M32 21 L32 27', 1.1, '#c8b89a'),
        ),
    lotusDimSum: () =>
        bambooTray(
            P('M15 36 Q22 24 31 36 Q23 40 15 36Z', '#f8f0dc', 1.7) +
                P('M33 36 Q40 24 49 36 Q41 40 33 36Z', '#f8f0dc', 1.7) +
                P('M24 30 Q32 19 40 30 Q32 34 24 30Z', '#fff6e4', 1.7) +
                FC(32, 27, 2, '#f29ab4'),
        ),
    yuzuFishSteam: () =>
        bambooTray(
            P('M14 34 Q32 24 50 34 Q32 42 14 34Z', '#f0e6d4', 1.8) +
                C(26, 32, 4.5, '#f2c82e', 1.3) +
                C(38, 33, 4.5, '#f2c82e', 1.3) +
                L('M20 35 L44 35', 1.2, '#62a858'),
        ),
    custardSilkie: () =>
        bowl(
            '#f6d868',
            E(28, 30, 5, 3, '#7a4a2a', -10, 1.3) +
                FC(38, 32, 2.4, '#4ca858') +
                HL(24, 34, 4, 1.5, -10, 0.55),
        ),
    umeOnigiri: () =>
        plate(
            P('M20 42 Q32 16 44 42 Q32 47 20 42Z', '#fffdf6', 2) +
                R(25, 35, 14, 9, 2, '#2a3a30', 1.6) +
                C(32, 28, 3.6, '#d84c58', 1.2) +
                FC(27, 32, 0.9, '#3a2618') +
                FC(37, 32, 0.9, '#3a2618'),
        ),
    longanSteamedBun: () =>
        bambooTray(
            C(25, 34, 9, '#f8ebd0', 1.8) +
                C(39, 34, 9, '#f8ebd0', 1.8) +
                C(32, 28, 9.5, '#fff4dc', 1.8) +
                C(32, 27, 3.2, '#c89e64', 1.2),
        ),
    ginkgoBroth: () =>
        bowl(
            '#e8d290',
            E(24, 31, 4.2, 3, '#f4de7a', -15, 1.2) +
                E(38, 32, 4.2, 3, '#f4de7a', 20, 1.2) +
                E(31, 28, 5, 3, '#7a4a2a', 0, 1.3),
        ) + steamF,
    nashiSteamPear: () =>
        bowl(
            '#f2d888',
            C(32, 28, 10, '#e8cc6a', 1.8) +
                C(32, 22, 3.5, '#7a3e22', 1.2) +
                HL(28, 25, 2.4, 1.3, -20, 0.6),
        ) + steamF,
    bokChoyDumplings: () =>
        bambooTray(
            P('M14 36 Q24 25 32 36 Q23 41 14 36Z', '#eef4dc', 1.7) +
                P('M32 36 Q42 25 50 36 Q41 41 32 36Z', '#eef4dc', 1.7) +
                P('M23 29 Q32 19 41 29 Q32 34 23 29Z', '#f6fae8', 1.7) +
                L('M26 26 L38 26', 1.4, '#4ca858'),
        ),

    // ---------------- 9 recettes de l'Atelier de douceurs d'Asie ----------------
    yuzuMochi: () =>
        plate(mochiBall(24, 36, '#fff8dc', C(24, 36, 4, '#f2c82e', 1)) + mochiBall(40, 36, '#fff8dc', C(40, 36, 4, '#f2c82e', 1)) + mochiBall(32, 27, '#fffbe6')),
    umeJelly: () => jar('#e8788a', '#f8b4c8', 'ume'),
    kumquatConfit: () => jar('#f08a24', '#ffd080', 'kumquat'),
    nashiTart: () =>
        plate(
            E(32, 35, 18, 11, '#d89e52', 0, 2) +
                E(32, 33, 15, 8.5, '#f2d672', 0, 1.5) +
                L('M22 33 Q32 27 42 33 M24 37 Q32 31 40 37', 1.5, '#c89e3a') +
                HL(26, 30, 4, 1.5, -15, 0.55),
        ),
    longanPudding: () =>
        bowl(
            '#fbf2dc',
            C(26, 31, 3.8, '#c89e64', 1.2) +
                C(36, 30, 3.8, '#c89e64', 1.2) +
                C(32, 35, 3.8, '#c89e64', 1.2) +
                HL(24, 34, 4, 1.5, -10, 0.6),
        ),
    lotusMooncake: () =>
        plate(
            C(32, 33, 14, '#c87e34', 2.2) +
                C(32, 33, 10.5, '#dca052', 1.4) +
                L('M25 33 L39 33 M32 26 L32 40 M27 28 L37 38 M37 28 L27 38', 1.3, '#8a4e1a') +
                C(32, 33, 3.5, '#f2c864', 1.2),
        ),
    ginkgoSweetSoup: () =>
        bowl(
            '#f4e2a8',
            E(24, 32, 4, 2.8, '#f6d458', -15, 1.2) +
                E(38, 31, 4, 2.8, '#f6d458', 15, 1.2) +
                C(31, 34, 3.5, '#c89e64', 1.2),
        ) + steamF,
    kumquatMochi: () =>
        plate(mochiBall(25, 36, '#fce0e8', C(25, 36, 4.5, '#f0821e', 1)) + mochiBall(39, 36, '#fce0e8', C(39, 36, 4.5, '#f0821e', 1)) + mochiBall(32, 27, '#fff2f6')),
    starAniseCandies: () =>
        plate(
            C(23, 36, 6, '#b86428', 1.6) +
                C(33, 30, 6, '#d48238', 1.6) +
                C(41, 37, 6, '#a85420', 1.6) +
                HL(21, 34, 1.8, 1, -20, 0.7) +
                HL(31, 28, 1.8, 1, -20, 0.7) +
                HL(39, 35, 1.8, 1, -20, 0.7),
        ),

    // ---------------- 6 boissons du comptoir ----------------
    yuzuTea: () => teacup('#f2c84a', C(41, 24, 4.5, '#f2c82e', 1.3)),
    umeSoda: () => icedGlass('#e8788a', C(28, 22, 4, '#b8d85a', 1.2)),
    lotusInfusion: () => teacup('#f2c2cc', FC(32, 26, 3.5, '#f8a8c0', 0.95)),
    kumquatIcedTea: () => icedGlass('#f09432', E(27, 22, 3.6, 4.8, '#f0821e', -15, 1.2)),
    sikaMatcha: () => teacup('#6aa84f', E(32, 26, 11, 3.2, '#b8e09a', 0, 1)),
    aniseChai: () => teacup('#b87a4a', C(32, 26, 3.8, '#6e3418', 1.2) + FC(32, 26, 1.2, '#e8c47a')),
};
Object.assign(items, D);

// ======================= 3 ateliers des Terres d'Asie =======================
machines.wok = () =>
    SHADOW(32, 58, 24, 3) +
    // brasero de pierre et flamme vive
    R(14, 42, 36, 14, 4, '#6e6a64', 2.2) +
    P('M24 54 Q28 43 32 48 Q36 42 40 54Z', '#ff8c2a', 1.4) +
    P('M28 54 Q32 47 36 54Z', '#ffe058', 0.8) +
    // grand wok de fonte noire et poignée de bois
    P('M8 26 Q10 46 32 46 Q54 46 56 26Z', '#2f323a', 2.4) +
    E(32, 26, 24, 6.5, '#464a54', 0, 2) +
    L('M4 22 L12 27 M52 27 L60 22', 3.4, '#8a5a2e') +
    C(26, 26, 3.2, '#58b862', 1.1) +
    C(36, 26, 3.2, '#e8c464', 1.1) +
    steamF;

machines.steamer = () =>
    SHADOW(32, 58, 22, 3) +
    // marmite de base
    P('M14 44 L16 55 Q32 58 48 55 L50 44Z', '#464a54', 2.2) +
    // deux étages de paniers en bambou tressé + couvercle bombé
    R(13, 33, 38, 12, 3, '#d6aa64', 2.2) +
    L('M13 39 L51 39', 1.4, '#9a6e34') +
    R(13, 21, 38, 12, 3, '#e2b872', 2.2) +
    L('M13 27 L51 27', 1.4, '#9a6e34') +
    P('M12 22 Q32 10 52 22Z', '#c89852', 2.2) +
    R(28, 11, 8, 4, 2, '#8a5a2e', 1.6) +
    steamF;

machines.wagashi = () =>
    SHADOW(32, 58, 24, 3) +
    // table de bois laqué et petit auvent rouge d'atelier de douceurs
    R(10, 34, 44, 22, 4, '#8a5228', 2.2) +
    R(14, 38, 36, 14, 3, '#f8efe0', 1.8) +
    // mochis exposés en vitrine
    C(23, 45, 4.5, '#fce0e8', 1.4) +
    C(32, 45, 4.5, '#f2d458', 1.4) +
    C(41, 45, 4.5, '#a8d890', 1.4) +
    // auvent pagode vermillon
    P('M6 34 Q32 18 58 34 L54 36 L10 36Z', '#c83c34', 2.2) +
    P('M12 24 Q32 12 52 24 L48 26 L16 26Z', '#b03028', 1.8) +
    FC(32, 16, 2.8, '#f4c644', 0.95);
