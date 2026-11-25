// 1.21 : le Guide du fermier. Un vrai manuel : chaque système du jeu a sa page (à quoi ça sert, comment ça marche, les chiffres à retenir).
// Une page : { id, cat, name, icon, lvl, go, intro, secs: [{ h, t | b }], tips, see }
//   lvl : niveau d'ouverture (la page se lit toujours, mais le bouton « Y aller » attend) ; go : où mène « Y aller » (voir GUIDE_GO)
//   secs : sections (h : titre ; t : un paragraphe ; b : une liste) ; tips : « À retenir » ; see : pages liées
import { RENOM } from '../systems/renom.js';
import { ITEMS } from './items.js';
import { OASIS, PEN, CARAVAN } from './oasis.js';
import { NORD, SLED } from './nord.js';
import { ASIE, JUNK } from './asie.js';
import { ANIMALS, BIRTHS } from './animals.js';
import { FAIR, REPUTATION, REP_BONUS, COMICE, ROBEBOOK, ASSOC_LVL } from './elevage.js';
import { ANIMAL_TRAITS } from './genetics.js';
import { MACHINES, RECIPES } from './machines.js';
import { CHAPTERS } from './village.js';
import { HARAS_LVL } from './haras.js';
import { FAMILY } from './family.js';
import { CAMPING } from './camping.js';
import { MAX_LEVEL, HOUSE } from './progress.js';
import { LEAGUES } from './commerce.js';
import { TCG_CARDS, TCG_DECK_BUDGET, TCG_FAMILIES, TCG_RARITIES, TCG_SET_IDS, TCG_VILLAGER_DUELS } from './tcg.js';

// 1.36 : les niveaux cités dans les textes viennent des données (ils ne peuvent plus se démentir)
const lv = id => (ITEMS[id] || ANIMALS[id] || MACHINES[id]).reqLvl;
const chLvl = n => CHAPTERS.find(c => c.n === n).lvl;
// 1.44 : les nombres cités aussi (ils avaient vieilli)
const nCrops = Object.values(ITEMS).filter(x => x.type === 'crop' && !x.island && !x.exotic).length;
const nAnimals = Object.keys(ANIMALS).length;
const nMachines = Object.keys(MACHINES).length;
const nRecipes = Math.floor(Object.keys(RECIPES).length / 50) * 50;

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
        intro: 'On cultive, on transforme, on livre, et les pièces font grandir la ferme.',
        facts: [
            { icon: ['item', 'wheat'], v: 'Cultiver', l: 'Champ, bêtes, verger' },
            { icon: ['machine', 'bakery'], v: 'Transformer', l: 'Plats = plus cher' },
            { icon: ['ui', 'truckIcon'], v: 'Livrer', l: 'Pièces + XP' },
            { icon: ['ui', 'firefly'], v: 'Hors-ligne', l: 'Tout avance seul' },
        ],
        secs: [
            {
                h: 'La boucle du jeu',
                steps: [
                    { icon: ['item', 'wheat'], label: 'Cultiver', sub: 'Champ & bêtes' },
                    { icon: ['machine', 'bakery'], label: 'Atelier', sub: 'Recettes' },
                    { icon: ['ui', 'coin'], label: 'Livrer', sub: 'Commandes' },
                    { icon: ['ui', 'star'], label: 'Grandir', sub: 'Niveaux' },
                ],
                b: [
                    'Premiers pas : labourez, semez du blé, arrosez et récoltez.',
                    'Commandes : touchez un produit manquant dans Village › Commandes pour aller directement là où il se fabrique.',
                    'Panneau « À faire » : au-dessus du champ, il liste en 1 coup d’œil récoltes, machines et visiteurs prêts.',
                ],
            },
            {
                h: 'Le métier de la ferme (niv. 3)',
                b: [
                    '6 métiers au choix : maraîcher, éleveur, arboriculteur, cuisinier, vigneron ou pêcheur (Menu › votre carte de visite).',
                    '10 rangs : chaque rang (2 leçons) augmente les ventes de votre métier (+2 %/rang, +1 % cuisinier) et les commandes ciblées.',
                    'Paliers clés : rang 3 (+10 % commandes), rang 4 (client quotidien ×1,5), rang 5 (produit signature +15 %), rang 6 (+15 % train/cargo), rang 10 (+10 % & titre de maître).',
                    'Rien n’est bloqué : vous pouvez changer de métier plus tard (gratuit la 1re fois, puis 7 jours d’attente) en gardant vos rangs.',
                ],
            },
            {
                h: 'Votre carte de visite',
                t: 'Composez votre portrait (12 traits) et nommez votre ferme depuis le haut du Menu : modifiable à tout moment.',
            },
        ],
        tips: [
            'Rien ne se perd jeu fermé : cultures, machines, cave et visiteurs avancent sans vous.',
            'Aucune punition après une pause : seuls les imprévus (corbeaux, pucerons) attendent votre retour.',
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
        intro: 'Deux horloges : l’heure de la ferme (rapide) et le temps réel (celui de votre montre).',
        facts: [
            { icon: ['ui', 'w_sun'], v: '5 min', l: '1 journée en jeu' },
            { icon: ['ui', 'clock'], v: '1 heure', l: '1 saison (12 j.)' },
            { icon: ['ui', 'truckIcon'], v: 'Temps réel', l: 'Tous les minuteurs' },
            { icon: ['ui', 'firefly'], v: 'Jeu fermé', l: 'Ferme active' },
        ],
        secs: [
            {
                h: 'Les deux horloges',
                tiles: [
                    { icon: ['ui', 'w_sun'], title: 'Heure de la ferme', val: '1 jour ≈ 5 min', sub: 'Règle saisons, météo et nuit.' },
                    { icon: ['ui', 'clock'], title: 'Temps réel', val: 'Minuteurs exacts', sub: 'Machines, cave, train, cargo, ouvriers.' },
                ],
                b: [
                    'Saisons : 12 jours en jeu ≈ 1 heure réelle (touchez l’horloge pour ouvrir l’almanach).',
                    'Minuteurs : « 2 h » signifie toujours 2 vraies heures.',
                ],
            },
            {
                h: 'Ce qui continue jeu fermé',
                b: [
                    'Actif sans vous : cultures arrosées, bêtes nourries, machines, plan de production, cave, visiteurs et ouvriers.',
                    'En pause : seuls les imprévus (corbeaux, pucerons, bête malade) attendent votre retour.',
                    'Écran « Bon retour » : résume tout ce qui a avancé pendant votre absence.',
                ],
            },
        ],
        tips: ['L’almanach (touchez l’horloge) annonce les saisons, la météo et les fêtes à venir.'],
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
                    'Ferme : le champ, la serre, le verger, la nature (forêt et mine), la pêche et les voyages (l’île, l’oasis, le Grand Nord).',
                    'Animaux : les prés (l’étable, la transhumance) et le haras (écuries, concours, élevage).',
                    'Atelier : la production (les machines), le comptoir, la cave, les parfums, la brasserie, le labo et la Maison de la ferme.',
                    'Village : les commandes (tableau, train, cargo, Armand…), le village (chapitres, villageois, concours, domaine), le camping et la famille.',
                    'Marché : le magasin pour acheter, le grossiste et l’étal pour vendre.',
                    'Le « ? » au bout des onglets du haut ouvre la page du guide de l’écran où vous êtes.',
                ],
            },
            {
                h: 'L’en-tête',
                b: [
                    'L’étoile et la barre bleue : votre niveau et votre expérience.',
                    'Les pièces : la monnaie du jeu.',
                    'La grange : votre stock et sa place. Touchez-la pour tout voir.',
                    'Le menu ☰ : des tuiles en trois groupes, Ma ferme (progrès, niveaux, bonus, statistiques), Collections (livre, carnets, coupe, trophées, créations) et Aide et réglages (chercher, guide, almanach, réglages). « Chercher » fouille d’un coup produits, machines, animaux, matériaux et pages du guide.',
                ],
            },
            {
                h: 'S’y retrouver (1.74)',
                b: [
                    'Sur téléphone, tous les volets d’un onglet tiennent sur une ligne, l’icône au-dessus du nom (1.138). Les offres de Zéphyr et les familles du grossiste défilent dans leur bande (un fondu montre qu’il en reste).',
                    'Un point doré sur un onglet : il y a quelque chose à faire. Une pastille rouge chiffrée : ça presse (grange pleine, citerne vide, poêle éteint, anniversaire…).',
                    'Les pages longues ont leurs onglets : Brasserie, Cave, Parfums, Comice, Labo et Village ; et dans le menu, la Coupe, la Maison, Progrès et Statistiques (toute la ferme en chiffres, rangée par coin : champ, bêtes, atelier, nature, village).',
                    'Les listes longues vont par pages : graines du marché et produits à vendre par 15, grange et choix de l’étal par 60, boissons et parfums par 10. Un grand verger montre quatre arbres par rangée. À l’étal, plus de 3 ventes finies se résument en une ligne à encaisser.',
                    'À la brasserie et aux parfums, une phrase dit ce qui bloque (cuves ou dame-jeannes pleines, il manque…) ; « Tout mettre en bouteille / en flacon » vide tout ce qui est prêt d’un coup.',
                    'Une astuce grise se ferme d’un « Compris » ; Réglages › Réafficher les astuces les fait revenir.',
                    'Chercher et trier : la grange, le marché (acheter et vendre), les machines, le choix de l’étal, le tiroir des graines, la brasserie, les parfums et le guide ont la même barre de recherche (une loupe, une croix pour effacer) et, là où ça sert, le même bouton de tri.',
                ],
            },
            {
                h: 'Confort (1.75)',
                b: [
                    'Réglages › Confort › Thème : Clair, Sombre, ou comme le téléphone. Le décor garde ses couleurs, les cartes et les fenêtres passent en sombre.',
                    'Réglages › Son › Ambiance : oiseaux, grillons, pluie, vagues de l’île, vent du Grand Nord, clochettes de l’oasis, selon l’endroit, la saison et l’heure. Elle a son propre volume.',
                    'Un court glissement accompagne le changement de volet ; « Animations réduites » le supprime.',
                    'Le jeu s’ouvre deux fois plus vite, surtout après une longue absence.',
                ],
            },
            {
                h: 'Les cartes repliables',
                t: 'Beaucoup de cartes tiennent sur une ligne fine : un toucher les déplie. Elles se déplient toutes seules quand quelque chose y est prêt (une nasse pleine, un train à charger, un visiteur à servir) et se replient quand il n’y a rien à faire. Le train, l’avion-cargo, la montgolfière et le bateau sont réunis dans la carte « Livraisons ». Le tiroir des graines s’ouvre sur les graines de saison, avec les dernières semées en haut ; l’atelier a un filtre (prêtes, en marche, à l’arrêt).',
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
                h: 'Retrouver un produit',
                b: [
                    'Dès qu’elle contient plus de 12 produits, la grange a une barre de recherche, des familles (récoltes, bêtes, atelier, pêche, le reste) et un tri (quantité, valeur du stock, nom). Elle va par pages de 60.',
                    'Touchez un produit, puis « Fiche » : son stock, d’où il vient, sa recette, les recettes où il sert, qui le demande, et les boutons pour y aller, en faire en quantité ou le vendre. Un appui long sur un produit ouvre aussi sa fiche.',
                ],
            },
            {
                h: 'Le coffre-fort (niveau 15)',
                b: [
                    'Dans la grange, touchez un produit puis « Au coffre » : choisissez la qualité (normal, argent, or, platine, diamant) et la quantité. Le produit garde sa qualité.',
                    'Depuis la cave ou l’Atelier du Parfumeur, le bouton « Au coffre » met un lot ou un flacon précieux à l’abri (grand cru, extrait pur diamant, grand classique).',
                    'Une variété du labo ou le produit d’une race fixée se range aussi, avec son nom, ses couleurs et son rang : choisissez-la en haut de la fenêtre.',
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
                h: 'Les objectifs du niveau et la réserve',
                t: 'Chaque niveau a quelques objectifs (la bannière au-dessus du champ, ou Menu › Les niveaux). La barre pleine, le niveau suivant attend qu’ils soient faits. En attendant, l’expérience se met de côté jusqu’à un quart du niveau suivant (la barre devient dorée : « Réserve pleine ») ; au-delà, elle ne se garde pas. Les objectifs faits, vous passez de niveau avec cette avance.',
            },
            {
                h: 'Ce que donne un niveau',
                b: [
                    'Un point de compétence à placer dans Progrès.',
                    'Les nouveautés du niveau, listées au moment du passage et dans Menu › Les niveaux (les grandes étapes y sont surlignées, et le bandeau « Prochaines étapes » résume les prochains jalons à venir).',
                ],
            },
            {
                h: 'Les grandes étapes',
                t: `Verger 10, serre 15, cave 20, hameau et commis 25, port 30, famille ${FAMILY.lvl}, abbaye 36, île 40, génétique 43, grand hall du Comice 47, Haras ${HARAS_LVL}, Parfums 54, alpage ${chLvl(9)}, camping, Maison et fête de la vallée ${CAMPING.lvl}, oasis ${chLvl(21)}, Grand Nord ${chLvl(23)}, et le niveau ${MAX_LEVEL} pour les grands défis, la renommée et le prestige. Entre deux : Armand au 22, le domaine au 25, le comptoir au 32.`,
            },
            { h: `Après le niveau ${MAX_LEVEL}`, t: 'L’expérience donne des étoiles de renommée : voir « Renommée et Ferme légendaire ».' },
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
                    'Trois copies de secours automatiques, restaurables en un geste. Si la sauvegarde s’abîme (coupure, téléphone plein), le jeu repart tout seul de la plus récente et vous prévient.',
                    'Les Réglages indiquent la date de votre dernier export : un code gardé ailleurs reste la meilleure protection.',
                    'Tout effacer repart de zéro (à utiliser avec précaution).',
                ],
            },
            {
                h: 'Les réglages',
                b: [
                    'Musique, sons, vibrations, confort de jeu.',
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
                    'Le chanvre profite lui aussi à toutes ses voisines (elles poussent plus vite) ; la fève s’entend avec la pomme de terre, mais pas avec l’échalote.',
                    'La lavande et le sarrasin profitent à toutes leurs voisines ; une légumineuse (pois, haricot, lentilles, soja) fait pousser plus vite la céréale voisine (blé, maïs, orge, riz, sarrasin) : l’engrais vert.',
                ],
            },
            {
                h: 'Le carnet du potager',
                b: [
                    '49 associations (40 bonnes, 9 mauvaises), de plus en plus nombreuses avec les niveaux. Chacune se découvre la première fois qu’on récolte une parcelle qui en profite… ou qui en souffre.',
                    'Récompenses à 5, 10, 20 et 30 associations (pièces, compost, graines de safran), et un ruban quand le carnet est complet. Le carnet s’ouvre depuis le menu, rubrique Carnets.',
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
                t: `${nCrops} cultures hors île, chacune ouverte à son niveau (blé 1, carotte 2, tomate 4, maïs 6…). Certaines demandent un chantier (houblon, génépi) ou ne poussent qu’en serre (cacao, vanille, menthe, poivre noir, orchidée). Le safran ne se trouve que chez le marchand ambulant.`,
            },
            {
                h: 'Quatorze cultures de plus (1.30)',
                t: `Navet (niveau ${lv('turnip')}), fève (${lv('favaBean')}), panais (${lv('parsnip')}), échalote (${lv('shallot')}), brocoli (${lv('broccoli')}), chou-fleur (${lv('cauliflower')}), avoine (${lv('oat')}), chanvre (${lv('hemp')}), chicorée (${lv('chicory')}), pois chiche (${lv('chickpea')}), butternut (${lv('butternut')}), mûre (${lv('blackberry')}), cassis (${lv('blackcurrant')}) et endive (${lv('endive')}). Chacune a son sol préféré, ses saisons et ses recettes : farines, soupes, tartes, confitures, liqueurs, toile et corde de chanvre. L’avoine entre aussi dans la ration des chevaux du haras.`,
            },
            {
                h: 'Replanter vite',
                t: 'Dans les réglages, « Replanter après la récolte » ressème tout seul la même culture. Le semoir (niveau 16) sème toute une rangée d’un geste ; la moissonneuse (niveau 24) donne parfois un produit de plus sur une rangée entière d’une même culture. Le Plan du champ (niveau 28) enregistre la disposition de vos cultures (1 emplacement, puis 3, puis 6) : le bouton « Plans », en haut du champ, replante tout d’un clic sur les parcelles vides et labourées (graines payées comme d’habitude plus une main-d’œuvre de 50 pièces par replantage, 10 de plus tous les 5 niveaux après le 28, rien n’est remplacé, la serre est comprise).',
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
                    `Certaines cultures ne poussent qu’en serre : cacao, vanille, menthe (niveau ${lv('mint')}), poivre noir (${lv('peppercorn')}), orchidée (${lv('orchid')}).`,
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
                h: 'Sept arbres de plus (1.31)',
                t: `Prunier (quetsches, niveau ${lv('plum')}), mandarinier (${lv('mandarin')}), pamplemoussier (${lv('grapefruit')}), grenadier (${lv('pomegranate')}) et pistachier (${lv('pistachio')}) poussent à la ferme ; le fruit du dragon (${lv('dragonfruit')}) et l’anacardier, qui donne la noix de cajou (${lv('cashew')}), ne poussent qu’aux îles. L’ancien « Prunier » s’appelle maintenant Mirabellier. Chaque fruit a ses recettes : jus, marmelades, sorbets, tartes, eaux-de-vie, huiles, nougat.`,
            },
            {
                h: 'Maturité et saisons',
                t: 'Chaque arbre compte ses fruits donnés (jusqu’à 75) : plus il est mûr (1 à 3 étoiles), plus ses fruits sont souvent argent ou or. Chaque espèce a sa saison où elle donne 30 % plus vite (10 % plus lent dehors).',
            },
            {
                h: 'Greffons et boutures',
                t: 'Un greffon par arbre : doré (un fruit sur quatre en or), double (deux fruits, plus lent), éternel (ne vieillit jamais), précoce (plus vite) et robuste (plus durable). Un arbre abattu après au moins 50 fruits laisse une bouture qui garde son greffon. Les boutures en trop se vendent depuis la carte « Mes boutures », sous le verger : la moitié du prix du jeune arbre, les trois quarts avec un greffon.',
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
                t: 'Le cueilleur (niveau 22) ramasse les fruits au sol toutes les 2 heures, même jeu fermé. « Débiter les morts » coupe d’un geste tous les arbres morts. Un bouton le met en pause : les fruits restent alors au sol.',
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
        lvl: 40,
        go: 'farm/island#isle',
        intro: 'Une île tropicale où tout pousse sans arrosage et en toute saison.',
        secs: [
            { h: 'Comment l’ouvrir', t: 'Au niveau 40, une fois l’abbaye rénovée, réparez le bac de Tiago (Village › Village, carte « L’île »).' },
            {
                h: 'Les parcelles et le verger',
                b: [
                    '6 parcelles offertes, jusqu’à 18. Jamais d’arrosage, toujours de saison.',
                    'Ananas, patate douce, fruit de la passion, manioc, gingembre, fleur de tiaré, puis (1.32) taro, curcuma, arachide, haricot rouge, piment des îles, aloe vera, hibiscus et patchouli : quatorze cultures, trente-trois recettes de plus.',
                    'Un verger des îles : 4 places jusqu’à 12, pas d’hiver. Bananier, cocotier, manguier, papayer, citronnier vert, avocatier, goyavier, caféier, litchi.',
                ],
            },
            {
                h: 'Le rucher de l’île',
                t: 'Sous le verger, posez jusqu’à 3 ruches. Elles butinent les parcelles en fleur et les arbres qui portent, toute l’année. Si le litchi, l’avocatier ou le tiaré fait la moitié de ce qui fleurit (avec 4 parcelles ou arbres au moins), le miel prend son nom.',
            },
            {
                h: 'Les machines des îles',
                t: 'La paillote, le four des îles, la brûlerie et la rhumerie ouvrent de nouvelles machines et de nouvelles recettes.',
            },
        ],
        see: ['village', 'workshop', 'oasis'],
    },
    {
        id: 'oasis',
        cat: 'farm',
        name: 'L’oasis',
        icon: ['ui', 'oaOasis'],
        lvl: OASIS.lvl,
        go: 'farm/island#oasis',
        intro: 'Dans le volet Voyages : une oasis fertile tant que la citerne a de l’eau.',
        facts: [
            { icon: ['ui', 'oaOasis'], v: `Niv. ${OASIS.lvl}`, l: 'Puits d’Idris' },
            { icon: ['ui', 'w_sun'], v: `${OASIS.heat[0]}h–${OASIS.heat[1]}h`, l: 'Soleil ×2 eau' },
            { icon: ['animal', 'dromedary'], v: 'Caravane', l: '6 h · ventes ×' + String(CARAVAN.mult).replace('.', ',') },
            { icon: ['ui', 'clock'], v: `${OASIS.spring} L/h`, l: 'Source auto' },
        ],
        secs: [
            {
                h: 'Le rucher de l’oasis',
                t: 'Jusqu’à 3 ruches, qui boivent 2 L/h chacune à la citerne : sans eau, les abeilles s’arrêtent. Un verger d’arganiers donne le miel d’arganier, le plus rare ; un carré de coriandre, le miel de coriandre.',
            },
            {
                h: 'Comment l’ouvrir',
                t: `Au niveau ${OASIS.lvl}, après le château, rouvrez le puits d’Idris (chapitre « La source d’Idris », Village › Village, carte « L’oasis »).`,
            },
            {
                h: 'Les cases',
                b: [
                    `${OASIS.cellsBase} cases offertes, jusqu’à ${OASIS.cells}. Sur chaque case, une culture.`,
                    'Cultures : cumin, coriandre, sésame, sorgho.',
                    'Tout est de saison, et les variétés du labo se sèment aussi à l’oasis.',
                ],
            },
            {
                h: 'L’eau',
                b: [
                    `La citerne : ${OASIS.tank[0]} litres, puis ${OASIS.tank[1]} et ${OASIS.tank[2]} en l’agrandissant.`,
                    `La source la remplit de ${OASIS.spring} litres par heure, même jeu fermé ; le puits plus profond (+${OASIS.springUps[0][2]}) et les galeries souterraines (+${OASIS.springUps[1][2]}) en donnent plus.`,
                    `Tant qu’elle pousse, une culture boit ${OASIS.drink.crop} litres par heure, un arbre ${OASIS.drink.tree}. Une culture mûre, ou un arbre au sol plein, ne boit plus.`,
                    'Sans eau, rien ne meurt : tout attend que la citerne se remplisse.',
                    'Une variété qui résiste à la soif (labo) boit moins.',
                ],
            },
            {
                h: 'La chaleur et l’ombre',
                b: [
                    `De ${OASIS.heat[0]} h à ${OASIS.heat[1]} h (heure de la ferme), une plante au soleil boit deux fois plus.`,
                    'Le sorgho fait de l’ombre aux huit cases autour de lui dès qu’il a poussé de moitié, jusqu’à la récolte : elles boivent un tiers de moins et ne craignent pas midi.',
                ],
            },
            {
                h: 'Le chadouf',
                t: `Après le chantier du chadouf : ${OASIS.chadouf.perDay} fois par jour, remontez ${OASIS.chadouf.scoops} seaux en touchant quand le seau plonge dans l’eau. Jusqu’à ${OASIS.chadouf.max} litres.`,
            },
            {
                h: 'L’enclos de la palmeraie (niveau 73)',
                b: [
                    `Après le chantier de l’enclos (chapitre « Le souk de l’oasis ») : ${PEN.cap[0]} places, ${PEN.cap[1]} avec la palissade agrandie.`,
                    'Seulement les bêtes de l’oasis : le dromadaire (lait de chamelle, et parfois de la laine), le zébu (lait de zébu) et le mouton barbarin (laine barbarine). Elles ne vont pas dans les prés de la ferme.',
                    'Elles boivent à la citerne ; sans eau, elles ne produisent plus. À midi, au soleil, elles produisent moitié moins vite, sauf le mouton barbarin.',
                    `Chaque sorgho debout abrite ${PEN.shadePerCrop} bêtes du soleil.`,
                    `La noria : un zébu attelé (depuis sa fiche) donne +${PEN.noria.lph} L/h à la source, mais plus de lait.`,
                    'Naissances, câlins, foire, Comice, carnet des robes et associations marchent comme au pré.',
                ],
            },
            {
                h: 'La caravane',
                t: `Après le caravansérail : ${CARAVAN.camels} dromadaires adultes emportent jusqu’à ${CARAVAN.loads} charges de ${CARAVAN.perLoad} produits au souk de la ville. Retour en 6 heures, avec ${String(CARAVAN.mult).replace('.', ',')} fois le prix du grossiste pour les produits de l’oasis (plantes, laines, laits, recettes, épices) et ${String(CARAVAN.otherMult).replace('.', ',')} fois pour tout le reste (15 % de plus une fois les étals du souk ouverts), et parfois du safran. Les dromadaires partis ne produisent pas.`,
            },
            {
                h: 'Le verger de l’oasis',
                b: [
                    'Un verger à part, comme celui des îles : 4 places jusqu’à 12 (2 millions la cinquième, puis un tiers de plus à chaque place).',
                    'Neuf arbres : dattier, jujubier, oranger amer, tamarinier, caroubier, arganier, mûrier blanc, figuier de Barbarie et cédratier.',
                    'Chaque arbre boit 4 L/h à la citerne tant qu’il pousse ou porte des fruits, le double aux heures chaudes. Sans eau, il attend.',
                    'Les arbres plantés dans les cases avant la 1.58 ont déménagé au verger.',
                ],
            },
            {
                h: 'La tempête de sable',
                t: 'Tous les deux jours environ, le vent ensable quelques cases au soleil : elles ne poussent plus jusqu’à ce qu’on les touche pour les dégager. Les cases à l’ombre d’un sorgho ne craignent rien, et une caravane en route prend une heure de retard.',
            },
            {
                h: 'La cuisine de l’oasis (1.50)',
                b: [
                    'Trois machines, après le puits d’Idris : le four en terre (niveau 70 : kesra, msemen, pains), le tajine (72 : tajines, couscous, harira, chakchouka, keftas) et la confiserie orientale (73 : cornes de gazelle, baklava, makrout, loukoums…).',
                    'Dans les machines que vous avez déjà : semoule et ras el-hanout au moulin, harissa à la marmite, citrons confits à la poterie, pâte de dattes, sirop de jujube et confiture de bigarades à la sucrerie, huile de sésame et tahini à l’huilerie, eau de fleur d’oranger à l’alambic, fromage de chamelle, smen et lben à la fromagerie, tapis berbère et couverture de caravane au métier à tisser.',
                ],
            },
            {
                h: 'Ailleurs dans la ferme',
                b: [
                    'Cumin, coriandre et sésame ont leurs cultures compagnes, à l’oasis aussi.',
                    'À la brasserie, coriandre et oranger amer font la vraie bière blanche : deux étoiles de plus.',
                    'Les six plantes se croisent au labo, entrent aux carnets, aux commandes et au marché des voisins.',
                ],
            },
        ],
        see: ['island', 'companions', 'brewery', 'labplants'],
    },
    {
        id: 'nord',
        cat: 'farm',
        name: 'Le Grand Nord',
        icon: ['ui', 'noNord'],
        lvl: NORD.lvl,
        go: 'farm/island#nord',
        intro: 'Un champ de neige fertile autour des poêles à bois, avec étable de rondins et traîneau.',
        facts: [
            { icon: ['ui', 'noNord'], v: `Niv. ${NORD.lvl}`, l: 'Poêle de Tuomas' },
            { icon: ['ui', 'w_snow'], v: `${NORD.frost[0]}h–${NORD.frost[1]}h`, l: 'Nuit de gel' },
            { icon: ['ui', 'northSled'], v: 'Traîneau', l: '8 h · ventes ×' + String(SLED.mult).replace('.', ',') },
            { icon: ['item', 'wood'], v: `${NORD.stove.woodHours} bûche/h`, l: 'Par poêle actif' },
        ],
        secs: [
            {
                h: 'Le rucher du Grand Nord',
                t: 'Jusqu’à 3 ruches. Les abeilles sortent au printemps et en été ; le reste de l’année, seulement si un poêle est allumé au champ de neige. Les épicéas donnent le miel de sapin (un miellat), les airelles le miel d’airelle.',
            },
            {
                h: 'Comment l’ouvrir',
                t: `Au niveau ${NORD.lvl}, après le souk de l’oasis, rallumez le poêle de Tuomas (chapitre « Le poêle de Tuomas », Village › Village, carte « Le Grand Nord »).`,
            },
            {
                h: 'Les cases',
                b: [
                    `${NORD.cellsBase} cases offertes, jusqu’à ${NORD.cells}. Sur chaque case, une culture ou un poêle.`,
                    'Cultures : seigle, airelle rouge, chicoutai.',
                    'Les variétés du labo se sèment aussi au Grand Nord ; une variété rustique résiste mieux au froid.',
                ],
            },
            {
                h: 'Le verger du Grand Nord',
                b: [
                    'Un verger à part, comme celui des îles : 4 places jusqu’à 12 (2 millions la cinquième, puis un tiers de plus à chaque place).',
                    'Neuf arbres : argousier, épicéa, sorbier, pommettier, merisier à grappes, pin cembro, genévrier, sureau noir et aronia.',
                    'Ils sont rustiques : pas besoin de poêle. La nuit de gel ils poussent deux fois moins vite, l’aurore les accélère.',
                    'Les arbres plantés dans les cases avant la 1.58 ont déménagé au verger.',
                ],
            },
            {
                h: 'Le froid',
                b: [
                    `Hors de portée d’un poêle allumé, une plante pousse au tiers de sa vitesse le jour, et pas du tout la nuit de gel (de ${NORD.frost[0]} h à ${NORD.frost[1]} h). Elle ne meurt jamais : elle attend le feu.`,
                    'Un flocon sur une case veut dire : elle pousse, mais hors de portée d’un poêle allumé.',
                    'Jeu fermé, les poêles continuent de brûler et les plantes d’avancer (au plus trois jours).',
                ],
            },
            {
                h: 'Les poêles',
                b: [
                    'Posez un poêle sur une case libre : il réchauffe les huit cases autour de lui, à vitesse normale, même la nuit.',
                    `Il brûle ${NORD.stove.woodHours} bûche par heure, mais seulement s’il y a une case à réchauffer autour de lui. Il garde ${NORD.stove.fuelCap[0]} heures de feu (${NORD.stove.fuelCap[1]} avec la caisse à bûches).`,
                    'Le bois vient de la forêt, de la grange, et du billot. « Nourrir » vide la grange dans tous les poêles d’un appui.',
                    'Améliorations : le poêle en fonte (chauffe à deux pas), l’isolation de rondins (un quart de bois en moins), la caisse à bûches.',
                ],
            },
            {
                h: 'Fendre le bois',
                t: `Après la réserve de bois de Tuomas, le billot vous attend trois fois par jour : touchez quand le trait passe au milieu de la zone, ${NORD.chop.swings} coups, jusqu’à ${NORD.chop.max} bûches.`,
            },
            {
                h: 'L’étable de rondins',
                b: [
                    'Après le chantier d’Ingrid (chapitre « Les aurores d’Ingrid »), l’étable accueille 12 bêtes, puis 20 : renne, bœuf musqué et lagopède. Elles ne vivent que là, et ne se mêlent ni aux bêtes de la ferme ni à celles de l’oasis.',
                    'Le renne donne du lait et, de temps en temps, un bois ; le bœuf musqué du qiviut, la laine la plus chaude ; le lagopède de petits œufs, en robe blanche l’hiver et brune l’été (selon la vraie saison).',
                    'La nuit de gel, hors d’un poêle allumé, le renne et le lagopède produisent deux fois moins vite. Chaque poêle allumé en abrite 3 (et brûle alors une bûche par heure). Le bœuf musqué ne craint pas le froid.',
                    'Les trois bêtes ont leurs gènes au labo, leurs associations, leurs acheteurs à la foire et leur place au Comice.',
                ],
            },
            {
                h: 'Le blizzard et l’aurore',
                b: [
                    'Un blizzard passe tous les 30 à 60 heures environ (après l’étable) : quelques cases hors des poêles disparaissent sous la neige, un appui les dégage. Pendant six heures, les poêles brûlent deux fois plus, et le traîneau en route prend une heure de retard. Les cases qu’un poêle chauffe sont protégées.',
                    'Les nuits de gel, une aurore boréale se lève de temps en temps : pendant une heure, tout pousse une fois et demie plus vite, même loin des poêles.',
                ],
            },
            {
                h: 'Le traîneau',
                t: `Après le relais des traîneaux (chapitre 24) : ${SLED.reindeer} rennes adultes de l’étable emportent jusqu’à ${SLED.loads} charges de ${SLED.perLoad} produits dans la grande ville du Sud. Retour en 8 heures, avec ${String(SLED.mult).replace('.', ',')} fois le prix du grossiste pour les produits du Nord (plantes, produits des bêtes) et ${String(SLED.otherMult).replace('.', ',')} fois pour le reste, 15 % de plus avec le marché de glace, et parfois de la cardamome. Les rennes partis ne produisent pas.`,
            },
            {
                h: 'La cuisine du Nord (1.53)',
                b: [
                    'Trois machines, du niveau 75 au 79 : le poêle-four (75, après le poêle de Tuomas : pain de seigle noir, tarte de Carélie, pulla, pâtisseries aux airelles et au chicoutai), le chaudron de la taïga (77, après l’étable : soupes de saumon et de champignons, bouillie de seigle, kalakukko) et la sucrerie de baies (79, après la serre de rondins : confitures, gelées, pastilles, bonbons à l’épicéa).',
                    'Dans les machines que vous avez déjà : farine de seigle au moulin, huile d’argousier à la huilerie, fromage de renne et lait fermenté à la fromagerie d’alpage, liqueur de chicoutai et eau-de-vie de sorbier à l’alambic, écharpe et bonnet en qiviut au métier à tisser, bois de renne gravé à la scierie, gravlax à la poissonnerie, glace au chicoutai au glacier.',
                    'La cardamome que rapporte le traîneau parfume la pulla, les biscuits de seigle et la crème de chicoutai.',
                ],
            },
            {
                h: 'Le labo et la brasserie',
                t: 'Les six plantes ont leurs gènes et leurs variétés comme les autres. Seigle et pousses d’épicéa ensemble donnent la sahti, une grande recette de brasseur : deux étoiles de plus.',
            },
        ],
        see: ['oasis', 'island', 'asie', 'labplants'],
    },
    {
        id: 'asie',
        cat: 'farm',
        name: 'Les Terres d’Asie',
        icon: ['ui', 'asAsie'],
        lvl: ASIE.lvl,
        go: 'farm/island#asie',
        intro: 'Des rizières en terrasses irriguées en cascade, un pavillon de bambou, une jonque marchande et trois nouveaux ateliers culinaires.',
        facts: [
            { icon: ['ui', 'asAsie'], v: `Niv. ${ASIE.lvl}`, l: 'Grande écluse de Mei' },
            { icon: ['ui', 'asRigoleOn'], v: '+10 % / palier', l: 'Bonus de cascade' },
            { icon: ['ui', 'asJonque'], v: 'Jonque', l: '7 h · ventes ×' + String(JUNK.mult).replace('.', ',') },
            { icon: ['ui', 'asRoue'], v: `${ASIE.wheel.perDay}×/jour`, l: 'Roue à eau' },
        ],
        secs: [
            {
                h: 'Comment l’ouvrir',
                t: `Au niveau ${ASIE.lvl}, après le marché de glace du Grand Nord, relevez la grande écluse de Mei (chapitre « Les rizières de Mei », Village › Village, carte « Les Terres d’Asie »).`,
            },
            {
                h: 'Les rizières en terrasses et la cascade',
                b: [
                    `${ASIE.cellsBase} cases offertes, jusqu’à ${ASIE.cells} (4 colonnes × 5 terrasses). Sur chaque case, une culture ou une rigole de bambou.`,
                    'Quatre cultures en terrasses : racine de lotus, pousses de bambou, shiitake et pak choï.',
                    'La terrasse du haut (rangée 1) boit au bassin de source dès qu’il contient de l’eau. Pour irriguer les terrasses plus basses, posez des rigoles de bambou : chacune fait couler l’eau sur toute sa colonne en dessous et sur ses voisines gauche/droite (et trois colonnes entières avec le double déversoir).',
                    'Plus l’eau descend en cascade sous une rigole, plus elle oxygène les racines : +10 % de vitesse par terrasse descendue (jusqu’à +30 % en bas !). À sec, rien ne meurt : tout pousse au ralenti.',
                ],
            },
            {
                h: 'Le bassin, la roue à eau et les améliorations',
                b: [
                    `Le ruisseau de montagne remplit le bassin de ${ASIE.spring} L/h même jeu fermé (capacité ${ASIE.basin[0]} L, puis ${ASIE.basin[1]} L et +${ASIE.springBonus} L/h avec le grand bassin).`,
                    `Après le chantier de la roue à eau, lancez les augets en rythme ${ASIE.wheel.perDay} fois par jour pour remonter jusqu’à ${ASIE.wheel.max} L d’un coup.`,
                    'Trois améliorations : le double déversoir (3 colonnes par rigole), les murets de pierre (−25 % d’eau consommée) et le grand bassin de source.',
                ],
            },
            {
                h: 'Le verger d’Asie et le rucher des terrasses',
                b: [
                    'Un verger à part de 4 à 12 arbres : yuzuier, abricotier du Japon (prunes ume), kumquatier, poirier nashi, longanier et ginkgo biloba. Ils poussent sans rien prendre au bassin.',
                    'Le rucher des terrasses accueille jusqu’à 3 ruches (actives tant que le bassin a de l’eau ou pendant le Hanami) et produit deux nouveaux miels : miel de yuzu et miel de lotus.',
                ],
            },
            {
                h: 'Le pavillon de bambou et les trois bêtes',
                b: [
                    'Chapitre 26 (« La jonque de Kenji ») : le pavillon de bambou accueille 12 puis 20 bêtes : cerf sika (lait de sika & bois de velours), ver à soie (fil de soie & fil de soie dorée) et poule soie (œuf & duvet de soie).',
                    'Le ver à soie aime la fraîcheur humide : si le bassin est vide, il file deux fois moins vite.',
                ],
            },
            {
                h: 'La jonque de la soie, la mousson et le Hanami',
                b: [
                    `Trois cerfs sika adultes descendent jusqu’à ${JUNK.loads} charges de ${JUNK.perLoad} produits au quai : la jonque revient en 7 heures avec ${String(JUNK.mult).replace('.', ',')} fois le prix du grossiste sur les produits d’Asie (+15 % avec le marché aux lanternes) et parfois de la badiane étoilée.`,
                    'La mousson gonfle la source (×2,5) et irrigue toutes les terrasses pendant 4 h, mais peut envaser 2 à 4 cases (un appui les draine) et retarde la jonque d’une heure.',
                    'Le Hanami (floraison des cerisiers) fait tomber une pluie de pétales pendant 1 h : tout pousse ×1,5 (terrasses et verger).',
                ],
            },
            {
                h: 'La cuisine et l’artisanat d’Asie',
                b: [
                    'Trois nouveaux ateliers répartis entre les niveaux 91 et 97 : le Wok de fonte (niv. 91, après la grande écluse), le Panier vapeur (niv. 94, après le pavillon de bambou) et l’Atelier de douceurs d’Asie (niv. 97, après la bambouseraie en fleurs).',
                    'Quarante et une recettes et six boissons au comptoir : sautés au wok, baozi, gyoza, mochis au yuzu, gâteaux de lune, kimono de soie, éventail en bambou, liqueur d’ume, thé au yuzu et matcha au lait de sika.',
                ],
            },
        ],
        see: ['nord', 'oasis', 'island', 'labplants'],
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
        intro: `${nAnimals} espèces : un appui ramasse ou nourrit, un appui long ouvre la fiche.`,
        facts: [
            { icon: ['animal', 'chicken'], v: `${nAnimals} espèces`, l: 'Ferme, oasis, Nord' },
            { icon: ['ui', 'heart'], v: '5 cœurs', l: '1 câlin / jour' },
            { icon: ['ui', 'sparkle'], v: 'Exception', l: '+50 % vitesse' },
            { icon: ['ui', 'bolt'], v: '+35 %', l: 'Ration 2 h' },
        ],
        secs: [
            {
                h: 'Les gestes essentiels',
                b: [
                    'Appui court : ramasse la production ou donne un repas.',
                    'Appui long : ouvre la fiche (nom, gènes, soins, déplacement, vente).',
                    'Tout nourrir : nourrit tout le pré d’un coup (la mangeoire auto le fait seule).',
                    'Câlins : 1 par jour de jeu (~5 min) pour monter jusqu’à 5 cœurs et produire plus vite.',
                ],
            },
            {
                h: 'Seconds produits & viandes',
                b: [
                    'Bonus au ramassage : environ 1 chance sur 6,5 de recevoir un second produit (viande, petit-lait, gelée royale, compost, plume…) de la même qualité que le produit principal.',
                    'Augmenter ses chances : gène « rendement », compétence « Bon éleveur » (+5 %/rang) et surtout la ration d’engraissement (+35 % pendant 2 h, moulue ou achetée 120 pièces).',
                    'Utilité : chaque second produit ouvre au moins 3 recettes à l’atelier.',
                ],
            },
            {
                h: 'Les espèces par niveau',
                t:
                    Object.values(ANIMALS)
                        .sort((a, b) => a.reqLvl - b.reqLvl)
                        .map((a, k) => `${k ? a.name.toLowerCase() : a.name} (niv. ${a.reqLvl})`)
                        .join(', ') + '.',
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
            {
                h: `Les naissances au pré (niveau ${BIRTHS.lvl})`,
                b: [
                    'Chaque pré a son interrupteur « Naissances », éteint au départ : allumez-le dans les prés où vous voulez des petits.',
                    'Réglages › Confort › « Naissances au pré » : 1, 3, 5, 10 petits ou sans limite. Une fois ce nombre atteint dans un pré, ses naissances s’éteignent seules ; les rallumer repart pour le même nombre.',
                    `Deux adultes en forme de la même espèce y ont parfois un petit, même jeu fermé : toutes les ${BIRTHS.minH} heures pour les petites bêtes, jusqu’à ${BIRTHS.maxH} heures pour les grosses. Il faut une place libre dans le pré.`,
                    'Le petit hérite de ses parents, mais la nature ramène souvent un bon gène vers la moyenne, sans mutation. Deux parents de la même race fixée lui transmettent leur race.',
                    'Chevaux et abeilles n’ont pas de naissances au pré : les poulains naissent au haras et au labo.',
                ],
            },
            { h: 'Le charme', t: 'Les paons ajoutent du charme au concours de la semaine.' },
        ],
        see: ['animals', 'contest'],
    },
    {
        id: 'elevage',
        cat: 'animals',
        name: 'L’élevage : foire, Comice, réputation',
        icon: ['ui', 'hEcusson'],
        lvl: BIRTHS.lvl,
        go: 'market/sell#beasts',
        intro: 'Faire naître ses bêtes, les améliorer, puis les vendre à des acheteurs exigeants.',
        secs: [
            {
                h: 'Les gènes des bêtes (fiche de la bête)',
                b: [
                    ...ANIMAL_TRAITS.filter(t => !t.extra).map(t => `${t.name} : ${t.hint}.`),
                    'Plus rares, d’autres gènes apparaissent parfois : ' +
                        ANIMAL_TRAITS.filter(t => t.extra && !t.species)
                            .map(t => `${t.name.toLowerCase()} (${t.hint})`)
                            .join(', ') +
                        '.',
                    'Chaque espèce a sa moyenne (pastilles jaunes) ; ce qu’une bête a en plus s’affiche en vert. Les petits héritent des gènes de leurs parents, la foire en demande, et le Comice les note sur 50.',
                ],
            },
            {
                h: 'La foire aux bestiaux (Marché › Vendre › Bêtes)',
                b: [
                    'Des acheteurs passent avec une demande : une espèce, une à trois bêtes adultes, et parfois une exigence (un bon gène, une robe originale, une race fixée).',
                    'Le jeu coche ce que vos bêtes remplissent et propose d’abord les moins précieuses qui conviennent. Vous pouvez choisir vous-même les bêtes à vendre (bouton « Choisir ») pour garder celles que vous aimez.',
                    `Le prix : ${FAIR.base} × le prix de l’espèce par bête, × ${String(FAIR.perReq).replace('.', ',')} par exigence de gène ou d’apparence, × ${FAIR.race} pour une race fixée. Le maquignon (le bouton Vendre de la fiche) paie seulement la moitié du prix.`,
                    `Un nouvel acheteur toutes les ${FAIR.every / 3600000} heures, ${FAIR.slots.map(([l, n]) => `${n} au niveau ${l}`).join(', ')} ; chacun reste un jour. Renvoyer un acheteur fait venir le suivant plus tôt.`,
                ],
            },
            {
                h: 'Les bêtes des voisins (Marché › Acheter › Voisins)',
                t: 'Chaque ferme voisine propose une bête de choix par jour, avec un gène au-dessus de la moyenne (deux avec trois cœurs d’amitié). Mise au pré avec les naissances allumées, elle transmet ses bons gènes aux petits : c’est le moyen d’améliorer son troupeau avant le labo.',
            },
            {
                h: `Le Comice agricole (niveau ${COMICE.lvl}, Animaux › Comice)`,
                b: [
                    `Chaque semaine, ${COMICE.cats} catégories tirées parmi vos espèces (une de plus avec le grand hall). Les variétés ont leur propre concours, au labo : le concours du potager.`,
                    'Dans chaque catégorie, le jury regarde surtout une chose (les gènes, la beauté, l’affection ou la présentation) : elle compte une fois et demie.',
                    `Une bête par catégorie. La note sur 100 : gènes au-dessus de la moyenne de l’espèce ${COMICE.w.genes}, beauté (robe, motifs, cornes, toison, plumage) ${COMICE.w.beauty}, cœurs ${COMICE.w.hearts}, présentation ${COMICE.w.show}.`,
                    `La présentation : brossez la bête ${COMICE.brushTime} secondes, de la tête vers la queue. Une fois par jour ; le meilleur brossage de la semaine compte.`,
                    'Les quatre fermes voisines concourent aussi, avec une note qui grandit avec votre niveau. Résultats à la fin de la semaine.',
                    'Premier prix : un ruban (deux la première fois pour une espèce), des pièces et la plaque « Primée » sur la bête, dont le prix double à la foire. Deuxième et troisième : des pièces.',
                ],
            },
            {
                h: 'Le carnet de l’élevage (Menu › Carnets)',
                b: [
                    `Les robes (niveau ${ROBEBOOK.lvl}) : pour chaque espèce, 11 couleurs et 8 motifs à trouver. Une robe s’inscrit dès qu’une de vos bêtes la porte, avec des pièces ; une espèce complète rapporte ${ROBEBOOK.rubans} ruban.`,
                    'Beaucoup de bêtes cachent une robe dans leurs gènes : elle apparaît quand deux parents porteurs ont un petit au pré. Les bêtes de choix des voisins en montrent souvent une. Les raretés (givrée, moussue, étincelante, vernie, fleurie, auréolée) ne naissent qu’au labo.',
                    `Les associations (niveau ${ASSOC_LVL}) : deux espèces dans un même pré s’entraident ou se gênent (une production plus rapide ou plus lente). Le pré montre celles qui jouent, et le carnet les garde avec une anecdote de Mamie.`,
                ],
            },
            {
                h: 'La réputation de l’élevage',
                b: [
                    'Chaque vente à la foire rapporte des points, plus pour une demande exigeante ou une race fixée ; une place sur le podium du Comice aussi.',
                    `Cinq paliers (${REPUTATION.map(r => r.name.toLowerCase()).join(', ')}) : chacun ajoute ${Math.round(REP_BONUS * 100)} % aux prix de la foire, et les acheteurs deviennent plus exigeants.`,
                    'Le nom de l’élevage est celui du haras : touchez le crayon pour le changer.',
                ],
            },
        ],
        tips: ['Allumez les naissances dans un pré où vivent vos meilleures bêtes, et vendez à la foire celles qui ne servent pas à l’élevage.'],
        see: ['pastures', 'labanimals', 'nmarket'],
    },
    {
        id: 'transhumance',
        cat: 'animals',
        name: 'La transhumance',
        icon: ['ui', 'mountain'],
        lvl: 49,
        go: 'animals',
        intro: 'Envoyez quelques bêtes à l’alpage : elles rapportent du lait et de la laine d’altitude.',
        secs: [
            {
                h: 'Comment ça marche',
                b: [
                    `Après la bergerie d’altitude (chapitre 9, « Les estives », niveau ${chLvl(9)}), 4 bêtes adultes peuvent monter à l’alpage (8 avec le téléphérique). Seules les vaches, chèvres, moutons, bufflonnes et yacks montent.`,
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
        lvl: 48,
        go: 'animals/haras',
        intro: 'Logez vos chevaux en boxes, entraînez-les sur 4 disciplines, concourez chaque semaine et élevez vos lignées.',
        facts: [
            { icon: ['ui', 'hEcuries'], v: '4 à 12 boxes', l: 'Écuries (niv. 48)' },
            { icon: ['ui', 'hForme'], v: '5 pastilles', l: '+1 / 30 min' },
            { icon: ['ui', 'hGalop'], v: '4 disciplines', l: 'Mini-jeux ou rapide' },
            { icon: ['ui', 'hCup0'], v: '5 divisions', l: 'Concours / semaine' },
        ],
        secs: [
            {
                h: 'Les 4 disciplines',
                tiles: [
                    { icon: ['ui', 'hGalop'], title: 'Galop', val: 'Gène Vitesse', sub: 'Accélérez en ligne droite, freinez dans le vert avant les virages.' },
                    { icon: ['ui', 'hSaut'], title: 'Saut', val: 'Gène Détente', sub: 'Touchez quand l’anneau atteint la cible (8 obstacles, 3 fautes max).' },
                    { icon: ['ui', 'hDressage'], title: 'Dressage', val: 'Gène Docilité', sub: 'Suivez du doigt 4 figures dans le manège avec régularité.' },
                    { icon: ['ui', 'hEndurance'], title: 'Endurance', val: 'Gène Robustesse', sub: 'Raid en 3 étapes : adaptez l’allure au terrain sans exploser le pouls.' },
                ],
                b: [
                    'Plafond d’aptitude : 40 + 12 × le gène (jusqu’à 100 avec un gène 5).',
                    'Spécialité : touchez l’icône d’une discipline pour en faire le point fort du cheval (+10 % en concours).',
                    'Séance rapide : obtient un score moyen sans jouer le mini-jeu (coûte aussi 1 pastille de forme).',
                ],
            },
            {
                h: 'Boxes, forme et soins',
                b: [
                    `Écuries (niv. ${HARAS_LVL}) : 4 boxes, puis 8 et 12. Un cheval logé libère sa place au pré mais continue de donner son crin.`,
                    'Forme : 5 pastilles max, remonte de 1 toutes les 30 min même jeu fermé (20 min avec couverture d’hiver).',
                    'Brosser (toutes les 2 h) : +1 cœur et parfois +1 pastille de forme.',
                    'Randonnée (2 h) : coûte 1 pastille, rapporte trouvailles et +2 endurance.',
                ],
            },
            {
                h: 'Sellerie et équipement',
                b: [
                    `Sellerie de Jules (niv. ${lv('saddlery')}) : 9 objets (fers, selles, bride, tapis, couverture d’hiver, brosse en crin).`,
                    'Bonus : les objets comptent en concours (aptitude et présentation), pas à l’entraînement.',
                ],
            },
            {
                h: 'Concours hebdomadaires & Grand Prix',
                b: [
                    'Rythme : 1 discipline par semaine, 5 divisions (Poneys, Amateurs, Club, Élite, Prestige). Jusqu’à 3 chevaux inscrits.',
                    'Note : aptitude 55 %, passage 30 %, cœurs 15 %, +10 % pour la spécialité. Sans passage avant lundi, Jules monte pour vous.',
                    'Progression : 3 rosettes ouvrent la division suivante (victoire à +12 pts = 2 rosettes). Élite & Grand Prix mensuel donnent des rubans.',
                ],
            },
            {
                h: 'Élevage, robes et retraite',
                b: [
                    'Poulains : naissent à l’étable de sélection avec les gènes de robe et marques hérités des parents.',
                    'Retraite (champion Élite, 3 max) : quitte son box pour le pré, rapporte des saillies quotidiennes et transmet +10 dans sa spécialité.',
                    'Lignée célèbre : 3 champions de suite dans la même famille = +1 ruban.',
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
        intro: `Transformer vaut bien plus que vendre brut : ${nMachines} machines et plus de ${nRecipes} recettes.`,
        facts: [
            { icon: ['machine', 'bakery'], v: `${nMachines} machines`, l: 'File d’attente & boucle' },
            { icon: ['ui', 'book'], v: `${nRecipes}+ plats`, l: 'Qualité jusqu’à diamant' },
            { icon: ['ui', 'bolt'], v: 'Plan auto', l: 'Chaîne complète 1 clic' },
            { icon: ['ui', 'star'], v: 'Plat semaine', l: 'Jusqu’à +50 % Mamie' },
        ],
        secs: [
            {
                h: 'Le plan de production (1 clic)',
                steps: [
                    { icon: ['ui', 'book'], label: 'Choisir', sub: 'Plat ou commande' },
                    { icon: ['item', 'wheat'], label: 'Semer ×N', sub: 'Cultures manquantes' },
                    { icon: ['machine', 'bakery'], label: 'Enchaîner', sub: 'Machines en auto' },
                    { icon: ['ui', 'check'], label: 'Prêt', sub: 'Même jeu fermé' },
                ],
                b: [
                    'En 1 clic partout : le bouton « Planifier » sur une commande, le train, le cargo ou Mamie calcule toute la chaîne, stock déduit.',
                    'Semer ce qui manque : « Semer ×N » plante directement vos cultures manquantes sur vos parcelles libres.',
                    'Multi-plats (niv. 25) : le Tableau d’intendance (Domaine) combine jusqu’à 8 plats ou bières maison dans un même plan.',
                ],
            },
            {
                h: 'Machines, files et raccourcis',
                b: [
                    `Achat au magasin : du four à pain (niv. 2) à la cuverie (niv. ${lv('winery')}).`,
                    'Appui long : remplit d’un coup toute la file d’attente d’une recette.',
                    '2e poste (niv. 15) : débloque 2 lots en parallèle sur une machine ; le bouton « Boucle » relance la dernière recette.',
                    'Programmes : en haut de l’atelier, mémorise 3 configurations de files à relancer en 1 geste.',
                ],
            },
            {
                h: 'Le plat de la semaine de Mamie (niv. 10)',
                b: [
                    'Chaque lundi : Mamie choisit un plat rapide que votre ferme sait déjà faire (jamais 2 semaines de suite le même).',
                    'Bonus de prix : livrez-le dans Village › Commandes pour +50 % (50 premiers), +30 % (jusqu’à 100), +20 % (200), puis +10 %.',
                    'Maîtrise doublée : chaque lot compte ×2 pour les étoiles de maîtrise (hors bières et parfums).',
                ],
            },
            {
                h: 'Qualité & fiche produit',
                b: [
                    'Qualité : de bons ingrédients (argent, or, platine, diamant) produisent des plats de même rang, vendus plus cher.',
                    'Fiche produit : touchez l’image d’un produit (ou appui long) pour voir stock, recette, débouchés et bouton « En faire ».',
                ],
            },
        ],
        tips: ['Touchez un produit manquant dans une commande : le jeu vous mène directement à la bonne machine, recette déjà sélectionnée.'],
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
                h: 'La carte du salon',
                t: 'Dans le salon, « Composer » ouvre la carte : jusqu’à quatre boissons. Les clients y commandent sept fois sur dix, et elles se paient 10 % plus cher. Un cœur marque la boisson préférée d’un habitué que vous connaissez : quand elle est à la carte, il vient plus souvent. Pendant votre absence, trois clients au plus s’installent et vous attendent ; ils ne s’impatientent que lorsque vous êtes au salon.',
            },
            {
                h: 'L’atelier de boissons',
                b: [
                    '57 boissons. Chacune se prépare en 2 à 4 gestes, et la règle de chacun s’affiche avant de commencer : température, infusion, mouture, extraction, service, fouet, mousse (cœur, feuille ou tulipe, en 12 secondes), presser un agrume, remuer sans déborder, secouer le shaker, attraper les glaçons, doser une goutte, verser de haut (le verre va et vient : on ne verse que lorsqu’il passe sous le jet). Note de 1 à 3 étoiles (qualité normale, argent, or).',
                    'Les cafés s’ouvrent avec la brûlerie de l’île.',
                    'Huit boissons de l’oasis (niveaux 70 à 80) : thé du désert, thé à la datte, tisane de jujube, thé à la bigarade, café de noyaux de datte ; et, après l’enclos de la palmeraie, lait de sésame glacé, lait de dromadaire aux dattes et lait safrané. Elles s’ouvrent avec le puits d’Idris.',
                    'Huit boissons du Grand Nord (niveaux 75 à 80) : café de seigle, thé aux pousses d’épicéa, tisane d’airelles, infusion de chicoutai, argousier chaud, thé glacé au sorbier, kvas de seigle ; et, avec le traîneau, lait de renne à la cardamome. Elles s’ouvrent avec le poêle de Tuomas.',
                    'Le stock sert aux commandes, au train et aux quêtes.',
                ],
            },
            {
                h: 'Le salon',
                b: [
                    'Les villageois arrivent dès que le jeu est ouvert (une pastille prévient), mais ils ne s’impatientent que lorsque vous êtes au comptoir.',
                    'Ils paient plus que le marché, font monter l’amitié (plus pour leur boisson préférée) et laissent un pourboire pour 3 étoiles. Une série de boissons parfaites d’affilée fait monter le pourboire (+10 % par boisson, jusqu’à +50 %).',
                    'Garde-fous : 8 secondes de repos entre deux boissons, clients et pourboires limités par jour.',
                ],
            },
            {
                h: 'Le bâtiment',
                b: [
                    '4 niveaux de salon (2 à 5 places) et 5 décors (+10 % de patience chacun). Le salon dessiné grandit avec son niveau et montre chaque décor posé. Le domaine ajoute un siège de plus (branche « Annexes des métiers »).',
                    'Le carnet du salon compte les clients servis et les boissons parfaites ; la boisson préférée de chaque villageois s’y révèle quand vous la lui avez servie.',
                    'Onglet Recettes : « Prêtes » montre ce que vous pouvez préparer tout de suite ; une boisson qu’un client attend passe en tête, et son bouton doré la lui sert directement.',
                ],
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
                h: 'L’état de la cave',
                t: 'En tête de l’onglet Lots, l’état de la cave dit ce qui attend : climat à régler, lots à soigner, lots finis à sortir, clients que vos lots peuvent servir, enchère en cours, places libres. Chaque ligne a son bouton.',
            },
            {
                h: 'Mettre en cave',
                t: 'Onglet Atelier, puis Cave. À chaque étape de l’affinage, un lot peut bien vieillir (sa valeur grimpe), mal vieillir (il tourne) ou se perdre. Un lot entièrement en argent, en or, en platine ou en diamant garde sa qualité : il vieillit un peu mieux et se vend plus cher (un vin légendaire en or est le meilleur de la cave).',
            },
            {
                h: 'Les vins de cépage',
                t: 'Au pressoir ou à la cuverie, choisissez une de vos variétés de raisin ou de pomme au-dessus des recettes : le vin ou le cidre garde son nom, son goût (sa valeur) et son rang. Ses bouteilles attendent dans la cave, rubrique « Vins de cépage », pour être vendues ou mises en cave. Au château, une cuvée de cépage en platine gagne un cran de classement, et le concours des vins lui donne une médaille de mieux. À la laiterie, le lait d’une race fixée fait de même un fromage de race, qui porte son nom et vaut ses bons gènes.',
            },
            {
                h: 'Quoi mettre en cave dès le niveau 20',
                t: 'Le cidre s’ouvre au niveau 20 avec la cave : 3 pommes et du sucre au pressoir (niveau 15). Le fromage suit au niveau 21.',
            },
            {
                h: 'Huit produits de plus (1.34)',
                t: 'Brie truffé, fromage au poivre, munster, cantal, valençay et fromage aux fleurs d’alpage rejoignent les fromages ; saucisson sec et coppa, les salaisons. Mêmes rangs, mêmes soins, mêmes chances que les autres.',
            },
            {
                h: 'Prendre soin',
                b: [
                    'Un soin par étape suffit (retourner, soutirer, ouiller, remuer, rouler) ; « Tout soigner » les fait d’un geste.',
                    'Gardez le climat (température et humidité) entre 35 et 65, ou installez l’hygromètre qui le règle seul.',
                    'Plus d’étagères : plus de places (+2 chacune) et des lots plus grands ; voûte, ferments et levures.',
                    'Onglet Matériel : aide de cave (soin jamais sous « correct »), caisses capitonnées (lots plus gros), sas d’aération (moins de lots perdus), sonde de maturation (40 % des mauvaises étapes sans effet) et registre des millésimes (+6 % de valeur).',
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
            {
                h: 'Le millésime de l’année',
                t: 'Onglet Réserve. Chaque année de jeu (quatre saisons), la bouteille la plus chère sortie de la cave devient le millésime de l’année. À la fin de l’année, elle entre au palmarès et rapporte quatre fois sa valeur, plus 2 points de renommée.',
            },
        ],
        see: ['brewery', 'orchard'],
    },
    {
        id: 'chateau',
        cat: 'craft',
        name: 'Le château de Margaux',
        icon: ['ui', 'star'],
        lvl: chLvl(19),
        go: 'machines/cave',
        intro: 'La grande étape du niveau ' + chLvl(19) + ' : un château, ses vignes et l’œnologue Octave. Le vin gagne un sommet : la cuvée classée.',
        secs: [
            {
                h: 'L’histoire',
                t: `Deux chapitres sur la carte « Le château » (onglet Village) : la toiture, les vignes et le chai au niveau ${chLvl(19)}, puis la salle de dégustation, la boutique et la fête des vendanges au niveau ${chLvl(20)}. Chaque chantier ouvre une nouveauté.`,
            },
            {
                h: 'La cuvée du château',
                t: 'Quand le chai est rouvert, un lot de vin ou de champagne en cave a un bouton « En cuvée » (gratuit). À sa sortie, Octave le goûte et le classe selon son rang de cave et sa qualité : cru du château (rang 2), grand cru, premier grand cru, cru d’exception (légendaire en diamant). Chaque classement ajoute de la valeur et des points de réputation.',
            },
            {
                h: 'La réputation',
                t: 'Les points des classements donnent jusqu’à cinq étoiles au château. Plus d’étoiles : plus de visiteurs, une file plus longue et des vins plus chers à servir (le champagne dès 2 étoiles). À 2 étoiles, les lots de cave montent à 24 ; à 3 puis 5 étoiles, la cave gagne une case. Elle se garde d’une ferme à l’autre.',
            },
            {
                h: 'La vente en primeur',
                t: 'Avec la salle de dégustation, vendez un lot qui vieillit avant qu’il soit prêt : on vous paie 35 % de sa valeur au rang promis, tout de suite (au plus 400 000 pièces). Le lot reste en cave. Promesse tenue, l’acheteur ajoute 12 % ; manquée, vous rendez ce qui dépasse 35 % de la valeur réelle. Trois primeurs au plus à la fois, un par lot.',
            },
            {
                h: 'La boutique et les accords',
                t: 'Des visiteurs achètent vos bouteilles du stock (jamais celles du coffre-fort) 1,5 fois leur valeur, et plus encore avec les étoiles : bien plus que le grossiste. Offrez le plat qui va avec leur vin : bœuf bourguignon pour le rouge, sandre au vin blanc pour le blanc… l’accord paie 50 % de plus.',
            },
            {
                h: 'Le concours des vins',
                t: 'Une fois par mois, présentez une cuvée classée de la réserve : bronze, argent ou or, avec des rubans, des pièces et un lot qui vaut plus. Une seule médaille par mois.',
            },
        ],
        tips: [
            'Mettez en cuvée les lots que vous avez soignés : un rang 3 ou 4 en or ou plus est classé plus haut.',
            'Le primeur est un pari : ne promettez que ce que votre lot peut tenir.',
        ],
        see: ['cave', 'domaine'],
    },
    {
        id: 'perfume',
        cat: 'craft',
        name: 'L’Atelier du Parfumeur',
        icon: ['ui', 'perfume'],
        lvl: 54,
        go: 'machines/perfume',
        intro: 'Composez vos propres parfums : une pyramide à trois étages, trois méthodes d’extraction, une macération active et des flacons sur mesure.',
        secs: [
            {
                h: 'La pyramide olfactive',
                b: [
                    'Chaque parfum associe trois étages parmi 69 essences (23 par étage) : une note de tête (l’envolée fraîche : agrumes, bigarade, cédrat, menthe, génépi, coriandre, rhubarbe, conifères…), une note de cœur (l’âme : lavande, fleur d’oranger, tiaré, orchidée, hibiscus, thé, cassis, litchi, poivre noir, épices…) et une note de fond (le sillage : résine, patchouli, bois précieux, chêne, vanille, cacao, coco, datte, miel, cognac…).',
                    'Les variétés fixées du laboratoire et les miels de fleurs renforcent leur facette dominante et transmettent leur qualité au flacon.',
                    'Huit grands classiques (Eau de Provence, Alizés des Îles, Nuit de l’Oasis, Brume Boréale, Velours Noir, Or d’Abeille, Cologne Royale et Chypre Impérial) valent deux étoiles de plus et une étiquette dorée.',
                ],
            },
            {
                h: 'Méthode d’extraction et concentration',
                b: [
                    'Distillation à la vapeur (vif, amplifie la tête), Enfleurage à froid (soyeux, sublime le cœur) ou Macération lente (profond, révèle le fond).',
                    'Eau fraîche (rapide, ×1 ingrédient), Eau de parfum (équilibrée, ×2) ou Extrait pur (concentré, ×3, 5 flacons de grand prestige).',
                ],
            },
            {
                h: 'Macération active et gestes au choix',
                b: [
                    'Deux dame-jeannes au départ (jusqu’à quatre grâce à la branche « Cuisines et ateliers » du domaine).',
                    'Chaque parfum traverse trois étapes : Infusion, Repos au noir, puis Glaçage & filtrage (elle avance même jeu fermé).',
                    'À chaque étape, deux gestes de parfumeur au choix : le geste vif (Remuer à vif, Aérer au matin, Glacer & filtrer : −15 % de temps, +12 % de valeur) ou le geste profond (Infuser lentement, Sceller à l’ombre, Soutirer sur lie : +18 % de valeur).',
                    'Trois soins parfaits élèvent la qualité du lot d’un cran et signent sa touche : Cristallin (3 gestes vifs), Grand Sillage (3 gestes profonds, jusqu’à +54 %) ou Équilibré (mixte).',
                ],
            },
            {
                h: 'Flacons, Parfum signature, Salon, Cadeaux et Orgue',
                b: [
                    'Choisissez la silhouette du flacon (5 formes), le bouchon (4 matières) et le nom : la couleur du jus se mélange automatiquement. Vos plus beaux flacons se rangent aussi au Coffre-fort et ont leur page « Parfums » dans le Livre de la ferme.',
                    'Parfum signature : désignez un parfum de 2★ ou 3★ comme signature de la ferme pour gagner +10 % ou +15 % sur toutes les ventes du Salon et +1 point d’amitié quand vous l’offrez.',
                    'Au Salon, des clients décrivent un portrait olfactif et paient +75 % (plus la qualité et la signature) avec amitié et renom. Vous pouvez aussi offrir directement vos flacons en cadeau du jour aux villageois.',
                    'Dans toute la vallée : vos parfums maison sont aussi demandés dans des wagons du train et des soutes de l’avion-cargo (1,75× la valeur réelle), chez Mamie Odette (demande de la semaine), dans le grand défi « Le Grand Salon des Parfums » (et son défi éclair), et marquent des points pendant « La saison des parfums ».',
                    'L’Orgue du Parfumeur recense vos 69 essences, 7 familles olfactives et 8 grands classiques : une récompense tombe toutes les 6 découvertes, et 1 ruban une fois l’Orgue complet. Vos créations, votre Orgue et votre signature survivent au prestige.',
                ],
            },
        ],
        see: ['cave', 'brewery', 'labplants', 'domaine'],
    },
    {
        id: 'brewery',
        cat: 'craft',
        name: 'La brasserie',
        icon: ['ui', 'beer'],
        lvl: 36,
        go: 'machines/brew',
        intro: 'Composez vos propres bières : un malt, du houblon et des ingrédients de la ferme.',
        secs: [
            {
                h: 'Composer une bière',
                b: [
                    'Un malt (blond, ambré, brun ou noir, grillé à la malterie avec l’orge).',
                    'Une dose de houblon : légère, moyenne ou forte.',
                    '1 à 3 ingrédients de la ferme, chacun dosé de 1 à 3. Chaque culture ou fruit a son goût.',
                    'Les produits d’atelier se brassent aussi, dès qu’on en a en stock : caramel (sucré, un peu amer), sucre, cassonade, chocolat noir et café (amers), cidre (acide), piment d’Espelette en poudre (épicé). Ils n’ont pas de page au livre des bières.',
                ],
            },
            {
                h: 'Le carnet et le meilleur accord',
                t: 'Touchez l’étoile d’une bière (onglet Bières) pour la ranger dans votre carnet : elle se relance d’un geste depuis l’onglet Brasser. Le bouton « Meilleur accord avec mon stock » compose la meilleure bière possible avec le malt, le houblon et les ingrédients que vous avez ; ses étoiles restent à découvrir en la brassant.',
            },
            {
                h: 'Trouver un ingrédient ou un miel',
                b: [
                    'Un ingrédient se choisit dans une feuille avec une recherche, des puces (en stock, fruits, légumes et céréales, ateliers, mes variétés) et un tri : en stock d’abord, par nom, ou par note de goût (sucré, acide, amer, épicé, umami d’abord).',
                    'Chaque case rappelle les notes fortes de l’ingrédient (3 et plus) pour composer l’accord sans deviner.',
                    'Pour un hydromel, avec plus de six miels en stock, un bouton « Choisir un miel » ouvre une feuille semblable : recherche, tri par stock ou par nom, et des puces « Aime le sucré, l’acide… » pour trouver le miel qui s’accorde avec ce qu’on veut y mettre.',
                ],
            },
            {
                h: 'L’accord et le guide des classiques',
                t: 'L’accord (0 à 3 étoiles) se lit avant de brasser, avec ses raisons ; il fait le prix. Trois étoiles demandent un mélange réussi. Sous le compositeur, le « Guide des accords & classiques » (dépliable) rappelle quels goûts s’accordent ou se battent et suit les grandes recettes déjà découvertes.',
            },
            {
                h: 'Les grandes recettes',
                t: 'Cinq mélanges valent deux étoiles de plus et ne se battent jamais : coriandre et oranger amer (la blanche), seigle et épicéa (la sahti), café et chocolat noir (la stout), cerise et framboise (la bière aux fruits rouges), citrouille et vanille (la bière de citrouille).',
            },
            {
                h: 'Mes bières',
                b: [
                    'Chaque nouvelle recette reçoit un nom, que vous changez avec le crayon.',
                    'Les étoiles d’une recette restent secrètes jusqu’au premier brassin (on voit des indices).',
                    'Plus vous vendez une même bière, plus son prix baisse, puis il remonte avec le temps.',
                    '« Rebrasser » refait la dernière recette ; « Planifier » (dans Mes bières, Mon carnet ou le Plan de production) enchaîne plusieurs brassins en préparant le malt à la malterie et en relançant vos cuves libres ; les cuves peuvent aussi tourner en boucle pendant votre absence.',
                    'Qualité : avec « Meilleurs ingrédients d’abord » (atelier), un brassin fait d’ingrédients en argent, en or, en platine ou en diamant donne des bouteilles de ce rang (même score que les plats). Elles se vendent plus cher, gardent leur rang en cave, et une commande de bière les paie selon leur rang (les meilleures partent en premier).',
                ],
            },
            {
                h: 'L’hydromel (niveau 45)',
                b: [
                    'Choisissez « Hydromel » : 6 pots de miel à la place du malt, pas de houblon, et un ingrédient de plus que pour une bière (4 au plus).',
                    'Le miel toutes fleurs va avec tout, sans éclat ; chaque miel de fleur (lavande, châtaignier, oranger…) aime certains goûts.',
                    'Les classiques donnent une étoile de plus : pomme (cyser), raisin (pyment), fruits rouges (mélomel), herbes et épices (métheglin).',
                    'Il fermente plus lentement (15 min, puis 5 par ingrédient), se range dans « Mes boissons », a ses commandes et vieillit en fût à la cave. Chaque miel brassé ajoute une page au livre.',
                ],
            },
            {
                h: 'Le concours de la saison',
                t: 'Onglet Clients. Chaque saison, le jury attend une boisson d’un goût précis : acidulée au printemps, sucrée l’été, amère l’automne, épicée l’hiver. Note sur 20 : 4 par étoile, 4 pour le bon goût, 1 par rang de la meilleure bouteille. Le jury goûte deux bouteilles ; les prix (pièces, expérience, renommée) tombent à la fin de la saison.',
            },
            {
                h: 'Commandes et fût',
                t: 'Frère Hugues, Agnès et des habitués demandent une bière précise. Après le cellier à fûts, vos bières vieillissent en fût à la cave. Le livre des bières donne une récompense toutes les 10 pages.',
            },
        ],
        see: ['cave', 'village'],
    },
    // 1.77.1 : comment obtenir chaque qualité, coin par coin
    {
        id: 'qualityAG',
        cat: 'grow',
        name: 'La qualité : argent et or',
        icon: ['ui', 'medalG'],
        lvl: 3,
        go: 'machines/workshop',
        intro: 'Chaque produit peut sortir normal, en argent (×1,25 le prix) ou en or (×1,6). Voici, coin par coin, ce qui fait monter la qualité.',
        secs: [
            {
                h: 'Au champ et en serre',
                t: 'Chaque récolte tire sa qualité. Les chances montent avec : une culture de saison, la serre (encore plus hors saison), le soleil ou la pluie, l’engrais posé sur la parcelle (le plus fort), un sol qui convient à la culture, les cultures compagnes bien voisines, des fleurs ou un banc de chêne à côté, la compétence « Œil d’expert », vos rubans (jusqu’à +10 %) et les variétés savoureuses du labo. Environ un tiers des belles récoltes sont en or, les autres en argent. Un vœu d’étoile filante donne de l’or à coup sûr pendant quelque temps.',
            },
            {
                h: 'À l’île, à l’oasis et au Grand Nord',
                t: 'Mêmes règles, avec une base un peu meilleure qu’au champ : « Œil d’expert », rubans, variétés, et à l’oasis et au Nord les cultures compagnes.',
            },
            {
                h: 'Au verger',
                t: 'Un arbre donne de plus beaux fruits en mûrissant (jusqu’à +15 % de chances quand il est mûr). Aident aussi : le soleil ou la pluie, « Œil d’expert », « Fruits de concours », les rubans et les variétés d’arbres. L’hiver fait un peu baisser la qualité (sauf aux îles). Un greffon doré ou un arbre doré remarquable donnent un fruit sur quatre en or.',
            },
            {
                h: 'Au pré (produits des bêtes)',
                t: 'Œufs, lait, laine… sortent normaux tant que la bête est ordinaire. La qualité vient de l’élevage au labo : une bête née de bons croisements, avec les caractères « riche », « doux » et « arôme » au-dessus de la normale, donne de l’argent et de l’or. Plus elle les dépasse, plus c’est souvent.',
            },
            {
                h: 'La viande (1.81)',
                t: 'La viande et les autres seconds produits (laine de dromadaire, bois de renne…) sortent de la même qualité que le produit ramassé avec eux : une vache qui donne du lait en or donne aussi du bœuf en or. Il faut donc des bêtes de bonne race (labo).',
            },
            {
                h: 'À la pêche (1.80)',
                t: 'À la canne, la taille fait la qualité : une petite prise est normale, une belle prise en argent, un trophée en or. Un ferrage « Parfait ! » la monte d’un rang (une belle prise parfaite sort en or). Le poisson doré sort toujours en or. Dans les nasses et le filet de mer, un peu d’argent et d’or au hasard, un peu plus avec un appât dans la nasse.',
            },
            {
                h: 'À l’atelier (plats et produits fabriqués)',
                t: 'Un plat prend la qualité de ses ingrédients. Allumez « Meilleurs ingrédients d’abord » (Atelier › Production, dès que le labo est ouvert) : le jeu prend vos plus beaux ingrédients. On fait la moyenne des ingrédients (argent 1 point, or 2, platine 3, diamant 4) : à partir de 1,2 le plat sort en argent, à partir de 1,8 en or. Une variété savoureuse ajoute des points. Une étoile sur la recette annonce le rang du lot avant de le lancer.',
            },
            {
                h: 'Au comptoir',
                t: 'La boisson prend la note du mini-jeu : deux étoiles donnent de l’argent, trois étoiles de l’or. Si les ingrédients sont meilleurs que la note, c’est leur rang qui compte.',
            },
            {
                h: 'À la brasserie',
                t: 'Comme à l’atelier : avec « Meilleurs ingrédients d’abord », un brassin fait d’ingrédients en argent ou en or donne des bouteilles de ce rang (pour un hydromel, le miel compte aussi). Elles se vendent plus cher et les commandes les paient selon leur rang.',
            },
            {
                h: 'À la cave',
                t: 'Un lot garde le rang que toutes ses unités partagent : six fromages en or font un lot en or ; cinq en or et un normal, un lot normal. Un lot de qualité vieillit un peu mieux et se vend plus cher. Mettez donc en cave des produits du même rang.',
            },
            {
                h: 'Où le voir',
                t: 'La grange : touchez un produit pour voir combien sont normaux, en argent, en or. Le Livre de la ferme : la fiche d’un produit compte ceux faits en argent et en or.',
            },
        ],
        see: ['qualityPD', 'mastery', 'labplants', 'labanimals'],
    },
    {
        id: 'qualityPD',
        cat: 'grow',
        name: 'La qualité : platine et diamant',
        icon: ['item', 'sapphire'],
        lvl: 20,
        go: 'machines/workshop',
        intro: 'Au-dessus de l’or : le platine (×2,1 le prix) et le diamant (×2,8). Rien ne sort en platine ou en diamant tout seul : il faut une maîtrise, ou des ingrédients de ce rang.',
        secs: [
            {
                h: 'La règle de base : la maîtrise',
                t: 'Quand un produit est maîtrisé en or (cultures : 10 000 ; bêtes : 6 000), chacune de ses récoltes en or a une chance de monter en platine : 15 %, puis 20 % au rang platine de la maîtrise, puis 25 % au rang diamant. À partir du rang platine (cultures : 25 000 ; bêtes : 15 000), environ une montée sur huit devient du diamant, puis une sur cinq au rang diamant (cultures : 60 000 ; bêtes : 36 000).',
            },
            {
                h: 'Au champ, à l’île, à l’oasis et au Grand Nord',
                t: 'D’abord beaucoup d’or (voir « argent et or »), puis la maîtrise de la culture fait monter une partie de cet or en platine, et plus tard en diamant. Une culture que vous faites beaucoup est donc la plus facile à monter.',
            },
            {
                h: 'Au verger',
                t: 'Même règle avec la maîtrise du fruit : les fruits en or d’un arbre mûr (ou d’un greffon doré) montent en platine puis en diamant.',
            },
            {
                h: 'Au pré',
                t: 'Il faut des bêtes de bonne race pour avoir de l’or (labo), puis la maîtrise du produit (œuf, lait…) pour monter une partie de cet or en platine et en diamant.',
            },
            {
                h: 'La viande',
                t: 'Elle suit le produit principal de la bête : quand le lait, les œufs ou la laine montent en platine ou en diamant par leur maîtrise, la viande ramassée avec eux aussi. Pareil pour le petit-lait, la corne, la toison royale et la gelée royale (le compost n’a pas de qualité).',
            },
            {
                h: 'À la pêche',
                t: 'Chaque poisson a sa maîtrise (1.80) : 30, 250 et 1 000 prises, puis 2 500 et 6 000. Maîtrisé en or, un poisson pris en or (trophée, belle prise parfaite, poisson doré) peut monter en platine, puis en diamant au rang platine. Les plats de poisson suivent alors leurs poissons, comme tous les plats.',
            },
            {
                h: 'À l’atelier : les plats',
                t: 'Un plat ne monte pas tout seul : il faut des ingrédients de ce rang, avec « Meilleurs ingrédients d’abord ». Moyenne de 2,5 : platine ; moyenne de 3,5 : diamant (les ingrédients sont presque tous en diamant). Exemple, la baguette en diamant : du blé en diamant (maîtrise du blé), puis 3 blés en diamant (ou 2 en diamant et 1 en platine) font une farine en diamant, puis 2 farines en diamant (ou 1 en diamant et 1 en platine) font la baguette. Un plat à plusieurs étages se prépare donc étage par étage.',
            },
            {
                h: 'Le raccourci du labo',
                t: 'Une variété savoureuse ajoute à ses unités la moitié de son goût, jusqu’à +1,2 point : un blé de variété en or vaut presque un platine, et un blé de variété en platine compte comme un diamant. Ses récoltes gardent aussi leur rang dans la grange. Avec une bonne variété, viser le platine au champ suffit pour des plats en diamant.',
            },
            {
                h: 'Au comptoir',
                t: 'Trois étoiles au mini-jeu donnent de l’or au plus. Le platine et le diamant viennent seulement des ingrédients : thé, lait, miel… de ce rang, avec « Meilleurs ingrédients d’abord ». Les clients paient le diamant 60 % de plus qu’une boisson normale.',
            },
            {
                h: 'À la brasserie et pour l’hydromel',
                t: 'Même règle que les plats : des ingrédients (et, pour l’hydromel, du miel) en platine ou en diamant donnent des bouteilles de ce rang. Elles gardent leur rang en cave et les commandes les paient ×2,1 ou ×2,8.',
            },
            {
                h: 'Les vins et la cave',
                t: 'Le vin se fait à l’atelier comme un plat : du raisin en platine ou en diamant donne du vin de ce rang (un cépage du labo aide beaucoup). En cave, un lot entièrement en diamant reste en diamant ; c’est ainsi qu’on obtient les plus grands crus (« cru d’exception » au chai) et les lots qui valent le plus.',
            },
            {
                h: 'Où le voir',
                t: 'Dans la grange, les rangs platine et diamant apparaissent sous le produit dès que vous en avez. Dans le Livre de la ferme, la fiche d’un produit ajoute « En platine » et « En diamant » dès le premier, et sa vignette gagne un point de plus.',
            },
        ],
        see: ['qualityAG', 'mastery', 'labplants'],
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
                t: 'Bronze, argent, or, puis platine et diamant. Les seuils dépendent du type : cultures 300 / 2 500 / 10 000, puis 25 000 et 60 000 ; bêtes 200 / 1 500 / 6 000, puis 15 000 et 36 000 ; produits fabriqués 50 / 400 / 2 000, puis 5 000 et 12 000 ; poissons (1.80) 30 / 250 / 1 000, puis 2 500 et 6 000.',
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
            { h: 'Où la voir', t: 'Dans la fiche de chaque produit du Livre de la ferme : les étoiles et la barre jusqu’à la suivante.' },
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
                t: 'Aux niveaux 14, 22 et 35, trois niveaux d’amélioration pour la grange, les prés, la cave, le verger, la serre, les nasses et chaque machine, fabriqués avec vos matériaux.',
            },
            { h: 'Au marché', t: 'Bois, pierre, minerais, lingots et pierres précieuses se vendent un par un ; « Tout vendre » garde ce qu’il faut.' },
        ],
        see: ['museum', 'barn', 'workshop', 'domaine'],
    },
    {
        id: 'museum',
        cat: 'nature',
        name: 'Mine souterraine et Musée',
        icon: ['ui', 'museum'],
        lvl: 8,
        go: 'farm/nature',
        intro: 'Quarante étages à explorer sous la vallée, quatre types de géodes et un Musée de 32 pièces aux bonus permanents.',
        facts: [
            { icon: ['ui', 'mineDeep'], v: '40 étages', l: '4 strates · ascenseur /5' },
            { icon: ['ui', 'geodeAmethyst'], v: '4 géodes', l: 'Ouvertes au Musée' },
            { icon: ['ui', 'museum'], v: '32 pièces', l: '4 ailes · 8 vitrines' },
            { icon: ['ui', 'star'], v: '4 bonus', l: 'Permanents à 50 % et 100 %' },
        ],
        secs: [
            {
                h: 'La descente souterraine (Ferme › Nature)',
                b: [
                    'Quatre strates de 10 étages : Carrière ancienne (niv. 8), Galeries de cuivre (niv. 18, lampe et wagonnet), Cavernes de cristal (niv. 30) et Abysses d’obsidienne (niv. 55, pioche niv. 4+).',
                    'Chaque étage est une grille 5×5 à creuser avec la lanterne (recharge automatique même jeu fermé, ou casse-croûte au charbon 2×/jour).',
                    'Trouvez l’escalier caché pour descendre. Chaque palier de 5 étages (5, 10, 15… 40) se débloque à l’ascenseur et renferme un coffre souterrain.',
                ],
            },
            {
                h: 'Outils tactiques et améliorations',
                b: [
                    'Dynamite : dégage plusieurs rochers d’un coup (croix, puis carré 3×3 avec la Caisse de dynamite).',
                    'Boussole de veine : révèle où se cachent l’escalier, les géodes et les fossiles de l’étage.',
                    'Quatre améliorations permanentes : Grand réservoir, Lampe frontale, Caisse de dynamite et Treuil renforcé.',
                ],
            },
            {
                h: 'Le Musée de la vallée (Menu › Musée)',
                b: [
                    'Quatre ailes de 8 pièces : Paléontologie (+5 % / +10 % XP), Minéralogie (+10 % / +20 % gemmes & géodes), Reliques (+3 % / +6 % prix de vente) et Trésors naturels (+10 % / +20 % forêt, mine, pêche).',
                    'Atelier de géodes : brisez vos géodes au Musée pour découvrir de nouveaux spécimens (forte priorité aux pièces manquantes) ou des gemmes rares. Les doublons se vendent directement en un clic.',
                    'Paliers de dons (tous les 4 dons jusqu’à 32) : pièces, XP, rubans de prestige et trois décorations exclusives.',
                ],
            },
        ],
        tips: ['Les bois et la pêche peuvent aussi révéler des curiosités naturelles pour la 4e aile du Musée !'],
        see: ['forest', 'pond', 'legend'],
    },
    {
        id: 'pond',
        cat: 'nature',
        name: 'La pêche',
        icon: ['ui', 'rod'],
        lvl: 9,
        go: 'farm/pond',
        intro: 'Quatre coins de pêche, des appâts, un mini-jeu où chaque poisson se bat à sa façon, et le filet en mer.',
        secs: [
            {
                h: 'Les quatre coins',
                b: [
                    'La berge (niveau 9) : gardon, ablette, goujon, perche, écrevisse, truite.',
                    'Les roseaux (niveau 11) : tanche, carpe, anguille (de nuit), lotte (nuits d’hiver), brochet, silure par temps de pluie.',
                    'Le ponton (après le chantier du village) : sandre, brochet, silure, saumon, esturgeon, lavaret (automne et hiver, à la mouche) ; poissons 25 % plus lourds.',
                    'Le lagon (niveau 40, bac de Tiago réparé) : vivaneau, mahi-mahi, poulpe et langouste (de nuit), à la crevette ; poissons 15 % plus lourds.',
                    'Le poisson doré, très rare, peut mordre partout.',
                ],
            },
            {
                h: 'Les appâts',
                t: 'Un appât multiplie par 5 les chances des poissons qu’il vise. L’écran montre ce qui mord ici et maintenant, avec les chances. Où trouver chacun : le ver de terre (niveau 9) se remplit tout seul dans la boîte à vers (un toutes les 3 minutes, 20 au plus) ; le maïs (niveau 11) vient de votre stock : un épi par prise, à récolter au champ ; la mouche (niveau 13) se fabrique au bord de l’étang avec le bouton « +4 mouches » (une plume de canard et une pelote de laine), et les défis de Marcel en donnent parfois ; le vif (ponton réparé) est une ablette de votre stock, que vous pêchez à la canne ; la crevette (niveau 40, bac de Tiago réparé) vient aussi de votre stock : celles du filet de pêche en mer. Une nasse peut aussi recevoir un appât à la pose.',
            },
            {
                h: 'Le mini-jeu',
                t: 'Gardez la zone verte sous le poisson : calme, allers-retours, tirs forts ou coups brusques selon l’espèce. Une touche au cœur de la zone est une prise parfaite (+20 % de poids). Les poissons moyens demandent deux tirages, les gros (brochet, silure, saumon, esturgeon, mahi-mahi) et le poisson doré trois : la zone change de place à chaque tirage, un raté tend la ligne, un second la casse. Votre record de l’espèce s’affiche pendant le combat. Un ver sur la berge sort les petits poissons d’un seul geste. Trois cannes (bambou, carbone au niveau 14, compétition au niveau 20) élargissent la zone et alourdissent les prises.',
            },
            {
                h: 'Les nasses',
                t: 'Deux nasses dès le niveau 12, quatre dès le niveau 14 (une de plus avec le domaine). Posées dans un coin, avec ou sans appât, elles attrapent 2 à 4 poissons communs toutes les 2 heures, même jeu fermé. Relevez-les d’un appui. Une nasse en cours peut être retirée (bouton « Retirer ») pour la poser ailleurs : l’appât revient, mais la prise en cours est perdue.',
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
                t: 'Après le phare du port, un filet de pêche en mer rapporte sardines, maquereaux, crevettes, calmars, bars, dorades, raies, thons et parfois un homard.',
            },
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
                h: 'Trois volets (1.73)',
                b: [
                    'À livrer : le tableau des villageois, puis l’acheteur pressé, le chef, Armand, les fermes voisines et le contrat de saison.',
                    'Transports : le train, l’avion-cargo, la montgolfière et le bateau. Événements : la fête de saison, le grand défi, les fêtes, la saison et les événements rares.',
                    'Une ligne par demande, avec où on en est ; ce qui est prêt passe en vert et remonte. Touchez une ligne pour l’ouvrir. Une pastille sur un volet dit que quelque chose y est prêt.',
                ],
            },
            {
                h: 'Le tableau',
                b: [
                    'Des villageois demandent des produits ; livrez dès que vous avez tout.',
                    'Touchez un produit manquant : le jeu vous mène là où on le fabrique. Le bouton « Planifier » lance en 1 clic toute la chaîne des plats manquants de la commande.',
                    'Épinglez une commande pour la garder sous les yeux, ou jetez-la.',
                    'Dès que deux commandes sont prêtes, « Tout livrer » les livre d’un coup, dans l’ordre du tableau ; chacune revérifie ce qui reste en grange.',
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
                t: 'Trois wagons à remplir, payés 2,4 fois le prix des produits, et un bonus de 50 % quand tout est chargé. Les wagons grandissent avec la ferme : quelques milliers de pièces au niveau 20, environ 65 000 au niveau 43, plus de 300 000 au niveau 72 pour un train plein. Aux hauts niveaux, il préfère les produits de valeur (60 par wagon au plus). Un train qui part plein fait monter le renom du domaine de 2 points (voir Le marché). Chaque cheval du haras le fait revenir plus tôt. Il reste environ 1 heure.',
            },
            { h: 'La montgolfière (après l’auberge)', t: 'De grosses commandes bien payées, qui partent après environ 1 heure.' },
            {
                h: 'Le bateau (après le quai)',
                t: 'Quatre produits payés très cher ; il part, puis revient. Le chantier naval le fait revenir plus vite, et le domaine (Quai agrandi) ajoute des lignes.',
            },
            {
                h: 'Planifier en 1 clic',
                t: 'Le bouton « Planifier » sur le train, la montgolfière ou le bateau lance d’un coup toute la chaîne des plats d’atelier qui manquent (stock déjà en grange déduit).',
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
                    'Les soutes grandissent avec la ferme : passé le niveau 49, un avion plein dépasse le million de pièces au niveau 72.',
                    'Touchez un produit pour aller le produire, ou « Planifier » en bas de la carte pour lancer en 1 clic toute la chaîne des soutes d’atelier restantes.',
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
            { h: 'L’expérience', t: 'Armand paie surtout en pièces. Une visite donne au plus 60 % du niveau en cours en expérience, toutes commandes et bonus compris.' },
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
                h: 'Marchander',
                b: [
                    'À chaque visite, Armand fait d’abord une offre : touchez « Négocier » pour lui répondre. Rien ne se livre avant d’être d’accord.',
                    'D’accord : son prix. Un peu plus cher (+10 %) ou bien plus cher (+25 %) : il accepte, fait une contre-proposition à mi-chemin, ou repart pour la semaine.',
                    'Plus de quantité (× 1,5) : il accepte souvent. Moins de quantité (× 0,5) : toujours, mais sans fidélité gagnée à la fin.',
                    'Son humeur monte avec sa fidélité pour ce produit et quand votre stock est en or ou mieux ; chaque demande l’agace un peu. Trois demandes au plus.',
                    'Vexé après deux demandes, il perd un point de fidélité. Être raisonnable rapporte en moyenne 5 à 10 % de plus.',
                ],
            },
            {
                h: 'La commande',
                b: [
                    'De 10 à 1 200 unités. Le total est borné par votre niveau (puis relevé par la maîtrise et la fidélité) : un produit trop cher pour votre niveau ne peut pas être choisi.',
                    'Payée à prix fixe (environ 1,8 fois le prix, plus la maîtrise et la fidélité), quelle que soit la demande du marché.',
                    'Commande finie : bonus de 60 %, trois matériaux rares et +1 de fidélité (5 au maximum, par produit).',
                    'Plus la fidélité monte, plus la commande grossit et mieux elle paie.',
                    'Une fois le marché conclu, le bouton « Planifier » (par ligne ou « Tout planifier ») lance en 1 clic toute la chaîne des produits d’atelier demandés.',
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
                    'La récompense (pièces, expérience, ruban, matériaux rares) vaut le coup. Si le produit sort d’un atelier, le bouton « Planifier » lance toute sa chaîne en 1 clic.',
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
                t: 'Vous fixez le prix : plus il est haut, plus le client tarde. 4 places, puis une de plus aux niveaux 8, 16, 26 et 37 (et jusqu’à 3 de plus avec la maison et le domaine). Une place prend 10 exemplaires, 12 dès le niveau 43, 16 dès le niveau 63.',
            },
            {
                h: 'Le renom du domaine',
                t: `Quand la ferme fait parler d’elle, le grossiste paie tout plus cher : +1 % par point de renom, ${RENOM.max} % au plus. Un train qui part plein donne ${RENOM.train} points. Une bouteille de la cave vendue « Vieux » ou mieux au négociant, une vente réussie aux enchères, une commande de cave, de bière ou de parfum livrée donnent 1 point. Les dépendances du domaine le renforcent : le pigeonnier relève le plafond, la tour de l’horloge ralentit la baisse, la table d’hôtes l’empêche de retomber à zéro. Le renom baisse d’un point toutes les 4 heures : il se garde en jouant régulièrement le train, la cave, la brasserie et la parfumerie. Il s’affiche en haut du grossiste.`,
            },
            { h: 'Le produit du jour et la réserve', t: 'Un produit du jour paie plus. La réserve met de côté ce que demandent commandes et défis.' },
            {
                h: 'Les améliorations',
                t: 'Engrais magique (niveau 6), négociation (11), mangeoire automatique (14), semoir (16), abondance (17), moissonneuse (24), plan du champ (28).',
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
        id: 'family',
        cat: 'village',
        name: 'La famille',
        icon: ['ui', 'fmHome'],
        lvl: 30,
        go: 'village/family',
        intro: 'Dès le niveau 30, on peut fonder une famille : faire la cour à un villageois, l’épouser, et agrandir le foyer.',
        secs: [
            {
                h: 'Faire la cour',
                t: 'Village › Famille. Dix-neuf villageois adultes et libres peuvent être courtisés, à partir de 3 cœurs d’amitié, une personne à la fois. Un rendez-vous toutes les trois heures : la promenade (gratuite), le pique-nique (trois produits qu’il ou elle aime), le bal du village (des pièces, dès 2 roses), le dîner aux chandelles (son produit adoré, dès 3 roses). Les cadeaux du village comptent aussi.',
            },
            {
                h: 'La demande et la noce',
                t: 'À 5 roses, on demande sa main avec une bague en améthyste (bijouterie). La noce demande la chambre des époux (onglet Pièces), des gâteaux de Savoie, des pots de fleurs, du cidre et des pièces. Elle donne de l’expérience, 3 points de renommée et une photo.',
            },
            {
                h: 'Le conjoint',
                t: 'Il ou elle s’installe à la ferme. Tant que sa tendresse reste au-dessus de 50 %, son talent d’ami monte d’un cran (même sans 5 cœurs). Toutes les douze heures, un panier de trois produits qu’il ou elle aime. La tendresse baisse un peu chaque jour : un mot doux toutes les quatre heures la relève.',
            },
            {
                h: 'Le foyer',
                t: 'Les pièces s’ajoutent à la maison, avec des pièces d’or et des matériaux : la chambre des époux, le grand salon (paniers plus garnis), la chambre de bébé, la chambre des enfants (deuxième et troisième enfant), la salle de jeux (on grandit plus vite, le bonheur dure) et le bureau des grands (coups de main plus forts).',
            },
            {
                h: 'Les enfants',
                t: 'Onglet Enfants, après la noce et avec la chambre de bébé : le bébé arrive six heures après l’annonce, si votre conjoint se sent aimé. Trois enfants au plus. Leur visage mêle le vôtre et celui de votre conjoint. Ils grandissent avec le temps : bébé deux jours, enfant quatre jours, ado quatre jours, puis adulte.',
            },
            {
                h: 'Bonheur, soins et coups de main',
                t: 'Le bonheur baisse chaque jour ; au-dessous de 50 %, un enfant grandit deux fois moins vite et aide moitié moins. Chaque soin (biberon, câlin, jeux, goûter, discussion, argent de poche) donne du bonheur et fait grandir un peu. L’enfant ramasse de petites choses toutes les six heures ; l’ado et l’adulte choisissent où aider : au potager, avec les bêtes, à l’atelier ou au marché.',
            },
            {
                h: 'Les enfants adultes',
                t: 'Un enfant adulte choisit son métier : les produits de ce métier se vendent 8 % plus cher. Il ou elle peut épouser un résident du camping avec qui vous avez 3 cœurs d’amitié : la noce et une maison au village (de plus en plus chère). Le couple a ensuite deux enfants, un tous les deux jours : vos petits-enfants.',
            },
            {
                h: 'La transmission',
                t: 'Sept jours après la noce (ou la transmission précédente), vous pouvez léguer la ferme à un enfant adulte qui a choisi son métier : vous devenez lui ou elle, avec son conjoint et ses enfants. Rien ne repart de zéro : la ferme, les pièces d’or et le niveau restent. Vous et votre conjoint prenez votre retraite au village : chaque génération d’anciens donne +5 % d’expérience aux commandes (cinq au plus). Les frères et sœurs restent au village, et leur métier compte toujours.',
            },
            {
                h: 'Anniversaires et cadeaux',
                t: 'Tous les deux jours, jusqu’à l’âge adulte, un enfant fête son anniversaire : vous avez une journée pour le fêter avec un gâteau (éponge, fraises, chocolat, noix…). Bonheur au maximum, quelques heures de croissance, et le double si vous offrez aussi son cadeau préféré. Un anniversaire oublié rend triste. Le cadeau préféré change avec l’âge et après chaque cadeau ; on peut l’offrir toutes les huit heures.',
            },
            {
                h: 'Les petites demandes',
                t: 'De temps en temps, un enfant (à partir de l’âge « enfant ») vous demande quelques produits pour une kermesse, un projet d’école ou des amis. Donnez-les dans les huit heures : il ou elle gagne du bonheur et vous rend trois fois leur prix en pièces. Une demande oubliée coûte un peu de bonheur ; on peut aussi dire non. Les petits-enfants ont leur anniversaire eux aussi : un gâteau pour le fêter, de l’expérience et une photo, sans tristesse s’il est oublié.',
            },
            {
                h: 'Le repas de famille',
                t: 'Une fois par jour (onglet Mon foyer), toute la famille passe à table : conjoint, enfants, frères et sœurs et leurs époux, anciens. Il faut un plat cuisiné pour deux convives. Tendresse et bonheur des enfants remontent, et l’expérience grandit avec la tablée (+50 % si tous les plats sont différents).',
            },
            {
                h: 'L’arbre et le village',
                t: 'Le bouton « L’arbre de la famille » (onglet Enfants) montre toutes les générations. Toute la famille vit au village : enfants, leurs époux, petits-enfants, frères et sœurs, anciens. On les retrouve dans Village › Villageois, avec le filtre « Famille ».',
            },
        ],
        see: ['village'],
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
            {
                h: 'Où le trouver',
                t: 'Onglet Village › sous-onglet Village, en trois onglets : Histoire (la carte, les chantiers et le domaine), Villageois et Concours.',
            },
            {
                h: 'L’histoire',
                b: [
                    'Chaque chapitre est un chantier : on y livre des produits, des pièces et des matériaux, et chaque chapitre rapporte de l’expérience et des pièces (un ruban dès le chapitre 5). Le bouton « Planifier » lance en 1 clic toute la chaîne des produits d’atelier qui manquent au chantier.',
                    'Un chapitre fini ouvre des bâtiments, des machines, des cultures ou des villageois. Les grandes étapes (hameau, port, abbaye, île, station, alpage, domaine, château) ouvrent une nouvelle carte.',
                    'Un chantier ne demande jamais un produit que vous n’avez pas encore pu débloquer.',
                ],
            },
            {
                h: 'Les villageois et l’amitié',
                b: [
                    'Elle monte quand vous livrez leurs commandes, leur servez une boisson au comptoir ou leur faites un cadeau.',
                    'Onglet Villageois : les anniversaires qui viennent, un tri (tous, cadeau possible, histoire) et une ligne courte par villageois. Touchez-le pour sa fiche : Amitié, Cadeau, Goûts, Histoire.',
                    'Un cadeau par villageois et par jour de jeu (environ 5 minutes réelles). Il aime certains produits : 1 point, 3 si c’est un produit fabriqué. Il en adore un seul, à deviner : 5 points (à 2 cœurs, sa fiche dit de quelle machine il sort). Le reste, c’est « bof » : rien.',
                    'Avec la Maison, un paquet peut aussi servir de cadeau du jour : 3 points, plus 1 par produit qu’il aime et 5 s’il contient son produit adoré.',
                    'Chaque villageois a son anniversaire (sa fiche, et une ligne en haut de la liste) : ce jour-là, un cadeau compte triple, et son produit adoré lui vaut un merci en pièces.',
                    'Cinq cœurs en tout. Chaque cœur rapporte des pièces, parfois des graines ou une recette que le villageois vous apprend ; le cinquième fait de lui un ami pour la vie.',
                ],
            },
            {
                h: 'Le talent de l’ami et les histoires (1.70)',
                b: [
                    'À 5 cœurs, chaque villageois prête son talent pour toujours : les machines de son métier vont 10 % plus vite et leurs produits se vendent 5 % plus cher (Victor : soins moins chers ; Morgane : bateaux mieux payés ; Hugues : cuves de l’abbaye plus rapides ; Octave : vieillissement plus rapide à la cave ; Inès : en plus de la poterie, les clients du comptoir paient 10 % de plus). Depuis la 1.75.3, Odette connaît aussi la crêperie, Gaston la pizzeria, Paul la fabrique de pâtes et Margaux le moulin à huile.',
                    'Chaque villageois a son histoire (trois étapes, des produits à apporter). Finie, elle double son talent et rapporte un ruban.',
                    'Quatre duos : Hugues et Agnès, Idris et Yasmine, Tuomas et Ingrid, Morgane et Yann. Un cadeau à l’un fait plaisir à l’autre (+1) ; les deux à 5 cœurs ouvrent une histoire à deux (deux rubans).',
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
                    'Dès le niveau 12, chaque lundi, un voisin à tour de rôle vous passe la commande spéciale de la semaine : un seul plat de sa spécialité, un plat que vous n’avez jamais livré aux voisins (à défaut, un des moins livrés). La récompense est très belle : 2,5 fois la valeur en pièces, trois matériaux rares, de l’expérience et 2 points d’amitié. Elle disparaît lundi. Le bouton « Planifier » permet aussi de lancer en 1 clic les plats d’un voisin ou de sa commande spéciale.',
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
                h: 'Les fermes rivales',
                b: [
                    'Elles se calent sur vous : leur but de la semaine suit la moyenne de vos trois derniers concours. Hortense est la plus douce, Firmin la plus coriace (5 % au-dessus de votre moyenne). Chacune a sa forme de la semaine, à 15 % près.',
                    'Elles jouent par séances, chacune à ses heures : Hortense tôt le matin, Firmin le soir. Certains jours elles ne font rien, d’autres elles font un gros coup.',
                    'Dans les deux derniers jours, une rivale juste derrière vous donne un coup de collier ; une rivale très loin derrière lâche un peu.',
                    'La carte du concours dit à combien de points est la ferme devant vous, et ce que les rivales viennent de faire.',
                ],
            },
            {
                h: 'Les ligues',
                b: [
                    `Bronze (niveau 4), argent (17), or (29), diamant (${LEAGUES.find(l => l.id === 'diamond').lvl}).`,
                    'Première du classement : vous montez, avec des récompenses plus grosses et des rivales un peu plus fortes (6 % par ligue).',
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
                    'Niveau 45, grande ferme : toutes les commandes paient 10 % de plus.',
                    `Niveau ${HOUSE[HOUSE.length - 1].lvl}, le manoir : +80 places dans la grange et 1 place de plus à l’étal.`,
                ],
            },
            {
                h: 'L’Équipe du Domaine (Maison › Équipe)',
                b: [
                    'Tout le personnel de la ferme est réuni dans un seul onglet : Maison › Équipe, avec un bouton maître « Tout mettre en pause / Tout activer » en haut de l’écran (et la pastille rapide de Théo sur le bandeau de la Maison).',
                    'Théo · Champs & Serre (après le pont du hameau, ch. 5) : récolte, replante et arrose de 6 à 36 parcelles (+ aide au champ du domaine). Dès le niveau 3 (avec la serre bâtie), la case « Inclure la Serre » lui confie aussi la serre ; dès le niveau 4, « Suivre le Plan actif » sème en priorité les cultures demandées par le Plan en cours.',
                    'Lina · Animaux (dès niv. 28) : nourrit les bêtes et ramasse les productions du 1er pré jusqu’à tous les prés (3 modes : Nourrir & ramasser, Ramasser seulement, Nourrir seulement). Au niveau 4 (niv. 68), Lina soigne aussi automatiquement les bêtes malades.',
                    'Henri · Atelier (dès niv. 32) : choisissez 3 à 6 recettes à maintenir au-dessus d’un seuil (ex. Farine : 20, Beurre : 15). Henri ramasse les lots finis et relance automatiquement uniquement lorsque le stock passe sous le seuil, sans ouvrir vos machines une par une.',
                    'Milo · Nature (dès niv. 30) : relève les nasses de l’étang, ramasse les fruits tombés du verger (ferme puis toutes les contrées au niv. 3) ainsi que les charges du bûcheron/mineur et la cueillette saisonnière de la forêt (dès niv. 2). Toute l’équipe est conservée après un prestige.',
                ],
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
                h: 'Ruches et miels de fleurs',
                b: [
                    'On peut dire aux abeilles de ne pas faire de miel : Réglages › Confort (« Abeilles du champ au repos ») pour les ruches du champ, le bouton « Au repos » sur le rucher de chaque contrée, et le bouton « Au repos : pas de miel » dans la fiche de la ruche d’élevage. Le miel déjà en pot reste à récolter.',
                    'Une ruche posée dans le champ fait du miel avec ce qui pousse autour (ses 8 voisines) ; la ruche d’élevage, au pré, butine tout le champ, la serre et, au printemps, les arbres du verger.',
                    'Si une fleur fait au moins la moitié de ce qui fleurit, avec au moins 4 parcelles, le miel prend son nom : lavande, tournesol, sarrasin, menthe, framboisier, myrtille, coton, basilic, pommier, poirier, prunier, cerisier, citronnier, oranger, châtaignier, amandier. Sinon : miel toutes fleurs.',
                    'Une culture compte comme en fleur à partir de la moitié de sa pousse. Touchez une ruche (ou la fiche de la ruche d’élevage) pour savoir ce qu’elle prépare et ce qu’il manque.',
                    'Un miel de fleur fait partie du stock de miel : toutes les recettes au miel l’acceptent. Il vaut plus cher (jusqu’à × 1,8), se vend depuis la grange, se range au coffre ; le carnet du potager garde la liste de vos miels.',
                    'Les contrées ont leur rucher (1 à 3 ruches), qui ne butine que la contrée : litchi, avocatier et tiaré sur l’île ; arganier et coriandre à l’oasis ; sapin (le miellat des épicéas) et airelle au Grand Nord. Ce sont les miels les plus chers (jusqu’à × 2,2).',
                ],
            },
            {
                h: 'Le style de la maison (niveau 8)',
                t: 'Clôture, allées, toit et grange : chaque style acheté donne 8 points de charme au concours, pour toujours. Changez à volonté parmi ceux que vous avez.',
            },
            { h: 'Le mur du salon', t: 'Accrochez votre plus gros poisson : +20 points de charme.' },
            {
                h: 'Photos et carte postale',
                t: 'Les grands moments (niveaux, chapitres, amis pour la vie, concours gagné, nouvelle ferme, première aurore boréale) prennent une photo dans l’album de la ferme, 60 au plus, qui se partage. La carte postale (menu) dessine votre ferme du moment, à envoyer.',
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
        intro: 'Le grand chantier du jeu, fait pour dépenser ses pièces jusqu’au bout : le Tableau d’intendance, neuf branches de huit paliers et six dépendances.',
        secs: [
            {
                h: 'Où le trouver',
                t: 'Village › sous-onglet Village, sous la carte de l’histoire (niveau 25). Deux volets : Améliorations (le Tableau d’intendance et les neuf branches) et Dépendances (six bâtiments, niveau 49).',
            },
            {
                h: 'Le Tableau d’intendance (4 paliers)',
                b: [
                    'Débloque les plans de production à plusieurs plats et bières maison dans une même chaîne partagée : 2, 3, 5 puis 8 produits simultanés (au lieu d’un seul par défaut).',
                    'Coût progressif en pièces (75 000, 250 000, 800 000 puis 2,5 millions), planches et outils.',
                ],
            },
            {
                h: 'Les neuf branches',
                b: [
                    'Grange agrandie : de la place pour ranger (2 350 places en tout).',
                    'Cuisines et ateliers : +1 place dans la file de chaque machine à chaque palier, et des dame-jeannes supplémentaires à l’Atelier du Parfumeur (paliers 2 et 5).',
                    'Aide au champ : Théo soigne plus de parcelles.',
                    'Commerce : des commandes au tableau et des places à l’étal en plus.',
                    'Annexes des métiers : des cuves de brasserie, un siège au comptoir, des étagères de cave, des nasses, une place à l’étable de sélection.',
                    'Suite d’Armand : jusqu’à quatre produits phares, commande conservée d’une visite à l’autre, jusqu’à +30 % de paiement.',
                    'Piste du cargo : cinq soutes de plus, +40 % au bonus d’avion plein.',
                    'Quai agrandi : cinq lignes de plus au bateau, qui revient jusqu’à 45 % plus vite.',
                    'Réception : les visiteurs restent jusqu’à 160 % plus longtemps.',
                ],
            },
            {
                h: 'Comment ça s’achète',
                b: [
                    'Chaque branche s’achète palier par palier, du premier au huitième. Chaque palier coûte des pièces et deux matériaux.',
                    'Les cinq premiers paliers vont de 100 000 à 8,1 millions de pièces. Les paliers 6, 7 et 8 coûtent 20, 45 et 100 millions : ce sont les grands chantiers de la fin de partie.',
                    'Au palier 8, le bâtiment reçoit son oriflamme dorée.',
                ],
            },
            {
                h: 'Les dépendances (niveau 49)',
                b: [
                    'Six bâtiments d’apparat, trois niveaux chacun : 15, 40 puis 100 millions de pièces.',
                    'La table d’hôtes : le renom du domaine ne descend jamais sous 2, 4 puis 6 %.',
                    'Le pigeonnier : le renom du domaine monte jusqu’à 14, 16 puis 18 % (au lieu de 12).',
                    'La tour de l’horloge : le renom baisse toutes les 5, 6 puis 8 heures (au lieu de 4).',
                    'La bibliothèque : +5, +10 puis +15 % d’expérience des commandes et des transports.',
                    'La remise du charron : le train paie 10, 20 puis 30 % de plus.',
                    'Le relais de poste : les commandes du village paient 10, 20 puis 30 % de plus.',
                ],
            },
        ],
        see: ['house', 'armand', 'cargo', 'trains', 'market'],
        tips: ['Tout le domaine coûte plus de deux milliards de pièces : c’est fait pour durer.', 'Le pigeonnier, l’horloge et la table d’hôtes vont ensemble : un renom plus haut, qui baisse moins vite et jamais jusqu’à zéro.'],
    },
    {
        id: 'skills',
        cat: 'grow',
        name: 'Les compétences',
        icon: ['ui', 'star'],
        lvl: 2,
        go: 'sheet:progress',
        intro: 'Chaque niveau gagné (jusqu’au niveau 100) donne un point à placer dans un arbre visuel en 3 grandes voies et 11 branches (108 rangs pour 99 points : choisissez votre spécialisation !).',
        secs: [
            { h: 'Où et comment', t: 'Menu › Progrès › Compétences. Passez de la Vue globale en constellation au zoom par voie, touchez un nœud pour voir ses effets puis « Apprendre ». Les liens s’illuminent au fil de vos choix.' },
            {
                h: 'Voie Terre & Nature (vert)',
                b: [
                    'Agriculture : Main verte, Récolte généreuse, Œil d’expert et la clé Toucher d’or.',
                    'Verger : Arboriculteur, Panier plein, Vieux arbres et Fruits de concours.',
                    'Nature : Bras solides, Forêt vivante, Œil du mineur et Prospecteur.',
                    'Pêche & Mer : Bon ferrage, Nasses pleines, Filet solide et Loup de mer.',
                ],
            },
            {
                h: 'Voie Domaine & Élevage (ambre)',
                b: [
                    'Élevage : Bien nourris, Grande mangeoire, Pâturage fertile, Bon éleveur et Pouponnière.',
                    'Atelier : Mains agiles, Fournée généreuse, Fait maison et Grand atelier.',
                    'Domaine & Équipe : Cadence d’équipe, Maître de chai (cave/abbaye/parfums), Sens de l’accueil et la clé Intendant d’or (+1 recette pour Henri, +2 parcelles pour Théo).',
                ],
            },
            {
                h: 'Voie Commerce & Exploration (bleu)',
                b: [
                    'Commerce : Bagou, Client fidèle, Logisticien et Marchand avisé.',
                    'Village : Bâtisseur, Bon voisin, Maquignon et Grand tableau.',
                    'Contrées : Main tropicale, Sourcier, Poêlier, Riziculteur (Terres d’Asie) et Caravanier.',
                    'Mine & Musée : Lanterne économe, Chasseur de géodes, Œil d’archéologue et Archéologue chevronné.',
                ],
            },
            {
                h: 'Règles',
                b: [
                    'Chaque branche part d’une base qui se ramifie en 2 ou 3 spécialités, puis converge vers un nœud Clé doré (4 points requis dans la branche).',
                    'Avec 108 rangs pour 99 points au niveau 100, chaque ferme peut se construire un profil unique.',
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
                    'Collection : l’étagère de 18 pages (potager, verger, poissons, élevage, plats, fromagerie, boissons, bières, cuvées, mines et gemmes, races…). Chaque page donne des récompenses à 25, 50, 75 et 100 % (un ruban au complet).',
                    'Maîtrise : les étoiles de chaque produit.',
                    'Exploits : 39 succès en trois médailles (bronze, argent, or). La récompense suit votre niveau : des pièces, une part du niveau en expérience, et des rubans en argent (1) et en or (2). Tri En cours / Terminés ; ceux à réclamer passent en premier.',
                    'Légende : le chemin vers la Ferme légendaire.',
                    'Album : les photos de vos grands moments.',
                ],
            },
            {
                h: 'Les fiches',
                t: 'Chaque entrée de la collection a sa fiche : combien vous en avez fabriqué, en argent, en or, en platine et en diamant, sa maîtrise, la première fois, et l’anecdote de Mamie Odette. Les poissons aussi (prises par qualité, maîtrise). Sous chaque entrée, les pastilles montrent les qualités déjà obtenues.',
            },
            {
                h: 'La page Élevage (1.82)',
                t: 'Les produits de toutes vos bêtes : œufs, lait, laine, cire, crin… et leurs seconds produits (viandes, petit-lait, corne, toison royale, gelée royale). Chacun entre au premier ramassage.',
            },
        ],
        see: ['mastery', 'legend', 'decor'],
    },
    {
        id: 'meuhcg',
        cat: 'grow',
        name: 'MeuhCG : cartes et duels',
        icon: ['ui', 'meuhcg'],
        lvl: 1,
        go: 'sheet:tcg',
        intro: `${TCG_CARDS.length} cartes en ${TCG_SET_IDS.length} séries, Pioche Miracle, Météo de duel et Ligue — 100 % indépendant de l’économie de la ferme.`,
        facts: [
            { icon: ['ui', 'tcgPack'], v: `${TCG_CARDS.length} cartes`, l: '10 séries + Doré' },
            { icon: ['ui', 'star'], v: `${TCG_DECK_BUDGET} ★ max`, l: '5 cartes · 3 decks' },
            { icon: ['ui', 'tcgDuel'], v: '5 manches', l: 'Météo & manche ×2' },
            { icon: ['ui', 'trophy'], v: 'Ligue & Tournoi', l: '6 rangs · 3 matchs/j' },
        ],
        secs: [
            {
                h: 'Bien débuter',
                steps: [
                    { icon: ['ui', 'tcgPack'], label: 'Boosters', sub: '1 gratuit / jour' },
                    { icon: ['ui', 'meuhcg'], label: 'Deck', sub: '5 cartes ≤ 16★' },
                    { icon: ['ui', 'tcgDuel'], label: 'Duels', sub: '5 manches' },
                    { icon: ['ui', 'trophy'], label: 'Tournoi', sub: 'Booster Doré' },
                ],
                b: [
                    'Accès : Menu › Collections › MeuhCG. Aucun lien avec vos pièces ou ressources de la ferme.',
                    'Départ : 2 boosters gratuits + 120 jetons, puis 1 booster gratuit + 30 jetons chaque jour.',
                    'Boosters : 5 cartes dont 1 Rare+ et 1 édition spéciale garanties ; Légendaire/Secrète garantie au plus tous les 10 boosters.',
                ],
            },
            {
                h: 'Les 6 pouvoirs de famille',
                tiles: Object.values(TCG_FAMILIES).map(f => ({
                    icon: f.icon,
                    title: f.name,
                    val: f.power,
                    sub: f.powerDesc,
                })),
                t: 'Placer 2 cartes de la même famille dans votre deck active la synergie (+2). Certaines paires emblématiques déclenchent en plus un Duo secret (+1 ou +2).',
            },
            {
                h: '3 Decks & budget de 16 étoiles',
                b: [
                    '3 emplacements : préparez jusqu’à 3 decks (ex. classique 16★ et Poids Plume 12★) et basculez en 1 clic.',
                    `Coût par rareté : Commune (${TCG_RARITIES.C.cost}★), Peu commune (${TCG_RARITIES.U.cost}★), Rare (${TCG_RARITIES.R.cost}★), Holo (${TCG_RARITIES.F.cost}★), Légendaire (${TCG_RARITIES.L.cost}★), Secrète (${TCG_RARITIES.S.cost}★).`,
                    'Bouton Auto : compose automatiquement le meilleur deck sous le budget en optimisant synergies et Duos.',
                ],
            },
            {
                h: 'Duels, Manche ×2 & coups tactiques',
                b: [
                    `Adversaires : ${TCG_VILLAGER_DUELS.length} villageois, vos vrais campeurs/résidents, ainsi que votre conjoint et vos enfants.`,
                    'Manche Double (×2) : une manche parmi M2–M4 vaut 2 points (annoncée sur la frise dès le début).',
                    'Lecture instantanée : chaque carte en main affiche son score réel en vert et le détail de ses bonus actifs.',
                    'Coups tactiques (1×/duel) : « Changer critère » et « Coup de Maître +3 ». Les boss Difficile/Maître ont un Coup spécial (+2).',
                ],
            },
            {
                h: 'Tournoi de la Vallée, Troc & Forge',
                b: [
                    'Tournoi de la Vallée : 3 matchs éliminatoires par jour sous 5 règles tournantes → +120 jetons, +1 Booster Doré gratuit et +1 Coupe.',
                    'Troc du jour (Classeur) : 3 villageois échangent chaque jour un doublon de même rareté contre une carte manquante ou une édition spéciale.',
                    'Défi du jour : battre 3 adversaires différents = +80 jetons et +1 booster (1re victoire historique = +1 booster ; revanche même jour = 5 jetons).',
                    'Forge : recyclez vos doublons en poussière dorée pour forger vos cartes ou éditions spéciales manquantes.',
                ],
            },
            {
                h: 'Éditions spéciales & 5 Dos de cartes',
                b: [
                    '4 éditions : Inversée (Reverse Holo), Croquis d’Odette (sépia), Full Art (plein cadre, par défaut sur Légendaires/Secrètes) et Or Gravé (24k).',
                    'Zoom 3D : changez librement d’édition débloquée ou forgez-en une nouvelle.',
                    'Dos de cartes : 5 dos exclusifs à débloquer via votre collection et vos coupes de tournoi (onglet Boosters).',
                ],
            },
        ],
        tips: [
            'Tout est conservé lors d’un Prestige (cartes, 3 decks, coupes, dos de cartes, jetons).',
            'Gardez votre Coup de Maître (+3) ou votre Relance de critère pour la Manche Double (×2) !',
        ],
        see: ['book', 'camping', 'family'],
    },
    {
        id: 'labplants',
        cat: 'lab',
        name: 'Le laboratoire de plantes',
        icon: ['ui', 'packet'],
        lvl: 43,
        go: 'machines/lab',
        intro: 'Croiser des plantes pour créer des variétés plus savoureuses ou plus robustes, à garder pour toujours.',
        secs: [
            {
                h: 'Ce qui l’ouvre',
                t: 'La station de recherche (niveau 43) : Agathe et Victor. La serre de pollinisation, puis le laboratoire et le conservatoire des semences, sont des chantiers du village.',
            },
            {
                h: 'Croiser',
                b: [
                    'Choisissez deux plantes ; la pollinisation dure environ 10 minutes, en temps réel.',
                    'Elle donne une portée de jeunes plants (3, 4 avec le laboratoire) : vous en gardez un.',
                    'Chaque gène peut muter (5 %, 9 % avec la ruche de sélection).',
                    'Deux espèces différentes donnent plus souvent des graines stériles.',
                    'La fiche d’une variété ou d’une bête montre sa lignée : sous chaque ancêtre, ses deux meilleurs caractères. Touchez un ancêtre pour voir tous ses caractères, ceux de ses parents, et ce qu’il a gagné sur eux (↑).',
                ],
            },
            {
                h: 'Fixer une variété',
                b: [
                    'Une variété se fixe à partir de la 3e génération, avec le laboratoire (qui analyse aussi les gènes).',
                    'Une variété fixée donne ses graines : une récolte en rend une, une fois sur deux.',
                    'Les gènes comptent : vitesse de pousse, résistance au froid et à la sécheresse, rendement, saveur.',
                    'Une variété savoureuse améliore les plats (argent, or) et la revente.',
                    'Ses récoltes gardent leur rang (argent, or, platine, diamant) : la grange l’affiche sous la variété, et une variété en platine donne des plats, des bières et des vins de cépage encore meilleurs.',
                    'Maturation lente, Calibre et Chance jouent aussi au verger, à l’île, à l’oasis et au Grand Nord.',
                ],
            },
            {
                h: 'Apparences et caractères discrets',
                b: [
                    'Les mutations peuvent donner de nouvelles couleurs (rose, orange vif, argentée, cuivrée, dégradée), de nouveaux motifs (damier, zébrures, mouchetée fine, marbrée) et la taille naine ; le gros fruit n’existe que chez les plantes.',
                    'Une finition rare, une seule par création : givrée, moussue, étincelante, vernie ou fleurie. La saison en favorise une.',
                    'Ces apparences ne changent pas la valeur, mais elles comptent pour la beauté au Comice agricole.',
                    'Sept caractères de plantes (repousse, maturation lente, anti-nuisibles, graine généreuse, calibre, chance, terre d’accueil) et cinq de bêtes (fécondité, santé, curiosité, docilité, sociabilité) valent 0 au départ ; ils n’apparaissent dans la fiche que s’ils sont présents. La tomate et quelques autres repoussent déjà.',
                ],
            },
            {
                h: 'Mes créations et le chef',
                t: 'Mes créations garde chaque variété et permet de racheter graines et petits. Le chef passe des commandes de plusieurs heures qui demandent un trait précis.',
            },
            {
                h: 'Le catalogue de semences',
                t: 'Onglet Catalogue du labo, avec le conservatoire. Inscrivez jusqu’à trois variétés fixées : les voisins commandent leurs graines, une commande toutes les deux heures (trois en attente au plus, même absent). Plus une variété dépasse son espèce (saveurs, pousse, soif, froid, rendement), mieux elle se paie.',
            },
        ],
        see: ['labanimals', 'workshop'],
    },
    {
        id: 'labanimals',
        cat: 'lab',
        name: 'L’étable de sélection',
        icon: ['ui', 'nursery'],
        lvl: 43,
        go: 'machines/lab',
        intro: 'Choisir ses reproducteurs pour des petits aux traits rares, puis les présenter au Comice et les vendre à la foire.',
        secs: [
            {
                h: 'L’étable de sélection',
                b: [
                    'Associez deux parents : la naissance prend environ 15 minutes, en temps réel.',
                    'Les petits héritent de leurs traits : cornes, oreilles, toison, plumage des oiseaux (huppé ou frisé), essaim des abeilles, lait plus riche… et, chez le cheval, la détente et la docilité qui fixent ses plafonds aux écuries.',
                    'Jumeaux dans 15 % des naissances.',
                    'Un enclos d’élevage de base, un de plus avec le laboratoire, un autre avec le conservatoire, un de plus avec le domaine.',
                    'Une race fixée donne des petits dont le prix est plus élevé.',
                ],
            },
            {
                h: 'Le grand hall du Comice (niveau 47)',
                t: 'Le chantier de l’ancien Salon de l’agriculture ouvre le grand hall : le Comice agricole a une catégorie de bêtes de plus, et ses prix sont doublés. Les variétés, elles, ont le concours du potager au labo (un critère tous les deux jours : fruit le plus sucré, légume le plus épicé…).',
            },
        ],
        see: ['labplants', 'animals', 'legend'],
    },
    {
        id: 'camping',
        cat: 'village',
        name: 'Le camping de la vallée',
        icon: ['ui', 'tent'],
        lvl: CAMPING.lvl,
        go: 'village/camping',
        intro: 'Accueillez des campeurs de passage, installez des résidents en cabane et faites grandir la réputation du terrain.',
        secs: [
            {
                h: 'Les campeurs de passage',
                b: [
                    `Dès le niveau ${CAMPING.lvl}, aménagez le camping (3 emplacements au départ, jusqu’à 12). Un campeur arrive toutes les 3 à 6 heures pour un séjour de 10 à 30 heures.`,
                    'Chaque campeur achète 2 ou 3 lots de produits au double de leur valeur. Tout vendu : il repart ravi et laisse un pourboire ; un lot entamé suffit pour qu’il reparte content.',
                    'Les habitués reviennent avec un pourboire plus gros, les campeurs remarquables demandent au moins la qualité argent et paient 1,5 fois plus, et la soirée du jour bonifie une famille de produits de 30 %.',
                ],
            },
            {
                h: 'Les résidents en cabane',
                b: [
                    'Un campeur ravi peut demander à s’installer dans une cabane (jusqu’à 12 résidents). Il apparaît aussi dans Village › Villageois (filtre « Résidents ») avec sa fiche Amitié, Cadeau, Goûts et Histoire.',
                    'Il passe une commande permanente payée 1,6 fois sa valeur, accepte un cadeau toutes les 6 heures et aide le camping grâce à son métier (panier quotidien ou bonus proportionnel à ses cœurs).',
                ],
            },
            {
                h: 'Aménagements, réputation et fête de la vallée',
                b: [
                    'Cinq améliorations (point d’eau, sanitaires, salle commune, terrain de jeux et épicerie dont la caisse se remplit même hors ligne) renforcent le terrain.',
                    'La réputation du camping (de Nouveau à Légendaire) augmente les pourboires et les visites de campeurs remarquables. Quand le camping, les résidents et la Maison atteignent les cinq buts de la grande tente, dressez la table de la fête de la vallée.',
                ],
            },
        ],
        tips: ['Servez en priorité les campeurs remarquables et les habitués : leurs pourboires et la réputation grimpent vite.'],
        see: ['maison', 'village', 'legend'],
    },
    {
        id: 'maison',
        cat: 'craft',
        name: 'La Maison, votre marque',
        icon: ['ui', 'maison'],
        lvl: CAMPING.lvl,
        go: 'machines/maison',
        intro: 'Fondez votre propre marque, composez des paquets de trois produits dans de belles boîtes et vendez-les à des clients exigeants.',
        secs: [
            {
                h: 'Composer un paquet',
                b: [
                    'Une fois le camping bâti, fondez la Maison : choisissez son nom, son emblème et ses couleurs (Atelier › Maison).',
                    'Composez un paquet avec trois produits de la ferme (tous genres sauf matériaux bruts) et une boîte (carton gratuit, ou cagette, panier, filet, caisse, tonnelet, malle, cloche, écrin fabriqués à l’emballerie dès le niveau 68).',
                    'La qualité du paquet est celle de son produit le moins élevé. Trois genres différents, une belle boîte et la réputation de la Maison augmentent sa valeur. Chaque composition s’enregistre comme recette pour la refaire en un geste.',
                ],
            },
            {
                h: 'Vendre, livrer et offrir',
                b: [
                    'Vendez depuis l’étagère aux clients de la Maison (voisins, campeurs, souk, château, vitrine du village), ou livrez les trois commandes dédiées qui paient 2,2 fois la valeur et rapportent beaucoup de réputation.',
                    'Vous pouvez aussi offrir un paquet en cadeau du jour à un villageois, ou charger les wagons et soutes de paquets du train et de l’avion-cargo.',
                    'Plus votre réputation grandit, plus l’atelier va vite (de 15 à 5 minutes) et plus vous pouvez lancer de paquets à la suite (jusqu’à 6).',
                ],
            },
        ],
        tips: ['Mélangez trois genres différents dans une boîte adaptée pour cumuler les bonus de valeur et de réputation.'],
        see: ['camping', 'workshop', 'legend'],
    },
    {
        id: 'legend',
        cat: 'end',
        name: 'Grands défis et Ferme légendaire',
        icon: ['ui', 'trophy'],
        lvl: 56,
        go: 'sheet:progress',
        intro: `À partir du niveau 56 et au niveau ${MAX_LEVEL} : grands défis, Coupe de la vallée, Ferme légendaire et prestige.`,
        facts: [
            { icon: ['ui', 'trophy'], v: '24 défis', l: '2 sem. · Bronze à Diamant' },
            { icon: ['ui', 'cupGold'], v: 'Coupe', l: '6 rangs · 110 pts max' },
            { icon: ['ui', 'meuhStatue'], v: '10 exploits', l: 'Ferme légendaire' },
            { icon: ['ui', 'star'], v: 'Prestige', l: 'Rubans permanents' },
        ],
        secs: [
            {
                h: 'Les grands défis & Coupe de la vallée',
                b: [
                    'Grands défis (Village › Commandes) : 2 semaines, 4 étapes (Bronze 2, Argent 3, Or 4, Platine si tout en or+, Diamant en moins de 7 jours).',
                    'Coupe de la vallée (Menu › La Coupe) : 6 rangs de « Ferme du canton » (0 pt) à « Ferme du monde » (110 pts), avec bonus permanents à chaque rang.',
                    'Points : Bronze 1, Argent 2, Or 4, Platine 7, Diamant 10 (×2 pour les défis du thème de saison) + 6 grands travaux de mécénat (6 à 16 pts).',
                    'Défis éclair : 1 étape rapide de 3 jours entre deux grands défis. Tout est conservé après un Prestige.',
                ],
            },
            {
                h: 'Camping, La Maison & Fête de la vallée',
                b: [
                    'Camping (niv. 66) : jusqu’à 12 emplacements et 12 résidents en cabane avec leurs métiers et paniers quotidiens (voir page dédiée « Le camping »).',
                    'La Maison (Atelier › Maison) : créez votre marque et vos coffrets de 3 produits vendus aux clients, train, cargo et villageois (voir « La Maison »).',
                    'Fête de la vallée : une fois 5 grands objectifs atteints au camping, dressez la grande table pour célébrer le bilan complet de votre ferme.',
                ],
            },
            {
                h: 'Renommée & Ferme légendaire',
                b: [
                    `Renommée (niv. ${MAX_LEVEL}) : 1 étoile tous les 250 000 XP (pièces + matériaux) et 1 ruban toutes les 5 étoiles.`,
                    `Ferme légendaire : 10 exploits (niv. ${MAX_LEVEL}, chapitres, maison max, ligue diamant, Ferme nationale, 75 % Livre, 20 villageois 5 cœurs, cave légendaire, haras Élite, 25 maîtrises or) → Vache d’or + 20 rubans.`,
                ],
            },
            {
                h: 'Vendre la ferme (Prestige)',
                b: [
                    'Conservé pour toujours : rubans, succès, amitiés, chien, décorations, village rénové, grange, livre, maîtrise, cave, famille, génétique et collection MeuhCG.',
                    'Rubans : chacun donne +5 % aux ventes et +3 % de vitesse de façon permanente (+3 rubans bonus avec un défi de prestige).',
                    'Thème de ferme : choisissez une spécialité (+15 % cultures, +20 % bêtes, +30 % arbres ou filet de mer doublé).',
                ],
            },
        ],
        see: ['skills', 'domaine', 'book', 'camping', 'maison'],
        tips: ['Le prestige est totalement facultatif : vous pouvez rester sur votre ferme et viser la Ferme légendaire.'],
    },
    {
        id: 'memo',
        cat: 'memo',
        name: 'Aide-mémoire',
        icon: ['ui', 'clock'],
        lvl: 1,
        go: 'village/orders',
        intro: 'Toutes les durées en temps réel et les raccourcis utiles en un clin d’œil.',
        facts: [
            { icon: ['ui', 'truckIcon'], v: '1 h / 1 h', l: 'Train' },
            { icon: ['ui', 'balloon'], v: '1 h / 2 h', l: 'Montgolfière' },
            { icon: ['ui', 'plane'], v: '24 h / 48 h', l: 'Avion-cargo' },
            { icon: ['ui', 'clock'], v: 'Toutes 2 h', l: 'Ouvriers & nasses' },
        ],
        secs: [
            {
                h: 'Visiteurs et livraisons (temps réel)',
                tiles: [
                    { icon: ['ui', 'truckIcon'], title: 'Train', val: '1 h ici · 1 h absent', sub: 'Livraisons régulières' },
                    { icon: ['ui', 'balloon'], title: 'Montgolfière', val: '1 h ici · 2 h absente', sub: 'Colis variés' },
                    { icon: ['ui', 'coin'], title: 'Marchand', val: '2 h ici · 4 h absent', sub: 'Objets rares' },
                    { icon: ['ui', 'plane'], title: 'Avion-cargo', val: '24 h ici · ttes 48 h', sub: 'Gros chargements' },
                    { icon: ['ui', 'star'], title: 'Armand', val: '3 j ici · ttes 7 j', sub: 'Produits de choix' },
                    { icon: ['ui', 'village'], title: 'Fermes voisines', val: '2 h sur place', sub: 'Échanges & bêtes' },
                ],
                b: [
                    'Visiteurs express : Acheteur pressé (10 min), Critique gastronomique (20 min), Foire aux bestiaux (30 min).',
                ],
            },
            {
                h: 'Ce qui tourne jeu fermé',
                b: [
                    'Ferme & ateliers : cultures arrosées, serre, bêtes nourries, machines, cave, parfumerie, brasserie, élevage et pollinisation.',
                    'Ouvriers (1 charge / 2 h) : nasses, bûcheron, mineur, cueilleur, filet de mer et Théo.',
                    'Plan de production : ramasse les étapes prêtes et lance le plat final automatiquement.',
                ],
            },
            {
                h: 'Rythme hebdomadaire & quotidien',
                b: [
                    'Enchères : petite toutes les 4 h, grande chaque soir à 19 h.',
                    'Concours & Haras : 1 semaine, résultats chaque lundi.',
                    'Quotidien : défi de Marcel et de Gaspard, booster gratuit, troc et Tournoi MeuhCG.',
                ],
            },
            {
                h: 'Où trouver quoi',
                b: [
                    'Produit manquant : touchez-le dans une commande ou cherchez-le dans ce guide.',
                    'Fiche produit : appui long sur un produit, ou bouton « Fiche » dans la grange.',
                    'Déblocages & bonus : Menu › Les niveaux, Progrès, Livre de la ferme et Mes bonus.',
                ],
            },
        ],
        see: ['time', 'agenda'],
    },
];
