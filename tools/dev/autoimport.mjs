// Ajoute les imports manquants : chaque nom non défini dans un module est cherché parmi les exports de src/.
// Usage : node tools/dev/autoimport.mjs [dossier ou fichiers…]  (par défaut src/systems et src/ui)
import fs from 'fs';
import path from 'path';
import { ESLint } from 'eslint';
import * as acorn from 'acorn';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../..');
const SRC = path.join(root, 'src');
const walk = d => fs.readdirSync(d, { withFileTypes: true }).flatMap(e => (e.isDirectory() ? walk(path.join(d, e.name)) : e.name.endsWith('.js') ? [path.join(d, e.name)] : []));

// index des exports : nom → [fichiers]
const index = {};
for (const f of walk(SRC)) {
    const ast = acorn.parse(fs.readFileSync(f, 'utf8'), { ecmaVersion: 2022, sourceType: 'module' });
    for (const n of ast.body) {
        if (n.type !== 'ExportNamedDeclaration' || !n.declaration) continue;
        const d = n.declaration;
        const names = d.type === 'VariableDeclaration' ? d.declarations.map(x => x.id.name) : [d.id.name];
        names.forEach(nm => (index[nm] = index[nm] || []).push(f));
    }
}

const targets = (process.argv.slice(2).length ? process.argv.slice(2) : ['src/systems', 'src/ui']).flatMap(t => {
    const p = path.resolve(root, t);
    return fs.existsSync(p) ? (fs.statSync(p).isDirectory() ? walk(p) : [p]) : [];
});

const eslint = new ESLint({ cwd: root, overrideConfig: { rules: { 'no-undef': 'error' } } });
const unresolved = {};
for (let pass = 0; pass < 3; pass++) {
    const results = await eslint.lintFiles(targets);
    let changed = 0;
    for (const r of results) {
        const names = [...new Set(r.messages.filter(m => m.ruleId === 'no-undef').map(m => m.message.match(/'(.+?)'/)[1]))];
        if (!names.length) continue;
        let src = fs.readFileSync(r.filePath, 'utf8');
        const add = {};
        for (const nm of names) {
            const from = (index[nm] || []).filter(f => f !== r.filePath);
            if (from.length !== 1) {
                (unresolved[path.relative(root, r.filePath)] = unresolved[path.relative(root, r.filePath)] || new Set()).add(nm + (from.length > 1 ? ` (${from.map(f => path.relative(SRC, f)).join(', ')})` : ''));
                continue;
            }
            let rel = path.relative(path.dirname(r.filePath), from[0]).replace(/\\/g, '/');
            if (!rel.startsWith('.')) rel = './' + rel;
            (add[rel] = add[rel] || []).push(nm);
        }
        for (const [rel, list] of Object.entries(add)) {
            const re = new RegExp(`import \\{([^}]*)\\} from '${rel.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&')}';`);
            const m = src.match(re);
            if (m) {
                const have = m[1].split(',').map(x => x.trim()).filter(Boolean);
                src = src.replace(re, `import { ${[...new Set([...have, ...list])].join(', ')} } from '${rel}';`);
            } else {
                // après le dernier import, ou après le commentaire d'en-tête
                const imports = [...src.matchAll(/^import [^;]+;\n/gm)];
                const at = imports.length ? imports.at(-1).index + imports.at(-1)[0].length : src.match(/^(\/\/.*\n)*/)[0].length;
                src = src.slice(0, at) + `import { ${list.join(', ')} } from '${rel}';\n` + src.slice(at);
            }
            changed++;
        }
        fs.writeFileSync(r.filePath, src);
    }
    if (!changed) break;
}
for (const [f, set] of Object.entries(unresolved)) console.log(f + ': ' + [...set].join(', '));
