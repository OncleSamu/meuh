// 1.21 : le Guide du fermier. Un vrai manuel : chaque système du jeu a sa page (à quoi ça sert, comment ça marche, les chiffres à retenir).
// Une page : { id, cat, name, icon, lvl, go, intro, secs: [{ h, t | b }], tips, see }
//   lvl : niveau d'ouverture (la page se lit toujours, mais le bouton « Y aller » attend) ; go : où mène « Y aller » (voir GUIDE_GO)
//   secs : sections (h : titre ; t : un paragraphe ; b : une liste) ; tips : « À retenir » ; see : pages liées
export const GUIDE_CATS = [
    { id: 'base', name: 'Les bases', icon: ['ui', 'info'] },
    { id: 'farm', name: 'La ferme', icon: ['item', 'wheat'] },
    { id: 'animals', name: 'Les animaux', icon: ['animal', 'chicken'] },
    { id: 'craft', name: 'L’atelier', icon: ['machine', 'bakery'] },
    { id: 'nature', name: 'Nature et pêche', icon: ['ui', 'pickaxe'] },
    { id: 'trade', name: 'Vendre et livrer', icon: ['ui', 'coin'] },
    { id: 'village', name: 'Le village', icon: ['ui', 'village'] },
    { id: 'grow', name: 'Progresser', icon: ['ui', 'star'] },
    { id: 'lab', name: 'Génétique', icon: ['ui', 'search'] },
    { id: 'end', name: 'Fin de partie', icon: ['ui', 'cupGold'] },
    { id: 'memo', name: 'Aide-mémoire', icon: ['ui', 'book'] },
];

export const GUIDE_PAGES = [
    {
        id: 'start',
        cat: 'base',
        name: 'Par où commencer ?',
        icon: ['ui', 'star'],
        lvl: 1,
        go: 'farm',
        intro: 'Meuh est un jeu de ferme où tout s’enchaîne : on cultive, on transforme, on livre, et l’argent sert à grandir.',
        secs: [
            {
                h: 'La boucle du jeu',
                b: [
                    'Cultivez et élevez : le champ, les animaux, puis le verger, la pêche, la forêt et la mine.',
                    'Transformez à l’atelier : un plat vaut bien plus que ses ingrédients.',
                    'Livrez : les commandes du village, le train, la montgolfière et le marché paient pièces et expérience.',
                    'Grandissez : l’expérience donne des niveaux, qui ouvrent de nouvelles choses ; les pièces achètent des parcelles, des machines, des chantiers.',
                ],
            },
            {
                h: 'Les premières minutes',
                b: [
                    'Labourez une parcelle, semez du blé, arrosez, puis récoltez.',
                    'Ouvrez le magasin (onglet Marché) : graines, premières bêtes, machines.',
                    'Regardez l’onglet Village › Commandes : touchez un produit manquant et le jeu vous mène là où on le fait.',
                    'Mamie Odette présente chaque nouveauté la première fois qu’elle apparaît.',
                ],
            },
            {
                h: 'Quand on ne sait plus quoi faire',
                t: 'Le panneau « À faire » au-dessus du champ liste les urgences : récoltes prêtes, machines à vider, visiteurs au village. Le Menu › Les niveaux montre ce que chaque niveau ouvre, et cette page de guide sert de mémoire.',
            },
        ],
        tips: [
            'Rien ne se perd jeu fermé : cultures, machines, cave et visiteurs avancent sans vous.',
            'On ne vous punit jamais pour une pause : seuls les imprévus attendent votre retour.',
        ],
        see: ['time', 'screens', 'levels'],
    },
    {
        id: 'time',
        cat: 'base',
        name: 'Le temps',
        icon: ['ui', 'clock'],
        lvl: 1,
        go: 'farm',
        intro: 'Deux horloges coexistent : l’heure de la ferme (rapide) et le temps réel (celui de votre montre).',
        secs: [
            {
                h: 'L’heure de la ferme',
                t: 'L’horloge en haut du champ donne l’heure du jeu. Une journée de jeu dure environ 5 minutes, une saison (12 jours) environ une heure. Elle règle les saisons, la météo et la nuit.',
            },
            {
                h: 'Le temps réel',
                t: 'Tous les minuteurs affichés sont en temps réel : « 2 h » veut dire deux vraies heures. C’est le cas du train, de la montgolfière, du cargo, d’Armand, des machines, de la cave, des nasses et des ouvriers.',
            },
            {
                h: 'Jeu fermé',
                t: 'La ferme continue sans vous : cultures arrosées et mûries, bêtes nourries, machines, cave, visiteurs, commis, bûcheron et mineur. Seuls les imprévus (corbeaux, pucerons, bête malade) attendent votre retour. Au retour, un écran « Bon retour » résume ce qui s’est passé.',
            },
        ],
        tips: ['L’almanach (touchez l’horloge) rappelle la saison, la météo et les fêtes à venir.'],
        see: ['seasons', 'agenda'],
    },
    {
        id: 'screens',
        cat: 'base',
        name: 'Les onglets et le menu',
        icon: ['ui', 'village'],
        lvl: 1,
        go: 'farm',
        intro: 'Le jeu se range en cinq onglets en bas, avec un en-tête et un menu toujours à portée.',
        secs: [
            {
                h: 'Les cinq onglets',
                b: [
                    'Ferme : le champ, la serre, le verger, la nature (forêt et mine), l’étang et l’île.',
                    'Animaux : les prés, l’étable, la transhumance.',
                    'Atelier : les machines, le comptoir, la cave, la brasserie et le labo.',
                    'Village : les commandes (tableau, train, cargo, Armand…) et le village (chapitres, villageois, concours, domaine).',
                    'Marché : le magasin pour acheter, le grossiste et l’étal pour vendre.',
                ],
            },
            {
                h: 'L’en-tête',
                b: [
                    'L’étoile et la barre bleue : votre niveau et votre expérience.',
                    'Les pièces : la monnaie du jeu.',
                    'La grange : votre stock et sa place. Touchez-la pour tout voir.',
                    'Le menu : progrès, livre de la ferme, niveaux, statistiques, succès, almanach, guide, réglages.',
                ],
            },
            {
                h: 'Le panneau « À faire »',
                t: 'Au-dessus du champ, des pastilles disent où quelque chose vous attend. Les urgences passent devant ; le reste se cache derrière « +N ».',
            },
            { h: 'Grands écrans', t: 'Sur un ordinateur ou une tablette large, le champ reste à gauche et l’onglet courant s’affiche à droite.' },
        ],
        see: ['start', 'barn'],
    },
    {
        id: 'barn',
        cat: 'base',
        name: 'La grange',
        icon: ['ui', 'barn'],
        lvl: 1,
        go: 'farm',
        intro: 'Votre stock tient dans la grange, qui a un nombre de places limité.',
        secs: [
            {
                h: 'Quand elle est pleine',
                t: 'Une grange pleine bloque les récoltes et les productions. Vendez, livrez ou agrandissez-la. Touchez le compteur en haut pour voir le détail.',
            },
            {
                h: 'Comment l’agrandir',
                b: [
                    'Avec planches, clous et peinture (matériaux rares) au Chantier de la ferme.',
                    'Avec la maison de la ferme (+40 puis +80 places).',
                    'Avec le ponton du village (+60 places).',
                    'Avec le domaine, branche « Grange agrandie » : jusqu’à +850 places.',
                ],
            },
            {
                h: 'Garder de côté',
                t: 'La réserve (Marché › Vendre) met de côté ce que demandent vos commandes et vos défis, pour ne pas le vendre par erreur.',
            },
            {
                h: 'Le coffre-fort (niveau 15)',
                b: [
                    'Dans la grange, touchez un produit puis « Au coffre » : choisissez la qualité (normal, argent, or, platine, diamant) et la quantité. Le produit garde sa qualité.',
                    'Depuis la cave, la réserve a un bouton « Au coffre » pour garder un lot : un grand cru, un champagne légendaire en diamant.',
                    'Ce qui est au coffre ne se vend pas, ne part pas dans une commande ou une recette, et ne prend pas de place dans la grange. « Reprendre » le rend (il faut de la place dans la grange).',
                    '6 emplacements au départ, 4 agrandissements de 4 emplacements (20 000, 80 000, 320 000 puis 1 280 000 pièces). Un emplacement garde jusqu’à 99 unités d’un même produit et d’une même qualité.',
                    'Une nouvelle ferme (prestige) vide le coffre, mais il garde sa taille.',
                ],
            },
        ],
        see: ['domaine', 'house', 'market'],
    },
    {
        id: 'levels',
        cat: 'base',
        name: 'Niveaux et expérience',
        icon: ['ui', 'star'],
        lvl: 1,
        go: 'sheet:levels',
        intro: 'Chaque niveau ouvre quelque chose : une culture, une bête, une machine, un chantier, un événement.',
        secs: [
            {
                h: 'Gagner de l’expérience',
                t: 'Presque tout rapporte de l’expérience : récolter, fabriquer, livrer, rénover le village, pêcher, aider un villageois. Les commandes et les chantiers sont les plus généreux.',
            },
            {
                h: 'Ce que donne un niveau',
                b: [
                    'Un point de compétence à placer dans Progrès.',
                    'Les nouveautés du niveau, listées au moment du passage et dans Menu › Les niveaux (les grandes étapes y sont surlignées).',
                ],
            },
            {
                h: 'Les grandes étapes',
                t: 'Verger 10, serre 15, cave 20, hameau et commis 25, port 30, abbaye et brasserie 35, île 38, génétique 40, Salon 43, alpage 45, et le niveau 50 pour les grands défis, la renommée et le prestige. Entre deux : Armand au 22, le domaine au 25, le comptoir au 32.',
            },
            { h: 'Après le niveau 50', t: 'L’expérience donne des étoiles de renommée : voir « Renommée et Ferme légendaire ».' },
        ],
        see: ['skills', 'legend'],
    },
    {
        id: 'save',
        cat: 'base',
        name: 'Sauvegarde et réglages',
        icon: ['ui', 'gear'],
        lvl: 1,
        go: 'sheet:settings',
        intro: 'Le jeu se sauvegarde tout seul, sur votre appareil, sans compte.',
        secs: [
            {
                h: 'La sauvegarde',
                b: [
                    'Automatique toutes les 5 secondes, sur l’appareil uniquement.',
                    'Export et import par code : pour changer de téléphone ou garder une copie.',
                    'Trois copies de secours automatiques, restaurables en un geste.',
                    'Tout effacer repart de zéro (à utiliser avec précaution).',
                ],
            },
            {
                h: 'Les réglages',
                b: [
                    'Musique, sons, vibrations, rappels en arrière-plan.',
                    'Replanter après la récolte ; confirmer les gros achats (une fenêtre de confirmation avant un achat important).',
                    'Animations réduites, taille du texte, contraste renforcé, plein écran, lucioles.',
                    'Installer l’appli : elle fonctionne sans connexion, comme une vraie application.',
                ],
            },
        ],
        tips: ['Aucune donnée ne quitte l’appareil : si vous changez de téléphone, exportez d’abord votre code.'],
        see: ['start'],
    },
    {
        id: 'nmarket',
        cat: 'trade',
        name: 'Le marché des voisins',
        icon: ['ui', 'nmEtal'],
        lvl: 12,
        go: 'market/shop',
        intro: 'Les quatre fermes voisines vendent leurs produits au marché, et livrent sur commande ce qu’il vous manque.',
        secs: [
            {
                h: 'Les étals',
                b: [
                    'Marché | Acheter, rayon Voisins. Hortense (les Tilleuls) vend légumes et fruits ; Bastien (Bellevue) lait, œufs, laine et miel ; Yvette (les Trois Chênes) poissons et viandes ; Firmin (le Moulin Rouge) farine, huile, sucre et tissu. Seulement des produits que vous avez déjà débloqués.',
                    'Les étals changent toutes les 4 heures. Plus un voisin a de cœurs, plus il propose d’offres (de 2 à 6), de quantité, et moins c’est cher (de 2,4 fois la valeur du produit à 1,6 fois). À 5 cœurs, sa première offre est un coup de cœur en qualité or.',
                ],
            },
            {
                h: 'La demande d’achat',
                b: [
                    'L’étal à l’envers : choisissez un produit, une quantité et votre prix (de 1,2 à 2,5 fois la valeur). Plus vous payez, plus il livre vite : 3 heures au prix le plus bas, 15 minutes au plus haut. Chaque cœur de la voisine raccourcit le délai de 5 %.',
                    'Vous ne payez qu’à la livraison, et vous pouvez annuler avant. 2 demandes en même temps, puis 3 et 4 avec l’amitié ; la quantité maximale grandit aussi avec les cœurs.',
                ],
            },
            {
                h: 'La fidélité',
                b: [
                    'Chaque achat chez un voisin remplit sa jauge de fidélité : pleine, il vous offre un cœur de plus. Acheter, c’est aussi se faire des amis.',
                ],
            },
        ],
    },
    {
        id: 'companions',
        cat: 'farm',
        name: 'Les cultures compagnes',
        icon: ['ui', 'cpCarnet'],
        lvl: 9,
        go: 'farm/field',
        intro: 'Des cultures plantées côte à côte s’entraident ou se gênent, comme au vrai potager.',
        secs: [
            {
                h: 'Le principe',
                b: [
                    'Une parcelle compte ses voisines directes : à gauche, à droite, dessus et dessous (le champ a 6 colonnes, la serre 4). Une bonne association donne une feuille verte entre les deux parcelles, une mauvaise une feuille fanée.',
                    'Effets d’une association : pousse +15 %, qualité +12 (plus de récoltes en argent et en or), récolte +10 % (chance d’une unité de plus), ou moitié moins de pucerons et de corbeaux. Les malus : pousse −10 %, qualité −8, nuisibles ×1,5. Par parcelle, c’est plafonné : pousse +30 %, qualité +20, récolte +25 %.',
                    'Les trois sœurs : maïs, haricot vert et citrouille réunis autour d’une parcelle (elle et ses voisines) donnent +25 % de récolte et +6 de qualité ; un petit insigne s’affiche dans le coin.',
                    'La lavande et le sarrasin profitent à toutes leurs voisines ; une légumineuse (pois, haricot, lentilles, soja) fait pousser plus vite la céréale voisine (blé, maïs, orge, riz, sarrasin) : l’engrais vert.',
                ],
            },
            {
                h: 'Le carnet du potager',
                b: [
                    '42 associations (34 bonnes, 8 mauvaises), de plus en plus nombreuses avec les niveaux. Chacune se découvre la première fois qu’on récolte une parcelle qui en profite… ou qui en souffre.',
                    'Récompenses à 5, 10, 20 et 30 associations (pièces, compost, graines de safran), et un ruban quand le carnet est complet. La carte du carnet est sous le champ.',
                ],
            },
            {
                h: 'Le conseil de Mamie',
                t: 'Chaque jour, Mamie Odette propose une association à essayer : récoltez le nombre demandé de parcelles qui en profitent. Récompense : pièces, expérience, 3 graines de safran, et parfois du compost.',
            },
        ],
        tips: [
            'Alternez vos rangées (une de carottes, une d’oignons) : le semoir sème une rangée entière, et Théo replante la même culture au même endroit.',
            '« Tout récolter » garde les associations : une parcelle tout juste récoltée compte encore pour ses voisines.',
        ],
        see: ['field'],
    },
    {
        id: 'field',
        cat: 'farm',
        name: 'Le champ',
        icon: ['item', 'wheat'],
        lvl: 1,
        go: 'farm/field',
        intro: 'Labourer, semer, arroser, récolter : le cœur de la ferme, avec des gestes qui s’enchaînent.',
        secs: [
            {
                h: 'Les gestes',
                b: [
                    'Labourer une parcelle d’herbe, choisir une graine, semer, arroser, puis récolter quand c’est mûr.',
                    'Glissez le doigt sur plusieurs parcelles pour enchaîner le même geste.',
                    'Les boutons Arroser et Récolter traitent tout le champ d’un coup ; Semer replante avec la graine choisie.',
                    'Outils : la main, la pelle (arracher), le compost et l’engrais (dès le niveau 4), les graines.',
                ],
            },
            {
                h: 'Agrandir',
                t: 'Le cadenas achète une parcelle de plus contre des pièces (une fenêtre demande confirmation). Plus il y a de parcelles, plus la suivante coûte cher.',
            },
            {
                h: 'Qualité des récoltes',
                t: 'Chaque récolte sort normale, argent ou or. L’or vaut plus, compte pour les défis et donne des plats d’or. De bons sols, la serre, des engrais, les compétences et les variétés du labo augmentent les chances. Quand vous maîtrisez un produit, une récolte en or peut monter en platine (maîtrise or), puis en diamant (maîtrise platine) : ×2,1 et ×2,8 le prix.',
            },
            {
                h: 'Les graines',
                t: '51 cultures hors île, chacune ouverte à son niveau (blé 1, carotte 2, tomate 4, maïs 6…). Certaines demandent un chantier (houblon, génépi) ou ne poussent qu’en serre (cacao, vanille, menthe, poivre noir, orchidée). Le safran ne se trouve que chez le marchand ambulant.',
            },
            {
                h: 'Replanter vite',
                t: 'Dans les réglages, « Replanter après la récolte » ressème tout seul la même culture. Le semoir (niveau 16) sème toute une rangée d’un geste ; la moissonneuse (niveau 24) donne parfois un produit de plus sur une rangée entière d’une même culture.',
            },
        ],
        tips: ['Une culture « de saison » pousse plus vite : regardez le magasin pour la saison de chaque graine.'],
        see: ['seasons', 'soil', 'greenhouse', 'incidents'],
    },
    {
        id: 'seasons',
        cat: 'farm',
        name: 'Saisons et météo',
        icon: ['ui', 's_spring'],
        lvl: 1,
        go: 'farm/field',
        intro: 'Quatre saisons de 12 jours de jeu (environ une heure), et une météo qui change la journée.',
        secs: [
            {
                h: 'Les saisons',
                t: 'Printemps, été, automne, hiver. Une culture de saison pousse 30 % plus vite et donne plus souvent des récoltes de qualité ; hors saison elle pousse normalement, sauf en hiver où elle va 40 % moins vite (la serre n’a pas ce défaut). Chaque saison a sa fête (chasse aux œufs, fête de l’été, foire d’automne, marché de Noël) et ses arbres de saison au verger.',
            },
            {
                h: 'La météo',
                b: [
                    'Ensoleillé : +10 % de pousse. Couvert : −5 %. Neige : −20 %. Éclaircies : rien de spécial.',
                    'Pluie : elle arrose tout le champ pour vous.',
                    'Canicule : +15 % de pousse, mais la terre sèche deux fois plus vite : arrosez souvent, ou laissez faire un puits.',
                    'Orage : tout est arrosé et la pousse gagne 20 %, mais la foudre peut brûler une culture, sauf si un paratonnerre est posé.',
                    'Arc-en-ciel : les récoltes dorées sont trois fois plus fréquentes, et la qualité or deux fois plus.',
                ],
            },
            { h: 'Où voir ce qui arrive', t: 'L’almanach (touchez l’horloge) montre la saison, la météo et les fêtes à venir.' },
        ],
        see: ['field', 'time', 'events'],
    },
    {
        id: 'soil',
        cat: 'farm',
        name: 'Les sols',
        icon: ['ui', 'soilWet'],
        lvl: 4,
        go: 'farm/field',
        intro: 'Chaque parcelle a un sol, et chaque culture a son sol préféré.',
        secs: [
            {
                h: 'Trois sols',
                t: 'Sol humide, sol sec et ensoleillé, sol ombragé. Une culture posée dans le sol qu’elle aime pousse 25 % plus vite et donne plus souvent des récoltes de qualité (+12 points de chance) ; ailleurs elle pousse normalement, sans pénalité.',
            },
            { h: 'Où voir le sol préféré', t: 'Le magasin l’indique pour chaque graine, et le champ montre le sol de chaque parcelle.' },
        ],
        tips: ['Pas besoin de tout optimiser : choisissez simplement la bonne parcelle pour vos cultures les plus rentables.'],
        see: ['field'],
    },
    {
        id: 'greenhouse',
        cat: 'farm',
        name: 'La serre',
        icon: ['ui', 'greenhouse'],
        lvl: 15,
        go: 'farm/field',
        intro: 'Une serre à construire : des parcelles qui s’arrosent seules, en toute saison.',
        secs: [
            {
                h: 'Ce qu’elle apporte',
                b: [
                    '6 à 12 parcelles (en plus avec le Chantier de la ferme), sans arrosage, toute l’année.',
                    'Les cultures y poussent plus vite et donnent de plus belles récoltes, surtout hors saison.',
                    'Certaines cultures ne poussent qu’en serre : cacao, vanille, menthe (niveau 24), poivre noir (35), orchidée (41).',
                ],
            },
            { h: 'Comment s’en servir', t: 'Construisez-la dans la ferme, puis semez dedans comme au champ. Le bouton Récolter la couvre aussi.' },
        ],
        see: ['field', 'seasons'],
    },
    {
        id: 'orchard',
        cat: 'farm',
        name: 'Le verger',
        icon: ['item', 'apple'],
        lvl: 10,
        go: 'farm/orchard',
        intro: 'Des arbres qui donnent des fruits longtemps, avec leurs saisons, leurs soins et leurs greffons.',
        secs: [
            {
                h: 'Les arbres',
                b: [
                    'Une place par arbre : 4 offertes, jusqu’à 24.',
                    'Un arbre grandit, puis fait tomber des fruits à son pied (jusqu’à 8 au sol) : ramassez-les d’un appui, sinon ils pourrissent.',
                    'Un arbre vieillit après une centaine de fruits, ralentit, puis meurt : débitez-le en bois et replantez.',
                    'Un appui long ouvre la fiche : maturité, greffon, soins.',
                ],
            },
            {
                h: 'Maturité et saisons',
                t: 'Chaque arbre compte ses fruits donnés (jusqu’à 75) : plus il est mûr (1 à 3 étoiles), plus ses fruits sont souvent argent ou or. Chaque espèce a sa saison où elle donne 30 % plus vite (10 % plus lent dehors).',
            },
            {
                h: 'Greffons et boutures',
                t: 'Un greffon par arbre : doré (un fruit sur quatre en or), double (deux fruits, plus lent), éternel (ne vieillit jamais), précoce (plus vite) et robuste (plus durable). Un arbre abattu après au moins 50 fruits laisse une bouture qui garde son greffon.',
            },
            { h: 'Soins', t: 'Tailler en hiver, fumer, rajeunir : voir la fiche de l’arbre. La vitesse totale est plafonnée.' },
            {
                h: 'Odile et les événements',
                b: [
                    'Odile, l’arboricultrice, propose un défi par jour.',
                    'Floraison (3 premiers jours du printemps) : les ruches donnent des fruits en plus.',
                    'Gelée de printemps : allumez les torches de résine pour protéger les arbres.',
                    'Grande cueillette, fête du cidre, vendanges, concours du plus beau panier chaque week-end.',
                ],
            },
            {
                h: 'Aides',
                t: 'Le cueilleur (niveau 22) ramasse les fruits au sol toutes les 2 heures, même jeu fermé. « Débiter les morts » coupe d’un geste tous les arbres morts.',
            },
        ],
        tips: ['Les vignes se croisent au labo : un cépage donne de meilleurs raisins pour le vin.'],
        see: ['cave', 'island', 'labplants'],
    },
    {
        id: 'island',
        cat: 'farm',
        name: 'L’île',
        icon: ['item', 'pineapple'],
        lvl: 38,
        go: 'farm/island',
        intro: 'Une île tropicale où tout pousse sans arrosage et en toute saison.',
        secs: [
            { h: 'Comment l’ouvrir', t: 'Au niveau 38, une fois l’abbaye rénovée, réparez le bac de Tiago (Village › Village, carte « L’île »).' },
            {
                h: 'Les parcelles et le verger',
                b: [
                    '6 parcelles offertes, jusqu’à 18. Jamais d’arrosage, toujours de saison.',
                    'Ananas, patate douce, fruit de la passion, manioc, gingembre, fleur de tiaré.',
                    'Un verger des îles : 4 places jusqu’à 12, pas d’hiver. Bananier, cocotier, manguier, papayer, citronnier vert, avocatier, goyavier, caféier, litchi.',
                ],
            },
            {
                h: 'Les machines des îles',
                t: 'La paillote, le four des îles, la brûlerie et la rhumerie ouvrent de nouvelles machines et de nouvelles recettes.',
            },
        ],
        see: ['village', 'workshop'],
    },
    {
        id: 'night',
        cat: 'farm',
        name: 'La nuit',
        icon: ['ui', 'firefly'],
        lvl: 11,
        go: 'farm/field',
        intro: 'De 20 h à 6 h du jeu, le champ s’assombrit et la nuit réserve de petites surprises.',
        secs: [
            { h: 'Durée', t: 'La nuit dure environ 2 minutes réelles.' },
            {
                h: 'Lucioles et étoiles filantes',
                b: [
                    'Lucioles (printemps et été) : chaque récolte de nuit en met une dans le bocal ; 20 le remplissent.',
                    'Étoile filante (4 nuits sur 10) : touchez-la pour faire un vœu (6 récoltes en or, animaux plus rapides, ou un cadeau).',
                    'Les champignons poussent plus vite la nuit ; certains poissons ne mordent que la nuit.',
                ],
            },
            { h: 'Marché de nuit', t: 'Les soirs d’été (niveau 14), le Marché de nuit propose des graines et des décorations rares.' },
        ],
        see: ['pond', 'market'],
    },
    {
        id: 'incidents',
        cat: 'farm',
        name: 'Imprévus et corbeaux',
        icon: ['ui', 'crow'],
        lvl: 3,
        go: 'farm/field',
        intro: 'De petits problèmes arrivent sans prévenir : réagissez vite, ils ne coûtent presque jamais cher.',
        secs: [
            {
                h: 'Les imprévus',
                b: [
                    'Corbeaux (dès le niveau 3) : touchez-les pour les chasser.',
                    'Pucerons : touchez la parcelle pour la soigner ; la mare aux canards les tient éloignés.',
                    'Animal malade : soignez-le depuis sa fiche.',
                    'Acheteur pressé : une commande à livrer vite, très bien payée.',
                ],
            },
            {
                h: 'Les protections',
                t: 'L’épouvantail, le nichoir à chouette et le chien éloignent les corbeaux ; le paratonnerre protège de la foudre. Ce sont des décorations à poser sur une parcelle.',
            },
            { h: 'Jeu fermé', t: 'Les imprévus n’arrivent pas en votre absence : ils attendent votre retour.' },
        ],
        see: ['decor', 'events'],
    },
    {
        id: 'animals',
        cat: 'animals',
        name: 'Les animaux',
        icon: ['animal', 'chicken'],
        lvl: 2,
        go: 'animals',
        intro: '17 espèces, chacune avec son produit : un appui pour ramasser, un repas pour la faire produire.',
        secs: [
            {
                h: 'Les gestes',
                b: [
                    'Un appui ramasse la production ou donne un repas ; un appui long ouvre la fiche.',
                    '« Tout nourrir » donne un repas à tout le monde. La mangeoire automatique les nourrit seule.',
                    'Un câlin par jour de jeu (environ 5 minutes réelles) rend une bête plus productive, jusqu’à 5 cœurs.',
                ],
            },
            {
                h: 'Les espèces',
                t: 'Poule 2, canard 4, mouton 7, lapin 11, oie 12, caille 14, vache 18, dinde et ruche d’élevage 21, chèvre 24, cheval et brebis laitière 27, cochon 31, ânesse 41, bufflonne 42, paon 43, alpaga 49.',
            },
            {
                h: 'La fiche d’une bête',
                t: 'Nom (à changer), gènes, lignée, soins. Elle permet aussi de la vendre (la moitié de son prix, plus pour une bête d’exception ou de race) ou de la déplacer vers un autre pré.',
            },
            { h: 'Animal d’exception', t: 'Rare : 50 % plus rapide.' },
            {
                h: 'Seconds produits',
                t: 'Environ une fois sur dix au ramassage, certaines bêtes donnent en plus un produit pour le saloir : lard du cochon, magret du canard, cuisse de l’oie, filet de la dinde, bœuf de la vache, râble du lapin.',
            },
        ],
        see: ['pastures', 'transhumance', 'labanimals'],
    },
    {
        id: 'pastures',
        cat: 'animals',
        name: 'Les prés et l’étable',
        icon: ['ui', 'barn'],
        lvl: 2,
        go: 'animals',
        intro: 'Les bêtes vivent dans des prés ; l’étable montre tout le troupeau en fiches.',
        secs: [
            {
                h: 'Les prés',
                b: [
                    'Un pré accueille 20 bêtes (jusqu’à 32 avec le Chantier de la ferme) ; vous pouvez en avoir jusqu’à 20.',
                    'Acheter un pré demande confirmation.',
                    'Renommez un pré avec le petit crayon, déplacez une bête depuis sa fiche.',
                ],
            },
            { h: 'L’étable', t: 'Elle présente tout le troupeau en fiches : pratique pour comparer, soigner et vendre.' },
            { h: 'Le charme', t: 'Les paons ajoutent du charme au concours de la semaine.' },
        ],
        see: ['animals', 'contest'],
    },
    {
        id: 'transhumance',
        cat: 'animals',
        name: 'La transhumance',
        icon: ['ui', 'mountain'],
        lvl: 45,
        go: 'animals',
        intro: 'Envoyez quelques bêtes à l’alpage : elles rapportent du lait et de la laine d’altitude.',
        secs: [
            {
                h: 'Comment ça marche',
                b: [
                    'Après la bergerie d’altitude (chapitre 9, « Les estives », niveau 45), 4 bêtes adultes peuvent monter à l’alpage (8 avec le téléphérique). Seules les vaches, chèvres, moutons et bufflonnes montent.',
                    'Le séjour dure 1 h 30 (45 minutes avec le téléphérique). Au retour : du lait d’alpage (6 par bête, 2 par mouton) et 6 laines par mouton.',
                    'Les bêtes revenues produisent ensuite 20 % plus vite.',
                    'Une bête en transhumance ne peut pas être vendue.',
                ],
            },
        ],
        see: ['village', 'workshop'],
    },
    {
        id: 'haras',
        cat: 'animals',
        name: 'Le Grand Haras',
        icon: ['ui', 'hEcuries'],
        lvl: 44,
        go: 'animals/haras',
        intro: 'Logez vos chevaux en boxes, soignez-les, entraînez-les au galop, à l’endurance, au dressage et au saut, faites-les concourir chaque semaine et élevez vos propres lignées.',
        secs: [
            {
                h: 'Le bâtiment',
                b: [
                    'Au niveau 44, construisez les écuries (onglet Animaux, volet Écuries) : 4 boxes, puis 8 et 12 avec deux agrandissements.',
                    'Un cheval logé quitte les prés (il ne compte plus dans leur place) mais donne toujours son crin : ramassez-le depuis sa fiche.',
                    'Chaque box est une petite carte (nom, forme, aptitudes) : touchez-la pour ouvrir la fiche complète, la flèche du coin la replie.',
                ],
            },
            {
                h: 'La forme',
                t: 'Cinq pastilles. Un entraînement, un passage de concours ou une randonnée en coûte une ; elle remonte d’une pastille toutes les 30 minutes, même jeu fermé. À zéro, rien n’est perdu : il suffit d’attendre.',
            },
            {
                h: 'Les quatre aptitudes',
                b: [
                    'Galop (gène Vitesse), endurance (Robustesse), dressage (Docilité) et saut (Détente, un gène propre au cheval).',
                    'Chaque aptitude monte de 0 jusqu’à un plafond de 40 + 12 × le gène (gène 2 : 64 ; gène 5 : 100). Croisez vos chevaux au labo pour viser plus haut.',
                    'Une séance donne 3 à 8 points ; le gain diminue près du plafond. Plus l’aptitude est haute, plus le mini-jeu est facile (galop plus rapide, anneau plus lent, tracé plus tolérant, pouls plus solide). Les cœurs d’amitié et une ration (carotte, pomme ou orge : +10 % pendant 1 heure) l’augmentent.',
                    'Touchez l’icône d’une discipline pour en faire la spécialité du cheval : elle comptera davantage en concours.',
                    'Les quatre disciplines se jouent en mini-jeu (30 à 60 secondes) : le score décide des points. Le galop : tenez le doigt pour accélérer, relâchez pour ralentir, aiguille dans le vert à l’entrée des virages, puis sprint. Le saut : appuyez quand l’anneau touche la cible, huit obstacles, trois fautes éliminent. Le dressage : suivez du doigt le tracé de quatre figures dans le manège (volte, serpentine, diagonale, huit), précision et régularité font la note. L’endurance : un raid en trois étapes, choisissez pas, trot ou galop selon le terrain, un pouls trop haut ralentit le cheval (la forme relève la limite) et le vétérinaire contrôle à chaque étape. La séance coûte sa pastille de forme dès le départ ; « Séance rapide » donne un score moyen sans jouer.',
                ],
            },
            {
                h: 'Les soins',
                b: [
                    'Brosser : un cœur de plus et parfois une pastille de forme, une fois toutes les 2 heures.',
                    'Nourrir : remplit la mangeoire avec la nourriture du stock.',
                    'Randonnée de 2 heures : une pastille de forme, quelques trouvailles (champignons, châtaignes, bois, miel…) et 2 points d’endurance.',
                ],
            },
            {
                h: 'La sellerie et l’équipement',
                b: [
                    'La sellerie de Jules (au Marché, niveau 44) fabrique neuf objets : fers en fer (+3 galop et saut) ou en argent (+6), selles de dressage, d’obstacle (+6) et de course (+8 galop), bride (+3 dressage et +3 présentation), tapis (+2 présentation), couverture d’hiver et brosse en crin.',
                    'Dans la fiche d’un cheval, « Équipement » : un objet par emplacement, il quitte votre stock. Les bonus d’aptitude et de présentation comptent pour la note de concours, pas pour l’entraînement. La couverture fait remonter la forme en 20 minutes au lieu de 30 ; la brosse rend plus souvent une pastille de forme quand on brosse.',
                ],
            },
            {
                h: 'L’élevage : robes, poulains et retraite',
                b: [
                    'Chaque cheval a des gènes de robe (bai, alezan, noir, gris, palomino, isabelle, crème, rouan, aubère, louvet, bai brun) et de marques (étoile, liste, belle face, balzanes, pie, appaloosa, raie de mulet, crins lavés). Ils viennent des deux parents : certains sont dominants (le gris l’emporte sur tout), d’autres récessifs (la belle face, les crins lavés), et il peut y avoir une surprise. L’apparence fantaisiste des gènes du jeu (couleur, motif, finition) se pose par-dessus la robe.',
                    'Un poulain naît à l’étable de sélection, avec le dessin d’un poulain puis d’un jeune avant d’être adulte. Onglet Animaux, « Élevage » : votre nom d’élevage (le crayon le change), la collection des robes et des marques déjà vues, les descendants et l’arbre de famille.',
                    'Un cheval qui a gagné en division Élite peut prendre sa retraite (3 reproducteurs au plus) : il quitte son box pour le pré, rapporte des saillies chaque jour (plus il a gagné de concours, plus elles valent ; jusqu’à une semaine cumulée) et ses poulains naissent avec 10 points dans sa spécialité. Trois champions de suite dans une même famille : « Lignée célèbre » et un ruban. À chaque naissance, une fiche présente le poulain (robe, parents, talent) et vous laisse choisir son nom.',
                ],
            },
            {
                h: 'Les concours',
                b: [
                    'Onglet Animaux, « Concours » : une discipline par semaine (galop, saut, dressage, endurance), cinq divisions (Poneys, Amateurs, Club, Élite, Prestige). Choisissez une division et inscrivez jusqu’à trois chevaux logés différents (5 % de la bourse chacun) ; ceux d’une même division courent aussi entre eux. Jouez leurs passages quand vous voulez avant lundi : un passage coûte une pastille de forme. Pas de passage ? Jules monte à votre place.',
                    'La note : aptitude 55 %, passage 30 %, présentation 15 % (les cœurs d’amitié), +10 % pour la spécialité. Le lundi, vos chevaux sont classés avec cinq rivales : bourse pour les trois premiers (100, 50 et 25 %), rosette pour les deux premiers, coupe pour le vainqueur.',
                    'Trois rosettes dans une division ouvrent la suivante ; une victoire écrasante (12 points d’avance sur la 2e) en compte deux. La première victoire de chaque division (sauf Poneys) offre une décoration unique ; une victoire en Élite et chaque Grand Prix rapportent un ruban. Rosettes et coupes comptent dans le charme du concours de la ferme.',
                    'Le Grand Prix du mois, le premier week-end : les quatre disciplines avec le même cheval, bourses doubles. L’Agenda affiche tout cela.',
                ],
            },
        ],
        see: ['animals', 'labanimals'],
    },
    {
        id: 'workshop',
        cat: 'craft',
        name: 'L’atelier et les machines',
        icon: ['machine', 'bakery'],
        lvl: 3,
        go: 'machines/workshop',
        intro: 'Transformer vaut mieux que vendre brut : 38 machines et près de 500 recettes.',
        secs: [
            {
                h: 'Les machines',
                b: [
                    'Elles s’achètent au magasin, du four à pain (niveau 2) à la cuverie (niveau 48). Une machine s’ouvre au plus par niveau, toujours avec au moins une recette faisable.',
                    'Chaque machine a une file d’attente : ajoutez des lots, ils s’enchaînent. La file s’allonge avec la maison, le Chantier de la ferme et le domaine.',
                    'Le bouton Boucle relance la dernière recette tant qu’il y a les ingrédients.',
                ],
            },
            {
                h: 'Les recettes',
                t: 'Chaque ingrédient (légume, fruit, produit animal, poisson) sert à au moins 3 recettes. Une recette se débloque avec le niveau, un villageois qui vous l’apprend (amitié) ou une fête.',
            },
            {
                h: 'Qualité',
                t: 'Avec de bons ingrédients (argent, or, belles variétés), un plat sort en argent ou en or, et se vend plus cher. Platine et diamant demandent des ingrédients de ce rang. Dans la grange, touchez un produit pour voir combien sont normaux, en argent, en or, en platine ou en diamant. À l’atelier, une étoile sur la recette annonce la qualité que donnerait le lot avec votre stock.',
            },
            {
                h: 'Chaque machine, un métier',
                t: 'Moulin, four, cuisine, huilerie, forge, pressoir, fumoir, laiterie, poterie, confiserie, glacier, joaillerie, saloir, alambic… Certaines viennent d’un chantier du village, d’autres de l’île ou de l’alpage.',
            },
        ],
        tips: ['Touchez un produit manquant d’une commande : le jeu vous mène à la bonne machine, recette choisie.'],
        see: ['mastery', 'orders', 'counter'],
    },
    {
        id: 'counter',
        cat: 'craft',
        name: 'Le comptoir',
        icon: ['machine', 'counter'],
        lvl: 32,
        go: 'machines/counter',
        intro: 'Un salon où l’on prépare thés, infusions et cafés au doigt, pour des clients qui paient bien.',
        secs: [
            {
                h: 'L’atelier de boissons',
                b: [
                    '34 boissons. Chacune se prépare en 2 à 3 gestes et reçoit une note de 1 à 3 étoiles (qualité normale, argent, or).',
                    'Les cafés s’ouvrent avec la brûlerie de l’île.',
                    'Le stock sert aux commandes, au train et aux quêtes.',
                ],
            },
            {
                h: 'Le salon',
                b: [
                    'Les villageois viennent commander uniquement quand vous êtes au comptoir.',
                    'Ils paient plus que le marché, font monter l’amitié (plus pour leur boisson préférée) et laissent un pourboire pour 3 étoiles.',
                    'Garde-fous : 8 secondes de repos entre deux boissons, clients et pourboires limités par jour.',
                ],
            },
            {
                h: 'Le bâtiment',
                t: '4 niveaux de salon (2 à 5 places) et 5 décors qui rendent les clients plus patients. Le domaine ajoute un siège de plus (branche « Annexes des métiers »).',
            },
        ],
        see: ['workshop', 'domaine'],
    },
    {
        id: 'cave',
        cat: 'craft',
        name: 'La cave et les enchères',
        icon: ['ui', 'cave'],
        lvl: 20,
        go: 'machines/cave',
        intro: 'Affiner pour que la valeur grimpe : fromages, cidres, vins, champagnes, salaisons et bières.',
        secs: [
            {
                h: 'Mettre en cave',
                t: 'Onglet Atelier, puis Cave. À chaque étape de l’affinage, un lot peut bien vieillir (sa valeur grimpe), mal vieillir (il tourne) ou se perdre. Un lot entièrement en argent, en or, en platine ou en diamant garde sa qualité : il vieillit un peu mieux et se vend plus cher (un vin légendaire en or est le meilleur de la cave).',
            },
            {
                h: 'Prendre soin',
                b: [
                    'Un soin par étape suffit (retourner, soutirer, ouiller, remuer, rouler) ; « Tout soigner » les fait d’un geste.',
                    'Gardez le climat (température et humidité) entre 35 et 65, ou installez l’hygromètre qui le règle seul.',
                    'Plus d’étagères : plus de places (+2 chacune) et des lots plus grands ; voûte, ferments et levures.',
                ],
            },
            {
                h: 'Millésimes et bouteilles',
                t: 'Un vin ou un champagne garde l’année de jeu où il a été mis en cave : année froide (×0,9), bonne année, grande année (×1,15), année du siècle (×1,4). Chaque bouteille porte son millésime ; le crayon lui donne un nom, avec quatre styles d’étiquette.',
            },
            {
                h: 'Les commandes de la cave',
                t: 'Gaston, Maître Anselme, Margaux et d’autres demandent un lot assez vieux (par exemple « 3 comtés au moins Vieux »). Bien payées, elles donnent de l’amitié, de la cote et des points de concours.',
            },
            {
                h: 'Les enchères',
                b: [
                    'Sortez un lot de la cave et déposez-le à la prochaine vente, avec un prix de réserve.',
                    'Petite vente toutes les 4 heures ; grande vente chaque soir à 19 h (après la salle des ventes), avec collectionneurs et lots rares.',
                    'Plus la cote de la cave monte, plus les acheteurs sont riches. Absent, vous retrouvez les résultats.',
                    'Le négociant achète tout de suite, mais moins cher.',
                ],
            },
            { h: 'Trophées', t: 'Chaque lot légendaire entre dans la salle des trophées ; le premier de chaque famille rapporte un ruban.' },
        ],
        see: ['brewery', 'orchard'],
    },
    {
        id: 'brewery',
        cat: 'craft',
        name: 'La brasserie',
        icon: ['ui', 'beer'],
        lvl: 35,
        go: 'machines/brew',
        intro: 'Composez vos propres bières : un malt, du houblon et des ingrédients de la ferme.',
        secs: [
            {
                h: 'Composer une bière',
                b: [
                    'Un malt (blond, ambré, brun ou noir, grillé à la malterie avec l’orge).',
                    'Une dose de houblon : légère, moyenne ou forte.',
                    '1 à 3 ingrédients de la ferme, chacun dosé de 1 à 3. Chaque culture ou fruit a son goût.',
                ],
            },
            {
                h: 'L’accord',
                t: 'L’accord (0 à 3 étoiles) se lit avant de brasser, avec ses raisons ; il fait le prix. Trois étoiles demandent un mélange réussi.',
            },
            {
                h: 'Mes bières',
                b: [
                    'Chaque nouvelle recette reçoit un nom, que vous changez avec le crayon.',
                    'Les étoiles d’une recette restent secrètes jusqu’au premier brassin (on voit des indices).',
                    'Plus vous vendez une même bière, plus son prix baisse, puis il remonte avec le temps.',
                    '« Rebrasser » refait la dernière recette ; les cuves peuvent tourner en boucle.',
                    'Qualité : avec « Meilleurs ingrédients d’abord » (atelier), un brassin fait d’ingrédients en argent, en or, en platine ou en diamant donne des bouteilles de ce rang (même score que les plats). Elles se vendent plus cher et gardent leur rang en cave.',
                ],
            },
            {
                h: 'Commandes et fût',
                t: 'Frère Hugues, Agnès et des habitués demandent une bière précise. Après le cellier à fûts, vos bières vieillissent en fût à la cave. Le livre des bières donne une récompense toutes les 10 pages.',
            },
        ],
        see: ['cave', 'village'],
    },
    {
        id: 'mastery',
        cat: 'craft',
        name: 'La maîtrise des produits',
        icon: ['ui', 'medalB'],
        lvl: 3,
        go: 'sheet:book',
        intro: 'Produire beaucoup d’un même produit lui donne des étoiles, et des avantages pour toujours.',
        secs: [
            {
                h: 'Les rangs',
                t: 'Bronze, argent, or, puis platine et diamant. Les seuils dépendent du type : cultures 300 / 2 500 / 10 000, puis 25 000 et 60 000 ; bêtes 200 / 1 500 / 6 000, puis 15 000 et 36 000 ; produits fabriqués 50 / 400 / 2 000, puis 5 000 et 12 000.',
            },
            {
                h: 'Les avantages',
                b: [
                    '+5 % de prix par étoile, +3 % par rang au-delà de l’or.',
                    'À l’or : le produit est fabriqué 15 % plus vite (+3 % par rang suivant).',
                    'Platine et diamant : la demande du marché baisse 25 % puis 50 % moins vite et ne descend pas sous 40 % puis 55 % du prix.',
                    'Une récompense en pièces à chaque rang.',
                    'Qualité : à la maîtrise or, vos récoltes, produits d’élevage et fruits en or peuvent sortir en platine ; à la maîtrise platine, en diamant.',
                ],
            },
            { h: 'Où la voir', t: 'Dans le Livre de la ferme (Maîtrise) et dans la fiche de chaque produit.' },
            { h: 'Armand', t: 'Armand ne commande que des produits où vous avez au moins une étoile.' },
        ],
        tips: ['Produire en boucle un même produit n’est jamais puni : la maîtrise compense la baisse de demande.'],
        see: ['armand', 'book'],
    },
    {
        id: 'forest',
        cat: 'nature',
        name: 'Forêt, mine et forge',
        icon: ['ui', 'pickaxe'],
        lvl: 3,
        go: 'farm/nature',
        intro: 'Du bois, de la pierre, des minerais et des pierres précieuses pour construire et fabriquer.',
        secs: [
            {
                h: 'La forêt (niveau 3)',
                t: 'Quatre essences : chêne (bois dur) et pin (résine) dès le niveau 3, bouleau (sève, qui devient sirop) et châtaignier (bois dur) dès le niveau 12. Jusqu’à 9 arbres, qui repoussent. Dès le niveau 20, la cueillette de saison (fraises, myrtilles, champignons, noisettes, châtaignes, miel).',
            },
            {
                h: 'La mine',
                b: [
                    'La carrière (niveau 8) : pierre, charbon, fossiles.',
                    'La galerie (niveau 18, il faut acheter une lampe et un wagonnet) : fer, cuivre, charbon, améthystes, quartz.',
                    'La grotte profonde (niveau 30) : argent, or, rubis, saphirs, émeraudes, pépites.',
                    'Une roche qui brille est une veine : trois coups de plus, un minerai et une pierre précieuse à coup sûr.',
                ],
            },
            {
                h: 'Forge et scierie',
                t: 'La forge fond les lingots (fer, cuivre, argent, or) avec du charbon et taille la pierre ; la scierie fait le chêne massif, des poêles, des couverts d’argent, des bijoux, des bougies et du sirop de bouleau. La charbonnière (niveau 12) transforme 12 bois en 5 charbon.',
            },
            {
                h: 'Outils et ouvriers',
                b: [
                    'Hache et pioche : 6 niveaux d’amélioration.',
                    'Le bûcheron (niveau 16) et le mineur (niveau 24) rapportent une charge toutes les 2 heures, même jeu fermé.',
                    'Gaspard, le bûcheron, propose un défi par jour.',
                ],
            },
            {
                h: 'Le Chantier de la ferme',
                t: 'Aux niveaux 14, 22 et 34, trois niveaux d’amélioration pour la grange, les prés, la cave, le verger, la serre, les nasses et chaque machine, fabriqués avec vos matériaux.',
            },
            { h: 'Au marché', t: 'Bois, pierre, minerais, lingots et pierres précieuses se vendent un par un ; « Tout vendre » garde ce qu’il faut.' },
        ],
        see: ['barn', 'workshop', 'domaine'],
    },
    {
        id: 'pond',
        cat: 'nature',
        name: 'L’étang et la pêche',
        icon: ['ui', 'rod'],
        lvl: 9,
        go: 'farm/pond',
        intro: 'Trois coins de pêche, des appâts, un mini-jeu où chaque poisson se bat à sa façon.',
        secs: [
            {
                h: 'Les trois coins',
                b: [
                    'La berge (niveau 9) : gardon, ablette, perche, écrevisse, truite.',
                    'Les roseaux (niveau 11) : tanche, carpe, anguille (de nuit), lotte (nuits d’hiver), brochet, silure par temps de pluie.',
                    'Le ponton (après le chantier du village) : sandre, brochet, silure, saumon, esturgeon ; poissons 25 % plus lourds.',
                    'Le poisson doré, très rare, peut mordre partout.',
                ],
            },
            {
                h: 'Les appâts',
                t: 'Un appât multiplie par 5 les chances des poissons qu’il vise : ver de terre (la boîte se remplit seule), maïs (niveau 11), mouche (niveau 13), vif (au ponton). L’écran montre ce qui mord ici et maintenant, avec les chances.',
            },
            {
                h: 'Le mini-jeu',
                t: 'Gardez la zone verte sous le poisson : calme, allers-retours, tirs forts ou coups brusques selon l’espèce. Une touche au cœur de la zone est une prise parfaite (+20 % de poids). Un ver sur la berge sort les petits poissons d’un seul geste. Trois cannes (bambou, carbone au niveau 14, compétition au niveau 20) élargissent la zone et alourdissent les prises.',
            },
            {
                h: 'Les nasses',
                t: 'Deux nasses dès le niveau 12, quatre dès le niveau 14 (une de plus avec le domaine). Posées dans un coin, avec ou sans appât, elles attrapent 2 à 4 poissons communs toutes les 2 heures, même jeu fermé. Relevez-les d’un appui.',
            },
            {
                h: 'Défis et concours',
                b: [
                    'Marcel propose un défi par jour (nombre de poissons, poids à battre, prises parfaites).',
                    'Chaque automne, la remontée des saumons passe au ponton.',
                    'Concours de pêche le week-end : le plus lourd d’une espèce contre les fermes voisines, classement le lundi.',
                    'Le carnet de pêche garde chaque espèce, où et quand la pêcher, et vos records.',
                ],
            },
            { h: 'En mer', t: 'Après le phare du port, un filet de pêche en mer rapporte sardines, maquereaux, crevettes, bars et parfois un homard.' },
        ],
        see: ['night', 'village', 'workshop'],
    },
    {
        id: 'orders',
        cat: 'trade',
        name: 'Les commandes',
        icon: ['ui', 'basket'],
        lvl: 1,
        go: 'village/orders',
        intro: 'La meilleure source de pièces et d’expérience : le tableau des commandes du village.',
        secs: [
            {
                h: 'Le tableau',
                b: [
                    'Des villageois demandent des produits ; livrez dès que vous avez tout.',
                    'Touchez un produit manquant : le jeu vous mène là où on le fabrique.',
                    'Épinglez une commande pour la garder sous les yeux, ou jetez-la.',
                    'Le nombre de commandes grandit avec le niveau, la maison et le domaine.',
                ],
            },
            {
                h: 'Les autres débouchés',
                t: 'Train, montgolfière et bateau (grosses livraisons bien payées), contrats de saison, avion-cargo, Armand, acheteur pressé : voir leurs pages.',
            },
        ],
        see: ['trains', 'cargo', 'armand', 'contract'],
    },
    {
        id: 'trains',
        cat: 'trade',
        name: 'Train, montgolfière et bateau',
        icon: ['ui', 'trainIcon'],
        lvl: 3,
        go: 'village/orders',
        intro: 'De grosses livraisons bien payées, qui reviennent régulièrement.',
        secs: [
            {
                h: 'Le train (après la gare)',
                t: 'Des wagons à remplir ; un bonus quand tout est chargé. Chaque cheval du haras le fait revenir plus tôt. Il reste environ 1 heure.',
            },
            { h: 'La montgolfière (après l’auberge)', t: 'De grosses commandes bien payées, qui partent après environ 1 heure.' },
            {
                h: 'Le bateau (après le quai)',
                t: 'Quatre produits payés très cher ; il part, puis revient. Le chantier naval le fait revenir plus vite, et le domaine (Quai agrandi) ajoute des lignes.',
            },
            { h: 'Le domaine y change des choses', t: 'La branche « Réception » les fait rester plus longtemps.' },
        ],
        tips: ['Si un visiteur est là, l’onglet Village › Commandes affiche son compte à rebours ; l’Agenda les rassemble tous.'],
        see: ['agenda', 'domaine'],
    },
    {
        id: 'cargo',
        cat: 'trade',
        name: 'L’avion-cargo',
        icon: ['ui', 'plane'],
        lvl: 30,
        go: 'village/orders',
        intro: 'Un avion qui se pose toutes les 48 heures et demande d’énormes quantités.',
        secs: [
            { h: 'Le rythme', t: 'Toutes les 48 heures (temps réel, même jeu fermé), il se pose pour 24 heures.' },
            {
                h: 'Les soutes',
                b: [
                    'Six soutes (trois produits de la ferme, trois de l’atelier), jusqu’à dix avec le domaine.',
                    'Chargez petit à petit : chaque unité est payée tout de suite (2,2 fois son prix).',
                    'Avion plein : un gros bonus (+80 %) et des matériaux rares.',
                    'Touchez un produit pour aller le produire.',
                ],
            },
        ],
        see: ['domaine', 'agenda'],
    },
    {
        id: 'armand',
        cat: 'trade',
        name: 'Armand, chef du Grand Hôtel',
        icon: ['villager', 'armand'],
        lvl: 22,
        go: 'village/orders',
        intro: 'Un visiteur rare qui commande votre produit phare en quantités énormes.',
        secs: [
            { h: 'Les visites', t: 'Une fois par semaine (temps réel, même jeu fermé), il reste 3 jours. Manquer sa visite ne coûte rien.' },
            {
                h: 'Le produit phare',
                b: [
                    'Choisissez parmi les produits où vous avez au moins une étoile de maîtrise.',
                    'Vous pouvez en changer quand il est absent, ou présent tant que vous ne lui avez rien livré.',
                    'La Suite d’Armand (domaine) ouvre jusqu’à 4 produits phares.',
                ],
            },
            {
                h: 'La commande',
                b: [
                    'De 10 à 1 200 unités. Le total est borné par votre niveau (puis relevé par la maîtrise et la fidélité) : un produit trop cher pour votre niveau ne peut pas être choisi.',
                    'Payée à prix fixe (environ 1,8 fois le prix, plus la maîtrise et la fidélité), quelle que soit la demande du marché.',
                    'Commande finie : bonus de 60 %, trois matériaux rares et +1 de fidélité (5 au maximum, par produit).',
                    'Plus la fidélité monte, plus la commande grossit et mieux elle paie.',
                ],
            },
        ],
        tips: ['Sa commande est faite pour produire en boucle un même produit : la maîtrise et la fidélité se renforcent mutuellement.'],
        see: ['mastery', 'domaine'],
    },
    {
        id: 'contract',
        cat: 'trade',
        name: 'Contrats de saison',
        icon: ['ui', 'calendar'],
        lvl: 13,
        go: 'village/orders',
        intro: 'Un client demande une grosse quantité d’un produit avant la fin de la saison.',
        secs: [
            {
                h: 'Comment ça marche',
                b: [
                    'Livrez petit à petit avant la fin de la saison : le délai est d’au moins 13 jours du jeu (environ une heure réelle), même si le contrat arrive tard.',
                    'La récompense (pièces, expérience, ruban, matériaux rares) vaut le coup.',
                ],
            },
        ],
        see: ['orders', 'seasons'],
    },
    {
        id: 'market',
        cat: 'trade',
        name: 'Le marché : acheter et vendre',
        icon: ['ui', 'stall'],
        lvl: 1,
        go: 'market/sell',
        intro: 'Le magasin pour acheter, le grossiste et l’étal pour vendre.',
        secs: [
            {
                h: 'Acheter (Marché › Acheter)',
                b: [
                    'Graines, animaux, machines, décorations, améliorations : avec leur prix, leurs matériaux et leur niveau.',
                    'Achat à l’unité ou par 10 (étiquette ×10).',
                    'Le marchand ambulant (après la fontaine) propose des offres de passage, et le marché de nuit des raretés les soirs d’été.',
                ],
            },
            {
                h: 'Le grossiste',
                t: 'Il achète tout de suite, mais paie de moins en moins si vous lui vendez beaucoup d’un même produit. Le prix remonte avec le temps. La maîtrise platine et diamant protège de la baisse.',
            },
            {
                h: 'L’étal',
                t: 'Vous fixez le prix : plus il est haut, plus le client tarde. 4 places, puis une de plus aux niveaux 8, 16, 26 et 36 (et jusqu’à 3 de plus avec la maison et le domaine).',
            },
            { h: 'Le produit du jour et la réserve', t: 'Un produit du jour paie plus. La réserve met de côté ce que demandent commandes et défis.' },
            {
                h: 'Les améliorations',
                t: 'Engrais magique (niveau 6), négociation (11), mangeoire automatique (14), semoir (16), abondance (17), moissonneuse (24).',
            },
        ],
        tips: ['Le marché est volontairement moins rentable que les commandes : vendez-y le surplus.'],
        see: ['orders', 'skills'],
    },
    {
        id: 'agenda',
        cat: 'trade',
        name: 'L’Agenda',
        icon: ['ui', 'calendar'],
        lvl: 1,
        go: 'village/orders',
        intro: 'Tout ce qui est là et ce qui arrive, au même endroit.',
        secs: [
            {
                h: 'Où le trouver',
                t: 'Une ligne fine en haut de Village › Commandes. Touchez-la pour déplier la liste ; touchez-la encore pour la replier (le choix est retenu).',
            },
            {
                h: 'Ce qu’il liste',
                t: 'L’avion-cargo, Armand, le marchand, le train, la montgolfière, le bateau, le concours de la semaine et la fête de saison, chacun avec son compte à rebours. Ce qui est présent passe devant, puis ce qui arrive le plus tôt.',
            },
        ],
        see: ['cargo', 'armand', 'trains'],
    },
    {
        id: 'village',
        cat: 'village',
        name: 'Le village et son histoire',
        icon: ['ui', 'house'],
        lvl: 1,
        go: 'village/village',
        intro: 'Le village se reconstruit chapitre après chapitre ; ses habitants et ses voisins font la vie de la ferme.',
        secs: [
            { h: 'Où le trouver', t: 'Onglet Village › sous-onglet Village : la carte de l’histoire, les villageois, les voisins, le concours et le domaine.' },
            {
                h: 'L’histoire',
                b: [
                    'Chaque chapitre est un chantier : on y livre des produits, des pièces et des matériaux, et chaque chapitre rapporte de l’expérience et des pièces (un ruban dès le chapitre 5).',
                    'Un chapitre fini ouvre des bâtiments, des machines, des cultures ou des villageois. Les grandes étapes (hameau, port, abbaye, île, station, alpage) ouvrent une nouvelle carte.',
                    'Un chantier ne demande jamais un produit que vous n’avez pas encore pu débloquer.',
                ],
            },
            {
                h: 'Les villageois et l’amitié',
                b: [
                    'Elle monte quand vous livrez leurs commandes, leur servez une boisson au comptoir ou leur faites un cadeau.',
                    'La liste est une ligne repliable (comme l’Agenda) : repliée, elle annonce les cadeaux possibles ; touchez-la pour la déplier. Le choix est retenu.',
                    'Un cadeau par villageois et par jour de jeu (environ 5 minutes réelles) : 1 point, 3 si c’est un produit fabriqué. Choisissez dans ce qu’il aime.',
                    'Cinq cœurs en tout. Chaque cœur rapporte des pièces, parfois des graines ou une recette que le villageois vous apprend ; le cinquième fait de lui un ami pour la vie, avec une récompense et l’histoire qu’il raconte.',
                ],
            },
            {
                h: 'Les fermes voisines (niveau 6)',
                t: 'Elles passent par l’onglet Village › Commandes pour quelques heures. Chacune demande un plat de sa spécialité : Hortense des légumes et des fruits (soupes, conserves, jus, salades), Bastien du lait, des œufs, de la laine ou du miel (fromages, glaces, vêtements), Yvette du poisson ou de la viande, Firmin de la farine, de l’huile, du sucre ou du tissu (pains, pâtes, gâteaux, bonbons). Au début, avant d’avoir les ateliers, elles se contentent de produits bruts. Les aider fait monter leur amitié (cinq paliers) et vaut des cadeaux ; leur marché (Marché › Acheter) s’améliore avec l’amitié.',
            },
            {
                h: 'Des demandes plus riches avec l’amitié',
                b: [
                    'À partir de 3 cœurs, un voisin demande deux plats, parfois trois (une chance sur deux à 5 cœurs), tous différents. Plus il y a de plats, plus la récompense grandit (15 % en plus par plat en plus).',
                    'Il peut aussi exiger un plat en argent (ou mieux) ou en or : une étoile le signale. Il ne le demande que si votre ferme a déjà su faire ce plat dans cette qualité, et jamais sur plus d’un plat par demande. Pour livrer, les plats ordinaires partent d’abord, puis l’argent, puis l’or (le platine et le diamant comptent comme de l’or).',
                    'Dès le niveau 12, chaque lundi, un voisin à tour de rôle vous passe la commande spéciale de la semaine : un seul plat de sa spécialité, un plat que vous n’avez jamais livré aux voisins (à défaut, un des moins livrés). La récompense est très belle : 2,5 fois la valeur en pièces, trois matériaux rares, de l’expérience et 2 points d’amitié. Elle disparaît lundi.',
                ],
            },
        ],
        see: ['contest', 'events', 'orders'],
        tips: ['Le cinquième cœur d’un villageois fait payer ses commandes 25 % de plus.'],
    },
    {
        id: 'contest',
        cat: 'village',
        name: 'Concours et ligues',
        icon: ['ui', 'trophy'],
        lvl: 4,
        go: 'village/village',
        intro: 'Chaque semaine, tout ce que vous faites compte des points contre les fermes voisines.',
        secs: [
            {
                h: 'Les points',
                b: [
                    'Ils viennent de ce que vous faites pendant la semaine : commandes, wagons, montgolfières, chantiers, récoltes (or en bonus), produits animaux, fabrications, commandes de bière et de cave…',
                    'Le charme de la ferme s’ajoute : décorations, styles de la maison, poisson accroché au mur du salon.',
                    'Le kiosque du village (chantier) ajoute 25 % à vos points.',
                ],
            },
            {
                h: 'Les paliers et le classement',
                t: 'Trois paliers rapportent chacun des pièces et de l’expérience au fil de la semaine. Le classement contre les fermes voisines tombe le lundi : la première place paie le plus, puis de moins en moins.',
            },
            {
                h: 'Les ligues',
                b: [
                    'Bronze (niveau 4), argent (17), or (29), diamant (44).',
                    'Première du classement : vous montez, avec des récompenses plus grosses et des rivales plus fortes.',
                    'Dernière : vous redescendez d’une ligue.',
                ],
            },
        ],
        see: ['decor', 'village', 'pond'],
        tips: ['Pas besoin de viser le concours : il suffit de jouer. Les décorations et le style de la maison comptent chaque semaine.'],
    },
    {
        id: 'events',
        cat: 'village',
        name: 'Fêtes et événements rares',
        icon: ['ui', 'calendar'],
        lvl: 1,
        go: 'village/village',
        intro: 'Des fêtes de saison, des fêtes aux vraies dates, des imprévus et des visiteurs rares.',
        secs: [
            {
                h: 'Les fêtes de saison',
                b: [
                    'Printemps : chasse aux œufs, des œufs décorés se cachent dans le champ.',
                    'Été : toutes les ventes rapportent 25 % de plus.',
                    'Automne : foire d’automne, le concours récompense les récoltes de qualité or.',
                    'Hiver : marché de Noël, les trains paient 30 % de plus.',
                ],
            },
            {
                h: 'Halloween, Noël et Pâques (niveau 3)',
                t: 'Ils tombent aux vraies dates du calendrier. Chacun apporte une recette, un panier à remplir avec le village et une décoration à gagner.',
            },
            {
                h: 'Les imprévus (niveau 7)',
                b: [
                    'Corbeau : touchez-le avant qu’il ne mange la récolte.',
                    'Pucerons : touchez la culture vite, sinon elle est perdue.',
                    'Animal malade : appui long sur la bête pour la soigner.',
                    'Acheteur pressé : il paie le triple mais repart au bout de 10 minutes.',
                ],
            },
            {
                h: 'Les événements rares (niveau 12)',
                b: [
                    'Foire aux bestiaux : deux animaux d’exception à vendre, 50 % plus rapides.',
                    'Critique gastronomique : il goûte un de vos plats, et sa note dépend de votre maîtrise de la recette.',
                    'Nuée de papillons : les récoltes dorées sont trois fois plus fréquentes.',
                ],
            },
        ],
        tips: ['L’Agenda liste ce qui est là et ce qui arrive ; les événements rares n’y figurent pas, ils surviennent au hasard.'],
        see: ['agenda', 'incidents', 'night'],
    },
    {
        id: 'house',
        cat: 'grow',
        name: 'La maison',
        icon: ['ui', 'house'],
        lvl: 5,
        go: 'sheet:house',
        intro: 'Six agrandissements, chacun avec un avantage, et une personnalisation du décor.',
        secs: [
            {
                h: 'Les agrandissements',
                b: [
                    'Niveau 5, maison rafraîchie : +40 places dans la grange.',
                    'Niveau 14, véranda : +1 commande au tableau.',
                    'Niveau 23, étage : +1 place dans la file de chaque machine.',
                    'Niveau 32, belle demeure : +1 place à l’étal.',
                    'Niveau 42, grande ferme : toutes les commandes paient 10 % de plus.',
                    'Niveau 47, le manoir : +80 places dans la grange et 1 place de plus à l’étal.',
                ],
            },
            {
                h: 'Théo, le commis',
                t: 'Après le pont du hameau (chapitre 5), Théo récolte, replante et arrose à votre place les parcelles encadrées du champ, en replantant la dernière culture posée. On le forme de plus en plus : de 6 parcelles à 36 au dernier niveau (31, 37, 41 puis 47). L’aide au champ du domaine lui ajoute des parcelles.',
            },
            {
                h: 'Personnaliser',
                t: 'Dès le niveau 8, clôture, allées, toit et grange se choisissent et s’achètent dans la feuille de la maison. Voir « Style, décorations et souvenirs ».',
            },
        ],
        see: ['decor', 'domaine', 'orders'],
    },
    {
        id: 'decor',
        cat: 'grow',
        name: 'Style, décorations et souvenirs',
        icon: ['ui', 'camera'],
        lvl: 5,
        go: 'sheet:house',
        intro: 'Ce qui embellit la ferme compte pour le concours, et la ferme se garde en photos.',
        secs: [
            {
                h: 'Les décorations',
                b: [
                    'Elles s’achètent au marché (magasin, marché de nuit) ou se gagnent en fêtes et en grands défis.',
                    'Chacune se pose dans un coin d’une parcelle sans la gâcher, et beaucoup ont un effet : le nichoir tient les corbeaux à distance, le parterre améliore les qualités des parcelles voisines.',
                    'Toutes ont un charme qui compte pour le concours.',
                ],
            },
            {
                h: 'Le style de la maison (niveau 8)',
                t: 'Clôture, allées, toit et grange : chaque style acheté donne 8 points de charme au concours, pour toujours. Changez à volonté parmi ceux que vous avez.',
            },
            { h: 'Le mur du salon', t: 'Accrochez votre plus gros poisson : +20 points de charme.' },
            {
                h: 'Photos et carte postale',
                t: 'Les grands moments (niveaux, chapitres, amis pour la vie, concours gagné, nouvelle ferme) prennent une photo dans l’album de la ferme, 60 au plus, qui se partage. La carte postale (menu) dessine votre ferme du moment, à envoyer.',
            },
        ],
        see: ['contest', 'house'],
    },
    {
        id: 'domaine',
        cat: 'grow',
        name: 'L’amélioration du domaine',
        icon: ['ui', 'house'],
        lvl: 25,
        go: 'village/village',
        intro: 'Le grand chantier du jeu : neuf branches de cinq paliers, qui ne donnent que de la capacité et du confort.',
        secs: [
            {
                h: 'Où le trouver',
                t: 'Village › sous-onglet Village, sous la carte de l’histoire (niveau 25). Une scène de la ferme montre chaque branche, du chantier au grand bâtiment.',
            },
            {
                h: 'Les neuf branches',
                b: [
                    'Grange agrandie : de la place pour ranger.',
                    'Cuisines et ateliers : +1 place dans la file de chaque machine, à chaque palier.',
                    'Aide au champ : Théo soigne plus de parcelles.',
                    'Commerce : des commandes au tableau et des places à l’étal en plus.',
                    'Annexes des métiers : une cuve de brasserie, un siège au comptoir, une étagère de cave, une nasse, une place à l’étable de sélection.',
                    'Suite d’Armand : jusqu’à quatre produits phares, commande conservée d’une visite à l’autre, +10 % de paiement.',
                    'Piste du cargo : quatre soutes de plus, +20 % au bonus d’avion plein.',
                    'Quai agrandi : quatre lignes de plus au bateau, qui revient 25 % plus vite.',
                    'Réception : les visiteurs restent jusqu’à deux fois plus longtemps.',
                ],
            },
            {
                h: 'Comment ça s’achète',
                b: [
                    'Chaque branche s’achète palier par palier, du premier au cinquième. Chaque palier coûte des pièces et deux matériaux, de plus en plus cher.',
                    'Les premiers paliers sont accessibles, les derniers sont le grand puits d’argent du jeu : c’est fait pour la longue durée.',
                    'Un récapitulatif montre ce qu’il reste à dépenser.',
                ],
            },
        ],
        see: ['house', 'armand', 'cargo', 'trains'],
        tips: ['Rien n’accélère ni n’enrichit directement : le domaine agrandit, il ne change pas l’équilibre.'],
    },
    {
        id: 'skills',
        cat: 'grow',
        name: 'Les compétences',
        icon: ['ui', 'star'],
        lvl: 2,
        go: 'sheet:progress',
        intro: 'Chaque niveau gagné donne un point à placer dans trois arbres : agriculture, élevage, commerce.',
        secs: [
            { h: 'Où', t: 'Menu › Progrès. Le menu signale les points à placer.' },
            {
                h: 'Agriculture',
                b: [
                    'Main verte : les cultures poussent plus vite (3 rangs).',
                    'Récolte généreuse : chance de double récolte (3).',
                    'Œil d’expert : plus de qualité argent ou or (2).',
                    'Toucher d’or : les récoltes dorées sont 60 % plus fréquentes.',
                ],
            },
            {
                h: 'Élevage',
                b: [
                    'Bien nourris : les bêtes produisent plus vite (3).',
                    'Grande mangeoire : plus de repas (2).',
                    'Pâturage fertile : chance de double production (3).',
                    'Pouponnière : les bébés grandissent deux fois plus vite.',
                ],
            },
            {
                h: 'Commerce',
                b: [
                    'Bagou : tout se vend plus cher (3).',
                    'Client fidèle : les commandes du village paient plus (2).',
                    'Logisticien : les trains paient plus (2).',
                    'Marchand avisé : les prix baissent deux fois moins vite quand vous vendez beaucoup.',
                ],
            },
            {
                h: 'Règles',
                b: [
                    'Dans chaque arbre, on apprend dans l’ordre ; la dernière compétence demande 4 points déjà placés dans l’arbre.',
                    'Il y a 26 rangs en tout : vous aurez les points pour tout apprendre.',
                    'Vous pouvez tout redistribuer contre des pièces (400 × votre niveau).',
                ],
            },
        ],
        see: ['mastery', 'market'],
    },
    {
        id: 'book',
        cat: 'grow',
        name: 'Le livre de la ferme',
        icon: ['ui', 'book'],
        lvl: 3,
        go: 'sheet:book',
        intro: 'Tout ce que vous avez produit, découvert et accompli, en cinq sections.',
        secs: [
            {
                h: 'Les cinq sections',
                b: [
                    'Collection : l’étagère de 17 pages (potager, verger, poissons, plats, fromagerie, boissons, bières, cuvées, mines et gemmes, races…). Chaque page donne des récompenses à 25, 50, 75 et 100 % (un ruban au complet).',
                    'Maîtrise : les étoiles de chaque produit.',
                    'Exploits : les succès, avec pièces, expérience et parfois un ruban.',
                    'Légende : le chemin vers la Ferme légendaire.',
                    'Album : les photos de vos grands moments.',
                ],
            },
            {
                h: 'Les fiches',
                t: 'Chaque entrée de la collection a sa fiche : combien vous en avez fabriqué, en argent et en or, sa maîtrise, la première fois, et l’anecdote de Mamie Odette.',
            },
        ],
        see: ['mastery', 'legend', 'decor'],
    },
    {
        id: 'labplants',
        cat: 'lab',
        name: 'Le laboratoire de plantes',
        icon: ['ui', 'packet'],
        lvl: 40,
        go: 'machines/lab',
        intro: 'Croiser des plantes pour créer des variétés plus savoureuses ou plus robustes, à garder pour toujours.',
        secs: [
            {
                h: 'Ce qui l’ouvre',
                t: 'La station de recherche (niveau 40) : Agathe et Victor. La serre de pollinisation, puis le laboratoire et le conservatoire des semences, sont des chantiers du village.',
            },
            {
                h: 'Croiser',
                b: [
                    'Choisissez deux plantes ; la pollinisation dure environ 10 minutes, en temps réel.',
                    'Elle donne une portée de jeunes plants (3, 4 avec le laboratoire) : vous en gardez un.',
                    'Chaque gène peut muter (5 %, 9 % avec la ruche de sélection).',
                    'Deux espèces différentes donnent plus souvent des graines stériles.',
                ],
            },
            {
                h: 'Fixer une variété',
                b: [
                    'Une variété se fixe à partir de la 3e génération, avec le laboratoire (qui analyse aussi les gènes).',
                    'Une variété fixée donne ses graines : une récolte en rend une une fois sur deux.',
                    'Les gènes comptent : vitesse de pousse, résistance au froid et à la sécheresse, rendement, saveur.',
                    'Une variété savoureuse améliore les plats (argent, or) et la revente.',
                ],
            },
            {
                h: 'Apparences et caractères discrets',
                b: [
                    'Les mutations peuvent donner de nouvelles couleurs (rose, orange vif, argentée, cuivrée, dégradée), de nouveaux motifs (damier, zébrures, mouchetée fine, marbrée) et la taille naine ; le gros fruit n’existe que chez les plantes.',
                    'Une finition rare, une seule par création : givrée, moussue, étincelante, vernie ou fleurie. La saison en favorise une.',
                    'Ces apparences ne changent pas la valeur, mais elles comptent pour « La plus belle robe » et « La plus belle géante » du Salon.',
                    'Sept caractères de plantes (repousse, maturation lente, anti-nuisibles, graine généreuse, calibre, chance, terre d’accueil) et cinq de bêtes (fécondité, santé, curiosité, docilité, sociabilité) valent 0 au départ ; ils n’apparaissent dans la fiche que s’ils sont présents. La tomate et quelques autres repoussent déjà.',
                ],
            },
            {
                h: 'Mes créations et le chef',
                t: 'Mes créations garde chaque variété et permet de racheter graines et petits. Le chef passe des commandes de plusieurs heures qui demandent un trait précis.',
            },
        ],
        see: ['labanimals', 'workshop'],
    },
    {
        id: 'labanimals',
        cat: 'lab',
        name: 'L’élevage et le Salon',
        icon: ['ui', 'nursery'],
        lvl: 40,
        go: 'machines/lab',
        intro: 'Choisir ses reproducteurs pour des petits aux traits rares, puis les présenter au Salon.',
        secs: [
            {
                h: 'L’étable de sélection',
                b: [
                    'Associez deux parents : la naissance prend environ 15 minutes, en temps réel.',
                    'Les petits héritent de leurs traits : cornes, oreilles, toison, lait plus riche… et, chez le cheval, la détente et la docilité qui fixent ses plafonds aux écuries.',
                    'Jumeaux dans 15 % des naissances.',
                    'Un enclos d’élevage de base, un de plus avec le laboratoire, un autre avec le conservatoire, un de plus avec le domaine.',
                    'Une race fixée donne des petits dont le prix est plus élevé.',
                ],
            },
            {
                h: 'Le Salon de l’agriculture (niveau 43)',
                t: 'Un critère par période (fruit le plus sucré, légume le plus épicé, lait le plus riche, toison la plus douce, plus belle robe…). Présentez votre meilleure plante ou bête face à des rivales dont le score grandit avec votre niveau. Le premier prix rapporte un ruban, deux la première fois qu’on gagne un critère.',
            },
        ],
        see: ['labplants', 'animals', 'legend'],
    },
    {
        id: 'legend',
        cat: 'end',
        name: 'Grands défis et Ferme légendaire',
        icon: ['ui', 'trophy'],
        lvl: 50,
        go: 'sheet:progress',
        intro: 'Au niveau 50, le jeu change : défis, renommée, Ferme légendaire et prestige.',
        secs: [
            {
                h: 'Les grands défis',
                t: 'Un défi de deux semaines, tiré parmi dix-sept, en quatre étapes. Des médailles, une salle des trophées et des décorations uniques à gagner. Il se trouve dans Village › Commandes.',
            },
            {
                h: 'La renommée',
                t: 'Au niveau 50, l’expérience donne des étoiles de renommée : une étoile tous les 250 000 points, avec pièces et matériaux, et un ruban toutes les cinq.',
            },
            {
                h: 'La Ferme légendaire',
                t: 'Cinq objectifs dans la section Légende du livre : le niveau 50, les 6 chapitres du village et du hameau terminés, la maison au niveau 5, la ligue diamant, dix produits maîtrisés à l’or.',
            },
            {
                h: 'Vendre la ferme',
                b: [
                    'Vous recommencez à zéro mais gardez les rubans, les succès, les amitiés, le chien, les décorations, le village rénové, la grange, le livre, la maîtrise, la cave (étagères et cote) et les créations de génétique.',
                    'Les rubans gagnés dépendent de ce que vous avez gagné pendant la ferme. Chacun donne +5 % aux ventes et +3 % de vitesse, pour toujours.',
                    'Un défi de prestige (sans animaux, hiver éternel, petit lopin, marché fermé) réussi rapporte 3 rubans de plus.',
                    'Un thème de ferme : maraîchère (cultures 15 % plus rapides), laitière (bêtes 20 %), fruitière (arbres 30 %), du littoral (filet de mer double).',
                ],
            },
        ],
        see: ['skills', 'domaine', 'book'],
        tips: ['Le prestige est facultatif : on peut rester sur sa ferme et viser la Ferme légendaire.'],
    },
    {
        id: 'memo',
        cat: 'memo',
        name: 'Aide-mémoire',
        icon: ['ui', 'clock'],
        lvl: 1,
        go: 'village/orders',
        intro: 'Les durées et les adresses à retenir.',
        secs: [
            {
                h: 'Visiteurs et livraisons (temps réel)',
                b: [
                    'Train : 1 heure sur place, 1 heure d’absence. Montgolfière : 1 heure, absente 2 heures. Marchand ambulant : 2 heures, absent 4 heures.',
                    'Avion-cargo : toutes les 48 heures, 24 heures sur place. Armand : tous les 7 jours, 3 jours sur place.',
                    'Fermes voisines : 2 heures sur place.',
                    'Acheteur pressé : 10 minutes. Critique : 20 minutes. Foire aux bestiaux : 30 minutes.',
                ],
            },
            {
                h: 'Ce qui travaille jeu fermé',
                b: [
                    'Cultures, serre, bêtes, machines, cave, brasserie, élevage et pollinisation.',
                    'Nasses, bûcheron, mineur, cueilleur et filet de mer : une charge toutes les 2 heures.',
                    'Théo.',
                ],
            },
            {
                h: 'Rythme du jeu',
                b: [
                    'Ventes aux enchères : petite toutes les 4 heures, grande à 19 h.',
                    'Concours : une semaine, classement le lundi.',
                    'Défi de Marcel et de Gaspard : un par jour.',
                ],
            },
            {
                h: 'Où trouver quoi',
                b: [
                    'Un produit manquant : touchez-le dans une commande, ou cherchez-le dans ce guide.',
                    'Ce qu’un niveau ouvre : Menu › Les niveaux.',
                    'Points de compétence, prestige : Menu › Progrès.',
                    'Livre de la ferme, album, légende : Menu › Livre de la ferme.',
                    'Bonus actifs : Menu › Mes bonus.',
                ],
            },
        ],
        see: ['time', 'agenda'],
    },
];
