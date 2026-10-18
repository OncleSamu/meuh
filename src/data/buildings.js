// 1.11 : les bâtiments s'améliorent en trois niveaux avec les matériaux de la nature.
// Niveau 1 (14) : planches et pierre · niveau 2 (22) : poutres, pierre taillée, lingots de fer ou de cuivre, charbon
// · niveau 3 (34) : chêne massif, lingots d'argent, une pierre précieuse.
export const TIER_LVL = [14, 22, 34];
export const TIER_NAMES = ['Renforcé', 'Pierre et fer', 'Chêne et argent'];
export const TIER_COINS = [3000, 12000, 40000];
export const BLD_MAX = 3;

export function tierCost(tier, scale = 1, metal = 'ironIngot', gem = 'quartz') {
    const coins = Math.round((TIER_COINS[tier] * scale) / 50) * 50;
    if (tier === 0) return { coins, plank: 20, stone: 15 };
    if (tier === 1) return { coins, beam: 12, cutStone: 20, [metal]: 8, coal: 6 };
    return { coins, solidOak: 6, silverIngot: 6, [gem]: 1 };
}

// les bâtiments hors machines (chaque machine a son propre niveau)
export const BUILDINGS = {
    barn: {
        name: 'Grange',
        icon: ['ui', 'granary'],
        scale: 1,
        metal: 'ironIngot',
        gem: 'quartz',
        lines: ['+60 places', '+140 places', '+260 places (le grenier)'],
        desc: 'Plus de place pour les récoltes et les plats.',
    },
    pens: {
        name: 'Étable et prés',
        icon: ['ui', 'trough'],
        scale: 1,
        metal: 'ironIngot',
        gem: 'emerald',
        lines: ['24 bêtes par pré', '28 bêtes par pré, l’abreuvoir : les bêtes ont faim moins vite', '32 bêtes par pré'],
        desc: 'Des prés plus grands et un abreuvoir de pierre.',
    },
    cave: {
        name: 'Cave',
        icon: ['ui', 'cave'],
        scale: 1.4,
        metal: 'copperIngot',
        gem: 'sapphire',
        lines: ['+2 emplacements', '+4 emplacements', '+6 emplacements, voûte de pierre'],
        desc: 'Une voûte de pierre et de nouveaux casiers.',
    },
    orchard: {
        name: 'Verger',
        icon: ['item', 'apple'],
        scale: 1.2,
        metal: 'copperIngot',
        gem: 'emerald',
        lines: ['Arbres +10 % de vie', 'Arbres +20 % de vie, fruits 6 % plus vite', 'Arbres +30 % de vie, fruits 12 % plus vite'],
        desc: 'Des tuteurs, un muret : les arbres vivent plus longtemps.',
    },
    greenhouse: {
        name: 'Serre',
        icon: ['ui', 'greenhouse'],
        scale: 1.2,
        metal: 'copperIngot',
        gem: 'quartz',
        lines: ['+1 parcelle libre', '+2 parcelles libres', '+3 parcelles libres'],
        desc: 'Des vitres de plus : des parcelles de plus.',
    },
    traps: {
        name: 'Nasses de l’étang',
        icon: ['ui', 'trap'],
        scale: 0.6,
        metal: 'ironIngot',
        gem: 'ruby',
        lines: ['+1 nasse', '+2 nasses', '+3 nasses'],
        desc: 'Un cadre de fer, une nasse de plus.',
    },
};
export const BLD_IDS = Object.keys(BUILDINGS);
