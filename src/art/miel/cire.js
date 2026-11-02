// 1.60 : la cire d'abeille : deux gros pains de cire ronds, empilés, l'abeille moulée sur celui du dessus.
import { C, E, FE, HL, L, P, SHADOW, items } from '../kit.js';

// un pain de cire : flanc ocre, dessus doré, une ligne de moulage
const cake = (y, rx, h) =>
    P(`M${32 - rx} ${y} L${32 - rx} ${y + h} Q32 ${y + h + rx * 0.4} ${32 + rx} ${y + h} L${32 + rx} ${y}Z`, '#c98f1e', 2.4) +
    L(`M${32 - rx + 2} ${y + h * 0.55} Q32 ${y + h * 0.55 + rx * 0.38} ${32 + rx - 2} ${y + h * 0.55}`, 1, '#a8730f') +
    E(32, y, rx, rx * 0.36, '#f2c74e', 0, 2.4) +
    E(32, y, rx - 3.5, rx * 0.36 - 1.6, 'none', 0, 1);

items.wax = () =>
    SHADOW(32, 58, 26, 3.5) +
    cake(40, 24, 11) +
    cake(22, 19, 11) +
    // l'abeille moulée sur le pain du dessus
    FE(32, 22, 7.5, 3.4, '#dc9e26', 1) +
    L('M28.5 19.6 L28.5 24.4 M32 19 L32 25 M35.5 19.6 L35.5 24.4', 1.4, '#9a6a10') +
    FE(28.5, 18.6, 3.6, 1.6, '#fbe7a4', 0.95, -22) +
    FE(35.5, 18.6, 3.6, 1.6, '#fbe7a4', 0.95, 22) +
    C(24.2, 22.2, 1.8, '#9a6a10', 0) +
    // des alvéoles en creux sur le pain du dessous
    L('M14 41 l2 -1.2 l2 1.2 l0 2.2 l-2 1.2 l-2 -1.2Z M46 41 l2 -1.2 l2 1.2 l0 2.2 l-2 1.2 l-2 -1.2Z', 1, '#c98f1e') +
    HL(20, 20, 4, 1.2, -8, 0.6) +
    HL(16, 38, 4.5, 1.2, -8, 0.5);
