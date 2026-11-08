// 1.100 (étape 4) : la fête de la vallée, le dernier chapitre. Quatre buts à atteindre au camping et à la Maison, une grande
// table à dresser, puis la fête, le bilan de toute la partie et le générique (qui restent à lire quand on veut).
export const FETE = {
    cost: { coins: 3000000, plank: 100, tools: 10 },
    goals: [
        { id: 'guests', name: 'Accueillir des campeurs', need: 25, stat: 'campGuests' },
        { id: 'happy', name: 'Renvoyer des campeurs ravis', need: 10, stat: 'campHappy' },
        { id: 'res', name: 'Installer des résidents', need: 5, stat: 'campResidents' },
        { id: 'friend', name: 'Un résident à dix cœurs', need: 1, stat: 'campFriends' },
        { id: 'maison', name: 'Vendre des coffrets de la Maison', need: 10, stat: 'coffretsSold' },
    ],
    title: 'La fête de la vallée',
    scene: [
        'Le soir tombe sur la vallée. Les lanternes s’allument une à une, du village jusqu’au camping.',
        'Une longue table traverse le terrain : les voisins, les résidents, les campeurs de passage, tout le monde est là.',
        'Mamie Odette lève son verre : « À cette ferme, et à tous ceux qu’elle a rassemblés. »',
    ],
};
