// 1.34 : six produits de cave de plus (le brie truffé et le fromage au poivre existent déjà et entrent en cave).
// id, nom, machine, ingrédients, temps (s), niveau de départ (relevé au chargement jusqu'à celui des ingrédients)
export const RECIPES_134 = [
    ['munster', 'Munster', 'dairy', { milk: 4 }, 320, 31],
    ['cantal', 'Cantal', 'dairy', { milk: 5 }, 390, 33],
    ['valencay', 'Valençay', 'dairy', { goatMilk: 3 }, 490, 35],
    ['drySausage', 'Saucisson sec', 'saloir', { lard: 2, garlic: 1 }, 600, 30],
    ['coppa', 'Coppa', 'saloir', { lard: 3 }, 600, 35],
    ['alpineFlowerCheese', 'Fromage aux fleurs d’alpage', 'alpineDairy', { alpineMilk: 4, genepi: 1, lavender: 2 }, 280, 47],
];
