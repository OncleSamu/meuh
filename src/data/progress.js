// La progression : expérience, maîtrise, maison, commis, ligues, prestige, album.
// Valeurs reprises telles quelles de la version 6.2 (même équilibre).

export const BALANCE = {
    xpBase: 300,
    xpGrowth: 1.52,
    xpKnee: 10,
    xpA: 614,
    xpP: 1.7,
    xpK: 1.18, // 1.4 : la courbe des 50 niveaux est un peu plus longue que celle des 40
    xp64: { from: 50, first: 130000, step: 3600 }, // 1.56 : de 50 à 63, la courbe monte doucement (réglée avec le robot : environ 42 h pour le niveau 64)
    xpK60: 1.42, // 1.36 : la courbe des 60 niveaux (réglée avec le robot : environ 5 heures de plus que les 50 niveaux)
    cropXp: 0.06,
    animalXp: 0.08,
    craftXp: 0.25,
    orderXp: 0.13,
    truckXp: 0.3,
    balloonXp: 0.3,
    marketStart: 0.6,
    marketEnd: 0.2,
    marketSlope: 0.06,
    orderPay: 2.5,
    trainPay: 2.4,
    balloonPay: 3,
    machineCost: 2,
    plotCost: 1.5,
    rareDrop: 0.012,
};

export const MAX_LEVEL = 64; // 1.56 : 64 niveaux
export const MAX_LEVEL_60 = 60; // le maximum de la 1.36 à la 1.55 (pour convertir les anciennes parties)

export const RENOWN_XP = 250000;

export const ACH_REWARDS = [
    {
        coins: 300,
        xp: 50,
    },
    {
        coins: 3000,
        xp: 400,
    },
    {
        coins: 30000,
        xp: 2500,
        ruban: 1,
    },
];

export const MEDALS = ['medalB', 'medalS', 'medalG'];

export const CAP_REQ = 4;

export const MASTERY_LVL = 3;

export const MASTERY_TIERS = {
    crop: [300, 2500, 10000],
    animal: [200, 1500, 6000],
    craft: [50, 400, 2000],
};

export const MASTERY_NAMES = ['bronze', 'argent', 'or'];

// 1.19 : après l'or, deux rangs de plus (platine, diamant) : la demande du marché baisse moins et ne descend pas si bas
export const MASTERY_EXTRA = {
    crop: [25000, 60000],
    animal: [15000, 36000],
    craft: [5000, 12000],
};
export const MASTERY_EXTRA_NAMES = ['platine', 'diamant'];
export const MASTERY_EXTRA_REWARD = [300, 500]; // × le prix de vente
export const MASTERY_EXTRA_FLOOR = [0.25, 0.4, 0.55]; // plancher de la demande, par rang

export const HOUSE = [
    {
        name: 'La vieille maison',
        desc: 'Une maison toute simple au bord du champ.',
    },
    {
        lvl: 5,
        name: 'Maison rafraîchie',
        bonus: '+40 places dans la grange',
        cost: {
            coins: 3000,
            plank: 5,
            nail: 5,
        },
    },
    {
        lvl: 14,
        name: 'Maison avec véranda',
        bonus: '+1 commande au tableau',
        cost: {
            coins: 15000,
            beam: 6,
            plank: 10,
            nail: 10,
        },
    },
    {
        lvl: 23,
        name: 'Maison à étage',
        bonus: "+1 place dans la file d'attente de chaque machine",
        cost: {
            coins: 60000,
            beam: 12,
            tools: 4,
            paint: 4,
        },
    },
    {
        lvl: 32,
        name: 'Belle demeure',
        bonus: "+1 place à l'étal",
        cost: {
            coins: 200000,
            beam: 20,
            tools: 8,
            paint: 8,
        },
    },
    {
        lvl: 42,
        name: 'Grande ferme',
        bonus: 'Toutes les commandes paient 10 % de plus',
        cost: {
            coins: 600000,
            beam: 30,
            tools: 15,
            paint: 15,
        },
    },
    {
        lvl: 56,
        name: 'Le manoir',
        bonus: '+80 places dans la grange et 1 place de plus à l’étal',
        cost: {
            coins: 1500000,
            solidOak: 8,
            silverIngot: 6,
            cutStone: 20,
            tools: 20,
        },
    },
];

export const FARMHAND = [
    null,
    {
        plots: 6,
        every: 40,
    },
    {
        lvl: 31,
        plots: 12,
        every: 30,
        cost: {
            coins: 80000,
            tools: 4,
        },
    },
    {
        lvl: 37,
        plots: 18,
        every: 22,
        cost: {
            coins: 200000,
            tools: 8,
        },
    },
    {
        lvl: 41,
        plots: 24,
        every: 15,
        cost: {
            coins: 450000,
            tools: 12,
        },
    },
    {
        lvl: 57,
        plots: 36,
        every: 10,
        cost: {
            coins: 900000,
            tools: 20,
        },
    },
];

export const PRESTIGE_LVL = 64;

export const CHALLENGE_BONUS = 3;

export const ALBUM_MAX = 60;

export const ALBUM_LEVELS = [5, 10, 20, 30, 40, 50, 60, 64];

export const BOOK_QUARTERS = [0.25, 0.5, 0.75, 1];

export const BOOK_SECTIONS = [
    ['collection', 'Collection', 'book'],
    ['mastery', 'Maîtrise', 'medalG'],
    ['exploits', 'Exploits', 'trophy'],
    ['legend', 'Légende', 'goldCow'],
    ['album', 'Album', 'camera'],
];
