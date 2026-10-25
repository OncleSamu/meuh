// 1.33 : dix poissons de plus (deux à l'étang, quatre en mer, quatre au lagon de l'île) et trente-quatre recettes.

// les poissons de la canne (voir FISH dans meta.js pour le sens des champs)
export const FISH_133 = {
    gudgeon: {
        name: 'Goujon',
        sell: 30,
        w: [0.02, 0.1],
        zone: 0.34,
        speed: 1.1,
        odds: 20,
        hint: 'Toute l’année, sur la berge',
        spots: ['bank'],
        bait: ['worm'],
        fight: 'calm',
        small: true,
    },
    whitefish: {
        name: 'Lavaret',
        sell: 150,
        w: [0.4, 2.5],
        zone: 0.24,
        speed: 1.5,
        odds: 12,
        when: { seasons: ['automne', 'hiver'] },
        hint: 'Automne et hiver, au ponton, avec une mouche',
        spots: ['pier'],
        bait: ['fly'],
        fight: 'zigzag',
    },
    octopus: {
        name: 'Poulpe',
        sell: 110,
        w: [0.5, 3],
        zone: 0.22,
        speed: 1.4,
        odds: 16,
        when: { night: true },
        hint: 'La nuit, au lagon, avec des crevettes',
        spots: ['lagoon'],
        bait: ['shrimp'],
        fight: 'zigzag',
        trapAny: true,
    },
    snapper: {
        name: 'Vivaneau',
        sell: 200,
        w: [0.8, 5],
        zone: 0.2,
        speed: 1.6,
        odds: 18,
        hint: 'Au lagon, avec des crevettes',
        spots: ['lagoon'],
        bait: ['shrimp'],
        fight: 'pull',
        noTrap: true,
    },
    mahi: {
        name: 'Mahi-mahi',
        sell: 320,
        w: [3, 15],
        zone: 0.17,
        speed: 1.7,
        odds: 12,
        hint: 'Au lagon, avec des crevettes',
        spots: ['lagoon'],
        bait: ['shrimp'],
        fight: 'dart',
        noTrap: true,
    },
    spinyLobster: {
        name: 'Langouste',
        sell: 700,
        w: [0.8, 3],
        zone: 0.15,
        speed: 1.5,
        odds: 5,
        when: { night: true },
        hint: 'Rare, la nuit, au lagon, avec des crevettes',
        spots: ['lagoon'],
        bait: ['shrimp'],
        fight: 'pull',
        noTrap: true,
    },
};

// les fiches des objets : id, nom, type, prix ; sea = produit du filet en mer
export const FISH_ITEMS_133 = [
    ['gudgeon', 'Goujon', 'fish', 30],
    ['whitefish', 'Lavaret', 'fish', 150],
    ['octopus', 'Poulpe', 'fish', 110],
    ['snapper', 'Vivaneau', 'fish', 200],
    ['mahi', 'Mahi-mahi', 'fish', 320],
    ['spinyLobster', 'Langouste', 'fish', 700],
    ['squid', 'Calmar', 'product', 90, true],
    ['bream', 'Dorade royale', 'product', 150, true],
    ['skate', 'Raie', 'product', 180, true],
    ['tuna', 'Thon', 'product', 300, true],
];

// le filet en mer : sur 100
export const SEA_CATCH_133 = [
    ['sardine', 30],
    ['mackerel', 20],
    ['shrimp', 14],
    ['squid', 10],
    ['seabass', 8],
    ['bream', 7],
    ['skate', 4],
    ['tuna', 4],
    ['lobster', 3],
];

// id, nom, machine, ingrédients, temps (s), niveau de départ (relevé au chargement jusqu'à celui des ingrédients)
export const RECIPES_133 = [
    // le goujon
    ['gudgeonFry', 'Friture de goujons', 'fishmonger', { gudgeon: 4, flour: 1, sunflowerOil: 1 }, 240, 14],
    ['gudgeonLemon', 'Goujons au citron', 'kitchen', { gudgeon: 3, lemon: 1, garlic: 1 }, 150, 12],
    ['smokedGudgeon', 'Goujons fumés', 'smokehouse', { gudgeon: 4 }, 60, 13],
    // le lavaret
    ['whitefishMeuniere', 'Lavaret meunière', 'fishmonger', { whitefish: 1, butter: 1, flour: 1, lemon: 1 }, 420, 15],
    ['smokedWhitefish', 'Lavaret fumé', 'smokehouse', { whitefish: 2 }, 160, 15],
    ['whitefishTartare', 'Tartare de lavaret', 'deli', { whitefish: 2, shallot: 1, lemon: 1, basil: 1 }, 280, 19],
    ['whitefishLeek', 'Lavaret aux poireaux', 'kitchen', { whitefish: 1, leek: 2, cream: 1 }, 240, 17],
    // le thon
    ['grilledTuna', 'Thon grillé', 'fishmonger', { tuna: 1, lemon: 1, garlic: 1 }, 130, 39],
    ['cannedTuna', 'Thon en boîte', 'cannery', { tuna: 2, sunflowerOil: 1 }, 200, 39],
    ['tunaTartare', 'Tartare de thon', 'deli', { tuna: 1, avocado: 1, lime: 1 }, 200, 39],
    ['tunaPoke', 'Poke bowl au thon', 'deli', { tuna: 1, rice: 2, avocado: 1, soy: 1 }, 240, 39],
    // le calmar
    ['friedSquid', 'Calamars frits', 'fishmonger', { squid: 2, flour: 1, egg: 1, sunflowerOil: 1 }, 120, 39],
    ['stuffedSquid', 'Calmars farcis', 'kitchen', { squid: 2, bread: 2, garlic: 1, tomato: 2 }, 90, 39],
    ['squidSalad', 'Salade de calamars', 'deli', { squid: 2, lettuce: 2, lemon: 1, tomato: 1 }, 100, 39],
    // la raie
    ['skateBlackButter', 'Raie au beurre noir', 'fishmonger', { skate: 1, butter: 1, lemon: 1 }, 270, 39],
    ['skateMustard', 'Raie à la moutarde', 'kitchen', { skate: 1, mustard: 1, cream: 1 }, 150, 39],
    ['skateSoup', 'Soupe de raie', 'stove', { skate: 1, potato: 2, leek: 1, carrot: 2 }, 110, 39],
    // la dorade
    ['bakedBream', 'Dorade au four', 'kitchen', { bream: 1, potato: 2, lemon: 1 }, 110, 39],
    ['herbBream', 'Dorade grillée aux herbes', 'stove', { bream: 1, basil: 2, garlic: 1, tomato: 2 }, 100, 39],
    ['breamCeviche', 'Ceviche de dorade', 'deli', { bream: 1, lime: 2, onion: 1, pepper: 1 }, 160, 39],
    // le poulpe
    ['grilledOctopus', 'Poulpe grillé', 'fishmonger', { octopus: 1, lemon: 1, potato: 2 }, 100, 39],
    ['octopusProvencale', 'Poulpe à la provençale', 'stove', { octopus: 1, tomato: 3, olive: 1, garlic: 1 }, 150, 39],
    ['octopusSalad', 'Salade de poulpe', 'deli', { octopus: 1, potato: 2, pepper: 1, onion: 1 }, 90, 39],
    ['octopusOil', 'Poulpe à l’huile', 'cannery', { octopus: 2, sunflowerOil: 1, garlic: 1 }, 140, 39],
    // la langouste
    ['grilledSpinyLobster', 'Langouste grillée', 'fishmonger', { spinyLobster: 1, butter: 1, garlic: 1 }, 360, 39],
    ['vanillaSpinyLobster', 'Langouste à la vanille', 'stove', { spinyLobster: 1, vanilla: 1, cream: 1 }, 300, 39],
    ['spinyBisque', 'Bisque de langouste', 'cannery', { spinyLobster: 1, cream: 1, tomato: 3 }, 270, 39],
    // le vivaneau
    ['snapperLime', 'Vivaneau au citron vert', 'islandBakery', { snapper: 1, lime: 2, rice: 1 }, 180, 39],
    ['creoleSnapper', 'Vivaneau à la créole', 'stove', { snapper: 1, tomato: 3, onion: 1, islandChili: 1 }, 120, 39],
    ['snapperCeviche', 'Ceviche de vivaneau', 'deli', { snapper: 1, lime: 2, mango: 1 }, 220, 39],
    // le mahi-mahi
    ['mahiPineapple', 'Mahi-mahi à l’ananas', 'islandBakery', { mahi: 1, pineapple: 2, rice: 1 }, 220, 39],
    ['mahiPoke', 'Poke de mahi-mahi', 'deli', { mahi: 1, rice: 2, mango: 1, soy: 1 }, 240, 39],
    ['smokedMahi', 'Mahi-mahi fumé', 'smokehouse', { mahi: 2 }, 140, 39],
    ['mahiTacos', 'Tacos de mahi-mahi', 'kitchen', { mahi: 1, flour: 2, avocado: 1, lime: 1 }, 220, 39],
];
