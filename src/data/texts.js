// Les textes : bulles de Mamie Odette (le Guide du fermier est dans guide.js).
// Valeurs reprises telles quelles de la version 6.2 (même équilibre).

export const TIPS = {
    haras: {
        icon: ['ui', 'hEcuries'],
        title: 'Les grandes écuries',
        text: 'Logez vos chevaux en boxes (onglet Animaux, volet Haras, Écuries). Brossez-les, nourrissez-les, puis entraînez-les : chaque séance coûte une pastille de forme, qui remonte toutes les 30 minutes. Chaque aptitude monte jusqu’à un plafond que fixe un gène du cheval : croisez au labo pour viser plus haut.',
    },
    vault: {
        icon: ['ui', 'vault'],
        title: 'Le coffre-fort',
        text: 'Dans la grange, le coffre garde vos plus beaux produits (avec leur qualité) et vos grands crus de la cave, à l’abri de la vente et des commandes. Touchez un produit de la grange, puis « Au coffre ».',
    },
    nmarket: {
        icon: ['ui', 'nmEtal'],
        title: 'Le marché des voisins',
        text: 'Les quatre fermes voisines tiennent un étal (Marché | Acheter, rayon Voisins), renouvelé toutes les 4 heures. Plus vos voisins vous aiment, plus ils proposent d’offres, de quantité et de bons prix. Il vous manque un produit ? Faites une demande d’achat : plus vous payez, plus vite ils livrent.',
    },
    companions: {
        icon: ['ui', 'cpCarnet'],
        title: 'Les cultures compagnes',
        text: 'Certaines cultures s’entraident quand elles poussent côte à côte (une feuille verte entre deux parcelles), d’autres se gênent (une feuille fanée). Chaque association découverte entre dans le carnet du potager (Menu › Carnets). Alternez vos rangées : le semoir et Théo suivent.',
    },
    show: {
        icon: ['ui', 'hCup2'],
        title: 'Les concours du haras',
        text: 'Chaque semaine, une discipline. Inscrivez jusqu’à trois chevaux, jouez leurs passages avant lundi (sinon Jules monte), et les résultats tombent le lundi. Trois rosettes ouvrent la division suivante ; une victoire écrasante en compte deux.',
    },
    stud: {
        icon: ['ui', 'hEcusson'],
        title: 'Un champion !',
        text: 'Votre cheval a gagné en division Élite. Il peut maintenant prendre sa retraite (Animaux, volet Haras, Élevage) : il rapportera des saillies chaque jour et ses poulains naîtront avec un peu de son talent. Trois champions de suite dans une famille : une lignée célèbre !',
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
    chateau: {
        icon: ['ui', 'star'],
        title: 'Le château de Margaux',
        text: 'Au-delà du domaine, Margaux rouvre son château avec l’œnologue Octave (onglet Village, carte « Le château »). Quand le chai est rouvert, mettez un vin ou un champagne « en cuvée » à la cave : à sa sortie, Octave le classe (cru, grand cru, premier grand cru, cru d’exception) et sa valeur monte.',
    },
    primeur: {
        icon: ['ui', 'coin'],
        title: 'La vente en primeur',
        text: 'Avec la salle de dégustation, vous pouvez vendre un lot de la cave avant qu’il soit prêt : on vous paie une part de sa valeur promise tout de suite. Promesse tenue, l’acheteur ajoute un bonus ; manquée, vous rendez ce qui dépasse. Le lot ne quitte jamais la cave.',
    },
    visitors: {
        icon: ['item', 'whiteWine'],
        title: 'Des visiteurs au château',
        text: 'La boutique du château accueille des visiteurs qui achètent vos bouteilles (jamais celles du coffre-fort). Offrez le plat qui va avec le vin : l’accord paie 50 % de plus. Plus le château a d’étoiles, plus il en vient.',
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
    oasis: {
        icon: ['ui', 'oaOasis'],
        title: 'L’oasis',
        text: 'À l’oasis, tout pousse, à condition d’avoir de l’eau. La source remplit la citerne jour et nuit, et chaque plante boit en poussant. Sans eau, rien ne meurt : tout attend. Ta grand-tante Simone avait fait le tour du Sahara en 2 CV. Elle disait que dans le désert, on ne compte pas les kilomètres, on compte les puits.',
    },
    oasisShade: {
        icon: ['ui', 'oaOmbre'],
        title: 'L’ombre du sorgho',
        text: 'Le sorgho monte plus haut qu’un homme. Dès qu’il a poussé de moitié, il fait de l’ombre aux huit cases autour de lui : elles boivent un tiers de moins, et la chaleur de midi ne les touche plus. Il abrite aussi deux bêtes de l’enclos du soleil. Mais on le récolte : plus de sorgho debout, plus d’ombre. Ton grand-père faisait pareil avec ses tournesols : les salades à leur pied ne montaient jamais en graine, même en août.',
    },
    oasisGrove: {
        icon: ['item', 'date'],
        title: 'Le verger de l’oasis',
        text: 'Les arbres de l’oasis ont leur verger à eux, à l’écart des cases : chacun boit quatre litres à l’heure, et attend patiemment quand la citerne est vide. Tante Simone ramenait toujours un noyau de datte de ses voyages. Elle prétendait que dans une valise, ça ne prenait pas de place et que ça poussait tout seul. Le noyau, lui, ne poussait jamais.',
    },
    chadouf: {
        icon: ['ui', 'oaChadouf'],
        title: 'Le chadouf',
        text: 'Trois fois par jour, le chadouf remonte l’eau du puits : touche quand le seau plonge, il remonte plein. Au lavoir du village, on avait une pompe à bras qui grinçait si fort qu’on l’entendait depuis l’église. Le curé disait que c’était la seule à chanter juste.',
    },
    dromedary: {
        icon: ['animal', 'dromedary'],
        title: 'Le dromadaire',
        text: 'Une bosse, pas deux : c’est un dromadaire. Il boit très peu, donne un lait doux et une laine chaude, et c’est lui qui porte les caravanes. Ton grand-père en a vu un au cirque Pinder en 1958 ; il a juré qu’il lui avait fait un clin d’œil.',
    },
    zebu: {
        icon: ['animal', 'zebu'],
        title: 'Le zébu',
        text: 'Le zébu porte sa bosse sur les épaules et ne craint ni la chaleur ni les mouches. Son lait fait un beurre clarifié qui se garde des mois. Et il sait tourner la noria : attelé, il remonte l’eau du puits, mais ne donne plus de lait.',
    },
    barbarySheep: {
        icon: ['animal', 'barbarySheep'],
        title: 'Le mouton barbarin',
        text: 'Le mouton barbarin garde ses réserves dans sa grosse queue, comme le dromadaire dans sa bosse. Il ne craint pas le soleil de midi, et sa laine fait les plus beaux tapis. Ma cousine Odile avait un tapis berbère : quarante ans qu’on marche dessus, il n’a pas bougé d’un fil.',
    },
    blizzard: {
        icon: ['ui', 'noBlizzard'],
        title: 'Le blizzard',
        text: 'Quelques cases hors des poêles disparaissent sous la neige : un appui les dégage. Pendant six heures, les poêles brûlent deux fois plus, et le traîneau en route prend une heure de retard. Ton grand-père disait qu’un bon blizzard, c’est le bon Dieu qui secoue sa couette. Il en parlait surtout en juillet.',
    },
    lvl61: {
        icon: ['animal', 'dromedary'],
        title: 'Le souk est ouvert',
        text: 'Niveau 61 : les bêtes du désert sont à vous, et la caravane peut partir au souk. Là-bas, on marchande avant de payer, même le sel. Ma tante Simone achetait son pain en discutant vingt minutes ; le boulanger disait que ça faisait partie du prix.',
    },
    lvl64: {
        icon: ['ui', 'star'],
        title: 'Le dernier niveau',
        text: 'Niveau 64, ma petite fleur ! Plus rien à gravir : le prestige et les grands défis vous attendent, et chaque point d’expérience en plus devient une étoile de renommée. Ton grand-père aurait dit qu’on est au sommet de la meule de foin. Il en tombait chaque année.',
    },
    aurora: {
        icon: ['ui', 'noAurore'],
        title: 'L’aurore boréale',
        text: 'Les nuits de gel, le ciel s’illumine parfois : pendant une heure, tout pousse une fois et demie plus vite, même loin des poêles. Mamie Odette dit avoir vu un ciel pareil une fois, au-dessus de Clermont-Ferrand, le soir du feu d’artifice de 1989. Elle précise que c’étaient peut-être les fusées.',
    },
    sled: {
        icon: ['ui', 'noTraineau'],
        title: 'Le traîneau',
        text: 'Quatre rennes adultes, dix-huit charges, huit heures de route : la grande ville du Sud paie bien mieux que le grossiste les produits du Nord, et on rapporte parfois de la cardamome. Mon arrière-grand-oncle faisait la route en traîneau chaque hiver, avec des harengs. Il racontait qu’en ville, personne ne voulait croire qu’on pouvait vendre du poisson congelé.',
    },
    reindeer: {
        icon: ['animal', 'reindeer'],
        title: 'Le renne',
        text: 'Le renne donne un lait gras et riche, et perd ses bois chaque année : un second produit, le bois de renne. Il craint un peu le gel : la nuit, hors d’un poêle allumé, il produit deux fois moins vite. Ton grand-père a vu des rennes une seule fois, sur une carte de Noël. Il a trouvé qu’ils avaient l’air fatigués.',
    },
    muskox: {
        icon: ['animal', 'muskox'],
        title: 'Le bœuf musqué',
        text: 'Sous sa longue jupe de poils, le bœuf musqué cache le qiviut : la laine la plus chaude du monde. Il ne craint pas le gel du tout. Mamie Odette avait un manteau qui lui ressemblait : lourd, informe, et on ne l’a jamais vue avoir froid.',
    },
    ptarmigan: {
        icon: ['animal', 'ptarmigan'],
        title: 'Le lagopède',
        text: 'La perdrix des neiges change de robe avec la saison : blanche l’hiver, brune l’été. Elle pond de petits œufs mouchetés, et préfère rester près d’un poêle quand il gèle. Ma tante Colette faisait pareil : blanche en hiver sous ses écharpes, et bronzée dès avril.',
    },
    caravan: {
        icon: ['ui', 'oaCaravane'],
        title: 'La caravane',
        text: 'Trois dromadaires, dix-huit charges, six heures de route : au souk de la ville, on paie bien mieux que le grossiste, et on rapporte parfois du safran. Ton arrière-grand-père allait vendre ses veaux à la foire de Saint-Flour à pied, avec son chien. Trois jours aller, trois jours retour.',
    },
    sandstorm: {
        icon: ['ui', 'oaTempete'],
        title: 'La tempête de sable',
        text: 'Le vent a soufflé du désert : quelques cases sont ensablées. Touche-les pour les dégager ; en attendant, elles ne poussent plus. Les cases à l’ombre d’un sorgho ne craignent rien. Encore une bonne raison d’en planter.',
    },
    oasisDry: {
        icon: ['ui', 'drop'],
        title: 'La citerne est vide',
        text: 'L’oasis a soif : les plantes attendent l’eau sans mourir. La source remplira la citerne peu à peu ; pour aller plus vite, le chadouf, une citerne plus grande ou un puits plus profond. Et plus de palmiers : à l’ombre, on boit moins.',
    },
    nord: {
        icon: ['ui', 'noNord'],
        title: 'Le Grand Nord',
        text: 'Au Grand Nord, le froid décide de tout. Une plante hors de portée d’un poêle pousse au tiers de sa vitesse le jour, et pas du tout la nuit de gel ; elle ne meurt jamais, elle attend le feu. Posez vos poêles au milieu de vos cases : chacun réchauffe celles qui l’entourent. Ma cousine Hélène avait épousé un Finlandais. Elle écrivait que là-bas, on ne demande pas « quel temps fait-il ? » mais « as-tu assez de bois ? ».',
    },
    nordStove: {
        icon: ['ui', 'noPoeleOn'],
        title: 'Le poêle',
        text: 'Un poêle chauffe les huit cases autour de lui, et brûle une bûche par heure, mais seulement s’il y a de quoi réchauffer. Ajoutez du bois d’un appui. Ton grand-père bourrait le poêle de la cuisine jusqu’à la gueule, puis ouvrait la fenêtre parce qu’il avait trop chaud. Il appelait ça « équilibrer ».',
    },
    chop: {
        icon: ['ui', 'noFendre'],
        title: 'Fendre le bois',
        text: 'Trois fois par jour, fendez des bûches au billot : touchez quand le trait passe au milieu de la zone, et la bûche s’ouvre net. Papi Lucien disait que le bois bien fendu chauffe deux fois : une fois en le fendant, une fois en le brûlant. Il le disait surtout quand c’était mon tour.',
    },
    nordCold: {
        icon: ['ui', 'noFroid'],
        title: 'La nuit de gel',
        text: 'De 21 h à 7 h, hors de portée d’un poêle allumé, plus rien ne pousse : tout dort jusqu’au matin. Un poêle plus loin, plus de bois, ou une variété rustique du labo : c’est à vous de choisir où mettre le feu. Chez nous, on rentrait les géraniums dans la cuisine à la Toussaint, et on leur parlait pour qu’ils tiennent.',
    },
    nordGrove: {
        icon: ['item', 'spruce'],
        title: 'Le verger du Grand Nord',
        text: 'Les arbres du Nord sont rustiques : ils n’ont pas besoin de poêle. La nuit de gel ils dorment à moitié, et l’aurore les réveille. Papi Lucien disait qu’un arbre qui a connu l’hiver ne se plaint plus jamais du vent. Il disait ça en rentrant du bois, les joues rouges, en se plaignant du vent.',
    },
    robebook: {
        icon: ['ui', 'cpCarnet'],
        title: 'Le carnet des robes',
        text: 'Une nouvelle robe entre au carnet ! Chaque espèce a 11 couleurs et 8 motifs à trouver. Beaucoup de bêtes en cachent une dans leurs gènes : elle sort quand deux parents porteurs ont un petit. Les plus rares (givrée, étincelante, auréolée…) ne naissent qu’au labo. Une espèce complète rapporte un ruban. Ma tante Lucienne tricotait un carré de laine pour chaque agneau né à la ferme, de la couleur de sa toison. Sa couverture n’a jamais été finie : il manquait toujours le mouton noir.',
    },
    assoc: {
        icon: ['ui', 'cpCarnet'],
        title: 'Les associations au pré',
        text: 'Certaines bêtes s’entendent bien quand elles partagent un pré, d’autres se gênent. Les associations que tu découvres s’inscrivent au carnet de l’élevage, avec leur effet sur la production. Range bien tes bêtes : ça compte autant que bien les nourrir.',
    },
    comice: {
        icon: ['ui', 'ribbon'],
        title: 'Le Comice agricole',
        text: 'Chaque semaine, le Comice ouvre trois catégories tirées parmi tes espèces. Inscris ta plus belle bête dans chacune : la note compte ses gènes, sa beauté, ses cœurs et sa présentation, et le jury de chaque catégorie regarde surtout l’une des quatre. Brosse-la une fois par jour dans le sens du poil pour gagner des points. Résultats le dimanche soir, contre les quatre fermes voisines. Au comice de 1962, ma vache Violette a mangé la cocarde du gagnant pendant la remise des prix. Le jury nous a donné un prix spécial « pour l’appétit ». Il est encore dans le tiroir de la commode.',
    },
    nbeast: {
        icon: ['ui', 'nmEtal'],
        title: 'Les bêtes de choix des voisins',
        text: 'Chaque ferme voisine vend maintenant une bête de choix par jour, avec un gène au-dessus de la moyenne. Mets-la au pré avec les tiennes et allume les naissances : ses petits pourront en hériter. Quand j’étais jeune, on échangeait les coqs entre fermes pour « rafraîchir le sang ». Le coq des Tilleuls est resté chez nous douze ans. Il chantait à quatre heures, comme chez lui : Hortense l’avait bien dressé.',
    },
    reputation: {
        icon: ['ui', 'hEcusson'],
        title: 'Un élevage qui se fait un nom',
        text: 'Ton élevage monte d’un palier : les prix de la foire augmentent, et les acheteurs viendront plus exigeants, mais plus riches. Papi Lucien disait qu’une réputation se gagne en dix ans et se perd en une foire. Il n’a jamais vendu une bête malade, même quand on avait besoin d’argent. Les marchands le savaient, et ils payaient plus cher chez nous.',
    },
    fair: {
        icon: ['ui', 'hEcusson'],
        title: 'La foire aux bestiaux',
        text: 'Des acheteurs passent avec une demande précise : une espèce, combien de bêtes, et parfois un bon gène ou une jolie robe. Va voir dans Marché, Vendre, Bêtes : le jeu coche ce que tes bêtes remplissent. Plus la demande est exigeante, plus elle paie, et chaque vente fait la réputation de ton élevage. Papi Lucien allait à la foire de Lessay tous les ans avec sa plus belle génisse. Il en revenait toujours sans la génisse, mais avec une vache de plus. Je n’ai jamais compris son calcul.',
    },
    births: {
        icon: ['ui', 'heart'],
        title: 'Des petits au pré',
        text: 'Deux bêtes de la même espèce dans un pré peuvent maintenant avoir un petit. Allume les naissances avec le bouton « Naissances », au-dessus du pré : elles sont éteintes tant que tu ne l’as pas décidé. Ma mère disait qu’un veau né au printemps porte bonheur à toute la ferme. On l’appelait du nom de la fleur la plus proche de l’étable : c’est comme ça qu’on a eu trois Pâquerette de suite.',
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
        text: 'Les voisins du concours ont besoin de vous (onglet Village, volet « Commandes ») : chacun réclame un plat de sa spécialité (deux ou trois quand l’amitié monte, parfois en argent ou en or), paie bien et offre des matériaux rares, puis des cadeaux en devenant votre ami. Chaque lundi, une commande spéciale vous attend.',
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
        text: 'Posez le filet dans le volet Pêche, revenez 20 minutes plus tard et relevez-le : sardines, maquereaux, crevettes, bars… et parfois un homard !',
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
