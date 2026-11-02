// Les styles du jeu, dans l'ordre de leur numéro, suivis du thème sombre fabriqué (tools/dark.mjs).
import fs from 'fs';
import path from 'path';
import { darkCss } from './dark.mjs';

export function gameCss(root) {
    const dir = path.join(root, 'src/styles');
    const files = fs
        .readdirSync(dir)
        .filter(f => f.endsWith('.css'))
        .sort()
        .map(f => [f, fs.readFileSync(path.join(dir, f), 'utf8')]);
    const light = files.filter(([f]) => f !== '99-dark.css');
    const dark = files.find(([f]) => f === '99-dark.css');
    return [...light.map(([, c]) => c), darkCss(light), dark ? dark[1] : ''].join('\n');
}
