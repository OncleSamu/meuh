// 1.75 : le thème sombre de l'interface, fabriqué à partir des styles clairs.
// Chaque règle qui pose une couleur est recopiée sous « html.dark », couleurs transformées :
//   - les fonds clairs (papier, crème, blanc) deviennent un brun sombre de la même teinte ;
//   - le texte foncé (l'encre) devient crème ; le texte clair (sur les boutons) ne bouge pas ;
//   - les traits (bordures, ombres) restent sombres : var(--ink) y devient var(--line) ;
//   - les couleurs franches (boutons verts, dorés, rouges) gardent leur éclat.
// Le décor (ciel, collines, météo, champ, verger) n'est pas touché : il a déjà sa nuit.
import postcss from 'postcss';

const SKIP_FILES = ['10-scene.css'];
const SKIP_SEL =
    /#(sky|hills?|weather|night|sun|moon|scene)\b|\.(cloud|orb|hill|rain|snow|leaves|petals|flutter|sx|glint|pbar|soil|sprout)\b|::?(-webkit-)?scrollbar|@keyframes/;
const PROPS =
    /^(background(-color|-image)?|color|border(-(top|right|bottom|left))?(-color)?|outline(-color)?|box-shadow|text-shadow|fill|stroke|caret-color|accent-color|--)/;

const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
function toHsl(r, g, b) {
    (r /= 255), (g /= 255), (b /= 255);
    const mx = Math.max(r, g, b),
        mn = Math.min(r, g, b),
        l = (mx + mn) / 2;
    if (mx === mn) return [0, 0, l];
    const d = mx - mn,
        s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
    const h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
    return [h * 60, s, l];
}
function toRgb(h, s, l) {
    const k = n => (n + h / 30) % 12,
        a = s * Math.min(l, 1 - l);
    const f = n => l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1));
    return [f(0), f(8), f(4)].map(x => Math.round(x * 255));
}
const hex = (r, g, b) => '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');

// mode : 'bg' (fond : le clair devient sombre), 'fg' (texte : le foncé devient clair), 'line' (trait : on garde le sombre)
function mapColor(r, g, b, a, mode) {
    const [h, s, l] = toHsl(r, g, b);
    let L = l,
        S = s;
    if (mode === 'bg' && l >= 0.78) {
        L = 0.13 + (1 - l) * 0.55;
        S = Math.min(s, 0.4) * 0.8;
    } else if (mode === 'bg' && l >= 0.6 && s < 0.5) {
        L = 0.22 + (1 - l) * 0.3;
        S = s * 0.7;
    } else if (mode === 'fg' && l <= 0.35) {
        L = 0.9 - l * 0.4;
        S = Math.min(s, 0.45);
    } else if (mode === 'line' && l >= 0.85 && a < 1) {
        // les reflets blancs des ombres : un peu de lumière seulement
        return `rgba(255, 240, 210, ${(a * 0.25).toFixed(2)})`;
    } else return null;
    const [R, G, B] = toRgb(h, S, clamp(L));
    return a < 1 ? `rgba(${R}, ${G}, ${B}, ${a})` : hex(R, G, B);
}
function parseColor(c) {
    let m;
    if ((m = c.match(/^#([0-9a-f]{3,8})$/i))) {
        let x = m[1];
        if (x.length <= 4) x = [...x].map(ch => ch + ch).join('');
        const n = parseInt(x.slice(0, 6), 16);
        return [(n >> 16) & 255, (n >> 8) & 255, n & 255, x.length === 8 ? parseInt(x.slice(6), 16) / 255 : 1];
    }
    if ((m = c.match(/^rgba?\(([^)]+)\)$/i))) {
        const p = m[1]
            .split(/[\s,/]+/)
            .filter(Boolean)
            .map(Number);
        return [p[0], p[1], p[2], p.length > 3 ? p[3] : 1];
    }
    if (c === 'white') return [255, 255, 255, 1];
    return null;
}
const COLOR_RX = /#[0-9a-fA-F]{3,8}\b|rgba?\([^)]*\)|\bwhite\b/g;

function transformValue(prop, value) {
    if (/url\(/.test(value) && !/gradient/.test(value)) return null;
    // les images en ligne (dessins) ne bougent pas : on ne touche qu'en dehors des url(...)
    const parts = value.split(/(url\((?:[^()]|\([^)]*\))*\))/);
    const mode = /^(color|fill|caret-color)$/.test(prop) ? 'fg' : /shadow|^border|^outline|stroke/.test(prop) ? 'line' : 'bg';
    let changed = false;
    const out = parts
        .map(p => {
            if (p.startsWith('url(')) return p;
            let q = p.replace(COLOR_RX, c => {
                const rgb = parseColor(c);
                if (!rgb) return c;
                const n = mapColor(...rgb, mode);
                if (n) changed = true;
                return n || c;
            });
            if (mode === 'line' && /var\(--ink\)/.test(q)) {
                q = q.replace(/var\(--ink\)/g, 'var(--line)');
                changed = true;
            }
            return q;
        })
        .join('');
    return changed ? out : null;
}

const scope = sel =>
    sel
        .split(',')
        .map(s => {
            s = s.trim();
            if (s.startsWith(':root')) return s.replace(':root', 'html.dark');
            if (/^html\b/.test(s)) return s.replace(/^html/, 'html.dark');
            return `html.dark ${s}`;
        })
        .join(', ');

const CONTAINERS =
    /(^|[\s>+~,.])(body|field|orchard|meadow|sea|pond|plot|lily|tree-art|reel-zone|res-row|auction-card|holiday-card|island|desert|card|view|sheet)\b/;
// un fond qui reste clair et coloré en sombre (boutons dorés, verts, bleus ; jaunes vifs)
const BRIGHT_VARS = /var\(--(gold|leaf|leaf-l|water|blue-l|xp|pink|red-l)\)/;
function brightBg(value) {
    if (/url\(/.test(value) && !/gradient/.test(value)) return false;
    if (BRIGHT_VARS.test(value)) return true;
    const cs = value.match(COLOR_RX) || [];
    return cs.some(c => {
        const rgb = parseColor(c);
        if (!rgb || rgb[3] < 0.6) return false;
        const [, sat, l] = toHsl(rgb[0], rgb[1], rgb[2]);
        return l >= 0.5 && l < 0.78 && sat >= 0.45;
    });
}

export function darkCss(files) {
    const out = postcss.root();
    for (const [name, css] of files) {
        if (SKIP_FILES.includes(name)) continue;
        const root = postcss.parse(css);
        root.walkRules(rule => {
            if (rule.parent && rule.parent.type === 'atrule' && /keyframes/.test(rule.parent.name)) return;
            if (SKIP_SEL.test(rule.selector)) return;
            if (/^:root$/.test(rule.selector.trim())) return; // les variables sombres sont écrites à la main
            // toutes les déclarations de couleur de la règle sont recopiées (même inchangées) : la règle sombre
            // a plus de poids que la claire, il faut que les états (.on, .ready…) gardent le dessus dans le même ordre
            const decls = [];
            let bright = false,
                setsColor = false;
            rule.walkDecls(d => {
                // une variable de fond vive (les boutons : --b: var(--gold)) : texte foncé aussi
                if (d.prop.startsWith('--') && /^--(b|bg)$/.test(d.prop) && brightBg(d.value)) bright = true;
                if (!PROPS.test(d.prop) || d.prop.startsWith('--')) return;
                if (d.prop === 'color' && !/var\(--ink(-soft)?\)/.test(d.value)) setsColor = true;
                const v = transformValue(d.prop, d.value);
                // un fond vif (doré, vert, bleu) qui reste vif : le texte y reste foncé
                if (/^background/.test(d.prop) && !v && brightBg(d.value)) bright = true;
                decls.push(postcss.decl({ prop: d.prop, value: v || d.value, important: d.important }));
            });
            // les grandes surfaces vives (l'herbe du champ, du verger, des prés ; la mer) gardent l'encre claire des cartes
            if (bright && !setsColor && !CONTAINERS.test(rule.selector)) {
                decls.push(postcss.decl({ prop: '--ink', value: '#3a2618' }));
                decls.push(postcss.decl({ prop: '--ink-soft', value: 'rgba(58, 38, 24, 0.68)' }));
                decls.push(postcss.decl({ prop: 'color', value: 'var(--ink)' }));
            }
            if (!decls.length) return;
            const r = postcss.rule({ selector: scope(rule.selector) });
            decls.forEach(d => r.append(d));
            // garder la requête média autour
            let node = r;
            for (let p = rule.parent; p && p.type === 'atrule'; p = p.parent) {
                const a = postcss.atRule({ name: p.name, params: p.params });
                a.append(node);
                node = a;
            }
            out.append(node);
        });
    }
    return out.toString();
}
