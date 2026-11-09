// 1.100 (étape 4) : la carte de la fête de la vallée (buts, grande table, puis bilan et générique).
import { fmt } from '../../core/format.js';
import { FETE } from '../../data/fete.js';
import * as G from '../../systems/index.js';
import { actions } from '../dom.js';
import { ico } from '../icons.js';
import { btn } from '../kit.js';

const COIN = () => ico(['ui', 'coin']);
const costHtml = c =>
    Object.entries(c)
        .map(([k, n]) => (k === 'coins' ? `${fmt(n)}${COIN()}` : `${ico(['item', k])}${n}`))
        .join(' ');
export function feteCard() {
    if (!G.valleeOpen()) return null;
    if (G.valleeDone()) {
        return `<div class="card camp-card"><div class="card-head">${ico(['ui', 'heart'], 'ico big')}<div class="card-main"><div class="card-title">${FETE.title}</div><div class="card-sub">La vallée a fait la fête. Relisez-en le souvenir quand vous voulez.</div></div></div>
            <div class="od-foot">${btn('La fête', { act: 'open', data: { sheet: 'fete', page: 'scene' }, size: 'sm' })}${btn('Le bilan', { act: 'open', data: { sheet: 'fete', page: 'bilan' }, size: 'sm' })}${btn('Le générique', { act: 'open', data: { sheet: 'fete', page: 'credits' }, size: 'sm' })}</div></div>`;
    }
    const goals = FETE.goals
        .map(g => `<div class="od-line"><span><b>${g.name}</b><small>${G.valleeGoal(g)} / ${g.need}</small></span>${G.valleeGoal(g) >= g.need ? '<b>✓</b>' : ''}</div>`)
        .join('');
    const ok = G.canValleeFete();
    return `<div class="card camp-card"><div class="card-head">${ico(['ui', 'heart'], 'ico big')}<div class="card-main"><div class="card-title">${FETE.title}</div><div class="card-sub">Le dernier chapitre : quand le camping et la Maison ont fait leurs preuves, toute la vallée se réunit autour d’une longue table.</div></div></div>
        ${goals}<div class="od-foot">${btn(`Dresser la table · ${costHtml(FETE.cost)}`, { act: 'valleeFete', kind: ok ? 'green' : '', size: 'sm', disabled: !ok })}</div></div>`;
}
export function setupFete() {
    actions({ valleeFete: () => G.launchValleeFete() });
}
