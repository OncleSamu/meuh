// 1.150 : La Grande Table Étoilée (Village › Table) — restaurant gastronomique avec service en salle, accords, brigade, critiques anonymes et 3 Étoiles.

export const GTABLE_LVL = 26;

// Coût de fondation et agrandissements successifs de la salle (3 → 4 → 5 → 6 tables)
export const GTABLE_HALLS = [
    { lvl: 0, tables: 3, name: 'Petite salle d’auberge', cost: { coins: 45000, plank: 30, stone: 25 }, reqRank: 0 },
    { lvl: 1, tables: 4, name: 'Salle à manger champêtre', cost: { coins: 250000, plank: 60, stone: 50, beam: 10 }, reqRank: 1 },
    { lvl: 2, tables: 5, name: 'Grande salle de réception', cost: { coins: 1200000, plank: 100, stone: 80, beam: 25 }, reqRank: 2 },
    { lvl: 3, tables: 6, name: 'Salon gastronomique', cost: { coins: 4500000, plank: 150, stone: 120, beam: 50 }, reqRank: 3 },
];

// Temps de dressage entre deux services (ms), raccourci par la brigade en salle et le rang
export const GTABLE_COOLDOWN_MS = 20 * 60000;

// 5 rangs du Guide gastronomique : Table de campagne → Bib Gourmand → 1★ → 2★ → 3★
export const GTABLE_RANKS = [
    { id: 'campagne', name: 'Table de campagne', badge: 'Auberge', stars: 0, mult: 2.1, brigade: 1, renom: 0, need: null },
    {
        id: 'bib',
        name: 'Bib Gourmand',
        badge: 'Bib Gourmand',
        stars: 0,
        bib: true,
        mult: 2.35,
        brigade: 2,
        renom: 180,
        need: { services: 3, critics: 1, minCriticScore: 68, dishes: 8 },
    },
    {
        id: 'star1',
        name: 'Table 1 Étoile',
        badge: '★',
        stars: 1,
        mult: 2.65,
        brigade: 3,
        renom: 450,
        need: { services: 10, critics: 3, minCriticScore: 78, dishes: 18 },
    },
    {
        id: 'star2',
        name: 'Table 2 Étoiles',
        badge: '★★',
        stars: 2,
        mult: 3.0,
        brigade: 3,
        renom: 1100,
        need: { services: 24, critics: 6, minCriticScore: 86, dishes: 34 },
    },
    {
        id: 'star3',
        name: 'Table 3 Étoiles',
        badge: '★★★',
        stars: 3,
        mult: 3.45,
        brigade: 3,
        renom: 2400,
        need: { services: 48, critics: 10, minCriticScore: 92, dishes: 52 },
    },
];

// 4 styles de nappes & d'ambiance (changent l'illustration de la salle + bonus d'ambiance)
export const GTABLE_STYLES = [
    { id: 'vichy', name: 'Bistrot Vichy', reqRank: 0, bonus: 0, wall: '#fbf0d9', cloth: '#c8453a', cloth2: '#fff7e8', accent: '#8b5a2b', desc: 'Nappes à carreaux rouges, chaises en chêne et chaleur familiale.' },
    { id: 'lin', name: 'Lin & Oliviers', reqRank: 1, bonus: 4, wall: '#f5efe0', cloth: '#ebe2cc', cloth2: '#d5c7a6', accent: '#628b48', desc: 'Lin naturel, rameaux d’olivier et lumière douce du midi (+4 pts ambiance).' },
    { id: 'velours', name: 'Velours & Laiton', reqRank: 2, bonus: 8, wall: '#3e2228', cloth: '#8f2436', cloth2: '#f6ebd4', accent: '#e0b34c', desc: 'Tenture bordeaux, bougeoirs en laiton et argenterie (+8 pts ambiance).' },
    { id: 'cristal', name: 'Or & Cristal', reqRank: 3, bonus: 12, wall: '#1f283b', cloth: '#fffaf0', cloth2: '#f2c14e', accent: '#f5d47a', desc: 'Lustre cristallin, vaisselle dorée et service trois étoiles (+12 pts ambiance).' },
];

// 6 Terroirs / Envies des convives (seuls les terroirs ouverts dans la partie sont tirés)
export const GTABLE_THEMES = {
    terroir: {
        id: 'terroir',
        name: 'Terroir de la Ferme',
        icon: ['item', 'soup'],
        col: '#c47b35',
        machines: ['kitchen', 'stove', 'marmite', 'pastaworks', 'pizzeria', 'crepery', 'saloir', 'alpineDairy', 'dairy', 'bakery'],
        wants: ['« Un vrai plat mijoté du terroir, généreux et parfumé ! »', '« On rêve d’une assiette rustique de la vallée. »'],
    },
    mer: {
        id: 'mer',
        name: 'Table de la Mer',
        icon: ['item', 'trout'],
        col: '#3f8bc4',
        machines: ['fishmonger', 'smokehouse', 'cannery', 'deli'],
        wants: ['« Une belle assiette de poisson ou de la marée ! »', '« On a envie d’embruns et de fraîcheur de la rivière. »'],
    },
    douceur: {
        id: 'douceur',
        name: 'Douceurs & Pâtisserie',
        icon: ['item', 'pie'],
        col: '#d46a8c',
        machines: ['pastry', 'icecream', 'confectionery', 'chocolatier', 'sugarmill', 'bakery'],
        wants: ['« Ce soir, on vient surtout pour vos douceurs et pâtisseries ! »', '« Un dîner tout en finesse sucrée et gourmande. »'],
    },
    ile: {
        id: 'ile',
        name: 'Saveurs des Îles',
        icon: ['item', 'pineapple'],
        col: '#38a878',
        land: 'island',
        machines: ['islandBakery', 'juiceBar', 'rumDistillery', 'stove', 'deli'],
        wants: ['« Faites-nous voyager vers l’île aux Alizés ! »', '« Des notes tropicales et ensoleillées dans l’assiette. »'],
    },
    oasis: {
        id: 'oasis',
        name: 'Épices de l’Oasis',
        icon: ['ui', 'oaOasis'],
        col: '#d98a2b',
        land: 'oasis',
        machines: ['tajine', 'earthOven', 'orientalSweets'],
        wants: ['« Un festin parfumé aux épices de l’oasis ! »', '« On rêve d’un bon tajine et de pâtisseries au miel. »'],
    },
    nord: {
        id: 'nord',
        name: 'Feu du Grand Nord',
        icon: ['ui', 'noNord'],
        col: '#5b82b8',
        land: 'nord',
        machines: ['taigaPot', 'tiledStove', 'berryKettle'],
        wants: ['« Un plat fumant venu des terres du Grand Nord ! »', '« Des baies boréales et du pain chaud au seigle. »'],
    },
};
export const GTABLE_THEME_IDS = Object.keys(GTABLE_THEMES);

// Classification des machines par rôle dans le menu (Plat / Accompagnement-Dessert / Boisson)
export const MAIN_MACHINES = new Set([
    'kitchen',
    'stove',
    'marmite',
    'pastaworks',
    'pizzeria',
    'crepery',
    'fishmonger',
    'smokehouse',
    'saloir',
    'tajine',
    'taigaPot',
    'alpineDairy',
    'deli',
    'cannery',
    'earthOven',
    'tiledStove',
    'dairy',
    'bakery',
]);

export const SIDE_MACHINES = new Set([
    'pastry',
    'icecream',
    'confectionery',
    'chocolatier',
    'orientalSweets',
    'islandBakery',
    'berryKettle',
    'bakery',
    'deli',
    'dairy',
    'sugarmill',
    'dryer',
    'alpineDairy',
]);

export const DRINK_MACHINES = new Set(['winery', 'brewery', 'counter', 'press', 'juiceBar', 'rumDistillery', 'still']);

// 5 Critiques gastronomiques du Guide (chacun a un indice discret quand il est incognito à une table !)
export const GTABLE_CRITICS = [
    {
        id: 'valmont',
        name: 'Henri de Valmont',
        title: 'Inspecteur du Guide Rouge',
        avatar: 'octave',
        clue: 'Observe longuement la lumière dans son verre et glisse un petit carnet sous sa serviette.',
        praise: '« Une justesse de goût rare dans la vallée : chaque assiette raconte la ferme. »',
        mid: '« Belle maison sincère, encore un soupçon d’audace sur les accords pour tutoyer les sommets. »',
        low: '« Table agréable mais trop sage : variez la carte et soignez l’accord boisson. »',
    },
    {
        id: 'claire',
        name: 'Claire Delacroix',
        title: 'Chroniqueuse culinaire',
        avatar: 'margaux',
        clue: 'Hume délicatement l’air de la salle et interroge sur la provenance des produits de saison.',
        praise: '« Un équilibre sublime entre fraîcheur de saison, terroir et élégance en salle. »',
        mid: '« Une cuisine pleine de cœur ; la fraîcheur de saison peut encore gagner en éclat. »',
        low: '« Les assiettes manquent d’harmonie avec la saison : écoutez le potager ! »',
    },
    {
        id: 'beaumont',
        name: 'Auguste Beaumont',
        title: 'Maître Sommelier du Guide',
        avatar: 'duval',
        clue: 'Fait tourner son verre vide entre ses doigts en cherchant la carte des crus du regard.',
        praise: '« L’accord mets et boisson frôle la perfection — un bonheur absolu de table ! »',
        mid: '« Cuisine savoureuse, mais un grand vin de cave ou une bière maison sublimerait le tout. »',
        low: '« Un grand dîner ne saurait se passer d’un véritable accord dans le verre. »',
    },
    {
        id: 'solene',
        name: 'Solène Marchand',
        title: 'Rédactrice des Tables de Campagne',
        avatar: 'ines',
        clue: 'Sourit en regardant les autres tables et note discrètement la cadence du service.',
        praise: '« Chaleur, générosité et originalité : la salle rayonne du premier au dernier couvert. »',
        mid: '« Atmosphère charmante, une petite attention ou un menu plus varié ferait des merveilles. »',
        low: '« Le menu manque un peu de surprise pour les habitués : renouvelez vos assiettes ! »',
    },
    {
        id: 'renaud',
        name: 'Chef Renaud Leduc',
        title: 'Ancien 3 Étoiles invité',
        avatar: 'victor',
        clue: 'Examine discrètement la cuisson et la qualité des ingrédients à la lumière de la bougie.',
        praise: '« Chapeau bas, collègue : la qualité des produits et la maîtrise forcent le respect ! »',
        mid: '« Solide savoir-faire ! Avec des produits de plus haute qualité, l’étoile vous tend les bras. »',
        low: '« De beaux gestes, mais une table étoilée exige une vraie exigence sur la qualité. »',
    },
];

// 3 postes de Brigade (villageois à 3+ cœurs ou enfants adultes de la Famille)
export const GTABLE_ROLES = [
    { id: 'chef', name: 'En Cuisine', reqBrigade: 1, icon: ['item', 'soup'], desc: 'Sublime les plats et la note cuisine.' },
    { id: 'sommelier', name: 'Sommellerie', reqBrigade: 2, icon: ['item', 'redWine'], desc: 'Renforce les accords mets & boissons.' },
    { id: 'maitre', name: 'En Salle', reqBrigade: 3, icon: ['ui', 'heart'], desc: 'Booste les pourboires, l’ambiance et accélère le dressage.' },
];

// Spécialités des villageois qui peuvent rejoindre la Brigade (à partir de 3 cœurs)
export const BRIGADE_TRAITS = {
    odette: { role: 'chef', score: 8, pay: 0.08, text: '+8 pts cuisine (spécialiste terroir & desserts)' },
    gaston: { role: 'maitre', score: 5, pay: 0.16, text: '+16 % pourboires & +5 pts ambiance' },
    marcel: { role: 'chef', score: 6, theme: 'mer', themeBonus: 10, text: '+6 pts cuisine (+16 pts sur la Mer)' },
    octave: { role: 'sommelier', score: 6, drinkBonus: 8, text: '+8 pts sur les accords boisson & Cave' },
    margaux: { role: 'sommelier', score: 6, drinkBonus: 8, text: '+8 pts accords vins, Champagne & parfums' },
    hugues: { role: 'sommelier', score: 6, drinkBonus: 8, text: '+8 pts sur les accords Brasserie' },
    ines: { role: 'maitre', score: 7, pay: 0.12, fast: 0.2, text: '+7 pts salle, +12 % pourboires, dressage −20 %' },
    paul: { role: 'chef', score: 7, seasonBonus: 6, text: '+7 pts cuisine & +6 pts fraîcheur de saison' },
    lucie: { role: 'chef', score: 7, theme: 'douceur', themeBonus: 8, text: '+7 pts cuisine (+15 pts sur les Douceurs)' },
    rose: { role: 'maitre', score: 8, pay: 0.1, text: '+8 pts ambiance florale & +10 % pourboires' },
    maeva: { role: 'chef', score: 6, theme: 'ile', themeBonus: 10, text: '+6 pts cuisine (+16 pts Saveurs des Îles)' },
    yasmine: { role: 'chef', score: 6, theme: 'oasis', themeBonus: 10, text: '+6 pts cuisine (+16 pts Épices de l’Oasis)' },
    ingrid: { role: 'chef', score: 6, theme: 'nord', themeBonus: 10, text: '+6 pts cuisine (+16 pts Feu du Grand Nord)' },
};

// 4 Banquets d'Honneur (grands repas festifs renouvelables selon ton rang)
export const GTABLE_BANQUETS = [
    {
        id: 'vendanges',
        name: 'Banquet du Terroir',
        reqRank: 0,
        theme: 'terroir',
        minScore: 72,
        needDrink: false,
        icon: ['item', 'soup'],
        rewardCoins: 65000,
        rewardXp: 900,
        rewardRenom: 60,
        desc: 'Un grand repas villageois autour d’un plat du terroir (note ≥ 72).',
    },
    {
        id: 'maree',
        name: 'Table des Capitaines',
        reqRank: 1,
        theme: 'mer',
        minScore: 78,
        needDrink: true,
        icon: ['item', 'trout'],
        rewardCoins: 180000,
        rewardXp: 1800,
        rewardRenom: 120,
        desc: 'Un dîner marin avec véritable accord boisson (note ≥ 78).',
    },
    {
        id: 'douceurs',
        name: 'Gala des Gourmets',
        reqRank: 2,
        theme: 'douceur',
        minScore: 84,
        needDrink: true,
        icon: ['item', 'pie'],
        rewardCoins: 450000,
        rewardXp: 3200,
        rewardRenom: 220,
        desc: 'Une réception pâtissière d’exception avec accord boisson (note ≥ 84).',
    },
    {
        id: 'etoiles',
        name: 'Dîner des Grands Chefs',
        reqRank: 3,
        theme: null,
        minScore: 90,
        needDrink: true,
        icon: ['ui', 'gtable'],
        rewardCoins: 1200000,
        rewardXp: 6000,
        rewardRenom: 420,
        desc: 'Le sommet de la vallée : un menu libre noté ≥ 90 avec accord boisson !',
    },
];

// Synergies officielles avec les autres piliers de Meuh
export const GTABLE_SYNERGY = {
    maisonVipScore: 12, // glisser un coffret de ta Maison sur la table : +12 pts d'accueil
    maisonVipPay: 0.25, // +25 % de pourboire sur la table
    perfumeAmbience: 7, // parfum d'ambiance en salle (+7 pts, +10 pts si Parfum Signature 3★ !)
    perfumeSigBonus: 3,
    perfumeUses: 5, // 1 flacon parfume la salle pendant 5 services (0 consommé si Signature !)
    kidScore: 8, // enfant adulte de ta Famille en brigade : +8 pts & +14 % pourboires
    kidPay: 0.14,
};

export function newGTable() {
    return {
        built: false,
        hall: 0, // 0..3 (3 à 6 tables)
        style: 'vichy',
        rank: 0, // 0..4 (Campagne, Bib, 1★, 2★, 3★)
        services: 0,
        covers: 0,
        criticsWon: 0,
        bestScore: 0,
        totalScore: 0,
        dishes: {}, // id -> { n, best } (palmarès des plats servis)
        recent: [], // 8 derniers plats principaux servis (anti-lassitude)
        brigade: { chef: null, sommelier: null, maitre: null },
        scent: null, // { pid, left, sig } (synergie Parfumerie)
        service: null, // service en cours : { startedAt, tables: [...], served, scoreSum, earned, criticIdx }
        nextAt: 0, // fin du dressage entre deux services
        reviews: [], // chroniques du Livre d'Or (max 24)
        banquetDone: {}, // banquets réalisés (horodatage du dernier)
        lastReport: null, // résumé du dernier service terminé
    };
}
