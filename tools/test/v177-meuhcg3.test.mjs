// 1.177 : MeuhCG 3.0 — God Packs, Pioche Miracle, Météo de duel (dont Orage Inversé), Réactions vivantes, Ligue à 6 rangs & Série 10 (370 cartes).
import test from 'node:test';
import assert from 'node:assert/strict';
import { state, newState, setState } from '../../src/core/state.js';
import { PRESTIGE_LVL } from '../../src/data/progress.js';
import {
    TCG_CARD_BACKS,
    TCG_CARD_BY_ID,
    TCG_CARDS,
    TCG_DUOS,
    TCG_LEAGUES,
    TCG_SERIES,
    TCG_SET_IDS,
    TCG_VILLAGER_DUELS,
    TCG_WEATHERS,
    TCG_WONDER_COST,
} from '../../src/data/tcg.js';
import { SPR } from '../../src/art/index.js';
import * as G from '../../src/systems/index.js';

test('1.177 : Série 10 Mine, Musée & Équipe (35 cartes SVG), Lina & Professeur Anatole, 2 Duos et dos Cristal', () => {
    assert.ok(TCG_SERIES.profondeurs && TCG_SET_IDS.includes('profondeurs'));
    assert.equal(TCG_CARDS.length, 370);
    const s10 = TCG_CARDS.filter(c => c.series === 'profondeurs');
    assert.equal(s10.length, 35);
    for (const c of s10) {
        const [kind, sid] = c.spr;
        const svg = SPR[kind](sid);
        assert.ok(svg.includes('<svg') && !/undefined|NaN/.test(svg), `sprite invalide ${c.id}`);
    }
    assert.ok(TCG_VILLAGER_DUELS.some(v => v.id === 'v_lina'));
    assert.ok(TCG_VILLAGER_DUELS.some(v => v.id === 'v_anatole'));
    assert.ok(TCG_DUOS.some(d => d.id === 'equipe'));
    assert.ok(TCG_DUOS.some(d => d.id === 'musee'));
    assert.ok(TCG_CARD_BACKS.some(b => b.id === 'cristal'));
    for (const w of TCG_WEATHERS) assert.ok(SPR[w.icon[0]](w.icon[1]).includes('<svg'), `icône météo ${w.id}`);
    for (const l of TCG_LEAGUES) assert.ok(SPR[l.icon[0]](l.icon[1]).includes('<svg'), `icône ligue ${l.id}`);
});

test('1.177 : God Pack & Pioche Miracle quotidienne (1re gratuite puis 45 jetons, 0 impact ferme)', () => {
    setState(newState());
    G.loadGame();
    const moneyBefore = state.money;
    const T = G.ensureTcg();
    T.tokens = 400;

    // 1. God Pack forcé -> 5 cartes Foil / Légendaire / Secrète
    const gp = G.tcgOpenPack('profondeurs', { forceGodPack: true });
    assert.ok(gp && gp.godPack === true && gp.cards.length === 5);
    assert.ok(gp.cards.every(x => ['F', 'L', 'S'].includes(TCG_CARD_BY_ID[x.id].rarity)));
    assert.equal(T.godPacks, 1);
    assert.equal(G.tcgTearPack(), true);
    assert.equal(G.tcgRevealAll(), true);
    assert.equal(G.tcgClosePack(), true);

    // 2. Pioche Miracle : 3 tables/jour, 1re gratuite, 2e coûte TCG_WONDER_COST
    assert.equal(G.tcgWonderFreeReady(), true);
    const tables0 = G.tcgWonderTables();
    assert.equal(tables0.length, 3);
    assert.equal(tables0[0].free, true);
    assert.equal(tables0[0].cost, 0);
    const tokBeforeFree = T.tokens;
    assert.equal(G.tcgWonderStart(0), true);
    assert.equal(T.tokens, tokBeforeFree, '1re Pioche Miracle du jour gratuite');
    assert.equal(G.tcgWonderFreeReady(), false);
    assert.equal(G.tcgWonderPick(2), true);
    assert.ok(T.wonderPick.pickedEntry && T.cards[T.wonderPick.pickedEntry.id] >= 1);
    assert.equal(G.tcgWonderPick(1), false, 'une seule carte piochée par table');
    assert.equal(G.tcgWonderClose(), true);

    // 2e table payante (45 jetons)
    const tables1 = G.tcgWonderTables();
    assert.equal(tables1[0].done, true);
    assert.equal(tables1[1].free, false);
    assert.equal(tables1[1].cost, TCG_WONDER_COST);
    const tokBeforePaid = T.tokens;
    assert.equal(G.tcgWonderStart(1), true);
    assert.equal(T.tokens, tokBeforePaid - TCG_WONDER_COST);
    assert.equal(G.tcgWonderPick(0), true);
    assert.equal(G.tcgWonderClose(), true);

    assert.equal(state.money, moneyBefore, 'aucun impact économique sur la ferme');
});

test('1.177 : Météo de duel (Grand Soleil & Orage Inversé), réactions vivantes et Ligue à 6 rangs', () => {
    setState(newState());
    G.loadGame();
    const T = G.ensureTcg();
    for (const c of TCG_CARDS) T.cards[c.id] = 1;

    // 1. Orage Inversé : manche 3 (index 2) jamais sur doubleRound, la PLUS PETITE valeur gagne
    T.deck = ['v01', 'v02', 'v03', 'm30', 'm31']; // Duo de l'Équipe + petites communes
    assert.equal(G.tcgStartDuel('v_anatole', null, { weatherId: 'storm' }), true);
    assert.equal(T.duel.weatherId, 'storm');
    assert.notEqual(T.duel.doubleRound, 2, 'Orage Inversé ne tombe jamais sur la manche ×2');
    T.duel.round = 2; // Manche 3 (Orage Inversé)
    T.duel.rounds[2] = 2; // Prestige
    T.duel.pHand = ['v02']; // Carotte (prestige 1)
    T.duel.oHand = ['m35']; // Cœur de Diamant Brut (prestige 14)
    assert.equal(G.tcgPlayDuelCard(0), true);
    assert.equal(T.duel.last.inverted, true);
    assert.equal(T.duel.last.outcome, 'win', 'sous Orage Inversé, la petite carte bat la Secrète');
    assert.ok(T.duel.liveQuote.includes('Orage'), 'réaction vivante de l’adversaire à l’Orage Inversé');
    G.tcgEndDuel();

    // 2. Grand Soleil : +2 aux cartes Potager sur la manche 2 (index 1)
    T.deck = ['v01', 'v02', 'v03', 'v04', 'v05'];
    assert.equal(G.tcgStartDuel('v_lina', null, { weatherId: 'sun' }), true);
    T.duel.round = 1;
    T.duel.rounds[1] = 0;
    const pv = G.tcgCardPreview(T.duel, 'v01');
    assert.ok(
        pv.tags.some(t => t.includes('Grand Soleil')),
        'Grand Soleil donne +2 Potager sur manche 2',
    );
    G.tcgEndDuel();

    // 3. Ligue MeuhCG : gain de points, réclamation de rang et conservation au Prestige
    T.leaguePts = 0;
    T.leagueClaimed = {};
    assert.equal(G.tcgLeagueInfo().rank.id, 'bois');
    T.leaguePts = 170; // Bronze (60) + Argent (160) atteints
    const lg = G.tcgLeagueInfo();
    assert.equal(lg.rank.id, 'argent');
    assert.equal(lg.claimable.length, 2);
    const tokBefore = T.tokens;
    const packsBefore = T.freePacks;
    assert.equal(G.tcgClaimLeague('bronze'), true);
    assert.equal(G.tcgClaimLeague('bronze'), false, 'récompense de rang réclamable une seule fois');
    assert.equal(T.tokens, tokBefore + 60);
    assert.equal(T.freePacks, packsBefore + 1);

    // Prestige conserve leaguePts & leagueClaimed
    state.level = PRESTIGE_LVL;
    state.stats.earnedRun = 200000;
    assert.equal(G.doPrestige(), true);
    assert.equal(state.tcg.leaguePts, 170);
    assert.equal(state.tcg.leagueClaimed.bronze, true);
});
