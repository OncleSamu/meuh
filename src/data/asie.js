// Les Terres d’Asie (1.171) : des rizières en terrasses irriguées en cascade depuis un bassin de source.
// La rangée du haut (terrasse 1) reçoit l’eau tant que le bassin n’est pas vide.
// Des rigoles de bambou posées sur des cases libres font descendre l’eau en cascade sur les terrasses inférieures,
// avec un bonus de fraîcheur à chaque terrasse descendue (+10 % par palier, jusqu’à +30 %).
// Hors cascade ou bassin vide, rien ne meurt : les plantes poussent simplement au ralenti.

export const ASIE = {
    lvl: 80,
    project: 'asiaSluice', // le chantier qui ouvre Les Terres d’Asie (chapitre 25)
    cols: 4,
    cells: 20, // cases en tout (4 × 5 terrasses)
    cellsBase: 8,
    cellCost: 60000, // 9e case, puis × cellMult
    cellMult: 1.18,
    rate: 1.15, // vitesse de pousse irriguée
    dry: 0.35, // vitesse de pousse à sec (hors cascade ou bassin vide)
    cascadeBonus: 0.1, // +10 % par terrasse descendue sous une rigole (max +30 %)
    // le bassin de source en haut des terrasses, en litres
    basin: [120, 360], // capacité de base, puis avec le grand bassin
    start: 80, // litres dans le bassin à l'ouverture
    spring: 18, // litres par heure (même jeu fermé)
    springBonus: 14, // litres par heure en plus avec le grand bassin
    drink: { crop: 2.5, tree: 3.5 }, // litres par heure par culture irriguée qui pousse
    offlineDry: 0.35,
    offlineMax: 3 * 24 * 3600, // au plus trois jours rattrapés
    canal: {
        cost: { coins: 12000, wood: 50, stone: 30, tools: 5 },
    },
    // améliorations : [id, nom, texte, prix]
    ups: [
        ['weir', 'Le double déversoir', 'Chaque rigole irrigue en cascade sa colonne et les deux colonnes voisines.', { coins: 100000, wood: 140, tools: 15 }],
        ['terraceStone', 'Les murets de pierre', 'Les terrasses consomment un quart d’eau en moins.', { coins: 80000, stone: 140, beam: 30 }],
        ['reservoir', 'Le grand bassin de source', 'Le bassin passe à 360 L et le ruisseau donne +14 L/h.', { coins: 160000, stone: 160, plank: 50 }],
    ],
    terraceStone: 0.75,
    // la roue à eau en bambou : trois fois par jour (jour réel), un geste de rythme
    wheel: { perDay: 3, max: 45, scoops: 5, perScoop: 9 },
    tree: 'yuzu', // l'arbre le plus emblématique (pour les cartes)
};

// les plantes : id, nom, graine, niveau, prix, vente, pousse (s), xp, saveurs [sucré, acide, amer, épicé, umami]
export const ASIE_CROPS = [
    ['lotus', 'Racine de lotus', 'Rhizomes de lotus', 80, 130, 380, 720, 12, '20102'],
    ['bambooShoot', 'Pousses de bambou', 'Turions de bambou', 80, 115, 350, 660, 11, '10102'],
    ['shiitake', 'Shiitake', 'Spores de shiitake', 80, 125, 370, 700, 12, '00105'],
    ['bokChoy', 'Pak choï', 'Graines de pak choï', 80, 100, 310, 600, 10, '10101'],
];
export const ASIE_TREES = [
    ['yuzu', 'Yuzu', 'Yuzuier', 80, 5600, 390, 1750, 13, '14100'],
    ['ume', 'Prunes ume', 'Abricotier du Japon', 80, 5200, 360, 1650, 12, '14100'],
    ['kumquat', 'Kumquats', 'Kumquatier', 80, 5000, 350, 1600, 12, '33100'],
    ['nashi', 'Poires nashi', 'Poirier nashi', 80, 5400, 370, 1700, 12, '41000'],
    ['longan', 'Longanes', 'Longanier', 80, 5800, 400, 1800, 13, '50000'],
    ['ginkgo', 'Noix de ginkgo', 'Ginkgo biloba', 80, 6200, 420, 1950, 14, '10202'],
];
// le verger des Terres d'Asie : 4 places, jusqu'à 12 ; les arbres prospèrent au calme (la floraison hanami les accélère)
export const ASIE_GROVE = { base: 4, max: 12, cost: 2200000, mult: 1.35 };
export const ASIE_IDS = [...ASIE_CROPS, ...ASIE_TREES].map(r => r[0]);

// ================= Le pavillon de bambou et les bêtes d'Asie =================
// id, nom, produit, prix, production (s), niveau, xp, second produit, croissance du petit (s), prénoms, gènes de base, aime l'eau (1) ou non (0)
export const ASIE_BEASTS = [
    ['sika', 'Cerf sika', 'sikaMilk', 32000, 1500, 80, 25, 'velvetAntler', 1500, ['Nara', 'Sakura', 'Kyo', 'Momiji', 'Hana', 'Sora'], '3222244', 0],
    ['silkworm', 'Ver à soie', 'silkThread', 22000, 1250, 80, 22, 'goldenSilk', 800, ['Soie', 'Filin', 'Bombyx', 'Mûrier', 'Nacre', 'Lune'], '2422233', 1],
    ['silkie', 'Poule soie', 'silkieEgg', 11000, 620, 80, 17, 'silkieFeather', 420, ['Nuage', 'Plumette', 'Perle', 'Jade', 'Mochi', 'Flocon'], '3222232', 0],
];
export const ASIE_BEAST_IDS = ASIE_BEASTS.map(b => b[0]);

// id, nom, vente
export const ASIE_PRODUCTS = [
    ['sikaMilk', 'Lait de sika', 450],
    ['velvetAntler', 'Bois de velours', 720],
    ['silkThread', 'Fil de soie', 500],
    ['goldenSilk', 'Fil de soie dorée', 740],
    ['silkieEgg', 'Œuf de poule soie', 170],
    ['silkieFeather', 'Duvet de soie', 540],
];

export const PAVILION = {
    key: 97, // le numéro de « pré » du pavillon (ferme : 0..19, oasis : 99, Grand Nord : 98, Asie : 97)
    project: 'asiaPavilion',
    name: 'Le pavillon de bambou',
    cap: [12, 20], // places, puis le pavillon agrandi
    upCost: { coins: 280000, plank: 90, beam: 45 },
    dryMult: 0.5, // sans eau dans le bassin, les bêtes qui aiment la fraîcheur produisent deux fois moins vite
};

// ================= La jonque de la soie =================
export const JUNK = {
    project: 'asiaJunk',
    lanternProject: 'asiaLanterns', // le marché aux lanternes : +15 %
    sikas: 3, // cerfs sika adultes pour descendre les balles au port
    loads: 18, // charges ; une charge = 10 produits d'une même sorte
    perLoad: 10,
    time: 7 * 3600 * 1000,
    mult: 2.7, // × le prix du grossiste, pour les produits d'Asie
    otherMult: 1.3, // × le prix du grossiste, pour tout le reste
    lanternBonus: 0.15,
    spice: { chance: 0.35, id: 'starAnise', min: 3, max: 6 }, // une épice rare au retour
    monsoonDelay: 3600 * 1000,
};

// ================= La mousson et la floraison des cerisiers (Hanami) =================
export const ASIE_WEATHER = {
    monsoon: {
        every: [28 * 3600 * 1000, 54 * 3600 * 1000], // une mousson tous les 28 à 54 h réelles
        cells: [2, 4], // cases envasées (jamais celles qui portent une rigole)
        last: 4 * 3600 * 1000, // pendant 4 h, la source donne ×2,5 et toutes les terrasses sont irriguées
        springMult: 2.5,
    },
    hanami: {
        every: [16 * 3600 * 1000, 44 * 3600 * 1000], // pluie de pétales de cerisier
        last: 3600 * 1000, // une heure
        mult: 1.5, // tout pousse une fois et demie plus vite (terrasses et verger)
    },
};
