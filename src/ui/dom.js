// Outils DOM : sélection, mises à jour sans clignotement, blocs à clé et actions déléguées.
export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
export const byId = id => document.getElementById(id);

// échappe un texte choisi par le joueur (noms d'animaux, du chien…)
export const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// remplace le contenu seulement s'il a changé : pas de clignotement, le défilement et les animations restent
export function patch(el, html) {
    if (!el || el._html === html) return false;
    // on ne remplace pas une zone où le joueur est en train d'écrire ou de glisser un curseur
    const a = document.activeElement;
    if (a && /^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName) && el.contains(a)) return false;
    el.innerHTML = html;
    el._html = html;
    return true;
}

// Blocs à clé : list = [[clé, html, classe?], …]. Chaque bloc garde son élément tant que sa clé reste ;
// seul le bloc dont le contenu change est redessiné.
export function blocks(container, list) {
    if (!container) return;
    const old = new Map([...container.children].map(el => [el.dataset.key, el]));
    let prev = null;
    for (const [key, html, cls] of list) {
        if (!html) continue;
        let el = old.get(key);
        if (!el) {
            el = document.createElement('div');
            el.dataset.key = key;
        }
        old.delete(key);
        const c = 'block ' + (cls || '');
        if (el.className !== c) el.className = c;
        patch(el, html);
        const want = prev ? prev.nextSibling : container.firstChild;
        if (want !== el) container.insertBefore(el, want);
        prev = el;
    }
    old.forEach(el => el.remove());
}

// ---------------- actions ----------------
// Un bouton porte data-act="nom" (et ses données en data-*) : un seul écouteur pour tout le jeu.
const ACTIONS = {};
let after = () => {};
export const action = (name, fn) => (ACTIONS[name] = fn);
export const actions = map => Object.assign(ACTIONS, map);
export const afterAction = fn => (after = fn);

// une action qui renvoie QUIET ne redessine rien (un curseur qu'on fait glisser, par exemple)
export const QUIET = Symbol('quiet');
export function run(name, el, data = {}) {
    const fn = ACTIONS[name];
    if (!fn) return console.warn('action inconnue', name);
    const r = fn(el, data);
    if (r !== QUIET) after(name, r);
    return r;
}

export function setupActions() {
    document.addEventListener('click', e => {
        const el = e.target.closest('[data-act]');
        if (!el || el.disabled || el.getAttribute('aria-disabled') === 'true') return;
        // 1.59 : un second appui sur une fenêtre qui se ferme ne fait plus rien (ses options n'existent plus)
        if (el.closest('.sheet-wrap.out')) return e.preventDefault();
        e.preventDefault();
        run(el.dataset.act, el, el.dataset);
    });
    // Accessibilité clavier : Entrée ou Espace active les éléments interactifs role="button"
    document.addEventListener('keydown', e => {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        const el = e.target.closest('[role="button"][data-act]');
        if (!el || el.tagName === 'BUTTON' || el.tagName === 'A' || el.getAttribute('aria-disabled') === 'true') return;
        e.preventDefault();
        run(el.dataset.act, el, el.dataset);
    });
    // les curseurs et cases : data-input="nom"
    document.addEventListener('input', e => {
        const el = e.target.closest('[data-input]');
        if (el) run(el.dataset.input, el, { ...el.dataset, value: el.value });
    });

    // 1.185 : sur PC, toutes les bandes horizontales défilent à la molette et au cliquer-glisser souris
    const findHScroll = node => {
        let el = node instanceof Element ? node : node && node.parentElement;
        while (el && el !== document.body && el !== document.documentElement) {
            if (el.scrollWidth > el.clientWidth + 2 && el.scrollHeight <= el.clientHeight + 4) {
                const ox = getComputedStyle(el).overflowX;
                if (ox === 'auto' || ox === 'scroll') return el;
            }
            el = el.parentElement;
        }
        return null;
    };
    document.addEventListener(
        'wheel',
        e => {
            if (!e.deltaY || Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
            const sc = findHScroll(e.target);
            if (!sc) return;
            const max = sc.scrollWidth - sc.clientWidth;
            if ((e.deltaY > 0 && sc.scrollLeft < max - 1) || (e.deltaY < 0 && sc.scrollLeft > 1)) {
                sc.scrollLeft += e.deltaY;
                e.preventDefault();
            }
        },
        { passive: false },
    );
    let drag = null,
        suppressClick = 0;
    document.addEventListener('pointerdown', e => {
        if (e.pointerType !== 'mouse' || e.button !== 0) return;
        const sc = findHScroll(e.target);
        if (!sc) return;
        drag = { sc, x: e.clientX, sl: sc.scrollLeft, moved: false };
    });
    document.addEventListener('pointermove', e => {
        if (!drag) return;
        const dx = e.clientX - drag.x;
        if (!drag.moved && Math.abs(dx) > 5) {
            drag.moved = true;
            drag.sc.classList.add('h-dragging');
        }
        if (drag.moved) {
            drag.sc.scrollLeft = drag.sl - dx;
            e.preventDefault();
        }
    });
    const endDrag = () => {
        if (!drag) return;
        if (drag.moved) {
            drag.sc.classList.remove('h-dragging');
            suppressClick = Date.now() + 80;
        }
        drag = null;
    };
    document.addEventListener('pointerup', endDrag);
    document.addEventListener('pointercancel', endDrag);
    document.addEventListener(
        'click',
        e => {
            if (Date.now() < suppressClick) {
                e.preventDefault();
                e.stopImmediatePropagation();
            }
        },
        true,
    );
}

// centre d'un élément, ou d'un repère nommé (data-anchor)
export function anchorEl(at) {
    if (!at) return null;
    if (at instanceof Element) return at.isConnected ? at : null;
    if (at.anchor) return document.querySelector(`[data-anchor="${at.anchor}"]`);
    return null;
}
export function centerOf(at) {
    const el = anchorEl(at);
    if (!el) return { x: innerWidth / 2, y: innerHeight / 2 };
    const r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
}
