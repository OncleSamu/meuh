// La cave : familles, rangs, chances par étape, climat, équipement, salle des ventes.
// Valeurs reprises telles quelles de la version 6.2 (même équilibre).

export const CAVE_LVL = 20;

export const CAVE_H = 3600000;

export const CAVE_FAMILIES = {
    cheese: {
        name: 'Fromages',
        step: 7200000,
        ranks: ['Jeune', 'Affiné', 'Vieux', 'Grand affinage', 'Légendaire'],
        care: 'Retourner',
        careIcon: 'turn',
        careDone: 'Meules retournées',
    },
    cider: {
        name: 'Cidres',
        step: 21600000,
        ranks: ['Jeune', 'Bouché', 'Vieux', 'Grande réserve', 'Légendaire'],
        care: 'Soutirer',
        careIcon: 'barrel',
        careDone: 'Cidre soutiré',
    },
    wine: {
        name: 'Vins',
        step: 43200000,
        ranks: ['Jeune', 'Bon', 'Vieux', 'Grand cru', 'Légendaire'],
        care: 'Ouiller',
        careIcon: 'barrel',
        careDone: 'Fûts ouillés',
    },
    champagne: {
        name: 'Champagnes',
        step: 28800000,
        ranks: ['Sur lattes', 'Brut', 'Millésimé', 'Grande cuvée', 'Légendaire'],
        care: 'Remuer',
        careIcon: 'riddle',
        careDone: 'Bouteilles remuées',
    },
    // 1.3.2 : jambons et viandes séchées, pendus au plafond de la cave
    charcuterie: {
        name: 'Salaisons',
        step: 14400000,
        ranks: ['Frais', 'Séché', 'Affiné', 'Grande réserve', 'Légendaire'],
        care: 'Retourner',
        careIcon: 'turn',
        careDone: 'Jambons retournés',
    },
    // 1.6.3 : les bières de l'abbaye vieillissent en fût, ici, avec les mêmes règles que le reste
    beer: {
        name: 'Bières',
        step: 10800000,
        ranks: ['Jeune', 'Élevée', 'De garde', 'Grande réserve', 'Légendaire'],
        care: 'Rouler',
        careIcon: 'barrel',
        careDone: 'Fûts roulés',
    },
};

export const CAVE_ITEMS = {
    cheese: 'cheese',
    goatCheese: 'cheese',
    beaufort: 'cheese',
    tomme: 'cheese',
    reblochon: 'cheese',
    camembert: 'cheese',
    bleu: 'cheese',
    comte: 'cheese',
    cider: 'cider',
    pommeau: 'cider',
    redWine: 'wine',
    whiteWine: 'wine',
    roseWine: 'wine',
    champagne: 'champagne',
    champagneRose: 'champagne',
    // 1.3.1 et 1.3.2
    calvados: 'cider',
    roquefort: 'cheese',
    sheepTomme: 'cheese',
    ham: 'charcuterie',
    driedBeef: 'charcuterie',
    beer: 'beer', // un lot de bière garde sa recette (bid) et son fût (k)
};

export const CAVE_MULT = [1, 1.8, 3.2, 5.5, 10];

export const CAVE_TURNED = 0.6;

export const CAVE_GOOD = [0.82, 0.68, 0.52, 0.34];

export const CAVE_ROT = [0.03, 0.06, 0.1, 0.16];

export const CAVE_LEGEND_RISK = {
    rot: 0.12,
    bad: 0.18,
};

export const CAVE_LOT_MAX = 8;
// 1.6.3 : les lots grandissent avec les étagères (8, 12, 16 puis 20)
export const CAVE_LOT_GROW = 4;

export const CAVE_SLOTS_START = 4;

export const CAVE_IDEAL = [35, 65];

export const CAVE_NUDGE = 14;

export const CAVE_SHELVES = [2500, 6000, 12000, 25000, 50000, 90000];

export const CAVE_GEAR = {
    hygro: {
        name: 'Hygromètre',
        desc: 'Le climat se règle tout seul et reste dans la bonne zone : plus besoin d’y toucher',
        cost: 8000,
        icon: 'hygro',
    },
    vault: {
        name: 'Voûte en pierre',
        desc: 'Murs épais : +2 places en cave, et vos lots vieillissent un peu mieux (+5 %)',
        cost: 30000,
        mats: {
            stone: 80,
            beam: 10,
        },
        icon: 'vault',
    },
};

export const AUCTION_SMALL_EVERY = 14400000;

export const AUCTION_BIG_HOUR = 19;

export const AUCTION_SMALL_LIVE = 90000;

export const AUCTION_BIG_LIVE = 180000;

export const AUCTION_SMALL_LOTS = 2;

export const AUCTION_BIG_LOTS = 6;

export const NEGOCIANT = 0.75;

// 1.6.3 : avec l'hygromètre, le climat vise toujours cette zone
export const CAVE_AUTO = [40, 60];

// 1.6.3 : les commandes de la cave, comme celles de la brasserie
export const CAVE_ORDERS = {
    max: 2,
    every: 45 * 60, // une nouvelle commande toutes les 45 minutes, s'il reste une place
    qty: [2, 4],
    pay: 1.6, // payée 1,6 fois la valeur du lot livré
    xp: 80,
    hearts: 3,
    who: ['gaston', 'anselme', 'margaux', 'duval', 'odette', 'paul', 'hugues'],
};

// 1.6.3 : un ruban pour le premier lot légendaire de chaque famille
export const CAVE_LEGEND_RUBANS = 1;

export const BIDDERS = {
    gaston: {
        name: 'Chef Gaston',
        taste: {
            cheese: 1.25,
            wine: 1.15,
        },
        budget: 1,
        villager: true,
    },
    paul: {
        name: 'Monsieur Paul',
        taste: {
            cider: 1.25,
            cheese: 1.05,
        },
        budget: 0.7,
        villager: true,
    },
    odette: {
        name: 'Mamie Odette',
        taste: {
            cheese: 1.2,
            cider: 1.1,
        },
        budget: 0.6,
        villager: true,
    },
    marcel: {
        name: 'Tonton Marcel',
        taste: {
            beer: 1.25,
            cider: 1.2,
            wine: 1.05,
        },
        budget: 0.6,
        villager: true,
    },
    gaspard: {
        name: 'Gaspard',
        taste: {
            cider: 1.25,
            beer: 1.2,
            wine: 1.05,
        },
        budget: 0.6,
        villager: true,
    },
    morgane: {
        name: 'Capitaine Morgane',
        taste: {
            wine: 1.2,
            cider: 1.1,
            champagne: 1.05,
        },
        budget: 1,
        villager: true,
    },
    bruno: {
        name: 'Bruno',
        taste: {
            beer: 1.2,
            cheese: 1.3,
        },
        budget: 0.8,
        villager: true,
    },
    anselme: {
        name: 'Maître Anselme',
        taste: {
            cheese: 1.35,
        },
        budget: 1.6,
        villager: true,
    },
    margaux: {
        name: 'Margaux',
        taste: {
            wine: 1.3,
            champagne: 1.2,
        },
        budget: 1.6,
        villager: true,
    },
    valcourt: {
        name: 'Le comte de Valcourt',
        taste: {
            wine: 1.45,
            champagne: 1.3,
        },
        budget: 4,
        big: true,
    },
    iris: {
        name: 'Iris, sommelière',
        taste: {
            champagne: 1.45,
            wine: 1.25,
            cheese: 1.1,
        },
        budget: 3,
        big: true,
    },
    tomette: {
        name: 'Madame Tomette',
        taste: {
            beer: 1.3,
            cheese: 1.5,
            cider: 1.15,
        },
        budget: 2.5,
        big: true,
    },
};

export const AUCTION_FINDS = {
    ferment: {
        name: 'Ferment noble',
        desc: 'Sur un fromage : bien vieillir +15 % pendant 3 étapes',
        value: 6000,
        icon: ['item', 'ferment'],
    },
    yeast: {
        name: 'Levure de tirage',
        desc: 'Sur un vin ou un champagne : bien vieillir +15 % pendant 3 étapes',
        value: 8000,
        icon: ['item', 'yeast'],
    },
    oldBarrel: {
        name: 'Fût centenaire',
        desc: 'Pour toujours : vins et cidres vieillissent mieux (+4 %)',
        value: 25000,
        icon: ['ui', 'barrel'],
        once: true,
    },
    oldPress: {
        name: 'Pressoir ancien',
        desc: 'Décoration rare : +30 de charme au concours',
        value: 30000,
        icon: ['ui', 'oldPress'],
        once: true,
    },
    vintage: {
        name: 'Vieux millésime',
        desc: 'Un lot de vin déjà « Grand cru », à revendre ou à garder',
        value: 0,
        icon: ['item', 'redWine'],
    },
};
