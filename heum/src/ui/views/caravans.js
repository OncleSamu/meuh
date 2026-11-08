// Heum — l'onglet Caravanes : le convoi du moment, la radio, la vente et le troc.
import { state } from '../../core/state.js';
import * as H from '../../systems/index.js';
import { CARAVAN, TRADES } from '../../data/world.js';
import { now } from '../../core/clock.js';
import { ico, btn, card, head, timer } from '../kit.js';
import { floatAt } from '../fx.js';
import { fmt } from '../../core/format.js';

const wantIcons = r => r.wants.map(id => `<span class="chip want" title="${H.nameOf(id)}">${ico(id)}</span>`).join('');
function convoyCard() {
    const r = H.convoy();
    return card(
        `${head(`Convoi ${r.of}`, 'tabCaravan', `Il repart dans ${timer(H.convoyLeft())}. Il paie 60 % de plus ce qu’il réclame :`)}<div class="chips">${wantIcons(r)}</div>${checkNote(r)}`,
        'convoy',
    );
}
// V2 : le contrôle sanitaire et le convoi blindé
function checkNote(r) {
    if (!H.checkOn() || !r.check) return '';
    const t =
        r.check === 'clean'
            ? 'région propre : un produit peu chargé (moins de 20 %) se vend 25 % de plus, un produit chaud (plus de 60 %) à 30 % seulement'
            : 'région chaude : un produit très chargé (plus de 80 %) se vend 60 % de plus, un produit propre à 70 %';
    return `<p class="note ${r.check === 'clean' ? 'warn' : 'hot'}">${ico('waste')} Contrôle sanitaire, ${t}.</p>`;
}
// la charge du lot en stock, et ce que le convoi en fait
function chargeTag(id) {
    const h = H.heat(id);
    if (!h || !H.checkOn()) return '';
    const m = H.checkMult(id);
    const label = { hot: 'chaud', clean: 'propre', warm: 'tiède' }[h];
    const eff = m === 1 ? '' : m > 1 ? ` ×${m}` : ` ×${m}`;
    return ` · <span class="${h === 'hot' ? 'hot-tag' : h === 'clean' ? 'tag' : 'warm-tag'}">${label} ${H.chargeOf(id)} %${eff}</span>`;
}
function armoredCard() {
    if (!H.armoredOpen())
        return state.level >= 10
            ? card(`${head('Convoi blindé', 'armored', '')}<p class="note">${ico('lock')} Il s’arrête à la ferme à partir du niveau 12.</p>`, 'locked')
            : '';
    const c = H.armored();
    const ok = H.have(c.id) >= c.n;
    return card(
        `${head('Convoi blindé', 'armored', `Gros contrat, au compte exact. Il repart dans ${timer((c.until - now()) / 1000)}.`)}
        <div class="contract">${ico(c.id, 'ico huge')}<div><b>${c.n} × ${H.nameOf(c.id)}</b><small>Vous en avez ${H.have(c.id)}</small><small class="reward">${ico('coin')} ${fmt(c.reward)} pièces · 40 XP</small></div></div>
        <div class="row">${btn('Livrer le contrat', 'armored', {}, { kind: 'go', disabled: !ok })}</div><p class="hint">Manqué, il repart sans rien dire : un autre contrat arrive.</p>`,
        'armored',
    );
}
function radioCard() {
    return card(
        `${head('La radio', 'radio', 'Les prochains passages, annoncés d’avance.')}${H.upcoming()
            .map(u => `<div class="radio-row"><b>${u.region.name}</b><small>dans ${timer(u.in)}</small><span class="chips">${wantIcons(u.region)}</span></div>`)
            .join('')}`,
    );
}
function sellCard() {
    const ids = Object.keys(state.inv)
        .filter(id => H.have(id) && H.priceOf(id) > 0)
        .sort((a, b) => H.wanted(b) - H.wanted(a) || H.priceOf(b) - H.priceOf(a));
    const rows = ids
        .map(id => {
            const p = H.priceOf(id),
                n = H.have(id);
            return `<div class="pick${H.wanted(id) ? ' wanted' : ''}">${ico(id, 'ico big')}<div><b>${H.nameOf(id)}</b><small>${n} en stock · ${p} pièces${H.wanted(id) ? ' · réclamé !' : ''}${chargeTag(id)}</small></div><span class="btns">${btn('1', 'sell', { id, n: 1 }, { size: 'sm' })}${btn(`Tout · ${fmt(p * n)}`, 'sell', { id, n: 999 }, { size: 'sm', kind: 'go' })}</span></div>`;
        })
        .join('');
    return card(`${head('Marchands ambulants', '', 'Ils achètent tout, au prix du jour.')}${rows || '<p class="hint">Rien à vendre : allez récolter !</p>'}`);
}
const list = o =>
    Object.entries(o)
        .map(([id, n]) => `<span class="${H.have(id) >= n ? 'ok' : ''}">${n}${ico(id)}</span>`)
        .join(' ');
function tradeCard() {
    if (state.level < CARAVAN.troqLvl)
        return card(
            `${head('Troqueurs', '', '')}<p class="note">${ico('lock')} Les Troqueurs passent à partir du niveau ${CARAVAN.troqLvl} : pas d’argent, que de l’échange.</p>`,
            'locked',
        );
    return card(
        `${head('Troqueurs', '', 'Pas d’argent : de l’échange.')}${TRADES.map(t => `<div class="recipe"><div class="trade">${list(t.give)} <b>→</b> ${list(t.get)}</div>${btn('Troquer', 'trade', { t: t.id }, { disabled: !H.hasAll(t.give) })}</div>`).join('')}`,
    );
}
export const render = () => convoyCard() + armoredCard() + sellCard() + radioCard() + tradeCard();
export const actions = {
    armored(el) {
        const g = H.deliverArmored();
        if (g) floatAt(el, `+${fmt(g)}${ico('coin')}`, 'gold');
    },
    sell(el, d) {
        const g = H.sell(d.id, +d.n);
        if (g) floatAt(el, `+${fmt(g)}${ico('coin')}`, 'gold');
    },
    trade(el, d) {
        H.trade(d.t);
    },
};
export const view = { id: 'caravans', name: 'Caravanes', icon: 'tabCaravan', render, actions };
