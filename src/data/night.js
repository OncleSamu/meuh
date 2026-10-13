// La ferme la nuit (1.2). Une nuit dure de 20 h à 6 h (environ 2 minutes de jeu).
export const NIGHT = {
    lvl: 11,
    flySeasons: ['printemps', 'ete'], // les lucioles
    flyEvery: 5, // une luciole toutes les 5 s environ
    flyMax: 5,
    flyLife: 9000, // ms avant qu'elle s'envole
    flyXp: 6,
    jar: 20, // lucioles pour remplir le bocal
    starChance: 0.4, // une étoile filante passe pendant 4 nuits sur 10
    starLife: 6000,
    marketLvl: 14,
    marketSeasons: ['ete'],
    mushroomNight: 1.3, // les champignons poussent plus vite la nuit
    owlScare: 0.6, // la chouette chasse 60 % des corbeaux
};

// les vœux d'une étoile filante
export const WISHES = [
    { kind: 'gold', left: 6, text: 'vos 6 prochaines récoltes du champ seront en or' },
    { kind: 'animals', secs: 600, text: 'vos bêtes donnent le double pendant 10 minutes' },
    { kind: 'gift', text: 'un cadeau' },
];
