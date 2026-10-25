// 1.32 : huit cultures de l'île et trente-trois recettes.
// Comme les autres cultures de l'île : pas d'arrosage, pas de saison, pas de sol, pas de cultures compagnes.

export const CROPS_132 = [
    // id, nom, graines, niveau, prix de la graine, vente, pousse (s), xp, saveurs [sucré, acide, amer, épicé, umami]
    ['taro', 'Taro', 'Bulbes de taro', 40, 50, 160, 420, 6, '20002'],
    ['turmeric', 'Curcuma', 'Rhizomes de curcuma', 41, 90, 300, 700, 10, '00230'],
    ['peanut', 'Arachide', 'Graines d’arachide', 42, 45, 150, 480, 6, '20102'],
    ['redBean', 'Haricot rouge', 'Graines de haricot rouge', 43, 40, 140, 400, 5, '30002'],
    ['islandChili', 'Piment des îles', 'Plants de piment des îles', 44, 70, 230, 450, 8, '20040'],
    ['aloe', 'Aloe vera', 'Plants d’aloe vera', 45, 80, 260, 600, 9, '01200'],
    ['hibiscus', 'Hibiscus', 'Graines d’hibiscus', 46, 100, 320, 680, 10, '14100'],
    ['patchouli', 'Patchouli', 'Boutures de patchouli', 47, 120, 360, 780, 11, '00410'],
];

// id, nom, machine, ingrédients, temps (s), niveau de départ (relevé au chargement jusqu'à celui des ingrédients)
export const RECIPES_132 = [
    // le taro
    ['taroChips', 'Chips de taro', 'dryer', { taro: 3 }, 120, 40],
    ['taroCoconut', 'Taro au lait de coco', 'kitchen', { taro: 3, coconut: 1 }, 190, 40],
    ['taroFritters', 'Beignets de taro', 'islandBakery', { taro: 2, flour: 2, egg: 1, sunflowerOil: 1 }, 170, 40],
    ['taroCake', 'Gâteau de taro', 'islandBakery', { taro: 3, flour: 2, egg: 2, sugar: 1 }, 170, 40],
    // le curcuma
    ['turmericPowder', 'Poudre de curcuma', 'dryer', { turmeric: 3 }, 230, 41],
    ['goldenMilk', 'Lait d’or', 'juiceBar', { turmeric: 1, milk: 2, honey: 1 }, 260, 41],
    ['yellowRice', 'Riz jaune au curcuma', 'kitchen', { turmeric: 1, rice: 2 }, 140, 41],
    ['pickledTurmeric', 'Curcuma mariné', 'cannery', { turmeric: 3, mustard: 1 }, 250, 41],
    // l'arachide
    ['roastedPeanuts', 'Cacahuètes grillées', 'dryer', { peanut: 3 }, 110, 42],
    ['peanutOil', 'Huile d’arachide', 'oilmill', { peanut: 4 }, 140, 42],
    ['peanutButter', 'Beurre de cacahuète', 'oilmill', { peanut: 3 }, 110, 42],
    ['peanutBrittle', 'Croquant aux cacahuètes', 'confectionery', { peanut: 2, sugar: 2 }, 120, 42],
    ['chocPeanuts', 'Cacahuètes enrobées de chocolat', 'chocolatier', { peanut: 2, darkChoc: 1 }, 280, 42],
    // le haricot rouge
    ['redBeanRice', 'Haricots rouges au riz', 'kitchen', { redBean: 2, rice: 2 }, 120, 43],
    ['canRedBeans', 'Haricots rouges en conserve', 'cannery', { redBean: 3 }, 100, 43],
    ['redBeanPaste', 'Pâte de haricots rouges sucrée', 'confectionery', { redBean: 3, sugar: 2 }, 140, 43],
    ['dorayaki', 'Dorayaki', 'pastry', { redBeanPaste: 1, flour: 2, egg: 2, sugar: 1 }, 240, 43],
    // le piment des îles
    ['chiliPowder', 'Poudre de piment des îles', 'dryer', { islandChili: 3 }, 160, 44],
    ['rougail', 'Rougail de tomate', 'kitchen', { tomato: 2, islandChili: 1, onion: 1 }, 80, 44],
    ['hotSauce', 'Sauce pimentée', 'mill', { islandChili: 2, tomato: 1 }, 110, 44],
    ['spicedRum', 'Rhum épicé au piment', 'rumDistillery', { rum: 1, islandChili: 2 }, 410, 44],
    // l'aloe vera
    ['aloeGel', 'Gel d’aloe vera', 'soapworks', { aloe: 2 }, 120, 45],
    ['aloeSoap', 'Savon à l’aloe vera', 'soapworks', { aloeGel: 1, honey: 1 }, 190, 45],
    ['soothingCream', 'Crème apaisante', 'soapworks', { aloe: 2, wax: 1 }, 180, 45],
    ['aloeLimeJuice', 'Jus d’aloe vera et citron vert', 'juiceBar', { aloe: 2, lime: 1 }, 170, 45],
    // l'hibiscus
    ['driedHibiscus', 'Fleurs d’hibiscus séchées', 'dryer', { hibiscus: 3 }, 220, 46],
    ['bissap', 'Bissap', 'juiceBar', { hibiscus: 3, sugar: 1 }, 240, 46],
    ['hibiscusJam', 'Confiture d’hibiscus', 'kitchen', { hibiscus: 3, sugar: 1 }, 240, 46],
    ['hibiscusSorbet', 'Sorbet à l’hibiscus', 'icecream', { hibiscus: 2, sugar: 1 }, 160, 46],
    // le patchouli
    ['patchouliEssence', 'Huile essentielle de patchouli', 'perfumery', { patchouli: 4 }, 330, 47],
    ['patchouliPerfume', 'Eau de parfum au patchouli', 'perfumery', { patchouliEssence: 1, lavenderWater: 1 }, 580, 47],
    ['patchouliCandle', 'Bougie au patchouli', 'soapworks', { patchouli: 2, wax: 2 }, 280, 47],
    ['patchouliSachet', 'Sachet de patchouli', 'soapworks', { patchouli: 2, linen: 1 }, 220, 47],
];
