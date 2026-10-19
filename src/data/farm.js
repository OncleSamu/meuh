import { LV_DECO, LV_UPG } from './levels14.js';
// Le champ, la serre, les sols, la qualité, les décorations, le chien, les engins et les styles.
// Valeurs reprises telles quelles de la version 6.2 (même équilibre).

export const GRID = {
    maxPlots: 48,
    basePlots: 12,
    expBaseCost: 100,
    expMult: 1.18,
};

export const COLS = 6;

export const UPGRADES = {
    speed: {
        id: 'speed',
        name: 'Engrais magique',
        desc: 'Tout produit 10 % plus vite par niveau',
        baseCost: 500,
        mult: 2.5,
        maxLvl: 5,
        reqLvl: 6,
    },
    price: {
        id: 'price',
        name: 'Négociation',
        desc: 'Par niveau : marché +10 %, commandes +4 %',
        baseCost: 1000,
        mult: 3,
        maxLvl: 5,
        reqLvl: 10,
    },
    yield: {
        id: 'yield',
        name: 'Abondance',
        desc: '+10 % de chance de double récolte par niveau',
        baseCost: 2000,
        mult: 4,
        maxLvl: 5,
        reqLvl: 14,
    },
    feeder: {
        id: 'feeder',
        name: 'Mangeoire automatique',
        desc: 'Les animaux affamés se servent seuls dans le stock de nourriture, même pendant votre absence',
        baseCost: 6000,
        mult: 1,
        maxLvl: 1,
        reqLvl: 12,
    },
    seeder: {
        id: 'seeder',
        name: 'Semoir',
        desc: 'Une graine plantée sème toute la rangée (sur les parcelles labourées et vides)',
        baseCost: 15000,
        mult: 1,
        maxLvl: 1,
        reqLvl: 13,
    },
    harvester: {
        id: 'harvester',
        name: 'Moissonneuse',
        desc: 'Une rangée entière d’une même culture donne 35 % de récolte en plus',
        baseCost: 45000,
        mult: 1,
        maxLvl: 1,
        reqLvl: 19,
    },
};

export const GH = {
    lvl: 15,
    cost: 6000,
    basePlots: 6,
    maxPlots: 12,
    plotCost: 1000,
    plotMult: 1.35,
    rate: 1.6,
};

export const QUALITY = [
    {
        id: 0,
        name: 'normale',
        mult: 1,
    },
    {
        id: 1,
        name: 'argent',
        mult: 1.25,
        color: '#c9d3dc',
    },
    {
        id: 2,
        name: 'or',
        mult: 1.6,
        color: '#ffd23f',
    },
];

export const SOILS = {
    wet: {
        name: 'Sol humide',
        icon: 'soilWet',
        crops: [
            'carrot',
            'potato',
            'cabbage',
            'peas',
            'beet',
            'lettuce',
            'zucchini',
            'rice',
            'sugarcane',
            'hop',
            'flax',
            'greenBean',
            'asparagus',
            'spinach',
            'cucumber',
            'rhubarb',
        ],
    },
    dry: {
        name: 'Sol sec et ensoleillé',
        icon: 'soilDry',
        crops: [
            'wheat',
            'corn',
            'tomato',
            'pepper',
            'eggplant',
            'lavender',
            'cotton',
            'watermelon',
            'pineapple',
            'sunflower',
            'soy',
            'grape',
            'olive',
            'basil',
            'lentil',
            'melon',
            'artichoke',
            'buckwheat',
            'espelette',
            'barley',
        ],
    },
    shade: {
        name: 'Sol ombragé',
        icon: 'soilShade',
        crops: ['strawberry', 'pumpkin', 'onion', 'radish', 'saffron', 'garlic', 'tea', 'blueberry', 'genepi', 'mushroom', 'leek', 'mustard', 'raspberry'],
    },
};

export const SOIL_BONUS = {
    speed: 1.25,
    quality: 0.12,
};

export const DECOS = {
    birdhouse: {
        id: 'birdhouse',
        name: 'Nichoir',
        desc: 'Les corbeaux ne se posent pas sur les parcelles voisines',
        cost: 600,
        reqLvl: 5,
        charm: 5,
    },
    flowers: {
        id: 'flowers',
        name: 'Parterre de fleurs',
        desc: 'Voisines : +10 % de chances de qualité argent ou or',
        cost: 800,
        reqLvl: 7,
        charm: 10,
    },
    hive: {
        id: 'hive',
        name: 'Ruche',
        desc: 'Les abeilles font pousser les voisines 15 % plus vite',
        cost: 1200,
        reqLvl: 11,
        charm: 6,
    },
    well: {
        id: 'well',
        name: 'Puits',
        desc: 'Arrose automatiquement les 8 parcelles voisines',
        cost: 2000,
        reqLvl: 12,
        charm: 8,
    },
    gnome: {
        id: 'gnome',
        name: 'Nain de jardin',
        desc: 'Double les chances de récolte dorée des voisines',
        cost: 1500,
        reqLvl: 15,
        charm: 12,
    },
    scarecrow: {
        id: 'scarecrow',
        name: 'Épouvantail',
        desc: 'Éloigne 75 % des corbeaux de toute la ferme',
        cost: 1500,
        reqLvl: 9,
        charm: 8,
    },
    statue: {
        id: 'statue',
        name: 'Statue dorée',
        desc: 'Pure élégance : +40 points de charme au concours',
        cost: 4000,
        reqLvl: 1,
        charm: 40,
        rare: true,
    },
    lantern: {
        id: 'lantern',
        name: 'Lanterne',
        desc: 'Une douce lumière : +15 points de charme au concours',
        cost: 1500,
        reqLvl: 1,
        charm: 15,
        rare: true,
    },
    goldCow: {
        id: 'goldCow',
        name: 'Vache dorée',
        desc: 'Le trophée des Fermes légendaires : +100 points de charme au concours',
        cost: 0,
        reqLvl: 1,
        charm: 100,
        rare: true,
    },
    lightningRod: {
        id: 'lightningRod',
        name: 'Paratonnerre',
        desc: 'Protège tout le champ de la foudre pendant les orages',
        cost: 2500,
        reqLvl: 9,
        charm: 6,
    },
    cheeseWheel: {
        id: 'cheeseWheel',
        name: "Meule d'or",
        desc: 'Trophée de la saison des fromages : +30 de charme au concours',
        cost: 0,
        reqLvl: 1,
        charm: 30,
        rare: true,
    },
    anchorDeco: {
        id: 'anchorDeco',
        name: 'Ancre marine',
        desc: 'Trophée de la saison de la mer : +30 de charme au concours',
        cost: 0,
        reqLvl: 1,
        charm: 30,
        rare: true,
    },
    orchardSwing: {
        id: 'orchardSwing',
        name: 'Balançoire du verger',
        desc: 'Trophée de la saison des vergers : +30 de charme au concours',
        cost: 0,
        reqLvl: 1,
        charm: 30,
        rare: true,
    },
    // la nuit (1.2)
    owlBox: {
        id: 'owlBox',
        name: 'Nichoir à chouette',
        desc: 'Une chouette s’y installe et chasse les corbeaux (6 sur 10) : +10 de charme au concours',
        cost: 4000,
        reqLvl: 15,
        charm: 10,
    },
    fireflyJar: {
        id: 'fireflyJar',
        name: 'Lanterne à lucioles',
        desc: 'Votre premier bocal de lucioles, qui brille doucement : +25 de charme au concours',
        cost: 0,
        reqLvl: 1,
        charm: 25,
        rare: true,
    },
    // les grands défis (1.1) : une décoration unique par défi gagné en or
    banquetTable: {
        id: 'banquetTable',
        name: 'Table du banquet',
        desc: 'Grand défi en or : Le banquet du village. +50 de charme au concours',
        cost: 0,
        reqLvl: 1,
        charm: 50,
        rare: true,
    },
    bullStatue: {
        id: 'bullStatue',
        name: 'Statue du taureau',
        desc: 'Grand défi en or : La grande foire aux bestiaux. +50 de charme au concours',
        cost: 0,
        reqLvl: 1,
        charm: 50,
        rare: true,
    },
    appleCart: {
        id: 'appleCart',
        name: 'Brouette de pommes',
        desc: 'Grand défi en or : Le verger d’exception. +50 de charme au concours',
        cost: 0,
        reqLvl: 1,
        charm: 50,
        rare: true,
    },
    hammock: {
        id: 'hammock',
        name: 'Hamac des îles',
        desc: 'Grand défi en or : La route des îles. +50 de charme au concours',
        cost: 0,
        reqLvl: 1,
        charm: 50,
        rare: true,
    },
    honorBarrel: {
        id: 'honorBarrel',
        name: 'Tonneau d’honneur',
        desc: 'Grand défi en or : La cave du siècle. +50 de charme au concours',
        cost: 0,
        reqLvl: 1,
        charm: 50,
        rare: true,
    },
    miniLoco: {
        id: 'miniLoco',
        name: 'Locomotive miniature',
        desc: 'Grand défi en or : Le grand export. +50 de charme au concours',
        cost: 0,
        reqLvl: 1,
        charm: 50,
        rare: true,
    },
    castleTower: {
        id: 'castleTower',
        name: 'Tour du château',
        desc: 'Grand défi en or : Le château de la vallée. +50 de charme au concours',
        cost: 0,
        reqLvl: 1,
        charm: 50,
        rare: true,
    },
    bigMedal: {
        id: 'bigMedal',
        name: 'Médaille géante',
        desc: 'Grand défi en or : Le Salon national. +50 de charme au concours',
        cost: 0,
        reqLvl: 1,
        charm: 50,
        rare: true,
    },
    miniLighthouse: {
        id: 'miniLighthouse',
        name: 'Phare miniature',
        desc: 'Grand défi en or : La grande marée. +50 de charme au concours',
        cost: 0,
        reqLvl: 1,
        charm: 50,
        rare: true,
    },
    miniChalet: {
        id: 'miniChalet',
        name: 'Chalet miniature',
        desc: 'Grand défi en or : La transhumance d’honneur. +50 de charme au concours',
        cost: 0,
        reqLvl: 1,
        charm: 50,
        rare: true,
    },
    mannequin: {
        id: 'mannequin',
        name: 'Mannequin de couture',
        desc: 'Grand défi en or : Le défilé de la vallée. +50 de charme au concours',
        cost: 0,
        reqLvl: 1,
        charm: 50,
        rare: true,
    },
    perfumeFountain: {
        id: 'perfumeFountain',
        name: 'Fontaine parfumée',
        desc: 'Grand défi en or : Le jardin des parfums. +50 de charme au concours',
        cost: 0,
        reqLvl: 1,
        charm: 50,
        rare: true,
    },
    brewBarrel: {
        id: 'brewBarrel',
        name: 'Fût de la brasserie',
        desc: 'Grand défi en or : La fête de la brasserie. +50 de charme au concours',
        cost: 0,
        reqLvl: 1,
        charm: 50,
        rare: true,
    },
    neonSign: {
        id: 'neonSign',
        name: 'Enseigne du comptoir',
        desc: 'Grand défi en or : Le comptoir en fête. +50 de charme au concours',
        cost: 0,
        reqLvl: 1,
        charm: 50,
        rare: true,
    },
    fishTrophy: {
        id: 'fishTrophy',
        name: 'Poisson trophée',
        desc: 'Grand défi en or : La grande pêche. +50 de charme au concours',
        cost: 0,
        reqLvl: 1,
        charm: 50,
        rare: true,
    },
    minecart: {
        id: 'minecart',
        name: 'Wagonnet de la mine',
        desc: 'Grand défi en or : L’expédition de la mine. +50 de charme au concours',
        cost: 0,
        reqLvl: 1,
        charm: 50,
        rare: true,
    },
    champagneRack: {
        id: 'champagneRack',
        name: 'Pupitre à champagne',
        desc: 'Grand défi en or : La grande cuvée. +50 de charme au concours',
        cost: 0,
        reqLvl: 1,
        charm: 50,
        rare: true,
    },
    cowbell: {
        id: 'cowbell',
        name: 'Grande cloche',
        desc: 'Trophée de la saison de la montagne : +30 de charme au concours',
        cost: 0,
        reqLvl: 1,
        charm: 30,
        rare: true,
    },
    oldPress: {
        id: 'oldPress',
        name: 'Pressoir ancien',
        desc: 'Trouvé à la grande vente : +30 de charme au concours',
        cost: 0,
        reqLvl: 1,
        charm: 30,
        rare: true,
    },
    duckPond: {
        id: 'duckPond',
        name: 'Mare aux canards',
        desc: 'Les canards mangent les pucerons des 8 voisines',
        cost: 5000,
        reqLvl: 13,
        charm: 10,
    },
    miniMill: {
        id: 'miniMill',
        name: 'Moulin miniature',
        desc: 'Voisines : 25 % de chances de récolte double',
        cost: 7000,
        reqLvl: 16,
        charm: 12,
    },
    flowerArch: {
        id: 'flowerArch',
        name: 'Arche fleurie',
        desc: 'Voisines : poussent 10 % plus vite ; +20 de charme',
        cost: 9000,
        reqLvl: 20,
        charm: 20,
    },
    copperBell: {
        id: 'copperBell',
        name: 'Cloche de cuivre',
        desc: 'Voisines : poussent 8 % plus vite ; +14 de charme',
        cost: 6000,
        reqLvl: 26,
        charm: 14,
    },
    oakBench: {
        id: 'oakBench',
        name: 'Banc de chêne',
        desc: 'Voisines : 10 % de chances de plus d’une récolte argent ou or ; +16 de charme',
        cost: 8000,
        reqLvl: 28,
        charm: 16,
    },
    ironLamp: {
        id: 'ironLamp',
        name: 'Lanterne de fer',
        desc: 'Voisines : poussent 8 % plus vite ; +14 de charme',
        cost: 7000,
        reqLvl: 30,
        charm: 14,
    },
    jackLantern: {
        id: 'jackLantern',
        name: 'Citrouille-lanterne',
        desc: 'Trophée d’Halloween : +30 de charme au concours',
        cost: 0,
        reqLvl: 1,
        charm: 30,
        rare: true,
    },
    xmasTree: {
        id: 'xmasTree',
        name: 'Sapin de Noël',
        desc: 'Trophée de Noël : +30 de charme au concours',
        cost: 0,
        reqLvl: 1,
        charm: 30,
        rare: true,
    },
    easterBunny: {
        id: 'easterBunny',
        name: 'Lapin de Pâques',
        desc: 'Trophée de Pâques : +30 de charme au concours',
        cost: 0,
        reqLvl: 1,
        charm: 30,
        rare: true,
    },
    goldenBook: {
        id: 'goldenBook',
        name: 'Livre d’or',
        desc: 'Le Livre de la ferme est complet : +40 de charme au concours',
        cost: 0,
        reqLvl: 1,
        charm: 40,
        rare: true,
    },
};

export const DOG = {
    cost: 1000,
    reqLvl: 6,
    findMin: 150,
    findMax: 270,
    chaseDelay: 3500,
};

export const HONEY_MAX = 5;

export const CROW_LVL = 3;

export const CROW_TIME = 15000;

export const HONEY_BASE = 240;

export const HARVESTER_BONUS = 0.35;

export const LIGHTNING_CHANCE = 0.011111111111111112;

export const MAT = {
    machine: {
        deli: { wood: 8, stone: 6 },
        crepery: { wood: 12, stone: 8 },
        malthouse: { wood: 20, stone: 20 },
        pastry: { wood: 10, stone: 6 },
        fishmonger: { wood: 10, stone: 8 },
        stove: { wood: 8, stone: 14 },
        dryer: { wood: 16, stone: 4 },
        still: { wood: 10, stone: 18 },
        mill: {
            wood: 4,
        },
        // 1.8 : la première machine ne demande pas de bois (la forêt s'ouvre au niveau 3)
        bakery: null,
        press: {
            wood: 10,
            stone: 4,
        },
        loom: {
            wood: 12,
            stone: 4,
        },
        kitchen: {
            wood: 10,
            stone: 8,
        },
        dairy: {
            wood: 14,
            stone: 12,
        },
        smokehouse: {
            wood: 10,
            stone: 6,
        },
        tailor: {
            wood: 14,
            stone: 4,
        },
        confectionery: {
            wood: 12,
            stone: 10,
        },
        icecream: {
            wood: 10,
            stone: 14,
        },
        soapworks: {
            wood: 16,
            stone: 14,
        },
        sawmill: {
            wood: 8,
        },
        oilmill: {
            wood: 10,
            stone: 6,
        },
        forge: {
            stone: 12,
        },
        pottery: {
            wood: 10,
            stone: 16,
        },
        pastaworks: {
            wood: 16,
            stone: 10,
        },
        dyeworks: {
            wood: 18,
            stone: 12,
        },
        jewelry: {
            wood: 12,
            stone: 24,
        },
        counter: {
            wood: 30,
            stone: 24,
        },
        sugarmill: {
            wood: 20,
            stone: 22,
        },
    },
    placedeco: {
        copperBell: {
            copperIngot: 4,
            plank: 4,
        },
        oakBench: {
            solidOak: 2,
            plank: 6,
        },
        ironLamp: {
            ironIngot: 3,
            coal: 4,
        },
        birdhouse: {
            wood: 3,
        },
        flowers: {
            wood: 4,
        },
        hive: {
            wood: 6,
        },
        well: {
            stone: 10,
        },
        gnome: {
            stone: 6,
        },
        scarecrow: {
            wood: 6,
        },
    },
    greenhouse: {
        wood: 20,
        stone: 15,
    },
    ghPlot: {
        wood: 4,
        stone: 4,
    },
};

export const STYLES = {
    fence: {
        name: 'Clôture',
        list: [
            ['wood', 'Bois'],
            ['white', 'Blanche'],
            ['stone', 'Muret'],
            ['hedge', 'Haie'],
            ['flowers', 'Fleurie'],
        ],
    },
    path: {
        name: 'Allées du champ',
        list: [
            ['grass', 'Herbe'],
            ['gravel', 'Gravier'],
            ['cobble', 'Pavés'],
            ['meadow', 'Prairie fleurie'],
        ],
    },
    roof: {
        name: 'Toit de la maison',
        list: [
            ['auto', 'D’origine'],
            ['#c8453a', 'Rouge'],
            ['#3f6fb5', 'Bleu'],
            ['#3f8f2e', 'Vert'],
            ['#9a6fd0', 'Lavande'],
            ['#e8a93a', 'Doré'],
        ],
    },
    barn: {
        name: 'Couleur de la grange',
        list: [
            ['#c8453a', 'Rouge'],
            ['#3f6fb5', 'Bleue'],
            ['#3f8f2e', 'Verte'],
            ['#f7f3ea', 'Blanche'],
            ['#e8a93a', 'Dorée'],
        ],
    },
};

export const STYLE_LVL = 8;

export const STYLE_CHARM = 8;

// ---------------- le verger (bêta 2) ----------------
// Un arbre : jeune plant (pousse pendant son temps de culture), adulte qui fait tomber un fruit
// toutes les moitiés de ce temps, vieil arbre qui produit moins, puis arbre mort qui donne du bois.
export const ORCHARD = {
    lvl: 10, // le premier arbre (pommier)
    base: 4, // emplacements offerts à l'ouverture
    max: 24,
    cost: 2000, // prix du 5e emplacement, puis ×mult
    mult: 1.3,
    groundMax: 8, // fruits au pied de l'arbre ; ensuite l'arbre attend (1.2 : 8 au lieu de 6, pour les absences)
    rotEvery: 4, // sol plein : un fruit pourrit tous les 4 temps de fruit
    life: 100, // fruits qu'un arbre fait tomber dans sa vie
    oldAt: 0.75, // part de sa vie à partir de laquelle il vieillit
    oldRate: 0.6, // vitesse d'un vieil arbre
    fruitRate: 0.45, // un fruit toutes les (temps de culture × fruitRate) ; 1.2 : 0,45 au lieu de 0,5
    felledWood: 0.5, // part du bois rendue si on abat un arbre vivant
};
// bois d'un arbre mort
export const treeWood = d => 8 + Math.round(d.cost / 250);

// ---------------- les prés (bêta 2) ----------------
export const PASTURE = {
    cap: 20, // bêtes par pré
    max: 20, // prés en tout
    cost: 5000, // prix du 2e pré, puis ×mult
    mult: 1.45,
};
export const PASTURE_NAMES = [
    'Le grand pré',
    'Le pré du ruisseau',
    'Le pré aux chênes',
    'Le pré fleuri',
    'Le pré du moulin',
    'Le pré des collines',
    'Le pré aux saules',
    'Le pré du lavoir',
    'Le pré des coquelicots',
    'Le pré du vieux mur',
    'Le pré de la source',
    'Le pré aux noisetiers',
    'Le pré du bas',
    'Le pré du haut',
    'Le pré des genêts',
    'Le pré de la chapelle',
    'Le pré aux bleuets',
    'Le pré du verger',
    'Le pré des vents',
    'Le pré du bout du monde',
];

// 1.4 : 50 niveaux
for (const [id, l] of Object.entries(LV_DECO)) if (DECOS[id]) [DECOS[id].lvOld, DECOS[id].reqLvl] = [DECOS[id].reqLvl || 1, l];
for (const [id, l] of Object.entries(LV_UPG)) if (UPGRADES[id]) [UPGRADES[id].lvOld, UPGRADES[id].reqLvl] = [UPGRADES[id].reqLvl || 1, l];
