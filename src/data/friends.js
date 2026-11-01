// 1.70 : mieux connaître les villageois (fiche, goûts, anniversaires) et aller plus loin que 5 cœurs
// (talent de l'ami, duos, treize histoires de plus et quatre histoires à deux).

// ---------------- les goûts ----------------
// le produit qu'un villageois adore (un seul, à découvrir) ; « aime » reste la liste de VILLAGERS
export const LOVES = {
    odette: 'spongeCake',
    gaston: 'ratatouille',
    lucie: 'strawberryIce',
    paul: 'croissant',
    rose: 'lavenderSoap',
    marcel: 'fishSoup',
    gaspard: 'forgeLantern',
    odile: 'cider',
    jules: 'horseshoe',
    ines: 'honeyPot',
    morgane: 'lobsterDish',
    yann: 'bouillabaisse',
    bruno: 'tomme',
    lea: 'woolHat',
    margaux: 'roseWine',
    anselme: 'goatCheese',
    maeva: 'monoi',
    tiago: 'arrangedRum',
    agathe: 'quillPen',
    victor: 'carrotJuice',
    hugues: 'mead',
    agnes: 'maltAmber',
    octave: 'champagne',
    idris: 'dateTajine',
    yasmine: 'honeyJujubes',
    tuomas: 'kalakukko',
    ingrid: 'cloudberryTart',
    duval: 'goldLocket',
};
export const GIFT_PTS = { love: 5, likeRaw: 1, likeCraft: 3, meh: 0, birthday: 3, loveHint: 2 };
// les répliques d'un cadeau qui ne plaît pas (« bof »), et quand on approche du produit adoré
export const MEH_LINES = [
    'Oh… merci quand même.',
    'C’est gentil, mais ce n’est pas trop mon truc.',
    'Je vais le donner à ma voisine.',
    'Hum. Je le garde pour plus tard.',
];
export const WARM_LINE = 'Presque ! J’adore quelque chose qui sort de là.';

// ---------------- les anniversaires ----------------
// l'année du jeu : 4 saisons de 12 jours ; chaque villageois a son jour (tous différents)
export const YEAR_DAYS = 48;

// ---------------- le talent de l'ami (à 5 cœurs, doublé quand son histoire est finie) ----------------
// m : machines de son métier (plus rapides, produits mieux vendus) ; fx : un effet à part
export const TALENT = { speed: 0.1, price: 0.05, fx: 0.1 };
export const TALENTS = {
    odette: { m: ['pastry', 'confectionery'] },
    gaston: { m: ['kitchen', 'stove'] },
    lucie: { m: ['icecream', 'chocolatier'] },
    paul: { m: ['bakery', 'mill'] },
    rose: { m: ['perfumery', 'soapworks'] },
    marcel: { m: ['smokehouse', 'saloir'] },
    gaspard: { m: ['sawmill', 'forge'] },
    odile: { m: ['press', 'dryer'] },
    jules: { m: ['saddlery'] },
    ines: { m: ['pottery'] },
    morgane: { fx: 'boat', text: 'les bateaux du port paient plus' },
    yann: { m: ['fishmonger', 'cannery'] },
    bruno: { m: ['alpineDairy', 'loom'] },
    lea: { m: ['tailor', 'marmite'] },
    margaux: { m: ['winery'] },
    anselme: { m: ['dairy', 'deli'] },
    maeva: { m: ['islandBakery', 'juiceBar'] },
    tiago: { m: ['rumDistillery', 'sugarmill'] },
    agathe: { m: ['still', 'dyeworks'] },
    victor: { fx: 'cure', text: 'soigner une bête coûte moins cher' },
    hugues: { fx: 'brew', text: 'les cuves de l’abbaye brassent plus vite' },
    agnes: { m: ['malthouse', 'brewery'] },
    octave: { fx: 'cave', text: 'tout vieillit plus vite à la cave' },
    idris: { m: ['tajine', 'earthOven'] },
    yasmine: { m: ['orientalSweets'] },
    tuomas: { m: ['taigaPot'] },
    ingrid: { m: ['tiledStove', 'berryKettle'] },
    duval: { m: ['jewelry'] },
};

// ---------------- les duos ----------------
// un cadeau à l'un fait plaisir à l'autre (+1) ; les deux à 5 cœurs : une histoire à deux
export const DUOS = [
    ['hugues', 'agnes'],
    ['idris', 'yasmine'],
    ['tuomas', 'ingrid'],
    ['morgane', 'yann'],
];

// ---------------- treize histoires de plus (même forme que STORIES : 3 étapes) ----------------
export const STORIES_170 = {
    gaspard: {
        title: 'La cabane du bûcheron',
        end: 'Ma cabane est plus belle qu’avant. Passe quand tu veux : il y aura toujours du feu et une chaise pour toi.',
        steps: [
            ['L’orage a couché ma vieille cabane. Il me faut des planches et des poutres pour la relever.', { plank: 20, beam: 10 }],
            ['Le toit tient ! Maintenant des clous et des outils, je n’ai plus rien de propre.', { nail: 20, tools: 4 }],
            ['Pour la crémaillère : des torches pour la veillée et du chêne massif pour la table.', { pineTorch: 6, solidOak: 4 }],
        ],
    },
    odile: {
        title: 'Le verger de mon grand-père',
        end: 'Mon grand-père serait fier. Tiens, garde une greffe de chaque arbre : ils sont aussi un peu à toi maintenant.',
        steps: [
            ['J’ai retrouvé le carnet de greffes de mon grand-père. Il faut d’abord goûter ses variétés.', { apple: 20, pear: 20 }],
            ['Il faisait son cidre et ses poires séchées pour l’hiver. On essaie ?', { cider: 6, driedPear: 6 }],
            ['Et pour finir, sa fierté : le calvados et la pâte de coing des grandes occasions.', { calvados: 3, quincePaste: 4 }],
        ],
    },
    maeva: {
        title: 'La fête des fleurs',
        end: 'Toute l’île a dansé jusqu’au matin ! Mets ce collier de tiaré : tu es des nôtres maintenant.',
        steps: [
            ['Sur l’île, on fête les fleurs une fois par an. Il me faut des tiarés et des hibiscus pour les colliers.', { tiare: 15, hibiscus: 10 }],
            ['Les danseurs ont soif : du lait de coco et du jus d’ananas, s’il te plaît !', { coconutMilk: 6, pineappleJuice: 6 }],
            ['Le soir, tout le monde se retrouve à la plage. Des flans et des cocktails pour tous !', { coconutFlan: 4, islandCocktail: 4 }],
        ],
    },
    tiago: {
        title: 'Le bac repeint',
        end: 'Le plus beau bac de la côte ! Pour toi, la traversée sera toujours gratuite. Enfin… presque.',
        steps: [
            ['Mon bac prend l’eau de partout. Des planches et des cordes de coco, et il repart !', { plank: 20, coconutRope: 6 }],
            ['Je veux le repeindre en bleu, comme celui de mon père. Et du jaune pour le nom.', { blueDye: 4, yellowDye: 4 }],
            ['Pour le baptême, on casse une bouteille sur la coque. Mais on en boit d’abord !', { rum: 4, coconutPunch: 2 }],
        ],
    },
    agathe: {
        title: 'Le grand inventaire',
        end: 'Mon rapport est parti à la capitale. J’ai écrit ton nom en premier, à la ligne « merci ».',
        steps: [
            ['Je fais l’inventaire des cultures de la région. Il me faut des échantillons de base.', { wheat: 30, potato: 30 }],
            ['Ensuite les abeilles : du miel et de la cire, pour mesurer ce qu’elles butinent.', { honey: 10, wax: 10 }],
            ['Dernière expérience : les teintures végétales. Mes collègues n’y croient pas !', { redDye: 4, blueDye: 4 }],
        ],
    },
    victor: {
        title: 'La pharmacie des bêtes',
        end: 'Ma pharmacie n’a jamais été aussi pleine. Tes bêtes seront toujours soignées les premières.',
        steps: [
            ['Ma réserve est vide. De la nourriture et des carottes pour les bêtes en convalescence.', { feed: 30, carrot: 30 }],
            ['Du lait et des œufs pour les petits qui ne mangent pas encore seuls.', { milk: 10, egg: 20 }],
            ['Et pour la toilette : du savon à la lavande et des brosses en crin.', { lavenderSoap: 4, horsehairBrush: 2 }],
        ],
    },
    hugues: {
        title: 'L’hydromel des premiers moines',
        end: 'Huit siècles plus tard, l’hydromel des moines coule de nouveau. Le père abbé en a pleuré. Ou c’était l’hydromel.',
        steps: [
            ['Dans la bibliothèque, j’ai trouvé la recette des premiers moines : avant la bière, ils faisaient de l’hydromel !', { honey: 20, wax: 10 }],
            ['Il leur fallait de l’orge pour le pain des frères, et un premier hydromel pour goûter.', { barley: 30, mead: 6 }],
            ['Pour la fête de l’abbaye : de l’hydromel et de la bière blonde pour tout le village.', { mead: 10, blondBeer: 6 }],
        ],
    },
    octave: {
        title: 'La grande dégustation',
        end: 'Une soirée parfaite. Les invités parlent déjà de l’an prochain… et de ton raisin.',
        steps: [
            ['J’organise une grande dégustation au château. D’abord, des raisins pour les comparer.', { grape: 40 }],
            ['Ensuite les vins : un rouge et un blanc, ils doivent se répondre.', { redWine: 4, whiteWine: 4 }],
            ['Et pour clore la soirée : le champagne et le vin de paille.', { champagne: 2, strawWine: 2 }],
        ],
    },
    idris: {
        title: 'La caravane légendaire',
        end: 'Nous avons refait la route de mon grand-père, d’un bout à l’autre. Ce soir, sous les étoiles, je lui ai parlé de toi.',
        steps: [
            ['Mon grand-père menait la plus longue caravane du désert. Je veux refaire son voyage ! D’abord, des provisions.', { date: 20, jujube: 15 }],
            ['La route est longue : de la pâte de dattes et du pain de dattes, ça se garde.', { datePaste: 6, dateBread: 6 }],
            ['À l’arrivée, on festoie avec les marchands : du couscous et des dattes fourrées.', { couscous: 4, stuffedDates: 6 }],
        ],
    },
    yasmine: {
        title: 'Les remèdes du souk',
        end: 'Ma boutique est ouverte, et les remèdes de ma grand-mère avec. Tu seras toujours servie la première.',
        steps: [
            ['Ma grand-mère soignait tout le souk avec ses épices. Je veux refaire ses remèdes.', { coriander: 20, cumin: 20 }],
            ['Les douceurs aussi soignent, disait-elle : les jujubes au miel et les loukoums.', { honeyJujubes: 6, loukoum: 6 }],
            ['Pour l’ouverture de ma boutique : des baklavas et une harira pour tous.', { baklava: 4, harira: 4 }],
        ],
    },
    tuomas: {
        title: 'La transhumance des rennes',
        end: 'Les rennes sont au pâturage, gras comme des ours. Les enfants jouent avec leurs bois. Merci, ami.',
        steps: [
            ['Au printemps, les rennes montent vers les pâturages. Il faut des provisions pour la route.', { reindeerMilk: 10, rye: 30 }],
            ['Le pain de seigle et la gelée d’airelles tiennent au corps, dans la toundra.', { ryeBread: 6, lingonJelly: 4 }],
            ['Le soir, autour du feu : la soupe de saumon. Et des bois de renne pour les enfants du village.', { salmonSoup: 4, antler: 3 }],
        ],
    },
    ingrid: {
        title: 'Le pain de la Sainte-Lucie',
        end: 'Toutes les maisons du village sentaient le safran. Pour la première fois depuis longtemps, la nuit a semblé moins longue.',
        steps: [
            ['Pour la Sainte-Lucie, on fait un pain au safran. Il me faut du seigle et du safran.', { rye: 30, saffron: 10 }],
            ['Les enfants passent dans les maisons : des brioches et des biscuits de seigle pour eux.', { pulla: 6, ryeCookies: 6 }],
            ['Et pour la grande table : les tartes à la chicoutai et les tourtes de Carélie.', { cloudberryTart: 4, karelianPie: 4 }],
        ],
    },
    agnes: {
        title: 'La malterie d’autrefois',
        end: 'Le vieux four à malt fume de nouveau ! Frère Hugues dit que c’est un miracle. Moi je dis que c’est toi.',
        steps: [
            ['Je veux rallumer le vieux four à malt de l’abbaye. Il me faut de l’orge et du bois.', { barley: 40, wood: 20 }],
            ['On recommence par les malts clairs, comme autrefois.', { maltBlond: 15, maltAmber: 10 }],
            ['Et les malts noirs, les plus difficiles : ceux de la bière de Noël.', { maltBrown: 10, maltBlack: 6 }],
        ],
    },
};

// ---------------- les histoires à deux ----------------
export const DUO_STORIES = {
    'hugues-agnes': {
        title: 'La bière du jubilé',
        end: 'Huit cents ans et pas une ride ! L’abbaye n’avait jamais vu une fête pareille. Votre nom est gravé sur le tonneau du jubilé.',
        steps: [
            ['L’abbaye fête ses huit cents ans ! Nous voulons une bière ambrée digne de l’occasion.', { maltAmber: 10, hop: 20 }],
            ['On goûte nos essais : une ambrée et une bière aux cerises.', { amberBeer: 6, cherryBeer: 4 }],
            ['Le jour du jubilé, tout le village est invité : de l’hydromel et de l’ambrée pour tous !', { mead: 6, amberBeer: 6 }],
        ],
    },
    'idris-yasmine': {
        title: 'La fête au souk',
        end: 'Les caravaniers chantaient encore à l’aube. Le souk n’oubliera pas cette nuit… ni toi.',
        steps: [
            ['Le souk fête la fin des caravanes. Nous préparons les douceurs : cornes de gazelle et makrouts.', { gazelleHorns: 6, makrout: 6 }],
            ['Pour le repas des marchands : un couscous au chameau et un tajine au citron.', { camelCouscous: 4, lemonTajine: 4 }],
            ['Et pour la nuit sous les étoiles : des baklavas et du nougat.', { baklava: 6, nougat: 6 }],
        ],
    },
    'tuomas-ingrid': {
        title: 'La nuit polaire',
        end: 'Le soleil est revenu, et nous avons tenu tous ensemble. Dans le Nord, c’est ce qui compte le plus.',
        steps: [
            ['La nuit polaire arrive : deux mois sans soleil. Il faut du bois et du seigle pour tenir.', { wood: 50, rye: 30 }],
            ['On prépare les plats qui tiennent chaud : le kalakukko et les chaussons aux airelles.', { kalakukko: 4, lingonPastry: 6 }],
            ['Quand le soleil revient, on fait la fête : confiture de chicoutai et soupe aux champignons.', { cloudberryJam: 4, mushroomSoup: 4 }],
        ],
    },
    'morgane-yann': {
        title: 'La grande marée',
        end: 'La plus belle pêche de toute ma vie ! Ce soir, le port entier mange grâce à toi.',
        steps: [
            ['La grande marée découvre des rochers qu’on ne voit qu’une fois par an. On pêche à pied !', { sardine: 20, shrimp: 15 }],
            ['Ce qu’on ne mange pas tout de suite, on le met en boîte pour l’hiver.', { cannedSardines: 4, mackerelRillettes: 4 }],
            ['Et le soir, sur le port : une bouillabaisse et un homard pour fêter ça.', { bouillabaisse: 4, lobsterDish: 2 }],
        ],
    },
};
export const DUO_REWARD = { rubans: 2 };
