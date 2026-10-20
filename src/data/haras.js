// Les grandes écuries (1.23) : boxes, forme, soins, aptitudes et plafonds, randonnée.
// Les mini-jeux d'entraînement (1.23.1 et 1.23.2) et les concours (1.24) viendront s'y brancher.

export const HARAS_LVL = 44;

// les quatre disciplines ; le gène donne le plafond de l'aptitude : 40 + 12 × le gène (gène 5 → 100)
export const DISCIPLINES = [
    { id: 'galop', name: 'Galop', gene: 'speed', geneName: 'Vitesse', icon: ['ui', 'hGalop'], text: 'la course de vitesse' },
    { id: 'endurance', name: 'Endurance', gene: 'robust', geneName: 'Robustesse', icon: ['ui', 'hEndurance'], text: 'le raid sur la durée' },
    { id: 'dressage', name: 'Dressage', gene: 'docile', geneName: 'Docilité', icon: ['ui', 'hDressage'], text: 'les figures au manège' },
    { id: 'saut', name: 'Saut', gene: 'jump', geneName: 'Détente', icon: ['ui', 'hSaut'], text: 'le parcours d’obstacles' },
];
export const DISC = Object.fromEntries(DISCIPLINES.map(d => [d.id, d]));
export const APT = { base: 40, perGene: 12, max: 100 };

// le bâtiment : un niveau de plus = quatre boxes de plus
export const STABLE = [
    { boxes: 0, cost: null },
    { boxes: 4, cost: { coins: 600000, plank: 60, beam: 30, nail: 80, stone: 40 } },
    { boxes: 8, cost: { coins: 1500000, plank: 100, beam: 60, nail: 120, paint: 10 } },
    { boxes: 12, cost: { coins: 4000000, plank: 150, beam: 90, nail: 200, paint: 20, stone: 80 } },
];
export const STABLE_NAMES = ['Chantier', 'Les grandes écuries', 'Les grandes écuries : aile arrière', 'Les grandes écuries : manège et obstacle'];

// la forme : 5 pastilles, une de plus toutes les 30 minutes (même jeu fermé)
export const FORM = { max: 5, every: 30 * 60 * 1000 };
// un entraînement : coûte 1 de forme ; gain = (2 + 4 × score) points, réduit près du plafond
export const TRAIN = { cost: 1, min: 2, span: 4, easyScore: 0.35, slow: 0.6, floor: 0.4, love: 0.02 };
// la ration : une carotte, une pomme ou de l'orge ; +10 % de gain pendant une heure
export const RATION = { items: ['carrot', 'apple', 'barley'], hours: 1, bonus: 0.1 };
// la brosse : un cœur de plus (une fois par jour) et parfois une pastille de forme
export const BRUSH = { form: 0.25 };
// la randonnée : 2 heures, 1 de forme ; des trouvailles à la maison, +2 points d'endurance
export const RANDO = {
    hours: 2,
    cost: 1,
    endurance: 2,
    draws: 3,
    finds: [
        ['mushroom', 3],
        ['chestnut', 3],
        ['wood', 3],
        ['honey', 2],
        ['lavender', 2],
        ['apple', 2],
        ['stone', 1],
    ],
};
