// 1.70 : Village › Les villageois. Une liste courte (portrait, cœurs, un bouton) et, en touchant un villageois,
// sa fiche en quatre onglets : Amitié (cœurs, anniversaire, talent, duo), Cadeau, Goûts, Histoire.
import { state } from '../../core/state.js';
import { fmt } from '../../core/format.js';
import { ITEMS } from '../../data/items.js';
import { MACHINES } from '../../data/machines.js';
import { VILLAGERS, STORIES } from '../../data/village.js';
import * as G from '../../systems/index.js';
import { actions, esc } from '../dom.js';
import { ico, art } from '../icons.js';
import { btn, bar, hint, hearts, segmented, empty } from '../kit.js';
import { defineSheet, openSheet, sheetOpts, closeSheet } from '../sheets.js';
import { foldCard } from '../fold.js';
import { page, filterOf, filterChips, searchBox, queryOf, matchQ } from '../pager.js';
import { setupResFiche, resHeartsHtml } from '../sheets/resfiche.js';
import { pkHtml } from '../paquets.js';
import { go } from '../app.js';

const when = d => (d === 0 ? 'aujourd’hui' : d === 1 ? 'demain' : `dans ${d} jours`);
const whenShort = d => (d === 0 ? 'aujourd’hui' : d === 1 ? 'demain' : `dans ${d} j`);
// un petit drapeau sur la ligne du villageois
const flags = vid => {
    const f = [];
    if (G.isBirthday(vid)) f.push(`<span class="vl-flag cake" title="Anniversaire">${ico(['ui', 'cake'])}</span>`);
    if (G.villagerStoryReady(vid)) f.push(`<span class="vl-flag" title="Histoire prête">${ico(['ui', 'scroll'])}</span>`);
    return f.join('');
};
const storyOpen = vid => G.villagerStoryOpen(vid) || (G.duoOf(vid) && G.duoOpen(G.duoOf(vid)));

// ---------------- la liste ----------------
function rowHtml(vid) {
    const v = VILLAGERS[vid],
        h = G.heartsOf(vid);
    const gifted = G.giftedToday(vid),
        can = G.giftable(vid).length > 0;
    return `<div class="vl-row" data-act="villager" data-v="${vid}">
        <div class="avatar xs">${art('villager', vid)}</div>
        <div class="vl-main"><b>${v.name}${flags(vid)}</b><span class="vl-sub">${hearts(h)}${G.talentLevel(vid) ? `<small class="vl-talent">${ico(['ui', 'star'])}talent</small>` : ''}</span></div>
        ${gifted ? `<small class="vl-done">${ico(['ui', 'check'])}offert</small>` : btn('Offrir', { act: 'villager', data: { v: vid, t: 'gift' }, kind: can ? 'gold' : '', size: 'sm' })}</div>`;
}
// 1.101.3 : les résidents du camping, dans la même liste que les villageois (même ligne, même fiche)
const resCan = r => G.resGiftReady(r) && r.likes.some(id => (state.inventory[id] || 0) > 0);
function resRow(r, i) {
    const ready = G.resCanDeliver(r);
    const flag = ready ? `<span class="vl-flag" title="Commande prête">${ico(['item', r.order.item])}</span>` : '';
    return `<div class="vl-row" data-act="resOpen" data-i="${i}">
        <div class="avatar xs">${art('villager', r.look)}</div>
        <div class="vl-main"><b>${esc(r.name)}${flag}<small class="vl-job"> · ${esc(r.job)}</small></b><span class="vl-sub">${resHeartsHtml(r)}</span></div>
        ${G.resGiftReady(r) ? btn('Offrir', { act: 'resOpen', data: { i, t: 'gift' }, kind: resCan(r) ? 'gold' : '', size: 'sm' }) : `<small class="vl-done">${ico(['ui', 'check'])}offert</small>`}</div>`;
}
const resBlock = () => {
    const rs = G.campRes();
    return rs.length ? `<h4 class="vf-h">Résidents du camping</h4><div class="vl-list">${rs.map(resRow).join('')}</div>` : '';
};
export function villagersCard(flat = false) {
    const ids = G.presentVillagers();
    const rsn = G.campRes().length;
    const gift = ids.filter(id => !G.giftedToday(id) && G.giftable(id).length).length + G.campRes().filter(resCan).length;
    const bdays = G.nextBirthdays(ids, 6);
    const today = bdays.filter(([, d]) => d === 0).length;
    const sum = today
        ? `Anniversaire aujourd’hui !`
        : gift
          ? `${gift} cadeau${gift > 1 ? 'x' : ''} possible${gift > 1 ? 's' : ''}`
          : `${ids.length} villageois${rsn ? ` et ${rsn} résident${rsn > 1 ? 's' : ''}` : ''}`;
    // les anniversaires qui viennent : une ligne de portraits
    const cal = bdays.length
        ? `<div class="vl-bdays">${ico(['ui', 'cake'])}${bdays
              .slice(0, 4)
              .map(
                  ([vid, d]) =>
                      `<button class="vl-bday${d === 0 ? ' now' : ''}" data-act="villager" data-v="${vid}"><span class="avatar xs">${art('villager', vid)}</span><small>${whenShort(d)}</small></button>`,
              )
              .join('')}</div>`
        : '';
    const story = ids.filter(storyOpen);
    const opts = [['all', 'Tous', ids.length + rsn], ['gift', 'Cadeau possible', gift], ...(story.length ? [['story', 'Histoire', story.length]] : []), ...(rsn ? [['res', 'Résidents', rsn]] : [])];
    const f = filterOf('villagers', opts);
    const list = f === 'res' ? [] : f === 'gift' ? ids.filter(id => !G.giftedToday(id) && G.giftable(id).length) : f === 'story' ? story : ids;
    const pg = page('villagers:' + f, list, 14);
    const body =
        hint('Touchez un villageois pour sa fiche : cœurs, goûts, anniversaire, talent et histoire. Un cadeau par jour chacun.') +
        cal +
        filterChips('villagers', opts, f) +
        pg.top +
        (pg.items.length ? `<div class="vl-list">${pg.items.map(rowHtml).join('')}</div>` : f === 'res' ? '' : empty('Personne ici pour le moment.')) +
        pg.more +
        (f === 'all' || f === 'res' ? resBlock() : f === 'gift' && G.campRes().some(resCan) ? `<h4 class="vf-h">Résidents du camping</h4><div class="vl-list">${G.campRes().map((r, i) => (resCan(r) ? resRow(r, i) : '')).join('')}</div>` : '');
    // 1.73 : dans son onglet du village, la liste est déjà ouverte
    if (flat) return `<div class="card vl-card">${body}</div>`;
    return foldCard('villagers', ['ui', 'heart'], 'Les villageois', sum, body, gift > 0 || today > 0);
}

// ---------------- la fiche ----------------
function friendTab(vid) {
    const h = G.heartsOf(vid);
    const d = G.daysToBirthday(vid);
    const p = G.partnerOf(vid);
    const tl = G.talentLevel(vid);
    return `<div class="vf-block">${hearts(h)}${h < 5 ? bar(G.heartProgress(vid), 'pink') : ''}<p class="card-sub">${G.nextRewardText(vid)}</p></div>${pkAsk(vid)}
        <div class="vf-line">${ico(['ui', 'cake'])}<div><b>Anniversaire : ${G.birthdayText(vid)}</b><small>${d === 0 ? 'C’est aujourd’hui ! Un cadeau compte triple.' : `${when(d)[0].toUpperCase() + when(d).slice(1)}. Ce jour-là, un cadeau compte triple.`}</small></div></div>
        <div class="vf-line${tl ? '' : ' off'}">${ico(['ui', 'star'])}<div><b>Talent${tl === 2 ? ' doublé' : ''}</b><small>${G.talentText(vid)}${tl ? '' : ' (à 5 cœurs, doublé quand son histoire est finie)'}.</small></div></div>
        ${p && G.villagerHere(p) ? `<div class="vf-line">${`<span class="avatar xs">${art('villager', p)}</span>`}<div><b>Duo avec ${VILLAGERS[p].name}</b><small>Un cadeau à l’un fait plaisir à l’autre. Les deux à 5 cœurs : une histoire à deux.</small></div></div>` : ''}`;
}
// un produit à offrir
const giftCell = (vid, id, tag = '') =>
    `<button class="pick-cell" data-act="gift" data-v="${vid}" data-id="${id}"><span class="pc-art">${art('item', id)}</span><b>${ITEMS[id].name}</b><small>×${fmt(state.inventory[id])}${tag}</small></button>`;
// 1.103.1 : un paquet de la Maison comme cadeau du jour
function pkGifts(vid) {
    if (!G.maisonBuilt() || !state.maison.stock.length) return '';
    const cells = state.maison.stock
        .slice()
        .sort((a, b) => G.pkGiftPts(vid, b) - G.pkGiftPts(vid, a))
        .map(c => `<button class="pick-cell" data-act="giftPk" data-v="${vid}" data-uid="${c.uid}"><span class="pc-art">${pkHtml(c, 'sm')}</span><b>${esc(c.name)}</b><small>+${G.pkGiftPts(vid, c)} d’amitié</small></button>`)
        .join('');
    return `<h4 class="vf-h">Un paquet de ${esc(G.brandName())}</h4><div class="pick-grid">${cells}</div>${hint('Un paquet fait toujours plaisir, d’autant plus qu’il contient ce qu’il ou elle aime (et encore plus son produit adoré).')}`;
}
// 1.103.1 : sa commande d'un de vos paquets, s'il en a passé une à la Maison
function pkAsk(vid) {
    const o = G.orders().find(x => x.vid === vid && !x.due);
    if (!o) return '';
    return `<div class="vf-line">${pkHtml({ pack: o.pack || 'carton', items: o.items, q: o.q }, 'sm')}<div><b>Voudrait « ${esc(o.name)} »</b><small>Une commande à la Maison, ${esc(o.why)}.</small></div>${btn('Voir', { act: 'pkAskGo', size: 'sm' })}</div>`;
}
function giftTab(vid) {
    if (G.giftedToday(vid)) return `<p class="card-sub center">Déjà un cadeau aujourd’hui. Revenez demain !</p>`;
    const liked = G.giftable(vid).filter(id => id !== G.LOVES[vid] || G.loveFound(vid));
    const love = G.loveFound(vid) && state.inventory[G.LOVES[vid]] > 0;
    const top = liked.length
        ? `<div class="pick-grid">${liked.map(id => giftCell(vid, id, id === G.LOVES[vid] ? ' · adore' : ' · aime')).join('')}</div>`
        : '<p class="card-sub">Rien de ce qu’il ou elle aime en stock.</p>';
    // les autres produits (fabriqués), pour chercher son produit adoré
    const q = queryOf('vgift');
    const tried = G.triedOf(vid);
    const others = Object.keys(state.inventory)
        .filter(id => state.inventory[id] > 0 && ITEMS[id] && ITEMS[id].type === 'artisan' && !liked.includes(id) && !tried.includes(id))
        .filter(id => matchQ(q, ITEMS[id].name))
        .sort((a, b) => ITEMS[a].name.localeCompare(ITEMS[b].name));
    const pg = page('vgift:' + vid, others, 12);
    return `${G.isBirthday(vid) ? `<p class="vf-bday">${ico(['ui', 'cake'])}C’est son anniversaire : tout compte triple !</p>` : ''}
        <h4 class="vf-h">Ce qu’il ou elle aime${love ? ' (et adore)' : ''}</h4>${top}${pkGifts(vid)}
        <h4 class="vf-h">Autre chose ?</h4><p class="card-sub">Peut-être son produit adoré… ou un « bof ». Les produits déjà essayés n’apparaissent plus.</p>
        ${others.length > 12 || q ? searchBox('vgift', 'Chercher un produit') : ''}${pg.top}<div class="pick-grid">${pg.items.map(id => giftCell(vid, id)).join('')}</div>${pg.more}`;
}
function tasteTab(vid) {
    const love = G.LOVES[vid];
    const m = G.loveMachine(vid);
    const found = G.loveFound(vid);
    const loveHtml = found
        ? `<div class="vf-love">${art('item', love)}<div><b>Adore : ${ITEMS[love].name}</b><small>+5 points (triple le jour de son anniversaire, avec un merci).</small></div></div>`
        : `<div class="vf-love off"><span class="vf-q">?</span><div><b>Adore : à découvrir</b><small>${G.heartsOf(vid) >= 2 && m ? `Un indice : ça sort de ${MACHINES[m] ? `la machine « ${MACHINES[m].name} »` : 'votre atelier'}.` : 'Un indice à 2 cœurs.'}</small></div></div>`;
    const tried = G.triedOf(vid);
    return `${loveHtml}<h4 class="vf-h">Aime</h4><div class="vf-likes">${VILLAGERS[vid].likes
        .map(id => `<i class="ico${state.inventory[id] > 0 ? '' : ' dim'}" title="${ITEMS[id].name}">${art('item', id)}</i>`)
        .join('')}</div><p class="card-sub">+1 pour un produit brut, +3 pour un produit fabriqué.</p>
        ${tried.length ? `<h4 class="vf-h">Bof</h4><div class="vf-likes">${tried.map(id => `<i class="ico dim" title="${ITEMS[id].name}">${art('item', id)}</i>`).join('')}</div>` : ''}`;
}
function storyBlock(title, step, total, text, need, given, ready, act, data) {
    const lines = Object.entries(need)
        .map(([item, n]) => {
            const g = given[item] || 0;
            return `<span class="need${g >= n ? ' ok' : ''}"><button class="pgo" data-act="produce" data-id="${item}" aria-label="Produire">${ico(['item', item])}</button>${Math.min(g + (state.inventory[item] || 0), n)}/${n}</span>`;
        })
        .join('');
    return `<div class="vstory"><b>${ico(['ui', 'scroll'])}${esc(title)} · étape ${step + 1} sur ${total}</b><span class="card-sub">« ${text} »</span>
        <div class="needs">${lines}${btn('Apporter', { act, data, kind: ready ? 'gold' : '', size: 'sm' })}</div></div>`;
}
function storyTab(vid) {
    const out = [];
    const S = STORIES[vid];
    if (S) {
        const st = G.storyState(vid);
        if (G.heartsOf(vid) < 5)
            out.push(
                `<div class="vstory off"><b>${ico(['ui', 'lock'])}${esc(S.title)}</b><span class="card-sub">S’ouvre à 5 cœurs. Finie, elle double son talent.</span></div>`,
            );
        else if (st.step >= S.steps.length)
            out.push(
                `<div class="vstory done"><b>${ico(['ui', 'check'])}${esc(S.title)}</b><span class="card-sub">Histoire terminée · talent doublé</span></div>`,
            );
        else {
            const [text, need] = S.steps[st.step];
            out.push(storyBlock(S.title, st.step, S.steps.length, text, need, st.given, G.villagerStoryReady(vid), 'giveStory', { v: vid }));
        }
    }
    const d = G.duoOf(vid);
    if (d && d.every(G.villagerHere)) {
        const key = d.join('-'),
            D = G.DUO_STORIES[key],
            other = VILLAGERS[G.partnerOf(vid)].name;
        if (G.duoDone(d))
            out.push(
                `<div class="vstory done"><b>${ico(['ui', 'check'])}${esc(D.title)}</b><span class="card-sub">Histoire à deux terminée, avec ${other}</span></div>`,
            );
        else if (!G.duoOpen(d))
            out.push(
                `<div class="vstory off"><b>${ico(['ui', 'lock'])}${esc(D.title)}</b><span class="card-sub">Une histoire à deux avec ${other} : il faut les deux à 5 cœurs.</span></div>`,
            );
        else {
            const st = G.duoState(key);
            const [text, need] = D.steps[st.step];
            out.push(storyBlock(D.title, st.step, D.steps.length, text, need, st.given, G.duoReady(d), 'giveDuo', { k: key }));
        }
    }
    return out.join('') || '<p class="card-sub center">Pas d’histoire pour l’instant.</p>';
}

defineSheet('villager', {
    title: o => `<span class="avatar xs">${art('villager', o.vid)}</span>${VILLAGERS[o.vid].name}`,
    render(o) {
        const vid = o.vid;
        const tabs = [
            ['friend', 'Amitié', null],
            ['gift', 'Cadeau', null, !G.giftedToday(vid) && G.giftable(vid).length ? 1 : 0],
            ['taste', 'Goûts', null],
            ['story', 'Histoire', null, G.villagerStoryReady(vid) || (G.duoOf(vid) && G.duoReady(G.duoOf(vid))) ? 1 : 0],
        ];
        const cur = tabs.some(t => t[0] === o.tab) ? o.tab : 'friend';
        const body = cur === 'gift' ? giftTab(vid) : cur === 'taste' ? tasteTab(vid) : cur === 'story' ? storyTab(vid) : friendTab(vid);
        return `<p class="card-sub center">${VILLAGERS[vid].role}</p>${segmented(tabs, cur, 'vfTab')}<div class="vf-body">${body}</div>`;
    },
});

export function setupVillagers() {
    setupResFiche();
    actions({
        resOpen: (el, d) => openSheet('resFiche', { i: +d.i, tab: d.t || 'friend' }),
        villager: (el, d) => openSheet('villager', { vid: d.v, tab: d.t || 'friend' }),
        vfTab: (el, d) => {
            const s = sheetOpts('villager');
            if (s) s.tab = d.v;
        },
        giveDuo: (el, d) => G.giveDuoStory(d.k.split('-'), el),
        giftPk: (el, d) => G.giftPaquet(d.v, +d.uid, el),
        pkAskGo: () => {
            closeSheet('villager');
            go('machines/maison#orders');
        },
    });
}
