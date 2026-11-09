// 1.104 : l'emballerie. Les boîtes de la Maison se fabriquent dans une machine, par trois, comme n'importe quelle recette :
// ce sont de vrais produits (les villageois, les transports peuvent en demander). La boîte de carton reste gratuite.
// pack (modèle de data/paquets.js), id du produit, nom, ingrédients, durée (s), niveau (les niveaux 58 à 62 ont encore de la place)
export const BOXES = [
    ['cagette', 'boxCagette', 'Cagettes de bois', { hardwood: 3 }, 240, 58],
    ['panier', 'boxPanier', 'Paniers d’osier', { hardwood: 1, flax: 3 }, 300, 58],
    ['filet', 'boxFilet', 'Filets de pêcheur', { hempRope: 1, flax: 2 }, 300, 58],
    ['ruban', 'boxRuban', 'Coffrets à ruban', { hardwood: 2, linen: 1, lavender: 1 }, 360, 58],
    ['caisse', 'boxCaisse', 'Caisses marines', { hardwood: 3, hempRope: 1, ironIngot: 1 }, 420, 59],
    ['tonnelet', 'boxTonnelet', 'Tonnelets', { solidOak: 1, ironIngot: 2 }, 480, 59],
    ['malle', 'boxMalle', 'Malles de voyage', { solidOak: 1, cloth: 1, copperIngot: 1 }, 540, 60],
    ['cloche', 'boxCloche', 'Cloches de verre', { resin: 4, silverIngot: 1, fruitWood: 2 }, 600, 61],
    ['ecrin', 'boxEcrin', 'Écrins de velours', { cloth: 2, solidOak: 1, goldIngot: 1 }, 720, 62],
];
export const BOX_OF = Object.fromEntries(BOXES.map(([pack, id]) => [pack, id]));
export const EMBALLERIE = { id: 'emballerie', name: 'Emballerie', reqLvl: 58, cost: 600000, desc: 'Les boîtes de la Maison, par trois : cagettes, paniers, filets, coffrets, écrins…' };
export const BOX_OUT = 3;
export const CARNET_104 = {
    boxCagette: 'Trois planches de bois dur, quelques clous : la cagette du marché, celle qu’on empile au bord des étals.',
    boxPanier: 'Le lin tressé serré autour d’un cerceau de bois. Mamie disait qu’un bon panier se reconnaît à son anse.',
    boxFilet: 'Une corde de chanvre et du lin noué maille à maille : le filet garde le poisson au frais, à l’air.',
    boxRuban: 'Une petite boîte de bois clair, un papier de soie, un brin de lavande et un ruban de lin. On l’ouvre doucement.',
    boxCaisse: 'Une caisse peinte en bleu, cerclée de fer, avec ses poignées de corde : elle a l’air d’avoir traversé la mer.',
    boxTonnelet: 'Des douelles de chêne et deux cercles de fer. On y glisse les bonnes choses de la cave.',
    boxMalle: 'Chêne, toile et serrure de cuivre : une malle de voyage, comme celles qu’on montait au grenier.',
    boxCloche: 'Un dôme clair sur un plateau de bois fruitier, cerclé d’argent : ce qu’on met dessous devient précieux.',
    boxEcrin: 'Du velours sur du chêne, un fermoir d’or. L’écrin qu’on garde longtemps après en avoir mangé le contenu.',
};
