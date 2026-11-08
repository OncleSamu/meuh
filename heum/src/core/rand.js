// Heum — le hasard passe par ici : les tests peuvent le fixer.
let source = Math.random;
export const rnd = () => source();
export const setRand = fn => (source = fn || Math.random);
export const pick = list => list[Math.floor(rnd() * list.length)];
export const between = (a, b) => a + Math.floor(rnd() * (b - a + 1));
