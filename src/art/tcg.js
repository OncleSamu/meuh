// 1.155 : Icône du MeuhCG (éventail de 3 cartes à collectionner avec étoile dorée).
import { C, F, HL, L, P, R, SHADOW, ui } from './kit.js';

ui.meuhcg = () =>
    SHADOW(32, 58, 22, 3) +
    // carte gauche (verte)
    `<g transform="rotate(-16 32 48)">${R(16, 12, 28, 40, 5, '#5cb85c', 2.2)}${R(20, 16, 20, 16, 2.5, '#eaf8e6', 1.4)}</g>` +
    // carte droite (bleue)
    `<g transform="rotate(16 32 48)">${R(20, 12, 28, 40, 5, '#4da3e8', 2.2)}${R(24, 16, 20, 16, 2.5, '#e6f4ff', 1.4)}</g>` +
    // carte centrale (dorée brillante)
    R(18, 9, 28, 42, 5, '#ffd23f', 2.4) +
    R(22, 13, 20, 18, 3, '#fff9e6', 1.6) +
    // petite étoile brillante au centre
    P('M32 16 L34 20.5 L39 21 L35.2 24 L36.4 28.5 L32 26 L27.6 28.5 L28.8 24 L25 21 L30 20.5Z', '#f59e0b', 1.4) +
    F('M23 36 L41 36 L41 39 L23 39Z', '#c97b18', 0.7) +
    L('M24 43 L38 43 M24 46.5 L34 46.5', 1.8, '#8a5512') +
    C(47, 13, 2.5, '#fff6c8', 1.2) +
    HL(24, 17, 2.2, 5, -18, 0.55);
