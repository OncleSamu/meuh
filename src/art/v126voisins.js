// Le marché des voisins (1.26) : étal, demande d'achat, livraison, coup de cœur.
import { C, HL, L, P, R, SHADOW, ui } from './kit.js';
const awn = (c1, c2) =>
    [0, 1, 2, 3, 4, 5].map(k => P(`M${8 + k * 8} 14 L${16 + k * 8} 14 L${16 + k * 8} 22 Q${12 + k * 8} 27 ${8 + k * 8} 22Z`, k % 2 ? c2 : c1, 1.6)).join('');
export const icStal = () =>
    SHADOW(32, 58, 24, 2.5) +
    R(10, 22, 44, 32, 3, '#c08b52', 2.6) +
    R(14, 30, 36, 8, 2, '#e8d6aa', 2) +
    L('M14 22 L14 54 M50 22 L50 54', 2.6) +
    awn('#e8364b', '#fff') +
    P('M6 14 L58 14 L56 8 L8 8Z', '#7a4a2a', 2.4) +
    C(22, 32, 4, '#e8364b', 1.4) +
    C(32, 32, 4, '#ffd23f', 1.4) +
    C(42, 32, 4, '#6cc04a', 1.4);
export const icDemande = () =>
    SHADOW(32, 58, 20, 2.5) +
    R(12, 6, 36, 48, 4, '#fff7e0', 2.6) +
    L('M18 16 L42 16 M18 24 L38 24 M18 32 L34 32', 2, 'rgba(58,38,24,.5)') +
    C(42, 44, 12, '#ffd23f', 2.4) +
    C(42, 44, 7, 'none', 1.4) +
    P('M36 4 L40 10 L32 10Z', '#c8453a', 1.4);
export const icCaisse = () =>
    SHADOW(32, 58, 24, 2.5) +
    R(8, 24, 48, 30, 3, '#c08b52', 2.6) +
    L('M8 34 L56 34 M8 44 L56 44 M20 24 L20 54 M44 24 L44 54', 2, '#7a4a2a') +
    C(22, 18, 7, '#e8364b', 2) +
    C(34, 16, 7, '#ff9f1c', 2) +
    C(44, 20, 6, '#6cc04a', 2);
export const icCoeur = () =>
    SHADOW(32, 58, 18, 2.5) +
    P('M32 54 C10 38 8 18 20 12 C26 9 31 13 32 18 C33 13 38 9 44 12 C56 18 54 38 32 54Z', '#e8364b', 2.6) +
    P('M32 22 L35 30 L43 30 L37 35 L39 43 L32 38 L25 43 L27 35 L21 30 L29 30Z', '#ffd23f', 1.6) +
    HL(22, 20, 4, 2.4, -30, 0.55);
Object.assign(ui, { nmEtal: icStal, nmDemande: icDemande, nmCaisse: icCaisse, nmCoeur: icCoeur });
