// 1.155 : MeuhCG — vérification des 100 cartes & sprites, isolation économique totale, boosters, forge,
// duels (villageois, campeurs réels, famille réelle), sauvegarde et Prestige.
import fs from 'node:fs';
import test from 'node:test';
import assert from 'node:assert/strict';
import { state, newState, setState, fromSave } from '../../src/core/state.js';
import { PRESTIGE_LVL } from '../../src/data/progress.js';
import { TCG_CARDS, TCG_CARD_BY_ID, TCG_FAMILIES, TCG_RARITIES, TCG_SERIES, TCG_STATS, TCG_VILLAGER_DUELS } from '../../src/data/tcg.js';
import { SPR } from '../../src/art/index.js';
import * as G from '../../src/systems/index.js';

test('1.155 : les 100 cartes MeuhCG, les decks villageois, les icônes SVG et la règle des 0 émoji', () => {
    assert.equal(TCG_CARDS.length, 100);
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
    for (const p of ['src/data/tcg.js', 'src/systems/tcg.js', 'src/ui/sheets/tcg.js', 'src/art/tcg.js']) {
        const txt = fs.readFileSync(p, 'utf8');
        assert.equal(/\p{Extended_Pictographic}/u.test(txt), false, `émoji interdit détecté dans ${p}`);
    }
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

test('1.155 : duels contre villageois, campeurs réels du camping et famille réelle (conjoint + enfants)', () => {
    setState(newState());
    G.loadGame();
    const T = G.ensureTcg();
    // Donner 5 cartes fortes avec synergie Élevage
    ['v16', 'v24', 'h23', 'h24', 'p23'].forEach(id => (T.cards[id] = 1));
    T.deck = ['v16', 'v24', 'h23', 'h24', 'p23'];
    assert.ok(G.tcgDeckSynergies(T.deck).has('elevage'));

    // Ajouter un vrai campeur et un vrai résident au camping
    state.camping = {
        pitches: 3,
        guests: [{ name: 'Chloé', from: 'de Lyon', profile: 'gourmand', look: 'h00000000000', say: 'Super endroit !' }],
        res: [{ name: 'Bastien', job: 'peintre', look: 'h11111111111', fr: 50 }],
        past: [],
        up: {},
    };
    // Ajouter un vrai conjoint et un vrai enfant
    state.family = {
        spouse: 'ines',
        kids: [{ id: 'k1', name: 'Malo', girl: false, grow: 100, look: 'h22222222222' }],
        kin: [],
        rooms: {},
    };

    const opps = G.tcgOpponents();
    assert.ok(opps.some(o => o.cat === 'village' && o.id === 'v_odette'));
    assert.ok(opps.some(o => o.cat === 'camping' && o.name === 'Chloé'));
    assert.ok(opps.some(o => o.cat === 'camping' && o.name === 'Bastien'));
    assert.ok(opps.some(o => o.cat === 'family' && o.name === 'Inès'));
    assert.ok(opps.some(o => o.cat === 'family' && o.name === 'Malo'));

    // Jouer un duel complet (5 manches) contre Théo
    const moneyBefore = state.money;
    const tokensBefore = T.tokens;
    assert.equal(G.tcgStartDuel('v_theo'), true);
    for (let r = 0; r < 5; r++) assert.equal(G.tcgPlayDuelCard(0), true);
    assert.equal(T.duel.done, true);
    assert.ok(T.tokens > tokensBefore, 'le duel donne des jetons MeuhCG');
    assert.equal(state.money, moneyBefore, 'aucun lien avec les pièces de la ferme');
    assert.equal(G.tcgEndDuel(), true);
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
