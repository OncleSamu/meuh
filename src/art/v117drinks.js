// 1.17 : les boissons du comptoir. Quinze thés et cafés nouveaux, dessinés avec les mêmes tasses que le reste du jeu.
import { C, E, F, FC, FE, HL, L, P, R, SHADOW, sub, items } from './kit.js';

const steam = L('M24 10 Q20 6 24 2 M32 12 Q28 7 32 2 M40 10 Q36 6 40 2', 1.8, 'rgba(255,255,255,.9)');
const steamS = L('M26 24 Q23 20 26 16 M34 26 Q31 21 34 15', 1.8, 'rgba(255,255,255,.9)');
const HANDLE = 'M48 28 Q60 28 58 38 Q56 46 46 44';

// la tasse à thé du jeu (même forme que le thé vert), avec un décor au choix
const tea = (liquid, extra = '', cupC = '#ffffff') =>
    SHADOW(32, 58, 24, 3) +
    E(32, 52, 26, 6, '#ffffff') +
    E(32, 51, 18, 3.6, '#eef3f6', 0, 1.2) +
    P(HANDLE, 'none', 3.4) +
    P(HANDLE, 'none', 0) +
    L(HANDLE, 1.6, cupC) +
    P('M10 24 L54 24 Q54 46 32 50 Q10 46 10 24Z', cupC) +
    E(32, 24, 22, 5.5, cupC) +
    E(32, 24.5, 18.5, 4, liquid, 0, 1.2) +
    HL(16, 32, 2, 6, -10, 0.6) +
    steam +
    extra;

// une rondelle d'agrume posée sur le bord
const slice = (x, y, skin, flesh) =>
    C(x, y, 6.5, skin, 2) + C(x, y, 3.8, flesh, 1) + L(`M${x} ${y - 5.4} L${x} ${y + 5.4} M${x - 5.4} ${y} L${x + 5.4} ${y}`, 0.8, skin);

// la tasse d'expresso : petite, sur sa soucoupe
const espresso = (liquid, extra = '') =>
    SHADOW(32, 58, 24, 3) +
    E(32, 52, 26, 6, '#ffffff') +
    E(32, 51, 17, 3.4, '#eef3f6', 0, 1.2) +
    L('M44 36 Q55 36 53 44 Q51 50 43 48', 5.2) +
    L('M44 36 Q55 36 53 44 Q51 50 43 48', 2.2, '#ffffff') +
    P('M16 32 L48 32 Q48 48 32 50 Q16 48 16 32Z', '#ffffff') +
    E(32, 32, 16, 4.6, '#ffffff') +
    E(32, 32.6, 13, 3.2, liquid, 0, 1.2) +
    E(32, 32, 7.5, 1.6, '#d9a066', 0, 0) +
    HL(21, 41, 2, 5, -10, 0.6) +
    steamS +
    extra;

// le grand mug (café au lait, cappuccino, moka…)
const mug = (liquid, top = '', extra = '', mugC = '#f5f1e6') =>
    SHADOW(32, 58, 22, 3) +
    L('M46 26 Q59 26 58 38 Q57 48 45 47', 5.8) +
    L('M46 26 Q59 26 58 38 Q57 48 45 47', 2.6, mugC) +
    P('M10 18 L48 18 L46 53 Q46 57 42 57 L16 57 Q12 57 12 53Z', mugC) +
    E(29, 18, 19, 5, mugC) +
    E(29, 18.6, 15.6, 3.6, liquid, 0, 1.2) +
    HL(16, 36, 2, 8, -6, 0.55) +
    top +
    extra;

// le mug en verre : on voit le café à travers
const glassMug = (liquid, top = '', extra = '') =>
    SHADOW(32, 58, 22, 3) +
    L('M46 26 Q59 26 58 38 Q57 48 45 47', 5.8) +
    L('M46 26 Q59 26 58 38 Q57 48 45 47', 2.6, '#eaf6fd') +
    P('M10 14 L48 14 L46 53 Q46 57 42 57 L16 57 Q12 57 12 53Z', '#eaf6fd') +
    F('M12.4 24 L45.6 24 L44 52.6 Q44 55 42 55 L16 55 Q14 55 14 52.6Z', liquid) +
    F('M15 17 L18 17 L19 53 L16.4 53Z', '#fff', 0.5) +
    P('M10 14 L48 14 L46 53 Q46 57 42 57 L16 57 Q12 57 12 53Z', 'none') +
    top +
    extra;

// une chantilly en volute
const cream = (x, y, w = 11) =>
    P(`M${x - w} ${y} Q${x - w} ${y - 5} ${x} ${y - 5} Q${x + w} ${y - 5} ${x + w} ${y}Z`, '#fffdf3', 1.8) +
    P(`M${x - w * 0.7} ${y - 4} Q${x - w * 0.7} ${y - 9} ${x} ${y - 9} Q${x + w * 0.7} ${y - 9} ${x + w * 0.7} ${y - 4}Z`, '#fffdf3', 1.8) +
    P(`M${x - w * 0.35} ${y - 8} Q${x} ${y - 16} ${x + w * 0.3} ${y - 9}Z`, '#fffdf3', 1.8);

// un grand bol (café au lait d'orge, matcha)
const bowl = (liquid, top = '', extra = '') =>
    SHADOW(32, 58, 24, 3) +
    P('M8 24 Q8 54 32 54 Q56 54 56 24Z', '#f5f1e6') +
    R(24, 52, 16, 5, 2, '#f5f1e6') +
    E(32, 24, 24, 6.5, '#f5f1e6') +
    E(32, 24.6, 20.5, 5, liquid, 0, 1.2) +
    L('M10 36 Q32 42 54 36', 2.4, '#5aa9e6') +
    HL(14, 32, 2, 6, -10, 0.6) +
    top +
    extra;

// la coupe à glace
const coupe = (extra = '') =>
    SHADOW(32, 61, 18, 2.6) +
    R(27, 44, 10, 12, 2, '#eaf6fd') +
    E(32, 58, 14, 3.4, '#eaf6fd') +
    P('M10 26 L54 26 Q54 46 32 46 Q10 46 10 26Z', '#eaf6fd') +
    F('M12 29 L52 29 Q51 43 32 44 Q13 43 12 29Z', '#6b3a1e', 0.9) +
    extra;

// une étoile de badiane
const star = (x, y, r = 7) => {
    const pts = [];
    for (let i = 0; i < 16; i++) {
        const a = (i * Math.PI) / 8 - Math.PI / 2,
            rr = i % 2 ? r * 0.45 : r;
        pts.push(`${(x + Math.cos(a) * rr).toFixed(1)} ${(y + Math.sin(a) * rr).toFixed(1)}`);
    }
    return P(`M${pts.join(' L')}Z`, '#8a4a22', 1.6) + FC(x, y, 1.6, '#d9a066');
};

const DRINKS = () => ({
    // ---- thés ----
    blackTea: tea('#b04e1c', P('M44 20 Q52 12 56 18 Q50 24 44 20Z', '#5a7a2e', 1.4) + L('M46 20 Q51 17 54 17', 0.8, '#3f8f2e')),
    whiteTea: tea('#f5ebb0', P('M46 22 Q48 10 54 8 Q56 16 50 22Z', '#fffaf0', 1.5) + L('M50 21 L51 12', 0.8, '#b9c78a')),
    lemonTea: tea('#f0c040', slice(50, 18, '#e8b020', '#fff3a0')),
    orangeTea: tea('#e8913a', slice(50, 18, '#e87a1a', '#ffd48a')),
    raspberryTea: tea('#e8648a', sub('raspberry', 42, 4, 20)),
    apricotTea: tea('#f2a54a', sub('apricot', 42, 4, 20)),
    blueberryTea: tea('#7a6ac8', sub('blueberry', 42, 4, 20)),
    redInfusion: tea('#c8283e', sub('strawberry', 36, 2, 18) + sub('raspberry', 46, 8, 16)),
    tiareTea: tea('#f2dc9a', sub('tiare', 42, 2, 22)),
    lycheeTea: tea('#f4d9c6', sub('lychee', 42, 4, 20)),
    matchaLatte: bowl(
        '#86b948',
        E(32, 24, 11, 2.6, '#c7e08a', 0, 0) + FE(26, 23.5, 5, 1.2, '#fff', 0.6),
        // le fouet de bambou, posé contre le bol
        L('M50 52 L58 24', 5) +
            L('M50 52 L58 24', 2.4, '#e8c38c') +
            P('M54 24 L62 24 L63 14 Q58 8 53 14Z', '#f3dcae', 1.6) +
            L('M56 24 L55 14 M59 24 L59 12 M62 24 L62.5 14', 0.8, '#b8956a'),
    ),
    chai: mug('#c98f56', FE(29, 18, 8, 1.8, '#f3d9a6', 0.8) + star(29, 17, 6), L('M2 52 L20 40', 3.6) + L('M2 52 L20 40', 1.8, '#8a4a22'), '#e8a23a'),
    // ---- cafés ----
    espresso: espresso('#3a1f10'),
    cappuccino: mug(
        '#a0673a',
        P('M14 17 Q16 8 29 8 Q42 8 44 17 Q29 22 14 17Z', '#fffaf0', 1.8) +
            P('M29 17 Q23 11 25.5 9.5 Q28 9 29 11.5 Q30 9 32.5 9.5 Q35 11 29 17Z', '#a0673a', 0.6),
        '',
        '#e8c38c',
    ),
    viennois: glassMug('#4a2a14', cream(29, 14) + FC(24, 5, 0.9, '#6b3a1e') + FC(33, 3.4, 0.9, '#6b3a1e')),
    mocha: mug('#3b1f12', cream(29, 17, 10) + R(33, 1, 9, 6, 1.4, '#5a2f18', 1.6) + L('M35.5 2.4 L35.5 6 M39 2.4 L39 6', 0.7, '#8a5a33'), '', '#8a5230'),
    icedCaramel: (() => {
        const g = 'M15 10 L49 10 L45 58 Q45 60 43 60 L21 60 Q19 60 19 58Z';
        return (
            SHADOW(32, 61, 14, 2.6) +
            P(g, '#eaf6fd') +
            F('M16.6 36 L47.4 36 L44.2 57 Q44 58.6 42.5 58.6 L21.5 58.6 Q20 58.6 19.8 57Z', '#3b1f12') +
            F('M16.2 22 L47.8 22 L47.4 36 L16.6 36Z', '#d7a971') +
            F('M16 14 L48 14 L47.8 22 L16.2 22Z', '#fff8e6') +
            L('M20 18 Q26 25 32 19 Q38 26 44 19', 2.2, '#c46a1c') +
            R(23, 40, 7, 7, 1.6, '#ffffff', 1.4) +
            R(33, 47, 7, 7, 1.6, '#ffffff', 1.4) +
            L('M37 14 L44 -2', 3.2) +
            L('M37 14 L44 -2', 1.6, '#e8364b') +
            F('M19 14 L22 13 L24 55 L22 56Z', '#fff', 0.45) +
            P(g, 'none')
        );
    })(),
    barleyCoffee: espresso('#6a3d1e', sub('barley', 42, 4, 22)),
    barleyLatte: bowl('#c89b6a', P('M32 28 Q26 22 28.5 20.5 Q31 20 32 22.5 Q33 20 35.5 20.5 Q38 22 32 28Z', '#fffaf0', 0), sub('barley', 44, 2, 22)),
    hazelnutCoffee: mug(
        '#a0673a',
        P('M14 17 Q16 9 29 9 Q42 9 44 17 Q29 22 14 17Z', '#fffaf0', 1.8),
        sub('hazelnut', 38, 38, 20) + sub('hazelnut', 46, 44, 16),
        '#d9b07a',
    ),
    vanillaLatte: mug(
        '#c89b6a',
        P('M14 17 Q16 9 29 9 Q42 9 44 17 Q29 22 14 17Z', '#fffaf0', 1.8) + L('M24 14 Q29 11 34 14', 1, '#c89b6a'),
        L('M4 50 L22 34', 3.6) + L('M4 50 L22 34', 1.8, '#3a2618') + L('M7 53 L25 37', 3.6) + L('M7 53 L25 37', 1.8, '#4a2e1a'),
        '#f6e5a8',
    ),
    affogato: coupe(
        // la boule de vanille et le café versé dessus
        C(32, 24, 12, '#fff6d8', 2) +
            P('M22 26 Q24 36 27 30 Q29 40 32 31 Q35 40 37 30 Q40 36 42 26Z', '#6b3a1e', 1.8) +
            FE(27, 20, 3, 2, '#fff', 0.8) +
            P('M44 12 L52 20 L48 24 L42 18Z', '#e8c38c', 1.6) +
            L('M44 14 L48 18', 0.8, '#b8956a'),
    ),
    coconutCoffee:
        SHADOW(32, 59, 22, 3) +
        P('M10 32 Q10 58 32 58 Q54 58 54 32Z', '#8b5a2b') +
        L('M14 42 Q20 46 24 42 M34 50 Q38 54 42 50', 1.2, '#5e3a1e') +
        E(32, 32, 22, 6, '#fff6e0') +
        E(32, 32, 22, 6, 'none', 0, 3) +
        E(32, 32.5, 15, 3.4, '#8a5a33', 0, 1.2) +
        P('M26 32 Q32 28 38 32 Q32 35 26 32Z', '#fffaf0', 0) +
        L('M38 30 L46 6', 3.2) +
        L('M38 30 L46 6', 1.6, '#c08b52') +
        steamS,
    islandCoffee: glassMug(
        '#3b1f12',
        P('M12 14 L46 14 Q44 22 29 22 Q14 22 12 14Z', '#fffdf3', 2) + slice(16, 12, '#4caf50', '#e8f8c8'),
        L('M40 12 L52 -2', 1.8, '#c08b52') + P('M42 4 Q52 -6 62 4 Q54 2 52 6 Q48 2 42 4Z', '#e8364b', 1.6),
    ),
    chestnutCoffee: mug(
        '#a0673a',
        P('M14 17 Q16 9 29 9 Q42 9 44 17 Q29 22 14 17Z', '#d9b88a', 1.8) + L('M18 14 Q24 9 29 13 Q34 8 40 14', 1.4, '#8a5a33') + sub('chestnut', 21, -6, 17),
        '',
        '#c4693a',
    ),
});

let drinks = null;
Object.keys(DRINKS()).forEach(k => (items[k] = () => (drinks = drinks || DRINKS())[k]));

export { tea, slice, espresso, mug, glassMug };
