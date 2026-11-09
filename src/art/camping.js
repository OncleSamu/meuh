// 1.101 : le camping de la vallée, dessiné : le terrain, les tentes, les cabanes de résidents, les aménagements, le feu de camp.
import { svg, P, R, L, E, C, FE, HL, O } from './kit.js';

export const TENT_COLORS = ['#e2582f', '#3f8fd0', '#e0b030', '#4aa860', '#a864c8', '#e8789a'];
export const CABIN_COLORS = ['#d9a66a', '#b9d08a', '#9ec4e0', '#e0b8a0', '#d4c28a'];
const DARK = c => c; // les teintes sont déjà choisies pour rester lisibles avec le contour

export const tent = (c = '#e2582f') =>
    svg(
        FE(32, 57, 26, 3, '#000', 0.16) +
            P('M5 55 L32 11 L59 55Z', c, 2.6) +
            P('M32 11 L59 55 L40 55Z', 'rgba(0,0,0,.18)', 0) +
            P('M25 55 L32 33 L39 55Z', '#3a2618', 2.2) +
            L('M32 11 V5', 2.6) +
            P('M32 5 L42 8 L32 11Z', '#f4f1e6', 1.6) +
            L('M10 54 L32 15', 1.4, 'rgba(255,255,255,.45)'),
    );
export const cabin = (c = '#d9a66a') =>
    svg(
        FE(32, 58, 24, 3, '#000', 0.16) +
            R(11, 28, 42, 28, 2, c, 2.4) +
            P('M6 30 L32 8 L58 30Z', '#b8433a', 2.6) +
            R(42, 10, 6, 11, 1, '#8a8f96', 2) +
            R(26, 38, 12, 18, 2, '#6b4220', 2) +
            R(15, 36, 9, 9, 1.5, '#cfe9f5', 2) +
            R(41, 36, 9, 9, 1.5, '#cfe9f5', 2) +
            C(35, 48, 1, '#f1d27a', 0.8),
    );
export const well = () =>
    svg(
        FE(32, 58, 22, 3, '#000', 0.16) +
            P('M14 56 V38 Q32 46 50 38 V56 Q32 62 14 56Z', '#a9a39a', 2.4) +
            E(32, 38, 18, 5, '#3a6f9a', 0, 2.2) +
            L('M16 36 V18 M48 36 V18', 3) +
            P('M10 20 L32 6 L54 20Z', '#b8433a', 2.4) +
            L('M32 14 V30', 1.6) + R(28, 28, 8, 7, 2, '#8b5a32', 1.8),
    );
export const toilets = () =>
    svg(
        FE(32, 58, 24, 3, '#000', 0.16) +
            R(10, 22, 44, 34, 2, '#cfe0d0', 2.4) +
            P('M7 24 L32 10 L57 24Z', '#7a8f9c', 2.4) +
            R(14, 34, 14, 22, 1.5, '#5a8fb0', 2) + R(36, 34, 14, 22, 1.5, '#d08a9a', 2) +
            C(31, 46, 1.2, '#f4f1e6') + C(33, 46, 1.2, '#f4f1e6'),
    );
export const pavilion = () =>
    svg(
        FE(32, 58, 27, 3, '#000', 0.16) +
            L('M10 56 V30 M54 56 V30 M32 56 V26', 3.4) +
            P('M3 32 L32 8 L61 32Z', '#e8c35a', 2.6) +
            P('M3 32 Q14 38 24 32 Q32 38 40 32 Q50 38 61 32 L61 33 Q50 40 40 34 Q32 40 24 34 Q14 40 3 33Z', '#e2582f', 1.6) +
            R(18, 44, 28, 6, 2, '#8b5a32', 2) + C(20, 40, 3, '#f4f1e6', 1.6) + C(44, 40, 3, '#f4f1e6', 1.6),
    );
export const swing = () =>
    svg(
        FE(32, 58, 25, 3, '#000', 0.16) +
            L('M10 58 L22 14 L42 14 L54 58', 3.6) +
            L('M22 14 H42', 4) +
            L('M28 14 V40 M38 14 V40', 1.6) +
            R(24, 40, 8, 4, 1.5, '#e2582f', 1.8) + R(34, 40, 8, 4, 1.5, '#3f8fd0', 1.8),
    );
export const shop = () =>
    svg(
        FE(32, 58, 26, 3, '#000', 0.16) +
            R(9, 26, 46, 30, 2, '#f1dcae', 2.4) +
            P('M5 28 L9 14 H55 L59 28Z', '#e2582f', 2.4) +
            R(15, 36, 20, 12, 1.5, '#cfe9f5', 2) + R(40, 34, 10, 22, 1.5, '#6b4220', 2) +
            R(19, 20, 26, 7, 2, '#fffaf0', 1.6),
    );
export const stall = pal =>
    svg(
        FE(32, 58, 26, 3, '#000', 0.16) +
            R(9, 32, 46, 24, 2, '#c98a4b', 2.4) +
            P('M4 34 L10 16 H54 L60 34Z', pal.fg, 2.4) +
            R(14, 38, 36, 6, 1.5, pal.bg, 1.8) + R(20, 47, 24, 8, 1.5, pal.bg, 1.8),
    );
export const marquee = () =>
    svg(
        FE(32, 58, 28, 3, '#000', 0.16) +
            P('M4 56 V30 L32 6 L60 30 V56Z', '#f4efe0', 2.6) +
            P('M4 30 L32 6 L18 30Z M32 6 L46 30 L60 30Z', '#e2582f', 2) +
            P('M26 56 L32 38 L38 56Z', '#3a2618', 2) +
            L('M4 32 Q18 38 32 32 Q46 38 60 32', 2, '#3a2618') +
            C(14, 34, 2.2, '#e8c35a', 1.2) + C(32, 36, 2.2, '#3f8fd0', 1.2) + C(50, 34, 2.2, '#4aa860', 1.2),
    );
export const fire = () =>
    svg(
        FE(32, 56, 22, 4, '#000', 0.18) +
            L('M14 54 L50 46 M16 46 L48 54', 6, O) + L('M14 54 L50 46 M16 46 L48 54', 3.4, '#8b5a32') +
            `<g class="cm-flame">` + P('M32 46 Q18 38 28 22 Q30 30 34 24 Q36 14 40 26 Q46 38 32 46Z', '#f08a2a', 2.2) + P('M32 45 Q25 38 31 30 Q35 36 36 31 Q40 38 32 45Z', '#ffd84a', 0) + `</g>` +
            C(10, 56, 3.4, '#a9a39a', 1.8) + C(54, 55, 3.4, '#a9a39a', 1.8),
    );
export const tree = (c = '#4aa860') =>
    svg(
        FE(32, 58, 18, 3, '#000', 0.16) +
            R(28, 38, 8, 20, 2, '#8b5a32', 2.2) +
            C(32, 26, 18, c, 2.6) + C(20, 34, 11, c, 2.2) + C(44, 34, 11, c, 2.2) +
            HL(26, 20, 5, 3, -20, 0.4),
    );
export const pitchOpen = () =>
    svg(`<rect x="6" y="14" width="52" height="40" rx="9" fill="rgba(240,222,170,.55)" stroke="#a98e57" stroke-width="2.2" stroke-dasharray="5 4"/>`);
export const pitchLocked = () =>
    svg(`<rect x="6" y="14" width="52" height="40" rx="9" fill="rgba(0,0,0,.05)" stroke="#8a8f7a" stroke-width="2" stroke-dasharray="3 5"/>`);
export const sign = () =>
    svg(
        L('M20 60 V30 M44 60 V30', 4) +
            R(4, 12, 56, 24, 4, '#c98a4b', 2.6) +
            `<text x="32" y="22" text-anchor="middle" font-family="system-ui,sans-serif" font-weight="900" font-size="8" fill="#3a2618">CAMPING</text>` +
            `<text x="32" y="32" text-anchor="middle" font-family="system-ui,sans-serif" font-weight="800" font-size="6" fill="#5a3a14">de la vallée</text>`,
    );
export const flag = () => svg(L('M18 58 V8', 3.4) + P('M18 8 L50 18 L18 30Z', '#e2582f', 2.4));

export const SPRITES = { sign, tent, cabin, well, toilets, pavilion, swing, shop, stall, marquee, fire, tree, pitchOpen, pitchLocked, flag };

// le décor de fond : herbe rayée, chemin de terre, lisière d'arbres
export const sceneBg = () =>
    `<svg class="cm-bg" viewBox="0 0 360 560" preserveAspectRatio="none" aria-hidden="true">
        <defs><linearGradient id="cmg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8fcf68"/><stop offset="1" stop-color="#6fb552"/></linearGradient></defs>
        <rect width="360" height="560" fill="url(#cmg)"/>
        ${[0, 1, 2, 3, 4, 5, 6].map(i => `<rect x="0" y="${i * 80}" width="360" height="40" fill="#fff" opacity=".05"/>`).join('')}
        <path d="M180 560 C176 500 190 470 180 440 L180 300 C176 250 120 236 40 232 L40 246 C130 250 160 262 166 300 L166 440 C176 480 164 520 168 560Z" fill="#d9bd86" opacity=".0"/>
        <path d="M0 262 Q180 246 360 262 L360 276 Q180 260 0 276Z" fill="#dcc690" opacity=".85"/>
        <path d="M0 458 Q180 446 360 458 L360 470 Q180 458 0 470Z" fill="#dcc690" opacity=".85"/>
        <path d="M168 276 Q172 380 164 458 L196 458 Q188 380 192 276Z" fill="#dcc690" opacity=".85"/>
        <rect x="0" y="0" width="360" height="10" fill="#3f8f2e" opacity=".5"/>
    </svg>`;
