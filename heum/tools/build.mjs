// Heum — assemble le jeu en un seul fichier HTML (JS et CSS en ligne), à part de Meuh.
// usage : node heum/tools/build.mjs            → heum/dist/index.html (essai)
//         node heum/tools/build.mjs --publish  → heum/index.html (servi par GitHub Pages sous /meuh/heum/, sans lien depuis Meuh)
import fs from 'fs';
import path from 'path';
import { build } from 'esbuild';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const version = fs.readFileSync(path.join(root, 'VERSION'), 'utf8').trim();
const publish = process.argv.includes('--publish');

const js = await build({
    entryPoints: [path.join(root, 'src/main.js')],
    bundle: true,
    format: 'iife',
    target: ['es2020', 'safari14'],
    minify: true,
    legalComments: 'none',
    write: false,
});
const dir = path.join(root, 'src/styles');
const css = fs
    .readdirSync(dir)
    .filter(f => f.endsWith('.css'))
    .sort()
    .map(f => fs.readFileSync(path.join(dir, f), 'utf8'))
    .join('\n');
const cssMin = (await build({ stdin: { contents: css, loader: 'css' }, minify: true, write: false, target: ['safari14', 'chrome90'] })).outputFiles[0].text;
const page = fs
    .readFileSync(path.join(root, 'src/index.html'), 'utf8')
    .replace('/*CSS*/', () => cssMin)
    .replace('/*JS*/', () => js.outputFiles[0].text.replace(/<\/script/g, '<\\/script'))
    .replace('<title>Heum</title>', `<title>Heum ${version}</title>`);
const out = publish ? root : path.join(root, 'dist');
fs.mkdirSync(path.join(out, 'icons'), { recursive: true });
const pwa = p => fs.readFileSync(path.join(root, 'src/pwa', p), 'utf8');
fs.writeFileSync(path.join(out, 'index.html'), page.replace('<!--PWA-->', pwa('head.html').trim()));
const buildId = version + '-' + new Date().toISOString().replace(/\D/g, '').slice(0, 14);
fs.writeFileSync(path.join(out, 'sw.js'), pwa('sw.js').replace('{{BUILD}}', buildId));
fs.copyFileSync(path.join(root, 'src/pwa/manifest.webmanifest'), path.join(out, 'manifest.webmanifest'));
for (const f of fs.readdirSync(path.join(root, 'src/pwa/icons'))) fs.copyFileSync(path.join(root, 'src/pwa/icons', f), path.join(out, 'icons', f));
console.log(`${path.join(out, 'index.html')} · ${(page.length / 1024).toFixed(0)} ko · Heum ${version} · ${buildId}`);
