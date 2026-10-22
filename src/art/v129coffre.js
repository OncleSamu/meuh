// Le coffre-fort de la grange (1.29).
import { C, FC, HL, L, R, SHADOW, ui } from './kit.js';
const O = '#3a2618';
export const icVault = () =>
    SHADOW(32, 58, 24, 2.5) +
    R(8, 10, 48, 46, 5, '#8f9aa5', 2.8) +
    R(13, 15, 38, 36, 3, '#b7c1ca', 2) +
    C(32, 33, 11, '#6f7c88', 2.4) +
    C(32, 33, 6, '#d8dee4', 1.8) +
    L('M32 33 L32 27 M32 33 L37 36', 2.4) +
    FC(32, 33, 1.8, O) +
    R(52, 26, 5, 6, 1, '#f2c14e', 1.6) +
    R(52, 38, 5, 6, 1, '#f2c14e', 1.6) +
    R(12, 54, 8, 5, 1, '#5b6670', 1.6) +
    R(44, 54, 8, 5, 1, '#5b6670', 1.6) +
    HL(20, 20, 8, 2.4, -8, 0.55);
Object.assign(ui, { vault: icVault });
