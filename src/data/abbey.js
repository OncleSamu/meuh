// L'abbaye (1.6) : la brasserie où l'on compose ses propres bières. Depuis 1.6.3, elles vieillissent en fût à la cave.
// Une bière = un malt (sa couleur), une dose de houblon (son amertume), et 1 à 3 ingrédients de la ferme, chacun dosé de 1 à 3.

import { lv80 } from './lv80.js';
export const ABBEY = {
    lvl: lv80(35), // l'étape clé : premier chapitre de l'abbaye
    maltPerBrew: 4, // sacs de malt par brassin
    hopPerDose: 2, // cônes de houblon par dose
    ingPerDose: 2, // fruits ou légumes par dose d'un ingrédient
    bottles: 6, // bouteilles par brassin
    baseTime: 600, // secondes de brassage, puis +300 par ingrédient
    perIng: 300,
    price: 1.36, // comme les recettes : 1,36 × la valeur des ingrédients
    // multiplicateur selon l'accord (0 à 3 étoiles)
    harmony: [0.75, 1.1, 1.4, 1.75],
    vats: { brewhall: 2, fermenters: 1, beerfest: 1 }, // cuves offertes par chantier
    slots: { brewhall: 1, fermenters: 2, labelshop: 3 }, // ingrédients permis selon le dernier chantier fini
};

// les quatre malts : leur couleur et ce qu'ils ajoutent au goût (sucré, acide, amer, épicé, umami)
export const MALTS = {
    maltBlond: { name: 'Blonde', color: '#f2c84a', taste: [1, 0, 0, 0, 0], likes: [0, 1], text: 'aime les fruits sucrés ou acidulés' },
    maltAmber: { name: 'Ambrée', color: '#d8822a', taste: [2, 0, 1, 0, 0], likes: [0], text: 'aime les fruits doux et sucrés' },
    maltBrown: { name: 'Brune', color: '#8b4a22', taste: [1, 0, 2, 0, 1], likes: [0, 3, 4], text: 'aime le sucré, l’épicé et le terreux' },
    maltBlack: { name: 'Noire', color: '#3a2018', taste: [0, 0, 3, 0, 2], likes: [2, 4], text: 'aime l’amer et le torréfié' },
};
export const MALT_IDS = Object.keys(MALTS);

export const HOP_DOSES = ['Légère', 'Moyenne', 'Forte'];

// les notes de goût, dans l'ordre des profils de la génétique
export const NOTES = ['sucré', 'acide', 'amer', 'épicé', 'umami'];
export const NOTE_COL = ['#f2a0c8', '#ffd23f', '#8b5a2b', '#e8503a', '#7a9a4a'];

// les mariages de deux notes dominantes : +1 s'ils s'accordent, -1 s'ils se battent
export const PAIRS = {
    '0-1': 1, // sucré et acide
    '0-2': 1, // sucré et amer
    '0-3': 1, // sucré et épicé
    '2-4': 1, // amer et umami
    '1-3': -1, // acide et épicé
    '1-4': -1, // acide et umami
};
// 1.48 : les grandes recettes de brasseur : ces ingrédients ensemble valent deux étoiles de plus, et ne se battent jamais
export const CLASSICS = [
    {
        id: 'witbier',
        ings: ['coriander', 'bitterOrange'],
        name: 'la bière blanche',
        text: 'Coriandre et écorce d’orange amère : la vraie recette de la bière blanche.',
    },
    {
        id: 'sahti',
        ings: ['rye', 'spruce'],
        name: 'la sahti',
        text: 'Seigle et pousses d’épicéa : la sahti, la bière de ferme des pays du Nord.',
    },
    // 1.92 : trois grandes recettes de plus (le café et le chocolat noir se brassent depuis la 1.91)
    {
        id: 'stout',
        ings: ['coffee', 'darkChoc'],
        name: 'la stout',
        text: 'Café et chocolat noir : la stout, noire, torréfiée et gourmande.',
    },
    {
        id: 'kriek',
        ings: ['cherry', 'raspberry'],
        name: 'la bière aux fruits rouges',
        text: 'Cerise et framboise : la bière rouge des brasseurs de fruits.',
    },
    {
        id: 'pumpkinAle',
        ings: ['pumpkin', 'vanilla'],
        name: 'la bière de citrouille',
        text: 'Citrouille et vanille : la bière d’automne, douce et ronde.',
    },
];

// les fûts (à la cave depuis 1.6.3) : chacun donne sa note et multiplie la valeur de la bière
// CELLAR ne sert plus qu'à vider les fûts des anciennes sauvegardes
export const BARRELS = {
    oak: { name: 'Chêne neuf', note: 'boisée', mult: 1, cost: 1500 },
    calvados: { name: 'Ancien fût de calvados', note: 'pommée', mult: 1.15, item: 'calvados' },
    rum: { name: 'Ancien fût de rhum', note: 'ambrée et vanillée', mult: 1.2, item: 'rum' },
    wine: { name: 'Ancien fût de vin', note: 'vineuse', mult: 1.25, item: 'redWine' },
};
export const CELLAR = {
    slots: 4,
    maxBottles: 12,
    steps: [2 * 3600, 4 * 3600, 8 * 3600], // durée de chaque étape, en secondes
    mult: [1, 1.3, 1.7, 2.2], // valeur selon le nombre d'étapes passées
    stepNames: ['jeune', 'élevée', 'de garde', 'grande réserve'],
    turn: 0.08, // à chaque étape, 8 % de chances qu'elle tourne
    turned: 0.6,
};

// le livre des bières : une page par ingrédient brassé ; une récompense toutes les 10 pages
export const BEER_BOOK = { every: 10, coins: 4000, rubans: 2 };

// 1.6.2 : la demande baisse quand on vend beaucoup d'une même bière, puis remonte avec le temps
export const DEMAND = { per: 0.012, floor: 0.5, half: 6 * 3600 };

// 1.6.2 : les commandes de bière (frère Hugues, Agnès et quelques habitués)
export const BEER_ORDERS = {
    max: 3,
    every: 30 * 60, // une nouvelle commande toutes les 30 minutes, s'il reste une place
    qty: [3, 6],
    pay: 1.8, // payée 1,8 fois la valeur de la bière livrée, sans baisse de la demande
    xp: 60,
    hearts: 2,
    who: ['hugues', 'agnes', 'gaston', 'marcel', 'margaux', 'tiago'],
};

// ---------------- 1.68 : l'hydromel ----------------
// Un deuxième type de boisson à la brasserie : du miel à la place du malt, pas de houblon, jusqu'à 4 ingrédients.
// La base s'écrit 'mead:<miel>' (miel : 'all' pour toutes fleurs, ou un miel de fleur) dans le champ « malt » de la recette.
export const MEAD = {
    lvl: lv80(42), // comme l'hydromel ordinaire de la brasserie artisanale
    honeyPerBrew: 6, // pots de miel par brassin
    baseTime: 900, // il fermente plus lentement : 15 min, puis +5 par ingrédient
    perIng: 300,
    maxSlots: 4,
};
// le goût de chaque miel (sucré, acide, amer, épicé, umami) et ce qu'il aime, comme les malts.
// Le toutes fleurs n'aime rien en particulier : les miels de fleurs font les grands hydromels.
const HB = (taste, likes, text) => ({ taste, likes, text });
export const MEAD_BASES = {
    all: HB([2, 0, 0, 0, 0], [], 'va avec tout, sans éclat'),
    lavender: HB([1, 1, 1, 0, 0], [1], 'aime l’acidulé : citron, fruits rouges'),
    sunflower: HB([2, 0, 0, 0, 1], [0, 4], 'aime le doux et le rond'),
    buckwheat: HB([1, 0, 2, 0, 1], [2, 3], 'aime l’amer et les épices'),
    mint: HB([1, 1, 1, 0, 0], [1], 'aime les fruits frais et acidulés'),
    raspberry: HB([2, 1, 0, 0, 0], [1], 'aime l’acidulé'),
    blueberry: HB([2, 0, 1, 0, 0], [0], 'aime les fruits bien sucrés'),
    cotton: HB([2, 0, 0, 0, 0], [0], 'aime le très doux'),
    basil: HB([1, 0, 1, 1, 0], [3, 4], 'aime l’épicé et le terreux'),
    apple: HB([2, 1, 0, 0, 0], [0], 'aime le doux des fruits du verger'),
    pear: HB([2, 1, 0, 0, 0], [0], 'aime le doux : poire, pomme, coing'),
    plum: HB([2, 0, 1, 0, 0], [0, 3], 'aime le fruité et les épices'),
    cherry: HB([2, 1, 0, 0, 0], [1], 'aime l’acidulé des fruits rouges'),
    lemon: HB([1, 2, 0, 0, 0], [0, 3], 'aime le sucré et l’épicé'),
    orange: HB([2, 1, 0, 0, 0], [3], 'aime les épices : cannelle, vanille, gingembre'),
    chestnut: HB([1, 0, 2, 0, 1], [2, 4], 'aime l’amer et le terreux : noix, cacao, champignon'),
    almond: HB([2, 0, 1, 0, 0], [0], 'aime le doux et le gourmand'),
    // 1.69 : les miels des contrées
    lychee: HB([2, 1, 0, 0, 0], [1], 'aime l’acidulé et les fleurs : framboise, citron, rose'),
    avocado: HB([1, 0, 1, 0, 2], [4, 2], 'aime le rond et le terreux : noix, cacao, champignon'),
    tiare: HB([2, 0, 0, 1, 0], [0, 3], 'aime le doux et la vanille : coco, ananas, épices'),
    argan: HB([1, 0, 1, 1, 1], [3, 4], 'aime les épices et le grillé : amande, sésame, cumin'),
    coriander: HB([1, 1, 0, 2, 0], [3, 1], 'aime l’épicé et l’agrume'),
    fir: HB([1, 0, 2, 1, 0], [2, 3], 'aime l’amer et la résine : genièvre, épicéa, airelle'),
    lingonberry: HB([1, 2, 0, 0, 0], [1, 0], 'aime l’acidulé des baies du Nord'),
};
// les grands classiques de l'hydromel : un de ces ingrédients suffit, et une étoile de plus
export const MEAD_CLASSICS = [
    { id: 'cyser', name: 'Cyser', any: ['apple'], text: 'Avec de la pomme : un cyser, l’hydromel des vergers normands.' },
    { id: 'pyment', name: 'Pyment', any: ['grape'], text: 'Avec du raisin : un pyment, l’hydromel des Romains.' },
    {
        id: 'melomel',
        name: 'Mélomel',
        any: ['raspberry', 'strawberry', 'cherry', 'blackcurrant', 'blueberry', 'blackberry', 'mulberry'],
        text: 'Avec des fruits rouges : un mélomel, rouge et fruité.',
    },
    {
        id: 'metheglin',
        name: 'Métheglin',
        any: ['mint', 'basil', 'vanilla', 'saffron', 'coriander', 'cumin', 'juniper', 'lavender', 'ginger', 'peppercorn', 'hibiscus'],
        text: 'Avec des herbes ou des épices : un métheglin, l’hydromel des moines.',
    },
];
