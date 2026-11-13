// 1.123 : l'onglet Village › Famille : faire la cour, la noce, le conjoint et le foyer.
import { state } from '../../core/state.js';
import { fmt, qtyName } from '../../core/format.js';
import { VILLAGERS } from '../../data/village.js';
import { ITEMS } from '../../data/items.js';
import { LOVES } from '../../data/friends.js';
import { FAMILY, DATES, FOYER, KIDS, TASKS, KID_WED, TOWN, KID_METIER, MEAL, LANDMARKS } from '../../data/family.js';
import { townMapArt } from '../../art/famille.js';
import { METIERS } from '../../data/metiers.js';
import { defineSheet } from '../sheets.js';
import { renameBtn } from '../sheets/rename.js';
import * as G from '../../systems/index.js';
import { actions, blocks, esc } from '../dom.js';
import { ico, art } from '../icons.js';
import { btn, bar, timer, hearts, costRow, section, hint, empty } from '../kit.js';
import { innerTabs } from '../innertabs.js';
import { defineView, ui } from '../app.js';

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
    return `<div class="card fm-court fm-spouse"><div class="fm-head">${portrait(G.artId(vid), 'big')}<div><div class="card-title">${esc(G.vName(vid))}</div><div class="card-sub">Votre ${G.isShe(vid) ? 'épouse' : 'époux'} · ${days ? `mariés depuis ${days} jour${days > 1 ? 's' : ''}` : 'jeunes mariés'}</div>
        <div class="fm-aff">${ico(['ui', a >= FAMILY.aff.keep ? 'heart' : 'heartOff'])}${bar(a / 100, a >= FAMILY.aff.keep ? 'good' : 'bad')}<small>${a} %</small></div></div></div>
        <div class="fm-acts">
            ${btn(wl ? `Mot doux · ${timer(Date.now() + wl)}` : 'Un mot doux', { act: 'fmWord', kind: wl ? '' : 'green', size: 'sm', disabled: !!wl, icon: ['ui', 'heart'] })}
            ${btn(bl ? `Panier · ${timer(Date.now() + bl)}` : `Son panier (${G.basketQty()} × 3)`, { act: 'fmBasket', kind: bl ? '' : 'gold', size: 'sm', disabled: !!bl, icon: ['ui', 'basket'] })}
        </div>
        ${
            typeof vid === 'string'
                ? `<p class="card-sub"><b>Son talent</b> : ${G.talentText(vid)}${G.spouseHappy() ? ' (un cran de plus, grâce à la tendresse)' : ''}.</p>`
                : '<p class="card-sub">Venu du camping, il ou elle n’a pas de talent d’ami, mais ses paniers sont plus garnis (+30 %).</p>'.replace('il ou elle', G.ilElle(vid))
        }
        ${mealCard()}
        ${hint(`La tendresse baisse un peu chaque jour. Au-dessus de ${FAMILY.aff.keep} %, le talent de votre ${G.isShe(vid) ? 'épouse' : 'époux'} monte d’un cran et ses paniers sont pleins. Un mot doux toutes les quatre heures suffit.`)}</div>`;
}
// 1.127 : le repas de famille
function mealCard() {
    const guests = G.mealGuests();
    const left = G.mealLeft();
    const plan = G.mealPlan();
    const faces = guests
        .slice(0, 12)
        .map(p => `<span class="avatar sm" title="${esc(p.name)}">${art('villager', p.kid ? kidPic(p.kid) : p.look)}</span>`)
        .join('');
    const dishes = plan
        ? need(plan)
        : `<span class="short">${G.mealNeed()} plats cuisinés (soupe, omelette, quiche, gratin, pizza, pot-au-feu…)</span>`;
    return `${section('Le repas de famille', left ? `<small class="fm-wait">prochain dans ${timer(Date.now() + left)}</small>` : '')}
        <div class="fm-meal"><div class="fm-faces">${faces}${guests.length > 12 ? `<small>+${guests.length - 12}</small>` : ''}</div>
        <small>${guests.length} à table, un plat pour deux : ${dishes}</small>
        <small>Tendresse +${MEAL.aff}, bonheur des enfants +${MEAL.joy}, ${fmt(G.mealXp(guests.length, G.mealVaried(plan)))} d’expérience${G.mealVaried(plan) ? ' (menu varié : +50 %)' : ' (+50 % si tous les plats sont différents)'}</small>
        ${btn('Passer à table', { act: 'fmMeal', kind: 'gold', size: 'sm', disabled: !G.mealCan(), icon: ['ui', 'cake'] })}</div>`;
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

// ---------------- 1.124 : les enfants ----------------
export const kidPic = k => {
    const st = G.stageOf(k);
    return st === 0 ? `${k.girl ? 'B' : 'b'}:${k.look}` : st === 1 ? `c:${k.look}` : k.look;
};
const hoursText = h => (h >= 48 ? `${Math.round(h / 24)} jours` : h >= 1 ? `${Math.round(h)} h` : 'bientôt');
function kidCard(k) {
    const st = G.stageOf(k);
    const joy = G.kidJoy(k);
    const cares = G.caresOf(k)
        .map(c => {
            const left = G.careLeft(k, c);
            const nd = G.careNeed(c);
            const req = c.coins ? `${fmt(G.pocketCoins(c))}${COIN()}` : nd ? need(nd) : c.snack ? '<span class="short">un goûter</span>' : '';
            return `<button class="fm-care${G.careCan(k, c) ? '' : ' off'}" data-act="fmCare" data-id="${k.id}" data-c="${c.id}" ${G.careCan(k, c) ? '' : 'disabled'}>${ico(c.icon)}<span><b>${c.name}</b><small>${left ? timer(Date.now() + left) : req || '+' + KIDS.joy.care + ' de bonheur'}</small></span></button>`;
        })
        .join('');
    const find =
        st === 1
            ? `<div class="fm-find">${ico(['ui', 'basket'])}<span>${G.findReady(k) ? `${esc(k.name)} a ramassé des choses pour vous` : `${esc(k.name)} ramasse de petites choses… ${timer(Date.now() + G.findLeft(k))}`}</span>${G.findReady(k) ? btn('Voir', { act: 'fmFind', data: { id: k.id }, kind: 'gold', size: 'sm' }) : ''}</div>`
            : '';
    const tasks =
        st >= 2
            ? `<div class="fm-tasks">${TASKS.map(t => `<button class="fm-task${k.task === t.id ? ' on' : ''}" data-act="fmTask" data-id="${k.id}" data-t="${t.id}" title="${t.text}">${ico(t.icon)}<small>${t.name}</small></button>`).join('')}</div>
               <p class="card-sub">${k.task ? `${esc(TASKS.find(t => t.id === k.task).text[0].toUpperCase() + TASKS.find(t => t.id === k.task).text.slice(1))} : +${String(Math.round(G.kidHelp(k) * 1000) / 10).replace('.', ',')} %` : 'Choisissez où il ou elle donne un coup de main.'}</p>`
            : '';
    const adult = st >= KIDS.ages.length ? adultHtml(k) : '';
    const life = kidLife(k);
    const grow = st < KIDS.ages.length ? `<div class="fm-grow"><small>${KIDS.ageNames[st + 1]} dans ${hoursText(G.kidGrowLeft(k))}</small>${bar(G.stageInto(k))}</div>` : '';
    return `<div class="card fm-kid"><div class="fm-head">${portrait(kidPic(k), 'big')}<div><div class="card-title">${esc(k.name)} ${renameBtn('kid', k.id, 'Renommer')}</div><div class="card-sub">${G.stageName(k)} · ${k.girl ? 'votre fille' : 'votre fils'}</div>
        <div class="fm-aff">${ico(['ui', joy >= KIDS.joy.keep ? 'heart' : 'heartOff'])}${bar(joy / 100, joy >= KIDS.joy.keep ? 'good' : 'bad')}<small>${joy} %</small></div>${grow}</div></div>
        ${life}<div class="fm-cares">${cares}</div>${find}${tasks}${adult}</div>`;
}
// 1.127 : l'anniversaire et le cadeau préféré
function kidLife(k) {
    const fav = G.favOf(k);
    const have = state.inventory[fav] || 0;
    const gl = G.giftLeft(k);
    let bd = '';
    if (G.bdayToday(k)) {
        const cake = G.cakeOf();
        bd = `<div class="fm-bday">${ico(['ui', 'cake'], 'ico big')}<div><b>C’est l’anniversaire de ${esc(k.name)} !</b><small>${
            cake ? `Un ${ITEMS[cake].name.toLowerCase()}${have ? ` et son cadeau préféré (${ITEMS[fav].name.toLowerCase()})` : ''}.` : 'Il faut un gâteau (éponge, fraises, chocolat, noix…).'
        } Encore ${timer(Date.now() + G.bdayLeft(k))}</small></div>${btn('Fêter', { act: 'fmBday', data: { id: k.id }, kind: 'gold', size: 'sm', disabled: !G.bdayCan(k) })}</div>`;
    }
    const next = !G.isAdultKid(k) && !G.bdayToday(k) ? ` · anniversaire dans ${hoursText(G.bdayNext(k) / 3600000)}` : '';
    const gift = `<div class="fm-gift">${ico(['item', fav])}<span><small>Son cadeau préféré${next}</small><b>${esc(ITEMS[fav].name)}</b> <span class="${have ? 'ok' : 'short'}">(${have})</span></span>${btn(
        gl ? timer(Date.now() + gl) : 'Offrir',
        { act: 'fmGift', data: { id: k.id }, kind: gl ? '' : 'green', size: 'sm', disabled: !G.giftCan(k) },
    )}</div>`;
    return bd + askHtml(k) + gift;
}
// 1.128 : la petite demande
function askHtml(k) {
    const a = G.askOf(k);
    if (!a) return '';
    const have = state.inventory[a.item] || 0;
    return `<div class="fm-ask">${ico(['item', a.item], 'ico big')}<div><b>« Je peux avoir ${esc(qtyName(a.n, ITEMS[a.item].name))} ? »</b><small>C’est pour ${esc(a.why)}. Vous en avez ${have}. En retour : ${fmt(G.askCoins(a))}${COIN()} · encore ${timer(Date.now() + G.askLeft(k))}</small></div>
        <span class="fm-ask-btns">${btn('Donner', { act: 'fmAsk', data: { id: k.id }, kind: 'green', size: 'sm', disabled: !G.askCan(k) })}${btn('Non', { act: 'fmAskNo', data: { id: k.id }, kind: 'ghost', size: 'sm' })}</span></div>`;
}
// 1.125 : l'enfant adulte : son métier, son mariage, ses enfants
function adultHtml(k) {
    const met = `${section('Son métier')}<div class="fm-metiers">${Object.entries(METIERS)
        .map(([id, m]) => `<button class="fm-task${k.metier === id ? ' on' : ''}" data-act="fmMetier" data-id="${k.id}" data-m="${id}">${ico(m.icon)}<small>${m.name}</small></button>`)
        .join('')}</div><p class="card-sub">${k.metier ? `Les produits ${METIERS[k.metier].name === 'Cuisinier' ? 'du cuisinier' : 'de ce métier'} se vendent ${Math.round(KID_METIER.price * 100)} % plus cher.` : 'Choisissez son métier : ses produits se vendront un peu plus cher.'}</p>`;
    if (k.spouse) {
        const gk = (k.gk || [])
            .map(g =>
                G.gkBdayToday(g)
                    ? `<button class="fm-gk bday" data-act="fmGkBday" data-k="${k.id}" data-g="${g.id}" ${G.cakeOf() ? '' : 'disabled'}>${portrait(gkPic(g), 'sm')}<small>${esc(g.name)}</small><small class="gk-b">${ico(['ui', 'cake'])}Fêter</small></button>`
                    : `<span class="fm-gk">${portrait(gkPic(g), 'sm')}<small>${esc(g.name)}</small></span>`,
            )
            .join('');
        return `${met}${section('Au village')}<div class="fm-couple">${portrait(k.spouse.look, 'sm')}<span>Marié${k.girl ? 'e' : ''} à <b>${esc(k.spouse.name)}</b>, dans leur maison au village.</span></div>
            ${gk ? `<div class="fm-gks">${gk}</div>` : '<p class="card-sub">Un petit-enfant devrait bientôt arriver.</p>'}`;
    }
    const matches = G.kidMatches();
    const cost = G.kidWedCost();
    const list = matches.length
        ? `<div class="fm-matches">${matches
              .map(r => `<button class="fm-suitor" data-act="fmKidWed" data-id="${k.id}" data-r="${r.id}" ${G.kidCanWed(k, r.id) ? '' : 'disabled'}>${portrait(r.look)}<b>${esc(r.name)}</b><small>${esc(r.job || '')}</small></button>`)
              .join('')}</div><div class="fm-check">${ico(['ui', 'fmHome'])}<span>La noce et une maison au village</span>${costRow(G.costParts(cost))}</div>`
        : `<p class="card-sub">Les résidents du camping avec qui vous avez ${KID_WED.hearts} cœurs d’amitié pourront ${k.girl ? 'la' : 'le'} rencontrer.</p>`;
    return `${met}${section('Son cœur')}${list}`;
}
const gkPic = g => {
    const st = G.gkStage(g);
    return st === 0 ? `${g.girl ? 'B' : 'b'}:${g.look}` : st === 1 ? `c:${g.look}` : g.look;
};

// ---------------- 1.125 : la ville et l'arbre ----------------
function townTab() {
    const p = G.population();
    const nx = G.townNext();
    const tier = G.townTier();
    const prev = TOWN.tiers[tier].n;
    return `<div class="card fm-town"><div class="card-head">${ico(['ui', 'village'], 'ico big')}<div class="card-main"><div class="card-title">${G.townName()} · ${p.total} habitants</div>
        <div class="card-sub">Tout se vend ${String(Math.round((G.townMult() - 1) * 1000) / 10).replace('.', ',')} % plus cher grâce à la ville.</div></div></div>
        ${nx ? `<div class="fm-grow"><small>${nx.name} à ${nx.n} habitants</small>${bar((p.total - prev) / (nx.n - prev))}</div>` : ''}
        <div class="fm-pop">${[
            ['villager', 'odette', 'Villageois', p.villagers],
            ['ui', 'tent', 'Résidents du camping', p.residents],
            ['ui', 'fmHome', 'Votre famille', p.family + 1],
        ]
            .map(([a, b, n, v]) => `<span>${ico([a, b])}<b>${v}</b><small>${n}</small></span>`)
            .join('')}</div></div>
        ${townMap()}
        ${btn('L’arbre de la famille', { act: 'open', data: { sheet: 'famTree' }, kind: 'gold', wide: true, icon: ['ui', 'fmHome'] })}
        ${hint('La ville grandit avec ses habitants : les villageois, les résidents du camping, et votre famille (votre conjoint, vos enfants, leurs époux et vos petits-enfants). Chaque palier relève un peu tous les prix.')}`;
}
// 1.127 : la carte de la ville
function townMap() {
    const houses = G.townHouses();
    const tents = G.townTents();
    const marks = G.landmarks();
    const pick = ui.sel.tmPick;
    let info = 'Touchez une maison pour voir qui y habite.';
    if (pick && pick.k === 'house' && houses[pick.i]) {
        const h = houses[pick.i];
        info = `<b>${esc(h.name)}</b> · ${h.who.map(esc).join(', ')}`;
    } else if (pick && pick.k === 'tent' && tents[pick.i]) info = `<b>Une tente du camping</b> · ${esc(tents[pick.i])}`;
    else if (pick && pick.k === 'mark' && marks[pick.i]) info = `<b>${esc(marks[pick.i].name)}</b> · bâti quand la vallée est devenue « ${TOWN.tiers[marks[pick.i].tier].name} »`;
    const nx = LANDMARKS.find(l => l.tier > G.townTier());
    return `<div class="card tm-card">${townMapArt(houses, tents, marks, pick)}<p class="card-sub center tm-info">${info}</p>${
        nx ? `<p class="card-sub center">Prochain grand bâtiment : ${nx.name.toLowerCase()}, au palier « ${TOWN.tiers[nx.tier].name} ».</p>` : ''
    }</div>`;
}
const node = (pic, name, sub, cls = '') => `<div class="ft-node ${cls}">${portrait(pic, 'sm')}<b>${esc(name)}</b>${sub ? `<small>${sub}</small>` : ''}</div>`;
defineSheet('famTree', {
    title: 'L’arbre de la famille',
    render() {
        const F = G.ensureFamily();
        const me = node(G.meLook(), 'Vous', G.farmName());
        const sp = F.spouse ? node(G.artId(F.spouse), G.vName(F.spouse), F.wedDay ? `marié${G.isShe(F.spouse) ? 'e' : ''} le jour ${F.wedDay}` : '') : '';
        // 1.126 : les anciens, de la plus vieille génération à la vôtre, et vos frères et sœurs
        const old = (F.elders || [])
            .map(e => `<div class="ft-couple ft-elder">${node(e.look, `Génération ${e.gen}`, 'à la retraite')}${e.spouse ? `<i class="ft-love">♥</i>${node(G.artId(e.spouse), G.vName(e.spouse), '')}` : ''}</div>`)
            .join('<div class="ft-down"></div>');
        const kin = (F.kin || []).length
            ? `<div class="ft-row ft-kin">${F.kin.map(k => `<div class="ft-couple">${node(k.look, k.name, k.metier ? METIERS[k.metier].name : 'au village')}${k.spouse ? `<i class="ft-love">♥</i>${node(k.spouse.look, k.spouse.name, '')}` : ''}</div>`).join('')}</div><p class="card-sub center">Vos frères et sœurs, au village</p>`
            : '';
        const kidsCols = F.kids
            .map(
                k => `<div class="ft-col"><div class="ft-couple">${node(kidPic(k), k.name, G.stageName(k))}${k.spouse ? `<i class="ft-love">♥</i>${node(k.spouse.look, k.spouse.name, 'du camping')}` : ''}</div>
                ${(k.gk || []).length ? `<div class="ft-row ft-gen2">${k.gk.map(g => node(gkPic(g), g.name, KIDS.ageNames[G.gkStage(g)])).join('')}</div>` : ''}</div>`,
            )
            .join('');
        return `<div class="ft">${old}${old ? '<div class="ft-down"></div>' : ''}${kin}<div class="ft-couple ft-root">${me}${sp ? `<i class="ft-love">♥</i>${sp}` : ''}</div>
            ${F.kids.length ? `<div class="ft-row ft-kids">${kidsCols}</div>` : '<p class="empty">Les enfants viendront ici.</p>'}</div>`;
    },
});
// 1.126 : la transmission
function legacyCard() {
    const F = G.ensureFamily();
    if (!F.kids.length || !F.kids.some(k => G.isAdultKid(k))) return '';
    const left = G.legacyLeft();
    const heirs = G.heirs();
    const conf = ui.sel.fmLegate;
    return `<div class="card fm-legacy"><div class="card-head">${ico(['ui', 'fmHome'], 'ico big')}<div class="card-main"><div class="card-title">La transmission · génération ${G.generation()}</div>
        <div class="card-sub">Léguez la ferme à un enfant adulte qui a choisi son métier : vous devenez lui ou elle. Rien ne repart de zéro : la ferme, les pièces d’or et le niveau restent. Vous et votre conjoint prenez votre retraite au village, et les anciens donnent +${Math.round(G.LEGACY.xp * 100)} % d’expérience aux commandes, à chaque génération.</div></div></div>
        ${left ? `<p class="card-sub center">Possible dans ${timer(Date.now() + left)}</p>` : heirs.length ? `<div class="fm-matches">${heirs.map(k => `<button class="fm-suitor${conf === k.id ? ' on' : ''}" data-act="fmLegate" data-id="${k.id}">${portrait(k.look)}<b>${esc(k.name)}</b><small>${conf === k.id ? 'Toucher encore pour confirmer' : METIERS[k.metier].name}</small></button>`).join('')}</div>` : '<p class="card-sub center">Un enfant adulte doit d’abord choisir son métier.</p>'}</div>`;
}
function kidsTab() {
    const F = G.ensureFamily();
    if (!F.spouse) return empty('Les enfants viendront après la noce.');
    const max = G.kidsMax();
    const left = G.babyLeft();
    const head = F.baby
        ? `<div class="card fm-intro">${ico(['ui', 'fmCradle'], 'ico big')}<div><div class="card-title">Un heureux événement</div><div class="card-sub">Le bébé arrive dans ${timer(Date.now() + left)}.</div></div></div>`
        : F.kids.length < KIDS.max
          ? `<div class="card fm-intro">${ico(['ui', 'fmCradle'], 'ico big')}<div><div class="card-title">Agrandir la famille</div><div class="card-sub">${
                F.kids.length >= max
                    ? `Il faut ${F.kids.length ? 'agrandir la chambre des enfants' : 'la chambre de bébé'} (onglet Pièces).`
                    : G.spouseHappy()
                      ? `${F.kids.length}/${KIDS.max} enfants. Le bébé arrive six heures après.`
                      : `${G.vName(F.spouse)} doit se sentir aimé${G.eFem(F.spouse)} (tendresse au-dessus de ${FAMILY.aff.keep} %).`
            }</div></div>${btn('Un bébé', { act: 'fmExpect', kind: 'gold', size: 'sm', disabled: !G.canExpect() })}</div>`
          : '';
    return `${head}${F.kids.map(kidCard).join('')}${legacyCard()}
        ${F.kids.length ? hint(`Le bonheur baisse chaque jour : au-dessous de ${KIDS.joy.keep} %, un enfant grandit deux fois moins vite et aide moitié moins. Chaque soin donne du bonheur et fait grandir un peu.`) : ''}`;
}

function renderFamily(el) {
    if (!G.familyOpen()) return blocks(el, [['lock', empty(`La famille s’ouvre au niveau ${FAMILY.lvl}.`)]]);
    const T = innerTabs(
        'fam',
        [
            ['heart', G.spouseOf() ? 'Mon foyer' : 'Cœur', null, G.familyReady()],
            ...(G.spouseOf() ? [['kids', 'Enfants', null, G.kids().reduce((a, k) => a + G.kidReady(k), 0) + (G.canExpect() ? 1 : 0)]] : []),
            ['foyer', 'Pièces', null, FOYER.some(r => G.roomCan(r.id)) && !G.roomLvl('bedroom') ? 1 : 0],
            ['town', 'La ville', null, 0],
        ],
        'heart',
    );
    const t = T.cur;
    blocks(el, [
        ['tabs', T.html],
        ['heart', t === 'heart' ? heartTab() : ''],
        ['kids', t === 'kids' ? kidsTab() : ''],
        ['foyer', t === 'foyer' ? foyerTab() : ''],
        ['town', t === 'town' ? townTab() : ''],
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
        fmExpect: () => G.expect(),
        fmCare: (el, d) => G.careKid(d.id, d.c, el),
        fmFind: (el, d) => G.kidFind(d.id, el),
        fmTask: (el, d) => G.setTask(d.id, d.t),
        fmGift: (el, d) => G.giveKidGift(d.id, el),
        fmAsk: (el, d) => G.answerAsk(d.id, el),
        fmAskNo: (el, d) => G.refuseAsk(d.id),
        fmGkBday: (el, d) => G.gkCelebrate(d.k, d.g, el),
        fmBday: (el, d) => G.celebrate(d.id, el),
        fmMeal: el => G.familyMeal(el),
        fmHouse: (el, d) => (ui.sel.tmPick = { k: 'house', i: +d.i }),
        fmTent: (el, d) => (ui.sel.tmPick = { k: 'tent', i: +d.i }),
        fmMark: (el, d) => (ui.sel.tmPick = { k: 'mark', i: +d.i }),
        fmMetier: (el, d) => G.setKidMetier(d.id, d.m),
        fmKidWed: (el, d) => G.kidWed(d.id, +d.r, el),
        fmLegate: (el, d) => {
            if (ui.sel.fmLegate !== d.id) return void (ui.sel.fmLegate = d.id);
            ui.sel.fmLegate = null;
            return G.legate(d.id, el);
        },
    });
}
export const familyDot = () => (G.familyOpen() ? G.familyReady() : 0);
