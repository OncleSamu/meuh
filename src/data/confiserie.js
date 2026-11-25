// 1.178 : L'Atelier Confiserie (Chocolat, Caramel & Berlingots — composition libre, 3 mini-jeux inédits, 18 Grands Classiques, Grimoire & Commandes).
// Débloqué au niveau 54 (palier calme après la Brasserie niv. 36 et l'Hydromel niv. 47, avant la Parfumerie niv. 58).

export const CONF_LVL = 54;

export const CONF_KINDS = {
    chocolate: {
        id: 'chocolate',
        name: 'Chocolat',
        title: 'Chocolaterie fine',
        maxIngs: 3,
        batch: 6,
        baseTime: 600, // 10 min + 3 min par ingrédient
        perIng: 180,
        miniName: 'Tempérage sur marbre',
        miniDesc: 'Maintiens la courbe de température (50 °C → 28 °C → 31 °C) pour obtenir un brillant miroir !',
        shapes: ['tablette', 'truffe', 'rocher'],
        col: '#5a311e',
    },
    caramel: {
        id: 'caramel',
        name: 'Caramel',
        title: 'Chaudron à caramel',
        maxIngs: 2,
        batch: 8,
        baseTime: 480, // 8 min + 2 min par ingrédient
        perIng: 120,
        miniName: 'L’Instant Ambré',
        miniDesc: 'Glisse le beurre dans le chaudron pile quand le caramel atteint la teinte ambrée parfaite !',
        shapes: ['papillote', 'pave', 'pot'],
        col: '#c4741a',
    },
    berlingot: {
        id: 'berlingot',
        name: 'Berlingots',
        title: 'Sucre cuit & Berlingots',
        maxIngs: 2,
        batch: 10,
        baseTime: 420, // 7 min + 2 min par ingrédient
        perIng: 120,
        miniName: 'La Coupe au Ciseau',
        miniDesc: 'Tranche le ruban de sucre coloré pile sur les 6 repères en losange pour des berlingots parfaits !',
        shapes: ['berlingot', 'sucette', 'pastille'],
        col: '#d9486b',
    },
};
export const CONF_KIND_IDS = Object.keys(CONF_KINDS);

// Les bases de chaque métier : coûts en ingrédients de ferme, couleur SVG, profil de goût [sucré, acide, amer, épicé, umami], notes aimées
export const CONF_BASES = {
    // ---- Chocolat ----
    dark: {
        id: 'dark',
        kind: 'chocolate',
        name: 'Chocolat Noir 70 %',
        short: 'Noir 70 %',
        cost: { cacao: 3, sugar: 1 },
        col: '#4a2515',
        col2: '#2d140a',
        taste: [1, 0, 4, 0, 1],
        likes: [1, 3, 0],
        text: 'aime les agrumes, les baies acidulées et les épices',
    },
    milk: {
        id: 'milk',
        kind: 'chocolate',
        name: 'Chocolat au Lait',
        short: 'Au Lait',
        cost: { cacao: 2, milk: 2, sugar: 1 },
        col: '#8a522d',
        col2: '#63371b',
        taste: [3, 0, 2, 0, 1],
        likes: [0, 2, 4],
        text: 'aime le doux, les fruits à coque et le café',
    },
    white: {
        id: 'white',
        kind: 'chocolate',
        name: 'Chocolat Blanc',
        short: 'Blanc',
        cost: { milk: 2, butter: 1, sugar: 2 },
        col: '#f6ebd0',
        col2: '#e2cfa3',
        taste: [5, 0, 0, 0, 1],
        likes: [1, 3],
        text: 'aime les fruits rouges, le yuzu et les fleurs vives',
    },
    praline: {
        id: 'praline',
        kind: 'chocolate',
        name: 'Chocolat Praliné',
        short: 'Praliné',
        cost: { cacao: 2, hazelnut: 2, sugar: 1 },
        col: '#784422',
        col2: '#522c14',
        taste: [3, 0, 1, 0, 3],
        likes: [0, 2, 4],
        text: 'aime le grillé, les noix et les notes rondes',
    },

    // ---- Caramel ----
    salted: {
        id: 'salted',
        kind: 'caramel',
        name: 'Caramel Beurre Salé',
        short: 'Beurre Salé',
        cost: { butter: 2, sugar: 2 },
        col: '#cf7d22',
        col2: '#9a5410',
        taste: [3, 0, 1, 0, 2],
        likes: [0, 2, 4],
        text: 'aime les pommes, noix, vanille et café',
    },
    cream: {
        id: 'cream',
        kind: 'caramel',
        name: 'Caramel Crème Douce',
        short: 'Crème Douce',
        cost: { cream: 2, sugar: 2 },
        col: '#e39e44',
        col2: '#b87424',
        taste: [4, 0, 0, 0, 1],
        likes: [0, 1, 3],
        text: 'aime les fruits du verger et les épices douces',
    },
    brown: {
        id: 'brown',
        kind: 'caramel',
        name: 'Caramel Ambré',
        short: 'Ambré',
        cost: { sugar: 3, butter: 1 },
        col: '#b55f16',
        col2: '#7a3c0a',
        taste: [3, 0, 2, 1, 0],
        likes: [1, 3, 2],
        text: 'aime le caractère : gingembre, agrumes, épices',
    },

    // ---- Berlingots ----
    sugar: {
        id: 'sugar',
        kind: 'berlingot',
        name: 'Sucre Cuit Nacré',
        short: 'Sucre Cuit',
        cost: { sugar: 3 },
        col: '#f26a8d',
        col2: '#c93c61',
        taste: [4, 0, 0, 0, 0],
        likes: [1, 3],
        text: 'sublimé par les agrumes, la menthe et les baies vives',
    },
    cane: {
        id: 'cane',
        kind: 'berlingot',
        name: 'Sucre d’Orge au Miel',
        short: 'Sucre d’Orge',
        cost: { sugar: 2, honey: 2 },
        col: '#f0a63a',
        col2: '#c47514',
        taste: [3, 1, 0, 0, 0],
        likes: [1, 3, 0],
        text: 'aime les fleurs, les fruits rouges et le miel',
    },
    birch: {
        id: 'birch',
        kind: 'berlingot',
        name: 'Sucre Cristal Frais',
        short: 'Cristal Frais',
        cost: { sugar: 2, mint: 1 },
        col: '#4fb8a6',
        col2: '#278273',
        taste: [3, 1, 0, 1, 0],
        likes: [1, 2, 3],
        text: 'aime les plantes boréales, le yuzu et les herbes',
    },
};

export const CONF_SHAPES = {
    tablette: { id: 'tablette', kind: 'chocolate', name: 'Tablette moulée' },
    truffe: { id: 'truffe', kind: 'chocolate', name: 'Truffes poudrées' },
    rocher: { id: 'rocher', kind: 'chocolate', name: 'Rochers croquants' },
    papillote: { id: 'papillote', kind: 'caramel', name: 'Papillotes dorées' },
    pave: { id: 'pave', kind: 'caramel', name: 'Pavés brillants' },
    pot: { id: 'pot', kind: 'caramel', name: 'Pot de crème caramel' },
    berlingot: { id: 'berlingot', kind: 'berlingot', name: 'Berlingots rayés' },
    sucette: { id: 'sucette', kind: 'berlingot', name: 'Sucettes spirales' },
    pastille: { id: 'pastille', kind: 'berlingot', name: 'Pastilles cristallisées' },
};

// Ingrédients d'atelier supplémentaires utilisables en confiserie (en plus de toutes les cultures/fruits avec FLAVORS)
export const CONF_EXTRA = {
    coffee: [0, 1, 5, 0, 1],
    rum: [0, 0, 2, 3, 2],
    champagne: [2, 3, 0, 0, 1],
    cider: [2, 4, 0, 0, 0],
    espelettePowder: [0, 0, 0, 5, 1],
    praline: [3, 0, 1, 0, 4],
    caramel: [4, 0, 1, 0, 1],
    brownSugar: [4, 0, 1, 1, 0],
    darkChoc: [1, 0, 5, 0, 1],
    orangeBlossomWater: [2, 3, 0, 1, 0],
};

// Couleur d'accent par note de goût dominante (pour teinter les rayures et inclusions SVG)
export const CONF_NOTE_COL = ['#f28ab2', '#f5c842', '#7a4826', '#e0533c', '#749c48'];

// 18 Grands Classiques de la Confiserie (6 Chocolats, 6 Caramels, 6 Berlingots — +2★ + ruban doré)
export const CONF_CLASSICS = [
    // Chocolat (6)
    {
        id: 'rocherPraline',
        kind: 'chocolate',
        bases: ['praline', 'milk'],
        any: ['hazelnut', 'almond'],
        name: 'Rocher Praliné',
        hint: 'Chocolat au lait ou praliné avec noisette ou amande',
        text: 'Le grand rocher croustillant : chocolat fondant et éclats de noisette ou d’amande.',
    },
    {
        id: 'ganacheYuzu',
        kind: 'chocolate',
        bases: ['dark', 'white'],
        any: ['yuzu', 'kumquat'],
        name: 'Ganache au Yuzu',
        hint: 'Chocolat noir ou blanc avec un agrume des Terres d’Asie',
        text: 'Mariage impérial entre la puissance du chocolat et la fraîcheur vive du yuzu.',
    },
    {
        id: 'chocEspelette',
        kind: 'chocolate',
        bases: ['dark'],
        any: ['espelettePowder', 'pepper', 'peppercorn'],
        name: 'Tablette Basque au Piment',
        hint: 'Chocolat noir 70 % relevé d’une touche pimentée ou poivrée',
        text: 'Un grand classique du Sud-Ouest : cacao intense et chaleur douce d’épice.',
    },
    {
        id: 'orangette',
        kind: 'chocolate',
        bases: ['dark'],
        any: ['orange', 'bitterOrange', 'mandarin'],
        name: 'Orangettes Confites',
        hint: 'Chocolat noir 70 % et agrume doux ou bigarade',
        text: 'Écorces d’agrumes confites enrobées de chocolat noir cassant.',
    },
    {
        id: 'truffeFramboise',
        kind: 'chocolate',
        bases: ['dark', 'white'],
        any: ['raspberry', 'strawberry', 'cherry'],
        name: 'Truffe aux Fruits Rouges',
        hint: 'Chocolat noir ou blanc avec framboise, fraise ou cerise',
        text: 'Cœur fruité acidulé sous une fine robe cacaotée.',
    },
    {
        id: 'truffeChampagne',
        kind: 'chocolate',
        bases: ['dark', 'milk'],
        any: ['champagne', 'rum', 'coffee'],
        name: 'Truffe de Gala',
        hint: 'Chocolat noir ou au lait parfumé au champagne, rhum ou café',
        text: 'La bouchée des grands soirs : ganache soyeuse et arôme noble.',
    },

    // Caramel (6)
    {
        id: 'caramelBreton',
        kind: 'caramel',
        bases: ['salted'],
        any: ['vanilla', 'hazelnut', 'almond'],
        name: 'Caramel Beurre Salé Royal',
        hint: 'Base Beurre Salé sublimée par vanille, noisette ou amande',
        text: 'Fondant, salé juste ce qu’il faut, avec une pointe de vanille ou de fruit sec.',
    },
    {
        id: 'caramelTatin',
        kind: 'caramel',
        bases: ['salted', 'cream', 'brown'],
        any: ['apple', 'pear', 'nashi'],
        name: 'Caramel Pomme Tatin',
        hint: 'Un caramel aux fruits à pépins du verger (pomme, poire ou nashi)',
        text: 'Toute la gourmandise d’une tarte Tatin concentrée dans un pavé fondant.',
    },
    {
        id: 'caramelLavande',
        kind: 'caramel',
        bases: ['cream', 'honey'],
        any: ['lavender', 'chamomile', 'lotus'],
        name: 'Caramel aux Fleurs de Miel',
        hint: 'Base Crème ou Miel de fleur avec lavande, camomille ou lotus',
        text: 'Douceur florale et rondeur miellée qui fond lentement sous le palais.',
    },
    {
        id: 'caramelCafe',
        kind: 'caramel',
        bases: ['salted', 'cream', 'brown'],
        any: ['coffee', 'cacao', 'darkChoc'],
        name: 'Caramel Moka Torréfié',
        hint: 'Un caramel réveillé par le café ou le cacao',
        text: 'Notes grillées et amertume délicate pour les amateurs de caractère.',
    },
    {
        id: 'caramelEpices',
        kind: 'caramel',
        bases: ['brown', 'honey'],
        any: ['ginger', 'cinnamon', 'cardamom'],
        name: 'Caramel Route des Épices',
        hint: 'Caramel ambré ou au miel avec gingembre, cannelle ou cardamome',
        text: 'Chaleur épicée et sucre ambré aux parfums de voyage.',
    },
    {
        id: 'caramelPistache',
        kind: 'caramel',
        bases: ['cream', 'salted'],
        any: ['pistachio', 'walnut', 'chestnut'],
        name: 'Caramel Croquant aux Noix',
        hint: 'Caramel crème ou beurre salé aux éclats de pistache, noix ou châtaigne',
        text: 'Alliance irrésistible du fondant beurré et du croquant doré.',
    },

    // Berlingots (6)
    {
        id: 'berlingotMenthe',
        kind: 'berlingot',
        bases: ['sugar', 'birch'],
        any: ['mint', 'lemon', 'lime'],
        name: 'Berlingot Menthe-Citron',
        hint: 'Sucre cuit ou cristal frais avec menthe, citron ou citron vert',
        text: 'Le berlingot rafraîchissant historique des foires de la vallée.',
    },
    {
        id: 'pastilleNord',
        kind: 'berlingot',
        bases: ['sugar', 'birch', 'cane'],
        any: ['lingonberry', 'cloudberry', 'seaBuckthorn'],
        name: 'Pastille des Baies Boréales',
        hint: 'Un berlingot aux baies acidulées du Grand Nord',
        text: 'Éclat fruité d’airelle, chicoutai ou argousier pris dans le sucre cristal.',
    },
    {
        id: 'sucreEpicea',
        kind: 'berlingot',
        bases: ['cane', 'birch'],
        any: ['spruce', 'juniper', 'genepi'],
        name: 'Sucre d’Orge des Cimes',
        hint: 'Sucre d’orge ou cristal frais à l’épicéa, au genièvre ou au génépi',
        text: 'Bonbon résineux et pur comme l’air des montagnes d’hiver.',
    },
    {
        id: 'berlingotAsie',
        kind: 'berlingot',
        bases: ['sugar', 'birch', 'cane'],
        any: ['yuzu', 'ume', 'kumquat'],
        name: 'Berlingot des Terrasses',
        hint: 'Un berlingot au yuzu, à la prune ume ou au kumquat',
        text: 'Sucre tiré aux reflets d’or parfumé aux vergers des Terres d’Asie.',
    },
    {
        id: 'sucetteRouge',
        kind: 'berlingot',
        bases: ['sugar', 'cane'],
        any: ['strawberry', 'raspberry', 'blackcurrant', 'cherry'],
        name: 'Sucette des Jardins Rouges',
        hint: 'Sucre cuit ou sucre d’orge aux petits fruits rouges',
        text: 'Rayures carmin et parfum d’été adoré de Lucie et des enfants.',
    },
    {
        id: 'pastilleFleur',
        kind: 'berlingot',
        bases: ['sugar', 'cane'],
        any: ['hibiscus', 'waterLily', 'tiare', 'lotus'],
        name: 'Perle Florale Cristallisée',
        hint: 'Un bonbon fin à l’hibiscus, nénuphar, tiaré ou lotus',
        text: 'Fleur délicate enfermée dans un écrin de sucre translucide.',
    },
];

// Multiplicateurs selon les étoiles d'accord (0..3) et le score du mini-jeu (0 = atelier auto, 1..3 = mini-jeu)
export const CONF_HARMONY = [0.85, 1.15, 1.45, 1.8];
export const CONF_MINI_MULT = [1, 1.05, 1.15, 1.3];

// Commandes gourmandes (Lucie en tête !)
export const CONF_ORDERS = {
    every: 2100, // nouvelle commande toutes les 35 min
    max: 3,
    payMult: 1.75,
    villagers: ['lucie', 'odette', 'gaston', 'mei', 'ingrid', 'yasmine', 'margaux', 'odile', 'theo', 'marcel', 'lina'],
};

// Grimoire du Confiseur : palier tous les 8 découverts (ingrédients confits + 18 classiques)
export const CONF_GRIMOIRE = {
    step: 8,
    coins: 10000,
    xp: 250,
};

// Cadeaux aux villageois : familles préférées (+2 cœurs bonus)
export const CONF_PREFS = {
    lucie: 'berlingot',
    odette: 'caramel',
    gaston: 'chocolate',
    mei: 'berlingot',
    ingrid: 'caramel',
    yasmine: 'chocolate',
    margaux: 'chocolate',
    odile: 'berlingot',
    theo: 'caramel',
    lina: 'chocolate',
    henri: 'caramel',
    milo: 'berlingot',
    anatole: 'chocolate',
};

// Demande douce (comme Parfumerie & Brasserie)
export const CONF_DEMAND = { per: 0.014, floor: 0.55, half: 6 * 3600 };
