// 1.18.7 : les cultures de la serre (menthe, poivre noir, orchidée) et leurs huit recettes (et un thé au comptoir).
// [id, nom, machine, ingrédients, temps, niveau, expérience]
export const SERRE_RECIPES = [
    ['taboule', 'Taboulé à la menthe', 'deli', { mint: 2, tomato: 2, flour: 1 }, 240, 24, 19],
    ['mintIce', 'Glace à la menthe', 'icecream', { mint: 2, cream: 1, sugar: 1 }, 200, 29, 13],
    ['pepperMagret', 'Magret au poivre', 'stove', { magret: 1, peppercorn: 1, cream: 1 }, 420, 36, 27],
    ['pepperCheese', 'Fromage au poivre', 'dairy', { cheese: 1, peppercorn: 1 }, 300, 35, 19],
    ['pepperSaucisson', 'Saucisson au poivre', 'saloir', { lard: 1, peppercorn: 1, garlic: 1 }, 420, 36, 27],
    ['orchidPerfume', 'Parfum d’orchidée', 'perfumery', { orchid: 3 }, 360, 41, 23],
    ['orchidSoap', 'Savon à l’orchidée', 'soapworks', { orchid: 2, goatMilk: 1 }, 240, 41, 19],
    ['orchidDried', 'Orchidées séchées', 'dryer', { orchid: 3 }, 300, 41, 19],
];
