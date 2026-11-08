// 1.99 : les crises de la vallée. Une alerte la veille, une crise de 24 h, des préparatifs au choix.
// Rien n'est jamais perdu (ni produit, ni bête) : une crise ralentit, et bien préparée elle ralentit à peine.
export const CRISIS = {
    lvl: 30,
    warn: 12 * 3600000, // l'alerte arrive 12 h avant
    last: 24 * 3600000, // la crise dure 24 h
    gap: [3 * 86400000, 5 * 86400000], // entre deux crises, 3 à 5 jours
    firstGap: 86400000,
    costPerLevel: 3000, // préparatifs : 3 000 pièces par niveau
    reward: 1.5, // la récompense rend 1,5 fois le coût si l'on s'est préparé
    xp: 200,
};

export const CRISES = {
    drought: {
        name: 'La sécheresse',
        icon: ['ui', 'w_heat'],
        kind: 'crop',
        mult: 0.6,
        prepMult: 0.85,
        text: 'Plus une goutte depuis des semaines : les cultures poussent bien plus lentement.',
        prep: 'Creuser une citerne et pailler',
        effect: 'Cultures et vergers',
    },
    epidemic: {
        name: 'L’épidémie des bêtes',
        icon: ['ui', 'sick'],
        kind: 'animal',
        mult: 0.6,
        prepMult: 0.85,
        text: 'Une toux court d’une étable à l’autre : les bêtes produisent moins vite.',
        prep: 'Appeler le vétérinaire et soigner par précaution',
        effect: 'Production des bêtes',
    },
    slump: {
        name: 'Le marché en berne',
        icon: ['ui', 'coin'],
        kind: 'market',
        mult: 0.8,
        prepMult: 0.95,
        text: 'Les acheteurs se font rares : tout se vend moins cher.',
        prep: 'Organiser une foire locale',
        effect: 'Prix de vente',
    },
};
