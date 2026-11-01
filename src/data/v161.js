// 1.61 : la pizzeria. La pizza quitte le four à pain et devient la margherita ; sept pizzas de plus.
// id, nom, ingrédients, durée (s), niveau (relevé au chargement jusqu'à celui de l'ingrédient le plus tardif)
export const PIZZERIA = { id: 'pizzeria', name: 'Pizzeria', cost: 9000, reqLvl: 28, desc: 'Un four à bois : pizzas et calzone' };
export const RECIPES_161 = [
    ['pizzaVeggie', 'Pizza végétarienne', { flour: 2, tomato: 1, pepper: 1, zucchini: 1, eggplant: 1, cheese: 1 }, 420, 28],
    ['pizzaReine', 'Pizza reine', { flour: 2, tomato: 1, ham: 1, mushroom: 2, cheese: 1 }, 420, 33],
    ['calzone', 'Calzone', { flour: 2, tomato: 1, ham: 1, cheese: 1, egg: 1 }, 400, 33],
    ['pizzaGoatHoney', 'Pizza chèvre-miel', { flour: 2, cream: 1, goatCheese: 2, honey: 1, walnut: 1 }, 440, 38],
    ['pizzaHawaii', 'Pizza hawaïenne', { flour: 2, tomato: 1, ham: 1, pineapple: 2, cheese: 1 }, 420, 38],
    ['pizzaFourCheese', 'Pizza quatre fromages', { flour: 2, cream: 1, cheese: 1, goatCheese: 1, bleu: 1, comte: 1 }, 480, 59],
    ['pizzaSavoyarde', 'Pizza savoyarde', { flour: 2, cream: 1, potato: 2, lard: 1, reblochon: 1 }, 480, 55],
];
