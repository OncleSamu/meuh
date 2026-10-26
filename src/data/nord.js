// Le Grand Nord (1.51) : le miroir de l'oasis. Ici, ce n'est pas l'eau qui manque, c'est la chaleur.
// Hors d'un poêle, une plante pousse au ralenti, et pas du tout les nuits de gel ; un poêle allumé chauffe les cases autour de lui.
// Le poêle brûle du bois de la ferme, une heure de feu par bûche. Rien ne meurt : tout attend le feu.

export const NORD = {
    lvl: 60,
    project: 'northStove', // le chantier qui ouvre le Grand Nord
    cols: 4,
    cells: 20, // cases en tout (4 × 5)
    cellsBase: 8,
    cellCost: 50000, // 9e case, puis × cellMult
    cellMult: 1.18,
    rate: 1, // vitesse de pousse au chaud
    cold: 0.35, // vitesse de pousse hors d'un poêle, en journée
    frost: [21, 7], // la nuit de gel (heure de la ferme) : hors d'un poêle, rien ne pousse
    offlineCold: 0.2, // jeu fermé : la vitesse moyenne hors d'un poêle sur une journée (10 h de gel, 14 h à × 0,35)
    offlineMax: 3 * 24 * 3600, // au plus trois jours rattrapés
    stove: {
        cost: { coins: 12000, stone: 40, plank: 20, tools: 5 },
        fuelCap: [12, 24], // heures de feu qu'un poêle garde, puis avec la caisse à bûches
        woodHours: 1, // une bûche = une heure de feu
        radius: 1, // les huit cases autour ; 2 avec le poêle en fonte
    },
    // améliorations : [id, nom, texte, prix]
    ups: [
        ['iron', 'Le poêle en fonte', 'Chaque poêle chauffe aussi les cases à deux pas.', { coins: 90000, stone: 100, tools: 15 }],
        ['insulation', 'L’isolation de rondins', 'Les poêles brûlent un quart de bois en moins.', { coins: 60000, beam: 30, plank: 40 }],
        ['logbox', 'La caisse à bûches', 'Chaque poêle garde 24 heures de feu au lieu de 12.', { coins: 40000, wood: 150, plank: 30 }],
    ],
    insulation: 0.75, // le bois brûlé avec l'isolation
    // fendre le bois : trois fois par jour (jour réel), un geste de rythme
    chop: { perDay: 3, max: 30, swings: 5, perSwing: 6 },
    // la réserve au chantier : le bois qu'on emporte d'un coup depuis la grange
    tree: 'spruce', // l'arbre le plus emblématique (pour les cartes)
};

// les six plantes : id, nom, graine, niveau, prix, vente, pousse (s), xp, saveurs [sucré, acide, amer, épicé, umami]
export const NORD_CROPS = [
    ['rye', 'Seigle', 'Graines de seigle', 60, 100, 300, 600, 10, '10200'],
    ['lingonberry', 'Airelles', 'Plants d’airelle', 60, 110, 330, 660, 11, '13000'],
    ['cloudberry', 'Chicoutai', 'Plants de chicoutai', 60, 130, 380, 780, 12, '31000'],
];
export const NORD_TREES = [
    ['seaBuckthorn', 'Baies d’argousier', 'Argousier', 60, 5000, 360, 1700, 12, '03100'],
    ['spruce', 'Pousses d’épicéa', 'Épicéa', 60, 5500, 340, 1800, 12, '01300'],
    ['rowan', 'Baies de sorbier', 'Sorbier', 60, 4800, 330, 1600, 12, '21200'],
];
export const NORD_IDS = [...NORD_CROPS, ...NORD_TREES].map(r => r[0]);

// ================= 1.52 : l'étable de rondins et les bêtes du Nord =================
// id, nom, produit, prix, production (s), niveau, xp, second produit, croissance du petit (s), prénoms, gènes de base, craint le gel (1) ou non (0)
export const NORD_BEASTS = [
    ['reindeer', 'Renne', 'reindeerMilk', 30000, 1500, 60, 24, 'antler', 1500, ['Tonttu', 'Aurore', 'Komet', 'Rudolf', 'Vaara', 'Lumi'], '3222244', 1],
    ['muskox', 'Bœuf musqué', 'qiviut', 26000, 1300, 60, 22, null, 1500, ['Ukko', 'Bjorn', 'Sisu', 'Taiga', 'Mammouth', 'Hiver'], '2332234', 0],
    ['ptarmigan', 'Lagopède', 'ptarmiganEgg', 9000, 600, 60, 16, null, 400, ['Neigeuse', 'Poudrette', 'Blanchon', 'Tundra', 'Duvet', 'Perdrix'], '3222232', 1],
];
export const NORD_BEAST_IDS = NORD_BEASTS.map(b => b[0]);
// id, nom, vente
export const NORD_PRODUCTS = [
    ['reindeerMilk', 'Lait de renne', 440],
    ['antler', 'Bois de renne', 700],
    ['qiviut', 'Qiviut', 520],
    ['ptarmiganEgg', 'Œuf de lagopède', 150],
];
export const BARN = {
    key: 98, // le numéro de « pré » de l'étable (les prés de la ferme vont de 0 à 19, l'enclos de l'oasis est le 99)
    project: 'northStable',
    name: 'L’étable de rondins',
    cap: [12, 20], // places, puis l'étable agrandie
    upCost: { coins: 250000, plank: 80, beam: 40 },
    shelterPerStove: 3, // bêtes à l'abri par poêle allumé
    coldMult: 0.5, // une bête au froid (nuit de gel, hors d'un poêle) produit deux fois moins vite
};
