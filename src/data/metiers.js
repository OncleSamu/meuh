// 1.114 : les spécialités de ferme. Six métiers, dix rangs chacun. Un rang se gagne en réussissant ses deux leçons,
// comptées à partir du moment où le rang commence. Un seul métier est actif ; les rangs des autres dorment.
// Une leçon : [clé, quantité, texte]. Clé « c:xxx » : un compteur du métier (produits récoltés, pêchés, préparés) ;
// « s:xxx » : une statistique de la ferme (state.stats.xxx).
const L = (key, n, text) => ({ key, n, text });
export const METIER_RANKS = 10;
export const METIERS = {
    maraicher: {
        name: 'Maraîcher',
        master: 'Maître maraîcher',
        icon: ['item', 'carrot'],
        desc: 'Le champ, la serre, les cultures compagnes et les belles récoltes.',
        what: 'vos cultures',
        rate: 0.02,
        lessons: [
            [L('c:crop', 60, 'Récolter 60 cultures'), L('s:orders', 3, 'Livrer 3 commandes du village')],
            [L('c:crop', 200, 'Récolter 200 cultures'), L('s:goldQ', 10, 'Récolter 10 cultures de qualité or')],
            [L('c:crop', 500, 'Récolter 500 cultures'), L('s:goldQ', 40, 'Récolter 40 cultures de qualité or')],
            [L('c:crop', 1000, 'Récolter 1 000 cultures'), L('s:pests', 5, 'Soigner 5 parcelles malades')],
            [L('c:crop', 2000, 'Récolter 2 000 cultures'), L('s:goldQ', 150, 'Récolter 150 cultures de qualité or')],
            [L('c:crop', 3500, 'Récolter 3 500 cultures'), L('s:goldQ', 400, 'Récolter 400 cultures de qualité or')],
            [L('c:crop', 5000, 'Récolter 5 000 cultures'), L('s:islandHarvest', 300, 'Récolter 300 cultures sur l’île')],
            [L('c:crop', 8000, 'Récolter 8 000 cultures'), L('s:goldQ', 1000, 'Récolter 1 000 cultures de qualité or')],
            [L('c:crop', 12000, 'Récolter 12 000 cultures'), L('s:oasisHarvest', 300, 'Récolter 300 cultures à l’oasis')],
            [L('c:crop', 20000, 'Récolter 20 000 cultures'), L('s:nordHarvest', 300, 'Récolter 300 cultures au Grand Nord')],
        ],
    },
    eleveur: {
        name: 'Éleveur',
        master: 'Maître éleveur',
        icon: ['item', 'milk'],
        desc: 'Les bêtes, les naissances, les lignées et les chevaux.',
        what: 'les produits de vos bêtes',
        rate: 0.02,
        lessons: [
            [L('c:animal', 40, 'Ramasser 40 produits des bêtes'), L('s:pets', 10, 'Caresser 10 fois une bête')],
            [L('c:animal', 150, 'Ramasser 150 produits des bêtes'), L('s:pets', 40, 'Caresser 40 fois une bête')],
            [L('c:animal', 400, 'Ramasser 400 produits des bêtes'), L('s:pets', 100, 'Caresser 100 fois une bête')],
            [L('c:animal', 900, 'Ramasser 900 produits des bêtes'), L('s:births', 3, 'Faire naître 3 petits')],
            [L('c:animal', 1800, 'Ramasser 1 800 produits des bêtes'), L('s:animalsSold', 5, 'Vendre 5 bêtes à la foire')],
            [L('c:animal', 3000, 'Ramasser 3 000 produits des bêtes'), L('s:births', 12, 'Faire naître 12 petits')],
            [L('c:animal', 5000, 'Ramasser 5 000 produits des bêtes'), L('s:crosses', 5, 'Réussir 5 croisements à la station')],
            [L('c:animal', 8000, 'Ramasser 8 000 produits des bêtes'), L('s:trained', 10, 'Entraîner 10 fois un cheval')],
            [L('c:animal', 12000, 'Ramasser 12 000 produits des bêtes'), L('s:salonWins', 3, 'Gagner 3 fois au Salon')],
            [L('c:animal', 18000, 'Ramasser 18 000 produits des bêtes'), L('s:foals', 5, 'Faire naître 5 poulains')],
        ],
    },
    arbo: {
        name: 'Arboriculteur',
        master: 'Maître arboriculteur',
        icon: ['item', 'apple'],
        desc: 'Le verger, les greffons, les ruches et les miels de fleurs.',
        what: 'vos fruits et vos miels',
        rate: 0.02,
        lessons: [
            [L('c:fruit', 30, 'Ramasser 30 fruits'), L('s:orders', 3, 'Livrer 3 commandes du village')],
            [L('c:fruit', 120, 'Ramasser 120 fruits'), L('s:honey', 5, 'Récolter 5 pots de miel')],
            [L('c:fruit', 300, 'Ramasser 300 fruits'), L('s:orchardQual', 20, 'Ramasser 20 fruits d’argent ou d’or')],
            [L('c:fruit', 700, 'Ramasser 700 fruits'), L('s:odileDone', 3, 'Réussir 3 défis d’Odile')],
            [L('c:fruit', 1500, 'Ramasser 1 500 fruits'), L('s:honey', 60, 'Récolter 60 pots de miel')],
            [L('c:fruit', 2500, 'Ramasser 2 500 fruits'), L('s:felled', 5, 'Abattre 5 vieux arbres pour replanter')],
            [L('c:fruit', 4000, 'Ramasser 4 000 fruits'), L('s:apiaryHoney', 30, 'Récolter 30 pots de miel de fleurs')],
            [L('c:fruit', 6500, 'Ramasser 6 500 fruits'), L('s:orchardQual', 800, 'Ramasser 800 fruits d’argent ou d’or')],
            [L('c:fruit', 10000, 'Ramasser 10 000 fruits'), L('s:basketContests', 2, 'Gagner 2 concours du panier')],
            [L('c:fruit', 15000, 'Ramasser 15 000 fruits'), L('s:apiaryHoney', 200, 'Récolter 200 pots de miel de fleurs')],
        ],
    },
    cuisinier: {
        name: 'Cuisinier',
        master: 'Maître cuisinier',
        icon: ['item', 'bread'],
        desc: 'Les fours, les fourneaux, les plats d’or et les paquets de la Maison.',
        what: 'vos plats',
        rate: 0.01,
        lessons: [
            [L('c:dish', 30, 'Préparer 30 plats'), L('s:orders', 5, 'Livrer 5 commandes du village')],
            [L('c:dish', 120, 'Préparer 120 plats'), L('s:orders', 20, 'Livrer 20 commandes du village')],
            [L('c:dish', 350, 'Préparer 350 plats'), L('s:goldDishes', 5, 'Préparer 5 plats d’or')],
            [L('c:dish', 800, 'Préparer 800 plats'), L('s:orders', 80, 'Livrer 80 commandes du village')],
            [L('c:dish', 1600, 'Préparer 1 600 plats'), L('s:goldDishes', 40, 'Préparer 40 plats d’or')],
            [L('c:dish', 3000, 'Préparer 3 000 plats'), L('s:orders', 200, 'Livrer 200 commandes du village')],
            [L('c:dish', 5000, 'Préparer 5 000 plats'), L('s:goldDishes', 150, 'Préparer 150 plats d’or')],
            [L('c:dish', 8000, 'Préparer 8 000 plats'), L('s:armands', 3, 'Terminer 3 commandes d’Armand')],
            [L('c:dish', 12000, 'Préparer 12 000 plats'), L('s:coffrets', 10, 'Composer 10 paquets à la Maison')],
            [L('c:dish', 18000, 'Préparer 18 000 plats'), L('s:coffretOrders', 15, 'Livrer 15 commandes de paquets')],
        ],
    },
    vigneron: {
        name: 'Vigneron',
        master: 'Maître vigneron',
        icon: ['item', 'tableWine'],
        desc: 'Le pressoir, la cave, la brasserie, l’hydromel et le comptoir.',
        what: 'vos boissons, vos bouteilles de cave et vos bières',
        rate: 0.02,
        lessons: [
            [L('c:fruit', 20, 'Ramasser 20 fruits'), L('s:crafted', 40, 'Préparer 40 produits à l’atelier')],
            [L('c:drink', 15, 'Préparer 15 boissons'), L('s:crafted', 150, 'Préparer 150 produits à l’atelier')],
            [L('c:drink', 60, 'Préparer 60 boissons'), L('s:caveLots', 3, 'Vendre 3 lots de la cave')],
            [L('c:drink', 150, 'Préparer 150 boissons'), L('s:cuvees', 3, 'Vendre 3 cuvées baptisées')],
            [L('c:drink', 300, 'Préparer 300 boissons'), L('s:beers', 20, 'Brasser 20 bouteilles de bière')],
            [L('c:drink', 600, 'Préparer 600 boissons'), L('s:caveLots', 25, 'Vendre 25 lots de la cave')],
            [L('c:drink', 1000, 'Préparer 1 000 boissons'), L('s:beerOrders', 5, 'Livrer 5 commandes de bière')],
            [L('c:drink', 1600, 'Préparer 1 600 boissons'), L('s:meads', 20, 'Brasser 20 bouteilles d’hydromel')],
            [L('c:drink', 2500, 'Préparer 2 500 boissons'), L('s:auctionSold', 3, 'Réussir 3 ventes aux enchères')],
            [L('c:drink', 4000, 'Préparer 4 000 boissons'), L('s:drinks', 200, 'Servir 200 boissons au comptoir')],
        ],
    },
    pecheur: {
        name: 'Pêcheur',
        master: 'Maître pêcheur',
        icon: ['item', 'carp'],
        desc: 'L’étang, les appâts, le port, le lagon et les concours de pêche.',
        what: 'vos poissons et vos produits de la mer',
        rate: 0.02,
        lessons: [
            [L('c:fish', 15, 'Pêcher 15 poissons'), L('s:perfectFish', 3, 'Réussir 3 prises parfaites')],
            [L('c:fish', 60, 'Pêcher 60 poissons'), L('s:perfectFish', 10, 'Réussir 10 prises parfaites')],
            [L('c:fish', 150, 'Pêcher 150 poissons'), L('s:marcelDone', 3, 'Réussir 3 défis de Marcel')],
            [L('c:fish', 350, 'Pêcher 350 poissons'), L('s:perfectFish', 40, 'Réussir 40 prises parfaites')],
            [L('c:fish', 700, 'Pêcher 700 poissons'), L('s:seaHauls', 5, 'Relever 5 fois le filet de mer')],
            [L('c:fish', 1200, 'Pêcher 1 200 poissons'), L('s:marcelDone', 15, 'Réussir 15 défis de Marcel')],
            [L('c:fish', 2000, 'Pêcher 2 000 poissons'), L('s:fishContests', 2, 'Gagner 2 concours de pêche')],
            [L('c:fish', 3200, 'Pêcher 3 200 poissons'), L('s:perfectFish', 200, 'Réussir 200 prises parfaites')],
            [L('c:fish', 5000, 'Pêcher 5 000 poissons'), L('s:seaHauls', 40, 'Relever 40 fois le filet de mer')],
            [L('c:fish', 8000, 'Pêcher 8 000 poissons'), L('s:fishContests', 6, 'Gagner 6 concours de pêche')],
        ],
    },
};
export const METIER_IDS = Object.keys(METIERS);
// les machines du vigneron (leurs produits sont ses « boissons »)
// 1.116 : avec le comptoir (thés, cafés, chocolats), qui comptaient par erreur pour le cuisinier
export const DRINK_MACHINES = ['press', 'brewery', 'malthouse', 'still', 'juiceBar', 'rumDistillery', 'winery', 'counter'];
// les bonus : le prix des produits du métier monte à chaque rang ; trois rangs marquants
export const METIER_FX = {
    master: 0.1, // rang 10 : encore 10 % de prix sur les produits du métier
    orders: { rank: 3, pay: 0.1 }, // rang 3 : une commande du village qui contient un produit du métier paie 10 % de plus
    transport: { rank: 6, pay: 0.15 }, // rang 6 : le train et l'avion-cargo paient 15 % de plus les produits du métier
};
// changer de métier : gratuit la première fois, puis des pièces (selon le niveau) et sept jours d'attente
export const METIER_CHANGE = { coins: lvl => Math.round((500 * lvl * lvl) / 1000) * 1000, wait: 7 * 24 * 3600000 };

// ---------------- 1.115 : le monde réagit ----------------
// la demande : une commande, un wagon ou une soute choisit un produit du métier une fois sur (0,15 + 0,03 par rang), 45 % au plus
export const METIER_DEMAND = { base: 0.15, per: 0.03, max: 0.45 };
// rang 4 : un client attitré passe une commande par jour, payée 1,5 fois une commande du village
// rang 5 : le produit signature, choisi parmi les produits du métier qu'on maîtrise (une étoile), se vend 15 % plus cher
export const METIER_CLIENT = { rank: 4, pay: 1.5, items: [2, 3] };
export const METIER_SIGN = { rank: 5, pay: 0.15, change: 7 * 24 * 3600000 };
export const CLIENTS = {
    maraicher: { name: 'Madame Lebrun', who: 'primeur du marché couvert', seed: 41, female: true, say: 'Des légumes comme les vôtres, mes clientes les réclament !' },
    eleveur: { name: 'Fernand', who: 'boucher-charcutier du bourg', seed: 52, male: true, say: 'Une bête bien soignée, ça se goûte.' },
    arbo: { name: 'Rose', who: 'confiturière de la vallée', seed: 63, female: true, say: 'Vos fruits ont un parfum qu’on ne trouve nulle part ailleurs.' },
    cuisinier: { name: 'Le chef Antoine', who: 'cuisinier de l’auberge', seed: 74, male: true, say: 'Ce soir, je sers vos plats à ma table d’honneur.' },
    vigneron: { name: 'Monsieur Delorme', who: 'caviste en ville', seed: 85, male: true, say: 'Votre nom commence à circuler chez les amateurs.' },
    pecheur: { name: 'Yvonne', who: 'poissonnière du port', seed: 96, female: true, say: 'Du poisson frais du matin, c’est ce qui part en premier !' },
};
