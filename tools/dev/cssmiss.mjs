// Les classes utilisées par l'interface mais absentes des feuilles de style (et l'inverse).
import fs from 'fs';
import path from 'path';
const walk = d => fs.readdirSync(d, { withFileTypes: true }).flatMap(e => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]));
const js = walk('src/ui').concat(['src/index.html', 'src/art/index.js', 'src/art/kit.js']).map(f => fs.readFileSync(f, 'utf8')).join('\n');
const css = walk('src/styles').map(f => fs.readFileSync(f, 'utf8')).join('\n');
const used = new Set();
for (const m of js.matchAll(/class(?:Name)?[=:]\s*["'`]([^"'`]+)["'`]/g)) m[1].replace(/\$\{[^}]*\}/g, ' ').split(/\s+/).filter(c => /^[a-z][\w-]*$/.test(c)).forEach(c => used.add(c));
for (const m of js.matchAll(/classList\.(?:toggle|add|remove)\('([\w-]+)'/g)) used.add(m[1]);
const defined = new Set([...css.matchAll(/\.([a-zA-Z][\w-]*)/g)].map(m => m[1]));
const missing = [...used].filter(c => !defined.has(c)).sort();
console.log('absentes du CSS :', missing.join(' '));
if (process.argv.includes('--dead')) console.log('\nCSS sans usage :', [...defined].filter(c => !used.has(c) && !js.includes(c)).sort().join(' '));
