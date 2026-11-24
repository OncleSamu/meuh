// 1.174 : Cap sur le niveau 100 (étirement 40 -> 100) et Arbre de compétences visuel à 3 ailes (108 rangs / 99 pts).
import test from 'node:test';
import assert from 'node:assert/strict';
import { memStore } from './helpers.mjs';
import { state, setStore, ecoLvl, scaleLvl, SAVE_KEY } from '../../src/core/state.js';
import { setView } from '../../src/core/view.js';
import { setClock } from '../../src/core/clock.js';
import * as G from '../../src/systems/index.js';
import { MAX_LEVEL, MAX_LEVEL_80, PRESTIGE_LVL, ALBUM_LEVELS, CAP_REQ } from '../../src/data/progress.js';
import { lv100, lv100Hi, oldLvl80, WIDTH100, MAX_100 } from '../../src/data/lv100.js';
import { SKILL_WINGS, SKILLS } from '../../src/data/meta.js';
import { SPR } from '../../src/art/index.js';
import { ITEMS } from '../../src/data/items.js';
import { MACHINES, RECIPES } from '../../src/data/machines.js';
import { OASIS } from '../../src/data/oasis.js';
import { NORD } from '../../src/data/nord.js';
import { ASIE } from '../../src/data/asie.js';
import { MINE_STRATA } from '../../src/data/mine.js';
import { TRAPS } from '../../src/data/fishing.js';
import { TEAM_LINA } from '../../src/data/team.js';

const setNow = t => setClock(() => t);

function fresh(lvl = 100) {
    setStore(memStore());
    setNow(1_700_000_000_000);
    G.loadGame();
    setView({ started: false, tab: 'farm' });
    state.tutorial.done = true;
    state.level = lvl;
    state.money = 100_000_000;
    state.skills = {};
}

test('1.174 : table lv100 / oldLvl80 / ecoLvl cohérente, 1..39 intacts, 40..80 étirés sur 40..100', () => {
    assert.equal(MAX_LEVEL, 100);
    assert.equal(MAX_100, 100);
    assert.equal(MAX_LEVEL_80, 80);
    assert.equal(PRESTIGE_LVL, 100);
    assert.equal(ALBUM_LEVELS.at(-1), 100);

    for (let l = 1; l <= 39; l++) {
        assert.equal(lv100(l), l, `niv ${l}`);
        assert.equal(oldLvl80(l), l, `oldLvl80(${l})`);
    }
    for (let l = 40; l <= 80; l++) {
        assert.ok(WIDTH100[l] >= 1 && WIDTH100[l] <= 10, `WIDTH100[${l}]`);
        assert.equal(lv100(l), lv100Hi(l - 1) + 1, `continuité ${l}`);
        assert.equal(oldLvl80(lv100(l)), l, `inverse ${l}`);
    }
    assert.equal(lv100Hi(80), 100);
    assert.equal(oldLvl80(100), 80);

    // Contrées & grandes étapes étalées sans saturation au 80 ni au 100
    assert.equal(OASIS.lvl, 76);
    assert.equal(NORD.lvl, 83);
    assert.equal(ASIE.lvl, 91);
    assert.equal(MINE_STRATA[3].lvl, 60);
    assert.equal(MACHINES.wok.reqLvl, 91);
    assert.equal(MACHINES.steamer.reqLvl, 94);
    assert.equal(MACHINES.wagashi.reqLvl, 97);

    // Économie conservée sur l'ancienne échelle
    fresh(100);
    assert.equal(ecoLvl(), 64);
    assert.ok(scaleLvl() > 38 && scaleLvl() < 41);
    let prevEco = 0;
    for (let l = 1; l <= 100; l++) {
        state.level = l;
        assert.ok(ecoLvl() >= prevEco, `ecoLvl monotone au niv ${l}`);
        prevEco = ecoLvl();
    }
});

test('1.174 : courbe XP 1..39 inchangée, pente progressive 40..99, sauvegarde niv. 80 préservée au niv. 80', () => {
    for (let l = 2; l < 30; l++) assert.equal(G.getXpReq(l), G.getXpReq64(l), `niv ${l}`);
    for (let l = 2; l < 100; l++) assert.ok(G.getXpReq(l) > G.getXpReq(l - 1), `xp croissant niv ${l}`);
    // Pente quadratique post-40 : les derniers niveaux demandent nettement plus que le 40
    assert.ok(G.getXpReq(99) > G.getXpReq(40) * 2.5, 'pente soutenue jusqu’au 99');

    // Une sauvegarde existante au niveau 80 (avec lv1109: true) reste exactement au niveau 80
    const st = memStore();
    setStore(st);
    G.loadGame();
    state.level = 80;
    state.xp = 1234;
    state.lv1109 = true;
    st.setItem(SAVE_KEY, JSON.stringify(state));
    G.loadGame();
    assert.equal(state.level, 80, 'une sauvegarde existante niv. 80 reste au niv. 80');
    assert.equal(state.xp, 1234);
});

test('1.174 : Arbre de compétences à 3 ailes, 11 branches, 108 rangs pour 99 points, icônes SVG valides', () => {
    assert.equal(SKILL_WINGS.length, 3);
    const wingBranches = SKILL_WINGS.flatMap(w => w.branches);
    assert.equal(wingBranches.length, Object.keys(SKILLS).length);
    assert.equal(wingBranches.length, 11);
    assert.equal(G.skillsTotalCap(), 108);

    for (const w of SKILL_WINGS) {
        assert.ok(w.id && w.name && w.color && w.glow);
        for (const bid of w.branches) {
            const br = SKILLS[bid];
            assert.ok(br, `branche ${bid}`);
            assert.equal(br.wing, w.id, `wing de ${bid}`);
            // Au moins un keystone (cap) par branche
            assert.ok(br.list.some(sk => sk.cap), `keystone dans ${bid}`);
            for (const sk of br.list) {
                assert.ok(sk.id && sk.name && sk.max >= 1);
                if (sk.req) {
                    const reqs = Array.isArray(sk.req) ? sk.req : [sk.req];
                    for (const rid of reqs) assert.ok(br.list.some(x => x.id === rid), `prérequis ${rid} dans ${bid}`);
                }
                // Vérifie que chaque icône renvoie un SVG valide
                const [kind, key] = sk.icon;
                const svg =
                    kind === 'item'
                        ? SPR.item(key)
                        : kind === 'animal'
                          ? SPR.animal(key)
                          : kind === 'machine'
                            ? SPR.machine(key)
                            : kind === 'villager'
                              ? SPR.villager(key)
                              : kind === 'star'
                                ? SPR.ui('star')
                                : SPR.ui(key);
                assert.ok(svg && svg.includes('<svg') && !svg.includes('undefined') && !svg.includes('NaN'), `icône ${sk.id}`);
            }
        }
    }
});

test('1.174 : prérequis ramifiés (skillReq) et plafond de points au niveau 100', () => {
    fresh(100);
    assert.equal(G.skillPoints(), 99);

    // En Agriculture : green -> (bounty ET expert en parallèle) -> midas (keystone, requiert CAP_REQ pts + 1 parent)
    assert.equal(G.skillReq('agri', 0), null); // green ouvert
    assert.ok(G.skillReq('agri', 1)); // bounty verrouillé avant green
    assert.ok(G.skillReq('agri', 2)); // expert verrouillé avant green
    assert.ok(G.skillReq('agri', 3)); // midas verrouillé

    assert.equal(G.learnSkill('agri', 0), true); // green rang 1
    // Les DEUX sous-nœuds (bounty & expert) se débloquent en parallèle !
    assert.equal(G.skillReq('agri', 1), null, 'bounty débloqué après green');
    assert.equal(G.skillReq('agri', 2), null, 'expert débloqué après green sans avoir besoin de bounty');
    assert.ok(G.skillReq('agri', 3), 'midas encore verrouillé avant CAP_REQ et parent');

    // On apprend uniquement expert (index 2) + 2 rangs de green = CAP_REQ (4) pts au total -> midas débloqué !
    assert.equal(G.learnSkill('agri', 2), true); // expert 1 (total 2)
    assert.equal(G.learnSkill('agri', 0), true); // green 2 (total 3)
    assert.equal(G.learnSkill('agri', 0), true); // green 3 (total 4)
    assert.equal(G.branchSpent('agri'), CAP_REQ);
    assert.equal(G.skillReq('agri', 3), null, 'midas débloqué via expert seul + CAP_REQ pts dans la branche');
    assert.equal(G.learnSkill('agri', 3), true);
    assert.equal(G.rank('midas'), 1);
    assert.equal(G.skillPoints(), 99 - (CAP_REQ + 1));
});

test('1.174 : effets réels des 13 nouvelles compétences (Pêche, Équipe & Domaine, Mine & Musée, Asie)', () => {
    fresh(100);

    // 1. Pêche : fishPrice (+8 %/rang) & netFast (-8 %/rang)
    const troutBase = G.sellPrice('trout');
    state.skills.fishPrice = 3;
    assert.ok(G.sellPrice('trout') > troutBase, 'fishPrice augmente le prix des poissons');

    G.ensurePond();
    const trap = { spot: 'bank', bait: null, start: 1_700_000_000_000 - Math.round(TRAPS.every * 0.8) };
    state.skills.netFast = 0;
    assert.equal(G.trapReady(trap), false, 'nasse pas encore prête à 80 % sans netFast');
    state.skills.netFast = 3;
    assert.equal(G.trapReady(trap), true, 'netFast (3 rangs = -24 %) rend la nasse prête à 80 %');

    // 2. Domaine & Équipe : teamSpeed, steward (+2 parcelles Théo, +1 recette Henri)
    G.ensureTeam();
    state.grid.forEach(p => (p.isUnlocked = true));
    state.farmhand.lvl = 2;
    state.team.henri.lvl = 1;
    const theoPlotsBase = G.handZone().length;
    const henriSlotsBase = G.henriMaxSlots();
    state.skills.steward = 1;
    assert.equal(G.handZone().length, theoPlotsBase + 2, 'steward donne +2 parcelles à Théo');
    assert.equal(G.henriMaxSlots(), henriSlotsBase + 1, 'steward donne +1 recette à Henri');

    // teamSpeed : réduit la cadence (10 %/rang -> -30 % au rang 3)
    state.team.lina.lvl = 1;
    const baseEvery = TEAM_LINA[1].every;
    const fastEvery = Math.max(4, Math.round(baseEvery * 0.7));
    state.team.lina.t = fastEvery - 1;
    state.skills.teamSpeed = 0;
    G.teamTick();
    assert.equal(state.team.lina.t, fastEvery, 'sans teamSpeed, Lina continue de compter');
    state.team.lina.t = fastEvery - 1;
    state.skills.teamSpeed = 3;
    G.teamTick();
    assert.equal(state.team.lina.t, 0, 'avec teamSpeed rang 3, Lina déclenche sa passe à -30 %');

    // 3. Contrées : riceGrow (+6 %/rang sur terrasses d'Asie)
    state.projects.asiaSluice = { given: {}, done: true };
    G.ensureAsie();
    state.seeds.lotus = 5;
    G.plantAsie(0, 'lotus');
    state.skills.riceGrow = 0;
    state.asie.plots[0].prog = 0;
    for (let k = 0; k < 20; k++) G.asieTick();
    const progBase = state.asie.plots[0].prog;
    state.skills.riceGrow = 3;
    state.asie.plots[0].prog = 0;
    for (let k = 0; k < 20; k++) G.asieTick();
    assert.ok(state.asie.plots[0].prog > progBase, 'riceGrow accélère les terrasses d’Asie');

    // 4. Mine & Musée : lanternEco (-10 % temps de recharge/rang), archMaster (×2 doublons Musée)
    G.ensureMineDeep();
    G.ensureMuseum();
    state.skills.lanternEco = 0;
    const regenBase = G.mineRegenSec();
    state.skills.lanternEco = 3;
    assert.ok(G.mineRegenSec() < regenBase, 'lanternEco accélère la recharge de la lanterne');

    G.museumAddSpecimen('msAmmonite', 2, null, true);
    state.skills.archMaster = 0;
    const dupBase = G.museumDupeValue();
    state.skills.archMaster = 1;
    assert.equal(G.museumDupeValue(), dupBase * 2, 'archMaster double la valeur des doublons du Musée');

    // 5. Maître de chai (cellarMaster) réduit la durée de vieillissement en cave
    G.ensureCave();
    state.skills.cellarMaster = 0;
    const caveBase = G.caveStep('redWine');
    state.skills.cellarMaster = 3;
    assert.ok(G.caveStep('redWine') < caveBase, 'cellarMaster accélère la cave');
});

test('1.174 : aucune recette ni plante au-delà du niveau 100', () => {
    for (const r of Object.values(RECIPES)) assert.ok(r.lvl >= 1 && r.lvl <= 100, r.id);
    for (const it of Object.values(ITEMS)) assert.ok((it.reqLvl || 0) <= 100, it.id);
});
