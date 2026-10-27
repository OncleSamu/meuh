// 1.57 : la typographie française. Un « ? », « ! », « : » ou « ; » ne doit jamais tomber seul en début de ligne :
// on colle l'espace qui précède (insécable), ainsi que celles des guillemets « ». Les textes du jeu gardent des espaces simples,
// l'interface les corrige au moment de l'affichage (texte ajouté ou modifié), sans toucher aux champs de saisie.
const NB = '\u00a0';
const RE = /([^\s\u00a0]) ([?!:;»])/g;
const RE_OPEN = /(«) /g;
// 1.59 : une durée ne se coupe jamais en fin de ligne (« 1 h 11 », « 49 min 09 », « 5 j 7 h »)
const RE_DUR = /(\d) (h|min|s|j|ms)(?= |$|[^\p{L}])/gu;
const RE_DUR2 = /(\d\u00a0(?:h|min|j)) (\d)/g;
// « 1 / 3 », « 40 / 40 » : un compte ne se coupe pas
const RE_FRAC = /(\d) \/ (\d)/g;
// un grand nombre se lit par groupes de trois chiffres (« 13 113 », « 1 299 138 »)
const RE_BIG = /(^|[^\p{L}\d,.\u202f])(\d{5,})(?![\d,.])/gu;
// 1.59 : l'apostrophe typographique, même dans les textes gardés par une vieille sauvegarde (« L'école »)
const RE_APOS = /([A-Za-zÀ-ÿœŒ])'(?=[A-Za-zÀ-ÿœŒ])/g;

export function frenchSpaces(s) {
    const t = String(s);
    const a0 = t.includes("'") ? t.replace(RE_APOS, '$1’') : t;
    const a = /\d{5}/.test(a0) ? a0.replace(RE_BIG, (m, p, n) => p + Number(n).toLocaleString('fr-FR')) : a0;
    if (!a.includes(' ')) return a;
    return a
        .replace(RE, `$1${NB}$2`)
        .replace(RE_OPEN, `$1${NB}`)
        .replace(RE, `$1${NB}$2`)
        .replace(RE_DUR, `$1${NB}$2`)
        .replace(RE_DUR2, `$1${NB}$2`)
        .replace(RE_FRAC, `$1${NB}/${NB}$2`);
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
