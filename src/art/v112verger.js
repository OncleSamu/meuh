// 1.12 : le verger — greffons, bouture, sécateur, échelle, pépinière, Odile et le cueilleur.
import { C, E, F, FC, HL, L, P, R, SHADOW, items, ui, people } from './kit.js';
import { bust, face } from './people.js';

// ---- une branche ficelée, avec sa cire de couleur et son insigne ----
const leafAt = (x, y, ang, f = '#6cc04a') =>
    `<g transform="translate(${x} ${y}) rotate(${ang})">` + P('M0 0 C4 -8 12 -8 16 0 C12 8 4 8 0 0Z', f, 1.8) + L('M1 0 L14 0', 1, '#3f8f2e') + `</g>`;
const graft = (wax, waxHi, mark) =>
    SHADOW(32, 60, 22, 3) +
    L('M10 56 Q28 44 54 16', 7.4) +
    L('M10 56 Q28 44 54 16', 4, '#8b5a2b') +
    L('M36 34 Q44 36 52 40', 5.4) +
    L('M36 34 Q44 36 52 40', 2.6, '#a8693a') +
    leafAt(52, 14, -60) +
    leafAt(52, 40, 10, '#8fd65f') +
    leafAt(40, 24, -80, '#8fd65f') +
    L('M22 48 L30 44 M23 52 L32 47', 3.2, '#e8d9a8') +
    C(28, 42, 7, wax, 2) +
    HL(26, 39, 2.6, 1.4, -30, 0.8) +
    C(15, 17, 12, '#fff', 2.2) +
    mark;
const star5 = (x, y, r, f) => {
    const pts = Array.from({ length: 10 }, (_, k) => {
        const a = (-90 + k * 36) * (Math.PI / 180),
            rr = k % 2 ? r * 0.45 : r;
        return `${(x + Math.cos(a) * rr).toFixed(1)} ${(y + Math.sin(a) * rr).toFixed(1)}`;
    });
    return P(`M${pts.join(' L')}Z`, f, 1.4);
};
const GRAFTS = {
    // doré : un fruit sur quatre est en or
    graftGold: graft('#f2c14e', '#ffe48a', star5(15, 17, 8, '#f2c14e')),
    // double : deux fruits à la fois
    graftDouble: graft(
        '#e2412f',
        '#ff8a7a',
        C(11, 17, 4.6, '#e2412f', 1.6) + C(19.5, 17, 4.6, '#e2412f', 1.6) + L('M11 12.4 L11 10 M19.5 12.4 L19.5 10', 1.2, '#3f8f2e'),
    ),
    // éternel : ne vieillit jamais (le signe de l'infini)
    graftEternal: graft('#5aa9e6', '#b8e0ff', L('M15 17 C11 11 6 14 9 18 C12 22 15 17 15 17 C15 17 18 12 21 16 C24 20 19 23 15 17Z', 2.2, '#2f7fc0')),
    // précoce : fruits plus vite (une horloge)
    graftEarly: graft('#e8792a', '#ffb070', C(15, 17, 7, '#fff', 1.6) + L('M15 12.5 L15 17 L18.5 18.5', 1.8)),
    // robuste : vit plus longtemps (un bouclier)
    graftRobust: graft('#8b5a2b', '#c08b52', P('M15 9.5 L22 12 L21 19 Q19 23 15 25 Q11 23 9 19 L8 12Z', '#c9d3dc', 1.8) + L('M15 12 L15 22', 1.4, '#7d8794')),
    // la bouture : une jeune branche dans un petit pot, son étiquette
    cutting:
        SHADOW(32, 60, 18, 3) +
        P('M18 40 L46 40 L42 58 Q42 60 40 60 L24 60 Q22 60 22 58Z', '#c9692f') +
        R(16, 36, 32, 7, 2.4, '#e8935a') +
        E(32, 36.5, 14, 2.4, '#5e3a1e', 0, 1.2) +
        L('M32 38 L32 14', 5.4) +
        L('M32 38 L32 14', 2.6, '#8b5a2b') +
        leafAt(32, 24, -35) +
        leafAt(32, 18, -140, '#8fd65f') +
        leafAt(32, 30, 20, '#8fd65f') +
        R(44, 16, 12, 9, 1.4, '#fff6e0', 1.6) +
        L('M44 20 L40 24', 1.2) +
        L('M47 19 L53 19 M47 22 L52 22', 1),
};

// ---- les outils ----
const TOOLS = {
    // le sécateur
    pruners:
        SHADOW(32, 60, 22, 3) +
        L('M16 54 L36 26', 8.6) +
        L('M16 54 L36 26', 5, '#e2412f') +
        L('M24 56 L38 28', 8.6) +
        L('M24 56 L38 28', 5, '#c8302a') +
        P('M36 26 C38 14 46 8 54 8 C52 16 48 24 40 30Z', '#cfd8e4', 2) +
        P('M38 28 C46 24 52 28 56 34 C48 36 42 34 38 28Z', '#9aa6b8', 2) +
        FC(37, 28, 2.2, '#7d8794') +
        F('M44 12 C48 10 51 10 52 10 C50 12 48 14 44 18Z', '#fff', 0.7),
    // l'échelle de cueillette
    ladder:
        SHADOW(32, 60, 20, 3) +
        L('M20 58 L28 6', 6.4) +
        L('M20 58 L28 6', 3, '#c08b52') +
        L('M42 58 L36 6', 6.4) +
        L('M42 58 L36 6', 3, '#c08b52') +
        [14, 24, 34, 44, 54].map((y, k) => L(`M${20 + (58 - y) * 0.0 + (54 - y) * -0.05 + 1.6 + k * -0.2} ${y} L${43 - 0.8 - k * 0.2} ${y}`, 5)).join('') +
        [14, 24, 34, 44, 54].map(y => L(`M${22.6 - (y - 14) * 0.0 + (54 - y) * -0.15} ${y} L${41 + (54 - y) * 0.1} ${y}`, 2.4, '#e8c38c')).join('') +
        HL(26, 20, 1.2, 8, -4, 0.5),
    // le pot de résine pour les blessures
    resinPot:
        SHADOW(32, 60, 16, 3) +
        P('M16 26 L48 26 L46 56 Q46 59 42 59 L22 59 Q18 59 18 56Z', '#8b5a2b') +
        E(32, 26, 16, 5, '#e8a43a') +
        E(32, 26, 16, 5, 'none', 0, 2) +
        P('M22 32 Q32 38 42 32 L41 40 Q32 46 23 40Z', '#e8a43a') +
        HL(28, 25, 6, 1.6, -10, 0.7) +
        L('M44 20 L58 10', 4.4) +
        L('M44 20 L58 10', 2, '#c08b52') +
        C(58, 9, 3.6, '#e8a43a', 1.6),
};

// ---- la pépinière : un châssis vitré, des pots et des jeunes plants ----
ui.nursery = () =>
    SHADOW(32, 60, 28, 3) +
    P('M6 56 L10 30 L54 30 L58 56Z', '#c08b52') +
    L('M8 44 L56 44', 1.6, '#8b5a2b') +
    P('M8 30 L14 14 L50 14 L56 30Z', '#cfeaf5') +
    L('M20 14 L18 30 M32 14 L32 30 M44 14 L46 30', 1.6, '#8b5a2b') +
    F('M12 28 L16 17 L24 17 L19 28Z', '#fff', 0.55) +
    P('M14 56 L18 46 L28 46 L32 56Z', '#c9692f', 1.8) +
    P('M34 56 L36 46 L46 46 L50 56Z', '#c9692f', 1.8) +
    L('M23 46 L23 38', 2.4) +
    L('M23 46 L23 38', 1, '#3f8f2e') +
    leafAt(23, 40, -30) +
    leafAt(23, 42, 200, '#8fd65f') +
    L('M41 46 L41 36', 2.4) +
    L('M41 46 L41 36', 1, '#3f8f2e') +
    leafAt(41, 38, -40) +
    leafAt(41, 41, 190, '#8fd65f') +
    R(4, 54, 56, 5, 2, '#8b5a2b');

// ---- Odile, l'arboricultrice : foulard à fleurs et sécateur ; le cueilleur : chapeau de paille ----
people.odile = () =>
    bust('#4aa88a', P('M22 46 L32 56 L42 46 L42 62 L22 62Z', '#e9f5d8', 2) + FC(28, 55, 1.6, '#e2412f') + FC(36, 58, 1.6, '#f2c14e')) +
    face() +
    P('M17 32 C15 14 49 14 47 32 C44 24 38 20 32 20 C26 20 20 24 17 32Z', '#a8602a') +
    P('M16 28 C16 12 48 12 48 28 L48 24 C46 14 18 14 16 24Z', '#e2412f', 2) +
    FC(24, 18, 2, '#ffe48a') +
    FC(32, 15, 2, '#ffe48a') +
    FC(40, 18, 2, '#ffe48a') +
    P('M14 34 C10 44 12 54 16 56 C16 48 17 40 18 34Z', '#a8602a', 1.8);
people.picker = () =>
    bust('#a8d65a', P('M22 48 L32 58 L42 48', 'none') + R(24, 52, 16, 10, 2, '#c08b52', 1.8) + L('M24 56 L40 56', 1, '#8b5a2b')) +
    face() +
    P('M6 24 C14 30 50 30 58 24 C52 18 12 18 6 24Z', '#e8c38c') +
    P('M18 24 C18 6 46 6 46 24Z', '#e8c38c') +
    L('M18 21 C26 24 38 24 46 21', 2.6, '#e2412f') +
    L('M10 24 L54 24', 1, '#c08b52');

for (const [k, v] of Object.entries({ ...GRAFTS, ...TOOLS })) {
    if (k in TOOLS) ui[k] = () => v;
    else items[k] = () => v;
}
export const VERGER_ART_IDS = {
    grafts: ['graftGold', 'graftDouble', 'graftEternal', 'graftEarly', 'graftRobust'],
    cutting: ['cutting'],
    tools: Object.keys(TOOLS),
};
