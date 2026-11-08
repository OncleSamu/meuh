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
    pig: {
        name: 'Cochon',
        lvl: 11,
        price: 320,
        every: 600,
        prod: 'fertilizer',
        prodMut: 'fertilizer',
        eats: 'waste',
        role: 'Il transforme les déchets radioactifs en engrais toxique (un déchet du stock toutes les 10 minutes).',
        max: 2,
    },
};
// V2 : l'étable filtrée vide la Charge d'une bête
export const PURGE = { lvl: 11, build: 400, cost: { elec: 1 } };
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
    canBoom: { name: 'Conserve explosive', sell: 160 },
    veil: { name: 'Voile', sell: 0 },
    conc: { name: 'Concentrateur', sell: 0 },
};
// V2 : le contrôle sanitaire. Un produit « chaud » sort de la mutation ou du nucléaire.
export const HOT = ['rutabagaGlow', 'squashShell', 'kaleSponge', 'berryFire', 'eggMut', 'milkMut', 'waste', 'canGlow', 'canBoom', 'shellOil'];
export const CHECK = { lvl: 10, cleanMult: 0.5, hotMult: 1.3 };
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
            { id: 'canBoom', name: 'Conserve explosive', in: { berryFire: 2, metal: 1 }, out: 'canBoom', t: 150, lvl: 13 },
        ],
    },
    bench: {
        name: 'Établi',
        lvl: 9,
        text: 'Fabrique l’équipement des parcelles.',
        recipes: [
            { id: 'veil', name: 'Voile (−20 sur une parcelle)', in: { plastic: 2, metal: 1 }, out: 'veil', t: 60 },
            { id: 'conc', name: 'Concentrateur (+25 sur une parcelle)', in: { elec: 2, compo: 1, waste: 1 }, out: 'conc', t: 120, lvl: 12 },
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
    // V2 : le deuxième étage
    dig: { lvl: 10, money: 600, need: { metal: 15, compo: 6 } },
    rooms2: [
        { id: 'lab', name: 'Labo', who: 'Victor', text: 'Victor fixe vos mutants en graines stables.' },
        { id: 'shop', name: 'Atelier', who: 'Firmin', text: 'Firmin règle les machines : 15 % plus rapides encore.' },
        { id: 'maps', name: 'Salle des cartes', who: 'Odette', text: 'Odette prépare les expéditions dans les terres mortes.' },
    ],
    shopBonus: 0.15,
};
// V2 : les expéditions d'Odette (elles continuent hors ligne et laissent un rapport)
export const EXPEDITIONS = [
    { id: 'ditch', name: 'Les fossés', t: 900, loot: { scrap: [4, 8], metal: [1, 3], plastic: [0, 2] }, rare: 0.05 },
    { id: 'factory', name: 'La vieille usine', t: 3600, loot: { metal: [3, 6], elec: [1, 3], compo: [1, 3] }, rare: 0.2 },
    { id: 'city', name: 'La ville morte', t: 14400, loot: { elec: [3, 6], compo: [3, 5], waste: [0, 2], scrap: [8, 14] }, rare: 0.5, money: [100, 300] },
];
// V2 : le convoi blindé, un gros contrat à livrer en six heures (manqué : un autre le remplace, sans pénalité)
export const ARMORED = {
    lvl: 12,
    t: 6 * 3600,
    mult: 2.5,
    pool: [
        ['canRuta', 6],
        ['flour', 4],
        ['squashShell', 3],
        ['canGlow', 3],
        ['kaleSponge', 4],
        ['soup', 4],
        ['canBoom', 2],
    ],
};
// V2 : un événement de Contamination par jour, annoncé, à trois choix ; on ne le subit jamais en son absence
export const EVENT_LVL = 4;
export const EVENTS = [
    {
        id: 'wind',
        name: 'Vent des terres mortes',
        text: 'Une poussière verte arrive de l’est.',
        opts: [
            { label: 'Bâcher les parcelles', cost: { plastic: 2 }, cont: -10 },
            { label: 'Laisser souffler', cont: 15 },
            { label: 'Filtrer la poussière', cont: 5, get: { scrap: 4 } },
        ],
    },
    {
        id: 'rain',
        name: 'Pluie acide',
        text: 'Les nuages ont la couleur de la rouille.',
        opts: [
            { label: 'Récupérer l’eau pour le bunker', get: { food: 4 }, cont: 5 },
            { label: 'Rincer les parcelles', cost: { money: 40 }, cont: -12 },
            { label: 'Laisser tomber', cont: 10 },
        ],
    },
    {
        id: 'leak',
        name: 'Fuite à l’épave',
        text: 'Un vieux fût s’est ouvert au fond de la carcasse.',
        opts: [
            { label: 'Colmater', cost: { metal: 2 }, cont: -5 },
            { label: 'Récupérer le fût', get: { waste: 1 }, cont: 10 },
            { label: 'Fouiller tout de suite', get: { wreck: 4 }, cont: 8 },
        ],
    },
    {
        id: 'swarm',
        name: 'Nuée de moucherons luisants',
        text: 'Ils adorent les parcelles chaudes.',
        opts: [
            { label: 'Les laisser polliniser', cont: 12, get: { xp: 15 } },
            { label: 'Enfumer', cost: { compo: 1 }, cont: -8 },
            { label: 'Les attirer au loin', cost: { rutabaga: 4 } },
        ],
    },
    {
        id: 'trader',
        name: 'Colporteur égaré',
        text: 'Un homme seul pousse une brouette pleine de bidons.',
        opts: [
            { label: 'Lui acheter de l’engrais', cost: { money: 60 }, get: { fertilizer: 2 } },
            { label: 'Lui donner à manger', cost: { food: 3 }, get: { elec: 2 } },
            { label: 'Le laisser passer' },
        ],
    },
];

// les Caravanes : un convoi par heure, annoncé d'avance par la radio
export const REGIONS = [
    { id: 'filtre', name: 'Cité-filtre', of: 'de la Cité-filtre', check: 'clean', wants: ['lentil', 'egg', 'flour'] },
    { id: 'forge', name: 'Camp des forgerons', of: 'du Camp des forgerons', wants: ['canRuta', 'sorghum', 'milk'] },
    { id: 'puits', name: 'Puits-Salé', of: 'de Puits-Salé', wants: ['rutabaga', 'soup', 'squash'] },
    { id: 'antennes', name: 'Les Antennes', of: 'des Antennes', check: 'hot', wants: ['rutabagaGlow', 'eggMut', 'canGlow'] },
    { id: 'rouille', name: 'La Rouille', of: 'de la Rouille', check: 'hot', wants: ['squashShell', 'milkMut', 'shellOil'] },
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
    4: 'L’événement du jour : trois choix, une fois par jour',
    9: 'L’Établi : voiles pour protéger une parcelle',
    10: 'Deuxième étage du Bunker (Victor, Firmin, Odette) et contrôle sanitaire des convois',
    11: 'Chou-kale, cochon, étable filtrée',
    12: 'Convoi blindé et concentrateur',
    13: 'Mûres et conserves explosives',
};
