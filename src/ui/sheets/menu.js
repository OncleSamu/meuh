// Le menu (en haut à droite), les niveaux, l'almanach et la grange.
import { state, lvOk } from '../../core/state.js';
import { fmt } from '../../core/format.js';
import { ITEMS } from '../../data/items.js';
import { DAYS_PER_SEASON, WEATHER, GAME_MIN_PER_SEC } from '../../data/world.js';
import { RARE } from '../../data/commerce.js';
import { MAX_LEVEL } from '../../data/progress.js';
import * as G from '../../systems/index.js';
import { actions } from '../dom.js';
import { ico, art } from '../icons.js';
import { btn, navRow, lines, line, bar, dot } from '../kit.js';
import { go } from '../app.js';
import { toast } from '../../core/bus.js';
import { defineSheet, openSheet, closeSheet, sheetOpts } from '../sheets.js';

const COIN = () => ico(['ui', 'coin']);

// ---------------- le menu ----------------
defineSheet('menu', {
    title: 'Menu',
    hub: true,
    render() {
        const pts = G.skillPoints(),
            book = G.bookAllClaimable() + G.quartersClaimable();
        const badge = n => (n ? dot(n) : '›');
        return `<div class="menu-grid">
            ${navRow('Progrès', 'open', { sheet: 'progress' }, ['ui', 'skillbook'], badge(pts), 'Compétences, prestige et défis')}
            ${navRow('Livre de la ferme', 'open', { sheet: 'book' }, ['ui', 'book'], badge(book), 'Collection, maîtrise, exploits, légende, album et histoires de Mamie')}
            ${state.level >= 48 || G.caveLegends().length ? navRow('Salle des trophées', 'open', { sheet: 'trophies' }, ['ui', 'cupGold'], '›', 'Médailles des défis et lots légendaires') : ''}
            ${state.genetics && G.geneticsOpen() ? navRow('Mes créations', 'open', { sheet: 'creations' }, ['ui', 'trophy'], '›', 'Vos variétés et vos races fixées') : ''}
            ${navRow('Les niveaux', 'open', { sheet: 'levels' }, ['ui', 'star'], '›', `Niveau ${state.level}${state.level < MAX_LEVEL ? ` sur ${MAX_LEVEL}` : ''}`)}
            ${navRow('Statistiques', 'open', { sheet: 'stats' }, ['ui', 'chart'], '›', 'Gains, ventes et records')}
            ${navRow('Mes bonus', 'open', { sheet: 'bonus' }, ['ui', 'upgrade'], '›', 'Tous vos bonus permanents')}
            ${navRow('Almanach', 'open', { sheet: 'almanac' }, ['ui', G.season().icon], '›', 'Saison et météo')}
            ${navRow('Guide du fermier', 'open', { sheet: 'guide' }, ['ui', 'info'], '›', 'Chercher un produit ou un sujet')}
            ${navRow('Réglages', 'open', { sheet: 'settings' }, ['ui', 'gear'], '›', 'Son, confort, sauvegarde, installation')}
        </div>`;
    },
});

// ---------------- les niveaux ----------------
defineSheet('levels', {
    title: 'Les niveaux',
    cls: 'lv-sheet', // hauteur fixe : passer d'un niveau à l'autre ne fait pas sauter la fenêtre
    open(o) {
        o.l = Math.min(MAX_LEVEL, state.level + 1);
    },
    render(o) {
        const L = o.l;
        const status =
            L < state.level
                ? 'Déjà débloqué'
                : L === state.level
                  ? 'Votre niveau actuel'
                  : `Encore ${fmt(G.xpToLevel(L))} d’expérience${L === state.level + 1 ? '' : ` · ${L - state.level} niveaux`}`;
        const strip = Array.from({ length: MAX_LEVEL }, (_, k) => k + 1)
            .map(
                l =>
                    `<button class="lv-chip${l < state.level ? ' done' : l === state.level ? ' now' : ''}${l === L ? ' on" data-center="1' : ''}" data-act="lvPick" data-l="${l}">${l}</button>`,
            )
            .join('');
        return [
            [
                'nav',
                `<div class="lv-nav">${btn('', { act: 'lvStep', data: { d: -1 }, icon: ['ui', 'back'], disabled: L <= 1, title: 'Niveau précédent' })}<div class="lv-head"><b>Niveau ${L}</b><small>${status}</small></div>${btn('', { act: 'lvStep', data: { d: 1 }, icon: ['ui', 'next'], disabled: L >= MAX_LEVEL, title: 'Niveau suivant' })}</div>`,
            ],
            ['strip', `<div class="lv-strip">${strip}</div>`],
            [
                'list',
                `<div class="lines${L <= state.level ? ' got' : ''}">${G.unlocksAt(L)
                    .map(u => line(u.icon, u.name, u.big ? 'big' : ''))
                    .join('')}</div>`,
            ],
        ];
    },
});

// ---------------- l'almanach ----------------
defineSheet('almanac', {
    title: 'Almanach',
    render() {
        const sv = G.season(),
            w = G.weather(),
            nw = WEATHER[state.nextWeather] || WEATHER.sun;
        const tomorrow = G.seasonOfDay(state.day + 1);
        const crops = G.seasonCrops(sv.id);
        return `<div class="alm-season">${ico(['ui', sv.icon], 'ico huge')}<div><div class="card-title">${sv.name}</div><div class="card-sub">Jour ${G.dayInSeason()} sur ${DAYS_PER_SEASON} · jour ${state.day} de la ferme</div></div></div>
            ${lines([
                [['ui', w.icon], `<b>Aujourd’hui : ${w.name}</b><div class="card-sub">${w.desc}</div>`],
                [
                    ['ui', nw.icon],
                    `<b>Demain : ${nw.name}</b>${tomorrow.id !== sv.id ? ` · début du ${tomorrow.name.toLowerCase()}` : ''}<div class="card-sub">${nw.desc}</div>`,
                ],
            ])}
            <h3 class="section-title"><span>De saison (pousse 30 % plus vite)</span></h3>
            <div class="alm-crops">${crops.map(c => `<div class="alm-crop${!lvOk(c) ? ' locked' : ''}">${art('item', c.id)}<span>${c.name}</span></div>`).join('') || '<span class="card-sub">Aucune culture</span>'}</div>
            <h3 class="section-title"><span>Le temps à la ferme</span></h3>
            ${lines([
                [
                    ['ui', 'w_sun'],
                    `<b>L’heure de la ferme</b><div class="card-sub">Une journée de jeu dure environ ${Math.round(1440 / GAME_MIN_PER_SEC / 60)} minutes en vrai ; une saison (${DAYS_PER_SEASON} jours de jeu) environ ${Math.round((DAYS_PER_SEASON * 1440) / GAME_MIN_PER_SEC / 60)} minutes. Elle règle le jour, la nuit, la météo et les saisons.</div>`,
                ],
                [
                    ['ui', 'clock'],
                    '<b>Tous les minuteurs sont en temps réel</b><div class="card-sub">Cultures, bêtes, machines, cave, train, montgolfière, bateau, avion-cargo, brasserie, labo : « 2 h » veut dire deux vraies heures.</div>',
                ],
                [
                    ['ui', 'house'],
                    '<b>Jeu fermé, la ferme continue</b><div class="card-sub">Les cultures arrosées poussent, les bêtes produisent tant qu’elles ont à manger, les machines terminent leur file, la cave vieillit, les visiteurs arrivent et repartent, le commis récolte. Seuls les imprévus attendent votre retour.</div>',
                ],
            ])}
            <p class="card-sub foot-note">${sv.id === 'hiver' ? 'En hiver, les cultures hors saison poussent presque deux fois moins vite et les arbres dorment à moitié.' : sv.id === 'automne' ? 'En automne, les arbres fruitiers produisent 20 % plus vite.' : 'Profitez-en pour planter ce qui est de saison.'}</p>`;
    },
});

// ---------------- la grange ----------------
defineSheet('barn', {
    title: `${ico(['ui', 'barn'])}Grange`,
    render(o) {
        const used = G.barnUsed(),
            cap = G.barnCap(),
            l = state.barn.lvl;
        const cost = G.barnUpCost(l);
        const goods = G.barnGoods();
        const sel = o.sel && state.inventory[o.sel] ? o.sel : null;
        let item = '';
        if (sel) {
            const it = ITEMS[sel],
                keep = G.reservedQty(sel),
                surplus = G.isLocked(sel) ? 0 : G.sellableQty(sel);
            const r = surplus ? G.sellBatch(sel, surplus, false) : { gain: 0 };
            item = `<div class="card barn-item"><div class="card-head">${ico(['item', sel], 'ico big')}<div class="card-main"><div class="card-title">${it.name} ×${state.inventory[sel]}</div>
                <div class="card-sub">${keep ? `${keep} gardé${keep > 1 ? 's' : ''} pour les commandes · ` : ''}${G.isLocked(sel) ? 'verrouillé : jamais vendu' : `surplus : ${surplus}`}</div></div></div>
                <div class="row-btns">${btn(G.isLocked(sel) ? 'Déverrouiller' : 'Verrouiller', { act: 'lock', data: { id: sel }, size: 'sm', icon: ['ui', 'lock'] })}
                ${surplus && !G.challengeOn('noMarket') ? btn(`Grossiste +${fmt(r.gain)}${COIN()}`, { act: 'barnSell', data: { id: sel }, kind: 'gold', size: 'sm' }) : ''}
                ${surplus && it.sell ? btn('À l’étal', { act: 'barnStall', data: { id: sel }, kind: 'green', size: 'sm' }) : ''}
                ${btn('Produire', { act: 'produce', data: { id: sel }, size: 'sm' })}</div></div>`;
        }
        const can = G.canUpgradeBarn();
        return [
            ['meter', `<div class="barn-meter">${bar(used / cap, used >= cap ? 'red' : '')}<b>${used} / ${cap}</b></div>`],
            [
                'goods',
                `<div class="barn-goods">${
                    goods.length
                        ? goods
                              .map(
                                  id =>
                                      `<button class="bgood${sel === id ? ' sel' : ''}" data-act="barnSel" data-id="${id}" title="${ITEMS[id].name}">${ico(['item', id])}<b>${state.inventory[id]}</b>${G.isLocked(id) ? `<i class="lk">${art('ui', 'lock')}</i>` : ''}</button>`,
                              )
                              .join('')
                        : '<p class="empty">La grange est vide.</p>'
                }</div>`,
            ],
            [
                'item',
                item ||
                    (goods.length
                        ? '<p class="card-sub center">Touchez un produit pour le vendre, le mettre à l’étal, le verrouiller ou aller en produire.</p>'
                        : ''),
            ],
            [
                'up',
                `<div class="card barn-up"><div class="card-title">Agrandir la grange · niveau ${l + 2}</div>
                <div class="card-sub">+${G.barnCapAt(l + 1) - G.barnCapAt(l)} places. Les planches, clous et pots de peinture se trouvent en récoltant, en ramassant, à l’atelier, dans les livraisons et chez le marchand ambulant.</div>
                <div class="rare-row">${RARE.map(id => `<div class="rare-chip${state.inventory[id] >= cost[id] ? ' ok' : ''}">${ico(['item', id])}<b>${state.inventory[id]}</b><small>/ ${cost[id]}</small><span>${ITEMS[id].name}</span></div>`).join('')}</div>
                <div class="card-sub">Autres matériaux : ${ico(['item', 'wood'])} ${state.inventory.wood} bois, ${ico(['item', 'stone'])} ${state.inventory.stone} pierre</div>
                ${btn(`Agrandir · ${fmt(cost.coins)}${COIN()}`, { act: 'upgradeBarn', kind: can ? 'gold' : '', wide: true, disabled: !can })}</div>`,
            ],
            ['hint', '<p class="hint">Les graines, la nourriture, le compost et les matériaux ne prennent pas de place.</p>'],
        ];
    },
    foot: () => btn('Aller au marché', { act: 'barnMarket', wide: true, icon: ['ui', 'crate'] }),
});

// la liste d'un nouveau niveau repart du haut
const lvTop = () => {
    const el = document.querySelector('.lv-sheet [data-key="list"]');
    if (el) el.scrollTop = 0;
};

export function setupMenu() {
    actions({
        lvStep: (el, d) => {
            const o = sheetOpts('levels');
            o.l = Math.max(1, Math.min(MAX_LEVEL, o.l + +d.d));
            lvTop();
        },
        lvPick: (el, d) => {
            sheetOpts('levels').l = +d.l;
            lvTop();
        },
        barnSel: (el, d) => {
            const o = sheetOpts('barn');
            o.sel = o.sel === d.id ? null : d.id;
        },
        lock: (el, d) => G.toggleLock(d.id),
        barnSell: (el, d) => G.sellFromBarn(d.id, el),
        barnStall: (el, d) => {
            G.ensureStall();
            const k = G.stallFree();
            if (k < 0) return toast('L’étal est plein : encaissez ou attendez une vente', ['ui', 'stall']);
            closeSheet('barn');
            go('market/sell');
            openSheet('stall', { k, id: d.id });
        },
        upgradeBarn: el => G.upgradeBarn(el),
        barnMarket: () => {
            closeSheet('barn');
            go('market/sell');
        },
    });
}
