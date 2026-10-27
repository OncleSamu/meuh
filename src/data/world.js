// Le temps qui passe : heures, saisons, météo, fêtes de saison et fêtes de l'année, cadeau du jour.
// Valeurs reprises telles quelles de la version 6.2 (même équilibre).

export const GAME_MIN_PER_SEC = 5;

// les fêtes de saison (Pâques, Halloween, Noël) commencent à ce niveau
export const HOLIDAY_LVL = 3;

export const DAYS_PER_SEASON = 12;

export const FETE_START = 4;

export const FETE_END = 7;

export const SEASONS = [
    {
        id: 'printemps',
        name: 'Printemps',
        icon: 's_spring',
    },
    {
        id: 'ete',
        name: 'Été',
        icon: 's_summer',
    },
    {
        id: 'automne',
        name: 'Automne',
        icon: 's_autumn',
    },
    {
        id: 'hiver',
        name: 'Hiver',
        icon: 's_winter',
    },
];

export const SKY = [
    [0, '#0b1033', '#2a2160'],
    [4.5, '#141a4a', '#3a2c6e'],
    [6, '#f08a6a', '#ffd3a1'],
    [8, '#7cc8f0', '#cdeffd'],
    [17, '#7cc8f0', '#d6f2ff'],
    [19, '#f46b45', '#fbc27a'],
    [20.5, '#2a2160', '#5a3f7a'],
    [24, '#0b1033', '#2a2160'],
];

export const WEATHER = {
    sun: {
        name: 'Ensoleillé',
        icon: 'w_sun',
        crop: 1.1,
        gray: 0,
        desc: 'Les cultures poussent 10 % plus vite.',
    },
    cloudy: {
        name: 'Éclaircies',
        icon: 'w_cloudy',
        crop: 1,
        gray: 0.12,
        desc: 'Un temps calme, rien de spécial.',
    },
    cloud: {
        name: 'Couvert',
        icon: 'w_cloud',
        crop: 0.95,
        gray: 0.35,
        desc: 'Les cultures poussent un peu moins vite.',
    },
    rain: {
        name: 'Pluie',
        icon: 'w_rain',
        crop: 1,
        gray: 0.45,
        waters: true,
        desc: 'La pluie arrose toutes les parcelles à votre place.',
    },
    storm: {
        name: 'Orage',
        icon: 'w_storm',
        crop: 1.2,
        gray: 0.62,
        waters: true,
        desc: 'Tout est arrosé et la pousse est boostée de 20 %, mais la foudre peut brûler une culture : un paratonnerre protège tout le champ.',
    },
    snow: {
        name: 'Neige',
        icon: 'w_snow',
        crop: 0.8,
        gray: 0.3,
        desc: 'Les cultures poussent 20 % moins vite.',
    },
    heat: {
        name: 'Canicule',
        icon: 'w_heat',
        crop: 1.15,
        gray: -0.1,
        dries: true,
        desc: 'Pousse +15 %, mais la terre sèche deux fois plus vite : arrosez souvent, ou laissez faire un puits.',
    },
    rainbow: {
        name: 'Arc-en-ciel',
        icon: 'w_rainbow',
        crop: 1.1,
        gray: -0.05,
        desc: 'Les récoltes dorées sont trois fois plus fréquentes, et la qualité or deux fois plus.',
    },
};

export const WEATHER_ODDS = {
    printemps: {
        sun: 30,
        cloudy: 25,
        cloud: 10,
        rain: 30,
        storm: 5,
        rainbow: 5,
    },
    ete: {
        sun: 40,
        cloudy: 15,
        rain: 12,
        storm: 15,
        heat: 18,
        rainbow: 4,
    },
    automne: {
        sun: 15,
        cloudy: 25,
        cloud: 20,
        rain: 30,
        storm: 10,
        rainbow: 4,
    },
    hiver: {
        sun: 15,
        cloudy: 15,
        cloud: 25,
        snow: 45,
    },
};

export const EVENTS = {
    printemps: {
        name: 'Chasse aux œufs',
        icon: ['item', 'paintedEgg'],
        effect: 'Des œufs décorés se cachent dans le champ : touchez-les avant qu’ils ne disparaissent.',
    },
    ete: {
        name: 'Fête de l’été',
        icon: ['ui', 's_summer'],
        effect: 'Le marché est en fête : toutes les ventes rapportent 25 % de plus.',
    },
    automne: {
        name: 'Foire d’automne',
        icon: ['ui', 'trophy'],
        effect: 'Le concours récompense les récoltes de qualité or : présentez vos plus belles.',
    },
    hiver: {
        name: 'Marché de Noël',
        icon: ['ui', 's_winter'],
        effect: 'Les trains de marchandises paient 30 % de plus pendant la fête.',
    },
};

export const HOLIDAYS = {
    halloween: {
        name: 'Halloween',
        icon: ['ui', 'jackLantern'],
        from: [10, 24],
        to: [11, 2],
        recipe: 'witchCandy',
        goal: {
            pumpkin: 30,
            witchCandy: 6,
            honey: 8,
        },
        deco: 'jackLantern',
        text: 'Citrouilles, bonbons et chauves-souris : remplissez le chaudron de la sorcière du village !',
    },
    noel: {
        name: 'Noël',
        icon: ['ui', 'xmasTree'],
        from: [12, 15],
        to: [1, 1],
        recipe: 'buche',
        goal: {
            buche: 5,
            cookies: 20,
            wool: 20,
        },
        deco: 'xmasTree',
        text: 'Le village prépare le réveillon : une bûche, des biscuits et de la laine pour les cadeaux.',
    },
    paques: {
        name: 'Pâques',
        icon: ['ui', 'easterBunny'],
        easter: [-4, 3],
        recipe: 'sugarEggs',
        goal: {
            sugarEggs: 6,
            egg: 40,
            carrot: 40,
        },
        deco: 'easterBunny',
        text: 'Le lapin de Pâques a besoin d’aide pour remplir son panier : œufs, carottes et œufs en sucre.',
    },
};

export const DAILY_REWARDS = [
    {
        coins: 50,
        feed: 5,
    },
    {
        coins: 100,
        feed: 5,
    },
    {
        coins: 150,
        seeds: ['carrot', 5],
    },
    {
        coins: 250,
        feed: 10,
    },
    {
        coins: 400,
        seeds: ['tomato', 5],
    },
    {
        coins: 600,
        feed: 15,
    },
    {
        coins: 1000,
        seeds: ['apple', 1],
    },
];

export const WEEK_MS = 604800000;
