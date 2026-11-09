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
    bread: { machines: ['bakery', 'islandBakery', 'pastry', 'crepery'] }, // 1.102 : le panier du boulanger
};
// 1.102 : une petite phrase par profil, tirée à l'arrivée
export const SAYINGS = {
    hiker: ['Je monte au col demain, il me faut de quoi tenir.', 'Trois jours de marche, et enfin une ferme !', 'Vous n’auriez pas de quoi remplir un sac à dos ?'],
    family: ['Les enfants ont faim, comme toujours.', 'On cherche de quoi faire un vrai goûter.', 'Premières vacances sous la tente, ils sont ravis !'],
    gourmet: ['On m’a dit le plus grand bien de vos produits.', 'Je ne voyage que pour bien manger.', 'Surprenez-moi.'],
    fisher: ['Ça mord bien, à la rivière ?', 'Le soir, je grille ce que j’ai pêché… ou ce que j’ai acheté.', 'Je ne repars jamais sans un bon poisson.'],
    artist: ['La lumière ici est incroyable.', 'Il me faut de quoi tenir pendant que je peins.', 'Je reste tant que l’inspiration vient.'],
    couple: ['Un week-end rien que pour nous deux.', 'On fête notre anniversaire de rencontre !', 'On cherche un coin calme et de bonnes choses.'],
};
// 1.102 : les campeurs remarquables. Leurs produits doivent être d'argent au moins ; ils paient plus et laissent un gros pourboire.
export const STARS = {
    chance: 0.1, // une arrivée sur dix (plus avec un cartographe)
    q: 1, // qualité minimale : argent
    pay: 1.5,
    tip: 0.6,
    xp: 3,
    who: [
        { name: 'Critique gastronomique', profile: 'gourmet', say: 'Mon article paraît la semaine prochaine. Pas de pression.' },
        { name: 'Photographe', profile: 'artist', say: 'Je fais un reportage sur les campings de la vallée.' },
        { name: 'Journaliste', profile: 'couple', say: 'Un papier sur les fermes qui accueillent, ça vous dit ?' },
        { name: 'Alpiniste célèbre', profile: 'hiker', say: 'Je prépare une grande ascension : il me faut le meilleur.' },
        { name: 'Champion de pêche', profile: 'fisher', say: 'Je ne mange que le meilleur poisson de la région.' },
        { name: 'Auteur jeunesse', profile: 'family', say: 'J’écris un livre sur une ferme… peut-être la vôtre.' },
    ],
};
// 1.102 : les habitués, des campeurs repartis ravis qui reviennent
export const REGULARS = { chance: 0.3, tip: 0.1, tipMax: 0.5 };
// 1.102 : un événement par jour au camping ; les produits de ces envies se vendent plus cher
export const CAMP_EVENTS = [
    { id: 'crepes', name: 'Soirée crêpes', kinds: ['sweet'], txt: 'Les douceurs se vendent 30 % plus cher' },
    { id: 'peche', name: 'Concours de pêche', kinds: ['fish'], txt: 'Le poisson se vend 30 % plus cher' },
    { id: 'marche', name: 'Marché fermier', kinds: ['fresh'], txt: 'Les produits frais se vendent 30 % plus cher' },
    { id: 'degust', name: 'Dégustation', kinds: ['cheese', 'drink'], txt: 'Fromages et boissons se vendent 30 % plus cher' },
    { id: 'banquet', name: 'Grand banquet', kinds: ['plat'], txt: 'Les plats se vendent 30 % plus cher' },
];
export const EVENT_BONUS = 1.3;
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
