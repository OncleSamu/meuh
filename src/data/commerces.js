// 1.98 : les commerces du village. Huit métiers à reprendre ; chacun a un artisan (visage tiré au hasard, voir art/habitants.js)
// qui passe une commande permanente de son métier, mieux payée à mesure qu'il vous fait confiance.
export const COMMERCE_LVL = 30;
export const COMMERCE = {
    pay: 1.5, // la commande est payée 1,5 fois la valeur du produit
    payFid: 0.1, // + 0,1 par niveau de confiance
    qty: 4, // quantité de base
    qtyFid: 2, // + 2 par niveau de confiance
    wait: 4 * 3600000, // la commande suivante arrive 4 h après la livraison
    fid: [3, 10, 25, 50, 100], // commandes servies pour chaque niveau de confiance (1 à 5)
    xp: 120, // expérience par livraison
};

export const COMMERCES = {
    boulanger: {
        name: 'La boulangerie',
        job: 'boulanger',
        icon: ['machine', 'bakery'],
        lvl: 30,
        cost: 300000,
        mats: { plank: 30, stone: 30 },
        machines: ['bakery', 'crepery', 'islandBakery'],
        hello: 'Le four est chaud, il me faut de quoi remplir la vitrine !',
    },
    forgeron: {
        name: 'La forge',
        job: 'forgeron',
        icon: ['machine', 'forge'],
        lvl: 36,
        cost: 500000,
        mats: { stone: 60, ironIngot: 10 },
        machines: ['forge', 'saddlery'],
        hello: 'Du métal, du feu, et un peu de patience : voilà ce qu’il me faut.',
    },
    tisserand: {
        name: 'L’atelier de tissage',
        job: 'tisserand',
        icon: ['machine', 'loom'],
        lvl: 40,
        cost: 800000,
        mats: { plank: 40, beam: 10 },
        machines: ['loom', 'tailor', 'dyeworks'],
        hello: 'Les métiers tournent toute la semaine, je manque toujours de fil.',
    },
    potier: {
        name: 'La poterie',
        job: 'potier',
        icon: ['machine', 'pottery'],
        lvl: 44,
        cost: 1200000,
        mats: { stone: 80, beam: 10 },
        machines: ['pottery', 'jewelry'],
        hello: 'Un bel objet, ça se tourne à la main. Et ça se livre à temps.',
    },
    fromager: {
        name: 'La fromagerie',
        job: 'fromager',
        icon: ['machine', 'dairy'],
        lvl: 48,
        cost: 2000000,
        mats: { plank: 60, stone: 60 },
        machines: ['dairy', 'alpineDairy'],
        hello: 'Mes clients veulent du fromage fait ici, avec vos laits et votre soin.',
    },
    confiseur: {
        name: 'La confiserie',
        job: 'confiseur',
        icon: ['machine', 'confectionery'],
        lvl: 52,
        cost: 3000000,
        mats: { plank: 60, beam: 20 },
        machines: ['confectionery', 'chocolatier', 'sugarmill'],
        hello: 'Les enfants font la queue jusqu’au coin de la rue, vous imaginez ?',
    },
    charcutier: {
        name: 'La charcuterie',
        job: 'charcutier',
        icon: ['machine', 'smokehouse'],
        lvl: 56,
        cost: 5000000,
        mats: { stone: 100, beam: 20 },
        machines: ['smokehouse', 'deli', 'saloir'],
        hello: 'Le saloir est vide : à vous de le remplir, je ferai le reste.',
    },
    poissonnier: {
        name: 'La poissonnerie',
        job: 'poissonnier',
        icon: ['machine', 'fishmonger'],
        lvl: 60,
        cost: 8000000,
        mats: { plank: 80, stone: 80 },
        machines: ['fishmonger', 'cannery'],
        hello: 'Le port est à deux pas, mais le meilleur poisson, c’est le vôtre.',
    },
};

export const FIRST_NAMES = [
    'Aurélien',
    'Béatrice',
    'Cyprien',
    'Dominique',
    'Éloïse',
    'Fabrice',
    'Gisèle',
    'Hector',
    'Irène',
    'Jérôme',
    'Karine',
    'Lazare',
    'Mireille',
    'Noël',
    'Olivia',
    'Pascal',
    'Quitterie',
    'Raymond',
    'Solange',
    'Théo',
    'Ursule',
    'Valentin',
    'Wilfrid',
    'Yolande',
    'Zacharie',
    'Amandine',
    'Basile',
    'Clémence',
    'Denis',
    'Élodie',
];
