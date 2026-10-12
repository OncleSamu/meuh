// Les imprévus, les événements rares et les contrats.
// Valeurs reprises telles quelles de la version 6.2 (même équilibre).

export const INCIDENT_LVL = 7;

export const INCIDENT_GAP = [360000, 840000];

export const INCIDENTS = {
    crow: {
        name: 'Un corbeau !',
        icon: 'crow',
        time: 0,
        text: "Touchez-le avant qu'il ne mange la récolte.",
    },
    aphids: {
        name: 'Pucerons !',
        icon: 'pest',
        time: 360000,
        text: 'Des pucerons attaquent une culture : touchez-la vite pour les chasser, sinon elle sera perdue.',
    },
    sick: {
        name: 'Animal malade',
        icon: 'sick',
        time: 1800000,
        text: 'Un animal est malade et ne produit plus : ouvrez sa fiche pour le soigner.',
    },
    express: {
        name: 'Acheteur pressé',
        icon: 'express',
        time: 600000,
        text: 'Un acheteur pressé paie le triple, mais il repart dans 10 minutes.',
    },
};

export const RARE_EVENT_LVL = 10;

export const RARE_EVENT_GAP = [5400000, 10800000];

export const RARE_EVENTS = {
    fair: {
        name: 'Foire aux bestiaux',
        icon: 'fair',
        time: 1800000,
        weight: 1,
        text: 'Des éleveurs de tout le canton sont au village : deux animaux d’exception à vendre, qui produisent 50 % plus vite.',
    },
    critic: {
        name: 'Un critique gastronomique',
        icon: 'critic',
        time: 1200000,
        weight: 2,
        text: 'Le célèbre critique Auguste Fourchette veut goûter un de vos plats. Plus vous maîtrisez la recette, meilleure sera sa note.',
    },
    butterflies: {
        name: 'Nuée de papillons',
        icon: 'butterfly',
        time: 600000,
        weight: 2,
        text: 'Des papillons butinent le champ : les récoltes dorées sont trois fois plus fréquentes.',
    },
};
