// Les histoires de Mamie Odette (1.2) : une anecdote par recette, lue dans la fiche du Grand livre (1.18.1)
// une fois la maîtrise bronze (une étoile) atteinte. Le carnet à part, ses pages et ses récompenses ont disparu en 1.18.1.
import { masteryStars } from './mastery.js';

export const carnetOpen = id => masteryStars(id) >= 1;
