// 1.142 : L'Atelier du Parfumeur (pyramide olfactive, 3 méthodes, 3 concentrations, macération active à soins, flacons SVG, Salon, Orgue, doc).
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { memStore } from './helpers.mjs';
import { state, setStore } from '../../src/core/state.js';
import { setView } from '../../src/core/view.js';
import { setClock } from '../../src/core/clock.js';
import * as G from '../../src/systems/index.js';
import { ITEMS } from '../../src/data/items.js';
import {
    PERFUME_LVL,
    PERFUME_NOTES,
    PERFUME_CLASSICS,
    BOTTLE_IDS,
    CAP_IDS,
    STAGES,
    CONCENTRATIONS,
} from '../../src/data/perfume.js';
import { perfumeSvg } from '../../src/art/perfume.js';
import { SPR } from '../../src/art/index.js';

let T = Date.UTC(2026, 10, 19, 12);
function farm(lvl = 60) {
    T = Date.UTC(2026, 10, 19, 12);
    setClock(() => T);
    setStore(memStore());
    G.loadGame();
    setView({ started: false, tab: 'farm', hidden: false });
    state.tutorial.done = true;
    state.level = lvl;
    state.money = 1e9;
    state.barn.lvl = 14;
    for (const k of ['plank', 'paint', 'beam', 'nail', 'tools']) state.inventory[k] = 500;
    for (const id of Object.keys(PERFUME_NOTES)) state.inventory[id] = 30;
}

test('données et SVG : 81 essences valides (27 par étage), 5 flacons × 4 bouchons + icône UI perfume', () => {
    const notes = Object.values(PERFUME_NOTES);
    assert.equal(notes.length, 81);
    assert.equal(notes.filter(n => n.tier === 'head').length, 27);
    assert.equal(notes.filter(n => n.tier === 'heart').length, 27);
    assert.equal(notes.filter(n => n.tier === 'base').length, 27);
    for (const id of Object.keys(PERFUME_NOTES)) assert.ok(ITEMS[id], `essence ${id} dans ITEMS`);
    for (const b of BOTTLE_IDS) {
        for (const c of CAP_IDS) {
            const s = perfumeSvg({ bottle: b, cap: c, color: '#c47dd9', stars: 3, classic: 'provence' });
            assert.ok(s.startsWith('<svg') && s.includes('</svg>') && s.length > 200, `SVG ${b}/${c}`);
        }
    }
    assert.ok(SPR.has.ui.perfume && SPR.ui('perfume').includes('<svg'));
});

test('ouverture niveau 54 et dame-jeannes qui grandissent avec Cuisines et ateliers (Domaine)', () => {
    farm(PERFUME_LVL - 1);
    assert.equal(G.perfumeOpen(), false);
    assert.equal(G.perfumeVatCount(), 0);
    assert.equal(G.startPerfume(), false);
    state.level = PERFUME_LVL;
    assert.equal(G.perfumeOpen(), true);
    assert.equal(G.perfumeVatCount(), 2);
    for (let k = 0; k < 2; k++) G.buyDomaine('kitchen');
    assert.equal(G.perfumeVatCount(), 3);
    for (let k = 0; k < 3; k++) G.buyDomaine('kitchen');
    assert.equal(G.perfumeVatCount(), 4);
});

test('pyramide, grands classiques, macération 3 étapes avec soins, mise en flacon et Orgue', () => {
    farm(60);
    G.ensurePerfume();
    // Eau de Provence : lemon · lavender · resin (Grand classique)
    assert.ok(G.setPerfumeNote('head', 'lemon'));
    assert.ok(G.setPerfumeNote('heart', 'lavender'));
    assert.ok(G.setPerfumeNote('base', 'resin'));
    assert.ok(G.setPerfumeMethod('enfleurage'));
    assert.ok(G.setPerfumeConc('extrait'));
    assert.ok(G.setPerfumeBottle('cristal'));
    assert.ok(G.setPerfumeCap('or'));

    const pv = G.perfumePreview();
    assert.equal(pv.harmony.classic, 'provence');
    assert.equal(pv.harmony.stars, 3);
    assert.equal(pv.name, 'Eau de Provence');
    assert.equal(pv.bottles, CONCENTRATIONS.extrait.bottles);

    const pid = G.startPerfume();
    assert.ok(pid);
    assert.equal(state.inventory.lemon, 30 - CONCENTRATIONS.extrait.qty);
    const v = state.perfume.vats[0];
    assert.equal(v.stage, 0);
    assert.ok(G.perfumeVatCanCare(v));

    // Soigner et franchir les 3 étapes
    for (let s = 0; s < STAGES.length; s++) {
        assert.ok(G.carePerfumeVat(0), `soin étape ${s}`);
        assert.equal(G.perfumeVatCanCare(v), false, 'un seul soin par étape');
        T = v.stageUntil + 1000;
        G.perfumeTick();
    }
    assert.ok(G.perfumeVatReady(v), 'prêt après les 3 étapes');
    assert.equal(v.finesse, 3);

    const valBefore = G.perfumeOf(pid).value;
    assert.ok(G.bottlePerfume(0));
    assert.equal(state.perfume.vats[0], null);
    assert.equal(G.perfumeStock(pid), CONCENTRATIONS.extrait.bottles);
    assert.ok(G.perfumeOf(pid).value > valBefore, 'les 3 soins bonifient la valeur');
    assert.equal(G.perfumeQual(pid).s, CONCENTRATIONS.extrait.bottles, '3 soins parfaits élèvent la qualité d’un cran');
    assert.equal(state.stats.perfumes, CONCENTRATIONS.extrait.bottles);
    // 3 essences + 1 famille + 1 classique = 5 découvertes dans l'Orgue
    assert.equal(G.organCount(), 5);

    // Renommer, favori, vendre (la demande baisse légèrement le prix)
    assert.ok(G.renamePerfume(pid, 'Provence Royale'));
    assert.equal(G.perfumeOf(pid).name, 'Provence Royale');
    assert.ok(G.togglePerfumeFav(pid));
    assert.equal(G.isPerfumeFav(pid), true);
    const p1 = G.perfumePrice(pid);
    const moneyBefore = state.money;
    assert.ok(G.sellPerfume(pid, 2));
    assert.ok(state.money > moneyBefore);
    assert.ok(G.perfumePrice(pid) <= p1);
});

test('Salon (commandes Portrait olfactif), meilleur accord, hors-ligne et Orgue réclamable', () => {
    farm(60);
    G.ensurePerfume();
    assert.ok(G.applyBestPerfume());
    const pid = G.startPerfume();
    assert.ok(pid);
    // Progression hors-ligne : 2 heures plus tard, la macération est terminée
    T += 2 * 3600 * 1000;
    assert.equal(G.perfumeOffline(), 1);
    assert.ok(G.bottlePerfume(0));
    const p = G.perfumeOf(pid);

    // On crée une commande du Salon qui correspond exactement à ce parfum
    state.perfume.orders = [{ id: 'po1', vid: 'rose', family: p.family, minStars: 1, conc: null, qty: 1 }];
    assert.equal(G.perfumeOrdersReady(), 1);
    const matches = G.perfumeOrderMatches(state.perfume.orders[0]);
    assert.ok(matches.some(x => x.id === pid));
    const moneyBefore = state.money;
    assert.ok(G.deliverPerfumeOrder('po1', pid));
    assert.ok(state.money > moneyBefore);
    assert.equal(state.stats.perfumeOrders, 1);
    assert.equal(state.perfume.orders.length, 0);

    // Orgue : dès 6 découvertes, 1 palier est réclamable
    state.perfume.organ = { lemon: true, orange: true, lavender: true, tiare: true, resin: true, vanilla: true };
    assert.equal(G.organClaimable(), 1);
    assert.ok(G.claimOrgan());
    assert.equal(G.organClaimable(), 0);

    // Ancienne sauvegarde sans state.perfume
    delete state.perfume;
    assert.ok(G.ensurePerfume());
    assert.equal(G.myPerfumes().length, 0);
});

test('1.143 : gestes de soin au choix, valeur non cumulée, ruban unique, signature, cadeaux, coffre, prestige, Livre et succès', async () => {
    farm(100);
    G.ensurePerfume();
    G.setPerfumeNote('head', 'lemon');
    G.setPerfumeNote('heart', 'lavender');
    G.setPerfumeNote('base', 'resin');
    G.setPerfumeMethod('enfleurage');
    G.setPerfumeConc('extrait');

    // 1. Trois soins profonds -> touche Grand Sillage (+54 %) et valeur stable à la recréation
    const pid = G.startPerfume();
    assert.ok(pid);
    for (let s = 0; s < STAGES.length; s++) {
        assert.ok(G.carePerfumeVat(0, 'deep'));
        T = state.perfume.vats[0].stageUntil + 1000;
        G.perfumeTick();
    }
    assert.ok(G.bottlePerfume(0));
    const valOnce = G.perfumeOf(pid).value;
    assert.equal(G.perfumeOf(pid).touch, 'deep');

    // On recrée exactement le même parfum avec 3 soins profonds : la valeur ne doit PAS exploser !
    const pid2 = G.startPerfume();
    assert.equal(pid2, pid);
    for (let s = 0; s < STAGES.length; s++) {
        assert.ok(G.carePerfumeVat(0, 'deep'));
        T = state.perfume.vats[0].stageUntil + 1000;
        G.perfumeTick();
    }
    assert.ok(G.bottlePerfume(0));
    assert.equal(G.perfumeOf(pid).value, valOnce, 'la valeur ne doit pas se multiplier en boucle');

    // 2. Parfum signature -> +15 % au Salon (3★) et +1 amitié en cadeau
    const o = { id: 'poSig', vid: 'rose', family: G.perfumeOf(pid).family, minStars: 2, conc: null, qty: 1 };
    const payNoSig = G.perfumeOrderPay(o, pid);
    const giftNoSig = G.perfumeGiftPts('rose', pid);
    assert.ok(G.setPerfumeSignature(pid));
    assert.equal(G.perfumeSignature().id, pid);
    assert.ok(G.perfumeOrderPay(o, pid) > payNoSig, 'la signature augmente le prix du Salon');
    assert.ok(G.perfumeGiftPts('rose', pid) > giftNoSig, 'la signature augmente les points de cadeau');

    // 3. Cadeau aux villageois
    G.ensureVillagers();
    const stockBeforeGift = G.perfumeStock(pid);
    assert.ok(G.giftPerfume('rose', pid));
    assert.equal(G.perfumeStock(pid), stockBeforeGift - 1);
    assert.equal(state.stats.perfumeGifts, 1);
    assert.equal(G.giftPerfume('rose', pid), false, 'un seul cadeau par jour');

    // 4. Coffre-fort : dépôt et reprise d'un flacon
    const stockBeforeVault = G.perfumeStock(pid);
    assert.ok(G.vaultPutPerfume(pid));
    assert.equal(G.perfumeStock(pid), stockBeforeVault - 1);
    const vIdx = G.vaultList().findIndex(s => s && s.kind === 'perfume' && s.pf.pid === pid);
    assert.ok(vIdx >= 0);
    assert.ok(G.vaultSlotValue(G.vaultList()[vIdx]) > 0);
    assert.ok(G.vaultTake(vIdx));
    assert.equal(G.perfumeStock(pid), stockBeforeVault);

    // 5. Revenus Parfumerie dans Statistiques + Livre de la ferme (page Parfums) + Succès
    assert.ok(G.sellPerfume(pid, 1));
    assert.ok(state.income.perfume > 0);
    const stats = G.statsData();
    assert.ok(
        stats.sources.some(([label, val]) => label === 'Parfumerie' && val > 0),
        'Parfumerie dans origine des pièces',
    );
    const pfPage = G.BOOK.find(p => p.id === 'perfumes');
    assert.ok(pfPage, 'page Parfums dans le Livre de la ferme');
    const pfEntries = pfPage.entries();
    assert.equal(pfEntries.length, 1);
    const fiche = G.entryInfo(pfEntries[0].key);
    assert.ok(fiche && fiche.found && fiche.lines.some(([k]) => k === 'Touche'));

    const { ACHIEVEMENTS } = await import('../../src/data/meta.js');
    assert.ok(ACHIEVEMENTS.some(a => a.id === 'perfumes'));
    assert.ok(ACHIEVEMENTS.some(a => a.id === 'perfumeOrders'));

    // 6. Orgue complet (99 → 16 paliers de 6) avec 2 paliers en attente : un seul ruban accordé !
    const P = state.perfume;
    P.organ = {};
    for (const id of Object.keys(PERFUME_NOTES)) P.organ[id] = true;
    for (const f of ['hesperide', 'aromatique', 'floral', 'boise', 'oriental', 'gourmand', 'boreal']) P.organ['F:' + f] = true;
    for (const c of PERFUME_CLASSICS) P.organ['C:' + c.id] = true;
    assert.equal(G.organTotal(), 99);
    P.organClaimed = 14; // 2 paliers en attente (15e et 16e sur 16)
    P.organRibbon = false;
    const rubBefore = state.prestige.rubans;
    assert.equal(G.organClaimable(), 2);
    assert.ok(G.claimOrgan());
    assert.ok(G.claimOrgan());
    assert.equal(state.prestige.rubans, rubBefore + 1, 'un seul ruban pour Orgue complet');

    // 7. Nouveaux Grands Classiques (1.144, 1.153 & 1.176)
    assert.equal(G.perfumeClassic('bitterOrange', 'orangeBlossomWater', 'solidOak')?.id, 'cologne');
    assert.equal(G.perfumeClassic('citron', 'blackcurrant', 'patchouli')?.id, 'chypre');
    assert.equal(G.perfumeClassic('lemongrass', 'waterLily', 'honey')?.id, 'etang');
    assert.equal(G.perfumeClassic('thyme', 'ginger', 'cinnamon')?.id, 'epices');
    assert.equal(G.perfumeClassic('yuzu', 'lotus', 'ginkgo')?.id, 'jardinsAsie');

    // 8. Prestige : conserve créations, Orgue et signature, vide stock/dame-jeannes/commandes
    state.stats.earnedRun = 1000000;
    assert.ok(G.doPrestige());
    assert.ok(state.perfume && state.perfume.creations[pid], 'créations conservées au prestige');
    assert.equal(state.perfume.signature, pid, 'signature conservée au prestige');
    assert.equal(G.perfumeStock(pid), 0, 'stock vidé au prestige');
    assert.equal(state.perfume.vats.length, 0, 'dame-jeannes vidées au prestige');
});

test('1.146 : ponts vers Train, Avion-cargo, Mamie Odette, Grand Défi, Défi éclair et Saison des parfums', async () => {
    const { DEFIS, MINI } = await import('../../src/data/defis.js');
    const { FARM_SEASONS, FARM_SEASON_DEFIS, FARM_SEASON_MS } = await import('../../src/data/port.js');
    farm(80);
    // On cale l'horloge sur « La saison des parfums » et la chapelle rénovée
    const idxParf = FARM_SEASONS.findIndex(s => s.id === 'parfums');
    T = (FARM_SEASONS.length * 10 + idxParf) * FARM_SEASON_MS + 3600e3;
    state.projects.chapel = { done: true };
    state.projects.station = { done: true };
    G.ensureFarmSeason();
    assert.equal(G.farmSeasonTheme().id, 'parfums');
    assert.ok(FARM_SEASON_DEFIS.parfums.includes('salonParfums'));

    // Création et mise en flacon -> marque des points pour La saison des parfums !
    G.ensurePerfume();
    G.setPerfumeNote('head', 'lemon');
    G.setPerfumeNote('heart', 'lavender');
    G.setPerfumeNote('base', 'resin');
    G.setPerfumeMethod('enfleurage');
    G.setPerfumeConc('extrait');
    const pid = G.startPerfume();
    T += 2 * 3600 * 1000;
    G.perfumeOffline();
    const ptsBefore = state.fseason.pts;
    assert.ok(G.bottlePerfume(0));
    assert.ok(state.fseason.pts > ptsBefore, 'la mise en flacon marque des points de saison');

    // 1. Train de marchandises : wagon de parfums maison
    assert.equal(G.pfTransportOk(), true);
    const req = { family: G.perfumeOf(pid).family, minStars: 2 };
    assert.ok(G.pfHave(req) >= 5);
    assert.ok(G.pfReqTxt(req).includes('Parfum'));
    state.truck = {
        status: 'here',
        expiresAt: T + 3600e3,
        slots: [
            { id: 'perfumeCustom', pf: req, qty: 2, mult: 1.5, loaded: false, gold: 1000, xp: 50, mat: null },
            { id: 'wheat', qty: 1, loaded: true, gold: 10, xp: 5, mat: null },
            { id: 'wheat', qty: 1, loaded: true, gold: 10, xp: 5, mat: null },
        ],
        gold: 500,
        xp: 20,
    };
    assert.equal(G.slotHave(state.truck.slots[0]), true);
    const stockBeforeTrain = G.perfumeStock(pid);
    const moneyBeforeTrain = state.money;
    assert.ok(G.loadSlot(0));
    assert.equal(G.perfumeStock(pid), stockBeforeTrain - 2);
    assert.ok(state.money > moneyBeforeTrain);

    // 2. Avion-cargo : soute de parfums maison
    state.cargo = {
        k: Math.floor(T / (48 * 3600e3)),
        holds: [{ id: 'perfumeCustom', pf: req, qty: 2, got: 0, est: 900 }],
        done: false,
    };
    const stockBeforeCargo = G.perfumeStock(pid);
    if (G.cargoHere()) {
        assert.ok(G.loadHold(0, null, 1));
        assert.equal(G.perfumeStock(pid), stockBeforeCargo - 1);
    } else {
        // même hors créneau cargo, pullPf fonctionne directement
        assert.ok(G.pullPf(req, 1) > 0);
        assert.equal(G.perfumeStock(pid), stockBeforeCargo - 1);
    }

    // 3. Mamie Odette : parfum maison comme création de la semaine
    assert.ok(G.mamieChoices().includes('perf:' + pid));
    state.mamie = { w: G.mamieWeek(), id: 'perf:' + pid, n: 0 };
    assert.equal(G.mamieInfo().perf, true);
    assert.equal(G.mamieStock(), G.perfumeStock(pid));
    assert.ok(G.mamiePay(1) > 0);
    const stockBeforeMamie = G.perfumeStock(pid);
    assert.ok(G.deliverMamie(null, 1));
    assert.equal(G.perfumeStock(pid), stockBeforeMamie - 1);
    assert.equal(G.mamieMade(), 1);

    // 4. Grand Défi « Le Grand Salon des Parfums » + présentation au jury + Défi éclair
    assert.ok(DEFIS.salonParfums);
    assert.ok(MINI.list.some(m => m.id === 'perfumes'));
    assert.equal(G.defiEligible('salonParfums'), true);
    const d = G.startDefi('salonParfums');
    assert.equal(d.id, 'salonParfums');
    const stepIdx = d.steps.findIndex(st => st.kind === 'perfume');
    assert.ok(stepIdx >= 0);
    assert.equal(G.canPresent(d.steps[stepIdx]), true);
    assert.ok(G.presentDefi(stepIdx, pid));
    assert.equal(d.steps[stepIdx].done, true);
    assert.equal(d.steps[stepIdx].who, G.perfumeOf(pid).name);
});

test('UI et documentation en jeu (1.146) : actions, onglet, barre des niveaux, guide, changelog et stats', async () => {
    const viewSrc = readFileSync(new URL('../../src/ui/views/perfume.js', import.meta.url), 'utf8');
    const appSrc = readFileSync(new URL('../../src/ui/app.js', import.meta.url), 'utf8');
    for (const act of ['perfPick', 'perfSet', 'perfMethod', 'perfConc', 'perfBottle', 'perfCap', 'perfBest', 'perfStart', 'carePerf', 'bottlePerf', 'sellPerf', 'perfSign', 'perfOrder', 'perfOrganClaim']) {
        assert.match(viewSrc, new RegExp(`\\n {8}${act}: `), `action ${act} dans views/perfume.js`);
    }
    assert.ok(appSrc.includes("['perfume', 'Parfums'"), 'onglet Parfums enregistré dans Atelier');
    assert.ok(appSrc.includes("'machines/perfume': 'perfume'"), 'aide contextuelle branchée');

    const ver = readFileSync(new URL('../../VERSION', import.meta.url), 'utf8').trim();
    const { CHANGELOG } = await import('../../src/data/changelog.js');
    const { GUIDE_PAGES } = await import('../../src/data/guide.js');
    assert.equal(CHANGELOG[0].v, ver);
    assert.ok(
        G.unlocksAt(PERFUME_LVL).some(u => /Atelier du Parfumeur/.test(u.name)),
        'Atelier du Parfumeur dans la barre des niveaux (54)',
    );
    assert.ok(GUIDE_PAGES.some(p => p.id === 'perfume'), 'page guide perfume présente');
    assert.equal(PERFUME_CLASSICS.length, 11);
});
