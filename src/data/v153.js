// 1.53 : la cuisine du Grand Nord. Trois machines (poêle-four, chaudron de la taïga, sucrerie de baies) et quarante et une recettes,
// dont dix-sept dans les machines qui existent déjà (moulin, huilerie, alambic, sucrerie, fromagerie d'alpage, métier, scierie, forge, joaillerie, poissonnerie, glacier, pâtes).
// id, nom, machine, ingrédients, temps (s), niveau
export const RECIPES_153 = [
    // dans les machines existantes
    ['ryeFlour', 'Farine de seigle', 'mill', { rye: 3 }, 150, 60],
    ['seaBuckthornOil', 'Huile d’argousier', 'oilmill', { seaBuckthorn: 4 }, 300, 60],
    ['reindeerCheese', 'Fromage de renne', 'alpineDairy', { reindeerMilk: 3 }, 480, 60],
    ['grilledCheese', 'Fromage grillé aux chicoutais', 'alpineDairy', { reindeerCheese: 1, cloudberry: 1 }, 360, 60],
    ['reindeerKefir', 'Lait fermenté de renne', 'alpineDairy', { reindeerMilk: 2 }, 300, 60],
    ['cloudberryLiqueur', 'Liqueur de chicoutai', 'still', { cloudberry: 4, sugar: 1, elderberry: 1 }, 440, 60],
    ['rowanSpirit', 'Eau-de-vie de sorbier', 'still', { rowan: 4 }, 440, 60],
    ['qiviutScarf', 'Écharpe en qiviut', 'loom', { qiviut: 3 }, 560, 60],
    ['qiviutHat', 'Bonnet en qiviut', 'loom', { qiviut: 2, cloth: 1 }, 500, 60],
    ['qiviutBlanket', 'Couverture en qiviut', 'loom', { qiviut: 4, cloth: 1 }, 620, 60],
    ['antlerCarving', 'Bois de renne gravé', 'sawmill', { antler: 2, wood: 2 }, 300, 60],
    ['antlerKnife', 'Couteau à manche de bois de renne', 'forge', { antler: 1, stone: 3, wood: 1 }, 360, 60],
    ['antlerPendant', 'Pendentif en bois de renne', 'jewelry', { antler: 1, nugget: 1 }, 400, 60],
    ['spruceSyrup', 'Sirop d’épicéa', 'sugarmill', { spruce: 4, sugar: 1, crabapple: 1 }, 340, 60],
    ['gravlax', 'Gravlax à l’épicéa', 'fishmonger', { salmon: 2, sugar: 1, spruce: 1, juniper: 1 }, 420, 60],
    ['cloudberryIce', 'Glace au chicoutai', 'icecream', { cloudberry: 3, cream: 1, sugar: 1 }, 380, 60],
    ['ptarmiganPasta', 'Pâtes aux œufs de lagopède', 'pastaworks', { flour: 2, ptarmiganEgg: 2 }, 420, 60],
    // le poêle-four
    ['ryeBread', 'Pain de seigle noir', 'tiledStove', { ryeFlour: 3 }, 300, 60],
    ['karelianPie', 'Tarte de Carélie', 'tiledStove', { ryeFlour: 2, rice: 2, butter: 1 }, 360, 60],
    ['pulla', 'Pulla à la cardamome', 'tiledStove', { flour: 2, cardamom: 1, butter: 1, milk: 1, cembro: 1 }, 400, 60],
    ['seedRye', 'Pain de seigle aux graines', 'tiledStove', { ryeFlour: 2, sunflower: 2, cembro: 1 }, 320, 60],
    ['nordicFlat', 'Pain plat nordique', 'tiledStove', { ryeFlour: 1, flour: 1, reindeerMilk: 1 }, 280, 60],
    ['lingonPastry', 'Pâtisserie aux airelles', 'tiledStove', { flour: 2, lingonberry: 2, butter: 1, birdCherry: 1 }, 380, 60],
    ['cloudberryTart', 'Tarte au chicoutai', 'tiledStove', { flour: 2, cloudberry: 3, sugar: 1, birdCherry: 1 }, 420, 60],
    ['ryeCookies', 'Biscuits de seigle au miel', 'tiledStove', { ryeFlour: 2, honey: 1, butter: 1, cardamom: 1, birdCherry: 1 }, 320, 60],
    ['eggPie', 'Tourte aux œufs de lagopède', 'tiledStove', { ryeFlour: 2, ptarmiganEgg: 2, butter: 1 }, 400, 60],
    // le chaudron de la taïga
    ['salmonSoup', 'Soupe de saumon', 'taigaPot', { salmon: 1, potato: 2, cream: 1, juniper: 1 }, 480, 60],
    ['mushroomSoup', 'Soupe de champignons des bois', 'taigaPot', { mushroom: 3, onion: 1, cream: 1 }, 440, 60],
    ['ryePorridge', 'Bouillie de seigle', 'taigaPot', { rye: 2, reindeerMilk: 1 }, 360, 60],
    ['lingonSoup', 'Soupe d’airelles', 'taigaPot', { lingonberry: 3, sugar: 1, ryeFlour: 1, aronia: 1 }, 420, 60],
    ['lingonStew', 'Ragoût de bœuf aux airelles', 'taigaPot', { beef: 1, lingonberry: 2, onion: 1, potato: 1, juniper: 1 }, 600, 60],
    ['nordicOmelette', 'Omelette du Nord', 'taigaPot', { ptarmiganEgg: 3, butter: 1, mushroom: 1, cembro: 1 }, 360, 60],
    ['kalakukko', 'Kalakukko', 'taigaPot', { ryeFlour: 2, trout: 2, butter: 1 }, 540, 60],
    ['butterPotatoes', 'Pommes de terre au beurre', 'taigaPot', { potato: 3, butter: 1 }, 300, 60],
    // la sucrerie de baies
    ['cloudberryJam', 'Confiture de chicoutai', 'berryKettle', { cloudberry: 4, sugar: 2 }, 400, 60],
    ['lingonJelly', 'Gelée d’airelles', 'berryKettle', { lingonberry: 4, sugar: 2, crabapple: 1 }, 400, 60],
    ['buckthornLozenges', 'Pastilles d’argousier', 'berryKettle', { seaBuckthorn: 3, honey: 1, elderberry: 1 }, 340, 60],
    ['rowanJelly', 'Gelée de sorbier', 'berryKettle', { rowan: 4, sugar: 2, crabapple: 1 }, 400, 60],
    ['cloudberryCream', 'Crème de chicoutai', 'berryKettle', { cloudberry: 3, cream: 1, sugar: 1, cardamom: 1, aronia: 1 }, 420, 60],
    ['berryPaste', 'Pâte de baies', 'berryKettle', { lingonberry: 2, rowan: 2, sugar: 1, elderberry: 1 }, 380, 60],
    ['spruceCandy', 'Bonbons à l’épicéa', 'berryKettle', { spruce: 3, sugar: 2 }, 340, 60],
    ['buckthornHoney', 'Argousier au miel', 'berryKettle', { seaBuckthorn: 3, honey: 2, aronia: 1 }, 360, 60],
];
// les trois machines : id, nom, niveau, prix, chantier qui les ouvre
export const MACHINES_153 = [
    ['tiledStove', 'Poêle-four', 60, 190000, 'northStove'],
    ['taigaPot', 'Chaudron de la taïga', 60, 230000, 'northStable'],
    ['berryKettle', 'Sucrerie de baies', 60, 270000, 'northGreenhouse'],
];
