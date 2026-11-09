// 1.101 : la carte du camping de la vallée. Un vrai terrain, tout près de la ferme : les emplacements avec leurs tentes, les cabanes
// des résidents, les aménagements, le feu de camp, la Maison et la tente de la fête. On touche un campeur pour lui parler.
import { fmt } from '../../core/format.js';
import { CAMPING, PROFILES, EVENT_BONUS } from '../../data/camping.js';
import { now } from '../../core/clock.js';
import { PALETTES } from '../../data/maison.js';
import { state } from '../../core/state.js';
import * as G from '../../systems/index.js';
import { blocks, actions, esc } from '../dom.js';
import { ico } from '../icons.js';
import { btn } from '../kit.js';
import { defineView, go } from '../app.js';
import { defineSheet, openSheet } from '../sheets.js';
import { SPRITES, TENT_COLORS, CABIN_COLORS, sceneBg } from '../../art/camping.js';
import { campingCard, askCard, residentCard, guestCard, upsHtml } from './camping.js';
import '../sheets/resfiche.js';

// positions en % de la largeur (x) et de la hauteur (y) du terrain
const PITCH = [[14, 52], [38, 52], [62, 52], [86, 52], [14, 66], [38, 66], [62, 66], [86, 66], [14, 80], [38, 80], [62, 80], [86, 80]];
const CABINS = [[9, 25], [25.5, 25], [42, 25], [58, 25], [74.5, 25], [91, 25], [9, 39], [25.5, 39], [42, 39], [58, 39], [74.5, 39], [91, 39]];
const AMEN = { water: [12, 9], sanitary: [31, 9], common: [52, 9], play: [72, 9], shop: [90, 9] };
const ASKS = [[27, 92], [38, 92], [62, 92]];
const hash = s => [...String(s)].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);

function spot(x, y, w, inner, { act, data = {}, cls = '', label = '' } = {}) {
    const d = Object.entries(data).map(([k, v]) => ` data-${k}="${v}"`).join('');
    const tag = act ? 'button' : 'div';
    return `<${tag} class="cm-spot ${cls}" style="left:${x}%;top:${y}%;width:${w}%"${act ? ` data-act="${act}"${d}` : ''}${label ? ` aria-label="${esc(label)}"` : ''}>${inner}</${tag}>`;
}
const bubble = (inner, cls = '') => `<span class="cm-bub ${cls}">${inner}</span>`;
const avatar = look => `<span class="cm-av">${ico(['villager', look], 'ico')}</span>`;

function sceneHtml() {
    const gs = G.campGuests(),
        res = G.campRes(),
        asks = G.campAsks();
    const pal = state.maison ? PALETTES[state.maison.palette] || PALETTES[0] : PALETTES[0];
    const out = [];
    const lights = [];
    const hr = new Date(now()).getHours();
    const night = hr >= 20 || hr < 7;
    // les arbres de la lisière
    [[4, 4], [96, 4], [3, 50], [97, 55], [4, 96], [96, 96], [3, 78]].forEach(([x, y], i) => out.push(spot(x, y, 12, SPRITES.tree(i % 2 ? '#3f9a58' : '#56b566'), { cls: 'deco' })));
    if (res.length <= 6) out.push(spot(50, 42, 17, SPRITES.sign(), { cls: 'static' }));
    // les aménagements
    Object.entries(AMEN).forEach(([id, [x, y]]) => {
        const own = G.campUp(id);
        const sprite = { water: 'well', sanitary: 'toilets', common: 'pavilion', play: 'swing', shop: 'shop' }[id];
        const till = id === 'shop' && own ? G.tillAmount() : 0;
        out.push(
            spot(x, y, 15, SPRITES[sprite]() + (till > 0 ? bubble(ico(['ui', 'coin']), 'ready') : !own ? bubble('+', 'plus') : ''), {
                act: id === 'shop' && own && till > 0 ? 'campTill' : 'open',
                data: id === 'shop' && own && till > 0 ? {} : { sheet: 'campups' },
                cls: `${own ? 'own' : 'ghost'} amen-${id}`,
                label: own ? (till > 0 ? `Encaisser ${till} pièces` : 'Aménagement') : 'Aménager',
            }),
        );
    });
    // les cabanes des résidents (et une cabane libre)
    res.forEach((r, i) => {
        const [x, y] = CABINS[i] || CABINS[0];
        const ready = G.resCanDeliver(r) || (G.resGiftReady(r) && r.likes.some(id => G.haveQ(id, 0) >= 1));
        const bub = G.resBasketReady(r) ? bubble(ico(['ui', 'basket']), 'ready') : r.order && G.resCanDeliver(r) ? bubble(ico(['item', r.order.item]), 'ready') : ready ? bubble('♥', 'ready') : '';
        if (night) lights.push(`<span class="cm-glow win" style="left:${x}%;top:${y + 2}%"></span>`);
        out.push(spot(x, y, 15, SPRITES.cabin(CABIN_COLORS[hash(r.id) % CABIN_COLORS.length]) + avatar(r.look) + bub, { act: 'campOne', data: { kind: 'res', i }, cls: 'cabin', label: r.name }));
    });
    if (res.length + asks.length < 12 && G.campBuilt()) {
        const [x, y] = CABINS[res.length];
        out.push(spot(x, y, 13, SPRITES.cabin('#d9d2c0'), { cls: 'ghost static' }));
    }
    // les emplacements et les tentes
    for (let i = 0; i < CAMPING.maxPitches; i++) {
        const [x, y] = PITCH[i];
        const g = gs[i];
        if (g) {
            const k = Object.keys(PROFILES).indexOf(g.profile);
            const next = g.wants.find(w => !w.done);
            const ready = g.wants.some((w, j) => G.canSell(g, j));
            const bub = next ? bubble(ico(['item', next.item]), ready ? 'ready' : '') : bubble('✓');
            const star = g.star != null ? `<span class="cm-star">${ico(['ui', 'star'])}</span>` : g.visits > 1 ? `<span class="cm-visits">×${g.visits}</span>` : '';
            out.push(spot(x, y, 20, SPRITES.tent(TENT_COLORS[(k + hash(g.name)) % TENT_COLORS.length]) + avatar(g.look) + bub + star, { act: 'campOne', data: { kind: 'guest', i }, cls: `tent${g.star != null ? ' star' : ''}`, label: g.name }));
        } else if (i < G.campPitches()) out.push(spot(x, y, 20, SPRITES.pitchOpen(), { cls: 'pitch static' }));
        else if (i === G.campPitches()) {
            out.push(
                spot(x, y, 20, SPRITES.pitchLocked() + bubble('+', 'plus'), {
                    act: 'campPitch',
                    cls: `pitch buy${G.canAddPitch() ? ' can' : ''}`,
                    label: `Un emplacement de plus, ${fmt(G.pitchCost())} pièces`,
                }),
            );
        } else out.push(spot(x, y, 20, SPRITES.pitchLocked(), { cls: 'pitch static far' }));
    }
    // le feu de camp, la Maison, la tente de la fête
    out.push(spot(50, 91, 13, SPRITES.fire(), { cls: 'fire static' }));
    if (night) lights.push('<span class="cm-glow fire" style="left:50%;top:91%"></span>');
    const mReady = G.maisonReady();
    out.push(
        spot(13, 92, 17, SPRITES.stall(pal) + (G.maisonBuilt() ? (mReady ? bubble('!', 'ready') : '') : bubble('+', 'plus')), {
            act: 'campHub',
            data: { id: 'maison' },
            cls: G.maisonBuilt() ? 'own' : 'ghost',
            label: G.maisonBuilt() ? G.brandName() : 'Fonder la Maison',
        }),
    );
    out.push(
        spot(87, 92, 17, SPRITES.marquee() + (G.canValleeFete() ? bubble('!', 'ready') : ''), {
            act: 'campHub',
            data: { id: 'fete' },
            cls: G.valleeDone() ? 'own' : 'ghost-soft',
            label: 'La fête de la vallée',
        }),
    );
    // les voyageurs qui demandent à s'installer, au portail
    asks.forEach((a, i) => out.push(spot(ASKS[i][0], ASKS[i][1], 9, `<span class="cm-av big">${ico(['villager', a.look], 'ico')}</span>${bubble('?', 'ready')}`, { act: 'campOne', data: { kind: 'ask', i }, cls: 'ask', label: `${a.name} voudrait s’installer` })));
    const ev = G.campEvent();
    const ribbon = `<button class="cm-event" data-act="open" data-sheet="campevent">${ico(['ui', 'sparkle'])}Aujourd’hui · ${ev.name}</button>`;
    return `${ribbon}<div class="cm-scene${night ? ' night' : ''}">${sceneBg()}${out.join('')}${night ? `<div class="cm-night"></div>${lights.join('')}` : ''}</div>`;
}

const BONUS_TXT = {
    gap: c => `arrivées +${c} %`,
    stay: c => `séjours +${c} %`,
    tip: c => `pourboires +${c} pts`,
    pay: c => `prix +${c} %`,
    fish: c => `poisson +${c} %`,
    till: c => `épicerie +${c} %`,
    xp: c => `expérience +${c} %`,
    order: c => `commandes +${c} %`,
    star: c => `remarquables +${c} pts`,
};
function infoHtml() {
    const till = G.tillAmount();
    const shop = G.campUp('shop') ? `<div class="od-line"><span><b>Caisse de l’épicerie</b><small>${fmt(till)} pièces</small></span>${btn('Encaisser', { act: 'campTill', kind: till > 0 ? 'green' : '', size: 'sm', disabled: till <= 0 })}</div>` : '';
    const pitch = G.pitchCost() ? `<div class="od-line"><span><b>Un emplacement de plus</b><small>${G.campPitches()} sur ${CAMPING.maxPitches}</small></span>${btn(`${fmt(G.pitchCost())}${ico(['ui', 'coin'])}`, { act: 'campPitch', kind: G.canAddPitch() ? 'green' : '', size: 'sm', disabled: !G.canAddPitch() })}</div>` : '';
    const ev = G.campEvent();
    const bonus = Object.entries(BONUS_TXT)
        .map(([k, f]) => [G.resBonus(k), f])
        .filter(([v]) => v > 0)
        .map(([v, f]) => f(Math.round(v * 100)));
    const fx = bonus.length ? `<div class="od-line">${ico(['ui', 'star'])}<span><b>Grâce aux résidents</b><small>${bonus.join(' · ')}</small></span></div>` : '';
    return `<div class="card camp-card"><div class="card-title">Le camping · ${G.campGuests().length}/${G.campPitches()} emplacements · ${G.campRes().length}/12 résidents</div>
        <div class="od-line">${ico(['ui', 'sparkle'])}<span><b>Aujourd’hui : ${ev.name}</b><small>${ev.txt}. Demain, autre chose.</small></span></div>${fx}
        <p class="card-sub">Touchez un campeur pour lui vendre ce qu’il cherche, une cabane pour parler au résident, un voyageur au portail pour l’accueillir. Les terrains grisés avec un « + » sont à aménager.</p>
        ${shop}${pitch}
        <div class="od-foot">${btn('Aménagements', { act: 'open', data: { sheet: 'campups' }, size: 'sm' })}${btn('Tout le camping', { act: 'campHub', data: { id: 'camping' }, size: 'sm' })}</div></div>`;
}
function renderCamp(el) {
    if (!G.campOpen()) return blocks(el, [['closed', `<div class="card"><p class="card-sub">Le camping de la vallée ouvre au niveau ${CAMPING.lvl}.</p></div>`]]);
    if (!G.campBuilt()) return blocks(el, [['build', campingCard()]]);
    blocks(el, [
        ['scene', sceneHtml()],
        ['info', infoHtml()],
    ]);
}
defineView('village/camping', renderCamp);

defineSheet('campone', {
    title: o => (o.kind === 'guest' ? 'Un campeur' : o.kind === 'res' ? 'Un résident' : 'Un voyageur'),
    render(o) {
        const i = +o.i;
        if (o.kind === 'guest') return G.campGuests()[i] ? guestCard(G.campGuests()[i], i) : '<p class="empty">Ce campeur est reparti.</p>';
        if (o.kind === 'res') return G.campRes()[i] ? residentCard(G.campRes()[i], i) : '<p class="empty">Ce résident n’est plus là.</p>';
        return G.campAsks()[i] ? askCard(G.campAsks()[i], i) : '<p class="empty">Ce voyageur est reparti.</p>';
    },
});
defineSheet('campevent', {
    title: 'Les soirées du camping',
    render: () => {
        const ev = G.campEvent();
        return `<div class="card camp-card"><div class="card-title">Aujourd’hui : ${ev.name}</div><p class="card-sub">${ev.txt} au camping (×${EVENT_BONUS}). Chaque jour, une nouvelle soirée :</p>${CAMP_EVENTS_LIST()}</div>`;
    },
});
const CAMP_EVENTS_LIST = () =>
    G.campEventsAll()
        .map(e => `<div class="od-line${e.id === G.campEvent().id ? ' on' : ''}">${ico(['ui', 'sparkle'])}<span><b>${e.name}</b><small>${e.txt}</small></span></div>`)
        .join('');
defineSheet('campups', {
    title: 'Aménagements du camping',
    render: () => `<div class="card camp-card">${upsHtml()}</div>`,
});

export function setupCampMap() {
    actions({
        campOne: (el, d) => (d.kind === 'res' ? openSheet('resFiche', { i: +d.i, tab: 'friend' }) : openSheet('campone', { kind: d.kind, i: +d.i })),
        campHub: (el, d) => (d.id === 'maison' ? go('machines/maison') : openSheet('hub', { id: d.id })),
    });
}
