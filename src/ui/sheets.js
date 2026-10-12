// Les fenêtres du bas (« tiroirs ») : une pile, un seul dessin, fermeture par la croix, le fond,
// Échap, un glissement vers le bas ou le bouton retour du téléphone.
import { setView } from '../core/view.js';
import { emit } from '../core/bus.js';
import { byId, patch, blocks } from './dom.js';
import { ico } from './icons.js';

const SHEETS = {};
const stack = []; // [{ name, opts, el }]
export const defineSheet = (name, def) => (SHEETS[name] = def);
export const sheetOpen = name => stack.some(s => s.name === name);
export const topSheet = () => stack[stack.length - 1] || null;
export const anySheet = () => stack.length > 0;

export function openSheet(name, opts = {}) {
    const def = SHEETS[name];
    if (!def) return console.warn('tiroir inconnu', name);
    // déjà ouvert : on le remonte avec ses nouvelles options
    const old = stack.findIndex(s => s.name === name);
    if (old >= 0) {
        const [s] = stack.splice(old, 1);
        s.opts = opts;
        stack.push(s);
        render();
        return;
    }
    const el = document.createElement('div');
    el.className = `sheet-wrap ${def.cls || ''}`;
    el.innerHTML = `<div class="sheet-back" data-act="sheetClose"></div>
        <div class="sheet" role="dialog" aria-modal="true">
            <div class="sheet-grip"><i></i></div>
            <div class="sheet-head"><div class="sheet-title"></div><button class="icon-btn close" data-act="sheetClose" aria-label="Fermer">${ico(['ui', 'cross'])}</button></div>
            <div class="sheet-body"></div>
            <div class="sheet-foot"></div>
        </div>`;
    byId('sheets').appendChild(el);
    stack.push({ name, opts, el });
    if (def.open) def.open(opts);
    grip(el);
    history.pushState({ sheet: name }, '');
    requestAnimationFrame(() => el.classList.add('in'));
    render();
    emit('sfx', 'click');
}

export function closeSheet(name) {
    const k = name ? stack.findIndex(s => s.name === name) : stack.length - 1;
    if (k < 0) return;
    const [s] = stack.splice(k, 1);
    const def = SHEETS[s.name];
    if (def.close) def.close(s.opts);
    s.el.classList.remove('in');
    s.el.classList.add('out');
    setTimeout(() => s.el.remove(), 260);
    syncFlags();
    if (history.state && history.state.sheet) {
        skipPop++;
        history.back();
    }
    emit('sheetClosed', s.name);
}
let skipPop = 0;

export const closeAll = () => {
    while (stack.length) closeSheet();
};

function syncFlags() {
    setView({ modal: stack.length > 0 });
    document.body.classList.toggle('has-sheet', stack.length > 0);
    stack.forEach((s, k) => s.el.classList.toggle('under', k < stack.length - 1));
}

// redessine les tiroirs ouverts (seul celui du dessus est visible, mais tous restent à jour)
export function render() {
    syncFlags();
    for (const s of stack) {
        const def = SHEETS[s.name];
        patch(s.el.querySelector('.sheet-title'), typeof def.title === 'function' ? def.title(s.opts) : def.title || '');
        const body = s.el.querySelector('.sheet-body');
        const content = def.render(s.opts, s);
        if (Array.isArray(content)) blocks(body, content);
        else patch(body, content);
        patch(s.el.querySelector('.sheet-foot'), def.foot ? def.foot(s.opts) : '');
        s.el.querySelector('.sheet-foot').hidden = !def.foot;
    }
}

export const sheetOpts = name => {
    const s = stack.find(x => x.name === name);
    return s ? s.opts : null;
};

// glisser la poignée vers le bas pour fermer
function grip(wrap) {
    const sheet = wrap.querySelector('.sheet'),
        handle = wrap.querySelector('.sheet-grip'),
        head = wrap.querySelector('.sheet-head');
    let y0 = null,
        dy = 0;
    const down = e => {
        y0 = e.clientY;
        dy = 0;
        sheet.style.transition = 'none';
    };
    const move = e => {
        if (y0 === null) return;
        dy = Math.max(0, e.clientY - y0);
        sheet.style.transform = `translateY(${dy}px)`;
    };
    const up = () => {
        if (y0 === null) return;
        y0 = null;
        sheet.style.transition = '';
        sheet.style.transform = '';
        if (dy > 90) closeSheet(stack.find(s => s.el === wrap)?.name);
    };
    [handle, head].forEach(h => h.addEventListener('pointerdown', down));
    window.addEventListener('pointermove', move, { passive: true });
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
}

export function setupSheets() {
    // le bouton retour du téléphone ferme le tiroir du dessus
    window.addEventListener('popstate', () => {
        if (skipPop) {
            skipPop--;
            return;
        }
        if (stack.length) {
            const [s] = stack.splice(stack.length - 1, 1);
            s.el.classList.remove('in');
            s.el.classList.add('out');
            setTimeout(() => s.el.remove(), 260);
            syncFlags();
            emit('sheetClosed', s.name);
        }
    });
}
