// Heum — l'onglet Recyclage : l'épave à fouiller et les machines.
import { state } from '../../core/state.js';
import * as H from '../../systems/index.js';
import { MACHINES, WRECK, SCRAP_TYPES, WEAR, SILO } from '../../data/world.js';
import { ico, btn, card, head, bar, timer, prog } from '../kit.js';
import { floatAt, floatItems } from '../fx.js';

function wreckCard() {
    const w = state.wreck;
    return card(
        `${head('L’épave', 'wreck', 'Une carcasse de camion au bout du champ. Fouillez-la : elle se regarnit avec le temps.')}
        <div class="lab">Recoins à fouiller : ${w.charges} / ${WRECK.max}${w.charges < WRECK.max ? ` · un de plus dans ${timer(H.wreckLeft())}` : ''}</div>${bar(w.charges / WRECK.max, '#a65e3a')}
        <div class="row">${btn('Fouiller', 'search', {}, { icon: 'scrap', kind: 'go', disabled: !w.charges })}</div>`,
    );
}
function scrapRow() {
    const ids = ['scrap', ...SCRAP_TYPES, 'fertilizer', 'waste', ...(state.level >= 9 ? ['veil', 'conc'] : [])];
    return card(
        `<h3>Ferraille et matériaux</h3><div class="chips">${ids.map(id => `<span class="chip${H.have(id) ? '' : ' none'}" title="${H.nameOf(id)}">${ico(id)}<b>${H.have(id)}</b></span>`).join('')}</div>`,
    );
}
const need = r =>
    Object.entries(r.in)
        .map(([id, n]) => `<span class="${H.have(id) >= n ? 'ok' : 'short'}">${ico(id)}${H.have(id)}/${n}</span>`)
        .join('');
function machineCard(m) {
    const d = MACHINES[m];
    if (state.level < d.lvl) return card(`${head(d.name, m, d.text)}<p class="note">${ico('lock')} S’ouvre au niveau ${d.lvl}.</p>`, 'locked');
    const job = H.jobOf(m);
    const wear = H.wearOf(m);
    const wearRow = `<div class="lab">Usure ${Math.floor(wear)} / ${WEAR.max}${H.broken(m) ? ' · en panne' : ''}</div>${bar(wear / WEAR.max, wear >= WEAR.max - 2 ? '#d2412f' : '#a65e3a')}${
        wear >= 1
            ? `<div class="row">${btn(
                  `Réparer (${Object.entries(WEAR.repair)
                      .map(([id, n]) => `${n} ${H.nameOf(id).toLowerCase()}`)
                      .join(', ')})`,
                  'repair',
                  { m },
                  { size: 'sm', disabled: !H.hasAll(WEAR.repair) },
              )}</div>`
            : ''
    }`;
    let body;
    if (job) {
        const r = H.recipeOf(m, job.r),
            total = (job.end - job.start) / 1000;
        body = H.jobDone(m)
            ? `<div class="row">${btn(`Récupérer : ${r.name}`, 'collectJob', { m }, { kind: 'go', icon: r.out === 'sorted' ? 'metal' : r.out === 'purify' ? 'gauge' : r.out })}</div>`
            : `<p class="lab">${r.name} · ${timer(H.jobLeft(m))}</p>${prog(H.jobLeft(m), total)}`;
    } else
        body = d.recipes
            .filter(r => !r.lvl || state.level >= r.lvl)
            .map(
                r =>
                    `<div class="recipe"><div><b>${r.name}</b><span class="need">${need(r)}</span></div>${btn('Lancer', 'startJob', { m, r: r.id }, { disabled: !H.hasAll(r.in) })}</div>`,
            )
            .join('');
    return card(`${head(d.name, m, d.text)}${body}${wearRow}`);
}
function siloCard() {
    const u = H.siloUp();
    if (!u && H.siloLevel() === 0) return '';
    const need = u
        ? Object.entries(u.need)
              .map(([id, n]) => `<span class="${H.have(id) >= n ? 'ok' : 'short'}">${ico(id)}${H.have(id)}/${n}</span>`)
              .join('') + `<span class="${state.money >= u.money ? 'ok' : 'short'}">${ico('coin')}${u.money}</span>`
        : '';
    return card(
        `${head('Le silo', 'silo', `Chaque produit se stocke jusqu’à ${H.siloCap()} unités ; au-delà, la récolte est perdue.`)}${u ? (state.level >= u.lvl ? `<div class="need">${need}</div><div class="row">${btn(`Agrandir (${SILO.caps[H.siloLevel() + 1]})`, 'upgradeSilo', {}, { kind: 'go', icon: 'shovel', disabled: !H.hasAll(u.need) || state.money < u.money })}</div>` : `<p class="note">${ico('lock')} Agrandissement au niveau ${u.lvl}.</p>`) : '<p class="hint">Silo au maximum.</p>'}`,
    );
}
export function render() {
    return `${wreckCard()}${scrapRow()}${siloCard()}${Object.keys(MACHINES).map(machineCard).join('')}`;
}
export const actions = {
    repair(el, d) {
        H.repair(d.m);
    },
    upgradeSilo() {
        H.upgradeSilo();
    },
    search(el) {
        const n = H.search();
        if (n) floatItems(el, [['scrap', n]]);
    },
    startJob(el, d) {
        H.startJob(d.m, d.r);
    },
    collectJob(el, d) {
        const got = H.collectJob(d.m);
        if (got && Object.keys(got).length) floatItems(el, Object.entries(got));
        else if (got) floatAt(el, '−15 %', 'toxic');
    },
};
export const view = { id: 'recycle', name: 'Recyclage', icon: 'tabRecycle', render, actions };
