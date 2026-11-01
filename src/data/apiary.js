// 1.69 : le rucher de chaque contrée. 1 à 3 ruches qui ne butinent que leur contrée (parcelles et verger).
// cost : le prix de la 1re, 2e et 3e ruche ; every : secondes par pot et par ruche, toutes fleurs dehors ;
// cap : pots en réserve par ruche ; full : fleurs qu'il faut pour que les ruches travaillent à plein.
export const APIARY = {
    island: {
        name: 'Le rucher de l’île',
        icon: 'apiaryIsland',
        lvl: 38,
        cost: [
            { coins: 60000, wood: 40, wax: 10 },
            { coins: 180000, wood: 80, wax: 25 },
            { coins: 450000, wood: 120, wax: 50 },
        ],
        rule: 'Sous les tropiques, les arbres fleurissent toute l’année : les abeilles ne s’arrêtent jamais.',
    },
    oasis: {
        name: 'Le rucher de l’oasis',
        icon: 'apiaryOasis',
        lvl: 59,
        cost: [
            { coins: 400000, stone: 60, wax: 20 },
            { coins: 1000000, stone: 120, wax: 40 },
            { coins: 2500000, stone: 200, wax: 80 },
        ],
        drink: 2, // litres par heure et par ruche, pris à la citerne
        rule: 'Les ruches boivent à la citerne : sans eau, les abeilles s’arrêtent.',
    },
    nord: {
        name: 'Le rucher du Grand Nord',
        icon: 'apiaryNord',
        lvl: 62,
        cost: [
            { coins: 500000, plank: 60, wax: 20 },
            { coins: 1200000, plank: 120, wax: 40 },
            { coins: 3000000, plank: 200, wax: 80 },
        ],
        rule: 'Au printemps et en été seulement ; le reste de l’année, il faut un poêle allumé au champ de neige pour que les abeilles sortent.',
    },
};
export const APIARY_LANDS = ['island', 'oasis', 'nord'];
export const APIARY_RUN = { every: 300, cap: 8, full: 8, xp: 20 };
