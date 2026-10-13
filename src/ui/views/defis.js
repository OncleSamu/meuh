// Les grands défis (1.1) : la carte du volet Commandes, la fiche du défi, le choix d'une création à présenter,
// et la salle des trophées.
import { state } from '../../core/state.js';
import { fmt, formatDuration } from '../../core/format.js';
import { ITEMS } from '../../data/items.js';
import { ANIMALS } from '../../data/animals.js';
import { DECOS } from '../../data/farm.js';
import { VILLAGERS } from '../../data/village.js';
import { DEFI, DEFIS } from '../../data/defis.js';
import * as G from '../../systems/index.js';
import { actions, esc } from '../dom.js';
import { ico, art } from '../icons.js';
import { btn, bar, timer, section, hint, empty } from '../kit.js';
import { defineSheet, closeSheet } from '../sheets.js';
import { animalArt } from '../genlook.js';
import { varArt } from './lab.js';

const CUPS = ['cupNone', 'cupBronze', 'cupSilver', 'cupGold'];
const QNAME = ['', 'argent ou or', 'or'];
const medalRow = n => `<span class="defi-cups">${[1, 2, 3].map(m => `<i class="${n >= m + 1 ? 'on' : ''}">${art('ui', CUPS[m])}</i>`).join('')}</span>`;
const medalLabel = n => (n >= 4 ? 'Or' : n === 3 ? 'Argent' : n === 2 ? 'Bronze' : n === 1 ? 'Encore 1 étape pour le bronze' : '2 étapes pour le bronze');

function stepIcon(st) {
    if (st.done) return ['ui', 'check'];
    if (st.kind === 'give') return ['item', st.items[0].id];
    if (st.kind === 'count') return st.icon || ['ui', 'trophy'];
    return st.kind === 'animal' ? ['animal', 'cow'] : ['ui', 'packet'];
}

// une ligne d'étape (carte et fiche)
function stepRow(st, k, full) {
    const f = G.stepFrac(st);
    const act = !st.done && (G.canGive(st) || G.canPresent(st));
    const sub = st.done ? (st.who ? `Présenté : ${esc(st.who)}` : 'Réussi') : G.stepText(st);
    const side = st.done
        ? ''
        : st.kind === 'give'
          ? btn('Livrer', { act: 'giveDefi', data: { k }, size: 'sm', kind: act ? 'green' : '', disabled: !act })
          : st.kind === 'count'
            ? `<small class="defi-num">${fmt(G.stepCount(st))} / ${fmt(st.n)}</small>`
            : btn('Présenter', { act: 'open', data: { sheet: 'defiPick', k }, size: 'sm', kind: act ? 'green' : '' });
    let detail = '';
    if (full && st.kind === 'give' && !st.done)
        detail = `<div class="defi-items">${st.items
            .map(x => {
                const have = G.haveQ(x.id, st.q);
                return `<button class="defi-item${x.got >= x.n ? ' ok' : ''}" data-act="produce" data-id="${x.id}">${ico(['item', x.id])}<span>${ITEMS[x.id].name}</span><b>${fmt(x.got)} / ${fmt(x.n)}</b><small>${x.got >= x.n ? 'livré' : `${fmt(have)} en stock${st.q ? ` (${QNAME[st.q]})` : ''}`}</small></button>`;
            })
            .join('')}</div>`;
    return `<div class="defi-step${st.done ? ' done' : ''}${act ? ' ready' : ''}">${ico(stepIcon(st), 'ico')}<div class="defi-main"><b>${st.name}</b><small>${sub}</small>${st.done ? '' : bar(f)}</div><div class="defi-side">${side}</div>${detail}</div>`;
}

// ---------------- la carte du volet Commandes ----------------
export function defiCard() {
    if (state.level < DEFI.lvl - 2) return null;
    if (!G.defiOpen())
        return `<div class="card locked defi-card">${ico(['ui', 'cupGold'], 'ico big')}<div class="card-main"><div class="card-title">Les grands défis</div><div class="card-sub">Au niveau ${DEFI.lvl}, un villageois vous confiera un grand défi de deux semaines : médailles, rubans et décorations uniques.</div></div></div>`;
    const d = G.curDefi();
    if (!d) return null;
    const def = DEFIS[d.id],
        n = G.stepsDone(d);
    const head = `<div class="card-head">${ico(['villager', def.who], 'ico big')}<div class="card-main"><div class="card-title">${def.name}</div><div class="card-sub">Grand défi · ${medalLabel(n)}</div></div><span class="timer-pill">${ico(['ui', 'clock'])}${timer(d.end)}</span></div>`;
    if (d.awarded)
        return `<div class="card defi-card won">${head}<p class="card-sub center">${ico(['ui', CUPS[d.awarded]], 'ico big')} Médaille ${DEFI.medals[d.awarded - 1].name.toLowerCase()} ! Le prochain défi arrive dans <b>${formatDuration(G.defiLeft(d) / 1000)}</b>.</p></div>`;
    return `<div class="card defi-card">${head}${medalRow(n)}<div class="defi-steps">${d.steps.map((st, k) => stepRow(st, k, false)).join('')}</div>
        ${btn('Voir le défi', { act: 'open', data: { sheet: 'defi' }, size: 'sm', wide: true })}</div>`;
}

// ---------------- la fiche du défi ----------------
defineSheet('defi', {
    title: () => (G.curDefi() ? DEFIS[G.curDefi().id].name : 'Grand défi'),
    render() {
        const d = G.curDefi();
        if (!d) return empty('Pas de grand défi en cours.');
        const def = DEFIS[d.id],
            n = G.stepsDone(d);
        const deco = DECOS[def.deco];
        const t = (state.defis.trophies || {})[d.id];
        return `<div class="defi-intro">${art('villager', def.who)}<div><b>${VILLAGERS[def.who].name}</b><p>« ${def.intro} »</p></div></div>
            <div class="defi-medals">${medalRow(n)}<span>${d.awarded ? `Médaille ${DEFI.medals[d.awarded - 1].name.toLowerCase()} gagnée` : medalLabel(n)} · encore ${timer(d.end, 'b')}</span></div>
            ${section('Les 4 étapes')}<div class="defi-steps full">${d.steps.map((st, k) => stepRow(st, k, true)).join('')}</div>
            ${section('Les médailles')}
            <div class="defi-rewards">${DEFI.medals
                .map((M, k) => {
                    const coins = Math.round(M.coins * G.defiScale());
                    const star = M.star >= 1 ? '1 étoile' : M.star >= 0.5 ? '½ étoile' : '¼ d’étoile';
                    return `<div class="defi-reward">${art('ui', CUPS[k + 1])}<b>${M.name}</b><small>${k + 2} étapes</small><small>${fmt(coins)} pièces · ${star}${M.rubans ? ` · ${M.rubans} ruban${M.rubans > 1 ? 's' : ''}` : ''}</small></div>`;
                })
                .join('')}</div>
            <div class="card defi-deco">${art('ui', def.deco)}<div class="card-main"><div class="card-title">${deco.name}</div><div class="card-sub">${t && t.gold ? 'Déjà gagnée : elle est dans vos décorations.' : 'Décoration unique, la première fois que vous gagnez l’or sur ce défi.'}</div></div></div>
            ${hint('Livrer garde ce qui est déjà donné : vous pouvez apporter les produits en plusieurs fois. Le marché ne vend pas ce que le défi attend.')}`;
    },
});

// ---------------- présenter une bête ou une variété ----------------
defineSheet('defiPick', {
    title: 'Présenter au jury',
    render(o) {
        const d = G.curDefi();
        const st = d && d.steps[+o.k];
        if (!st || st.done) return empty('Cette étape est déjà réussie.');
        if (st.kind === 'animal') {
            const list = G.animalCandidates().sort((a, b) => b.score - a.score);
            if (!list.length) return empty('Aucune bête à présenter.');
            return `<p class="card-sub">Le jury veut une bête qui dépasse son espèce d’au moins <b>${st.n} points</b> de gènes (élevez, croisez les meilleures).</p>
                <div class="pick-grid">${list
                    .slice(0, 24)
                    .map(
                        c =>
                            `<button class="pick-cell${c.score >= st.n ? ' ok' : ' short'}" data-act="presentDefi" data-k="${o.k}" data-id="${c.a.uid}"><span class="pc-art">${animalArt(c.a.type, c.a.g)}</span><b>${esc(c.a.name)}</b><span class="pc-cost">${ANIMALS[c.a.type].name} · ${c.score} pt${c.score > 1 ? 's' : ''}</span></button>`,
                    )
                    .join('')}</div>`;
        }
        const list = G.varietyCandidates().sort((a, b) => b.score - a.score);
        if (!list.length) return empty('Aucune variété : croisez des plantes au labo.');
        return `<p class="card-sub">Le jury veut une variété qui gagne au moins <b>${st.n} points</b> de saveur sur son espèce.</p>
            <div class="pick-grid">${list
                .slice(0, 24)
                .map(
                    c =>
                        `<button class="pick-cell${c.score >= st.n ? ' ok' : ' short'}" data-act="presentDefi" data-k="${o.k}" data-id="${c.v.id}"><span class="pc-art">${varArt(c.v)}</span><b>${esc(G.varName(c.v))}</b><span class="pc-cost">${String(c.score).replace('.', ',')} pts</span></button>`,
                )
                .join('')}</div>`;
    },
});

// ---------------- la salle des trophées ----------------
defineSheet('trophies', {
    title: 'Salle des trophées',
    render() {
        const T = (state.defis && state.defis.trophies) || {};
        const cur = G.curDefi();
        const won = Object.values(T).filter(t => t.best).length;
        return `<p class="card-sub">${G.defiOpen() ? `${won} défi${won > 1 ? 's' : ''} sur 12 médaillé${won > 1 ? 's' : ''}. Un nouveau défi arrive toutes les deux semaines, tiré au hasard.` : `Les grands défis commencent au niveau ${DEFI.lvl}.`}</p>
            <div class="trophy-grid">${Object.entries(DEFIS)
                .map(([id, def]) => {
                    const t = T[id] || { best: 0, n: 0 };
                    const now = cur && cur.id === id;
                    return `<div class="trophy${t.best ? '' : ' none'}${now ? ' now' : ''}">${art('ui', CUPS[t.best || 0])}<b>${t.best || now ? def.name : '???'}</b><small>${now ? 'En cours' : t.n ? `${t.n} fois · ${DEFI.medals[t.best - 1].name.toLowerCase()}` : 'Pas encore joué'}</small>${t.gold ? `<span class="trophy-deco">${art('ui', def.deco)}</span>` : ''}</div>`;
                })
                .join('')}</div>`;
    },
});

export function setupDefis() {
    actions({
        giveDefi: (el, d) => G.giveDefi(+d.k, el),
        presentDefi: (el, d) => G.presentDefi(+d.k, d.id, el) && closeSheet('defiPick'),
    });
}
