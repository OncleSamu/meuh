// Animaux | Haras › Concours (1.24 → 1.180 Concours hippiques 2.0) :
// - Onglet Épreuves : Concours Express quotidiens (3/jour, jugement immédiat, échauffement tactique), Concours hebdo & Grand Prix
// - Onglet Boutique : Boutique des Éperons d'or (Avoine dorée, Soin complet, Manuel de maître écuyer, Élixir de galop, Pack Prestige & MeuhCG)
// - Onglet Palmarès : Étagère, pouvoirs permanents des chevaux Titrés & Grands Champions, et 5 paliers conservés au Prestige.

import { fmt } from '../../core/format.js';
import { emit } from '../../core/bus.js';
import {
    DISC,
    SHOW,
    HARAS_LVL,
    DISCIPLINES,
    FORM,
    SHOW_EXPRESS,
    SHOW_PREPS,
    SHOW_SHOP,
    SHOW_TITLE_FX,
} from '../../data/haras.js';
import { DECOS } from '../../data/farm.js';
import * as G from '../../systems/index.js';
import { blocks, actions, esc } from '../dom.js';
import { ico } from '../icons.js';
import { btn, hint, section, timer, segmented } from '../kit.js';
import { openHorseGame } from '../horsegame.js';
import { animalArt } from '../genlook.js';

const divName = i => SHOW.divs[i].name;
const num = n => Math.round(n);

let subTab = 'events'; // 'events' | 'shop' | 'palmares'
let pickHorseUid = null;
let shopHorseUid = null;

function ensurePickedHorse(lod, cur) {
    if (cur && lod.some(a => a.uid === cur)) return cur;
    return lod.length ? lod[0].uid : null;
}

function titleBadge(a) {
    const w = G.titlesOf(a.uid);
    if (!w) return '';
    if (w >= SHOW_TITLE_FX.champWins) {
        return `<span class="sh-badge champ">${ico(['ui', 'hCouronne'])}Champion · ${w}</span>`;
    }
    return `<span class="sh-badge titled">${ico(['ui', 'hCup2'])}Titré · ${w}</span>`;
}

function divChips(sel, act) {
    return `<div class="chips-row wrap sh-divs">${SHOW.divs
        .map((d, i) =>
            G.divOpen(i)
                ? `<button class="pick-chip${i === sel ? ' on' : ''}" data-act="${act}" data-div="${i}">${ico(['ui', 'hDiv' + (i + 1)])}${d.name}</button>`
                : `<span class="pick-chip off" title="${G.ensureShow().rose[i - 1]}/${SHOW.open} rosettes en ${divName(i - 1)}">${ico(['ui', 'hDiv' + (i + 1)])}${d.name} <small>${G.ensureShow().rose[i - 1]}/${SHOW.open}</small></span>`,
        )
        .join('')}</div>`;
}

function topBar() {
    const spurs = G.showSpurs();
    const wins = G.showWinsTotal();
    const oatsMs = G.showGoldOatsLeftMs();
    const elixirs = G.showElixirCount();
    const claimable = G.showPalmState().filter(t => t.canClaim).length;
    const tabs = segmented(
        [
            ['events', 'Épreuves'],
            ['shop', 'Boutique'],
            ['palmares', claimable ? `Palmarès +${claimable}` : 'Palmarès'],
        ],
        subTab,
        'shSub',
    );
    const pills = [
        `<span class="chip sh-spur-chip">${ico(['ui', 'hCouronne'])}<b>${fmt(spurs)}</b> Éperon${spurs > 1 ? 's' : ''}</span>`,
        `<span class="chip">${ico(['ui', 'hCup2'])}${fmt(wins)} victoire${wins > 1 ? 's' : ''}</span>`,
        oatsMs > 0 ? `<span class="chip sh-buff">${ico(['item', 'oat'])}Avoine dorée ${timer(Date.now() + oatsMs)}</span>` : '',
        elixirs > 0 ? `<span class="chip sh-buff">${ico(['ui', 'sparkle'])}${elixirs} Élixir${elixirs > 1 ? 's' : ''}</span>` : '',
    ]
        .filter(Boolean)
        .join('');
    return `<div class="sh-top-strip">${pills}</div>${tabs}`;
}

// ---------------- Résultats récents (Express, hebdo & Grand Prix) ----------------
function resultBlock(l) {
    const deco = l.deco ? DECOS[l.deco] : null;
    const label = l.kind === 'express' ? `« ${l.evName} »` : l.kind === 'gp' ? 'Grand Prix' : `en ${divName(l.div)}`;
    return `<div class="sh-res1"><p class="card-sub">${esc(l.name)} finit <b>${l.place}${l.place === 1 ? 'er' : 'e'}</b> (${label} · ${divName(l.div)}) avec ${l.note.toFixed(1).replace('.', ',')}${l.jules ? ' · Jules a monté' : ''}.</p>
        <div class="sh-gains">${l.coins ? `<span class="chip">${ico(['ui', 'coin'])}+${fmt(l.coins)}</span>` : ''}${l.spurs ? `<span class="chip sh-spur-chip">${ico(['ui', 'hCouronne'])}+${l.spurs} Éperon${l.spurs > 1 ? 's' : ''}</span>` : ''}${l.rosette ? `<span class="chip">${ico(['ui', 'hRos' + (l.div + 1)])}${l.crush ? 'Victoire écrasante : 2 rosettes' : 'Rosette'}</span>` : ''}${l.cup ? `<span class="chip">${ico(['ui', 'hCup2'])}Coupe</span>` : ''}${l.ribbon ? `<span class="chip">${ico(['ui', 'ribbon'])}+${l.ribbon} ruban</span>` : ''}${deco ? `<span class="chip">${ico(['ui', deco.id])}${deco.name}</span>` : ''}</div></div>`;
}
function lastCard() {
    const all = G.lastResults().filter(l => !l.seen);
    if (!all.length) return '';
    const best = all.reduce((x, y) => (y.place < x.place ? y : x));
    const seenDiv = new Set();
    const tables = all
        .filter(l => !seenDiv.has(l.kind + l.key + l.div) && seenDiv.add(l.kind + l.key + l.div))
        .map(
            l =>
                `<div class="sh-ranks"><small>${l.kind === 'express' ? l.evName : l.kind === 'gp' ? 'Grand Prix' : DISC[l.disc].name} · ${divName(l.div)}</small>${l.list
                    .map(
                        (x, i) =>
                            `<div class="sh-rank${x.mine || x.me ? ' me' : ''}"><b>${i + 1}</b><span>${esc(x.name)}</span><em>${x.note.toFixed(1).replace('.', ',')}</em></div>`,
                    )
                    .join('')}</div>`,
        )
        .join('');
    return `<div class="card sh-result"><div class="card-title">${ico(['ui', best.place === 1 ? 'hCup2' : 'hCup0'])}Résultats du concours</div>
        ${all.map(resultBlock).join('')}${tables}
        ${btn('Compris', { act: 'shSeen', size: 'sm', kind: 'gold' })}</div>`;
}

// ---------------- Concours Express quotidiens + Échauffement tactique ----------------
function expressSection(st, lod) {
    pickHorseUid = ensurePickedHorse(lod, pickHorseUid);
    const sel = lod.find(a => a.uid === pickHorseUid) || null;
    const div = st.div;
    const list = G.expressList();
    const left = G.expressLeft();
    const activePrep = sel ? G.prepOf(sel.uid) : null;

    const horsePicker = lod.length
        ? `<div class="sh-picker"><div class="card-sub">Cheval sélectionné pour les épreuves Express & l’échauffement :</div>
            <div class="chips-row wrap">${lod
                .map(a => {
                    const f = G.formOf(a);
                    const on = a.uid === pickHorseUid;
                    return `<button class="pick-chip${on ? ' on' : ''}" data-act="shPickH" data-uid="${a.uid}">${esc(a.name)} <small>${f}/${FORM.max}</small>${G.prepOf(a.uid) ? ' · prêt' : ''}</button>`;
                })
                .join('')}</div></div>`
        : '<div class="card"><small>Logez un cheval en box (onglet Écuries) pour participer aux épreuves.</small></div>';

    const prepBox = sel
        ? `<div class="card sh-prep-card">
            <div class="sh-prep-head"><b>Échauffement tactique · ${esc(sel.name)}</b>${
                activePrep
                    ? `<span class="chip sh-buff">${ico(activePrep.icon)}Actif : ${activePrep.name}</span>`
                    : '<small>Consommé au prochain départ</small>'
            }</div>
            <div class="sh-prep-grid">${SHOW_PREPS.map(p => {
                const isOn = activePrep && activePrep.id === p.id;
                const ok = G.canApplyPrep(sel.uid, p.id);
                return `<button class="sh-prep-btn${isOn ? ' on' : ''}" data-act="shPrep" data-uid="${sel.uid}" data-id="${p.id}"${!ok && !isOn ? ' disabled' : ''}>
                    <span class="sh-prep-top">${ico(p.icon)}<b>${p.name}</b></span>
                    <small>${p.desc}</small>
                    <em>${isOn ? 'Actif' : G.showPrepItemLabel(p)}</em>
                </button>`;
            }).join('')}</div></div>`
        : '';

    const exCards = list
        .map(ev => {
            const dInfo = DISC[ev.disc];
            const purse = Math.round(G.purseOf(div, SHOW_EXPRESS.purseMult));
            if (ev.done && ev.result) {
                const r = ev.result;
                return `<div class="card sh-ex done">
                    <div class="card-art">${ico(dInfo.icon, 'ico big')}</div>
                    <div class="card-main">
                        <div class="card-title">${ev.name}</div>
                        <div class="card-sub">${dInfo.name} · Terminé : <b>${r.place}${r.place === 1 ? 'er' : 'e'}</b> avec ${esc(r.name)} (${r.note.toFixed(1).replace('.', ',')})</div>
                        <div class="sh-gains compact">${r.coins ? `<span class="chip">${ico(['ui', 'coin'])}+${fmt(r.coins)}</span>` : ''}${r.spurs ? `<span class="chip sh-spur-chip">${ico(['ui', 'hCouronne'])}+${r.spurs}</span>` : ''}${r.rosette ? `<span class="chip">${ico(['ui', 'hRos' + (r.div + 1)])}Rosette</span>` : ''}</div>
                    </div></div>`;
            }
            const hope = sel ? G.showHope(sel, ev.disc) : 0;
            const prepAdd = sel ? G.prepBonus(sel.uid, ev.disc) : 0;
            const canGo = !!sel && G.canTrain(sel);
            return `<div class="card sh-ex">
                <div class="sh-ex-top">
                    <div class="card-art">${ico(dInfo.icon, 'ico big')}</div>
                    <div class="card-main">
                        <div class="card-sub">${dInfo.name} · ${divName(div)} · Bourse ${fmt(purse)} · +${SHOW_EXPRESS.spurs[0]} Éperons</div>
                        <div class="card-title">${ev.name}</div>
                        <div class="card-sub">${ev.sub}</div>
                        ${sel ? `<div class="card-sub">Note espérée (${esc(sel.name)}) : <b>${num(hope)}</b>${prepAdd ? ` (dont +${prepAdd} échauffement)` : ''} · Rivales ${SHOW.divs[div].rivals[0]}–${SHOW.divs[div].rivals[1]}</div>` : ''}
                    </div>
                </div>
                <div class="sh-ex-acts">
                    ${btn('Monter (mini-jeu)', { act: 'shExPlay', data: { uid: sel ? sel.uid : '', idx: ev.idx, d: ev.disc }, kind: 'green', size: 'sm', disabled: !canGo })}
                    ${btn('Confier à Jules', { act: 'shExJules', data: { uid: sel ? sel.uid : '', idx: ev.idx }, kind: 'gold', size: 'sm', disabled: !canGo })}
                </div></div>`;
        })
        .join('');

    return `${section(`Concours Express du jour · ${left}/${SHOW_EXPRESS.perDay} restant${left > 1 ? 's' : ''}`)}
        ${divChips(div, 'shDiv')}
        ${horsePicker}
        ${prepBox}
        <div class="sh-ex-list">${exCards}</div>`;
}

// ---------------- Concours de la semaine & Grand Prix ----------------
function horseRow(a, disc) {
    const hope = G.showHope(a, disc);
    const e = G.entryOf(a.uid);
    const left = G.entriesLeft();
    let right;
    if (!e)
        right = btn('Inscrire', {
            act: 'shEnter',
            data: { uid: a.uid },
            size: 'sm',
            kind: 'gold',
            disabled: left <= 0,
            title: left <= 0 ? `${SHOW.entries} chevaux au plus par semaine` : '',
        });
    else if (e.passage == null)
        right = `<span class="sh-acts">${btn('Jouer', { act: 'shPlay', data: { uid: a.uid, d: disc }, size: 'sm', kind: 'green', disabled: !G.canTrain(a) })}${btn('Retirer', { act: 'shOut', data: { uid: a.uid }, size: 'sm', kind: 'ghost' })}</span>`;
    else right = `<span class="chip">${ico(['ui', 'hCup0'])}Passage joué</span>`;
    return `<div class="card sh-horse${e ? ' mine' : ''}"><span class="sd-pic sm">${animalArt('horse', a.g)}</span><div class="card-main"><div class="card-title">${esc(a.name)}${e ? ` · ${divName(e.div)}` : ''} ${titleBadge(a)}</div>
        <div class="card-sub">${DISC[disc].name} ${G.aptOf(a, disc)}/${G.aptCap(a, disc)} · note espérée ${num(hope)}${G.prepOf(a.uid) ? ` · ${G.prepOf(a.uid).name}` : ''}</div></div>${right}</div>`;
}

function weekCard() {
    const st = G.ensureShow(),
        disc = G.weekDisc();
    const div = st.div;
    const n = G.entriesNow().length;
    const toPlay = G.entriesNow().filter(e => e.passage == null).length;
    const hint2 = n
        ? toPlay
            ? 'Jouez les passages quand vous voulez avant lundi, sinon Jules monte à votre place. Vos chevaux d’une même division courent aussi entre eux.'
            : 'Passages joués : les résultats tombent lundi.'
        : 'Inscrivez jusqu’à trois chevaux pour la grande épreuve hebdomadaire (+6 Éperons d’or en 1re place).';
    return `<div class="card sh-week"><div class="card-art">${ico(DISC[disc].icon, 'ico big')}</div><div class="card-main">
        <div class="card-sub">Concours de la semaine · ${n}/${SHOW.entries} inscrits</div><div class="card-title">${DISC[disc].name}</div>
        <div class="card-sub">Division ${divName(div)} · bourse ${fmt(G.purseOf(div))} · +6 Éperons (1er) · inscription ${fmt(G.feeOf(div))}</div>
        <div class="card-sub">Rivales : notes de ${SHOW.divs[div].rivals[0]} à ${SHOW.divs[div].rivals[1]} · Résultats dans ${timer(Date.now() + G.showEndsIn() * 1000)}</div></div></div>
        <p class="hint">${hint2}</p>`;
}

function gpCard(st, lod) {
    const active = G.gpActive();
    const g = G.gpOf();
    if (!active && !g)
        return `<div class="card sh-gp off"><div class="card-art">${ico(['ui', 'hCup2'], 'ico big')}</div><div class="card-main"><div class="card-title">Grand Prix du mois</div><div class="card-sub">Les quatre disciplines, bourses et Éperons doublés (+12 Éperons) et un ruban. Rendez-vous le premier week-end du mois, dans ${timer(G.gpAt())}.</div></div></div>`;
    if (!g) {
        const div = st.div;
        return `<div class="card sh-gp"><div class="card-art">${ico(['ui', 'hCup2'], 'ico big')}</div><div class="card-main"><div class="card-title">Grand Prix du mois</div>
            <div class="card-sub">Ce week-end · bourse ${fmt(G.purseOf(div, SHOW.gpMult))} · +12 Éperons · inscription ${fmt(G.feeOf(div, SHOW.gpMult))} · jusqu’à dimanche soir</div></div></div>
            <div class="chips-row wrap">${lod.map(a => `<button class="pick-chip" data-act="gpEnter" data-uid="${a.uid}">${esc(a.name)} · ${num(SHOW.rot.reduce((n, d) => n + G.showHope(a, d), 0) / SHOW.rot.length)}</button>`).join('') || '<small>Logez un cheval en box pour participer.</small>'}</div>`;
    }
    const a = G.horseByUid(g.uid);
    const rows = SHOW.rot
        .map(d => {
            const p = g.passes[d];
            return `<div class="card sh-horse"><div class="card-main"><div class="card-title">${ico(DISC[d].icon)}${DISC[d].name}</div><div class="card-sub">${p != null ? `Passage joué : ${num(p * 100)}` : 'À jouer (sinon Jules monte)'}</div></div>${
                p != null
                    ? `<span class="chip">${ico(['ui', 'hCup0'])}Fait</span>`
                    : btn('Jouer', { act: 'gpPlay', data: { uid: g.uid, d }, size: 'sm', kind: 'green', disabled: !a || !G.canTrain(a) })
            }</div>`;
        })
        .join('');
    return `<div class="card sh-gp"><div class="card-art">${ico(['ui', 'hCup2'], 'ico big')}</div><div class="card-main"><div class="card-title">Grand Prix · ${a ? esc(a.name) : ''}</div><div class="card-sub">Division ${divName(g.div)} · ${Object.keys(g.passes).length}/4 épreuves · fin dans ${timer(G.gpAt())}</div></div></div>${rows}`;
}

// ---------------- Onglet Boutique des Éperons d'or ----------------
function shopTab(lod) {
    shopHorseUid = ensurePickedHorse(lod, shopHorseUid);
    const spurs = G.showSpurs();
    const items = SHOW_SHOP.map(item => {
        const horsePick = item.needHorse
            ? lod.length
                ? `<div class="chips-row wrap sh-shop-pick">${lod
                      .map(a => `<button class="pick-chip${a.uid === shopHorseUid ? ' on' : ''}" data-act="shShopH" data-uid="${a.uid}">${esc(a.name)}</button>`)
                      .join('')}</div>`
                : '<small>Logez un cheval en box pour utiliser ce manuel.</small>'
            : '';
        const ok = G.canBuyShowShop(item.id, shopHorseUid);
        return `<div class="card sh-shop-card">
            <div class="sh-shop-row">
                <div class="card-art">${ico(item.icon, 'ico big')}</div>
                <div class="card-main">
                    <div class="card-title">${item.name}</div>
                    <div class="card-sub">${item.desc}</div>
                </div>
                ${btn(`${item.cost}`, {
                    act: 'shBuy',
                    data: { id: item.id, uid: item.needHorse ? shopHorseUid || '' : '' },
                    icon: ['ui', 'hCouronne'],
                    kind: ok ? 'gold' : '',
                    size: 'sm',
                    disabled: !ok,
                })}
            </div>
            ${horsePick}
        </div>`;
    }).join('');
    return `${section(`Boutique des Éperons d’or · ${fmt(spurs)} disponible${spurs > 1 ? 's' : ''}`)}
        <div class="sh-shop-list">${items}</div>
        ${hint('Les Éperons d’or se gagnent sur les podiums des Concours Express (jusqu’à +4), du Concours hebdomadaire (+6), du Grand Prix (+12) et des paliers du Palmarès. Ils sont conservés au Prestige.')}`;
}

// ---------------- Onglet Palmarès & Pouvoirs permanents ----------------
function shelf() {
    const s = G.ensureShow();
    return `<div class="card sh-shelf"><div class="sh-shelfrow">${SHOW.divs.map((d, i) => `<div class="sh-ros${s.rose[i] ? '' : ' none'}" title="${d.name}">${ico(['ui', 'hRos' + (i + 1)])}<b>${s.rose[i]}</b></div>`).join('')}</div>
        <div class="card-sub">${ico(['ui', 'hCup2'])}${s.cups} coupe${s.cups > 1 ? 's' : ''} · charme au concours de la ferme : +${G.showCharm()}</div></div>`;
}

function powersSummary(lod) {
    const titled = G.horses().filter(G.isTitledHorse).length;
    const champs = lod.filter(G.isGrandChampHorse).length;
    const aura = G.showStableAura();
    const palm = G.showPalmTotals();
    return `<div class="card sh-powers">
        <div class="card-title">${ico(['ui', 'hCouronne'])}Pouvoirs permanents actifs</div>
        <ul class="sh-pow-list">
            <li><b>Chevaux Titrés (${titled})</b> : forme -20 % temps, crin +25 % vitesse & +15 % qualité, randonnées +1 trouvaille (+50 % quantité), +8 pts transmis aux poulains.</li>
            <li><b>Grands Champions aux boxes (${champs})</b> : Aura d’écurie active <b>+${Math.round(aura.train * 100)} % entraînement</b> et <b>-${Math.round(aura.form * 100)} % temps de forme</b> pour les autres boxes (+1 gène transmis aux poulains).</li>
            <li><b>Bonus Palmarès cumulés</b> : +${Math.round(palm.train * 100)} % entraînement · +${Math.round(palm.purse * 100)} % bourses/saillies · -${Math.round(palm.form * 100)} % temps forme · +${Math.round(palm.crin * 100)} % crin · +${palm.note} pts note.</li>
        </ul>
    </div>`;
}

function palmaresTab(lod) {
    const tiers = G.showPalmState();
    const list = tiers
        .map(t => {
            const pct = Math.min(100, Math.round((t.wins / t.need) * 100));
            return `<div class="card sh-tier${t.reached ? ' on' : ''}${t.canClaim ? ' ready' : ''}">
                <div class="sh-tier-head">
                    <div><b>${t.name}</b> <small>(${Math.min(t.wins, t.need)}/${t.need} victoires)</small></div>
                    ${
                        t.claimed
                            ? `<span class="chip">${ico(['ui', 'hCup2'])}Acquis</span>`
                            : t.canClaim
                              ? btn('Réclamer', { act: 'shClaim', data: { id: t.id }, kind: 'gold', size: 'sm' })
                              : `<span class="chip off">${t.need} victoires</span>`
                    }
                </div>
                <div class="sh-tbar"><i style="width:${pct}%"></i></div>
                <div class="card-sub">${t.desc}</div>
                <div class="card-sub">Récompense : +${t.rubans} ruban${t.rubans > 1 ? 's' : ''} · +${t.spurs} Éperons d’or</div>
            </div>`;
        })
        .join('');
    return `${section('Votre étagère')}${shelf()}
        ${section('Pouvoirs des chevaux Titrés')}${powersSummary(lod)}
        ${section('Palmarès Hippique · conservé au Prestige')}<div class="sh-tiers">${list}</div>`;
}

// ---------------- Rendu principal ----------------
function renderShow(el) {
    if (!G.showOpen())
        return blocks(el, [
            [
                'closed',
                `<div class="card island-closed"><div class="card-title">Les concours</div><p class="card-sub">S’ouvrent au niveau ${HARAS_LVL}.</p></div>`,
            ],
        ]);
    if (!G.stableLvl())
        return blocks(el, [
            [
                'closed',
                '<div class="card island-closed"><div class="card-title">Les concours</div><p class="card-sub">Construisez d’abord les grandes écuries (choix Écuries, en haut).</p></div>',
            ],
        ]);
    G.tidyHaras();
    const st = G.ensureShow(),
        lod = G.lodged(),
        disc = G.weekDisc();

    if (subTab === 'shop') {
        return blocks(el, [
            ['top', topBar()],
            ['shop', shopTab(lod)],
        ]);
    }
    if (subTab === 'palmares') {
        return blocks(el, [
            ['top', topBar()],
            ['palm', palmaresTab(lod)],
        ]);
    }

    blocks(el, [
        ['top', topBar()],
        ['last', lastCard()],
        ['express', expressSection(st, lod)],
        ['wksec', section('Concours de la semaine')],
        ['week', weekCard()],
        ...(lod.length
            ? lod.map(a => ['h' + a.uid, horseRow(a, disc)])
            : [['none', '<div class="card"><small>Logez un cheval en box pour le faire concourir.</small></div>']]),
        ['gps', section('Le Grand Prix du mois')],
        ['gp', gpCard(st, lod)],
        [
            'hint',
            hint(
                `Trois Concours Express par jour à jugement immédiat, un grand Concours hebdomadaire (${DISCIPLINES.map(d => d.name.toLowerCase()).join(', ')}) et un Grand Prix mensuel. Note : aptitude 55 %, passage 30 %, présentation 15 %, +10 % spécialité + échauffement + Palmarès. Trois rosettes ouvrent la division suivante (une victoire écrasante en vaut deux).`,
            ),
        ],
    ]);
}
export { renderShow }; // 1.44.2 : dans le volet Haras (voir haras.js)

const horseOf = d => G.horseByUid(d.uid);
export function setupShow() {
    actions({
        shSub: (el, d) => {
            subTab = d.v;
            emit('changed', 'show');
        },
        shDiv: (el, d) => {
            G.ensureShow().div = +d.div;
            emit('changed', 'show');
        },
        shPickH: (el, d) => {
            pickHorseUid = d.uid;
            emit('changed', 'show');
        },
        shShopH: (el, d) => {
            shopHorseUid = d.uid;
            emit('changed', 'show');
        },
        shPrep: (el, d) => G.applyPrep(d.uid, d.id, el),
        shExPlay: (el, d) => {
            const ev = G.expressList()[+d.idx];
            if (!ev || ev.done || !horseOf(d)) return;
            openHorseGame(d.uid, d.d, el, 'express', { idx: +d.idx, div: G.ensureShow().div, evName: ev.name });
        },
        shExJules: (el, d) => G.runExpressJules(d.uid, +d.idx, G.ensureShow().div, el),
        shBuy: (el, d) => G.buyShowShop(d.id, d.uid || shopHorseUid, el),
        shClaim: (el, d) => G.claimShowPalm(d.id, el),
        shEnter: (el, d) => G.enterShow(d.uid, G.ensureShow().div, el),
        shPlay: (el, d) => horseOf(d) && openHorseGame(d.uid, d.d, el, 'show'),
        shSeen: () => G.showSeen(),
        shOut: (el, d) => G.withdrawShow(d.uid),
        gpEnter: (el, d) => G.enterGp(d.uid, G.ensureShow().div),
        gpPlay: (el, d) => horseOf(d) && openHorseGame(d.uid, d.d, el, 'gp'),
    });
}
