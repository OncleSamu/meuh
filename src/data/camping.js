// 1.100 (étape 1) : le camping de la vallée. Des campeurs au visage tiré au hasard (art/habitants.js) plantent la tente,
// achètent vos produits et repartent. Rien n'est jamais perdu : un campeur mal servi paie moins, c'est tout.
export const CAMPING = {
    lvl: 57, // le niveau le moins chargé après le château (55)
    cost: { coins: 1500000, plank: 200, stone: 120, beam: 40 },
    pitches: 3, // emplacements au départ
    maxPitches: 12,
    pitchCost: n => 250000 * (n - 2), // le n-ième emplacement (n ≥ 4)
    gap: [3 * 3600000, 6 * 3600000], // une arrivée toutes les 3 à 6 h quand un emplacement est libre
    stay: [10 * 3600000, 30 * 3600000], // séjour de 10 à 30 h
    pay: 2, // un produit est payé 2 fois sa valeur
    tip: 0.2, // pourboire si tout est vendu
    xp: 120,
    keep: 12, // derniers campeurs gardés (pour l'étape 2 : ceux qui voudraient rester)
    tillHours: 8, // la caisse de l'épicerie se remplit au plus 8 h
    tillRate: 400, // pièces par niveau et par heure et par emplacement
};

// Ce que cherche un campeur : des « envies », tirées parmi ce que vous savez produire.
// fresh : produits frais ; fish : poisson ; plat / sweet / drink : recettes de machines.
export const WANTS = {
    fresh: { types: ['crop', 'tree', 'product'] },
    fish: { types: ['fish'] },
    plat: { machines: ['kitchen', 'deli', 'fishmonger', 'pizzeria', 'pastaworks', 'stove', 'marmite', 'tajine', 'taigaPot', 'crepery', 'earthOven', 'tiledStove', 'bakery', 'smokehouse'] },
    sweet: { machines: ['pastry', 'icecream', 'orientalSweets', 'islandBakery', 'chocolatier', 'confectionery'] },
    drink: { machines: ['press', 'winery', 'brewery', 'juiceBar'] },
    cheese: { machines: ['dairy', 'alpineDairy'] },
};
export const PROFILES = {
    hiker: { name: 'Randonneur', wants: ['fresh', 'fresh', 'plat'] },
    family: { name: 'Famille', wants: ['fresh', 'sweet', 'plat'] },
    gourmet: { name: 'Gourmet', wants: ['cheese', 'drink', 'plat'] },
    fisher: { name: 'Pêcheur', wants: ['fish', 'fish', 'drink'] },
    artist: { name: 'Artiste', wants: ['drink', 'sweet'] },
    couple: { name: 'Couple', wants: ['drink', 'plat', 'sweet'] },
};
export const ORIGINS = ['de Bretagne', 'de Provence', 'de Lorraine', 'de Savoie', 'du Québec', 'de Belgique', 'de Suisse', 'd’Espagne', 'du Portugal', 'd’Italie', 'd’Écosse', 'de Norvège', 'du Maroc', 'de Normandie', 'd’Alsace', 'du Pays basque'];
export const FIRST_NAMES = ['Aurélien', 'Béatrice', 'Cyprien', 'Dominique', 'Éloïse', 'Fabrice', 'Gisèle', 'Hector', 'Irène', 'Joachim', 'Karine', 'Lucien', 'Mathilde', 'Noé', 'Océane', 'Pascal', 'Quentin', 'Rosalie', 'Sylvain', 'Thérèse', 'Ulysse', 'Valérie', 'Wilfried', 'Yvonne', 'Zacharie', 'Alix', 'Bastien', 'Clémence', 'Damien', 'Élise', 'Florian', 'Garance', 'Hugo', 'Inès', 'Jérémie', 'Lola', 'Maël', 'Nina', 'Oscar', 'Perrine'];

// les améliorations : chacune une fois
export const CAMP_UPGRADES = {
    water: { name: 'Point d’eau et bois de chauffe', desc: 'Les campeurs laissent plus de pourboire (+10 %)', cost: { coins: 400000, plank: 40 }, tip: 0.1 },
    sanitary: { name: 'Sanitaires', desc: 'Plus de confort : les campeurs restent un tiers de temps en plus, donc plus de temps pour les servir', cost: { coins: 600000, stone: 60, plank: 40 }, stay: 1.33 },
    common: { name: 'Salle commune', desc: 'Soirées jeux et concerts : tout se vend 10 % plus cher au camping', cost: { coins: 900000, plank: 80, beam: 20 }, pay: 1.1 },
    play: { name: 'Terrain de jeux', desc: 'Les familles adorent : les campeurs arrivent 15 % plus vite', cost: { coins: 700000, plank: 60, tools: 5 }, gap: 0.85 },
    shop: { name: 'Épicerie du camping', desc: 'Elle vend vos produits même quand vous n’êtes pas là : une caisse à encaisser', cost: { coins: 1200000, plank: 100, beam: 30 }, till: true },
};
