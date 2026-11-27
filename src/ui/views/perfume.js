// 1.142 : Atelier | Parfums (L'Atelier du Parfumeur).
// Pyramide olfactive (Tête · Cœur · Fond), 3 méthodes d'extraction, 3 concentrations,
// macération active en 3 étapes avec soins, flacons SVG sur mesure, Salon de commandes et Orgue à remplir.
import { toast } from '../../core/bus.js';
import { state } from '../../core/state.js';
import { now } from '../../core/clock.js';
import { fmt, formatDuration } from '../../core/format.js';
import { QUALITY } from '../../data/farm.js';
import { VILLAGERS } from '../../data/village.js';
import { HONEYS } from '../../data/honey.js';
import {
    PERFUME_LVL,
    FACETS,
    FACET_COL,
    PERFUME_PAIRS,
    METHODS,
    METHOD_IDS,
    CONCENTRATIONS,
    CONC_IDS,
    STAGES,
    PERFUME_TOUCHES,
    PERFUME_SIGN,
    FAMILIES,
    FAMILY_IDS,
    HEAD_NOTES,
    HEART_NOTES,
    BASE_NOTES,
    PERFUME_CLASSICS,
    BOTTLES,
    BOTTLE_IDS,
    CAPS,
    CAP_IDS,
    PERFUME_ORGAN,
} from '../../data/perfume.js';
import { perfumeSvg } from '../../art/perfume.js';
import * as G from '../../systems/index.js';
import { blocks, actions, esc } from '../dom.js';
import { ico, art, qStar } from '../icons.js';
import { btn, bar, timer, empty, hint } from '../kit.js';
import { defineView, defineLive, ui } from '../app.js';
import { defineSheet, openSheet, closeSheet } from '../sheets.js';
import { page, filterOf, filterChips, listBar, sortOf, queryOf, matchQ } from '../pager.js';
import { renameBtn } from '../sheets/rename.js';
import { genWrap } from '../genlook.js';
import { innerTabs } from '../innertabs.js';

const COIN = () => ico(['ui', 'coin']);
const stars = n => `<span class="brew-stars">${[0, 1, 2].map(k => `<i class="${k < n ? 'on' : ''}">★</i>`).join('')}</span>`;
const varOf = id => state.genetics && state.genetics.vars && state.genetics.vars[id];
const honeyOf = id => (/^H[a-z]/.test(id) && HONEYS[id.slice(1)] ? id.slice(1) : null);
const noteIco = (id, cls = 'ico') =>
    honeyOf(id)
        ? ico(['item', 'honey_' + honeyOf(id)], cls)
        : varOf(id)
          ? `<i class="${cls}">${genWrap(art('item', varOf(id).g.form), varOf(id).g)}</i>`
          : ico(['item', id], cls);
const famBadge = f => {
    const d = FAMILIES[f] || FAMILIES.floral;
    return `<span class="pf-fam" style="background:color-mix(in srgb, ${d.col} 22%, var(--paper-l));border-color:${d.col}">${d.name}</span>`;
};

// ---------------- fermé avant niveau 54 ----------------
function closedCard() {
    return `<div class="card island-closed">
        <div class="ic-art">${perfumeSvg({ bottle: 'goutte', cap: 'or', color: '#c47dd9', stars: 3 })}</div>
        <div class="card-title">L’Atelier du Parfumeur</div>
        <p class="card-sub">Au niveau ${PERFUME_LVL}, composez vos propres parfums : pyramide olfactive (tête, cœur, fond), trois méthodes d’extraction, macération active et flacons sur mesure.</p>
    </div>`;
}

// ---------------- bandeau Parfum signature ----------------
function signatureHtml() {
    const sig = G.perfumeSignature();
    if (!sig) return '';
    const pct = Math.round(G.perfumeSignatureSalonBonus() * 100);
    return `<div class="card pf-sign">
        <span class="pf-vat-art">${perfumeSvg(sig)}</span>
        <div class="card-main">
            <div class="card-title">Parfum signature : ${esc(sig.name)} ${famBadge(sig.family)}</div>
            <div class="card-sub">+${pct} % sur toutes les ventes du Salon · +${PERFUME_SIGN.giftBonus} amitié quand vous l’offrez à un villageois</div>
        </div>
    </div>`;
}

// ---------------- les dame-jeannes de macération ----------------
defineLive('pvat', i => {
    const v = state.perfume && state.perfume.vats[i];
    if (!v || G.perfumeVatReady(v)) return 1;
    const tot = Math.max(1, v.stageSec * 1000);
    return Math.max(0, Math.min(1, 1 - Math.max(0, v.stageUntil - now()) / tot));
});

function vatsHtml() {
    const P = state.perfume;
    const nReady = P.vats.filter(G.perfumeVatReady).length;
    const all = nReady > 1 ? btn(`Tout mettre en flacon (${nReady})`, { act: 'bottleAllPerf', kind: 'green', wide: true }) : '';
    return `${all}<div class="pf-vats">${P.vats
        .map((v, i) => {
            if (!v) return `<div class="brew-vat empty">${ico(['ui', 'perfume'])}<span>Dame-jeanne libre</span></div>`;
            const p = P.creations[v.pid];
            const ready = G.perfumeVatReady(v);
            const canCare = G.perfumeVatCanCare(v);
            const st = !ready ? STAGES[v.stage] : null;
            const bonusPct = Math.round((typeof v.careBonus === 'number' && v.careBonus > 0 ? v.careBonus : (v.finesse || 0) * 0.12) * 100);
            const pips = STAGES.map((s, k) => `<i class="${k < v.stage ? 'done' : k === v.stage ? 'cur' : ''}${v.cared[k] ? ' cared' : ''}" title="${s.name}"></i>`).join('');
            const careBtns = canCare
                ? `<div class="pf-care-choices">${st.choices
                      .map(
                          ch =>
                              `<button class="btn sm ${ch.id === 'quick' ? 'gold' : 'pf-deep'}" data-act="carePerf" data-i="${i}" data-m="${ch.id}"><span>${esc(ch.name)}</span><small>${esc(ch.hint)}</small></button>`,
                      )
                      .join('')}</div>`
                : '';
            return `<div class="brew-vat pf-vat${ready ? ' ready' : canCare ? ' care' : ''}">
                <span class="pf-vat-art">${perfumeSvg(p)}</span>
                <div class="bv-main"><b>${esc(p.name)}</b>
                    <div class="pf-stages">${pips}<span>${ready ? `${v.n} flacons prêts · finesse ${v.finesse}/3${bonusPct ? ` (+${bonusPct} %)` : ''}` : `Étape ${v.stage + 1}/3 : ${st.name} · finesse ${v.finesse}/3${bonusPct ? ` (+${bonusPct} %)` : ''}`}</span></div>
                    ${ready ? '' : `${bar(0, 'thin', `pvat:${i}`)}<small>${timer(v.stageUntil)}</small>`}
                    ${careBtns}
                </div>
                <div class="bv-btns">${
                    ready
                        ? btn('Mettre en flacon', { act: 'bottlePerf', data: { i }, kind: 'green', size: 'sm' })
                        : canCare
                          ? ''
                          : '<span class="chip ok">Soigné</span>'
                }</div>
            </div>`;
        })
        .join('')}</div>`;
}

// ---------------- compositeur : pyramide olfactive ----------------
function facetBars(p) {
    const max = Math.max(8, ...p);
    return `<div class="brew-notes">${FACETS.map(
        (n, k) => `<div class="bn"><span>${n}</span><i><b style="width:${Math.round((p[k] / max) * 100)}%;background:${FACET_COL[k]}"></b></i></div>`,
    ).join('')}</div>`;
}

const TIER_META = [
    ['head', 'Note de tête', 'L’envolée fraîche'],
    ['heart', 'Note de cœur', 'L’âme du parfum'],
    ['base', 'Note de fond', 'Le sillage tenace'],
];

function composerHtml() {
    const P = state.perfume,
        d = P.draft,
        pv = G.perfumePreview();
    const qty = (CONCENTRATIONS[d.conc] || CONCENTRATIONS.fraiche).qty;
    const pyramid = TIER_META.map(([tier, label, sub]) => {
        const id = d[tier];
        const have = id ? G.perfumeNoteHave(id) : 0;
        const ok = have >= qty;
        return `<button class="pf-tier pf-t-${tier}${id ? '' : ' empty'}" data-act="perfPick" data-tier="${tier}">
            <span class="pf-t-tag">${label}</span>
            ${
                id
                    ? `<span class="pf-t-val">${noteIco(id, 'ico big')}<span><b>${esc(G.perfumeNoteName(id))}</b><small class="${ok ? 'ok' : 'short'}">${have}/${qty} en stock</small></span></span>`
                    : `<span class="pf-t-val"><b>+ Choisir</b><small>${sub}</small></span>`
            }
        </button>`;
    }).join('');

    const methods = METHOD_IDS.map(m => {
        const M = METHODS[m];
        return `<button class="${d.method === m ? 'on' : ''}" data-act="perfMethod" data-m="${m}"><span>${M.name}</span><small>${M.short}</small></button>`;
    }).join('');
    const concs = CONC_IDS.map(c => {
        const C = CONCENTRATIONS[c];
        return `<button class="${d.conc === c ? 'on' : ''}" data-act="perfConc" data-c="${c}"><span>${C.name}</span><small>×${C.qty} · ${C.bottles} fl.</small></button>`;
    }).join('');

    const bottles = BOTTLE_IDS.map(b => {
        const B = BOTTLES[b];
        return `<button class="pick-chip${d.bottle === b ? ' on' : ''}" data-act="perfBottle" data-b="${b}">${B.name}</button>`;
    }).join('');
    const caps = CAP_IDS.map(c => {
        const C = CAPS[c];
        return `<button class="pick-chip${d.cap === c ? ' on' : ''}" data-act="perfCap" data-c="${c}"><i class="swatch" style="background:${C.fill}"></i>${C.name}</button>`;
    }).join('');

    const fake = { bottle: d.bottle, cap: d.cap, color: pv.color, stars: pv.secret ? 0 : pv.harmony.stars, classic: pv.secret ? null : pv.harmony.classic };
    const costHtml = Object.entries(pv.cost)
        .map(([id, n]) => `<span class="${G.perfumeNoteHave(id) >= n ? 'ok' : 'short'}">${noteIco(id)}${G.perfumeNoteHave(id)}/${n}</span>`)
        .join('');
    const can = pv.ok3 && !pv.miss.length && pv.freeVat >= 0;

    return `<div class="card pf-compose">
        <div class="bc-row"><span class="bc-label">Pyramide olfactive</span><div class="pf-pyramid">${pyramid}</div></div>
        <div class="bc-row"><span class="bc-label">Méthode d’extraction</span><div class="seg n3">${methods}</div><small class="pf-hint">${METHODS[d.method].desc}</small></div>
        <div class="bc-row"><span class="bc-label">Concentration</span><div class="seg n3">${concs}</div><small class="pf-hint">${CONCENTRATIONS[d.conc].desc}</small></div>
        <div class="bc-row"><span class="bc-label">Flacon &amp; bouchon</span><div class="chips-row">${bottles}</div><div class="chips-row">${caps}</div></div>
        <div class="center">${btn('Meilleur accord avec mon stock', { act: 'perfBest', size: 'sm', icon: ['ui', 'sparkle'] })}</div>
        ${
            pv.ok3
                ? `<div class="brew-preview pf-preview"><div class="bp-art">${perfumeSvg(fake)}</div><div class="bp-main">
                    <div class="bp-name">${esc(pv.name)} ${famBadge(pv.family)} ${pv.known ? '<span class="chip">déjà créée</span>' : '<span class="chip ok">nouvelle !</span>'}</div>
                    ${
                        pv.secret
                            ? `<div class="bp-stars">Accord <b class="brew-secret">? ? ?</b> <small>à découvrir à la mise en flacon</small></div>`
                            : `<div class="bp-stars">Accord ${stars(pv.harmony.stars)}${pv.harmony.classic ? ' <span class="chip ok">Grand classique</span>' : ''}</div>`
                    }
                    <ul class="bp-why">${pv.harmony.reasons.map(r => `<li>${esc(r)}</li>`).join('')}</ul>
                    ${facetBars(pv.profile)}
                    <div class="cost">${costHtml}</div>
                    <div class="card-sub">${pv.bottles} flacons${pv.secret ? '' : ` dès ${fmt(pv.value)}${COIN()}`} · 3 étapes (${formatDuration(pv.totalSec)})${pv.q ? ` · ${qStar(pv.q)} ${QUALITY[pv.q].name}` : ''}</div>
                </div></div>`
                : '<p class="hint">Choisissez une note de tête, une note de cœur et une note de fond pour composer votre parfum.</p>'
        }
        ${
            can
                ? btn('Lancer la macération', { act: 'perfStart', kind: 'green', wide: true, size: 'lg', icon: ['ui', 'perfume'] })
                : `<p class="state-line">${pv.freeVat < 0 ? 'Toutes les dame-jeannes sont occupées : attendez la fin d’une macération.' : !pv.ok3 ? 'Complétez les trois étages de la pyramide.' : `Il manque : ${pv.miss.map(([id, n]) => `${n - G.perfumeNoteHave(id)} ${esc(G.perfumeNoteName(id).toLowerCase())}`).join(', ')}.`}</p>`
        }
    </div>${guideHtml()}`;
}

function guideHtml() {
    const organ = (state.perfume && state.perfume.organ) || {};
    const goodPairs = Object.entries(PERFUME_PAIRS)
        .filter(([, v]) => v > 0)
        .map(([k]) => k.split('-').map(Number));
    const badPairs = Object.entries(PERFUME_PAIRS)
        .filter(([, v]) => v < 0)
        .map(([k]) => k.split('-').map(Number));
    const pill = i => `<span class="bg-note"><i style="background:${FACET_COL[i]}"></i>${FACETS[i]}</span>`;
    const nFound = PERFUME_CLASSICS.filter(c => organ['C:' + c.id]).length;
    return `<details class="card brew-guide"><summary><b>Guide des accords &amp; grands classiques</b><small>${nFound}/${PERFUME_CLASSICS.length} classiques trouvés</small></summary>
        <div class="bg-body">
            <div class="bg-sec"><b>Accords harmonieux (+1 ★)</b><div class="bg-pairs">${goodPairs.map(([a, b]) => `<span class="bg-pair ok">${pill(a)} + ${pill(b)}</span>`).join('')}</div></div>
            <div class="bg-sec"><b>Facettes qui se heurtent (−1 ★)</b><div class="bg-pairs">${badPairs.map(([a, b]) => `<span class="bg-pair bad">${pill(a)} × ${pill(b)}</span>`).join('')}</div></div>
            <div class="bg-sec"><b>Grands classiques (${nFound}/${PERFUME_CLASSICS.length})</b><ul class="bg-cls">${PERFUME_CLASSICS.map(c => {
                const ok = !!organ['C:' + c.id];
                return `<li class="${ok ? 'ok' : ''}"><b>${ok ? '✓ ' : ''}${esc(c.name)}</b> — <small>${esc(ok ? c.text : c.hint)}</small></li>`;
            }).join('')}</ul></div>
        </div></details>`;
}

// ---------------- mes flacons ----------------
function bottlesHtml() {
    const all = G.myPerfumes();
    if (!all.length) return empty('Vos parfums créés apparaîtront ici, avec leur flacon et leur nom.');
    const inStock = all.filter(p => G.perfumeStock(p.id) > 0);
    const favs = all.filter(p => G.isPerfumeFav(p.id));
    const top = all.filter(p => p.stars >= 3);
    const opts = [
        ['stock', 'En stock', inStock.length],
        ['fav', 'Carnet', favs.length],
        ['top', '3 étoiles', top.length],
        ['all', 'Tous', all.length],
    ];
    const f = filterOf('perfumes', opts);
    const q = queryOf('perfumes');
    const list = (f === 'stock' ? inStock : f === 'fav' ? favs : f === 'top' ? top : [...all])
        .filter(p => matchQ(q, p.name, FAMILIES[p.family]?.name || '', G.perfumeNoteName(p.head), G.perfumeNoteName(p.heart), G.perfumeNoteName(p.base)))
        .sort((a, b) => G.perfumeStock(b.id) - G.perfumeStock(a.id) || b.stars - a.stars || b.value - a.value);
    const pg = page('perfumes:' + f, list, 10);
    return (
        filterChips('perfumes', opts, f) +
        (list.length ? '' : empty('Aucun parfum ne correspond.')) +
        pg.top +
        `<div class="list">${pg.items
            .map(p => {
                const n = G.perfumeStock(p.id);
                const pq = n ? G.perfumeQual(p.id) : null;
                const chips = pq
                    ? [
                          [4, 'd'],
                          [3, 'p'],
                          [2, 'g'],
                          [1, 's'],
                      ]
                          .map(([r, k]) => (pq[k] ? `<span class="qchip">${qStar(r)}${pq[k]}</span>` : ''))
                          .join('')
                    : '';
                const price = G.perfumePrice(p.id),
                    low = price < p.value;
                const side =
                    `<b class="bb-n">×${n}</b><small class="${low ? 'bb-low' : ''}">${fmt(price)}${COIN()}${low ? ' ↓' : ''}</small>` +
                    (n
                        ? btn('Vendre', { act: 'sellPerf', data: { id: p.id, n: 1 }, size: 'sm' }) +
                          (n > 1 ? btn('Tout vendre', { act: 'sellPerf', data: { id: p.id, n }, kind: 'gold', size: 'sm' }) : '')
                        : '');
                const isSig = state.perfume && state.perfume.signature === p.id;
                const canSig = p.made > 0 && p.stars >= PERFUME_SIGN.minStars;
                const touch = p.touch && PERFUME_TOUCHES[p.touch];
                const sub = `${stars(p.stars)} ${famBadge(p.family)} <span class="chip">${CONCENTRATIONS[p.conc]?.name || ''}</span>${p.classic ? ' <span class="chip ok">Classique</span>' : ''}${touch ? ` <span class="chip pf-touch">${touch}</span>` : ''}${isSig ? ' <span class="chip pf-sig-chip">Signature</span>' : ''}${chips}
                    <div class="pf-notes-mini">${noteIco(p.head)} ${noteIco(p.heart)} ${noteIco(p.base)} <small>· ${METHODS[p.method]?.name || ''}</small></div>`;
                const again = `<div class="bb-again">${btn('Recomposer', { act: 'perfLoad', data: { id: p.id }, kind: 'green', size: 'sm', icon: ['ui', 'loop'] })}${canSig ? btn(isSig ? 'Signature ✓' : 'Signature', { act: 'perfSign', data: { id: p.id }, kind: isSig ? 'gold' : '', size: 'sm', title: 'Désigner comme Parfum signature de la ferme' }) : ''}${n > 0 && G.vaultOpen() ? btn('Au coffre', { act: 'vaultPerf', data: { id: p.id }, size: 'sm', icon: ['ui', 'vault'] }) : ''}<button class="fav-star${G.isPerfumeFav(p.id) ? ' on' : ''}" data-act="perfFav" data-id="${p.id}" aria-label="Favori">${G.isPerfumeFav(p.id) ? '★' : '☆'}</button></div>`;
                return `<div class="card brew-beer${n ? '' : ' none'}"><div class="card-art">${perfumeSvg(p)}</div><div class="card-main"><div class="card-title">${esc(p.name)} ${renameBtn('perfume', p.id, 'Renommer le parfum')}</div><div class="card-sub">${sub}</div>${again}</div><div class="card-side">${side}</div></div>`;
            })
            .join('')}</div>${pg.more}`
    );
}

// ---------------- Salon : commandes « Portrait olfactif » ----------------
function salonHtml() {
    const P = state.perfume;
    if (!P.orders.length) return empty('Aucun client au salon pour le moment : les amateurs de parfums arrivent régulièrement.');
    return `${hint('Chaque client décrit un portrait olfactif. Livrez un flacon de votre stock qui correspond pour un prix majoré (+75 %), de l’amitié et de la renommée.')}<div class="list">${P.orders
        .map(o => {
            const matches = G.perfumeOrderMatches(o);
            const best = matches[0];
            const v = VILLAGERS[o.vid];
            return `<div class="card brew-order${best ? ' ready' : ''}"><div class="card-art">${art('villager', o.vid)}</div><div class="card-main"><div class="card-title">${v ? v.name : 'Visiteur'} ${famBadge(o.family)}</div>
                <div class="card-sub">« Je cherche ${esc(G.perfumeOrderText(o))}. »</div>
                ${best ? `<div class="card-sub">Avec : <b>${esc(best.name)}</b> · ${fmt(G.perfumeOrderPay(o, best.id))}${COIN()}</div>` : '<div class="card-sub">Aucun flacon en stock ne convient encore.</div>'}</div>
                <div class="card-side">${btn('Livrer', { act: 'perfOrder', data: { id: o.id }, kind: 'green', size: 'sm', disabled: !best })}${btn('', { act: 'perfDrop', data: { id: o.id }, icon: ['ui', 'cross'], kind: 'ghost', size: 'sm', title: 'Refuser' })}</div></div>`;
        })
        .join('')}</div>`;
}

// ---------------- L'Orgue du Parfumeur ----------------
function organHtml() {
    const P = state.perfume;
    const found = G.organCount(),
        tot = G.organTotal(),
        claim = G.organClaimable();
    const tierRow = (title, ids) =>
        `<div class="pf-org-sec"><h4>${title} (${ids.filter(id => P.organ[id]).length}/${ids.length})</h4><div class="pf-org-grid">${ids
            .map(id => `<span class="pf-org-cell${P.organ[id] ? ' ok' : ''}" title="${esc(G.perfumeNoteName(id))}">${noteIco(id)}<span>${esc(G.perfumeNoteName(id))}</span></span>`)
            .join('')}</div></div>`;
    return `<div class="card">
        <div class="card-head">${ico(['ui', 'perfume'], 'ico big')}<div class="card-main"><div class="card-title">L’Orgue du Parfumeur · ${found} / ${tot}</div><div class="card-sub">Une récompense toutes les ${PERFUME_ORGAN.step} découvertes (essences, familles et classiques) ; +1 ruban une fois complet.</div></div></div>
        ${bar(tot ? found / tot : 0)}
        ${claim ? btn(`Réclamer (${claim} palier${claim > 1 ? 's' : ''})`, { act: 'perfOrganClaim', kind: 'gold', wide: true }) : ''}
        <div class="pf-org-sec"><h4>Familles olfactives (${FAMILY_IDS.filter(f => P.organ['F:' + f]).length}/${FAMILY_IDS.length})</h4><div class="chips-row">${FAMILY_IDS.map(f => `<span class="pick-chip${P.organ['F:' + f] ? ' on' : ''}">${FAMILIES[f].name}</span>`).join('')}</div></div>
        <div class="pf-org-sec"><h4>Grands classiques (${PERFUME_CLASSICS.filter(c => P.organ['C:' + c.id]).length}/${PERFUME_CLASSICS.length})</h4><div class="chips-row">${PERFUME_CLASSICS.map(c => `<span class="pick-chip${P.organ['C:' + c.id] ? ' on' : ''}">${P.organ['C:' + c.id] ? '★ ' : ''}${c.name}</span>`).join('')}</div></div>
        ${tierRow('Notes de tête', HEAD_NOTES)}
        ${tierRow('Notes de cœur', HEART_NOTES)}
        ${tierRow('Notes de fond', BASE_NOTES)}
    </div>`;
}

// ---------------- vue principale ----------------
function renderPerfume(el) {
    if (!G.perfumeOpen()) return blocks(el, [['closed', closedCard()]]);
    G.ensurePerfume();
    const ready = G.perfumeReadyCount() + G.perfumeCareCount();
    const ord = G.perfumeOrdersReady();
    const org = G.organClaimable();
    const T = innerTabs(
        'perfume',
        [
            ['compose', 'Composer', null, ready],
            ['bottles', 'Flacons', null, 0],
            ['salon', 'Salon', null, ord],
            ['organ', 'Orgue', null, org],
        ],
        'compose',
    );
    const t = T.cur;
    const perfCount = state.perfume && state.perfume.creations ? Object.keys(state.perfume.creations).length : 0;
    blocks(el, [
        ['tabs', T.html],
        ['sign', signatureHtml()],
        ['vats', t === 'compose' ? vatsHtml() : ''],
        ['compose', t === 'compose' ? composerHtml() : ''],
        ['bottlesSearch', t === 'bottles' && perfCount > 5 ? listBar('perfumes', { search: 'Chercher un parfum ou une note' }) : ''],
        ['bottles', t === 'bottles' ? bottlesHtml() : ''],
        ['salon', t === 'salon' ? salonHtml() : ''],
        ['organ', t === 'organ' ? organHtml() : ''],
    ]);
}
defineView('machines/perfume', renderPerfume);

// ---------------- feuille de choix d'une essence ----------------
const NOTE_SORTS = [
    ['stock', 'En stock d’abord'],
    ['name', 'Nom (A à Z)'],
];
defineSheet('perfPick', {
    title: o => `Choisir une ${o.tier === 'head' ? 'note de tête' : o.tier === 'heart' ? 'note de cœur' : 'note de fond'}`,
    render(o) {
        const tier = o.tier || 'head';
        const baseIds = tier === 'head' ? HEAD_NOTES : tier === 'heart' ? HEART_NOTES : BASE_NOTES;
        const specials = G.perfumeTierSpecials(tier);
        const all = [...baseIds, ...specials];
        const q = queryOf('perfNote');
        const sort = sortOf('perfNote', NOTE_SORTS);
        const opts = [
            ['stock', 'En stock', all.filter(id => G.perfumeNoteHave(id) > 0).length],
            ['all', 'Toutes', all.length],
            ...(specials.length ? [['spec', 'Variétés & miels', specials.length]] : []),
        ];
        const f = filterOf('perfNote', opts);
        const cur = state.perfume && state.perfume.draft[tier];
        const list = (f === 'stock' ? all.filter(id => G.perfumeNoteHave(id) > 0) : f === 'spec' ? specials : all)
            .filter(id => matchQ(q, G.perfumeNoteName(id)))
            .sort((a, b) => (sort === 'name' ? 0 : G.perfumeNoteHave(b) - G.perfumeNoteHave(a)) || G.perfumeNoteName(a).localeCompare(G.perfumeNoteName(b), 'fr'));
        const cells = list
            .map(id => {
                const vec = G.perfumeNoteVec(id);
                const top = FACETS[vec.indexOf(Math.max(...vec))];
                const have = G.perfumeNoteHave(id);
                return `<button class="pick-cell${cur === id ? ' locked' : ''}" data-act="perfSet" data-tier="${tier}" data-id="${id}">${noteIco(id, 'ico big')}<b>${esc(G.perfumeNoteName(id))}</b><small>×${have} · ${top}</small></button>`;
            })
            .join('');
        return [
            ['search', listBar('perfNote', { search: 'Chercher une essence', sorts: NOTE_SORTS })],
            ['chips', filterChips('perfNote', opts, f)],
            ['cells', list.length ? `<div class="pick-grid">${cells}</div>` : empty('Aucune essence ne correspond.')],
        ];
    },
});

export function setupPerfume() {
    actions({
        perfPick: (el, d) => openSheet('perfPick', { tier: d.tier }),
        perfSet: (el, d) => {
            if (G.setPerfumeNote(d.tier, d.id)) closeSheet('perfPick');
        },
        perfMethod: (el, d) => G.setPerfumeMethod(d.m),
        perfConc: (el, d) => G.setPerfumeConc(d.c),
        perfBottle: (el, d) => G.setPerfumeBottle(d.b),
        perfCap: (el, d) => G.setPerfumeCap(d.c),
        perfBest: () => {
            const b = G.applyBestPerfume();
            if (!b) toast('Pas assez d’essences en stock pour composer une pyramide complète', ['ui', 'perfume']);
            else toast('Voici le meilleur accord avec vos essences en stock', ['ui', 'sparkle']);
        },
        perfStart: el => G.startPerfume(el),
        carePerf: (el, d) => G.carePerfumeVat(+d.i, d.m || 'quick', el),
        bottlePerf: (el, d) => G.bottlePerfume(+d.i, el),
        bottleAllPerf: el => state.perfume.vats.forEach((v, i) => G.perfumeVatReady(v) && G.bottlePerfume(i, el)),
        sellPerf: (el, d) => G.sellPerfume(d.id, +d.n, el),
        perfFav: (el, d) => G.togglePerfumeFav(d.id),
        perfSign: (el, d) => G.setPerfumeSignature(d.id),
        perfLoad: (el, d) => {
            if (G.loadPerfumeDraft(d.id)) ui.sel['it:perfume'] = 'compose';
        },
        perfOrder: (el, d) => G.deliverPerfumeOrder(d.id, null, el),
        perfDrop: (el, d) => G.dismissPerfumeOrder(d.id),
        perfOrganClaim: el => G.claimOrgan(el),
    });
}
