import { FISH } from './meta.js';
import { RECIPES } from './machines.js';
import { ITEMS } from './items.js';
import { NEW_DRINKS, NEW_DRINKS_134, NEW_DRINKS_154, NEW_DRINKS_155 } from './counter.js';

// Les grands défis (1.1, 24 défis depuis la 1.94) : un objectif de deux semaines après le niveau 64, tiré au hasard.
// Chaque défi a 4 étapes. Sortes d'étapes :
//   give    : livrer des produits, k tirés dans la liste (q : 0 tout, 1 argent ou mieux, 2 or), n chacun
//   count   : réussir une action (un compteur de state.stats qui avance pendant le défi)
//   animal  : présenter une bête dont les gènes dépassent ceux de son espèce d'au moins n points
//   variety : présenter une variété dont le gain de saveur atteint n
//   beer    : présenter une bière maison d'au moins n étoiles (1.18)
// open : ce qui doit être ouvert pour que le défi puisse sortir ; alt : étape de remplacement si l'étape demande
// une partie du jeu fermée (needs) ou des produits qu'on ne sait pas encore faire.

export const DEFI = {
    lvl: 64,
    days: 14,
    noRepeat: 3, // un défi joué ne revient qu'au 4e tirage après lui
    perStar: 0.08, // +8 % de quantités par étoile de renommée
    maxScale: 3,
    stepCoins: 6000, // par étape finie (× l'échelle)
    stepXp: 12000,
    medals: [
        // bronze, argent, or : pièces, part d'étoile de renommée, rubans
        { name: 'Bronze', coins: 30000, star: 0.25, rubans: 0, color: '#c8803a' },
        { name: 'Argent', coins: 60000, star: 0.5, rubans: 1, color: '#b9c2cc' },
        { name: 'Or', coins: 120000, star: 1, rubans: 2, color: '#f2c14e' },
        // 1.40 : platine (les 4 étapes, tout livré en or ou mieux) et diamant (platine en moins de 7 jours)
        { name: 'Platine', coins: 200000, star: 1.5, rubans: 3, color: '#b8aee0' },
        { name: 'Diamant', coins: 300000, star: 2, rubans: 4, color: '#7fd3f5' },
    ],
    diamondDays: 7,
    offer: 3, // 1.40 : on choisit son défi parmi trois
};

// 1.94 : les listes de produits se complètent toutes seules avec les recettes des machines (le contenu futur y entre sans y toucher)
const fromMachines = (...ms) =>
    Object.values(RECIPES)
        .filter(r => ms.includes(r.machine) && ITEMS[r.id] && ITEMS[r.id].sell)
        .map(r => r.id);
const merge = (...lists) => [...new Set(lists.flat())];

const ENTREES = [
    'soup',
    'salad',
    'quiche',
    'garlicSoup',
    'caprese',
    'fishSoup',
    'peasCarrots',
    'tian',
    'nicoise',
    'gazpacho',
    'leekVeloute',
    'peaVeloute',
    'pistou',
    'asparagusVeloute',
    'spinachQuiche',
    'pissaladiere',
];
const PLATS_BASE = [
    'lasagna',
    'risotto',
    'gratin',
    'ratatouille',
    'potee',
    'tartiflette',
    'mushroomRisotto',
    'bouillabaisse',
    'ravioli',
    'pizza',
    'cassoulet',
    'moussaka',
    'choucroute',
    'potAuFeu',
    'barigoule',
    'paella',
    'dhal',
    'stuffedCabbage',
    'saffronRisotto',
    'garlicBread',
];
const DESSERTS_BASE = [
    'pie',
    'cherryPie',
    'strawberryCake',
    'peachTart',
    'spongeCake',
    'blueberryPie',
    'vanillaFlan',
    'chocCake',
    'crepes',
    'tatin',
    'mirabelleTart',
    'apricotTart',
    'pumpkinPie',
    'cremeBrulee',
    'lemonTart',
    'rhubarbTart',
    'madeleines',
    'waffles',
    'walnutCake',
    'saffronBrioche',
];
const ANIMAL_BASE = [
    'milk',
    'egg',
    'wool',
    'goatMilk',
    'angora',
    'gooseEgg',
    'buffaloMilk',
    'donkeyMilk',
    'alpacaWool',
    'turkeyEgg',
    'quailEgg',
    'pigeonEgg',
    'guineaEgg',
    'pheasantEgg',
    'ostrichEgg',
    'yakMilk',
    'mohair',
];
const FRUITS = [
    'apple',
    'cherry',
    'peach',
    'orange',
    'kiwi',
    'kaki',
    'olive',
    'grape',
    'pear',
    'mirabelle',
    'apricot',
    'fig',
    'lemon',
    'quince',
    'plum',
    'mandarin',
    'grapefruit',
    'pomegranate',
    'pistachio',
];
const FRUIT_GOODS = [
    'jam',
    'cherryPie',
    'peachTart',
    'pie',
    'juice',
    'cider',
    'orangeJuice',
    'peachNectar',
    'fruitSalad',
    'grapeJuice',
    'pearJuice',
    'apricotJuice',
    'kiwiJuice',
    'pommeau',
    'tatin',
    'mirabelleTart',
    'apricotTart',
    'rhubarbJam',
    'kiwiJam',
    'marmalade',
    'quinceJelly',
];
const ISLE_RAW = [
    'banana',
    'coconut',
    'mango',
    'papaya',
    'lime',
    'avocado',
    'guava',
    'lychee',
    'dragonfruit',
    'cashew',
    'taro',
    'turmeric',
    'peanut',
    'redBean',
    'islandChili',
    'aloe',
    'hibiscus',
    'patchouli',
    'pineapple',
    'passionFruit',
    'sweetPotato',
    'cassava',
    'ginger',
    'tiare',
];
const ISLE_GOODS = [
    'islandCocktail',
    'bananaSmoothie',
    'mangoPassion',
    'lassi',
    'limeade',
    'bananaBread',
    'coconutFlan',
    'pineappleCake',
    'limePie',
    'blancManger',
    'papayaSmoothie',
    'lycheeCocktail',
    'bubbleTea',
    'coconutRice',
    'bananasFlambe',
    'cassavaCakes',
];
const ISLE_FINE = ['rum', 'arrangedRum', 'coconutPunch', 'coffee', 'cafeLatte', 'tiramisu', 'islandCoffee', 'coconutCoffee'];
const CHEESES = ['cheese', 'camembert', 'bleu', 'goatCheese', 'mozzarella', 'roquefort', 'truffleBrie', 'burrata', 'sheepTomme'];
const FINISH = ['forgeLantern', 'weathervane', 'paintedVase', 'vase', 'horseshoe', 'teaSet'];
const FISH_BASE = [
    'bouillabaisse',
    'grilledFish',
    'grilledMackerel',
    'lobsterDish',
    'fishSoup',
    'accras',
    'fishFritters',
    'perchMeuniere',
    'pikeQuenelles',
    'pochouse',
    'zanderLeeks',
    'salmonSteak',
    'crayfishGratin',
    'paella',
];
const PLATS = merge(PLATS_BASE, fromMachines('pizzeria', 'pastaworks', 'tajine', 'taigaPot'));
const DESSERTS = merge(DESSERTS_BASE, fromMachines('icecream', 'orientalSweets'), [
    'cloudberryTart',
    'lingonPastry',
    'birchGingerbread',
    'dateBread',
    'honeyIce',
]);
const ANIMAL_GOODS = merge(ANIMAL_BASE, ['camelMilk', 'reindeerMilk', 'ptarmiganEgg', 'camelWool', 'sheepMilk']);
const FISH_DISH = merge(FISH_BASE, fromMachines('fishmonger'));
const CANS = ['cannedSardines', 'mackerelRillettes', 'cannedShrimp', 'pondRillettes', 'mackerelWine', 'lobsterBisque'];
const ALP_CHEESE = ['beaufort', 'tomme', 'reblochon', 'comte'];
const ALP_DISH = ['raclette', 'fondue', 'tartiflette'];
const YARNS = ['cloth', 'angoraYarn', 'alpacaYarn', 'linen', 'cottonFabric', 'dyedWool'];
const DYES = ['redDye', 'yellowDye', 'blueDye'];
const CLOTHES = [
    'sweater',
    'scarf',
    'colorSweater',
    'woolHat',
    'alpacaScarf',
    'linenShirt',
    'tshirt',
    'strawHat',
    'quilt',
    'woolSocks',
    'angoraMittens',
    'plumedHat',
    'teaTowel',
];
const FLOWERS = ['lavender', 'vanilla', 'tiare'];
const SOAPS = ['lavenderSoap', 'goatSoap', 'oliveSoap', 'donkeySoap', 'coconutSoap', 'lavenderBag', 'scentedCandle', 'resinCandle', 'donkeyCream'];
const PERFUMES = ['lavenderWater', 'summerPerfume', 'vanillaPerfume', 'monoi', 'perfume', 'tiarePerfume'];

// 1.18 : les nouveaux défis
const FISHES = Object.entries(FISH)
    .filter(([, f]) => !f.junk)
    .map(([id]) => id);
const MINE_ORES = ['ironOre', 'copperOre', 'silverOre', 'goldOre'];
const MINE_GEMS = ['quartz', 'amethyst', 'ruby', 'sapphire', 'emerald'];
const MINE_INGOTS = ['ironIngot', 'copperIngot', 'silverIngot', 'goldIngot'];
const PUB_DISH = ['pizza', 'tartiflette', 'potee', 'choucroute', 'cassoulet', 'garlicBread'];
const WINES = ['redWine', 'whiteWine', 'roseWine', 'tableWine'];
const BUBBLES = ['champagne', 'champagneRose'];

// 1.94 : les pools des nouveaux défis
const HORSE_GOODS = ['horsehair', 'horseshoe', 'horsehairBrush'];
const OAT_GOODS = ['oat', 'oatFlakes', 'oatFlour', 'oatBread', 'oatCookies', 'oatGalette', 'porridge'];
const HONEY_GOODS = ['honey', 'honeyPot', 'honeyIce', 'candle', 'wax', 'waxBalm', 'honeyJujubes', 'buckthornHoney', 'quailHoney', 'yogurt'];
const HONEY_SWEET = ['honeyIce', 'honeyJujubes', 'parsnipCake', 'pizzaGoatHoney', 'birchGingerbread', 'honeyPot'];
const OASIS_RAW = ['date', 'jujube', 'cumin', 'sesame', 'camelMilk', 'camelWool', 'semolina'];
const OASIS_DISH = [
    'lemonTajine',
    'vegTajine',
    'couscous',
    'keftas',
    'dateTajine',
    'camelCouscous',
    'stuffedDates',
    'loukoum',
    'zebuTajine',
    'couscousRoyal',
    'mechoui',
    'dateTea',
];
const NORD_RAW = ['rye', 'lingonberry', 'cloudberry', 'seaBuckthorn', 'birchSap', 'spruce', 'reindeerMilk', 'ptarmiganEgg'];
const NORD_DISH = [
    'lingonStew',
    'lingonPastry',
    'cloudberryTart',
    'ryeBread',
    'ryePorridge',
    'lingonSoup',
    'reindeerCheese',
    'ptarmiganPasta',
    'cloudberryJam',
    'ryeKvas',
];
const GH_VEG = ['tomato', 'lettuce', 'pepper', 'basil', 'cucumber', 'mint'];
const GH_GOODS = ['peeledTomatoes', 'taboule', 'mintTea', 'mintIce', 'pepperCheese', 'pepperSaucisson', 'pepperMagret', 'kidMint'];
const ORCHIDS = ['orchid', 'orchidPerfume', 'orchidSoap', 'orchidDried'];
const NEIGHBOR_GOODS = ['jam', 'cheese', 'bread', 'honey', 'juice', 'cider', 'drySausage', 'pie'];
const PASTAS = fromMachines('pastaworks');
const PIZZAS = fromMachines('pizzeria');
const ITALIAN_SWEET = merge(['tiramisu'], fromMachines('icecream'));

export const DEFIS = {
    banquet: {
        name: 'Le banquet du village',
        who: 'gaston',
        icon: ['item', 'lasagna'],
        deco: 'banquetTable',
        intro: 'Tout le canton est invité ! Il me faut les plus beaux plats de la vallée.',
        steps: [
            { kind: 'give', name: 'Les entrées', pool: ENTREES, k: 2, n: 8, q: 1 },
            { kind: 'give', name: 'Les plats', pool: PLATS, k: 2, n: 6, q: 1 },
            { kind: 'give', name: 'Les desserts', pool: DESSERTS, k: 2, n: 6, q: 1 },
            { kind: 'give', name: 'Le plat d’honneur', pool: PLATS, k: 1, n: 3, q: 2 },
        ],
    },
    bestiaux: {
        name: 'La grande foire aux bestiaux',
        who: 'victor',
        icon: ['animal', 'cow'],
        deco: 'bullStatue',
        open: 'breed',
        intro: 'La foire revient ! Montrons au jury les plus belles bêtes du canton.',
        steps: [
            { kind: 'give', name: 'Les beaux produits', pool: ANIMAL_GOODS, k: 2, n: 15, q: 1 },
            { kind: 'count', name: 'Des naissances', stat: 'births', n: 3, icon: ['ui', 'heart'], text: 'Faire naître {n} petits à l’étable de sélection' },
            { kind: 'animal', name: 'La bête de concours', n: 3, text: 'Présenter une bête qui dépasse son espèce de {n} points de gènes' },
            { kind: 'count', name: 'Une création', stat: 'creations', n: 1, icon: ['ui', 'trophy'], text: 'Fixer une nouvelle race ou variété' },
        ],
    },
    verger: {
        name: 'Le verger d’exception',
        who: 'lucie',
        icon: ['item', 'apple'],
        deco: 'appleCart',
        intro: 'Je rêve d’un goûter avec tous les fruits du verger. Tu m’aides ?',
        steps: [
            { kind: 'give', name: 'Les paniers de fruits', pool: FRUITS, k: 3, n: 25, q: 0 },
            { kind: 'give', name: 'Confitures et douceurs', pool: FRUIT_GOODS, k: 2, n: 10, q: 0 },
            {
                kind: 'count',
                name: 'La cueillette',
                stat: 'orchardQual',
                n: 40,
                icon: ['ui', 'basket'],
                text: 'Ramasser {n} fruits de qualité argent ou or au verger de la ferme',
            },
            { kind: 'give', name: 'Le panier d’exception', pool: FRUITS, k: 1, n: 10, q: 1 },
        ],
    },
    iles: {
        name: 'La route des îles',
        who: 'tiago',
        icon: ['item', 'pineapple'],
        deco: 'hammock',
        open: 'island',
        intro: 'Les comptoirs du continent réclament nos merveilles. Le bac est prêt !',
        steps: [
            { kind: 'give', name: 'Les produits de l’île', pool: ISLE_RAW, k: 3, n: 25, q: 0 },
            { kind: 'give', name: 'Jus et pâtisseries', pool: ISLE_GOODS, k: 2, n: 8, q: 1 },
            { kind: 'give', name: 'Le meilleur des îles', pool: ISLE_FINE, k: 1, n: 6, q: 0 },
            { kind: 'count', name: 'Les plantations', stat: 'islandHarvest', n: 60, icon: ['item', 'banana'], text: 'Récolter {n} produits sur l’île' },
        ],
    },
    cave: {
        name: 'La cave du siècle',
        who: 'anselme',
        icon: ['ui', 'cave'],
        deco: 'honorBarrel',
        open: 'cave',
        intro: 'Les grands amateurs viendront goûter. Montrez-leur ce que vaut votre cave.',
        steps: [
            { kind: 'count', name: 'Les lots sortis', stat: 'caveLots', n: 6, icon: ['ui', 'cave'], text: 'Sortir {n} lots de la cave' },
            {
                kind: 'count',
                name: 'Le millésime',
                stat: 'vintageTop',
                n: 2,
                icon: ['ui', 'star'],
                text: 'Sortir {n} vins d’un millésime exceptionnel',
                needs: 'wine',
                alt: { kind: 'count', name: 'Les grands lots', stat: 'caveTop', n: 3, icon: ['ui', 'star'], text: 'Sortir {n} lots du 4e rang ou mieux' },
            },
            { kind: 'count', name: 'Le lot légendaire', stat: 'caveLegend', n: 1, icon: ['ui', 'star'], text: 'Affiner un lot jusqu’au rang légendaire' },
            {
                kind: 'count',
                name: 'Adjugé !',
                stat: 'auctionSold',
                n: 3,
                icon: ['ui', 'gavel'],
                text: 'Vendre {n} lots aux enchères',
                needs: 'hall',
                alt: { kind: 'give', name: 'Le plateau de fromages', pool: CHEESES, k: 2, n: 12, q: 1 },
            },
        ],
    },
    export: {
        name: 'Le grand export',
        who: 'morgane',
        icon: ['ui', 'trainIcon'],
        deco: 'miniLoco',
        open: 'train',
        intro: 'Les marchés du pays entier veulent nos produits. Chargez tout ce qui roule et ce qui flotte !',
        steps: [
            { kind: 'count', name: 'Les wagons', stat: 'wagons', n: 20, icon: ['ui', 'trainIcon'], text: 'Charger {n} wagons' },
            { kind: 'count', name: 'Les trains complets', stat: 'trucks', n: 4, icon: ['ui', 'trainIcon'], text: 'Remplir {n} trains complets' },
            {
                kind: 'count',
                name: 'Par la mer',
                stat: 'boats',
                n: 3,
                icon: ['ui', 'boat'],
                text: 'Remplir {n} cargos',
                needs: 'boat',
                alt: { kind: 'count', name: 'Par les airs', stat: 'balloons', n: 5, icon: ['ui', 'balloon'], text: 'Remplir {n} montgolfières' },
            },
            { kind: 'give', name: 'Les caisses', pool: ['crate'], k: 1, n: 40, q: 0 },
        ],
    },
    chateau: {
        name: 'Le château de la vallée',
        who: 'jules',
        icon: ['item', 'beam'],
        deco: 'castleTower',
        intro: 'Le vieux château tombe en ruine. Avec vos matériaux, on peut lui rendre sa fierté !',
        steps: [
            { kind: 'give', name: 'La charpente', pool: ['plank', 'beam'], k: 2, n: 120, q: 0 },
            { kind: 'give', name: 'Les murs', pool: ['stone', 'nail'], k: 2, n: 200, q: 0 },
            { kind: 'give', name: 'Les ateliers', pool: ['tools', 'paint'], k: 2, n: 30, q: 0 },
            {
                kind: 'give',
                name: 'Les finitions',
                pool: FINISH,
                k: 2,
                n: 6,
                q: 0,
                alt: { kind: 'give', name: 'Les caisses de l’intendance', pool: ['crate'], k: 1, n: 40, q: 0 },
            },
        ],
    },
    salon: {
        name: 'Le Salon national',
        who: 'agathe',
        icon: ['ui', 'trophy'],
        deco: 'bigMedal',
        open: 'lab',
        intro: 'Paris nous ouvre ses portes ! Il faut la variété la plus savoureuse du pays.',
        steps: [
            { kind: 'count', name: 'Les croisements', stat: 'crosses', n: 8, icon: ['ui', 'packet'], text: 'Réussir {n} croisements' },
            { kind: 'variety', name: 'La variété du Salon', n: 5, text: 'Présenter une variété qui gagne {n} points de saveur' },
            { kind: 'count', name: 'Une création', stat: 'creations', n: 1, icon: ['ui', 'trophy'], text: 'Fixer une nouvelle variété ou race' },
            { kind: 'count', name: 'Les plats d’or', stat: 'goldDishes', n: 12, icon: ['ui', 'star'], text: 'Sortir {n} produits en or de l’atelier' },
        ],
    },
    maree: {
        name: 'La grande marée',
        who: 'yann',
        icon: ['item', 'lobster'],
        deco: 'miniLighthouse',
        open: 'net',
        intro: 'Grande marée cette semaine : la criée attend la plus belle pêche de l’année !',
        steps: [
            { kind: 'count', name: 'Les filets', stat: 'seaHauls', n: 8, icon: ['item', 'sardine'], text: 'Remonter {n} filets en mer' },
            { kind: 'give', name: 'Le homard', pool: ['lobster'], k: 1, n: 1, q: 0 },
            {
                kind: 'give',
                name: 'Les conserves',
                pool: CANS,
                k: 2,
                n: 8,
                q: 0,
                needs: 'cannery',
                alt: { kind: 'give', name: 'La pêche du jour', pool: ['sardine', 'mackerel', 'shrimp', 'seabass'], k: 2, n: 15, q: 0 },
            },
            { kind: 'give', name: 'Le plat de la marée', pool: FISH_DISH, k: 1, n: 4, q: 2 },
        ],
    },
    transhumance: {
        name: 'La transhumance d’honneur',
        who: 'bruno',
        icon: ['item', 'alpineMilk'],
        deco: 'miniChalet',
        open: 'trans',
        intro: 'Toute la vallée montera voir passer nos bêtes. Que la fête soit belle !',
        steps: [
            { kind: 'count', name: 'Les montées', stat: 'trans', n: 3, icon: ['animal', 'cow'], text: 'Mener {n} transhumances' },
            { kind: 'give', name: 'Le lait d’alpage', pool: ['alpineMilk'], k: 1, n: 30, q: 0 },
            { kind: 'give', name: 'Les fromages d’alpage', pool: ALP_CHEESE, k: 2, n: 6, q: 0 },
            { kind: 'give', name: 'Le repas des estives', pool: ALP_DISH, k: 2, n: 5, q: 1 },
        ],
    },
    defile: {
        name: 'Le défilé de la vallée',
        who: 'odette',
        icon: ['item', 'sweater'],
        deco: 'mannequin',
        intro: 'De mon temps, on tricotait pour le défilé du village. Faisons-le revivre, mon petit !',
        steps: [
            { kind: 'give', name: 'Les fils et les toiles', pool: YARNS, k: 2, n: 15, q: 0 },
            { kind: 'give', name: 'Les teintures', pool: DYES, k: 2, n: 10, q: 0 },
            { kind: 'give', name: 'La collection', pool: CLOTHES, k: 3, n: 5, q: 0 },
            { kind: 'give', name: 'La pièce maîtresse', pool: CLOTHES, k: 1, n: 3, q: 2 },
        ],
    },
    parfums: {
        name: 'Le jardin des parfums',
        who: 'rose',
        icon: ['item', 'lavender'],
        deco: 'perfumeFountain',
        open: 'soap',
        intro: 'Un jardin où chaque allée sent bon… et une boutique pour ses parfums. Vous m’aidez ?',
        steps: [
            { kind: 'give', name: 'Les fleurs', pool: FLOWERS, k: 2, n: 40, q: 0 },
            { kind: 'give', name: 'Les savons', pool: SOAPS, k: 2, n: 8, q: 0 },
            { kind: 'give', name: 'Les eaux et parfums', pool: PERFUMES, k: 2, n: 5, q: 0 },
            {
                kind: 'give',
                name: 'Le Grand parfum',
                pool: ['grandParfum'],
                k: 1,
                n: 2,
                q: 1,
                needs: 'perfumery',
                alt: { kind: 'give', name: 'Les bougies', pool: ['scentedCandle', 'candle', 'waxBalm'], k: 2, n: 8, q: 1 },
            },
        ],
    },
    brasserie: {
        name: 'La fête de la brasserie',
        who: 'hugues',
        icon: ['ui', 'beer'],
        deco: 'brewBarrel',
        open: 'brew',
        intro: 'Toute l’abbaye lèvera son verre ! Il me faut du houblon, de la patience et de belles cuvées.',
        steps: [
            { kind: 'count', name: 'Les cuvées', stat: 'beers', n: 24, icon: ['ui', 'beer'], text: 'Brasser {n} bouteilles' },
            { kind: 'count', name: 'Les commandes', stat: 'beerOrders', n: 3, icon: ['ui', 'beer'], text: 'Livrer {n} commandes de bière' },
            { kind: 'beer', name: 'La bière de la maison', n: 2, text: 'Présenter une bière maison de {n} étoiles' },
            { kind: 'give', name: 'Le plat de la brasserie', pool: PUB_DISH, k: 1, n: 4, q: 2 },
        ],
    },
    comptoir: {
        name: 'Le comptoir en fête',
        who: 'paul',
        icon: ['item', 'cappuccino'],
        deco: 'neonSign',
        open: 'counter',
        intro: 'Un café de quartier, ça se juge au sourire des clients. Faisons chanter le comptoir !',
        steps: [
            { kind: 'count', name: 'Les clients', stat: 'clients', n: 12, icon: ['villager', 'paul'], text: 'Servir {n} clients au comptoir' },
            { kind: 'count', name: 'Les trois étoiles', stat: 'perfectDrinks', n: 6, icon: ['ui', 'star'], text: 'Réussir {n} boissons à 3 étoiles' },
            {
                kind: 'give',
                name: 'La carte des boissons',
                pool: [...NEW_DRINKS, ...NEW_DRINKS_134, ...NEW_DRINKS_154, ...NEW_DRINKS_155].map(d => d[0]),
                k: 2,
                n: 6,
                q: 1,
            },
            { kind: 'count', name: 'Le service', stat: 'drinks', n: 30, icon: ['item', 'espresso'], text: 'Préparer {n} boissons' },
        ],
    },
    grandePeche: {
        name: 'La grande pêche',
        who: 'marcel',
        icon: ['item', 'perch'],
        deco: 'fishTrophy',
        open: 'pond',
        intro: 'Moi, j’ai vu passer un brochet gros comme ça. Montre-moi ce que tu sais faire, petit.',
        steps: [
            { kind: 'count', name: 'La pêche', stat: 'fish', n: 40, icon: ['item', 'perch'], text: 'Pêcher {n} poissons' },
            { kind: 'count', name: 'Les prises parfaites', stat: 'perfectFish', n: 8, icon: ['ui', 'star'], text: 'Réussir {n} prises parfaites' },
            { kind: 'give', name: 'Les belles prises', pool: FISHES, k: 3, n: 4, q: 0 },
            { kind: 'give', name: 'Le plat de l’étang', pool: FISH_DISH, k: 1, n: 4, q: 2 },
        ],
    },
    expedition: {
        name: 'L’expédition de la mine',
        who: 'gaspard',
        icon: ['item', 'ruby'],
        deco: 'minecart',
        open: 'gallery',
        intro: 'Lampe au front, pioche en main : on descend ! Il y a de quoi faire briller le village.',
        steps: [
            { kind: 'count', name: 'La descente', stat: 'deepMined', n: 40, icon: ['item', 'ironOre'], text: 'Casser {n} blocs en galerie ou en grotte' },
            { kind: 'give', name: 'Les minerais', pool: MINE_ORES, k: 2, n: 15, q: 0 },
            { kind: 'give', name: 'Les gemmes', pool: MINE_GEMS, k: 2, n: 3, q: 0 },
            {
                kind: 'give',
                name: 'La forge',
                pool: MINE_INGOTS,
                k: 2,
                n: 6,
                q: 0,
                alt: { kind: 'count', name: 'Les filons', stat: 'veins', n: 6, icon: ['item', 'quartz'], text: 'Briser {n} filons de gemmes' },
            },
        ],
    },
    cuvee: {
        name: 'La grande cuvée',
        who: 'margaux',
        icon: ['item', 'champagne'],
        deco: 'champagneRack',
        open: 'wine',
        intro: 'Chaque millésime raconte une année. Faisons de celle-ci la plus belle de la vallée.',
        steps: [
            { kind: 'give', name: 'Les vins', pool: WINES, k: 2, n: 8, q: 1 },
            { kind: 'give', name: 'Les bulles', pool: BUBBLES, k: 1, n: 4, q: 1 },
            { kind: 'count', name: 'Les cuvées baptisées', stat: 'cuvees', n: 2, icon: ['ui', 'cave'], text: 'Sortir {n} cuvées baptisées de la cave' },
            { kind: 'count', name: 'Les millésimes', stat: 'vintageTop', n: 3, icon: ['ui', 'star'], text: 'Sortir {n} vins d’un millésime exceptionnel' },
        ],
    },
    haras: {
        name: 'Le grand concours équestre',
        who: 'lea',
        icon: ['item', 'horseshoe'],
        deco: 'horseRosette',
        open: 'stud',
        intro: 'Les cavaliers de toute la vallée arrivent au haras ! Montrons-leur de belles bêtes bien dressées.',
        steps: [
            { kind: 'give', name: 'Le crin et le fer', pool: HORSE_GOODS, k: 2, n: 8, q: 0 },
            { kind: 'count', name: 'Les poulains', stat: 'foals', n: 1, icon: ['ui', 'heart'], text: 'Faire naître {n} poulain au haras' },
            { kind: 'count', name: 'Les dressages', stat: 'trained', n: 8, icon: ['ui', 'star'], text: 'Réussir {n} séances de dressage' },
            { kind: 'give', name: 'L’avoine du concours', pool: OAT_GOODS, k: 2, n: 10, q: 1 },
        ],
    },
    miel: {
        name: 'La route du miel',
        who: 'maeva',
        icon: ['item', 'honey'],
        deco: 'goldenHive',
        open: 'apiary',
        intro: 'Les abeilles ont bien travaillé. Il faut des pots pleins, des bougies, et de quoi trinquer !',
        steps: [
            { kind: 'count', name: 'La miellée', stat: 'apiaryHoney', n: 16, icon: ['item', 'honey'], text: 'Récolter {n} pots dans les ruchers des contrées' },
            { kind: 'give', name: 'Les pots et la cire', pool: HONEY_GOODS, k: 3, n: 8, q: 0 },
            {
                kind: 'count',
                name: 'L’hydromel',
                stat: 'meads',
                n: 6,
                icon: ['ui', 'beer'],
                text: 'Brasser {n} bouteilles d’hydromel',
                needs: 'mead',
                alt: { kind: 'give', name: 'Les gourmandises', pool: HONEY_SWEET, k: 2, n: 6, q: 0 },
            },
            { kind: 'give', name: 'Les douceurs au miel', pool: HONEY_SWEET, k: 1, n: 5, q: 1 },
        ],
    },
    souk: {
        name: 'La caravane du souk',
        who: 'idris',
        icon: ['item', 'date'],
        deco: 'souqLantern',
        open: 'oasis',
        intro: 'Les chameaux sont chargés et le souk vous attend. Que la caravane soit belle !',
        steps: [
            { kind: 'count', name: 'Les récoltes', stat: 'oasisHarvest', n: 50, icon: ['item', 'date'], text: 'Récolter {n} produits à l’oasis' },
            {
                kind: 'count',
                name: 'Les caravanes',
                stat: 'caravans',
                n: 2,
                icon: ['item', 'camelMilk'],
                text: 'Envoyer {n} caravanes',
                needs: 'caravan',
                alt: { kind: 'give', name: 'Les épices', pool: OASIS_RAW, k: 2, n: 20, q: 0 },
            },
            { kind: 'give', name: 'Les trésors du désert', pool: OASIS_RAW, k: 3, n: 20, q: 0 },
            { kind: 'give', name: 'La table du caravanier', pool: OASIS_DISH, k: 2, n: 5, q: 1 },
        ],
    },
    hiver: {
        name: 'Le grand hiver du Nord',
        who: 'tuomas',
        icon: ['item', 'lingonberry'],
        deco: 'northSled',
        open: 'nord',
        intro: 'La neige tient jusqu’au printemps. Ici on prépare, on partage, on fait chauffer le poêle !',
        steps: [
            { kind: 'count', name: 'Les récoltes', stat: 'nordHarvest', n: 50, icon: ['item', 'lingonberry'], text: 'Récolter {n} produits au Grand Nord' },
            { kind: 'count', name: 'Les traîneaux', stat: 'sleds', n: 3, icon: ['animal', 'reindeer'], text: 'Mener {n} traîneaux' },
            { kind: 'give', name: 'Les provisions', pool: NORD_RAW, k: 3, n: 20, q: 0 },
            { kind: 'give', name: 'La table du poêle', pool: NORD_DISH, k: 2, n: 5, q: 1 },
        ],
    },
    serre: {
        name: 'La serre en fête',
        who: 'yasmine',
        icon: ['item', 'orchid'],
        deco: 'orchidPot',
        open: 'greenhouse',
        intro: 'Sous verre, c’est l’été toute l’année. Remplissons la serre de couleurs et de saveurs !',
        steps: [
            { kind: 'give', name: 'La récolte sous verre', pool: GH_VEG, k: 3, n: 25, q: 0 },
            { kind: 'give', name: 'Les herbes et les piments', pool: GH_GOODS, k: 2, n: 6, q: 0 },
            { kind: 'give', name: 'Les orchidées', pool: ORCHIDS, k: 1, n: 6, q: 0 },
            { kind: 'give', name: 'La récolte d’or', pool: GH_VEG, k: 1, n: 12, q: 2 },
        ],
    },
    voisins: {
        name: 'La fête des voisins',
        who: 'ines',
        icon: ['ui', 'heart'],
        deco: 'neighborBench',
        open: 'nmarket',
        intro: 'Un bon voisin, c’est un trésor ! Rendons service, échangeons, et trinquons ensemble.',
        steps: [
            { kind: 'count', name: 'Les coups de main', stat: 'neighborHelps', n: 6, icon: ['ui', 'heart'], text: 'Rendre {n} services aux voisins' },
            { kind: 'count', name: 'Le marché des voisins', stat: 'neighborBuys', n: 5, icon: ['ui', 'coin'], text: 'Faire {n} achats au marché des voisins' },
            { kind: 'count', name: 'L’étal', stat: 'stallSales', n: 15, icon: ['ui', 'basket'], text: 'Vendre {n} fois à l’étal de la ferme' },
            { kind: 'give', name: 'Le panier de bienvenue', pool: NEIGHBOR_GOODS, k: 3, n: 8, q: 1 },
        ],
    },
    tablee: {
        name: 'La grande tablée italienne',
        who: 'gaston',
        icon: ['item', 'pizza'],
        deco: 'pizzaOven',
        open: 'italian',
        intro: 'Des pâtes, des pizzas, de la bonne humeur : on met les couverts pour tout le village !',
        steps: [
            { kind: 'give', name: 'Les pâtes', pool: PASTAS, k: 2, n: 8, q: 0 },
            { kind: 'give', name: 'Les pizzas', pool: PIZZAS, k: 2, n: 6, q: 1 },
            { kind: 'give', name: 'Les douceurs', pool: ITALIAN_SWEET, k: 2, n: 6, q: 0 },
            { kind: 'give', name: 'La pizza d’honneur', pool: PIZZAS, k: 1, n: 3, q: 2 },
        ],
    },
};

// 1.96 : les défis éclair : une seule étape à compter, trois jours, entre deux grands défis
export const MINI = {
    days: 3,
    coins: 0.5, // la moitié d'une étape de grand défi
    milestones: [5, 15, 30], // un souvenir dans l'album à chaque palier
    list: [
        { id: 'clients', stat: 'clients', n: 10, open: 'counter', icon: ['villager', 'paul'], text: 'Servir {n} clients au comptoir' },
        { id: 'drinks', stat: 'drinks', n: 25, open: 'counter', icon: ['item', 'espresso'], text: 'Préparer {n} boissons' },
        { id: 'fish', stat: 'fish', n: 30, open: 'pond', icon: ['item', 'perch'], text: 'Pêcher {n} poissons' },
        { id: 'sea', stat: 'seaHauls', n: 6, open: 'net', icon: ['item', 'sardine'], text: 'Remonter {n} filets en mer' },
        { id: 'wagons', stat: 'wagons', n: 15, open: 'train', icon: ['ui', 'trainIcon'], text: 'Charger {n} wagons' },
        { id: 'births', stat: 'births', n: 2, open: 'breed', icon: ['ui', 'heart'], text: 'Faire naître {n} petits à l’étable de sélection' },
        { id: 'foals', stat: 'foals', n: 1, open: 'stud', icon: ['item', 'horseshoe'], text: 'Faire naître {n} poulain au haras' },
        { id: 'trained', stat: 'trained', n: 6, open: 'stud', icon: ['ui', 'star'], text: 'Réussir {n} séances de dressage' },
        { id: 'honey', stat: 'apiaryHoney', n: 12, open: 'apiary', icon: ['item', 'honey'], text: 'Récolter {n} pots dans les ruchers des contrées' },
        { id: 'mine', stat: 'deepMined', n: 30, open: 'gallery', icon: ['item', 'ironOre'], text: 'Casser {n} blocs en galerie ou en grotte' },
        { id: 'island', stat: 'islandHarvest', n: 40, open: 'island', icon: ['item', 'banana'], text: 'Récolter {n} produits sur l’île' },
        { id: 'oasis', stat: 'oasisHarvest', n: 40, open: 'oasis', icon: ['item', 'date'], text: 'Récolter {n} produits à l’oasis' },
        { id: 'nord', stat: 'nordHarvest', n: 40, open: 'nord', icon: ['item', 'lingonberry'], text: 'Récolter {n} produits au Grand Nord' },
        { id: 'help', stat: 'neighborHelps', n: 4, open: 'nmarket', icon: ['ui', 'heart'], text: 'Rendre {n} services aux voisins' },
        { id: 'stall', stat: 'stallSales', n: 12, open: 'nmarket', icon: ['ui', 'basket'], text: 'Vendre {n} fois à l’étal de la ferme' },
        { id: 'beers', stat: 'beers', n: 12, open: 'brew', icon: ['ui', 'beer'], text: 'Brasser {n} bouteilles' },
        { id: 'lots', stat: 'caveLots', n: 4, open: 'cave', icon: ['ui', 'cave'], text: 'Sortir {n} lots de la cave' },
        { id: 'gold', stat: 'goldDishes', n: 8, open: null, icon: ['ui', 'star'], text: 'Sortir {n} produits en or de l’atelier' },
    ],
};
