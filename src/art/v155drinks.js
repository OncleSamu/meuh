// 1.55 : les huit boissons du Grand Nord, avec les mêmes tasses que le reste du comptoir.
import { E, FE, P, R, sub, items } from './kit.js';
import { tea, espresso, mug, glassMug } from './v117drinks.js';

const snow = (x, y) => FE(x, y, 3, 1.2, '#f2f7fb', 0.95);
const D = {
    ryeCoffee: espresso('#5a3a22', sub('rye', 38, 32, 24)),
    spruceTea: tea('#9ab25a', sub('spruce', 38, 0, 26)),
    lingonTisane: tea('#a8283e', sub('lingonberry', 40, 2, 22)),
    cloudberryInfusion: tea('#f0b040', sub('cloudberry', 40, 2, 22)),
    buckthornHot: mug('#f08a1a', E(29, 18, 12, 2.6, '#ffd48a', 0, 0), sub('seaBuckthorn', 32, 34, 22), '#f3ede0'),
    rowanTea: glassMug(
        '#c8402a',
        P('M14 17 Q16 9 29 9 Q42 9 44 17 Q29 22 14 17Z', '#fff4f0', 1.8),
        R(22, 34, 8, 8, 2, '#ffffff', 1.4) + R(31, 42, 8, 8, 2, '#ffffff', 1.4) + sub('rowan', 38, 2, 20),
    ),
    ryeKvas: glassMug('#8a5a2e', P('M14 17 Q16 9 29 9 Q42 9 44 17 Q29 22 14 17Z', '#f3e2c4', 1.8), sub('rye', 36, 28, 22) + R(20, 40, 7, 7, 2, '#ffffff', 1.4)),
    cardamomMilk: mug('#e6d2a6', E(29, 18, 12, 2.6, '#fffaf0', 0, 0) + snow(24, 17), sub('cardamom', 30, 34, 22), '#f1f4f8'),
};
Object.keys(D).forEach(k => (items[k] = () => D[k]));
