// L'Élevage (1.45) : la foire aux bestiaux, les bêtes des voisins, la réputation de l'élevage (le Comice : comice.js).

export const FAIR = {
    lvl: 12,
    slots: [
        [12, 3],
        [30, 4],
        [45, 5],
    ], // [niveau, acheteurs à la fois]
    every: 3 * 3600 * 1000, // un nouvel acheteur toutes les 3 heures
    stay: 24 * 3600 * 1000, // chacun reste un jour
    base: 0.8, // × le prix d'achat de l'espèce, par bête
    perReq: 1.4, // × par exigence de gène ou d'apparence
    race: 2, // × pour une race fixée
    prize: 2, // × pour une bête primée au Comice
    xp: 20, // expérience par bête vendue (+ le niveau)
};

// les acheteurs de passage (les villageois et les fermes voisines achètent aussi)
export const PASSERS = [
    { id: 'jura', name: 'Un fromager du Jura', icon: ['item', 'cheese'], types: ['cow', 'goat', 'ewe', 'buffalo', 'yak'], likes: ['rich', 'aroma'] },
    {
        id: 'filature',
        name: 'Une filature des Vosges',
        icon: ['item', 'wool'],
        types: ['sheep', 'alpaca', 'mohairGoat', 'rabbit', 'yak'],
        likes: ['soft', 'yield'],
    },
    { id: 'parc', name: 'Un parc animalier', icon: ['animal', 'peacock'], types: null, likes: [], looks: true },
    {
        id: 'auberge',
        name: 'Une auberge du canton',
        icon: ['item', 'egg'],
        types: ['chicken', 'duck', 'quail', 'goose', 'turkey', 'pigeon', 'guinea', 'pheasant'],
        likes: ['yield', 'speed'],
    },
    { id: 'ecole', name: 'Une ferme pédagogique', icon: ['ui', 'heart'], types: null, likes: ['appetite', 'robust'], gentle: true },
];

// la réputation de l'élevage : cinq paliers, +5 % aux prix de la foire par palier
export const REPUTATION = [
    { pts: 0, name: 'Élevage local' },
    { pts: 15, name: 'Réputé dans le canton' },
    { pts: 50, name: 'Connu dans la région' },
    { pts: 120, name: 'Élevage national' },
    { pts: 250, name: 'Élevage de renom' },
];
export const REP_BONUS = 0.05;

// les bêtes de choix des voisins : une par ferme et par jour
export const NBEASTS = {
    price: 2.2, // × le prix de l'espèce, +0,6 par point de gène au-dessus de la moyenne
    perPoint: 0.6,
    // 1.46 : une bête sur deux environ porte une robe visible (les couleurs et motifs les plus courants), un peu plus chère
    lookChance: 0.45,
    lookMult: 1.4,
    colors: [1, 2, 4, 5, 6, 7],
    patterns: [1, 2, 3, 4],
};

// ---------------- le Comice agricole (remplace le Salon de l'agriculture) ----------------
export const COMICE = {
    lvl: 22,
    week: 7 * 24 * 3600 * 1000, // une édition par semaine (du lundi au dimanche)
    cats: 3, // catégories d'animaux (+1 avec le grand hall, l'ancien chantier du Salon)
    // la note sur 100
    w: { genes: 50, beauty: 20, hearts: 15, show: 15 },
    genesFull: 8, // points de gènes au-dessus de la moyenne pour la note pleine
    beautyFull: 4,
    // les fermes voisines : une note qui grandit avec le niveau, selon le style de chacune
    rivalBase: 22,
    rivalPerLvl: 0.9,
    rivalSpread: 8,
    prizes: [0, 12000, 6000, 3000], // pièces par place (× le niveau, × 2 avec le grand hall)
    rep: [0, 6, 3, 1],
    brushTime: 10, // secondes de présentation
    jury: 1.5, // ce que le jury regarde surtout compte une fois et demie (1.45.2)
};
// les noms des catégories
export const COMICE_CAT = {
    chicken: 'Les poules',
    duck: 'Les canards',
    sheep: 'Les moutons',
    rabbit: 'Les lapins',
    cow: 'Les vaches',
    goat: 'Les chèvres',
    pig: 'Les cochons',
    goose: 'Les oies',
    peacock: 'Les paons',
    alpaca: 'Les alpagas',
    buffalo: 'Les bufflonnes',
    donkey: 'Les ânes',
    turkey: 'Les dindes',
    ewe: 'Les brebis laitières',
    quail: 'Les cailles',
    pigeon: 'Les pigeons',
    guinea: 'Les pintades',
    mohairGoat: 'Les chèvres angoras',
    pheasant: 'Les faisans',
    ostrich: 'Les autruches',
    yak: 'Les yacks',
};

// ---------------- 1.46 : le carnet des robes ----------------
// pour chaque espèce, les 11 couleurs et les 8 motifs ; les finitions et l'auréole sont les raretés (toutes espèces)
export const ROBEBOOK = {
    lvl: 8,
    coin: 0.25, // pièces par robe trouvée : × le prix de l'espèce
    xp: 40,
    rubans: 1, // une espèce complète
};

// ---------------- 1.46 : les associations au pré ----------------
// deux espèces dans un même pré : la bête « on » produit plus vite (f > 0) ou plus lentement (f < 0)
export const ASSOC_LVL = 10;
export const PAIRS = [
    {
        id: 'hensCows',
        a: 'chicken',
        b: 'cow',
        on: 'chicken',
        f: 0.1,
        name: 'Les poules suivent les vaches',
        why: 'elles grattent derrière elles et mangent les mouches : les poules pondent plus vite',
        mamie: 'Nos poules passaient la journée derrière Violette, la vache. Papi disait qu’elles lui servaient de femmes de ménage. Violette, elle, faisait semblant de ne pas les voir.',
    },
    {
        id: 'goatsCows',
        a: 'goat',
        b: 'cow',
        on: 'cow',
        f: 0.08,
        name: 'Les chèvres débroussaillent',
        why: 'elles mangent les ronces que les vaches laissent : de la belle herbe pour les vaches',
        mamie: 'Une chèvre dans un pré, c’est un jardinier qui ne demande pas de salaire. La nôtre a même mangé la haie du voisin. Le voisin a moins aimé.',
    },
    {
        id: 'sheepCows',
        a: 'sheep',
        b: 'cow',
        on: 'sheep',
        f: 0.08,
        name: 'Le pâturage mixte',
        why: 'moutons et vaches ne broutent pas les mêmes herbes : les moutons trouvent toujours à manger',
        mamie: 'Les vaches tirent l’herbe avec la langue, les moutons la coupent avec les dents. Ensemble, ils tondent un pré mieux que la tondeuse de Gaston.',
    },
    {
        id: 'alpacaSheep',
        a: 'alpaca',
        b: 'sheep',
        on: 'sheep',
        f: 0.1,
        name: 'L’alpaga gardien',
        why: 'il chasse les renards et les chiens errants : les moutons broutent tranquilles',
        mamie: 'Un alpaga crache sur tout ce qui menace son troupeau. Une fois, il a craché sur le facteur. Le facteur dépose maintenant le courrier au bout du chemin.',
    },
    {
        id: 'donkeyGoats',
        a: 'donkey',
        b: 'goat',
        on: 'goat',
        f: 0.08,
        name: 'L’âne protecteur',
        why: 'l’âne n’aime pas les intrus : les chèvres se sentent en sécurité',
        mamie: 'Notre âne Cadichon ne supportait pas les renards. Ni les renards, ni les touristes, ni le curé. Mais il adorait les chèvres.',
    },
    {
        id: 'geeseHens',
        a: 'goose',
        b: 'chicken',
        on: 'chicken',
        f: 0.06,
        name: 'Les oies de garde',
        why: 'elles crient au moindre danger : les poules ne sont jamais surprises',
        mamie: 'Les oies du Capitole ont sauvé Rome, dit-on. Les nôtres ont surtout sauvé les poules, et réveillé tout le village à trois heures du matin.',
    },
    {
        id: 'yaksAlpacas',
        a: 'yak',
        b: 'alpaca',
        on: 'yak',
        f: 0.06,
        name: 'Les montagnards',
        why: 'deux bêtes des hauteurs qui se comprennent : le yack est plus serein',
        mamie: 'Le yack et l’alpaga viennent tous les deux des montagnes. Ils ne parlent pas la même langue, mais ils regardent les nuages de la même façon.',
    },
    {
        id: 'buffaloCows',
        a: 'buffalo',
        b: 'cow',
        on: 'buffalo',
        f: 0.06,
        name: 'La bufflonne en famille',
        why: 'elle se sent moins seule avec des cousines : plus de lait',
        mamie: 'La première bufflonne qu’on a eue pleurait toute la nuit. On l’a mise avec les vaches, et elle a dormi comme un bébé. Même les grosses bêtes ont besoin de compagnie.',
    },
    {
        id: 'ducksGeese',
        a: 'duck',
        b: 'goose',
        on: 'duck',
        f: -0.1,
        bad: true,
        name: 'Canards et oies se chamaillent',
        why: 'les oies chassent les canards de la mare : les canards produisent moins',
        mamie: 'Une oie et un canard dans la même mare, c’est comme Gaston et Marcel au même comptoir. Ça finit toujours en dispute, et personne ne se souvient pourquoi.',
    },
    {
        id: 'turkeysHens',
        a: 'turkey',
        b: 'chicken',
        on: 'turkey',
        f: -0.12,
        bad: true,
        name: 'Dindes et poules : attention',
        why: 'les poules portent une maladie qui fatigue les dindes : les dindes produisent moins',
        mamie: 'Le vétérinaire nous l’avait dit : jamais de dindes avec les poules. Papi ne l’a pas cru. L’année suivante, il l’a cru.',
    },
    {
        id: 'pigsSheep',
        a: 'pig',
        b: 'sheep',
        on: 'sheep',
        f: -0.08,
        bad: true,
        name: 'Les cochons retournent le pré',
        why: 'ils fouillent la terre avec leur groin : les moutons trouvent moins d’herbe',
        mamie: 'Un cochon dans un pré, c’est une charrue qui ne s’arrête jamais. Les moutons regardaient leur herbe disparaître avec des yeux tout tristes.',
    },
];
