// Les plans du champ (1.85) : enregistrer la disposition des cultures, la replanter d'un clic.
import { fmt, s } from '../../core/format.js';
import { ITEMS } from '../../data/items.js';
import * as G from '../../systems/index.js';
import { actions, esc } from '../dom.js';
import { btn, empty } from '../kit.js';
import { ico } from '../icons.js';
import { defineSheet } from '../sheets.js';
import { confirmTap } from '../confirm.js';

const COLS = 6;
// la disposition en petit : une case par parcelle du champ, la culture dessinée dedans
function mini(pl) {
    const rows = Math.max(1, Math.ceil(pl.rows / COLS));
    const cell = i => {
        const id = pl.c[i];
        return `<i class="pg-c${id ? ' on' : ''}">${id ? ico(['item', id]) : ''}</i>`;
    };
    const field = Array.from({ length: rows * COLS }, (_, i) => (i < pl.rows ? cell(i) : '<i class="pg-c off"></i>')).join('');
    const gh = Object.keys(pl.c)
        .filter(k => +k >= 1000)
        .sort((a, b) => a - b);
    return `<div class="plan-grid">${field}</div>${gh.length ? `<div class="plan-gh">Serre : ${gh.map(k => ico(['item', pl.c[k]])).join('')}</div>` : ''}`;
}

function slot(k) {
    const pl = G.planAt(k);
    if (!pl)
        return `<div class="card plan-slot empty"><div class="card-main"><div class="card-title">Emplacement ${k + 1}</div>
            <small class="card-sub">Libre. Plantez votre disposition dans le champ, puis enregistrez-la ici.</small></div>
            ${btn('Enregistrer le champ', { act: 'planSave', data: { k }, kind: 'green', size: 'sm', icon: ['ui', 'plan'] })}</div>`;
    const r = G.planPreview(k);
    const lack = Object.entries(r.lack)
        .map(([id, n]) => `${n} ${ITEMS[id].name.toLowerCase()}`)
        .join(', ');
    const sub = [
        `${r.sow} à semer${r.fee ? ` · main-d’œuvre ${fmt(r.fee)}${ico(['ui', 'coin'])}` : ''}`,
        r.busy ? `${r.busy} occupée${s(r.busy)}` : '',
        r.plow ? `${r.plow} à labourer` : '',
        lack ? `<b class="bad">manque de quoi semer : ${esc(lack)}</b>` : '',
    ]
        .filter(Boolean)
        .join(' · ');
    return `<div class="card plan-slot"><div class="card-main"><div class="card-title">${esc(pl.name)} <button class="rename-btn" data-act="open" data-sheet="rename" data-kind="plan" data-id="${k}" aria-label="Renommer" title="Renommer"><svg viewBox="0 0 24 24"><path d="M4 20 L5 15 L16 4 L20 8 L9 19Z" fill="#ffd23f" stroke="#3a2618" stroke-width="1.8" stroke-linejoin="round"/></svg></button></div>
        ${mini(pl)}<small class="card-sub">${sub}</small></div>
        <div class="plan-btns">${btn(r.sow ? `Replanter (${fmt(r.sow)})` : 'Replanter', { act: 'planApply', data: { k }, kind: 'green', size: 'sm', disabled: !r.sow })}
        ${btn('Enregistrer ici', { act: 'planSave', data: { k }, size: 'sm' })}${btn('Effacer', { act: 'planClear', data: { k }, kind: 'ghost', size: 'sm' })}</div></div>`;
}

defineSheet('plans', {
    title: () => 'Plans du champ',
    render() {
        if (!G.planOpen()) return empty('Achetez le Plan du champ au magasin (Améliorations).');
        G.tip('plans');
        return `<p class="card-sub">Un plan se souvient de la place de chaque culture. « Replanter » sème sur les parcelles vides et labourées : il ne remplace rien et ne laboure pas. Les graines se paient comme d’habitude, plus une petite main-d’œuvre : un quart du prix de la graine par parcelle, même avec des graines en stock.</p>
            ${Array.from({ length: G.planSlots() }, (_, k) => slot(k)).join('')}`;
    },
});

export function setupPlans() {
    actions({
        planSave: (el, d) => {
            const k = +d.k;
            if (G.planAt(k) && !confirmTap('planSave' + k, el, 'Remplacer ?')) return;
            G.savePlan(k, el);
        },
        planApply: (el, d) => G.applyPlan(+d.k, el),
        planClear: (el, d) => confirmTap('planClear' + d.k, el, 'Effacer ?') && G.clearPlan(+d.k),
    });
}
