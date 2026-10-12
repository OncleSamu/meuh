// Outils DOM : sélection, mises à jour sans clignotement, blocs à clé et actions déléguées.
export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
export const byId = id => document.getElementById(id);

// échappe un texte choisi par le joueur (noms d'animaux, du chien…)
export const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// remplace le contenu seulement s'il a changé : pas de clignotement, le défilement et les animations restent
export function patch(el, html) {
    if (!el || el._html === html) return false;
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
export const hasAction = name => !!ACTIONS[name];

export function run(name, el, data = {}) {
    const fn = ACTIONS[name];
    if (!fn) return console.warn('action inconnue', name);
    const r = fn(el, data);
    after(name, r);
    return r;
}

export function setupActions() {
    document.addEventListener('click', e => {
        const el = e.target.closest('[data-act]');
        if (!el || el.disabled || el.getAttribute('aria-disabled') === 'true') return;
        e.preventDefault();
        run(el.dataset.act, el, el.dataset);
    });
    // les curseurs et cases : data-input="nom"
    document.addEventListener('input', e => {
        const el = e.target.closest('[data-input]');
        if (el) run(el.dataset.input, el, { ...el.dataset, value: el.value });
    });
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
