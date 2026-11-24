// 1.142 : L'Atelier du Parfumeur (L'Orgue à parfums).
// Pyramide olfactive (Tête · Cœur · Fond), 3 méthodes d'extraction, 3 concentrations,
// macération active en 3 étapes avec soins, flacons SVG sur mesure, salon de commandes et Orgue à remplir.

export const PERFUME_LVL = 58;

export const PERFUME = {
    lvl: PERFUME_LVL,
    vatsBase: 2, // 2 dame-jeannes de macération au départ (+1 dès Cuisines & ateliers niv. 2, +1 au niv. 5)
    maxVats: 4,
    priceMult: 2.35, // multiplicateur de base sur la valeur des essences
    harmony: [0.8, 1.05, 1.35, 1.8], // 0 à 3 étoiles
    careBonus: 0.12, // +12 % de valeur par soin réussi (jusqu'à +36 % avec 3 soins)
    demandHalf: 6 * 3600, // demi-vie de la baisse de demande (6 h)
    demandPer: 0.04,
    demandFloor: 0.55,
};

// 5 facettes olfactives (dans cet ordre pour tous les profils)
export const FACETS = ['Frais', 'Floral', 'Boisé', 'Épicé', 'Gourmand'];
export const FACET_COL = ['#4aa8d8', '#d972a6', '#8b6239', '#d45a2a', '#d99b26'];

// Accords entre deux facettes dominantes (clé "a-b" avec a < b)
export const PERFUME_PAIRS = {
    '0-1': 1, // Frais + Floral : lumineux
    '0-2': 1, // Frais + Boisé : vivifiant
    '1-2': 1, // Floral + Boisé : élégant
    '1-4': 1, // Floral + Gourmand : velouté
    '2-3': 1, // Boisé + Épicé : noble et profond
    '3-4': 1, // Épicé + Gourmand : ambré chaleureux
    '0-4': -1, // Frais + Gourmand : se heurtent
    '0-3': 0,
    '1-3': 1, // Floral + Épicé : envoûtant
    '2-4': 0,
};

// 3 méthodes d'extraction : chacune amplifie un étage et une facette
export const METHODS = {
    steam: {
        id: 'steam',
        name: 'Distillation',
        short: 'Vapeur',
        tier: 'head',
        facet: 0, // Frais
        boost: 2,
        timeMult: 0.85,
        valMult: 1.0,
        desc: 'À la vapeur : vif et cristallin, amplifie la note de tête.',
    },
    enfleurage: {
        id: 'enfleurage',
        name: 'Enfleurage',
        short: 'À froid',
        tier: 'heart',
        facet: 1, // Floral
        boost: 2,
        timeMult: 1.05,
        valMult: 1.15,
        desc: 'À froid : délicat et soyeux, sublime la note de cœur.',
    },
    maceration: {
        id: 'maceration',
        name: 'Macération',
        short: 'Lente',
        tier: 'base',
        facet: 2, // Boisé
        boost: 2,
        timeMult: 1.25,
        valMult: 1.28,
        desc: 'Lente au noir : profond et tenace, révèle la note de fond.',
    },
};
export const METHOD_IDS = Object.keys(METHODS);

// 3 concentrations : quantité d'ingrédients, durée par étape, nombre de flacons produits, prestige
export const CONCENTRATIONS = {
    fraiche: {
        id: 'fraiche',
        name: 'Eau fraîche',
        qty: 1,
        stageSec: 180, // 3 min × 3 étapes = 9 min
        bottles: 4,
        valMult: 1.0,
        desc: 'Légère et rapide (1 unité par note, 4 flacons).',
    },
    toilette: {
        id: 'toilette',
        name: 'Eau de parfum',
        qty: 2,
        stageSec: 360, // 6 min × 3 étapes = 18 min
        bottles: 4,
        valMult: 1.35,
        desc: 'Équilibrée et tenace (2 unités par note, 4 flacons).',
    },
    extrait: {
        id: 'extrait',
        name: 'Extrait pur',
        qty: 3,
        stageSec: 600, // 10 min × 3 étapes = 30 min
        bottles: 5,
        valMult: 1.75,
        desc: 'Précieux et concentré (3 unités par note, 5 flacons).',
    },
};
export const CONC_IDS = Object.keys(CONCENTRATIONS);

// 3 étapes de macération dans les dame-jeannes — 2 gestes de parfumeur au choix par étape :
// geste 0 (vif) : accélère l'étape de 15 % et ajoute +12 % de finesse ;
// geste 1 (profond) : sans accélération, mais +18 % de finesse et un sillage plus intense.
export const STAGES = [
    {
        name: 'Infusion',
        care: 'Remuer à vif',
        desc: 'Les essences se mêlent doucement.',
        choices: [
            { id: 'quick', name: 'Remuer à vif', speed: 0.15, bonus: 0.12, hint: '−15 % temps · +12 %' },
            { id: 'deep', name: 'Infuser lentement', speed: 0, bonus: 0.18, hint: '+18 % valeur' },
        ],
    },
    {
        name: 'Repos au noir',
        care: 'Aérer au matin',
        desc: 'L’accord s’arrondit à l’abri du jour.',
        choices: [
            { id: 'quick', name: 'Aérer au matin', speed: 0.15, bonus: 0.12, hint: '−15 % temps · +12 %' },
            { id: 'deep', name: 'Sceller à l’ombre', speed: 0, bonus: 0.18, hint: '+18 % valeur' },
        ],
    },
    {
        name: 'Glaçage & filtrage',
        care: 'Glacer & filtrer',
        desc: 'Le jus devient limpide et prêt à mettre en flacon.',
        choices: [
            { id: 'quick', name: 'Glacer & filtrer', speed: 0.15, bonus: 0.12, hint: '−15 % temps · +12 %' },
            { id: 'deep', name: 'Soutirer sur lie', speed: 0, bonus: 0.18, hint: '+18 % valeur' },
        ],
    },
];

// Touche obtenue avec 3 soins réussis selon l'orientation des gestes
export const PERFUME_TOUCHES = {
    quick: 'Cristallin',
    deep: 'Grand Sillage',
    mix: 'Équilibré',
};

// Parfum signature de la ferme (1 actif, 2★ minimum)
export const PERFUME_SIGN = {
    minStars: 2,
    salonBonus: [0, 0, 0.1, 0.15], // +10 % au Salon pour 2★, +15 % pour 3★
    giftBonus: 1, // +1 point d'amitié bonus en cadeau villageois
};

// Cadeau de parfum maison aux villageois (son cadeau du jour)
export const PERFUME_GIFT = {
    base: { fraiche: 3, toilette: 4, extrait: 5 },
    star3: 1,
    classic: 1,
    matchNote: 1,
};

// 7 familles olfactives
export const FAMILIES = {
    hesperide: { id: 'hesperide', name: 'Hespéridé', col: '#f2b830', desc: 'Éclatant d’agrumes et de fraîcheur' },
    aromatique: { id: 'aromatique', name: 'Aromatique', col: '#58a864', desc: 'Herbes fraîches et souffle vert' },
    floral: { id: 'floral', name: 'Floral', col: '#d972a6', desc: 'Bouquet délicat de fleurs de la ferme' },
    boise: { id: 'boise', name: 'Boisé', col: '#8b6239', desc: 'Notes chaudes de forêts et de résine' },
    oriental: { id: 'oriental', name: 'Oriental', col: '#c94f2a', desc: 'Épices précieuses et sillage envoûtant' },
    gourmand: { id: 'gourmand', name: 'Gourmand', col: '#d99b26', desc: 'Miel, vanille, cacao et fruits mûrs' },
    boreal: { id: 'boreal', name: 'Boréal', col: '#5a9bc4', desc: 'Conifères givrés et baies du Nord' },
};
export const FAMILY_IDS = Object.keys(FAMILIES);

// Toutes les essences de l'Orgue (75) : [Frais, Floral, Boisé, Épicé, Gourmand] + couleur du jus
export const PERFUME_NOTES = {
    // ---- Notes de Tête (25) ----
    lemon: { id: 'lemon', tier: 'head', v: [5, 0, 0, 0, 0], col: '#f5dc58', tag: 'hesperide' },
    orange: { id: 'orange', tier: 'head', v: [4, 1, 0, 0, 1], col: '#f29c38', tag: 'hesperide' },
    mandarin: { id: 'mandarin', tier: 'head', v: [4, 1, 0, 0, 2], col: '#f4822e', tag: 'hesperide' },
    grapefruit: { id: 'grapefruit', tier: 'head', v: [5, 0, 0, 1, 0], col: '#f07c70', tag: 'hesperide' },
    lime: { id: 'lime', tier: 'head', v: [5, 0, 0, 1, 0], col: '#9cd64c', tag: 'hesperide' },
    citron: { id: 'citron', tier: 'head', v: [5, 1, 0, 0, 0], col: '#e8e05a', tag: 'hesperide' },
    bitterOrange: { id: 'bitterOrange', tier: 'head', v: [5, 2, 0, 1, 0], col: '#e87f24', tag: 'hesperide' },
    mint: { id: 'mint', tier: 'head', v: [5, 0, 1, 0, 0], col: '#5cc48e', tag: 'aromatique' },
    basil: { id: 'basil', tier: 'head', v: [4, 0, 1, 2, 0], col: '#5da652', tag: 'aromatique' },
    thyme: { id: 'thyme', tier: 'head', v: [4, 1, 1, 2, 0], col: '#6fa65a', tag: 'aromatique' },
    lemongrass: { id: 'lemongrass', tier: 'head', v: [5, 0, 0, 2, 0], col: '#b8e06c', tag: 'hesperide' },
    genepi: { id: 'genepi', tier: 'head', v: [4, 1, 2, 1, 0], col: '#7ec26b', tag: 'aromatique' },
    coriander: { id: 'coriander', tier: 'head', v: [3, 0, 0, 4, 0], col: '#83b85e', tag: 'aromatique' },
    rhubarb: { id: 'rhubarb', tier: 'head', v: [4, 1, 0, 0, 2], col: '#d45a6e', tag: 'aromatique' },
    cucumber: { id: 'cucumber', tier: 'head', v: [5, 1, 0, 0, 0], col: '#78c97a', tag: 'hesperide' },
    aloe: { id: 'aloe', tier: 'head', v: [5, 1, 1, 0, 0], col: '#66b889', tag: 'aromatique' },
    apple: { id: 'apple', tier: 'head', v: [3, 1, 0, 0, 2], col: '#b8dc6a', tag: 'hesperide' },
    pear: { id: 'pear', tier: 'head', v: [3, 2, 0, 0, 2], col: '#d7dd74', tag: 'floral' },
    peach: { id: 'peach', tier: 'head', v: [2, 2, 0, 0, 3], col: '#f5a97a', tag: 'gourmand' },
    cherry: { id: 'cherry', tier: 'head', v: [2, 2, 0, 0, 3], col: '#d64558', tag: 'gourmand' },
    pineapple: { id: 'pineapple', tier: 'head', v: [3, 1, 0, 0, 3], col: '#f0c844', tag: 'hesperide' },
    spruce: { id: 'spruce', tier: 'head', v: [4, 0, 3, 0, 0], col: '#4a8f6a', tag: 'boreal' },
    juniper: { id: 'juniper', tier: 'head', v: [3, 0, 3, 2, 0], col: '#5b7fb0', tag: 'boreal' },
    birchSap: { id: 'birchSap', tier: 'head', v: [4, 0, 2, 0, 1], col: '#9fd0df', tag: 'boreal' },
    seaBuckthorn: { id: 'seaBuckthorn', tier: 'head', v: [4, 1, 0, 1, 2], col: '#f2922c', tag: 'boreal' },

    // ---- Notes de Cœur (25) ----
    lavender: { id: 'lavender', tier: 'heart', v: [2, 5, 1, 0, 0], col: '#9e7fd4', tag: 'floral' },
    chamomile: { id: 'chamomile', tier: 'heart', v: [2, 5, 0, 0, 1], col: '#f5dc78', tag: 'floral' },
    waterLily: { id: 'waterLily', tier: 'heart', v: [3, 5, 0, 0, 0], col: '#f5a8c8', tag: 'floral' },
    orangeBlossomWater: { id: 'orangeBlossomWater', tier: 'heart', v: [2, 5, 0, 0, 1], col: '#f7ead0', tag: 'floral' },
    tiare: { id: 'tiare', tier: 'heart', v: [1, 5, 0, 0, 2], col: '#f2e4a8', tag: 'floral' },
    orchid: { id: 'orchid', tier: 'heart', v: [0, 5, 1, 1, 2], col: '#d46cb4', tag: 'floral' },
    hibiscus: { id: 'hibiscus', tier: 'heart', v: [1, 4, 0, 2, 1], col: '#d94862', tag: 'floral' },
    tea: { id: 'tea', tier: 'heart', v: [3, 3, 2, 0, 0], col: '#6ea362', tag: 'aromatique' },
    fig: { id: 'fig', tier: 'heart', v: [1, 2, 2, 0, 3], col: '#8d5b8c', tag: 'gourmand' },
    pomegranate: { id: 'pomegranate', tier: 'heart', v: [2, 2, 0, 2, 2], col: '#c93c54', tag: 'oriental' },
    ginger: { id: 'ginger', tier: 'heart', v: [2, 0, 1, 5, 0], col: '#d9a44a', tag: 'oriental' },
    saffron: { id: 'saffron', tier: 'heart', v: [0, 2, 1, 5, 1], col: '#e06924', tag: 'oriental' },
    cardamom: { id: 'cardamom', tier: 'heart', v: [2, 0, 2, 5, 0], col: '#8aa86a', tag: 'oriental' },
    peppercorn: { id: 'peppercorn', tier: 'heart', v: [1, 0, 2, 5, 0], col: '#5c524a', tag: 'oriental' },
    strawberry: { id: 'strawberry', tier: 'heart', v: [1, 2, 0, 0, 4], col: '#e65a6e', tag: 'gourmand' },
    raspberry: { id: 'raspberry', tier: 'heart', v: [2, 3, 0, 0, 3], col: '#d4427a', tag: 'floral' },
    blueberry: { id: 'blueberry', tier: 'heart', v: [2, 2, 1, 0, 2], col: '#5c6ec4', tag: 'aromatique' },
    blackcurrant: { id: 'blackcurrant', tier: 'heart', v: [2, 3, 1, 0, 3], col: '#693c82', tag: 'floral' },
    blackberry: { id: 'blackberry', tier: 'heart', v: [1, 2, 1, 0, 4], col: '#4e3159', tag: 'gourmand' },
    lychee: { id: 'lychee', tier: 'heart', v: [2, 4, 0, 0, 2], col: '#f2a2b6', tag: 'floral' },
    passionFruit: { id: 'passionFruit', tier: 'heart', v: [2, 3, 0, 1, 3], col: '#e68c2e', tag: 'floral' },
    apricot: { id: 'apricot', tier: 'heart', v: [1, 3, 0, 0, 3], col: '#f2a452', tag: 'gourmand' },
    cloudberry: { id: 'cloudberry', tier: 'heart', v: [3, 2, 1, 0, 2], col: '#eba23b', tag: 'boreal' },
    elderberry: { id: 'elderberry', tier: 'heart', v: [2, 4, 1, 0, 1], col: '#644a7d', tag: 'boreal' },
    lingonberry: { id: 'lingonberry', tier: 'heart', v: [3, 2, 1, 1, 1], col: '#cc3d4c', tag: 'boreal' },

    // ---- Notes de Fond (25) ----
    resin: { id: 'resin', tier: 'base', v: [0, 0, 5, 2, 1], col: '#c9822e', tag: 'boise' },
    patchouli: { id: 'patchouli', tier: 'base', v: [0, 0, 5, 3, 1], col: '#6b4e2e', tag: 'boise' },
    cinnamon: { id: 'cinnamon', tier: 'base', v: [0, 0, 2, 5, 2], col: '#b85a2a', tag: 'oriental' },
    nutmeg: { id: 'nutmeg', tier: 'base', v: [0, 0, 3, 5, 1], col: '#9e6238', tag: 'oriental' },
    hardwood: { id: 'hardwood', tier: 'base', v: [0, 0, 5, 1, 0], col: '#8a5934', tag: 'boise' },
    solidOak: { id: 'solidOak', tier: 'base', v: [0, 0, 5, 1, 0], col: '#7a4f2b', tag: 'boise' },
    fruitWood: { id: 'fruitWood', tier: 'base', v: [1, 1, 4, 0, 1], col: '#b37544', tag: 'boise' },
    wood: { id: 'wood', tier: 'base', v: [1, 0, 4, 0, 0], col: '#a87a4c', tag: 'boise' },
    cembro: { id: 'cembro', tier: 'base', v: [1, 0, 5, 1, 1], col: '#5c7a52', tag: 'boreal' },
    vanilla: { id: 'vanilla', tier: 'base', v: [0, 1, 1, 1, 5], col: '#e6c57a', tag: 'gourmand' },
    cacao: { id: 'cacao', tier: 'base', v: [0, 0, 2, 1, 5], col: '#7a4b32', tag: 'gourmand' },
    coffee: { id: 'coffee', tier: 'base', v: [0, 0, 3, 2, 4], col: '#63412c', tag: 'oriental' },
    honey: { id: 'honey', tier: 'base', v: [0, 2, 0, 0, 5], col: '#e8b339', tag: 'gourmand' },
    caramel: { id: 'caramel', tier: 'base', v: [0, 0, 1, 0, 5], col: '#c97a2e', tag: 'gourmand' },
    brownSugar: { id: 'brownSugar', tier: 'base', v: [0, 0, 1, 1, 4], col: '#b8763e', tag: 'gourmand' },
    coconut: { id: 'coconut', tier: 'base', v: [1, 1, 1, 0, 5], col: '#ebe2cc', tag: 'gourmand' },
    date: { id: 'date', tier: 'base', v: [0, 0, 1, 2, 5], col: '#9c5227', tag: 'oriental' },
    carob: { id: 'carob', tier: 'base', v: [0, 0, 3, 1, 4], col: '#784830', tag: 'oriental' },
    chestnut: { id: 'chestnut', tier: 'base', v: [0, 0, 4, 0, 3], col: '#8f5932', tag: 'boise' },
    walnut: { id: 'walnut', tier: 'base', v: [0, 0, 4, 1, 2], col: '#9c6c3e', tag: 'boise' },
    hazelnut: { id: 'hazelnut', tier: 'base', v: [0, 0, 3, 0, 4], col: '#b88248', tag: 'gourmand' },
    almond: { id: 'almond', tier: 'base', v: [0, 1, 2, 0, 4], col: '#dfc296', tag: 'gourmand' },
    cider: { id: 'cider', tier: 'base', v: [2, 0, 2, 1, 2], col: '#d49e3a', tag: 'aromatique' },
    rum: { id: 'rum', tier: 'base', v: [0, 0, 2, 3, 4], col: '#c9883b', tag: 'oriental' },
    cognac: { id: 'cognac', tier: 'base', v: [0, 0, 3, 3, 4], col: '#b86c28', tag: 'oriental' },
};

export const HEAD_NOTES = Object.values(PERFUME_NOTES)
    .filter(n => n.tier === 'head')
    .map(n => n.id);
export const HEART_NOTES = Object.values(PERFUME_NOTES)
    .filter(n => n.tier === 'heart')
    .map(n => n.id);
export const BASE_NOTES = Object.values(PERFUME_NOTES)
    .filter(n => n.tier === 'base')
    .map(n => n.id);
export const ALL_NOTE_IDS = Object.keys(PERFUME_NOTES);

// 10 Grands Classiques de la Parfumerie (+2★ + bande dorée sur le flacon)
export const PERFUME_CLASSICS = [
    {
        id: 'provence',
        name: 'Eau de Provence',
        head: ['lemon'],
        heart: ['lavender'],
        base: ['resin'],
        hint: 'Un agrume jaune, une fleur mauve des champs et une résine de forêt',
        text: 'Le grand classique méridional : citron, lavande et résine.',
    },
    {
        id: 'alizes',
        name: 'Alizés des Îles',
        head: ['lime'],
        heart: ['tiare'],
        base: ['vanilla'],
        hint: 'Trois trésors tropicaux de l’île : agrume vert, fleur blanche et gousse douce',
        text: 'Un souffle des îles : citron vert, fleur de tiaré et vanille.',
    },
    {
        id: 'oasis',
        name: 'Nuit de l’Oasis',
        head: ['orange'],
        heart: ['saffron', 'hibiscus'],
        base: ['hardwood'],
        hint: 'Agrume doux, fleur rouge ou épice d’or, sur un bois précieux',
        text: 'Un accord oriental envoûtant : orange, safran ou hibiscus et bois dur.',
    },
    {
        id: 'boreale',
        name: 'Brume Boréale',
        head: ['spruce', 'juniper'],
        heart: ['cloudberry'],
        base: ['resin', 'wood', 'cembro'],
        hint: 'Un conifère du Grand Nord, sa baie dorée et un fond boisé',
        text: 'L’air pur du Grand Nord : épicéa ou genièvre, chicoutai et bois.',
    },
    {
        id: 'velours',
        name: 'Velours Noir',
        head: ['mandarin'],
        heart: ['orchid'],
        base: ['cacao', 'coffee'],
        hint: 'Agrume hivernal, fleur rare et note sombre torréfiée',
        text: 'Un sillage de soirée : mandarine, orchidée et cacao ou café.',
    },
    {
        id: 'abeille',
        name: 'Or d’Abeille',
        head: ['peach'],
        heart: ['fig', 'lavender'],
        base: ['honey'],
        hint: 'Fruit velouté du verger, cœur de figue ou lavande, posé sur le miel',
        text: 'Douceur dorée de la ferme : pêche, figue ou lavande et miel.',
    },
    {
        id: 'cologne',
        name: 'Cologne Royale',
        head: ['bitterOrange', 'citron'],
        heart: ['orangeBlossomWater'],
        base: ['solidOak', 'fruitWood'],
        hint: 'Bigarade ou cédrat, une eau de fleur blanche et un bois noble',
        text: 'La grande eau d’apparat : bigarade ou cédrat, fleur d’oranger et bois noble.',
    },
    {
        id: 'chypre',
        name: 'Chypre Impérial',
        head: ['citron', 'grapefruit'],
        heart: ['blackcurrant', 'tea'],
        base: ['patchouli'],
        hint: 'Un agrume vif, une note de cassis ou de thé, posée sur le patchouli',
        text: 'L’accord chypré mythique : cédrat ou pamplemousse, cassis ou thé et patchouli.',
    },
    {
        id: 'etang',
        name: 'Rosée de la Mare',
        head: ['lemongrass', 'mint'],
        heart: ['waterLily', 'chamomile'],
        base: ['honey', 'wood'],
        hint: 'Citronnelle ou menthe fraîche, fleur de nénuphar ou camomille, posée sur le miel ou le bois',
        text: 'La fraîcheur sereine de la mare aux capybaras : citronnelle ou menthe, nénuphar ou camomille et miel ou bois.',
    },
    {
        id: 'epices',
        name: 'Route des Épices',
        head: ['thyme', 'orange'],
        heart: ['ginger', 'cardamom'],
        base: ['cinnamon', 'nutmeg'],
        hint: 'Un souffle de thym ou d’orange, un cœur de gingembre ou cardamome et un fond de cannelle ou muscade',
        text: 'Le grand accord épicé des îles : thym ou orange, gingembre ou cardamome, cannelle ou noix de muscade.',
    },
];

// 5 silhouettes de flacons SVG
export const BOTTLES = {
    apothicaire: { id: 'apothicaire', name: 'Apothicaire' },
    goutte: { id: 'goutte', name: 'Goutte' },
    cristal: { id: 'cristal', name: 'Cristal' },
    amphore: { id: 'amphore', name: 'Amphore' },
    givre: { id: 'givre', name: 'Givré' },
};
export const BOTTLE_IDS = Object.keys(BOTTLES);

// 4 styles de bouchon
export const CAPS = {
    liege: { id: 'liege', name: 'Liège', fill: '#c9975b' },
    bois: { id: 'bois', name: 'Bois', fill: '#7a4b2a' },
    verre: { id: 'verre', name: 'Verre', fill: '#d6eef8' },
    or: { id: 'or', name: 'Or', fill: '#f2c14e' },
};
export const CAP_IDS = Object.keys(CAPS);

// Salon de commandes « Portrait olfactif »
export const PERFUME_ORDERS = {
    every: 2400, // une nouvelle commande toutes les 40 min
    max: 3,
    payMult: 1.75,
    villagers: ['rose', 'lucie', 'margaux', 'agathe', 'yasmine', 'ingrid', 'maeva', 'ines', 'morgane', 'octave', 'lea', 'odile'],
};

// Récompenses de l'Orgue du Parfumeur (tous les 6 essences/classiques découverts)
export const PERFUME_ORGAN = {
    step: 6,
    coins: 12000,
    xp: 250,
};
