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

export const CONTRACT_LVL = 12;

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
        lvl: 15,
    },
    {
        id: 'gold',
        name: 'Or',
        f: 1.45,
        pay: 2,
        lvl: 25,
    },
    {
        id: 'diamond',
        name: 'Diamant',
        f: 1.75,
        pay: 3,
        lvl: 38,
    },
];
