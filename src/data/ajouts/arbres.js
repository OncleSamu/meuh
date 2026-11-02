// 1.31 : sept nouveaux arbres (cinq à la ferme, deux aux îles) et trente recettes.
// Les prix des plats suivent leurs ingrédients (environ 1,37 fois leur valeur), voir items.js.

export const TREES_131 = [
    // id, fruit (nom du produit), nom de l'arbre, niveau, prix, vente, pousse (s), xp, saison (null : toute l'année), île, saveurs [sucré, acide, amer, épicé, umami]
    ['plum', 'Quetsches', 'Prunier', 26, 1400, 220, 1200, 7, 'ete', false, '32000'],
    ['mandarin', 'Mandarines', 'Mandarinier', 30, 1800, 240, 1300, 7, 'hiver', false, '41100'],
    ['grapefruit', 'Pamplemousses', 'Pamplemoussier', 31, 2000, 250, 1350, 8, 'hiver', false, '13300'],
    ['pomegranate', 'Grenades', 'Grenadier', 35, 3500, 310, 1500, 10, 'automne', false, '24100'],
    ['pistachio', 'Pistaches', 'Pistachier', 36, 5000, 340, 1600, 12, 'ete', false, '10103'],
    ['dragonfruit', 'Fruits du dragon', 'Pitaya', 40, 4500, 330, 1500, 11, null, true, '31000'],
    ['cashew', 'Noix de cajou', 'Anacardier', 41, 5500, 350, 1700, 12, null, true, '30102'],
];

// id, nom, machine, ingrédients, temps (s), niveau de départ (relevé au chargement jusqu'à celui des ingrédients)
export const RECIPES_131 = [
    // le prunier
    ['plumTart', 'Tarte aux quetsches', 'pastry', { plum: 3, flour: 2, sugar: 1 }, 230, 26],
    ['plumJam', 'Confiture de prunes', 'confectionery', { plum: 3, sugar: 1 }, 210, 26],
    ['driedPlums', 'Prunes séchées', 'dryer', { plum: 4 }, 250, 26],
    ['plumBrandy', 'Eau-de-vie de quetsche', 'still', { plum: 5 }, 280, 36],
    ['magretPlums', 'Magret aux quetsches', 'stove', { magret: 1, plum: 2, honey: 1 }, 240, 26],
    // le mandarinier
    ['mandarinJuice', 'Jus de mandarine', 'juiceBar', { mandarin: 4 }, 250, 38],
    ['mandarinMarmalade', 'Marmelade de mandarine', 'cannery', { mandarin: 3, sugar: 1 }, 230, 31],
    ['mandarinCake', 'Gâteau à la mandarine', 'pastry', { mandarin: 2, flour: 2, egg: 2, sugar: 1 }, 190, 30],
    ['chocMandarins', 'Mandarines confites au chocolat', 'chocolatier', { mandarin: 2, darkChoc: 1 }, 350, 34],
    // le pamplemoussier
    ['grapefruitJuice', 'Jus de pamplemousse', 'juiceBar', { grapefruit: 3 }, 200, 38],
    ['grapefruitMarmalade', 'Marmelade de pamplemousse', 'cannery', { grapefruit: 3, sugar: 1 }, 240, 31],
    ['grapefruitSorbet', 'Sorbet au pamplemousse', 'icecream', { grapefruit: 3, sugar: 1 }, 240, 31],
    ['grapefruitTart', 'Tarte au pamplemousse', 'pastry', { grapefruit: 3, flour: 2, butter: 1, sugar: 1 }, 490, 31],
    // le grenadier
    ['pomegranateJuice', 'Jus de grenade', 'juiceBar', { pomegranate: 4 }, 320, 38],
    ['grenadine', 'Grenadine', 'cannery', { pomegranate: 4, sugar: 2 }, 370, 35],
    ['magretPomegranate', 'Magret à la grenade', 'stove', { magret: 1, pomegranate: 2, honey: 1 }, 270, 36],
    ['pomegranateSorbet', 'Sorbet à la grenade', 'icecream', { pomegranate: 3, sugar: 1 }, 270, 35],
    // le pistachier
    ['roastedPistachios', 'Pistaches grillées', 'dryer', { pistachio: 3 }, 260, 36],
    ['pistachioOil', 'Huile de pistache', 'oilmill', { pistachio: 4 }, 350, 36],
    ['pistachioIce', 'Glace à la pistache', 'icecream', { pistachio: 2, cream: 1, sugar: 1 }, 300, 36],
    ['pistachioNougat', 'Nougat aux pistaches', 'confectionery', { pistachio: 2, honey: 1, sugar: 1 }, 230, 36],
    ['pistachioFinancier', 'Financiers aux pistaches', 'pastry', { pistachio: 2, flour: 1, butter: 1, egg: 2, sugar: 1 }, 430, 36],
    // le fruit du dragon (île)
    ['dragonJuice', 'Jus de fruit du dragon', 'juiceBar', { dragonfruit: 3 }, 260, 40],
    ['dragonSmoothie', 'Smoothie dragon et mangue', 'juiceBar', { dragonfruit: 2, mango: 1 }, 260, 40],
    ['dragonSorbet', 'Sorbet au fruit du dragon', 'icecream', { dragonfruit: 3, sugar: 1 }, 280, 40],
    ['exoticTartlet', 'Tartelette exotique', 'islandBakery', { dragonfruit: 2, flour: 2, butter: 1, sugar: 1 }, 420, 40],
    // la noix de cajou (île)
    ['roastedCashews', 'Noix de cajou grillées', 'dryer', { cashew: 3 }, 270, 41],
    ['cashewButter', 'Beurre de cajou', 'oilmill', { cashew: 4 }, 370, 41],
    ['cashewRice', 'Riz sauté aux noix de cajou', 'kitchen', { cashew: 2, rice: 2, sunflowerOil: 1 }, 320, 41],
    ['cashewBrittle', 'Croquant de cajou', 'confectionery', { cashew: 2, sugar: 2 }, 230, 41],
];
