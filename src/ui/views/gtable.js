// 1.150 : Village | Table (La Grande Table Étoilée).
// Service en salle vivant, composition d'accords gastronomiques (terroir, saison, Cave/Brasserie/Comptoir, cadeau Maison),
// brigade (villageois & enfants adultes), parfum d'ambiance (Parfumerie), banquets et Livre d'Or vers les 3 Étoiles.
import { state } from '../../core/state.js';
import { fmt, formatDuration } from '../../core/format.js';
import { ITEMS } from '../../data/items.js';
import {
    GTABLE_LVL,
    GTABLE_HALLS,
    GTABLE_RANKS,
    GTABLE_STYLES,
    GTABLE_THEMES,
    GTABLE_ROLES,
    GTABLE_BANQUETS,
    GTABLE_SYNERGY,
} from '../../data/gtable.js';
import { gtableRoomSvg } from '../../art/gtable.js';
import * as G from '../../systems/index.js';
import { blocks, actions, esc, centerOf } from '../dom.js';
import { ico, art, COIN } from '../icons.js';
import { btn, timer, empty, hint } from '../kit.js';
import { defineView, ui } from '../app.js';
import { defineSheet, openSheet, closeSheet } from '../sheets.js';
import { innerTabs } from '../innertabs.js';

// État d'interface du tiroir de dressage d'assiette (jamais sauvegardé)
const draft = {
    mode: 'table', // 'table' | 'banquet'
    idx: 0,
    banquetId: null,
    themeId: null,
    mainId: null,
    sideId: null,
    drinkKey: null,
    vipBoxIdx: -1,
};

function costHtml(cost) {
    return Object.entries(cost || {})
        .map(([k, n]) => {
            if (k === 'coins') return `<span class="${state.money >= n ? 'ok' : 'short'}">${COIN()}${fmt(n)}</span>`;
            const have = state.inventory[k] || 0;
            return `<span class="${have >= n ? 'ok' : 'short'}">${ico(['item', k])}${have}/${n}</span>`;
        })
        .join(' ');
}

function themeTag(themeId) {
    const th = GTABLE_THEMES[themeId];
    if (!th) return '';
    return `<span class="gt-theme-tag" style="background:color-mix(in srgb, ${th.col} 22%, #fff)">${ico(th.icon)}<span>${esc(th.name)}</span></span>`;
}

function suggestBest(themeId) {
    const mains = G.gtableMainChoices(themeId);
    const mainId = mains[0] || null;
    const sides = G.gtableSideChoices(themeId, mainId);
    const sideId = sides[0] || null;
    const drinks = G.gtableDrinkChoices();
    const drinkKey = drinks[0] ? drinks[0].key : null;
    draft.mainId = mainId;
    draft.sideId = sideId;
    draft.drinkKey = drinkKey;
    draft.vipBoxIdx = -1;
}

// ---------------- fermé avant niveau 26 ou avant fondation ----------------
function lockedCard() {
    return `<div class="card island-closed">
        <div class="ic-art">${art('ui', 'gtable')}</div>
        <div class="card-title">La Grande Table Étoilée</div>
        <p class="card-sub">Au niveau ${GTABLE_LVL}, ouvrez votre propre restaurant gastronomique au village : services du soir en salle, accords mets & boissons (Cave, Brasserie, Comptoir), brigade de villageois et course aux 3 Étoiles !</p>
    </div>`;
}

function buildCard() {
    const h = GTABLE_HALLS[0];
    const can = G.canBuildGTable();
    return `<div class="card gt-hero">
        ${gtableRoomSvg({ style: 'vichy', stars: 0, open: false })}
        <div class="gt-hero-body">
            <div class="card-title">Fonder La Grande Table</div>
            <p class="card-sub">Transformez l’auberge en une table d’hôtes vivante : composez vos assiettes à partir de vos plats, vins de Cave et bières maison, séduisez les critiques anonymes et visez les 3 Étoiles !</p>
            <div class="cost">${costHtml(h.cost)}</div>
            <div>${btn('Ouvrir La Grande Table', { act: 'gtBuild', kind: can ? 'green' : '', disabled: !can, icon: ['ui', 'gtable'] })}</div>
        </div>
    </div>`;
}

// ---------------- bandeau illustré en tête de la vue ----------------
function heroHtml() {
    const g = G.ensureGTable();
    const rk = G.gtableRankDef();
    const hl = G.gtableHallDef();
    const open = !!g.service;
    const scented = G.gtableScentBonus() > 0;
    const brigCount = Object.values(g.brigade).filter(Boolean).length;

    return `<div class="card gt-hero">
        ${gtableRoomSvg({ style: g.style, stars: rk.stars, bib: !!rk.bib, open, scented })}
        <div class="gt-hero-body">
            <div class="gt-hero-top">
                <div class="card-title">${esc(hl.name)}</div>
                <span class="gt-rank-badge${rk.bib ? ' bib' : ''}">${esc(rk.badge)} · ${esc(rk.name)}</span>
            </div>
            <div class="gt-meta-row">
                <span class="gt-pill">${ico(['ui', 'gtable'])}${hl.tables} tables</span>
                <span class="gt-pill">${ico(['ui', 'coin'])}×${rk.mult.toFixed(2).replace('.', ',')}</span>
                <span class="gt-pill">${ico(['ui', 'heart'])}${brigCount}/${rk.brigade} brigade</span>
                ${scented ? `<span class="gt-pill">${ico(['ui', 'perfume'])}${esc(g.scent.name)}</span>` : ''}
            </div>
        </div>
    </div>`;
}

// ---------------- Volet 1 : Salle & Service ----------------
function reportHtml(rep) {
    if (!rep) return '';
    const rev = rep.review;
    const revHtml = rev
        ? `<div class="gt-review">
            <span class="gt-avatar">${art('villager', rev.avatar)}</span>
            <div class="gt-review-body">
                <strong><span>${esc(rev.criticName)} · ${esc(rev.criticTitle)}</span><span>${rev.score}/100</span></strong>
                <p class="gt-review-quote">${esc(rev.quote)}</p>
                <div class="gt-review-meta">${rev.won ? 'Critique conquis !' : 'Critique exigeant'} ${rev.menu ? `· ${esc(rev.menu.mainName)}` : ''}</div>
            </div>
        </div>`
        : '';
    return `<div class="card gt-report">
        <div class="card-title">${rep.promoted ? `Nouvelle distinction : ${esc(rep.promoted)} !` : `Bilan du service · ${rep.avg}/100`}</div>
        <div class="card-sub">${rep.served} table${rep.served > 1 ? 's' : ''} servie${rep.served > 1 ? 's' : ''} · +${fmt(rep.earned)} pièces</div>
        ${revHtml}
    </div>`;
}

function hallTabHtml() {
    const g = G.ensureGTable();
    const parts = [];

    if (g.service) {
        const left = G.gtableTablesWaiting();
        parts.push(`<div class="card">
            <div class="card-main">
                <div class="card-title">Service en cours (${g.service.served}/${g.service.tables.length})</div>
                <div class="card-sub">${left} table${left > 1 ? 's' : ''} attendent votre assiette. Repérez les indices pour reconnaître un éventuel critique anonyme !</div>
            </div>
            ${g.service.served > 0 ? btn('Clôturer', { act: 'gtFinish', size: 'sm' }) : ''}
        </div>`);

        parts.push(`<div class="gt-tables">${g.service.tables
            .map(tbl => {
                const res = tbl.result;
                return `<div class="gt-table${tbl.served ? ' served' : ''}">
                    <div class="gt-table-head">
                        <span class="gt-avatar">${art('villager', tbl.who)}</span>
                        <div class="gt-who">
                            <strong>${esc(tbl.name)}</strong>
                            <small>${esc(tbl.title)}</small>
                        </div>
                    </div>
                    ${themeTag(tbl.themeId)}
                    <p class="gt-want">${esc(tbl.want)}</p>
                    ${
                        res
                            ? `<div class="gt-score-line"><span>Note : ${res.score}/100</span><span>+${fmt(res.pay)} ${COIN()}</span></div>`
                            : btn('Dresser l’assiette', { act: 'gtOpenServe', data: { i: tbl.i }, kind: 'green', size: 'sm', wide: true })
                    }
                </div>`;
            })
            .join('')}</div>`);
    } else {
        if (g.lastReport) parts.push(reportHtml(g.lastReport));
        const cd = G.gtableCooldownLeft();
        parts.push(`<div class="card">
            <div class="card-main">
                <div class="card-title">${cd > 0 ? 'Dressage de la salle en cours' : 'La salle est prête !'}</div>
                <div class="card-sub">${cd > 0 ? `Prochain service prêt dans ${timer(g.nextAt)} (la brigade en salle accélère le dressage).` : `Ouvrez le service quand vous voulez : ${G.gtableHallDef().tables} tables de convives vous attendent.`}</div>
            </div>
            <div class="card-side">${btn(cd > 0 ? 'En dressage' : 'Ouvrir le service', { act: 'gtStart', kind: cd > 0 ? '' : 'green', disabled: cd > 0, icon: ['ui', 'gtable'] })}</div>
        </div>`);

        // Agrandissement de la salle
        const nextH = G.gtableNextHall();
        if (nextH) {
            const rankOk = G.gtableRank() >= nextH.reqRank;
            const reqName = GTABLE_RANKS[nextH.reqRank] ? GTABLE_RANKS[nextH.reqRank].name : '';
            const can = G.canUpgradeGTableHall();
            parts.push(`<div class="card">
                <div class="card-main">
                    <div class="card-title">Agrandir : ${esc(nextH.name)} (${nextH.tables} tables)</div>
                    <div class="card-sub">${rankOk ? 'Accueillez plus de convives à chaque service.' : `Se débloque au rang ${reqName}.`}</div>
                    <div class="cost">${costHtml(nextH.cost)}</div>
                </div>
                <div class="card-side">${btn('Agrandir', { act: 'gtUpgrade', kind: can ? 'gold' : '', disabled: !can, size: 'sm' })}</div>
            </div>`);
        }

        // Styles de nappes & ambiance
        parts.push(`<div class="card gt-role-card">
            <div class="card-title">Décor & nappes de la salle</div>
            <div class="gt-styles">${GTABLE_STYLES.map(st => {
                const ok = G.gtableRank() >= st.reqRank;
                const on = g.style === st.id;
                return `<button class="gt-style-btn${on ? ' on' : ''}${ok ? '' : ' locked'}" data-act="gtStyle" data-id="${st.id}"${ok ? '' : ' disabled'}>
                    <div class="gt-swatches"><i style="background:${st.wall}"></i><i style="background:${st.cloth}"></i><i style="background:${st.accent}"></i></div>
                    <strong>${esc(st.name)}</strong>
                    <small>${ok ? esc(st.desc) : `Rang requis : ${esc(GTABLE_RANKS[st.reqRank].name)}`}</small>
                </button>`;
            }).join('')}</div>
        </div>`);
    }

    return parts.join('');
}

// ---------------- Volet 2 : Brigade & Parfum d'ambiance ----------------
function brigadeTabHtml() {
    const g = G.ensureGTable();
    const maxSlots = G.gtableRankDef().brigade;
    const out = [];

    out.push(hint('Recrutez vos amis du village (3 cœurs et +) et vos enfants adultes de la Famille pour booster la cuisine, les accords et les pourboires.'));

    for (const r of GTABLE_ROLES) {
        const open = maxSlots >= r.reqBrigade;
        const cur = g.brigade[r.id];
        const cands = open ? G.gtableBrigadeCandidates(r.id) : [];
        const curCand = cands.find(c => c.key === cur);
        out.push(`<div class="card gt-role-card">
            <div class="gt-hero-top">
                <div class="card-title">${ico(r.icon)} ${esc(r.name)}</div>
                <small>${open ? (curCand ? esc(curCand.name) : 'Poste libre') : `Se débloque avec ${r.reqBrigade === 2 ? 'Bib Gourmand' : '1 Étoile'}`}</small>
            </div>
            <div class="card-sub">${esc(r.desc)}</div>
            ${
                open
                    ? `<div class="gt-picks">
                        <button class="gt-pick${!cur ? ' on' : ''}" data-act="gtBrigade" data-role="${r.id}" data-m=""><span>Personne</span></button>
                        ${
                            cands.length
                                ? cands
                                      .map(
                                          c => `<button class="gt-pick${cur === c.key ? ' on' : ''}" data-act="gtBrigade" data-role="${r.id}" data-m="${esc(c.key)}" title="${esc(c.desc)}">
                                            ${ico(c.icon)}<span>${esc(c.name)}</span><small>${esc(c.desc)}</small>
                                        </button>`,
                                      )
                                      .join('')
                                : '<span class="card-sub">Montez à 3 cœurs avec un habitant spécialiste ou faites grandir un enfant de votre Famille.</span>'
                        }
                    </div>`
                    : ''
            }
        </div>`);
    }

    // Synergie Parfumerie : Parfum d'ambiance en salle
    if (G.perfumeOpen() && state.perfume) {
        const creations = Object.values(state.perfume.creations || {});
        const sig = G.perfumeSignature();
        const avail = creations.filter(p => (sig && sig.id === p.id) || G.perfumeStock(p.id) > 0);
        out.push(`<div class="card gt-role-card">
            <div class="card-title">${ico(['ui', 'perfume'])} Parfum d’ambiance de la salle</div>
            <div class="card-sub">Diffusez une création de votre Parfumerie : +${GTABLE_SYNERGY.perfumeAmbience} pts d’ambiance pendant ${GTABLE_SYNERGY.perfumeUses} services (gratuit et permanent avec votre Parfum signature !).</div>
            <div class="gt-picks">
                <button class="gt-pick${!g.scent ? ' on' : ''}" data-act="gtScent" data-pid=""><span>Sans parfum</span></button>
                ${
                    avail.length
                        ? avail
                              .map(p => {
                                  const isSig = !!(sig && sig.id === p.id);
                                  const on = g.scent && g.scent.pid === p.id;
                                  return `<button class="gt-pick${on ? ' on' : ''}" data-act="gtScent" data-pid="${esc(p.id)}">
                                      ${ico(['ui', 'perfume'])}<span>${esc(p.name)}</span>
                                      ${isSig ? '<em>Signature</em>' : `<small>×${G.perfumeStock(p.id)}</small>`}
                                  </button>`;
                              })
                              .join('')
                        : '<span class="card-sub">Mettez un parfum en flacon à l’Atelier › Parfums pour parfumer la salle.</span>'
                }
            </div>
        </div>`);
    }

    return out.join('');
}

// ---------------- Volet 3 : Banquets d'Honneur ----------------
function banquetsTabHtml() {
    const rank = G.gtableRank();
    const out = [hint('Organisez de grands banquets d’honneur dès que votre rang le permet : un menu d’exception bien noté rapporte un gros cachet et de la renommée.')];
    for (const b of GTABLE_BANQUETS) {
        const open = rank >= b.reqRank;
        const cd = G.gtableBanquetCooldown(b.id);
        out.push(`<div class="card">
            <div class="card-art">${art(b.icon[0], b.icon[1])}</div>
            <div class="card-main">
                <div class="card-title">${esc(b.name)}</div>
                <div class="card-sub">${esc(b.desc)}</div>
                <div class="cost"><span>${COIN()}+${fmt(b.rewardCoins)}</span> <span>+${fmt(b.rewardXp)} XP</span> <span>+${b.rewardRenom} renommée</span></div>
                ${!open ? `<div class="card-sub">Rang requis : ${esc(GTABLE_RANKS[b.reqRank].name)}</div>` : cd > 0 ? `<div class="card-sub">Disponible dans ${formatDuration(cd / 1000)}</div>` : ''}
            </div>
            <div class="card-side">${btn('Composer', { act: 'gtOpenBanquet', data: { id: b.id }, kind: open && cd === 0 ? 'gold' : '', disabled: !open || cd > 0, size: 'sm' })}</div>
        </div>`);
    }
    return out.join('');
}

// ---------------- Volet 4 : Livre d'Or & Étoiles ----------------
function bookTabHtml() {
    const g = G.ensureGTable();
    const nextR = GTABLE_RANKS[g.rank + 1];
    const dishN = G.gtableDishCount();
    const out = [];

    if (nextR) {
        const nd = nextR.need;
        out.push(`<div class="card gt-role-card">
            <div class="card-title">Cap vers : ${esc(nextR.name)} (${esc(nextR.badge)})</div>
            <div class="card-sub">Convainquez les critiques anonymes (note ≥ ${nd.minCriticScore}/100) et variez votre carte pour décrocher la distinction !</div>
            <div class="gt-prog-grid">
                <div class="gt-prog-box${g.services >= nd.services ? ' ok' : ''}"><b>${g.services}/${nd.services}</b>Services</div>
                <div class="gt-prog-box${g.criticsWon >= nd.critics ? ' ok' : ''}"><b>${g.criticsWon}/${nd.critics}</b>Critiques</div>
                <div class="gt-prog-box${dishN >= nd.dishes ? ' ok' : ''}"><b>${dishN}/${nd.dishes}</b>Plats variés</div>
            </div>
        </div>`);
    } else {
        out.push(`<div class="card gt-report">
            <div class="card-title">★★★ Sommet de la gastronomie atteint !</div>
            <div class="card-sub">Votre Grande Table rayonne à 3 Étoiles · ${g.services} services · ${g.covers} couverts · ${dishN} plats différents servis · Record ${g.bestScore}/100.</div>
        </div>`);
    }

    // Chroniques des critiques
    out.push(`<div class="card gt-role-card">
        <div class="card-title">Chroniques du Guide (${g.reviews.length})</div>
        ${
            g.reviews.length
                ? g.reviews
                      .slice(0, 8)
                      .map(
                          r => `<div class="gt-review">
                            <span class="gt-avatar">${art('villager', r.avatar)}</span>
                            <div class="gt-review-body">
                                <strong><span>${esc(r.criticName)}</span><span>${r.score}/100</span></strong>
                                <p class="gt-review-quote">${esc(r.quote)}</p>
                                <div class="gt-review-meta">Jour ${r.day} (${esc(r.season)}) ${r.menu ? `· ${esc(r.menu.mainName)}` : ''}</div>
                            </div>
                        </div>`,
                      )
                      .join('')
                : '<p class="card-sub">Aucune chronique publiée pour l’instant. Ouvrez un service pour accueillir votre premier critique anonyme !</p>'
        }
    </div>`);

    // Palmarès de tes plats signatures
    const topDishes = Object.entries(g.dishes)
        .filter(([id]) => !!ITEMS[id])
        .sort((a, b) => b[1].best - a[1].best || b[1].n - a[1].n)
        .slice(0, 12);
    out.push(`<div class="card gt-role-card">
        <div class="card-title">Palmarès de la carte (${dishN} plats servis)</div>
        ${
            topDishes.length
                ? `<div class="gt-picks">${topDishes
                      .map(
                          ([id, st]) => `<span class="gt-pick">${ico(['item', id])}<span>${esc(ITEMS[id].name)}</span><em>${st.best}/100</em><small>×${st.n}</small></span>`,
                      )
                      .join('')}</div>`
                : '<p class="card-sub">Vos plats les mieux notés apparaîtront ici dès votre premier service.</p>'
        }
    </div>`);

    return out.join('');
}

// ---------------- vue principale Village › Table ----------------
function renderGTable(el) {
    if (!G.gtableOpen()) {
        blocks(el, [['closed', lockedCard()]]);
        return;
    }
    if (!G.gtableBuilt()) {
        blocks(el, [['build', buildCard()]]);
        return;
    }
    const sub = ui.sel.gtable || 'hall';
    const waiting = G.gtableTablesWaiting();
    const tabs = innerTabs(
        'gtable',
        [
            ['hall', 'Salle', ['ui', 'gtable'], waiting],
            ['brigade', 'Brigade', ['villager', 'odette']],
            ['banquets', 'Banquets', ['ui', 'trophy']],
            ['book', 'Livre d’Or', ['ui', 'book']],
        ],
        sub,
    );
    const body = sub === 'brigade' ? brigadeTabHtml() : sub === 'banquets' ? banquetsTabHtml() : sub === 'book' ? bookTabHtml() : hallTabHtml();
    blocks(el, [
        ['hero', heroHtml()],
        ['tabs', tabs],
        ['body', body],
    ]);
}

defineView('village/table', renderGTable);

// ---------------- Tiroir de dressage d'assiette & Banquet ----------------
defineSheet('gtableServe', {
    title: () => {
        if (draft.mode === 'banquet') {
            const b = GTABLE_BANQUETS.find(x => x.id === draft.banquetId);
            return b ? b.name : 'Banquet';
        }
        const g = state.gtable;
        const tbl = g && g.service && g.service.tables[draft.idx];
        return tbl ? `Table : ${tbl.name}` : 'Dresser l’assiette';
    },
    render() {
        const themeId = draft.themeId;
        const mains = G.gtableMainChoices(themeId);
        if (draft.mainId && !mains.includes(draft.mainId)) draft.mainId = mains[0] || null;
        const sides = G.gtableSideChoices(themeId, draft.mainId);
        if (draft.sideId && !sides.includes(draft.sideId)) draft.sideId = null;
        const drinks = G.gtableDrinkChoices();
        if (draft.drinkKey && !drinks.some(d => d.key === draft.drinkKey)) draft.drinkKey = null;
        const vipBoxes = state.maison && Array.isArray(state.maison.stock) ? state.maison.stock : [];
        if (draft.vipBoxIdx >= vipBoxes.length) draft.vipBoxIdx = -1;

        const ev = G.evaluateGTablePlate({
            themeId,
            mainId: draft.mainId,
            sideId: draft.sideId,
            drinkKey: draft.drinkKey,
            vipBoxIdx: draft.vipBoxIdx,
        });
        const banq = draft.mode === 'banquet' ? GTABLE_BANQUETS.find(x => x.id === draft.banquetId) : null;
        const canSubmit = !!draft.mainId && (!banq || (ev.score >= banq.minScore && (!banq.needDrink || !!draft.drinkKey)));

        return `<div class="card" style="flex-direction:column;align-items:stretch;gap:6px">
            <div class="gt-preview">
                <div class="gt-preview-top">
                    <span class="gt-score-big${ev.score >= 82 ? ' high' : ''}">Harmonie : ${ev.score}/100</span>
                    <span>${COIN()} <b>${fmt(ev.pay)}</b> · +${fmt(ev.xp)} XP</span>
                </div>
                <div class="gt-tags">
                    ${themeId ? themeTag(themeId) : ''}
                    ${ev.tags.map(t => `<span class="gt-tag${t.ok ? '' : ' bad'}">${esc(t.label)}</span>`).join('')}
                </div>
                <div>${btn('Suggestion du Chef', { act: 'gtSuggest', size: 'sm', icon: ['ui', 'sparkle'] })}</div>
            </div>

            <div class="gt-sec-head"><span>1. Plat principal (obligatoire)</span><small>${mains.length} en stock</small></div>
            <div class="gt-picks">${
                mains.length
                    ? mains
                          .slice(0, 36)
                          .map(id => {
                              const match = themeId && G.itemThemes(id).includes(themeId);
                              return `<button class="gt-pick${draft.mainId === id ? ' on' : ''}${match ? ' match' : ''}" data-act="gtPickMain" data-id="${id}">
                                  ${ico(['item', id])}<span>${esc(ITEMS[id].name)}</span><small>×${state.inventory[id]}</small>${match ? '<em>Terroir</em>' : ''}
                              </button>`;
                          })
                          .join('')
                    : empty('Aucun plat cuisiné en grange. Préparez un plat à l’Atelier !')
            }</div>

            <div class="gt-sec-head"><span>2. Accompagnement ou dessert</span><small>facultatif</small></div>
            <div class="gt-picks">
                <button class="gt-pick${!draft.sideId ? ' on' : ''}" data-act="gtPickSide" data-id=""><span>Aucun</span></button>
                ${sides
                    .slice(0, 28)
                    .map(
                        id => `<button class="gt-pick${draft.sideId === id ? ' on' : ''}" data-act="gtPickSide" data-id="${id}">
                            ${ico(['item', id])}<span>${esc(ITEMS[id].name)}</span><small>×${state.inventory[id]}</small>
                        </button>`,
                    )
                    .join('')}
            </div>

            <div class="gt-sec-head"><span>3. Accord boisson (Cave, Brasserie, Comptoir)</span><small>${banq && banq.needDrink ? 'requis' : 'bonus accord'}</small></div>
            <div class="gt-picks">
                <button class="gt-pick${!draft.drinkKey ? ' on' : ''}" data-act="gtPickDrink" data-k=""><span>Eau fraîche</span></button>
                ${drinks
                    .slice(0, 28)
                    .map(
                        d => `<button class="gt-pick${draft.drinkKey === d.key ? ' on' : ''}" data-act="gtPickDrink" data-k="${esc(d.key)}">
                            ${ico(d.icon)}<span>${esc(d.name)}</span><em>${esc(d.tag)}</em><small>×${d.qty}</small>
                        </button>`,
                    )
                    .join('')}
            </div>

            ${
                vipBoxes.length
                    ? `<div class="gt-sec-head"><span>4. Cadeau de départ VIP (Votre Maison)</span><small>+${GTABLE_SYNERGY.maisonVipScore} pts & +25 %</small></div>
                    <div class="gt-picks">
                        <button class="gt-pick${draft.vipBoxIdx < 0 ? ' on' : ''}" data-act="gtPickVip" data-i="-1"><span>Sans cadeau</span></button>
                        ${vipBoxes
                            .slice(0, 12)
                            .map(
                                (b, i) => `<button class="gt-pick${draft.vipBoxIdx === i ? ' on' : ''}" data-act="gtPickVip" data-i="${i}">
                                    ${ico(['ui', 'maison'])}<span>${esc(b.name || 'Coffret Maison')}</span>
                                </button>`,
                            )
                            .join('')}
                    </div>`
                    : ''
            }

            <div style="margin-top:12px">
                ${btn(banq ? `Servir le banquet (note ≥ ${banq.minScore})` : 'Servir cette table', {
                    act: 'gtConfirmServe',
                    kind: canSubmit ? 'green' : '',
                    disabled: !canSubmit,
                    wide: true,
                    icon: ['ui', 'gtable'],
                })}
            </div>
        </div>`;
    },
});

// ---------------- actions utilisateur ----------------
export function setupGTable() {
    actions({
        gtBuild: el => G.buildGTable(centerOf(el)),
        gtUpgrade: el => G.upgradeGTableHall(centerOf(el)),
        gtStyle: (el, d) => G.setGTableStyle(d.id),
        gtStart: el => G.openGTableService(centerOf(el)),
        gtFinish: el => G.finishGTableService(centerOf(el)),
        gtBrigade: (el, d) => G.setGTableBrigade(d.role, d.m || null),
        gtScent: (el, d) => G.setGTableScent(d.pid || null, centerOf(el)),
        gtOpenServe: (el, d) => {
            const g = state.gtable;
            const tbl = g && g.service && g.service.tables[+d.i];
            if (!tbl || tbl.served) return;
            draft.mode = 'table';
            draft.idx = +d.i;
            draft.banquetId = null;
            draft.themeId = tbl.themeId;
            suggestBest(tbl.themeId);
            openSheet('gtableServe');
        },
        gtOpenBanquet: (el, d) => {
            const b = GTABLE_BANQUETS.find(x => x.id === d.id);
            if (!b) return;
            draft.mode = 'banquet';
            draft.banquetId = b.id;
            draft.themeId = b.theme;
            suggestBest(b.theme);
            openSheet('gtableServe');
        },
        gtSuggest: () => {
            suggestBest(draft.themeId);
        },
        gtPickMain: (el, d) => {
            draft.mainId = d.id || null;
        },
        gtPickSide: (el, d) => {
            draft.sideId = d.id || null;
        },
        gtPickDrink: (el, d) => {
            draft.drinkKey = d.k || null;
        },
        gtPickVip: (el, d) => {
            draft.vipBoxIdx = +d.i;
        },
        gtConfirmServe: el => {
            const payload = {
                mainId: draft.mainId,
                sideId: draft.sideId,
                drinkKey: draft.drinkKey,
                vipBoxIdx: draft.vipBoxIdx,
            };
            const ok =
                draft.mode === 'banquet'
                    ? G.runGTableBanquet(draft.banquetId, payload, centerOf(el))
                    : G.serveGTable(draft.idx, payload, centerOf(el));
            if (ok) closeSheet('gtableServe');
        },
    });
}
