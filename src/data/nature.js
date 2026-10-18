// La nature : forêt, mine, étang et poissons, pêche en mer.
// Valeurs reprises telles quelles de la version 6.2 (même équilibre).

export const NATURE = {
    forest: {
        lvl: 3,
        hp: 3,
        regrow: 90,
        slots: 5,
    },
    mine: {
        lvl: 8,
        hp: 4,
        regrow: 120,
        slots: 5,
    },
    pond: {
        lvl: 9,
    },
};

export const TOOL_MAX = 6;

export const SEA_NET_TIME = 1200000;

export const SEA_CATCH = [
    ['sardine', 40],
    ['mackerel', 28],
    ['shrimp', 20],
    ['seabass', 10],
    ['lobster', 4],
];

// ---------------- 1.11 : la nature repensée ----------------
// la mine a trois profondeurs ; chaque roche cache un minerai tiré selon la profondeur
export const DEPTHS = {
    quarry: {
        id: 'quarry',
        name: 'La carrière',
        lvl: 8,
        hp: 4,
        icon: 'mineQuarry',
        desc: 'Pierre, charbon et fossiles, à ciel ouvert.',
        ores: [
            ['stone', 70],
            ['coal', 30],
        ],
        gems: [['fossil', 1]],
    },
    gallery: {
        id: 'gallery',
        name: 'La galerie',
        lvl: 18,
        hp: 5,
        icon: 'mineGallery',
        desc: 'Fer, cuivre, charbon, améthystes et quartz. Il faut une lampe et un wagonnet.',
        needs: ['lamp', 'cart'],
        ores: [
            ['stone', 25],
            ['coal', 20],
            ['ironOre', 30],
            ['copperOre', 25],
        ],
        gems: [
            ['amethyst', 3],
            ['quartz', 3],
            ['fossil', 1],
        ],
    },
    cave: {
        id: 'cave',
        name: 'La grotte profonde',
        lvl: 30,
        hp: 6,
        icon: 'mineCave',
        desc: 'Argent, or, rubis, saphirs et émeraudes.',
        needs: ['lamp', 'cart'],
        ores: [
            ['stone', 10],
            ['coal', 10],
            ['ironOre', 10],
            ['silverOre', 40],
            ['goldOre', 30],
        ],
        gems: [
            ['ruby', 2],
            ['sapphire', 2],
            ['emerald', 2],
            ['quartz', 2],
            ['nugget', 2],
        ],
    },
};
export const DEPTH_IDS = Object.keys(DEPTHS);
// équipement acheté une fois pour descendre
export const MINE_GEAR = {
    lamp: { name: 'Lampe de mineur', icon: 'lamp', cost: { coins: 1500, plank: 4, coal: 3 } },
    cart: { name: 'Wagonnet', icon: 'cart', cost: { coins: 3000, plank: 8, nail: 6, tools: 2 } },
};
export const VEIN_HITS = 3; // une veine demande 3 coups de plus

// les essences de la forêt
export const SPECIES = {
    oak: { name: 'Chêne', art: 'treeOak', lvl: 3, extra: ['hardwood', 0.6, 1, 2], hint: 'Bois dur' },
    pine: { name: 'Pin', art: 'treePine', lvl: 3, extra: ['resin', 0.55, 1, 2], hint: 'Résine' },
    birch: { name: 'Bouleau', art: 'treeBirch', lvl: 12, extra: ['birchSap', 0.7, 2, 3], hint: 'Sève (puis sirop)' },
    chestnut: { name: 'Châtaignier', art: 'treeChestnut', lvl: 12, extra: ['hardwood', 0.5, 1, 2], hint: 'Bois dur et belles bûches', wood: 1 },
};
export const FOREST_SLOTS = [
    [3, 5],
    [12, 6],
    [16, 7],
    [20, 8],
    [28, 9],
];
export const MINE_SLOTS = [
    [8, 5],
    [18, 6],
    [30, 7],
];
// la cueillette de saison : un petit bonus en coupant, dès le niveau 20
export const FORAGE = {
    lvl: 20,
    chance: 0.12,
    by: {
        printemps: ['strawberry', 'mushroom'],
        ete: ['blueberry', 'strawberry', 'honey'],
        automne: ['mushroom', 'hazelnut', 'chestnut'],
        hiver: ['hazelnut', 'honey'],
    },
};
// les trois dernières têtes d'outil : fer, argent, or (niveaux 4 à 6)
export const TOOL_HEADS = [
    { lvl: 28, ing: 'ironIngot', n: 4, tools: 2, coins: 3000 },
    { lvl: 28, ing: 'silverIngot', n: 4, tools: 3, coins: 8000 },
    { lvl: 28, ing: 'goldIngot', n: 4, tools: 4, coins: 20000 },
];
// la charbonnière : du bois qui brûle lentement donne du charbon
export const KILN = { lvl: 12, build: { coins: 800, stone: 20, wood: 20 }, wood: 12, coal: 5, time: 1200000 };
// les ouvriers : ils rapportent une charge toutes les 2 heures, même jeu fermé
export const WORKERS = {
    lumber: {
        name: 'Le bûcheron',
        lvl: 16,
        icon: 'axe',
        hire: { coins: 2500, tools: 2 },
        up: [
            { coins: 5000, plank: 10 },
            { coins: 12000, beam: 8, ironIngot: 4 },
            { coins: 30000, solidOak: 4, silverIngot: 4 },
        ],
    },
    miner: {
        name: 'Le mineur',
        lvl: 24,
        icon: 'pickaxe',
        hire: { coins: 6000, tools: 3, ironIngot: 2 },
        up: [
            { coins: 10000, cutStone: 10 },
            { coins: 22000, ironIngot: 8, copperIngot: 6 },
            { coins: 45000, silverIngot: 6, goldIngot: 3 },
        ],
    },
};
export const WORKER_EVERY = 7200000;
export const workerCap = lvl => 2 + lvl; // charges gardées (1 à 4 niveaux : de 3 à 6)
// le carnet du mineur et du bûcheron : paliers par matériau
export const NAT_LOG = { lvl: 20, steps: [25, 100, 400], coins: [150, 600, 2500] };
export const NAT_LOG_IDS = [
    'wood',
    'hardwood',
    'resin',
    'birchSap',
    'stone',
    'coal',
    'ironOre',
    'copperOre',
    'silverOre',
    'goldOre',
    'amethyst',
    'quartz',
    'ruby',
    'sapphire',
    'emerald',
];
// Gaspard, le bûcheron : un défi par jour dès le niveau 3
export const GASPARD = { lvl: 3, coins: lvl => 120 + lvl * 25, xp: lvl => 35 + lvl * 3, hearts: 2 };
// les nouveautés de la nature, niveau par niveau
export const NATURE_UNLOCKS = [
    [3, 'Gaspard le bûcheron et son défi du jour, le chêne et le pin (bois dur, résine)'],
    [8, 'La carrière : de la pierre et du charbon'],
    [12, 'La charbonnière, le bouleau (sève) et le châtaignier'],
    [14, 'Le Chantier de la ferme : bâtiments améliorés (niveau 1), pierre taillée à la forge'],
    [16, 'Le bûcheron, qui travaille même jeu fermé'],
    [18, 'La galerie : fer, cuivre, quartz (lampe et wagonnet à acheter), lingots de fer et de cuivre'],
    [20, 'La cueillette de saison, le carnet du bûcheron et du mineur'],
    [22, 'Bâtiments améliorés (niveau 2), chêne massif à la scierie'],
    [24, 'Le mineur, qui travaille même jeu fermé'],
    [28, 'Hache et pioche : têtes en fer, en argent et en or'],
    [30, 'La grotte profonde : argent, or, rubis, saphirs, émeraudes'],
    [34, 'Bâtiments améliorés (niveau 3)'],
];
