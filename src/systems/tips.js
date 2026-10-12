// Mamie Odette présente chaque nouveauté la première fois qu'elle apparaît (une seule fois par partie),
// et « Mes bonus » fait le total de tous les bonus permanents.
import { state } from '../core/state.js';
import { emit } from '../core/bus.js';
import { TIPS } from '../data/texts.js';
import { HOUSE } from '../data/progress.js';
import { speedMult, rank, priceMult } from './player.js';
import { projectDone } from './story.js';
import { housePay, houseBarn, houseLvl, extraOrders, extraStall } from './home.js';
import { barnCap } from './barn.js';
import { goldMasteries } from './mastery.js';

export function tip(id) {
    if (!TIPS[id] || state.tips[id] || !state.tutorial.done) return;
    state.tips[id] = true;
    emit('tip', id);
}

const signed = x => `${x >= 0 ? '+' : ''}${Math.round(x * 100)} %`;
export const bonusValue = v => (typeof v === 'number' ? signed(v) : v);

// [icône, nom, valeur, origine]
export function bonusLines() {
    const r = state.prestige.rubans,
        up = state.upgrades;
    const src = list =>
        list
            .filter(([, v]) => v)
            .map(([n, v]) => `${n} ${bonusValue(v)}`)
            .join(' · ') || 'aucun bonus pour l’instant';
    const crop = speedMult() * (1 + rank('green') * 0.05) - 1,
        anim = speedMult() * (1 + rank('fed') * 0.08) - 1,
        mach = speedMult() - 1;
    const orders = (1 + rank('loyal') * 0.1) * (1 + up.price * 0.04) * (projectDone('townhall') ? 1.1 : 1) * housePay() - 1;
    const magic = ['Engrais magique', up.speed * 0.1],
        rib = ['Rubans', r * 0.03];
    return [
        [['item', 'wheat'], 'Pousse des cultures', crop, src([magic, rib, ['Main verte', rank('green') * 0.05]])],
        [['item', 'egg'], 'Production des animaux', anim, src([magic, rib, ['Bien nourris', rank('fed') * 0.08]])],
        [['machine', 'bakery'], 'Vitesse de l’atelier', mach, src([magic, rib])],
        [
            ['ui', 'scroll'],
            'Commandes',
            orders,
            src([
                ['Client fidèle', rank('loyal') * 0.1],
                ['Négociation', up.price * 0.04],
                ['Mairie', projectDone('townhall') ? 0.1 : 0],
            ]),
        ],
        [['ui', 'trainIcon'], 'Train', rank('logistics') * 0.1, src([['Logisticien', rank('logistics') * 0.1]])],
        [
            ['ui', 'crate'],
            'Prix au marché',
            priceMult() - 1,
            src([
                ['Négociation', up.price * 0.1],
                ['Rubans', r * 0.05],
                ['Bagou', rank('gab') * 0.04],
            ]),
        ],
        [
            ['ui', 'basket'],
            'Double récolte',
            up.yield * 0.1 + rank('bounty') * 0.04,
            src([
                ['Abondance', up.yield * 0.1],
                ['Récolte généreuse', rank('bounty') * 0.04],
            ]),
        ],
        [
            ['item', 'milk'],
            'Double production animale',
            up.yield * 0.1 + rank('pasture') * 0.05,
            src([
                ['Abondance', up.yield * 0.1],
                ['Pâturage fertile', rank('pasture') * 0.05],
            ]),
        ],
        [
            ['ui', 'star'],
            'Qualité argent ou or',
            rank('expert') * 0.05 + Math.min(0.1, r * 0.01),
            src([
                ['Œil d’expert', rank('expert') * 0.05],
                ['Rubans', Math.min(0.1, r * 0.01)],
            ]),
        ],
        [['ui', 'xp'], 'Expérience des livraisons', projectDone('school') ? 0.1 : 0, src([['L’école', projectDone('school') ? 0.1 : 0]])],
        [
            ['ui', 'barn'],
            'Place dans la grange',
            `${barnCap()} places`,
            src([
                ['Agrandissements', state.barn.lvl ? `niveau ${state.barn.lvl + 1}` : 0],
                ['Ponton', projectDone('pontoon') ? '+60' : 0],
                ['Maison', houseBarn() ? `+${houseBarn()}` : 0],
            ]),
        ],
        [
            ['ui', 'house'],
            'Maison et hameau',
            `${HOUSE[houseLvl()].name}`,
            src([
                ['Commandes au tableau', extraOrders() ? `+${extraOrders()}` : 0],
                ['File d’atelier', houseLvl() >= 3 ? '+1' : 0],
                ['Places à l’étal', extraStall() ? `+${extraStall()}` : 0],
                ['Commandes', houseLvl() >= 5 ? '+10 %' : 0],
                ['Moulin et huilerie', projectDone('windmill') ? '+25 % de vitesse' : 0],
                ['Train et montgolfière', projectDone('stud') ? '+15 %' : 0],
                ['Concours', projectDone('bandstand') ? '+25 % de points' : 0],
            ]),
        ],
        [
            ['ui', 'medalG'],
            'Produits maîtrisés en or',
            `${goldMasteries()}`,
            'Chaque étoile de maîtrise : +5 % sur le prix du produit ; l’or le rend 15 % plus rapide.',
        ],
    ];
}
