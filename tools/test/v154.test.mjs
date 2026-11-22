// 1.154 : Pause rapide de Théo & 5 nouvelles catégories de sprites génétiques.
import test from 'node:test';
import assert from 'node:assert/strict';
import { state, newState, setState } from '../../src/core/state.js';
import { LOOKS, FEATURES, featuresOf } from '../../src/data/genetics.js';
import { SPR } from '../../src/art/index.js';
import { genWrap, looksText } from '../../src/ui/genlook.js';
import * as G from '../../src/systems/index.js';

const pair = v => [
    [v, 1],
    [v, 1],
];

test('1.154 : 19 couleurs, 17 motifs, 14 finitions et 7 morphologies végétales rendent sans erreur', () => {
    assert.equal(LOOKS.color.length, 19);
    assert.equal(LOOKS.pattern.length, 17);
    assert.equal(LOOKS.finish.length, 14);
    assert.equal(LOOKS.morph.length, 7);

    const baseSvg = SPR.item('strawberry');
    for (let c = 1; c < LOOKS.color.length; c++) {
        const g = { t: {}, form: 'strawberry', l: { size: pair(1), color: pair(c), pattern: pair(0), finish: pair(0), morph: pair(0) }, halo: false };
        const html = genWrap(baseSvg, g);
        assert.ok(html.includes('class="gl') && !/undefined|NaN/.test(html), `couleur ${c}`);
        assert.ok(looksText(g).length > 8, `label couleur ${c}`);
    }
    for (let p = 1; p < LOOKS.pattern.length; p++) {
        const g = { t: {}, form: 'strawberry', l: { size: pair(1), color: pair(0), pattern: pair(p), finish: pair(0), morph: pair(0) }, halo: false };
        const html = genWrap(baseSvg, g);
        assert.ok(html.includes(`gp-${p}`) && !/undefined|NaN/.test(html), `motif ${p}`);
    }
    for (let f = 1; f < LOOKS.finish.length; f++) {
        const g = { t: {}, form: 'strawberry', l: { size: pair(1), color: pair(0), pattern: pair(0), finish: pair(f), morph: pair(0) }, halo: false };
        const html = genWrap(baseSvg, g);
        assert.ok(html.includes('class="gl') && !/undefined|NaN/.test(html), `finition ${f}`);
        if (f === 6) assert.ok(html.includes('class="ffly"'), 'bioluminescente a des lucioles');
        if (f === 13) assert.ok(html.includes('spk sun'), 'solaire a des éclats dorés');
    }
    for (let m = 1; m < LOOKS.morph.length; m++) {
        const g = { t: {}, form: 'strawberry', l: { size: pair(1), color: pair(0), pattern: pair(0), finish: pair(0), morph: pair(m) }, halo: false };
        const html = genWrap(baseSvg, g);
        assert.ok(html.includes('class="gl') && !/undefined|NaN/.test(html), `morphologie ${m}`);
        assert.ok(looksText(g).includes(','), `label morphologie ${m}`);
    }
});

test('1.154 : chaque espèce animale (dont le Capybara) possède ses traits visibles et chaque variante diffère', () => {
    assert.ok(featuresOf('capybara').includes('charm'));
    assert.ok(featuresOf('capybara').includes('eyes'));
    assert.equal(FEATURES.plume.list.length, 5);
    assert.equal(FEATURES.swarm.list.length, 4);

    for (const [k, F] of Object.entries(FEATURES)) {
        for (const sp of F.species) {
            const fs = featuresOf(sp);
            const mk = v => {
                const a = fs.map(() => 0);
                a[fs.indexOf(k)] = v;
                return v ? `${sp}~${a.join('')}` : sp;
            };
            const base = SPR.animal(mk(0));
            const seen = new Set([base]);
            for (let v = 1; v < F.list.length; v++) {
                const svg = SPR.animal(mk(v));
                assert.ok(svg.includes('<svg') && !/undefined|NaN/.test(svg), `SVG corrompu ${sp}:${k}=${v}`);
                if (!(k === 'horns' && v === 1)) assert.ok(!seen.has(svg), `Variante invisible ${sp}:${k}=${v}`);
                seen.add(svg);
            }
        }
    }
});

test('1.154 : compatibilité sauvegardes (morph + nouveaux traits), carnet des plantes et pause de Théo', () => {
    setState(newState());
    G.loadGame();
    state.level = 50;
    G.ensureGenetics();

    // Ancien génome plante sans morph : complété au chargement
    const oldPlant = G.wildPlant('tomato');
    delete oldPlant.l.morph;
    state.genetics.vars.v_old = { id: 'v_old', kind: 'plant', base: 'tomato', g: oldPlant };
    G.ensureGenetics();
    assert.ok(state.genetics.vars.v_old.g.l.morph);

    // Suivi d'une morphologie végétale dans le carnet du potager
    state.genetics.vars.v_old.g.l.morph = pair(3);
    const found = G.scanPlantRobes();
    assert.ok(found.some(x => x.kind === 'rare' && x.i === 'm3'));
    assert.equal(G.hasPlantRare('m3'), true);

    // Pause / reprise rapide de Théo
    state.farmhand.lvl = 1;
    assert.equal(G.handPaused(), false);
    assert.ok(G.handZone().length > 0);
    assert.equal(G.toggleHand(), true);
    assert.equal(G.handPaused(), true);
    assert.equal(G.handZone().length, 0);
    assert.equal(G.toggleHand(), true);
    assert.equal(G.handPaused(), false);
});
