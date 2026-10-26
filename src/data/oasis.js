// L'oasis (1.48) : une contrée où tout pousse, à condition d'avoir de l'eau. Ouverte par le chapitre 21, « La source d'Idris ».
// La citerne se remplit à la source (même jeu fermé) et au chadouf ; chaque plante boit en poussant ;
// de midi à 16 h, une plante au soleil boit deux fois plus ; à côté d'un palmier dattier, elle est à l'ombre.

export const OASIS = {
    lvl: 58,
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
    drink: { crop: 3, tree: 4, palm: 1.5 },
    heat: [12, 16], // les heures chaudes (heure de la ferme)
    heatMult: 2,
    shade: 2 / 3, // à l'ombre : un tiers de moins, et pas de chaleur
    offlineHeat: 7 / 6, // jeu fermé : la chaleur moyenne d'une journée (4 heures sur 24 à × 2)
    offlineMax: 3 * 24 * 3600, // au plus trois jours rattrapés
    // le chadouf : trois fois par jour (jour réel), un geste de rythme
    chadouf: { perDay: 3, max: 40, scoops: 5, perScoop: 8 },
    palm: 'date', // l'arbre qui donne l'ombre
};

// les six plantes : id, nom, graine, niveau, prix, vente, pousse (s), xp, saveurs [sucré, acide, amer, épicé, umami]
export const OASIS_CROPS = [
    ['cumin', 'Cumin', 'Graines de cumin', 58, 110, 340, 720, 11, '00140'],
    ['coriander', 'Coriandre', 'Graines de coriandre', 58, 90, 300, 600, 10, '02031'],
    ['sesame', 'Sésame', 'Graines de sésame', 58, 100, 320, 660, 10, '10102'],
];
export const OASIS_TREES = [
    ['date', 'Datte', 'Palmier dattier', 58, 6000, 380, 1800, 13, '50000'],
    ['jujube', 'Jujube', 'Jujubier', 58, 5000, 340, 1600, 12, '32000'],
    ['bitterOrange', 'Bigarade', 'Oranger amer', 58, 5500, 360, 1700, 12, '04300'],
];
export const OASIS_IDS = [...OASIS_CROPS, ...OASIS_TREES].map(r => r[0]);
