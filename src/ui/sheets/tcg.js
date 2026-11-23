// 1.155 : Feuille MeuhCG — Boosters, Duels (Villageois / Camping / Famille), Classeur et Deck.
// Respecte strictement la règle des 0 émoji de Meuh : toutes les icônes sont en SVG kit.js.
import { state } from '../../core/state.js';
import * as G from '../../systems/index.js';
import {
    TCG_CARD_BY_ID,
    TCG_CARDS,
    TCG_FAMILIES,
    TCG_MILESTONES,
    TCG_PACK_IDS,
    TCG_RARITIES,
    TCG_RARITY_ORDER,
    TCG_SERIES,
    TCG_SET_IDS,
    TCG_STATS,
} from '../../data/tcg.js';
import { actions, esc } from '../dom.js';
import { art, ico } from '../icons.js';
import { genWrap } from '../genlook.js';
import { innerTabs } from '../innertabs.js';
import { defineSheet } from '../sheets.js';

let binderSeries = 'all';
let binderMissing = false;
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
    const act = opts.act || 'tcgZoom';
    const extraData = opts.data || `data-id="${c.id}"`;
    const hiStat = opts.hiStat ?? -1;
    const synBonus = opts.synBonus ? 2 : 0;
    const cls = [
        'tcg-card',
        `rar-${c.rarity}`,
        opts.big ? 'big' : '',
        opts.isNew ? 'is-new' : '',
        inDeck && !opts.noDeckBadge ? 'in-deck' : '',
        opts.cls || '',
    ]
        .filter(Boolean)
        .join(' ');
    const statsHtml = TCG_STATS.map((s, i) => {
        const val = c.stats[i] + (hiStat === i ? synBonus : 0);
        return `<span class="tcg-st${hiStat === i ? ' hi' : ''}" title="${s.name}">${ti(s.icon, 'tcg-ico xs')}<b>${val}</b></span>`;
    }).join('');
    const sparks =
        c.rarity === 'S'
            ? '<span class="tcg-sparks"><i style="--x:12%;--y:16%;--d:0s"></i><i style="--x:86%;--y:14%;--d:.4s"></i><i style="--x:14%;--y:74%;--d:.8s"></i><i style="--x:88%;--y:68%;--d:1.2s"></i><i style="--x:50%;--y:8%;--d:.6s"></i><i style="--x:76%;--y:42%;--d:1.5s"></i></span>'
            : c.rarity === 'L'
              ? '<span class="tcg-sparks gold"><i style="--x:14%;--y:18%;--d:0s"></i><i style="--x:85%;--y:20%;--d:.5s"></i><i style="--x:20%;--y:72%;--d:1s"></i><i style="--x:82%;--y:70%;--d:1.4s"></i></span>'
              : '';
    const num = String(c.num).padStart(3, '0');
    return `<button type="button" class="${cls}" data-act="${act}" ${extraData} style="--rc:${r.col};--rbg:${r.bg};--fc:${fam.col}">
        <span class="tcg-holo"></span>
        <span class="tcg-glare"></span>
        ${sparks}
        <span class="tcg-top"><i class="tcg-fam" title="${fam.name}">${ti(fam.icon, 'tcg-ico xs')}</i><i class="tcg-rar">${r.short}</i></span>
        <span class="tcg-art">${cardSpriteHtml(c)}</span>
        <span class="tcg-name">${esc(c.name)}</span>
        <span class="tcg-stats">${statsHtml}</span>
        ${opts.big ? `<span class="tcg-flavor">${esc(c.flavor)}</span><span class="tcg-meta">#${num}/${TCG_CARDS.length} · ${esc(TCG_SERIES[c.series].short)}</span>` : ''}
        ${opts.isNew ? '<span class="tcg-new">NOUVEAU</span>' : ''}
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
            if (!p.revealed[idx]) {
                return `<button type="button" class="tcg-back glow-${c.rarity}" data-act="tcgReveal" data-i="${idx}" aria-label="Retourner la carte ${idx + 1}">
                    <span class="tcg-back-shine"></span>
                    <span class="tcg-back-in"><b>MEUH<small>CG</small></b><i>?</i></span>
                </button>`;
            }
            return renderCardHtml(c, { isNew: entry.isNew, hideQty: true, noDeckBadge: true, cls: 'pop-flip' });
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
        <div class="tcg-pity">${ti(['ui', 'sparkle'], 'tcg-ico xs')} 5 cartes par booster (1 Rare+ garantie) · Légendaire/Secrète garantie dans au plus <b>${pityLeft}</b> booster${pityLeft > 1 ? 's' : ''}.</div>
        <div class="tcg-pack-list">${packsHtml}</div>
        <h4 class="tcg-h4">${ti(['ui', 'trophy'])} Paliers de collection</h4>
        <div class="tcg-miles">${milesHtml}</div>
    `;
}

// ---------------- ONGLET 2 : DUELS ----------------
function renderDuelArena(T) {
    const D = T.duel;
    const pSyn = new Set(D.pSyn || []);
    const activeStat = !D.done ? TCG_STATS[D.rounds[D.round]] : null;

    let clashHtml = '';
    if (D.last) {
        const pC = TCG_CARD_BY_ID[D.last.pId];
        const oC = TCG_CARD_BY_ID[D.last.oId];
        const txt = D.last.outcome === 'win' ? 'Manche gagnée !' : D.last.outcome === 'lose' ? 'Manche perdue…' : 'Égalité !';
        clashHtml = `<div class="tcg-clash ${D.last.outcome}">
            <div class="tcg-clash-head">Manche ${D.last.round} · ${ti(D.last.stat.icon, 'tcg-ico xs')} ${D.last.stat.name} — <b>${txt}</b></div>
            <div class="tcg-clash-cards">
                <div class="tcg-clash-side">
                    <small>Toi · <b>${D.last.pVal}</b>${D.last.pSynBonus ? ' <i>(+2 synergie)</i>' : ''}</small>
                    ${renderCardHtml(pC, { hiStat: D.last.stat.id, synBonus: D.last.pSynBonus, hideQty: true, noDeckBadge: true, act: 'tcgNoop' })}
                </div>
                <div class="tcg-vs">VS</div>
                <div class="tcg-clash-side">
                    <small>${esc(D.oppName)} · <b>${D.last.oVal}</b>${D.last.oSynBonus ? ' <i>(+2)</i>' : ''}</small>
                    ${renderCardHtml(oC, { hiStat: D.last.stat.id, synBonus: D.last.oSynBonus, hideQty: true, noDeckBadge: true, act: 'tcgNoop' })}
                </div>
            </div>
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
            ${clashHtml}
            <div class="tcg-result ${D.result}">
                <h3>${title}</h3>
                <p>Récompense : <b>+${D.gainTokens} ${ICO_TOK()} jetons MeuhCG</b>${D.firstWinPack ? ` &amp; <b>+1 ${ICO_PACK()} Booster gratuit (1re victoire !)</b>` : ''}</p>
                <div class="tcg-stage-actions">
                    <button type="button" class="btn green sm" data-act="tcgStartDuel" data-id="${esc(D.oppId)}">${ti(['ui', 'loop'])} Revanche</button>
                    <button type="button" class="btn sm" data-act="tcgEndDuel">Autres adversaires</button>
                </div>
            </div>
        </div>`;
    }

    const handHtml = D.pHand
        .map((cid, i) => {
            const c = TCG_CARD_BY_ID[cid];
            return renderCardHtml(c, {
                act: 'tcgPlayCard',
                data: `data-i="${i}"`,
                hiStat: activeStat.id,
                synBonus: pSyn.has(c.family),
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
        <div class="tcg-round-pill">Manche <b>${D.round + 1}/5</b> · Critère actif : <b>${ti(activeStat.icon, 'tcg-ico xs')} ${activeStat.name}</b></div>
        ${clashHtml}
        <div class="tcg-hand-label">Choisis une carte de ta main${D.pSyn.length ? ` · Synergies (+2) : ${D.pSyn.map(f => `${ti(TCG_FAMILIES[f].icon, 'tcg-ico xs')} ${TCG_FAMILIES[f].name}`).join(', ')}` : ''}</div>
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
    const deckOk = T.deck.length >= 5 || G.tcgOwnedCount() >= 5;
    const syn = [...G.tcgDeckSynergies(T.deck)];

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
                  return `<div class="tcg-opp-card">
                      <span class="tcg-opp-av">${art('villager', o.art)}</span>
                      <div class="tcg-opp-info">
                          <div class="tcg-opp-top"><b>${esc(o.name)}</b><span class="tcg-diff d${o.diff}">${esc(o.diffLabel)}</span></div>
                          <small>${esc(o.role)}</small>
                          <div class="tcg-opp-rew">+${o.reward} ${ICO_TOK()}${beaten ? ` · ${ti(['ui', 'check'], 'tcg-ico xs')} Vaincu ×${beaten}` : ` · +1 ${ICO_PACK()} 1re victoire`}</div>
                      </div>
                      <button type="button" class="btn green sm" data-act="tcgStartDuel" data-id="${esc(o.id)}" ${deckOk ? '' : 'disabled'}>Défier</button>
                  </div>`;
              })
              .join('')
        : `<div class="tcg-empty">
              <b>Personne encore dans ta famille !</b>
              <p>Dès que tu te maries ou que tu as des enfants à la ferme, ton conjoint et chacun de tes enfants apparaîtront ici avec leur vrai portrait pour faire des duels de MeuhCG !</p>
          </div>`;

    return `
        <div class="tcg-deck-strip">
            <div><b>Ton deck : ${T.deck.length}/5 cartes</b>${syn.length ? `<small>Synergies (+2) : ${syn.map(f => `${ti(TCG_FAMILIES[f].icon, 'tcg-ico xs')} ${TCG_FAMILIES[f].name}`).join(' · ')}</small>` : '<small>2 cartes de la même famille donnent +2 en duel !</small>'}</div>
            <span class="tcg-muted">${ti(['ui', 'trophy'], 'tcg-ico xs')} ${T.wins || 0} V · ${T.losses || 0} D</span>
        </div>
        ${!deckOk ? `<div class="tcg-pity">${ICO_PACK()} Ouvre au moins 1 booster gratuit dans l’onglet <b>Boosters</b> pour obtenir tes 5 premières cartes !</div>` : ''}
        <div class="tcg-pills">${catPills}</div>
        <div class="tcg-opp-list">${oppHtml}</div>
    `;
}

// ---------------- ONGLET 3 : CLASSEUR & FORGE ----------------
function renderBinderTab(T) {
    const dupes = G.tcgDupeSummary();
    const seriesPills = [['all', 'Toutes'], ...TCG_SET_IDS.map(id => [id, TCG_SERIES[id].short])]
        .map(([k, lbl]) => `<button type="button" class="tcg-pill${binderSeries === k ? ' on' : ''}" data-act="tcgFilterS" data-s="${k}">${lbl}</button>`)
        .join('');

    const cards = TCG_CARDS.filter(c => (binderSeries === 'all' || c.series === binderSeries) && (!binderMissing || !(T.cards[c.id] > 0)));
    const gridHtml = cards.length
        ? cards
              .map(c => {
                  if (T.cards[c.id] > 0) return renderCardHtml(c);
                  const r = TCG_RARITIES[c.rarity];
                  const canCraft = T.dust >= r.craft;
                  return `<div class="tcg-card locked rar-${c.rarity}" style="--rc:${r.col}">
                      <span class="tcg-top"><i class="tcg-fam">${ti(TCG_FAMILIES[c.family].icon, 'tcg-ico xs')}</i><i class="tcg-rar">${r.short}</i></span>
                      <span class="tcg-lock-num">#${String(c.num).padStart(3, '0')}</span>
                      <span class="tcg-name">${esc(c.name)}</span>
                      <button type="button" class="tcg-craft-btn${canCraft ? ' ok' : ''}" data-act="tcgCraft" data-id="${c.id}" ${canCraft ? '' : 'disabled'}>Forger · ${r.craft} ${ICO_DUST()}</button>
                  </div>`;
              })
              .join('')
        : '<div class="tcg-empty"><b>Bravo !</b><p>Aucune carte manquante dans ce filtre.</p></div>';

    return `
        <div class="tcg-forge-bar">
            <div><b>${ICO_DUST()} Poussière dorée : ${T.dust}</b><small>${dupes.count ? `${dupes.count} doublon${dupes.count > 1 ? 's' : ''} à recycler (+${dupes.dust} ${ICO_DUST()})` : 'Aucun doublon à recycler'}</small></div>
            <button type="button" class="btn sm ${dupes.count ? 'gold' : ''}" data-act="tcgRecycle" ${dupes.count ? '' : 'disabled'}>${ti(['ui', 'loop'])} Recycler</button>
        </div>
        <div class="tcg-pills">
            ${seriesPills}
            <button type="button" class="tcg-pill${binderMissing ? ' on' : ''}" data-act="tcgToggleMiss">Manquantes</button>
        </div>
        <div class="tcg-grid">${gridHtml}</div>
    `;
}

// ---------------- ONGLET 4 : MON DECK ----------------
function renderDeckTab(T) {
    const syn = [...G.tcgDeckSynergies(T.deck)];
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
        ? owned.map(c => renderCardHtml(c, { act: 'tcgToggleDeck', data: `data-id="${c.id}"` })).join('')
        : '<div class="tcg-empty"><b>Aucune carte pour le moment</b><p>Ouvre tes boosters gratuits dans l’onglet Boosters !</p></div>';

    return `
        <div class="tcg-forge-bar">
            <div><b>${ICO_DUEL()} Deck actif (${T.deck.length}/5)</b><small>${syn.length ? `Synergies (+2) : ${syn.map(f => `${ti(TCG_FAMILIES[f].icon, 'tcg-ico xs')} ${TCG_FAMILIES[f].name}`).join(' · ')}` : 'Mets 2 cartes d’une même famille pour +2 en duel !'}</small></div>
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
    return `<div class="tcg-zoom-back" data-act="tcgCloseZoom">
        <div class="tcg-zoom-box" data-act="tcgNoop">
            <div class="tcg-tilt-wrap">${renderCardHtml(c, { big: true, act: 'tcgNoop' })}</div>
            <div class="tcg-zoom-meta">Possédée ×${T.cards[c.id]} · ${esc(TCG_RARITIES[c.rarity].name)} · Famille ${ti(TCG_FAMILIES[c.family].icon, 'tcg-ico xs')} ${TCG_FAMILIES[c.family].name}</div>
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
        const it = innerTabs(
            'tcg',
            [
                ['boosters', 'Boosters', ['ui', 'tcgPack'], boostBadge],
                ['duels', 'Duels', ['ui', 'tcgDuel'], T.duel ? 1 : 0],
                ['binder', 'Classeur', ['ui', 'book'], G.tcgDupeSummary().count ? 1 : 0],
                ['deck', 'Mon Deck', ['ui', 'meuhcg'], 0],
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
                ${favCard ? `<button type="button" class="tcg-chip fav" data-act="tcgZoom" data-id="${favCard.id}" title="Carte favorite">${ti(['ui', 'star'], 'tcg-ico xs')} ${esc(favCard.name)}</button>` : ''}
            </div>
            ${daily ? `<button type="button" class="tcg-daily" data-act="tcgClaimDaily"><span>${ti(['ui', 'sparkle'])} <b>Booster gratuit du jour ${state.day || 1} !</b></span><span>+1 ${ICO_PACK()} &amp; +30 ${ICO_TOK()}</span></button>` : ''}
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
        tcgFilterS: (el, d) => (binderSeries = d.s || 'all'),
        tcgToggleMiss: () => (binderMissing = !binderMissing),
        tcgDuelCat: (el, d) => (duelCat = d.c || 'village'),
        tcgStartDuel: (el, d) => G.tcgStartDuel(d.id),
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
