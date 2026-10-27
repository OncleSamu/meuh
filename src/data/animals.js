import { LV_ANIMAL } from './levels14.js';
import { ANIMALS_135 } from './v135.js';
import { OASIS_BEASTS } from './oasis.js';
import { NORD_BEASTS } from './nord.js';
// Les animaux : prix, production, croissance des petits, noms.
// Valeurs reprises telles quelles de la version 6.2 (même équilibre).

export const ANIMALS = {
    chicken: {
        id: 'chicken',
        name: 'Poule',
        prodId: 'egg',
        cost: 100,
        time: 60,
        reqLvl: 2,
        xp: 1,
    },
    duck: {
        id: 'duck',
        name: 'Canard',
        prodId: 'feather',
        cost: 250,
        time: 150,
        reqLvl: 5,
        xp: 1,
    },
    sheep: {
        id: 'sheep',
        name: 'Mouton',
        prodId: 'wool',
        cost: 500,
        time: 300,
        reqLvl: 7,
        xp: 3,
    },
    rabbit: {
        id: 'rabbit',
        name: 'Lapin',
        prodId: 'angora',
        cost: 1200,
        time: 420,
        reqLvl: 10,
        xp: 5,
    },
    cow: {
        id: 'cow',
        name: 'Vache',
        prodId: 'milk',
        cost: 2000,
        time: 900,
        reqLvl: 16,
        xp: 12,
    },
    goat: {
        id: 'goat',
        name: 'Chèvre',
        prodId: 'goatMilk',
        cost: 4500,
        time: 1200,
        reqLvl: 22,
        xp: 18,
    },
    pig: {
        id: 'pig',
        name: 'Cochon',
        prodId: 'truffle',
        cost: 8000,
        time: 3600,
        reqLvl: 26,
        xp: 40,
    },
    goose: {
        id: 'goose',
        name: 'Oie',
        prodId: 'gooseEgg',
        cost: 3000,
        time: 600,
        reqLvl: 12,
        xp: 7,
    },
    bees: {
        id: 'bees',
        name: 'Ruche d’élevage',
        prodId: 'wax',
        cost: 6000,
        time: 900,
        reqLvl: 17,
        xp: 12,
    },
    horse: {
        id: 'horse',
        name: 'Cheval',
        prodId: 'horsehair',
        cost: 15000,
        time: 1800,
        reqLvl: 28,
        xp: 24,
    },
    peacock: {
        id: 'peacock',
        name: 'Paon',
        prodId: 'peacockFeather',
        cost: 9000,
        time: 1800,
        reqLvl: 20,
        xp: 26,
    },
    alpaca: {
        id: 'alpaca',
        name: 'Alpaga',
        prodId: 'alpacaWool',
        cost: 12000,
        time: 1500,
        reqLvl: 24,
        xp: 24,
    },
    buffalo: {
        id: 'buffalo',
        name: 'Bufflonne',
        prodId: 'buffaloMilk',
        cost: 20000,
        time: 1200,
        reqLvl: 30,
        xp: 22,
    },
    donkey: {
        id: 'donkey',
        name: 'Ânesse',
        prodId: 'donkeyMilk',
        cost: 25000,
        time: 1500,
        reqLvl: 33,
        xp: 26,
    },
    turkey: {
        id: 'turkey',
        name: 'Dinde',
        prodId: 'turkeyEgg',
        cost: 7000,
        time: 1500,
        reqLvl: 17,
        xp: 21,
    },
    // 1.3.2 : la brebis laitière (le mouton garde sa laine)
    ewe: {
        id: 'ewe',
        name: 'Brebis laitière',
        prodId: 'sheepMilk',
        cost: 5500,
        time: 1200,
        reqLvl: 23,
        xp: 18,
    },
    // 1.5 : la caille, petite et rapide
    quail: {
        id: 'quail',
        name: 'Caille',
        prodId: 'quailEgg',
        cost: 2000,
        time: 240,
        reqLvl: 14,
        xp: 4,
    },
};

// 1.35 : six animaux de plus (voir v135.js)
for (const [id, name, prodId, cost, time, reqLvl, xp, extra] of ANIMALS_135)
    ANIMALS[id] = { id, name, prodId, cost, time, reqLvl, xp, ...(extra ? { extra } : {}) };

// 1.49 : les bêtes de l'oasis (elles ne vivent que dans l'enclos de la palmeraie)
for (const [id, name, prodId, cost, time, reqLvl, xp, extra, , , , drink] of OASIS_BEASTS)
    ANIMALS[id] = { id, name, prodId, cost, time, reqLvl, xp, oasis: true, drink, needProject: 'oasisPen', ...(extra ? { extra } : {}) };

// 1.52 : les bêtes du Grand Nord (elles ne vivent que dans l'étable de rondins)
for (const [id, name, prodId, cost, time, reqLvl, xp, extra, , , , cold] of NORD_BEASTS)
    ANIMALS[id] = { id, name, prodId, cost, time, reqLvl, xp, nord: true, cold: !!cold, needProject: 'northStable', ...(extra ? { extra } : {}) };

// 1.3.2 : un second produit, pour le saloir, de temps en temps au ramassage (le gène « rendement » aide un peu)
export const EXTRA_DROP = { chance: 0.1, gene: 0.5 };
Object.entries({ pig: 'lard', duck: 'magret', goose: 'gooseLeg', turkey: 'turkeyFillet', cow: 'beef', rabbit: 'rabbitSaddle' }).forEach(
    ([a, id]) => (ANIMALS[a].extra = id),
);

export const GROW = {
    chicken: 150,
    duck: 200,
    sheep: 360,
    rabbit: 480,
    cow: 720,
    goat: 900,
    pig: 1200,
    goose: 400,
    bees: 600,
    horse: 1500,
    peacock: 1000,
    alpaca: 1200,
    buffalo: 1500,
    donkey: 1500,
    turkey: 900,
    ewe: 800,
    quail: 300,
    ...Object.fromEntries(ANIMALS_135.map(a => [a[0], a[8]])),
    ...Object.fromEntries(OASIS_BEASTS.map(a => [a[0], a[8]])),
    ...Object.fromEntries(NORD_BEASTS.map(a => [a[0], a[8]])),
};

export const NAMES = {
    chicken: ['Cocotte', 'Plume', 'Paprika', 'Noisette', 'Coquette', 'Biscuit', 'Pépite', 'Caramel'],
    sheep: ['Nuage', 'Flocon', 'Pompon', 'Barbe-à-papa', 'Guimauve', 'Bouclette', 'Cotonnade'],
    cow: ['Marguerite', 'Vanille', 'Praline', 'Duchesse', 'Clochette', 'Myrtille', 'Bergamote'],
    duck: ['Coin-coin', 'Donatella', 'Plumette', 'Gaufrette', 'Barnabé', 'Clafoutis'],
    rabbit: ['Pompon', 'Câlin', 'Noisette', 'Carotte', 'Flocon', 'Biscotin', 'Doudou'],
    goat: ['Biquette', 'Blanchette', 'Séguin', 'Chabichou', 'Cabriole', 'Edelweiss'],
    pig: ['Saucisse', 'Rosette', 'Cacahuète', 'Groin-groin', 'Pistache', 'Framboise', 'Bonbon'],
    goose: ['Capitolina', 'Gertrude', 'Plumeau', 'Honorine', 'Cancan', 'Bérénice'],
    bees: ['Bzzz', 'Reine Margot', 'Butineuse', 'Mielline', 'Pollen', 'Abeillette'],
    horse: ['Tonnerre', 'Éclair', 'Caramel', 'Pégase', 'Noisette', 'Fougère'],
    peacock: ['Narcisse', 'Saphir', 'Paonne', 'Majesté', 'Éventail', 'Topaze'],
    alpaca: ['Pompon', 'Lama-Lama', 'Frisette', 'Inca', 'Doudou', 'Machu'],
    buffalo: ['Bella', 'Mozza', 'Napoli', 'Rosina', 'Bufala', 'Sofia'],
    donkey: ['Cadichon', 'Grisette', 'Hi-Han', 'Pâquerette', 'Bourrique', 'Anatole'],
    ewe: ['Roquette', 'Bergère', 'Brebisette', 'Lainette', 'Marjolaine', 'Pâquerette'],
    quail: ['Caillette', 'Grain-de-blé', 'Mouchetée', 'Pistou', 'Noisette', 'Roucoule'],
    ...Object.fromEntries(ANIMALS_135.map(a => [a[0], a[9]])),
    ...Object.fromEntries(OASIS_BEASTS.map(a => [a[0], a[9]])),
    ...Object.fromEntries(NORD_BEASTS.map(a => [a[0], a[9]])),
    turkey: ['Glouglou', 'Dindonnette', 'Gobble', 'Plumette', 'Caroline', 'Barnabé'],
};

export const MAX_STACK = 5;

export const MAX_FOOD = 5;

export const STAR_ANIMAL_SPEED = 1.5;

export const PEACOCK_CHARM = 15;

export const TRANS_KINDS = ['cow', 'goat', 'sheep', 'buffalo', 'yak'];

export const TRANS_TIME = 5400000;

export const ALPINE_SPEED = 1.2;

// 1.4 : 50 niveaux
for (const [id, l] of Object.entries(LV_ANIMAL)) if (ANIMALS[id]) [ANIMALS[id].lvOld, ANIMALS[id].reqLvl] = [ANIMALS[id].reqLvl || 1, l];

// 1.45 : les naissances au pré (L'Élevage)
export const BIRTHS = {
    lvl: 8,
    minH: 3, // heures réelles entre deux naissances d'une espèce dans un pré : 3 h + croissance / 150, au plus 12 h
    maxH: 12,
    growDiv: 150,
    regress: 0.5, // chance qu'un bon gène redescende d'un point vers la moyenne de l'espèce
    xp: 15,
    catchUp: 4, // au plus 4 petits d'une espèce par pré au retour d'une longue absence
    skip: ['horse', 'bees'], // le haras a ses poulains, les ruches vivent à part
};
