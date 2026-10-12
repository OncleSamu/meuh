// Le port et l’alpage : bateau de livraison, saisons de la ferme, fermes à thème.
// Valeurs reprises telles quelles de la version 6.2 (même équilibre).

export const BOAT_STAY = 7200000;

export const BOAT_AWAY = 10800000;

export const BOAT_PAY = 3.5;

export const FARM_SEASON_MS = 2419200000;

export const FARM_SEASON_TIERS = [300, 900, 2200, 5000, 10000];

export const FARM_SEASONS = [
    {
        id: 'cheese',
        name: 'La saison des fromages',
        icon: 'cheese',
        deco: 'cheeseWheel',
        items: ['cheese', 'goatCheese', 'mozzarella', 'beaufort', 'tomme', 'reblochon', 'butter', 'cream', 'milk', 'goatMilk', 'alpineMilk', 'buffaloMilk'],
    },
    {
        id: 'sea',
        name: 'La saison de la mer',
        icon: 'sardine',
        deco: 'anchorDeco',
        items: [
            'sardine',
            'mackerel',
            'shrimp',
            'seabass',
            'lobster',
            'trout',
            'cannedSardines',
            'mackerelRillettes',
            'cannedShrimp',
            'bouillabaisse',
            'lobsterDish',
            'grilledMackerel',
            'smokedTrout',
            'fishSoup',
        ],
    },
    {
        id: 'orchard',
        name: 'La saison des vergers',
        icon: 'apple',
        deco: 'orchardSwing',
        items: ['apple', 'cherry', 'orange', 'peach', 'grape', 'olive', 'juice', 'cider', 'grapeJuice', 'pie', 'jam', 'cherryBeer', 'oliveOil'],
    },
    {
        id: 'mountain',
        name: 'La saison de la montagne',
        icon: 'genepi',
        deco: 'cowbell',
        items: ['alpineMilk', 'genepi', 'genepiLiqueur', 'blueberry', 'wool', 'alpacaWool', 'honey', 'raclette', 'fondue', 'tartiflette', 'woolHat', 'hotChoc'],
    },
];

export const FARM_THEMES = {
    none: {
        name: 'Ferme classique',
        desc: 'Aucun bonus particulier',
    },
    garden: {
        name: 'Ferme maraîchère',
        icon: ['item', 'carrot'],
        desc: 'Les cultures poussent 15 % plus vite',
    },
    dairy: {
        name: 'Ferme laitière',
        icon: ['animal', 'cow'],
        desc: 'Les animaux produisent 20 % plus vite',
    },
    orchard: {
        name: 'Ferme fruitière',
        icon: ['item', 'apple'],
        desc: 'Les arbres fruitiers poussent 30 % plus vite',
    },
    coast: {
        name: 'Ferme du littoral',
        icon: ['item', 'sardine'],
        desc: 'Le filet de pêche rapporte deux fois plus',
    },
};
