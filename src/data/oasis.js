// L'oasis (1.48) : une contrée où tout pousse, à condition d'avoir de l'eau. Ouverte par le chapitre 21, « La source d'Idris ».
// La citerne se remplit à la source (même jeu fermé) et au chadouf ; chaque plante boit en poussant ;
// de midi à 16 h, une plante au soleil boit deux fois plus ; à côté d'un sorgho bien levé, elle est à l'ombre.

export const OASIS = {
    lvl: 59,
    project: 'oasisWell', // le chantier qui ouvre l'oasis
    cols: 4,
    cells: 20, // cases en tout (4 × 5)
    cellsBase: 8,
    cellCost: 40000, // 9e case, puis × cellMult
    cellMult: 1.18,
    rate: 1.15, // vitesse de pousse (comme sous les tropiques)
    // l'eau, en litres
    tank: [100, 250, 400], // la citerne et ses deux agrandissements
    tankCost: [
        { coins: 60000, stone: 60, plank: 20 },
        { coins: 150000, stone: 120, beam: 30 },
    ],
    start: 60, // litres dans la citerne à l'ouverture
    spring: 20, // litres par heure (même jeu fermé)
    // améliorations de la source : [id, nom, litres par heure en plus, prix]
    springUps: [
        ['deep', 'Le puits plus profond', 10, { coins: 80000, stone: 80, tools: 10 }],
        ['foggara', 'Les galeries souterraines', 20, { coins: 220000, stone: 200, beam: 40 }],
    ],
    // ce que boit chaque plante qui pousse (ou qui porte des fruits), en litres par heure ; une plante mûre ne boit plus
    drink: { crop: 3, tree: 4 },
    heat: [12, 16], // les heures chaudes (heure de la ferme)
    heatMult: 2,
    shade: 2 / 3, // à l'ombre : un tiers de moins, et pas de chaleur
    offlineHeat: 7 / 6, // jeu fermé : la chaleur moyenne d'une journée (4 heures sur 24 à × 2)
    offlineMax: 3 * 24 * 3600, // au plus trois jours rattrapés
    // le chadouf : trois fois par jour (jour réel), un geste de rythme
    chadouf: { perDay: 3, max: 40, scoops: 5, perScoop: 8 },
    shadeCrop: 'sorghum', // la haute culture qui donne l'ombre (1.58 : plus le palmier dattier)
    shadeFrom: 0.5, // elle fait de l'ombre dès qu'elle a poussé de moitié, jusqu'à la récolte
};

// les six plantes : id, nom, graine, niveau, prix, vente, pousse (s), xp, saveurs [sucré, acide, amer, épicé, umami]
export const OASIS_CROPS = [
    ['cumin', 'Cumin', 'Graines de cumin', 58, 110, 340, 720, 11, '00140'],
    ['coriander', 'Coriandre', 'Graines de coriandre', 58, 90, 300, 600, 10, '02031'],
    ['sesame', 'Sésame', 'Graines de sésame', 58, 100, 320, 660, 10, '10102'],
    ['sorghum', 'Sorgho', 'Graines de sorgho', 58, 110, 330, 780, 11, '10010'],
];
export const OASIS_TREES = [
    ['date', 'Datte', 'Palmier dattier', 58, 6000, 380, 1800, 13, '50000'],
    ['jujube', 'Jujube', 'Jujubier', 58, 5000, 340, 1600, 12, '32000'],
    ['bitterOrange', 'Bigarade', 'Oranger amer', 58, 5500, 360, 1700, 12, '04300'],
];
export const OASIS_IDS = [...OASIS_CROPS, ...OASIS_TREES].map(r => r[0]);

// ---------------- 1.49 : l'enclos de la palmeraie, ses bêtes, les caravanes, la tempête ----------------
// id, nom, produit, prix, production (s), niveau, xp, second produit, croissance du petit (s), prénoms, gènes de base, boit (L/h)
export const OASIS_BEASTS = [
    [
        'dromedary',
        'Dromadaire',
        'camelMilk',
        30000,
        1500,
        59,
        24,
        'camelWool',
        1500,
        ['Sahel', 'Tamara', 'Bachir', 'Dune', 'Mirage', 'Zéphyrine'],
        '3222244',
        0.4,
    ],
    ['zebu', 'Zébu', 'zebuMilk', 22000, 1300, 59, 22, null, 1500, ['Bosco', 'Perle', 'Ganga', 'Nandi', 'Mousson', 'Safran'], '3222234', 2],
    [
        'barbarySheep',
        'Mouton barbarin',
        'barbaryWool',
        12000,
        1200,
        59,
        20,
        null,
        900,
        ['Barbarin', 'Kebir', 'Tafilalt', 'Laineux', 'Grosse-Queue', 'Nomade'],
        '2422233',
        0.5,
    ],
];
export const OASIS_BEAST_IDS = OASIS_BEASTS.map(b => b[0]);
// id, nom, vente
export const OASIS_PRODUCTS = [
    ['camelMilk', 'Lait de chamelle', 420],
    ['zebuMilk', 'Lait de zébu', 360],
    ['camelWool', 'Laine de dromadaire', 520],
    ['barbaryWool', 'Laine barbarine', 380],
];
export const PEN = {
    key: 99, // le numéro de « pré » de l'enclos (les prés de la ferme vont de 0 à 19)
    project: 'oasisPen',
    name: 'L’enclos de la palmeraie',
    cap: [12, 20], // places, puis la palissade agrandie
    upCost: { coins: 250000, plank: 80, beam: 40 },
    shadePerCrop: 2, // bêtes abritées par sorgho debout (1.58)
    heatMult: 0.5, // au soleil de midi à 16 h : moitié moins vite (sauf le mouton barbarin)
    heatProof: ['barbarySheep'],
    noria: { lph: 8, cost: { coins: 120000, beam: 60, plank: 40, tools: 20 } }, // un zébu attelé : +8 L/h, pas de lait
};
export const CARAVAN = {
    project: 'caravanserai',
    camels: 3, // dromadaires adultes, pas à la noria
    loads: 18, // charges ; une charge = 10 produits d'une même sorte
    perLoad: 10,
    time: 6 * 3600 * 1000,
    mult: 2.4, // × le prix du grossiste, pour les produits de l'oasis (plantes, laines, laits, recettes, épices)
    otherMult: 1.3, // × le prix du grossiste, pour tout le reste (1.51.1 : la caravane ne remplace plus le marché)
    soukBonus: 0.15, // + 15 % une fois les étals du souk ouverts
    spice: { chance: 0.35, id: 'saffron', min: 3, max: 6 }, // une épice rare au retour
    stormDelay: 3600 * 1000,
};
export const STORM = {
    every: [30 * 3600 * 1000, 60 * 3600 * 1000], // une tempête tous les 30 à 60 heures réelles
    cells: [2, 4], // cases ensablées (jamais à l'ombre)
};
