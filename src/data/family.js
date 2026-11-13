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
export const SUITORS = ['gaspard', 'odile', 'jules', 'ines', 'morgane', 'yann', 'bruno', 'lea', 'margaux', 'maeva', 'tiago', 'agathe', 'victor', 'agnes', 'octave', 'idris', 'yasmine', 'tuomas', 'ingrid'];
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
];
