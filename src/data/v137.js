// 1.37 : le château et ses vignes. Douze recettes autour du vin (plats, confitures, eaux-de-vie, boissons).
// id, nom, machine, ingrédients, temps (s), niveau
export const RECIPES_137 = [
    ['guineaWine', 'Pintade au vin', 'stove', { guineaFowl: 1, redWine: 1, mushroom: 1 }, 360, 57],
    ['beefBourguignon', 'Bœuf bourguignon', 'stove', { beef: 1, redWine: 1, carrot: 2, onion: 1 }, 480, 55],
    ['eggsMeurette', 'Œufs en meurette', 'kitchen', { egg: 3, redWine: 1, lard: 1 }, 240, 56],
    ['winePears', 'Poires au vin', 'kitchen', { pear: 3, redWine: 1, sugar: 1 }, 300, 55],
    ['candiedGrapes', 'Raisins confits', 'cannery', { grape: 3, sugar: 1 }, 330, 57],
    ['grapeJelly', 'Gelée de raisin', 'cannery', { grape: 4, sugar: 2, lemon: 1 }, 380, 58],
    ['zanderWine', 'Sandre au vin blanc', 'stove', { zander: 1, whiteWine: 1, butter: 1 }, 300, 58],
    ['marcBrandy', 'Eau-de-vie de marc', 'still', { grape: 5 }, 600, 59],
    ['cognac', 'Cognac', 'still', { whiteWine: 3 }, 900, 60],
    ['kir', 'Kir', 'juiceBar', { whiteWine: 1, cassisCream: 1 }, 120, 56],
    ['strawWine', 'Vin de paille', 'winery', { grape: 6, honey: 1 }, 840, 60],
    ['mulledWine', 'Vin chaud', 'stove', { redWine: 1, orange: 1, honey: 1, lemon: 1 }, 260, 59],
];
