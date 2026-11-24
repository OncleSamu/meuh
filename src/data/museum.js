// 1.172 : Le Musée de la vallée — 4 ailes, 32 spécimens uniques, paliers de récompenses et bonus permanents.

export const MUSEUM_LVL = 8; // accessible dès que la Mine ouvre

export const MUSEUM_WINGS = [
    {
        id: 'fossils',
        name: 'Paléontologie',
        icon: 'msAmmonite',
        color: '#b68952',
        bonusKey: 'xp',
        bonusName: 'Expérience des récoltes et fouilles',
        halfPct: 5,
        fullPct: 10,
        desc: 'Empreintes de mondes disparus, coquilles spiralées et ossements anciens.',
    },
    {
        id: 'minerals',
        name: 'Minéralogie',
        icon: 'msOpale',
        color: '#6b64c8',
        bonusKey: 'mineDrop',
        bonusName: 'Chances de gemmes et géodes en mine',
        halfPct: 10,
        fullPct: 20,
        desc: 'Cristaux parfaits, pierres prismatiques et géodes taillées à la main.',
    },
    {
        id: 'relics',
        name: 'Reliques de la vallée',
        icon: 'msAstrolabe',
        color: '#c48638',
        bonusKey: 'sell',
        bonusName: 'Prix de vente de tous les produits',
        halfPct: 3,
        fullPct: 6,
        desc: 'Vestiges laissés par les générations de fermiers, bâtisseurs et voyageurs.',
    },
    {
        id: 'treasures',
        name: 'Trésors naturels',
        icon: 'msPerle',
        color: '#3a9b8e',
        bonusKey: 'nature',
        bonusName: 'Rendement forêt, mine et pêche',
        halfPct: 10,
        fullPct: 20,
        desc: 'Curiosités des eaux, des bois et des profondeurs, recueillies au fil des saisons.',
    },
];

// Raretés des spécimens : C (commun), R (rare), E (épique), L (légendaire)
export const MUSEUM_RARITIES = {
    C: { name: 'Commun', color: '#6d7b85', sell: 450, xp: 40 },
    R: { name: 'Rare', color: '#3b82c4', sell: 1400, xp: 90 },
    E: { name: 'Épique', color: '#8f4ec4', sell: 3800, xp: 180 },
    L: { name: 'Légendaire', color: '#d4941a', sell: 9500, xp: 350 },
};

// 32 spécimens uniques (8 par aile)
// [id, wing, rarity, minStratum (0..3), sourceHint, name, note du Professeur Anatole]
const RAW_EXHIBITS = [
    // ---- Aile 1 : Paléontologie (8 fossiles) ----
    ['msAmmonite', 'fossils', 'C', 0, 'Étages 1–10 · Géode grise', 'Ammonite spiralée', 'Une coquille en spirale parfaite : la vallée était sous la mer il y a cent millions d’années !'],
    ['msTrilobite', 'fossils', 'C', 0, 'Étages 1–10 · Géode grise', 'Trilobite de schiste', 'Un petit marcheur des fonds marins figé dans la pierre noire. On dirait un cloporte royal.'],
    ['msFougere', 'fossils', 'C', 0, 'Étages 1–10 · Forêt', 'Fougère pétrifiée', 'Chaque nervure est intacte. Même les forêts d’autrefois avaient du goût pour l’ombre fraîche.'],
    ['msDentRequin', 'fossils', 'R', 1, 'Étages 11–20 · Pêche', 'Dent de requin ancien', 'Tranchante comme au premier jour ! Mieux vaut la garder derrière une vitrine solide.'],
    ['msLibellule', 'fossils', 'R', 1, 'Étages 11–20 · Géode d’améthyste', 'Empreinte de libellule', 'Ses ailes transparentes ont laissé une dentelle fine dans le calcaire tendre.'],
    ['msAmbre', 'fossils', 'E', 1, 'Forêt · Géode d’améthyste', 'Ambre à insecte', 'Une goutte de résine millénaire qui a figé un moucheron en plein vol doré.'],
    ['msBelemnite', 'fossils', 'E', 2, 'Étages 21–30 · Géode de cristal', 'Rostre de bélemnite géante', 'Les anciens croyaient que c’était une flèche de foudre tombée du ciel d’orage.'],
    ['msDrake', 'fossils', 'L', 3, 'Étages 31–40 · Géode abyssale', 'Squelette de drake des cavernes', 'Pièce maîtresse de la galerie ! Tout le village vient admirer ses ailes repliées dans la roche.'],

    // ---- Aile 2 : Minéralogie (8 cristaux & pierres) ----
    ['msPyrite', 'minerals', 'C', 0, 'Étages 1–10 · Géode grise', 'Pyrite cubique', 'L’« or des fous » : des cubes dorés si géométriques qu’on les croirait taillés au ciseau.'],
    ['msQuartzFume', 'minerals', 'C', 0, 'Étages 1–10 · Géode grise', 'Quartz fumé', 'Un cristal brun translucide qui capte la lueur des lanternes comme du miel sombre.'],
    ['msRoseSables', 'minerals', 'R', 1, 'Étages 11–20 · Géode d’améthyste', 'Rose des sables', 'Des pétales de gypse nés du vent et du sel. Idris en avait une semblable dans sa sacoche.'],
    ['msDruseAmethyste', 'minerals', 'R', 1, 'Étages 11–20 · Géode d’améthyste', 'Druse d’améthyste géante', 'Un lit de dizaines de pointes violettes. Au soleil couchant, toute la salle s’illumine.'],
    ['msFluorite', 'minerals', 'E', 2, 'Étages 21–30 · Géode de cristal', 'Fluorite arc-en-ciel', 'Des bandes vertes, bleues et pourpres superposées : la pierre préférée des enfants du village.'],
    ['msOpale', 'minerals', 'E', 2, 'Étages 21–30 · Géode de cristal', 'Opale de feu', 'Des éclats orange et turquoise dansent à l’intérieur dès qu’on tourne légèrement la tête.'],
    ['msAigueMarine', 'minerals', 'E', 3, 'Étages 31–40 · Géode abyssale', 'Béryl aigue-marine', 'Claire comme l’eau d’un ruisseau de montagne figée en prisme hexagonal.'],
    ['msDiamantBrut', 'minerals', 'L', 3, 'Étages 31–40 · Géode abyssale', 'Cœur de diamant brut', 'Une pureté presque irréelle, née sous des kilomètres de pierre et des millions d’hivers.'],

    // ---- Aile 3 : Reliques de la vallée (8 vestiges anciens) ----
    ['msSilex', 'relics', 'C', 0, 'Étages 1–10 · Géode grise', 'Pointe de silex taillé', 'Façonnée avec une patience admirable : le tout premier outil des habitants de la vallée.'],
    ['msPieceBronze', 'relics', 'C', 0, 'Étages 1–10 · Géode grise', 'Pièce gauloise en bronze', 'On y distingue encore un cheval au galop et un épi de blé. Déjà le goût des belles bêtes !'],
    ['msLampeHuile', 'relics', 'R', 1, 'Étages 11–20 · Géode d’améthyste', 'Lampe à huile antique', 'En terre cuite rosée, encore noircie au bec. Elle a éclairé les premières galeries de la mine.'],
    ['msFibule', 'relics', 'R', 1, 'Étages 11–20 · Géode d’améthyste', 'Fibule en cuivre gravé', 'Une broche de manteau ornée de volutes : la mode rurale ne manque jamais d’allure.'],
    ['msSceauAbbaye', 'relics', 'E', 2, 'Étages 21–30 · Géode de cristal', 'Sceau de l’ancienne abbaye', 'Frère Hugues a reconnu le blason : on y scellait autrefois les tonneaux du jubilé !'],
    ['msAstrolabe', 'relics', 'E', 2, 'Étages 21–30 · Géode de cristal', 'Astrolabe de la vallée', 'Ses anneaux de laiton lisent les saisons et les étoiles pour savoir exactement quand semer.'],
    ['msCouronneBle', 'relics', 'E', 3, 'Étages 31–40 · Géode abyssale', 'Couronne de blé en or', 'Un diadème d’épis finement ciselés, porté lors des fêtes des moissons d’autrefois.'],
    ['msTablette', 'relics', 'L', 3, 'Étages 31–40 · Géode abyssale', 'Tablette des premiers fermiers', 'Un calendrier gravé dans la pierre : quatre saisons, douze lunes et le tout premier dessin d’une vache.'],

    // ---- Aile 4 : Trésors naturels (8 curiosités) ----
    ['msPerle', 'treasures', 'C', 0, 'Pêche · Géode grise', 'Perle d’étang nacrée', 'Formée patiemment dans une moule d’eau douce. Elle a l’éclat calme d’un matin de brume.'],
    ['msBoisFlotte', 'treasures', 'C', 0, 'Forêt · Pêche', 'Racine sculptée par l’eau', 'Polie pendant des décennies par le courant, elle dessine exactement la silhouette d’un héron.'],
    ['msMeteorite', 'treasures', 'R', 1, 'Étages 11–20 · Géode d’améthyste', 'Météorite ferreuse', 'Lourde comme une enclume miniature, tombée d’une nuit d’étoiles filantes.'],
    ['msCorail', 'treasures', 'R', 1, 'Pêche en mer · Géode d’améthyste', 'Corail fossile rouge', 'Un bouquet minéral ramené des fonds marins : on croirait un petit arbre d’hiver.'],
    ['msBoussole', 'treasures', 'E', 2, 'Pêche en mer · Étages 21–30', 'Boussole de capitaine', 'Son aiguille en acier bleui indique encore fidèlement le Nord, même au fond des galeries.'],
    ['msCloche', 'treasures', 'E', 2, 'Forêt · Étages 21–30', 'Cloche de transhumance antique', 'Un bronze si clair qu’un seul tintement fait lever la tête à tout le troupeau.'],
    ['msNacre', 'treasures', 'E', 3, 'Pêche en mer · Géode abyssale', 'Étoile de nacre abyssale', 'Irisée de bleu et d’argent, introuvable près des côtes : un vrai joyau des grands fonds.'],
    ['msOeufOr', 'treasures', 'L', 3, 'Étages 31–40 · Géode abyssale', 'Œuf de pierre dorée', 'Lisse, tiède au toucher et parcouru de veines d’or fin. Mamie Odette dit qu’il porte chance à toute la ferme.'],
];

export const MUSEUM_EXHIBITS = Object.fromEntries(
    RAW_EXHIBITS.map(([id, wing, rarity, stratum, source, name, note]) => [
        id,
        {
            id,
            wing,
            rarity,
            stratum,
            source,
            name,
            note,
            sell: MUSEUM_RARITIES[rarity].sell,
            xp: MUSEUM_RARITIES[rarity].xp,
        },
    ]),
);
export const MUSEUM_EXHIBIT_IDS = RAW_EXHIBITS.map(e => e[0]);
export const MUSEUM_BY_WING = Object.fromEntries(MUSEUM_WINGS.map(w => [w.id, RAW_EXHIBITS.filter(e => e[1] === w.id).map(e => e[0])]));

// Paliers de récompenses globales (dons cumulés au Musée)
export const MUSEUM_MILESTONES = [
    { at: 4, coins: 3000, xp: 200, label: 'Vitrine inaugurale' },
    { at: 8, coins: 8000, xp: 450, label: 'Première galerie' },
    { at: 12, coins: 20000, xp: 900, deco: 'museumFossil', label: 'Moulage d’ammonite (déco)' },
    { at: 16, coins: 45000, xp: 1600, rubans: 1, label: 'Moitié du Musée (+1 ruban)' },
    { at: 20, coins: 90000, xp: 2500, label: 'Aile des merveilles' },
    { at: 24, coins: 180000, xp: 4000, deco: 'museumCrystal', rubans: 1, label: 'Colonne de cristal (déco + 1 ruban)' },
    { at: 28, coins: 350000, xp: 6000, label: 'Conservateur émérite' },
    { at: 32, coins: 750000, xp: 10000, deco: 'museumTrophy', rubans: 2, label: 'Musée complet (déco + 2 rubans)' },
];

// Géode du jour achetable au Musée (1 par jour réel)
export const MUSEUM_SHOP_GEODE = {
    perDay: 1,
    prices: { geodeStone: 1500, geodeAmethyst: 4500, geodeCrystal: 12000, geodeAbyss: 30000 },
};
