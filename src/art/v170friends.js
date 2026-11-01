// 1.70 : les villageois. Le gâteau d'anniversaire (calendrier, liste des choses à faire, fiche du villageois).
import { ui, P, C, E, R, L, F, FC, SHADOW, HL } from './kit.js';

ui.cake = () =>
    SHADOW(32, 59, 22, 3) +
    E(32, 55, 24, 5, '#e8eef2', 0, 2) +
    // deux étages : génoise, crème, fraises
    R(13, 38, 38, 15, 5, '#f6d8a8') +
    P('M13 42 Q13 38 18 38 L46 38 Q51 38 51 42 Q47 46 43 42 Q39 47 35 42 Q31 47 27 42 Q23 47 19 42 Q16 45 13 42Z', '#fff7ee', 2) +
    R(19, 24, 26, 14, 4, '#f6a8c0') +
    P('M19 28 Q19 24 23 24 L41 24 Q45 24 45 28 Q42 31 39 28 Q36 32 32 28 Q28 32 25 28 Q22 31 19 28Z', '#fff7ee', 2) +
    [18, 26, 38, 46].map(x => C(x, 49, 2.2, '#e0384a', 1.2) + FC(x - 0.6, 48.4, 0.6, '#fff', 0.8)).join('') +
    HL(16, 46, 1.5, 4, 0, 0.4) +
    // trois bougies et leurs flammes
    [25, 32, 39]
        .map(
            (x, k) =>
                R(x - 1.6, 13, 3.2, 11, 1.2, ['#7ec8f0', '#ffd23f', '#9be06b'][k], 1.4) +
                L(`M${x - 1.6} 16 L${x + 1.6} 18 M${x - 1.6} 20 L${x + 1.6} 22`, 0.9, '#fff') +
                P(`M${x} 5 Q${x + 3} 9 ${x} 12 Q${x - 3} 9 ${x} 5Z`, '#ffb020', 1.2) +
                F(`M${x} 7.5 Q${x + 1.4} 9.5 ${x} 11 Q${x - 1.4} 9.5 ${x} 7.5Z`, '#fff3a0'),
        )
        .join('');
