// 1.113 : la page d'accueil. On compose son personnage (les mêmes traits que les habitants de la vallée) et on nomme sa ferme.
// Elle s'ouvre au premier lancement, une fois pour les parties en cours, puis depuis le menu.
import { state } from '../../core/state.js';
import * as G from '../../systems/index.js';
import { TRAITS, TRAIT_COUNT, TRAIT_NAMES, lookOf, idOf, randomId } from '../../art/habitants.js';
import { actions, esc } from '../dom.js';
import { ui } from '../app.js';
import { art } from '../icons.js';
import { btn } from '../kit.js';
import { defineSheet, closeSheet, sheetOpts } from '../sheets.js';
import { toast } from '../../core/bus.js';
import { METIER_IDS } from '../../data/metiers.js';
import { metierPickCard } from './metier.js';

const draft = () => {
    if (!ui.sel.me) ui.sel.me = { look: G.meLook(), farm: G.farmName() === G.DEFAULT_FARM ? '' : G.farmName() };
    return ui.sel.me;
};
// on garde ce qui est tapé dans le champ quand la fenêtre se redessine
const keepName = () => {
    const input = document.getElementById('me-farm');
    if (input && ui.sel.me) ui.sel.me.farm = input.value;
};
const traitRow = (t, look) =>
    `<div class="me-trait"><button class="me-arrow" data-act="meTrait" data-t="${t}" data-d="-1" aria-label="${TRAIT_NAMES[t]} précédent">‹</button><span><b>${TRAIT_NAMES[t]}</b><small>${look[t] + 1} / ${TRAIT_COUNT[t]}</small></span><button class="me-arrow" data-act="meTrait" data-t="${t}" data-d="1" aria-label="${TRAIT_NAMES[t]} suivant">›</button></div>`;

defineSheet('identity', {
    cls: 'identity-sheet',
    title: o => (o && o.first ? 'Bienvenue à la ferme' : 'Votre carte de visite'),
    open() {
        ui.sel.me = null;
    },
    render(o) {
        const first = !!(o && o.first);
        const d = draft(),
            look = lookOf(d.look);
        return [
            [
                'head',
                `<p class="card-sub center">${first ? 'Avant de commencer : à quoi ressemblez-vous, et comment s’appelle votre ferme ? Tout se change plus tard dans le menu.' : 'Changez de tête ou de nom quand vous voulez.'}</p>`,
            ],
            ['face', `<div class="me-face">${art('villager', d.look)}</div><div class="me-rand">${btn('Au hasard', { act: 'meRandom', size: 'sm' })}${btn('Une femme', { act: 'meRandom', data: { o: 'female' }, size: 'sm' })}${btn('Un homme', { act: 'meRandom', data: { o: 'male' }, size: 'sm' })}</div>`],
            ['traits', `<div class="me-traits">${TRAITS.map(t => traitRow(t, look)).join('')}</div>`],
            [
                'name',
                `<label class="me-name"><span>Le nom de votre ferme</span><input type="text" id="me-farm" maxlength="${G.FARM_NAME_MAX}" placeholder="${esc(G.DEFAULT_FARM)}" value="${esc(d.farm)}" autocomplete="off"></label>`,
            ],
            [
                'metier',
                G.metierId()
                    ? ''
                    : `<div class="me-metier"><span class="me-label">La spécialité de votre ferme</span><p class="card-sub">Elle fait mieux payer ses produits, rang après rang. Tout le reste reste jouable, et le premier changement est gratuit.</p>${METIER_IDS.map(id => metierPickCard(id, { act: 'meMetier', sel: d.metier })).join('')}</div>`,
            ],
            ['ok', `<div class="me-ok">${btn(first ? 'C’est parti !' : 'Enregistrer', { act: 'meSave', kind: 'green', wide: true })}</div>`],
        ];
    },
});

export function setupIdentity() {
    actions({
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
