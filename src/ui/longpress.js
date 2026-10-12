// Appui long : un appui court fait l'action habituelle (data-act), en restant appuyé on ouvre la fiche.
// Le « clic » qui suit un appui long est avalé : il ne doit ni agir ni refermer la fiche qui vient de s'ouvrir.
import { state } from '../core/state.js';

const LONG_MS = 450;
let swallowUntil = 0;
let installed = false;

function installSwallow() {
    if (installed) return;
    installed = true;
    document.addEventListener(
        'click',
        e => {
            if (swallowUntil > Date.now()) {
                swallowUntil = 0;
                e.stopPropagation();
                e.preventDefault();
            }
        },
        true,
    );
}

// root : l'élément qui écoute ; selector : les cibles ; onLong(el) : ce qui se passe après l'appui long
export function longPress(root, selector, onLong) {
    installSwallow();
    let timer = null,
        start = null,
        cur = null;
    const clear = () => {
        clearTimeout(timer);
        timer = null;
        if (cur) cur.classList.remove('pressing');
        cur = null;
    };
    root.addEventListener('pointerdown', e => {
        const el = e.target.closest(selector);
        if (!el || (e.pointerType === 'mouse' && e.button !== 0)) return;
        clear();
        start = [e.clientX, e.clientY];
        cur = el;
        el.classList.add('pressing');
        timer = setTimeout(() => {
            const target = cur;
            clear();
            swallowUntil = Date.now() + 900;
            if (navigator.vibrate && state.settings.haptics) navigator.vibrate(15);
            onLong(target);
        }, LONG_MS);
    });
    root.addEventListener('pointermove', e => {
        if (timer && start && Math.hypot(e.clientX - start[0], e.clientY - start[1]) > 12) clear();
    });
    ['pointerup', 'pointercancel', 'pointerleave'].forEach(t => root.addEventListener(t, clear));
    // clic droit sur ordinateur
    root.addEventListener('contextmenu', e => {
        const el = e.target.closest(selector);
        if (!el) return;
        e.preventDefault();
        clear();
        onLong(el);
    });
}
