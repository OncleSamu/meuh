// 1.20 : l'Amélioration du domaine. Cinq branches, cinq paliers chacune : un puits d'argent pour toute la partie.
// Bonus de capacité et de confort seulement (aucune vitesse, aucun rendement, aucun prix).
export const DOMAINE_LVL = 25;
export const DOMAINE_COINS = [100000, 300000, 900000, 2700000, 8100000]; // coût en pièces du palier 1 à 5
export const DOMAINE_MATS = [
    [4, 2],
    [8, 4],
    [15, 8],
    [25, 14],
    [40, 24],
]; // matériaux (deux par branche) du palier 1 à 5

// chaque palier ajoute son effet aux précédents ; les systèmes le lisent dans home.js (domStepSum)
export const DOMAINE = {
    barn: {
        name: 'Grange agrandie',
        icon: ['ui', 'barn'],
        mats: ['beam', 'plank'],
        desc: 'Plus de place pour tout ranger',
        steps: [
            ['+100 places dans la grange', 100],
            ['+100 places dans la grange', 100],
            ['+150 places dans la grange', 150],
            ['+200 places dans la grange', 200],
            ['+300 places dans la grange', 300],
        ],
    },
    kitchen: {
        name: 'Cuisines et ateliers',
        icon: ['ui', 'house'],
        mats: ['tools', 'nail'],
        desc: 'Des files plus longues pour chaque machine',
        steps: [
            ['+1 place dans la file de chaque machine', 1],
            ['+1 place dans la file de chaque machine', 1],
            ['+1 place dans la file de chaque machine', 1],
            ['+1 place dans la file de chaque machine', 1],
            ['+1 place dans la file de chaque machine', 1],
        ],
    },
    field: {
        name: 'Aide au champ',
        icon: ['ui', 'hand'],
        mats: ['paint', 'beam'],
        desc: 'Théo, le commis, s’occupe de plus de parcelles',
        steps: [
            ['Théo soigne 2 parcelles de plus', 2],
            ['Théo soigne 2 parcelles de plus', 2],
            ['Théo soigne 3 parcelles de plus', 3],
            ['Théo soigne 3 parcelles de plus', 3],
            ['Théo soigne 4 parcelles de plus', 4],
        ],
    },
    trade: {
        name: 'Commerce',
        icon: ['ui', 'stall'],
        mats: ['tools', 'paint'],
        desc: 'Plus de commandes au tableau, plus de places à l’étal',
        steps: [
            ['+1 commande au tableau', { orders: 1 }],
            ['+1 place à l’étal', { stall: 1 }],
            ['+1 commande au tableau', { orders: 1 }],
            ['+1 place à l’étal', { stall: 1 }],
            ['+1 commande et +1 place à l’étal', { orders: 1, stall: 1 }],
        ],
    },
    guests: {
        name: 'Réception',
        icon: ['ui', 'flag'],
        mats: ['beam', 'tools'],
        desc: 'Les visiteurs restent plus longtemps',
        steps: [
            ['Les visiteurs restent 20 % plus longtemps', 0.2],
            ['Les visiteurs restent 40 % plus longtemps', 0.2],
            ['Les visiteurs restent 60 % plus longtemps', 0.2],
            ['Les visiteurs restent 80 % plus longtemps', 0.2],
            ['Les visiteurs restent deux fois plus longtemps', 0.2],
        ],
    },
};
export const DOMAINE_IDS = Object.keys(DOMAINE);
