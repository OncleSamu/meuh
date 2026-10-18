// 1.11 : le chantier de la ferme — les améliorations de bâtiments en trois niveaux.
import { state } from '../../core/state.js';
import { fmt } from '../../core/format.js';
import { MACHINES } from '../../data/machines.js';
import { BUILDINGS, BLD_IDS, BLD_MAX, TIER_NAMES } from '../../data/buildings.js';
import * as G from '../../systems/index.js';
import { actions } from '../dom.js';
import { ico } from '../icons.js';
import { btn, pips, hint } from '../kit.js';
import { defineSheet, openSheet } from '../sheets.js';

const costHtml = c =>
    G.costParts(c)
        .map(x => `<span class="${x.ok ? 'ok' : 'short'}">${ico(x.icon)}${fmt(x.n)}</span>`)
        .join('');
const machLines = ['+1 place dans la file, 8 % plus vite', '+2 places, 16 % plus vite', '+3 places, 24 % plus vite, un lot en plus une fois sur cinq'];

// une ligne : le bâtiment, son niveau, l'effet actuel et l'étape suivante
export function bldRow(kind, id) {
    const m = kind === 'm',
        cur = m ? G.machLvl(id) : G.bldLvl(id),
        n = G.bldNext(kind, id),
        info = m ? { name: MACHINES[id].name, icon: ['machine', id], lines: machLines, desc: '' } : BUILDINGS[id];
    const now = cur ? info.lines[cur - 1] : 'Pas encore amélioré';
    const next = n
        ? `<div class="up-next"><span>Niveau ${cur + 1} · ${TIER_NAMES[cur]} : ${info.lines[cur]}</span>${
              state.level < n.lvl
                  ? btn(`Niveau ${n.lvl}`, { size: 'sm', disabled: true, icon: ['ui', 'lock'] })
                  : btn(`<span class="cost">${costHtml(n.cost)}</span>`, {
                        act: 'upgradeBld',
                        data: { kind, id },
                        kind: G.hasCost(n.cost) ? 'green' : '',
                        size: 'sm',
                        title: 'Améliorer',
                    })
          }</div>`
        : '';
    return `<div class="up-row${n && G.bldCan(kind, id) ? ' can' : ''}">
        <div class="up-top">${ico(info.icon, 'ico big')}<div class="card-main"><div class="card-title">${info.name} ${pips(cur, BLD_MAX)}</div><div class="card-sub">${now}</div></div></div>${next}</div>`;
}

defineSheet('upgrades', {
    title: 'Chantier de la ferme',
    render() {
        const open = BLD_IDS.filter(G.bldOpen);
        const machines = state.machines.map(m => m.type).filter((t, k, a) => a.indexOf(t) === k);
        return [
            [
                'hint',
                hint(
                    'Trois niveaux par bâtiment, avec les planches, la pierre taillée, les lingots, le chêne massif et les pierres précieuses de la nature. Les machines s’améliorent une par une, depuis leur tiroir.',
                ),
            ],
            ['bld', open.map(id => bldRow('b', id)).join('')],
            ['mach', machines.length ? `<h3 class="section-title"><span>Machines</span></h3>${machines.map(t => bldRow('m', t)).join('')}` : ''],
        ];
    },
});

export function setupUpgrades() {
    actions({
        upgradeBld: (el, d) => G.upgradeBld(d.kind, d.id, el),
        openUpgrades: () => openSheet('upgrades'),
    });
}
