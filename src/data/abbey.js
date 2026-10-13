// L'abbaye (1.6) : la brasserie où l'on compose ses propres bières, et le cellier où on les fait vieillir.
// Une bière = un malt (sa couleur), une dose de houblon (son amertume), et 1 à 3 ingrédients de la ferme, chacun dosé de 1 à 3.

export const ABBEY = {
    lvl: 35, // l'étape clé : premier chapitre de l'abbaye
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

// le cellier : des fûts pour faire vieillir ses bières, par étapes
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
