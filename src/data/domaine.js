// 1.20 : l'Amélioration du domaine. Neuf branches : un puits d'argent pour toute la partie.
// 1.107 : huit paliers par branche (les paliers 6 à 8 coûtent des dizaines de millions), et les grands travaux (WORKS).
export const DOMAINE_LVL = 25;
export const DOMAINE_COINS = [100000, 300000, 900000, 2700000, 8100000, 20000000, 45000000, 100000000]; // coût en pièces du palier 1 à 8
export const DOMAINE_MATS = [
    [4, 2],
    [8, 4],
    [15, 8],
    [25, 14],
    [40, 24],
    [30, 18],
    [30, 18],
    [30, 18],
]; // matériaux (deux par branche) du palier 1 à 8

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
            ['+400 places dans la grange', 400],
            ['+500 places dans la grange', 500],
            ['+600 places dans la grange', 600],
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
            ['Théo soigne 4 parcelles de plus', 4],
            ['Théo soigne 5 parcelles de plus', 5],
            ['Théo soigne 6 parcelles de plus', 6],
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
            ['+1 commande au tableau', { orders: 1 }],
            ['+1 place à l’étal', { stall: 1 }],
            ['+1 commande et +1 place à l’étal', { orders: 1, stall: 1 }],
        ],
    },
    annex: {
        name: 'Annexes des métiers',
        icon: ['ui', 'crate'],
        mats: ['plank', 'paint'],
        desc: 'De la place pour la brasserie, le comptoir, la cave, l’étang et la sélection',
        steps: [
            ['+1 cuve à la brasserie', { vat: 1 }],
            ['+1 siège au comptoir', { seat: 1 }],
            ['+1 étagère à la cave (+2 places)', { shelf: 2 }],
            ['+1 nasse à l’étang', { trap: 1 }],
            ['+1 place à l’étable de sélection', { breed: 1 }],
            ['+1 cuve à la brasserie', { vat: 1 }],
            ['+1 étagère à la cave (+2 places)', { shelf: 2 }],
            ['+1 nasse à l’étang', { trap: 1 }],
        ],
    },
    armand: {
        name: 'Suite d’Armand',
        icon: ['villager', 'armand'],
        mats: ['tools', 'paint'],
        desc: 'Armand vous demande plusieurs produits à la fois',
        steps: [
            ['Un 2e produit phare pour Armand', { slot: 1 }],
            ['Sa commande en cours se poursuit à la visite suivante', { keep: 1 }],
            ['Un 3e produit phare', { slot: 1 }],
            ['Armand paie 10 % de plus', { pay: 0.1 }],
            ['Un 4e produit phare', { slot: 1 }],
            ['Armand paie 5 % de plus', { pay: 0.05 }],
            ['Armand paie 5 % de plus', { pay: 0.05 }],
            ['Armand paie 10 % de plus', { pay: 0.1 }],
        ],
    },
    cargo: {
        name: 'Piste du cargo',
        icon: ['ui', 'plane'],
        mats: ['beam', 'nail'],
        desc: 'L’avion-cargo emporte plus de soutes',
        steps: [
            ['+1 soute à l’avion-cargo', { hold: 1 }],
            ['+1 soute à l’avion-cargo', { hold: 1 }],
            ['Avion plein : +20 % de bonus', { bonus: 0.2 }],
            ['+1 soute à l’avion-cargo', { hold: 1 }],
            ['+1 soute à l’avion-cargo', { hold: 1 }],
            ['Avion plein : +10 % de bonus', { bonus: 0.1 }],
            ['+1 soute à l’avion-cargo', { hold: 1 }],
            ['Avion plein : +10 % de bonus', { bonus: 0.1 }],
        ],
    },
    quay: {
        name: 'Quai agrandi',
        icon: ['ui', 'boat'],
        mats: ['plank', 'tools'],
        desc: 'Le bateau de livraison charge plus de lignes, plus souvent',
        steps: [
            ['+1 ligne au bateau de livraison', { line: 1 }],
            ['+1 ligne au bateau de livraison', { line: 1 }],
            ['+1 ligne au bateau de livraison', { line: 1 }],
            ['Le bateau revient 25 % plus vite', { fast: 0.25 }],
            ['+1 ligne au bateau de livraison', { line: 1 }],
            ['Le bateau revient encore 10 % plus vite', { fast: 0.1 }],
            ['+1 ligne au bateau de livraison', { line: 1 }],
            ['Le bateau revient encore 10 % plus vite', { fast: 0.1 }],
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
            ['Les visiteurs restent 120 % plus longtemps', 0.2],
            ['Les visiteurs restent 140 % plus longtemps', 0.2],
            ['Les visiteurs restent 160 % plus longtemps', 0.2],
        ],
    },
};
export const DOMAINE_IDS = Object.keys(DOMAINE);

// ---------------- 1.107 : les grands travaux ----------------
// Six bâtiments d'apparat, trois niveaux chacun, à des dizaines de millions de pièces : la vraie dépense de la fin de partie.
// Chacun a un effet utile ; fx : la valeur cumulée au niveau 1, 2 et 3 (lue par workFx dans systems/estate.js).
export const WORKS_LVL = 45;
export const WORKS_COINS = [15000000, 40000000, 100000000];
export const WORKS_MATS = [
    [20, 12],
    [30, 18],
    [40, 24],
];
export const WORKS = {
    table: {
        name: 'La table d’hôtes',
        mats: ['plank', 'paint'],
        desc: 'Servez un menu de trois plats : il fait monter le renom du domaine',
        fx: [1, 2, 3],
        steps: ['1 service par jour, 6 couverts', '2 services par jour, 10 couverts', '3 services par jour, 16 couverts'],
    },
    pigeon: {
        name: 'Le pigeonnier',
        mats: ['beam', 'nail'],
        desc: 'Les nouvelles du domaine vont plus loin : le renom monte plus haut',
        fx: [2, 4, 6],
        steps: ['Renom du domaine : 14 % au plus', 'Renom du domaine : 16 % au plus', 'Renom du domaine : 18 % au plus'],
    },
    clock: {
        name: 'La tour de l’horloge',
        mats: ['beam', 'tools'],
        desc: 'On n’oublie pas le domaine : le renom baisse moins vite',
        fx: [1, 2, 4],
        steps: ['Le renom baisse toutes les 5 heures', 'Le renom baisse toutes les 6 heures', 'Le renom baisse toutes les 8 heures'],
    },
    library: {
        name: 'La bibliothèque',
        mats: ['plank', 'tools'],
        desc: 'Plus d’expérience pour les commandes et les transports',
        fx: [0.05, 0.1, 0.15],
        steps: ['+5 % d’expérience des commandes et des transports', '+10 % d’expérience des commandes et des transports', '+15 % d’expérience des commandes et des transports'],
    },
    wheel: {
        name: 'La remise du charron',
        mats: ['tools', 'nail'],
        desc: 'Des wagons mieux entretenus : le train paie plus',
        fx: [0.1, 0.2, 0.3],
        steps: ['Le train paie 10 % de plus', 'Le train paie 20 % de plus', 'Le train paie 30 % de plus'],
    },
    post: {
        name: 'Le relais de poste',
        mats: ['paint', 'nail'],
        desc: 'Les commandes du village paient plus',
        fx: [0.05, 0.1, 0.15],
        steps: ['Les commandes du village paient 5 % de plus', 'Les commandes du village paient 10 % de plus', 'Les commandes du village paient 15 % de plus'],
    },
};
export const WORK_IDS = Object.keys(WORKS);
// la table d'hôtes : un menu de trois plats différents, servi en 2 heures
export const TABLE = { dur: 2 * 3600000, covers: [6, 10, 16], pay: 1.5, xp: 0.3, renom: 1, accord: 1 };
