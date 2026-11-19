// 1.109 : 80 niveaux. Les nouveautés des niveaux 30 à 64 sont étirées sur 30 à 80 : chaque ancien niveau devient un, deux
// ou trois niveaux (WIDTH), selon ce qu'il ouvrait. Rien ne change avant le niveau 30.
// lv80(ancien) : le nouveau niveau où s'ouvre ce qui s'ouvrait à « ancien » (une machine, un lieu, un chapitre).
// oldLvl(nouveau) : l'ancien niveau équivalent (avec décimales), pour garder l'économie telle qu'elle était réglée.
export const MAX_OLD = 64;
// Les largeurs suivent le nombre de recettes de chaque ancien niveau (environ 13 recettes par nouveau niveau).
export const WIDTH = {
    30: 1, 31: 1, 32: 1, 33: 2, 34: 1, 35: 1, 36: 2, 37: 1, 38: 1, 39: 2, 40: 1, 41: 1, 42: 2, 43: 1, 44: 1, 45: 1, 46: 2,
    47: 1, 48: 1, 49: 2, 50: 1, 51: 2, 52: 1, 53: 2, 54: 1, 55: 2, 56: 1, 57: 2, 58: 2, 59: 2, 60: 1, 61: 2, 62: 2, 63: 2, 64: 2,
}; // prettier-ignore
const LO = {};
{
    let lo = 30;
    for (let l = 30; l <= MAX_OLD; l++) {
        LO[l] = lo;
        lo += WIDTH[l];
    }
}
export const MAX_NEW = LO[MAX_OLD] + WIDTH[MAX_OLD] - 1; // 80
export const lv80 = l => (l <= 30 ? l : l > MAX_OLD ? MAX_NEW : LO[l]);
// le dernier nouveau niveau d'un ancien niveau
export const lv80Hi = l => (l < 30 ? l : l >= MAX_OLD ? MAX_NEW : LO[l] + WIDTH[l] - 1);
export function oldLvl(n) {
    if (n <= 30) return n;
    if (n >= MAX_NEW) return MAX_OLD;
    let l = 30;
    while (l < MAX_OLD && LO[l + 1] <= n) l++;
    return l + (n - LO[l]) / WIDTH[l];
}
