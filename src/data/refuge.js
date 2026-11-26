// 1.181 : Le Refuge & Clinique Vétérinaire — données, 12 espèces de faune sauvage, 5 remèdes, boutique & palmarès.

export const REFUGE_LVL = 18;

// 3 niveaux de clinique vétérinaire
export const REFUGE_LVLS = [
    {
        lvl: 1,
        name: 'Infirmerie de la Ferme',
        beds: 2,
        everyMs: 12 * 60 * 1000,
        rewardMult: 1,
        rareBonus: 0,
        basketEveryMs: 45 * 60 * 1000,
        cost: null,
    },
    {
        lvl: 2,
        name: 'Clinique de la Vallée',
        beds: 3,
        everyMs: 8 * 60 * 1000,
        rewardMult: 1.25,
        rareBonus: 0.12,
        basketEveryMs: 30 * 60 * 1000,
        cost: { coins: 18000, wood: 20, stone: 15, nail: 10 },
    },
    {
        lvl: 3,
        name: 'Grand Sanctuaire Vétérinaire',
        beds: 4,
        everyMs: 5 * 60 * 1000,
        rewardMult: 1.55,
        rareBonus: 0.25,
        basketEveryMs: 18 * 60 * 1000,
        cost: { coins: 95000, plank: 35, stone: 25, nail: 20, cotton: 10 },
    },
];

// 12 espèces de faune sauvage de la vallée (Carnet de la Faune)
// Chaque espèce découverte ajoute +1,5 % de vitesse à tous les animaux de la ferme (max +18 %).
export const WILD_SPECIES = [
    { id: 'faon', name: 'Faon des clairières', habitat: 'Prés & lisières', rarity: 1, weight: 14, hearts: 2, coins: 480, gift: ['honey', 'carrot'] },
    { id: 'herisson', name: 'Hérisson du potager', habitat: 'Haies & jardins', rarity: 1, weight: 14, hearts: 2, coins: 450, gift: ['apple', 'mushroom'] },
    { id: 'ecureuil', name: 'Écureuil roux', habitat: 'Verger & chênes', rarity: 1, weight: 14, hearts: 2, coins: 460, gift: ['chestnut', 'wood'] },
    { id: 'chouette', name: 'Chouette effraie', habitat: 'Grange & clocher', rarity: 1, weight: 12, hearts: 2, coins: 520, gift: ['feather', 'lavender'] },
    { id: 'renardeau', name: 'Renardeau curieux', habitat: 'Bois de la vallée', rarity: 2, weight: 9, hearts: 3, coins: 760, gift: ['honey', 'chestnut'] },
    { id: 'loutre', name: 'Loutre des berges', habitat: 'Rivière & étang', rarity: 2, weight: 9, hearts: 3, coins: 800, gift: ['mint', 'stone'] },
    { id: 'blaireau', name: 'Blaireau discret', habitat: 'Terriers des collines', rarity: 2, weight: 8, hearts: 3, coins: 780, gift: ['mushroom', 'wood'] },
    { id: 'tortue', name: 'Tortue cistude', habitat: 'Roseaux du marais', rarity: 2, weight: 8, hearts: 3, coins: 820, gift: ['chamomile', 'stone'] },
    { id: 'cygne', name: 'Cygne blanc', habitat: 'Grand lac', rarity: 3, weight: 5, hearts: 4, coins: 1250, gift: ['feather', 'honey'] },
    { id: 'marmotte', name: 'Marmotte des cimes', habitat: 'Alpages d’altitude', rarity: 3, weight: 4, hearts: 4, coins: 1320, gift: ['thyme', 'lavender'] },
    { id: 'cigogne', name: 'Cigogne de la vallée', habitat: 'Toits du village', rarity: 3, weight: 4, hearts: 4, coins: 1380, gift: ['feather', 'chamomile'] },
    { id: 'lynx', name: 'Lynx boréal', habitat: 'Forêt profonde', rarity: 4, weight: 2, hearts: 6, coins: 2200, gift: ['honey', 'lavender'] },
];
export const WILD_BY_ID = Object.fromEntries(WILD_SPECIES.map(s => [s.id, s]));
export const WILD_RARITY_LABELS = { 1: 'Commun', 2: 'Peu commun', 3: 'Rare', 4: 'Très rare' };
export const WILD_SPECIES_SPEED_PER = 0.015; // +1,5 % vitesse animaux par espèce découverte (max +18 %)

// Symptômes & 5 remèdes naturels préparés avec les produits de la ferme (ou achetables en pièces)
export const REFUGE_REMEDIES = [
    {
        id: 'balm',
        symptom: 'Patte foulée',
        name: 'Baume à la lavande',
        need: { lavender: 2, honey: 1 },
        coins: 360,
        icon: ['ui', 'vetBalm'],
        desc: 'Apaise les entorses et petites écorchures.',
    },
    {
        id: 'tea',
        symptom: 'Grosse frayeur',
        name: 'Tisane de camomille',
        need: { chamomile: 2, honey: 1 },
        coins: 340,
        icon: ['item', 'chamomile'],
        desc: 'Calme le cœur et rassure les bêtes égarées.',
    },
    {
        id: 'infusion',
        symptom: 'Rhume des champs',
        name: 'Infusion menthe-thym',
        need: { mint: 2, thyme: 1 },
        coins: 400,
        icon: ['item', 'mint'],
        desc: 'Dégage le souffle après une averse fraîche.',
    },
    {
        id: 'poultice',
        symptom: 'Fièvre passagère',
        name: 'Cataplasme au lait doux',
        need: { milk: 2, carrot: 1 },
        coins: 300,
        icon: ['item', 'milk'],
        desc: 'Rafraîchit et redonne vite de l’appétit.',
    },
    {
        id: 'compote',
        symptom: 'Coup de fatigue',
        name: 'Compote tonique',
        need: { apple: 2, honey: 1 },
        coins: 350,
        icon: ['item', 'apple'],
        desc: 'Recharge les forces avant le retour en liberté.',
    },
];
export const REMEDY_BY_ID = Object.fromEntries(REFUGE_REMEDIES.map(r => [r.id, r]));

// Boutique de Bienveillance (payée en Cœurs verts, conservés au Prestige)
export const REFUGE_SHOP = [
    {
        id: 'vitality',
        name: 'Sérum de vitalité (4 h)',
        cost: 4,
        icon: ['ui', 'vetHeart'],
        desc: '+30 % vitesse sur tous les animaux et immunité totale aux maladies pendant 4 h.',
    },
    {
        id: 'tenderness',
        name: 'Trousse de tendresse',
        cost: 3,
        icon: ['ui', 'vetKit'],
        desc: 'Soigne toute bête malade et offre +1 cœur d’affection à toutes les bêtes adultes de la ferme.',
    },
    {
        id: 'wildCall',
        name: 'Appel de la forêt',
        cost: 3,
        icon: ['ui', 'refuge'],
        desc: 'Fait arriver immédiatement un animal sauvage rare au Refuge (priorité aux espèces manquantes).',
    },
    {
        id: 'breedBalm',
        name: 'Baume d’élevage rare',
        cost: 6,
        icon: ['ui', 'sparkle'],
        desc: 'Prochaine naissance au pré : +2 pts de traits garantis et robe ou finition rare assurée.',
    },
    {
        id: 'pack',
        name: 'Coffret Bienveillance & MeuhCG',
        cost: 5,
        icon: ['ui', 'ribbon'],
        desc: 'Reçoit +1 booster MeuhCG gratuit et +1 ruban de Prestige.',
    },
];

// Palmarès Vétérinaire à 5 paliers permanents (conservés au Prestige)
export const REFUGE_PALM = [
    {
        id: 'r1',
        need: 3,
        name: 'Apprenti Soigneur',
        sickResist: 0.2,
        freeCure: false,
        speed: 0,
        qual: 0,
        doubleBasket: false,
        rubans: 1,
        hearts: 3,
        desc: '-20 % de risque de maladie sur toute la ferme.',
    },
    {
        id: 'r2',
        need: 10,
        name: 'Ami des Bêtes',
        sickResist: 0,
        freeCure: true,
        speed: 0.05,
        qual: 0,
        doubleBasket: false,
        rubans: 2,
        hearts: 5,
        desc: 'Soigner une bête malade au pré devient gratuit · +5 % vitesse des animaux.',
    },
    {
        id: 'r3',
        need: 25,
        name: 'Vétérinaire de la Vallée',
        sickResist: 0.25,
        freeCure: false,
        speed: 0,
        qual: 0.05,
        doubleBasket: false,
        rubans: 3,
        hearts: 8,
        desc: '-45 % de risque de maladie (cumulé) · +5 % chance qualité supérieure sur les animaux.',
    },
    {
        id: 'r4',
        need: 50,
        name: 'Gardien de la Faune',
        sickResist: 0,
        freeCure: false,
        speed: 0.1,
        qual: 0,
        doubleBasket: true,
        rubans: 5,
        hearts: 12,
        desc: '+10 % vitesse des animaux · Paniers de la faune reconnaissante doublés.',
    },
    {
        id: 'r5',
        need: 90,
        name: 'Sanctuaire Légendaire',
        sickResist: 0.3,
        freeCure: false,
        speed: 0.15,
        qual: 0.1,
        doubleBasket: false,
        rubans: 8,
        hearts: 20,
        desc: '-75 % de risque de maladie · +15 % vitesse et +10 % qualité supérieure sur tous les prés.',
    },
];
