// 1.57 : la typographie française. Un « ? », « ! », « : » ou « ; » ne doit jamais tomber seul en début de ligne :
// on colle l'espace qui précède (insécable), ainsi que celles des guillemets « ». Les textes du jeu gardent des espaces simples,
// l'interface les corrige au moment de l'affichage (texte ajouté ou modifié), sans toucher aux champs de saisie.
const NB = '\u00a0';
const RE = /([^\s\u00a0]) ([?!:;»])/g;
const RE_OPEN = /(«) /g;

export function frenchSpaces(s) {
    const t = String(s);
    if (!t.includes(' ')) return t;
    return t.replace(RE, `$1${NB}$2`).replace(RE_OPEN, `$1${NB}`).replace(RE, `$1${NB}$2`);
}

const SKIP = new Set(['SCRIPT', 'STYLE', 'TEXTAREA', 'INPUT']);

function fixNode(root) {
    if (!root) return;
    if (root.nodeType === 3) {
        const v = root.nodeValue,
            f = frenchSpaces(v);
        if (f !== v) root.nodeValue = f;
        return;
    }
    if (root.nodeType !== 1 || SKIP.has(root.tagName)) return;
    const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
        acceptNode: n => (n.parentNode && SKIP.has(n.parentNode.tagName) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT),
    });
    let n;
    while ((n = w.nextNode())) {
        const f = frenchSpaces(n.nodeValue);
        if (f !== n.nodeValue) n.nodeValue = f;
    }
}

export function setupTypo() {
    if (typeof MutationObserver === 'undefined' || !document.body) return;
    const pending = new Set();
    let queued = false;
    const flush = () => {
        queued = false;
        const list = [...pending];
        pending.clear();
        for (const n of list) if (n.isConnected !== false) fixNode(n);
    };
    const obs = new MutationObserver(muts => {
        for (const m of muts) {
            if (m.type === 'characterData') pending.add(m.target);
            else m.addedNodes.forEach(n => pending.add(n));
        }
        if (!queued && pending.size) {
            queued = true;
            // avant le prochain affichage : le texte corrigé est celui que l'on voit
            requestAnimationFrame(flush);
        }
    });
    obs.observe(document.body, { childList: true, subtree: true, characterData: true });
    fixNode(document.body);
}
