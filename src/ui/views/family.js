// 1.123 : l'onglet Village › Famille : faire la cour, la noce, le conjoint et le foyer.
import { state } from '../../core/state.js';
import { fmt } from '../../core/format.js';
import { VILLAGERS } from '../../data/village.js';
import { ITEMS } from '../../data/items.js';
import { LOVES } from '../../data/friends.js';
import { FAMILY, DATES, FOYER } from '../../data/family.js';
import * as G from '../../systems/index.js';
import { actions, blocks, esc } from '../dom.js';
import { ico, art } from '../icons.js';
import { btn, bar, timer, hearts, costRow, section, hint, empty } from '../kit.js';
import { innerTabs } from '../innertabs.js';
import { defineView } from '../app.js';

const COIN = () => ico(['ui', 'coin']);
const roses = n =>
    `<span class="fm-roses">${Array.from({ length: FAMILY.roses }, (_, k) => `<i class="ico${k < n ? '' : ' off'}">${art('ui', 'fmRose')}</i>`).join('')}</span>`;
const portrait = (vid, cls = '') => `<span class="avatar ${cls}">${art('villager', vid)}</span>`;
const need = obj =>
    Object.entries(obj)
        .map(([id, n]) => `<span class="${(state.inventory[id] || 0) >= n ? 'ok' : 'short'}">${ico(['item', id])}${n}</span>`)
        .join('');

// ---------------- le cœur ----------------
function suitorGrid() {
    const F = G.ensureFamily();
    const list = G.suitors()
        .map(vid => ({ vid, h: G.heartsOf(vid), r: G.rosesOf(vid) }))
        .sort((a, b) => b.r - a.r || b.h - a.h);
    return `<div class="fm-grid">${list
        .map(({ vid, h, r }) => {
            const ok = G.canCourt(vid);
            const on = F.court === vid;
            return `<button class="fm-suitor${on ? ' on' : ''}${ok ? '' : ' locked'}" data-act="fmCourt" data-id="${vid}" ${ok ? '' : 'disabled'}>${portrait(vid)}<b>${esc(VILLAGERS[vid].name)}</b>${r ? roses(r) : hearts(Math.min(5, h))}<small>${on ? 'Votre cœur' : ok ? 'Faire la cour' : `${FAMILY.hearts} cœurs d’amitié`}</small></button>`;
        })
        .join('')}</div>`;
}
function courtCard() {
    const F = G.ensureFamily();
    const vid = F.court;
    const r = G.rosesOf(vid);
    const pts = G.lovePts(vid);
    const into = r >= FAMILY.roses ? 1 : (pts % FAMILY.rosePts) / FAMILY.rosePts;
    const wait = G.dateWaitLeft();
    const dates = DATES.map(d => {
        const lock = r < d.roses;
        const can = !lock && G.dateCan(d);
        const nd = !lock && G.dateNeed(d);
        const req = lock
            ? `${d.roses} roses`
            : [d.coins ? `<span class="${state.money >= G.dateCoins(d) ? 'ok' : 'short'}">${fmt(G.dateCoins(d))}${COIN()}</span>` : '', nd ? need(nd) : d.likes ? '<span class="short">3 produits qu’il ou elle aime</span>' : d.love ? `<span class="short">${ico(['item', LOVES[vid]])}1</span>` : '']
                  .filter(Boolean)
                  .join(' ') || 'gratuit';
        return `<button class="fm-date${can && !wait ? '' : ' off'}" data-act="fmDate" data-id="${d.id}" ${can && !wait ? '' : 'disabled'}>${ico(d.icon, 'ico big')}<span class="fm-date-main"><b>${d.name}</b><small>${d.text.replace('il ou elle', G.ilElle(vid))}</small><span class="cost">${req}</span></span><em>+${d.pts}</em></button>`;
    }).join('');
    const ringHave = state.inventory[FAMILY.ring] || 0;
    const propose =
        r >= FAMILY.roses
            ? `<div class="fm-propose">${ico(['ui', 'fmRing'], 'ico big')}<div><b>Demander ${esc(VILLAGERS[vid].name)} en mariage</b><small>Il faut une ${ITEMS[FAMILY.ring].name.toLowerCase()} (bijouterie) : vous en avez ${ringHave}.</small></div>${btn('Demander', { act: 'fmPropose', kind: 'gold', size: 'sm', disabled: !G.canPropose() })}</div>`
            : '';
    return `<div class="card fm-court"><div class="fm-head">${portrait(vid, 'big')}<div><div class="card-title">${esc(VILLAGERS[vid].name)}</div><div class="card-sub">${esc(VILLAGERS[vid].role)}</div>${roses(r)}${r < FAMILY.roses ? bar(into) : ''}</div></div>
        ${propose}
        ${section('Un rendez-vous', wait ? `<small class="fm-wait">prochain dans ${timer(Date.now() + wait)}</small>` : '')}
        <div class="fm-dates">${dates}</div>
        <p class="card-sub">Un cadeau qu’${G.ilElle(vid)} adore ou aime, offert au village, compte aussi (+${FAMILY.gift.love} ou +${FAMILY.gift.like}).</p>
        ${btn('Changer de prétendant', { act: 'fmStop', size: 'sm', kind: 'ghost' })}</div>`;
}
function engagedCard() {
    const F = G.ensureFamily();
    const vid = F.court;
    const bed = G.roomLvl('bedroom') > 0;
    const cost = G.weddingCost();
    return `<div class="card fm-court"><div class="fm-head">${portrait(vid, 'big')}<div><div class="card-title">Fiancés : vous et ${esc(VILLAGERS[vid].name)}</div><div class="card-sub">Tout le village attend la noce.</div></div></div>
        ${section('Préparer la noce')}
        <div class="fm-check ${bed ? 'ok' : 'short'}">${ico(['ui', 'fmBed'])}<span>La chambre des époux ${bed ? 'est prête' : 'est à construire (onglet Pièces)'}</span></div>
        <div class="fm-check">${ico(['ui', 'cake'])}<span>Le banquet et la décoration</span>${costRow(G.costParts(cost))}</div>
        ${btn('Célébrer la noce', { act: 'fmWed', kind: 'gold', wide: true, disabled: !G.canWed(), icon: ['ui', 'fmRing'] })}</div>`;
}
function spouseCard() {
    const vid = G.spouseOf();
    const F = G.ensureFamily();
    const a = G.affection();
    const days = Math.max(0, state.day - (F.wedDay || state.day));
    const wl = G.wordLeft(),
        bl = G.basketLeft();
    return `<div class="card fm-court fm-spouse"><div class="fm-head">${portrait(vid, 'big')}<div><div class="card-title">${esc(VILLAGERS[vid].name)}</div><div class="card-sub">Votre ${G.isShe(vid) ? 'épouse' : 'époux'} · ${days ? `mariés depuis ${days} jour${days > 1 ? 's' : ''}` : 'jeunes mariés'}</div>
        <div class="fm-aff">${ico(['ui', a >= FAMILY.aff.keep ? 'heart' : 'heartOff'])}${bar(a / 100, a >= FAMILY.aff.keep ? 'good' : 'bad')}<small>${a} %</small></div></div></div>
        <div class="fm-acts">
            ${btn(wl ? `Mot doux · ${timer(Date.now() + wl)}` : 'Un mot doux', { act: 'fmWord', kind: wl ? '' : 'green', size: 'sm', disabled: !!wl, icon: ['ui', 'heart'] })}
            ${btn(bl ? `Panier · ${timer(Date.now() + bl)}` : `Son panier (${G.basketQty()} × 3)`, { act: 'fmBasket', kind: bl ? '' : 'gold', size: 'sm', disabled: !!bl, icon: ['ui', 'basket'] })}
        </div>
        <p class="card-sub"><b>Son talent</b> : ${G.talentText(vid)}${G.spouseHappy() ? ' (un cran de plus, grâce à la tendresse)' : ''}.</p>
        ${hint(`La tendresse baisse un peu chaque jour. Au-dessus de ${FAMILY.aff.keep} %, le talent de votre ${G.isShe(vid) ? 'épouse' : 'époux'} monte d’un cran et ses paniers sont pleins. Un mot doux toutes les quatre heures suffit.`)}</div>`;
}
function heartTab() {
    const F = G.ensureFamily();
    if (F.spouse) return spouseCard();
    if (F.engaged) return engagedCard();
    return `${F.court ? courtCard() : `<div class="card fm-intro">${ico(['ui', 'fmHome'], 'ico big')}<div><div class="card-title">Fonder une famille</div><div class="card-sub">Choisissez à qui faire la cour parmi les villageois. Il faut ${FAMILY.hearts} cœurs d’amitié : les cadeaux du village les font monter.</div></div></div>`}
        ${section(F.court ? 'Les autres villageois' : 'À qui faire la cour ?')}${suitorGrid()}`;
}

// ---------------- le foyer ----------------
function foyerTab() {
    return `${hint('Le foyer s’agrandit pièce par pièce. Chaque pièce a son effet, et quelques-unes sont nécessaires : la chambre des époux avant la noce.')}
    ${FOYER.map(r => {
        const l = G.roomLvl(r.id);
        const nx = G.roomNext(r.id);
        const cur = l ? r.lv[l - 1].fx : 'Pas encore construite';
        return `<div class="card fm-room${l ? ' built' : ''}"><div class="card-head">${ico(r.icon, 'ico big')}<div class="card-main"><div class="card-title">${r.name}${r.lv.length > 1 ? ` <small>${l}/${r.lv.length}</small>` : ''}</div><div class="card-sub">${r.desc}</div><div class="card-sub"><b>${cur}</b></div></div></div>
            ${nx ? `<div class="fm-next"><small>${l ? 'Agrandir' : 'Construire'} : ${nx.fx}</small>${costRow(G.costParts(nx.cost))}${btn(l ? 'Agrandir' : 'Construire', { act: 'fmRoom', data: { id: r.id }, kind: 'green', size: 'sm', disabled: !G.roomCan(r.id) })}</div>` : '<p class="card-sub fm-done">Terminée</p>'}</div>`;
    }).join('')}
    <p class="card-sub center">Déjà investi dans le foyer : ${fmt(G.foyerSpent())}${COIN()}</p>`;
}

function renderFamily(el) {
    if (!G.familyOpen()) return blocks(el, [['lock', empty(`La famille s’ouvre au niveau ${FAMILY.lvl}.`)]]);
    const T = innerTabs(
        'fam',
        [
            ['heart', G.spouseOf() ? 'Mon foyer' : 'Cœur', null, G.familyReady()],
            ['foyer', 'Pièces', null, FOYER.some(r => G.roomCan(r.id)) && !G.roomLvl('bedroom') ? 1 : 0],
        ],
        'heart',
    );
    const t = T.cur;
    blocks(el, [
        ['tabs', T.html],
        ['heart', t === 'heart' ? heartTab() : ''],
        ['foyer', t === 'foyer' ? foyerTab() : ''],
    ]);
}
defineView('village/family', renderFamily);

export function setupFamily() {
    actions({
        fmCourt: (el, d) => G.court(d.id),
        fmStop: () => G.stopCourt(),
        fmDate: (el, d) => G.goDate(d.id, el),
        fmPropose: el => G.propose(el),
        fmWed: el => G.marry(el),
        fmWord: el => G.sweetWord(el),
        fmBasket: el => G.takeBasket(el),
        fmRoom: (el, d) => G.buildRoom(d.id, el),
    });
}
export const familyDot = () => (G.familyOpen() ? G.familyReady() : 0);
