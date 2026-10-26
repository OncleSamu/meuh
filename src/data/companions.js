// Les cultures compagnes (1.25) : des plantes voisines qui s'aident ou se gênent.
// Une association lie deux cultures (ou deux familles) ; `to` : 'both' (les deux en profitent) ou 'b' (seulement la seconde).
// Effets : p pousse, q qualité, r récolte en plus, n moins de nuisibles, t les trois sœurs ; mp, mq, mn : les malus.

export const COMP_LVL = 9;
export const FAMILY = {
    leg: ['peas', 'greenBean', 'lentil', 'soy'], // légumineuses
    cer: ['wheat', 'corn', 'barley', 'rice', 'buckwheat'], // céréales
    all: ['garlic', 'onion', 'leek'], // alliacées
};
const A = (id, name, a, b, fx, o = {}) => ({
    id,
    name,
    a: [].concat(a),
    b: b === '*' ? '*' : [].concat(b),
    fx,
    to: o.to || 'both',
    c: o.c || null,
    why: o.why || '',
});
export const ASSOCS = [
    // ---------- les bonnes ----------
    A('carotteOignon', 'Carotte et oignon', 'carrot', 'onion', 'n', { why: 'Chacun éloigne la mouche de l’autre.' }),
    A('radisSalade', 'Radis et salade', 'radish', 'lettuce', 'p', { why: 'Le radis sort vite, la salade garde le sol frais.' }),
    A('fraiseEpinards', 'Fraise et épinards', 'strawberry', 'spinach', 'p', { why: 'Les épinards couvrent le sol au pied des fraisiers.' }),
    A('tomateBasilic', 'Tomate et basilic', 'tomato', 'basil', 'q', { why: 'Le basilic parfume et protège la tomate.' }),
    A('poireauCarotte', 'Poireau et carotte', 'leek', 'carrot', 'n', { why: 'Le poireau chasse la mouche de la carotte, et l’inverse.' }),
    A('pdtHaricot', 'Pomme de terre et haricot', 'potato', 'greenBean', 'n', { why: 'Le haricot éloigne le doryphore.' }),
    A('tournesolConcombre', 'Tournesol et concombre', 'sunflower', 'cucumber', 'r', { why: 'Le tournesol fait de l’ombre et attire les abeilles.' }),
    A('ailFraise', 'Ail et fraise', 'garlic', 'strawberry', 'q', { why: 'L’ail protège les fraisiers des maladies.' }),
    A('courgetteRadis', 'Courgette et radis', 'zucchini', 'radish', 'r', { why: 'Le radis éloigne les altises des courgettes.' }),
    A('aspergeTomate', 'Asperge et tomate', 'asparagus', 'tomato', 'q', { why: 'La tomate éloigne le criocère de l’asperge.' }),
    A('pastequeMais', 'Pastèque et maïs', 'watermelon', 'corn', 'r', { why: 'Le maïs abrite la pastèque du vent.' }),
    A('lavande', 'La lavande, amie de tous', 'lavender', '*', 'r', { to: 'b', why: 'Elle attire les abeilles sur ses voisines.' }),
    A('sarrasin', 'Le sarrasin, ami de tous', 'buckwheat', '*', 'r', { to: 'b', why: 'Ses fleurs attirent les pollinisateurs.' }),
    A('engraisVert', 'Engrais vert', FAMILY.leg, FAMILY.cer, 'p', { to: 'b', why: 'Les légumineuses enrichissent la terre de la céréale voisine.' }),
    A('troisSoeurs', 'Les trois sœurs', 'corn', 'greenBean', 't', {
        c: ['pumpkin'],
        why: 'Le maïs sert de tuteur au haricot, qui nourrit la terre ; la courge garde le sol à l’ombre.',
    }),
    A('carotteRadis', 'Carotte et radis', 'carrot', 'radish', 'p', { why: 'Semés mêlés, le radis ameublit la terre pour la carotte.' }),
    A('carotteSalade', 'Carotte et salade', 'carrot', 'lettuce', 'p', { why: 'Leurs racines ne se gênent pas.' }),
    A('carotteTomate', 'Carotte et tomate', 'carrot', 'tomato', 'q', { why: 'La carotte aère la terre au pied des tomates.' }),
    A('tomateAil', 'Tomate et ail', 'tomato', 'garlic', 'n', { why: 'L’ail éloigne les maladies et les pucerons.' }),
    A('tomateChou', 'Tomate et chou', 'tomato', 'cabbage', 'n', { why: 'L’odeur de la tomate éloigne la piéride du chou.' }),
    A('basilicPoivron', 'Basilic et poivron', 'basil', ['pepper', 'espelette'], 'q', { why: 'Le basilic parfume poivrons et piments.' }),
    A('saladeFraise', 'Salade et fraise', 'lettuce', 'strawberry', 'p', { why: 'La salade couvre le sol entre les fraisiers.' }),
    A('concombreHaricot', 'Concombre et haricot', 'cucumber', 'greenBean', 'r', { why: 'Le haricot nourrit la terre du concombre.' }),
    A('concombreMais', 'Concombre et maïs', 'cucumber', 'corn', 'r', { why: 'Le maïs donne de l’ombre et un tuteur.' }),
    A('poisCarotte', 'Petits pois et carotte', 'peas', 'carrot', 'p', { why: 'Le pois enrichit la terre de la carotte.' }),
    A('poisRadis', 'Petits pois et radis', 'peas', 'radish', 'p', { why: 'Deux semis de printemps qui s’entendent bien.' }),
    A('aubergineHaricot', 'Aubergine et haricot', 'eggplant', 'greenBean', 'n', { why: 'Le haricot éloigne le doryphore de l’aubergine.' }),
    A('oignonBetterave', 'Oignon et betterave', 'onion', 'beet', 'n', { why: 'L’oignon éloigne les insectes de la betterave.' }),
    A('oignonSalade', 'Oignon et salade', 'onion', 'lettuce', 'p', { why: 'L’oignon chasse les limaces de la salade.' }),
    A('pdtChou', 'Pomme de terre et chou', 'potato', 'cabbage', 'r', { why: 'Leurs besoins se complètent.' }),
    A('pdtMais', 'Pomme de terre et maïs', 'potato', 'corn', 'r', { why: 'Le maïs abrite la pomme de terre du vent.' }),
    A('linPdt', 'Lin et pomme de terre', 'flax', 'potato', 'n', { why: 'Le lin éloigne le doryphore.' }),
    A('moutardeChou', 'Moutarde et chou', 'mustard', 'cabbage', 'n', { why: 'La moutarde attire les altises loin du chou.' }),
    A('melonMais', 'Melon et maïs', 'melon', 'corn', 'r', { why: 'Le maïs garde le melon au chaud et à l’abri.' }),
    // ---------- les mauvaises ----------
    A('ailLegumineuses', 'Alliacées et légumineuses', FAMILY.all, FAMILY.leg, 'mp', {
        why: 'L’ail, l’oignon et le poireau freinent les pois et les haricots.',
    }),
    A('pdtTomate', 'Pomme de terre et tomate', 'potato', 'tomato', 'mn', { why: 'Même famille, mêmes maladies : le mildiou passe de l’une à l’autre.' }),
    A('chouFraise', 'Chou et fraise', 'cabbage', 'strawberry', 'mq', { why: 'Le chou appauvrit la terre des fraisiers.' }),
    A('tournesolPdt', 'Tournesol et pomme de terre', 'sunflower', 'potato', 'mp', { why: 'Le tournesol gêne la croissance de la pomme de terre.' }),
    A('tomateMais', 'Tomate et maïs', 'tomato', 'corn', 'mn', { why: 'Ils partagent le même ravageur, la noctuelle.' }),
    A('pdtCourges', 'Pomme de terre et courges', 'potato', ['cucumber', 'pumpkin'], 'mn', { why: 'Elles attirent les mêmes maladies.' }),
    A('aspergeAlliacees', 'Asperge et alliacées', 'asparagus', ['garlic', 'onion'], 'mp', { why: 'L’ail et l’oignon freinent l’asperge.' }),
    A('haricotBetterave', 'Haricot et betterave', 'greenBean', 'beet', 'mp', { why: 'Ils se disputent la même terre.' }),
    // 1.30 : les nouvelles cultures
    A('favePdt', 'Fève et pomme de terre', 'favaBean', 'potato', 'n', { why: 'La fève éloigne le doryphore de la pomme de terre.' }),
    A('navetPois', 'Navet et petits pois', 'turnip', 'peas', 'p', { why: 'Le pois enrichit la terre, le navet n’en demande pas plus.' }),
    A('brocoliBetterave', 'Brocoli et betterave', 'broccoli', 'beet', 'q', { why: 'La betterave ne lui prend rien et couvre le sol.' }),
    A('echaloteCarotte', 'Échalote et carotte', 'shallot', 'carrot', 'n', { why: 'L’échalote chasse la mouche de la carotte.' }),
    A('butternutMais', 'Butternut et maïs', 'butternut', 'corn', 'r', { why: 'Le maïs abrite la courge, qui garde la terre fraîche.' }),
    A('chanvre', 'Le chanvre, ami de tous', 'hemp', '*', 'p', { to: 'b', why: 'Ses racines profondes ameublissent la terre de ses voisines.' }),
    A('faveEchalote', 'Fève et échalote', 'favaBean', 'shallot', 'mp', { why: 'L’échalote freine la fève.' }),
    // 1.48 : les cultures de l'oasis
    A('sesameCumin', 'Sésame et cumin', 'sesame', 'cumin', 'q', { why: 'Le sésame, haut et clair, garde le cumin à l’abri du vent de sable.' }),
    A('coriandreSesame', 'Coriandre et sésame', 'coriander', 'sesame', 'r', { why: 'Les fleurs de coriandre attirent les abeilles sur le sésame.' }),
    A('cuminCoriandre', 'Cumin et coriandre', 'cumin', 'coriander', 'mq', { why: 'Deux cousines de la même famille : elles s’échangent leurs maladies.' }),
    // 1.51 : les cultures du Grand Nord
    A('seigleAirelle', 'Seigle et airelle', 'rye', 'lingonberry', 'q', { why: 'Le seigle, haut et serré, coupe le vent glacé qui brûle l’airelle.' }),
    A('chicoutaiAirelle', 'Chicoutai et airelle', 'cloudberry', 'lingonberry', 'r', {
        why: 'Dans la tourbière, elles poussent côte à côte et se tiennent chaud.',
    }),
    A('seigleChicoutai', 'Seigle et chicoutai', 'rye', 'cloudberry', 'mp', { why: 'Le seigle étouffe la petite plante basse du chicoutai.' }),
];
export const ASSOC = Object.fromEntries(ASSOCS.map(a => [a.id, a]));
export const isBad = a => a.fx[0] === 'm';
// la force des effets (par association) et leurs plafonds par parcelle
export const COMP_FX = {
    p: { speed: 0.15 },
    q: { quality: 0.12 },
    r: { extra: 0.1 },
    n: { pest: 0.5 },
    t: { extra: 0.25, quality: 0.06 },
    mp: { speed: -0.1 },
    mq: { quality: -0.08 },
    mn: { pest: 1.5 },
};
export const COMP_CAP = { speed: [-0.2, 0.3], quality: [-0.16, 0.2], extra: [0, 0.25], pest: [0.3, 2] };
export const FX_TEXT = {
    p: 'pousse +15 %',
    q: 'qualité +12',
    r: 'récolte +10 %',
    n: 'nuisibles −50 %',
    t: 'récolte +25 % et qualité +6 quand les trois se touchent',
    mp: 'pousse −10 %',
    mq: 'qualité −8',
    mn: 'pucerons et corbeaux ×1,5',
};
// le carnet : récompenses selon le nombre d'associations découvertes
export const COMP_TIERS = [
    { n: 5, coins: 2000, fert: 5 },
    { n: 10, coins: 6000, fert: 10, seeds: 4 },
    { n: 20, coins: 20000, fert: 15, seeds: 6 },
    { n: 30, coins: 50000, fert: 20, seeds: 8 },
    { n: ASSOCS.length, coins: 100000, ruban: 1 },
];
// le conseil de Mamie : un défi par jour
export const MAMIE = { need: [4, 8], coins: lvl => 400 + lvl * 80, xp: lvl => 60 + lvl * 6, seeds: 3, fertChance: 0.35 };
