// Confirmation par double appui : le premier appui change le libellé, le second valide (dans les 3 s).
import { emit } from '../core/bus.js';

let armed = null,
    timer = null;
export function confirmTap(key, btn, label) {
    if (armed === key) {
        armed = null;
        clearTimeout(timer);
        return true;
    }
    const restore = btn.innerHTML;
    armed = key;
    btn.innerHTML = `<span>${label}</span>`;
    btn.classList.add('armed');
    emit('sfx', 'error');
    clearTimeout(timer);
    timer = setTimeout(() => {
        if (armed === key) {
            armed = null;
            if (btn.isConnected) {
                btn.innerHTML = restore;
                btn.classList.remove('armed');
            }
        }
    }, 3000);
    return false;
}
// tant qu'une confirmation attend, l'interface ne redessine pas ce bouton
export const isArmed = () => armed !== null;
