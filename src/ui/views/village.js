// Village | Village : événement rare, carte et chantiers, fête du calendrier, contrat, saison de la ferme,
// voisins, marchand ambulant, concours de la semaine et villageois.
import { state } from '../../core/state.js';
import { fmt } from '../../core/format.js';
import { ITEMS } from '../../data/items.js';
import { ANIMALS } from '../../data/animals.js';
import { MACHINES, RECIPES } from '../../data/machines.js';
import { DECOS } from '../../data/farm.js';
import { VILLAGERS, PROJECTS, CHAPTERS, STORIES, RIVALS, NEIGHBOR_LVL } from '../../data/village.js';
import { HOLIDAYS } from '../../data/world.js';
import { RARE_EVENTS } from '../../data/surprises.js';
import { CONTEST_LVL, CONTRACT_LVL } from '../../data/commerce.js';
import { now } from '../../core/clock.js';
import { FARM_SEASON_TIERS } from '../../data/port.js';
import { STORY_MAPS } from '../../data/meta.js';
import { MAP_BG } from '../../art/maps.js';
import * as G from '../../systems/index.js';
import { blocks, actions } from '../dom.js';
import { ico, art, SPR } from '../icons.js';
import { btn, bar, timer, section, hint, hearts, card } from '../kit.js';
import { defineView, ui } from '../app.js';
import { itemLine, rewardHtml } from './common.js';

const COIN = () => ico(['ui', 'coin']);
const head = (icon, title, sub, side = '') =>
    `<div class="card-head">${ico(icon, 'ico big')}<div class="card-main"><div class="card-title">${title}</div>${sub ? `<div class="card-sub">${sub}</div>` : ''}</div>${side}</div>`;
const pill = (icon, html) => `<span class="timer-pill">${ico(icon)}${html}</span>`;
// une ligne à remplir : produit, avancée, bouton
const needLine = (item, got, n, side) =>
    `<div class="pline${got >= n ? ' ok' : ''}"><button class="pgo" data-act="produce" data-id="${item}" aria-label="Produire">${ico(['item', item])}</button>
    <div class="card-main"><div class="pname">${ITEMS[item].name} <small>${Math.min(got, n)} / ${n}</small></div>${bar(got / n)}</div>${side}</div>`;

// ---------------- événement rare ----------------
function rareCard() {
    const r = state.rare;
    if (!r || !r.type || !G.rareActive(r.type)) return null;
    const E = RARE_EVENTS[r.type];
    let body = '';
    if (r.type === 'fair')
        body = `<div class="offers">${r.offers
            .map(
                (
                    o,
                    k,
                ) => `<div class="offer${o.sold ? ' sold' : ''}"><span class="offer-art star-animal">${art('animal', o.id)}</span><b>${ANIMALS[o.id].name} d’exception</b>
                ${o.sold ? '<small>Vendu</small>' : btn(`${fmt(o.price)}${COIN()}`, { act: 'starAnimal', data: { k }, kind: state.money >= o.price ? 'green' : '', size: 'sm', disabled: state.money < o.price })}</div>`,
            )
            .join('')}</div>`;
    if (r.type === 'critic') {
        const have = state.inventory[r.dish] || 0;
        body = `<div class="pline">${ico(['item', r.dish], 'ico big')}<div class="card-main"><div class="card-title">${ITEMS[r.dish].name}</div>
            <div class="card-sub">${have ? `En stock : ${have}` : `Produit à l’atelier · ${MACHINES[RECIPES[r.dish].machine].name}`} · maîtrise ${'★'.repeat(G.masteryStars(r.dish)) || '—'}</div></div>
            ${r.served ? '<span class="card-sub">Servi</span>' : have ? btn('Servir', { act: 'serveCritic', kind: 'gold', size: 'sm' }) : btn('Produire', { act: 'produce', data: { id: r.dish }, size: 'sm' })}</div>`;
    }
    return `<div class="card rare-card">${head(['ui', E.icon], E.name, E.text, pill(['ui', 'clock'], timer(r.until)))}${body}</div>`;
}

// ---------------- la carte et les chantiers ----------------
function storyCard() {
    const c = G.currentChapter();
    const maps = G.openMaps();
    let m = ui.sel.map;
    if (!m) m = c && c.map && maps.some(x => x.id === c.map) ? c.map : 'village';
    if (!maps.some(x => x.id === m)) m = 'village';
    ui.sel.map = m;
    const M = STORY_MAPS.find(x => x.id === m);
    const projs = Object.values(PROJECTS).filter(p => G.mapOf(p) === m);
    let sel = ui.sel.proj;
    if (!PROJECTS[sel] || G.mapOf(PROJECTS[sel]) !== m) {
        const open = projs.find(p => G.projectOpen(p.id) && G.projectComplete(p.id)) || projs.find(p => G.projectOpen(p.id));
        sel = open ? open.id : projs[0].id;
    }
    ui.sel.proj = sel;
    const party = G.projectDone(M.party);
    const switcher =
        maps.length > 1
            ? `<div class="chips-row maps">${maps
                  .map(
                      x =>
                          `<button class="pick-chip${m === x.id ? ' on' : ''}" data-act="map" data-m="${x.id}">${x.name}${m !== x.id && G.mapReady(x.id) ? '<span class="dot">!</span>' : ''}</button>`,
                  )
                  .join('')}</div>`
            : '';
    const blds = projs
        .map(p => {
            const st = G.projectStage(p.id),
                open = G.chapterOpen(p.ch);
            const ready = G.projectOpen(p.id) && G.projectComplete(p.id);
            return `<button class="vbld s${st}${open ? '' : ' locked'}${sel === p.id ? ' sel' : ''}${ready ? ' ready' : ''}" style="left:${p.x}%;top:${p.y}%" data-act="proj" data-p="${p.id}" aria-label="${p.name}">
                ${SPR.building(p.id, st)}<span class="vlabel">${p.name}</span>${ready ? '<span class="dot">!</span>' : ''}</button>`;
        })
        .join('');
    const top = c
        ? `<div class="card-title">Chapitre ${c.n} · ${c.name}</div><div class="card-sub">${G.chapterOpen(c.n) ? `${c.intro} (${G.chapterProjects(c.n).filter(p => G.projectDone(p.id)).length} / ${G.chapterProjects(c.n).length})` : `Ce chapitre s’ouvre au niveau ${c.lvl}.`}</div>`
        : '<div class="card-title">Toute la vallée est rénovée !</div><div class="card-sub">Village, hameau, port, alpage et domaine : merci, citoyen d’honneur. Tout le canton vous adore.</div>';
    return `<div class="card story-card"><div class="chapter-head">${top}</div>${switcher}
        <div class="vmap ${M.id}${party ? ' party' : ''}">${MAP_BG[M.id]}${party ? '<div class="bunting"></div>' : ''}${blds}</div>${projectDetail(sel)}</div>`;
}

function projectDetail(pid) {
    const p = PROJECTS[pid],
        v = VILLAGERS[p.vid];
    const who = `<div class="avatar sm">${art('villager', p.vid)}</div>`;
    if (!G.chapterOpen(p.ch))
        return `<div class="proj">${who}<div class="card-main"><div class="card-title">${p.name}</div><div class="card-sub">Chapitre ${p.ch} : s’ouvre au niveau ${CHAPTERS[p.ch - 1].lvl}${p.ch > 1 ? ', après le chapitre ' + (p.ch - 1) : ''}.</div></div></div>`;
    if (G.projectDone(pid))
        return `<div class="proj done">${who}<div class="card-main"><div class="card-title">${p.name} ${ico(['ui', 'check'])}</div><div class="card-sub">« ${p.after} »</div></div></div>`;
    const lines = Object.entries(p.need)
        .map(([item, n]) => {
            const g = G.givenOf(pid, item),
                have = state.inventory[item],
                left = n - g;
            return needLine(
                item,
                g,
                n,
                left
                    ? btn(have ? `+${Math.min(have, left)}` : '0 en stock', {
                          act: 'giveProject',
                          data: { p: pid, item },
                          kind: have ? 'green' : '',
                          size: 'sm',
                          disabled: !have,
                      })
                    : ico(['ui', 'check']),
            );
        })
        .join('');
    return `<div class="proj open"><div class="card-head">${who}<div class="card-main"><div class="card-title">${p.name}</div><div class="card-sub">${v.name} : « ${p.before} »</div></div></div>
        <div class="plines">${lines}</div><div class="card-sub reward-line">${ico(['ui', 'star'])} ${p.reward}</div>
        ${G.projectComplete(pid) ? btn('Rénover !', { act: 'finishProject', data: { p: pid }, kind: 'gold', wide: true, size: 'lg', icon: ['ui', 'village'] }) : btn('Tout apporter', { act: 'giveAllProject', data: { p: pid }, wide: true })}</div>`;
}

// ---------------- fête du calendrier ----------------
function holidayCard() {
    const id = G.holidayNow();
    if (!id || !state.holiday || state.holiday.id !== id) return null;
    const h = HOLIDAYS[id],
        sv = state.holiday,
        r = RECIPES[h.recipe];
    return `<div class="card holiday-card ${id}">${head(h.icon, h.name, sv.done ? `Panier rempli, merci ! ${DECOS[h.deco].name} est dans vos décorations.` : h.text)}
        ${
            sv.done
                ? ''
                : `<div class="needs">${Object.keys(h.goal)
                      .map(
                          k =>
                              `<span class="need${G.holidayLeft(k) <= 0 ? ' ok' : ''}">${ico(['item', k])}${Math.max(0, h.goal[k] - G.holidayLeft(k))}/${h.goal[k]}</span>`,
                      )
                      .join('')}${btn('Apporter', { act: 'giveHoliday', kind: G.holidayReady() ? 'gold' : '', size: 'sm', disabled: !G.holidayReady() })}</div>
            <div class="card-sub">${ico(['item', h.recipe])} Recette du moment : ${ITEMS[h.recipe].name.toLowerCase()} (${MACHINES[r.machine].name.toLowerCase()}). Récompense : ${DECOS[h.deco].name.toLowerCase()}, ${fmt(G.holidayReward())} pièces et 2 de chaque matériau rare.</div>`
        }</div>`;
}

// ---------------- contrat de saison ----------------
function contractCard() {
    G.ensureContract();
    const c = state.contract;
    if (state.level < CONTRACT_LVL || !c) return null;
    const it = ITEMS[c.item],
        have = state.inventory[c.item] || 0;
    const end = { printemps: 'du printemps', ete: 'de l’été', automne: 'de l’automne', hiver: 'de l’hiver' }[G.season().id];
    return `<div class="card contract-card">${head(['ui', 'calendar'], 'Contrat de saison', c.done ? 'Contrat rempli. Un nouveau client viendra à la prochaine saison.' : `Un grossiste veut ${c.qty} ${it.name.toLowerCase()} avant la fin ${end}.`, pill(['ui', 'calendar'], `${G.seasonDaysLeft()} j`))}
        ${
            c.done
                ? ''
                : needLine(
                      c.item,
                      c.given,
                      c.qty,
                      btn(have ? `+${Math.min(have, c.qty - c.given)}` : '0 en stock', {
                          act: 'giveContract',
                          kind: have ? 'green' : '',
                          size: 'sm',
                          disabled: !have,
                      }),
                  ) +
                  `<div class="card-sub reward-line">${ico(['ui', 'star'])} ${fmt(c.coins)} pièces, ${fmt(c.xp)} d’expérience, et 2 de chaque matériau rare</div>`
        }</div>`;
}

// ---------------- saison de la ferme ----------------
function farmSeasonCard() {
    if (!G.farmSeasonOpen()) return null;
    G.ensureFarmSeason();
    const sv = state.fseason,
        th = G.farmSeasonTheme(),
        top = FARM_SEASON_TIERS.at(-1);
    const days = Math.floor(G.farmSeasonEndsIn() / 86400);
    return `<div class="card fseason-card">${head(['item', th.icon], th.name, `Chaque produit du thème rapporte des points (3 pour un produit d’atelier). Au dernier palier : ${DECOS[th.deco].name.toLowerCase()} et 1 ruban.`, pill(['ui', 'calendar'], `${days} j`))}
        <div class="season-items">${th.items.map(id => ico(['item', id])).join('')}</div>${bar(sv.pts / top)}
        <div class="tiers-row">${FARM_SEASON_TIERS.map((t, k) =>
            sv.got[k]
                ? `<span class="stier done">${ico(['ui', 'check'])}</span>`
                : sv.pts >= t
                  ? btn(k === 4 ? ico(['ui', th.deco]) : `${fmt(G.seasonTierReward(k).coins)}${COIN()}`, {
                        act: 'seasonTier',
                        data: { k },
                        kind: 'gold',
                        size: 'sm',
                    })
                  : `<span class="stier">${fmt(t)}</span>`,
        ).join('')}</div><div class="card-sub center">${fmt(sv.pts)} points</div></div>`;
}

// ---------------- voisins ----------------
function neighborsCard() {
    if (state.level < NEIGHBOR_LVL)
        return card({
            icon: ['villager', RIVALS[0].avatar],
            title: 'Fermes voisines',
            sub: `Vos voisins viendront vous demander de l’aide à partir du niveau ${NEIGHBOR_LVL}.`,
            locked: true,
        });
    G.ensureNeighbors();
    return `<div class="card neighbors-card"><div class="card-title">Fermes voisines</div>
        <p class="card-sub">Vos rivales du concours sont aussi vos voisines. Aidez-les : elles paient bien, et leur amitié rapporte des cadeaux.</p>
        ${RIVALS.map((r, k) => {
            const n = state.neighbors[k],
                q = n.req;
            const ok = q && G.hasAll(q.items);
            return `<div class="neighbor"><div class="avatar sm">${art('villager', r.avatar)}</div>
                <div class="card-main"><div class="card-title">${r.owner} <small>· ${r.name}</small></div>${hearts(n.hearts)}
                ${q ? `<div class="olines">${q.items.map(x => itemLine(x)).join('')}</div><div class="card-sub">${rewardHtml(q.coins, G.neighborXp(q), q.mats)} · repart dans ${timer(q.until)}</div>` : `<div class="card-sub">Pas de demande pour l’instant · revient dans ${timer(Math.max(n.next, now()))}</div>`}</div>
                ${q ? btn('Aider', { act: 'helpNeighbor', data: { k }, kind: ok ? 'green' : '', size: 'sm', disabled: !ok }) : ''}</div>`;
        }).join('')}</div>`;
}

// ---------------- marchand ambulant ----------------
function merchantCard() {
    if (!G.merchantOpen()) return null;
    const m = state.merchant;
    if (m.status !== 'here')
        return card({
            icon: ['ui', 'merchant'],
            title: 'Marchand ambulant',
            sub: `Zéphyr repasse dans ${timer(m.arriveAt, 'b')}. Il vend des matériaux rares, des graines exotiques et des décorations uniques.`,
            cls: 'away',
        });
    return `<div class="card merchant-card">
        <div class="card-head"><div class="avatar sm">${art('villager', 'merchant')}</div><div class="card-main"><div class="card-title">Zéphyr, marchand ambulant</div><div class="card-sub">« Des merveilles venues de loin ! » · repart dans ${timer(m.expiresAt, 'b')}</div></div></div>
        <div class="offers">${m.stock
            .map(
                (o, k) =>
                    `<div class="offer${o.sold ? ' sold' : ''}"><span class="offer-art">${art(...G.offerIcon(o))}</span><b>${o.qty > 1 ? o.qty + ' × ' : ''}${G.offerName(o)}</b>${o.sold ? '<small>Vendu</small>' : btn(`${fmt(o.price)}${COIN()}`, { act: 'buyMerchant', data: { k }, kind: state.money >= o.price ? 'green' : '', size: 'sm', disabled: state.money < o.price })}</div>`,
            )
            .join('')}</div></div>`;
}

// ---------------- concours de la semaine ----------------
function contestCard() {
    if (!G.contestOpen())
        return card({
            icon: ['ui', 'podium'],
            title: 'Concours de la semaine',
            sub: `Les fermes de la région s’affrontent chaque semaine, à partir du niveau ${CONTEST_LVL}.`,
            locked: true,
        });
    G.contestTick();
    const c = state.contest;
    const list = G.contestRanking();
    const me = G.myContestScore();
    const tiers = G.contestTiers(c),
        top = tiers[2],
        r = G.tierReward(c);
    const left = G.contestEndsIn(),
        days = Math.floor(left / 86400),
        hours = Math.floor((left % 86400) / 3600);
    const lg = c.league || 0;
    return `<div class="card contest-card">${head(
        ['ui', 'podium'],
        `Concours de la semaine <span class="league l${lg}">Ligue ${G.leagueName(lg).toLowerCase()}</span>`,
        `Tout ce que vous faites rapporte des points. Trois paliers à réclamer, et le premier du classement gagne un ruban${G.canPromote() ? ` et monte en ligue ${G.leagueName(G.leagueOf() + 1).toLowerCase()}` : ''}.${lg > 0 ? ' Le dernier redescend d’une ligue.' : ''}`,
        pill(['ui', 'calendar'], days ? `${days} j ${hours} h` : `${hours} h`),
    )}
        <div class="tiers">${bar(me.total / top)}
            ${tiers
                .map((t, k) => {
                    const ok = me.total >= t;
                    return `<div class="tier" style="left:${(t / top) * 100}%">${
                        c.tiers[k]
                            ? ico(['ui', 'check'])
                            : ok
                              ? btn(k < 2 ? `${fmt(r.coins * (k + 1))}${COIN()}` : `${ico(['ui', 'chest'])}coffre`, {
                                    act: 'contestTier',
                                    data: { k },
                                    kind: 'gold',
                                    size: 'sm',
                                })
                              : `<span>${fmt(t)}</span>`
                    }</div>`;
                })
                .join('')}</div>
        <ol class="ranking">${list.map((x, k) => `<li class="${x.me ? 'me' : ''}"><b>${k + 1}</b><span>${x.name}</span><em>${fmt(x.score)}</em></li>`).join('')}</ol>
        <div class="score-parts">${me.parts.map(([n, v]) => `<span>${n} <b>${fmt(v)}</b></span>`).join('')}</div></div>`;
}

// ---------------- les villageois ----------------
function villagerStory(vid) {
    if (!STORIES[vid] || G.heartsOf(vid) < 5) return '';
    const S = STORIES[vid],
        st = G.storyState(vid);
    if (st.step >= S.steps.length)
        return `<div class="vstory done"><b>${ico(['ui', 'check'])}${S.title}</b><span class="card-sub">Histoire terminée</span></div>`;
    const [text, need] = S.steps[st.step];
    const lines = Object.entries(need)
        .map(([item, n]) => {
            const g = st.given[item] || 0;
            return `<span class="need${g >= n ? ' ok' : ''}"><button class="pgo" data-act="produce" data-id="${item}" aria-label="Produire">${ico(['item', item])}</button>${Math.min(g + (state.inventory[item] || 0), n)}/${n}</span>`;
        })
        .join('');
    return `<div class="vstory"><b>${ico(['ui', 'scroll'])}${S.title} · étape ${st.step + 1} sur 3</b><span class="card-sub">« ${text} »</span>
        <div class="needs">${lines}${btn('Apporter', { act: 'giveStory', data: { v: vid }, kind: G.villagerStoryReady(vid) ? 'gold' : '', size: 'sm' })}</div></div>`;
}

function villagersHtml() {
    return `<div class="list">${G.presentVillagers()
        .map(id => {
            const v = VILLAGERS[id],
                h = G.heartsOf(id);
            const gifted = G.giftedToday(id),
                open = ui.sel.gift === id,
                can = G.giftable(id);
            return `<div class="card villager-card">
                <div class="avatar">${art('villager', id)}</div>
                <div class="card-main"><div class="card-title">${v.name}</div><div class="card-sub">${v.role}</div>${hearts(h)}${h < 5 ? bar(G.heartProgress(id), 'pink') : ''}
                <div class="likes"><span class="card-sub">Aime :</span>${v.likes.map(x => `<i class="ico${state.inventory[x] > 0 ? '' : ' dim'}" title="${ITEMS[x].name}">${art('item', x)}</i>`).join('')}</div>
                <div class="card-sub">${G.nextRewardText(id)}</div>${villagerStory(id)}
                ${open ? `<div class="gift-row">${can.length ? can.map(x => btn(`${state.inventory[x]}`, { act: 'gift', data: { v: id, id: x }, size: 'sm', icon: ['item', x] })).join('') : '<span class="card-sub">Vous n’avez rien qu’il ou elle aime en stock.</span>'}</div>` : ''}</div>
                <div class="card-side">${btn(gifted ? 'Offert' : open ? 'Fermer' : 'Offrir', { act: 'toggleGift', data: { v: id }, kind: gifted ? '' : 'gold', size: 'sm', disabled: gifted })}</div></div>`;
        })
        .join('')}</div>`;
}

function renderVillage(el) {
    blocks(el, [
        ['rare', rareCard()],
        ['story', storyCard()],
        ['holiday', holidayCard()],
        ['contract', contractCard()],
        ['fseason', farmSeasonCard()],
        ['neighbors', neighborsCard()],
        ['merchant', merchantCard()],
        ['contest', contestCard()],
        ['vtitle', section('Les villageois')],
        ['vhint', hint('Livrez leurs commandes et offrez-leur ce qu’ils aiment (un cadeau par jour) pour gagner leur amitié.')],
        ['villagers', villagersHtml()],
    ]);
}
defineView('village/village', renderVillage);

export function setupVillage() {
    actions({
        map: (el, d) => {
            ui.sel.map = d.m;
            ui.sel.proj = null;
        },
        proj: (el, d) => (ui.sel.proj = d.p),
        giveProject: (el, d) => G.giveToProject(d.p, d.item, el),
        giveAllProject: (el, d) => G.giveAllToProject(d.p, el),
        finishProject: (el, d) => G.finishProject(d.p, el),
        starAnimal: (el, d) => G.buyStarAnimal(+d.k, el),
        serveCritic: el => G.serveCritic(el),
        giveHoliday: el => G.giveHoliday(el),
        giveContract: el => G.giveContract(el),
        seasonTier: (el, d) => G.claimSeasonTier(+d.k, el),
        helpNeighbor: (el, d) => G.helpNeighbor(+d.k, el),
        buyMerchant: (el, d) => G.buyMerchant(+d.k, el),
        contestTier: (el, d) => G.claimContestTier(+d.k, el),
        giveStory: (el, d) => G.giveStory(d.v, el),
        toggleGift: (el, d) => (ui.sel.gift = ui.sel.gift === d.v ? null : d.v),
        gift: (el, d) => {
            if (G.giveGift(d.v, d.id, el)) ui.sel.gift = null;
        },
    });
}
