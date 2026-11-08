// 1.81 : les seconds produits des bêtes qui n'en avaient pas, et trois recettes au moins pour chacun.
// (le cheval et l'ânesse donnent du compost, le paon une plume de plus : rien à créer pour eux)

// bête → second produit
export const EXTRAS_181 = {
    chicken: 'chickenMeat',
    quail: 'quailMeat',
    sheep: 'lambLeg',
    ewe: 'whey',
    goat: 'kidMeat',
    mohairGoat: 'goatHorn',
    alpaca: 'royalFleece',
    buffalo: 'veal',
    bees: 'royalJelly',
    horse: 'fertilizer',
    donkey: 'fertilizer',
    peacock: 'peacockFeather',
    zebu: 'zebuBeef',
    barbarySheep: 'barbaryLamb',
    muskox: 'muskoxMeat',
    ptarmigan: 'ptarmiganMeat',
};

// les seconds produits qui ne sont pas de la viande (Yvette ne les vend pas)
export const NOT_MEAT_181 = new Set(['whey', 'goatHorn', 'royalFleece', 'royalJelly', 'fertilizer', 'peacockFeather']);

// id, nom, prix, projet qui l'ouvre (oasis, Nord)
export const PRODUCTS_181 = [
    ['chickenMeat', 'Poulet fermier', 60],
    ['quailMeat', 'Caille', 70],
    ['lambLeg', 'Gigot d’agneau', 250],
    ['whey', 'Petit-lait', 180],
    ['kidMeat', 'Chevreau', 400],
    ['goatHorn', 'Corne de chèvre', 360],
    ['royalFleece', 'Toison royale', 600],
    ['veal', 'Veau', 500],
    ['royalJelly', 'Gelée royale', 450],
    ['zebuBeef', 'Bœuf de zébu', 560, 'oasisPen'],
    ['barbaryLamb', 'Agneau barbarin', 520, 'oasisPen'],
    ['muskoxMeat', 'Viande de bœuf musqué', 640, 'northStable'],
    ['ptarmiganMeat', 'Lagopède', 260, 'northStable'],
];

// id, nom, machine, ingrédients, temps (s), niveau de départ (relevé jusqu'à la machine et aux ingrédients)
export const RECIPES_181 = [
    // le poulet fermier
    ['chickenCream', 'Poulet à la crème', 'kitchen', { chickenMeat: 1, cream: 1, mushroom: 2 }, 240, 2],
    ['chickenBasque', 'Poulet basquaise', 'marmite', { chickenMeat: 1, tomato: 2, pepper: 2 }, 300, 2],
    ['smokedChicken', 'Poulet fumé', 'smokehouse', { chickenMeat: 2 }, 180, 2],
    // la caille
    ['quailGrapes', 'Cailles aux raisins', 'stove', { quailMeat: 2, grape: 2 }, 260, 14],
    ['quailHoney', 'Cailles rôties au miel', 'kitchen', { quailMeat: 2, honey: 1 }, 220, 14],
    ['quailTerrine', 'Terrine de caille', 'cannery', { quailMeat: 2, lard: 1, shallot: 1 }, 380, 14],
    // le gigot d'agneau
    ['lambGarlic', 'Gigot à l’ail', 'kitchen', { lambLeg: 1, garlic: 2, peas: 2 }, 300, 7],
    ['navarin', 'Navarin d’agneau', 'marmite', { lambLeg: 1, turnip: 2, carrot: 2 }, 340, 7],
    ['lambLasagna', 'Lasagnes d’agneau', 'pastaworks', { pasta: 1, lambLeg: 1, tomato: 2 }, 360, 7],
    // le petit-lait
    ['brousse', 'Brousse', 'dairy', { whey: 2, sheepMilk: 1 }, 260, 27],
    ['wheyBread', 'Pain au petit-lait', 'bakery', { whey: 1, wheat: 2 }, 200, 27],
    ['wheySoap', 'Savon au petit-lait', 'soapworks', { whey: 2, lavender: 1 }, 280, 27],
    // le chevreau
    ['kidMint', 'Chevreau rôti à la menthe', 'stove', { kidMeat: 1, mint: 1, potato: 2 }, 320, 24],
    ['kidOlives', 'Chevreau aux olives', 'marmite', { kidMeat: 1, olive: 2, tomato: 1 }, 340, 24],
    ['kidPie', 'Tourte au chevreau', 'bakery', { kidMeat: 1, flour: 2, butter: 1 }, 300, 24],
    // la corne
    ['hornComb', 'Peigne en corne', 'jewelry', { goatHorn: 1, nugget: 1 }, 420, 35],
    ['hornCardigan', 'Gilet à boutons de corne', 'tailor', { goatHorn: 1, wool: 3 }, 480, 35],
    ['hornKnife', 'Couteau à manche de corne', 'forge', { goatHorn: 1, stone: 2, plank: 1 }, 360, 35],
    // la toison royale
    ['royalShawl', 'Châle royal', 'tailor', { royalFleece: 1, alpacaWool: 2 }, 540, 49],
    ['royalYarn', 'Pelote royale', 'loom', { royalFleece: 2 }, 300, 49],
    ['royalDyed', 'Toison royale teinte', 'dyeworks', { royalFleece: 1, redDye: 1 }, 260, 49],
    // le veau
    ['blanquette', 'Blanquette de veau', 'marmite', { veal: 1, cream: 1, carrot: 2, mushroom: 1 }, 420, 42],
    ['ossobuco', 'Osso buco', 'stove', { veal: 1, tomato: 2, carrot: 1, lemon: 1 }, 400, 42],
    ['vitello', 'Vitello tonnato', 'deli', { veal: 1, tuna: 1, egg: 1 }, 360, 42],
    // la gelée royale
    ['royalCream', 'Crème à la gelée royale', 'perfumery', { royalJelly: 1, honey: 1, wax: 1 }, 480, 21],
    ['royalSoap', 'Savon à la gelée royale', 'soapworks', { royalJelly: 1, honey: 1 }, 300, 21],
    ['royalCandy', 'Bonbons à la gelée royale', 'confectionery', { royalJelly: 1, honey: 2, sugar: 1 }, 260, 21],
    // le bœuf de zébu (oasis)
    ['zebuTajine', 'Tajine de zébu aux pruneaux', 'tajine', { zebuBeef: 1, prunes: 1, almond: 1 }, 480, 59],
    ['zebuSkewers', 'Brochettes de zébu au cumin', 'earthOven', { zebuBeef: 2, cumin: 1, onion: 1 }, 360, 59],
    ['couscousRoyal', 'Couscous royal', 'tajine', { semolina: 2, zebuBeef: 1, carrot: 1, chickpea: 1 }, 540, 59],
    // l'agneau barbarin (oasis)
    ['mechoui', 'Méchoui au cumin', 'earthOven', { barbaryLamb: 2, cumin: 1 }, 600, 59],
    ['lambApricot', 'Tajine d’agneau aux abricots', 'tajine', { barbaryLamb: 1, apricot: 2, almond: 1 }, 480, 59],
    ['pastilla', 'Pastilla d’agneau', 'orientalSweets', { barbaryLamb: 1, flour: 1, almond: 1, honey: 1 }, 520, 59],
    // le bœuf musqué (Nord)
    ['tundraStew', 'Ragoût de la toundra', 'taigaPot', { muskoxMeat: 1, rye: 1, juniper: 1 }, 540, 60],
    ['juniperRoast', 'Rôti au genièvre', 'tiledStove', { muskoxMeat: 1, juniper: 2, butter: 1 }, 480, 60],
    ['nordPie', 'Tourte du Grand Nord', 'tiledStove', { muskoxMeat: 1, flour: 2, lingonberry: 1 }, 560, 60],
    // le lagopède (Nord)
    ['ptarmiganLingon', 'Lagopède aux airelles', 'tiledStove', { ptarmiganMeat: 1, lingonberry: 2 }, 420, 60],
    ['ptarmiganSoup', 'Soupe de lagopède', 'taigaPot', { ptarmiganMeat: 1, potato: 2, cream: 1 }, 400, 60],
    ['ptarmiganCloudberry', 'Lagopède à la chicoutai', 'tiledStove', { ptarmiganMeat: 1, cloudberry: 2, honey: 1 }, 440, 60],
];
