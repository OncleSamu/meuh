// 1.171 : la cuisine et l'artisanat des Terres d'Asie.
// Trois ateliers (wok de fonte, panier vapeur, atelier de douceurs d'Asie) et quarante et une recettes,
// dont treize dans les ateliers existants (couture, teinturerie, scierie, alambic, glacier, pressoir, joaillerie, fromagerie d'alpage).
// id, nom, machine, ingrédients, temps (s), niveau
export const RECIPES_ASIE = [
    // dans les ateliers existants (aucune recette ajoutée au métier à tisser pour garder <= 20)
    ['silkKimono', 'Kimono de soie', 'tailor', { silkThread: 3, cloth: 1 }, 560, 80],
    ['silkiePillow', 'Coussin en duvet de soie', 'tailor', { silkieFeather: 3, silkThread: 1 }, 500, 80],
    ['silkieQuilt', 'Édredon en duvet de soie', 'tailor', { silkieFeather: 3, cloth: 1 }, 580, 80],
    ['goldenSilkParasol', 'Ombrelle de soie dorée', 'tailor', { goldenSilk: 2, bambooShoot: 1, silkieFeather: 1 }, 600, 80],
    ['goldenObi', 'Obi de soie dorée', 'dyeworks', { goldenSilk: 2, silkThread: 2 }, 540, 80],
    ['silkFan', 'Éventail en bambou et soie', 'sawmill', { silkThread: 2, bambooShoot: 1, wood: 1 }, 340, 80],
    ['velvetCarving', 'Statuette en bois de velours', 'sawmill', { velvetAntler: 2, wood: 2 }, 380, 80],
    ['velvetElixir', 'Élixir au bois de velours', 'still', { velvetAntler: 2, ginkgo: 2, honey: 1 }, 480, 80],
    ['umeshu', 'Liqueur d’ume', 'still', { ume: 4, sugar: 2 }, 440, 80],
    ['yuzuSorbet', 'Sorbet au yuzu', 'icecream', { yuzu: 3, sugar: 1, kumquat: 1 }, 380, 80],
    ['nashiCider', 'Poiré de nashi', 'press', { nashi: 4, sugar: 1 }, 380, 80],
    ['velvetAmulet', 'Amulette de bois de velours', 'jewelry', { velvetAntler: 1, goldenSilk: 1, nugget: 1 }, 460, 80],
    ['sikaTofuCheese', 'Caillé doux au lait de sika', 'alpineDairy', { sikaMilk: 3, yuzu: 1 }, 460, 80],
    // le wok de fonte
    ['bambooStirFry', 'Sauté aux pousses de bambou', 'wok', { bambooShoot: 2, bokChoy: 2, soySauce: 1 }, 320, 80],
    ['shiitakeNoodles', 'Nouilles sautées aux shiitakes', 'wok', { shiitake: 3, flour: 2, soySauce: 1 }, 360, 80],
    ['lotusCrisps', 'Tranches de lotus caramélisées', 'wok', { lotus: 3, sugar: 1, sesame: 1 }, 340, 80],
    ['ginkgoRice', 'Riz sauté aux noix de ginkgo', 'wok', { rice: 2, ginkgo: 2, silkieEgg: 1 }, 380, 80],
    ['bokChoyWok', 'Pak choï glacé au gingembre', 'wok', { bokChoy: 3, ginger: 1, soySauce: 1 }, 300, 80],
    ['yuzuDuckWok', 'Magret sauté au yuzu', 'wok', { magret: 1, yuzu: 2, bambooShoot: 1 }, 460, 80],
    ['fiveSpiceBeef', 'Bœuf sauté à la badiane', 'wok', { beef: 1, starAnise: 1, bokChoy: 2, soySauce: 1 }, 520, 80],
    ['shrimpLotusWok', 'Crevettes sautées au lotus', 'wok', { shrimp: 2, lotus: 2, ginger: 1 }, 420, 80],
    ['shiitakeTofuWok', 'Tofu mijoté aux shiitakes', 'wok', { tofu: 1, shiitake: 2, bambooShoot: 1, starAnise: 1 }, 440, 80],
    ['silkieFriedRice', 'Riz sauté aux œufs de poule soie', 'wok', { rice: 2, silkieEgg: 2, peas: 2, onion: 1 }, 360, 80],
    // le panier vapeur en bambou
    ['shiitakeBao', 'Baozi aux shiitakes', 'steamer', { flour: 2, shiitake: 2, bokChoy: 1 }, 380, 80],
    ['lotusDimSum', 'Raviolis vapeur au lotus', 'steamer', { flour: 2, lotus: 2, bambooShoot: 1 }, 400, 80],
    ['yuzuFishSteam', 'Bar vapeur au yuzu', 'steamer', { seabass: 1, yuzu: 2, ginger: 1 }, 480, 80],
    ['custardSilkie', 'Flan salé aux œufs de poule soie', 'steamer', { silkieEgg: 3, shiitake: 1, sikaMilk: 1 }, 420, 80],
    ['umeOnigiri', 'Onigiri à la prune ume', 'steamer', { rice: 2, ume: 2, sesame: 1 }, 300, 80],
    ['longanSteamedBun', 'Brioche vapeur aux longanes', 'steamer', { flour: 2, longan: 3, sugar: 1 }, 400, 80],
    ['ginkgoBroth', 'Bouillon clair au ginkgo', 'steamer', { ginkgo: 2, bambooShoot: 2, shiitake: 1 }, 440, 80],
    ['nashiSteamPear', 'Poire nashi étuvée au miel', 'steamer', { nashi: 3, honey: 1, starAnise: 1 }, 420, 80],
    ['bokChoyDumplings', 'Gyoza vapeur au pak choï', 'steamer', { flour: 2, bokChoy: 2, garlic: 1, sesame: 1 }, 360, 80],
    // l'atelier de douceurs d'Asie
    ['yuzuMochi', 'Mochi au yuzu', 'wagashi', { rice: 2, yuzu: 2, sugar: 1 }, 360, 80],
    ['umeJelly', 'Gelée de prune ume', 'wagashi', { ume: 3, sugar: 2 }, 380, 80],
    ['kumquatConfit', 'Kumquats confits', 'wagashi', { kumquat: 4, sugar: 2 }, 400, 80],
    ['nashiTart', 'Tarte fine au nashi', 'wagashi', { flour: 2, nashi: 3, butter: 1 }, 420, 80],
    ['longanPudding', 'Crème aux longanes et lait de sika', 'wagashi', { longan: 3, sikaMilk: 2, sugar: 1 }, 440, 80],
    ['lotusMooncake', 'Gâteau de lune au lotus', 'wagashi', { flour: 2, lotus: 3, silkieEgg: 1, honey: 1 }, 480, 80],
    ['ginkgoSweetSoup', 'Soupe sucrée au ginkgo', 'wagashi', { ginkgo: 3, longan: 2, sugar: 1 }, 420, 80],
    ['kumquatMochi', 'Daifuku au kumquat', 'wagashi', { rice: 2, kumquat: 2, redBeanPaste: 1 }, 400, 80],
    ['starAniseCandies', 'Bonbons à la badiane', 'wagashi', { starAnise: 2, honey: 2, sugar: 2 }, 360, 80],
];

// les trois machines : id, nom, niveau, prix, chantier qui les ouvre
export const MACHINES_ASIE = [
    ['wok', 'Wok de fonte', 80, 210000, 'asiaSluice'],
    ['steamer', 'Panier vapeur', 80, 250000, 'asiaPavilion'],
    ['wagashi', 'Atelier de douceurs d’Asie', 80, 290000, 'asiaGrove'],
];
