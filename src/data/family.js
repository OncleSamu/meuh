// 1.123 : la famille. On fait la cour à un villageois, on se marie, le foyer s'agrandit (puis les enfants en 1.124).
export const FAMILY = {
    lvl: 30,
    hearts: 3, // cœurs d'amitié pour commencer à faire la cour
    rosePts: 20, // points d'une rose (5 roses = 100)
    roses: 5,
    dateWait: 3 * 3600 * 1000, // un rendez-vous toutes les trois heures
    gift: { love: 8, like: 3 }, // un cadeau au prétendant compte aussi pour le cœur
    // la demande et la noce
    ring: 'amethystRing',
    wedding: { spongeCake: 6, flowerPot: 4, cider: 6 },
    weddingCoins: 120000, // × (1 + niveau au-delà de 30 × 5 %)
    renom: 3,
    // le conjoint : sa tendresse baisse chaque jour de jeu réel, un mot doux la relève
    aff: { max: 100, decayDay: 12, word: 20, wordWait: 4 * 3600 * 1000, keep: 50 },
    basket: { every: 12 * 3600 * 1000, items: 3, base: 4, perLvl: 0.25 },
};

// les prétendants : les villageois adultes et libres
export const SUITORS = ['gaspard', 'odile', 'jules', 'ines', 'morgane', 'yann', 'bruno', 'lea', 'margaux', 'maeva', 'tiago', 'agathe', 'victor', 'agnes', 'idris', 'yasmine', 'tuomas', 'ingrid'];
// pour les accords de la langue : « il » ou « elle »
export const SHE = ['odile', 'ines', 'morgane', 'lea', 'margaux', 'maeva', 'agathe', 'agnes', 'yasmine', 'ingrid'];

// les rendez-vous, selon les roses déjà gagnées
export const DATES = [
    { id: 'walk', name: 'Une promenade', icon: ['ui', 'fmWalk'], pts: 8, roses: 0, text: 'Le long du ruisseau, à parler de tout et de rien.' },
    { id: 'picnic', name: 'Un pique-nique', icon: ['ui', 'fmPicnic'], pts: 14, roses: 0, likes: 3, text: 'Une nappe dans l’herbe et trois choses qu’il ou elle aime.' },
    { id: 'ball', name: 'Le bal du village', icon: ['ui', 'fmBall'], pts: 20, roses: 2, coins: 6000, text: 'Un orchestre sur la place, des lampions, une valse.' },
    { id: 'dinner', name: 'Un dîner aux chandelles', icon: ['ui', 'fmCandle'], pts: 28, roses: 3, love: true, text: 'Son plat préféré, deux bougies, la nuit qui tombe.' },
];
// ce qu'on se dit à chaque rose
export const ROSE_LINES = [
    'Vous vous voyez de plus en plus souvent.',
    'On commence à jaser au village…',
    'Vos mains se frôlent à chaque rendez-vous.',
    'Mamie Odette fait des clins d’œil appuyés.',
    'Il ne manque plus qu’une bague.',
];

// le foyer : des pièces qui s'ajoutent à la maison. Chacune a des niveaux, avec leur coût.
export const FOYER = [
    {
        id: 'bedroom',
        name: 'La chambre des époux',
        icon: ['ui', 'fmBed'],
        desc: 'Il faut une chambre pour deux avant de se marier.',
        lv: [{ cost: { coins: 150000, plank: 40, beam: 12, nail: 30 }, fx: 'La noce est possible' }],
    },
    {
        id: 'salon',
        name: 'Le grand salon',
        icon: ['ui', 'fmSofa'],
        desc: 'On y reçoit, on y rit : votre conjoint rapporte des paniers plus garnis.',
        lv: [
            { cost: { coins: 600000, plank: 60, beam: 20, stone: 40 }, fx: 'Panier +30 %', basket: 0.3 },
            { cost: { coins: 3000000, beam: 40, stone: 80, nail: 80 }, fx: 'Panier +60 %', basket: 0.6 },
            { cost: { coins: 12000000, beam: 80, stone: 160, nail: 160 }, fx: 'Panier +100 %', basket: 1 },
        ],
    },
    // 1.124 : les chambres des enfants et leurs pièces
    {
        id: 'nursery',
        name: 'La chambre de bébé',
        icon: ['ui', 'fmCradle'],
        desc: 'Un berceau, un mobile, une veilleuse : il la faut pour accueillir un premier enfant.',
        lv: [{ cost: { coins: 400000, plank: 50, beam: 14, wool: 30 }, fx: 'Un premier enfant', kids: 1 }],
    },
    {
        id: 'kidsroom',
        name: 'La chambre des enfants',
        icon: ['ui', 'fmBunk'],
        desc: 'Des lits superposés, et de la place pour des frères et sœurs.',
        lv: [
            { cost: { coins: 1500000, plank: 80, beam: 24, wool: 50 }, fx: 'Un deuxième enfant', kids: 1 },
            { cost: { coins: 5000000, plank: 140, beam: 40, wool: 90 }, fx: 'Un troisième enfant', kids: 1 },
        ],
    },
    {
        id: 'playroom',
        name: 'La salle de jeux',
        icon: ['ui', 'fmToys'],
        desc: 'Les enfants y sont heureux : leur bonheur baisse moins vite et ils grandissent plus vite.',
        lv: [
            { cost: { coins: 1000000, plank: 60, wool: 40 }, fx: 'Grandir +15 %, bonheur plus durable', grow: 0.15, joy: 0.2 },
            { cost: { coins: 5000000, plank: 120, wool: 80 }, fx: 'Grandir +30 %, bonheur plus durable', grow: 0.3, joy: 0.35 },
            { cost: { coins: 14000000, plank: 200, wool: 140 }, fx: 'Grandir +50 %, bonheur bien plus durable', grow: 0.5, joy: 0.5 },
        ],
    },
    {
        id: 'study',
        name: 'Le bureau des grands',
        icon: ['ui', 'fmDesk'],
        desc: 'Un vrai bureau pour les ados et les grands : leur coup de main compte davantage.',
        lv: [
            { cost: { coins: 3000000, plank: 80, beam: 30, nail: 60 }, fx: 'Coups de main +2 %', help: 0.02 },
            { cost: { coins: 9000000, plank: 140, beam: 50, nail: 100 }, fx: 'Coups de main +4 %', help: 0.04 },
            { cost: { coins: 22000000, plank: 220, beam: 80, nail: 160 }, fx: 'Coups de main +6 %', help: 0.06 },
        ],
    },
];

// ---------------- 1.124 : les enfants ----------------
export const KIDS = {
    max: 3,
    expect: 6 * 3600 * 1000, // l'heureux événement : six heures d'attente
    renom: 1,
    // les âges, en heures de croissance : bébé, enfant, ado, puis adulte
    ages: [48, 144, 240],
    ageNames: ['Bébé', 'Enfant', 'Ado', 'Adulte'],
    // le bonheur : il baisse chaque jour ; au-dessous de la moitié, on grandit deux fois moins vite et on aide moins
    joy: { max: 100, decayDay: 30, care: 25, keep: 50 },
    careWait: 4 * 3600 * 1000, // un même soin toutes les quatre heures
    careGrow: 3, // heures de croissance gagnées par soin
    // l'enfant ramasse de petites choses toutes les six heures
    find: { every: 6 * 3600 * 1000, base: 3, perLvl: 0.08, pool: ['egg', 'apple', 'strawberry', 'carrot', 'cherry', 'honey', 'milk', 'peach', 'pear', 'potato', 'wool'] },
    // l'ado et l'adulte donnent un coup de main : +4 % (×1,5 pour un adulte), plus le bureau
    help: 0.04,
    adultHelp: 1.5,
};
// les soins, selon l'âge (0 bébé, 1 enfant, 2 ado, 3 adulte)
export const CARES = [
    [
        { id: 'bottle', name: 'Le biberon', icon: ['item', 'milk'], need: { milk: 2 } },
        { id: 'cuddle', name: 'Un câlin', icon: ['ui', 'heart'] },
    ],
    [
        { id: 'play', name: 'Jouer ensemble', icon: ['ui', 'fmToys'] },
        { id: 'snack', name: 'Le goûter', icon: ['item', 'crepes'], snack: true },
    ],
    [
        { id: 'talk', name: 'Discuter', icon: ['ui', 'fmTalk'] },
        { id: 'pocket', name: 'L’argent de poche', icon: ['ui', 'coin'], coins: 2000 },
    ],
    [{ id: 'visit', name: 'Un repas ensemble', icon: ['ui', 'cake'] }],
];
// les goûters possibles (le premier qu'on a en stock)
export const SNACKS = ['crepes', 'pie', 'spongeCake', 'strawberryCake', 'chocCake', 'peachTart', 'apricotTart', 'cookies', 'waffles'];
// les coups de main des ados et des adultes
export const TASKS = [
    { id: 'field', name: 'Au potager', icon: ['item', 'carrot'], text: 'les cultures poussent plus vite' },
    { id: 'animals', name: 'Avec les bêtes', icon: ['animal', 'cow'], text: 'les bêtes produisent plus vite' },
    { id: 'workshop', name: 'À l’atelier', icon: ['ui', 'gear'], text: 'les machines vont plus vite' },
    { id: 'market', name: 'Au marché', icon: ['ui', 'stall'], text: 'tout se vend plus cher au grossiste' },
];
export const KID_NAMES = {
    girl: ['Louise', 'Jeanne', 'Alice', 'Chloé', 'Lina', 'Mila', 'Zoé', 'Camille', 'Anna', 'Margot', 'Léonie', 'Adèle', 'Romane', 'Juliette', 'Clémence', 'Suzanne'],
    boy: ['Gabriel', 'Louis', 'Arthur', 'Hugo', 'Léo', 'Raphaël', 'Nathan', 'Adam', 'Tom', 'Sacha', 'Noé', 'Martin', 'Émile', 'Victor', 'Félix', 'Basile'],
};
// le teint, les cheveux et les yeux des prétendants (indices de la fabrique d'habitants), pour les visages des enfants
export const SPOUSE_LOOK = {
    gaspard: [1, 4, 0],
    odile: [1, 1, 1],
    jules: [1, 1, 0],
    ines: [2, 0, 0],
    morgane: [1, 3, 3],
    yann: [1, 4, 3],
    bruno: [1, 2, 1],
    lea: [1, 2, 2],
    margaux: [1, 2, 1],
    maeva: [2, 0, 0],
    tiago: [2, 0, 0],
    agathe: [1, 2, 4],
    victor: [1, 5, 3],
    agnes: [1, 3, 2],
    idris: [3, 0, 0],
    yasmine: [3, 0, 1],
    tuomas: [0, 5, 3],
    ingrid: [0, 5, 3],
};

// ---------------- 1.125 : ils grandissent ----------------
// un enfant adulte choisit son métier : les produits de ce métier se vendent un peu plus cher
export const KID_METIER = { price: 0.08 };
// il ou elle peut épouser un résident du camping (3 cœurs d'amitié avec vous), et le couple s'installe au village
export const KID_WED = {
    hearts: 3,
    items: { spongeCake: 4, flowerPot: 3, cider: 4 },
    house: n => 1500000 * n, // la maison au village du n-ième couple
    mats: { plank: 60, stone: 40, beam: 16 },
};
// leurs enfants, vos petits-enfants : deux par couple, un tous les deux jours
export const GRANDKIDS = { max: 2, every: 2 * 24 * 3600 * 1000 };

// ---------------- 1.127 : la vie de famille ----------------
// les anniversaires : tous les deux jours depuis la naissance, jusqu'à l'âge adulte ; on a une journée pour le fêter
export const BDAY = {
    every: 2 * 24 * 3600 * 1000,
    window: 24 * 3600 * 1000,
    cakes: ['spongeCake', 'strawberryCake', 'chocCake', 'walnutCake', 'mandarinCake', 'pineappleCake', 'easterCake'],
    joy: 40,
    grow: 6, // heures de croissance offertes
    favGrow: 6, // et autant si on offre aussi son cadeau préféré
    miss: 20, // le bonheur perdu si on l'oublie
};
// le cadeau préféré, selon l'âge ; il change une fois offert
export const FAVS = [
    ['wool', 'honey', 'juice', 'strawberry'],
    ['cookies', 'crepes', 'waffles', 'jam', 'lemonade', 'woolHat', 'strawHat'],
    ['scarf', 'sweater', 'colorSweater', 'perfume', 'lavenderSoap', 'pizza', 'chocCake'],
    ['paintedVase', 'flowerPot', 'cheese', 'cider', 'fondue', 'candle'],
];
export const GIFT = { wait: 8 * 3600 * 1000, joy: 35, aff: 10 };
// le repas de famille : tout le monde à table, un plat pour deux convives
export const MEAL = {
    wait: 20 * 3600 * 1000,
    dishes: ['soup', 'omelette', 'quiche', 'gratin', 'salad', 'pizza', 'fondue', 'paella', 'couscous', 'potee', 'potAuFeu', 'butterPotatoes', 'pie', 'bread'],
    joy: 30,
    aff: 30,
    xp: 12, // par convive, plus le niveau
};

// ---------------- 1.128 : les petites demandes ----------------
// de temps en temps, un enfant (à partir de l'âge « enfant ») demande quelques produits ; il rend le service en bonheur et en pièces
export const ASKS = {
    every: 10 * 3600 * 1000, // une demande toutes les dix heures au plus
    last: 8 * 3600 * 1000, // elle attend huit heures
    joy: 20,
    miss: 5,
    coins: 3, // × le prix de vente des produits demandés
    pools: [
        null,
        ['strawberry', 'apple', 'carrot', 'egg', 'honey', 'milk', 'cherry', 'pumpkin'],
        ['wool', 'jam', 'bread', 'juice', 'cheese', 'cookies', 'crepes', 'flowerPot'],
        ['plank', 'cheese', 'cider', 'jam', 'bread', 'honeyPot', 'candle', 'paintedVase'],
    ],
    why: [
        null,
        ['une surprise', 'nourrir ses poupées', 'la kermesse de l’école', 'un goûter avec les copains'],
        ['un projet d’école', 'la fête de fin d’année', 'un pique-nique avec les copains', 'le marché de l’école'],
        ['son travail', 'recevoir des amis', 'aider un voisin', 'la fête du village'],
    ],
    qty: [0, 3, 2, 2], // de base, plus un par tranche de 15 niveaux
};
// les anniversaires des petits-enfants : une carte et un gâteau, pour le plaisir (pas de tristesse s'il est oublié)
export const GK_BDAY = { xp: 15 };
