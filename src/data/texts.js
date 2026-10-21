// Les textes : bulles de Mamie Odette (le Guide du fermier est dans guide.js).
// Valeurs reprises telles quelles de la version 6.2 (même équilibre).

export const TIPS = {
    haras: {
        icon: ['ui', 'hEcuries'],
        title: 'Les grandes écuries',
        text: 'Logez vos chevaux en boxes (onglet Animaux, volet Écuries). Brossez-les, nourrissez-les, puis entraînez-les : chaque séance coûte une pastille de forme, qui remonte toutes les 30 minutes. Chaque aptitude monte jusqu’à un plafond que fixe un gène du cheval : croisez au labo pour viser plus haut.',
    },
    nmarket: {
        icon: ['ui', 'nmEtal'],
        title: 'Le marché des voisines',
        text: 'Les quatre fermes voisines tiennent un étal (Marché | Acheter, rayon Voisines), renouvelé toutes les 4 heures. Plus elles vous aiment, plus elles proposent d’offres, de quantité et de bons prix. Il vous manque un produit ? Faites une demande d’achat : plus vous payez, plus vite elles livrent.',
    },
    companions: {
        icon: ['ui', 'cpCarnet'],
        title: 'Les cultures compagnes',
        text: 'Certaines cultures s’entraident quand elles poussent côte à côte (une feuille verte entre deux parcelles), d’autres se gênent (une feuille fanée). Chaque association découverte entre dans le carnet du potager, sous le champ. Alternez vos rangées : le semoir et Théo suivent.',
    },
    show: {
        icon: ['ui', 'hCup2'],
        title: 'Les concours du haras',
        text: 'Chaque semaine, une discipline. Inscrivez jusqu’à trois chevaux, jouez leurs passages avant lundi (sinon Jules monte), et les résultats tombent le lundi. Trois rosettes ouvrent la division suivante ; une victoire écrasante en compte deux.',
    },
    stud: {
        icon: ['ui', 'hEcusson'],
        title: 'Un champion !',
        text: 'Votre cheval a gagné en division Élite. Il peut maintenant prendre sa retraite (Animaux, volet Élevage) : il rapportera des saillies chaque jour et ses poulains naîtront avec un peu de son talent. Trois champions de suite dans une famille : une lignée célèbre !',
    },
    frost: {
        icon: ['item', 'apple'],
        title: 'Gelée de printemps',
        text: 'Une gelée menace le verger : les arbres non protégés perdent des fruits. Allumez des torches de résine avant la nuit (une torche couvre deux arbres), ou laissez-les s’allumer seules si vous en avez en réserve.',
    },
    vend: {
        icon: ['item', 'grape'],
        title: 'Les vendanges',
        text: 'Margaux prépare la fête du vin : livrez vos raisins dans l’onglet Ferme, volet Verger. Elle vous rend des bouteilles de vin de table à mettre en cave, des pièces et de son amitié.',
    },
    vintage: {
        icon: ['item', 'redWine'],
        title: 'Un vin, un millésime',
        text: 'Chaque vin garde l’année de sa mise en cave. Une année froide vaut moins ; une grande année, ou l’année du siècle, vieillit mieux et vaut bien plus. Touchez la bouteille pour la voir en grand et nommer votre cuvée.',
    },
    abbey: {
        icon: ['ui', 'beer'],
        title: 'Une abbaye et sa brasserie',
        text: 'Derrière le port, Frère Hugues et Agnès rallument la brasserie de l’abbaye (volet Village, carte « L’abbaye »). Semez de l’orge : il en faudra pour le malt.',
    },
    brew: {
        icon: ['ui', 'beer'],
        title: 'Inventer sa bière',
        text: 'Un malt donne la couleur, le houblon l’amertume, et chaque fruit ou légume son goût. Regardez l’accord avant de brasser : certains mariages valent beaucoup plus cher. La première fois, la bière reçoit un nom : touchez le crayon pour le changer.',
    },
    station: {
        icon: ['ui', 'flowers'],
        title: 'Une station de recherche',
        text: 'Au bout du chemin des vergers, Agathe et Victor rouvrent une station de recherche (volet Village, carte « La station »). Croisements de plantes, élevage de sélection, et bientôt vos propres variétés !',
    },
    defis: {
        icon: ['ui', 'cupGold'],
        title: 'Les grands défis',
        text: 'Toutes les deux semaines, un villageois vous confie un grand défi (volet Commandes). 4 étapes, à faire dans l’ordre que vous voulez : 2 pour le bronze, 3 pour l’argent, 4 pour l’or. Les médailles s’exposent dans la salle des trophées (menu).',
    },
    genetics: {
        icon: ['item', 'strawberry'],
        title: 'Croiser, c’est parier',
        text: 'Chaque gène a deux versions, dont une souvent cachée. Le labo montre les chances de chaque issue. Gardez les meilleures variétés, recroisez-les avec elles-mêmes, et fixez-les pour leur donner un nom. Les meilleurs ingrédients font des plats en argent ou en or.',
    },
    isle: {
        icon: ['item', 'pineapple'],
        title: 'Une île au bout du bac',
        text: 'Depuis le port, un vieux bac mène à une île tropicale. Répare-le (volet Village, carte « L’île ») : tu pourras y planter ananas, bananiers et cocotiers.',
    },
    island: {
        icon: ['item', 'banana'],
        title: 'Les cultures de l’île',
        text: 'Sur l’île, pas besoin d’arroser : les pluies tropicales s’en chargent, et tout est toujours de saison. « Replanter » remet sur chaque parcelle vide sa dernière culture.',
    },
    orchard: {
        icon: ['item', 'apple'],
        title: 'Le verger',
        text: 'Un arbre grandit, puis laisse tomber ses fruits à son pied : viens les ramasser avant qu’ils ne pourrissent. Après une centaine de fruits il vieillit, puis meurt : il donne alors du bois, et tu replantes.',
    },
    pasture: {
        icon: ['ui', 'flowers'],
        title: 'Un pré tout plein',
        text: 'Un pré accueille 20 bêtes. Achète un nouveau pré pour agrandir le troupeau, et déplace tes animaux d’un pré à l’autre depuis leur fiche.',
    },
    machine: {
        icon: ['ui', 'gear'],
        title: 'Ta première machine',
        text: "Touche « Produire » pour choisir une recette. Une machine enchaîne jusqu'à 4 lots, même différents : remplis-la avant de partir !",
    },
    village: {
        icon: ['ui', 'village'],
        title: 'Le village a besoin de toi',
        text: "Dans l'onglet Village, volet « Village », les habitants veulent rénover leurs bâtiments. Apporte-leur des produits : chaque chantier terminé débloque une surprise.",
    },
    barn: {
        icon: ['ui', 'barn'],
        title: 'La grange se remplit',
        text: "Quand elle est pleine, tu ne peux plus rien récolter. Livre des commandes, vends le surplus au marché, ou agrandis-la en touchant le compteur en haut de l'écran.",
    },
    rare: {
        icon: ['item', 'plank'],
        title: 'Un matériau rare !',
        text: "Planches, clous et pots de peinture servent à agrandir la grange. On en trouve un peu partout : en récoltant, à l'atelier, dans les livraisons…",
    },
    contest: {
        icon: ['ui', 'podium'],
        title: 'Le concours de la semaine',
        text: 'Chaque semaine, les fermes de la région s’affrontent. Tout ce que tu fais rapporte des points : réclame les trois paliers, et vise la première place !',
    },
    fete: {
        icon: ['ui', 'trophy'],
        title: "C'est la fête !",
        text: "Chaque saison a sa fête, pendant une vingtaine de minutes. Remplis ses trois objectifs dans l'onglet Village pour remporter un trophée.",
    },
    soil: {
        icon: ['ui', 'soilWet'],
        title: 'Le bon sol',
        text: "Les parcelles n'ont pas toutes le même sol : humide, sec ou ombragé. Une culture plantée dans le sol qu'elle aime pousse plus vite et donne plus souvent de belles récoltes.",
    },
    train: {
        icon: ['ui', 'trainIcon'],
        title: 'Le train est en gare',
        text: 'Il reste une heure. Charge ses trois wagons : chacun est payé tout de suite, et un train complet rapporte un bonus et un matériau rare.',
    },
    balloon: {
        icon: ['ui', 'balloon'],
        title: 'Une montgolfière !',
        text: "Les clients de l'auberge passent une grosse commande, très bien payée, avec deux matériaux rares. Elle repart au bout d'une heure.",
    },
    merchant: {
        icon: ['ui', 'merchant'],
        title: 'Le marchand ambulant',
        text: 'Zéphyr vend des matériaux rares, des graines exotiques et des décorations introuvables ailleurs. Il ne reste que deux heures !',
    },
    crow: {
        icon: ['ui', 'crow'],
        title: 'Un corbeau !',
        text: 'Il va picorer une culture : touche-le vite pour le chasser, tu gagneras quelques pièces. Un nichoir protège les parcelles voisines, un épouvantail toute la ferme.',
    },
    stall: {
        icon: ['ui', 'stall'],
        title: "L'étal de la ferme",
        text: "Ici, vous fixez le prix. Au prix normal, un client passe en un quart d'heure environ ; moins cher, il vient plus vite. Le grossiste, plus bas, achète tout de suite mais paie bien moins.",
    },
    neighbors: {
        icon: ['ui', 'heart'],
        title: 'Un voisin a besoin de vous',
        text: 'Les fermes rivales du concours sont aussi vos voisines. Aidez-les (onglet Village, volet « Commandes ») : elles paient bien, offrent des matériaux rares et des cadeaux en devenant vos amies.',
    },
    aphids: {
        icon: ['ui', 'pest'],
        title: 'Des pucerons !',
        text: 'Une culture est attaquée et ne pousse plus. Touche-la vite pour chasser les pucerons, sinon elle sera perdue.',
    },
    sick: {
        icon: ['ui', 'sick'],
        title: 'Un animal est malade',
        text: 'Il ne produit plus. Reste appuyé sur lui au pâturage pour ouvrir sa fiche, et appelle le vétérinaire. Sinon, il guérira seul, mais lentement.',
    },
    express: {
        icon: ['ui', 'express'],
        title: 'Un acheteur pressé',
        text: 'Il paie le triple, mais il repart dans dix minutes. Sa commande est en haut du tableau des commandes.',
    },
    house: {
        icon: ['ui', 'house'],
        title: 'Ta maison peut grandir',
        text: 'Touche la maison au-dessus du champ. Chaque agrandissement donne un bonus pour toujours : grange, tableau des commandes, atelier, étal…',
    },
    farmhand: {
        icon: ['villager', 'theo'],
        title: 'Théo, ton commis',
        text: 'Théo s’occupe des premières parcelles du champ (encadrées) : il récolte, replante la même culture et arrose, même quand tu n’es pas là. Forme-le depuis la maison pour qu’il en fasse plus.',
    },
    mastery: {
        icon: ['ui', 'medalB'],
        title: 'Première maîtrise !',
        text: 'Plus tu produis un même produit, plus tu le maîtrises : bronze, argent puis or. Chaque étoile augmente son prix. Retrouve tout dans le Livre de la ferme (onglet Progrès).',
    },
    hamlet: {
        icon: ['villager', 'jules'],
        title: 'Le hameau oublié',
        text: 'De l’autre côté de la rivière, Jules et Inès t’attendent. Dans l’onglet Village, passe sur la carte « Le hameau » pour voir leurs chantiers.',
    },
    league: {
        icon: ['ui', 'podium'],
        title: 'Les ligues du concours',
        text: 'Gagne le concours pour monter de ligue : bronze, argent, or, puis diamant. Les rivales y sont plus fortes, mais les récompenses bien plus grosses. Le dernier redescend.',
    },
    storm: {
        icon: ['ui', 'w_storm'],
        title: "Gare à l'orage",
        text: "Pendant l'orage, tout pousse plus vite, mais la foudre peut brûler une culture. Un paratonnerre, posé n'importe où dans le champ, protège tout le champ.",
    },
    album: {
        icon: ['ui', 'camera'],
        title: 'Ton premier souvenir',
        text: "À chaque grand moment, une photo rejoint l'album du Livre de la ferme (onglet Progrès). Tu peux la regarder et la partager.",
    },
    rareEvent: {
        icon: ['ui', 'fair'],
        title: 'Un événement rare !',
        text: 'De temps en temps, quelque chose d’exceptionnel se passe au village ou à la ferme. Ça ne dure pas : regardez le volet Village.',
    },
    story: {
        icon: ['ui', 'scroll'],
        title: 'Une histoire commence',
        text: 'À 5 cœurs, un villageois vous confie son histoire en trois étapes. Retrouvez-la sous sa fiche, dans le volet Village.',
    },
    contract: {
        icon: ['ui', 'calendar'],
        title: 'Un contrat de saison',
        text: 'Un client veut une grosse quantité d’un produit avant la fin de la saison (au moins une heure). Apportez-le petit à petit depuis le volet Village.',
    },
    seaNet: {
        icon: ['ui', 'net'],
        title: 'La pêche en mer',
        text: 'Posez le filet dans le volet Étang, revenez 20 minutes plus tard et relevez-le : sardines, maquereaux, crevettes, bars… et parfois un homard !',
    },
    boat: {
        icon: ['ui', 'boat'],
        title: 'Le bateau de livraison',
        text: 'Le cargo vient chercher de très grosses commandes. Il paie mieux que tout le reste, mais il ne reste que deux heures.',
    },
    trans: {
        icon: ['ui', 'mountain'],
        title: 'La transhumance',
        text: 'Envoyez des vaches, chèvres, moutons ou bufflonnes à l’alpage. Ils reviennent avec du lait d’alpage et produisent ensuite 20 % plus vite.',
    },
    farmSeason: {
        icon: ['ui', 'trophy'],
        title: 'Les saisons de la ferme',
        text: 'Toutes les 4 semaines, un nouveau thème. Chaque produit du thème rapporte des points : 5 paliers, et une décoration unique au bout.',
    },
    cave: {
        icon: ['ui', 'cave'],
        title: 'La cave',
        text: 'Une cave s’ouvre dans l’Atelier ! Mettez-y vos fromages et votre cidre : plus ils vieillissent, plus ils valent cher… mais gare, ils peuvent tourner ou se perdre.',
    },
    caveStep: {
        icon: ['ui', 'turn'],
        title: 'Une étape de passée',
        text: 'Un lot a passé une étape. Sortez-le quand vous voulez : plus il est vieux, plus il vaut cher, et plus le prochain pas est risqué.',
    },
    auction: {
        icon: ['ui', 'gavel'],
        title: 'La salle des ventes',
        text: 'Déposez vos plus beaux lots à la prochaine vente. Les enchères montent en direct, et rien n’est vendu sous votre prix de réserve.',
    },
    champagne: {
        icon: ['item', 'champagne'],
        title: 'Le champagne',
        text: 'Remuez vos bouteilles à chaque étape. Une bouteille oubliée sur son pupitre peut sauter !',
    },
    holiday: {
        icon: ['ui', 'jackLantern'],
        title: 'Une fête aux vraies dates',
        text: 'C’est la fête ! Une recette spéciale est ouverte à l’atelier, et le village attend un panier (volet Village) contre une décoration unique.',
    },
    seeder: {
        icon: ['ui', 'seeder'],
        title: 'Le semoir',
        text: 'Plantez une graine : le semoir sème toute la rangée, sur les parcelles labourées et vides.',
    },
};
