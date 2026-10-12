// L'horloge du jeu. Tout le code passe par now() : le robot et les tests peuvent avancer le temps.
let source = () => Date.now();

export const now = () => source();
export const setClock = fn => (source = fn);
// la date du téléphone (fêtes de l'année, heure de la grande vente)
export const today = () => new Date(now());
