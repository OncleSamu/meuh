// Heum — les cultures des Parcelles et leurs variantes mutantes.
// t : secondes de pousse ; seed : prix du semis ; sell : prix de vente d'une unité ; mut : la variante mutante.
export const CROPS = {
    rutabaga: { name: 'Rutabaga', lvl: 1, t: 60, seed: 4, sell: 5, yield: 2, mut: 'rutabagaGlow', food: 1 },
    lentil: { name: 'Lentilles', lvl: 1, t: 120, seed: 7, sell: 8, yield: 2, mut: null, food: 1 },
    sorghum: { name: 'Sorgho', lvl: 2, t: 180, seed: 10, sell: 11, yield: 2, mut: null, food: 1 },
    squash: { name: 'Courge', lvl: 6, t: 300, seed: 22, sell: 20, yield: 2, mut: 'squashShell', food: 2 },
    parsnip: { name: 'Panais', lvl: 7, t: 240, seed: 16, sell: 15, yield: 2, mut: null, food: 1 },
};
export const MUTANTS = {
    rutabagaGlow: { name: 'Rutabaga lumineux', of: 'rutabaga', sell: 20, role: 'Rend de l’énergie : il nourrit le bunker trois fois mieux.', food: 3 },
    squashShell: { name: 'Courge carapace', of: 'squash', sell: 80, role: 'Très résistante, elle se vend cher.', food: 4 },
};
// le prix d'une parcelle en plus
export const plotCost = opened => Math.round(40 * Math.pow(2.2, opened - 4));
