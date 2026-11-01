// Construit src/data/changelog.js (Réglages › Mises à jour) à partir de la feuille de route.
// usage : node tools/dev/changelog.mjs .tmp/docs/feuille.md
import fs from 'fs';
const src = fs.readFileSync(process.argv[2] || '.tmp/docs/feuille.md', 'utf8').split('\n');
const out = new Map();
const MONTHS = 'janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre';
// ce qui ne regarde que l'atelier de fabrication, pas le joueur
const DROP = /robot|branche|grosse-maj|codée|non publiée|validation finale|planches? de contact|documents à jour|catalogue/i;
const clean = t => {
    const u = t
        .replace(/\*([^*]+)\*/g, '$1')
        .replace(/`/g, '')
        .replace(/[;,.]?\s*(?:\d+ )?tests?(?: de contrôle)?(?: verts| ajoutés?| automatiques?)?(?: \([^)]*\))?(?=[.;]|$)/gi, '')
        .replace(/\s*Détail dans « [^»]+ »\.?/g, '')
        .replace(/\s*Rapport\s*:\s*[^.]+\.?/g, '')
        .replace(/\s*\((?:détail dans |voir )?« Plan [^»]+ »[^)]*\)/gi, '')
        .replace(/,?\s*à la demande de Samuel,?/gi, '')
        .replace(/\s*\(?voir « (?:Plan|Rapport)[^»]+ »\)?\.?/gi, '');
    const kept = u
        .split(/(?<=[.;])\s+(?=[A-ZÀ-Ü«(])/)
        .filter(x => !DROP.test(x))
        .join(' ');
    return kept
        .replace(/\s*\(\s*\)/g, '')
        .replace(/\s+([.,])/g, '$1')
        .replace(/^[\s,;:.]+/, '')
        .replace(/^\p{Ll}/u, c => c.toUpperCase())
        .replace(/\s+/g, ' ')
        .replace(/[;,]\s*$/, '.')
        .trim();
};
for (const line of src) {
    const m = line.match(/^- \*\*(?:Meuh )?(\d+\.\d+(?:\.\d+)?(?:(?: et | à )\d+\.\d+(?:\.\d+)?)?(?: bêta(?: \d+(?:\.\d+)?)?)?)([^*]*)\*\*\s*:?\s*(.*)$/);
    if (!m) continue;
    const [, v, rest, body] = m;
    if (/brouillon|non publié/.test(rest + body.slice(0, 40)) && !/publiée/.test(rest)) continue;
    const title = ((rest.match(/—\s*([^(]+)/) || [])[1] || '').trim().replace(/[«»]/g, '').trim();
    const dm = rest.match(new RegExp(`(\\d{1,2})(?:er)? (${MONTHS}) (\\d{4})`));
    const text = clean(body);
    if (!text && !title) continue;
    const key = v.trim();
    if (!out.has(key) || out.get(key).text.length < text.length)
        out.set(key, { v: key, title, date: dm ? `${dm[1] === '1' ? '1er' : dm[1]} ${dm[2]} ${dm[3]}` : '', text });
}
const num = v => (v.match(/\d+/g) || []).slice(0, 3).map(Number).concat([0, 0, 0]).slice(0, 3);
const list = [...out.values()].sort((a, b) => {
    const x = num(a.v),
        y = num(b.v);
    return y[0] - x[0] || y[1] - x[1] || y[2] - x[2] || (/bêta/.test(a.v) ? 1 : 0) - (/bêta/.test(b.v) ? 1 : 0);
});
const js = `// Réglages › Mises à jour : chaque version du jeu, de la plus récente à la plus ancienne (construit par tools/dev/changelog.mjs).
export const CHANGELOG = ${JSON.stringify(list, null, 1)};
`;
fs.writeFileSync('src/data/changelog.js', js);
console.log(
    list.length,
    'versions ·',
    (js.length / 1024).toFixed(0),
    'ko ·',
    list
        .slice(0, 3)
        .map(x => x.v)
        .join(', '),
    '…',
    list
        .slice(-3)
        .map(x => x.v)
        .join(', '),
);
