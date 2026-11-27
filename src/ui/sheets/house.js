// La maison de la ferme : agrandissements, L'Équipe du Domaine (Théo, Lina, Henri, Milo), salon et personnalisation.
import { state } from '../../core/state.js';
import { fmt } from '../../core/format.js';
import { HOUSE, FARMHAND } from '../../data/progress.js';
import { STYLES, STYLE_LVL, STYLE_CHARM } from '../../data/farm.js';
import { ITEMS } from '../../data/items.js';
import { THEO_OPTS, LINA_MODES, MILO_MODES, CAMILLE_MODES, HENRI_TARGET_STEP } from '../../data/team.js';
import * as G from '../../systems/index.js';
import { actions, esc } from '../dom.js';
import { ico, art, SPR } from '../icons.js';
import { btn, costRow } from '../kit.js';
import { defineSheet } from '../sheets.js';
import { innerTabs } from '../innertabs.js';
import { updateScene } from '../scene.js';

const houseArt = l => (G.roofColor() ? SPR.farmhouse(l, G.roofColor()) : art('house', l));

let henriPicking = false;
let henriQuery = '';

function styles() {
    if (state.level < STYLE_LVL)
        return `<div class="card locked"><div class="card-sub">Au niveau ${STYLE_LVL}, personnalisez la clôture, les allées, le toit et la grange. Chaque style acheté compte pour le charme au concours.</div></div>`;
    return `<p class="card-sub">Chaque style acheté rapporte ${STYLE_CHARM} points de charme au concours, pour toujours. Changez à volonté entre les styles déjà achetés.</p>
        ${Object.entries(STYLES)
            .map(
                ([k, g]) =>
                    `<div class="style-group"><div class="card-title">${g.name}</div><div class="chips-row wrap">${g.list
                        .map(([v, name], idx) => {
                            const own = G.styleOwned(k, v),
                                on = G.styleOf(k) === v;
                            const sw =
                                k === 'roof' || k === 'barn'
                                    ? `<i class="sw" style="background:${v === 'auto' ? 'linear-gradient(135deg,#c8453a,#3f6fb5)' : v}"></i>`
                                    : `<i class="sw sw-${k}-${v}"></i>`;
                            return `<button class="style-chip${on ? ' on' : ''}" data-act="style" data-k="${k}" data-v="${v}">${sw}<span>${name}</span>${own ? '' : `<small>${fmt(G.styleCost(idx))}${ico(['ui', 'coin'])}</small>`}</button>`;
                        })
                        .join('')}</div></div>`,
            )
            .join('')}`;
}

function wall() {
    const list = G.wallCandidates(),
        cur = G.wallFish();
    if (!list.length)
        return '<div class="card locked"><div class="card-sub">Pêchez un poisson à l’étang : le plus beau pourra être accroché au mur du salon (+20 de charme au concours).</div></div>';
    return `<div class="card wall-card"><div class="wall-plaque">${cur ? `${art('item', cur.id)}<b>${cur.name}</b><small>${G.kgText(cur.w)}</small>` : '<small>Le mur est vide</small>'}</div>
        <div class="card-sub">Accrochez une prise (son record de poids) : +${G.WALL_CHARM} de charme au concours.</div>
        <div class="wall-picks">${list
            .map(
                f =>
                    `<button class="wall-pick${cur && cur.id === f.id ? ' on' : ''}" data-act="hangFish" data-id="${f.id}" title="${f.name}" aria-label="${f.name}, ${G.kgText(f.w)}">${art('item', f.id)}<small>${G.kgText(f.w)}</small></button>`,
            )
            .join('')}</div></div>`;
}

// ---------------- L'Équipe du Domaine (4 cartes sur un modèle unique) ----------------
function teamCard({ portrait, title, lvl, paused, toggleAct, desc, log, settingHtml, upgradeHtml }) {
    const stateBtn = lvl
        ? `<button type="button" class="tm-state ${paused ? 'off' : 'on'}" data-act="${toggleAct}" aria-pressed="${!paused}">${paused ? 'Pause' : 'Actif'}</button>`
        : '';
    return `<div class="card tm-card${!lvl ? ' locked' : paused ? ' paused' : ''}">
        <div class="tm-top">
            <div class="avatar sm">${art('villager', portrait)}</div>
            <div class="card-main">
                <div class="card-title">${title}${lvl ? `<span class="tm-lvl">Niv. ${lvl}</span>` : ''}</div>
                <div class="card-sub">${desc}</div>
            </div>
            ${stateBtn}
        </div>
        ${lvl && log && !paused ? `<div class="tm-log">${log}</div>` : ''}
        ${lvl && settingHtml ? `<div class="tm-set">${settingHtml}</div>` : ''}
        ${upgradeHtml ? `<div class="tm-up">${upgradeHtml}</div>` : ''}
    </div>`;
}

function upgradeFooter(next, upAct, hireLabel, upLabel, lvl, nextDesc) {
    if (!next) return '<div class="card-sub">Niveau maximum atteint.</div>';
    const label = lvl ? upLabel : hireLabel;
    const locked = state.level < next.lvl;
    return `<div class="card-sub">${lvl ? `Niveau ${lvl + 1}` : `Recrutement (niv. ${next.lvl})`} : ${nextDesc}</div>
        ${locked ? btn(`Niveau ${next.lvl}`, { wide: true, disabled: true, icon: ['ui', 'lock'], size: 'sm' }) : `${costRow(G.costParts(next.cost))}${btn(label, { act: upAct, kind: G.hasCost(next.cost) ? 'green' : '', wide: true, size: 'sm', disabled: !G.hasCost(next.cost) })}`}`;
}

function theoCard() {
    const hl = G.handLvl(),
        hn = G.handNext();
    if (!hl) {
        return teamCard({
            portrait: 'theo',
            title: 'Théo · Champs & Serre',
            lvl: 0,
            desc: 'Réparez le pont du hameau (chapitre 5) : Théo viendra récolter, replanter et arroser votre champ.',
        });
    }
    const ghCan = G.handGhCan(),
        ghOn = G.handGhOn();
    const planCan = G.handPlanCan(),
        planOn = G.handFollowPlanOn();
    const settingHtml = `<div class="tm-checks">
        <button type="button" class="tm-check${ghOn ? ' on' : ''}" data-act="toggleHandGh" ${ghCan ? '' : 'disabled'}>
            <span class="tm-check-box">${ghOn ? '✓' : ''}</span>
            <span class="tm-check-main">Inclure la Serre<small>${ghCan ? 'Récolte et replante aussi les parcelles de la serre' : `Débloqué à Théo niv. ${THEO_OPTS.ghLvl} (avec la serre bâtie)`}</small></span>
        </button>
        <button type="button" class="tm-check${planOn ? ' on' : ''}" data-act="toggleHandPlan" ${planCan ? '' : 'disabled'}>
            <span class="tm-check-box">${planOn ? '✓' : ''}</span>
            <span class="tm-check-main">Suivre le Plan actif<small>${planCan ? 'Sème en priorité les cultures demandées par le Plan en cours' : `Débloqué à Théo niv. ${THEO_OPTS.planLvl}`}</small></span>
        </button>
    </div>`;
    return teamCard({
        portrait: 'theo',
        title: 'Théo · Champs & Serre',
        lvl: hl,
        paused: G.handPaused(),
        toggleAct: 'toggleHand',
        desc: `Toutes les ${FARMHAND[hl].every} s · ${FARMHAND[hl].plots} premières parcelles du champ (récolte, replante, arrose).`,
        log: G.handMessage(),
        settingHtml,
        upgradeHtml: upgradeFooter(hn, 'upgradeHand', 'Recruter Théo', 'Former Théo', hl, hn ? `${hn.plots} parcelles, toutes les ${hn.every} s.` : ''),
    });
}

function linaCard() {
    const l = G.linaLvl(),
        def = G.linaDef(),
        n = G.linaNext();
    const mode = G.linaMode();
    const settingHtml = l
        ? `<div class="tm-modes">${LINA_MODES.map(
              ([k, lbl]) => `<button type="button" class="tm-mode${mode === k ? ' on' : ''}" data-act="linaMode" data-v="${k}">${lbl}</button>`,
          ).join('')}</div>
          <div class="tm-perk${def.heal ? '' : ' muted'}">${def.heal ? 'Auto-soin actif : soigne automatiquement les bêtes malades' : 'Au niveau 4 : soigne aussi automatiquement les bêtes malades'}</div>`
        : '';
    return teamCard({
        portrait: 'lina',
        title: 'Lina · Animaux',
        lvl: l,
        paused: G.linaPaused(),
        toggleAct: 'toggleLina',
        desc: l ? def.desc : 'Nourrit vos bêtes et ramasse leurs productions au pré — et soigne les malades au dernier palier.',
        log: G.linaMessage(),
        settingHtml,
        upgradeHtml: upgradeFooter(n, 'upgradeLina', 'Recruter Lina', 'Former Lina', l, n ? n.desc : ''),
    });
}

function henriPickChips(q) {
    const list = G.henriCandidates(q).slice(0, 24);
    if (!list.length) return '<div class="card-sub">Aucune recette disponible pour cette recherche.</div>';
    return list
        .map(
            r =>
                `<button type="button" class="tm-pick-chip" data-act="henriAdd" data-id="${r.id}">${ico(['item', r.id])}<span>${esc(ITEMS[r.id]?.name || r.id)}</span></button>`,
        )
        .join('');
}

function henriCard() {
    const l = G.henriLvl(),
        def = G.henriDef(),
        n = G.henriNext();
    let settingHtml = '';
    if (l) {
        const rules = G.henriRules();
        const max = G.henriMaxSlots();
        const rows = rules.length
            ? rules
                  .map(rule => {
                      const info = G.henriStockInfo(rule.id);
                      const ok = info.total >= rule.target;
                      return `<div class="tm-rule">
                          <span class="tm-rule-ico">${art('item', rule.id)}</span>
                          <span class="tm-rule-info">
                              <b>${esc(ITEMS[rule.id]?.name || rule.id)}</b>
                              <small class="${ok ? 'ok' : ''}">Stock ${info.inv}${info.queued + info.out ? ` (+${info.queued + info.out} en cours)` : ''} · seuil ${rule.target}</small>
                          </span>
                          <span class="tm-rule-ctrls">
                              <button type="button" class="tm-mini" data-act="henriBump" data-id="${rule.id}" data-d="${-HENRI_TARGET_STEP}" aria-label="Diminuer">-${HENRI_TARGET_STEP}</button>
                              <button type="button" class="tm-mini" data-act="henriBump" data-id="${rule.id}" data-d="${HENRI_TARGET_STEP}" aria-label="Augmenter">+${HENRI_TARGET_STEP}</button>
                              <button type="button" class="tm-mini del" data-act="henriDel" data-id="${rule.id}" aria-label="Retirer">×</button>
                          </span>
                      </div>`;
                  })
                  .join('')
            : '<div class="card-sub">Aucune recette suivie : ajoutez vos bases (Farine, Beurre, Sucre…) pour qu’Henri les maintienne automatiquement.</div>';
        const canAdd = rules.length < max;
        const pickBox =
            henriPicking && canAdd
                ? `<div class="tm-pick-box">
                      <input type="search" class="tm-search" placeholder="Chercher une recette…" value="${esc(henriQuery)}" data-input="henriSearch" aria-label="Chercher une recette">
                      <div class="tm-pick-list" id="tm-henri-opts">${henriPickChips(henriQuery)}</div>
                  </div>`
                : '';
        settingHtml = `<div class="tm-rules">${rows}</div>
            <div class="actions wrap" style="margin-top:6px">
                ${canAdd ? btn(henriPicking ? 'Fermer le choix' : `+ Ajouter une recette (${rules.length}/${max})`, { act: 'henriPickToggle', size: 'sm', kind: henriPicking ? '' : 'gold' }) : `<small class="card-sub">${rules.length} / ${max} recettes maintenues</small>`}
            </div>
            ${pickBox}`;
    }
    return teamCard({
        portrait: 'henri',
        title: 'Henri · Atelier',
        lvl: l,
        paused: G.henriPaused(),
        toggleAct: 'toggleHenri',
        desc: l ? def.desc : 'Maintient 3 à 6 recettes au-dessus de votre seuil de stock, sans jamais ouvrir vos machines une par une.',
        log: G.henriMessage(),
        settingHtml,
        upgradeHtml: upgradeFooter(n, 'upgradeHenri', 'Recruter Henri', 'Former Henri', l, n ? n.desc : ''),
    });
}

function miloCard() {
    const l = G.miloLvl(),
        def = G.miloDef(),
        n = G.miloNext();
    const mode = G.miloMode();
    const settingHtml = l
        ? `<div class="tm-modes">${MILO_MODES.map(
              ([k, lbl]) => `<button type="button" class="tm-mode${mode === k ? ' on' : ''}" data-act="miloMode" data-v="${k}">${lbl}</button>`,
          ).join('')}</div>`
        : '';
    return teamCard({
        portrait: 'milo',
        title: 'Milo · Nature',
        lvl: l,
        paused: G.miloPaused(),
        toggleAct: 'toggleMilo',
        desc: l ? def.desc : 'Relève nasses, filet de mer, ruches, fruits tombés du verger et trouvailles de la forêt.',
        log: G.miloMessage(),
        settingHtml,
        upgradeHtml: upgradeFooter(n, 'upgradeMilo', 'Recruter Milo', 'Former Milo', l, n ? n.desc : ''),
    });
}

function camilleCard() {
    const l = G.camilleLvl(),
        def = G.camilleDef(),
        n = G.camilleNext();
    const mode = G.camilleMode();
    const settingHtml = l
        ? `<div class="tm-modes">${CAMILLE_MODES.map(
              ([k, lbl]) => `<button type="button" class="tm-mode${mode === k ? ' on' : ''}" data-act="camilleMode" data-v="${k}">${lbl}</button>`,
          ).join('')}</div>`
        : '';
    return teamCard({
        portrait: 'camille',
        title: 'Camille · Contrées',
        lvl: l,
        paused: G.camillePaused(),
        toggleAct: 'toggleCamille',
        desc: l ? def.desc : 'Récolte, replante et entretient automatiquement vos contrées lointaines (Île, Oasis, Grand Nord, Terres d’Asie).',
        log: G.camilleMessage(),
        settingHtml,
        upgradeHtml: upgradeFooter(n, 'upgradeCamille', 'Recruter Camille', 'Former Camille', l, n ? n.desc : ''),
    });
}

function teamView() {
    const hired = G.teamHiredCount();
    const active = G.teamActiveCount();
    const anyOn = G.teamAnyActive();
    const master = `<div class="tm-master">
        <div class="tm-master-info">
            <b>L’Équipe du Domaine</b>
            <small>${hired ? `${hired} / 5 en poste · ${active} actif${active > 1 ? 's' : ''}` : 'Tout votre personnel réuni au même endroit'}</small>
        </div>
        ${hired ? btn(anyOn ? 'Tout mettre en pause' : 'Tout activer', { act: 'teamToggleAll', size: 'sm', kind: anyOn ? '' : 'green' }) : ''}
    </div>`;
    return master + theoCard() + linaCard() + henriCard() + miloCard() + camilleCard();
}

defineSheet('house', {
    title: 'Maison de la ferme',
    render() {
        const l = G.houseLvl(),
            n = G.houseNext();
        const levels = HOUSE.slice(1)
            .map(
                (h, k) =>
                    `<div class="hlvl${k + 1 <= l ? ' on' : ''}"><b>${k + 1}</b><span>${h.bonus}</span>${k + 1 <= l ? ico(['ui', 'check']) : `<small>niv. ${h.lvl}</small>`}</div>`,
            )
            .join('');
        const up = n
            ? `<div class="card house-up"><div class="card-title">Prochaine étape : ${n.name}</div><div class="card-sub">${n.bonus}.</div>${costRow(G.costParts(n.cost))}
                ${state.level < n.lvl ? btn(`Niveau ${n.lvl}`, { wide: true, disabled: true, icon: ['ui', 'lock'] }) : btn('Agrandir la maison', { act: 'upgradeHouse', kind: G.hasCost(n.cost) ? 'gold' : '', wide: true, disabled: !G.hasCost(n.cost) })}</div>`
            : '<p class="card-sub center">Votre maison est au plus haut niveau. Bravo !</p>';
        const teamBadge = (G.handCanUp() ? 1 : 0) + G.teamCanUpCount();
        // 1.173 : Maison | Équipe | Salon | Style
        const T = innerTabs(
            'house',
            [
                ['home', 'Maison', null, n && state.level >= n.lvl && G.hasCost(n.cost) ? 1 : 0],
                ['hand', 'Équipe', null, teamBadge],
                ['wall', 'Salon', null, 0],
                ['styles', 'Style', null, 0],
            ],
            'home',
        );
        const t = T.cur;
        return [
            ['tabs', T.html],
            ['art', t === 'home' ? `<div class="house-art">${houseArt(l)}</div><div class="card-title center">${HOUSE[l].name}</div>` : ''],
            ['levels', t === 'home' ? `${up}<div class="hlevels">${levels}</div>` : ''],
            ['hand', t === 'hand' ? teamView() : ''],
            ['wall', t === 'wall' ? wall() : ''],
            ['styles', t === 'styles' ? styles() : ''],
        ];
    },
});

export function setupHouse() {
    actions({
        upgradeHouse: el => G.upgradeHouse(el),
        upgradeHand: el => G.upgradeHand(el),
        toggleHand: () => G.toggleHand(),
        toggleHandGh: () => G.toggleHandGh(),
        toggleHandPlan: () => G.toggleHandFollowPlan(),
        upgradeLina: el => G.upgradeLina(el),
        toggleLina: () => G.toggleLina(),
        linaMode: (el, d) => G.setLinaMode(d.v),
        upgradeHenri: el => G.upgradeHenri(el),
        toggleHenri: () => G.toggleHenri(),
        henriPickToggle: () => {
            henriPicking = !henriPicking;
            if (!henriPicking) henriQuery = '';
        },
        henriSearch: (el, d) => {
            henriQuery = d.value || '';
            const box = document.getElementById('tm-henri-opts');
            if (box) box.innerHTML = henriPickChips(henriQuery);
        },
        henriAdd: (el, d) => {
            if (G.henriAddRule(d.id)) {
                henriQuery = '';
                if (G.henriRules().length >= G.henriMaxSlots()) henriPicking = false;
            }
        },
        henriBump: (el, d) => G.henriBumpTarget(d.id, +d.d),
        henriDel: (el, d) => G.henriRemoveRule(d.id),
        upgradeMilo: el => G.upgradeMilo(el),
        toggleMilo: () => G.toggleMilo(),
        miloMode: (el, d) => G.setMiloMode(d.v),
        upgradeCamille: el => G.upgradeCamille(el),
        toggleCamille: () => G.toggleCamille(),
        camilleMode: (el, d) => G.setCamilleMode(d.v),
        teamToggleAll: () => G.teamToggleAll(),
        hangFish: (el, d) => G.hangFish(d.id),
        style: (el, d) => {
            G.pickStyle(d.k, d.v, el);
            updateScene();
        },
    });
}

