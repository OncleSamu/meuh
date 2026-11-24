// Source de vérité unique des niveaux de déblocage de Meuh (échelle 1 à 100).
// Remplace les couches historiques en cascade (levels14 → levels18 → levels60 → levels64 → lv80 → lv100).
// Pour changer le niveau d’un produit, d’un animal, d’une machine ou d’une recette, modifier uniquement ce fichier,
// puis vérifier la cohérence avec : node tools/dev/check-levels.mjs
import { LEGACY_LEVELS } from './legacy-levels.js';

export const LEVELS = {
    items: {
    // ---------------- Cultures et arbres (reqLvl) ----------------
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
        // Niv. 44 — Châtaigne, Olives
        chestnut: 44, olive: 44,
        // Niv. 47 — Amande
        almond: 47,
        // Niv. 48 — Poivre noir
        peppercorn: 48,
        // Niv. 49 — Cassis, Grenades
        blackcurrant: 49, pomegranate: 49,
        // Niv. 51 — Endive, Pistaches
        endive: 51, pistachio: 51,
        // Niv. 52 — Manioc
        cassava: 52,
        // Niv. 58 — Gingembre
        ginger: 58,
        // Niv. 61 — Papaye
        papaya: 61,
        // Niv. 63 — Avocat
        avocado: 63,
        // Niv. 64 — Goyave
        guava: 64,
        // Niv. 65 — Génépi, Taro
        genepi: 65, taro: 65,
        // Niv. 66 — Litchi
        lychee: 66,
        // Niv. 67 — Fruits du dragon
        dragonfruit: 67,
        // Niv. 68 — Orchidée, Curcuma
        orchid: 68, turmeric: 68,
        // Niv. 69 — Noix de cajou
        cashew: 69,
        // Niv. 70 — Arachide
        peanut: 70,
        // Niv. 71 — Piment des îles, Haricot rouge
        islandChili: 71, redBean: 71,
        // Niv. 72 — Aloe vera
        aloe: 72,
        // Niv. 74 — Hibiscus
        hibiscus: 74,
        // Niv. 75 — Patchouli
        patchouli: 75,
        // Niv. 76 — Coriandre, Cumin, Datte, Jujube, Kaki, Sésame…
        coriander: 76, cumin: 76, date: 76, jujube: 76, kaki: 76, sesame: 76, sorghum: 76,
        // Niv. 78 — Bigarade, Caroubes, Gousses de tamarin
        bitterOrange: 78, carob: 78, tamarind: 78,
        // Niv. 79 — Fruits d’argan, Mûres blanches
        argan: 79, mulberry: 79,
        // Niv. 80 — Figues de Barbarie
        pricklyPear: 80,
        // Niv. 82 — Cédrats
        citron: 82,
        // Niv. 83 — Chicoutai, Airelles, Seigle
        cloudberry: 83, lingonberry: 83, rye: 83,
        // Niv. 85 — Baies de merisier, Pommettes
        birdCherry: 85, crabapple: 85,
        // Niv. 86 — Baies de sorbier, Baies d’argousier, Pousses d’épicéa
        rowan: 86, seaBuckthorn: 86, spruce: 86,
        // Niv. 88 — Pignons de cembro, Baies de genièvre
        cembro: 88, juniper: 88,
        // Niv. 89 — Baies de sureau, Baies d’aronia
        elderberry: 89, aronia: 89,
        // Niv. 91 — Racine de lotus, Pousses de bambou, Shiitake, Pak choï
        lotus: 91, bambooShoot: 91, shiitake: 91, bokChoy: 91,
        // Niv. 92 — Yuzu, Prunes ume
        yuzu: 91, ume: 92,
        // Niv. 93 — Kumquats, Poires nashi
        kumquat: 93, nashi: 93,
        // Niv. 95 — Longanes
        longan: 95,
        // Niv. 96 — Noix de ginkgo
        ginkgo: 96,
    },

    animals: {
    // ---------------- Animaux (reqLvl) ----------------
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
        // Niv. 46 — Faisan
        pheasant: 46,
        // Niv. 49 — Ânesse
        donkey: 49,
        // Niv. 52 — Paon
        peacock: 52,
        // Niv. 57 — Bufflonne
        buffalo: 57,
        // Niv. 65 — Autruche
        ostrich: 65,
        // Niv. 68 — Yack
        yak: 68,
        // Niv. 72 — Alpaga
        alpaca: 72,
        // Niv. 80 — Mouton barbarin, Dromadaire, Zébu
        barbarySheep: 80, dromedary: 80, zebu: 80,
        // Niv. 86 — Bœuf musqué, Renne
        muskox: 86, reindeer: 86,
        // Niv. 88 — Lagopède
        ptarmigan: 88,
        // Niv. 94 — Cerf sika, Ver à soie
        sika: 94, silkworm: 94,
        // Niv. 95 — Poule soie
        silkie: 95,
    },

    machines: {
    // ---------------- Machines (reqLvl) ----------------
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
        // Niv. 46 — Rhumerie
        rumDistillery: 46,
        // Niv. 52 — Sellerie
        saddlery: 52,
        // Niv. 56 — Teinturerie
        dyeworks: 56,
        // Niv. 58 — Parfumerie
        perfumery: 58,
        // Niv. 61 — Fromagerie d’alpage
        alpineDairy: 61,
        // Niv. 66 — Cuverie
        winery: 66,
        // Niv. 71 — Sucrerie
        sugarmill: 71,
        // Niv. 74 — Emballerie
        emballerie: 74,
        // Niv. 76 — Four en terre
        earthOven: 76,
        // Niv. 79 — Tajine
        tajine: 79,
        // Niv. 80 — Confiserie orientale
        orientalSweets: 80,
        // Niv. 83 — Poêle-four
        tiledStove: 83,
        // Niv. 86 — Chaudron de la taïga
        taigaPot: 86,
        // Niv. 89 — Sucrerie de baies
        berryKettle: 89,
        // Niv. 91 — Wok de fonte
        wok: 91,
        // Niv. 94 — Panier vapeur
        steamer: 94,
        // Niv. 97 — Atelier de douceurs d’Asie
        wagashi: 97,
    },

    decos: {
    // ---------------- Décorations (reqLvl) ----------------
        // Niv. 1
        anchorDeco: 1, appleCart: 1, asiaJunkDeco: 1, bannerAsie: 1, bannerBrasserie: 1, bannerHaras: 1, bannerMiel: 1, bannerMine: 1, bannerNord: 1, bannerOasis: 1, bannerParfums: 1, bannerTextile: 1, banquetTable: 1, bigMedal: 1, brewBarrel: 1, bullStatue: 1, castleTower: 1, champagneRack: 1, cheeseWheel: 1, cowbell: 1, easterBunny: 1, fireflyJar: 1, fishTrophy: 1, goldCow: 1, goldenBook: 1, goldenHive: 1, hammock: 1, honorBarrel: 1, horseRosette: 1, horsevane: 1, jackLantern: 1, lantern: 1, mannequin: 1, minecart: 1, miniChalet: 1, miniLighthouse: 1, miniLoco: 1, museumCrystal: 1, museumFossil: 1, museumTrophy: 1, neighborBench: 1, neonSign: 1, northSled: 1, oldPress: 1, orchardSwing: 1, orchidPot: 1, perfumeFountain: 1, pizzaOven: 1, showjump: 1, showpodium: 1, souqLantern: 1, statue: 1, whitefence: 1, xmasTree: 1,
        // Niv. 5
        birdhouse: 5,
        // Niv. 7
        flowers: 7,
        // Niv. 8
        lightningRod: 8,
        // Niv. 9
        scarecrow: 9,
        // Niv. 12
        hive: 12,
        // Niv. 13
        well: 13,
        // Niv. 14
        duckPond: 14,
        // Niv. 17
        gnome: 17,
        // Niv. 18
        owlBox: 18,
        // Niv. 19
        miniMill: 19,
        // Niv. 24
        flowerArch: 24,
        // Niv. 26
        copperBell: 26,
        // Niv. 28
        oakBench: 28,
        // Niv. 30
        ironLamp: 30,
    },

    upgrades: {
    // ---------------- Améliorations (reqLvl) ----------------
        // Niv. 6
        speed: 6,
        // Niv. 11
        price: 11,
        // Niv. 14
        feeder: 14,
        // Niv. 16
        seeder: 16,
        // Niv. 17
        yield: 17,
        // Niv. 24
        harvester: 24,
        // Niv. 28
        plan: 28,
    },

    recipes: {
    // ---------------- Recettes (lvl) ----------------
        // Niv. 2
        bread: 2,
        // Niv. 3
        feed: 3,
        // Niv. 4
        flour: 4,
        // Niv. 6
        ration: 6, sugar: 6, cornmeal: 6, baguette: 6, plank: 6, beam: 6,
        // Niv. 8
        turnipSoup: 8, turnipBaconTart: 8, navarin: 8,
        // Niv. 9
        starch: 9, sunflowerOil: 9, roastedSeeds: 9,
        // Niv. 10
        sauce: 10, omelette: 10, peasCarrots: 10, glazedTurnips: 10, favaFlour: 10, favaBread: 10,
        // Niv. 11
        cornbread: 11, nail: 11, tools: 11,
        // Niv. 12
        down: 12, cottonFabric: 12, pineTorch: 12, chickenBasque: 12,
        // Niv. 13
        smokedTrout: 13, horseshoe: 13, smokedGudgeon: 13, smokedChicken: 13,
        // Niv. 14
        grilledFish: 14, pondFry: 14, smokedQuailEggs: 14, bleakFry: 14, cutStone: 14, birchSyrup: 14, parsnipMash: 14, gudgeonFry: 14, quailHoney: 14,
        // Niv. 15
        jam: 15, juice: 15, carrotJuice: 15, cloth: 15, smokedWhitefish: 15, lambGarlic: 15,
        // Niv. 16
        angoraYarn: 16, duckConfit: 16, gooseConfit: 16, crayfishBisque: 16, tenchHerbs: 16,
        // Niv. 17
        pie: 17, cookies: 17, spongeCake: 17, easterCake: 17, parsnipCake: 17, shallotFougasse: 17, pigeonPastilla: 17, smokedSquab: 17,
        // Niv. 18
        garlicSoup: 18, linen: 18, potAuFeu: 18, moussaka: 18, ironIngot: 18, copperIngot: 18, birchGingerbread: 18,
        // Niv. 19
        salad: 19, crate: 19, gooseRillettes: 19, smokedPike: 19, gazpacho: 19, quailSalad: 19, lemonade: 19, zanderLeeks: 19, smokedSalmon: 19, gudgeonLemon: 19, whitefishTartare: 19,
        // Niv. 20
        cider: 20, strawHat: 20, sweater: 20, cevapi: 20, woolSocks: 20, buckwheatFlour: 20, burbotCider: 20, pochouse: 20, salmonSteak: 20, ironPan: 20,
        // Niv. 21
        ratatouille: 21, butter: 21, cheese: 21, rabbitTerrine: 21, featherDuster: 21, buckwheatSalad: 21, rhubarbTart: 21, spinachQuiche: 21, lemonTart: 21, salmonTartare: 21, copperPot: 21, shallotTatin: 21, shallotButter: 21, whitefishMeuniere: 21, poachedPigeonEggs: 21,
        // Niv. 22
        cherryPie: 22, forgeLantern: 22, weathervane: 22, mustardSauce: 22, gooseLegApples: 22, kiwiJuice: 22, angoraMittens: 22, spinachGalette: 22, quailGalette: 22, lemonCrepe: 22, raspberryCrepe: 22, solidOak: 22, syrupCrepe: 22, broccoliQuiche: 22, squabPeas: 22,
        // Niv. 23
        crepes: 23, fishSoup: 23, scarf: 23, cream: 23, flowerPot: 23, clayBowl: 23, driedMagret: 23, angoraBlanket: 23, crayfishGratin: 23, pondTerrine: 23, broccoliSoup: 23, whitefishLeek: 23,
        // Niv. 24
        quiche: 24, fishFritters: 24, lavenderSoap: 24, eelGreen: 24, pearJuice: 24, smokedTurkey: 24, teaTowel: 24, resinCandle: 24, crystalVase: 24, cauliflowerGratin: 24, cauliflowerPie: 24, kidPie: 24, royalSoap: 24,
        // Niv. 25
        smokedEel: 25, tshirt: 25, lentilSalad: 25, prunes: 25, stuffedCabbage: 25, smokedCatfish: 25, catfishBeurreBlanc: 25, hazelnutOil: 25, smokedSturgeon: 25, caviar: 25, taboule: 25, favaPuree: 25, parsnipChips: 25, kidMint: 25,
        // Niv. 26
        gratin: 26, pillow: 26, caramel: 26, candyApple: 26, lavenderBag: 26, mustardOil: 26, goldfishMobile: 26, radishButter: 26, popcorn: 26, kiwiJam: 26, oatFlakes: 26, oatFlour: 26, porridge: 26, oatCookies: 26, oatBread: 26, oatGalette: 26, friedBleak: 26, royalCandy: 26,
        // Niv. 27
        quilt: 27, pasta: 27, lasagna: 27, risotto: 27, honeyPot: 27, linenShirt: 27, pistou: 27, mirabelleTart: 27, driedApricot: 27, peasFrench: 27, saffronRisotto: 27, cottonThread: 27, linseedOil: 27, rhubarbJam: 27, broccoliPasta: 27, lambLasagna: 27,
        // Niv. 28
        soup: 28, pizza: 28, fruitCandy: 28, soyOil: 28, soyMilk: 28, pumpkinPie: 28, waffles: 28, driedBeef: 28, saffronBrioche: 28, pigeonPie: 28, pizzaVeggie: 28, marinatedBleak: 28, chickenCream: 28,
        // Niv. 29
        gingerbread: 29, yogurt: 29, strawberryIce: 29, honeyIce: 29, yuleLog: 29, raspberrySorbet: 29, hempCloth: 29, hempRope: 29, hempOil: 29, toastedHemp: 29, hempBread: 29, hempBag: 29, espadrilles: 29, hempSoap: 29, plumTart: 29, plumJam: 29, driedPlums: 29, magretPlums: 29,
        // Niv. 30
        croissant: 30, mash: 30, potee: 30, carpStew: 30, marshmallow: 30, goldLocket: 30, amethystRing: 30, ricePudding: 30, tofu: 30, witchCandy: 30, eelMatelote: 30, tzatziki: 30, hazelnutIce: 30, silverIngot: 30, quartzPendant: 30, mintIce: 30,
        // Niv. 31
        brioche: 31, pikeTerrine: 31, perfume: 31, buche: 31, sugarEggs: 31, tatin: 31, madeleines: 31, perchMeuniere: 31, rhubarbCompote: 31, goldIngot: 31, rubyBrooch: 31, pickledTurnips: 31, canFavaBeans: 31,
        // Niv. 32
        strawberryCake: 32, greenTea: 32, sushi: 32, grapeJuice: 32, tableWine: 32, leekVeloute: 32, peaVeloute: 32, flamiche: 32, sobacha: 32, roastedChicory: 32, chicoryCake: 32, brousse: 32, wheyBread: 32, wheySoap: 32,
        // Niv. 33
        orangeJuice: 33, ravioli: 33, blondBeer: 33, amberBeer: 33, apricotJam: 33, driedPear: 33, quinceJelly: 33, quincePaste: 33, sapphirePendant: 33, shallotConfit: 33, piccalilli: 33, munster: 33, quailGrapes: 33,
        // Niv. 34
        ham: 34, lardons: 34, rabbitMustard: 34, pikeQuenelles: 34, pickles: 34, silverCutlery: 34, frisee: 34, falafel: 34, chickpeaFlour: 34, roastedChickpeas: 34, vegCouscous: 34, drySausage: 34, pizzaReine: 34,
        // Niv. 35
        darkChoc: 35, driedFig: 35, rabbitPrunes: 35, goldfishBowl: 35, goosePasta: 35, goldenBell: 35, sapphireRing: 35, rubyRing: 35, blackTea: 35, orangeTea: 35, raspberryTea: 35, chocMandarins: 35, calzone: 35, quailTerrine: 35,
        // Niv. 36
        fossilBrooch: 36, asparagusMousseline: 36, asparagusVeloute: 36, apricotTart: 36, melonIce: 36, apricotJuice: 36, cannedBeans: 36, piperade: 36, maltBlond: 36, maltAmber: 36, hempTisane: 36, mandarinMarmalade: 36, mandarinCake: 36, cantal: 36,
        // Niv. 37
        pearBrandy: 37, mirabelleBrandy: 37, calvados: 37, sheepTomme: 37, marmalade: 37, espelettePowder: 37, maltBrown: 37, butternutSoup: 37, butternutGnocchi: 37, butternutTart: 37, butternutCompote: 37,
        // Niv. 38
        kiwiSorbet: 38, espeletteHam: 38, galetteComplete: 38, emeraldBrooch: 38, lemonTea: 38, mintTea: 38, guineaOmelette: 38, guineaMimosa: 38, guineaCider: 38, smokedGuinea: 38, guineaRillettes: 38,
        // Niv. 39
        goatCheese: 39, sundae: 39, milkTea: 39, mushroomOmelette: 39, mushroomRisotto: 39, radishPickles: 39, sheepYogurt: 39, stuffedCarp: 39, maltBlack: 39, emeraldRing: 39, apricotTea: 39, mandarinTea: 39, grapefruitMarmalade: 39, grapefruitSorbet: 39, grapefruitTart: 39,
        // Niv. 40
        candle: 40, goatSoap: 40, scentedCandle: 40, waxBalm: 40, summerPunch: 40, milkChoc: 40, coconutMilk: 40, blueberryTea: 40, redInfusion: 40, favaGoatSalad: 40, chicoryMilk: 40, guineaCabbage: 40,
        // Niv. 41
        limePie: 41, blackberryTart: 41, blackberryIce: 41, blackberryJuice: 41, valencay: 41, coppa: 41, islandCocktail: 41, coconutFlan: 41,
        // Niv. 42
        vanillaIce: 42, pizzaGoatHoney: 42, pizzaHawaii: 42, asparagusJar: 42, roquefort: 42, truffleBrie: 42, raspberryLiqueur: 42, limoncello: 42, blackberryJam: 42,
        // Niv. 43
        quinceRatafia: 43, hazelnutSpread: 43, spreadCrepe: 43, snapperLime: 43, mohairYarn: 43, mohairPlush: 43, mohairScarf: 43, mohairSweater: 43, hornComb: 43,
        // Niv. 44
        fruitPaste: 44, peachSorbet: 44, oliveOil: 44, pondRillettes: 44, calvadosCrepe: 44, whiteTea: 44, barleyCoffee: 44, hornCardigan: 44, hornKnife: 44,
        // Niv. 45
        peachTart: 45, fruitSalad: 45, watermelonJuice: 45, peachNectar: 45, melonSorbet: 45, lavenderTea: 45, icedTea: 45, stirTofu: 45, mackerelRillettes: 45,
        // Niv. 46
        cherryBeer: 46, rum: 46, arrangedRum: 46, hummus: 46, socca: 46, blackberryLiqueur: 46, plumBrandy: 46, mohairPlaid: 46, kidOlives: 46,
        // Niv. 47
        cannedShrimp: 47, mead: 47, bouillabaisse: 47, figJam: 47, goldScalePendant: 47, truffleTagliatelle: 47, barleyLatte: 47, chicoryCoffee: 47, pheasantScramble: 47, pheasantApples: 47, smokedPheasant: 47, pizzaTurkeyEgg: 47, lemongrassIced: 47, lemongrassSoap: 47,
        // Niv. 48
        magretFigs: 48, mackerelWine: 48, almondMilk: 48, galetteRois: 48, praline: 48, chocAlmonds: 48, matchaLatte: 48, pepperMagret: 48, pepperCheese: 48, pepperSaucisson: 48, mandarinJuice: 48, grapefruitJuice: 48, pheasantPate: 48,
        // Niv. 49
        cassoulet: 49, choucroute: 49, lobsterArmoricaine: 49, lobsterBisque: 49, blackcurrantJelly: 49, blackcurrantSorbet: 49, blackcurrantTart: 49, cassisCream: 49, cassisPastilles: 49, pizzaCrayfish: 49,
        // Niv. 50
        lobsterDish: 50, grilledMackerel: 50, coconutOil: 50, paella: 50, pomegranateJuice: 50, grenadine: 50, magretPomegranate: 50, pomegranateSorbet: 50, cinnamonRoll: 50,
        // Niv. 51
        endiveTart: 51, endiveSalad: 51, roastedPistachios: 51, pistachioOil: 51, pistachioIce: 51, pistachioNougat: 51, pistachioFinancier: 51, cinnamonRum: 51, cinnamonCocoa: 51,
        // Niv. 52
        endiveHam: 52, skateBlackButter: 52, skateMustard: 52, skateSoup: 52, bakedBream: 52, herbBream: 52, breamCeviche: 52, grilledOctopus: 52, shoeIron: 52,
        // Niv. 53
        blueberryPie: 53, muffins: 53, blueberryJuice: 53, hempLead: 53, grilledTuna: 53, cannedTuna: 53, friedSquid: 53, stuffedSquid: 53, squidSalad: 53,
        // Niv. 54
        octopusProvencale: 54, octopusSalad: 54, octopusOil: 54, grilledSpinyLobster: 54, vanillaSpinyLobster: 54, spinyBisque: 54, snapperCeviche: 54, mahiPineapple: 54, shoeSilver: 54,
        // Niv. 55
        blueberryIce: 55, peeledTomatoes: 55, coffee: 55, seabassSalt: 55, walnutCake: 55, melonJam: 55, saucisson: 55, petitSale: 55, soySauce: 55, truffleOmelette: 55, espresso: 55, mahiPoke: 55,
        // Niv. 56
        vase: 56, redDye: 56, yellowDye: 56, dyedWool: 56, blueDye: 56, colorSweater: 56, woolHat: 56, teaSet: 56, vanillaFlan: 56, nicoise: 56, chestnutCream: 56, walnutOil: 56, smokedMahi: 56, nutmegSauce: 56, nutmegCake: 56,
        // Niv. 57
        garlicPasta: 57, garlicBread: 57, oliveSoap: 57, mozzarella: 57, hotChoc: 57, sweetPotatoCake: 57, passionSorbet: 57, pesto: 57, artichokeTart: 57, trailMix: 57, melonHam: 57, tiareTea: 57, dyedMohair: 57,
        // Niv. 58
        cremeBrulee: 58, hamSandwich: 58, turkeyChestnut: 58, pissaladiere: 58, cremeAnglaise: 58, cappuccino: 58, blanquette: 58, ossobuco: 58, vitello: 58, camomileWater: 58, lilyPerfume: 58,
        // Niv. 59
        brush: 59, tian: 59, focaccia: 59, cannedSardines: 59, chocCake: 59, lavenderWater: 59, summerPerfume: 59, vanillaPerfume: 59, marronsGlaces: 59,
        // Niv. 60
        grandParfum: 60, limeade: 60, pineappleCake: 60, mangoChutney: 60, truffleOil: 60, hazelnutCoffee: 60, vanillaLatte: 60, macchiato: 60, lemongrassBroth: 60, nutmegElixir: 60,
        // Niv. 61
        beaufort: 61, sweetPotatoMash: 61, accras: 61, barigoule: 61, cannedArtichoke: 61, eggplantCaviar: 61, papayaSmoothie: 61, candiedPapaya: 61, royalCream: 61,
        // Niv. 62
        paintedVase: 62, caprese: 62, tomme: 62, fondue: 62, camembert: 62, pineappleJuice: 62, bananaSmoothie: 62, bananaBread: 62, cassavaCakes: 62,
        // Niv. 63
        coconutCurry: 63, burrata: 63, quillPen: 63, viennois: 63, coconutCoffee: 63, saddleDress: 63, saddleJump: 63, saddleRace: 63, bridle: 63,
        // Niv. 64
        coconutRocks: 64, coconutRope: 64, gingerTea: 64, belleHelene: 64, roastChestnut: 64, bubbleTea: 64, ricotta: 64, icedCaramel: 64, tunaTartare: 64, tunaPoke: 64, mahiTacos: 64, saddlePad: 64,
        // Niv. 65
        donkeySoap: 65, genepiLiqueur: 65, giantOmelette: 65, mangoJuice: 65, mangoPassion: 65, lassi: 65, coffeeLiqueur: 65, donkeyShampoo: 65, affogato: 65, frappe: 65, taroChips: 65, winterBlanket: 65, hairBrush: 65,
        // Niv. 66
        redWine: 66, roseWine: 66, taroCoconut: 66, taroFritters: 66, taroCake: 66, giantPavlova: 66, ostrichQuiche: 66, grilledOstrich: 66, ostrichCarpaccio: 66, driedOstrich: 66, marcBrandy: 66,
        // Niv. 67
        mangoSorbet: 67, coconutIce: 67, dhal: 67, walnutWine: 67, grilledSardines: 67, genepiTea: 67, dreamcatcher: 67, lycheeTea: 67, dragonJuice: 67,
        // Niv. 68
        whiteWine: 68, islandCoffee: 68, orchidPerfume: 68, orchidSoap: 68, orchidDried: 68, dragonSmoothie: 68, dragonSorbet: 68, exoticTartlet: 68, mulledWine: 68,
        // Niv. 69
        reblochon: 69, yakCheese: 69, yakTomme: 69, yakYogurt: 69, yakStew: 69, yakMomos: 69, driedYak: 69, zanderWine: 69, wasabiCashew: 69,
        // Niv. 70
        seabassTartare: 70, roastedCashews: 70, cashewButter: 70, cashewRice: 70, cashewBrittle: 70, roastedPeanuts: 70, peanutOil: 70, peanutButter: 70, peanutBrittle: 70,
        // Niv. 71
        brownSugar: 71, pralines: 71, avocadoShrimp: 71, plumedHat: 71, chocPeanuts: 71, beefBourguignon: 71, winePears: 71, cognac: 71, pizzaSavoyarde: 71,
        // Niv. 72
        alpacaYarn: 72, redBeanPaste: 72, chiliPowder: 72, rougail: 72, hotSauce: 72, spicedRum: 72, creoleSnapper: 72, eggsMeurette: 72, kir: 72,
        // Niv. 73
        guavaSorbet: 73, coffeeBeans: 73, genepiChoc: 73, tiarePerfume: 73, tiareCrown: 73, chestnutCoffee: 73, spicedCoffee: 73, aloeGel: 73, aloeSoap: 73,
        // Niv. 74
        bleu: 74, bissap: 74, hibiscusJam: 74, hibiscusSorbet: 74, alpineFlowerCheese: 74, guineaWine: 74, candiedGrapes: 74, boxCagette: 74, boxPanier: 74,
        // Niv. 75
        alpacaScarf: 75, patchouliEssence: 75, patchouliSachet: 75, grapeJelly: 75, royalShawl: 75, royalYarn: 75, royalDyed: 75, boxFilet: 75, boxRuban: 75,
        // Niv. 76
        comte: 76, redBeanRice: 76, pheasantTerrine: 76, pizzaFourCheese: 76, preservedLemon: 76, datePaste: 76, jujubeSyrup: 76, cuminBread: 76, sesameBread: 76,
        // Niv. 77
        raclette: 77, tartiflette: 77, driedKaki: 77, kakiSorbet: 77, dateCoffee: 77, canRedBeans: 77, patchouliPerfume: 77, pigeonTerrine: 77, sesameOil: 77,
        // Niv. 78
        dorayaki: 78, bitterMarmalade: 78, tahini: 78, orangeBlossomWater: 78, dateBread: 78, pizzaSorghum: 78, sorghumFlatbread: 78, boxCaisse: 78, boxTonnelet: 78,
        // Niv. 79
        caneSyrup: 79, jujubeTisane: 79, pickledPheasantEggs: 79, strawWine: 79, semolina: 79, rasElHanout: 79, harissa: 79, vegTajine: 79, chakchouka: 79,
        // Niv. 80
        cottonCandy: 80, kesra: 80, msemen: 80, harira: 80, keftas: 80, halva: 80, clayTench: 80, clayBurbot: 80, boxMalle: 80,
        // Niv. 81
        nougat: 81, chocBox: 81, sesameMilk: 81, camelDate: 81, saffronMilk: 81, patchouliCandle: 81, camelCheese: 81, smen: 81, lben: 81,
        // Niv. 82
        beetSyrup: 82, caravanBlanket: 82, batbout: 82, lemonTajine: 82, couscous: 82, dateTajine: 82, camelCouscous: 82, gazelleHorns: 82, makrout: 82,
        // Niv. 83
        guacamole: 83, loukoum: 83, honeyJujubes: 83, ryeFlour: 83, cloudberryIce: 83, ryeBread: 83, karelianPie: 83, pizzaZebu: 83, boxCloche: 83,
        // Niv. 84
        tiramisu: 84, guavaPaste: 84, ryeCoffee: 84, lingonTisane: 84, cloudberryInfusion: 84, ryeKvas: 84, berberRug: 84, baklava: 84, claySturgeon: 84,
        // Niv. 85
        coconutSoap: 85, camelRug: 85, zebuTajine: 85, zebuSkewers: 85, couscousRoyal: 85, mechoui: 85, lambApricot: 85, pastilla: 85, boxEcrin: 85,
        // Niv. 86
        monoi: 86, antlerCarving: 86, antlerKnife: 86, antlerPendant: 86, spruceSyrup: 86, nordicFlat: 86, ryeCookies: 86, mushroomSoup: 86, ryePorridge: 86,
        // Niv. 87
        champagne: 87, guavaJuice: 87, lycheeSyrup: 87, qiviutScarf: 87, qiviutHat: 87, kalakukko: 87, butterPotatoes: 87, camelBurnous: 87, barbaryShawl: 87,
        // Niv. 88
        turmericPowder: 88, ptarmiganPasta: 88, pulla: 88, seedRye: 88, eggPie: 88, salmonSoup: 88, lingonStew: 88, nordicOmelette: 88, tundraStew: 88,
        // Niv. 89
        goldenMilk: 89, zebuMilkJam: 89, turkeyEggCurd: 89, sorghumBerryPaste: 89, juniperRoast: 89, nordPie: 89, ptarmiganLingon: 89, ptarmiganSoup: 89, ptarmiganCloudberry: 89,
        // Niv. 90
        coconutPunch: 90, lycheeCocktail: 90, spruceTea: 90, buckthornHot: 90, rowanTea: 90, yellowRice: 90, reindeerCheese: 90, grilledCheese: 90, buckthornHoney: 90,
        // Niv. 91
        lotusInfusion: 91, pickledTurmeric: 91, bambooStirFry: 91, shiitakeNoodles: 91, lotusCrisps: 91, bokChoyWok: 91, fiveSpiceBeef: 91, shrimpLotusWok: 91, shiitakeTofuWok: 91,
        // Niv. 92
        bananasFlambe: 92, lycheeSorbet: 92, hibiscusTea: 92, yuzuTea: 92, umeSoda: 92, gravlax: 92, lingonJelly: 92, umeshu: 92, yuzuDuckWok: 92,
        // Niv. 93
        kakiSyrup: 93, horsehairBrush: 93, kumquatIcedTea: 93, soothingCream: 93, reindeerKefir: 93, qiviutBlanket: 93, buckthornLozenges: 93, yuzuSorbet: 93, nashiCider: 93,
        // Niv. 94
        chai: 94, velvetAmulet: 94, sikaTofuCheese: 94, shiitakeBao: 94, lotusDimSum: 94, yuzuFishSteam: 94, umeOnigiri: 94, nashiSteamPear: 94, bokChoyDumplings: 94,
        // Niv. 95
        poncho: 95, mocha: 95, aloeLimeJuice: 95, silkiePillow: 95, silkieQuilt: 95, goldenSilkParasol: 95, silkieFriedRice: 95, custardSilkie: 95, longanSteamedBun: 95,
        // Niv. 96
        champagneRose: 96, alpacaBlanket: 96, driedHibiscus: 96, cloudberryLiqueur: 96, lingonPastry: 96, rowanJelly: 96, velvetElixir: 96, ginkgoRice: 96, ginkgoBroth: 96,
        // Niv. 97
        blancManger: 97, umeJelly: 97, kumquatConfit: 97, nashiTart: 97, longanPudding: 97, lotusMooncake: 97, ginkgoSweetSoup: 97, kumquatMochi: 97, starAniseCandies: 97,
        // Niv. 98
        featherFan: 98, coconutRice: 98, desertTea: 98, rowanSpirit: 98, cloudberryTart: 98, cloudberryCream: 98, silkKimono: 98, velvetCarving: 98, yuzuMochi: 98,
        // Niv. 99
        pommeau: 99, exoticSalad: 99, dateTea: 99, cardamomMilk: 99, sikaMatcha: 99, chebakia: 99, lingonSoup: 99, berryPaste: 99, goldenObi: 99,
        // Niv. 100
        donkeyCream: 100, cafeLatte: 100, bitterOrangeTea: 100, aniseChai: 100, stuffedDates: 100, seaBuckthornOil: 100, cloudberryJam: 100, spruceCandy: 100, silkFan: 100,
    },
};

export function applyLevels(kind, table, field = 'reqLvl') {
    const map = LEVELS[kind] || {};
    const leg = LEGACY_LEVELS[kind] || {};
    for (const [id, l] of Object.entries(map)) if (table[id]) table[id][field] = l;
    for (const [id, o] of Object.entries(leg)) if (table[id]) Object.assign(table[id], o);
}
