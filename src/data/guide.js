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
    // ================= LES BASES =================
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
            {
                h: 'Grands écrans',
                t: 'Sur un ordinateur ou une tablette large, le champ reste à gauche et l’onglet courant s’affiche à droite.',
            },
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
            {
                h: 'Après le niveau 50',
                t: 'L’expérience donne des étoiles de renommée : voir « Renommée et Ferme légendaire ».',
            },
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
    // ================= LA FERME =================
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
                t: 'Chaque récolte sort normale, argent ou or. L’or vaut plus, compte pour les défis et donne des plats d’or. De bons sols, la serre, des engrais, les compétences et les variétés du labo augmentent les chances.',
            },
            {
                h: 'Les graines',
                t: '47 cultures au champ, chacune ouverte à son niveau (blé 1, carotte 2, tomate 4, maïs 6…). Certaines demandent un chantier (houblon, génépi) ou ne poussent qu’en serre (cacao, vanille, menthe, poivre noir, orchidée). Le safran ne se trouve que chez le marchand ambulant.',
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
                t: 'Printemps, été, automne, hiver. Une culture de saison pousse 30 % plus vite ; certaines ne poussent qu’à leur saison. Chaque saison a sa fête (chasse aux œufs, fête de l’été, foire d’automne, marché de Noël) et ses arbres de saison au verger.',
            },
            {
                h: 'La météo',
                b: [
                    'Pluie : elle arrose le champ pour vous.',
                    'Canicule : elle assèche les parcelles.',
                    'Orage : la foudre peut brûler une culture, sauf si un paratonnerre est posé.',
                    'Arc-en-ciel : les récoltes dorées sont bien plus fréquentes.',
                    'Neige, brouillard, éclaircies, couvert : de l’ambiance, sans effet majeur.',
                ],
            },
            {
                h: 'Où voir ce qui arrive',
                t: 'L’almanach (touchez l’horloge) montre la saison, la météo et les fêtes à venir.',
            },
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
                t: 'Humide, sec et ensoleillé, ombragé. Une culture posée dans le sol qu’elle aime pousse plus vite et donne plus souvent des récoltes de qualité ; dans un sol qu’elle n’aime pas, c’est l’inverse.',
            },
            {
                h: 'Où voir le sol préféré',
                t: 'Le magasin l’indique pour chaque graine, et le champ montre le sol de chaque parcelle.',
            },
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
            {
                h: 'Comment s’en servir',
                t: 'Construisez-la dans la ferme, puis semez dedans comme au champ. Le bouton Récolter la couvre aussi.',
            },
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
            {
                h: 'Soins',
                t: 'Tailler en hiver, fumer, rajeunir : voir la fiche de l’arbre. La vitesse totale est plafonnée.',
            },
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
            {
                h: 'Comment l’ouvrir',
                t: 'Au niveau 38, une fois l’abbaye rénovée, réparez le bac de Tiago (Village › Village, carte « L’île »).',
            },
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
            {
                h: 'Durée',
                t: 'La nuit dure environ 2 minutes réelles.',
            },
            {
                h: 'Lucioles et étoiles filantes',
                b: [
                    'Lucioles (printemps et été) : chaque récolte de nuit en met une dans le bocal ; 20 le remplissent.',
                    'Étoile filante (4 nuits sur 10) : touchez-la pour faire un vœu (6 récoltes en or, animaux plus rapides, ou un cadeau).',
                    'Les champignons poussent plus vite la nuit ; certains poissons ne mordent que la nuit.',
                ],
            },
            {
                h: 'Marché de nuit',
                t: 'Les soirs d’été (niveau 14), le Marché de nuit propose des graines et des décorations rares.',
            },
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
            {
                h: 'Jeu fermé',
                t: 'Les imprévus n’arrivent pas en votre absence : ils attendent votre retour.',
            },
        ],
        see: ['decor', 'events'],
    },
    // ================= LES ANIMAUX =================
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
                    'Un câlin par jour rend une bête plus productive.',
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
            {
                h: 'Animal d’exception',
                t: 'Rare : 50 % plus rapide.',
            },
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
            {
                h: 'L’étable',
                t: 'Elle présente tout le troupeau en fiches : pratique pour comparer, soigner et vendre.',
            },
            {
                h: 'Le charme',
                t: 'Les paons ajoutent du charme au concours de la semaine.',
            },
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
                    'Après la bergerie d’altitude (chapitre 15), 4 bêtes peuvent monter à l’alpage (8 avec le téléphérique).',
                    'Elles rapportent du lait d’alpage et de la laine, puis produisent plus vite.',
                    'Une bête en transhumance ne peut pas être vendue.',
                ],
            },
        ],
        see: ['village', 'workshop'],
    },
    // ================= L’ATELIER =================
    {
        id: 'workshop',
        cat: 'craft',
        name: 'L’atelier et les machines',
        icon: ['machine', 'bakery'],
        lvl: 3,
        go: 'machines/workshop',
        intro: 'Transformer vaut mieux que vendre brut : 39 machines et plus de 400 recettes.',
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
                t: 'Avec de bons ingrédients (argent, or, belles variétés), un plat sort en argent ou en or, et se vend plus cher.',
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
                t: 'Onglet Atelier, puis Cave. À chaque étape de l’affinage, un lot peut bien vieillir (sa valeur grimpe), mal vieillir (il tourne) ou se perdre.',
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
            {
                h: 'Trophées',
                t: 'Chaque lot légendaire entre dans la salle des trophées ; le premier de chaque famille rapporte un ruban.',
            },
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
                ],
            },
            {
                h: 'Où la voir',
                t: 'Dans le Livre de la ferme (Maîtrise) et dans la fiche de chaque produit.',
            },
            {
                h: 'Armand',
                t: 'Armand ne commande que des produits où vous avez au moins une étoile.',
            },
        ],
        tips: ['Produire en boucle un même produit n’est jamais puni : la maîtrise compense la baisse de demande.'],
        see: ['armand', 'book'],
    },
    // ================= NATURE ET PÊCHE =================
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
                t: 'Quatre essences : chêne et châtaignier (bois dur), pin (résine), bouleau (sève, qui devient sirop). Jusqu’à 9 arbres, qui repoussent. Dès le niveau 20, la cueillette de saison (fraises, myrtilles, champignons, noisettes, châtaignes, miel).',
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
            {
                h: 'Au marché',
                t: 'Bois, pierre, minerais, lingots et pierres précieuses se vendent un par un ; « Tout vendre » garde ce qu’il faut.',
            },
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
                t: 'Posées dans un coin, avec ou sans appât, elles attrapent 2 à 4 poissons toutes les 2 heures, même jeu fermé. Relevez-les d’un appui. Le domaine en ajoute une.',
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
            {
                h: 'En mer',
                t: 'Après le phare du port, un filet de pêche en mer rapporte sardines, maquereaux, crevettes, bars et parfois un homard.',
            },
        ],
        see: ['night', 'village', 'workshop'],
    },
    // ================= VENDRE ET LIVRER =================
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
            {
                h: 'La montgolfière (après l’auberge)',
                t: 'De grosses commandes bien payées, qui partent après environ 1 heure.',
            },
            {
                h: 'Le bateau (après le quai)',
                t: 'Quatre produits payés très cher ; il part, puis revient. Le chantier naval le fait revenir plus vite, et le domaine (Quai agrandi) ajoute des lignes.',
            },
            {
                h: 'Le domaine y change des choses',
                t: 'La branche « Réception » les fait rester plus longtemps.',
            },
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
            {
                h: 'Le rythme',
                t: 'Toutes les 48 heures (temps réel, même jeu fermé), il se pose pour 24 heures.',
            },
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
            {
                h: 'Les visites',
                t: 'Une fois par semaine (temps réel, même jeu fermé), il reste 3 jours. Manquer sa visite ne coûte rien.',
            },
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
                    'De 60 à 1 200 unités, selon votre niveau, la maîtrise et la fidélité.',
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
                b: ['Livrez petit à petit avant la fin de la saison.', 'La récompense (pièces, expérience, ruban, matériaux rares) vaut le coup.'],
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
            {
                h: 'Le produit du jour et la réserve',
                t: 'Un produit du jour paie plus. La réserve met de côté ce que demandent commandes et défis.',
            },
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
    // ================= LE VILLAGE =================
    {
        id: 'village',
        cat: 'village',
        name: 'Le village et son histoire',
        icon: ['ui', 'house'],
        lvl: 1,
        go: 'village/village',
        intro: 'Des chapitres à reconstruire, des villageois à connaître, des voisins à défier.',
        secs: [
            {
                h: 'L’histoire',
                t: 'Chaque chapitre demande des produits, des pièces et des matériaux. Une fois fini, il ouvre de nouveaux bâtiments, de nouvelles machines et de nouveaux villageois.',
            },
            {
                h: 'Les villageois',
                b: [
                    'Parlez-leur, livrez-leur des commandes, servez-les au comptoir : leur amitié monte.',
                    'À chaque palier d’amitié : une recette, une récompense ou un cadeau.',
                    'Leurs goûts se découvrent peu à peu ; leur anniversaire est une bonne occasion d’offrir.',
                ],
            },
            {
                h: 'Les fermes voisines',
                t: 'Elles s’invitent aux concours, aux classements et aux fêtes. Leur niveau évolue avec le vôtre.',
            },
        ],
        see: ['contest', 'events', 'orders'],
    },
    {
        id: 'contest',
        cat: 'village',
        name: 'Concours et ligues',
        icon: ['ui', 'trophy'],
        lvl: 8,
        go: 'village/village',
        intro: 'Chaque semaine, un concours contre les fermes voisines, avec classement le lundi.',
        secs: [
            {
                h: 'Le concours de la semaine',
                t: 'Un thème par semaine (pêche, légumes, fromages, bières, élevage…). Présentez votre meilleure production et gagnez des points.',
            },
            {
                h: 'Les ligues',
                t: 'Les points s’accumulent par saison. Montez de ligue pour de meilleures récompenses ; le classement est remis à zéro à chaque saison.',
            },
        ],
        see: ['village', 'events'],
    },
    {
        id: 'events',
        cat: 'village',
        name: 'Fêtes et événements rares',
        icon: ['ui', 'calendar'],
        lvl: 1,
        go: 'village/village',
        intro: 'Les saisons ont chacune leur fête, et le jeu réserve des surprises.',
        secs: [
            {
                h: 'Les fêtes de saison',
                t: 'Une fête par saison, avec ses animations, ses décors et ses récompenses (recettes, matériaux, objets de décoration).',
            },
            {
                h: 'Les événements rares',
                b: [
                    'Comète, aurore, marée, visiteurs inattendus : ils apparaissent au hasard.',
                    'Le marchand ambulant et le marché de nuit passent de temps en temps.',
                ],
            },
        ],
        tips: ['L’Agenda liste ce qui est là et ce qui arrive.'],
        see: ['agenda', 'village'],
    },
    // ================= PROGRESSER =================
    {
        id: 'house',
        cat: 'grow',
        name: 'La maison',
        icon: ['ui', 'house'],
        lvl: 6,
        go: 'sheet:house',
        intro: 'Votre maison grandit, apporte du confort et des capacités, et se décore.',
        secs: [
            {
                h: 'Les niveaux',
                t: 'Chaque amélioration coûte des pièces et des matériaux, et ajoute des capacités : files de machines plus longues, places d’étal, commandes en plus, plus de stockage.',
            },
            {
                h: 'Théo',
                t: 'Théo, le menuisier, est un personnage à part entière : il vous aide et propose ses services.',
            },
            {
                h: 'Décorations',
                t: 'Des styles de maison et de très nombreuses décorations s’achètent et s’installent. Elles servent au confort et à la jolie ferme.',
            },
        ],
        see: ['domaine', 'decor'],
    },
    {
        id: 'decor',
        cat: 'grow',
        name: 'Décorations et photos',
        icon: ['ui', 'camera'],
        lvl: 6,
        go: 'sheet:house',
        intro: 'Décorez, prenez des photos, gardez des souvenirs.',
        secs: [
            {
                h: 'Décorer',
                t: 'Les décorations s’achètent au marché ou se gagnent en fête. Elles se placent dans la ferme et la maison.',
            },
            {
                h: 'Photos et cartes postales',
                t: 'Un mode photo cadre votre ferme, et des cartes postales se débloquent avec les événements.',
            },
        ],
        see: ['house'],
    },
    {
        id: 'domaine',
        cat: 'grow',
        name: 'L’amélioration du domaine',
        icon: ['ui', 'house'],
        lvl: 25,
        go: 'village/village',
        intro: 'Le grand chantier du jeu : neuf branches, cinq paliers chacune, jusqu’à 10 millions de pièces.',
        secs: [
            {
                h: 'Où le trouver',
                t: 'Village › sous-onglet Village, sous la carte de l’histoire (niveau 25).',
            },
            {
                h: 'Les branches',
                b: [
                    'Grange et prés : capacité d’élevage.',
                    'Cuisine, champs, commerce : files, parcelles, étal et commandes.',
                    'Annexes des métiers : cave, brasserie, salon, pièges.',
                    'Suite d’Armand : plusieurs produits phares.',
                    'Cargo, Quai agrandi : plus de soutes, plus de lignes.',
                    'Réception : les visiteurs restent plus longtemps.',
                ],
            },
            {
                h: 'Comment acheter',
                t: 'Chaque palier coûte des pièces et des matériaux, et s’achète dans l’ordre. Un total montre ce qu’il reste à dépenser dans chaque branche.',
            },
        ],
        see: ['house', 'armand', 'cargo'],
    },
    {
        id: 'skills',
        cat: 'grow',
        name: 'Les compétences',
        icon: ['ui', 'star'],
        lvl: 5,
        go: 'sheet:levels',
        intro: 'À chaque niveau, un point à investir dans trois arbres : agriculture, élevage, commerce.',
        secs: [
            {
                h: 'Les trois arbres',
                t: 'Agriculture, élevage et commerce : quatre compétences chacune. Investissez selon votre style.',
            },
            {
                h: 'Changer d’avis',
                t: 'Vous pouvez tout redistribuer contre des pièces (400 × votre niveau).',
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
        intro: 'Le Grand livre : tout ce que vous avez produit, découvert et accompli.',
        secs: [
            {
                h: 'Contenu',
                t: 'Pages de produits, maîtrise, bières, poissons, cultures… avec des récompenses à compléter.',
            },
        ],
        see: ['mastery'],
    },
    // ================= GÉNÉTIQUE =================
    {
        id: 'labplants',
        cat: 'lab',
        name: 'Le laboratoire de plantes',
        icon: ['ui', 'packet'],
        lvl: 15,
        go: 'machines/lab',
        intro: 'Croiser des plantes pour créer de nouvelles variétés.',
        secs: [
            {
                h: 'Croisements',
                t: 'Deux plantes parentes donnent des descendants qui héritent de leurs qualités. Les variétés se plantent et se multiplient.',
            },
        ],
        see: ['labanimals'],
    },
    {
        id: 'labanimals',
        cat: 'lab',
        name: 'L’élevage et le Salon',
        icon: ['ui', 'nursery'],
        lvl: 15,
        go: 'machines/lab',
        intro: 'Choisir ses reproducteurs, faire naître des petits aux qualités rares.',
        secs: [
            {
                h: 'Élevage',
                t: 'Associez deux parents ; les petits héritent de leurs traits. Des places d’élevage s’achètent au domaine.',
            },
            {
                h: 'Le Salon',
                t: 'Présentez vos plus beaux animaux au Salon.',
            },
        ],
        see: ['labplants', 'animals'],
    },
    // ================= FIN DE PARTIE =================
    {
        id: 'legend',
        cat: 'end',
        name: 'Grands défis et Ferme légendaire',
        icon: ['ui', 'trophy'],
        lvl: 40,
        go: 'sheet:progress',
        intro: 'Les objectifs de long terme, la renommée et le prestige.',
        secs: [
            {
                h: 'Grands défis',
                t: 'Des objectifs ambitieux, avec de grosses récompenses.',
            },
            {
                h: 'Prestige',
                t: 'Recommencez avec des bonus durables : rubans, défis, fermes à thème, saisons de la ferme.',
            },
        ],
        see: ['skills', 'domaine'],
    },
    // ================= AIDE-MÉMOIRE =================
    {
        id: 'memo',
        cat: 'memo',
        name: 'Durées en temps réel',
        icon: ['ui', 'clock'],
        lvl: 1,
        go: 'village/orders',
        intro: 'Ce qui continue pendant que le jeu est fermé.',
        secs: [
            {
                h: 'Temps réel',
                b: [
                    'Cultures, machines, cave, pêche en mer, ouvriers : tout avance jeu fermé.',
                    'Cargo : 48 h / 24 h. Armand : 7 jours / 3 jours.',
                    'Nasses et ouvriers : une charge toutes les 2 heures.',
                ],
            },
        ],
        see: ['time', 'agenda'],
    },
];
