// 1.37 : le château et ses vignes (cuvée classée, vente en primeur, visiteurs, concours des vins).

// Le classement d'un lot mis en cuvée, à sa sortie de la cave. mult : valeur du lot ; stars : points de réputation.
export const CHATEAU_CLASSES = [
    null,
    { id: 'cru', name: 'Cru du château', mult: 1.15, stars: 1 },
    { id: 'grand', name: 'Grand cru', mult: 1.35, stars: 2 },
    { id: 'premier', name: 'Premier grand cru', mult: 1.65, stars: 4 },
    { id: 'exception', name: 'Cru d’exception', mult: 2.2, stars: 8 },
];

// points de réputation pour chaque étoile du château (0 à 5)
export const REP_TIERS = [0, 2, 6, 14, 28, 50];
export const REP_MAX = REP_TIERS.length - 1;

// la vente en primeur : une part de la valeur promise tout de suite, au plus PRIMEUR.cap, et un bonus si la promesse est tenue
export const PRIMEUR = { frac: 0.35, cap: 400000, bonus: 0.12, maxLots: 3, minRank: 2 };

// le tourisme du vin : un visiteur toutes les « every » heures divisées par (1 + 0,4 × étoiles), des bouteilles du stock
export const TOURISM = {
    every: 3 * 3600 * 1000,
    stay: 8 * 3600 * 1000,
    queue: 2, // + une place par étoile
    bonus: 0.12, // par étoile, sur le prix de la bouteille
    base: 1.25,
    pairBonus: 0.5, // un bon accord paie 50 % de plus
    wines: [
        // id, étoiles demandées
        ['redWine', 0],
        ['whiteWine', 0],
        ['roseWine', 0],
        ['strawWine', 1],
        ['champagne', 2],
        ['champagneRose', 3],
    ],
};

// les accords mets et vins : le vin demandé, les plats qui lui vont bien
export const PAIRINGS = {
    redWine: ['beefBourguignon', 'guineaWine', 'eggsMeurette', 'winePears', 'cheese'],
    whiteWine: ['zanderWine', 'goatCheese', 'candiedGrapes', 'cheese'],
    roseWine: ['grapeJelly', 'goatCheese', 'candiedGrapes', 'cheese'],
    strawWine: ['winePears', 'candiedGrapes', 'cheese'],
    champagne: ['cheese', 'candiedGrapes', 'grapeJelly'],
    champagneRose: ['winePears', 'candiedGrapes', 'grapeJelly'],
};

// le concours des vins, une fois par mois : bronze, argent ou or d'après le classement de la cuvée présentée
export const CONTEST = {
    medals: [
        null,
        { id: 'bronze', name: 'Médaille de bronze', rubans: 1, mult: 1.03, prize: 0.04 },
        { id: 'silver', name: 'Médaille d’argent', rubans: 2, mult: 1.06, prize: 0.08 },
        { id: 'gold', name: 'Médaille d’or', rubans: 4, mult: 1.1, prize: 0.15 },
    ],
};
