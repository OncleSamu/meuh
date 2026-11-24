// Statistiques, mes bonus, le guide du fermier, une photo de l'album et la carte postale.
import { searchBox } from '../pager.js';
import { state, lvOk } from '../../core/state.js';
import { fmt, qtyName } from '../../core/format.js';
import { now } from '../../core/clock.js';
import { toast } from '../../core/bus.js';
import { ITEMS } from '../../data/items.js';
import { ANIMALS } from '../../data/animals.js';
import { MACHINES, RECIPES } from '../../data/machines.js';
import { VILLAGERS, PROJECTS, STORIES } from '../../data/village.js';
import { EVENTS } from '../../data/world.js';
import { RARE } from '../../data/commerce.js';
import { COLS } from '../../data/farm.js';
import { GUIDE_CATS, GUIDE_PAGES } from '../../data/guide.js';
import { RECORDS, FISH } from '../../data/meta.js';
import * as G from '../../systems/index.js';
import { actions, QUIET } from '../dom.js';
import { ico, SPR } from '../icons.js';
import { btn, line, empty } from '../kit.js';
import { defineSheet, sheetOpts, openSheet, closeSheet, closeAll } from '../sheets.js';
import { go } from '../app.js';
import { photoArt } from './book.js';
import { innerTabs } from '../innertabs.js';

// ---------------- statistiques ----------------
defineSheet('stats', {
    title: 'Statistiques',
    render(o) {
        const d = G.statsData();
        // 1.74.2 : trois onglets ; la ferme rangée par coin
        const T = innerTabs(
            'stats',
            [
                ['farm', 'Ma ferme', null, 0],
                ['coins', 'Pièces', null, 0],
                ['rec', 'Records', null, 0],
            ],
            'farm',
        );
        const tiles = d.groups
            .map(
                ([t, l]) =>
                    `<div class="chart-title">${t}</div><div class="tiles">${l.map(([lb, v, i]) => `<div class="tile">${ico(i)}<b>${v}</b><span>${lb}</span></div>`).join('')}</div>`,
            )
            .join('');
        const vals = d.perDay.map(x => x.v);
        const max = Math.max(1, ...vals),
            imax = vals.indexOf(Math.max(...vals));
        const W = 300,
            H = 120,
            bw = W / Math.max(1, vals.length),
            pad = 6;
        const chart = vals.some(v => v)
            ? `<svg viewBox="0 0 ${W} ${H + 22}" class="chart" role="img" aria-label="Pièces gagnées par jour de jeu">
            <line x1="0" y1="${H}" x2="${W}" y2="${H}" stroke="#3a2618" stroke-opacity=".35" stroke-width="1"/>
            ${d.perDay
                .map(({ day, v }, i) => {
                    const h = Math.max(v ? 3 : 0, (v / max) * (H - 18)),
                        x = i * bw + pad / 2;
                    return `<g class="cbar${o.tip === i ? ' on' : ''}" data-act="chartTip" data-i="${i}">
                    <rect x="${i * bw}" y="0" width="${bw}" height="${H + 22}" fill="transparent"/>
                    <path d="M${x} ${H} V${H - h + 4} q0 -4 4 -4 H${x + bw - pad - 4} q4 0 4 4 V${H}Z" fill="#3f8f2e"/>
                    ${i === imax && v ? `<text x="${x + (bw - pad) / 2}" y="${H - h - 5}" text-anchor="middle" class="lbl">${fmt(v)}</text>` : ''}
                    <text x="${x + (bw - pad) / 2}" y="${H + 15}" text-anchor="middle" class="ax">${day === state.day ? 'Auj.' : `J−${state.day - day}`}</text></g>`;
                })
                .join(
                    '',
                )}</svg><p class="card-sub">${o.tip != null && d.perDay[o.tip] ? `Jour ${d.perDay[o.tip].day} : ${fmt(d.perDay[o.tip].v)} pièces` : 'Touchez une barre pour voir son montant.'}</p>`
            : '<p class="card-sub">Pas encore de données : revenez après une journée de jeu.</p>';
        const tmax = d.top.length ? d.top[0][1] : 1;
        const top = d.top.length
            ? d.top
                  .map(
                      ([id, v]) =>
                          `<div class="hbar top">${ico(['item', id])}<div class="hmain"><span class="hname">${ITEMS[id].name}</span><div class="htrack"><i style="width:${Math.max(2, (v / tmax) * 100)}%"></i></div></div><span class="hval">${fmt(v)}</span></div>`,
                  )
                  .join('')
            : '<p class="card-sub">Vendez au marché pour voir ce qui rapporte le plus.</p>';
        const tot = Math.max(
            1,
            d.sources.reduce((a, [, v]) => a + v, 0),
        );
        const src = !d.sources.some(([, v]) => v)
            ? '<p class="card-sub">Gagnez vos premières pièces pour voir d’où elles viennent.</p>'
            : d.sources
                  .map(
                      ([l, v]) =>
                          `<div class="hbar"><span class="hname wide">${l}</span><div class="htrack"><i style="width:${Math.max(v ? 2 : 0, (v / tot) * 100)}%"></i></div><span class="hval">${Math.round((v / tot) * 100)} %</span></div>`,
                  )
                  .join('');
        const r = state.records || {};
        const recs =
            Object.entries(RECORDS)
                .map(([k, def]) => `<div class="rec-row">${ico(def.icon)}<span>${def.name}</span><b>${r[k] ? G.recordText(k, r[k]) : '—'}</b></div>`)
                .join('') +
            (max > 1 ? `<div class="rec-row">${ico(['ui', 'coin'])}<span>Meilleure journée (10 derniers jours)</span><b>${fmt(max)} pièces</b></div>` : '');
        const block = (t, h) => `<div class="chart-block"><div class="chart-title">${t}</div>${h}</div>`;
        const t = T.cur;
        return [
            ['tabs', T.html],
            ['tiles', t === 'farm' ? tiles : ''],
            ['days', t === 'coins' ? block('Pièces gagnées par jour de jeu', chart) : ''],
            [
                'src',
                t === 'coins' ? block('D’où viennent vos pièces', src + '<p class="card-sub">« Autres » : succès, cadeaux, chien, fêtes et contrats.</p>') : '',
            ],
            ['top', t === 'coins' ? block('Ce qui rapporte le plus à la vente', top) : ''],
            ['rec', t === 'rec' ? `<div class="list">${recs}</div>` : ''],
        ];
    },
});

// ---------------- mes bonus ----------------
defineSheet('bonus', {
    title: 'Mes bonus',
    render: () => {
        const all = G.bonusLines(),
            idle = l => String(l[3]).startsWith('aucun bonus'),
            on = all.filter(l => !idle(l)),
            off = all.filter(idle);
        const row = ([icon, name, v, from]) => line(icon, `<div class="card-title">${name} <b>${G.bonusValue(v)}</b></div><div class="card-sub">${from}</div>`);
        return `<p class="card-sub center">Le total de vos compétences, de l’équipement, des rubans et du village.</p>${on.length ? `<div class="lines">${on.map(row).join('')}</div>` : ''}${
            off.length
                ? `<p class="card-sub center">${on.length ? 'Pas encore de bonus : ' : 'Aucun bonus pour l’instant : '}${off.map(l => String(l[1]).toLowerCase()).join(', ')}.</p>`
                : ''
        }`;
    },
});

// ---------------- le guide ----------------
const norm = sv => String(sv).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

// d'où vient un produit, en une ligne
export function itemSource(id) {
    const it = ITEMS[id];
    if (it.type === 'crop' && it.needProject)
        return `Graines au niveau ${it.reqLvl}, après « ${PROJECTS[it.needProject].name} »${it.ghOnly ? ', seulement dans la serre' : ''}`;
    if (it.type === 'crop') return it.exotic ? 'Graines chez le marchand ambulant' : `Champ, graines au niveau ${it.reqLvl}`;
    if (it.type === 'tree') return `Arbre fruitier du verger, niveau ${it.reqLvl}`;
    if (it.type === 'fish') return FISH[id] ? `Pêche à l’étang : ${FISH[id].hint.toLowerCase()}` : 'Pêche à l’étang';
    if (it.sea) return 'Filet de pêche en mer (Ferme | Pêche), après le phare';
    if (id === 'alpineMilk') return 'Au retour de la transhumance, puis chez les vaches, chèvres et bufflonnes qui sont montées';
    if (RECIPES[id]) {
        const r = RECIPES[id];
        const how = Object.entries(r.ing)
            .map(([k, n]) => qtyName(n, ITEMS[k].name))
            .join(', ');
        const lock = r.fete
            ? ` (pendant ${EVENTS[r.fete].name})`
            : r.teacher
              ? ` (recette de ${VILLAGERS[r.teacher].name}, ${r.hearts} cœur${r.hearts > 1 ? 's' : ''})`
              : ` (niveau ${r.lvl})`;
        return `${MACHINES[r.machine].name}${lock} : ${how}`;
    }
    const a = Object.values(ANIMALS).find(x => x.prodId === id);
    if (a) return `${a.name}, niveau ${a.reqLvl}`;
    if (id === 'honey') return 'Ruche posée dans le champ, ou ruche d’élevage';
    if (id === 'wood' || id === 'stone') return id === 'wood' ? 'Forêt (Ferme | Nature)' : 'Mine (Ferme | Nature)';
    if (RARE.includes(id)) return 'Trouvé en récoltant, à l’atelier, dans les livraisons, chez le marchand';
    if (['fossil', 'amethyst', 'nugget', 'quartz', 'ruby', 'sapphire', 'emerald'].includes(id))
        return 'Caché dans les rochers de la mine (les veines en donnent toujours)';
    if (['coal', 'ironOre', 'copperOre', 'silverOre', 'goldOre'].includes(id))
        return {
            coal: 'Carrière, galerie, ou charbonnière',
            ironOre: 'Galerie de la mine',
            copperOre: 'Galerie de la mine',
            silverOre: 'Grotte profonde',
            goldOre: 'Grotte profonde',
        }[id];
    if (['hardwood', 'resin', 'birchSap'].includes(id))
        return { hardwood: 'Chênes et châtaigniers de la forêt', resin: 'Pins de la forêt', birchSap: 'Bouleaux de la forêt' }[id];
    return '';
}

// qui en veut en ce moment
export function itemDemand(id) {
    const who = [];
    state.quests.forEach(q => G.isOpen(q) && q.items.some(x => x.id === id) && who.push(`commande de ${VILLAGERS[q.vid].name}`));
    if (state.truck.status === 'here' && state.truck.slots.some(sl => sl.id === id && !sl.loaded)) who.push('le train');
    if (state.balloon.status === 'here' && state.balloon.items.some(x => x.id === id)) who.push('la montgolfière');
    Object.values(PROJECTS).forEach(p => G.projectOpen(p.id) && p.need[id] && G.projectLeft(p.id, id) && who.push(p.name.toLowerCase()));
    if (state.contract && !state.contract.done && state.contract.item === id) who.push('le contrat de saison');
    Object.keys(STORIES).forEach(v => G.villagerStoryOpen(v) && G.storyNeed(v)[id] && who.push(`l’histoire de ${VILLAGERS[v].name}`));
    if (G.rareActive('critic') && state.rare.dish === id) who.push('le critique gastronomique');
    return who;
}

function itemCard(id) {
    const it = ITEMS[id];
    const demand = itemDemand(id),
        src = itemSource(id);
    return `<div class="card guide-item">${ico(['item', id], 'ico big')}<div class="card-main">
        <div class="card-title">${it.name}${G.masteryCount(id) ? ` <small>${'★'.repeat(G.masteryStars(id))}</small>` : ''}</div>
        <div class="card-sub">En stock : <b>${fmt(state.inventory[id] || 0)}</b>${it.sell ? ` · vaut ${fmt(Math.round(it.sell * G.masteryMult(id)))} pièces` : ''}</div>
        ${src ? `<div class="card-sub">${src}</div>` : ''}${demand.length ? `<div class="card-sub want">Demandé par : ${demand.join(', ')}</div>` : ''}</div>
        <span class="gi-btns">${btn('Fiche', { act: 'open', data: { sheet: 'item', id }, size: 'sm', kind: 'gold' })}${btn('Produire', { act: 'produce', data: { id }, size: 'sm' })}</span></div>`;
}

const GUIDE_GO = {
    farm: 'farm/field',
    orchard: 'farm/orchard',
    island: 'farm/island',
    nature: 'farm/nature',
    pond: 'farm/pond',
};
const GUIDE_QUICK = [
    ['start', 'Débuter', ['ui', 'star']],
    ['memo', 'Horaires', ['ui', 'clock']],
    ['time', 'Jeu fermé', ['ui', 'firefly']],
    ['meuhcg', 'MeuhCG', ['ui', 'meuhcg']],
];
const guideById = id => GUIDE_PAGES.find(g => g.id === id);
const pagePath = g => GUIDE_GO[g.go] || g.go || 'farm/field';
const cleanGuide = s =>
    String(s || '')
        .replace(/\s*\((?:depuis la\s+)?1\.\d+(?:\.\d+)?\)/gi, '')
        .replace(/\s{2,}/g, ' ')
        .trim();
const fmtGuideLine = s =>
    cleanGuide(s).replace(/^([^:.!?(),]{2,38})(\s?[:]\s+)/, '<b class="g-key">$1</b>$2');
const splitGuidePara = s => {
    const c = cleanGuide(s);
    if (c.length < 240) return `<p>${fmtGuideLine(c)}</p>`;
    // Découper les longs paragraphes en phrases aérées (2 phrases par bloc max)
    const parts = c.match(/[^.!?]+[.!?]+(?:\s|$)|[^.!?]+$/g);
    if (!parts || parts.length <= 2) return `<p>${fmtGuideLine(c)}</p>`;
    const chunks = [];
    for (let i = 0; i < parts.length; i += 2) {
        chunks.push(parts.slice(i, i + 2).join('').trim());
    }
    return chunks.map(ch => `<p>${fmtGuideLine(ch)}</p>`).join('');
};
const guideText = g =>
    [
        g.name,
        g.intro,
        ...(g.facts || []).map(f => `${f.v} ${f.l}`),
        ...g.secs.map(x =>
            [
                x.h,
                x.t || '',
                ...(x.b || []),
                ...(x.steps || []).map(st => `${st.label} ${st.sub || ''}`),
                ...(x.tiles || []).map(tl => `${tl.title} ${tl.val || ''} ${tl.sub || ''}`),
            ].join(' '),
        ),
        ...(g.tips || []),
    ].join(' ');

function guideCard(g, snippet) {
    const locked = state.level < g.lvl;
    return `<button class="card guide-page${locked ? ' locked' : ''}" data-act="guidePage" data-p="${g.id}">${ico(g.icon, 'ico big')}<span class="card-main"><span class="card-title">${g.name}${locked ? ` <small>niv. ${g.lvl}</small>` : ''}</span><span class="card-sub">${cleanGuide(snippet || g.intro)}</span></span><span class="gp-go" aria-hidden="true">›</span></button>`;
}

function guideHome(o) {
    const cat = o.cat || GUIDE_CATS[0].id;
    const quick = `<div class="guide-quick">${GUIDE_QUICK.map(
        ([id, lbl, ic]) => `<button class="guide-qbtn" data-act="guidePage" data-p="${id}">${ico(ic, 'ico sm')}<span>${lbl}</span></button>`,
    ).join('')}</div>`;
    const chips = GUIDE_CATS.map(c => {
        const list = GUIDE_PAGES.filter(g => g.cat === c.id);
        const openN = list.filter(g => state.level >= g.lvl).length;
        return `<button class="chip${c.id === cat ? ' on' : ''}" data-act="guideCat" data-c="${c.id}">${ico(c.icon, 'ico sm')}<span>${c.name}</span><i class="gc-cnt">${openN}/${list.length}</i></button>`;
    }).join('');
    const inCat = GUIDE_PAGES.filter(g => g.cat === cat);
    const unlocked = inCat.filter(g => state.level >= g.lvl);
    const later = inCat.filter(g => state.level < g.lvl);
    const laterBlock = later.length
        ? `<details class="guide-later"${unlocked.length ? '' : ' open'}><summary>Plus tard dans l’aventure (${later.length})</summary><div class="guide-later-list">${later.map(g => guideCard(g)).join('')}</div></details>`
        : '';
    return `${quick}<div class="guide-chips guide-cats-bar">${chips}</div>${unlocked.map(g => guideCard(g)).join('')}${laterBlock}`;
}

function renderGuideSecBody(x) {
    const stepsHtml = (x.steps || []).length
        ? `<div class="guide-steps">${x.steps
              .map(
                  (st, i) =>
                      `${i ? '<span class="gs-arr" aria-hidden="true">›</span>' : ''}<div class="guide-step">${ico(st.icon, 'ico sm')}<b>${st.label}</b>${st.sub ? `<small>${st.sub}</small>` : ''}</div>`,
              )
              .join('')}</div>`
        : '';
    const tilesHtml = (x.tiles || []).length
        ? `<div class="guide-tiles">${x.tiles
              .map(
                  tl =>
                      `<div class="guide-tile">${tl.icon ? ico(tl.icon, 'ico sm') : ''}<div class="gt-txt"><b>${tl.title}</b>${tl.val ? `<span class="gt-val">${tl.val}</span>` : ''}${tl.sub ? `<small>${tl.sub}</small>` : ''}</div></div>`,
              )
              .join('')}</div>`
        : '';
    const textHtml = x.t ? splitGuidePara(x.t) : x.b && x.b.length ? `<ul class="guide-ul">${x.b.map(i => `<li>${fmtGuideLine(i)}</li>`).join('')}</ul>` : '';
    return `${stepsHtml}${tilesHtml}${textHtml}`;
}

function guideRead(g, o = {}) {
    const locked = state.level < g.lvl;
    const mode = o.allOpen; // 'all' | 'none' | undefined (par défaut : 1er chapitre ouvert)
    const factsHtml = (g.facts || []).length
        ? `<div class="guide-facts">${g.facts
              .map(f => `<div class="guide-fact">${ico(f.icon, 'ico sm')}<b>${f.v}</b><span>${f.l}</span></div>`)
              .join('')}</div>`
        : '';
    const allOpenNow = mode === 'all' || (mode !== 'none' && g.secs.length <= 1);
    const toolbar =
        g.secs.length > 1
            ? `<div class="guide-sec-bar"><span>${g.secs.length} chapitres</span><button type="button" class="chip sm" data-act="guideExpand">${allOpenNow ? 'Tout replier' : 'Tout ouvrir'}</button></div>`
            : '';
    const secs = g.secs
        .map((x, idx) => {
            const isOpen = mode === 'all' ? true : mode === 'none' ? false : idx === 0;
            const count = x.tiles ? `${x.tiles.length} fiches` : x.steps ? `${x.steps.length} étapes` : x.b ? `${x.b.length} points` : '';
            return `<details class="guide-sec"${isOpen ? ' open' : ''}>
                <summary><span class="gs-title">${cleanGuide(x.h)}</span>${count ? `<span class="gs-meta">${count}</span>` : ''}</summary>
                <div class="gs-body">${renderGuideSecBody(x)}</div>
            </details>`;
        })
        .join('');
    const tips = (g.tips || []).length
        ? `<div class="guide-tips"><div class="gtips-h">${ico(['ui', 'sparkle'], 'ico sm')}<b>À retenir</b></div><ul>${g.tips.map(t => `<li>${fmtGuideLine(t)}</li>`).join('')}</ul></div>`
        : '';
    const see = (g.see || []).map(guideById).filter(Boolean);
    return `<div class="guide-nav">
            <button class="chip guide-back" data-act="guidePage" data-p="">‹ Tous les sujets</button>
            ${btn('Y aller', { act: 'guideGo', data: { path: pagePath(g) }, kind: 'gold', size: 'sm', disabled: locked })}
        </div>
        <div class="card guide-head">${ico(g.icon, 'ico big')}<div class="card-main"><div class="card-title">${g.name}</div><div class="card-sub">${cleanGuide(g.intro)}</div>${locked ? `<div class="card-sub want">S’ouvre au niveau ${g.lvl}</div>` : ''}</div></div>
        ${factsHtml}
        ${toolbar}
        <div class="guide-body">${secs}${tips}</div>
        ${see.length ? `<div class="set-title">Voir aussi</div><div class="guide-chips">${see.map(x => `<button class="chip" data-act="guidePage" data-p="${x.id}">${ico(x.icon, 'ico sm')}<span>${x.name}</span></button>`).join('')}</div>` : ''}`;
}

function machineCard(m) {
    const idx = state.machines.findIndex(x => x.type === m.id);
    const open = lvOk(m) && G.storyOk(m);
    const actBtn =
        idx >= 0
            ? btn('Ouvrir', { act: 'guideMach', data: { id: m.id }, size: 'sm', kind: 'green' })
            : open
              ? btn('Acheter', { act: 'guideMach', data: { id: m.id }, size: 'sm', kind: 'gold' })
              : `<span class="chip">niv. ${m.reqLvl}</span>`;
    return `<div class="card guide-item">${ico(['machine', m.id], 'ico big')}<div class="card-main">
        <div class="card-title">${m.name}</div>
        <div class="card-sub">${m.desc || `Atelier · niveau ${m.reqLvl}`}</div></div>
        <span class="gi-btns">${actBtn}</span></div>`;
}

function animalCard(a) {
    const prods = [ITEMS[a.prodId]?.name, a.extra && ITEMS[a.extra]?.name].filter(Boolean).join(' · ');
    const open = lvOk(a) && G.storyOk(a);
    return `<div class="card guide-item">${ico(['animal', a.id], 'ico big')}<div class="card-main">
        <div class="card-title">${a.name}</div>
        <div class="card-sub">${prods}${a.oasis ? ' · Oasis' : a.nord ? ' · Grand Nord' : a.asie ? ' · Terres d’Asie' : ''}</div></div>
        <span class="gi-btns">${open ? btn('Y aller', { act: 'guideAnim', data: { id: a.id }, size: 'sm', kind: 'gold' }) : `<span class="chip">niv. ${a.reqLvl}</span>`}</span></div>`;
}

function guideResults(q) {
    q = norm(q || '').trim();
    const machs = Object.values(MACHINES)
        .filter(m => norm(m.name).includes(q) || norm(m.desc || '').includes(q))
        .slice(0, 5);
    const anims = Object.values(ANIMALS)
        .filter(a => norm(a.name).includes(q))
        .slice(0, 5);
    const items = Object.keys(ITEMS)
        .filter(id => norm(ITEMS[id].name).includes(q) && ITEMS[id].type !== 'junk')
        .slice(0, 10);
    const pages = GUIDE_PAGES.filter(g => norm(guideText(g)).includes(q));
    return (
        (machs.length ? `<div class="set-title">Ateliers</div>${machs.map(machineCard).join('')}` : '') +
        (anims.length ? `<div class="set-title">Animaux</div>${anims.map(animalCard).join('')}` : '') +
        (items.length ? `<div class="set-title">Produits</div>${items.map(itemCard).join('')}` : '') +
        (pages.length ? `<div class="set-title">Guide</div>${pages.map(g => guideCard(g)).join('')}` : '') +
        (!machs.length && !anims.length && !items.length && !pages.length ? empty('Rien trouvé. Essayez « fromage », « moulin », « vache » ou « concours ».') : '')
    );
}

const guideBody = o => {
    const q = norm(o.q || '').trim();
    if (q.length >= 2) return guideResults(o.q);
    const g = o.page && guideById(o.page);
    return g ? guideRead(g, o) : guideHome(o);
};

defineSheet('guide', {
    cls: 'guide-sheet',
    static: true,
    title: o => (o.focusSearch ? 'Rechercher' : 'Guide du fermier'),
    open(o) {
        if (o.focusSearch) {
            setTimeout(() => {
                const inp = document.querySelector('.guide-sheet input[type="search"]');
                if (inp) inp.focus();
            }, 60);
        }
    },
    render: o => [
        [
            'search',
            searchBox('guide', 'Chercher un produit, un atelier, un animal ou un sujet', { input: 'guideSearch', value: o.q || '' }),
        ],
        ['res', `<div id="guide-res">${guideBody(o)}</div>`],
    ],
});

// ---------------- photo et carte postale ----------------
// dessine un SVG dans une image PNG, puis la partage (ou la télécharge)
function shareSvg(svg, w, h, file, title, done) {
    const img = new Image();
    img.onload = () => {
        const cv = document.createElement('canvas');
        cv.width = w;
        cv.height = h;
        cv.getContext('2d').drawImage(img, 0, 0);
        cv.toBlob(blob => {
            if (!blob) return;
            const f = new File([blob], file, { type: 'image/png' });
            if (navigator.canShare && navigator.canShare({ files: [f] })) navigator.share({ files: [f], title }).catch(() => {});
            else {
                const a = document.createElement('a');
                a.href = URL.createObjectURL(blob);
                a.download = file;
                a.click();
                setTimeout(() => URL.revokeObjectURL(a.href), 4000);
                toast(done, ['ui', 'camera']);
            }
        }, 'image/png');
    };
    img.onerror = () => toast('Impossible de préparer l’image', ['ui', 'camera']);
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}

const inner = sv => sv.replace(/^<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');
const vbOf = sv => (sv.match(/viewBox="([^"]+)"/) || [0, '0 0 64 64'])[1];
const xmlEsc = sv => String(sv).replace(/&/g, '&amp;').replace(/</g, '&lt;');

function photoSvg(ph) {
    const a = photoArt(ph);
    return `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="700" viewBox="0 0 600 700">
        <rect width="600" height="700" fill="#fbecc9"/>
        <rect x="40" y="40" width="520" height="620" rx="8" fill="#fff" stroke="#3a2618" stroke-width="5"/>
        <rect x="70" y="70" width="460" height="440" fill="${G.PHOTO_BG[ph.season] || '#fff'}" stroke="#3a2618" stroke-width="3"/>
        <svg x="110" y="100" width="380" height="380" viewBox="${vbOf(a)}">${inner(a)}</svg>
        <text x="300" y="568" text-anchor="middle" font-family="Nunito, sans-serif" font-weight="900" font-size="34" fill="#3a2618">${xmlEsc(ph.title)}</text>
        <text x="300" y="612" text-anchor="middle" font-family="Nunito, sans-serif" font-weight="700" font-size="22" fill="#7a4a2a">Meuh · jour ${ph.day} · ${xmlEsc(G.photoDate(ph))}</text>
    </svg>`;
}

function postcardSvg() {
    const S = 92,
        Gp = 8,
        rows = Math.ceil(state.grid.filter(p => p.isUnlocked).length / COLS) || 1;
    const x0 = 400 - (COLS * S + (COLS - 1) * Gp) / 2,
        y0 = 330;
    const place = (a, x, y, w, h) => `<svg x="${x}" y="${y}" width="${w}" height="${h}" viewBox="${vbOf(a)}">${inner(a)}</svg>`;
    let plots = '';
    state.grid.slice(0, rows * COLS).forEach((p, i) => {
        const x = x0 + (i % COLS) * (S + Gp),
            y = y0 + Math.floor(i / COLS) * (S + Gp);
        if (!p.isUnlocked) return;
        const ground = p.terrain === 'plowed' ? (p.isWatered ? '#5e3a1e' : '#8f5d34') : '#9bd96f';
        plots += `<rect x="${x}" y="${y}" width="${S}" height="${S}" rx="12" fill="${ground}" stroke="#3a2618" stroke-width="3"/>`;
        if (p.deco && SPR.has.ui[p.deco]) plots += place(SPR.ui(p.deco), x + 6, y + 4, S - 12, S - 12);
        else if (p.itemId) plots += place(SPR.plant(p.itemId, G.plotStage(p)), x + 4, y - 14, S - 8, S);
    });
    const h = y0 + rows * (S + Gp) + 150;
    const sub = `Niveau ${state.level} · jour ${state.day} · ${G.season().name.toLowerCase()} · ${new Date(now()).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}`;
    return {
        w: 800,
        h,
        svg: `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="${h}" viewBox="0 0 800 ${h}">
        <rect width="800" height="${h}" fill="#fbecc9"/>
        <rect x="24" y="24" width="752" height="${h - 48}" rx="18" fill="${G.PHOTO_BG[G.season().id] || '#d8f0c0'}" stroke="#3a2618" stroke-width="5"/>
        <rect x="24" y="24" width="752" height="250" rx="18" fill="#bfe6fb" stroke="#3a2618" stroke-width="5"/>
        <path d="M27 230 Q200 180 400 214 Q600 246 773 200 L773 276 L27 276Z" fill="#9bd96f"/>
        ${place(SPR.farmhouse(G.houseLvl(), G.roofColor() || undefined), 300, 40, 200, 200)}
        <rect x="${x0 - 20}" y="${y0 - 22}" width="${COLS * S + (COLS - 1) * Gp + 40}" height="${rows * (S + Gp) + 30}" rx="24" fill="#82c95a" stroke="#3a2618" stroke-width="4"/>
        ${plots}
        <text x="400" y="${h - 80}" text-anchor="middle" font-family="Nunito, sans-serif" font-weight="900" font-size="44" fill="#3a2618">La ferme de Meuh</text>
        <text x="400" y="${h - 42}" text-anchor="middle" font-family="Nunito, sans-serif" font-weight="700" font-size="22" fill="#7a4a2a">${sub}</text>
    </svg>`,
    };
}

defineSheet('photo', {
    title: 'Souvenir',
    render(o) {
        const ph = (state.album || [])[+o.k];
        if (!ph) return '';
        return `<div class="polaroid big"><span class="ph-art" style="background:${G.PHOTO_BG[ph.season] || '#fff'}">${photoArt(ph)}</span><b>${ph.title}</b><small>${ph.sub ? ph.sub + ' · ' : ''}Jour ${ph.day} de la ferme · ${G.photoDate(ph)}</small></div>`;
    },
    foot: () => btn('Partager', { act: 'sharePhoto', kind: 'gold', wide: true, icon: ['ui', 'camera'] }),
});

defineSheet('postcard', {
    title: 'Carte postale',
    render: () => `<div class="postcard-preview">${postcardSvg().svg.replace(/width="800" height="\d+"/, 'width="100%"')}</div>`,
    foot: () => btn('Envoyer la carte', { act: 'sendPostcard', kind: 'gold', wide: true, icon: ['ui', 'share'] }),
});

export function setupInfo() {
    actions({
        chartTip: (el, d) => (sheetOpts('stats').tip = +d.i),
        guideSearch: (el, d) => {
            const o = sheetOpts('guide');
            o.q = d.value;
            const box = document.getElementById('guide-res');
            if (box) box.innerHTML = guideBody(o);
            return QUIET;
        },
        guidePage: (el, d) => {
            const o = sheetOpts('guide');
            o.q = '';
            o.page = d.p || '';
            o.allOpen = undefined;
        },
        guideExpand: el => {
            const o = sheetOpts('guide');
            const root = (el && el.closest && el.closest('#guide-res')) || document.getElementById('guide-res');
            if (!root) return QUIET;
            const secs = [...root.querySelectorAll('details.guide-sec')];
            if (!secs.length) return QUIET;
            const openAll = secs.some(d => !d.open);
            secs.forEach(d => (d.open = openAll));
            if (o) o.allOpen = openAll ? 'all' : 'none';
            if (el) el.textContent = openAll ? 'Tout replier' : 'Tout ouvrir';
            return QUIET;
        },
        guideCat: (el, d) => (sheetOpts('guide').cat = d.c),
        guideGo: (el, d) => {
            closeSheet('guide');
            closeSheet('menu');
            go(d.path);
        },
        guideMach: (el, d) => {
            const idx = state.machines.findIndex(x => x.type === d.id);
            closeAll();
            if (d.id === 'counter' && G.counterOwned()) return go('machines/counter');
            if (idx >= 0) {
                go('machines/workshop');
                openSheet('machine', { i: idx });
            } else {
                go('market/shop#machines');
            }
        },
        guideAnim: (el, d) => {
            const a = ANIMALS[d.id];
            closeAll();
            if (!a) return;
            if (a.oasis) return go('farm/island#oasis');
            if (a.nord) return go('farm/island#nord');
            if (a.asie) return go('farm/island#asie');
            const has = state.animals.some(x => x.type === a.id);
            go(has ? 'animals/pasture' : 'market/shop#animals');
        },
        sharePhoto: () => {
            const ph = (state.album || [])[+sheetOpts('photo').k];
            if (ph) shareSvg(photoSvg(ph), 600, 700, 'meuh-souvenir.png', `Meuh : ${ph.title}`, 'Photo enregistrée dans vos téléchargements');
        },
        sendPostcard: () => {
            const p = postcardSvg();
            shareSvg(p.svg, p.w, p.h, 'meuh-carte-postale.png', 'Une carte postale de ma ferme', 'Carte postale enregistrée dans vos téléchargements');
            state.stats.postcards = (state.stats.postcards || 0) + 1;
        },
    });
    // Synchroniser le libellé du bouton « Tout ouvrir / Tout replier » quand on ouvre/ferme un chapitre à la main
    document.addEventListener(
        'toggle',
        e => {
            const det = e.target;
            if (!det || !det.matches || !det.matches('details.guide-sec')) return;
            const root = det.closest('#guide-res');
            if (!root) return;
            const btnEl = root.querySelector('[data-act="guideExpand"]');
            if (!btnEl) return;
            const secs = [...root.querySelectorAll('details.guide-sec')];
            const allOpen = secs.length > 0 && secs.every(d => d.open);
            btnEl.textContent = allOpen ? 'Tout replier' : 'Tout ouvrir';
            const o = sheetOpts('guide');
            if (o) o.allOpen = allOpen ? 'all' : secs.every(d => !d.open) ? 'none' : undefined;
        },
        true,
    );
}
