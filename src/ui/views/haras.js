// Animaux | Écuries (1.23) : les boxes, la forme, les soins, l'entraînement et la randonnée de vos chevaux.
import { state } from '../../core/state.js';
import { ITEMS } from '../../data/items.js';
import { DISCIPLINES, STABLE_NAMES, FORM, RATION, RANDO, APT, HARAS_LVL } from '../../data/haras.js';
import * as G from '../../systems/index.js';
import { blocks, actions, esc } from '../dom.js';
import { genWrap } from '../genlook.js';
import { ico, art } from '../icons.js';
import { btn, hint, section, hearts, costRow, timer } from '../kit.js';
import { defineView } from '../app.js';
import { stableSvg, boxSvg } from '../../art/v123haras.js';

// la tenue du cheval selon sa spécialité
const OUTFIT = { galop: 'horseSrace', dressage: 'horseSdress', saut: 'horseSjump', endurance: 'horseS' };
const horseArt = (a, r) => `<span class="hb-horse">${genWrap(art('animal', OUTFIT[r.spec] || 'horseS'), a.g)}</span>`;

function closedCard() {
    const n = G.stableNext();
    return `<div class="card island-closed"><div class="ic-art hz-stable">${stableSvg(0)}</div>
        <div class="card-title">Les grandes écuries</div>
        <p class="card-sub">Logez vos chevaux en boxes, soignez-les, entraînez-les au galop, à l’endurance, au dressage et au saut. Les concours viendront ensuite : élever, soigner, entraîner, concourir.</p>
        ${costRow(G.costParts(n.cost))}
        ${btn('Construire les écuries', { act: 'upStable', kind: 'green', wide: true, disabled: !G.stableCanUp(), icon: ['ui', 'hEcuries'] })}</div>`;
}

function headCard() {
    const lv = G.stableLvl(),
        n = G.stableNext();
    const up = n
        ? `${costRow(G.costParts(n.cost))}${btn(`Agrandir : ${n.boxes} boxes`, { act: 'upStable', kind: 'green', size: 'sm', disabled: !G.stableCanUp() })}`
        : '<small>Les écuries sont au maximum.</small>';
    return `<div class="card hz-head"><div class="card-art hz-stable">${stableSvg(lv)}</div><div class="card-main">
        <div class="card-title">${STABLE_NAMES[lv]}</div>
        <div class="card-sub">${G.lodged().length}/${G.boxCount()} boxes occupés · niveau ${lv}/3</div>
        <div class="hz-up">${up}</div></div></div>`;
}

const formPips = a => {
    const f = G.formOf(a);
    return `<span class="hz-form" title="Forme : ${f}/${FORM.max}"><b>Forme</b>${Array.from({ length: FORM.max }, (_, k) => `<i class="${k < f ? 'on' : ''}">${art('ui', 'hForme')}</i>`).join('')}${
        f < FORM.max ? `<small>${timer(Date.now() + G.formLeftMs(a))}</small>` : ''
    }</span>`;
};

function aptRow(a, d) {
    const cap = G.aptCap(a, d.id),
        pts = G.aptOf(a, d.id),
        r = G.rec(a);
    const can = G.canTrain(a) && pts < cap;
    return `<div class="hz-apt${r.spec === d.id ? ' spec' : ''}">
        <button class="hz-spec" data-act="haSpec" data-uid="${a.uid}" data-d="${d.id}" title="${r.spec === d.id ? 'Spécialité (+10 % en concours)' : 'Choisir comme spécialité'}">${ico(d.icon)}</button>
        <div class="hz-apt-main">
            <div class="hz-apt-top"><b>${d.name}</b><small>${pts}/${cap} · ${d.geneName} ${G.geneOf(a, d.id)}</small></div>
            <div class="hz-bar" style="--cap:${cap}%"><i style="width:${pts}%"></i><u></u></div>
        </div>
        ${btn('Entraîner', { act: 'haTrain', data: { uid: a.uid, d: d.id }, kind: 'gold', size: 'sm', disabled: !can, title: pts >= cap ? 'Plafond atteint' : `S’entraîner : ${d.text}` })}
    </div>`;
}

function randoRow(a) {
    if (G.randoDone(a))
        return btn('Revenir de randonnée : récupérer les trouvailles', {
            act: 'haRandoGet',
            data: { uid: a.uid },
            kind: 'gold',
            wide: true,
            icon: ['ui', 'hRando'],
        });
    if (G.onRando(a))
        return `<div class="hz-rando"><span>${ico(['ui', 'hRando'])}En randonnée, retour dans ${timer(Date.now() + G.randoLeftMs(a))}</span></div>`;
    return btn(`Randonnée de ${RANDO.hours} h`, {
        act: 'haRando',
        data: { uid: a.uid },
        size: 'sm',
        icon: ['ui', 'hRando'],
        disabled: G.formOf(a) < RANDO.cost,
    });
}

function horseCard(a) {
    const r = G.rec(a);
    const i = state.animals.indexOf(a);
    const ration = G.rationLeftMs(a) > 0 ? `<span class="chip hz-ration">${ico(['item', 'carrot'])}Ration ${timer(Date.now() + G.rationLeftMs(a))}</span>` : '';
    const rations = RATION.items
        .map(id =>
            btn(`${ITEMS[id].name} ×${state.inventory[id] || 0}`, {
                act: 'haRation',
                data: { uid: a.uid, id },
                size: 'sm',
                icon: ['item', id],
                disabled: !state.inventory[id] || G.onRando(a),
            }),
        )
        .join('');
    return `<div class="hz-card${G.onRando(a) ? ' away' : ''}">
        <div class="hz-top">
            <div class="hz-art">${boxSvg(false)}${horseArt(a, r)}</div>
            <div class="hz-who">
                <div class="hz-name"><b>${esc(a.name)}</b>${hearts(a.love || 0)}</div>
                <div class="hz-forme">${formPips(a)}${ration}</div>
                ${a.stack > 0 ? btn(`Ramasser le crin ×${a.stack}`, { act: 'haHair', data: { i }, kind: 'green', size: 'sm', icon: ['item', 'horsehair'] }) : ''}
            </div>
        </div>
        <div class="hz-apts">${DISCIPLINES.map(d => aptRow(a, d)).join('')}</div>
        <div class="hz-care">
            ${btn('Brosser', { act: 'haBrush', data: { uid: a.uid }, size: 'sm', icon: ['ui', 'hBrosse'], disabled: r.brushDay === state.day })}
            ${btn('Nourrir', { act: 'haFeed', data: { uid: a.uid }, size: 'sm', icon: ['item', 'feed'], disabled: a.food >= G.maxFood() })}
            ${randoRow(a)}
        </div>
        <div class="hz-care">${rations}</div>
        <div class="hz-foot">${btn('Au pré', { act: 'haOut', data: { uid: a.uid }, kind: 'ghost', size: 'sm', disabled: G.onRando(a) })}</div>
    </div>`;
}

function emptyBox(k) {
    const free = G.atGrass().filter(a => a.adult !== false);
    const chips = free.length
        ? free.map(a => `<button class="pick-chip" data-act="haIn" data-uid="${a.uid}">${esc(a.name)}</button>`).join('')
        : '<small>Aucun cheval adulte au pré. Les chevaux s’achètent au marché ou naissent au labo.</small>';
    return `<div class="hz-card empty"><div class="hz-art small">${boxSvg(false)}</div><div class="hz-pick"><b>Box ${k + 1} libre</b><div class="chips-row wrap">${chips}</div></div></div>`;
}

function renderHaras(el) {
    if (!G.harasOpen())
        return blocks(el, [
            [
                'closed',
                `<div class="card island-closed"><div class="card-title">Les grandes écuries</div><p class="card-sub">S’ouvrent au niveau ${HARAS_LVL}.</p></div>`,
            ],
        ]);
    if (!G.stableLvl()) return blocks(el, [['closed', closedCard()]]);
    G.tidyHaras();
    const lod = G.lodged();
    const boxes = [];
    for (let k = 0; k < G.boxCount(); k++) boxes.push([`b${k}`, lod[k] ? horseCard(lod[k]) : emptyBox(k)]);
    blocks(el, [
        ['head', headCard()],
        ['sec', section('Les boxes')],
        ...boxes,
        [
            'hint',
            hint(
                `Chaque aptitude monte jusqu’à un plafond de 40 + 12 × le gène (de ${APT.base} à ${APT.max}) : pour aller plus loin, croisez vos chevaux au labo. Un entraînement coûte une pastille de forme ; elle remonte toutes les 30 minutes, même jeu fermé. Les chevaux logés donnent toujours leur crin. Les mini-jeux et les concours arrivent ensuite.`,
            ),
        ],
    ]);
}
defineView('animals/haras', renderHaras);

export function setupHaras() {
    actions({
        upStable: el => G.upgradeStable(el),
        haIn: (el, d) => G.lodge(d.uid),
        haOut: (el, d) => G.unlodge(d.uid),
        haTrain: (el, d) => G.trainHorse(d.uid, d.d, el),
        haSpec: (el, d) => G.setSpec(d.uid, d.d),
        haBrush: (el, d) => G.brushHorse(d.uid, el),
        haFeed: (el, d) => G.feedHorse(d.uid, el),
        haRation: (el, d) => G.giveRation(d.uid, d.id, el),
        haRando: (el, d) => G.startRando(d.uid, el),
        haRandoGet: (el, d) => G.collectRando(d.uid, el),
        haHair: (el, d) => G.tapAnimal(+d.i, el),
    });
}
