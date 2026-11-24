// Source de vérité unique des niveaux de déblocage de Meuh (échelle 1 à 80).
// Remplace les 5 couches historiques en cascade (levels14 → levels18 → levels60 → levels64 → applyLevels80).
// Pour changer le niveau d’un produit, d’un animal, d’une machine ou d’une recette, modifier uniquement ce fichier,
// puis vérifier la cohérence avec : node tools/dev/check-levels.mjs
import { LEGACY_LEVELS } from './legacy-levels.js';

export const LEVELS = {
    // ---------------- Cultures et arbres (reqLvl) ----------------
    items: {
        // Niv. 1 — Safran, Blé
        saffron: 1, wheat: 1,
        // Niv. 2 — Carotte, Radis
        carrot: 2, radish: 2,
        // Niv. 4 — Compost, Tomate
        fertilizer: 4, tomato: 4,
        // Niv. 5 — Salade
        lettuce: 5,
        // Niv. 6 — Betterave sucrière, Maïs, Oignon, Ration d’engraissement
        beet: 6, corn: 6, onion: 6, ration: 6,
        // Niv. 8 — Pomme de terre, Navet
        potato: 8, turnip: 8,
        // Niv. 9 — Petits pois, Épinards, Tournesol
        peas: 9, spinach: 9, sunflower: 9,
        // Niv. 10 — Pomme, Concombre, Fève
        apple: 10, cucumber: 10, favaBean: 10,
        // Niv. 11 — Haricots verts
        greenBean: 11,
        // Niv. 12 — Coton, Lavande, Poivron, Fraise
        cotton: 12, lavender: 12, pepper: 12, strawberry: 12,
        // Niv. 13 — Poireau
        leek: 13,
        // Niv. 14 — Panais
        parsnip: 14,
        // Niv. 15 — Basilic, Ail, Poire
        basil: 15, garlic: 15, pear: 15,
        // Niv. 16 — Cerises, Aubergine, Rhubarbe
        cherry: 16, eggplant: 16, rhubarb: 16,
        // Niv. 17 — Lin, Échalote
        flax: 17, shallot: 17,
        // Niv. 18 — Lentilles, Framboises, Courgette
        lentil: 18, raspberry: 18, zucchini: 18,
        // Niv. 19 — Kiwi, Citron, Citrouille
        kiwi: 19, lemon: 19, pumpkin: 19,
        // Niv. 20 — Sarrasin
        buckwheat: 20,
        // Niv. 21 — Chou
        cabbage: 21,
        // Niv. 22 — Brocoli, Moutarde
        broccoli: 22, mustard: 22,
        // Niv. 23 — Melon, Mirabelles
        melon: 23, mirabelle: 23,
        // Niv. 24 — Chou-fleur, Riz
        cauliflower: 24, rice: 24,
        // Niv. 25 — Noisette, Menthe
        hazelnut: 25, mint: 25,
        // Niv. 26 — Asperge, Avoine
        asparagus: 26, oat: 26,
        // Niv. 27 — Abricot, Orange
        apricot: 27, orange: 27,
        // Niv. 28 — Champignons, Soja
        mushroom: 28, soy: 28,
        // Niv. 29 — Chanvre, Quetsches
        hemp: 29, plum: 29,
        // Niv. 30 — Artichaut, Thé
        artichoke: 30, tea: 30,
        // Niv. 31 — Chicorée, Pêche
        chicory: 31, peach: 31,
        // Niv. 32 — Raisin, Coing
        grape: 32, quince: 32,
        // Niv. 33 — Houblon, Pastèque
        hop: 33, watermelon: 33,
        // Niv. 34 — Pois chiche
        chickpea: 34,
        // Niv. 35 — Orge, Fèves de cacao, Figue, Mandarines
        barley: 35, cacao: 35, fig: 35, mandarin: 35,
        // Niv. 36 — Butternut, Piment d’Espelette
        butternut: 36, espelette: 36,
        // Niv. 37 — Canne à sucre
        sugarcane: 37,
        // Niv. 39 — Myrtilles, Pamplemousses
        blueberry: 39, grapefruit: 39,
        // Niv. 40 — Banane, Mûres, Noix de coco, Ananas, Patate douce, Noix
        banana: 40, blackberry: 40, coconut: 40, pineapple: 40, sweetPotato: 40, walnut: 40,
        // Niv. 41 — Café vert, Citron vert, Mangue, Fruit de la passion, Fleur de tiaré, Vanille
        greenCoffee: 41, lime: 41, mango: 41, passionFruit: 41, tiare: 41, vanilla: 41,
        // Niv. 43 — Châtaigne, Olives
        chestnut: 43, olive: 43,
        // Niv. 45 — Amande
        almond: 45,
        // Niv. 46 — Poivre noir
        peppercorn: 46,
        // Niv. 47 — Cassis, Grenades
        blackcurrant: 47, pomegranate: 47,
        // Niv. 48 — Endive, Pistaches
        endive: 48, pistachio: 48,
        // Niv. 49 — Manioc
        cassava: 49,
        // Niv. 54 — Gingembre
        ginger: 54,
        // Niv. 56 — Papaye
        papaya: 56,
        // Niv. 57 — Avocat
        avocado: 57,
        // Niv. 58 — Goyave
        guava: 58,
        // Niv. 59 — Génépi, Taro
        genepi: 59, taro: 59,
        // Niv. 60 — Litchi
        lychee: 60,
        // Niv. 61 — Fruits du dragon
        dragonfruit: 61,
        // Niv. 62 — Orchidée, Curcuma
        orchid: 62, turmeric: 62,
        // Niv. 63 — Noix de cajou
        cashew: 63,
        // Niv. 64 — Arachide
        peanut: 64,
        // Niv. 65 — Piment des îles, Haricot rouge
        islandChili: 65, redBean: 65,
        // Niv. 66 — Aloe vera
        aloe: 66,
        // Niv. 68 — Hibiscus
        hibiscus: 68,
        // Niv. 69 — Patchouli
        patchouli: 69,
        // Niv. 70 — Coriandre, Cumin, Datte, Jujube, Kaki, Sésame, Sorgho
        coriander: 70, cumin: 70, date: 70, jujube: 70, kaki: 70, sesame: 70, sorghum: 70,
        // Niv. 71 — Bigarade, Caroubes, Gousses de tamarin
        bitterOrange: 71, carob: 71, tamarind: 71,
        // Niv. 72 — Fruits d’argan, Mûres blanches
        argan: 72, mulberry: 72,
        // Niv. 73 — Figues de Barbarie
        pricklyPear: 73,
        // Niv. 74 — Cédrats
        citron: 74,
        // Niv. 75 — Chicoutai, Airelles, Seigle
        cloudberry: 75, lingonberry: 75, rye: 75,
        // Niv. 76 — Baies de merisier, Pommettes
        birdCherry: 76, crabapple: 76,
        // Niv. 77 — Baies de sorbier, Baies d’argousier, Pousses d’épicéa
        rowan: 77, seaBuckthorn: 77, spruce: 77,
        // Niv. 78 — Pignons de cembro, Baies de genièvre
        cembro: 78, juniper: 78,
        // Niv. 79 — Baies de sureau
        elderberry: 79,
        // Niv. 80 — Baies d’aronia et Les Terres d’Asie
        aronia: 80, lotus: 80, bambooShoot: 80, shiitake: 80, bokChoy: 80, yuzu: 80, ume: 80, kumquat: 80, nashi: 80, longan: 80, ginkgo: 80,
    },

    // ---------------- Animaux (reqLvl) ----------------
    animals: {
        // Niv. 2 — Poule
        chicken: 2,
        // Niv. 4 — Canard
        duck: 4,
        // Niv. 7 — Mouton
        sheep: 7,
        // Niv. 11 — Lapin
        rabbit: 11,
        // Niv. 12 — Oie
        goose: 12,
        // Niv. 14 — Caille
        quail: 14,
        // Niv. 16 — Pigeon
        pigeon: 16,
        // Niv. 18 — Vache
        cow: 18,
        // Niv. 21 — Ruche d’élevage
        bees: 21,
        // Niv. 23 — Dinde
        turkey: 23,
        // Niv. 24 — Chèvre
        goat: 24,
        // Niv. 27 — Cheval
        horse: 27,
        // Niv. 31 — Brebis laitière
        ewe: 31,
        // Niv. 33 — Cochon
        pig: 33,
        // Niv. 37 — Pintade
        guinea: 37,
        // Niv. 41 — Chèvre angora
        mohairGoat: 41,
        // Niv. 44 — Faisan
        pheasant: 44,
        // Niv. 47 — Ânesse
        donkey: 47,
        // Niv. 49 — Paon
        peacock: 49,
        // Niv. 53 — Bufflonne
        buffalo: 53,
        // Niv. 59 — Autruche
        ostrich: 59,
        // Niv. 62 — Yack
        yak: 62,
        // Niv. 66 — Alpaga
        alpaca: 66,
        // Niv. 73 — Mouton barbarin, Dromadaire, Zébu
        barbarySheep: 73, dromedary: 73, zebu: 73,
        // Niv. 77 — Bœuf musqué, Renne
        muskox: 77, reindeer: 77,
        // Niv. 78 — Lagopède
        ptarmigan: 78,
        // Niv. 80 — Cerf sika, Ver à soie, Poule soie
        sika: 80, silkworm: 80, silkie: 80,
    },

    // ---------------- Machines / ateliers (reqLvl) ----------------
    machines: {
        // Niv. 2 — Four à pain
        bakery: 2,
        // Niv. 3 — Moulin
        mill: 3,
        // Niv. 6 — Scierie
        sawmill: 6,
        // Niv. 8 — Marmite
        marmite: 8,
        // Niv. 9 — Huilerie
        oilmill: 9,
        // Niv. 10 — Cuisine
        kitchen: 10,
        // Niv. 11 — Forge
        forge: 11,
        // Niv. 12 — Métier à tisser
        loom: 12,
        // Niv. 13 — Fumoir
        smokehouse: 13,
        // Niv. 14 — Poissonnerie
        fishmonger: 14,
        // Niv. 15 — Pressoir
        press: 15,
        // Niv. 16 — Saloir
        saloir: 16,
        // Niv. 17 — Pâtisserie
        pastry: 17,
        // Niv. 18 — Fourneau
        stove: 18,
        // Niv. 19 — Comptoir froid
        deli: 19,
        // Niv. 20 — Atelier de couture
        tailor: 20,
        // Niv. 21 — Laiterie
        dairy: 21,
        // Niv. 22 — Crêperie
        crepery: 22,
        // Niv. 23 — Poterie
        pottery: 23,
        // Niv. 24 — Savonnerie
        soapworks: 24,
        // Niv. 25 — Séchoir à fruits
        dryer: 25,
        // Niv. 26 — Confiserie
        confectionery: 26,
        // Niv. 27 — Atelier de pâtes
        pastaworks: 27,
        // Niv. 28 — Pizzeria
        pizzeria: 28,
        // Niv. 29 — Glacier
        icecream: 29,
        // Niv. 30 — Joaillerie
        jewelry: 30,
        // Niv. 31 — Conserverie
        cannery: 31,
        // Niv. 32 — Comptoir
        counter: 32,
        // Niv. 33 — Brasserie
        brewery: 33,
        // Niv. 35 — Chocolaterie
        chocolatier: 35,
        // Niv. 36 — Malterie
        malthouse: 36,
        // Niv. 37 — Alambic
        still: 37,
        // Niv. 40 — Bar à jus
        juiceBar: 40,
        // Niv. 41 — Pâtisserie des îles
        islandBakery: 41,
        // Niv. 44 — Rhumerie
        rumDistillery: 44,
        // Niv. 49 — Sellerie
        saddlery: 49,
        // Niv. 52 — Teinturerie
        dyeworks: 52,
        // Niv. 54 — Parfumerie
        perfumery: 54,
        // Niv. 56 — Fromagerie d’alpage
        alpineDairy: 56,
        // Niv. 60 — Cuverie
        winery: 60,
        // Niv. 65 — Sucrerie
        sugarmill: 65,
        // Niv. 68 — Emballerie
        emballerie: 68,
        // Niv. 70 — Four en terre
        earthOven: 70,
        // Niv. 72 — Tajine
        tajine: 72,
        // Niv. 73 — Confiserie orientale
        orientalSweets: 73,
        // Niv. 75 — Poêle-four
        tiledStove: 75,
        // Niv. 77 — Chaudron de la taïga
        taigaPot: 77,
        // Niv. 79 — Sucrerie de baies
        berryKettle: 79,
        // Niv. 80 — Wok de fonte, Panier vapeur, Atelier de douceurs d’Asie
        wok: 80, steamer: 80, wagashi: 80,
    },

    // ---------------- Décorations (reqLvl) ----------------
    decos: {
        // Niv. 1 — Ancre marine, Brouette de pommes, Fanion de la saison de la brasserie, Fanion de la saison des chevaux, Fanion de la saison du miel, Fanion de la saison de la mine, Fanion de la saison du Grand Nord, Fanion de la saison de l’oasis, Fanion de la saison des parfums, Fanion de la saison du textile, Fanion de la saison d’Asie, Jonque miniature, Table du banquet, Médaille géante, Fût de la brasserie, Statue du taureau, Tour du château, Pupitre à champagne, Meule d’or, Grande cloche, Lapin de Pâques, Lanterne à lucioles, Poisson trophée, Vache dorée, Livre d’or, Ruche dorée, Hamac des îles, Tonneau d’honneur, Rosette du concours, Girouette cheval, Citrouille-lanterne, Lanterne, Mannequin de couture, Wagonnet de la mine, Chalet miniature, Phare miniature, Locomotive miniature, Banc des voisins, Enseigne du comptoir, Traîneau du Grand Nord, Pressoir ancien, Balançoire du verger, Orchidée de la serre, Fontaine parfumée, Four à pizza, Obstacle de concours, Podium, Lanterne du souk, Statue dorée, Barrière blanche, Sapin de Noël
        anchorDeco: 1, appleCart: 1, asiaJunkDeco: 1, bannerAsie: 1, bannerBrasserie: 1, bannerHaras: 1, bannerMiel: 1, bannerMine: 1, bannerNord: 1, bannerOasis: 1, bannerParfums: 1, bannerTextile: 1, banquetTable: 1, bigMedal: 1, brewBarrel: 1, bullStatue: 1, castleTower: 1, champagneRack: 1, cheeseWheel: 1, cowbell: 1, easterBunny: 1, fireflyJar: 1, fishTrophy: 1, goldCow: 1, goldenBook: 1, goldenHive: 1, hammock: 1, honorBarrel: 1, horseRosette: 1, horsevane: 1, jackLantern: 1, lantern: 1, mannequin: 1, minecart: 1, miniChalet: 1, miniLighthouse: 1, miniLoco: 1, neighborBench: 1, neonSign: 1, northSled: 1, oldPress: 1, orchardSwing: 1, orchidPot: 1, perfumeFountain: 1, pizzaOven: 1, showjump: 1, showpodium: 1, souqLantern: 1, statue: 1, whitefence: 1, xmasTree: 1,
        // Niv. 5 — Nichoir
        birdhouse: 5,
        // Niv. 7 — Parterre de fleurs
        flowers: 7,
        // Niv. 8 — Paratonnerre
        lightningRod: 8,
        // Niv. 9 — Épouvantail
        scarecrow: 9,
        // Niv. 12 — Ruche
        hive: 12,
        // Niv. 13 — Puits
        well: 13,
        // Niv. 14 — Mare aux canards
        duckPond: 14,
        // Niv. 17 — Nain de jardin
        gnome: 17,
        // Niv. 18 — Nichoir à chouette
        owlBox: 18,
        // Niv. 19 — Moulin miniature
        miniMill: 19,
        // Niv. 24 — Arche fleurie
        flowerArch: 24,
        // Niv. 26 — Cloche de cuivre
        copperBell: 26,
        // Niv. 28 — Banc de chêne
        oakBench: 28,
        // Niv. 30 — Lanterne de fer
        ironLamp: 30,
    },

    // ---------------- Améliorations (reqLvl) ----------------
    upgrades: {
        // Niv. 6 — Engrais magique
        speed: 6,
        // Niv. 11 — Négociation
        price: 11,
        // Niv. 14 — Mangeoire automatique
        feeder: 14,
        // Niv. 16 — Semoir
        seeder: 16,
        // Niv. 17 — Abondance
        yield: 17,
        // Niv. 24 — Moissonneuse
        harvester: 24,
        // Niv. 28 — Plan du champ
        plan: 28,
    },

    // ---------------- Recettes d’ateliers (lvl) ----------------
    recipes: {
        // Niv. 2
        bread: 2,
        // Niv. 3
        feed: 3,
        // Niv. 4
        flour: 4,
        // Niv. 6
        baguette: 6, beam: 6, cornmeal: 6, plank: 6, ration: 6, sugar: 6,
        // Niv. 8
        navarin: 8, turnipBaconTart: 8, turnipSoup: 8,
        // Niv. 9
        roastedSeeds: 9, starch: 9, sunflowerOil: 9,
        // Niv. 10
        favaBread: 10, favaFlour: 10, glazedTurnips: 10, omelette: 10, peasCarrots: 10, sauce: 10,
        // Niv. 11
        cornbread: 11, nail: 11, tools: 11,
        // Niv. 12
        chickenBasque: 12, cottonFabric: 12, down: 12, pineTorch: 12,
        // Niv. 13
        horseshoe: 13, smokedChicken: 13, smokedGudgeon: 13, smokedTrout: 13,
        // Niv. 14
        birchSyrup: 14, bleakFry: 14, cutStone: 14, grilledFish: 14, gudgeonFry: 14, parsnipMash: 14, pondFry: 14, quailHoney: 14, smokedQuailEggs: 14,
        // Niv. 15
        carrotJuice: 15, cloth: 15, jam: 15, juice: 15, lambGarlic: 15, smokedWhitefish: 15,
        // Niv. 16
        angoraYarn: 16, crayfishBisque: 16, duckConfit: 16, gooseConfit: 16, tenchHerbs: 16,
        // Niv. 17
        cookies: 17, easterCake: 17, parsnipCake: 17, pie: 17, pigeonPastilla: 17, shallotFougasse: 17, smokedSquab: 17, spongeCake: 17,
        // Niv. 18
        birchGingerbread: 18, copperIngot: 18, garlicSoup: 18, ironIngot: 18, linen: 18, moussaka: 18, potAuFeu: 18,
        // Niv. 19
        crate: 19, gazpacho: 19, gooseRillettes: 19, gudgeonLemon: 19, lemonade: 19, quailSalad: 19, salad: 19, smokedPike: 19, smokedSalmon: 19, whitefishTartare: 19, zanderLeeks: 19,
        // Niv. 20
        buckwheatFlour: 20, burbotCider: 20, cevapi: 20, cider: 20, ironPan: 20, pochouse: 20, salmonSteak: 20, strawHat: 20, sweater: 20, woolSocks: 20,
        // Niv. 21
        buckwheatSalad: 21, butter: 21, cheese: 21, copperPot: 21, featherDuster: 21, lemonTart: 21, poachedPigeonEggs: 21, rabbitTerrine: 21, ratatouille: 21, rhubarbTart: 21, salmonTartare: 21, shallotButter: 21, shallotTatin: 21, spinachQuiche: 21, whitefishMeuniere: 21,
        // Niv. 22
        angoraMittens: 22, broccoliQuiche: 22, cherryPie: 22, forgeLantern: 22, gooseLegApples: 22, kiwiJuice: 22, lemonCrepe: 22, mustardSauce: 22, quailGalette: 22, raspberryCrepe: 22, solidOak: 22, spinachGalette: 22, squabPeas: 22, syrupCrepe: 22, weathervane: 22,
        // Niv. 23
        angoraBlanket: 23, broccoliSoup: 23, clayBowl: 23, crayfishGratin: 23, cream: 23, crepes: 23, driedMagret: 23, fishSoup: 23, flowerPot: 23, pondTerrine: 23, scarf: 23, whitefishLeek: 23,
        // Niv. 24
        cauliflowerGratin: 24, cauliflowerPie: 24, crystalVase: 24, eelGreen: 24, fishFritters: 24, kidPie: 24, lavenderSoap: 24, pearJuice: 24, quiche: 24, resinCandle: 24, royalSoap: 24, smokedTurkey: 24, teaTowel: 24,
        // Niv. 25
        catfishBeurreBlanc: 25, caviar: 25, favaPuree: 25, hazelnutOil: 25, kidMint: 25, lentilSalad: 25, parsnipChips: 25, prunes: 25, smokedCatfish: 25, smokedEel: 25, smokedSturgeon: 25, stuffedCabbage: 25, taboule: 25, tshirt: 25,
        // Niv. 26
        candyApple: 26, caramel: 26, friedBleak: 26, goldfishMobile: 26, gratin: 26, kiwiJam: 26, lavenderBag: 26, mustardOil: 26, oatBread: 26, oatCookies: 26, oatFlakes: 26, oatFlour: 26, oatGalette: 26, pillow: 26, popcorn: 26, porridge: 26, radishButter: 26, royalCandy: 26,
        // Niv. 27
        broccoliPasta: 27, cottonThread: 27, driedApricot: 27, honeyPot: 27, lambLasagna: 27, lasagna: 27, linenShirt: 27, linseedOil: 27, mirabelleTart: 27, pasta: 27, peasFrench: 27, pistou: 27, quilt: 27, rhubarbJam: 27, risotto: 27, saffronRisotto: 27,
        // Niv. 28
        chickenCream: 28, driedBeef: 28, fruitCandy: 28, marinatedBleak: 28, pigeonPie: 28, pizza: 28, pizzaVeggie: 28, pumpkinPie: 28, saffronBrioche: 28, soup: 28, soyMilk: 28, soyOil: 28, waffles: 28,
        // Niv. 29
        driedPlums: 29, espadrilles: 29, gingerbread: 29, hempBag: 29, hempBread: 29, hempCloth: 29, hempOil: 29, hempRope: 29, hempSoap: 29, honeyIce: 29, magretPlums: 29, plumJam: 29, plumTart: 29, raspberrySorbet: 29, strawberryIce: 29, toastedHemp: 29, yogurt: 29, yuleLog: 29,
        // Niv. 30
        amethystRing: 30, carpStew: 30, croissant: 30, eelMatelote: 30, goldLocket: 30, hazelnutIce: 30, marshmallow: 30, mash: 30, mintIce: 30, potee: 30, quartzPendant: 30, ricePudding: 30, silverIngot: 30, tofu: 30, tzatziki: 30, witchCandy: 30,
        // Niv. 31
        brioche: 31, buche: 31, canFavaBeans: 31, goldIngot: 31, madeleines: 31, perchMeuniere: 31, perfume: 31, pickledTurnips: 31, pikeTerrine: 31, rhubarbCompote: 31, rubyBrooch: 31, sugarEggs: 31, tatin: 31,
        // Niv. 32
        brousse: 32, chicoryCake: 32, flamiche: 32, grapeJuice: 32, greenTea: 32, leekVeloute: 32, peaVeloute: 32, roastedChicory: 32, sobacha: 32, strawberryCake: 32, sushi: 32, tableWine: 32, wheyBread: 32, wheySoap: 32,
        // Niv. 33
        amberBeer: 33, apricotJam: 33, blondBeer: 33, driedPear: 33, munster: 33, orangeJuice: 33, piccalilli: 33, quailGrapes: 33, quinceJelly: 33, quincePaste: 33, ravioli: 33, sapphirePendant: 33, shallotConfit: 33,
        // Niv. 34
        chickpeaFlour: 34, drySausage: 34, falafel: 34, frisee: 34, ham: 34, lardons: 34, pickles: 34, pikeQuenelles: 34, pizzaReine: 34, rabbitMustard: 34, roastedChickpeas: 34, silverCutlery: 34, vegCouscous: 34,
        // Niv. 35
        blackTea: 35, calzone: 35, chocMandarins: 35, darkChoc: 35, driedFig: 35, goldenBell: 35, goldfishBowl: 35, goosePasta: 35, orangeTea: 35, quailTerrine: 35, rabbitPrunes: 35, raspberryTea: 35, rubyRing: 35, sapphireRing: 35,
        // Niv. 36
        apricotJuice: 36, apricotTart: 36, asparagusMousseline: 36, asparagusVeloute: 36, cannedBeans: 36, cantal: 36, fossilBrooch: 36, hempTisane: 36, maltAmber: 36, maltBlond: 36, mandarinCake: 36, mandarinMarmalade: 36, melonIce: 36, piperade: 36,
        // Niv. 37
        butternutCompote: 37, butternutGnocchi: 37, butternutSoup: 37, butternutTart: 37, calvados: 37, espelettePowder: 37, maltBrown: 37, marmalade: 37, mirabelleBrandy: 37, pearBrandy: 37, sheepTomme: 37,
        // Niv. 38
        emeraldBrooch: 38, espeletteHam: 38, galetteComplete: 38, guineaCider: 38, guineaMimosa: 38, guineaOmelette: 38, guineaRillettes: 38, kiwiSorbet: 38, lemonTea: 38, mintTea: 38, smokedGuinea: 38,
        // Niv. 39
        apricotTea: 39, emeraldRing: 39, goatCheese: 39, grapefruitMarmalade: 39, grapefruitSorbet: 39, grapefruitTart: 39, maltBlack: 39, mandarinTea: 39, milkTea: 39, mushroomOmelette: 39, mushroomRisotto: 39, radishPickles: 39, sheepYogurt: 39, stuffedCarp: 39, sundae: 39,
        // Niv. 40
        blueberryTea: 40, candle: 40, chicoryMilk: 40, coconutMilk: 40, favaGoatSalad: 40, goatSoap: 40, guineaCabbage: 40, milkChoc: 40, redInfusion: 40, scentedCandle: 40, summerPunch: 40, waxBalm: 40,
        // Niv. 41
        asparagusJar: 41, blackberryIce: 41, blackberryJam: 41, blackberryJuice: 41, blackberryTart: 41, coconutFlan: 41, coppa: 41, islandCocktail: 41, limePie: 41, pizzaGoatHoney: 41, pizzaHawaii: 41, valencay: 41, vanillaIce: 41,
        // Niv. 42
        hazelnutSpread: 42, hornComb: 42, limoncello: 42, mohairPlush: 42, mohairScarf: 42, mohairSweater: 42, mohairYarn: 42, quinceRatafia: 42, raspberryLiqueur: 42, roquefort: 42, snapperLime: 42, spreadCrepe: 42, truffleBrie: 42,
        // Niv. 43
        barleyCoffee: 43, calvadosCrepe: 43, fruitPaste: 43, fruitSalad: 43, hornCardigan: 43, hornKnife: 43, oliveOil: 43, peachNectar: 43, peachSorbet: 43, peachTart: 43, pondRillettes: 43, whiteTea: 43,
        // Niv. 44
        arrangedRum: 44, blackberryLiqueur: 44, cherryBeer: 44, hummus: 44, icedTea: 44, kidOlives: 44, lavenderTea: 44, mackerelRillettes: 44, melonSorbet: 44, mohairPlaid: 44, plumBrandy: 44, rum: 44, socca: 44, stirTofu: 44, watermelonJuice: 44,
        // Niv. 45
        barleyLatte: 45, bouillabaisse: 45, cannedShrimp: 45, chicoryCoffee: 45, figJam: 45, goldScalePendant: 45, mead: 45, pheasantApples: 45, pheasantScramble: 45, pizzaTurkeyEgg: 45, smokedPheasant: 45, truffleTagliatelle: 45,
        // Niv. 46
        almondMilk: 46, chocAlmonds: 46, galetteRois: 46, grapefruitJuice: 46, mackerelWine: 46, magretFigs: 46, mandarinJuice: 46, matchaLatte: 46, pepperCheese: 46, pepperMagret: 46, pepperSaucisson: 46, pheasantPate: 46, praline: 46,
        // Niv. 47
        blackcurrantJelly: 47, blackcurrantSorbet: 47, blackcurrantTart: 47, cassisCream: 47, cassisPastilles: 47, cassoulet: 47, choucroute: 47, coconutOil: 47, grilledMackerel: 47, lobsterArmoricaine: 47, lobsterBisque: 47, lobsterDish: 47, pizzaCrayfish: 47,
        // Niv. 48
        endiveHam: 48, endiveSalad: 48, endiveTart: 48, grenadine: 48, magretPomegranate: 48, paella: 48, pistachioFinancier: 48, pistachioIce: 48, pistachioNougat: 48, pistachioOil: 48, pomegranateJuice: 48, pomegranateSorbet: 48, roastedPistachios: 48,
        // Niv. 49
        bakedBream: 49, breamCeviche: 49, cannedTuna: 49, friedSquid: 49, grilledOctopus: 49, grilledTuna: 49, hempLead: 49, herbBream: 49, shoeIron: 49, skateBlackButter: 49, skateMustard: 49, skateSoup: 49, squidSalad: 49, stuffedSquid: 49,
        // Niv. 50
        blueberryPie: 50, grilledSpinyLobster: 50, mahiPineapple: 50, muffins: 50, octopusOil: 50, octopusProvencale: 50, octopusSalad: 50, shoeSilver: 50, snapperCeviche: 50, spinyBisque: 50, vanillaSpinyLobster: 50,
        // Niv. 51
        blueberryIce: 51, blueberryJuice: 51, coffee: 51, espresso: 51, mahiPoke: 51, melonJam: 51, peeledTomatoes: 51, petitSale: 51, saucisson: 51, seabassSalt: 51, soySauce: 51, truffleOmelette: 51, walnutCake: 51,
        // Niv. 52
        blueDye: 52, chestnutCream: 52, colorSweater: 52, dyedWool: 52, nicoise: 52, redDye: 52, smokedMahi: 52, teaSet: 52, vanillaFlan: 52, vase: 52, walnutOil: 52, woolHat: 52, yellowDye: 52,
        // Niv. 53
        artichokeTart: 53, dyedMohair: 53, garlicBread: 53, garlicPasta: 53, hotChoc: 53, melonHam: 53, mozzarella: 53, oliveSoap: 53, passionSorbet: 53, pesto: 53, sweetPotatoCake: 53, tiareTea: 53, trailMix: 53,
        // Niv. 54
        blanquette: 54, brush: 54, cappuccino: 54, cremeAnglaise: 54, cremeBrulee: 54, focaccia: 54, hamSandwich: 54, lavenderWater: 54, marronsGlaces: 54, ossobuco: 54, pissaladiere: 54, summerPerfume: 54, tian: 54, turkeyChestnut: 54, vitello: 54,
        // Niv. 55
        cannedSardines: 55, chocCake: 55, grandParfum: 55, hazelnutCoffee: 55, limeade: 55, macchiato: 55, mangoChutney: 55, pineappleCake: 55, truffleOil: 55, vanillaLatte: 55, vanillaPerfume: 55,
        // Niv. 56
        accras: 56, barigoule: 56, beaufort: 56, camembert: 56, candiedPapaya: 56, cannedArtichoke: 56, eggplantCaviar: 56, fondue: 56, paintedVase: 56, papayaSmoothie: 56, royalCream: 56, sweetPotatoMash: 56, tomme: 56,
        // Niv. 57
        bananaBread: 57, bananaSmoothie: 57, bridle: 57, burrata: 57, caprese: 57, coconutCoffee: 57, coconutCurry: 57, pineappleJuice: 57, quillPen: 57, saddleDress: 57, saddleJump: 57, saddleRace: 57, viennois: 57,
        // Niv. 58
        belleHelene: 58, bubbleTea: 58, cassavaCakes: 58, coconutRocks: 58, coconutRope: 58, gingerTea: 58, icedCaramel: 58, mahiTacos: 58, ricotta: 58, roastChestnut: 58, saddlePad: 58, tunaPoke: 58, tunaTartare: 58,
        // Niv. 59
        affogato: 59, coffeeLiqueur: 59, donkeyShampoo: 59, donkeySoap: 59, frappe: 59, genepiLiqueur: 59, giantOmelette: 59, hairBrush: 59, lassi: 59, mangoJuice: 59, mangoPassion: 59, taroChips: 59, winterBlanket: 59,
        // Niv. 60
        donkeyCream: 60, driedOstrich: 60, giantPavlova: 60, grilledOstrich: 60, marcBrandy: 60, ostrichCarpaccio: 60, ostrichQuiche: 60, redWine: 60, roseWine: 60, taroCake: 60, taroCoconut: 60, taroFritters: 60,
        // Niv. 61
        blancManger: 61, champagneRose: 61, coconutIce: 61, coconutRice: 61, dhal: 61, dragonJuice: 61, dreamcatcher: 61, exoticSalad: 61, genepiTea: 61, grilledSardines: 61, lycheeTea: 61, mangoSorbet: 61, walnutWine: 61,
        // Niv. 62
        chai: 62, dragonSmoothie: 62, dragonSorbet: 62, exoticTartlet: 62, horsehairBrush: 62, islandCoffee: 62, lycheeSorbet: 62, mocha: 62, mulledWine: 62, orchidDried: 62, orchidPerfume: 62, orchidSoap: 62, whiteWine: 62,
        // Niv. 63
        driedYak: 63, goldenMilk: 63, guavaJuice: 63, pickledTurmeric: 63, reblochon: 63, turmericPowder: 63, yakCheese: 63, yakMomos: 63, yakStew: 63, yakTomme: 63, yakYogurt: 63, yellowRice: 63, zanderWine: 63,
        // Niv. 64
        cashewBrittle: 64, cashewButter: 64, cashewRice: 64, coconutSoap: 64, guacamole: 64, guavaPaste: 64, monoi: 64, peanutBrittle: 64, peanutButter: 64, peanutOil: 64, roastedCashews: 64, roastedPeanuts: 64, seabassTartare: 64,
        // Niv. 65
        avocadoShrimp: 65, beefBourguignon: 65, beetSyrup: 65, brownSugar: 65, caneSyrup: 65, chocBox: 65, chocPeanuts: 65, cognac: 65, cottonCandy: 65, pizzaSavoyarde: 65, plumedHat: 65, pralines: 65, winePears: 65,
        // Niv. 66
        alpacaScarf: 66, alpacaYarn: 66, canRedBeans: 66, chiliPowder: 66, creoleSnapper: 66, dorayaki: 66, eggsMeurette: 66, hotSauce: 66, kir: 66, redBeanPaste: 66, redBeanRice: 66, rougail: 66, spicedRum: 66,
        // Niv. 67
        aloeGel: 67, aloeSoap: 67, bleu: 67, cafeLatte: 67, chestnutCoffee: 67, coffeeBeans: 67, featherFan: 67, genepiChoc: 67, guavaSorbet: 67, pommeau: 67, spicedCoffee: 67, tiareCrown: 67, tiarePerfume: 67,
        // Niv. 68
        aloeLimeJuice: 68, alpineFlowerCheese: 68, bissap: 68, boxCagette: 68, boxPanier: 68, candiedGrapes: 68, driedHibiscus: 68, guineaWine: 68, hibiscusJam: 68, hibiscusSorbet: 68, hibiscusTea: 68, lycheeCocktail: 68, lycheeSyrup: 68, soothingCream: 68, tiramisu: 68,
        // Niv. 69
        boxFilet: 69, boxRuban: 69, grapeJelly: 69, patchouliCandle: 69, patchouliEssence: 69, patchouliPerfume: 69, patchouliSachet: 69, royalDyed: 69, royalShawl: 69, royalYarn: 69,
        // Niv. 70
        comte: 70, cuminBread: 70, dateCoffee: 70, datePaste: 70, driedKaki: 70, jujubeSyrup: 70, kakiSorbet: 70, pheasantTerrine: 70, pigeonTerrine: 70, pizzaFourCheese: 70, preservedLemon: 70, raclette: 70, sesameBread: 70, tartiflette: 70,
        // Niv. 71
        bitterMarmalade: 71, bitterOrangeTea: 71, boxCaisse: 71, boxTonnelet: 71, dateBread: 71, orangeBlossomWater: 71, pizzaSorghum: 71, sesameOil: 71, sorghumFlatbread: 71, tahini: 71,
        // Niv. 72
        alpacaBlanket: 72, bananasFlambe: 72, chakchouka: 72, champagne: 72, coconutPunch: 72, dateTea: 72, desertTea: 72, harissa: 72, jujubeTisane: 72, kakiSyrup: 72, pickledPheasantEggs: 72, poncho: 72, rasElHanout: 72, semolina: 72, strawWine: 72, vegTajine: 72,
        // Niv. 73
        boxMalle: 73, camelDate: 73, clayBurbot: 73, clayTench: 73, halva: 73, harira: 73, keftas: 73, kesra: 73, msemen: 73, nougat: 73, saffronMilk: 73, sesameMilk: 73,
        // Niv. 74
        batbout: 74, berberRug: 74, camelCheese: 74, camelCouscous: 74, caravanBlanket: 74, couscous: 74, dateTajine: 74, gazelleHorns: 74, lben: 74, lemonTajine: 74, makrout: 74, smen: 74,
        // Niv. 75
        baklava: 75, boxCloche: 75, chebakia: 75, cloudberryIce: 75, cloudberryInfusion: 75, honeyJujubes: 75, karelianPie: 75, lingonTisane: 75, loukoum: 75, pizzaZebu: 75, ryeBread: 75, ryeCoffee: 75, ryeFlour: 75, ryeKvas: 75, stuffedDates: 75,
        // Niv. 76
        boxEcrin: 76, camelRug: 76, claySturgeon: 76, cloudberryTart: 76, couscousRoyal: 76, lambApricot: 76, lingonPastry: 76, mechoui: 76, pastilla: 76, zebuSkewers: 76, zebuTajine: 76,
        // Niv. 77
        antlerCarving: 77, antlerKnife: 77, antlerPendant: 77, mushroomSoup: 77, nordicFlat: 77, qiviutBlanket: 77, qiviutHat: 77, qiviutScarf: 77, ryeCookies: 77, ryePorridge: 77, spruceSyrup: 77,
        // Niv. 78
        barbaryShawl: 78, butterPotatoes: 78, camelBurnous: 78, eggPie: 78, gravlax: 78, kalakukko: 78, lingonStew: 78, nordicOmelette: 78, ptarmiganPasta: 78, pulla: 78, salmonSoup: 78, seedRye: 78, tundraStew: 78,
        // Niv. 79
        buckthornHot: 79, buckthornLozenges: 79, cardamomMilk: 79, cloudberryJam: 79, cloudberryLiqueur: 79, grilledCheese: 79, lingonJelly: 79, reindeerCheese: 79, reindeerKefir: 79, rowanJelly: 79, rowanSpirit: 79, rowanTea: 79, seaBuckthornOil: 79, spruceTea: 79,
        // Niv. 80
        berryPaste: 80, buckthornHoney: 80, cloudberryCream: 80, juniperRoast: 80, lingonSoup: 80, nordPie: 80, ptarmiganCloudberry: 80, ptarmiganLingon: 80, ptarmiganSoup: 80, sorghumBerryPaste: 80, spruceCandy: 80, turkeyEggCurd: 80, zebuMilkJam: 80,
        // Niv. 80 — Les Terres d’Asie
        silkKimono: 80, silkiePillow: 80, silkieQuilt: 80, goldenSilkParasol: 80, goldenObi: 80, silkFan: 80, velvetCarving: 80, velvetElixir: 80, umeshu: 80, yuzuSorbet: 80, nashiCider: 80, velvetAmulet: 80, sikaTofuCheese: 80,
        bambooStirFry: 80, shiitakeNoodles: 80, lotusCrisps: 80, ginkgoRice: 80, bokChoyWok: 80, yuzuDuckWok: 80, fiveSpiceBeef: 80, shrimpLotusWok: 80, shiitakeTofuWok: 80, silkieFriedRice: 80,
        shiitakeBao: 80, lotusDimSum: 80, yuzuFishSteam: 80, custardSilkie: 80, umeOnigiri: 80, longanSteamedBun: 80, ginkgoBroth: 80, nashiSteamPear: 80, bokChoyDumplings: 80,
        yuzuMochi: 80, umeJelly: 80, kumquatConfit: 80, nashiTart: 80, longanPudding: 80, lotusMooncake: 80, ginkgoSweetSoup: 80, kumquatMochi: 80, starAniseCandies: 80,
        yuzuTea: 80, umeSoda: 80, lotusInfusion: 80, kumquatIcedTea: 80, sikaMatcha: 80, aniseChai: 80,
    },
};

// Applique les niveaux définitifs (et attache les anciens paliers de migration si présents).
export function applyLevels(kind, table, key = 'reqLvl') {
    const cur = LEVELS[kind] || {};
    const leg = LEGACY_LEVELS[kind] || {};
    for (const [id, l] of Object.entries(cur)) {
        const d = table[id];
        if (!d) continue;
        if (key === 'lvl' && (d.lvl !== l || leg[id] || d.base === undefined)) d.base = l;
        d[key] = l;
    }
    for (const [id, hist] of Object.entries(leg)) {
        const d = table[id];
        if (d) Object.assign(d, hist);
    }
}
