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

// 1.23.2 : le galop. 40 s environ ; trois virages ; le sprint final dans les dernières unités de piste.
export const GALOP = {
    length: 1000,
    turns: [300, 600, 830],
    sprint: 120,
    zone: [0.42, 0.68], // la zone verte de l'allure
    fall: 0.3, // écart (en allure) qui fait tomber la note d'un virage de 1 à 0
    up: 0.5,
    down: 0.32,
    rateMin: 20, // unités de piste par seconde à l'arrêt de l'allure
    rateMax: 50,
    tMin: 22,
    tMax: 44,
    wTurn: 0.5,
    wTime: 0.3,
    wSprint: 0.2,
    rivals: 5,
    rivalMin: 31,
    rivalMax: 41,
    warn: 4, // secondes d'avance du panneau de virage
};
// 1.23.2 : le saut. Huit obstacles, l'anneau se resserre de plus en plus vite, trois fautes éliminent.
export const SAUT = {
    obstacles: 8,
    maxFaults: 3,
    t0: 1.6, // secondes de l'anneau au premier obstacle
    t1: 1.05, // et au dernier
    target: 0.2, // le rayon où appuyer
    perfect: 0.07,
    good: 0.17,
    shrink: 0.03, // les fenêtres rétrécissent de ça au dernier obstacle
    goodValue: 0.6,
    seq: ['vertical', 'oxer', 'haie', 'mur', 'riviere', 'barriere', 'vertical', 'oxer'],
};
// 1.23.3 : le dressage. Quatre figures à suivre du doigt dans le manège (360 × 520) ; précision, régularité et tracé complet font la note.
export const DRESSAGE = {
    figures: ['volte', 'serpentine', 'diagonale', 'huit'],
    tol: 34, // écart (en pixels) qui fait tomber la précision de 1 à 0
    start: 46, // distance au point de départ pour lancer la figure
    window: 14, // combien de points du tracé on peut avancer d'un coup (empêche de couper)
    smoothMax: 0.8, // virage moyen (radians par pas) qui ramène la régularité à 0
    step: 8, // longueur minimale d'un pas pour mesurer la régularité
    end: 0.96, // la figure est finie à ce taux du tracé
    wPrec: 0.6,
    wSmooth: 0.4,
};
// 1.23.3 : le raid d'endurance. Trois étapes ; on choisit l'allure (pas, trot, galop). Le terrain change la vitesse et le pouls,
// un pouls au-dessus de la limite (qui grimpe avec la forme) fait ralentir le cheval.
export const RAID = {
    stages: [
        { terrain: 'plat', name: 'La plaine', len: 360, fast: 13, slow: 34, hint: 'Terrain roulant : le trot passe tout seul' },
        { terrain: 'cote', name: 'La côte', len: 200, fast: 18, slow: 44, hint: 'Côte raide : ménagez le cheval, passez au pas' },
        { terrain: 'sable', name: 'Les dunes', len: 300, fast: 14, slow: 38, hint: 'Le sable épuise : surveillez le pouls' },
    ],
    gaits: { pas: { v: 9, p: 60 }, trot: { v: 18, p: 84 }, galop: { v: 28, p: 106 } }, // vitesse (unités/s) et pouls visé au plat
    terrain: {
        plat: { add: 0, mult: { pas: 0.55, trot: 1, galop: 1.1 } },
        cote: { add: 34, mult: { pas: 1, trot: 0.75, galop: 0.5 } },
        sable: { add: 14, mult: { pas: 0.5, trot: 0.85, galop: 1 } },
    },
    rate: 0.4, // le pouls rejoint sa cible à ce rythme par seconde
    rest: 62, // pouls au repos
    limitBase: 108, // la limite vaut limitBase + limitForm × pastilles de forme
    limitForm: 3,
    over: 0.4, // vitesse restante au-dessus de la limite
    recover: 0.5, // part de l'écart au repos qui reste après le contrôle vétérinaire
    wTime: 0.65,
    wCalm: 0.35,
    wVet: 0.15, // poids des contrôles dans la note finale
    vetOk: 90, // pouls d'arrivée à partir duquel le contrôle se dégrade
    vetSpan: 40,
};
// 1.24 : les concours. Une discipline par semaine, cinq divisions, cinq rivales, un Grand Prix le premier week-end du mois.
export const SHOW = {
    rot: ['galop', 'saut', 'dressage', 'endurance'], // la discipline de la semaine tourne dans cet ordre
    divs: [
        { name: 'Poneys', rivals: [30, 45], purse: 3000 },
        { name: 'Amateurs', rivals: [45, 60], purse: 9000 },
        { name: 'Club', rivals: [58, 72], purse: 27000 },
        { name: 'Élite', rivals: [70, 84], purse: 81000 },
        { name: 'Grand Prix', rivals: [82, 95], purse: 243000 },
    ],
    open: 3, // rosettes à gagner dans une division pour ouvrir la suivante
    rivalsN: 5,
    fee: 0.05, // inscription, en part de la bourse
    places: [1, 0.5, 0.25], // part de la bourse pour les trois premiers
    wApt: 0.55,
    wPass: 0.3,
    wPres: 0.15,
    spec: 1.1, // bonus de la spécialité
    jules: 0.75, // Jules monte : 75 % de l'aptitude tient lieu de passage
    presBase: 40,
    presLove: 12, // points de présentation par cœur d'amitié
    gpMult: 2, // le Grand Prix double les bourses et les rivales sont les mêmes
    cupCharm: 6,
    roseCharm: 2,
    charmCap: 120,
    // la première victoire de chaque division (sauf la première) donne une décoration unique
    decos: ['whitefence', 'showjump', 'horsevane', 'showpodium'],
    names: ['Éclair', 'Tempête', 'Opale', 'Caramel', 'Sultane', 'Mirage', 'Bellone', 'Orage', 'Pistache', 'Roméo', 'Gaston', 'Fanfan'],
};
