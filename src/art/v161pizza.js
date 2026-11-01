// 1.61 : la pizzeria (un four à bois en briques) et ses pizzas ; la pizza du four à pain devient la margherita.
// Les pizzas sont vues un peu de biais, sur une planche : croûte gonflée et piquée de brun, sauce, fromage fondu, parts découpées.
import { E, F, FC, FE, HL, L, P, R, SHADOW, items, machines } from './kit.js';

const CX = 32,
    CY = 35;
// un point de la pizza (u, v entre -1 et 1) en perspective
const at = (u, v) => [CX + u * 21, CY + v * 12.5];
// un contour un peu irrégulier, comme une sauce étalée à la louche
const wobbly = (rx, ry, amp, seed) => {
    let d = '';
    for (let k = 0; k <= 36; k++) {
        const a = (k / 36) * Math.PI * 2,
            r = 1 + amp * Math.sin(a * 5 + seed) * 0.5 + amp * Math.sin(a * 3 + seed * 2) * 0.5;
        d += `${k ? 'L' : 'M'}${(CX + Math.cos(a) * rx * r).toFixed(1)} ${(CY + Math.sin(a) * ry * r).toFixed(1)} `;
    }
    return d + 'Z';
};
// la planche, la croûte, la sauce et les traits de découpe ; puis les garnitures
const pie = (sauce, toppings, cheese = '#fbe9b4') =>
    SHADOW(32, 55, 29, 3.5) +
    // la planche de bois, juste un liseré sous la pizza
    FE(32, 39.5, 30.5, 17.5, '#d9a868', 1) +
    FE(32, 40.5, 30.5, 17.5, '#b8844a', 0.5) +
    L('M4 40 Q32 56 60 40', 1, '#b8844a') +
    // la croûte : le bord gonflé, doré, piqué de brun
    FE(CX, CY + 1.8, 28, 16.6, '#b06a22', 1) +
    E(CX, CY, 28, 16.6, '#eab25a', 0, 2.2) +
    [
        [-0.96, -0.15],
        [-0.72, -0.8],
        [0.05, -1.02],
        [0.72, -0.78],
        [0.98, 0.1],
        [0.68, 0.84],
        [-0.15, 1.03],
        [-0.82, 0.68],
    ]
        .map(([u, v], k) => FE(CX + u * 25.8, CY + v * 15.1, 3, 1.5, k % 2 ? '#c8822f' : '#f6cf84', 0.85, u * 40))
        .join('') +
    FC(CX - 24, CY - 4, 0.9, '#7a3e14') +
    FC(CX + 19, CY + 10, 0.9, '#7a3e14') +
    FC(CX + 7, CY - 14.5, 0.8, '#7a3e14') +
    FC(CX - 9, CY + 14.6, 0.8, '#7a3e14') +
    P(wobbly(23, 13, 0.05, 1.3), sauce, 1.4) +
    F(wobbly(18, 9.8, 0.12, 2.1), cheese, 0.8) +
    toppings +
    L(
        `M${CX - 22} ${CY} L${CX + 22} ${CY} M${CX - 12} ${CY - 11} L${CX + 12} ${CY + 11} M${CX + 12} ${CY - 11} L${CX - 12} ${CY + 11}`,
        0.7,
        'rgba(90,40,10,.22)',
    ) +
    HL(CX - 13, CY - 8, 6, 1.5, -10, 0.45);
const TOM = '#d63c2a',
    CREAM = '#f7ecd2';
// garnitures, toutes aplaties par la perspective
const melt = (list, f = '#fff6d6') =>
    list
        .map(([u, v, s = 1]) => {
            const [x, y] = at(u, v);
            return (
                P(
                    `M${x - 4.6 * s} ${y} Q${x - 4 * s} ${y - 3.2 * s} ${x} ${y - 2.8 * s} Q${x + 4.8 * s} ${y - 2.6 * s} ${x + 4.4 * s} ${y + 0.4 * s} Q${x + 3 * s} ${y + 2.8 * s} ${x - 0.6 * s} ${y + 2.4 * s} Q${x - 4.6 * s} ${y + 2.2 * s} ${x - 4.6 * s} ${y}Z`,
                    f,
                    1.1,
                ) + FE(x - 1.2 * s, y - 1.2 * s, 1.6 * s, 0.7 * s, '#fff', 0.8)
            );
        })
        .join('');
const leafs = (list, c = '#3f9a3a') =>
    list
        .map(([u, v, a = 0]) => {
            const [x, y] = at(u, v);
            return (
                `<g transform="rotate(${a} ${x} ${y})">` +
                P(`M${x - 3.2} ${y} Q${x} ${y - 2.6} ${x + 3.2} ${y} Q${x} ${y + 2.2} ${x - 3.2} ${y}Z`, c, 1) +
                L(`M${x - 2.4} ${y} L${x + 2.4} ${y}`, 0.6, '#2a6a26') +
                `</g>`
            );
        })
        .join('');
const each = (list, fn) => list.map(([u, v, a]) => fn(...at(u, v), a || 0)).join('');
// tranche de jambon, champignon, olive, rondelle de chèvre, ananas, lardon, poivron, pomme de terre
const ham = (x, y, a) =>
    `<g transform="rotate(${a} ${x} ${y})">` +
    P(`M${x - 4.2} ${y - 2} Q${x} ${y - 3.6} ${x + 4.2} ${y - 2} L${x + 3.6} ${y + 2.2} Q${x} ${y + 3.2} ${x - 3.8} ${y + 2.2}Z`, '#ee9aa0', 1.1) +
    L(`M${x - 2.6} ${y - 0.4} Q${x} ${y - 1.4} ${x + 2.6} ${y - 0.4}`, 0.7, '#fbd2d4') +
    `</g>`;
const mush = (x, y) =>
    P(`M${x - 3.4} ${y + 0.6} Q${x - 3.2} ${y - 3.2} ${x} ${y - 3.2} Q${x + 3.2} ${y - 3.2} ${x + 3.4} ${y + 0.6}Z`, '#d9c3a0', 1) +
    R(x - 1, y + 0.4, 2, 2.2, 0.6, '#efe2c8', 0.8) +
    L(`M${x - 2.2} ${y - 0.6} L${x + 2.2} ${y - 0.6}`, 0.6, '#a68a62');
const olive = (x, y) => E(x, y, 2.2, 1.6, '#2d2620', 0, 1) + FE(x, y, 0.9, 0.6, '#6a5a4a', 1);
const goat = (x, y) => E(x, y, 4.2, 2.8, '#fbfbf2', 0, 1.1) + FE(x, y, 2.6, 1.6, '#e9e4d2', 1) + FE(x - 1.2, y - 0.8, 1.2, 0.5, '#fff', 0.9);
const pine = (x, y, a) =>
    `<g transform="rotate(${a} ${x} ${y})">` +
    P(`M${x - 3.6} ${y + 1.6} L${x} ${y - 2.4} L${x + 3.6} ${y + 1.6}Z`, '#ffd23f', 1.1) +
    L(`M${x - 1.6} ${y + 0.6} L${x + 1.6} ${y + 0.6}`, 0.7, '#e0a020') +
    `</g>`;
const lard = (x, y, a) =>
    `<g transform="rotate(${a} ${x} ${y})">` +
    R(x - 2, y - 1.3, 4, 2.6, 0.6, '#c8504a', 0.9) +
    F(`M${x - 2} ${y - 0.2} L${x + 2} ${y - 0.2}`, 'none') +
    R(x - 2, y - 0.3, 4, 0.8, 0.3, '#f6d7c8', 0) +
    `</g>`;
const ring = (x, y, c, a) =>
    `<g transform="rotate(${a} ${x} ${y})">` +
    L(`M${x - 3.6} ${y + 1} Q${x} ${y - 3} ${x + 3.6} ${y + 1}`, 2.6, '#3a2618') +
    L(`M${x - 3.6} ${y + 1} Q${x} ${y - 3} ${x + 3.6} ${y + 1}`, 1.6, c) +
    `</g>`;
const potato = (x, y) => E(x, y, 3.8, 2.6, '#f2cf6a', 0, 1.1) + FE(x - 1, y - 0.7, 1.4, 0.6, '#fff4c0', 0.9);

// la margherita : tomate, mozzarella fondue, basilic
items.pizza = () =>
    pie(
        TOM,
        melt([
            [-0.5, -0.35],
            [0.35, -0.45],
            [0.05, 0.3],
            [0.6, 0.35],
            [-0.55, 0.4, 0.85],
        ]) +
            leafs([
                [-0.15, -0.1, -20],
                [0.55, -0.05, 25],
                [-0.35, 0.65, 10],
            ]),
        '#f3a39a',
    );

// la quatre fromages : sauce crème, quatre fromages qui fondent (mozzarella, bleu, chèvre, comté)
items.pizzaFourCheese = () =>
    pie(
        CREAM,
        melt(
            [
                [-0.5, -0.35],
                [0.4, 0.4],
            ],
            '#fff8e2',
        ) +
            melt(
                [
                    [0.35, -0.4],
                    [-0.4, 0.45, 0.9],
                ],
                '#f2d27a',
            ) +
            melt([[0.05, 0.02, 0.9]], '#eef1f2') +
            spots([
                [0.0, -0.05],
                [0.12, 0.08],
                [-0.08, 0.1],
                [0.05, -0.12],
            ]) +
            each(
                [
                    [-0.75, 0.05],
                    [0.72, -0.05],
                ],
                (x, y) => goat(x, y),
            ),
        '#fdf0c8',
    );
const spots = list => each(list, (x, y) => FC(x, y, 0.8, '#3d6f98', 0.9));

// la chèvre-miel : rondelles de chèvre dorées, filets de miel, cerneaux de noix, un brin de thym
items.pizzaGoatHoney = () =>
    pie(
        CREAM,
        each(
            [
                [-0.55, -0.3],
                [0.25, -0.5],
                [0.65, 0.15],
                [0.0, 0.25],
                [-0.5, 0.55],
                [0.4, 0.65],
            ],
            (x, y) => goat(x, y),
        ) +
            L('M14 33 Q22 29 30 34 Q38 39 47 33 M18 41 Q27 38 34 42 Q40 45 46 41', 1.6, '#e8a21a') +
            L('M14 33 Q22 29 30 34 Q38 39 47 33', 0.6, '#ffe28a') +
            each(
                [
                    [-0.15, -0.2],
                    [0.3, 0.35],
                ],
                (x, y) => E(x, y, 2, 1.4, '#8a5a2a', 0, 0.9) + L(`M${x - 1.2} ${y} L${x + 1.2} ${y}`, 0.6, '#5e3a1a'),
            ) +
            leafs([[0.75, -0.45, 30]], '#6a8a3a'),
    );

// la reine : jambon, champignons, mozzarella, origan
items.pizzaReine = () =>
    pie(
        TOM,
        melt([
            [-0.45, -0.35, 0.9],
            [0.5, 0.4, 0.9],
            [-0.1, 0.5, 0.8],
        ]) +
            each(
                [
                    [0.25, -0.4, 15],
                    [-0.6, 0.25, -10],
                    [0.6, -0.05, 30],
                ],
                ham,
            ) +
            each(
                [
                    [-0.15, -0.05],
                    [0.2, 0.15],
                    [-0.4, 0.65],
                    [0.7, 0.6],
                    [-0.75, -0.2],
                ],
                mush,
            ) +
            each(
                [
                    [0.05, -0.55],
                    [-0.25, 0.25],
                    [0.45, 0.05],
                ],
                (x, y) => FC(x, y, 0.6, '#4a7a2a'),
            ),
        '#f3a39a',
    );

// la savoyarde : crème, pommes de terre, lardons, oignons, et le reblochon fondu par-dessus
items.pizzaSavoyarde = () =>
    pie(
        CREAM,
        each(
            [
                [-0.55, -0.3],
                [0.3, -0.45],
                [0.65, 0.2],
                [-0.2, 0.55],
                [0.25, 0.6],
            ],
            potato,
        ) +
            melt(
                [
                    [-0.05, -0.05, 1.3],
                    [-0.6, 0.35, 0.9],
                ],
                '#fff2c8',
            ) +
            each(
                [
                    [0.0, -0.6, 10],
                    [0.55, -0.15, -20],
                    [-0.35, 0.1, 30],
                    [0.45, 0.45, 0],
                    [-0.75, -0.05, 15],
                    [0.15, 0.25, -30],
                ],
                lard,
            ) +
            each(
                [
                    [0.75, -0.4, 20],
                    [-0.3, -0.55, -15],
                ],
                (x, y, a) => ring(x, y, '#e8d4f0', a),
            ),
        '#fff5d8',
    );

// la végétarienne : poivrons rouges et jaunes, courgette, olives noires, oignon rouge
items.pizzaVeggie = () =>
    pie(
        TOM,
        melt([
            [-0.4, 0.3, 0.8],
            [0.45, -0.3, 0.8],
        ]) +
            each(
                [
                    [-0.5, -0.35, -20],
                    [0.6, 0.35, 15],
                ],
                (x, y, a) => ring(x, y, '#e8364b', a),
            ) +
            each(
                [
                    [0.05, 0.55, 0],
                    [-0.05, -0.55, 160],
                ],
                (x, y, a) => ring(x, y, '#ffd23f', a),
            ) +
            each(
                [
                    [0.1, 0.0],
                    [-0.65, 0.05],
                    [0.7, -0.1],
                ],
                (x, y) => E(x, y, 3.2, 2.2, '#8cc63f', 0, 1) + FE(x, y, 1.9, 1.2, '#e6f4c8', 1),
            ) +
            each(
                [
                    [-0.2, 0.25],
                    [0.35, 0.15],
                    [0.25, -0.6],
                    [-0.35, -0.65],
                ],
                olive,
            ) +
            each(
                [
                    [0.4, 0.65, 30],
                    [-0.6, 0.6, -20],
                ],
                (x, y, a) => ring(x, y, '#b0508a', a),
            ),
        '#f3a39a',
    );

// l'hawaïenne : ananas et jambon sur mozzarella
items.pizzaHawaii = () =>
    pie(
        TOM,
        melt([
            [-0.35, 0.0, 0.9],
            [0.45, 0.35, 0.9],
        ]) +
            each(
                [
                    [0.3, -0.45, -10],
                    [-0.6, 0.4, 20],
                    [0.7, -0.05, 40],
                    [-0.1, 0.6, -20],
                ],
                ham,
            ) +
            each(
                [
                    [-0.4, -0.5, 0],
                    [0.05, -0.05, 30],
                    [0.25, 0.55, -20],
                    [-0.75, -0.05, 15],
                    [0.65, 0.5, 0],
                    [0.55, -0.6, 200],
                ],
                pine,
            ),
        '#f3a39a',
    );

// la calzone : la pizza pliée en chausson, dorée, un peu de sauce qui s'échappe
items.calzone = () =>
    SHADOW(32, 56, 27, 3) +
    P('M6 46 Q8 18 32 14 Q56 18 58 46 Q32 54 6 46Z', '#e3ad57', 2.4) +
    L('M8 45 Q32 52 56 45', 3.2, '#c98a3a') +
    L('M10 44 l3 3 M16 46 l3 3 M22 47.5 l3 3 M28 48.5 l3 3 M34 48.5 l3 3 M40 47.5 l3 3 M46 46 l3 3 M52 44 l3 3', 1.2, '#a06a2a') +
    F('M44 47 Q48 52 52 49 Q49 46 47 46Z', '#d9412f') +
    FC(22, 28, 1.4, '#a06a2a') +
    FC(36, 24, 1.2, '#a06a2a') +
    FC(44, 34, 1.3, '#a06a2a') +
    FE(30, 34, 2.4, 1.4, '#4caf50', 1, -20) +
    HL(22, 24, 6, 2, -25, 0.45);

// le four à bois : une voûte de briques, la bouche où brûle le feu, la pelle avec sa pizza, une petite enseigne
machines.pizzeria = () =>
    SHADOW(32, 61, 29, 3) +
    R(4, 48, 56, 11, 2, '#8a5a3a', 2.2) +
    L('M4 53.5 L60 53.5 M18 48 L18 53.5 M32 53.5 L32 59 M46 48 L46 53.5', 1, '#5e3a24') +
    P('M8 49 Q8 16 32 14 Q56 16 56 49Z', '#c0563a', 2.6) +
    L(
        'M12 40 L52 40 M10 31 L54 31 M14 23 L50 23 M20 40 L20 49 M32 40 L32 49 M44 40 L44 49 M26 31 L26 40 M38 31 L38 40 M18 23 L18 31 M32 23 L32 31 M46 23 L46 31',
        1,
        '#8a3424',
    ) +
    P('M21 49 Q21 33 32 33 Q43 33 43 49Z', '#2a1a10', 2.2) +
    P('M24 49 Q27 41 30 44 Q32 37 35 44 Q38 41 40 49Z', '#ffa630', 1.2) +
    F('M28 49 Q30 45 32 47 Q34 44 36 49Z', '#ffd23f') +
    R(41, 6, 8, 14, 1.5, '#8a3424', 1.8) +
    L('M45 6 Q42 2 46 -1', 1.6, 'rgba(255,255,255,.8)') +
    L('M54 58 L40 46', 2.4, '#8a5a2a') +
    E(36, 44, 8, 3, '#d8b080', -40, 1.6) +
    FC(36, 44, 4.2, '#d9412f', 0.9) +
    FC(34.5, 43, 1.2, '#fff3c4') +
    FC(37.5, 45, 1.2, '#fff3c4') +
    R(13, 8, 18, 7, 1.5, '#fff3dc', 1.6) +
    L('M16 11.5 L28 11.5', 1.4, '#4caf50') +
    FC(22, 11.5, 1.4, '#d9412f') +
    HL(18, 24, 3, 7, 20, 0.3);
