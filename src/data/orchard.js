// 1.12 : le verger — la maturité, les greffons, les boutures, les soins, le cueilleur, Odile.
// Ce qu'on protège n'est pas le prix de l'arbre (une poignée de pièces) mais ce qu'il a gagné : sa maturité et son greffon.
export const MATURE = {
    at: 75, // fruits donnés pour être « mûr »
    quality: 0.15, // points de chance de fruit argent ou or en plus à pleine maturité
    extra: 0.2, // chance d'un fruit en plus à pleine maturité
    stars: [0.33, 0.8], // seuils : 1 étoile (jeune), 2 (formé), 3 (mûr)
    cutMin: 50, // fruits donnés pour laisser une bouture
    cutKeep: 1 / 3, // part de maturité gardée par la bouture
    cap: 1.8, // tous les bonus de vitesse réunis
};
// les greffons : rares (non achetables) ou de la pépinière
export const GRAFTS = {
    gold: { item: 'graftGold', name: 'Greffon doré', rare: true, text: 'Un fruit sur quatre est en or.', gold: 0.25 },
    double: { item: 'graftDouble', name: 'Greffon double', rare: true, text: 'Deux fruits à la fois, un peu plus lents (30 %).', double: true, slow: 1.3 },
    eternal: {
        item: 'graftEternal',
        name: 'Greffon éternel',
        rare: true,
        text: 'L’arbre ne vieillit jamais, mais produit 20 % moins vite.',
        eternal: true,
        rate: 0.8,
    },
    early: {
        item: 'graftEarly',
        name: 'Greffon précoce',
        text: 'Fruits 20 % plus vite, vie réduite de 20 %.',
        rate: 1.2,
        life: 0.8,
        cost: { hardwood: 2, resin: 2, apple: 4 },
    },
    robust: { item: 'graftRobust', name: 'Greffon robuste', text: 'Vit 40 % plus longtemps.', life: 1.4, cost: { hardwood: 3, resin: 2, pear: 4 } },
};
export const GRAFT_IDS = Object.keys(GRAFTS);
export const RARE_GRAFTS = [
    ['gold', 50],
    ['double', 35],
    ['eternal', 15],
];
export const NURSERY = { lvl: 17 };
// les soins
export const CARE = {
    prune: { rate: 1.15, text: 'Taillé : fruits 15 % plus vite la saison prochaine' },
    manure: { rate: 1.25, time: 3480000, cost: { fertilizer: 2 }, text: 'Fumé : 25 % plus vite pendant une saison' },
    rejuvenate: {
        minDrops: 50,
        cost: { hardwood: 4, resin: 3, fertilizer: 2 },
        text: 'Rajeuni : la moitié de ses fruits donnés effacés, maturité et greffon gardés',
    },
    lvl: 12,
};
// le cueilleur : ramasse seul les fruits au sol
export const PICKER = {
    lvl: 22,
    hire: { coins: 8000, tools: 2, plank: 10 },
    every: [0, 7200000, 5400000, 3600000, 2700000],
    up: [
        { coins: 12000, hardwood: 6 },
        { coins: 30000, beam: 8, ironIngot: 4 },
        { coins: 70000, solidOak: 4, silverIngot: 4 },
    ],
};
// Odile, l'arboricultrice : un défi par jour
export const ODILE = { lvl: 10, coins: lvl => 140 + lvl * 28, xp: lvl => 40 + lvl * 3, hearts: 2, graft: 0.3, graftChoice: 0.6, choiceMult: 1.6 };
export const ORCHARD_UNLOCKS = [
    [10, 'Odile et son défi du jour ; la maturité des arbres'],
    [12, 'Les soins : tailler, fumer, rajeuniser (Ferme | Verger)'],
    [14, 'L’échelle et le panier au Chantier de la ferme'],
    [17, 'La pépinière : greffons précoce et robuste'],
    [22, 'Le cueilleur, qui ramasse les fruits seul'],
];

// ---------------- 1.13 : les saisons du verger ----------------
// chaque espèce a sa saison : plus vite dedans (×1,3), un peu moins vite dehors (×0,9) ; les arbres de l'île restent toute l'année
export const TREE_SEASON = {
    cherry: 'printemps',
    apricot: 'ete',
    peach: 'ete',
    mirabelle: 'ete',
    fig: 'ete',
    apple: 'automne',
    pear: 'automne',
    walnut: 'automne',
    chestnut: 'automne',
    hazelnut: 'automne',
    quince: 'automne',
    plum: 'ete',
    mandarin: 'hiver',
    grapefruit: 'hiver',
    pomegranate: 'automne',
    pistachio: 'ete',
    kaki: 'automne',
    grape: 'automne',
    almond: 'automne',
    orange: 'hiver',
    lemon: 'hiver',
    kiwi: 'hiver',
    olive: 'hiver',
};
export const SEASON_IN = 1.3;
export const SEASON_OUT = 0.9;
// la floraison : les 3 premiers jours du printemps, les ruches décoratives du champ pollinisent
export const BLOOM = { lvl: 24, days: 3, perHive: 0.06, cap: 0.3 };
// la gelée de printemps : prévenue 2 jours avant, elle tombe à la fin du jour dit ; une torche de résine protège 2 arbres
export const FROST = { lvl: 28, warnDays: 2, hitHour: 22, torch: 'pineTorch', cover: 2, loss: 3 };
// la grande cueillette d'automne : dès le 4e jour de la saison
export const HARVEST = { lvl: 34, from: 4, base: 22, per: 0.5, coins: lvl => 3000 + lvl * 200, xp: lvl => 200 + lvl * 8 };

// ---------------- 1.14 : la vie du verger ----------------
export const ORCHARD_LOG = { lvl: 20, steps: [100, 500, 2000], coins: [800, 3000, 12000] };
export const BASKET_CONTEST = {
    lvl: 20,
    weight: [1, 2, 4], // ordinaire, argent, or
    prize: [
        { coins: lvl => 1500 + lvl * 120, rubans: 2, graft: 1 },
        { coins: lvl => 900 + lvl * 80, rubans: 1, graft: 0.3 },
        { coins: lvl => 500 + lvl * 50, rubans: 0, graft: 0 },
    ],
    xp: lvl => 60 + lvl * 5,
};
export const CIDER_FETE = { lvl: 26, need: [20, 16], coins: lvl => 1500 + lvl * 100, xp: lvl => 120 + lvl * 6, cider: 12, hearts: 2 };
// 1.15 : les vendanges et la fête du vin (automne), avec Margaux
export const WINE_FETE = { lvl: 33, need: 24, coins: lvl => 2200 + lvl * 120, xp: lvl => 150 + lvl * 7, bottles: 6, hearts: 2 };
// un jeune plant « bizarre » : fruits dorés ou deux fruits d'un coup, toute sa vie
export const REMARK = {
    lvl: 34,
    chance: 0.04,
    kinds: {
        gold: { name: 'Arbre doré', text: 'Un fruit sur quatre est en or, toute sa vie.', gold: 0.25 },
        twin: { name: 'Arbre jumeau', text: 'Deux fruits d’un coup, sans ralentir.', double: true },
    },
};
export const ORCHARD_UNLOCKS_2 = [
    [20, 'Le carnet du verger et le concours du plus beau panier (week-end)'],
    [24, 'La floraison : les ruches du champ pollinisent le verger'],
    [26, 'La fête du cidre, chaque automne'],
    [28, 'La gelée de printemps : les torches de résine protègent le verger'],
    [33, 'Les vendanges et la fête du vin, chaque automne'],
    [34, 'La grande cueillette d’automne et les arbres remarquables'],
];
