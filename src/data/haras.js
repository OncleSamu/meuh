// Les grandes écuries (1.23) : boxes, forme, soins, aptitudes et plafonds, randonnée.
// Les mini-jeux d'entraînement (1.23.1 et 1.23.2) et les concours (1.24) viendront s'y brancher.

import { lv80 } from './lv80.js';
import { lv100 } from './lv100.js';
export const HARAS_LVL = lv100(lv80(45));

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
// 1.24.3 : un peu plus rapide (3 + 5 × score au lieu de 2 + 4 × score)
export const TRAIN = { cost: 1, min: 3, span: 5, easyScore: 0.35, slow: 0.6, floor: 0.4, love: 0.02 };
// la ration : une carotte, une pomme ou de l'orge ; +10 % de gain pendant une heure
export const RATION = { items: ['carrot', 'apple', 'barley', 'oat'], hours: 1, bonus: 0.1 };
// la brosse : un cœur de plus et parfois une pastille de forme ; 1.24.3 : une fois toutes les 2 heures réelles
// (la journée du jeu dure 5 minutes : brosser « une fois par jour » rendait trop de forme)
export const BRUSH = { form: 0.25, every: 2 * 3600 * 1000 };
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
        { name: 'Prestige', rivals: [82, 95], purse: 243000 },
    ],
    open: 3, // rosettes à gagner dans une division pour ouvrir la suivante
    entries: 3, // 1.24.3 : chevaux différents inscrits par semaine
    crush: 12, // 1.24.5 : points d'avance sur la 2e pour une victoire écrasante (2 rosettes)
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
// 1.24.1 : la sellerie de Jules et l'équipement. Un objet par emplacement et par cheval ; il quitte le stock quand on l'équipe.
export const EQUIP = {
    slots: [
        { id: 'selle', name: 'Selle' },
        { id: 'bride', name: 'Bride' },
        { id: 'tapis', name: 'Tapis' },
        { id: 'fers', name: 'Fers' },
        { id: 'couv', name: 'Couverture' },
        { id: 'brosse', name: 'Brosse' },
    ],
    // apt : points d'aptitude ajoutés à la note de concours (pas à l'entraînement) ; pres : points de présentation
    items: {
        shoeIron: { slot: 'fers', apt: { galop: 3, saut: 3 } },
        shoeSilver: { slot: 'fers', apt: { galop: 6, saut: 6 } },
        saddleDress: { slot: 'selle', apt: { dressage: 6 } },
        saddleJump: { slot: 'selle', apt: { saut: 6 } },
        saddleRace: { slot: 'selle', apt: { galop: 8 } },
        bridle: { slot: 'bride', apt: { dressage: 3 }, pres: 3 },
        saddlePad: { slot: 'tapis', pres: 2 },
        winterBlanket: { slot: 'couv', recover: 2 / 3 }, // la forme remonte en 20 minutes au lieu de 30
        hairBrush: { slot: 'brosse', brush: 0.6 }, // chance que le brossage rende une pastille de forme (au lieu de BRUSH.form)
    },
};
// 1.24.2 : l'élevage. Les robes et les marques sont des gènes (dominants ou récessifs) ; l'apparence fantaisiste des gènes du jeu vient par-dessus.
export const COAT = {
    // fréquence de l'allèle « dominant » chez un cheval d'origine
    freq: {
        E: 0.72,
        A: 0.6,
        Br: 0.8,
        Cr: 0.1,
        G: 0.05,
        Rn: 0.06,
        D: 0.07,
        etoile: 0.3,
        liste: 0.22,
        belleface: 0.7,
        balzanes: 0.28,
        pie: 0.08,
        appaloosa: 0.06,
        raie: 0.1,
        lave: 0.7,
    },
    mut: 0.015, // chance qu'un allèle bascule à la transmission
    robes: {
        bai: 'Bai',
        baibrun: 'Bai brun',
        alezan: 'Alezan',
        noir: 'Noir',
        gris: 'Gris',
        palomino: 'Palomino',
        isabelle: 'Isabelle',
        creme: 'Crème',
        rouan: 'Rouan',
        aubere: 'Aubère',
        louvet: 'Louvet',
    },
    marks: {
        etoile: 'Étoile en tête',
        liste: 'Liste',
        belleface: 'Belle face',
        balzanes: 'Balzanes',
        pie: 'Pie',
        appaloosa: 'Appaloosa',
        raie: 'Raie de mulet',
        lave: 'Crins lavés',
    },
};
// 1.24.2 : la retraite des champions et le livre généalogique
export const STUD = {
    champDiv: 3, // il faut avoir gagné en division Élite (ou au-dessus)
    max: 3, // reproducteurs au pré
    income: 2500, // par jour et par reproducteur, × (1 + niveau / 60) ; 1.24.3 : 450 ne valait pas la peine
    incomeWin: 0.1, // +10 % par victoire en concours, jusqu'au double
    incomeWinMax: 1,
    incomeDays: 7, // on cumule au plus une semaine d'absence
    foalPts: 10, // points d'aptitude offerts au poulain dans la spécialité du parent
    famous: 3, // champions de suite dans une lignée (1.24.3 : 3 au lieu de 4)
    famousRibbons: 1,
    defaultName: 'Les Quatre Vents', // 1.45 : le nom de tout l'élevage (avant : « Haras des Quatre Vents »)
    stages: [0.5], // le poulain devient jeune à la moitié de sa croissance
};

// 1.180 : Concours hippiques 2.0 — pouvoirs des chevaux titrés, épreuves express, échauffement, boutique & palmarès
export const SHOW_TITLE_FX = {
    formMult: 0.8, // -20 % temps de récupération de forme dès 1 titre
    crinSpeed: 0.25, // +25 % vitesse de production de crin
    crinQual: 0.15, // +15 % chance qualité supérieure sur le crin
    randoExtra: 1, // +1 trouvaille garantie au retour de randonnée
    randoQtyMult: 1.5, // +50 % quantité par trouvaille de randonnée
    champWins: 3, // seuil « Grand Champion »
    auraTrain: 0.12, // +12 % gains d'entraînement par Grand Champion aux boxes
    auraForm: 0.1, // -10 % temps de forme par Grand Champion aux boxes
    auraMax: 3, // cumulable jusqu'à 3 Grands Champions (+36 % train / -30 % forme)
    foalApt: 8, // +8 pts d'aptitude offerts au poulain par parent titré
    foalGene: 1, // +1 sur le gène de spécialité du poulain si un parent est Grand Champion
};

export const SHOW_EXPRESS = {
    perDay: 3,
    purseMult: 0.65,
    places: [1, 0.55, 0.3],
    spurs: [3, 2, 1],
    xp: [45, 30, 18],
    themes: [
        { id: 'sprint', disc: 'galop', name: 'Prix de la Ligne Droite', sub: 'Piste rapide : les pointes de vitesse font la différence.' },
        { id: 'barres', disc: 'saut', name: 'Défi des Barres', sub: 'Parcours technique à enchaîner sans faute.' },
        { id: 'manege', disc: 'dressage', name: 'Reprise de Gala', sub: 'Souplesse et figures propres devant les juges.' },
        { id: 'cretes', disc: 'endurance', name: 'Raid des Crêtes', sub: 'Trois terrains variés, gestion fine du pouls.' },
        { id: 'haies', disc: 'saut', name: 'Grand Prix des Haies', sub: 'Obstacles enchaînés : régularité récompensée.' },
        { id: 'foulee', disc: 'galop', name: 'Derby de la Vallée', sub: 'Virages serrés et sprint final devant les tribunes.' },
    ],
};

export const SHOW_PREPS = [
    {
        id: 'oat',
        name: 'Picotin d’avoine',
        item: 'oat',
        qty: 2,
        coins: 450,
        icon: ['item', 'oat'],
        bonus: 5,
        prefDiscs: ['galop', 'endurance'],
        prefBonus: 8,
        miniBoost: 0.06,
        desc: '+5 pts note (+8 en Galop ou Endurance).',
    },
    {
        id: 'groom',
        name: 'Pansage de gala',
        item: 'apple',
        qty: 2,
        coins: 450,
        icon: ['ui', 'hBrosse'],
        bonus: 5,
        prefDiscs: ['dressage'],
        prefBonus: 8,
        miniBoost: 0.06,
        desc: '+5 pts note (+8 en Dressage).',
    },
    {
        id: 'shoe',
        name: 'Réglage des fers',
        item: 'nail',
        qty: 2,
        coins: 550,
        icon: ['item', 'shoeIron'],
        bonus: 5,
        prefDiscs: ['saut', 'galop'],
        prefBonus: 8,
        miniBoost: 0.06,
        desc: '+5 pts note (+8 en Saut ou Galop).',
    },
    {
        id: 'recon',
        name: 'Reconnaissance',
        item: null,
        qty: 0,
        coins: 200,
        icon: ['ui', 'hEcusson'],
        bonus: 4,
        prefDiscs: [],
        prefBonus: 4,
        miniBoost: 0.12,
        desc: '+4 pts note dans toute discipline et mini-jeu plus tolérant.',
    },
];

export const SHOW_SHOP = [
    {
        id: 'goldOats',
        name: 'Avoine dorée (4 h)',
        cost: 4,
        icon: ['item', 'oat'],
        desc: 'Forme régénérée 2× plus vite et +35 % gains d’entraînement aux écuries pendant 4 h.',
    },
    {
        id: 'fullCare',
        name: 'Soin complet des boxes',
        cost: 3,
        icon: ['ui', 'hForme'],
        desc: 'Restaure instantanément 5/5 de forme et ajoute +1 cœur à tous les chevaux logés.',
    },
    {
        id: 'manual',
        name: 'Manuel de maître écuyer',
        cost: 6,
        icon: ['ui', 'hDressage'],
        needHorse: true,
        desc: 'Ajoute immédiatement +6 points d’aptitude dans la spécialité (ou discipline) du cheval choisi.',
    },
    {
        id: 'elixir',
        name: 'Élixir de galop',
        cost: 8,
        icon: ['ui', 'sparkle'],
        desc: 'Prochaine naissance de poulain : +1 gène de discipline garanti et +25 % de chance de robe ou marque rare.',
    },
    {
        id: 'booster',
        name: 'Pack Prestige & MeuhCG',
        cost: 5,
        icon: ['ui', 'ribbon'],
        desc: 'Reçoit +1 booster MeuhCG gratuit et +1 ruban de Prestige.',
    },
];

export const SHOW_PALM_TIERS = [
    {
        id: 't1',
        need: 3,
        name: 'Cavalier de Club',
        train: 0.1,
        purse: 0,
        form: 0,
        crin: 0,
        note: 0,
        rubans: 1,
        spurs: 3,
        desc: '+10 % gains d’entraînement au haras.',
    },
    {
        id: 't2',
        need: 8,
        name: 'Maître de Manège',
        train: 0,
        purse: 0.1,
        form: 0.1,
        crin: 0,
        note: 0,
        rubans: 2,
        spurs: 5,
        desc: '+10 % bourses & saillies, -10 % temps de forme.',
    },
    {
        id: 't3',
        need: 18,
        name: 'Écuyer d’Élite',
        train: 0,
        purse: 0,
        form: 0,
        crin: 0.15,
        note: 2,
        rubans: 3,
        spurs: 8,
        desc: '+15 % vitesse du crin et +2 pts sur toutes les notes de concours.',
    },
    {
        id: 't4',
        need: 35,
        name: 'Grand Prix de la Vallée',
        train: 0.15,
        purse: 0.15,
        form: 0,
        crin: 0,
        note: 0,
        rubans: 5,
        spurs: 12,
        desc: '+15 % entraînement et +15 % bourses & saillies.',
    },
    {
        id: 't5',
        need: 60,
        name: 'Légende des Haras',
        train: 0.2,
        purse: 0.2,
        form: 0.15,
        crin: 0.2,
        note: 4,
        rubans: 8,
        spurs: 20,
        desc: '+20 % entraînement/bourses/saillies/crin, -15 % temps de forme et +4 pts de note.',
    },
];

