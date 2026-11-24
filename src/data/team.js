// 1.173 : L'Équipe du Domaine — 4 postes centralisés dans Maison › Équipe (Théo, Lina, Henri, Milo).

export const THEO_OPTS = {
    ghLvl: 3, // Théo niveau 3 + Serre bâtie → option « Inclure la Serre »
    planLvl: 4, // Théo niveau 4 → option « Suivre le Plan actif »
};

export const TEAM_LINA = [
    null,
    {
        lvl: 28,
        pastures: 1,
        every: 35,
        heal: false,
        desc: '1er pré · nourrit et ramasse toutes les 35 s',
        cost: { coins: 60000, tools: 4, wood: 10 },
    },
    {
        lvl: 40,
        pastures: 2,
        every: 25,
        heal: false,
        desc: '2 prés · nourrit et ramasse toutes les 25 s',
        cost: { coins: 180000, tools: 8, ironIngot: 12 },
    },
    {
        lvl: 54,
        pastures: 99,
        every: 18,
        heal: false,
        desc: 'Tous les prés · nourrit et ramasse toutes les 18 s',
        cost: { coins: 420000, tools: 14, solidOak: 8 },
    },
    {
        lvl: 68,
        pastures: 99,
        every: 12,
        heal: true,
        desc: 'Tous les prés · 12 s + soigne automatiquement les bêtes malades',
        cost: { coins: 850000, tools: 20, silverIngot: 10 },
    },
];

export const TEAM_HENRI = [
    null,
    {
        lvl: 32,
        slots: 3,
        every: 30,
        desc: 'Maintient 3 recettes en stock · vérifie toutes les 30 s',
        cost: { coins: 90000, tools: 5, ironIngot: 8 },
    },
    {
        lvl: 45,
        slots: 4,
        every: 22,
        desc: 'Maintient 4 recettes en stock · vérifie toutes les 22 s',
        cost: { coins: 240000, tools: 10, cutStone: 12 },
    },
    {
        lvl: 58,
        slots: 5,
        every: 15,
        desc: 'Maintient 5 recettes en stock · vérifie toutes les 15 s',
        cost: { coins: 520000, tools: 16, solidOak: 10 },
    },
    {
        lvl: 72,
        slots: 6,
        every: 10,
        desc: 'Maintient 6 recettes en stock · vérifie toutes les 10 s',
        cost: { coins: 1000000, tools: 24, silverIngot: 12 },
    },
];

export const TEAM_MILO = [
    null,
    {
        lvl: 30,
        every: 45,
        forest: false,
        lands: false,
        desc: 'Nasses de l’étang + fruits tombés du verger (ferme) · 45 s',
        cost: { coins: 75000, tools: 4, hardwood: 8 },
    },
    {
        lvl: 44,
        every: 30,
        forest: true,
        lands: false,
        desc: 'Ajoute les charges bûcheron/mineur et la cueillette en forêt · 30 s',
        cost: { coins: 200000, tools: 8, resin: 10 },
    },
    {
        lvl: 56,
        every: 20,
        forest: true,
        lands: true,
        desc: 'Ajoute les vergers des contrées (Île, Oasis, Nord, Asie) · 20 s',
        cost: { coins: 460000, tools: 14, solidOak: 10 },
    },
    {
        lvl: 70,
        every: 12,
        forest: true,
        lands: true,
        bonusForage: true,
        desc: 'Tournée complète toutes les 12 s + cueillette en forêt doublée',
        cost: { coins: 920000, tools: 20, silverIngot: 10 },
    },
];

export const LINA_MODES = [
    ['both', 'Nourrir & ramasser'],
    ['collect', 'Ramasser seulement'],
    ['feed', 'Nourrir seulement'],
];

export const MILO_MODES = [
    ['all', 'Tout ramasser'],
    ['wild', 'Nasses & Forêt'],
    ['orchard', 'Verger seulement'],
];

export const HENRI_TARGET_MIN = 5;
export const HENRI_TARGET_MAX = 100;
export const HENRI_TARGET_STEP = 5;
export const HENRI_TARGET_DEFAULT = 20;
// Recettes courantes proposées en premier dans le sélecteur d'Henri
export const HENRI_STAPLES = ['flour', 'feed', 'sugar', 'butter', 'cheese', 'cream', 'bread', 'oliveOil', 'jam', 'pasta'];
