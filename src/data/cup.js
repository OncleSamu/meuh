// La Coupe de la vallée (1.40) : la vraie ligne d'arrivée de Meuh.
// Les médailles des grands défis et le mécénat rapportent des points ; les points font monter la ferme de six rangs,
// du canton au monde. Chaque rang donne un titre et un bonus permanent, gardés d'une ferme à l'autre.

// points par médaille : aucune, bronze, argent, or, platine, diamant
export const CUP_POINTS = [0, 1, 2, 4, 7, 10];
// la grande statue dorée : les 17 grands défis gagnés en or au moins une fois
export const STATUE_POINTS = 10;

export const CUP_RANKS = [
    { id: 'canton', name: 'Ferme du canton', pts: 0, bonus: '' },
    { id: 'departement', name: 'Ferme du département', pts: 8, bonus: 'L’étal prend 2 exemplaires de plus par place' },
    { id: 'region', name: 'Ferme de la région', pts: 20, bonus: 'La cave vieillit 10 % plus vite' },
    { id: 'nation', name: 'Ferme nationale', pts: 40, bonus: 'Une commande de plus au tableau des villageois' },
    { id: 'europe', name: 'Ferme d’Europe', pts: 70, bonus: 'Le deuxième poste des machines coûte moitié moins' },
    { id: 'monde', name: 'Ferme du monde', pts: 110, bonus: 'L’étal et les commandes paient 5 % de plus' },
];

// le mécénat : de grands travaux pour la vallée, payés en pièces et en matériaux, une fois chacun
export const CUP_WORKS = [
    {
        id: 'bigBridge',
        name: 'Le grand pont de pierre',
        pts: 6,
        cost: { coins: 50e6, cutStone: 400, ironIngot: 150, beam: 200 },
        mamie: 'Avant, on passait la rivière à gué, les sabots dans la main. Ton grand-père y a perdu une botte et toute sa dignité.',
    },
    {
        id: 'baths',
        name: 'Les thermes',
        pts: 8,
        cost: { coins: 100e6, cutStone: 500, copperIngot: 200, quartz: 60 },
        mamie: 'Une source chaude coulait déjà là du temps des Romains. Les vaches venaient y boire l’hiver, et elles n’étaient pas bêtes.',
    },
    {
        id: 'cathedral',
        name: 'La cathédrale',
        pts: 10,
        cost: { coins: 250e6, cutStone: 900, silverIngot: 150, sapphire: 40 },
        mamie: 'On sonnera les cloches pour les mariages, les baptêmes… et pour la fin des moissons, c’est encore la plus belle fête.',
    },
    {
        id: 'observatory',
        name: 'L’observatoire',
        pts: 12,
        cost: { coins: 400e6, copperIngot: 400, goldIngot: 80, quartz: 120 },
        mamie: 'Les anciens semaient avec la lune. Avec une lunette pareille, on saura enfin s’ils avaient raison.',
    },
    {
        id: 'museum',
        name: 'Le musée de la vallée',
        pts: 14,
        cost: { coins: 700e6, cutStone: 1200, goldIngot: 150, emerald: 50 },
        mamie: 'Mets-y la vieille charrue de la grange. Elle a plus d’histoires à raconter que bien des tableaux.',
    },
    {
        id: 'opera',
        name: 'L’opéra',
        pts: 16,
        cost: { coins: 1.2e9, goldIngot: 300, silverIngot: 300, ruby: 80 },
        mamie: 'J’ai chanté une fois sur une scène, à la fête du village. Le coq a chanté plus juste, mais on m’a applaudie quand même.',
    },
];

// les fermes rivales de la Coupe (même ordre que RIVALS) : leurs médailles suivent votre rythme moyen
export const CUP_RIVALS = { hist: 3, firstPts: 2, form: 0.25 };
