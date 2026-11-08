// 1.100 : les dernières recettes. Chaque produit de la ferme sert à trois recettes au moins (c'était la règle de la 1.33) :
// œuf de dinde, lait de zébu, laines du désert, poissons de rivière et sorgho en avaient moins. Plus de pizzas, de plats au four
// en terre et de pâtes de baies.
// id, nom, machine, ingrédients, durée (s), niveau (relevé au chargement jusqu'à celui de l'ingrédient le plus tardif)
export const RECIPES_100 = [
    // la pizzeria
    ['pizzaTurkeyEgg', 'Pizza à l’œuf de dinde', 'pizzeria', { flour: 2, tomato: 1, cheese: 1, mushroom: 1, turkeyEgg: 1 }, 440, 41],
    ['pizzaCrayfish', 'Pizza aux écrevisses', 'pizzeria', { flour: 2, cream: 1, cheese: 1, crayfish: 3, lemon: 1 }, 460, 42],
    ['pizzaZebu', 'Pizza blanche au lait de zébu', 'pizzeria', { flour: 2, zebuMilk: 1, cheese: 1, zucchini: 1 }, 440, 61],
    ['pizzaSorghum', 'Pizza au sorgho', 'pizzeria', { sorghum: 2, tomato: 1, pepper: 1, cheese: 1 }, 440, 59],
    // le four en terre
    ['sorghumFlatbread', 'Galette de sorgho', 'earthOven', { sorghum: 2, oliveOil: 1 }, 260, 59],
    ['clayTench', 'Tanche à l’argile', 'earthOven', { tench: 2, lemon: 1, oliveOil: 1 }, 300, 60],
    ['clayBurbot', 'Lotte à l’argile', 'earthOven', { burbot: 1, cumin: 1, oliveOil: 1 }, 300, 60],
    ['claySturgeon', 'Esturgeon à l’argile', 'earthOven', { sturgeon: 1, lemon: 1, cumin: 1, oliveOil: 1 }, 340, 62],
    // la bouilloire à baies
    ['zebuMilkJam', 'Confiture de lait de zébu', 'berryKettle', { zebuMilk: 2, sugar: 2 }, 380, 64],
    ['turkeyEggCurd', 'Crème de chicoutai à l’œuf de dinde', 'berryKettle', { turkeyEgg: 1, cloudberry: 2, sugar: 1 }, 380, 64],
    ['sorghumBerryPaste', 'Pâte d’airelles au sorgho', 'berryKettle', { lingonberry: 2, sorghum: 1, sugar: 1 }, 360, 64],
    // le reste : poissons de rivière et laines du désert
    ['friedBleak', 'Friture d’ablettes', 'fishmonger', { bleak: 4, flour: 1, butter: 1 }, 240, 26],
    ['marinatedBleak', 'Ablettes marinées', 'saloir', { bleak: 4, lemon: 1, sugar: 1 }, 300, 28],
    ['camelRug', 'Tapis de dromadaire', 'tailor', { camelWool: 4, cloth: 1 }, 600, 62],
    ['camelBurnous', 'Burnous de dromadaire', 'tailor', { camelWool: 3, cloth: 1 }, 640, 63],
    ['barbaryShawl', 'Châle barbarin', 'tailor', { barbaryWool: 3, cloth: 1 }, 600, 63],
];
export const CARNET_100 = {
    pizzaTurkeyEgg: 'Un œuf de dinde posé au milieu, qui cuit juste ce qu’il faut : le jaune coule sur les champignons. Mamie dit que c’est la pizza des matins de fête.',
    pizzaCrayfish: 'Les écrevisses, on les pêchait à la main sous les pierres de la rivière. Un trait de citron par-dessus, et la crème fait le reste.',
    pizzaZebu: 'Une pizza blanche, toute douce, au lait de zébu : pas de tomate, juste du fromage, de la courgette et un peu de patience.',
    pizzaSorghum: 'Le sorgho, ça fait une pâte plus rustique, un peu sucrée. Avec du poivron et de la tomate, on dirait un soleil d’été.',
    sorghumFlatbread: 'Une galette plate de sorgho, cuite contre l’argile, avec un filet d’huile d’olive. On la mange chaude, en trempant.',
    clayTench: 'La tanche, enrobée d’argile avec du citron, cuit lentement dans le four. On casse l’argile à table, et tout le monde se penche.',
    clayBurbot: 'La lotte au cumin, sous sa croûte de terre : une chair ferme, un parfum qui rappelle les caravanes.',
    claySturgeon: 'L’esturgeon, c’est le roi de la rivière. À l’argile, avec citron et cumin, il se mérite et se partage.',
    zebuMilkJam: 'On la fait mijoter doucement, le lait de zébu devient une confiture blonde et épaisse. Sur du pain tiède, c’est un dessert.',
    turkeyEggCurd: 'Une crème onctueuse : l’œuf de dinde, les baies jaunes du Nord, un peu de sucre. Ingrid en tartine ses matins.',
    sorghumBerryPaste: 'Une pâte ferme d’airelles où le sorgho apporte du corps. On la coupe en carrés, on l’emporte en randonnée.',
    friedBleak: 'Des ablettes frites, croustillantes, qu’on mange avec les doigts au bord de l’eau, en comptant les prises.',
    marinatedBleak: 'Les ablettes marinées au citron, rangées dans leur pot : les petits poissons de rien du tout, enfin à l’honneur.',
    camelRug: 'Un tapis tissé de laine de dromadaire, chaud l’hiver, frais l’été. Les marchands du souk en demandent toujours un de plus.',
    camelBurnous: 'Un grand manteau à capuche en laine de dromadaire : il garde du vent, du sable et de la pluie.',
    barbaryShawl: 'Un châle léger de laine barbarine, aux franges un peu rebelles. On le noue en rentrant du marché.',
};
