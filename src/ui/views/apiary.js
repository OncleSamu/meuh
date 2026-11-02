// 1.69 : la carte du rucher, dans chaque contrée (île, oasis, Grand Nord).
import { fmt, formatDuration } from '../../core/format.js';
import * as G from '../../systems/index.js';
import { actions } from '../dom.js';
import { art } from '../icons.js';
import { btn, bar, section, costRow } from '../kit.js';

export function apiaryHtml(land) {
    if (!G.apiaryOpen(land)) return '';
    const A = G.APIARY[land];
    const n = G.apiaryHives(land);
    const next = G.apiaryNext(land);
    const head = section(A.name, n ? `<small class="o-count small">${n} ruche${n > 1 ? 's' : ''}</small>` : '');
    const kinds = G.landHoneys(land)
        .map(([k, h]) => `<span class="ap-kind" title="${h.name}">${art('item', 'honey_' + k)}</span>`)
        .join('');
    const buy = next
        ? `<div class="ap-buy">${costRow(G.costParts(next))}${btn(n ? `Une ${n + 1}e ruche` : 'Poser la première ruche', { act: 'buyHive', data: { land }, kind: G.hasCost(next) ? 'green' : '', size: 'sm', disabled: !G.hasCost(next) })}</div>`
        : '';
    if (!n)
        return (
            head +
            `<div class="card ap-card"><div class="card-head"><span class="oa-up-art">${art('ui', A.icon)}</span><div class="card-main"><div class="card-sub">${A.rule} Si une fleur domine la contrée, le miel prend son nom.</div><div class="ap-kinds">${kinds}</div></div></div>${buy}</div>`
        );
    const r = G.apiaryOf(land);
    const jars = Math.floor(r.honey);
    const cap = G.apiaryCap(land);
    const idle = G.apiaryIdle(land);
    const rate = G.apiaryRate(land);
    const status = idle
        ? `<div class="card-sub ap-idle">${idle}.</div>`
        : `<div class="card-sub">${G.apiaryForecast(land)}</div>${jars < cap ? `<div class="card-sub">Un pot toutes les ${formatDuration(1 / rate)}</div>` : '<div class="card-sub">Les ruches sont pleines.</div>'}`;
    return (
        head +
        `<div class="card ap-card"><div class="card-head"><span class="oa-up-art">${art('ui', A.icon)}</span><div class="card-main"><div class="card-title">${fmt(jars)} / ${cap} pots</div>${status}${bar(r.honey / cap, 'thin')}<div class="ap-kinds">${kinds}</div></div>
        ${btn('Récolter', { act: 'harvestApiary', data: { land }, kind: jars ? 'green' : '', size: 'sm', icon: ['item', 'honey'], disabled: !jars })}</div>${buy}</div>`
    );
}

export function setupApiary() {
    actions({
        buyHive: (el, d) => G.buyHive(d.land, el),
        harvestApiary: (el, d) => G.harvestApiary(d.land, el),
    });
}
