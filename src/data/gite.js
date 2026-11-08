// 1.100 : le gîte et la table d'hôtes. Des clients au visage tiré au hasard (art/habitants.js) logent à la ferme,
// mangent ce que vous cuisinez et laissent un avis. Rien n'est jamais perdu : un client mal servi paie moins, c'est tout.
export const GITE = {
    lvl: 35,
    cost: 600000,
    mats: { plank: 60, stone: 40, beam: 10 },
    rooms: 3, // chambres au départ
    maxRooms: 8,
    roomCost: n => 400000 * (n - 2), // la n-ième chambre (n ≥ 4)
    gap: [5 * 3600000, 9 * 3600000], // une arrivée toutes les 5 à 9 h quand une chambre est libre
    stay: [12 * 3600000, 36 * 3600000], // séjour de 12 à 36 h
    night: 2500, // pièces par niveau et par séjour (chambre)
    mealPay: 1.8, // le repas est payé 1,8 fois sa valeur
    tip: [0, 0, 0, 0.1, 0.25], // pourboire selon les étoiles-1 (4 étoiles : 10 %, 5 étoiles : 25 %)
    keep: 20, // avis gardés
    xp: 150,
    // réputation (moyenne des avis) : une arrivée plus rapide à chaque palier
    fast: [1, 0.9, 0.8, 0.7],
    fastAt: [0, 3.5, 4.2, 4.7],
    plats: ['kitchen', 'deli', 'fishmonger', 'pizzeria', 'pastaworks', 'stove', 'marmite', 'tajine', 'taigaPot', 'crepery', 'earthOven', 'tiledStove'],
    desserts: ['pastry', 'icecream', 'orientalSweets', 'islandBakery', 'chocolatier'],
};
export const STARS = ['', 'Très déçu', 'Déçu', 'Correct', 'Content', 'Enchanté'];
export const COMMENTS = {
    5: ['Le meilleur séjour de ma vie, on revient !', 'Un repas de rêve et un lit comme un nuage.', 'Quelle table ! Les enfants veulent déjà revenir.'],
    4: ['Très bien, un accueil chaleureux.', 'Un bon repas, une belle ferme.'],
    3: ['Séjour agréable, mais il manquait un petit quelque chose à table.'],
    2: ['La chambre est jolie, mais on est restés un peu sur notre faim.'],
    1: ['Rien à manger… la chambre est belle, au moins.'],
};
