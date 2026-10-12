// Assemble le jeu : un seul fichier HTML (JS et CSS en ligne) + les fichiers de l'appli installable.
// usage : node tools/build.mjs            → dist/ (appli) et dist/Meuh.html (fichier seul)
//         node tools/build.mjs --publish  → à la racine du dépôt, pour GitHub Pages
import fs from 'fs';
import path from 'path';
import { build } from 'esbuild';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const src = p => fs.readFileSync(path.join(root, 'src', p), 'utf8');
const version = fs.readFileSync(path.join(root, 'VERSION'), 'utf8').trim();
const publish = process.argv.includes('--publish');

const js = await build({
    entryPoints: [path.join(root, 'src/main.js')],
    bundle: true,
    format: 'iife',
    target: ['es2020', 'safari14'],
    minify: !process.argv.includes('--dev'),
    legalComments: 'none',
    write: false,
});
const code = js.outputFiles[0].text.replace(/\{\{VERSION\}\}/g, version);

// les feuilles de style, dans l'ordre de leur numéro
const cssDir = path.join(root, 'src/styles');
const css = fs
    .readdirSync(cssDir)
    .filter(f => f.endsWith('.css'))
    .sort()
    .map(f => fs.readFileSync(path.join(cssDir, f), 'utf8'))
    .join('\n');
const cssMin = (await build({ stdin: { contents: css, loader: 'css' }, minify: true, write: false, target: ['safari14', 'chrome90'] })).outputFiles[0].text;

const page = src('index.html')
    .replace('/*CSS*/', () => cssMin)
    .replace('/*JS*/', () => code.replace(/<\/script/g, '<\\/script'))
    .replace('<title>Meuh</title>', `<title>Meuh ${version}</title>`);

const out = publish ? root : path.join(root, 'dist');
fs.mkdirSync(path.join(out, 'icons'), { recursive: true });
const pwa = p => src(path.join('pwa', p));
fs.writeFileSync(path.join(out, 'index.html'), page.replace('<!--PWA-->', pwa('head.html').trim()));
const buildId = version.replace(/\s/g, '-') + '-' + new Date().toISOString().replace(/\D/g, '').slice(0, 14);
fs.writeFileSync(path.join(out, 'sw.js'), pwa('sw.js').replace('{{BUILD}}', buildId));
fs.copyFileSync(path.join(root, 'src/pwa/manifest.webmanifest'), path.join(out, 'manifest.webmanifest'));
for (const f of fs.readdirSync(path.join(root, 'src/pwa/icons'))) fs.copyFileSync(path.join(root, 'src/pwa/icons', f), path.join(out, 'icons', f));
fs.writeFileSync(path.join(out, '.nojekyll'), '');
// le fichier seul, à ouvrir sans serveur
if (!publish) fs.writeFileSync(path.join(out, `Meuh ${version}.html`), page.replace('<!--PWA-->\n', '').replace('<!--PWA-->', ''));
console.log(`${out} · ${(page.length / 1024).toFixed(0)} ko · ${buildId}`);
