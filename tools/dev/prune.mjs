// Retire des imports les noms qui ne servent plus (signalés par ESLint).
import fs from 'fs';
import { ESLint } from 'eslint';
const eslint = new ESLint();
const results = await eslint.lintFiles(process.argv.slice(2).length ? process.argv.slice(2) : ['src']);
for (const r of results) {
    const names = r.messages.filter(m => m.ruleId === 'no-unused-vars' && / is defined but never used/.test(m.message)).map(m => m.message.match(/'(.+?)'/)[1]);
    if (!names.length) continue;
    let src = fs.readFileSync(r.filePath, 'utf8');
    src = src.replace(/import \{([^}]*)\} from ('[^']+');\n/g, (all, list, from) => {
        const kept = list
            .split(',')
            .map(x => x.trim())
            .filter(x => x && !names.includes(x.split(' as ').pop().trim()));
        return kept.length ? `import { ${kept.join(', ')} } from ${from};\n` : '';
    });
    fs.writeFileSync(r.filePath, src);
}
