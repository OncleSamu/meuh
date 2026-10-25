// 1.30 : quatorze nouvelles cultures, la marmite et soixante-quatre recettes.
// Les prix des plats suivent leurs ingrédients (environ 1,37 fois leur valeur), voir items.js.

export const CROPS_130 = [
    // id, nom, graines, niveau, saisons, graine, vente, pousse (s), xp, sol, saveurs [sucré, acide, amer, épicé, umami]
    ['turnip', 'Navet', 'Graines de navet', 8, ['printemps', 'automne'], 8, 24, 80, 1, 'wet', '10120'],
    ['favaBean', 'Fève', 'Graines de fève', 10, ['printemps'], 15, 45, 130, 2, 'wet', '00103'],
    ['parsnip', 'Panais', 'Graines de panais', 14, ['automne', 'hiver'], 20, 60, 170, 3, 'shade', '30010'],
    ['shallot', 'Échalote', 'Bulbes d’échalote', 17, ['ete', 'automne'], 40, 120, 260, 4, 'dry', '20003'],
    ['broccoli', 'Brocoli', 'Plants de brocoli', 22, ['printemps', 'automne'], 45, 140, 300, 4, 'wet', '00201'],
    ['cauliflower', 'Chou-fleur', 'Plants de chou-fleur', 24, ['automne', 'hiver'], 55, 175, 380, 5, 'wet', '00102'],
    ['oat', 'Avoine', 'Graines d’avoine', 25, ['printemps', 'ete'], 28, 85, 220, 3, 'dry', '20001'],
    ['hemp', 'Chanvre', 'Graines de chanvre', 27, ['printemps', 'ete'], 22, 70, 480, 3, 'dry', '00220'],
    ['chicory', 'Chicorée', 'Graines de chicorée', 28, ['ete', 'automne'], 30, 95, 240, 4, 'dry', '10400'],
    ['chickpea', 'Pois chiche', 'Graines de pois chiche', 29, ['ete'], 40, 125, 280, 4, 'dry', '20002'],
    ['butternut', 'Butternut', 'Graines de butternut', 30, ['automne'], 70, 240, 520, 6, 'dry', '40010'],
    ['blackberry', 'Mûres', 'Plants de mûrier', 33, ['ete', 'automne'], 85, 260, 560, 7, 'shade', '32000'],
    ['blackcurrant', 'Cassis', 'Plants de cassissier', 36, ['ete'], 95, 290, 600, 8, 'shade', '14100'],
    ['endive', 'Endive', 'Racines d’endive', 37, ['hiver'], 110, 340, 700, 9, 'shade', '20300'],
];

// la marmite : soupes, veloutés, purées et gratins
export const MARMITE = {
    id: 'marmite',
    name: 'Marmite',
    cost: 6500,
    reqLvl: 8,
    desc: 'Soupes, veloutés, purées et gratins qui mijotent doucement',
    mat: { wood: 10, stone: 8 },
};

// id, nom, machine, ingrédients, temps (s), niveau d'ouverture de départ (relevé au chargement jusqu'à celui des ingrédients)
export const RECIPES_130 = [
    // le navet
    ['glazedTurnips', 'Navets glacés', 'kitchen', { turnip: 3, sugar: 1, sunflowerOil: 1 }, 240, 8],
    ['turnipSoup', 'Soupe de navets et pommes de terre', 'marmite', { turnip: 2, potato: 2, onion: 1 }, 120, 8],
    ['pickledTurnips', 'Navets marinés', 'cannery', { turnip: 3, mustard: 1 }, 60, 8],
    ['turnipBaconTart', 'Tarte aux navets et à l’oignon', 'bakery', { turnip: 3, onion: 1, flour: 2, egg: 1 }, 110, 8],
    // la fève
    ['favaPuree', 'Purée de fèves à la menthe', 'marmite', { favaBean: 3, mint: 1, butter: 1 }, 330, 10],
    ['favaGoatSalad', 'Salade de fèves au chèvre', 'deli', { favaBean: 2, goatCheese: 1, lettuce: 1 }, 540, 10],
    ['favaFlour', 'Farine de fève', 'mill', { favaBean: 3 }, 70, 10],
    ['favaBread', 'Pain aux fèves', 'bakery', { favaFlour: 2, flour: 2, egg: 1 }, 250, 10],
    ['canFavaBeans', 'Fèves au naturel', 'cannery', { favaBean: 4 }, 60, 10],
    // le panais
    ['parsnipMash', 'Purée de panais', 'marmite', { parsnip: 2, potato: 2, sunflowerOil: 1 }, 300, 14],
    ['parsnipChips', 'Chips de panais', 'dryer', { parsnip: 3 }, 60, 14],
    ['parsnipCake', 'Gâteau au panais et au miel', 'pastry', { parsnip: 2, flour: 2, honey: 1, egg: 2 }, 180, 17],
    // l'échalote
    ['shallotConfit', 'Confit d’échalotes', 'cannery', { shallot: 4, sugar: 1 }, 170, 17],
    ['shallotTatin', 'Tarte tatin d’échalotes', 'pastry', { shallot: 4, flour: 2, butter: 1, sugar: 1 }, 590, 17],
    ['shallotButter', 'Beurre à l’échalote', 'dairy', { butter: 1, shallot: 2 }, 420, 21],
    ['shallotFougasse', 'Fougasse aux échalotes', 'bakery', { shallot: 2, flour: 2, sunflowerOil: 1 }, 310, 17],
    // le brocoli
    ['broccoliSoup', 'Velouté de brocoli au fromage', 'marmite', { broccoli: 3, cheese: 1, cream: 1 }, 560, 22],
    ['broccoliQuiche', 'Quiche brocoli-saumon', 'bakery', { broccoli: 2, salmon: 1, egg: 3, flour: 2 }, 240, 22],
    ['broccoliPasta', 'Pâtes au brocoli', 'pastaworks', { pasta: 2, broccoli: 2, cream: 1 }, 320, 27],
    // le chou-fleur
    ['cauliflowerGratin', 'Gratin de chou-fleur', 'marmite', { cauliflower: 2, cheese: 1, milk: 1 }, 490, 24],
    ['piccalilli', 'Piccalilli', 'cannery', { cauliflower: 2, mustard: 1, onion: 1 }, 150, 31],
    ['cauliflowerPie', 'Tourte au chou-fleur', 'bakery', { cauliflower: 2, flour: 2, butter: 1, egg: 1 }, 390, 24],
    // la chicorée
    ['roastedChicory', 'Chicorée torréfiée', 'dryer', { chicory: 3 }, 80, 28],
    ['chicoryMilk', 'Chicorée au lait', 'juiceBar', { chicory: 2, milk: 2 }, 210, 38],
    ['chicoryCake', 'Gâteau chicorée-noisette', 'pastry', { roastedChicory: 1, hazelnut: 2, flour: 2, egg: 2, sugar: 1 }, 310, 28],
    ['frisee', 'Frisée aux lardons', 'kitchen', { chicory: 2, lard: 1, egg: 1 }, 420, 28],
    // l'endive
    ['endiveHam', 'Endives au jambon', 'kitchen', { endive: 3, ham: 1, milk: 1, cheese: 1 }, 600, 37],
    ['endiveTart', 'Tarte fine aux endives caramélisées', 'pastry', { endive: 3, sugar: 1, flour: 2, butter: 1 }, 520, 37],
    ['endiveSalad', 'Salade d’endives, noix et roquefort', 'deli', { endive: 2, walnut: 2, roquefort: 1 }, 600, 37],
    // l'avoine
    ['oatFlakes', 'Flocons d’avoine', 'mill', { oat: 3 }, 90, 25],
    ['oatFlour', 'Farine d’avoine', 'mill', { oat: 4 }, 110, 25],
    ['porridge', 'Porridge au miel', 'kitchen', { oat: 2, milk: 2, honey: 1 }, 300, 25],
    ['oatCookies', 'Cookies à l’avoine', 'pastry', { oatFlakes: 2, butter: 1, sugar: 1, egg: 1 }, 540, 25],
    ['oatBread', 'Pain d’avoine', 'bakery', { oatFlour: 2, flour: 2, butter: 1 }, 600, 25],
    ['oatGalette', 'Galettes d’avoine', 'crepery', { oatFlour: 2, milk: 1, egg: 1 }, 420, 25],
    // le pois chiche
    ['hummus', 'Houmous', 'deli', { chickpea: 3, oliveOil: 1, garlic: 1 }, 530, 29],
    ['falafel', 'Falafels', 'kitchen', { chickpea: 3, onion: 1, garlic: 1, sunflowerOil: 1 }, 240, 29],
    ['chickpeaFlour', 'Farine de pois chiche', 'mill', { chickpea: 3 }, 120, 29],
    ['socca', 'Socca', 'crepery', { chickpeaFlour: 2, oliveOil: 1 }, 600, 29],
    ['roastedChickpeas', 'Pois chiches rôtis', 'dryer', { chickpea: 3 }, 120, 29],
    ['vegCouscous', 'Couscous aux légumes', 'pastaworks', { chickpea: 2, carrot: 2, zucchini: 1, flour: 2 }, 140, 29],
    // le butternut
    ['butternutSoup', 'Velouté de butternut', 'marmite', { butternut: 2, cream: 1, onion: 1 }, 280, 30],
    ['butternutGnocchi', 'Gnocchis de butternut', 'pastaworks', { butternut: 2, flour: 2, egg: 1 }, 180, 30],
    ['butternutTart', 'Tarte au butternut', 'pastry', { butternut: 2, flour: 2, butter: 1, sugar: 1 }, 450, 30],
    ['butternutCompote', 'Compote de butternut', 'cannery', { butternut: 3, sugar: 1 }, 240, 31],
    // la mûre
    ['blackberryJam', 'Confiture de mûres', 'confectionery', { blackberry: 3, sugar: 1 }, 270, 33],
    ['blackberryTart', 'Tarte aux mûres', 'pastry', { blackberry: 3, flour: 2, butter: 1 }, 510, 33],
    ['blackberryIce', 'Glace aux mûres', 'icecream', { blackberry: 3, cream: 1, sugar: 1 }, 400, 33],
    ['blackberryJuice', 'Jus de mûre', 'juiceBar', { blackberry: 4 }, 280, 38],
    ['blackberryLiqueur', 'Liqueur de mûre', 'still', { blackberry: 4, sugar: 1 }, 310, 36],
    // le cassis
    ['blackcurrantJelly', 'Gelée de cassis', 'cannery', { blackcurrant: 3, sugar: 2 }, 290, 36],
    ['blackcurrantSorbet', 'Sorbet au cassis', 'icecream', { blackcurrant: 3, sugar: 1 }, 260, 36],
    ['blackcurrantTart', 'Tarte au cassis', 'pastry', { blackcurrant: 3, flour: 2, butter: 1, sugar: 1 }, 500, 36],
    ['cassisCream', 'Crème de cassis', 'still', { blackcurrant: 4, sugar: 1 }, 340, 36],
    ['cassisPastilles', 'Pâtes de fruits au cassis', 'confectionery', { blackcurrant: 3, sugar: 2 }, 290, 36],
    // le chanvre
    ['hempCloth', 'Toile de chanvre', 'loom', { hemp: 3 }, 70, 27],
    ['hempRope', 'Corde de chanvre', 'loom', { hemp: 2 }, 60, 27],
    ['hempOil', 'Huile de chanvre', 'oilmill', { hemp: 3 }, 70, 27],
    ['toastedHemp', 'Graines de chanvre grillées', 'oilmill', { hemp: 2 }, 60, 27],
    ['hempBread', 'Pain aux graines de chanvre', 'bakery', { toastedHemp: 1, flour: 2, butter: 1 }, 330, 27],
    ['hempBag', 'Cabas en chanvre', 'tailor', { hempCloth: 2, cottonThread: 1 }, 270, 27],
    ['espadrilles', 'Espadrilles', 'tailor', { hempCloth: 1, hempRope: 1 }, 150, 27],
    ['hempSoap', 'Savon à l’huile de chanvre', 'soapworks', { hempOil: 1, honey: 1 }, 130, 27],
    ['hempLead', 'Longe en chanvre', 'saddlery', { hempRope: 2 }, 300, 44],
];
