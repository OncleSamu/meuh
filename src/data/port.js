// Le port et l’alpage : bateau de livraison, saisons de la ferme, fermes à thème.
// Valeurs reprises telles quelles de la version 6.2 (même équilibre).
import { RECIPES } from './machines.js';
import { ITEMS } from './items.js';

// 1.95 : les listes de produits des nouvelles saisons suivent les recettes des machines
const made = (...ms) =>
    Object.values(RECIPES)
        .filter(r => ms.includes(r.machine) && ITEMS[r.id])
        .map(r => r.id);

export const BOAT_STAY = 7200000;

export const BOAT_AWAY = 10800000;

export const BOAT_PAY = 3.5;

// 1.183 : 3 ports de destination pour le cargo de livraison (choix du rythme et de la prime de cargaison pleine)
export const BOAT_PORTS = {
    cote: {
        id: 'cote',
        name: 'Port côtier',
        short: 'Côtier',
        payMult: 0.9,
        awayMult: 0.65,
        bonusMult: 0.35,
        mats: 2,
        renom: 0,
        desc: 'Aller-retour rapide, idéal pour enchaîner les livraisons',
    },
    capitale: {
        id: 'capitale',
        name: 'Port de la Capitale',
        short: 'Capitale',
        payMult: 1.0,
        awayMult: 1.0,
        bonusMult: 0.5,
        mats: 3,
        renom: 0,
        desc: 'Équilibré : bon tarif et matériaux rares',
    },
    iles: {
        id: 'iles',
        name: 'Routes lointaines',
        short: 'Lointain',
        payMult: 1.35,
        awayMult: 1.35,
        bonusMult: 0.7,
        mats: 4,
        renom: 2,
        desc: 'Voyage plus long mais gros bonus, +2 Renom et matériaux rares',
    },
};
export const BOAT_PORT_IDS = ['cote', 'capitale', 'iles'];

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
        items: ['apple', 'cherry', 'orange', 'peach', 'grape', 'olive', 'kiwi', 'kaki', 'juice', 'cider', 'grapeJuice', 'pie', 'jam', 'cherryBeer', 'oliveOil'],
    },
    {
        id: 'mountain',
        name: 'La saison de la montagne',
        icon: 'genepi',
        deco: 'cowbell',
        items: ['alpineMilk', 'genepi', 'genepiLiqueur', 'blueberry', 'wool', 'alpacaWool', 'honey', 'raclette', 'fondue', 'tartiflette', 'woolHat', 'hotChoc'],
    },
    // 1.95 : huit saisons à thème de plus (douze en tout : quarante-huit semaines, l'année de la ferme)
    {
        id: 'haras',
        name: 'La saison des chevaux',
        icon: 'horseshoe',
        deco: 'bannerHaras',
        items: ['horsehair', 'horseshoe', 'horsehairBrush', 'oat', 'oatFlakes', 'oatFlour', 'oatBread', 'oatCookies', 'oatGalette', 'porridge'],
    },
    {
        id: 'brasserie',
        name: 'La saison de la brasserie',
        icon: 'hop',
        deco: 'bannerBrasserie',
        items: ['hop', 'beer', 'maltBlond', 'maltAmber', 'maltBrown', 'maltBlack', ...made('malthouse', 'brewery')],
    },
    {
        id: 'oasis',
        name: 'La saison de l’oasis',
        icon: 'date',
        deco: 'bannerOasis',
        items: ['date', 'jujube', 'cumin', 'sesame', 'camelMilk', 'camelWool', 'semolina', ...made('tajine', 'orientalSweets')],
    },
    {
        id: 'nord',
        name: 'La saison du Grand Nord',
        icon: 'lingonberry',
        deco: 'bannerNord',
        items: ['rye', 'lingonberry', 'cloudberry', 'seaBuckthorn', 'birchSap', 'reindeerMilk', 'ptarmiganEgg', ...made('taigaPot', 'tiledStove')],
    },
    {
        id: 'asie',
        name: 'La saison des Terres d’Asie',
        icon: 'yuzu',
        deco: 'bannerAsie',
        items: ['lotus', 'bambooShoot', 'shiitake', 'bokChoy', 'yuzu', 'sikaMilk', 'silkThread', 'silkieEgg', ...made('wok', 'steamer', 'wagashi')],
    },
    {
        id: 'miel',
        name: 'La saison du miel',
        icon: 'honey',
        deco: 'bannerMiel',
        items: ['honey', 'mead', 'wax', 'candle', 'honeyPot', 'honeyIce', 'waxBalm', 'honeyJujubes', 'buckthornHoney', 'quailHoney'],
    },
    {
        id: 'mine',
        name: 'La saison de la mine',
        icon: 'ruby',
        deco: 'bannerMine',
        items: [
            'coal',
            'ironOre',
            'copperOre',
            'silverOre',
            'goldOre',
            'ironIngot',
            'copperIngot',
            'silverIngot',
            'goldIngot',
            'quartz',
            'amethyst',
            'ruby',
            'sapphire',
            'emerald',
            ...made('forge', 'jewelry'),
        ],
    },
    {
        id: 'textile',
        name: 'La saison du textile',
        icon: 'sweater',
        deco: 'bannerTextile',
        items: ['wool', 'angora', 'alpacaWool', 'mohair', 'camelWool', 'cloth', 'linen', 'cottonFabric', ...made('loom', 'tailor', 'dyeworks')],
    },
    {
        id: 'parfums',
        name: 'La saison des parfums',
        icon: 'lavender',
        deco: 'bannerParfums',
        items: ['lavender', 'vanilla', 'tiare', 'orchid', ...made('soapworks', 'perfumery')],
    },
    {
        id: 'confiserie',
        name: 'La saison de la confiserie',
        icon: 'caramel',
        deco: 'bannerMiel',
        items: ['sugar', 'honey', 'cacao', 'vanilla', 'almond', 'hazelnut', 'caramel', 'darkChoc', 'praline', 'nougat', ...made('confectionery', 'sugarworks')],
    },
];

// 1.95 : les grands défis qui vont avec chaque saison (proposés en priorité, ils comptent double pour la Coupe)
export const FARM_SEASON_DEFIS = {
    cheese: ['transhumance', 'bestiaux'],
    sea: ['maree', 'grandePeche'],
    orchard: ['verger', 'iles'],
    mountain: ['transhumance', 'expedition'],
    haras: ['haras'],
    brasserie: ['brasserie', 'cuvee'],
    oasis: ['souk'],
    nord: ['hiver'],
    asie: ['lanternes'],
    miel: ['miel'],
    mine: ['expedition'],
    textile: ['defile'],
    parfums: ['parfums', 'salonParfums'],
    confiserie: ['banquet', 'miel'],
};

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

// 1.96 : le podium de fin de saison : la force de chaque ferme rivale (comme à la Coupe), et la part du joueur
export const SEASON_RIVAL_F = [0.75, 0.9, 1, 1.05];
export const SEASON_RIVAL_BASE = 2500; // points d'une saison moyenne quand on n'a pas encore d'historique
