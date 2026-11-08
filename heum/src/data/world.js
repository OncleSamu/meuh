// Heum — les paliers de Contamination, les bêtes, la ferraille, les machines, les caravanes et les niveaux.
export const TIERS = [
    { id: 'sane', name: 'Saine', from: 0, col: '#7fbf5a', text: 'Rendement normal, aucune mutation.' },
    { id: 'mut', name: 'Mutagène', from: 30, col: '#c7d63a', text: 'Une récolte sur quatre peut muter : la variante vaut 3 à 4 fois plus.' },
    { id: 'unst', name: 'Instable', from: 60, col: '#e68a2e', text: 'Mutations plus fréquentes et doublées, mais une parcelle peut tourner Rebelle.' },
    { id: 'crit', name: 'Critique', from: 85, col: '#d2412f', text: 'Les récoltes se changent en déchets radioactifs.' },
];
export const tierOf = c => [...TIERS].reverse().find(t => c >= t.from);
export const CONT = {
    decayEvery: 240, // la jauge redescend d'un point toutes les 4 minutes en jeu ; hors ligne elle reste où elle est
    fertilizer: 10, // un bidon d'engrais toxique : +10
    purifier: 15, // un passage de l'Épurateur : −15
    mutLvl: 6, // le niveau où la mutation s'ouvre (l'engrais toxique)
    mutChance: { mut: 0.25, unst: 0.35 },
    rebelChance: 0.25,
    uprootMoney: 15, // arracher un Rebelle : 1 métal, ou 15 pièces à défaut
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
    waste: { name: 'Déchet radioactif', sell: 8 },
    fertilizer: { name: 'Engrais toxique', sell: 0 },
    canRuta: { name: 'Conserve de rutabaga', sell: 26, food: 4 },
    flour: { name: 'Farine de sorgho', sell: 54, food: 4 },
    soup: { name: 'Soupe de lentilles', sell: 70, food: 4 },
    canGlow: { name: 'Conserve lumineuse', sell: 90, food: 6 },
    shellOil: { name: 'Huile de carapace', sell: 220, food: 2 },
    canBoom: { name: 'Conserve explosive', sell: 420 },
    veil: { name: 'Voile', sell: 0 },
    conc: { name: 'Concentrateur', sell: 0 },
};
// 0.3 : le contrôle sanitaire lit la CHARGE réelle du produit (0 à 100), fixée par la jauge de sa parcelle au moment de la récolte.
// Une région « propre » aime le propre ; une région « chaude » paie le très chaud ; les autres ne regardent pas.
export const CHECK = {
    lvl: 10,
    // [charge maximale, multiplicateur]
    clean: [
        [20, 1.25],
        [40, 1],
        [60, 0.6],
        [100, 0.3],
    ],
    hot: [
        [29, 0.7],
        [59, 1],
        [79, 1.4],
        [100, 1.6],
    ],
};
// ce qui n'a pas de charge : matériaux, équipement
export const NO_CHARGE = ['scrap', 'metal', 'plastic', 'elec', 'compo', 'fertilizer', 'veil', 'conc', 'waste'];
export const SCRAP_TYPES = ['metal', 'plastic', 'elec', 'compo'];
// 0.5 : l'usure des machines (chaque travail rendu use un peu ; l'atelier de Firmin l'adoucit) et le silo
export const WEAR = { max: 10, repair: { metal: 2, elec: 1 } };
export const SILO = {
    caps: [80, 200, 500],
    ups: [
        { lvl: 16, money: 800, need: { metal: 10, compo: 4 } },
        { lvl: 20, money: 8000, need: { metal: 30, compo: 12, elec: 10 } },
    ],
};
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
    // chaque salle a une statistique qui commande son efficacité (Mains, Esprit ou Résistance)
    rooms: [
        { id: 'kitchen', name: 'Cuisine', stat: 'esprit', text: 'Les conserves se vendent plus cher (jusqu’à +20 %).' },
        { id: 'gen', name: 'Générateur', stat: 'mains', text: 'L’énergie accélère le Recyclage (jusqu’à +25 %).' },
        { id: 'dorm', name: 'Fouille', stat: 'resist', text: 'L’épave se regarnit plus vite : deux fois plus avec un habitant normal.' },
        { id: 'care', name: 'Infirmerie', stat: 'esprit', text: 'Soigne plus vite les habitants KO.' },
    ],
    canBonus: 0.2,
    genBonus: 0.25,
    // V2 : le deuxième étage
    dig: { lvl: 10, money: 600, need: { metal: 15, compo: 6 } },
    rooms2: [
        { id: 'lab', name: 'Labo', stat: 'esprit', text: 'Fixe vos mutants en graines stables, plus vite avec un bon Esprit.' },
        { id: 'shop', name: 'Atelier', stat: 'mains', text: 'Règle les machines : jusqu’à 15 % plus rapides encore.' },
        { id: 'maps', name: 'Salle des cartes', stat: 'resist', text: 'Prépare les expéditions, plus vite avec une bonne Résistance.' },
    ],
    shopBonus: 0.15,
};
// 0.4 : les habitants. Statistiques de départ ; la salle où ils travaillent leur fait gagner un point dans sa statistique à chaque niveau.
export const STATS = { mains: 'Mains', esprit: 'Esprit', resist: 'Résistance' };
export const RESIDENTS = [
    { id: 'armand', name: 'Armand', floor: 1, room: 'kitchen', mains: 1, esprit: 3, resist: 2 },
    { id: 'lison', name: 'Lison', floor: 1, room: 'gen', mains: 3, esprit: 1, resist: 2 },
    { id: 'basile', name: 'Basile', floor: 1, room: 'dorm', mains: 2, esprit: 1, resist: 3 },
    { id: 'victor', name: 'Victor', floor: 2, room: 'lab', mains: 1, esprit: 3, resist: 1 },
    { id: 'firmin', name: 'Firmin', floor: 2, room: 'shop', mains: 3, esprit: 1, resist: 2 },
    { id: 'odette', name: 'Odette', floor: 2, room: 'maps', mains: 2, esprit: 2, resist: 3 },
];
export const HABITANTS = {
    maxLvl: 6,
    xpEvery: 30, // une seconde de travail sur 30 compte
    xpPerLvl: 120, // × le niveau actuel
    statCap: 5,
    ko: { from: 55, base: 0.0012, heal: 1200 }, // risque de KO par seconde dès l'Instable, soin en secondes (divisé par l'efficacité de l'infirmerie)
    incidentEvery: 2400, // un incident en moyenne toutes les 40 minutes de jeu
    incidents: {
        panne: { name: 'Panne de courant', cost: { elec: 1 }, text: 'Un court-circuit. Il faut 1 électronique.' },
        infiltration: { name: 'Infiltration d’air', cost: { plastic: 1 }, text: 'L’air de surface entre. Il faut 1 plastique.' },
        rongeurs: { name: 'Rongeurs', cost: { scrap: 2 }, text: 'Ils rongent les câbles. Il faut 2 ferrailles.' },
    },
    journalMax: 40,
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
            { label: 'Les attirer au loin', cost: { rutabaga: 4 }, cont: -4, get: { xp: 10 } },
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
    15: 'Topinambour',
    16: 'Silo : agrandir le stock des produits',
    18: 'Betterave',
    20: 'Grand silo',
    22: 'Piment',
};
