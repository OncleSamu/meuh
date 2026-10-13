// La nature : forêt, mine, étang et poissons, pêche en mer.
// Valeurs reprises telles quelles de la version 6.2 (même équilibre).

export const NATURE = {
    forest: {
        lvl: 3,
        hp: 3,
        regrow: 90,
        slots: 5,
    },
    mine: {
        lvl: 8,
        hp: 4,
        regrow: 120,
        slots: 5,
    },
    pond: {
        lvl: 9,
    },
};

export const TOOL_MAX = 3;

export const SEA_NET_TIME = 1200000;

export const SEA_CATCH = [
    ['sardine', 40],
    ['mackerel', 28],
    ['shrimp', 20],
    ['seabass', 10],
    ['lobster', 4],
];
