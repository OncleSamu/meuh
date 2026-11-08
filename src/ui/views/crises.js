// 1.99 : la carte des crises de la vallée.
import { state } from '../../core/state.js';
import { fmt } from '../../core/format.js';
import { CRISES, CRISIS } from '../../data/crises.js';
import * as G from '../../systems/index.js';
import { actions } from '../dom.js';
import { ico } from '../icons.js';
import { btn, timer } from '../kit.js';

const pct = m => `${Math.round((1 - m) * 100)} %`;
export function crisesCard() {
    if (!G.crisisOpen()) return null;
    const c = state.crisis;
    if (!c)
        return `<div class="card crisis-card"><div class="card-head">${ico(['ui', 'w_heat'], 'ico big')}<div class="card-main"><div class="card-title">La vallée est calme</div><div class="card-sub">De temps en temps, sécheresse, épidémie ou marché en berne : on est prévenu 12 heures avant, et rien n'est jamais perdu.</div></div></div></div>`;
    const d = CRISES[c.type];
    const ph = G.crisisPhase();
    const cost = G.crisisCost();
    const prep = c.prep
        ? `<p class="card-sub">Vous êtes prêt : seulement ${pct(d.prepMult)} de moins. Une récompense vous attend à la fin.</p>`
        : `<div class="od-foot">${btn(`${d.prep} · ${fmt(cost)}${ico(['ui', 'coin'])}`, { act: 'prepareCrisis', kind: G.canPrepare() ? 'green' : '', size: 'sm', disabled: !G.canPrepare() })}</div>`;
    return `<div class="card crisis-card"><div class="card-head">${ico(d.icon, 'ico big')}<div class="card-main"><div class="card-title">${d.name}</div><div class="card-sub">${d.text}</div></div></div>
        <div class="od-line"><span><b>${ph === 'warn' ? 'Commence dans' : 'Se termine dans'} ${timer(ph === 'warn' ? c.start : c.end, 'b')}</b><small>${d.effect} : −${pct(c.prep ? d.prepMult : d.mult)} pendant ${CRISIS.last / 3600000} h</small></span></div>${prep}</div>`;
}
export function setupCrises() {
    actions({ prepareCrisis: el => G.prepareCrisis(el) });
}
