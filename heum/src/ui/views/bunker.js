// Heum — l'onglet Bunker : la coupe de l'étage, les vivres et l'air pur.
import { state } from '../../core/state.js';
import * as H from '../../systems/index.js';
import { BUNKER, EXPEDITIONS, HABITANTS, STATS } from '../../data/world.js';
import { CROPS, MUTANTS } from '../../data/crops.js';
import { GOODS } from '../../data/world.js';
import { ico, btn, card, head, bar, timer, prog } from '../kit.js';
import { FIX } from '../../data/crops.js';
import { openSheet, closeSheet } from '../sheet.js';
import { dur } from '../../core/format.js';
import { floatAt } from '../fx.js';
import { art } from '../../art/index.js';

const pct = r => `${Math.round(H.power(r) * 100)} %`;
function coupe() {
    const inc = H.incident();
    const room = r => {
        const w = H.workerOf(r.id);
        const st = !w ? 'off' : H.isKo(w) ? 'ko' : H.power(r.id) > 0 ? 'on' : 'off';
        const flag = inc && inc.room === r.id ? `<i class="flag">${ico('elec')}</i>` : '';
        return `<div class="room ${st}">${flag}<span class="who">${w ? art(w.id) : ''}</span><b>${r.name}</b><small>${w ? (H.isKo(w) ? `${H.resName(w.id)} · KO` : H.resName(w.id)) : 'vide'}</small></div>`;
    };
    const floor2 =
        H.floors() >= 2
            ? `<div class="floor f2"><span class="lvl-tag">−2</span>${BUNKER.rooms2.map(room).join('')}</div><div class="floor locked"><span class="lvl-tag">−3</span><p>${ico('lock')} Troisième étage : plus tard</p></div>`
            : `<div class="floor locked"><span class="lvl-tag">−2</span><p>${ico('lock')} Deuxième étage : à creuser${state.level < BUNKER.dig.lvl ? ` au niveau ${BUNKER.dig.lvl}` : ' (voir plus bas)'}</p></div>`;
    const rooms = BUNKER.rooms.map(room).join('');
    return `<div class="coupe">
        <div class="surface"><span>${ico('tabPlots')}</span><small>La ferme · ${Math.round(state.cont)} %</small></div>
        <div class="shaft"></div>
        <div class="floor"><span class="lvl-tag">−1</span>${rooms}</div>
        ${floor2}
    </div>`;
}
function statusCard() {
    const b = state.bunker,
        fed = H.bunkerFed();
    const air = H.airPure();
    return card(
        `${head('Le Bunker', 'tabBunker', fed ? 'Les habitants sont nourris : ils travaillent pour la ferme.' : state.cont >= 85 ? 'L’air est irrespirable : tout le monde se calfeutre.' : 'Plus de vivres : les habitants sont en veille. Rien n’est perdu.')}
        ${coupe()}
        <div class="lab">Vivres ${b.food} / ${BUNKER.foodMax}${b.food ? ` · un repas dans ${timer(H.eatEvery() - (b.clock || 0))}` : ''}</div>${bar(b.food / BUNKER.foodMax, '#d7a640')}
        <div class="lab">Air pur ${air} %</div>${bar(air / 100, air > 40 ? '#5fa6c9' : '#d2412f')}
        <ul class="perks">${H.roomsOpen()
            .map(
                r =>
                    `<li class="${H.power(r.id) > 0 ? 'on' : ''}">${H.workerOf(r.id) ? ico(H.workerOf(r.id).id) : ico('lock')}<span><b>${r.name} · ${H.workerOf(r.id) ? pct(r.id) : 'vide'}</b> · ${r.text} <small>(${STATS[r.stat]})</small></span></li>`,
            )
            .join('')}</ul>`,
    );
}
// 0.4 : les habitants, les incidents, le journal
function incidentCard() {
    const i = H.incident();
    if (!i) return '';
    const d = HABITANTS.incidents[i.kind];
    const need = Object.entries(d.cost)
        .map(([id, n]) => `<span class="${H.have(id) >= n ? 'ok' : 'short'}">${ico(id)}${H.have(id)}/${n}</span>`)
        .join('');
    return card(
        `${head(d.name, 'elec', `${H.roomDef(i.room).name} à l’arrêt. ${d.text}`)}<div class="need">${need}</div><div class="row">${btn('Régler', 'fixIncident', {}, { kind: 'go', icon: 'shovel', disabled: !H.hasAll(d.cost) })}</div>`,
    );
}
function residentsCard() {
    const rows = H.residents()
        .map(r => {
            const d = r.room && H.roomDef(r.room);
            const stats = Object.entries(STATS)
                .map(([k, n]) => `<span class="chip${d && d.stat === k ? ' mut' : ''}">${n} <b>${r[k]}</b></span>`)
                .join('');
            const state2 = H.isKo(r) ? `KO · ${timer((r.ko - Date.now()) / 1000)}` : d ? `travaille : ${d.name}` : 'se repose';
            return `<div class="pick res">${ico(r.id, 'ico big')}<div><b>${H.resName(r.id)} · niv. ${r.lvl}</b><small>${state2}</small><div class="chips">${stats}</div>${r.lvl < HABITANTS.maxLvl ? bar(r.xp / (HABITANTS.xpPerLvl * r.lvl), '#6fa86a') : ''}</div>${btn('Affecter', 'assignSheet', { id: r.id }, { size: 'sm' })}</div>`;
        })
        .join('');
    return card(
        `${head('Les habitants', 'tabBunker', 'Ils gagnent un niveau en travaillant, et un point dans la statistique de leur salle. Au-delà de 55 % de Contamination, ils peuvent tomber KO (jamais pire) : l’infirmerie les remet sur pied.')}${rows}`,
    );
}
function journalCard() {
    const j = state.journal || [];
    if (!j.length) return '';
    return card(
        `${head('Journal du Bunker', '', 'Ce qui s’est passé en bas.')}<ul class="journal">${j
            .slice(0, 8)
            .map(e => `<li><small>${new Date(e.t).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</small> ${e.text}</li>`)
            .join('')}</ul>`,
    );
}
// V2 : creuser, le labo de Victor, la salle des cartes d'Odette
function digCard() {
    if (H.floors() >= 2 || state.level < BUNKER.dig.lvl) return '';
    const d = BUNKER.dig;
    const need = Object.entries(d.need)
        .map(([id, n]) => `<span class="${H.have(id) >= n ? 'ok' : 'short'}">${ico(id)}${H.have(id)}/${n}</span>`)
        .join('');
    return card(
        `${head('Creuser le deuxième étage', 'shovel', 'Trois salles de plus : le labo de Victor, l’atelier de Firmin, la salle des cartes d’Odette.')}<div class="need">${need}<span class="${state.money >= d.money ? 'ok' : 'short'}">${ico('coin')}${d.money}</span></div><div class="row">${btn('Creuser', 'dig', {}, { kind: 'go', icon: 'shovel', disabled: !H.hasAll(d.need) || state.money < d.money })}</div>`,
    );
}
function labCard() {
    if (!H.labOpen()) return '';
    const fixed = Object.keys(state.fixed || {});
    let body;
    const j = H.labJob();
    if (j)
        body = H.labDone()
            ? `<div class="row">${btn(`Récupérer la graine : ${H.nameOf(j.id)}`, 'collectFix', {}, { kind: 'go', icon: 'seedBag' })}</div>`
            : `<p class="lab">${ico(j.id)} ${H.nameOf(j.id)} · ${timer(H.labLeft())}</p>${prog(H.labLeft(), FIX.t)}`;
    else
        body = Object.keys(MUTANTS)
            .filter(id => !fixed.includes(id))
            .map(
                id =>
                    `<div class="recipe"><div><b>${H.nameOf(id)}</b><span class="need"><span class="${H.have(id) >= FIX.mutants ? 'ok' : 'short'}">${ico(id)}${H.have(id)}/${FIX.mutants}</span><span class="${H.have('elec') >= FIX.elec ? 'ok' : 'short'}">${ico('elec')}${H.have('elec')}/${FIX.elec}</span></span></div>${btn('Fixer', 'fix', { id }, { disabled: !H.canFix(id) })}</div>`,
            )
            .join('');
    return card(
        `${head('Le labo de Victor', 'victor', `Il fixe un mutant en graine stable : ${FIX.mutants} mutants et ${FIX.elec} électroniques, ${dur(FIX.t)}.`)}${body}${fixed.length ? `<p class="hint">Déjà fixés : ${fixed.map(id => H.nameOf(id)).join(', ')}.</p>` : ''}`,
    );
}
function expeCard() {
    if (!H.expeOpen()) return '';
    const e = H.expe();
    let body;
    if (e) {
        const d = EXPEDITIONS.find(x => x.id === e.id);
        body = H.expeDone()
            ? `<div class="row">${btn(`Accueillir Odette : ${d.name}`, 'collectExpe', {}, { kind: 'go', icon: 'map' })}</div>`
            : `<p class="lab">En route : ${d.name} · retour dans ${timer(H.expeLeft())}</p>${prog(H.expeLeft(), d.t)}`;
    } else
        body = EXPEDITIONS.map(
            d =>
                `<div class="recipe"><div><b>${d.name}</b><span class="need">${dur(d.t)} · ${Object.keys(d.loot)
                    .map(id => ico(id))
                    .join(
                        '',
                    )}${d.money ? ico('coin') : ''} · spécimen ${Math.round(d.rare * 100)} %</span></div>${btn('Partir', 'sendExpe', { id: d.id })}</div>`,
        ).join('');
    return card(`${head('La salle des cartes', 'map', 'Odette part fouiller les terres mortes. L’expédition continue quand vous fermez le jeu.')}${body}`);
}
function deliverCard() {
    const ids = [...Object.keys(CROPS), ...Object.keys(MUTANTS), ...Object.keys(GOODS)].filter(id => H.foodOf(id) && H.have(id));
    const rows = ids
        .map(
            id =>
                `<div class="pick">${ico(id, 'ico big')}<div><b>${H.nameOf(id)}</b><small>${H.have(id)} en stock · ${H.foodOf(id)} vivre${H.foodOf(id) > 1 ? 's' : ''} chacun</small></div><span class="btns">${btn('1', 'deliver', { id, n: 1 }, { size: 'sm' })}${btn('Tout', 'deliver', { id, n: 999 }, { size: 'sm' })}</span></div>`,
        )
        .join('');
    return card(
        `${head('Livrer des vivres', '', 'Récoltes, œufs, lait et conserves nourrissent l’étage.')}${rows || '<p class="hint">Rien à livrer pour l’instant.</p>'}`,
    );
}
export const render = () => incidentCard() + statusCard() + residentsCard() + journalCard() + digCard() + labCard() + expeCard() + deliverCard();
export const actions = {
    fixIncident() {
        H.fixIncident();
    },
    assignSheet(el, d) {
        const r = H.residents().find(x => x.id === d.id);
        if (!r) return;
        const rows = H.roomsOpen()
            .map(room => {
                const w = H.workerOf(room.id);
                return `<div class="pick">${w ? ico(w.id, 'ico big') : ico('lock', 'ico big')}<div><b>${room.name}</b><small>${STATS[room.stat]} · ${w ? (w === r ? 'ici actuellement' : `${H.resName(w.id)} (échange)`) : 'libre'}</small></div>${btn(w === r ? 'Ici' : 'Y aller', 'assign', { id: r.id, room: room.id }, { size: 'sm', disabled: w === r })}</div>`;
            })
            .join('');
        openSheet(H.resName(r.id), `${rows}<div class="row">${btn('Au repos', 'assign', { id: r.id, room: '' })}</div>`);
    },
    assign(el, d) {
        H.assign(d.id, d.room);
        closeSheet();
    },
    dig() {
        H.dig();
    },
    fix(el, d) {
        H.startFix(d.id);
    },
    collectFix() {
        const id = H.collectFix();
        if (id)
            openSheet(
                'Graine stable !',
                `<div class="levelup">${ico(id, 'ico huge')}<p>${H.nameOf(id)} est fixé.</p><p class="hint">Il se sème maintenant dans les Parcelles : il pousse toujours mutant, et ne tourne jamais Rebelle.</p>${btn('Super', 'close', {}, { kind: 'go' })}</div>`,
            );
    },
    sendExpe(el, d) {
        H.sendExpe(d.id);
    },
    collectExpe() {
        const r = H.collectExpe();
        if (r)
            openSheet(
                `Rapport : ${r.name}`,
                `<p>Odette est rentrée. Elle rapporte :</p><div class="chips">${Object.entries(r.got)
                    .map(([id, n]) => `<span class="chip${H.isMutant(id) ? ' mut' : ''}">${ico(id)}<b>${n}</b></span>`)
                    .join(
                        '',
                    )}${r.money ? `<span class="chip">${ico('coin')}<b>${r.money}</b></span>` : ''}</div><div class="row">${btn('Ranger', 'close', {}, { kind: 'go' })}</div>`,
            );
    },
    deliver(el, d) {
        const k = H.deliver(d.id, +d.n);
        if (k) floatAt(el, `+${k * H.foodOf(d.id)} vivres`);
    },
};
export const view = { id: 'bunker', name: 'Bunker', icon: 'tabBunker', render, actions };
