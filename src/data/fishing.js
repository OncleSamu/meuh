// 1.10 : la pêche repensée. Trois coins de pêche, des appâts pour viser son poisson, des nasses qui
// pêchent seules, trois cannes, le carnet des records, les défis de Marcel et le concours du week-end.

// les coins de pêche : lvl (niveau) ou project (chantier fini) pour les ouvrir
export const SPOTS = {
    bank: { name: 'La berge', lvl: 9, icon: 'spotBank', desc: 'Eau claire et peu profonde : gardons, ablettes, perches, truites.' },
    reeds: { name: 'Les roseaux', lvl: 11, icon: 'spotReeds', desc: 'Eau calme et herbes : carpes, tanches, anguilles la nuit, brochets.' },
    pier: {
        name: 'Le ponton',
        lvl: 9,
        project: 'pontoon',
        icon: 'spotPier',
        desc: 'L’eau profonde, là où l’étang rejoint la rivière : les gros poissons.',
        weight: 1.25,
    },
    // 1.33 : le lagon de l'île, ouvert avec l'île (niveau 38 et bac de Tiago réparé)
    lagoon: {
        name: 'Le lagon',
        lvl: 38,
        project: 'ferry',
        icon: 'spotLagoon',
        desc: 'L’eau claire de l’île : poulpes, vivaneaux, mahi-mahi et, la nuit, des langoustes.',
        weight: 1.15,
    },
};
export const SPOT_IDS = Object.keys(SPOTS);

// les appâts : un appât multiplie par BAIT_MULT les chances des poissons qu'il vise.
// have : 'worms' (la boîte à vers), 'flies' (fabriquées) ou un produit de la grange (maïs, ablette)
export const BAIT_MULT = 5;
export const BAITS = {
    worm: { name: 'Ver de terre', lvl: 9, have: 'worms', icon: ['ui', 'worm'], hint: 'Gardons, ablettes, perches, tanches, anguilles, lottes' },
    corn: { name: 'Maïs', lvl: 11, have: 'corn', icon: ['item', 'corn'], hint: 'Carpes et tanches' },
    fly: { name: 'Mouche', lvl: 13, have: 'flies', icon: ['ui', 'fly'], hint: 'Truites et saumons' },
    shrimp: {
        name: 'Crevette',
        lvl: 38,
        project: 'ferry',
        have: 'shrimp',
        icon: ['item', 'shrimp'],
        hint: 'Poulpes, vivaneaux, mahi-mahi et langoustes du lagon',
    },
    live: { name: 'Vif (une ablette)', lvl: 9, project: 'pontoon', have: 'bleak', icon: ['item', 'bleak'], hint: 'Brochets, sandres, silures, esturgeons' },
};

// la boîte à vers se remplit toute seule
export const WORMS = { every: 180000, max: 20, start: 10 };
// fabriquer des mouches : une plume et une pelote de laine donnent 4 mouches
export const FLY_CRAFT = { ing: { feather: 1, wool: 1 }, out: 4 };

// les cannes : zone de ferrage plus large, poissons plus lourds
export const RODS = [
    { name: 'Canne en bambou', lvl: 9, zone: 1, weight: 1 },
    { name: 'Canne en carbone', lvl: 14, zone: 1.25, weight: 1.08, cost: { coins: 2500, tools: 2 } },
    { name: 'Canne de compétition', lvl: 20, zone: 1.5, weight: 1.15, cost: { coins: 9000, tools: 4, plank: 4 } },
];

// les nasses : posées dans un coin, elles attrapent des poissons communs toutes les 2 heures (même jeu fermé)
export const TRAPS = {
    lvl: 12,
    every: 7200000,
    catch: [2, 4],
    max: lvl => (lvl >= 14 ? 4 : lvl >= 12 ? 2 : 0),
    cost: { coins: 300, wood: 8, nail: 3 },
    minOdds: 10, // seuls les poissons courants entrent dans une nasse
};

// les défis de Marcel : un par jour (vrai jour), dès le niveau 10
export const MARCEL = {
    lvl: 10,
    coins: lvl => 150 + lvl * 30,
    xp: lvl => 40 + lvl * 4,
    hearts: 2,
    flies: 4, // un défi sur trois donne aussi des mouches
};

// la remontée des saumons : chaque automne, du jour 4 au jour 9 de la saison
export const SALMON_RUN = { from: 4, to: 9, mult: 14, minKg: 5 };

// le concours de pêche : chaque week-end (samedi et dimanche), dès le niveau 12
export const FISH_CONTEST = {
    lvl: 12,
    prize: [
        { coins: lvl => 1500 + lvl * 120, rubans: 2 },
        { coins: lvl => 900 + lvl * 80, rubans: 1 },
        { coins: lvl => 500 + lvl * 50, rubans: 0 },
    ],
    xp: lvl => 60 + lvl * 5,
};

// les médailles de taille : part de l'écart entre le plus petit et le plus gros poids
export const SIZES = [
    { id: 'small', name: 'Petite prise', at: 0 },
    { id: 'nice', name: 'Belle prise', at: 0.45 },
    { id: 'trophy', name: 'Trophée', at: 0.8 },
];
// le carnet : récompenses à la 1re, 10e et 50e prise de chaque espèce
export const LOG_STEPS = [1, 10, 50];

// les nouveautés de l'étang, niveau par niveau
export const POND_UNLOCKS = [
    [9, 'L’étang : la berge, la canne en bambou, les vers de terre, le carnet de pêche'],
    [10, 'Les défis de Marcel, un par jour'],
    [11, 'Les roseaux, le maïs comme appât'],
    [12, 'Deux nasses, le concours de pêche du week-end'],
    [13, 'Les mouches (pour les truites et les saumons)'],
    [14, 'La canne en carbone, deux nasses de plus'],
    [20, 'La canne de compétition'],
    [38, 'Le lagon de l’île et les crevettes comme appât (Ferme | Pêche)'],
];
