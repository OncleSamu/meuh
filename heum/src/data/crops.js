// Heum — les cultures des Parcelles et leurs variantes mutantes.
// 0.3 : chaque culture débloquée rapporte plus par minute et par parcelle que la précédente (rutabaga 6, lentilles 7, sorgho 8, courge 10, panais 11, kale 12, mûres 14).
// t : secondes de pousse ; seed : prix du semis ; sell : prix de vente d'une unité ; mut : la variante mutante.
export const CROPS = {
    rutabaga: { name: 'Rutabaga', lvl: 1, t: 60, seed: 4, sell: 5, yield: 2, mut: 'rutabagaGlow', food: 1 },
    lentil: { name: 'Lentilles', lvl: 1, t: 120, seed: 8, sell: 11, yield: 2, mut: null, food: 1 },
    sorghum: { name: 'Sorgho', lvl: 2, t: 180, seed: 12, sell: 18, yield: 2, mut: null, food: 1 },
    squash: { name: 'Courge', lvl: 6, t: 300, seed: 24, sell: 37, yield: 2, mut: 'squashShell', food: 2 },
    parsnip: { name: 'Panais', lvl: 7, t: 240, seed: 18, sell: 31, yield: 2, mut: null, food: 1 },
    // V2
    kale: { name: 'Chou-kale', lvl: 11, t: 240, seed: 20, sell: 34, yield: 2, mut: 'kaleSponge', food: 1 },
    blackberry: { name: 'Mûres', lvl: 13, t: 360, seed: 28, sell: 56, yield: 2, mut: 'berryFire', food: 1 },
    // 0.5 : le monde s'agrandit (net par minute et par parcelle : 20, 23, 31)
    topinambour: { name: 'Topinambour', lvl: 15, t: 300, seed: 30, sell: 66, yield: 2, mut: 'tuberGlass', food: 2 },
    beet: { name: 'Betterave', lvl: 18, t: 420, seed: 40, sell: 100, yield: 2, mut: 'beetBlood', food: 1 },
    chili: { name: 'Piment', lvl: 22, t: 480, seed: 55, sell: 150, yield: 2, mut: 'chiliAsh', food: 1 },
};
export const MUTANTS = {
    rutabagaGlow: { name: 'Rutabaga lumineux', of: 'rutabaga', sell: 20, role: 'Rend de l’énergie : il nourrit le bunker trois fois mieux.', food: 3 },
    squashShell: { name: 'Courge carapace', of: 'squash', sell: 140, role: 'Très résistante, elle se vend cher.', food: 4 },
    kaleSponge: {
        name: 'Chou-éponge',
        of: 'kale',
        sell: 100,
        role: 'Il absorbe la Contamination : chaque récolte fait baisser la jauge de 8.',
        food: 2,
        clean: 8,
    },
    tuberGlass: { name: 'Topinambour de verre', of: 'topinambour', sell: 230, role: 'Translucide et fragile : il se vend très cher et nourrit bien.', food: 4 },
    beetBlood: { name: 'Betterave sanguine', of: 'beet', sell: 330, role: 'Sa sève sombre se vend à prix d’or.', food: 2 },
    chiliAsh: { name: 'Piment de cendre', of: 'chili', sell: 480, role: 'Il brûle encore : le meilleur prix de tous les mutants.', food: 1 },
    berryFire: { name: 'Mûre ardente', of: 'blackberry', sell: 190, role: 'Ingrédient des conserves explosives, que réclame le convoi blindé.', food: 1 },
};
// V2 : un mutant fixé au labo de Victor se sème en graine stable : il pousse toujours mutant, sans jamais tourner Rebelle
export const STABLE = {
    rutabagaGlow: { seed: 25, t: 90 },
    squashShell: { seed: 110, t: 360 },
    kaleSponge: { seed: 60, t: 300 },
    berryFire: { seed: 130, t: 420 },
    tuberGlass: { seed: 140, t: 360 },
    beetBlood: { seed: 190, t: 480 },
    chiliAsh: { seed: 260, t: 540 },
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
// le prix d'une parcelle en plus : doux jusqu'à la douzième, puis ×1,3 à chaque nouvelle (24 parcelles en tout)
export const PLOTS = 24;
export const plotCost = opened => (opened <= 12 ? Math.round(40 * Math.pow(2.2, opened - 4)) : Math.round(21946 * Math.pow(1.3, opened - 12)));
