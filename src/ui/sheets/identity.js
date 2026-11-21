// 1.113 : la page d'accueil. On compose son personnage (les mêmes traits que les habitants de la vallée) et on nomme sa ferme.
// 1.151 : atelier visuel (pastilles de couleur directes, galerie cliquable des 151 sprites et partage par code h…).
import { state } from '../../core/state.js';
import * as G from '../../systems/index.js';
import {
    EYES,
    HAIRS,
    SHIRTS,
    SKINS,
    TRAIT_COUNT,
    TRAIT_LABELS,
    TRAIT_NAMES,
    habitantArt,
    idOf,
    isHabitant,
    lookOf,
    randomId,
} from '../../art/habitants.js';
import { actions, esc } from '../dom.js';
import { ui } from '../app.js';
import { ico } from '../icons.js';
import { btn } from '../kit.js';
import { defineSheet, closeSheet, sheetOpts } from '../sheets.js';
import { toast } from '../../core/bus.js';
import { METIERS, METIER_IDS } from '../../data/metiers.js';

const COLOR_TRAITS = [
    ['skin', 'Teint', SKINS],
    ['hairColor', 'Cheveux', HAIRS],
    ['eyeColor', 'Yeux', EYES],
    ['shirt', 'Vêtement', SHIRTS],
];
const SHAPE_TABS = ['hair', 'hat', 'collar', 'extra', 'beard', 'eyes', 'glasses', 'nose'];
const CONTEXT_COLOR = {
    hair: ['hairColor', 'Couleur des cheveux', HAIRS],
    beard: ['hairColor', 'Couleur de barbe', HAIRS],
    eyes: ['eyeColor', 'Couleur des yeux', EYES],
    collar: ['shirt', 'Couleur du vêtement', SHIRTS],
};

const draft = () => {
    if (!ui.sel.me) {
        ui.sel.me = {
            look: G.meLook(),
            farm: G.farmName() === G.DEFAULT_FARM ? '' : G.farmName(),
            tab: 'hair',
        };
    }
    return ui.sel.me;
};
// on garde ce qui est tapé dans le champ nom quand la fenêtre se redessine
const keepName = () => {
    const input = document.getElementById('me-farm');
    if (input && ui.sel.me) ui.sel.me.farm = input.value;
};
const faceSvg = id => `<svg viewBox="0 0 64 64" aria-hidden="true">${habitantArt(id)}</svg>`;
// des chevrons dessinés (les caractères ‹ › ne tombent jamais au centre d'un bouton)
const CHEV = d =>
    `<svg viewBox="0 0 14 14" aria-hidden="true"><path d="${d < 0 ? 'M9 2 L4 7 L9 12' : 'M5 2 L10 7 L5 12'}" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

const swatchesHtml = (t, label, colors, cur) =>
    `<div class="me-pal"><div class="me-pal-h"><b>${label}</b><small>${cur + 1} / ${colors.length}</small></div><div class="me-swatches">${colors
        .map(
            (col, idx) =>
                `<button type="button" class="me-swatch${cur === idx ? ' on' : ''}" data-act="meSet" data-t="${t}" data-v="${idx}" style="background:${col}" aria-label="${label} ${idx + 1}" aria-pressed="${cur === idx}"></button>`,
        )
        .join('')}</div></div>`;

function studioHtml(d) {
    const look = lookOf(d.look);
    const tab = d.tab || 'hair';
    const tabs = [
        `<button type="button" class="me-tab${tab === 'colors' ? ' on' : ''}" data-act="meTab" data-tab="colors">Couleurs</button>`,
        ...SHAPE_TABS.map(
            t =>
                `<button type="button" class="me-tab${tab === t ? ' on' : ''}" data-act="meTab" data-tab="${t}">${TRAIT_NAMES[t]}</button>`,
        ),
    ].join('');

    let panel = '';
    if (tab === 'colors') {
        panel = `<div class="me-pals">${COLOR_TRAITS.map(([t, label, cols]) => swatchesHtml(t, label, cols, look[t])).join('')}</div>`;
    } else {
        const labels = TRAIT_LABELS[tab] || [];
        const cur = look[tab];
        const ctx = CONTEXT_COLOR[tab];
        const bar = `<div class="me-bar"><button type="button" class="me-arrow" data-act="meTrait" data-t="${tab}" data-d="-1" aria-label="${TRAIT_NAMES[tab]} précédent">${CHEV(-1)}</button><span><b>${TRAIT_NAMES[tab]}</b> : ${esc(labels[cur] || `${cur + 1}`)} <small>(${cur + 1}/${TRAIT_COUNT[tab]})</small></span><button type="button" class="me-arrow" data-act="meTrait" data-t="${tab}" data-d="1" aria-label="${TRAIT_NAMES[tab]} suivant">${CHEV(1)}</button></div>`;
        const ctxBar = ctx ? swatchesHtml(ctx[0], ctx[1], ctx[2], look[ctx[0]]) : '';
        const grid = `<div class="me-grid">${labels
            .map((lbl, idx) => {
                const prev = { ...look, [tab]: idx };
                // pour bien voir chaque coiffure même si un chapeau est porté
                if (tab === 'hair' && prev.hat !== 0) prev.hat = 0;
                const on = cur === idx;
                return `<button type="button" class="me-tile${on ? ' on' : ''}" data-act="meSet" data-t="${tab}" data-v="${idx}" aria-pressed="${on}"><span class="me-thumb">${faceSvg(idOf(prev))}</span><small>${esc(lbl)}</small></button>`;
            })
            .join('')}</div>`;
        panel = bar + ctxBar + grid;
    }

    return `<div class="me-tabs" role="tablist">${tabs}</div><div class="me-panel">${panel}</div>`;
}

defineSheet('identity', {
    cls: 'identity-sheet',
    title: o => (o && o.first ? 'Bienvenue à la ferme' : 'Votre carte de visite'),
    open() {
        ui.sel.me = null;
    },
    render(o) {
        const first = !!(o && o.first);
        const d = draft();
        return [
            [
                'head',
                `<p class="card-sub center">${first ? 'Avant de commencer : à quoi ressemblez-vous, et comment s’appelle votre ferme ? Tout se change plus tard dans le menu.' : 'Changez de tête ou de nom quand vous voulez.'}</p>`,
            ],
            [
                'face',
                `<div class="me-face">${faceSvg(d.look)}</div><div class="me-rand">${btn('Au hasard', { act: 'meRandom', size: 'sm' })}${btn('Femme', { act: 'meRandom', data: { o: 'female' }, size: 'sm' })}${btn('Homme', { act: 'meRandom', data: { o: 'male' }, size: 'sm' })}${btn('Âgé', { act: 'meRandom', data: { o: 'old' }, size: 'sm' })}</div>`,
            ],
            ['traits', studioHtml(d)],
            [
                'code',
                `<div class="me-code"><label for="me-code">Code portrait</label><div class="me-code-row"><input type="text" id="me-code" data-input="meCode" value="${esc(d.look)}" maxlength="13" spellcheck="false" autocomplete="off" placeholder="h…">${btn('Copier', { act: 'meCopy', size: 'sm' })}</div><small class="card-sub">Collez un code du Codex pour importer directement un personnage.</small></div>`,
            ],
            [
                'name',
                `<label class="me-name"><span>Le nom de votre ferme</span><input type="text" id="me-farm" maxlength="${G.FARM_NAME_MAX}" placeholder="${esc(G.DEFAULT_FARM)}" value="${esc(d.farm)}" autocomplete="off"></label>`,
            ],
            [
                'metier',
                // 1.137 : à la toute première ouverture, pas de métier à choisir (on ne sait pas encore ce qu'est la ferme) : il se propose au niveau 3, dans le menu
                G.metierId() || (first && state.level < 3)
                    ? ''
                    : `<div class="me-metier"><span class="me-label">La spécialité de votre ferme</span><p class="card-sub">Elle fait mieux payer ses produits, rang après rang. Tout le reste du jeu reste ouvert ; le premier changement est gratuit.</p><div class="me-metiers">${METIER_IDS.map(id => `<button class="me-metier-tile${d.metier === id ? ' on' : ''}" data-act="meMetier" data-id="${id}">${ico(METIERS[id].icon, 'ico big')}<b>${METIERS[id].name}</b></button>`).join('')}</div><p class="card-sub me-metier-desc">${d.metier ? METIERS[d.metier].desc : 'Touchez un métier pour le choisir. Vous pourrez aussi le choisir plus tard, depuis le menu.'}</p></div>`,
            ],
            ['ok', `<div class="me-ok">${btn(first ? 'C’est parti !' : 'Enregistrer', { act: 'meSave', kind: 'green', wide: true })}</div>`],
        ];
    },
});

export function setupIdentity() {
    actions({
        meTab: (el, d) => {
            keepName();
            draft().tab = d.tab;
        },
        meSet: (el, d) => {
            keepName();
            const me = draft(),
                look = lookOf(me.look);
            if (!(d.t in TRAIT_COUNT)) return;
            look[d.t] = +d.v;
            me.look = idOf(look);
        },
        meTrait: (el, d) => {
            keepName();
            const me = draft(),
                look = lookOf(me.look),
                n = TRAIT_COUNT[d.t];
            look[d.t] = (look[d.t] + +d.d + n) % n;
            me.look = idOf(look);
        },
        meRandom: (el, d) => {
            keepName();
            draft().look = randomId(Math.floor(Math.random() * 1e9), d.o ? { [d.o]: true } : {});
        },
        meCode: (el, d) => {
            keepName();
            const val = String(d.value || '')
                .trim()
                .toLowerCase();
            if (isHabitant(val)) {
                const me = draft();
                if (me.look !== val) me.look = val;
            }
        },
        meCopy: () => {
            const code = draft().look;
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard
                    .writeText(code)
                    .then(() => toast(`Code ${code} copié !`, ['villager', code]))
                    .catch(() => toast(`Code : ${code}`, ['villager', code]));
            } else {
                const inp = document.getElementById('me-code');
                if (inp) {
                    inp.select();
                    try {
                        document.execCommand('copy');
                    } catch {
                        /* silencieux */
                    }
                }
                toast(`Code ${code} copié !`, ['villager', code]);
            }
        },
        meSave: () => {
            keepName();
            const me = draft(),
                first = !!(sheetOpts('identity') || {}).first;
            if (!G.setIdentity(me.look, me.farm)) return;
            if (me.metier && !G.metierId()) G.chooseMetier(me.metier);
            ui.sel.me = null;
            closeSheet('identity');
            toast(first ? `Bienvenue à ${G.farmName()} !` : 'Carte de visite enregistrée', ['villager', state.me.look]);
        },
    });
}
