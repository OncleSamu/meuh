// 1.155 : Feuille MeuhCG — Boosters, Duels (Villageois / Camping / Famille), Classeur et Deck.
// Respecte strictement la règle des 0 émoji de Meuh : toutes les icônes sont en SVG kit.js.
import * as G from '../../systems/index.js';
import {
    TCG_CARD_BY_ID,
    TCG_CARDS,
    TCG_DECK_BUDGET,
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
import { actions, esc } from '../dom.js';
import { art, ico } from '../icons.js';
import { genWrap } from '../genlook.js';
import { innerTabs } from '../innertabs.js';
import { defineSheet } from '../sheets.js';

let binderSeries = 'all';
let binderMissing = false;
let binderSpecial = false;
let duelCat = 'village';
let zoomCardId = null;

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
    const raw = art(c.spr[0], c.spr[1]);
    if (!c.look) return raw;
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
            ${opts.showPower ? `<span class="tcg-pow-mini">${esc(fam.power)}</span>` : ''}
            ${opts.big ? `<span class="tcg-pow-box"><b>${esc(fam.power)}</b> : ${esc(fam.powerDesc)}</span><span class="tcg-flavor">${esc(c.flavor)}</span><span class="tcg-meta">#${num}/${TCG_CARDS.length} · ${esc(TCG_SERIES[c.series].short)} · ${r.cost} étoile${r.cost > 1 ? 's' : ''}${variant !== 'std' ? ` · ${esc(vInfo.name)}` : ''}</span>` : ''}
        </span>
        ${ribbon ? `<span class="tcg-new${opts.isNew ? '' : ' is-var'}">${esc(ribbon)}</span>` : ''}
        ${!opts.hideQty && qty > 1 ? `<span class="tcg-qty">×${qty}</span>` : ''}
        ${!opts.noDeckBadge && (inDeck || isFav) ? `<span class="tcg-pin">${isFav ? ti(['ui', 'star'], 'tcg-ico xs') : ti(['ui', 'tcgDuel'], 'tcg-ico xs')}</span>` : ''}
    </button>`;
}

// ---------------- ONGLET 1 : BOOSTERS ----------------
function renderPackOpening(T) {
    const p = T.lastPack;
    const s = TCG_SERIES[p.seriesId] || TCG_SERIES.vallee;
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
                return `<button type="button" class="tcg-back glow-${c.rarity}${v !== 'std' ? ` var-glow-${v}` : ''}" data-act="tcgReveal" data-i="${idx}" aria-label="Retourner la carte ${idx + 1}">
                    <span class="tcg-back-shine"></span>
                    <span class="tcg-back-in"><b>MEUH<small>CG</small></b><i>?</i>${v !== 'std' ? `<span class="tcg-back-tag">${esc(TCG_VARIANTS[v].short)}</span>` : ''}</span>
                </button>`;
            }
            return renderCardHtml(c, { variant: v, isNew: entry.isNew, isNewVar: entry.isNewVar, hideQty: true, noDeckBadge: true, cls: 'pop-flip' });
        })
        .join('');
    const canAgain = G.tcgCanOpenPack(p.seriesId);
    const againLabel = !s.allSeries && T.freePacks > 0 ? `${ICO_PACK()} Ouvrir un autre (${T.freePacks} gratuit${T.freePacks > 1 ? 's' : ''})` : `Ouvrir un autre (${s.cost} ${ICO_TOK()})`;
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
        const free = !s.allSeries && T.freePacks > 0;
        const prog = s.allSeries ? { have: G.tcgOwnedCount(), total: TCG_CARDS.length } : G.tcgSeriesProgress(sid);
        const pct = Math.round((prog.have / prog.total) * 100);
        return `<div class="tcg-pack-card" style="--pc1:${s.col};--pc2:${s.col2}">
            <div class="tcg-pack-mini">
                <span class="tcg-pack-shine"></span>
                ${art(s.icon[0], s.icon[1])}
            </div>
            <div class="tcg-pack-info">
                <div class="tcg-pack-name">${esc(s.name)}</div>
                <div class="tcg-pack-desc">${esc(s.desc)}</div>
                <div class="tcg-prog-row"><div class="tcg-prog"><i style="width:${pct}%"></i></div><span>${prog.have}/${prog.total}</span></div>
                <button type="button" class="btn sm ${free ? 'green' : can ? 'gold' : ''}" data-act="tcgOpenPack" data-s="${sid}" ${can ? '' : 'disabled'}>
                    ${free ? `${ICO_PACK()} Ouvrir (gratuit · ${T.freePacks})` : `Ouvrir · ${s.cost} ${ICO_TOK()}`}
                </button>
            </div>
        </div>`;
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
        <h4 class="tcg-h4">${ti(['ui', 'trophy'])} Paliers de collection</h4>
        <div class="tcg-miles">${milesHtml}</div>
    `;
}

// ---------------- ONGLET 2 : DUELS 2.0 ----------------
function renderDuelArena(T) {
    const D = T.duel;
    const activeStat = !D.done ? TCG_STATS[D.rounds[D.round]] : null;
    const terrFam = TCG_FAMILIES[D.terrain] || TCG_FAMILIES.village;

    // Frise tactique des 5 manches
    const timelineHtml = D.rounds
        .map((stIdx, i) => {
            const st = TCG_STATS[stIdx];
            const res = (D.history || [])[i];
            const cur = !D.done && i === D.round;
            return `<span class="tcg-tl-step${cur ? ' cur' : ''}${res ? ' ' + res : ''}" title="Manche ${i + 1} : ${st.name}">
                <small>M${i + 1}</small>${ti(st.icon, 'tcg-ico xs')}
            </span>`;
        })
        .join('');

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
            <div class="tcg-clash-head">Manche ${D.last.round} · ${ti(D.last.stat.icon, 'tcg-ico xs')} ${D.last.stat.name} — <b>${txt}</b></div>
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
        const title =
            D.result === 'win'
                ? `${ti(['ui', 'trophy'])} Victoire !`
                : D.result === 'draw'
                  ? `${ICO_DUEL()} Match nul !`
                  : `${ICO_DUEL()} Défaite…`;
        const react = D.result === 'win' ? D.winQuote : D.loseQuote;
        return `<div class="tcg-arena">
            <div class="tcg-opp-bar">
                <span class="tcg-opp-av">${art('villager', D.oppArt)}</span>
                <div class="tcg-opp-meta"><b>${esc(D.oppName)}</b><small>${esc(D.oppRole)}</small><p class="tcg-bubble">${esc(react)}</p></div>
                <div class="tcg-score"><b>${D.pScore}</b><span>-</span><b>${D.oScore}</b></div>
            </div>
            <div class="tcg-timeline">${timelineHtml}</div>
            ${clashHtml}
            <div class="tcg-result ${D.result}">
                <h3>${title}</h3>
                <p>Récompense : <b>+${D.gainTokens} ${ICO_TOK()} jetons MeuhCG</b>${D.training ? ' <span class="tcg-train-note">(entraînement · déjà battu aujourd’hui)</span>' : ''}${D.firstWinPack ? ` &amp; <b>+1 ${ICO_PACK()} Booster gratuit (1re victoire !)</b>` : ''}</p>
                <div class="tcg-stage-actions">
                    <button type="button" class="btn green sm" data-act="tcgStartDuel" data-id="${esc(D.oppId)}">${ti(['ui', 'loop'])} Revanche</button>
                    <button type="button" class="btn sm" data-act="tcgEndDuel">Autres adversaires</button>
                </div>
            </div>
        </div>`;
    }

    const activeBuffs = [];
    if (D.pNextBonus > 0) activeBuffs.push(`Récolte +${D.pNextBonus}`);
    if (D.pEntraide > 0) activeBuffs.push(`Entraide +1 (${D.pEntraide} carte${D.pEntraide > 1 ? 's' : ''})`);
    if (D.boostArmed) activeBuffs.push('Coup de Maître +3 armé');

    const handHtml = D.pHand
        .map((cid, i) => {
            const c = TCG_CARD_BY_ID[cid];
            const pw = G.tcgCardPreviewPower(D, cid);
            return renderCardHtml(c, {
                act: 'tcgPlayCard',
                data: `data-i="${i}"`,
                hiStat: activeStat.id,
                previewVal: pw,
                showPower: true,
                armed: !!D.boostArmed,
                hideQty: true,
                noDeckBadge: true,
                cls: 'playable',
            });
        })
        .join('');

    return `<div class="tcg-arena">
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
        <div class="tcg-round-pill">Manche <b>${D.round + 1}/5</b> · Critère actif : <b>${ti(activeStat.icon, 'tcg-ico xs')} ${activeStat.name}</b></div>
        <div class="tcg-tactics">
            <button type="button" class="btn sm${D.usedReroll ? '' : ' blue'}" data-act="tcgReroll" ${D.usedReroll ? 'disabled' : ''}>${ti(['ui', 'loop'])} Changer critère ${D.usedReroll ? '(utilisé)' : '(1×)'}</button>
            <button type="button" class="btn sm${D.boostArmed ? ' gold' : D.usedBoost ? '' : ' green'}" data-act="tcgBoost" ${D.usedBoost ? 'disabled' : ''}>${ti(['ui', 'bolt'])} ${D.boostArmed ? 'Coup de Maître +3 armé !' : D.usedBoost ? 'Coup de Maître (utilisé)' : 'Coup de Maître +3 (1×)'}</button>
        </div>
        ${activeBuffs.length ? `<div class="tcg-buffs">${activeBuffs.map(b => `<span>${ti(['ui', 'sparkle'], 'tcg-ico xs')} ${esc(b)}</span>`).join('')}</div>` : ''}
        ${clashHtml}
        <div class="tcg-hand-label">Choisis ta carte (score réel affiché en vert)${D.pSyn.length ? ` · Synergies (+2) : ${D.pSyn.map(f => `${ti(TCG_FAMILIES[f].icon, 'tcg-ico xs')} ${TCG_FAMILIES[f].name}`).join(', ')}` : ''}</div>
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
    const quest = G.tcgDailyQuestProgress();
    const questPct = Math.min(100, Math.round((quest.have / quest.need) * 100));

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
        <div class="tcg-quest-card${quest.ready ? ' ready' : quest.claimed ? ' done' : ''}">
            <div class="tcg-quest-info">
                <b>${ti(['ui', 'trophy'], 'tcg-ico xs')} Défi du jour : battre ${quest.need} adversaires différents</b>
                <small>Récompense : +80 ${ICO_TOK()} &amp; +1 ${ICO_PACK()} · 1re victoire du jour = récompense complète, revanche le même jour = 5 jetons.</small>
                <div class="tcg-prog-row"><div class="tcg-prog"><i style="width:${questPct}%"></i></div><span>${Math.min(quest.have, quest.need)}/${quest.need}</span></div>
            </div>
            ${quest.claimed ? `<span class="tcg-done-tag">${ti(['ui', 'check'], 'tcg-ico xs')} Pris</span>` : quest.ready ? `<button type="button" class="btn green sm" data-act="tcgClaimDailyQuest">Prendre</button>` : `<span class="tcg-muted">${quest.have}/${quest.need}</span>`}
        </div>
        <div class="tcg-deck-strip${overBudget ? ' over' : ''}">
            <div>
                <b>Ton deck : ${T.deck.length}/5 · ${deckCost}/${TCG_DECK_BUDGET} ${ti(['ui', 'star'], 'tcg-ico xs')}</b>
                ${overBudget ? `<small>Budget dépassé (max ${TCG_DECK_BUDGET} étoiles) : clique sur Auto ou ajuste ton deck.</small>` : syn.length ? `<small>Synergies (+2) : ${syn.map(f => `${ti(TCG_FAMILIES[f].icon, 'tcg-ico xs')} ${TCG_FAMILIES[f].name}`).join(' · ')}</small>` : '<small>2 cartes de la même famille donnent +2 en duel !</small>'}
            </div>
            ${overBudget ? `<button type="button" class="btn green sm" data-act="tcgAutoDeck">${ti(['ui', 'bolt'])} Auto</button>` : `<span class="tcg-muted">${ti(['ui', 'trophy'], 'tcg-ico xs')} ${T.wins || 0} V · ${T.losses || 0} D</span>`}
        </div>
        ${!overBudget && !deckOk ? `<div class="tcg-pity">${ICO_PACK()} Ouvre au moins 1 booster gratuit dans l’onglet <b>Boosters</b> pour obtenir tes 5 premières cartes !</div>` : ''}
        <div class="tcg-pills">${catPills}</div>
        <div class="tcg-opp-list">${oppHtml}</div>
        <details class="tcg-rules"><summary>Pouvoirs des 6 familles &amp; règles de combat</summary><div class="tcg-rules-body">${powersGuide}<button type="button" class="btn sm" data-act="open" data-sheet="guide" data-page="meuhcg">${ti(['ui', 'info'], 'tcg-ico xs')} Lire la notice complète du MeuhCG</button></div></details>
    `;
}

// ---------------- ONGLET 3 : CLASSEUR & FORGE ----------------
function renderBinderTab(T) {
    const dupes = G.tcgDupeSummary();
    const specCount = G.tcgSpecialVariantCount();
    const seriesPills = [['all', 'Toutes'], ...TCG_SET_IDS.map(id => [id, TCG_SERIES[id].short])]
        .map(([k, lbl]) => `<button type="button" class="tcg-pill${binderSeries === k ? ' on' : ''}" data-act="tcgFilterS" data-s="${k}">${lbl}</button>`)
        .join('');

    const cards = TCG_CARDS.filter(
        c =>
            (binderSeries === 'all' || c.series === binderSeries) &&
            (!binderMissing || !(T.cards[c.id] > 0)) &&
            (!binderSpecial || G.tcgHasSpecialVariant(c.id)),
    );
    const gridHtml = cards.length
        ? cards
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
        : `<div class="tcg-empty"><b>${binderSpecial ? 'Aucune édition spéciale ici' : 'Bravo !'}</b><p>${binderSpecial ? 'Ouvre des boosters ou transforme une carte dans son zoom 3D pour débloquer Inversée, Croquis, Full Art et Or Gravé.' : 'Aucune carte manquante dans ce filtre.'}</p></div>`;

    return `
        <div class="tcg-forge-bar">
            <div><b>${ICO_DUST()} Poussière dorée : ${T.dust}</b><small>${dupes.count ? `${dupes.count} doublon${dupes.count > 1 ? 's' : ''} à recycler (+${dupes.dust} ${ICO_DUST()})` : 'Aucun doublon à recycler'} · ${specCount} édition${specCount > 1 ? 's' : ''} spéciale${specCount > 1 ? 's' : ''}</small></div>
            <button type="button" class="btn sm ${dupes.count ? 'gold' : ''}" data-act="tcgRecycle" ${dupes.count ? '' : 'disabled'}>${ti(['ui', 'loop'])} Recycler</button>
        </div>
        <div class="tcg-pills">
            ${seriesPills}
            <button type="button" class="tcg-pill${binderMissing ? ' on' : ''}" data-act="tcgToggleMiss">Manquantes</button>
            <button type="button" class="tcg-pill${binderSpecial ? ' on' : ''}" data-act="tcgToggleSpec">${ti(['ui', 'sparkle'], 'tcg-ico xs')} Spéciales (${specCount})</button>
        </div>
        <div class="tcg-grid">${gridHtml}</div>
    `;
}

// ---------------- ONGLET 4 : MON DECK ----------------
function renderDeckTab(T) {
    const syn = [...G.tcgDeckSynergies(T.deck)];
    const deckCost = G.tcgDeckCost(T.deck);
    const overBudget = deckCost > TCG_DECK_BUDGET;
    const budgetPct = Math.min(100, Math.round((deckCost / TCG_DECK_BUDGET) * 100));
    const slotsHtml = Array.from({ length: 5 }, (_, i) => {
        const cid = T.deck[i];
        if (!cid || !TCG_CARD_BY_ID[cid]) return '<div class="tcg-slot-empty">Emplacement libre</div>';
        return renderCardHtml(TCG_CARD_BY_ID[cid], { act: 'tcgToggleDeck', data: `data-id="${cid}"`, hideQty: true });
    }).join('');

    const owned = TCG_CARDS.filter(c => (T.cards[c.id] || 0) > 0).sort((a, b) => {
        const sa = a.stats[0] + a.stats[1] + a.stats[2];
        const sb = b.stats[0] + b.stats[1] + b.stats[2];
        return sb - sa || TCG_RARITY_ORDER.indexOf(b.rarity) - TCG_RARITY_ORDER.indexOf(a.rarity);
    });

    const poolHtml = owned.length
        ? owned
              .map(c => {
                  const inDeck = T.deck.includes(c.id);
                  const cantFit = !inDeck && T.deck.length < 5 && deckCost + G.tcgCardCost(c.id) > TCG_DECK_BUDGET;
                  return renderCardHtml(c, { act: 'tcgToggleDeck', data: `data-id="${c.id}"`, overBudget: cantFit });
              })
              .join('')
        : '<div class="tcg-empty"><b>Aucune carte pour le moment</b><p>Ouvre tes boosters gratuits dans l’onglet Boosters !</p></div>';

    return `
        <div class="tcg-forge-bar${overBudget ? ' over' : ''}">
            <div class="tcg-budget-info">
                <b>${ICO_DUEL()} Deck actif (${T.deck.length}/5) · Budget : ${deckCost}/${TCG_DECK_BUDGET} ${ti(['ui', 'star'], 'tcg-ico xs')}</b>
                <div class="tcg-budget-bar${overBudget ? ' over' : ''}"><i style="width:${budgetPct}%"></i></div>
                <small>${overBudget ? `Retire une carte coûteuse ou clique sur Auto pour rester sous ${TCG_DECK_BUDGET} étoiles.` : syn.length ? `Synergies (+2) : ${syn.map(f => `${ti(TCG_FAMILIES[f].icon, 'tcg-ico xs')} ${TCG_FAMILIES[f].name}`).join(' · ')}` : 'C = 1 · PC = 2 · R = 3 · Holo = 4 · Lég. = 5 · Chroma = 6 étoiles.'}</small>
            </div>
            <button type="button" class="btn green sm" data-act="tcgAutoDeck" ${owned.length ? '' : 'disabled'}>${ti(['ui', 'bolt'])} Auto</button>
        </div>
        <div class="tcg-deck-slots">${slotsHtml}</div>
        <h4 class="tcg-h4">Tes cartes (touche pour ajouter / retirer du deck)</h4>
        <div class="tcg-grid">${poolHtml}</div>
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
    open() {
        G.ensureTcg();
        zoomCardId = null;
    },
    render() {
        const T = G.ensureTcg();
        const daily = G.tcgDailyReady();
        const favCard = T.fav && T.cards[T.fav] > 0 ? TCG_CARD_BY_ID[T.fav] : null;
        const boostBadge = (daily ? 1 : 0) + (T.freePacks || 0) + G.tcgClaimableMilestones().length;
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
        tcgRecycle: () => G.tcgRecycleDupes(),
        tcgCraft: (el, d) => G.tcgCraftCard(d.id),
        tcgClaimMile: (el, d) => G.tcgClaimMilestone(d.id),
        tcgToggleDeck: (el, d) => G.tcgToggleDeck(d.id),
        tcgAutoDeck: () => G.tcgAutoDeck(),
        tcgSetFav: (el, d) => G.tcgSetFav(d.id),
        tcgSetSkin: (el, d) => G.tcgSetCardSkin(d.id, d.v),
        tcgCraftVar: (el, d) => G.tcgCraftVariant(d.id, d.v),
        tcgFilterS: (el, d) => (binderSeries = d.s || 'all'),
        tcgToggleMiss: () => {
            binderMissing = !binderMissing;
            if (binderMissing) binderSpecial = false;
        },
        tcgToggleSpec: () => {
            binderSpecial = !binderSpecial;
            if (binderSpecial) binderMissing = false;
        },
        tcgDuelCat: (el, d) => (duelCat = d.c || 'village'),
        tcgStartDuel: (el, d) => G.tcgStartDuel(d.id),
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
