// 1.178 : Atelier | Confiserie (Chocolat, Caramel & Berlingots).
// Présentation alignée sur la Brasserie : Confectionner (Chocolat / Caramel / Berlingots),
// Créations, Commandes et Grimoire — avec 3 mini-jeux tactiles inédits, chaudrons passifs,
// variétés du Labo, miels de fleurs, cadeaux & Coffre-fort.

import { toast } from '../../core/bus.js';
import { state } from '../../core/state.js';
import { now } from '../../core/clock.js';
import { fmt, formatDuration } from '../../core/format.js';
import { QUALITY } from '../../data/farm.js';
import { VILLAGERS } from '../../data/village.js';
import { HONEYS } from '../../data/honey.js';
import {
    CONF_LVL,
    CONF_KINDS,
    CONF_KIND_IDS,
    CONF_SHAPES,
    CONF_NOTE_COL,
    CONF_CLASSICS,
    CONF_GRIMOIRE,
    CONF_PREFS,
} from '../../data/confiserie.js';
import { confSvg } from '../../art/confiserie.js';
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
import { launchConfMini } from '../confmini.js';

const COIN = () => ico(['ui', 'coin']);
const NOTE_NAMES = ['Sucré', 'Acidulé', 'Amer', 'Épicé', 'Riche'];
const stars = n => `<span class="brew-stars">${[0, 1, 2].map(k => `<i class="${k < n ? 'on' : ''}">★</i>`).join('')}</span>`;
const varOf = id => state.genetics && state.genetics.vars && state.genetics.vars[id];
const honeyOf = id => (typeof id === 'string' && /^H[a-z]/.test(id) && HONEYS[id.slice(1)] ? id.slice(1) : null);

function ingIco(id, cls = 'ico') {
    const h = honeyOf(id);
    if (h) return ico(['item', 'honey_' + h], cls);
    const v = varOf(id);
    if (v && v.g) return `<i class="${cls}">${genWrap(art('item', v.g.form), v.g)}</i>`;
    return ico(['item', id], cls);
}

const topNoteIdx = vec => {
    let best = 0;
    for (let i = 1; i < 5; i++) if ((vec[i] || 0) > (vec[best] || 0)) best = i;
    return best;
};

const currentKind = () => (CONF_KIND_IDS.includes(ui.sel.confKind) ? ui.sel.confKind : 'chocolate');

// ---------------- Fermé avant niveau 54 ----------------
function closedCard() {
    return `<div class="card island-closed">
        <div class="ic-art">${confSvg({ kind: 'chocolate', shape: 'tablette', baseCol: '#4a2614', baseCol2: '#2e1508', accentCol: '#f4c542', mirror: true, classic: true })}</div>
        <div class="card-title">L’Atelier Confiserie</div>
        <p class="card-sub">Au niveau ${CONF_LVL}, créez chocolats, caramels (y compris aux miels de fleurs) et berlingots avec vos récoltes et variétés du Labo, à travers trois mini-jeux inédits.</p>
    </div>`;
}

// ---------------- Chaudrons passifs ----------------
defineLive('ck', i => {
    const k = state.confiserie && state.confiserie.kettles && state.confiserie.kettles[i];
    if (!k) return 0;
    if (k.ready || now() >= k.until) return 1;
    const tot = Math.max(1, k.until - k.start);
    return Math.max(0, Math.min(1, 1 - Math.max(0, k.until - now()) / tot));
});

function kettlesHtml() {
    const C = state.confiserie;
    const nReady = G.confReadyCount();
    const allBtn = nReady > 1 ? btn(`Tout récolter (${nReady})`, { act: 'confCollectAll', kind: 'green', wide: true }) : '';
    return `${allBtn}<div class="cf-kettles">${C.kettles
        .map((k, i) => {
            if (!k) return `<div class="brew-vat empty">${ico(['ui', 'confiserie'])}<span>Chaudron libre</span></div>`;
            const ready = k.ready || now() >= k.until;
            const p = k.pv;
            return `<div class="brew-vat cf-kettle${ready ? ' ready' : ''}">
                <span class="cf-k-art">${confSvg(p)}</span>
                <div class="bv-main"><b>${esc(p.name)}</b>
                    <div class="card-sub">${ready ? `${p.batch} pièces prêtes` : `${CONF_KINDS[k.kind]?.name || 'Cuisson'} · ${p.batch} pièces`}</div>
                    ${ready ? '' : `${bar(0, 'thin', `ck:${i}`)}<small>${timer(k.until)}</small>`}
                </div>
                <div class="bv-btns">${ready ? btn('Récolter', { act: 'confCollect', data: { i }, kind: 'green', size: 'sm' }) : '<span class="chip">En cours</span>'}</div>
            </div>`;
        })
        .join('')}</div>`;
}

// ---------------- Compositeur (Confectionner : Chocolat / Caramel / Berlingots) ----------------
function composerHtml(kind) {
    const d = G.confDraft(kind);
    const kDef = CONF_KINDS[kind];
    const pv = G.confPreview(kind);
    const bases = G.confBasesFor(kind);
    const shapes = Object.values(CONF_SHAPES).filter(s => s.kind === kind);

    const kindSeg = `<div class="bc-row">
        <span class="bc-label">Confiserie</span>
        <div class="seg n3">${CONF_KIND_IDS.map(
            id => `<button class="${id === kind ? 'on' : ''}" data-act="confKind" data-k="${id}">${esc(CONF_KINDS[id].name)}</button>`,
        ).join('')}</div>
        <small class="pf-hint">${esc(kDef.title)} — ${esc(kDef.miniDesc)}</small>
    </div>`;

    const basesHtml = bases
        .map(bId => {
            const b = G.confBaseDef(bId);
            return `<button class="pick-chip${d.base === bId ? ' on' : ''}" data-act="confBase" data-k="${kind}" data-b="${bId}"><i class="swatch" style="background:${b.col}"></i>${esc(b.short)}</button>`;
        })
        .join('');

    const shapesHtml = shapes
        .map(s => {
            const mini = confSvg({ kind, shape: s.id, baseCol: pv.baseCol, baseCol2: pv.baseCol2, accentCol: pv.accentCol });
            return `<button class="cf-shape-btn${d.shape === s.id ? ' on' : ''}" data-act="confShape" data-k="${kind}" data-s="${s.id}"><span class="cf-sh-ico">${mini}</span><span>${esc(s.name)}</span></button>`;
        })
        .join('');

    // Cases ingrédients calquées sur la Brasserie (.brew-slots / .brew-slot) : nom complet + croix parfaitement centrée
    const ingSlots = Array.from({ length: kDef.maxIngs }, (_, idx) => {
        const id = d.ings[idx];
        if (!id) {
            return `<button class="brew-slot empty" data-act="confPick" data-k="${kind}"><b>+</b><span>Ingrédient</span></button>`;
        }
        const have = G.confIngHave(id);
        const top = NOTE_NAMES[topNoteIdx(G.confIngFlavor(id))] || '';
        return `<div class="brew-slot">
            <button class="bs-pick" data-act="confPick" data-k="${kind}">${ingIco(id, 'ico big')}<span>${esc(G.confIngName(id))}${varOf(id) ? ' <small class="chip ok">variété</small>' : ''}</span><small class="${have >= 2 ? '' : 'short'}">${have}/2 en stock · ${top}</small></button>
            ${btn('', { act: 'confToggleIng', data: { k: kind, id }, icon: ['ui', 'cross'], kind: 'ghost', size: 'sm', title: 'Retirer' })}
        </div>`;
    }).join('');

    const costHtml = Object.entries(pv.cost)
        .map(([id, n]) => {
            const have = G.confIngHave(id);
            return `<span class="${have >= n ? 'ok' : 'short'}">${ingIco(id)}${have}/${n}</span>`;
        })
        .join('');

    const fake = {
        kind,
        shape: d.shape,
        baseCol: pv.baseCol,
        baseCol2: pv.baseCol2,
        accentCol: pv.accentCol,
        mirror: false,
        classic: !!pv.harmony.classic,
    };

    const canKettle = pv.can && pv.freeKettle >= 0;

    return `<div class="card brew-compose cf-compose">
        ${kindSeg}
        <div class="bc-row">
            <span class="bc-label">Base${kind === 'caramel' ? ' (beurre, crème ou miel de fleur)' : ''}</span>
            <div class="chips-row">${basesHtml}</div>
            <small class="pf-hint">${esc(pv.baseDef.name)} — ${esc(pv.baseDef.text)}</small>
        </div>
        <div class="bc-row">
            <span class="bc-label">Forme &amp; moule</span>
            <div class="cf-shapes">${shapesHtml}</div>
        </div>
        <div class="bc-row">
            <span class="bc-label">Ingrédients (${d.ings.length}/${kDef.maxIngs})</span>
            <div class="brew-slots">${ingSlots}</div>
        </div>
        <div class="center cf-tools">
            ${btn('Meilleur accord avec mon stock', { act: 'confBest', data: { k: kind }, size: 'sm', icon: ['ui', 'sparkle'] })}
            ${d.ings.length ? btn('Vider', { act: 'confClear', data: { k: kind }, size: 'sm', kind: 'ghost' }) : ''}
        </div>
        ${
            d.ings.length
                ? `<div class="brew-preview cf-preview">
                    <div class="bp-art">${confSvg(fake)}</div>
                    <div class="bp-main">
                        <div class="bp-name">${esc(pv.name)}${pv.harmony.classic ? ' <span class="chip ok">Grand Classique</span>' : ''}</div>
                        <div class="bp-stars">Accord ${stars(pv.harmony.stars)}</div>
                        <ul class="bp-why">${pv.harmony.reasons.map(r => `<li>${esc(r)}</li>`).join('')}</ul>
                        <div class="cost">${costHtml}</div>
                        <div class="card-sub">${pv.batch} pièces · ~${fmt(pv.value)}${COIN()}/pièce · cuisson ${formatDuration(pv.time)}${pv.q ? ` · ${qStar(pv.q)} ${QUALITY[pv.q].name}` : ''}</div>
                    </div>
                </div>`
                : '<p class="hint">Choisissez au moins un ingrédient de votre ferme pour composer votre recette.</p>'
        }
        ${
            pv.can
                ? `<div class="cf-go-row">
                    ${btn(`${kDef.miniName} · instantané`, { act: 'confMini', data: { k: kind }, kind: 'gold', wide: true, size: 'lg', icon: ['ui', 'sparkle'] })}
                    ${btn(canKettle ? `Cuire au chaudron (${formatDuration(pv.time)})` : 'Chaudrons pleins', { act: 'confKettle', data: { k: kind }, kind: 'green', wide: true, size: 'lg', disabled: !canKettle })}
                </div>
                <p class="pf-hint cf-mini-tip">3★ au mini-jeu : Finition Miroir (+30 % valeur et +1 qualité, jusqu’à Diamant).</p>`
                : `<p class="state-line">${
                      !d.ings.length
                          ? 'Ajoutez au moins un ingrédient pour lancer une fournée.'
                          : `Il manque : ${pv.miss.map(([id, n]) => `${Math.max(1, n - G.confIngHave(id))} ${G.confIngName(id).toLowerCase()}`).join(', ')}.`
                  }</p>`
        }
    </div>${classicsGuideHtml(kind)}`;
}

function classicsGuideHtml(kind) {
    const gr = (state.confiserie && state.confiserie.grimoire) || {};
    const list = CONF_CLASSICS.filter(c => c.kind === kind);
    const nFound = list.filter(c => gr['C:' + c.id]).length;
    return `<details class="card brew-guide cf-guide">
        <summary><b>Grands Classiques · ${esc(CONF_KINDS[kind].name)}</b><small>${nFound}/${list.length} découverts</small></summary>
        <div class="bg-body">
            <ul class="bg-cls">${list
                .map(c => {
                    const ok = !!gr['C:' + c.id];
                    return `<li class="${ok ? 'ok' : ''}"><b>${ok ? '✓ ' : ''}${esc(c.name)}</b> — <small>${esc(ok ? c.text : c.hint)}</small></li>`;
                })
                .join('')}</ul>
        </div>
    </details>`;
}

// ---------------- Mes créations (stock) ----------------
function stockHtml() {
    const all = G.myConfs();
    if (!all.length) return empty('Vos chocolats, caramels et berlingots apparaîtront ici dès votre première fournée.');
    const inStock = all.filter(c => G.confStock(c.id) > 0);
    const favs = all.filter(c => G.isConfFav(c.id));
    const choco = all.filter(c => c.kind === 'chocolate');
    const cara = all.filter(c => c.kind === 'caramel');
    const berl = all.filter(c => c.kind === 'berlingot');
    const opts = [
        ['stock', 'En stock', inStock.length],
        ['fav', 'Favoris', favs.length],
        ['chocolate', 'Chocolat', choco.length],
        ['caramel', 'Caramel', cara.length],
        ['berlingot', 'Berlingots', berl.length],
        ['all', 'Toutes', all.length],
    ];
    const f = filterOf('confs', opts);
    const q = queryOf('confs');
    const src =
        f === 'stock'
            ? inStock
            : f === 'fav'
              ? favs
              : f === 'chocolate'
                ? choco
                : f === 'caramel'
                  ? cara
                  : f === 'berlingot'
                    ? berl
                    : [...all];
    const list = src
        .filter(c => matchQ(q, c.name, CONF_KINDS[c.kind]?.name || '', ...(c.ings || []).map(G.confIngName)))
        .sort((a, b) => G.confStock(b.id) - G.confStock(a.id) || b.stars - a.stars || b.value - a.value);
    const pg = page('confs:' + f, list, 10);
    return (
        filterChips('confs', opts, f) +
        (list.length ? '' : empty('Aucune confiserie ne correspond.')) +
        pg.top +
        `<div class="list">${pg.items
            .map(c => {
                const n = G.confStock(c.id);
                const cq = n ? G.confQual(c.id) : null;
                const chips = cq
                    ? [
                          [4, 'd'],
                          [3, 'p'],
                          [2, 'g'],
                          [1, 's'],
                      ]
                          .map(([r, k]) => (cq[k] ? `<span class="qchip">${qStar(r)}${cq[k]}</span>` : ''))
                          .join('')
                    : '';
                const price = G.confPrice(c.id);
                const low = price < c.value;
                const side =
                    `<b class="bb-n">×${n}</b><small class="${low ? 'bb-low' : ''}">${fmt(price)}${COIN()}${low ? ' ↓' : ''}</small>` +
                    (n
                        ? btn('Vendre', { act: 'sellConf', data: { id: c.id, n: 1 }, size: 'sm' }) +
                          (n > 1 ? btn('Tout vendre', { act: 'sellConf', data: { id: c.id, n }, kind: 'gold', size: 'sm' }) : '')
                        : '');
                const sub = `${stars(c.stars)} <span class="chip">${esc(CONF_KINDS[c.kind]?.name || '')}</span>${c.classic ? ' <span class="chip ok">Classique</span>' : ''}${c.mirror ? ' <span class="chip cf-mirror">Miroir</span>' : ''}${chips}
                    <div class="pf-notes-mini">${(c.ings || []).map(id => `${ingIco(id)} <small>${esc(G.confIngName(id))}</small>`).join(' · ')}</div>`;
                const again = `<div class="bb-again">
                    ${btn('Recomposer', { act: 'confLoad', data: { id: c.id }, kind: 'green', size: 'sm', icon: ['ui', 'loop'] })}
                    ${n > 0 ? btn('Offrir', { act: 'confGiftOpen', data: { id: c.id }, size: 'sm', icon: ['ui', 'gift'] }) : ''}
                    ${n > 0 && G.vaultOpen() ? btn('Au coffre', { act: 'vaultConf', data: { id: c.id }, size: 'sm', icon: ['ui', 'vault'] }) : ''}
                    <button class="fav-star${G.isConfFav(c.id) ? ' on' : ''}" data-act="confFav" data-id="${c.id}" aria-label="Favori">${G.isConfFav(c.id) ? '★' : '☆'}</button>
                </div>`;
                return `<div class="card brew-beer${n ? '' : ' none'}">
                    <div class="card-art">${confSvg(c)}</div>
                    <div class="card-main">
                        <div class="card-title">${esc(c.name)} ${renameBtn('confiserie', c.id, 'Renommer la confiserie')}</div>
                        <div class="card-sub">${sub}</div>
                        ${again}
                    </div>
                    <div class="card-side">${side}</div>
                </div>`;
            })
            .join('')}</div>${pg.more}`
    );
}

// ---------------- Commandes gourmandes ----------------
function ordersHtml() {
    const C = state.confiserie;
    if (!C.orders.length) return empty('Aucune commande gourmande pour le moment : les villageois passent régulièrement.');
    return `${hint('Livrez vos confiseries en stock pour un prix majoré (+75 %), de l’amitié et de la renommée.')}<div class="list">${C.orders
        .map(o => {
            const matches = G.confOrderMatches(o);
            const best = matches[0];
            const v = VILLAGERS[o.vid];
            return `<div class="card brew-order${best ? ' ready' : ''}">
                <div class="card-art">${art('villager', o.vid)}</div>
                <div class="card-main">
                    <div class="card-title">${v ? esc(v.name) : 'Visiteur'} <span class="chip">${esc(CONF_KINDS[o.kind]?.name || '')}</span></div>
                    <div class="card-sub">« J’aimerais ${esc(G.confOrderText(o))}. »</div>
                    ${best ? `<div class="card-sub">Avec : <b>${esc(best.name)}</b> · ${fmt(G.confOrderPay(o, best.id))}${COIN()}</div>` : '<div class="card-sub">Aucune confiserie en stock ne correspond encore.</div>'}
                </div>
                <div class="card-side">
                    ${btn('Livrer', { act: 'confOrder', data: { oid: o.id, cid: best ? best.id : '' }, kind: 'green', size: 'sm', disabled: !best })}
                    ${btn('', { act: 'confDrop', data: { oid: o.id }, icon: ['ui', 'cross'], kind: 'ghost', size: 'sm', title: 'Refuser' })}
                </div>
            </div>`;
        })
        .join('')}</div>`;
}

// ---------------- Grimoire du Confiseur ----------------
function grimoireHtml() {
    const C = state.confiserie;
    const gr = C.grimoire || {};
    const found = G.confGrimoireCount();
    const tot = G.confGrimoireTotal();
    const claim = G.confGrimoireClaimable();

    const byKind = CONF_KIND_IDS.map(k => {
        const list = CONF_CLASSICS.filter(c => c.kind === k);
        const okN = list.filter(c => gr['C:' + c.id]).length;
        return `<div class="pf-org-sec">
            <h4>Classiques · ${esc(CONF_KINDS[k].name)} (${okN}/${list.length})</h4>
            <div class="chips-row">${list
                .map(c => {
                    const ok = !!gr['C:' + c.id];
                    return `<span class="pick-chip${ok ? ' on' : ''}" title="${esc(ok ? c.text : c.hint)}">${ok ? '★ ' : ''}${esc(c.name)}</span>`;
                })
                .join('')}</div>
        </div>`;
    }).join('');

    const ingFound = G.CONF_ING_IDS.filter(id => gr[id]).length;
    const ingGrid = G.CONF_ING_IDS.map(id => {
        const ok = !!gr[id];
        return `<span class="pf-org-cell${ok ? ' ok' : ''}" title="${esc(G.confIngName(id))}">${ingIco(id)}<span>${esc(G.confIngName(id))}</span></span>`;
    }).join('');

    return `<div class="card">
        <div class="card-head">${ico(['ui', 'confiserie'], 'ico big')}<div class="card-main">
            <div class="card-title">Grimoire du Confiseur · ${found} / ${tot}</div>
            <div class="card-sub">Une récompense toutes les ${CONF_GRIMOIRE.step} découvertes (+${fmt(CONF_GRIMOIRE.coins)} pièces &amp; +${CONF_GRIMOIRE.xp} XP) ; +1 ruban de Prestige une fois complet.</div>
        </div></div>
        ${bar(tot ? found / tot : 0)}
        ${claim ? btn(`Réclamer (${claim} palier${claim > 1 ? 's' : ''})`, { act: 'confGrimClaim', kind: 'gold', wide: true }) : ''}
        ${byKind}
        <div class="pf-org-sec">
            <h4>Ingrédients travaillés (${ingFound}/${G.CONF_ING_IDS.length})</h4>
            <div class="pf-org-grid">${ingGrid}</div>
        </div>
    </div>`;
}

// ---------------- Vue principale (4 onglets comme la Brasserie) ----------------
function renderConfiserie(el) {
    if (!G.confOpen()) return blocks(el, [['closed', closedCard()]]);
    G.ensureConf();
    const C = state.confiserie;
    const ready = G.confReadyCount();
    const ord = G.confOrdersReady();
    const grim = G.confGrimoireClaimable();
    const T = innerTabs(
        'confiserie',
        [
            ['make', 'Confectionner', null, ready],
            ['stock', 'Créations', null, 0],
            ['orders', 'Commandes', null, ord],
            ['grimoire', 'Grimoire', null, grim],
        ],
        'make',
    );
    const t = T.cur;
    const kind = currentKind();
    const confCount = C.creations ? Object.keys(C.creations).length : 0;
    const head =
        t === 'make'
            ? `<div class="card"><div class="card-head">${ico(['ui', 'confiserie'], 'ico big')}<div class="card-main"><div class="card-title">L’Atelier Confiserie</div><div class="card-sub">${C.kettles.length} chaudron${C.kettles.length > 1 ? 's' : ''} · chocolats, caramels aux miels et berlingots</div></div></div></div>`
            : '';
    blocks(el, [
        ['tabs', T.html],
        ['head', head],
        ['kettles', t === 'make' ? kettlesHtml() : ''],
        ['compose', t === 'make' ? composerHtml(kind) : ''],
        ['stockSearch', t === 'stock' && confCount > 4 ? listBar('confs', { search: 'Chercher une confiserie ou un ingrédient' }) : ''],
        ['stock', t === 'stock' ? stockHtml() : ''],
        ['orders', t === 'orders' ? ordersHtml() : ''],
        ['grimoire', t === 'grimoire' ? grimoireHtml() : ''],
    ]);
}
defineView('machines/confiserie', renderConfiserie);

// ---------------- Feuille de choix d'un ingrédient ----------------
const ING_SORTS = [
    ['stock', 'En stock d’abord'],
    ['name', 'Nom (A à Z)'],
];
defineSheet('confPick', {
    title: o => `Choisir un ingrédient · ${CONF_KINDS[o.kind]?.name || 'Confiserie'}`,
    render(o) {
        const kind = o.kind || 'chocolate';
        const d = G.confDraft(kind);
        const vars =
            state.genetics && state.genetics.vars
                ? Object.values(state.genetics.vars)
                      .filter(v => v && G.CONF_ING_IDS.includes(v.base) && G.confIngHave(v.id) > 0)
                      .map(v => v.id)
                : [];
        const all = [...G.CONF_ING_IDS, ...vars];
        const q = queryOf('confIng');
        const sort = sortOf('confIng', ING_SORTS);
        const opts = [
            ['stock', 'En stock', all.filter(id => G.confIngHave(id) >= 2).length],
            ['all', 'Tous', all.length],
            ...(vars.length ? [['vars', 'Variétés du Labo', vars.length]] : []),
        ];
        const f = filterOf('confIng', opts);
        const list = (f === 'stock' ? all.filter(id => G.confIngHave(id) >= 2) : f === 'vars' ? vars : all)
            .filter(id => matchQ(q, G.confIngName(id)))
            .sort((a, b) => (sort === 'name' ? 0 : G.confIngHave(b) - G.confIngHave(a)) || G.confIngName(a).localeCompare(G.confIngName(b), 'fr'));
        const cells = list
            .map(id => {
                const have = G.confIngHave(id);
                const top = NOTE_NAMES[topNoteIdx(G.confIngFlavor(id))] || '';
                const col = CONF_NOTE_COL[topNoteIdx(G.confIngFlavor(id))] || '#d4a353';
                const sel = d.ings.includes(id);
                return `<button class="pick-cell${sel ? ' locked' : ''}" data-act="confPickSet" data-k="${kind}" data-id="${id}">
                    ${ingIco(id, 'ico big')}
                    <b>${esc(G.confIngName(id))}</b>
                    <small><i class="cf-dot" style="background:${col}"></i>×${have} · ${top}</small>
                </button>`;
            })
            .join('');
        return [
            ['search', listBar('confIng', { search: 'Chercher une récolte, variété ou épice', sorts: ING_SORTS })],
            ['chips', filterChips('confIng', opts, f)],
            ['cells', list.length ? `<div class="pick-grid">${cells}</div>` : empty('Aucun ingrédient ne correspond.')],
        ];
    },
});

// ---------------- Feuille d'offrande aux villageois ----------------
defineSheet('confGift', {
    title: o => {
        const c = G.confOf(o.id);
        return c ? `Offrir : ${c.name}` : 'Offrir une confiserie';
    },
    render(o) {
        const c = G.confOf(o.id);
        if (!c || G.confStock(c.id) < 1) return empty('Plus de stock disponible.');
        const C = G.ensureConf();
        const rows = Object.values(VILLAGERS)
            .sort((a, b) => (CONF_PREFS[b.id] === c.kind ? 1 : 0) - (CONF_PREFS[a.id] === c.kind ? 1 : 0) || a.name.localeCompare(b.name, 'fr'))
            .map(v => {
                const given = !!(C.gifts && C.gifts.given && C.gifts.given[v.id]);
                const fav = CONF_PREFS[v.id] === c.kind;
                const pts = G.confGiftPts(v.id, c.id);
                return `<div class="card cf-gift-row">
                    <div class="card-art">${art('villager', v.id)}</div>
                    <div class="card-main">
                        <div class="card-title">${esc(v.name)}${fav ? ' <span class="chip ok">Adore</span>' : ''}</div>
                        <div class="card-sub">+${pts} amitié</div>
                    </div>
                    <div class="card-side">${btn(given ? 'Offert' : 'Offrir', { act: 'confGiftDo', data: { vid: v.id, cid: c.id }, kind: 'green', size: 'sm', disabled: given })}</div>
                </div>`;
            })
            .join('');
        return `<div class="list">${rows}</div>`;
    },
});

export function setupConfiserie() {
    actions({
        confKind: (el, d) => {
            if (CONF_KIND_IDS.includes(d.k)) ui.sel.confKind = d.k;
        },
        confBase: (el, d) => G.setConfBase(d.k, d.b),
        confShape: (el, d) => G.setConfShape(d.k, d.s),
        confPick: (el, d) => openSheet('confPick', { kind: d.k }),
        confPickSet: (el, d) => {
            if (G.toggleConfIng(d.k, d.id)) closeSheet('confPick');
        },
        confToggleIng: (el, d) => G.toggleConfIng(d.k, d.id),
        confClear: (el, d) => G.clearConfIngs(d.k),
        confBest: (el, d) => {
            if (G.applyBestConf(d.k)) toast('Meilleur accord composé avec votre stock !', ['ui', 'sparkle']);
        },
        confMini: (el, d) => launchConfMini(d.k),
        confKettle: (el, d) => G.startConfKettle(d.k),
        confCollect: (el, d) => G.collectConfKettle(+d.i),
        confCollectAll: () => {
            const C = state.confiserie;
            if (!C) return;
            C.kettles.forEach((k, i) => {
                if (k && (k.ready || now() >= k.until)) G.collectConfKettle(i);
            });
        },
        sellConf: (el, d) => G.sellConf(d.id, +d.n),
        confFav: (el, d) => G.toggleConfFav(d.id),
        confLoad: (el, d) => {
            const k = G.loadConfDraft(d.id);
            if (k) {
                ui.sel.confKind = k;
                ui.sel['it:confiserie'] = 'make';
            }
        },
        confGiftOpen: (el, d) => openSheet('confGift', { id: d.id }),
        confGiftDo: (el, d) => {
            if (G.giftConf(d.vid, d.cid)) closeSheet('confGift');
        },
        vaultConf: (el, d) => {
            if (G.vaultPutConf(d.id)) toast('Confiserie rangée au coffre-fort !', ['ui', 'vault']);
        },
        confOrder: (el, d) => G.deliverConfOrder(d.oid, d.cid),
        confDrop: (el, d) => G.dismissConfOrder(d.oid),
        confGrimClaim: () => G.claimConfGrimoire(),
    });
}
