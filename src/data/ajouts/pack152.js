// 1.152 : Le Capybara & Nouvelles Récoltes — 1 animal (2 produits), 7 plantes (5 ferme, 1 serre, 1 île), 2 arbres (île) et 33 recettes.
// Les prix des plats suivent leurs ingrédients (environ 1,37 fois leur valeur), voir items.js.

// id, nom, graines, niveau, saisons (null si serre/île), prix graine, vente, pousse (s), xp, sol (null si serre/île), saveurs [sucré, acide, amer, épicé, umami], zone ('farm'|'gh'|'island')
export const CROPS_152 = [
    ['thyme', 'Thym', 'Plants de thym', 16, ['printemps', 'ete'], 28, 90, 210, 3, 'dry', '00231', 'farm'],
    ['potimarron', 'Potimarron', 'Graines de potimarron', 18, ['automne'], 35, 110, 260, 4, 'dry', '40010', 'farm'],
    ['fennel', 'Fenouil', 'Graines de fenouil', 20, ['ete', 'automne'], 40, 125, 280, 4, 'dry', '20111', 'farm'],
    ['topinambour', 'Topinambour', 'Tubercules de topinambour', 23, ['hiver'], 48, 150, 320, 5, 'shade', '30002', 'farm'],
    ['chamomile', 'Camomille', 'Graines de camomille', 24, ['printemps', 'ete'], 50, 160, 340, 5, 'dry', '20200', 'farm'],
    ['wasabi', 'Wasabi', 'Rhizomes de wasabi', 38, null, 90, 280, 620, 10, null, '00251', 'gh'],
    ['lemongrass', 'Citronnelle', 'Plants de citronnelle', 45, null, 65, 210, 460, 7, null, '13120', 'island'],
];

// id, produit, nom de l'arbre, niveau, prix, vente, pousse (s), xp, saison (null : toute l'année), île, saveurs
export const TREES_152 = [
    ['cinnamon', 'Cannelle', 'Cannelier', 48, 4800, 320, 1500, 11, null, true, '30130'],
    ['nutmeg', 'Noix de muscade', 'Muscadier', 52, 5200, 340, 1600, 12, null, true, '10241'],
];

// id, nom, produit principal, prix, durée (s), niveau, xp, second produit, croissance petit (s), prénoms, gènes de base
export const ANIMALS_152 = [
    [
        'capybara',
        'Capybara',
        'watercress',
        7000,
        900,
        34,
        15,
        'waterLily',
        900,
        ['Capy', 'Nénuphar', 'Yuzu', 'Patauge', 'Mousse', 'Zen', 'Bambou'],
        '2332233',
    ],
];

// id, nom, vente
export const PRODUCTS_152 = [
    ['watercress', 'Cresson d’eau', 220],
    ['waterLily', 'Fleur de nénuphar', 310],
];

// id, nom, machine, ingrédients, temps (s), niveau
export const RECIPES_152 = [
    // potimarron
    ['potimarronSoup', 'Velouté de potimarron', 'marmite', { potimarron: 2, cream: 1, onion: 1 }, 280, 23],
    ['potimarronTart', 'Tarte au potimarron', 'pastry', { potimarron: 2, flour: 2, sugar: 1, egg: 2 }, 220, 18],
    ['potimarronGnocchi', 'Gnocchis au potimarron', 'pastaworks', { potimarron: 2, flour: 2, potato: 1 }, 240, 27],
    // fenouil
    ['fennelBass', 'Bar au fenouil', 'fishmonger', { fennel: 2, seabass: 1, lemon: 1 }, 260, 20],
    ['braisedFennel', 'Fenouil braisé', 'stove', { fennel: 2, butter: 1, onion: 1 }, 360, 21],
    ['fennelLiqueur', 'Liqueur de fenouil', 'still', { fennel: 4, sugar: 1 }, 300, 37],
    // topinambour
    ['topiSoup', 'Velouté de topinambour', 'marmite', { topinambour: 2, cream: 1, hazelnut: 1 }, 340, 25],
    ['topiChips', 'Chips de topinambour', 'dryer', { topinambour: 3 }, 240, 25],
    ['topiGratin', 'Gratin de topinambour', 'stove', { topinambour: 2, cheese: 1, cream: 1 }, 480, 23],
    // thym
    ['thymeOil', 'Huile au thym', 'oilmill', { thyme: 3, sunflowerOil: 1 }, 240, 16],
    ['thymeCheese', 'Fromage frais au thym', 'dairy', { thyme: 2, goatMilk: 1 }, 300, 24],
    ['thymeTea', 'Infusion de thym', 'kitchen', { thyme: 2, honey: 1, lemon: 1 }, 220, 19],
    // camomille
    ['camomileTea', 'Tisane de camomille', 'kitchen', { chamomile: 2, honey: 1 }, 220, 24],
    ['camomileSoap', 'Savon à la camomille', 'soapworks', { chamomile: 2, sunflowerOil: 1, wax: 1 }, 340, 24],
    ['camomileWater', 'Eau florale de camomille', 'perfumery', { chamomile: 4 }, 300, 54],
    // wasabi (serre)
    ['wasabiSauce', 'Sauce wasabi', 'cannery', { wasabi: 2, soy: 2, lemon: 1 }, 380, 38],
    ['wasabiTartare', 'Tartare de thon au wasabi', 'fishmonger', { wasabi: 1, tuna: 1, lime: 1 }, 360, 41],
    ['wasabiCashew', 'Noix de cajou au wasabi', 'deli', { wasabi: 1, cashew: 2 }, 380, 63],
    // citronnelle (île)
    ['lemongrassBroth', 'Bouillon à la citronnelle', 'marmite', { lemongrass: 2, shrimp: 2, ginger: 1 }, 360, 55],
    ['lemongrassIced', 'Infusion glacée citronnelle', 'juiceBar', { lemongrass: 2, lime: 1, sugar: 1 }, 300, 45],
    ['lemongrassSoap', 'Savon à la citronnelle', 'soapworks', { lemongrass: 2, coconut: 1 }, 320, 45],
    // cannelier (île)
    ['cinnamonRoll', 'Roulé à la cannelle', 'islandBakery', { cinnamon: 1, flour: 2, butter: 1, sugar: 1 }, 460, 48],
    ['cinnamonRum', 'Rhum arrangé à la cannelle', 'rumDistillery', { cinnamon: 2, rum: 1, vanilla: 1 }, 680, 48],
    ['cinnamonCocoa', 'Chocolat chaud à la cannelle', 'chocolatier', { cinnamon: 1, cacao: 2, milk: 1 }, 380, 48],
    // muscadier (île)
    ['nutmegSauce', 'Béchamel à la muscade', 'stove', { nutmeg: 1, butter: 1, flour: 2, milk: 1 }, 500, 52],
    ['nutmegCake', 'Pain d’épices à la muscade', 'islandBakery', { nutmeg: 1, cinnamon: 1, honey: 2, flour: 2 }, 380, 52],
    ['nutmegElixir', 'Élixir muscade & vanille', 'perfumery', { nutmeg: 2, vanilla: 2 }, 420, 55],
    // capybara : cresson d'eau
    ['cressSoup', 'Velouté au cresson', 'marmite', { watercress: 2, cream: 1, potato: 1 }, 340, 34],
    ['cressButter', 'Beurre au cresson', 'dairy', { watercress: 2, butter: 1, lemon: 1 }, 480, 34],
    ['cressSalad', 'Salade au cresson', 'deli', { watercress: 2, tomato: 2, egg: 2 }, 260, 34],
    // capybara : fleur de nénuphar
    ['lilyTea', 'Infusion de nénuphar', 'kitchen', { waterLily: 2, honey: 1, tea: 1 }, 340, 34],
    ['lilySoap', 'Savon au nénuphar', 'soapworks', { waterLily: 2, sunflowerOil: 1, wax: 1 }, 420, 34],
    ['lilyPerfume', 'Parfum de nénuphar', 'perfumery', { waterLily: 3, mint: 1 }, 400, 54],
];

// Anecdotes de Mamie Odette pour le Carnet (une entrée par recette)
export const CARNET_152 = {
    potimarronSoup:
        'Le potimarron ne s’épluche même pas : sa peau fond dans la marmite et laisse un petit goût de châtaigne. Papi Lucien en reprenait trois louches les soirs de brouillard.',
    potimarronTart:
        'Une tarte orange vif qui éclaire toute la table en novembre. On y glisse une larme de crème au milieu, juste avant de couper les parts.',
    potimarronGnocchi:
        'Des petits coussins dorés qui remontent à la surface dès qu’ils sont prêts. Les enfants comptaient ceux qui flottaient en premier.',
    fennelBass:
        'Un beau bar rôti sur un lit de fenouil : l’odeur d’anis remplit la cuisine jusqu’au jardin. Même le chat restait assis devant le four.',
    braisedFennel:
        'Fendu en deux et confit doucement au beurre, le fenouil devient tout fondant. C’est le légume qui fait changer d’avis ceux qui disent ne pas aimer l’anis.',
    fennelLiqueur:
        'Une petite goutte verte et claire après les grands repas. Ton grand-père la gardait tout en haut du placard, soi-disant pour la digestion.',
    topiSoup:
        'Un velouté couleur crème au goût de noisette et d’artichaut. On le sert brûlant quand le gel blanchit les carreaux.',
    topiChips:
        'Tranchés fin comme du papier et séchés dorés : ça croque sous la dent et le bol se vide avant même d’arriver sur la table.',
    topiGratin:
        'Sous sa croûte de fromage doré, le topinambour fond comme une crème. Le plat des grands froids, quand la neige tient sur les toits.',
    thymeOil:
        'Trois brins de thym fleuri qui infusent au soleil dans une bouteille d’huile claire. Une seule cuillère suffit à parfumer un plat de légumes.',
    thymeCheese:
        'Un fromage de chèvre tout frais roulé dans les petites feuilles de thym. Sur une tranche de pain chaud, je ne connais rien de plus simple ni de meilleur.',
    thymeTea:
        'Du thym, du miel et un trait de citron : le remède de la vallée dès qu’un petit rhume s’annonce. Ça réchauffe la gorge dès la première gorgée.',
    camomileTea:
        'Des petites fleurs blanches à cœur d’or dans une tasse fumante. Le soir, quand tout dort à la ferme, c’est le meilleur ami du silence.',
    camomileSoap:
        'Un savon tout doux, couleur de beurre frais, qui sent les prés d’été. Parfait pour les mains qui ont passé la journée dans la terre.',
    camomileWater:
        'Une eau florale claire et apaisante, distillée au matin quand les fleurs s’ouvrent. Une vaporisation et on se croirait allongé dans l’herbe chaude.',
    wasabiSauce:
        'Vert tendre et vif comme un éclair : il en faut à peine la pointe d’un couteau ! Ton père en a pris une pleine cuillère la première fois ; il pleure encore quand on en parle.',
    wasabiTartare:
        'Du thon bien frais, du citron vert et une touche de wasabi de la serre. Un plat net, franc, qui réveille aussitôt les papilles.',
    wasabiCashew:
        'Des noix de cajou enrobées d’une fine croûte verte qui pique juste ce qu’il faut. On dit toujours qu’on en prend juste une poignée, et puis on finit le bol.',
    lemongrassBroth:
        'Un bouillon doré aux crevettes, au gingembre et à la citronnelle fraîche. Une vapeur parfumée qui transporte aussitôt au bord du lagon.',
    lemongrassIced:
        'De la citronnelle infusée, du citron vert et deux glaçons qui tintent contre le verre. La boisson des après-midis les plus chauds sur l’île.',
    lemongrassSoap:
        'Un savon frais et citronné qui sent la pluie tiède sur les feuilles tropicales. En prime, même les moustiques gardent leurs distances.',
    cinnamonRoll:
        'Une brioche en spirale beurrée, roulée de sucre et de cannelle, nappée d’un glaçage blanc. Impossible d’en cuire une fournée sans attirer tout le village.',
    cinnamonRum:
        'Deux bâtons de cannelle et une gousse de vanille qui dorment patiemment dans le rhum ambré. Plus il attend dans la cave, meilleur il devient.',
    cinnamonCocoa:
        'Un chocolat fumant relevé d’un bâton de cannelle qui sert de cuillère. Le goûter royal quand la pluie tambourine contre les volets.',
    nutmegSauce:
        'Une béchamel bien lisse, juste effleurée d’une râpée de muscade fraîche. C’est ce petit grain d’épice qui change tout dans un gratin.',
    nutmegCake:
        'Un pain d’épices sombre et moelleux au miel, à la cannelle et à la muscade. Il sent la fête d’hiver même quand il sort du four en plein juillet.',
    nutmegElixir:
        'Un parfum chaud et boisé où la muscade rencontre la vanille. Une seule goutte au poignet tient jusqu’au lendemain matin.',
    cressSoup:
        'Un velouté d’un vert éclatant, tout doux et légèrement poivré, cueilli au bord de la mare par nos capybaras. Un bol de printemps même en plein hiver.',
    cressButter:
        'Du bon beurre baratté mêlé de cresson finement haché et d’un zeste de citron. Sur du pain grillé ou un poisson chaud, c’est un pur bonheur.',
    cressSalad:
        'Des petites feuilles rondes et croquantes, des tomates du jardin et des œufs frais. La salade la plus fraîche de la ferme, toujours prête en cinq minutes.',
    lilyTea:
        'Une infusion rose pâle au parfum délicat de fleur d’eau. Le capybara la regarde fumer au bord de la mare avec l’air parfaitement serein.',
    lilySoap:
        'Un savon rose tendre qui mousse comme un nuage. Il laisse sur les mains un parfum d’étang fleuri au petit matin.',
    lilyPerfume:
        'Un parfum aquatique, frais et poudré, né des fleurs de nénuphar et d’une feuille de menthe. Doux, calme, impossible à oublier.',
};
