// Le Comptoir (1.17) : thés et cafés préparés au doigt, clients du village, salon à agrandir.
// Remplace le salon de thé et la brûlerie. Les produits gardent leurs identifiants : commandes, train et quêtes ne changent pas.

// Les gestes de chaque boisson. Étapes :
//   grind   : la mouture, au rythme (beats coups, tol = marge d'erreur en pixels)
//   extract : verser en maintenant le doigt, lâcher sur le trait (t = niveau visé de 0 à 1, w = tolérance)
//   pour    : comme extract, mais pour le lait, la crème ou le chocolat (c = couleur)
//   foam    : tracer un cœur dans la mousse
//   temp    : chauffer l'eau en maintenant le doigt (t = degrés visés, w = tolérance)
//   steep   : retirer le sachet quand la barre est dans le vert (dur = secondes, a-b = la fenêtre)
//   whisk   : fouetter en tournant le doigt (turns tours en dur secondes)
const MILK = '#f3e2c4';
const CREAM = '#fffdf3';
const COFFEE = '#4a2a14';
const grind = (beats = 4, tol = 44) => ['grind', { beats, tol }];
const extract = (t, w = 0.045, c = COFFEE) => ['extract', { t, w, c }];
const pour = (t, c, label, w = 0.06) => ['pour', { t, c, label, w }];
const temp = (t, w = 4) => ['temp', { t, w }];
const steep = (a, b, dur = 6) => ['steep', { a, b, dur }];
// 1.43 : cinq gestes de plus, pour que chaque boisson ait sa façon de se préparer
//   squeeze : presser un agrume en tapotant (n appuis en dur secondes)
//   stir    : remuer turns tours sans dépasser une vitesse
//   shake   : secouer le shaker (n allers-retours en dur secondes)
//   ice     : attraper n glaçons qui tombent
//   drop    : doser une goutte (t visé, w tolérance), ça coule vite
//   foam    : shape = heart, leaf ou tulip (motif à tracer, en dur secondes)
const squeeze = (label, c, n = 20, dur = 4) => ['squeeze', { label, c, n, dur }];
const stir = (turns = 3, c, dur = 8) => ['stir', { turns, c, dur, max: 9 }];
const shake = (n = 6, dur = 5) => ['shake', { n, dur }];
const ice = (n = 4, speed = 120) => ['ice', { n, speed, every: 650 }];
const drop = (label, c, t = 0.3, w = 0.07) => ['drop', { label, c, t, w }];
const foam = shape => ['foam', { shape, dur: 12 }];

export const BREW = {
    // ---- thés et infusions déjà au jeu ----
    greenTea: { col: '#b9cc5a', st: [temp(80), steep(0.4, 0.62)] },
    sobacha: { col: '#c98a45', st: [temp(98, 5), steep(0.5, 0.75)] },
    milkTea: { col: '#d9a066', st: [temp(90), steep(0.45, 0.65), pour(0.78, MILK, 'le lait'), stir(2, '#d9a066')] },
    lavenderTea: { col: '#b79ad8', st: [temp(85), steep(0.5, 0.72), drop('le miel', '#e8b04a')] },
    icedTea: { col: '#f2a54a', st: [temp(95), steep(0.5, 0.7), ice(4), pour(0.82, '#f2a54a', 'le thé sur les glaçons')] },
    gingerTea: { col: '#e0a03a', st: [temp(95), steep(0.55, 0.8, 7), squeeze('le citron', '#f4d03f')] },
    genepiTea: { col: '#9fc06a', st: [temp(90), steep(0.4, 0.6), drop('le génépi', '#b9d96a', 0.25)] },
    // ---- thés et infusions nouveaux ----
    blackTea: { col: '#b04e1c', st: [temp(95), steep(0.62, 0.82, 7)] },
    whiteTea: { col: '#f5ebb0', st: [temp(75, 2.5), steep(0.7, 0.82, 8)] },
    lemonTea: { col: '#f0c040', st: [temp(90), steep(0.45, 0.65), squeeze('le citron', '#f4d03f')] },
    mintTea: { col: '#8fd16a', st: [temp(80), steep(0.4, 0.6), stir(3, '#8fd16a')] },
    orangeTea: { col: '#e8913a', st: [temp(90), steep(0.45, 0.65), squeeze('l’orange', '#f39c33', 22)] },
    raspberryTea: { col: '#e8648a', st: [temp(85), steep(0.4, 0.6), drop('le sucre', '#fff6e0', 0.25)] },
    apricotTea: { col: '#f2a54a', st: [temp(85), steep(0.45, 0.65), drop('le sucre', '#fff6e0', 0.25)] },
    blueberryTea: { col: '#7a6ac8', st: [temp(85), steep(0.45, 0.65), drop('le miel', '#e8b04a')] },
    redInfusion: { col: '#c8283e', st: [temp(95), steep(0.5, 0.7), stir(3, '#c8283e')] },
    tiareTea: { col: '#f2dc9a', st: [temp(80), steep(0.45, 0.62)] },
    lycheeTea: { col: '#f4d9c6', st: [temp(85), steep(0.45, 0.65), ice(3)] },
    matchaLatte: { col: '#86b948', st: [temp(80, 3.5), ['whisk', { turns: 5, dur: 7 }], pour(0.8, MILK, 'le lait')] },
    chai: { col: '#c98f56', st: [temp(95), steep(0.55, 0.75, 7), drop('les épices', '#a0522d', 0.35), pour(0.8, MILK, 'le lait')] },
    barleyCoffee: { col: '#6a3d1e', st: [temp(95), steep(0.55, 0.78), stir(2, '#6a3d1e')] },
    barleyLatte: { col: '#c89b6a', st: [temp(95), steep(0.55, 0.78), pour(0.8, MILK, 'le lait'), stir(2, '#c89b6a')] },
    // ---- 1.34 : sept boissons de plus ----
    chicoryCoffee: { col: '#5a3a22', st: [temp(95), stir(3, '#5a3a22')] },
    mandarinTea: { col: '#f09a3a', st: [temp(90), steep(0.45, 0.65), squeeze('la mandarine', '#f09a3a')] },
    hempTisane: { col: '#9ab25a', st: [temp(90), steep(0.45, 0.68), stir(2, '#9ab25a')] },
    hibiscusTea: { col: '#c8283e', st: [temp(95), steep(0.5, 0.7), ice(4)] },
    macchiato: { col: '#8a5a33', st: [grind(4, 38), extract(0.32, 0.04), pour(0.5, CREAM, 'une touche de mousse', 0.05)] },
    frappe: { col: '#b88858', st: [grind(4, 44), extract(0.4), ice(4), shake(6)] },
    spicedCoffee: { col: '#6a3a1e', st: [grind(4, 40), extract(0.35), drop('les épices', '#a0522d', 0.3), pour(0.75, CREAM, 'la crème')] },
    // ---- cafés ----
    espresso: { col: '#3a1f10', st: [grind(5, 34), extract(0.3, 0.035, '#3a1f10')] },
    cafeLatte: { col: '#c08b52', st: [grind(4, 40), extract(0.3), pour(0.8, MILK, 'le lait')] },
    cappuccino: { col: '#a0673a', st: [grind(4, 40), extract(0.3), foam('heart')] },
    viennois: { col: '#4a2a14', st: [grind(4, 40), extract(0.45), pour(0.82, CREAM, 'la crème')] },
    mocha: { col: '#3b1f12', st: [grind(4, 40), extract(0.35), pour(0.75, '#3b1f12', 'le chocolat'), stir(2, '#3b1f12')] },
    icedCaramel: { col: '#3b1f12', st: [grind(4, 44), extract(0.4), ice(4), pour(0.8, '#d7a971', 'le lait et le caramel')] },
    hazelnutCoffee: { col: '#a0673a', st: [grind(4, 40), extract(0.35), drop('le sirop de noisette', '#a0673a'), foam('leaf')] },
    vanillaLatte: { col: '#c89b6a', st: [grind(4, 42), extract(0.3), drop('la vanille', '#f3e2a0', 0.22), pour(0.8, MILK, 'le lait vanillé')] },
    affogato: { col: '#6b3a1e', st: [grind(4, 44), extract(0.3, 0.04)] },
    coconutCoffee: { col: '#8a5a33', st: [grind(4, 42), extract(0.4), shake(5), pour(0.8, '#fff6e0', 'le lait de coco')] },
    islandCoffee: { col: '#3b1f12', st: [grind(4, 40), extract(0.35), drop('le rhum', '#b8642a', 0.25), pour(0.75, CREAM, 'la crème')] },
    chestnutCoffee: { col: '#a0673a', st: [grind(4, 40), extract(0.35), foam('tulip')] },
};

// Les nouveaux produits (les autres existent déjà dans items.js) : nom, recette, niveau, durée de référence
export const NEW_DRINKS = [
    // id, nom, ingrédients, niveau, durée (s), sur l'île ?, après la brûlerie ?
    ['blackTea', 'Thé noir', { tea: 2 }, 33, 150],
    ['orangeTea', 'Thé à l’orange', { tea: 1, orange: 1, honey: 1 }, 33, 180],
    ['raspberryTea', 'Thé framboise', { tea: 1, raspberry: 1, sugar: 1 }, 33, 180],
    ['lemonTea', 'Thé citron', { tea: 1, lemon: 1, sugar: 1 }, 34, 180],
    ['mintTea', 'Thé à la menthe', { tea: 1, mint: 2 }, 34, 180],
    ['apricotTea', 'Thé abricot', { tea: 1, apricot: 1, sugar: 1 }, 34, 180],
    ['blueberryTea', 'Thé myrtille', { tea: 1, blueberry: 1, honey: 1 }, 35, 180],
    ['redInfusion', 'Infusion fruits rouges', { raspberry: 1, strawberry: 1, blueberry: 1 }, 35, 200],
    ['whiteTea', 'Thé blanc', { tea: 2, honey: 1 }, 36, 220],
    ['barleyCoffee', 'Café d’orge', { barley: 3 }, 36, 120],
    ['barleyLatte', 'Café d’orge au lait', { barley: 2, milk: 2 }, 37, 180],
    ['matchaLatte', 'Matcha latte', { tea: 2, milk: 1, sugar: 1 }, 38, 240],
    ['tiareTea', 'Thé au tiaré', { tea: 1, tiare: 1, honey: 1 }, 41, 200, 'island'],
    ['lycheeTea', 'Thé litchi', { tea: 1, lychee: 1, sugar: 1 }, 42, 200, 'island'],
    ['chai', 'Chaï latte', { tea: 1, milk: 1, ginger: 1, honey: 1 }, 46, 260, 'island'],
    ['espresso', 'Expresso', { greenCoffee: 2 }, 40, 150, 'coffee'],
    ['cappuccino', 'Cappuccino', { coffee: 1, milk: 1, cream: 1 }, 42, 240, 'coffee'],
    ['hazelnutCoffee', 'Café noisette', { coffee: 1, hazelnut: 1, milk: 1 }, 43, 240, 'coffee'],
    ['vanillaLatte', 'Latte vanille', { coffee: 1, milk: 1, vanilla: 1 }, 43, 240, 'coffee'],
    ['viennois', 'Café viennois', { coffee: 1, cream: 2 }, 44, 260, 'coffee'],
    ['coconutCoffee', 'Café coco', { coffee: 1, coconutMilk: 1 }, 44, 240, 'coffee'],
    ['affogato', 'Affogato', { coffee: 1, vanillaIce: 1 }, 45, 260, 'coffee'],
    ['mocha', 'Moka', { coffee: 1, milk: 1, darkChoc: 1 }, 46, 280, 'coffee'],
    ['islandCoffee', 'Café des îles', { coffee: 1, rum: 1, cream: 1 }, 46, 300, 'coffee'],
    ['chestnutCoffee', 'Café marron', { coffee: 1, chestnutCream: 1, cream: 1 }, 47, 300, 'coffee'],
    ['icedCaramel', 'Café glacé caramel', { coffee: 1, milk: 1, caramel: 1 }, 49, 300, 'coffee'],
];

// 1.34 : sept boissons de plus (les cafés après la brûlerie, l'hibiscus avec l'île) ; elles dépendent des cultures des 1.30 à 1.32
export const NEW_DRINKS_134 = [
    ['hempTisane', 'Tisane de chanvre', { hemp: 2, honey: 1 }, 33, 180],
    ['mandarinTea', 'Thé à la mandarine', { tea: 1, mandarin: 1, honey: 1 }, 34, 180],
    ['chicoryCoffee', 'Café de chicorée', { chicory: 3 }, 37, 120],
    ['macchiato', 'Macchiato', { coffee: 1, milk: 1 }, 43, 240, 'coffee'],
    ['frappe', 'Café frappé', { coffee: 1, milk: 1, sugar: 1 }, 45, 260, 'coffee'],
    ['spicedCoffee', 'Café épicé', { coffee: 1, ginger: 1, honey: 1 }, 47, 280, 'coffee'],
    ['hibiscusTea', 'Thé à l’hibiscus', { hibiscus: 2, honey: 1 }, 47, 200, 'island'],
];

// Les produits existants qui passent du salon de thé et de la brûlerie au comptoir
export const OLD_DRINKS = ['greenTea', 'sobacha', 'milkTea', 'lavenderTea', 'icedTea', 'gingerTea', 'genepiTea', 'cafeLatte'];
export const COFFEE_GATED = ['coffee', 'cafeLatte', 'tiramisu'];

// La qualité du jeu (normale, argent, or) devient les étoiles du comptoir
export const STAR_TIER = [0, 1, 2];
// Un client paie plus que le marché, un peu plus encore avec une bonne note et avec l'amitié
export const CLIENT = {
    premium: 1.2,
    star: [1, 1.1, 1.25, 1.4, 1.6],
    heart: 0.03,
    patience: 150, // secondes, comptées seulement quand le comptoir est ouvert à l'écran (1.43 : ils arrivent même ailleurs)
    daily: lvl => 8 + 4 * lvl, // clients servis par jour au plus
    tipRate: 0.1, // pourboire d'une boisson parfaite
    tipMax: 5, // par jour
};
export const BREW_COOLDOWN = 8; // secondes entre deux préparations

// Le salon : niveaux, places, arrivée des clients, décors
export const SALON = [
    { seats: 2, every: 90, cost: null },
    { seats: 3, every: 75, cost: { coins: 20000, plank: 10, paint: 2 } },
    { seats: 4, every: 60, cost: { coins: 60000, plank: 20, paint: 4 } },
    { seats: 5, every: 50, cost: { coins: 150000, plank: 30, paint: 6 } },
];
export const DECORS = {
    plant: 'Plantes',
    lamp: 'Lanternes',
    rug: 'Tapis',
    garland: 'Guirlande',
    sign: 'Enseigne',
};
export const DECOR_PATIENCE = 0.1; // par décor posé, jusqu'à trois

// Le goût de chaque villageois (sa boisson préférée) : les cœurs du jeu s'ajoutent à ceux des cadeaux
export const FAVORITE = {
    odette: 'lavenderTea',
    gaston: 'espresso',
    lucie: 'raspberryTea',
    paul: 'blackTea',
    rose: 'whiteTea',
    marcel: 'chai',
    gaspard: 'viennois',
    odile: 'apricotTea',
    jules: 'mocha',
    ines: 'greenTea',
    morgane: 'islandCoffee',
    yann: 'espresso',
    bruno: 'cappuccino',
    lea: 'blueberryTea',
    margaux: 'orangeTea',
    anselme: 'barleyCoffee',
    maeva: 'lycheeTea',
    tiago: 'cafeLatte',
    agathe: 'vanillaLatte',
    victor: 'cafeLatte',
    hugues: 'barleyLatte',
    agnes: 'milkTea',
    duval: 'viennois',
    octave: 'blackTea',
};

// le prix des décors du salon
export const DECOR_COST = { plant: 1500, lamp: 4000, rug: 9000, garland: 18000, sign: 30000 };
