// 1.120 : le concours de bière de la saison. Chaque saison, le jury attend une note de goût (index dans NOTES).
export const BREWFEST = {
    bottles: 2, // bouteilles goûtées par le jury
    themes: [
        { note: 1, name: 'Bière de printemps', want: 'acidulée' },
        { note: 0, name: 'Bière d’été', want: 'douce et sucrée' },
        { note: 2, name: 'Bière d’automne', want: 'amère' },
        { note: 3, name: 'Bière d’hiver', want: 'épicée' },
    ],
    // note sur 20 : étoiles ×4, la note du thème +4, le rang de la meilleure bouteille +1 par rang
    w: { star: 4, theme: 4, rank: 1 },
    prize: [0, 9000, 4500, 2000, 800],
    renom: [0, 2, 1, 0, 0],
    xp: [0, 900, 500, 250, 100],
};

// 1.120 : le catalogue de semences. Les voisins commandent des sachets de vos variétés fixées.
export const SEEDCAT = {
    slots: 3, // variétés au catalogue
    every: 2 * 3600 * 1000, // une commande toutes les deux heures
    max: 3, // commandes en attente au plus
    sizes: [5, 10, 15],
    fee: 600, // la part fixe d'une commande (× niveau)
    mult: 2, // + chaque graine, au double du prix de la banque
    merit: 0.08, // +8 % par point de caractère au-dessus de l'espèce
    meritMax: 1.5,
};

// 1.120 : le millésime de l'année. La meilleure bouteille sortie de la cave dans l'année entre au palmarès.
export const MILLESIME = { bottles: 4, renom: 2, keep: 30 };
