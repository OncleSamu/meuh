// 1.19 : Armand, le chef du Grand Hôtel (il achète le produit phare en énorme quantité).
import { C, FC, L, P, R, people } from '../kit.js';
import { bust, face } from '../people.js';

people.armand = () =>
    bust(
        '#ffffff',
        // la veste croisée : deux rangées de boutons dorés, un liseré rouge, un foulard noué
        L('M32 47 L32 66', 1.6, '#d9d2c2') +
            P('M23 46 L32 52 L41 46 L38 43.5 L26 43.5Z', '#c8263a', 2) +
            [51, 56, 61].map(y => FC(26, y, 1.5, '#e8b83a') + FC(38, y, 1.5, '#e8b83a')).join(''),
    ) +
    face() +
    // les favoris gris et la moustache en croc
    P('M17 30 C16 25 19 22 21 23 L21 31Z', '#b9b9b9', 1.6) +
    P('M47 30 C48 25 45 22 43 23 L43 31Z', '#b9b9b9', 1.6) +
    P('M22 38 C25 34 29 35 32 37 C35 35 39 34 42 38 C40 42 36 40 32 39.5 C28 40 24 42 22 38Z', '#8a8a92', 1.7) +
    L('M22 38 Q18.5 38.5 19.5 34.5 M42 38 Q45.5 38.5 44.5 34.5', 1.5) +
    // le monocle et sa chaîne dorée
    C(37, 30, 4.6, 'none', 1.8) +
    L('M41.4 31.5 Q45 36 43 44', 1.1, '#e8b83a') +
    // la toque haute, bandeau rouge et or (calée dans le viewBox 0..64)
    R(19, 15, 26, 7, 2, '#ffffff') +
    R(19, 19, 26, 2.4, 0, '#c8263a', 1.2) +
    P('M19 16 C12 14 13 3 22 5 C24 1 40 1 42 5 C51 3 52 14 45 16Z', '#ffffff') +
    L('M26 14 Q26 7 25 4 M32 14 Q32 6 32 2.5 M38 14 Q38 7 39 4', 1.1, '#e4dccb');
