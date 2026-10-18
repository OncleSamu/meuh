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
