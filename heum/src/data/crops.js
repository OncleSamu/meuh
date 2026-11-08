// Heum — les cultures des Parcelles et leurs variantes mutantes.
// t : secondes de pousse ; seed : prix du semis ; sell : prix de vente d'une unité ; mut : la variante mutante.
export const CROPS = {
    rutabaga: { name: 'Rutabaga', lvl: 1, t: 60, seed: 4, sell: 5, yield: 2, mut: 'rutabagaGlow', food: 1 },
    lentil: { name: 'Lentilles', lvl: 1, t: 120, seed: 7, sell: 8, yield: 2, mut: null, food: 1 },
    sorghum: { name: 'Sorgho', lvl: 2, t: 180, seed: 10, sell: 11, yield: 2, mut: null, food: 1 },
    squash: { name: 'Courge', lvl: 6, t: 300, seed: 22, sell: 20, yield: 2, mut: 'squashShell', food: 2 },
    parsnip: { name: 'Panais', lvl: 7, t: 240, seed: 16, sell: 15, yield: 2, mut: null, food: 1 },
    // V2
    kale: { name: 'Chou-kale', lvl: 11, t: 240, seed: 18, sell: 16, yield: 2, mut: 'kaleSponge', food: 1 },
    blackberry: { name: 'Mûres', lvl: 13, t: 360, seed: 26, sell: 24, yield: 2, mut: 'berryFire', food: 1 },
};
export const MUTANTS = {
    rutabagaGlow: { name: 'Rutabaga lumineux', of: 'rutabaga', sell: 20, role: 'Rend de l’énergie : il nourrit le bunker trois fois mieux.', food: 3 },
    squashShell: { name: 'Courge carapace', of: 'squash', sell: 80, role: 'Très résistante, elle se vend cher.', food: 4 },
    kaleSponge: {
        name: 'Chou-éponge',
        of: 'kale',
        sell: 50,
        role: 'Il absorbe la Contamination : chaque récolte fait baisser la jauge de 8.',
        food: 2,
        clean: 8,
    },
    berryFire: { name: 'Mûre ardente', of: 'blackberry', sell: 90, role: 'Ingrédient des conserves explosives, que réclame le convoi blindé.', food: 1 },
};
// V2 : un mutant fixé au labo de Victor se sème en graine stable : il pousse toujours mutant, sans jamais tourner Rebelle
export const STABLE = {
    rutabagaGlow: { seed: 25, t: 90 },
    squashShell: { seed: 110, t: 360 },
    kaleSponge: { seed: 60, t: 300 },
    berryFire: { seed: 130, t: 420 },
};
export const FIX = { mutants: 5, elec: 2, t: 300 };
// ce qui pousse sur une parcelle : une culture, ou un mutant fixé
export function cropDef(id) {
    if (CROPS[id]) return CROPS[id];
    const m = MUTANTS[id],
        s = STABLE[id];
    return m && s ? { name: m.name, t: s.t, seed: s.seed, sell: m.sell, yield: 2, mut: null, stable: true, lvl: 1 } : null;
}
// V2 : l'équipement d'une parcelle déplace sa Contamination par rapport à la jauge de la ferme
export const GEAR = {
    veil: { name: 'Voile', mod: -20, text: 'Protège la parcelle : 20 points de moins que la jauge.' },
    conc: { name: 'Concentrateur', mod: 25, text: 'Pousse la parcelle : 25 points de plus que la jauge.' },
};
// le prix d'une parcelle en plus
export const plotCost = opened => Math.round(40 * Math.pow(2.2, opened - 4));
