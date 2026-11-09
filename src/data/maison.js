// 1.100 (étape 3) : la Maison, votre marque. Un atelier d'assemblage fabrique des coffrets de 3 produits à votre étiquette,
// vendus à des clients de plus en plus exigeants. La réputation de la marque ouvre des clients et des emblèmes.
// Les coffrets sont de vrais objets, mais ils ont leur propre stock (comme les bouteilles de la cave), jamais pris par les commandes.
export const MAISON = {
    cost: { coins: 2000000, plank: 100, stone: 60, beam: 20 },
    time: 15 * 60000, // un coffret : 15 minutes à l'atelier (au premier palier)
    times: [15, 15, 12, 10, 8, 5].map(m => m * 60000), // 1.103 : l'atelier va plus vite avec la renommée
    slots: [1, 2, 3, 4, 5, 6], // 1.103 : paquets lancés à la suite (l'atelier + la file d'attente), selon le palier
    stock: 30, // coffrets gardés au plus
    // 1.103 : chaque produit compte avec sa qualité (×1,25 en argent… ×2,8 en diamant), puis le paquet multiplie le tout :
    base: 2.2, // ×2,2 (1.103.2 : au-dessus des campeurs, qui paient ×2)…
    variety: 0.15, // … +0,15 s'ils sont de trois sortes différentes
    repMult: 0.03, // … +0,03 par palier de réputation (+ le bonus de la boîte)
    rep: [0, 15, 40, 100, 250, 600], // points de réputation pour chaque palier (0 à 5)
    // 1.103.2 : l'expérience d'une vente : un socle + une part du prix (à comparer aux commandes du village, 300 à 600 au niveau 60)
    xp: 700,
    xpPay: 0.15,
    wait: 3 * 3600000, // un client revient 3 h après un achat
};
export const MAISON_CLIENTS = [
    { id: 'neighbors', name: 'Les voisins', tier: 0, pay: 1.0, minQ: 0, say: 'Un petit cadeau pour la fête des voisins' },
    // 1.103 : les vrais campeurs du camping, un paquet chacun par séjour (un remarquable veut de l'argent au moins et paie plus)
    { id: 'campers', name: 'Les campeurs', tier: 1, pay: 1.2, minQ: 0, camp: true, say: 'Un souvenir de la vallée, un paquet par campeur et par séjour' },
    { id: 'souk', name: 'Le souk de l’oasis', tier: 2, pay: 1.3, minQ: 1, say: 'Les marchands du souk veulent du beau' },
    { id: 'chateau', name: 'Le château', tier: 3, pay: 1.5, minQ: 1, say: 'Octave cherche un cadeau pour ses invités' },
    { id: 'vitrine', name: 'La vitrine du village', tier: 4, pay: 1.8, minQ: 3, say: 'Une vitrine aux couleurs de votre maison' },
];
// des emblèmes : des produits de la ferme, 6 au départ puis 6 de plus à chaque palier
export const EMBLEMS = ['apple', 'wheat', 'egg', 'milk', 'cheese', 'honey', 'corn', 'carrot', 'grape', 'strawberry', 'cherry', 'pumpkin', 'tomato', 'potato', 'bread', 'butter', 'flour', 'wool', 'pear', 'lemon', 'orange', 'sunflower', 'lavender', 'mushroom', 'pepper', 'pizza', 'carp', 'trout', 'salmon', 'truffle'];
export const PALETTES = [
    { name: 'Crème et bordeaux', bg: '#f7eed9', fg: '#7a1f2b' },
    { name: 'Vert prairie', bg: '#e3f0d0', fg: '#2f6b2f' },
    { name: 'Bleu lagon', bg: '#dff1fa', fg: '#1d5f8a' },
    { name: 'Or et brun', bg: '#f6e3a8', fg: '#5a3a14' },
    { name: 'Lavande', bg: '#ece0f5', fg: '#5b3a85' },
    { name: 'Rose poudré', bg: '#fbe1e1', fg: '#a23b4a' },
    { name: 'Ardoise', bg: '#e1e5ea', fg: '#2f3b4a' },
    { name: 'Orange brûlé', bg: '#fde7cf', fg: '#a8480f' },
];

// 1.103 : les commandes de paquets. Trois à la fois ; une nouvelle arrive quelques heures après une livraison.
export const MAISON_ORDERS = {
    max: 3,
    gap: 3 * 3600000, // une commande livrée est remplacée 3 h plus tard
    skip: 1 * 3600000, // une commande passée, 1 h plus tard
    pay: 2.2, // payée 2,2 fois la valeur du paquet
    rep: 6,
    xp: 2.5, // × l'expérience d'une vente
    kinds: ['champ', 'champ', 'animaux', 'mer', 'cuisine', 'cuisine', 'artisanat', 'mixte', 'any'], // 1.104.3 : les six genres ; mixte : trois genres différents ; any : n'importe quel paquet
    // 1.103.1 : un villageois demande parfois un de vos paquets déjà créés (une de vos recettes)
    asks: 0.5, // une commande sur deux, quand on a des recettes
    friend: 4, // points d'amitié pour le villageois servi
};
// 1.103.1 : offrir un paquet à un villageois (le cadeau du jour) : des points de base, plus pour chaque produit qu'il aime
export const PK_GIFT = { base: 3, like: 1, love: 5 };
export const ASK_WHY = ['pour un repas de famille', 'pour un ami qui passe', 'pour se faire plaisir', 'pour l’anniversaire de sa sœur', 'pour un pique-nique', 'pour remercier un voisin', 'pour la fête du village', 'parce qu’on lui en a dit du bien'];
export const ORDER_KIND_TXT = { champ: 'du verger et du champ', animaux: 'des animaux de la ferme', mer: 'de la mer', cuisine: 'de bonnes choses de la cuisine', artisanat: 'd’artisanat', mixte: 'de trois genres différents', any: 'de votre choix', frais: 'du verger et du champ', 'fabriqué': 'de bonnes choses de la cuisine' };
export const ORDER_WHO = [
    ['Lucie', 'pour son mariage'],
    ['Le maire', 'pour les vœux de la mairie'],
    ['Madame Roux', 'pour l’anniversaire de sa mère'],
    ['L’école du village', 'pour la kermesse'],
    ['Le curé', 'pour la fête du saint patron'],
    ['Un hôtel de la ville', 'pour ses chambres de luxe'],
    ['Le club de pétanque', 'pour le grand tournoi'],
    ['Joseph le notaire', 'pour ses meilleurs clients'],
    ['La boulangère', 'pour la vitrine de Noël'],
    ['Les jeunes mariés du moulin', 'pour leurs invités'],
    ['Le médecin', 'pour remercier son infirmière'],
    ['Une agence de voyages', 'pour ses clients étrangers'],
];
