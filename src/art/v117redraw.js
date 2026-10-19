// 1.17 : les kakis séchés et les lardons redessinés.
import { E, F, FC, FE, HL, L, P, R, SHADOW, items } from './kit.js';
import { woodBoard } from './items2.js';

// ---------------- kakis séchés : trois hoshigaki pendus à la ficelle ----------------
const KAKI = '#c4601e';
const KAKI_D = '#9a4616';
// un kaki qui sèche : rond un peu aplati, ridé, avec son chapeau de feuilles et une pointe de sucre blanc
function hoshi(x, y, s) {
    const g = (d, f, w) => P(d, f, w);
    return (
        `<g transform="translate(${x} ${y}) scale(${s})">` +
        L('M0 -22 L0 -15', 3.4) +
        L('M0 -22 L0 -15', 1.6, '#d9b878') +
        // le corps, ridé et plus étroit en bas
        g('M-10.5 -4 Q-11 -14 0 -15 Q11 -14 10.5 -4 Q11 8 4 13 Q0 15 -4 13 Q-11 8 -10.5 -4Z', KAKI, 2.3) +
        F('M-10.5 -4 Q-11 -14 0 -15 Q11 -14 10.5 -4 Q9 -9 0 -9 Q-9 -9 -10.5 -4Z', '#e0842e', 0.55) +
        L('M-6 -6 Q-4 0 -5 8 M0 -7 Q1 1 0 11 M6 -6 Q4 1 5 8', 1.3, KAKI_D) +
        FC(-4, 3, 1.1, '#fff4dc', 0.8) +
        FC(3, 6, 1, '#fff4dc', 0.7) +
        FC(6, -2, 0.9, '#fff4dc', 0.7) +
        HL(-6.5, -9, 2.6, 1.3, -30, 0.7) +
        // le chapeau
        g('M-8 -14 Q-4 -19 0 -16 Q4 -19 8 -14 Q4 -12 0 -13 Q-4 -12 -8 -14Z', '#6f9a3a', 1.9) +
        F('M-5 -15 Q-2 -17 0 -15', '#a8cf62', 0.8) +
        `</g>`
    );
}
items.driedKaki = () =>
    SHADOW(32, 61, 22, 2.2) +
    // la barre de séchage et ses deux cordes
    R(4, 6, 56, 5, 2, '#a8693a', 2.2) +
    FE(30, 7.6, 20, 0.9, '#fff', 0.5) +
    hoshi(13, 30, 0.82) +
    hoshi(32, 38, 0.92) +
    hoshi(51, 30, 0.82);

// ---------------- lardons : un tas de petits bâtonnets rayés sur une planche ----------------
const PINK = '#e07a6c';
const PINK_D = '#c8574c';
const FAT = '#f8e8d2';
function lardon(x, y, rot, w = 13) {
    const h = 5.6;
    return (
        `<g transform="translate(${x} ${y}) rotate(${rot})">` +
        R(-w / 2, -h / 2, w, h, 1.4, PINK, 1.8) +
        F(`M${-w / 2 + 0.6} ${-h / 2 + 1.6} L${w / 2 - 0.6} ${-h / 2 + 1.6} L${w / 2 - 0.6} ${-h / 2 + 3} L${-w / 2 + 0.6} ${-h / 2 + 3}Z`, FAT, 0.95) +
        F(`M${-w / 2 + 0.6} ${h / 2 - 1} L${w / 2 - 0.6} ${h / 2 - 1} L${w / 2 - 0.6} ${h / 2 - 0.2} L${-w / 2 + 0.6} ${h / 2 - 0.2}Z`, PINK_D, 0.9) +
        FE(-w / 4, -h / 2 + 0.9, 2.2, 0.5, '#fff', 0.7) +
        `</g>`
    );
}
items.lardons = () =>
    woodBoard() +
    lardon(20, 41, -14) +
    lardon(36, 43, 8) +
    lardon(46, 39, -22, 12) +
    lardon(14, 33, 12, 12) +
    lardon(28, 34, -6) +
    lardon(42, 31, 14, 12) +
    lardon(24, 25, 20, 11) +
    lardon(36, 23, -10, 12) +
    lardon(48, 24, 18, 10);
