// Le commerce : grange, marché, étal, commandes, trains, montgolfière, marchand, concours, contrats.
// Valeurs reprises telles quelles de la version 6.2 (même équilibre).

export const BARN_TYPES = ['crop', 'tree', 'product', 'artisan', 'fish'];

export const BARN_CAPS = [50, 70, 95, 125, 160, 200, 250, 310, 380, 460, 550];

export const RARE = ['plank', 'nail', 'paint'];

export const MARKET_FLOOR = 0.25;

export const STALL_MAX_QTY = 10;

export const UNDO_MS = 5000;

export const ORDER_MAX = 9;

export const ORDER_REFILL = 20000;

export const ORDER_TRASH_WAIT = 180000;

export const TRAIN_STAY = 3600000;

export const TRAIN_AWAY = 3600000;

export const BALLOON_AWAY = 7200000;

export const MERCHANT_AWAY = 14400000;

export const HOT_MULT = 1.5;

export const MARKET_RECOVER = 0.0003;

export const BALLOON_STAY = 3600000;

export const MERCHANT_STAY = 7200000;

export const CONTRACT_LVL = 13;

export const CONTEST_LVL = 4;

export const CONTEST_POINTS = {
    orders: {
        name: 'Commandes',
        pts: 10,
    },
    wagons: {
        name: 'Wagons',
        pts: 15,
    },
    balloons: {
        name: 'Montgolfières',
        pts: 40,
    },
    projects: {
        name: 'Chantiers',
        pts: 120,
    },
    goldQ: {
        name: 'Récoltes or',
        pts: 2,
    },
    harvested: {
        name: 'Récoltes',
        pts: 0.2,
    },
    collected: {
        name: 'Produits animaux',
        pts: 0.2,
    },
    crafted: {
        name: 'Atelier',
        pts: 0.5,
    },
    beerOrders: {
        name: 'Commandes de bière',
        pts: 30,
    },
    caveOrders: {
        name: 'Commandes de cave',
        pts: 40,
    },
};

export const CONTEST_TIERS = [0.25, 0.55, 1];

export const LEAGUES = [
    {
        id: 'bronze',
        name: 'Bronze',
        f: 1,
        pay: 1,
        lvl: 4,
    },
    {
        id: 'silver',
        name: 'Argent',
        f: 1.2,
        pay: 1.5,
        lvl: 17,
    },
    {
        id: 'gold',
        name: 'Or',
        f: 1.45,
        pay: 2,
        lvl: 29,
    },
    {
        id: 'diamond',
        name: 'Diamant',
        f: 1.75,
        pay: 3,
        lvl: 44,
    },
];

// 1.8 : l'avion-cargo. Toutes les 48 heures (vraie vie), il reste 24 heures et emporte d'énormes quantités.
export const CARGO = {
    lvl: 30,
    every: 48 * 3600 * 1000,
    stay: 24 * 3600 * 1000,
    holds: 6, // six soutes : trois produits de la ferme, trois de l'atelier
    value: lvl => 1800 + lvl * 650, // valeur d'une soute, au prix de vente
    min: 40,
    max: 400,
    pay: 2.2, // chaque unité chargée rapporte 2,2 fois son prix
    xp: 0.35,
    bonus: 0.8, // l'avion plein : 80 % de plus, et des matériaux rares
    mats: 3,
};

// 1.19.1 : Armand, chef du Grand Hôtel. Il passe rarement, et demande le produit phare en quantité énorme.
export const ARMAND = {
    lvl: 22,
    every: 7 * 24 * 3600 * 1000, // il vient une fois par semaine (temps réel, même jeu fermé)
    stay: 3 * 24 * 3600 * 1000, // et reste trois jours
    min: 10, // en dessous, le produit est trop cher pour son niveau : on ne peut pas le choisir
    max: 1200,
    value: lvl => 5 * (1800 + lvl * 650), // valeur de la commande, au prix de vente
    pay: 1.8, // chaque unité livrée rapporte 1,8 fois son prix, quelle que soit la demande du marché
    fidPay: 0.1, // +10 % par point de fidélité
    fidQty: 0.2, // +20 % de quantité par point de fidélité
    fidMax: 5,
    bonus: 0.6,
    xp: 0.35,
    mats: 3,
};
