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
export const HONEY_RULE = {
    share: 0.5, // la fleur fait au moins la moitié de ce qui fleurit
    min: 4, // et au moins 4 parcelles (ou arbres)
};
// la fleur d'une plante → son miel
export const HONEY_OF = Object.fromEntries(Object.entries(HONEYS).map(([k, h]) => [h.flower, k]));
