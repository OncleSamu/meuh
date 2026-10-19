// Les grands moments : niveau gagné, amitié, rénovation, trophée, concours, cadeau du jour, retour d'absence,
// et les bulles d'aide de Mamie Odette. Une seule carte à la fois, dans l'ordre d'arrivée.
import { state } from '../core/state.js';
import { fmt, formatDuration } from '../core/format.js';
import { on, emit } from '../core/bus.js';
import { PROJECTS, VILLAGERS, STORIES } from '../data/village.js';
import { DAILY_REWARDS } from '../data/world.js';
import { TIPS } from '../data/texts.js';
import * as G from '../systems/index.js';
import { byId, patch } from './dom.js';
import { ico, art } from './icons.js';
import { lines, hearts, btn } from './kit.js';
import { confetti } from './fx.js';
import { anySheet } from './sheets.js';

const queue = [];
let current = null;
let refresh = () => {};

const burst = (icon, num = '') =>
    `<div class="burst"><div class="rays"></div><div class="burst-art">${art(icon[0], icon[1])}</div>${num !== '' ? `<b class="burst-num">${num}</b>` : ''}</div>`;

const BUILD = {
    level: l => {
        const un = G.unlocksAt(l);
        return {
            html: `${burst(['ui', 'star'], l)}<h2>Niveau ${l} !</h2><p>${un.length ? 'Nouveautés débloquées :' : 'Votre ferme grandit. Continuez comme ça !'}</p>${lines(un.map(u => [u.icon, u.name]))}`,
            ok: 'Continuer',
            party: true,
        };
    },
    celebrate: c => ({
        html: `${burst(c.icon, c.num ?? '')}<h2>${c.title}</h2>${c.sub ? `<p>${c.sub}</p>` : ''}${lines(c.lines || [])}`,
        ok: 'Continuer',
        party: true,
    }),
    friend: ({ vid, h, r }) => {
        const v = VILLAGERS[vid];
        return {
            html: `<div class="moment-avatar">${art('villager', vid)}</div><h2>${h === 5 ? `${v.name} vous adore !` : `${v.name} vous apprécie`}</h2><div class="hearts-big">${hearts(h)}</div>${lines(G.rewardLines(r))}`,
            ok: 'Merci !',
            party: true,
        };
    },
    story: ({ pid, next, xp, bonus }) => {
        const p = PROJECTS[pid];
        const extra = [];
        if (xp) extra.push([['ui', 'star'], `+${fmt(xp)} d’expérience`]);
        if (bonus) extra.push([['ui', 'coin'], `Chapitre terminé : +${fmt(bonus.coins)} pièces${bonus.ruban ? ' et 1 ruban' : ''}`]);
        return {
            html: `<div class="moment-building">${art('building', pid)}</div><h2>${p.name} : rénovation terminée !</h2>
                <div class="speech"><div class="avatar sm">${art('villager', p.vid)}</div><p>« ${p.after} »</p></div>
                ${lines([[['ui', 'star'], p.reward], ...extra])}${next ? `<p class="sub">${next}</p>` : ''}`,
            ok: 'Continuer',
            party: true,
        };
    },
    storyEnd: ({ vid, coins }) => {
        const S = STORIES[vid];
        return {
            html: `<div class="moment-avatar">${art('villager', vid)}</div><h2>${S.title}</h2><div class="hearts-big">${hearts(5)}</div>
                ${lines([
                    [['villager', vid], `« ${S.end} »`],
                    [['ui', 'coin'], `${fmt(coins)} pièces`],
                    [['ui', 'ribbon'], '1 ruban de concours'],
                ])}`,
            ok: 'Merci !',
            party: true,
        };
    },
    contest: r => ({
        html: `${burst(['ui', r.rank === 1 ? 'trophy' : 'podium'])}<h2>${r.rank === 1 ? 'Vous gagnez le concours !' : `Concours : ${r.rank}e place`}</h2>
            <p>Votre ferme a obtenu ${fmt(r.score)} points cette semaine.</p>
            ${lines([[['ui', 'coin'], `${fmt(r.coins)} pièces`], ...(r.rub ? [[['ui', 'ribbon'], '1 ruban de concours']] : []), ...(r.move ? [[['ui', 'podium'], r.move]] : [])])}`,
        ok: 'Continuer',
        party: true,
    }),
    tip: id => {
        const t = TIPS[id];
        return {
            html: `<div class="tip-head"><div class="avatar">${art('villager', 'odette')}</div><div class="tip-icon">${art(t.icon[0], t.icon[1])}</div></div><h2>${t.title}</h2><p>${t.text}</p>`,
            ok: 'Compris !',
            cls: 'tip',
        };
    },
    offline: r => ({
        html: `<div class="moment-avatar">${art('ui', 'house')}</div><h2>Bon retour !</h2><p>Vous êtes parti ${formatDuration(r.elapsed)} (en vrai). La ferme a continué sans vous :</p>${lines(r.lines)}`,
        ok: 'Au travail !',
    }),
    daily: d => {
        const grid = DAILY_REWARDS.map((r, k) => {
            const day = k + 1,
                cls = day < d.streak ? 'done' : day === d.streak ? 'today' : '';
            const extra = r.seeds ? `${r.seeds[1]}${ico(['seed', r.seeds[0]])}` : `${r.feed}${ico(['item', 'feed'])}`;
            return `<div class="day ${cls}"><small>Jour ${day}</small><i class="day-gift">${art('ui', day < d.streak ? 'check' : 'yield')}</i><b>${fmt(G.dailyCoins(r))}${ico(['ui', 'coin'])}</b><b>+${extra}</b></div>`;
        }).join('');
        return {
            html: `${burst(['ui', 'yield'])}<h2>Cadeau du jour</h2><p>${d.streak > 1 ? `${d.streak} jours de suite, continuez demain pour un cadeau encore plus gros.` : 'Revenez chaque jour pour faire grimper les récompenses.'}</p><div class="daily">${grid}</div>`,
            ok: 'Récupérer',
            act: 'claimDaily',
        };
    },
};

export function pushMoment(type, data, first) {
    if (first) queue.unshift({ type, data });
    else queue.push({ type, data });
    pump();
}

// la carte suivante : les bulles d'aide attendent qu'aucun tiroir ne soit ouvert
export function pump() {
    if (current || !queue.length) return;
    // le cadeau du jour attend la fin du tutoriel : Mamie parle d'abord
    let k = queue.findIndex(m => m.type !== 'tip' && (m.type !== 'daily' || state.tutorial.done));
    if (k < 0) {
        if (anySheet() || !state.tutorial.done) return;
        k = 0;
    }
    const [m] = queue.splice(k, 1);
    show(m);
}

function show(m) {
    current = m;
    const b = BUILD[m.type](m.data);
    const el = byId('moment');
    el.className = `moment ${b.cls || ''}`;
    patch(
        el,
        `<div class="moment-back"></div><div class="moment-card">${b.html}${btn(b.ok, { act: b.act || 'momentOk', kind: 'gold', wide: true, size: 'lg', anchor: 'moment:ok' })}</div>`,
    );
    el.hidden = false;
    requestAnimationFrame(() => el.classList.add('in'));
    emit('sfx', m.type === 'tip' ? 'pop' : 'level');
    if (b.party) {
        emit('buzz', 40);
        confetti();
    }
}

export function closeMoment() {
    const el = byId('moment');
    el.classList.remove('in');
    el.hidden = true;
    el._html = '';
    current = null;
    refresh();
    setTimeout(pump, 250);
}

export const momentShown = () => !!current;

export function setupMoments(onClose) {
    refresh = onClose;
    on('levelUp', l => pushMoment('level', l));
    on('celebrate', c => pushMoment('celebrate', c));
    on('friend', f => pushMoment('friend', f));
    on('story', s => pushMoment('story', s));
    on('storyEnd', s => pushMoment('storyEnd', s));
    on('contestResult', r => pushMoment('contest', r));
    on('tip', id => pushMoment('tip', id));
    on('sheetClosed', () => setTimeout(pump, 300));
}
