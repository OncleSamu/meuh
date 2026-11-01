// Le coffre-fort de la grange (1.29) : la fenêtre du coffre et celle pour y ranger un produit.
import { fmt } from '../../core/format.js';
import { ITEMS } from '../../data/items.js';
import { QUALITY } from '../../data/farm.js';
import { VAULT } from '../../data/commerce.js';
import * as G from '../../systems/index.js';
import { actions, esc } from '../dom.js';
import { genWrap } from '../genlook.js';
import { ico, art, qStar } from '../icons.js';
import { btn } from '../kit.js';
import { defineSheet, openSheet, sheetOpts } from '../sheets.js';
import { lotIco, lotSub } from '../views/cave.js';
import { toast } from '../../core/bus.js';

const COIN = () => ico(['ui', 'coin']);
const qname = q => (q ? QUALITY[q].name : 'normal');

// la carte « Coffre-fort » de la grange
export function vaultCard() {
    if (!G.vaultOpen()) return `<p class="card-sub center vault-lock">${ico(['ui', 'lock'])} Le coffre-fort s’ouvre au niveau ${VAULT.lvl}.</p>`;
    G.ensureVault();
    const used = G.vaultUsed(),
        tot = G.vaultTotal();
    return `<button class="row nav vault-row" data-act="open" data-sheet="vault">${ico(['ui', 'vault'])}<span class="row-main"><span>Coffre-fort</span><small>${used} / ${G.vaultSlots()} emplacements${used ? ` · vaut ${fmt(tot)} pièces` : ' · gardez ici vos plus beaux produits'}</small></span><span class="row-side">›</span></button>`;
}

// 1.63 : une variété garde ses couleurs au coffre
const slotArt = s => {
    const v = s.v && G.vdef(s.v);
    return v && v.g ? genWrap(art('item', s.id), v.g) : art('item', s.id);
};
const slotHtml = (s, i, sel) => {
    if (!s) return `<span class="vslot empty" aria-hidden="true"></span>`;
    if (s.kind === 'lot') {
        const l = s.lot;
        return `<button class="vslot lot${sel === i ? ' sel' : ''}" data-act="vaultSel" data-i="${i}" title="${G.lotName(l)}">${lotIco(l, 'vs-art')}${l.q ? `<i class="vs-q">${qStar(l.q)}</i>` : ''}<b>×${l.n}</b></button>`;
    }
    return `<button class="vslot${sel === i ? ' sel' : ''}${s.v ? ' var' : ''}" data-act="vaultSel" data-i="${i}" title="${esc(G.vaultSlotName(s))}"><span class="vs-art">${slotArt(s)}</span>${s.q ? `<i class="vs-q">${qStar(s.q)}</i>` : ''}<b>×${s.n}</b></button>`;
};

const detail = (s, i) => {
    if (!s)
        return '<p class="card-sub center">Touchez un emplacement pour le reprendre. Pour en ranger, touchez un produit dans la grange, ou une bouteille dans la réserve de la cave.</p>';
    if (s.kind === 'lot') {
        const l = s.lot;
        return `<div class="card vault-item"><div class="card-head">${lotIco(l, 'ico big')}<div class="card-main"><div class="card-title">${G.lotName(l)} ×${l.n}</div>
            <div class="card-sub">${G.rankName(l)}${lotSub(l)} · vaut ${fmt(G.lotValue(l))}${COIN()}</div></div></div>
            <div class="row-btns">${btn('Remettre en réserve', { act: 'vaultTakeLot', data: { i }, size: 'sm', kind: 'green' })}</div></div>`;
    }
    return `<div class="card vault-item"><div class="card-head"><span class="ico big">${slotArt(s)}</span><div class="card-main"><div class="card-title">${esc(G.vaultSlotName(s))} ×${s.n}</div>
        <div class="card-sub">${s.v ? `${G.vdef(s.v) && G.vdef(s.v).kind === 'race' ? 'race' : 'variété'} · ` : ''}${s.q ? `${qStar(s.q)} qualité ${qname(s.q)} · ` : ''}vaut ${fmt(G.vaultSlotValue(s))}${COIN()}</div></div></div>
        <div class="row-btns">${s.n > 1 ? btn('Reprendre 1', { act: 'vaultTake', data: { i, n: 1 }, size: 'sm' }) : ''}${btn(s.n > 1 ? 'Tout reprendre' : 'Reprendre', { act: 'vaultTake', data: { i, n: s.n }, size: 'sm', kind: 'green' })}</div></div>`;
};

defineSheet('vault', {
    title: `${ico(['ui', 'vault'])}Coffre-fort`,
    render(o) {
        G.ensureVault();
        const list = G.vaultList();
        const sel = o.sel != null && list[o.sel] ? o.sel : null;
        const lvl = G.vaultLvl();
        const up =
            lvl >= VAULT.max
                ? '<p class="hint">Le coffre est à sa taille maximale.</p>'
                : `<div class="card barn-up"><div class="card-title">Agrandir le coffre · +${VAULT.per} emplacements</div>${btn(`Agrandir · ${fmt(G.vaultUpCost())}`, { act: 'vaultUp', kind: G.canUpgradeVault() ? 'gold' : '', wide: true, disabled: !G.canUpgradeVault(), icon: ['ui', 'coin'] })}</div>`;
        return [
            [
                'meter',
                `<div class="barn-meter"><b>${G.vaultUsed()} / ${G.vaultSlots()}</b><span class="card-sub">Valeur du coffre : ${fmt(G.vaultTotal())}${COIN()}</span></div>`,
            ],
            ['grid', `<div class="vault-grid">${list.map((s, i) => slotHtml(s, i, sel)).join('')}</div>`],
            ['item', detail(sel != null ? list[sel] : null, sel)],
            ['up', up],
            [
                'hint',
                '<p class="hint">Ce qui est au coffre ne se vend pas, ne part pas dans une commande ni dans une recette, et ne prend pas de place dans la grange.</p>',
            ],
        ];
    },
});

// ranger un produit : la qualité, puis la quantité
// 1.63 : o.v : une variété ou une race du produit (sinon le produit ordinaire)
const tiersOf = (id, v = null) => [4, 3, 2, 1, 0].filter(q => G.vaultStock(id, q, v) > 0);
const maxOf = o => Math.max(0, Math.min(G.vaultStock(o.id, o.q, o.v || null), G.vaultRoom(o.id, o.q, o.v || null)));
defineSheet('vaultPut', {
    title: `${ico(['ui', 'vault'])}Mettre au coffre`,
    open(o) {
        o.v = o.v || null;
        if (!tiersOf(o.id).length && G.vaultVars(o.id).length) o.v = G.vaultVars(o.id)[0].id;
        const t = tiersOf(o.id, o.v);
        o.q = t.length ? t[0] : 0;
        o.n = Math.max(1, maxOf(o));
    },
    render(o) {
        if (!o.id || !G.vaultCanPut(o.id)) return '<p class="empty">Il n’y a plus rien à ranger.</p>';
        const vars = G.vaultVars(o.id);
        if (o.v && !vars.some(v => v.id === o.v)) o.v = null;
        const t = tiersOf(o.id, o.v);
        if (!t.includes(o.q)) o.q = t[0];
        const max = maxOf(o);
        o.n = Math.max(1, Math.min(o.n, max || 1));
        const it = ITEMS[o.id];
        return [
            [
                'head',
                `<div class="card barn-item"><div class="card-head">${ico(['item', o.id], 'ico big')}<div class="card-main"><div class="card-title">${it.name}</div><div class="card-sub">${vars.length ? 'Choisissez quoi ranger, puis la qualité' : 'Choisissez la qualité à ranger'}</div></div></div></div>`,
            ],
            [
                'which',
                vars.length
                    ? `<div class="chips-row vtiers">${tiersOf(o.id).length ? `<button class="pick-chip${!o.v ? ' on' : ''}" data-act="vaultVar" data-v="">${esc(it.name)}</button>` : ''}${vars.map(v => `<button class="pick-chip${o.v === v.id ? ' on' : ''}" data-act="vaultVar" data-v="${v.id}">« ${esc(G.varName(v))} »</button>`).join('')}</div>`
                    : '',
            ],
            [
                'tiers',
                t.length
                    ? `<div class="chips-row vtiers">${t.map(q => `<button class="pick-chip${o.q === q ? ' on' : ''}" data-act="vaultTier" data-q="${q}">${q ? qStar(q) : ''} ${qname(q)} · ${G.vaultStock(o.id, q, o.v)}</button>`).join('')}</div>`
                    : '<p class="card-sub center">Rien à ranger de ce côté.</p>',
            ],
            [
                'qty',
                max
                    ? `<div class="stepper big">${btn('', { act: 'vaultQty', data: { d: -1 }, icon: ['ui', 'minus'], disabled: o.n <= 1, title: 'Moins' })}<span><b>${o.n}</b> × ${it.name.toLowerCase()}</span>${btn('', { act: 'vaultQty', data: { d: 1 }, icon: ['ui', 'plus'], disabled: o.n >= max, title: 'Plus' })}</div>
                   ${btn('Tout', { act: 'vaultQty', data: { d: 9999 }, size: 'sm' })}`
                    : '<p class="card-sub center">Le coffre est plein : agrandissez-le ou reprenez quelque chose.</p>',
            ],
            [
                'hint',
                `<p class="hint">Un emplacement garde jusqu’à ${VAULT.stack} unités d’un même produit et d’une même qualité. ${G.vaultSlots() - G.vaultUsed()} emplacement${G.vaultSlots() - G.vaultUsed() > 1 ? 's' : ''} libre${G.vaultSlots() - G.vaultUsed() > 1 ? 's' : ''}.</p>`,
            ],
        ];
    },
    foot: o => (maxOf(o) > 0 ? btn('Mettre au coffre', { act: 'vaultDo', kind: 'green', wide: true, size: 'lg', icon: ['ui', 'vault'] }) : ''),
});

export function setupVault() {
    actions({
        vaultSel: (el, d) => {
            const o = sheetOpts('vault');
            o.sel = o.sel === +d.i ? null : +d.i;
        },
        vaultTake: (el, d) => {
            G.vaultTake(+d.i, +d.n);
        },
        vaultTakeLot: (el, d) => {
            if (G.vaultTake(+d.i)) toast('Le lot est revenu dans la réserve de la cave', ['ui', 'barrel']);
        },
        vaultUp: () => G.upgradeVault(),
        vaultAdd: (el, d) => openSheet('vaultPut', { id: d.id }),
        vaultVar: (el, d) => {
            const o = sheetOpts('vaultPut');
            o.v = d.v || null;
            const t = tiersOf(o.id, o.v);
            o.q = t.length ? t[0] : 0;
            o.n = Math.max(1, maxOf(o));
        },
        vaultTier: (el, d) => {
            const o = sheetOpts('vaultPut');
            o.q = +d.q;
            o.n = Math.max(1, maxOf(o));
        },
        vaultQty: (el, d) => {
            const o = sheetOpts('vaultPut');
            o.n = Math.max(1, Math.min(maxOf(o), o.n + +d.d));
        },
        vaultDo: () => {
            const o = sheetOpts('vaultPut');
            const n = G.vaultPut(o.id, o.q, o.n, o.v || null);
            if (n) {
                toast(`${n} ${ITEMS[o.id].name.toLowerCase()}${o.v ? ` « ${G.varName(G.vdef(o.v))} »` : ''}${o.q ? ` en ${qname(o.q)}` : ''} au coffre`, [
                    'ui',
                    'vault',
                ]);
                G.tipVault();
            }
        },
        vaultLot: (el, d) => {
            if (G.vaultPutLot(+d.uid)) toast('Le lot est au coffre, à l’abri', ['ui', 'vault']);
        },
    });
}
