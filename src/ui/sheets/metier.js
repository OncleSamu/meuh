// 1.114 : le métier de la ferme. Le tableau de bord (rang, leçons, bonus), le choix d'un métier et le changement.
import { state } from '../../core/state.js';
import { fmt, formatDuration } from '../../core/format.js';
import * as G from '../../systems/index.js';
import { METIERS, METIER_IDS, METIER_RANKS } from '../../data/metiers.js';
import { actions } from '../dom.js';
import { ui } from '../app.js';
import { ico } from '../icons.js';
import { btn, bar, hint } from '../kit.js';
import { defineSheet, openSheet, closeSheet } from '../sheets.js';
import { askBuy } from './askbuy.js';

const pips = n => `<span class="pips">${Array.from({ length: METIER_RANKS }, (_, k) => `<i class="${k < n ? 'on' : ''}"></i>`).join('')}</span>`;
// une carte de métier dans la liste (pour choisir ou changer)
export function metierPickCard(id, { act = 'metierPick', sel = null } = {}) {
    const d = METIERS[id],
        r = G.metierRankOf(id),
        cur = G.metierId() === id;
    return `<button class="card metier-pick${sel === id ? ' on' : ''}${cur ? ' cur' : ''}" data-act="${act}" data-id="${id}"${cur ? ' disabled' : ''}>
        <span class="card-head">${ico(d.icon, 'ico big')}<span class="card-main"><span class="card-title">${d.name}${cur ? ' · votre métier' : r ? ` · rang ${r} (endormi)` : ''}</span><span class="card-sub">${d.desc}</span></span></span></button>`;
}
function lessonRow(l) {
    const got = G.lessonDone(l);
    return `<div class="metier-lesson${got >= l.n ? ' done' : ''}"><div class="cut-row"><span>${got >= l.n ? '✓ ' : ''}${l.text}</span><b>${fmt(got)} / ${fmt(l.n)}</b></div>${bar(got / l.n)}</div>`;
}
function dashboard() {
    const id = G.metierId(),
        d = METIERS[id],
        r = G.metierRank();
    const lessons = G.metierLessons();
    const perks = G.metierPerks()
        .map(p => `<div class="metier-perk${r >= p.rank ? ' on' : ''}"><b>Rang ${p.rank}</b><span>${p.text}</span></div>`)
        .join('');
    const rate = Math.round(G.metierPriceRate() * 100);
    const asleep = METIER_IDS.filter(k => k !== id && G.metierRankOf(k) > 0);
    const cost = G.metierChangeCost(),
        wait = G.metierChangeWait();
    return `<div class="card metier-main"><div class="card-head">${ico(d.icon, 'ico big')}<div class="card-main"><div class="card-title">${G.metierTitle()}</div><div class="card-sub">${d.desc}</div>${pips(r)}</div></div>
        <div class="card-sub">${r ? `Aujourd’hui : le marché et l’étal paient ${d.what} ${rate} % de plus.` : 'Réussissez les deux leçons pour gagner le premier rang et son bonus.'}</div></div>
        ${
            r >= METIER_RANKS
                ? '<div class="card"><div class="card-title center">Vous êtes au sommet du métier.</div></div>'
                : `<div class="card"><div class="card-title">Les leçons du rang ${r + 1}</div>${lessons.map(lessonRow).join('')}
                   <div class="od-foot">${btn(`Passer au rang ${r + 1}`, { act: 'metierRankUp', kind: G.metierCanRank() ? 'green' : '', wide: true, disabled: !G.metierCanRank() })}</div></div>`
        }
        <div class="card"><div class="card-title">Les bonus du métier</div>${perks}</div>
        ${asleep.length ? `<div class="card"><div class="card-title">Métiers endormis</div><div class="card-sub">${asleep.map(k => `${METIERS[k].name} (rang ${G.metierRankOf(k)})`).join(', ')}. Leurs rangs sont gardés, leurs bonus dorment.</div></div>` : ''}
        <div class="card"><div class="card-title">Changer de métier</div><div class="card-sub">${
            wait > 0
                ? `Encore ${formatDuration(wait / 1000)} avant de pouvoir changer.`
                : cost
                  ? `Changer coûte ${fmt(cost)} pièces, puis il faut attendre 7 jours avant de changer encore.`
                  : 'Le premier changement est gratuit : vous avez choisi sans connaître le jeu.'
        } Le métier quitté garde ses rangs.</div><div class="od-foot">${btn('Voir les autres métiers', { act: 'metierOther', size: 'sm', disabled: wait > 0 })}</div></div>`;
}
defineSheet('metier', {
    cls: 'metier-sheet',
    title: () => 'Le métier de la ferme',
    open() {
        ui.sel.metierList = false;
    },
    render() {
        if (!G.metierId())
            return (
                hint('Choisissez la spécialité de votre ferme. Elle se gagne rang par rang, en réussissant des leçons, et fait mieux payer ses produits. Rien d’autre n’est fermé : tout le reste du jeu reste jouable comme avant. Le premier changement de métier est gratuit.') +
                METIER_IDS.map(id => metierPickCard(id)).join('')
            );
        if (ui.sel.metierList)
            return `${hint('Le métier que vous quittez garde ses rangs, mais ses bonus dorment tant qu’il n’est pas votre métier.')}${METIER_IDS.map(id => metierPickCard(id)).join('')}<div class="center">${btn('Retour', { act: 'metierBack', size: 'sm' })}</div>`;
        return dashboard();
    },
});

export function setupMetier() {
    actions({
        metierOpen: () => openSheet('metier', {}),
        metierOther: () => {
            ui.sel.metierList = true;
        },
        metierBack: () => {
            ui.sel.metierList = false;
        },
        metierRankUp: () => G.metierRankUp(),
        metierPick: (el, d) => {
            const id = d.id;
            if (!G.metierId()) return void G.chooseMetier(id);
            const cost = G.metierChangeCost();
            askBuy(
                {
                    title: `Devenir ${METIERS[id].name.toLowerCase()}`,
                    icon: METIERS[id].icon,
                    text: `${METIERS[G.metierId()].name} garde ses rangs, mais ses bonus dormiront.${cost ? ' Il faudra attendre 7 jours avant de changer encore.' : ' Ce premier changement est gratuit.'}`,
                    cost,
                    run: () => {
                        if (G.chooseMetier(id)) ui.sel.metierList = false;
                    },
                },
                el,
            );
        },
        // sur la page d'accueil : on retient le métier choisi, il est pris en compte à l'enregistrement
        meMetier: (el, d) => {
            if (ui.sel.me) ui.sel.me.metier = d.id;
        },
    });
    return { closeSheet, state };
}
