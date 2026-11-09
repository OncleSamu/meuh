// 1.100 (étape 2) : les résidents du camping. Un campeur ravi peut demander à s'installer dans une cabane :
// il a un métier, trois produits qu'il aime, un produit adoré, des cœurs à faire grandir et des histoires tirées au hasard.
// Aucun bonus de jeu : seulement de l'affection et du plaisir.
export const RESIDENTS = {
    max: 12,
    askChance: 0.3, // un campeur ravi demande à rester une fois sur trois
    maxAsks: 3, // demandes en attente
    cabin: n => 100000 * n, // la cabane du n-ième résident
    hearts: [4, 12, 25, 42, 65], // points d'amitié cumulés pour 1 à 5 cœurs, comme les villageois
    gift: { like: 3, love: 8, other: 1, cool: 6 * 3600000 }, // points ; un cadeau toutes les 6 h
    order: { pay: 1.6, pts: 2, wait: 4 * 3600000, qty: 3 },
    xp: 100,
    stories: [2, 4, 5], // cœurs qui débloquent une histoire
    seen: 3, // cœurs à partir desquels le produit adoré se révèle
    friend: 5, // cœurs d'un « ami » de la vallée
};
export const JOBS = {
    hiker: [['guide de randonnée', 'guide de randonnée'], ['cartographe', 'cartographe']],
    family: [['instituteur', 'institutrice'], ['fleuriste', 'fleuriste']],
    gourmet: [['boulanger', 'boulangère'], ['fromager', 'fromagère']],
    fisher: [['pêcheur', 'pêcheuse'], ['poissonnier', 'poissonnière']],
    artist: [['potier', 'potière'], ['peintre', 'peintre']],
    couple: [['aubergiste', 'aubergiste'], ['couturier', 'couturière']],
};
// Les histoires : une par palier de cœurs, assemblées au hasard. {n} prénom, {from} origine, {job} métier,
// {loved} le produit adoré, {like} un produit aimé, {Il}/{il} pronom.
export const STORY_LINES = [
    [
        '{n} a quitté {from} un matin sans prévenir personne. « J’avais besoin de voir autre chose que mes murs », dit {il}.',
        '{Il} a longtemps travaillé comme {job}, mais plus personne ne venait. « Alors j’ai pris la route, et la route m’a amené ici. »',
        'Chez {n}, on se souvient encore de la maison {from}, et de son odeur de pain chaud et de feu de bois.',
        '{n} confie n’avoir prévu qu’une nuit : « et puis il y a eu {like}, et je suis resté ».',
        '« Je ne sais pas ce qui m’a retenu », sourit {n}. « Peut-être le silence, peut-être {like}. »',
        'Avant le camping, {n} comptait ses jours. Ici, {il} les passe à regarder les nuages.',
    ],
    [
        'Un soir, {n} a perdu son chemin dans les champs. C’est {loved} qui l’a sauvé : l’odeur l’a mené droit à la ferme.',
        '{n} raconte qu’au pays, on dit que {loved} porte chance. « Ici, je crois que c’est vrai. »',
        'Un voisin a demandé à {n} de réparer sa clôture. {Il} a tout réparé, puis a tout repeint, « parce que le vert n’allait pas ».',
        '{n} a organisé une soirée sous les étoiles : tout le camping est venu, et personne n’a voulu rentrer.',
        'En réparant sa cabane, {n} a trouvé une vieille lettre glissée dans le mur. {Il} refuse de dire ce qu’elle contenait.',
        '« Mon plus beau souvenir ? » {n} réfléchit. « Une table dehors, {loved}, et tout le monde qui rit. »',
    ],
    [
        '{n} rêve d’ouvrir une petite boutique de {job} au village, « avec {loved} en vitrine, bien sûr ».',
        '« Je ne repartirai pas », dit {n} en regardant la vallée. « J’ai trouvé ma place, et {loved} y est pour beaucoup. »',
        '{n} a écrit à sa famille {from} : « Venez voir, il y a de la place pour tout le monde. »',
        '{n} veut planter un petit jardin devant sa cabane, « pour qu’un jour {loved} pousse à ma porte ».',
        'Au village, on dit déjà que {n} a toujours habité là. {Il} n’a pas démenti.',
        '« Merci de m’avoir laissé rester », glisse {n}. « Je vous dois bien un {loved}. »',
    ],
];
// une touche selon le profil, ajoutée à chaque histoire
export const STORY_FLAVOR = {
    hiker: ['{Il} connaît tous les sentiers de la vallée par cœur.', '{Il} marche chaque matin avant le lever du soleil.'],
    family: ['{Il} aime que les enfants du camping viennent jouer devant sa cabane.', '{Il} garde toujours un goûter pour les petits.'],
    gourmet: ['{Il} goûte tout avec l’air grave d’un juré.', '{Il} tient un petit carnet de ses meilleurs repas.'],
    fisher: ['{Il} passe ses soirées au bord de l’eau, canne en main.', '{Il} jure avoir attrapé « le plus gros poisson de la vallée ».'],
    artist: ['{Il} dessine un peu partout : sur les nappes, sur les murs, sur les mains.', '{Il} sifflote en peignant, toujours la même chanson.'],
    couple: ['{Il} et sa moitié s’endorment toujours en regardant le feu.', '{Il} n’a jamais le dernier mot, et ça lui va très bien.'],
};
