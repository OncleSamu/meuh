// La Coupe de la vallée (1.40) : le rang, le classement contre les fermes rivales, le domaine des légendes et le mécénat.
import { state } from '../../core/state.js';
import { fmt } from '../../core/format.js';
import { DEFI, DEFIS } from '../../data/defis.js';
import { CUP_RANKS, CUP_WORKS, STATUE_POINTS } from '../../data/cup.js';
import * as G from '../../systems/index.js';
import { actions } from '../dom.js';
import { ico, art } from '../icons.js';
import { btn, bar, section, costRow } from '../kit.js';
import { defineSheet } from '../sheets.js';
import { innerTabs } from '../innertabs.js';
import { MAP_BG } from '../../art/maps.js';
import { LEGEND_SPOTS } from '../../art/village/coupe.js';

// où se posent les grands travaux sur la carte (en % de la carte)
const WORK_POS = { bigBridge: [50, 8], cathedral: [8, 30], observatory: [92, 30], museum: [10, 80], opera: [90, 80], baths: [50, 90] };

function mapHtml() {
    const T = (state.defis && state.defis.trophies) || {};
    const ids = Object.keys(DEFIS);
    const mons = LEGEND_SPOTS.map(([x, y], k) => {
        const id = ids[k];
        const won = id && T[id] && T[id].best >= 3;
        return `<div class="leg-mon${won ? ' won' : ''}" style="left:${((x / 160) * 100 - 4).toFixed(1)}%;top:${((y / 110) * 100 - 9).toFixed(1)}%" title="${id ? DEFIS[id].name : ''}">${art('ui', 'plinth')}${won ? `<i>${art('ui', DEFIS[id].deco)}</i>` : ''}</div>`;
    }).join('');
    const statue = `<div class="leg-statue${state.cup && state.cup.statue ? ' won' : ''}">${art('ui', state.cup && state.cup.statue ? 'meuhStatue' : 'plinth')}</div>`;
    const works = CUP_WORKS.filter(w => G.workDone(w.id))
        .map(w => `<div class="leg-work" style="left:${WORK_POS[w.id][0] - 8}%;top:${WORK_POS[w.id][1] - 10}%">${art('building', w.id)}</div>`)
        .join('');
    return `<div class="leg-map">${MAP_BG.legendes}${mons}${statue}${works}</div>`;
}

defineSheet('cup', {
    title: 'La Coupe de la vallée',
    render() {
        G.ensureCup();
        const k = G.cupRank(),
            pts = G.cupPts(),
            R = CUP_RANKS[k],
            nx = G.cupNext();
        const head = `<div class="cup-head">${art('ui', 'cupRank' + k)}<div class="card-main"><div class="card-title">${R.name}</div>
            <div class="card-sub">${fmt(pts)} point${pts > 1 ? 's' : ''}${nx ? ` · encore ${fmt(nx.pts - pts)} pour « ${nx.name} »` : ' · le plus haut rang !'}</div>
            ${nx ? bar((pts - R.pts) / (nx.pts - R.pts)) : ''}</div></div>
            <p class="card-sub">Points : grands défis (bronze 1 à diamant 10) et mécénat. Chaque rang donne un bonus gardé pour toujours.</p>`;
        const ranking = `<ol class="ranking cup-ranking">${G.cupRanking()
            .map(
                (x, i) =>
                    `<li class="${x.me ? 'me' : ''}"><b>${i + 1}</b>${ico(['ui', 'cupRank' + x.rank])}<span>${x.me ? 'Votre ferme' : `${x.owner} · ${x.name}`}</span><em>${fmt(x.pts)}</em></li>`,
            )
            .join('')}</ol>`;
        const won = G.statueProgress(),
            all = Object.keys(DEFIS).length;
        const legend = `${mapHtml()}<p class="card-sub center">${won} monument${won > 1 ? 's' : ''} sur ${all} : chaque grand défi gagné en or bâtit le sien. ${state.cup.statue ? 'La grande statue dorée trône au centre !' : `Les ${all} en or dressent la grande statue dorée (+${STATUE_POINTS} points).`}</p>`;
        const works = CUP_WORKS.map(w => {
            const done = G.workDone(w.id);
            const cost = Object.entries(w.cost).map(([id, n]) => ({
                icon: id === 'coins' ? ['ui', 'coin'] : ['item', id],
                n,
                ok: id === 'coins' ? state.money >= n : (state.inventory[id] || 0) >= n,
            }));
            return `<div class="card work-row${done ? ' done' : ''}"><span class="work-art">${art('building', w.id)}</span><div class="card-main"><div class="card-title">${w.name}</div>
                <div class="card-sub">${done ? `« ${w.mamie} »` : `${w.pts} points de Coupe`}</div>${done ? '' : costRow(cost)}</div>
                ${done ? `<span class="chip ok">${ico(['ui', 'check'])}bâti</span>` : btn('Financer', { act: 'buildWork', data: { id: w.id }, kind: G.workCan(w.id) ? 'gold' : '', size: 'sm', disabled: !G.workCan(w.id) })}</div>`;
        }).join('');
        const ranks = CUP_RANKS.map(
            (r, i) =>
                `<div class="cup-rank${i <= k ? ' on' : ''}">${ico(['ui', 'cupRank' + i])}<div class="card-main"><b>${r.name}</b><small>${r.pts} points${r.bonus ? ` · ${r.bonus}` : ''}</small></div>${i <= k ? ico(['ui', 'check']) : ''}</div>`,
        ).join('');
        // 1.74.1 : trois onglets au lieu d'une feuille de cinq écrans
        const canW = CUP_WORKS.filter(w => !G.workDone(w.id) && G.workCan(w.id)).length;
        const T = innerTabs(
            'cup',
            [
                ['rank', 'Rang', null, 0],
                ['ranking', 'Classement', null, 0],
                ['works', 'Mécénat', null, canW],
            ],
            'rank',
        );
        const body =
            T.cur === 'works'
                ? `<p class="card-sub">Financez un grand chantier : des points de Coupe et un monument sur le domaine des légendes.</p><div class="list">${works}</div>`
                : T.cur === 'ranking'
                  ? `${ranking}${section('Le domaine des légendes')}${legend}`
                  : `${head}<div class="list">${ranks}</div>`;
        return `${T.html}${body}`;
    },
});

export function setupCup() {
    actions({
        buildWork: (el, d) => G.buildWork(d.id, el),
    });
}
export const cupOpen = () => state.level >= DEFI.lvl;
