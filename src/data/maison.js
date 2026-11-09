// 1.100 (étape 3) : la Maison, votre marque. Un atelier d'assemblage fabrique des coffrets de 3 produits à votre étiquette,
// vendus à des clients de plus en plus exigeants. La réputation de la marque ouvre des clients et des emblèmes.
// Les coffrets sont de vrais objets, mais ils ont leur propre stock (comme les bouteilles de la cave), jamais pris par les commandes.
export const MAISON = {
    cost: { coins: 2000000, plank: 100, stone: 60, beam: 20 },
    time: 15 * 60000, // un coffret : 15 minutes à l'atelier
    stock: 30, // coffrets gardés au plus
    base: 1.3, // un coffret vaut 1,3 fois ses trois produits…
    variety: 0.1, // … +0,1 s'ils sont de trois sortes différentes
    quality: [0, 0.1, 0.2, 0.3, 0.4], // … +0,1 si tous au moins en argent, +0,2 en or, +0,3 en platine, +0,4 en diamant
    repMult: 0.03, // … +0,03 par palier de réputation
    rep: [0, 15, 40, 100, 250, 600], // points de réputation pour chaque palier (0 à 5)
    xp: 80,
    wait: 3 * 3600000, // un client revient 3 h après un achat
};
export const MAISON_CLIENTS = [
    { id: 'neighbors', name: 'Les voisins', tier: 0, pay: 1.0, minQ: 0, say: 'Un petit cadeau pour la fête des voisins' },
    { id: 'campers', name: 'Les campeurs', tier: 1, pay: 1.15, minQ: 0, say: 'Un souvenir de la vallée à ramener' },
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
