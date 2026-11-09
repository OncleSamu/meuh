import { BOX_OF } from './ajouts/emballerie.js';
import { ITEMS } from './items.js';
import { RECIPES } from './machines.js';
// 1.101 : les packagings de la Maison. Dix boîtes dessinées, chacune faite pour un genre de contenu.
// Un paquet = une boîte (le modèle) + trois produits de la ferme (n'importe quel produit qui se vend) + un nom choisi par le joueur.
// 1.104 : les boîtes se fabriquent à l'emballerie (par trois) ; leur bonus est plus fort, et leur valeur compte dans le paquet. Les modèles s'ouvrent avec la réputation.
// 1.104.3 : six genres, d'après l'origine du produit (avant : frais / mer / fabriqué / trésors, et des bois de renne « frais »)
export const KIND_NAMES = { champ: 'Verger et champ', animaux: 'Animaux', mer: 'Mer', cuisine: 'Cuisine', artisanat: 'Artisanat', 'trésor': 'Trésors' };
export const KINDS = Object.keys(KIND_NAMES);
// les anciens genres, encore dans de vieilles commandes
export const KIND_ALIAS = { frais: 'champ', 'fabriqué': 'cuisine' };
export const normKind = k => KIND_ALIAS[k] || k;
export const PACKS = [
    { id: 'carton', name: 'Boîte de carton', tier: 0, fits: '*', cost: {}, bonus: 0, blurb: 'Simple et solide : elle accepte tout.' },
    { id: 'cagette', name: 'Cagette de bois', tier: 0, fits: ['champ'], cost: {}, bonus: 0.1, blurb: 'Pour les fruits et les légumes du verger et du champ.' },
    { id: 'panier', name: 'Panier d’osier', tier: 1, fits: ['champ', 'animaux'], cost: {}, bonus: 0.14, blurb: 'Le panier du marché, anse au bras : fruits, légumes, œufs, fromage frais…' },
    { id: 'filet', name: 'Filet de pêcheur', tier: 1, fits: ['mer'], cost: {}, bonus: 0.12, blurb: 'Pour les poissons et les produits de la mer.' },
    { id: 'ruban', name: 'Coffret à ruban', tier: 2, fits: '*', cost: {}, bonus: 0.15, blurb: 'Un papier de soie et un joli nœud.' },
    { id: 'caisse', name: 'Caisse marine', tier: 2, fits: ['mer', 'cuisine'], cost: {}, bonus: 0.18, blurb: 'Peinte en bleu, avec ses poignées de corde.' },
    { id: 'tonnelet', name: 'Tonnelet', tier: 3, fits: ['cuisine', 'champ'], cost: {}, bonus: 0.22, blurb: 'Cerclé de fer, pour les bonnes choses de la cave.' },
    { id: 'malle', name: 'Malle de voyage', tier: 3, fits: '*', cost: {}, bonus: 0.25, blurb: 'Sangles et serrure : elle accepte tout.' },
    { id: 'cloche', name: 'Cloche de verre', tier: 4, fits: ['champ', 'animaux', 'cuisine'], cost: {}, bonus: 0.32, blurb: 'Un dôme de verre sur son plateau.' },
    { id: 'ecrin', name: 'Écrin de velours', tier: 5, fits: '*', cost: {}, bonus: 0.4, blurb: 'Le plus beau des écrins, pour les plus beaux produits.' },
];
// 1.104 : chaque boîte (sauf le carton) est un produit fabriqué à l'emballerie ; le paquet en prend une
PACKS.forEach(p => (p.item = BOX_OF[p.id] || null));
export const PACK = Object.fromEntries(PACKS.map(p => [p.id, p]));
export const BOX_VALUE = 1.5; // une boîte compte dans le prix du paquet, 1,5 fois sa valeur
// de quel genre est un produit (pour la boîte qui lui va et pour « trois genres différents »)
// 1.104.3 : d'où vient le produit. Les produits de la mer pêchés au large sont rangés avec les « produits » des bêtes : on les remet à la mer ;
// ce qui sort d'une machine est de la cuisine, sauf l'artisanat (tissus, savons, poteries, bijoux, forge…).
export const KIND_OF_TYPE = { crop: 'champ', tree: 'champ', product: 'animaux', fish: 'mer', artisan: 'cuisine', gem: 'trésor', ore: 'trésor', ingot: 'artisanat', material: 'artisanat' };
const SEA = new Set(['sardine', 'mackerel', 'shrimp', 'seabass', 'lobster', 'squid', 'bream', 'skate', 'tuna']);
const FIELD = new Set(['cardamom', 'truffle']); // une épice et un champignon, rangés avec les produits des bêtes
const FOOD = new Set(['preservedLemon', 'honeyPot']); // des bocaux qui sortent de la poterie : c'est à manger
const TREASURE = new Set(['ironIngot', 'copperIngot', 'silverIngot', 'goldIngot']);
export const CRAFT_MACHINES = new Set(['loom', 'tailor', 'soapworks', 'sawmill', 'forge', 'pottery', 'dyeworks', 'jewelry', 'perfumery', 'saddlery', 'emballerie']);
export function itemKind(id) {
    const i = ITEMS[id];
    if (!i) return null;
    if (SEA.has(id)) return 'mer';
    if (FIELD.has(id)) return 'champ';
    if (TREASURE.has(id)) return 'trésor';
    // 1.104.5 : les matériaux bruts (bois, pierre, bois dur, chêne, résine, pierre taillée, sève) ne vont pas dans un paquet
    if (i.type === 'material' || i.type === 'ingot') return null;
    if (FOOD.has(id)) return 'cuisine';
    if (i.type === 'artisan') return RECIPES[id] && CRAFT_MACHINES.has(RECIPES[id].machine) ? 'artisanat' : 'cuisine';
    return KIND_OF_TYPE[i.type] || null;
}
// des noms pour donner des idées au joueur (il peut toujours écrire le sien)
export const NAME_IDEAS = {
    champ: ['Cagette du verger', 'Panier du potager', 'Cueillette du jour'],
    animaux: ['Panier de la basse-cour', 'Douceurs de l’étable', 'Le bon de nos bêtes'],
    mer: ['Cagette du large', 'Pêche du matin', 'Filet du pêcheur'],
    cuisine: ['Coffret du terroir', 'Boîte de gourmandises', 'Le panier du chef'],
    artisanat: ['Trésors de l’atelier', 'Fait main', 'Coffret de l’artisan'],
    'trésor': ['Écrin précieux', 'Coffret des profondeurs', 'Pierres et métal'],
    mixte: ['Assortiment de la ferme', 'Le grand panier', 'Surprise de la vallée'],
};
export const NAME_MAX = 30;
export const RECIPES_MAX = 40;
