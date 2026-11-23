// 1.155 : MeuhCG — vérification des 100 cartes & sprites, isolation économique totale, boosters, forge,
// duels (villageois, campeurs réels, famille réelle), sauvegarde et Prestige.
import fs from 'node:fs';
import test from 'node:test';
import assert from 'node:assert/strict';
import { state, newState, setState, fromSave } from '../../src/core/state.js';
import { PRESTIGE_LVL } from '../../src/data/progress.js';
import { TCG_CARDS, TCG_CARD_BY_ID, TCG_DECK_BUDGET, TCG_FAMILIES, TCG_RARITIES, TCG_SERIES, TCG_STATS, TCG_VILLAGER_DUELS } from '../../src/data/tcg.js';
import { SPR } from '../../src/art/index.js';
import * as G from '../../src/systems/index.js';

test('1.156 : les 300 cartes MeuhCG, les 14 villageois, les icônes SVG et la règle des 0 émoji', async () => {
    assert.equal(TCG_CARDS.length, 300);
    assert.equal(TCG_VILLAGER_DUELS.length, 14);
    const ids = new Set();
    for (const c of TCG_CARDS) {
        assert.ok(!ids.has(c.id), `doublon id ${c.id}`);
        ids.add(c.id);
        assert.ok(TCG_SERIES[c.series], `série invalide ${c.series}`);
        assert.ok(TCG_RARITIES[c.rarity], `rareté invalide ${c.rarity}`);
        assert.ok(TCG_FAMILIES[c.family], `famille invalide ${c.family}`);
        assert.equal(c.stats.length, 3);
        const [kind, sid] = c.spr;
        const svg = SPR[kind](sid);
        assert.ok(typeof svg === 'string' && svg.includes('<svg') && svg.length > 120 && !/undefined|NaN/.test(svg), `sprite invalide pour ${c.id} (${kind}:${sid})`);
    }
    for (const opp of TCG_VILLAGER_DUELS) {
        assert.equal(opp.deck.length, 5, `deck de ${opp.id}`);
        assert.ok(TCG_FAMILIES[opp.terrain], `terrain invalide ${opp.id}`);
        for (const cid of opp.deck) assert.ok(TCG_CARD_BY_ID[cid], `carte inconnue ${cid} chez ${opp.id}`);
        const av = SPR.villager(opp.art);
        assert.ok(av.includes('<svg') && !/undefined|NaN/.test(av), `portrait invalide ${opp.id}`);
    }
    for (const k of ['meuhcg', 'tcgToken', 'tcgDust', 'tcgPack', 'tcgDuel', 'tcgTent']) {
        const ico = SPR.ui(k);
        assert.ok(ico.includes('<svg') && ico.length > 150 && !/undefined|NaN/.test(ico), `icône ui.${k}`);
    }
    for (const f of Object.values(TCG_FAMILIES)) assert.ok(SPR[f.icon[0]](f.icon[1]).includes('<svg'), f.id);
    for (const s of TCG_STATS) assert.ok(SPR[s.icon[0]](s.icon[1]).includes('<svg'), s.key);
    for (const p of ['src/data/tcg.js', 'src/systems/tcg.js', 'src/ui/sheets/tcg.js', 'src/art/tcg.js', 'src/styles/95-tcg.css']) {
        const txt = fs.readFileSync(p, 'utf8');
        assert.equal(/\p{Extended_Pictographic}/u.test(txt), false, `émoji interdit détecté dans ${p}`);
    }
    const { GUIDE_PAGES } = await import('../../src/data/guide.js');
    const gp = GUIDE_PAGES.find(p => p.id === 'meuhcg');
    assert.ok(gp && gp.go === 'sheet:tcg' && gp.secs.length >= 5, 'notice MeuhCG présente dans le Guide');
});

test('1.155 : boosters, pity timer, recyclage, forge, paliers et isolation économique totale de la ferme', () => {
    setState(newState());
    G.loadGame();
    const moneyBefore = state.money;
    const xpBefore = state.xp;
    const rubansBefore = state.prestige.rubans;

    const T = G.ensureTcg();
    assert.equal(T.freePacks, 2);
    assert.equal(G.tcgDailyReady(), true);
    assert.equal(G.tcgClaimDaily(), true);
    assert.equal(G.tcgDailyReady(), false);
    assert.equal(T.freePacks, 3);

    // Ouverture d'un booster gratuit + déchirement + révélation
    const pack = G.tcgOpenPack('vallee');
    assert.ok(pack && pack.cards.length === 5 && pack.torn === false);
    assert.equal(G.tcgTearPack(), true);
    assert.equal(G.tcgRevealCard(0), true);
    assert.equal(G.tcgRevealAll(), true);
    assert.ok(T.lastPack.revealed.every(Boolean));
    assert.equal(G.tcgClosePack(), true);
    assert.equal(T.deck.length, 5, 'le deck de départ se remplit automatiquement');
    assert.ok(G.tcgDeckCost(T.deck) <= TCG_DECK_BUDGET, 'le deck de départ respecte le budget de 16 étoiles');

    // Pity timer : au 10e booster (pity = 9), au moins une Légendaire ou Secrète
    T.pity = 9;
    T.tokens = 500;
    const pityPack = G.tcgOpenPack('horizons');
    assert.ok(
        pityPack.cards.some(x => ['L', 'S'].includes(TCG_CARD_BY_ID[x.id].rarity)),
        'pity timer garantit une L ou S',
    );
    G.tcgClosePack();

    // Booster Doré : au moins une Foil+
    T.tokens = 500;
    const goldPack = G.tcgOpenPack('gold');
    assert.ok(
        goldPack.cards.some(x => ['F', 'L', 'S'].includes(TCG_CARD_BY_ID[x.id].rarity)),
        'booster doré garantit Foil+',
    );
    G.tcgClosePack();

    // Recyclage des doublons + forge d'une carte manquante
    T.cards.v01 = 5;
    const dustGain = G.tcgRecycleDupes();
    assert.ok(dustGain >= 20);
    assert.equal(T.cards.v01, 1);
    const missing = TCG_CARDS.find(c => !T.cards[c.id] && c.rarity === 'C');
    T.dust = 100;
    assert.equal(G.tcgCraftCard(missing.id), true);
    assert.equal(T.cards[missing.id], 1);

    // Palier 10 cartes
    TCG_CARDS.slice(0, 12).forEach(c => (T.cards[c.id] = 1));
    assert.equal(G.tcgClaimMilestone('m10'), true);
    assert.equal(G.tcgClaimMilestone('m10'), false, 'palier déjà pris');

    // Aucun impact sur l'économie de la ferme !
    assert.equal(state.money, moneyBefore);
    assert.equal(state.xp, xpBefore);
    assert.equal(state.prestige.rubans, rubansBefore);
});

test('1.156 : duels 2.0 (relance, Coup de Maître +3, pouvoirs de famille, campeurs et famille réels)', () => {
    setState(newState());
    G.loadGame();
    const T = G.ensureTcg();
    // Deck valide sous 16 étoiles : v01(C=1) + v04(C=1) + v16(R=3) + h23(L=5) + v24(S=6) = 16
    const validDeck = ['v01', 'v04', 'v16', 'h23', 'v24'];
    validDeck.forEach(id => (T.cards[id] = 1));
    T.deck = [...validDeck];
    assert.equal(G.tcgDeckCost(T.deck), 16);
    assert.ok(G.tcgDeckSynergies(T.deck).has('elevage'));

    state.camping = {
        pitches: 3,
        guests: [{ name: 'Chloé', from: 'de Lyon', profile: 'gourmand', look: 'h00000000000', say: 'Super endroit !' }],
        res: [{ name: 'Bastien', job: 'peintre', look: 'h11111111111', fr: 50 }],
        past: [],
        up: {},
    };
    state.family = {
        spouse: 'ines',
        kids: [{ id: 'k1', name: 'Malo', girl: false, grow: 100, look: 'h22222222222' }],
        kin: [],
        rooms: {},
    };

    const opps = G.tcgOpponents();
    assert.ok(opps.some(o => o.cat === 'village' && o.id === 'v_odette'));
    assert.ok(opps.some(o => o.cat === 'village' && o.id === 'v_duval'));
    assert.ok(opps.some(o => o.cat === 'camping' && o.name === 'Chloé'));
    assert.ok(opps.some(o => o.cat === 'camping' && o.name === 'Bastien'));
    assert.ok(opps.some(o => o.cat === 'family' && o.name === 'Inès'));
    assert.ok(opps.some(o => o.cat === 'family' && o.name === 'Malo'));

    // Jouer un duel complet avec Relance du critère + Coup de Maître (+3)
    const moneyBefore = state.money;
    const tokensBefore = T.tokens;
    assert.equal(G.tcgStartDuel('v_theo'), true);
    const stat0 = T.duel.rounds[0];
    assert.equal(G.tcgDuelReroll(), true);
    assert.equal(T.duel.rounds[0], (stat0 + 1) % 3);
    assert.equal(G.tcgDuelReroll(), false, '1 seule relance par duel');
    const beforeBoost = G.tcgCardPreviewPower(T.duel, T.duel.pHand[0]);
    assert.equal(G.tcgDuelBoost(), true);
    assert.equal(G.tcgCardPreviewPower(T.duel, T.duel.pHand[0]), beforeBoost + 3);
    assert.equal(G.tcgDuelBoost(), false, '1 seul Coup de Maître par duel');

    for (let r = 0; r < 5; r++) assert.equal(G.tcgPlayDuelCard(0), true);
    assert.equal(T.duel.done, true);
    assert.equal(T.duel.history.length, 5);
    assert.ok(T.tokens > tokensBefore, 'le duel donne des jetons MeuhCG');
    assert.equal(state.money, moneyBefore, 'aucun lien avec les pièces de la ferme');
    assert.equal(G.tcgEndDuel(), true);
});

test('1.157 : équilibrage MeuhCG — budget 16 étoiles, anti-spam quotidien, Défi du jour, pouvoirs & Boss +2', () => {
    setState(newState());
    G.loadGame();
    const T = G.ensureTcg();
    TCG_CARDS.forEach(c => (T.cards[c.id] = 1));

    // 1. Budget de deck (16 étoiles) : refuse un deck > 16 étoiles et tcgAutoDeck reste <= 16
    T.deck = ['v24', 'h24', 'p24', 't24']; // 4 Secrètes = 24 étoiles (héritage pré-1.157)
    assert.equal(G.tcgToggleDeck('v23'), false, 'refuse d’ajouter une carte au-delà de 16 étoiles');
    T.deck = ['v24', 'h24', 'p24', 't24', 'v23']; // 29 étoiles
    assert.equal(G.tcgStartDuel('v_theo'), false, 'refuse de lancer un duel avec un deck > 16 étoiles');
    assert.equal(G.tcgAutoDeck(), true);
    assert.equal(T.deck.length, 5);
    assert.ok(G.tcgDeckCost(T.deck) <= TCG_DECK_BUDGET, 'tcgAutoDeck respecte strictement 16 étoiles');

    // 2. Anti-spam quotidien & Défi du jour (3 adversaires différents)
    const playForcedWin = oppId => {
        assert.equal(G.tcgStartDuel(oppId), true);
        // S'assurer d'un score gagnant pour tester les récompenses de victoire de manière déterministe
        T.duel.pScore = 4;
        T.duel.oScore = 0;
        T.duel.round = 4;
        T.duel.pHand = [T.deck[0]];
        T.duel.oHand = [T.duel.oHand[0]];
        assert.equal(G.tcgPlayDuelCard(0), true);
        const snap = { ...T.duel };
        G.tcgEndDuel();
        return snap;
    };

    const theoReward = TCG_VILLAGER_DUELS.find(o => o.id === 'v_theo').reward;
    const w1 = playForcedWin('v_theo');
    assert.equal(w1.result, 'win');
    assert.equal(w1.training, false);
    assert.equal(w1.gainTokens, theoReward, '1re victoire du jour contre Théo = 100 % des jetons');
    assert.equal(G.tcgDailyBeaten('v_theo'), true);

    const w1Again = playForcedWin('v_theo');
    assert.equal(w1Again.result, 'win');
    assert.equal(w1Again.training, true);
    assert.equal(w1Again.gainTokens, 5, 'revanche le même jour contre Théo = mode entraînement (5 jetons)');

    // 2 autres adversaires différents -> Défi du jour prêt (+80 jetons + 1 booster)
    playForcedWin('v_lucie');
    assert.equal(G.tcgDailyQuestProgress().ready, false);
    playForcedWin('v_marcel');
    assert.equal(G.tcgDailyQuestProgress().have, 3);
    assert.equal(G.tcgDailyQuestProgress().ready, true);
    const tokBeforeQuest = T.tokens;
    const packsBeforeQuest = T.freePacks;
    assert.equal(G.tcgClaimDailyQuest(), true);
    assert.equal(T.tokens, tokBeforeQuest + 80);
    assert.equal(T.freePacks, packsBeforeQuest + 1);
    assert.equal(G.tcgClaimDailyQuest(), false, 'Défi du jour réclamable 1 seule fois par jour');

    // Jour suivant -> réinitialisation
    state.day = (state.day || 1) + 1;
    assert.equal(G.tcgDailyBeaten('v_theo'), false);
    assert.equal(G.tcgDailyQuestProgress().have, 0);

    // 3. Pouvoirs rééquilibrés : Troupeau max +2, Horizons +1 hors terrain, Entraide sur 2 cartes
    const elev5 = TCG_CARDS.filter(c => c.family === 'elevage' && c.rarity === 'C').slice(0, 5);
    T.deck = elev5.map(c => c.id);
    assert.equal(G.tcgStartDuel('v_theo'), true); // terrain potager
    T.duel.rounds[0] = 0;
    const baseStat = elev5[0].stats[0];
    // Synergie (+2) + Troupeau plafonné à +2 (malgré 4 autres Élevage en main !) = +4
    assert.equal(G.tcgCardPreviewPower(T.duel, elev5[0].id), baseStat + 4, 'Troupeau plafonné à +2');
    G.tcgEndDuel();

    const byCheap = fam => TCG_CARDS.filter(c => c.family === fam).sort((a, b) => G.tcgCardCost(a.id) - G.tcgCardCost(b.id));
    const hor1 = byCheap('horizons')[0];
    const vil1 = byCheap('village')[0];
    const pot3 = byCheap('potager').slice(0, 3);
    T.deck = [vil1.id, hor1.id, pot3[0].id, pot3[1].id, pot3[2].id];
    assert.equal(G.tcgStartDuel('v_theo'), true); // terrain potager (!== horizons)
    T.duel.rounds = [0, 0, 0, 0, 0];
    // Horizons hors de son terrain gagne +1 Aventure (pas de synergie car 1 seule carte Horizons)
    assert.equal(G.tcgCardPreviewPower(T.duel, hor1.id), hor1.stats[0] + 1, 'Horizons +1 hors de son terrain');
    // Jouer la carte Village (index 0) -> donne 2 charges d'Entraide
    assert.equal(G.tcgPlayDuelCard(0), true);
    assert.equal(T.duel.pEntraide, 2, 'Entraide donne 2 charges');
    // Jouer 2 cartes -> consomme les 2 charges (0 restante sur la 4e carte)
    assert.equal(G.tcgPlayDuelCard(0), true);
    assert.equal(T.duel.pEntraide, 1);
    assert.equal(G.tcgPlayDuelCard(0), true);
    assert.equal(T.duel.pEntraide, 0, 'Entraide expire après 2 cartes');
    G.tcgEndDuel();

    // 4. Boss Difficile / Maître (diff >= 3) déclenche son Coup spécial (+2) pendant le duel
    assert.equal(G.tcgAutoDeck(), true);
    assert.equal(G.tcgStartDuel('v_jules'), true);
    assert.equal(T.duel.oHasBoost, true);
    assert.equal(T.duel.oUsedBoost, false);
    for (let r = 0; r < 5; r++) assert.equal(G.tcgPlayDuelCard(0), true);
    assert.equal(T.duel.oUsedBoost, true, 'le boss Difficile utilise son Coup spécial (+2)');
    G.tcgEndDuel();
});

test('1.155 : sauvegarde (fromSave) et Prestige conservent intégralement la collection MeuhCG', () => {
    setState(newState());
    G.loadGame();
    const T = G.ensureTcg();
    T.tokens = 777;
    T.dust = 333;
    T.cards.h24 = 2;
    T.fav = 'h24';

    const restored = fromSave(JSON.parse(JSON.stringify(state)));
    assert.equal(restored.tcg.tokens, 777);
    assert.equal(restored.tcg.dust, 333);
    assert.equal(restored.tcg.cards.h24, 2);

    setState(restored);
    state.level = PRESTIGE_LVL;
    state.stats.earnedRun = 100000;
    assert.equal(G.doPrestige(), true);
    assert.equal(state.tcg.tokens, 777);
    assert.equal(state.tcg.cards.h24, 2);
    assert.equal(state.tcg.fav, 'h24');
});
