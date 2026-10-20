// La génétique (bêta 4) : saveurs et caractères de chaque espèce, réglages du labo, de l'étable de sélection et du Salon.

// ---------------- les caractères ----------------
// Chaque caractère va de 0 à 5. Les plantes ont des saveurs et des qualités de culture,
// les animaux des qualités de produit et d'élevage. Les icônes remplacent tout tableau.
export const PLANT_TRAITS = [
    { id: 'sweet', name: 'Sucré', icon: ['item', 'sugar'], flavor: true },
    { id: 'sour', name: 'Acide', icon: ['item', 'lime'], flavor: true },
    { id: 'bitter', name: 'Amer', icon: ['item', 'greenCoffee'], flavor: true },
    { id: 'spicy', name: 'Épicé', icon: ['item', 'pepper'], flavor: true },
    { id: 'umami', name: 'Umami', icon: ['item', 'mushroom'], flavor: true },
    { id: 'speed', name: 'Pousse rapide', icon: ['ui', 'clock'] },
    { id: 'drought', name: 'Résiste à la soif', icon: ['ui', 'drop'] },
    { id: 'hardy', name: 'Rusticité', icon: ['ui', 'w_snow'] },
    { id: 'yield', name: 'Rendement', icon: ['ui', 'basket'] },
    // 1.22 : caractères discrets, à 0 chez les espèces sauvages (sauf quelques-unes), qui se cultivent par croisement
    { id: 'regrow', name: 'Repousse', icon: ['ui', 'loop'], extra: true, hint: 'la plante repousse après la récolte' },
    { id: 'late', name: 'Maturation lente', icon: ['ui', 'star'], extra: true, hint: 'plus longue à pousser, plus souvent en argent ou en or' },
    { id: 'pest', name: 'Anti-nuisibles', icon: ['ui', 'pest'], extra: true, hint: 'moins de pucerons et de corbeaux' },
    { id: 'seedy', name: 'Graine généreuse', icon: ['ui', 'packet'], extra: true, hint: 'plus de graines à la récolte' },
    { id: 'luck', name: 'Chance', icon: ['ui', 'wishStar'], extra: true, hint: 'plus de récoltes dorées' },
    { id: 'soilfit', name: 'Terre d’accueil', icon: ['ui', 'soilWet'], extra: true, hint: 'profite du bonus de bon sol sur n’importe quel sol' },
    { id: 'calibre', name: 'Calibre', icon: ['ui', 'yield'], extra: true, hint: 'parfois une unité de plus, mais un peu moins de qualité' },
];
export const ANIMAL_TRAITS = [
    { id: 'rich', name: 'Richesse', icon: ['item', 'cream'], flavor: true },
    { id: 'soft', name: 'Douceur', icon: ['ui', 'heart'], flavor: true },
    { id: 'aroma', name: 'Arôme', icon: ['item', 'lavender'], flavor: true },
    { id: 'yield', name: 'Rendement', icon: ['ui', 'basket'] },
    { id: 'speed', name: 'Vitesse', icon: ['ui', 'clock'] },
    { id: 'appetite', name: 'Petit appétit', icon: ['item', 'feed'] },
    { id: 'robust', name: 'Robustesse', icon: ['ui', 'thermo'] },
    { id: 'fertile', name: 'Fécondité', icon: ['ui', 'remTwin'], extra: true, hint: 'plus de jumeaux à l’étable de sélection' },
    { id: 'health', name: 'Santé', icon: ['ui', 'sick'], extra: true, hint: 'tombe moins souvent malade' },
    { id: 'docile', name: 'Docilité', icon: ['ui', 'hand'], extra: true, hint: 'l’amitié rend la bête encore plus productive' },
    { id: 'social', name: 'Sociabilité', icon: ['ui', 'chick'], extra: true, hint: 'produit plus vite entourée de sa propre espèce' },
    { id: 'curious', name: 'Curiosité', icon: ['ui', 'sparkle'], extra: true, hint: 'trouve parfois un petit trésor à la collecte' },
];
// les gènes d'apparence : jamais choisis, ils découlent des croisements
export const LOOKS = {
    size: ['Petite', 'Normale', 'Grosse', 'Géante', 'Fine', 'Naine', 'Gros fruit'],
    color: ['Naturelle', 'Rouge', 'Dorée', 'Violette', 'Blanche', 'Sombre', 'Bleutée', 'Rose', 'Orange vif', 'Argentée', 'Cuivrée', 'Dégradée'],
    pattern: ['Unie', 'Taches', 'Pois', 'Rayures', 'Reflets', 'Damier', 'Zébrures', 'Mouchetée fin', 'Marbrée'],
    finish: ['Aucune', 'Givrée', 'Moussue', 'Étincelles', 'Vernie', 'Fleurie'],
};
// 1.22 : la rareté des apparences à la mutation (poids ; les absentes valent 3). Les finitions sont rares et uniques.
export const LOOK_WEIGHT = {
    size: { 0: 3, 1: 3, 2: 3, 3: 2, 4: 3, 5: 1, 6: 0.5 },
    color: { 7: 2, 8: 2, 9: 1, 10: 1, 11: 1 },
    pattern: { 5: 2, 6: 2, 7: 2, 8: 1 },
};
export const FINISH_CHANCE = 0.25; // part des mutations d'apparence qui donnent une finition
// finition favorisée par la saison (×3) : l'hiver givrée, le printemps fleurie, l'été étincelles, l'automne moussue
export const FINISH_SEASON = { hiver: 1, printemps: 5, ete: 3, automne: 2 };

// les traits des animaux (1.2) : cornes, oreilles, toison ; seulement pour les espèces où ils se voient.
// L'indice 0 est l'allure naturelle de l'espèce. Comme les autres apparences, jamais choisis.
export const FEATURES = {
    horns: { name: 'Cornes', list: ['Naturelles', 'Sans cornes', 'Longues', 'En lyre'], species: ['cow', 'goat', 'buffalo', 'sheep'] },
    ears: { name: 'Oreilles', list: ['Naturelles', 'Tombantes'], species: ['rabbit', 'pig', 'goat'] },
    coat: { name: 'Toison', list: ['Naturelle', 'Longue', 'Frisée'], species: ['sheep', 'alpaca', 'horse', 'donkey', 'ewe'] },
};
export const featuresOf = type => Object.keys(FEATURES).filter(k => FEATURES[k].species.includes(type));

// ---------------- saveurs de base des plantes ----------------
// sucré, acide, amer, épicé, umami (0 à 5)
const F = {
    wheat: '10101',
    carrot: '30000',
    tomato: '23003',
    corn: '30001',
    potato: '10001',
    strawberry: '42000',
    pumpkin: '30002',
    radish: '01130',
    lettuce: '01100',
    onion: '21023',
    peas: '30001',
    pepper: '11050',
    eggplant: '01202',
    cabbage: '11201',
    watermelon: '41000',
    apple: '33000',
    orange: '34000',
    cherry: '43000',
    peach: '42000',
    kiwi: '34000',
    kaki: '41100',
    beet: '50001',
    cotton: '00000',
    lavender: '10210',
    pineapple: '43000',
    saffron: '10223',
    sunflower: '10102',
    garlic: '01043',
    zucchini: '10001',
    rice: '10002',
    soy: '10204',
    tea: '00402',
    sugarcane: '50000',
    blueberry: '33100',
    grape: '42000',
    olive: '01313',
    hop: '00500',
    cacao: '10500',
    mint: '10210',
    peppercorn: '00150',
    orchid: '20100',
    genepi: '11320',
    flax: '00100',
    mushroom: '00105',
    vanilla: '40100',
    passionFruit: '35000',
    sweetPotato: '40001',
    cassava: '10101',
    ginger: '11050',
    tiare: '20100',
    banana: '41000',
    coconut: '30101',
    mango: '41000',
    papaya: '31000',
    lime: '15100',
    avocado: '00103',
    guava: '33000',
    greenCoffee: '01500',
    lychee: '42000',
    greenBean: '10002',
    leek: '10013',
    basil: '01131',
    lentil: '10003',
    mustard: '01150',
    melon: '50000',
    asparagus: '10113',
    artichoke: '01301',
    pear: '42000',
    mirabelle: '42100',
    apricot: '34000',
    fig: '50001',
    walnut: '10302',
    chestnut: '30102',
    spinach: '00102',
    cucumber: '10000',
    rhubarb: '05100',
    raspberry: '43000',
    buckwheat: '10202',
    espelette: '10050',
    lemon: '05100',
    hazelnut: '20102',
    quince: '23100',
    almond: '30101',
    barley: '20101',
};
export const FLAVORS = Object.fromEntries(Object.entries(F).map(([id, s]) => [id, [...s].map(Number)]));
// qualités de culture de base (pousse, soif, rusticité, rendement) : 2 partout
export const PLANT_BASE = { speed: 2, drought: 2, hardy: 2, yield: 2 };
// 1.22 : caractères discrets (0 par défaut) ; quelques espèces ont déjà de la repousse
export const EXTRA_DEFAULT = {
    luck: 0,
    soilfit: 0,
    docile: 0,
    social: 0,
    regrow: 0,
    late: 0,
    pest: 0,
    seedy: 0,
    calibre: 0,
    fertile: 0,
    health: 0,
    curious: 0,
};
export const EXTRA_SPECIES = {
    regrow: { tomato: 3, pepper: 3, eggplant: 2, strawberry: 2, raspberry: 3, blueberry: 2, zucchini: 2, cucumber: 2, espelette: 3, greenBean: 2, peas: 2 },
};
export const extraBase = (k, id) => (EXTRA_SPECIES[k] && EXTRA_SPECIES[k][id]) || EXTRA_DEFAULT[k] || 0;
// effets par point
export const EXTRA_FX = {
    regrow: 0.08, // chance de rester en place et de repousser
    lateTime: 0.06, // temps de pousse en plus
    lateQ: 0.04, // chance d'argent/or en plus
    pest: 0.12, // nuisibles en moins
    seedy: 0.06, // chance de graine en plus
    calibre: 0.08, // chance d'une unité de plus
    calibreQ: 0.04, // chance de qualité en moins
    fertile: 0.05,
    health: 0.12,
    curious: 0.03,
    luck: 0.01, // chance de récolte dorée en plus, par point
    soilfit: 0.15, // part du bonus de bon sol, par point
    docile: 0.005, // vitesse en plus par point et par cœur (en plus des 4 % du cœur)
    social: 0.02, // vitesse en plus par point et par bête voisine de la même espèce
    socialCap: 0.1, // plafond du bonus de sociabilité d’une bête
};

// ---------------- caractères de base des animaux ----------------
// richesse, douceur, arôme, rendement, vitesse, appétit, robustesse
const A = {
    chicken: '2222232',
    duck: '2322222',
    sheep: '2422223',
    rabbit: '2522222',
    cow: '3232222',
    goat: '3133223',
    pig: '2242213',
    goose: '3222222',
    bees: '2342322',
    horse: '2322223',
    peacock: '2432222',
    alpaca: '2522213',
    buffalo: '4132213',
    donkey: '3422223',
    turkey: '2222222',
    ewe: '3422223',
    quail: '2222232',
};
export const ANIMAL_BASE = Object.fromEntries(Object.entries(A).map(([id, s]) => [id, [...s].map(Number)]));

// ---------------- le labo ----------------
export const GENETICS = {
    lvl: 40,
    // chantiers qui ouvrent chaque partie
    plantProject: 'pollination', // croisements de plantes
    animalProject: 'breeding', // étable de sélection
    labProject: 'lab', // analyses et fixation
    seedbankProject: 'seedbank', // « Mes créations » : racheter graines et petits
    salonProject: 'salonHall', // le Salon de l'agriculture
    hiveProject: 'selectHive', // ruche de sélection : plus de mutations
    crossTime: 600, // secondes de pollinisation
    breedTime: 900, // secondes avant la naissance
    crossCost: lvl => 500 + lvl * 60,
    breedCost: lvl => 1500 + lvl * 120,
    analyzeCost: lvl => 300 + lvl * 30,
    seedsPerCross: 6,
    mutation: 0.05, // chance qu'un gène mute à chaque croisement
    mutationHive: 0.09,
    sterileSame: 0.05, // graines stériles (même espèce)
    sterileCross: 0.3, // graines stériles (deux espèces)
    maxVarieties: 30, // variétés en cours (non fixées)
    fixGen: 3, // génération minimale pour fixer
    seedDrop: 0.5, // chance qu'une récolte rende une graine de la variété
    // prix d'une graine de variété fixée et d'un petit de race fixée (× le prix de l'espèce)
    seedPriceMult: 3,
    babyPriceMult: 4,
    // revente d'une variété : × (1 + gain de saveur / 4), plafonné à ×3 (1.7)
    varietySellCap: 3,
    // une recette faite avec de meilleurs ingrédients : argent puis or (déjà ×1,25 et ×1,6)
    silverScore: 1.2,
    goldScore: 1.8, // des ingrédients tous en or suffisent ; les variétés savoureuses aident à y arriver
    // 1.7 : une portée de jeunes plants par croisement, on en garde un
    litter: 3,
    litterLab: 4, // avec le laboratoire
    crossSlotsHive: 2, // deux pollinisations à la fois avec la ruche de sélection
    breedPens: 1, // enclos d'élevage : +1 avec le laboratoire, +1 avec le conservatoire
    twins: 0.15, // chance d'avoir des jumeaux
    chefHours: 8, // une commande du chef dure 8 heures
    // 1.7 : les gènes de culture comptent vraiment (par point au-dessus de 2)
    geneSpeed: 0.1,
    geneHardy: 0.15,
    geneDrought: 0.2,
    geneYield: 0.15,
    varietySellDiv: 4,
    // 1.7 : le Salon donne 1 ruban au premier prix, 2 la première fois qu'on gagne un critère
    salonRuban: 1,
    salonFirstRuban: 2,
};

// ---------------- le Salon de l'agriculture ----------------
// un critère par période ; les rivales visent un score qui grandit avec le niveau
export const SALON_CRITERIA = [
    { id: 'sweetFruit', name: 'Le fruit le plus sucré', kind: 'plant', trait: 'sweet', icon: ['item', 'strawberry'] },
    { id: 'spicy', name: 'Le légume le plus épicé', kind: 'plant', trait: 'spicy', icon: ['item', 'pepper'] },
    { id: 'sourFruit', name: 'Le fruit le plus acidulé', kind: 'plant', trait: 'sour', icon: ['item', 'lime'] },
    { id: 'umami', name: 'La saveur la plus profonde', kind: 'plant', trait: 'umami', icon: ['item', 'mushroom'] },
    { id: 'richMilk', name: 'Le lait le plus riche', kind: 'animal', trait: 'rich', icon: ['item', 'milk'] },
    { id: 'softWool', name: 'La toison la plus douce', kind: 'animal', trait: 'soft', icon: ['item', 'wool'] },
    { id: 'coat', name: 'La plus belle robe', kind: 'animal', trait: 'looks', icon: ['animal', 'cow'] },
    { id: 'giant', name: 'La plus belle géante', kind: 'plant', trait: 'looks', icon: ['item', 'pumpkin'] },
    { id: 'hornsBest', name: 'Les plus belles cornes', kind: 'animal', trait: 'horns', icon: ['animal', 'goat'] },
    { id: 'fleece', name: 'La plus belle toison', kind: 'animal', trait: 'coat', icon: ['animal', 'alpaca'] },
];
export const SALON_PERIOD = 2 * 24 * 3600 * 1000; // un Salon tous les deux jours
