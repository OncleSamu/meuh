// 1.67 : les miels de fleurs. Une sorte de miel : elle fait partie du stock de miel (toutes les recettes au miel
// continuent de marcher) et garde son nom, sa valeur et son rang, comme une variété ou le lait d'une race.
// flower : la plante qui le donne (une culture du champ ou de la serre, ou un arbre du verger au printemps)
export const HONEYS = {
    lavender: {
        flower: 'lavender',
        name: 'Miel de lavande',
        mult: 1.6,
        mamie: 'Le miel de lavande est clair et parfumé, presque comme un savon qu’on mangerait. Je le gardais pour les tisanes du soir.',
    },
    sunflower: {
        flower: 'sunflower',
        name: 'Miel de tournesol',
        mult: 1.2,
        mamie: 'Le miel de tournesol cristallise vite et devient tout crémeux. Les enfants le préfèrent : il tient sur la tartine sans couler.',
    },
    buckwheat: {
        flower: 'buckwheat',
        name: 'Miel de sarrasin',
        mult: 1.4,
        mamie: 'Le miel de sarrasin est noir et fort, il sent le malt et la terre. On l’aime ou on le déteste ; ton grand-père l’adorait dans son pain d’épices.',
    },
    mint: {
        flower: 'mint',
        name: 'Miel de menthe',
        mult: 1.4,
        mamie: 'Le miel de menthe est rare : il faut un vrai champ de menthe en fleur. Il rafraîchit la bouche, c’est très curieux.',
    },
    apple: {
        flower: 'apple',
        name: 'Miel de pommier',
        mult: 1.3,
        mamie: 'Le miel de pommier se fait au tout début du printemps, quand le verger est blanc. Il est doux et un peu fruité, comme la saison.',
    },
    cherry: {
        flower: 'cherry',
        name: 'Miel de cerisier',
        mult: 1.3,
        mamie: 'Le miel de cerisier a un goût d’amande. Les abeilles se précipitent sur les cerisiers en fleur avant tout le monde.',
    },
    lemon: {
        flower: 'lemon',
        name: 'Miel de citronnier',
        mult: 1.5,
        mamie: 'Le miel de citronnier est pâle et parfumé. On le met dans le thé quand on a mal à la gorge, avec une rondelle du même arbre.',
    },
    orange: {
        flower: 'orange',
        name: 'Miel d’oranger',
        mult: 1.5,
        mamie: 'Le miel d’oranger sent la fleur d’oranger, bien sûr. On en mettait dans les crêpes de la Chandeleur, une cuillère pour la pâte, une pour le cuisinier.',
    },
    chestnut: {
        flower: 'chestnut',
        name: 'Miel de châtaignier',
        mult: 1.8,
        mamie: 'Le miel de châtaignier est presque brun, amer au bout de la langue. Les connaisseurs le paient très cher. Moi, je le mélangeais au fromage blanc.',
    },
    almond: {
        flower: 'almond',
        name: 'Miel d’amandier',
        mult: 1.6,
        mamie: 'Le miel d’amandier vient des fleurs les plus précoces de l’année, en plein hiver encore. Il est léger, et il sent le gâteau.',
    },
    // la suite : six miels de plus à la ferme
    raspberry: {
        flower: 'raspberry',
        name: 'Miel de framboisier',
        mult: 1.5,
        mamie: 'Le miel de framboisier est fruité, très doux. Les abeilles adorent les framboisiers : elles y passent leurs journées, et nous, nos après-midi à cueillir.',
    },
    blueberry: {
        flower: 'blueberry',
        name: 'Miel de myrtille',
        mult: 1.5,
        mamie: 'Le miel de myrtille est sombre, presque confit. On le trouve dans les montagnes, là où les myrtilles couvrent tout. Il tache un peu les doigts, comme les myrtilles.',
    },
    cotton: {
        flower: 'cotton',
        name: 'Miel de coton',
        mult: 1.3,
        mamie: 'Le miel de coton est tout blanc et cristallise en quelques jours. Il devient crémeux comme du beurre : on l’étale à la cuillère.',
    },
    basil: {
        flower: 'basil',
        name: 'Miel de basilic',
        mult: 1.4,
        mamie: 'Le miel de basilic est rare : il faut laisser le basilic fleurir, et personne n’y pense. Il a un goût d’été et de tomates mûres.',
    },
    pear: {
        flower: 'pear',
        name: 'Miel de poirier',
        mult: 1.3,
        mamie: 'Le miel de poirier est léger et un peu acidulé. Les poiriers fleurissent tôt, avant les feuilles : un nuage blanc au bout du verger.',
    },
    plum: {
        flower: 'plum',
        name: 'Miel de prunier',
        mult: 1.3,
        mamie: 'Le miel de prunier sent l’amande et le printemps. Les fleurs de prunier sont si petites qu’on se demande comment les abeilles s’y retrouvent.',
    },
};
// 1.69 : les miels des contrées : ils ne viennent que du rucher de leur contrée (land)
export const LAND_HONEYS = {
    lychee: {
        flower: 'lychee',
        land: 'island',
        name: 'Miel de litchi',
        mult: 1.9,
        mamie: 'Le miel de litchi sent la rose et le fruit, comme un bonbon qu’on aurait cueilli. Ton oncle en rapportait de La Réunion, emballé dans trois pulls pour qu’il ne casse pas.',
    },
    avocado: {
        flower: 'avocado',
        land: 'island',
        name: 'Miel d’avocatier',
        mult: 1.8,
        mamie: 'Le miel d’avocatier est presque noir, et il a un goût de mélasse. Rien à voir avec l’avocat ! Les gens ne me croyaient pas, alors je leur faisais goûter.',
    },
    tiare: {
        flower: 'tiare',
        land: 'island',
        name: 'Miel de tiaré',
        mult: 2,
        mamie: 'La fleur de tiaré se met derrière l’oreille, à Tahiti : à droite si on est libre, à gauche si on est pris. Son miel sent la même chose que la fleur. Moi je la mettais des deux côtés, pour ne pas choisir.',
    },
    argan: {
        flower: 'argan',
        land: 'oasis',
        name: 'Miel d’arganier',
        mult: 2.2,
        mamie: 'L’arganier fleurit quand il veut, au bord du désert, et ses abeilles font peu de miel. C’est le plus rare de tous. On en met une cuillère dans le thé, pas deux.',
    },
    coriander: {
        flower: 'coriander',
        land: 'oasis',
        name: 'Miel de coriandre',
        mult: 1.8,
        mamie: 'Le miel de coriandre est ambré, un peu épicé, un peu citronné. Avec du pain chaud et un peu de beurre, c’est le goûter des caravaniers.',
    },
    fir: {
        flower: 'spruce',
        land: 'nord',
        name: 'Miel de sapin',
        mult: 2.1,
        mamie: 'Le miel de sapin n’est pas un miel de fleur : les abeilles récoltent la sève sucrée que les pucerons laissent sur les aiguilles. Il est sombre, il sent la forêt, et il ne cristallise jamais. Ton grand-père disait que c’était le miel des bûcherons.',
    },
    lingonberry: {
        flower: 'lingonberry',
        land: 'nord',
        name: 'Miel d’airelle',
        mult: 1.9,
        mamie: 'Les airelles fleurissent en clochettes roses sous la neige qui fond. Le miel est rouge comme les baies. Là-haut, on le mange avec les galettes de seigle.',
    },
};
Object.assign(HONEYS, LAND_HONEYS);
export const HONEY_RULE = {
    share: 0.5, // la fleur fait au moins la moitié de ce qui fleurit
    min: 4, // et au moins 4 parcelles (ou arbres)
};
// la fleur d'une plante → son miel
export const HONEY_OF = Object.fromEntries(Object.entries(HONEYS).map(([k, h]) => [h.flower, k]));

// 1.68 : la couleur de chaque miel (le cruchon d'hydromel en prend la teinte) ; 'all' : toutes fleurs
export const HONEY_COL = {
    all: '#f2a516',
    lavender: '#f2c94e',
    sunflower: '#f7b80f',
    buckwheat: '#6b3a1a',
    mint: '#c9a43a',
    raspberry: '#e39a4a',
    blueberry: '#9a5a2a',
    cotton: '#f2e2b8',
    basil: '#e2b048',
    apple: '#f0b44a',
    pear: '#f0cc78',
    plum: '#d48a36',
    cherry: '#e39a2e',
    lemon: '#f3d878',
    orange: '#f2a020',
    chestnut: '#8a4416',
    almond: '#f1d394',
    lychee: '#f0c8a0',
    avocado: '#4a2a14',
    tiare: '#f6d878',
    argan: '#c8702a',
    coriander: '#d08a2a',
    fir: '#5a2e14',
    lingonberry: '#b8582a',
};
