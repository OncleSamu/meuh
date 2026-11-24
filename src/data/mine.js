// 1.172 : La Mine souterraine — 40 étages, 4 strates, grille 5×5, géodes, outils tactiques et améliorations.

export const MINE_DEEP = {
    lvl: 8, // s'ouvre en même temps que la Mine
    cols: 5,
    rows: 5,
    cells: 25,
    maxFloor: 40,
    elevatorStep: 5, // ascenseur tous les 5 étages (1, 5, 10, 15, ..., 40)
    energyBase: 30, // coups de lanterne au départ
    energyRegenSec: 180, // +1 coup toutes les 3 minutes (même jeu fermé)
    snackPerDay: 2, // 2 casse-croûtes du mineur par jour (rechargent la lanterne)
    snackCoal: 6, // charbon consommé pour recharger la lanterne
    bombCost: { coins: 400, coal: 2 }, // dynamite (réduit avec la caisse de dynamite)
    bombCostUp: { coins: 250, coal: 1 },
    sonarCost: { coins: 300, coal: 1 }, // boussole de veine : révèle escalier + cases spéciales
};

// Les 4 strates souterraines (10 étages chacune)
export const MINE_STRATA = [
    {
        id: 'quarry',
        name: 'La carrière ancienne',
        from: 1,
        to: 10,
        lvl: 8,
        needs: [],
        theme: 'stratum-quarry',
        geode: 'geodeStone',
        ores: [
            ['stone', 55],
            ['coal', 45],
        ],
        gems: [
            ['fossil', 5],
            ['quartz', 3],
            ['amethyst', 2],
        ],
        desc: 'Étages 1 à 10 · Pierre, charbon, fossiles anciens et géodes grises.',
    },
    {
        id: 'gallery',
        name: 'Les galeries de cuivre',
        from: 11,
        to: 20,
        lvl: 18,
        needs: ['lamp', 'cart'],
        theme: 'stratum-gallery',
        geode: 'geodeAmethyst',
        ores: [
            ['coal', 20],
            ['ironOre', 42],
            ['copperOre', 38],
        ],
        gems: [
            ['amethyst', 4],
            ['quartz', 4],
            ['fossil', 2],
        ],
        desc: 'Étages 11 à 20 · Fer, cuivre, améthystes et géodes violettes.',
    },
    {
        id: 'crystal',
        name: 'Les cavernes de cristal',
        from: 21,
        to: 30,
        lvl: 30,
        needs: ['lamp', 'cart'],
        theme: 'stratum-crystal',
        geode: 'geodeCrystal',
        ores: [
            ['ironOre', 18],
            ['silverOre', 48],
            ['goldOre', 34],
        ],
        gems: [
            ['ruby', 3],
            ['sapphire', 3],
            ['emerald', 3],
            ['nugget', 2],
        ],
        desc: 'Étages 21 à 30 · Argent, or, pierres précieuses et géodes de cristal.',
    },
    {
        id: 'abyss',
        name: 'Les abysses d’obsidienne',
        from: 31,
        to: 40,
        lvl: 60,
        needs: ['lamp', 'cart'],
        minPick: 3, // pioche niveau 4+ (tête de fer ou mieux) recommandée/requise
        theme: 'stratum-abyss',
        geode: 'geodeAbyss',
        ores: [
            ['silverOre', 35],
            ['goldOre', 65],
        ],
        gems: [
            ['ruby', 3],
            ['sapphire', 3],
            ['emerald', 3],
            ['nugget', 4],
        ],
        desc: 'Étages 31 à 40 · Veines d’or pur, géodes abyssales et reliques légendaires.',
    },
];

export const stratumOf = floor => MINE_STRATA.find(s => floor >= s.from && floor <= s.to) || MINE_STRATA[0];

// Les 4 types de géodes (stockées dans state.mineDeep.geodes, ouvertes au Musée)
export const GEODES = {
    geodeStone: {
        id: 'geodeStone',
        name: 'Géode grise',
        stratum: 0,
        icon: 'geodeStone',
        crackCost: 150,
        sell: 300,
        desc: 'Une pierre ronde et creuse de la carrière. Cache souvent fossiles, pyrite ou quartz.',
    },
    geodeAmethyst: {
        id: 'geodeAmethyst',
        name: 'Géode d’améthyste',
        stratum: 1,
        icon: 'geodeAmethyst',
        crackCost: 450,
        sell: 900,
        desc: 'Pleine de pointes violettes. Renferme minéraux rares et vestiges des galeries.',
    },
    geodeCrystal: {
        id: 'geodeCrystal',
        name: 'Géode de cristal',
        stratum: 2,
        icon: 'geodeCrystal',
        crackCost: 1200,
        sell: 2400,
        desc: 'Scintille d’une lumière bleutée. Abonde en gemmes, fluorites et reliques anciennes.',
    },
    geodeAbyss: {
        id: 'geodeAbyss',
        name: 'Géode abyssale',
        stratum: 3,
        icon: 'geodeAbyss',
        crackCost: 3000,
        sell: 6000,
        desc: 'Roche volcanique des profondeurs. Peut contenir les pièces légendaires du Musée.',
    },
};
export const GEODE_IDS = Object.keys(GEODES);

// Améliorations permanentes de la mine souterraine
export const MINE_UPS = [
    {
        id: 'lanternTank',
        name: 'Grand réservoir de lanterne',
        icon: 'mineLantern',
        desc: '+15 coups de lanterne maximum à chaque descente.',
        cost: { coins: 4000, ironIngot: 4, coal: 20 },
        lvl: 12,
    },
    {
        id: 'headlamp',
        name: 'Lampe frontale de géologue',
        icon: 'lamp',
        desc: '+15 coups max et repère automatiquement un gisement rare à chaque étage.',
        cost: { coins: 18000, copperIngot: 6, quartz: 3 },
        lvl: 22,
    },
    {
        id: 'bombBelt',
        name: 'Caisse de dynamite',
        icon: 'mineBomb',
        desc: 'La dynamite coûte moins cher et dégage un carré complet 3×3.',
        cost: { coins: 35000, ironIngot: 10, coal: 40 },
        lvl: 28,
    },
    {
        id: 'winch',
        name: 'Treuil d’extraction renforcé',
        icon: 'cart',
        desc: '+25 % de chances de géodes et spécimens, et la lanterne recharge 30 % plus vite.',
        cost: { coins: 80000, silverIngot: 8, goldIngot: 4 },
        lvl: 40,
    },
];
