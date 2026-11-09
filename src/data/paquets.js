import { BOX_OF } from './ajouts/emballerie.js';
// 1.101 : les packagings de la Maison. Dix boîtes dessinées, chacune faite pour un genre de contenu.
// Un paquet = une boîte (le modèle) + trois produits de la ferme (n'importe quel produit qui se vend) + un nom choisi par le joueur.
// 1.104 : les boîtes se fabriquent à l'emballerie (par trois) ; leur bonus est plus fort, et leur valeur compte dans le paquet. Les modèles s'ouvrent avec la réputation.
export const KIND_NAMES = { frais: 'Frais', mer: 'Mer', 'fabriqué': 'Fabriqué', 'trésor': 'Trésors' };
export const PACKS = [
    { id: 'carton', name: 'Boîte de carton', tier: 0, fits: '*', cost: {}, bonus: 0, blurb: 'Simple et solide : elle accepte tout.' },
    { id: 'cagette', name: 'Cagette de bois', tier: 0, fits: ['frais'], cost: {}, bonus: 0.1, blurb: 'Pour les fruits, les légumes et les produits frais.' },
    { id: 'panier', name: 'Panier d’osier', tier: 1, fits: ['frais'], cost: {}, bonus: 0.14, blurb: 'Le panier du marché, anse au bras.' },
    { id: 'filet', name: 'Filet de pêcheur', tier: 1, fits: ['mer'], cost: {}, bonus: 0.12, blurb: 'Pour les poissons et les produits de la mer.' },
    { id: 'ruban', name: 'Coffret à ruban', tier: 2, fits: '*', cost: {}, bonus: 0.15, blurb: 'Un papier de soie et un joli nœud.' },
    { id: 'caisse', name: 'Caisse marine', tier: 2, fits: ['mer', 'fabriqué'], cost: {}, bonus: 0.18, blurb: 'Peinte en bleu, avec ses poignées de corde.' },
    { id: 'tonnelet', name: 'Tonnelet', tier: 3, fits: ['fabriqué', 'frais'], cost: {}, bonus: 0.22, blurb: 'Cerclé de fer, pour les bonnes choses de la cave.' },
    { id: 'malle', name: 'Malle de voyage', tier: 3, fits: '*', cost: {}, bonus: 0.25, blurb: 'Sangles et serrure : elle accepte tout.' },
    { id: 'cloche', name: 'Cloche de verre', tier: 4, fits: ['frais', 'fabriqué'], cost: {}, bonus: 0.32, blurb: 'Un dôme de verre sur son plateau.' },
    { id: 'ecrin', name: 'Écrin de velours', tier: 5, fits: '*', cost: {}, bonus: 0.4, blurb: 'Le plus beau des écrins, pour les plus beaux produits.' },
];
// 1.104 : chaque boîte (sauf le carton) est un produit fabriqué à l'emballerie ; le paquet en prend une
PACKS.forEach(p => (p.item = BOX_OF[p.id] || null));
export const PACK = Object.fromEntries(PACKS.map(p => [p.id, p]));
export const BOX_VALUE = 1.5; // une boîte compte dans le prix du paquet, 1,5 fois sa valeur
// de quel genre est un produit (pour la boîte qui lui va et pour « trois genres différents »)
export const KIND_OF_TYPE = { crop: 'frais', tree: 'frais', product: 'frais', fish: 'mer', artisan: 'fabriqué', gem: 'trésor', ore: 'trésor', ingot: 'trésor', material: 'trésor' };
// des noms pour donner des idées au joueur (il peut toujours écrire le sien)
export const NAME_IDEAS = {
    frais: ['Panier gourmand', 'Cagette du verger', 'Cueillette du jour'],
    mer: ['Cagette du large', 'Pêche du matin', 'Filet du pêcheur'],
    'fabriqué': ['Coffret du terroir', 'Boîte de gourmandises', 'Trésors de l’atelier'],
    'trésor': ['Écrin précieux', 'Coffret des profondeurs', 'Pierres et métal'],
    mixte: ['Assortiment de la ferme', 'Le grand panier', 'Surprise de la vallée'],
};
export const NAME_MAX = 30;
export const RECIPES_MAX = 40;
