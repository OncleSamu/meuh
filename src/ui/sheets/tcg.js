// 1.155 : Feuille MeuhCG — Boosters, Duels (Villageois / Camping / Famille), Classeur et Deck.
// Respecte strictement la règle des 0 émoji de Meuh : toutes les icônes sont en SVG kit.js.
import * as G from '../../systems/index.js';
import {
    TCG_CARD_BACKS,
    TCG_CARD_BY_ID,
    TCG_CARDS,
    TCG_DECK_BUDGET,
    TCG_DUOS,
    TCG_FAMILIES,
    TCG_MILESTONES,
    TCG_PACK_IDS,
    TCG_RARITIES,
    TCG_RARITY_ORDER,
    TCG_SERIES,
    TCG_SET_IDS,
    TCG_STATS,
    TCG_VARIANT_ORDER,
    TCG_VARIANTS,
} from '../../data/tcg.js';
import { actions, esc, QUIET } from '../dom.js';
import { art, artImg, ico } from '../icons.js';
import { genWrap } from '../genlook.js';
import { innerTabs } from '../innertabs.js';
import { defineSheet } from '../sheets.js';

let binderSeries = 'all';
let binderFam = 'all';
let binderCost = 0;
let binderQuery = '';
let binderMissing = false;
let binderSpecial = false;
let binderLimit = 48;
let deckFam = 'all';
let deckCostFilter = 0; // 0 = tous, -1 = <= reste, 1..6 = coût exact
let deckLimit = 48;
let duelCat = 'village';
let zoomCardId = null;

const norm = s =>
    String(s || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');

const pair = v => [
    [v, 1],
    [v, 1],
];

const ti = (ref, cls = 'tcg-ico') => ico(ref, `ico ${cls}`);
const ICO_TOK = () => ti(['ui', 'tcgToken']);
const ICO_DUST = () => ti(['ui', 'tcgDust']);
const ICO_PACK = () => ti(['ui', 'tcgPack']);
const ICO_DUEL = () => ti(['ui', 'tcgDuel']);

function cardSpriteHtml(c) {
    if (!c.look) return artImg(c.spr[0], c.spr[1]);
    const raw = art(c.spr[0], c.spr[1]);
    const g = {
        t: {},
        form: c.spr[0] === 'item' ? c.spr[1] : undefined,
        l: {
            size: pair(c.look.size ?? 1),
            color: pair(c.look.color ?? 0),
            pattern: pair(c.look.pattern ?? 0),
            finish: pair(c.look.finish ?? 0),
            morph: pair(c.look.morph ?? 0),
        },
        halo: !!c.look.halo,
    };
    return genWrap(raw, g, 'tcg-gen');
}

function renderCardHtml(c, opts = {}) {
    const r = TCG_RARITIES[c.rarity];
    const fam = TCG_FAMILIES[c.family];
    const T = G.ensureTcg();
    const qty = T.cards[c.id] || 0;
    const inDeck = T.deck.includes(c.id);
    const isFav = T.fav === c.id;
    const variant = opts.variant || (opts.ignoreSkin ? 'std' : G.tcgCardSkin(c.id));
    const vInfo = TCG_VARIANTS[variant] || TCG_VARIANTS.std;
    const isFullArt = variant === 'fullart' || (variant === 'std' && (c.rarity === 'L' || c.rarity === 'S'));
    const act = opts.act || 'tcgZoom';
    const extraData = opts.data || `data-id="${c.id}"`;
    const hiStat = opts.hiStat ?? -1;
    const previewVal = opts.previewVal;
    const previewTags = opts.previewTags || [];
    const cls = [
        'tcg-card',
        `rar-${c.rarity}`,
        `var-${variant}`,
        isFullArt ? 'is-fullart' : '',
        opts.big ? 'big' : '',
        opts.isNew ? 'is-new' : '',
        opts.armed ? 'armed' : '',
        opts.overBudget ? 'over-budget' : '',
        inDeck && !opts.noDeckBadge ? 'in-deck' : '',
        opts.cls || '',
    ]
        .filter(Boolean)
        .join(' ');
    const statsHtml = TCG_STATS.map((s, i) => {
        const val = hiStat === i && previewVal != null ? previewVal : c.stats[i];
        return `<span class="tcg-st${hiStat === i ? ' hi' : ''}" title="${s.name}">${ti(s.icon, 'tcg-ico xs')}<b>${val}</b></span>`;
    }).join('');
    const sparks =
        c.rarity === 'S' && variant !== 'gold' && variant !== 'sketch'
            ? '<span class="tcg-sparks"><i style="--x:12%;--y:16%;--d:0s"></i><i style="--x:86%;--y:14%;--d:.4s"></i><i style="--x:14%;--y:74%;--d:.8s"></i><i style="--x:88%;--y:68%;--d:1.2s"></i><i style="--x:50%;--y:8%;--d:.6s"></i><i style="--x:76%;--y:42%;--d:1.5s"></i></span>'
            : c.rarity === 'L' || variant === 'gold'
              ? '<span class="tcg-sparks gold"><i style="--x:14%;--y:18%;--d:0s"></i><i style="--x:85%;--y:20%;--d:.5s"></i><i style="--x:20%;--y:72%;--d:1s"></i><i style="--x:82%;--y:70%;--d:1.4s"></i></span>'
              : '';
    const num = String(c.num).padStart(3, '0');
    const ribbon = opts.isNew ? 'NOUVEAU' : opts.isNewVar && variant !== 'std' ? vInfo.name.toUpperCase() : '';
    return `<button type="button" class="${cls}" data-act="${act}" ${extraData} style="--rc:${r.col};--rbg:${r.bg};--fc:${fam.col};--fbg1:${fam.bg1};--fbg2:${fam.bg2}">
        <span class="tcg-holo"></span>
        <span class="tcg-glare"></span>
        ${sparks}
        <span class="tcg-top">
            <span class="tcg-top-l">
                <i class="tcg-fam" title="${fam.name} · ${fam.power}">${ti(fam.icon, 'tcg-ico xs')}</i>
                ${vInfo.short ? `<i class="tcg-var-pill v-${variant}" title="Édition ${vInfo.name}">${vInfo.short}</i>` : ''}
            </span>
            <span class="tcg-top-r">
                <i class="tcg-cost" title="Coût de deck : ${r.cost} étoile${r.cost > 1 ? 's' : ''}">${r.cost}${ti(['ui', 'star'], 'tcg-ico xs')}</i>
                <i class="tcg-rar">${r.short}</i>
            </span>
        </span>
        <span class="tcg-art">${cardSpriteHtml(c)}</span>
        <span class="tcg-foot-glass">
            <span class="tcg-name">${esc(c.name)}</span>
            <span class="tcg-stats">${statsHtml}</span>
            ${previewTags.length ? `<span class="tcg-hand-tags">${previewTags.slice(0, 3).map(t => `<i>${esc(t)}</i>`).join('')}</span>` : ''}
            ${opts.showPower ? `<span class="tcg-pow-mini">${esc(fam.power)}</span>` : ''}
            ${opts.big ? `<span class="tcg-pow-box"><b>${esc(fam.power)}</b> : ${esc(fam.powerDesc)}</span><span class="tcg-flavor">${esc(c.flavor)}</span><span class="tcg-meta">#${num}/${TCG_CARDS.length} · ${esc(TCG_SERIES[c.series].short)} · ${r.cost} étoile${r.cost > 1 ? 's' : ''}${variant !== 'std' ? ` · ${esc(vInfo.name)}` : ''}</span>` : ''}
        </span>
        ${ribbon ? `<span class="tcg-new${opts.isNew ? '' : ' is-var'}">${esc(ribbon)}</span>` : ''}
        ${!opts.hideQty && qty > 1 ? `<span class="tcg-qty">×${qty}</span>` : ''}
        ${!opts.noDeckBadge && (inDeck || isFav) ? `<span class="tcg-pin">${isFav ? ti(['ui', 'star'], 'tcg-ico xs') : ti(['ui', 'tcgDuel'], 'tcg-ico xs')}</span>` : ''}
    </button>`;
}

function renderDeckTabs(T) {
    const decks = T.decks || [[], [], []];
    return `<div class="tcg-deck-tabs" role="tablist" aria-label="Emplacements de decks">${[0, 1, 2]
        .map(i => {
            const d = i === T.deckIdx ? T.deck : decks[i] || [];
            const c = G.tcgDeckCost(d);
            const active = i === T.deckIdx;
            return `<button type="button" class="tcg-deck-tab${active ? ' on' : ''}" data-act="tcgSelectDeck" data-i="${i}">
                <b>Deck ${i + 1}</b>
                <small>${d.length}/5 · ${c}${ti(['ui', 'star'], 'tcg-ico xs')}</small>
            </button>`;
        })
        .join('')}</div>`;
}

// ---------------- ONGLET 1 : BOOSTERS ----------------
function renderPackOpening(T) {
    const p = T.lastPack;
    const s = TCG_SERIES[p.seriesId] || TCG_SERIES.vallee;
    const backId = G.tcgCardBack();
    if (!p.torn) {
        return `<div class="tcg-stage">
            <div class="tcg-stage-title">${esc(s.name)}</div>
            <button type="button" class="tcg-foil-pack" data-act="tcgTear" style="--pc1:${s.col};--pc2:${s.col2}">
                <span class="tcg-pack-crimp top"></span>
                <span class="tcg-pack-shine"></span>
                <span class="tcg-pack-brand">MEUH<span>CG</span></span>
                <span class="tcg-pack-art">${art(s.icon[0], s.icon[1])}</span>
                <span class="tcg-pack-label">${esc(s.short)}</span>
                <span class="tcg-pack-cta">${ti(['ui', 'sparkle'], 'tcg-ico xs')} Touche pour déchirer !</span>
                <span class="tcg-pack-crimp bot"></span>
            </button>
            <div class="tcg-stage-actions">
                <button type="button" class="btn sm" data-act="tcgRevealAll">Tout révéler d’un coup</button>
            </div>
        </div>`;
    }
    const allOpen = p.revealed.every(Boolean);
    const cardsHtml = p.cards
        .map((entry, idx) => {
            const c = TCG_CARD_BY_ID[entry.id];
            const v = entry.variant || 'std';
            if (!p.revealed[idx]) {
                return `<button type="button" class="tcg-back back-${backId} glow-${c.rarity}${v !== 'std' ? ` var-glow-${v}` : ''}" data-act="tcgReveal" data-i="${idx}" aria-label="Retourner la carte ${idx + 1}">
                    <span class="tcg-back-shine"></span>
                    <span class="tcg-back-in"><b>MEUH<small>CG</small></b><i>?</i>${v !== 'std' ? `<span class="tcg-back-tag">${esc(TCG_VARIANTS[v].short)}</span>` : ''}</span>
                </button>`;
            }
            return renderCardHtml(c, { variant: v, isNew: entry.isNew, isNewVar: entry.isNewVar, hideQty: true, noDeckBadge: true, cls: 'pop-flip' });
        })
        .join('');
    const canAgain = G.tcgCanOpenPack(p.seriesId);
    const againLabel =
        s.allSeries && T.freeGoldPacks > 0
            ? `${ICO_PACK()} Ouvrir Doré gratuit (${T.freeGoldPacks})`
            : !s.allSeries && T.freePacks > 0
              ? `${ICO_PACK()} Ouvrir un autre (${T.freePacks} gratuit${T.freePacks > 1 ? 's' : ''})`
              : `Ouvrir un autre (${s.cost} ${ICO_TOK()})`;
    return `<div class="tcg-stage">
        <div class="tcg-stage-title">${allOpen ? 'Cartes obtenues !' : 'Touche chaque carte pour la révéler'}</div>
        <div class="tcg-reveal-grid">${cardsHtml}</div>
        <div class="tcg-stage-actions">
            ${!allOpen ? `<button type="button" class="btn gold sm" data-act="tcgRevealAll">${ti(['ui', 'sparkle'])} Tout révéler</button>` : ''}
            ${allOpen && canAgain ? `<button type="button" class="btn green sm" data-act="tcgOpenPack" data-s="${p.seriesId}">${againLabel}</button>` : ''}
            ${allOpen ? '<button type="button" class="btn sm" data-act="tcgClosePack">Retour aux boosters</button>' : ''}
        </div>
    </div>`;
}

function renderBoostersTab(T) {
    if (T.lastPack) return renderPackOpening(T);

    const packsHtml = TCG_PACK_IDS.map(sid => {
        const s = TCG_SERIES[sid];
        const can = G.tcgCanOpenPack(sid);
        const freeGold = !!s.allSeries && (T.freeGoldPacks || 0) > 0;
        const free = !s.allSeries && T.freePacks > 0;
        const prog = s.allSeries ? { have: G.tcgOwnedCount(), total: TCG_CARDS.length } : G.tcgSeriesProgress(sid);
        const pct = Math.round((prog.have / prog.total) * 100);
        const btnLabel = freeGold
            ? `${ICO_PACK()} Ouvrir (gratuit · ${T.freeGoldPacks})`
            : free
              ? `${ICO_PACK()} Ouvrir (gratuit · ${T.freePacks})`
              : `Ouvrir · ${s.cost} ${ICO_TOK()}`;
        return `<div class="tcg-pack-card" style="--pc1:${s.col};--pc2:${s.col2}">
            <div class="tcg-pack-mini">
                <span class="tcg-pack-shine"></span>
                ${art(s.icon[0], s.icon[1])}
            </div>
            <div class="tcg-pack-info">
                <div class="tcg-pack-name">${esc(s.name)}</div>
                <div class="tcg-pack-desc">${esc(s.desc)}</div>
                <div class="tcg-prog-row"><div class="tcg-prog"><i style="width:${pct}%"></i></div><span>${prog.have}/${prog.total}</span></div>
                <button type="button" class="btn sm ${free || freeGold ? 'green' : can ? 'gold' : ''}" data-act="tcgOpenPack" data-s="${sid}" ${can ? '' : 'disabled'}>
                    ${btnLabel}
                </button>
            </div>
        </div>`;
    }).join('');

    const unlockedBacks = new Set(G.tcgUnlockedBacks());
    const activeBack = G.tcgCardBack();
    const backsHtml = TCG_CARD_BACKS.map(b => {
        const ok = unlockedBacks.has(b.id);
        const on = activeBack === b.id;
        return `<button type="button" class="tcg-back-chip${on ? ' on' : ''}${ok ? '' : ' locked'}" data-act="tcgSetBack" data-b="${b.id}" ${ok ? '' : 'disabled'} title="${esc(b.desc)}">
            <span class="tcg-back-swatch back-${b.id}"></span>
            <span><b>${esc(b.name)}</b><small>${on ? 'Actif' : ok ? 'Choisir' : b.needCups ? `${b.needCards} c. / ${b.needCups} coupes` : `${b.needCards} cartes`}</small></span>
        </button>`;
    }).join('');

    const n = G.tcgOwnedCount();
    const milesHtml = TCG_MILESTONES.map(m => {
        const done = !!T.milestones[m.id];
        const ready = !done && n >= m.need;
        return `<div class="tcg-mile${done ? ' done' : ready ? ' ready' : ''}">
            <div><b>${esc(m.name)}</b><small>${m.need} cartes · +${m.tokens} ${ICO_TOK()} &amp; +${m.packs} ${ICO_PACK()}</small></div>
            ${done ? `<span class="tcg-done-tag">${ti(['ui', 'check'], 'tcg-ico xs')} Pris</span>` : ready ? `<button type="button" class="btn green sm" data-act="tcgClaimMile" data-id="${m.id}">Prendre</button>` : `<span class="tcg-muted">${n}/${m.need}</span>`}
        </div>`;
    }).join('');

    const pityLeft = Math.max(1, 10 - (T.pity || 0));
    return `
        <div class="tcg-pity">${ti(['ui', 'sparkle'], 'tcg-ico xs')} 5 cartes par booster (1 Rare+ et 1 édition spéciale Inversée, Croquis, Full Art ou Or Gravé garanties) · Légendaire/Secrète dans au plus <b>${pityLeft}</b> booster${pityLeft > 1 ? 's' : ''}.</div>
        <div class="tcg-pack-list">${packsHtml}</div>
        <h4 class="tcg-h4">${ti(['ui', 'sparkle'])} Dos de cartes (${unlockedBacks.size}/${TCG_CARD_BACKS.length})</h4>
        <div class="tcg-backs-bar">${backsHtml}</div>
        <h4 class="tcg-h4">${ti(['ui', 'trophy'])} Paliers de collection</h4>
        <div class="tcg-miles">${milesHtml}</div>
    `;
}

// ---------------- ONGLET 2 : DUELS 2.2 ----------------
function renderDuelArena(T) {
    const D = T.duel;
    const activeStat = !D.done ? TCG_STATS[D.rounds[D.round]] : null;
    const terrFam = TCG_FAMILIES[D.terrain] || TCG_FAMILIES.village;
    const isDoubleNow = !D.done && D.round === D.doubleRound;

    // Frise tactique des 5 manches (avec manche ×2)
    const timelineHtml = D.rounds
        .map((stIdx, i) => {
            const st = TCG_STATS[stIdx];
            const res = (D.history || [])[i];
            const cur = !D.done && i === D.round;
            const dbl = i === D.doubleRound;
            return `<span class="tcg-tl-step${cur ? ' cur' : ''}${res ? ' ' + res : ''}${dbl ? ' dbl' : ''}" title="Manche ${i + 1} : ${st.name}${dbl ? ' (Manche double : 2 points !)' : ''}">
                <small>M${i + 1}</small>${ti(st.icon, 'tcg-ico xs')}${dbl ? '<em class="tcg-tl-x2">×2</em>' : ''}
            </span>`;
        })
        .join('');

    const tourneyBanner = D.tourney
        ? `<div class="tcg-tourney-banner">${ti(['ui', 'trophy'], 'tcg-ico xs')} <b>Tournoi de la Vallée · Match ${(D.tourney.stage || 0) + 1}/3</b> — ${esc(D.tourney.ruleName)}</div>`
        : '';

    let clashHtml = '';
    if (D.last) {
        const pC = TCG_CARD_BY_ID[D.last.pId];
        const oC = TCG_CARD_BY_ID[D.last.oId];
        const txt = D.last.outcome === 'win' ? 'Manche gagnée !' : D.last.outcome === 'lose' ? 'Manche perdue…' : 'Égalité !';
        const pTags = (D.last.pTags || []).map(x => `<i>${esc(x)}</i>`).join('');
        const oTags = (D.last.oTags || []).map(x => `<i>${esc(x)}</i>`).join('');
        const notesHtml = (D.last.notes || []).length
            ? `<div class="tcg-clash-notes">${D.last.notes.map(n => `<span>${ti(['ui', 'sparkle'], 'tcg-ico xs')} ${esc(n)}</span>`).join('')}</div>`
            : '';
        clashHtml = `<div class="tcg-clash ${D.last.outcome}">
            <div class="tcg-clash-head">Manche ${D.last.round}${D.last.pts === 2 ? ' <span class="tcg-dbl-mini">×2</span>' : ''} · ${ti(D.last.stat.icon, 'tcg-ico xs')} ${D.last.stat.name} — <b>${txt}</b></div>
            <div class="tcg-clash-cards">
                <div class="tcg-clash-side">
                    <small>Toi · <b>${D.last.pVal}</b></small>
                    ${renderCardHtml(pC, { hiStat: D.last.stat.id, previewVal: D.last.pVal, hideQty: true, noDeckBadge: true, act: 'tcgNoop' })}
                    ${pTags ? `<div class="tcg-tags">${pTags}</div>` : ''}
                </div>
                <div class="tcg-vs">VS</div>
                <div class="tcg-clash-side">
                    <small>${esc(D.oppName)} · <b>${D.last.oVal}</b></small>
                    ${renderCardHtml(oC, { hiStat: D.last.stat.id, previewVal: D.last.oVal, variant: D.oppDiff >= 4 ? 'gold' : 'std', ignoreSkin: true, hideQty: true, noDeckBadge: true, act: 'tcgNoop' })}
                    ${oTags ? `<div class="tcg-tags">${oTags}</div>` : ''}
                </div>
            </div>
            ${notesHtml}
        </div>`;
    }

    if (D.done) {
        const title = D.tourneyChamp
            ? `${ti(['ui', 'trophy'])} Champion du Tournoi de la Vallée !`
            : D.result === 'win'
              ? `${ti(['ui', 'trophy'])} Victoire !`
              : D.result === 'draw'
                ? `${ICO_DUEL()} Match nul !`
                : `${ICO_DUEL()} Défaite…`;
        const react = D.result === 'win' ? D.winQuote : D.loseQuote;
        let rewLine = `Récompense : <b>+${D.gainTokens} ${ICO_TOK()} jetons MeuhCG</b>`;
        if (D.tourneyChamp) {
            rewLine = `Récompense finale : <b>+120 ${ICO_TOK()} jetons &amp; +1 ${ICO_PACK()} Booster Doré gratuit !</b> (+1 Coupe de la Vallée)`;
        } else if (D.tourneyNext != null) {
            rewLine = `Qualifié pour le match <b>${D.tourneyNext + 1}/3</b> ! <b>+${D.gainTokens} ${ICO_TOK()} jetons</b>`;
        } else if (D.tourneyOut) {
            rewLine = `Éliminé du tournoi (+${D.gainTokens} ${ICO_TOK()}). Tu peux retenter ta chance immédiatement !`;
        } else {
            if (D.training) rewLine += ' <span class="tcg-train-note">(entraînement · déjà battu aujourd’hui)</span>';
            if (D.firstWinPack) rewLine += ` &amp; <b>+1 ${ICO_PACK()} Booster gratuit (1re victoire !)</b>`;
        }
        const actionsHtml = D.tourneyChamp
            ? `<button type="button" class="btn gold sm" data-act="tcgEndDuel">${ti(['ui', 'trophy'])} Retour aux duels</button>`
            : D.tourneyNext != null
              ? `<button type="button" class="btn green sm" data-act="tcgStartTourney">${ICO_DUEL()} Match suivant (${D.tourneyNext + 1}/3)</button><button type="button" class="btn sm" data-act="tcgEndDuel">Pause</button>`
              : D.tourneyOut
                ? `<button type="button" class="btn green sm" data-act="tcgStartTourney">${ti(['ui', 'loop'])} Retenter le tournoi</button><button type="button" class="btn sm" data-act="tcgEndDuel">Retour</button>`
                : `<button type="button" class="btn green sm" data-act="tcgStartDuel" data-id="${esc(D.oppId)}">${ti(['ui', 'loop'])} Revanche</button><button type="button" class="btn sm" data-act="tcgEndDuel">Autres adversaires</button>`;

        return `<div class="tcg-arena">
            ${tourneyBanner}
            <div class="tcg-opp-bar">
                <span class="tcg-opp-av">${art('villager', D.oppArt)}</span>
                <div class="tcg-opp-meta"><b>${esc(D.oppName)}</b><small>${esc(D.oppRole)}</small><p class="tcg-bubble">${esc(react)}</p></div>
                <div class="tcg-score"><b>${D.pScore}</b><span>-</span><b>${D.oScore}</b></div>
            </div>
            <div class="tcg-timeline">${timelineHtml}</div>
            ${clashHtml}
            <div class="tcg-result ${D.result}">
                <h3>${title}</h3>
                <p>${rewLine}</p>
                <div class="tcg-stage-actions">${actionsHtml}</div>
            </div>
        </div>`;
    }

    const activeBuffs = [];
    if (D.pNextBonus > 0) activeBuffs.push(`Récolte +${D.pNextBonus}`);
    if (D.pEntraide > 0) activeBuffs.push(`Entraide +1 (${D.pEntraide} carte${D.pEntraide > 1 ? 's' : ''})`);
    if (D.boostArmed) activeBuffs.push('Coup de Maître +3 armé');
    if (D.saveurBoost > 0 && activeStat.id === 1) activeBuffs.push(`Grand Banquet +${D.saveurBoost} Saveur`);

    const activeDuos = (D.pDuos || []).map(id => TCG_DUOS.find(x => x.id === id)).filter(Boolean);

    const handHtml = D.pHand
        .map((cid, i) => {
            const c = TCG_CARD_BY_ID[cid];
            const pv = G.tcgCardPreview(D, cid);
            return renderCardHtml(c, {
                act: 'tcgPlayCard',
                data: `data-i="${i}"`,
                hiStat: activeStat.id,
                previewVal: pv.total,
                previewTags: pv.tags,
                showPower: true,
                armed: !!D.boostArmed,
                hideQty: true,
                noDeckBadge: true,
                cls: 'playable',
            });
        })
        .join('');

    const synLabel = D.pSyn.length
        ? ` · Synergies (+${D.synBonus || 2}) : ${D.pSyn.map(f => `${ti(TCG_FAMILIES[f].icon, 'tcg-ico xs')} ${TCG_FAMILIES[f].name}`).join(', ')}`
        : '';
    const duoLabel = activeDuos.length
        ? ` · Duos : ${activeDuos.map(d => `${esc(d.name)} (+${d.bonus})`).join(', ')}`
        : '';

    return `<div class="tcg-arena">
        ${tourneyBanner}
        <div class="tcg-opp-bar">
            <span class="tcg-opp-av">${art('villager', D.oppArt)}</span>
            <div class="tcg-opp-meta"><b>${esc(D.oppName)}</b><small>${esc(D.oppRole)} · ${esc(D.oppDiffLabel)}</small><p class="tcg-bubble">${esc(D.quote)}</p></div>
            <div class="tcg-score"><b>${D.pScore}</b><span>-</span><b>${D.oScore}</b></div>
        </div>
        <div class="tcg-terrain-bar">
            <span>Terrain : <b>${esc(D.terrainName || 'Vallée')}</b> · <span class="tcg-terr-bonus">${ti(terrFam.icon, 'tcg-ico xs')} +1 ${terrFam.name}</span></span>
            ${D.oHasBoost ? `<span class="tcg-boss-tag${D.oUsedBoost ? ' used' : ''}">${ti(['ui', 'bolt'], 'tcg-ico xs')} ${D.oUsedBoost ? 'Boss +2 utilisé' : 'Boss +2 prêt'}</span>` : ''}
        </div>
        <div class="tcg-timeline">${timelineHtml}</div>
        <div class="tcg-round-pill${isDoubleNow ? ' dbl' : ''}">Manche <b>${D.round + 1}/5</b> · Critère actif : <b>${ti(activeStat.icon, 'tcg-ico xs')} ${activeStat.name}</b>${isDoubleNow ? ' <span class="tcg-dbl-tag">MANCHE ×2 · 2 PTS</span>' : ''}</div>
        <div class="tcg-tactics">
            <button type="button" class="btn sm${D.usedReroll ? '' : ' blue'}" data-act="tcgReroll" ${D.usedReroll ? 'disabled' : ''}>${ti(['ui', 'loop'])} Changer critère ${D.usedReroll ? '(utilisé)' : '(1×)'}</button>
            <button type="button" class="btn sm${D.boostArmed ? ' gold' : D.usedBoost ? '' : ' green'}" data-act="tcgBoost" ${D.usedBoost ? 'disabled' : ''}>${ti(['ui', 'bolt'])} ${D.boostArmed ? 'Coup de Maître +3 armé !' : D.usedBoost ? 'Coup de Maître (utilisé)' : 'Coup de Maître +3 (1×)'}</button>
        </div>
        ${activeBuffs.length ? `<div class="tcg-buffs">${activeBuffs.map(b => `<span>${ti(['ui', 'sparkle'], 'tcg-ico xs')} ${esc(b)}</span>`).join('')}</div>` : ''}
        ${clashHtml}
        <div class="tcg-hand-label">Choisis ta carte (score réel + bonus détaillés)${synLabel}${duoLabel}</div>
        <div class="tcg-hand">${handHtml}</div>
        <div class="tcg-stage-actions"><button type="button" class="btn sm" data-act="tcgEndDuel">Abandonner</button></div>
    </div>`;
}

function renderDuelsTab(T) {
    if (T.duel) return renderDuelArena(T);

    const all = G.tcgOpponents();
    const byCat = {
        village: all.filter(o => o.cat === 'village'),
        camping: all.filter(o => o.cat === 'camping'),
        family: all.filter(o => o.cat === 'family'),
    };
    const list = byCat[duelCat] || byCat.village;
    const deckCost = G.tcgDeckCost(T.deck);
    const overBudget = deckCost > TCG_DECK_BUDGET;
    const deckOk = !overBudget && (T.deck.length >= 5 || G.tcgOwnedCount() >= 5);
    const syn = [...G.tcgDeckSynergies(T.deck)];
    const duos = G.tcgDeckDuos(T.deck);
    const quest = G.tcgDailyQuestProgress();
    const questPct = Math.min(100, Math.round((quest.have / quest.need) * 100));

    // Tournoi de la Vallée
    const tourney = G.tcgTourneyStatus();
    const tBudget = tourney.rule.budget;
    const tOverBudget = deckCost > tBudget;
    const tDeckOk = !tOverBudget && (T.deck.length >= 5 || G.tcgOwnedCount() >= 5);
    const stageNames = ['Match 1', 'Demi-finale', 'Finale'];
    const bracketHtml = tourney.opps
        .map((o, idx) => {
            const done = tourney.wonToday || idx < tourney.stage;
            const cur = !tourney.wonToday && idx === tourney.stage;
            return `<div class="tcg-bracket-step${done ? ' done' : cur ? ' cur' : ''}">
                <span class="tcg-br-av">${art('villager', o.art)}</span>
                <small>${stageNames[idx]}</small>
                <b>${esc(o.name)}</b>
            </div>`;
        })
        .join('');

    const catPills = [
        ['village', ['ui', 'village'], `Villageois (${byCat.village.length})`],
        ['camping', ['ui', 'tcgTent'], `Camping (${byCat.camping.length})`],
        ['family', ['ui', 'heart'], `Famille (${byCat.family.length})`],
    ]
        .map(([k, ic, lbl]) => `<button type="button" class="tcg-pill${duelCat === k ? ' on' : ''}" data-act="tcgDuelCat" data-c="${k}">${ti(ic, 'tcg-ico xs')} ${lbl}</button>`)
        .join('');

    const oppHtml = list.length
        ? list
              .map(o => {
                  const beaten = T.beaten[o.id] || 0;
                  const beatenToday = G.tcgDailyBeaten(o.id);
                  const tf = TCG_FAMILIES[o.terrain] || TCG_FAMILIES.village;
                  const rewHtml = beatenToday
                      ? `<span class="tcg-train-tag">${ti(['ui', 'check'], 'tcg-ico xs')} Déjà battu aujourd’hui · Entraînement (+5 ${ICO_TOK()})</span>`
                      : `+${o.reward} ${ICO_TOK()}${beaten ? ` · ${ti(['ui', 'check'], 'tcg-ico xs')} Vaincu ×${beaten}` : ` · +1 ${ICO_PACK()} 1re victoire`}`;
                  return `<div class="tcg-opp-card${beatenToday ? ' beaten-today' : ''}">
                      <span class="tcg-opp-av">${art('villager', o.art)}</span>
                      <div class="tcg-opp-info">
                          <div class="tcg-opp-top"><b>${esc(o.name)}</b><span class="tcg-diff d${o.diff}">${esc(o.diffLabel)}</span>${o.diff >= 3 ? `<span class="tcg-boss-mini" title="Coup spécial +2 en duel">${ti(['ui', 'bolt'], 'tcg-ico xs')}+2</span>` : ''}</div>
                          <small>${esc(o.role)} · ${ti(tf.icon, 'tcg-ico xs')} +1 ${tf.name}</small>
                          <div class="tcg-opp-rew">${rewHtml}</div>
                      </div>
                      <button type="button" class="btn ${beatenToday ? '' : 'green'} sm" data-act="tcgStartDuel" data-id="${esc(o.id)}" ${deckOk ? '' : 'disabled'}>${beatenToday ? 'Rejouer' : 'Défier'}</button>
                  </div>`;
              })
              .join('')
        : `<div class="tcg-empty">
              <b>Personne encore dans ta famille !</b>
              <p>Dès que tu te maries ou que tu as des enfants à la ferme, ton conjoint et chacun de tes enfants apparaîtront ici avec leur vrai portrait pour faire des duels de MeuhCG !</p>
          </div>`;

    const powersGuide = Object.values(TCG_FAMILIES)
        .map(f => `<div class="tcg-pow-row">${ti(f.icon, 'tcg-ico xs')} <b>${f.name} (${f.power})</b> : ${esc(f.powerDesc)}</div>`)
        .join('');

    return `
        <div class="tcg-tourney-card${tourney.wonToday ? ' won' : ''}">
            <div class="tcg-tourney-head">
                <div>
                    <b>${ti(['ui', 'trophy'], 'tcg-ico xs')} Tournoi de la Vallée · ${esc(tourney.rule.name)}</b>
                    <small>${esc(tourney.rule.desc)}</small>
                </div>
                <span class="tcg-cups-pill" title="Coupes du Tournoi de la Vallée">${ti(['ui', 'trophy'], 'tcg-ico xs')} ${tourney.cups} coupe${tourney.cups > 1 ? 's' : ''}</span>
            </div>
            <div class="tcg-bracket">${bracketHtml}</div>
            <div class="tcg-tourney-foot">
                <small>3 victoires d’affilée : <b>+120 ${ICO_TOK()} &amp; +1 ${ICO_PACK()} Booster Doré</b></small>
                <div class="tcg-tourney-btns">
                    ${!tourney.wonToday && tOverBudget ? `<button type="button" class="btn sm" data-act="tcgAutoDeck12">${ti(['ui', 'bolt'], 'tcg-ico xs')} Auto ${tBudget}★</button>` : ''}
                    ${tourney.wonToday ? `<span class="tcg-done-tag">${ti(['ui', 'check'], 'tcg-ico xs')} Remporté !</span>` : `<button type="button" class="btn gold sm" data-act="tcgStartTourney" ${tDeckOk ? '' : 'disabled'}>${ICO_DUEL()} Match ${tourney.stage + 1}/3</button>`}
                </div>
            </div>
        </div>
        <div class="tcg-quest-card${quest.ready ? ' ready' : quest.claimed ? ' done' : ''}">
            <div class="tcg-quest-info">
                <b>${ti(['ui', 'sparkle'], 'tcg-ico xs')} Défi du jour : battre ${quest.need} adversaires différents</b>
                <small>Récompense : +80 ${ICO_TOK()} &amp; +1 ${ICO_PACK()} · 1re victoire du jour = récompense complète, revanche le même jour = 5 jetons.</small>
                <div class="tcg-prog-row"><div class="tcg-prog"><i style="width:${questPct}%"></i></div><span>${Math.min(quest.have, quest.need)}/${quest.need}</span></div>
            </div>
            ${quest.claimed ? `<span class="tcg-done-tag">${ti(['ui', 'check'], 'tcg-ico xs')} Pris</span>` : quest.ready ? `<button type="button" class="btn green sm" data-act="tcgClaimDailyQuest">Prendre</button>` : `<span class="tcg-muted">${quest.have}/${quest.need}</span>`}
        </div>
        ${renderDeckTabs(T)}
        <div class="tcg-deck-strip${overBudget ? ' over' : ''}">
            <div>
                <b>Deck ${(T.deckIdx || 0) + 1} : ${T.deck.length}/5 · ${deckCost}/${TCG_DECK_BUDGET} ${ti(['ui', 'star'], 'tcg-ico xs')}</b>
                ${overBudget ? `<small>Budget dépassé (max ${TCG_DECK_BUDGET} étoiles) : clique sur Auto ou ajuste ton deck.</small>` : syn.length || duos.length ? `<small>${syn.length ? `Synergies (+2) : ${syn.map(f => `${ti(TCG_FAMILIES[f].icon, 'tcg-ico xs')} ${TCG_FAMILIES[f].name}`).join(' · ')}` : ''}${syn.length && duos.length ? ' · ' : ''}${duos.length ? `Duos : ${duos.map(d => `${esc(d.name)} (+${d.bonus})`).join(', ')}` : ''}</small>` : '<small>2 cartes de la même famille donnent +2 · certaines paires activent un Duo secret !</small>'}
            </div>
            ${overBudget ? `<button type="button" class="btn green sm" data-act="tcgAutoDeck">${ti(['ui', 'bolt'])} Auto</button>` : `<span class="tcg-muted">${ti(['ui', 'trophy'], 'tcg-ico xs')} ${T.wins || 0} V · ${T.losses || 0} D</span>`}
        </div>
        ${!overBudget && !deckOk ? `<div class="tcg-pity">${ICO_PACK()} Ouvre au moins 1 booster gratuit dans l’onglet <b>Boosters</b> pour obtenir tes 5 premières cartes !</div>` : ''}
        <div class="tcg-pills">${catPills}</div>
        <div class="tcg-opp-list">${oppHtml}</div>
        <details class="tcg-rules"><summary>Pouvoirs des 6 familles &amp; règles de combat</summary><div class="tcg-rules-body">${powersGuide}<div class="tcg-pow-row">${ti(['ui', 'sparkle'], 'tcg-ico xs')} <b>Manche Double (×2)</b> : une manche parmi M2–M4 vaut 2 points !</div><div class="tcg-pow-row">${ti(['ui', 'heart'], 'tcg-ico xs')} <b>Duos secrets</b> : associe deux cartes emblématiques dans ton deck pour +1 ou +2 bonus.</div><button type="button" class="btn sm" data-act="open" data-sheet="guide" data-page="meuhcg">${ti(['ui', 'info'], 'tcg-ico xs')} Lire la notice complète du MeuhCG</button></div></details>
    `;
}

// ---------------- ONGLET 3 : CLASSEUR, TROC & FORGE ----------------
function renderBinderList(T) {
    const q = norm(binderQuery).trim();
    const cards = TCG_CARDS.filter(
        c =>
            (binderSeries === 'all' || c.series === binderSeries) &&
            (binderFam === 'all' || c.family === binderFam) &&
            (!binderCost || G.tcgCardCost(c.id) === binderCost) &&
            (!binderMissing || !(T.cards[c.id] > 0)) &&
            (!binderSpecial || G.tcgHasSpecialVariant(c.id)) &&
            (!q || norm(c.name).includes(q) || norm(TCG_FAMILIES[c.family].name).includes(q)),
    );
    const shown = cards.slice(0, binderLimit);
    const rem = cards.length - shown.length;
    const gridHtml = shown.length
        ? shown
              .map(c => {
                  if (T.cards[c.id] > 0) return renderCardHtml(c);
                  const r = TCG_RARITIES[c.rarity];
                  const canCraft = T.dust >= r.craft;
                  return `<div class="tcg-card locked rar-${c.rarity}" style="--rc:${r.col}">
                      <span class="tcg-top"><i class="tcg-fam">${ti(TCG_FAMILIES[c.family].icon, 'tcg-ico xs')}</i><span class="tcg-top-r"><i class="tcg-cost">${r.cost}${ti(['ui', 'star'], 'tcg-ico xs')}</i><i class="tcg-rar">${r.short}</i></span></span>
                      <span class="tcg-lock-num">#${String(c.num).padStart(3, '0')}</span>
                      <span class="tcg-name">${esc(c.name)}</span>
                      <button type="button" class="tcg-craft-btn${canCraft ? ' ok' : ''}" data-act="tcgCraft" data-id="${c.id}" ${canCraft ? '' : 'disabled'}>Forger · ${r.craft} ${ICO_DUST()}</button>
                  </div>`;
              })
              .join('')
        : `<div class="tcg-empty"><b>${binderSpecial ? 'Aucune édition spéciale ici' : q ? 'Aucune carte trouvée' : 'Bravo !'}</b><p>${binderSpecial ? 'Ouvre des boosters ou transforme une carte dans son zoom 3D pour débloquer Inversée, Croquis, Full Art et Or Gravé.' : q ? 'Essaie un autre mot-clé ou réinitialise les filtres.' : 'Aucune carte dans ce filtre.'}</p></div>`;
    return `<div class="tcg-grid">${gridHtml}</div>${rem > 0 ? `<div class="tcg-more-row"><button type="button" class="btn sm" data-act="tcgMoreBinder">Afficher plus (${shown.length}/${cards.length})</button></div>` : ''}`;
}

function renderBinderTab(T) {
    const dupes = G.tcgDupeSummary();
    const specCount = G.tcgSpecialVariantCount();
    const trades = G.tcgDailyTrades();
    const tradesReady = trades.filter(t => t.canAccept).length;

    const tradesHtml = trades
        .map(o => {
            const c = TCG_CARD_BY_ID[o.offerCardId];
            if (!c) return '';
            const r = TCG_RARITIES[o.giveRarity];
            const vInfo = TCG_VARIANTS[o.offerVariant || 'std'] || TCG_VARIANTS.std;
            const giveCard = o.giveId ? TCG_CARD_BY_ID[o.giveId] : null;
            const owned = (T.cards[c.id] || 0) > 0;
            return `<div class="tcg-trade-row${o.done ? ' done' : o.canAccept ? ' ready' : ''}">
                <span class="tcg-trade-av">${art('villager', o.villagerArt)}</span>
                <div class="tcg-trade-info">
                    <div class="tcg-trade-top"><b>${esc(o.villagerName)}</b> propose <span class="tcg-trade-card">${esc(c.name)}</span>${vInfo.short ? ` <i class="tcg-var-pill v-${o.offerVariant}">${esc(vInfo.short)}</i>` : ''}${!owned && !o.done ? ' <span class="tcg-trade-new">NEW</span>' : ''}</div>
                    <small>${o.done ? 'Échange effectué aujourd’hui.' : giveCard ? `Contre 1 doublon ${esc(r.name)} (${esc(giveCard.name)})` : `Demande 1 doublon ${esc(r.name)} (aucun en réserve)`}</small>
                </div>
                ${o.done ? `<span class="tcg-done-tag">${ti(['ui', 'check'], 'tcg-ico xs')} Fait</span>` : `<button type="button" class="btn sm ${o.canAccept ? 'green' : ''}" data-act="tcgAcceptTrade" data-i="${o.idx}" ${o.canAccept ? '' : 'disabled'}>Échanger</button>`}
            </div>`;
        })
        .join('');

    const seriesPills = [['all', 'Toutes'], ...TCG_SET_IDS.map(id => [id, TCG_SERIES[id].short])]
        .map(([k, lbl]) => `<button type="button" class="tcg-pill${binderSeries === k ? ' on' : ''}" data-act="tcgFilterS" data-s="${k}">${lbl}</button>`)
        .join('');
    const famPills = [
        `<button type="button" class="tcg-pill sm${binderFam === 'all' ? ' on' : ''}" data-act="tcgFilterFam" data-f="all">Toutes familles</button>`,
        ...Object.entries(TCG_FAMILIES).map(
            ([k, f]) =>
                `<button type="button" class="tcg-pill sm${binderFam === k ? ' on' : ''}" data-act="tcgFilterFam" data-f="${k}">${ti(f.icon, 'tcg-ico xs')} ${f.name}</button>`,
        ),
    ].join('');
    const costPills = [0, 1, 2, 3, 4, 5, 6]
        .map(
            cost =>
                `<button type="button" class="tcg-pill sm${binderCost === cost ? ' on' : ''}" data-act="tcgFilterCost" data-c="${cost}">${cost === 0 ? 'Tous coûts' : `${cost}${ti(['ui', 'star'], 'tcg-ico xs')}`}</button>`,
        )
        .join('');

    return `
        <div class="tcg-forge-bar">
            <div><b>${ICO_DUST()} Poussière dorée : ${T.dust}</b><small>${dupes.count ? `${dupes.count} doublon${dupes.count > 1 ? 's' : ''} à recycler (+${dupes.dust} ${ICO_DUST()})` : 'Aucun doublon à recycler'} · ${specCount} édition${specCount > 1 ? 's' : ''} spéciale${specCount > 1 ? 's' : ''}</small></div>
            <button type="button" class="btn sm ${dupes.count ? 'gold' : ''}" data-act="tcgRecycle" ${dupes.count ? '' : 'disabled'}>${ti(['ui', 'loop'])} Recycler</button>
        </div>
        <details class="tcg-trades-box"${tradesReady ? ' open' : ''}>
            <summary>${ti(['ui', 'loop'], 'tcg-ico xs')} Troc du jour avec les villageois${tradesReady ? ` <span class="tcg-trade-badge">${tradesReady} prêt${tradesReady > 1 ? 's' : ''}</span>` : ''}</summary>
            <div class="tcg-trades">${tradesHtml}</div>
        </details>
        <div class="tcg-search-wrap">
            <input type="search" class="tcg-search" placeholder="Chercher une carte par nom ou famille…" value="${esc(binderQuery)}" data-input="tcgSearch" aria-label="Rechercher une carte">
        </div>
        <div class="tcg-pills">
            ${seriesPills}
            <button type="button" class="tcg-pill${binderMissing ? ' on' : ''}" data-act="tcgToggleMiss">Manquantes</button>
            <button type="button" class="tcg-pill${binderSpecial ? ' on' : ''}" data-act="tcgToggleSpec">${ti(['ui', 'sparkle'], 'tcg-ico xs')} Spéciales (${specCount})</button>
        </div>
        <div class="tcg-subpills">${famPills}</div>
        <div class="tcg-subpills">${costPills}</div>
        <div id="tcg-binder-list">${renderBinderList(T)}</div>
    `;
}

// ---------------- ONGLET 4 : MON DECK (3 EMPLACEMENTS) ----------------
function renderDeckTab(T) {
    const syn = [...G.tcgDeckSynergies(T.deck)];
    const duos = G.tcgDeckDuos(T.deck);
    const deckCost = G.tcgDeckCost(T.deck);
    const remBudget = Math.max(0, TCG_DECK_BUDGET - deckCost);
    const overBudget = deckCost > TCG_DECK_BUDGET;
    const budgetPct = Math.min(100, Math.round((deckCost / TCG_DECK_BUDGET) * 100));
    const slotsHtml = Array.from({ length: 5 }, (_, i) => {
        const cid = T.deck[i];
        if (!cid || !TCG_CARD_BY_ID[cid]) return '<div class="tcg-slot-empty">Emplacement libre</div>';
        return renderCardHtml(TCG_CARD_BY_ID[cid], { act: 'tcgToggleDeck', data: `data-id="${cid}"`, hideQty: true });
    }).join('');

    const allOwned = TCG_CARDS.filter(c => (T.cards[c.id] || 0) > 0);
    const owned = allOwned
        .filter(c => {
            if (deckFam !== 'all' && c.family !== deckFam) return false;
            const cost = G.tcgCardCost(c.id);
            if (deckCostFilter === -1) return T.deck.includes(c.id) || cost <= remBudget;
            if (deckCostFilter > 0 && cost !== deckCostFilter) return false;
            return true;
        })
        .sort((a, b) => {
            const sa = a.stats[0] + a.stats[1] + a.stats[2];
            const sb = b.stats[0] + b.stats[1] + b.stats[2];
            return sb - sa || TCG_RARITY_ORDER.indexOf(b.rarity) - TCG_RARITY_ORDER.indexOf(a.rarity);
        });
    const shownOwned = owned.slice(0, deckLimit);
    const remOwned = owned.length - shownOwned.length;

    const poolHtml = shownOwned.length
        ? shownOwned
              .map(c => {
                  const inDeck = T.deck.includes(c.id);
                  const cantFit = !inDeck && T.deck.length < 5 && deckCost + G.tcgCardCost(c.id) > TCG_DECK_BUDGET;
                  return renderCardHtml(c, { act: 'tcgToggleDeck', data: `data-id="${c.id}"`, overBudget: cantFit });
              })
              .join('')
        : `<div class="tcg-empty"><b>${allOwned.length ? 'Aucune carte dans ce filtre' : 'Aucune carte pour le moment'}</b><p>${allOwned.length ? 'Change de famille ou de coût pour voir tes autres cartes.' : 'Ouvre tes boosters gratuits dans l’onglet Boosters !'}</p></div>`;

    const deckFamPills = [
        `<button type="button" class="tcg-pill sm${deckFam === 'all' ? ' on' : ''}" data-act="tcgDeckFam" data-f="all">Toutes</button>`,
        ...Object.entries(TCG_FAMILIES).map(
            ([k, f]) =>
                `<button type="button" class="tcg-pill sm${deckFam === k ? ' on' : ''}" data-act="tcgDeckFam" data-f="${k}">${ti(f.icon, 'tcg-ico xs')} ${f.name}</button>`,
        ),
    ].join('');
    const deckCostPills = [
        `<button type="button" class="tcg-pill sm${deckCostFilter === 0 ? ' on' : ''}" data-act="tcgDeckCost" data-c="0">Tous</button>`,
        `<button type="button" class="tcg-pill sm${deckCostFilter === -1 ? ' on' : ''}" data-act="tcgDeckCost" data-c="-1">≤ reste (${remBudget}${ti(['ui', 'star'], 'tcg-ico xs')})</button>`,
        ...[1, 2, 3, 4, 5, 6].map(
            cost =>
                `<button type="button" class="tcg-pill sm${deckCostFilter === cost ? ' on' : ''}" data-act="tcgDeckCost" data-c="${cost}">${cost}${ti(['ui', 'star'], 'tcg-ico xs')}</button>`,
        ),
    ].join('');

    const subText = overBudget
        ? `Retire une carte coûteuse ou clique sur Auto pour rester sous ${TCG_DECK_BUDGET} étoiles.`
        : syn.length || duos.length
          ? `${syn.length ? `Synergies (+2) : ${syn.map(f => `${ti(TCG_FAMILIES[f].icon, 'tcg-ico xs')} ${TCG_FAMILIES[f].name}`).join(' · ')}` : ''}${syn.length && duos.length ? ' · ' : ''}${duos.length ? `Duos : ${duos.map(d => `${esc(d.name)} (+${d.bonus})`).join(', ')}` : ''}`
          : 'C = 1 · PC = 2 · R = 3 · Holo = 4 · Lég. = 5 · Chroma = 6 étoiles.';

    return `
        ${renderDeckTabs(T)}
        <div class="tcg-forge-bar${overBudget ? ' over' : ''}">
            <div class="tcg-budget-info">
                <b>${ICO_DUEL()} Deck ${(T.deckIdx || 0) + 1} (${T.deck.length}/5) · Budget : ${deckCost}/${TCG_DECK_BUDGET} ${ti(['ui', 'star'], 'tcg-ico xs')}</b>
                <div class="tcg-budget-bar${overBudget ? ' over' : ''}"><i style="width:${budgetPct}%"></i></div>
                <small>${subText}</small>
            </div>
            <button type="button" class="btn green sm" data-act="tcgAutoDeck" ${allOwned.length ? '' : 'disabled'}>${ti(['ui', 'bolt'])} Auto</button>
        </div>
        <div class="tcg-deck-slots">${slotsHtml}</div>
        <h4 class="tcg-h4">Tes cartes (touche pour ajouter / retirer du deck)</h4>
        <div class="tcg-subpills">${deckFamPills}</div>
        <div class="tcg-subpills">${deckCostPills}</div>
        <div class="tcg-grid">${poolHtml}</div>
        ${remOwned > 0 ? `<div class="tcg-more-row"><button type="button" class="btn sm" data-act="tcgMoreDeck">Afficher plus (${shownOwned.length}/${owned.length})</button></div>` : ''}
    `;
}

// ---------------- ZOOM 3D HOLO ----------------
function renderZoomOverlay(T) {
    if (!zoomCardId || !TCG_CARD_BY_ID[zoomCardId] || !(T.cards[zoomCardId] > 0)) return '';
    const c = TCG_CARD_BY_ID[zoomCardId];
    const inDeck = T.deck.includes(c.id);
    const isFav = T.fav === c.id;
    const curSkin = G.tcgCardSkin(c.id);
    const unlocked = new Set(G.tcgCardVariants(c.id));
    const listVars = TCG_VARIANT_ORDER.filter(v => !(v === 'fullart' && (c.rarity === 'L' || c.rarity === 'S')));
    const varBtns = listVars
        .map(v => {
            const info = TCG_VARIANTS[v];
            const has = unlocked.has(v);
            const active = curSkin === v;
            if (has) {
                return `<button type="button" class="tcg-var-btn${active ? ' on' : ''} v-${v}" data-act="tcgSetSkin" data-id="${c.id}" data-v="${v}" title="${esc(info.desc)}">${esc(info.name)}</button>`;
            }
            const can = T.dust >= info.craft;
            return `<button type="button" class="tcg-var-btn locked v-${v}${can ? ' can' : ''}" data-act="tcgCraftVar" data-id="${c.id}" data-v="${v}" ${can ? '' : 'disabled'} title="${esc(info.desc)}">${esc(info.name)} · ${info.craft}${ICO_DUST()}</button>`;
        })
        .join('');

    return `<div class="tcg-zoom-back" data-act="tcgCloseZoom">
        <div class="tcg-zoom-box" data-act="tcgNoop">
            <div class="tcg-tilt-wrap">${renderCardHtml(c, { big: true, act: 'tcgNoop' })}</div>
            <div class="tcg-zoom-meta">Possédée ×${T.cards[c.id]} · ${esc(TCG_RARITIES[c.rarity].name)} · Famille ${ti(TCG_FAMILIES[c.family].icon, 'tcg-ico xs')} ${TCG_FAMILIES[c.family].name}</div>
            <div class="tcg-var-bar">${varBtns}</div>
            <div class="tcg-stage-actions">
                <button type="button" class="btn sm ${inDeck ? '' : 'green'}" data-act="tcgToggleDeck" data-id="${c.id}">${inDeck ? 'Retirer du deck' : `${ICO_DUEL()} Mettre au deck`}</button>
                <button type="button" class="btn sm ${isFav ? 'gold' : ''}" data-act="tcgSetFav" data-id="${c.id}">${ti(['ui', 'star'], 'tcg-ico xs')} ${isFav ? 'Favorite' : 'Épingler'}</button>
                <button type="button" class="btn sm" data-act="tcgCloseZoom">Fermer</button>
            </div>
        </div>
    </div>`;
}

// ---------------- DÉFINITION DU TIROIR ----------------
defineSheet('tcg', {
    title: 'MeuhCG · Cartes & Duels',
    cls: 'sheet-tcg',
    static: true,
    open() {
        G.ensureTcg();
        zoomCardId = null;
        binderQuery = '';
        binderFam = 'all';
        binderCost = 0;
        binderLimit = 48;
        deckFam = 'all';
        deckCostFilter = 0;
        deckLimit = 48;
    },
    render() {
        const T = G.ensureTcg();
        const daily = G.tcgDailyReady();
        const favCard = T.fav && T.cards[T.fav] > 0 ? TCG_CARD_BY_ID[T.fav] : null;
        const boostBadge = (daily ? 1 : 0) + (T.freePacks || 0) + (T.freeGoldPacks || 0) + G.tcgClaimableMilestones().length;
        const duelsBadge = (T.duel ? 1 : 0) + (G.tcgDailyQuestProgress().ready ? 1 : 0);
        const deckBadge = G.tcgDeckCost(T.deck) > TCG_DECK_BUDGET ? 1 : 0;
        const it = innerTabs(
            'tcg',
            [
                ['boosters', 'Boosters', ['ui', 'tcgPack'], boostBadge],
                ['duels', 'Duels', ['ui', 'tcgDuel'], duelsBadge],
                ['binder', 'Classeur', ['ui', 'book'], G.tcgDupeSummary().count ? 1 : 0],
                ['deck', 'Mon Deck', ['ui', 'meuhcg'], deckBadge],
            ],
            'boosters',
        );
        const cur = it.cur;
        const body =
            cur === 'duels'
                ? renderDuelsTab(T)
                : cur === 'binder'
                  ? renderBinderTab(T)
                  : cur === 'deck'
                    ? renderDeckTab(T)
                    : renderBoostersTab(T);

        return `
            <div class="tcg-hud">
                <span class="tcg-chip">${ICO_TOK()} <b>${T.tokens}</b></span>
                <span class="tcg-chip">${ICO_DUST()} <b>${T.dust}</b></span>
                <span class="tcg-chip">${ICO_PACK()} <b>${T.freePacks}</b></span>
                ${T.freeGoldPacks > 0 ? `<span class="tcg-chip tcg-gold-chip">${ICO_PACK()} <b>${T.freeGoldPacks} Doré</b></span>` : ''}
                <span class="tcg-chip">${ti(['ui', 'book'])} <b>${G.tcgOwnedCount()}/${TCG_CARDS.length}</b></span>
                ${favCard ? `<button type="button" class="tcg-chip tcg-fav" data-act="tcgZoom" data-id="${favCard.id}" title="Carte favorite">${ti(['ui', 'star'], 'tcg-ico xs')} ${esc(favCard.name)}</button>` : ''}
                <button type="button" class="tcg-chip tcg-help" data-act="open" data-sheet="guide" data-page="meuhcg" title="Comment jouer au MeuhCG">${ti(['ui', 'info'], 'tcg-ico xs')} Guide</button>
            </div>
            ${daily ? `<button type="button" class="tcg-daily" data-act="tcgClaimDaily"><span>${ti(['ui', 'sparkle'])} <b>Booster du jour !</b></span><span class="tcg-daily-rew">+1 ${ICO_PACK()} +30 ${ICO_TOK()}</span></button>` : ''}
            ${it.html}
            <div class="tcg-view">${body}</div>
            ${renderZoomOverlay(T)}
        `;
    },
});

export function setupTcg() {
    actions({
        tcgNoop: () => {},
        tcgClaimDaily: () => G.tcgClaimDaily(),
        tcgClaimDailyQuest: () => G.tcgClaimDailyQuest(),
        tcgOpenPack: (el, d) => G.tcgOpenPack(d.s),
        tcgTear: () => G.tcgTearPack(),
        tcgReveal: (el, d) => G.tcgRevealCard(+d.i),
        tcgRevealAll: () => G.tcgRevealAll(),
        tcgClosePack: () => G.tcgClosePack(),
        tcgSetBack: (el, d) => G.tcgSetCardBack(d.b),
        tcgRecycle: () => G.tcgRecycleDupes(),
        tcgCraft: (el, d) => G.tcgCraftCard(d.id),
        tcgAcceptTrade: (el, d) => G.tcgAcceptTrade(+d.i),
        tcgClaimMile: (el, d) => G.tcgClaimMilestone(d.id),
        tcgSelectDeck: (el, d) => G.tcgSelectDeck(+d.i),
        tcgToggleDeck: (el, d) => G.tcgToggleDeck(d.id),
        tcgAutoDeck: () => G.tcgAutoDeck(),
        tcgAutoDeck12: () => G.tcgAutoDeck(G.tcgTourneyStatus().rule.budget),
        tcgSetFav: (el, d) => G.tcgSetFav(d.id),
        tcgSetSkin: (el, d) => G.tcgSetCardSkin(d.id, d.v),
        tcgCraftVar: (el, d) => G.tcgCraftVariant(d.id, d.v),
        tcgSearch: (el, d) => {
            binderQuery = d.value || '';
            binderLimit = 48;
            const box = document.getElementById('tcg-binder-list');
            if (box) box.innerHTML = renderBinderList(G.ensureTcg());
            return QUIET;
        },
        tcgFilterS: (el, d) => {
            binderSeries = d.s || 'all';
            binderLimit = 48;
        },
        tcgFilterFam: (el, d) => {
            binderFam = d.f || 'all';
            binderLimit = 48;
        },
        tcgFilterCost: (el, d) => {
            binderCost = +d.c || 0;
            binderLimit = 48;
        },
        tcgToggleMiss: () => {
            binderMissing = !binderMissing;
            if (binderMissing) binderSpecial = false;
            binderLimit = 48;
        },
        tcgToggleSpec: () => {
            binderSpecial = !binderSpecial;
            if (binderSpecial) binderMissing = false;
            binderLimit = 48;
        },
        tcgDeckFam: (el, d) => {
            deckFam = d.f || 'all';
            deckLimit = 48;
        },
        tcgDeckCost: (el, d) => {
            deckCostFilter = +d.c || 0;
            deckLimit = 48;
        },
        tcgMoreBinder: () => (binderLimit += 48),
        tcgMoreDeck: () => (deckLimit += 48),
        tcgDuelCat: (el, d) => (duelCat = d.c || 'village'),
        tcgStartDuel: (el, d) => G.tcgStartDuel(d.id),
        tcgStartTourney: () => G.tcgStartTourneyMatch(),
        tcgReroll: () => G.tcgDuelReroll(),
        tcgBoost: () => G.tcgDuelBoost(),
        tcgPlayCard: (el, d) => G.tcgPlayDuelCard(+d.i),
        tcgEndDuel: () => G.tcgEndDuel(),
        tcgZoom: (el, d) => (zoomCardId = d.id || null),
        tcgCloseZoom: () => (zoomCardId = null),
    });

    // Effet 3D holographique interactif sur la carte zoomée
    document.addEventListener('pointermove', e => {
        const card = e.target.closest && e.target.closest('.tcg-tilt-wrap .tcg-card.big');
        if (!card) return;
        const r = card.getBoundingClientRect();
        const px = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width));
        const py = Math.max(0, Math.min(1, (e.clientY - r.top) / r.height));
        const ang = Math.round(105 + (px - 0.5) * 90 + (py - 0.5) * 40);
        card.style.setProperty('--rx', `${((0.5 - py) * 20).toFixed(1)}deg`);
        card.style.setProperty('--ry', `${((px - 0.5) * 22).toFixed(1)}deg`);
        card.style.setProperty('--mx', `${(px * 100).toFixed(0)}%`);
        card.style.setProperty('--my', `${(py * 100).toFixed(0)}%`);
        card.style.setProperty('--ang', `${ang}deg`);
    });
    document.addEventListener(
        'pointerleave',
        e => {
            const card = e.target.closest && e.target.closest('.tcg-tilt-wrap .tcg-card.big');
            if (!card) return;
            card.style.setProperty('--rx', '0deg');
            card.style.setProperty('--ry', '0deg');
        },
        true,
    );
}
