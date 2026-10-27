// 1.50 : la cuisine de l'oasis. Trois machines (four en terre, tajine, confiserie orientale) et trente-huit recettes,
// dont quinze dans les machines qui existent déjà (moulin, huilerie, alambic, sucrerie, poterie, marmite, fromagerie, métier).
// id, nom, machine, ingrédients, temps (s), niveau
export const RECIPES_150 = [
    // dans les machines existantes
    ['semolina', 'Semoule', 'mill', { wheat: 3 }, 150, 58],
    ['rasElHanout', 'Ras el-hanout', 'mill', { cumin: 2, coriander: 2, saffron: 1 }, 300, 58],
    ['harissa', 'Harissa', 'marmite', { pepper: 3, cumin: 1, garlic: 1, oliveOil: 1 }, 320, 58],
    ['preservedLemon', 'Citrons confits', 'pottery', { lemon: 4, coriander: 1 }, 400, 58],
    ['datePaste', 'Pâte de dattes', 'sugarmill', { date: 4 }, 300, 58],
    ['jujubeSyrup', 'Sirop de jujube', 'sugarmill', { jujube: 4, sugar: 1 }, 320, 58],
    ['bitterMarmalade', 'Confiture de bigarades', 'sugarmill', { bitterOrange: 3, sugar: 2 }, 340, 58],
    ['sesameOil', 'Huile de sésame', 'oilmill', { sesame: 4 }, 300, 58],
    ['tahini', 'Tahini', 'oilmill', { sesame: 3, sesameOil: 1 }, 320, 58],
    ['orangeBlossomWater', 'Eau de fleur d’oranger', 'still', { bitterOrange: 4 }, 420, 58],
    ['camelCheese', 'Fromage de chamelle', 'alpineDairy', { camelMilk: 3 }, 480, 59],
    ['smen', 'Smen', 'alpineDairy', { zebuMilk: 4 }, 450, 59],
    ['lben', 'Lben', 'alpineDairy', { camelMilk: 2 }, 300, 59],
    ['berberRug', 'Tapis berbère', 'loom', { barbaryWool: 4 }, 600, 59],
    ['caravanBlanket', 'Couverture de caravane', 'loom', { camelWool: 3, barbaryWool: 1 }, 540, 59],
    // le four en terre
    ['kesra', 'Kesra', 'earthOven', { semolina: 2, oliveOil: 1, argan: 1 }, 260, 58],
    ['cuminBread', 'Pain plat au cumin', 'earthOven', { flour: 2, cumin: 1 }, 240, 58],
    ['msemen', 'Msemen', 'earthOven', { flour: 2, semolina: 1, butter: 1, argan: 1 }, 280, 58],
    ['sesameBread', 'Pain au sésame', 'earthOven', { flour: 2, sesame: 1 }, 240, 58],
    ['dateBread', 'Pain aux dattes', 'earthOven', { flour: 2, date: 2, carob: 1 }, 280, 58],
    ['batbout', 'Batbout', 'earthOven', { semolina: 1, flour: 1, harissa: 1 }, 300, 58],
    // le tajine
    ['lemonTajine', 'Tajine de pintade au citron confit', 'tajine', { guineaFowl: 1, preservedLemon: 1, olive: 2, citron: 1 }, 600, 59],
    ['vegTajine', 'Tajine de légumes', 'tajine', { carrot: 2, zucchini: 1, rasElHanout: 1, argan: 1 }, 480, 59],
    ['couscous', 'Couscous aux légumes', 'tajine', { semolina: 1, sorghum: 1, carrot: 1, zucchini: 1, chickpea: 1, citron: 1 }, 540, 59],
    ['chakchouka', 'Chakchouka', 'tajine', { tomato: 2, pepper: 2, egg: 2, cumin: 1 }, 420, 59],
    ['harira', 'Harira', 'tajine', { tomato: 2, lentil: 1, chickpea: 1, coriander: 1, tamarind: 1 }, 480, 59],
    ['keftas', 'Keftas au cumin', 'tajine', { beef: 1, cumin: 1, onion: 1, coriander: 1, tamarind: 1 }, 420, 59],
    ['dateTajine', 'Tajine aux dattes', 'tajine', { beef: 1, date: 2, almond: 1, smen: 1, tamarind: 1 }, 660, 59],
    ['camelCouscous', 'Couscous au lait de chamelle', 'tajine', { semolina: 2, camelMilk: 1, date: 1 }, 480, 59],
    // la confiserie orientale
    ['gazelleHorns', 'Cornes de gazelle', 'orientalSweets', { almond: 2, flour: 1, orangeBlossomWater: 1, citron: 1 }, 420, 60],
    ['halva', 'Halva', 'orientalSweets', { tahini: 1, sugar: 2, carob: 1 }, 360, 60],
    ['makrout', 'Makrout', 'orientalSweets', { semolina: 2, datePaste: 1, honey: 1, carob: 1 }, 420, 60],
    ['baklava', 'Baklava à la pistache', 'orientalSweets', { pistachio: 2, flour: 1, honey: 1, smen: 1, pricklyPear: 1 }, 540, 60],
    ['chebakia', 'Chebakia', 'orientalSweets', { flour: 2, sesame: 1, honey: 1, orangeBlossomWater: 1, mulberry: 1 }, 480, 60],
    ['nougat', 'Nougat aux amandes', 'orientalSweets', { almond: 2, honey: 2, sesame: 1, pricklyPear: 1 }, 420, 60],
    ['stuffedDates', 'Dattes fourrées', 'orientalSweets', { date: 3, almond: 1, mulberry: 1 }, 300, 60],
    ['loukoum', 'Loukoums', 'orientalSweets', { sugar: 2, orangeBlossomWater: 1, pistachio: 1, pricklyPear: 1 }, 400, 60],
    ['honeyJujubes', 'Jujubes au miel', 'orientalSweets', { jujube: 3, honey: 1, mulberry: 1 }, 300, 60],
];
// les trois machines : id, nom, niveau, prix
export const MACHINES_150 = [
    ['earthOven', 'Four en terre', 58, 180000],
    ['tajine', 'Tajine', 59, 220000],
    ['orientalSweets', 'Confiserie orientale', 60, 260000],
];
