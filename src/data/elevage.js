// L'Élevage (1.45) : la foire aux bestiaux, les bêtes des voisins, la réputation de l'élevage (le Comice : comice.js).

export const FAIR = {
    lvl: 12,
    slots: [
        [12, 3],
        [30, 4],
        [45, 5],
    ], // [niveau, acheteurs à la fois]
    every: 3 * 3600 * 1000, // un nouvel acheteur toutes les 3 heures
    stay: 24 * 3600 * 1000, // chacun reste un jour
    base: 0.8, // × le prix d'achat de l'espèce, par bête
    perReq: 1.4, // × par exigence de gène ou d'apparence
    race: 2, // × pour une race fixée
    prize: 2, // × pour une bête primée au Comice
    xp: 20, // expérience par bête vendue (+ le niveau)
};

// les acheteurs de passage (les villageois et les fermes voisines achètent aussi)
export const PASSERS = [
    { id: 'jura', name: 'Un fromager du Jura', icon: ['item', 'cheese'], types: ['cow', 'goat', 'ewe', 'buffalo', 'yak'], likes: ['rich', 'aroma'] },
    {
        id: 'filature',
        name: 'Une filature des Vosges',
        icon: ['item', 'wool'],
        types: ['sheep', 'alpaca', 'mohairGoat', 'rabbit', 'yak'],
        likes: ['soft', 'yield'],
    },
    { id: 'parc', name: 'Un parc animalier', icon: ['animal', 'peacock'], types: null, likes: [], looks: true },
    {
        id: 'auberge',
        name: 'Une auberge du canton',
        icon: ['item', 'egg'],
        types: ['chicken', 'duck', 'quail', 'goose', 'turkey', 'pigeon', 'guinea', 'pheasant'],
        likes: ['yield', 'speed'],
    },
    { id: 'ecole', name: 'Une ferme pédagogique', icon: ['ui', 'heart'], types: null, likes: ['appetite', 'robust'], gentle: true },
];

// la réputation de l'élevage : cinq paliers, +5 % aux prix de la foire par palier
export const REPUTATION = [
    { pts: 0, name: 'Élevage local' },
    { pts: 15, name: 'Réputé dans le canton' },
    { pts: 50, name: 'Connu dans la région' },
    { pts: 120, name: 'Élevage national' },
    { pts: 250, name: 'Élevage de renom' },
];
export const REP_BONUS = 0.05;

// les bêtes de choix des voisins : une par ferme et par jour
export const NBEASTS = {
    price: 2.2, // × le prix de l'espèce, +0,6 par point de gène au-dessus de la moyenne
    perPoint: 0.6,
};

// ---------------- le Comice agricole (remplace le Salon de l'agriculture) ----------------
export const COMICE = {
    lvl: 22,
    week: 7 * 24 * 3600 * 1000, // une édition par semaine (du lundi au dimanche)
    cats: 3, // catégories d'animaux (+1 avec le grand hall, l'ancien chantier du Salon)
    // la note sur 100
    w: { genes: 50, beauty: 20, hearts: 15, show: 15 },
    genesFull: 8, // points de gènes au-dessus de la moyenne pour la note pleine
    beautyFull: 4,
    // les fermes voisines : une note qui grandit avec le niveau, selon le style de chacune
    rivalBase: 22,
    rivalPerLvl: 0.9,
    rivalSpread: 8,
    prizes: [0, 12000, 6000, 3000], // pièces par place (× le niveau, × 2 avec le grand hall)
    rep: [0, 6, 3, 1],
    brushTime: 10, // secondes de présentation
    jury: 1.5, // ce que le jury regarde surtout compte une fois et demie (1.45.2)
};
// les noms des catégories
export const COMICE_CAT = {
    chicken: 'Les poules',
    duck: 'Les canards',
    sheep: 'Les moutons',
    rabbit: 'Les lapins',
    cow: 'Les vaches',
    goat: 'Les chèvres',
    pig: 'Les cochons',
    goose: 'Les oies',
    peacock: 'Les paons',
    alpaca: 'Les alpagas',
    buffalo: 'Les bufflonnes',
    donkey: 'Les ânes',
    turkey: 'Les dindes',
    ewe: 'Les brebis laitières',
    quail: 'Les cailles',
    pigeon: 'Les pigeons',
    guinea: 'Les pintades',
    mohairGoat: 'Les chèvres angoras',
    pheasant: 'Les faisans',
    ostrich: 'Les autruches',
    yak: 'Les yacks',
};
