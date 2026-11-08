// Heum — les paliers de Contamination, les bêtes, la ferraille, les machines, les caravanes et les niveaux.
export const TIERS = [
    { id: 'sane', name: 'Saine', from: 0, col: '#7fbf5a', text: 'Rendement normal, aucune mutation.' },
    { id: 'mut', name: 'Mutagène', from: 30, col: '#c7d63a', text: 'Une récolte sur quatre peut muter : la variante vaut 3 à 4 fois plus.' },
    { id: 'unst', name: 'Instable', from: 60, col: '#e68a2e', text: 'Mutations plus fréquentes et doublées, mais une parcelle peut tourner Rebelle.' },
    { id: 'crit', name: 'Critique', from: 85, col: '#d2412f', text: 'Les récoltes se changent en déchets radioactifs.' },
];
export const tierOf = c => [...TIERS].reverse().find(t => c >= t.from);
export const CONT = {
    decayEvery: 120, // la jauge redescend d'un point toutes les 2 minutes, toute seule
    fertilizer: 10, // un bidon d'engrais toxique : +10
    purifier: 15, // un passage de l'Épurateur : −15
    mutLvl: 6, // le niveau où la mutation s'ouvre (l'engrais toxique)
    mutChance: { mut: 0.25, unst: 0.45 },
    rebelChance: 0.15,
    rebelEvery: 90, // un Rebelle contamine une parcelle voisine toutes les 90 s, seulement quand on joue
    rebelPush: 1, // et fait monter la jauge d'un point par minute
};

// la Ménagerie : chaque bête a un rôle et une Charge toxique
export const ANIMALS = {
    hen: {
        name: 'Poule',
        lvl: 1,
        price: 50,
        every: 120,
        prod: 'egg',
        prodMut: 'eggMut',
        role: 'Sentinelle : elle prévient quand la jauge va changer de palier.',
        max: 3,
    },
    goat: {
        name: 'Chèvre',
        lvl: 6,
        price: 220,
        every: 240,
        prod: 'milk',
        prodMut: 'milkMut',
        role: 'Elle nettoie les parcelles : −1 point de Contamination toutes les 5 minutes.',
        max: 2,
        clean: 300,
    },
};
export const CHARGE = { up: 1.2, down: 4 }; // points de Charge par minute : + au-dessus de 30 % (× jauge/30), − en dessous

// produits, ferraille et objets : nom, prix de vente, vivres pour le bunker
export const GOODS = {
    egg: { name: 'Œuf', sell: 6, food: 1 },
    eggMut: { name: 'Œuf mutagène', sell: 18, food: 1 },
    milk: { name: 'Lait', sell: 14, food: 2 },
    milkMut: { name: 'Lait mutagène', sell: 40, food: 2 },
    scrap: { name: 'Ferraille brute', sell: 1 },
    metal: { name: 'Métal', sell: 3 },
    plastic: { name: 'Plastique', sell: 3 },
    elec: { name: 'Électronique', sell: 8 },
    compo: { name: 'Composite', sell: 6 },
    waste: { name: 'Déchet radioactif', sell: 30 },
    fertilizer: { name: 'Engrais toxique', sell: 0 },
    canRuta: { name: 'Conserve de rutabaga', sell: 26, food: 4 },
    flour: { name: 'Farine de sorgho', sell: 40, food: 4 },
    soup: { name: 'Soupe de lentilles', sell: 38, food: 4 },
    canGlow: { name: 'Conserve lumineuse', sell: 75, food: 6 },
    shellOil: { name: 'Huile de carapace', sell: 120, food: 2 },
};
export const SCRAP_TYPES = ['metal', 'plastic', 'elec', 'compo'];
export const WRECK = { max: 12, every: 120, find: [1, 3] };

// le Recyclage
export const MACHINES = {
    sorter: {
        name: 'Trieur',
        lvl: 1,
        text: 'Sépare la ferraille brute en quatre types.',
        recipes: [{ id: 'sort', name: 'Trier 5 ferrailles', in: { scrap: 5 }, out: 'sorted', t: 20 }],
    },
    purifier: {
        name: 'Épurateur',
        lvl: 3,
        text: 'Brûle de l’électronique pour baisser la Contamination.',
        recipes: [{ id: 'purify', name: 'Épurer (−15)', in: { elec: 1 }, out: 'purify', t: 30 }],
    },
    reactor: {
        name: 'Fourneau-Réacteur',
        lvl: 6,
        text: 'Cuit les récoltes en conserves et prépare l’engrais toxique.',
        recipes: [
            { id: 'fert', name: 'Engrais toxique', in: { plastic: 2, compo: 1 }, out: 'fertilizer', t: 30 },
            { id: 'canRuta', name: 'Conserve de rutabaga', in: { rutabaga: 3, metal: 1 }, out: 'canRuta', t: 60 },
            { id: 'flour', name: 'Farine de sorgho', in: { sorghum: 3 }, out: 'flour', t: 90 },
            { id: 'soup', name: 'Soupe de lentilles', in: { lentil: 2, parsnip: 1 }, out: 'soup', t: 90, lvl: 7 },
            { id: 'canGlow', name: 'Conserve lumineuse', in: { rutabagaGlow: 2, metal: 1 }, out: 'canGlow', t: 120 },
            { id: 'shellOil', name: 'Huile de carapace', in: { squashShell: 1 }, out: 'shellOil', t: 120 },
        ],
    },
};

// le Bunker : un étage, trois salles, trois habitants
export const BUNKER = {
    foodMax: 30,
    eatEvery: 600, // un vivre toutes les 10 minutes pour tout l'étage
    rooms: [
        { id: 'kitchen', name: 'Cuisine', who: 'Armand', text: 'Armand cuisine : vos conserves se vendent 20 % plus cher.' },
        { id: 'gen', name: 'Générateur', who: 'Lison', text: 'L’énergie fait tourner le Recyclage 25 % plus vite.' },
        { id: 'dorm', name: 'Dortoir', who: 'Basile', text: 'Basile fouille l’épave : elle se regarnit deux fois plus vite.' },
    ],
    canBonus: 0.2,
    genBonus: 0.25,
};

// les Caravanes : un convoi par heure, annoncé d'avance par la radio
export const REGIONS = [
    { id: 'filtre', name: 'Cité-filtre', of: 'de la Cité-filtre', wants: ['lentil', 'egg', 'flour'] },
    { id: 'forge', name: 'Camp des forgerons', of: 'du Camp des forgerons', wants: ['canRuta', 'sorghum', 'milk'] },
    { id: 'puits', name: 'Puits-Salé', of: 'de Puits-Salé', wants: ['rutabaga', 'soup', 'squash'] },
    { id: 'antennes', name: 'Les Antennes', of: 'des Antennes', wants: ['rutabagaGlow', 'eggMut', 'canGlow'] },
    { id: 'rouille', name: 'La Rouille', of: 'de la Rouille', wants: ['squashShell', 'milkMut', 'shellOil'] },
];
export const CARAVAN = { every: 3600, bonus: 1.6, troqLvl: 5 };
export const TRADES = [
    { id: 't1', give: { rutabaga: 6 }, get: { elec: 2 } },
    { id: 't2', give: { lentil: 4 }, get: { compo: 2 } },
    { id: 't3', give: { egg: 4 }, get: { plastic: 3 } },
    { id: 't4', give: { waste: 1 }, get: { elec: 3, compo: 2 } },
];

// les niveaux : l'expérience demandée et ce que chaque niveau ouvre
export const xpFor = l => Math.round(30 * Math.pow(l, 1.45));
export const UNLOCKS = {
    2: 'Sorgho',
    3: 'Épurateur : baisser la Contamination',
    5: 'Troqueurs aux Caravanes',
    6: 'Mutation : Fourneau-Réacteur, engrais toxique, courge, chèvre',
    7: 'Panais et soupe de lentilles',
    8: 'Bientôt : deuxième étage du Bunker (V2)',
};
