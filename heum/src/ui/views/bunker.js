// Heum — l'onglet Bunker : la coupe de l'étage, les vivres et l'air pur.
import { state } from '../../core/state.js';
import * as H from '../../systems/index.js';
import { BUNKER, EXPEDITIONS } from '../../data/world.js';
import { CROPS, MUTANTS } from '../../data/crops.js';
import { GOODS } from '../../data/world.js';
import { ico, btn, card, head, bar, timer, prog } from '../kit.js';
import { FIX } from '../../data/crops.js';
import { openSheet } from '../sheet.js';
import { dur } from '../../core/format.js';
import { floatAt } from '../fx.js';
import { art } from '../../art/index.js';

const WHO = { Armand: 'armand', Lison: 'lison', Basile: 'basile', Victor: 'victor', Firmin: 'firmin', Odette: 'odette' };
function coupe() {
    const fed = H.bunkerFed();
    const room = r => `<div class="room ${fed ? 'on' : 'off'}"><span class="who">${art(WHO[r.who])}</span><b>${r.name}</b><small>${r.who}</small></div>`;
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
        <ul class="perks">${[...BUNKER.rooms, ...(H.floors() >= 2 ? BUNKER.rooms2 : [])].map(r => `<li class="${fed ? 'on' : ''}">${ico(WHO[r.who])}${r.text}</li>`).join('')}</ul>`,
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
        body = ['rutabagaGlow', 'squashShell', 'kaleSponge', 'berryFire']
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
export const render = () => statusCard() + digCard() + labCard() + expeCard() + deliverCard();
export const actions = {
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
