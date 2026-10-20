// 1.19.2 : l'Agenda. Une seule liste de tout ce qui vient et repart : visiteurs, fête, concours.
// Chaque entrée : { id, icon, title, here, at } — `at` est la date (ms) d'arrivée si absent, de départ ou de fin si présent.
import { state } from '../core/state.js';
import { now } from '../core/clock.js';
import { EVENTS } from '../data/world.js';
import { cargoOpen, cargoHere, cargoArrive, cargoLeave } from './cargo.js';
import { armandOpen, armandHere, armandArrive, armandLeave } from './armand.js';
import { merchantOpen } from './merchant.js';
import { trainOpen, balloonOpen } from './orders.js';
import { boatOpen } from './port.js';
import { contestOpen, contestEndsIn } from './contest.js';
import { eventActive, eventIcon, eventEndsIn, nextFete } from './events.js';

const visit = (status, b) => (status === 'here' ? { here: true, at: b.expiresAt } : { here: false, at: b.arriveAt });

export function agenda() {
    const t = now(),
        out = [];
    const add = (id, icon, title, here, at, note = '') => out.push({ id, icon, title, here, at, note });
    if (cargoOpen()) add('cargo', ['ui', 'plane'], 'Avion-cargo', cargoHere(), cargoHere() ? cargoLeave() : cargoArrive(), 'Remplir les soutes');
    if (armandOpen())
        add(
            'armand',
            ['villager', 'armand'],
            'Armand, du Grand Hôtel',
            armandHere(),
            armandHere() ? armandLeave() : armandArrive(),
            'Commande du produit phare',
        );
    if (merchantOpen()) {
        const m = state.merchant;
        add('merchant', ['ui', 'merchant'], 'Zéphyr, marchand ambulant', m.status === 'here', visit(m.status, m).at, 'Au Marché');
    }
    if (trainOpen())
        add(
            'train',
            ['ui', 'trainIcon'],
            'Train de marchandises',
            state.truck.status === 'here',
            visit(state.truck.status, state.truck).at,
            'Charger les wagons',
        );
    if (balloonOpen())
        add(
            'balloon',
            ['ui', 'balloon'],
            'Montgolfière',
            state.balloon.status === 'here',
            visit(state.balloon.status, state.balloon).at,
            'Livrer une commande',
        );
    if (boatOpen() && (state.boat.status === 'here' || state.boat.status === 'away'))
        add('boat', ['ui', 'boat'], 'Bateau de livraison', state.boat.status === 'here', visit(state.boat.status, state.boat).at, 'Charger le cargo');
    if (contestOpen()) add('contest', ['ui', 'podium'], 'Concours de la semaine', true, t + contestEndsIn() * 1000, 'Fin de la semaine');
    if (eventActive()) add('fete', eventIcon(state.event.season), EVENTS[state.event.season].name, true, t + eventEndsIn() * 1000, 'Fin de la fête');
    else {
        const n = nextFete();
        add('fete', eventIcon(n.season.id), EVENTS[n.season.id].name, false, t + n.secs * 1000, 'Prochaine fête');
    }
    // d'abord ce qui est là et repart bientôt, puis ce qui arrive bientôt
    return out.sort((a, b) => b.here - a.here || a.at - b.at);
}
