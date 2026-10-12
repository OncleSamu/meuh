// Compare les dessins du rework à ceux de la 6.2 (chaîne SVG identique attendue).
import fs from 'fs';
const { SPR } = await import('../../src/art/index.js');
const old = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
let ok = 0;
const bad = [];
for (const [k, v] of Object.entries(old)) {
    const [kind, id, s] = k.split(':');
    let n;
    try {
        n =
            kind === 'item' ? SPR.item(id) : kind === 'animal' ? SPR.animal(id) : kind === 'machine' ? SPR.machine(id) : kind === 'ui' ? SPR.ui(id)
            : kind === 'villager' ? SPR.villager(id) : kind === 'plant' ? SPR.plant(id, +s) : kind === 'seed' ? SPR.seed(id) : kind === 'bld' ? SPR.building(id, +s)
            : kind === 'farmhouse' ? SPR.farmhouse(+id) : kind === 'truck' ? SPR.truck() : kind === 'loco' ? SPR.loco() : kind === 'wagon' ? SPR.wagon('#c8453a') : SPR.balloon();
    } catch (e) {
        n = 'ERR ' + e.message;
    }
    if (n === v) ok++;
    else bad.push([k, String(n).slice(0, 120)]);
}
console.log('identiques', ok, '/', Object.keys(old).length);
console.log(bad.slice(0, 15));
