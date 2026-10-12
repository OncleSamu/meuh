// Statistiques, mes bonus, le guide du fermier, une photo de l'album et la carte postale.
import { state } from '../../core/state.js';
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
import { GUIDE } from '../../data/texts.js';
import { RECORDS } from '../../data/meta.js';
import * as G from '../../systems/index.js';
import { actions, QUIET, esc } from '../dom.js';
import { ico, SPR } from '../icons.js';
import { btn, line, empty } from '../kit.js';
import { defineSheet, sheetOpts, closeSheet } from '../sheets.js';
import { go } from '../app.js';
import { photoArt } from './book.js';

// ---------------- statistiques ----------------
defineSheet('stats', {
    title: 'Statistiques',
    render(o) {
        const d = G.statsData();
        const tiles = `<div class="tiles">${d.tiles.map(([l, v]) => `<div class="tile"><b>${v}</b><span>${l}</span></div>`).join('')}</div>`;
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
                    <text x="${x + (bw - pad) / 2}" y="${H + 15}" text-anchor="middle" class="ax">J${day}</text></g>`;
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
                          `<div class="hbar">${ico(['item', id])}<span class="hname">${ITEMS[id].name}</span><div class="htrack"><i style="width:${Math.max(2, (v / tmax) * 100)}%"></i></div><span class="hval">${fmt(v)}</span></div>`,
                  )
                  .join('')
            : '<p class="card-sub">Vendez au marché pour voir ce qui rapporte le plus.</p>';
        const tot = Math.max(
            1,
            d.sources.reduce((a, [, v]) => a + v, 0),
        );
        const src = d.sources
            .map(
                ([l, v]) =>
                    `<div class="hbar"><span class="hname wide">${l}</span><div class="htrack"><i style="width:${Math.max(v ? 2 : 0, (v / tot) * 100)}%"></i></div><span class="hval">${Math.round((v / tot) * 100)} %</span></div>`,
            )
            .join('');
        const r = state.records || {};
        const recs = Object.entries(RECORDS)
            .map(([k, def]) => `<div class="rec-row">${ico(def.icon)}<span>${def.name}</span><b>${r[k] ? G.recordText(k, r[k]) : '—'}</b></div>`)
            .join('');
        const block = (t, h) => `<div class="chart-block"><div class="chart-title">${t}</div>${h}</div>`;
        return [
            ['tiles', tiles],
            ['days', block('Pièces gagnées par jour de jeu', chart)],
            ['top', block('Ce qui rapporte le plus à la vente', top)],
            [
                'src',
                block(
                    'D’où viennent vos pièces',
                    src + '<p class="card-sub">« Autres » regroupe les succès, cadeaux, trouvailles du chien, fêtes et contrats.</p>',
                ),
            ],
            ['rec', block('Records personnels', recs)],
        ];
    },
});

// ---------------- mes bonus ----------------
defineSheet('bonus', {
    title: 'Mes bonus',
    render: () =>
        `<p class="card-sub center">Le total de vos compétences, de l’équipement, des rubans et du village.</p><div class="lines">${G.bonusLines()
            .map(([icon, name, v, from]) => line(icon, `<div class="card-title">${name} <b>${G.bonusValue(v)}</b></div><div class="card-sub">${from}</div>`))
            .join('')}</div>`,
});

// ---------------- le guide ----------------
const norm = sv => String(sv).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

// d'où vient un produit, en une ligne
function itemSource(id) {
    const it = ITEMS[id];
    if (it.type === 'crop' && it.needProject)
        return `Graines au niveau ${it.reqLvl}, après « ${PROJECTS[it.needProject].name} »${it.ghOnly ? ', seulement dans la serre' : ''}`;
    if (it.type === 'crop') return it.exotic ? 'Graines chez le marchand ambulant' : `Champ, graines au niveau ${it.reqLvl}`;
    if (it.type === 'tree') return `Arbre fruitier du verger, niveau ${it.reqLvl}`;
    if (it.type === 'fish') return 'Pêche à l’étang';
    if (it.sea) return 'Filet de pêche en mer (Ferme | Nature), après le phare';
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
    if (['fossil', 'amethyst', 'nugget'].includes(id)) return 'Caché dans les rochers de la mine';
    return '';
}

// qui en veut en ce moment
function itemDemand(id) {
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
        ${btn('Produire', { act: 'produce', data: { id }, size: 'sm' })}</div>`;
}

const GUIDE_GO = {
    farm: 'farm/field',
    orchard: 'farm/orchard',
    island: 'farm/island',
    nature: 'farm/nature',
    animals: 'animals',
    machines: 'machines/workshop',
    quests: 'village/orders',
    shop: 'market/shop',
    market: 'market/sell',
    upgrades: 'sheet:progress',
};
function guidePage(g) {
    const locked = state.level < g.lvl;
    const path = GUIDE_GO[g.view] || 'farm/field';
    return `<button class="card guide-page${locked ? ' locked' : ''}"${locked ? '' : ` data-act="guideGo" data-path="${path}"`}>${ico(g.icon, 'ico big')}<span class="card-main"><span class="card-title">${g.name}${locked ? ` <small>niveau ${g.lvl}</small>` : ''}</span><span class="card-sub">${g.text}</span></span></button>`;
}

function guideResults(q) {
    q = norm(q || '').trim();
    if (q.length < 2)
        return `<p class="card-sub center">Cherchez un produit pour savoir où le faire et qui le demande, ou touchez une page.</p>${GUIDE.map(guidePage).join('')}`;
    const items = Object.keys(ITEMS)
        .filter(id => norm(ITEMS[id].name).includes(q) && ITEMS[id].type !== 'material')
        .slice(0, 8);
    const pages = GUIDE.filter(g => norm(g.name + ' ' + g.text).includes(q));
    return (
        (items.length ? `<div class="set-title">Produits</div>${items.map(itemCard).join('')}` : '') +
        (pages.length ? `<div class="set-title">Guide</div>${pages.map(guidePage).join('')}` : '') +
        (!items.length && !pages.length ? empty('Rien trouvé. Essayez « fromage », « grange » ou « concours ».') : '')
    );
}

defineSheet('guide', {
    cls: 'guide-sheet',
    title: 'Guide du fermier',
    render: o => [
        [
            'search',
            `<input type="search" class="search" placeholder="Chercher un produit ou un sujet…" autocomplete="off" data-input="guideSearch" value="${esc(o.q || '')}">`,
        ],
        ['res', `<div id="guide-res">${guideResults(o.q)}</div>`],
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
            if (box) box.innerHTML = guideResults(o.q);
            return QUIET;
        },
        guideGo: (el, d) => {
            closeSheet('guide');
            closeSheet('menu');
            go(d.path);
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
}
