// Progrès : compétences, prestige (vendre la ferme), défis et fermes à thème.
import { state } from '../../core/state.js';
import { fmt } from '../../core/format.js';
import { SKILLS, CHALLENGES } from '../../data/meta.js';
import { PRESTIGE_LVL, CHALLENGE_BONUS } from '../../data/progress.js';
import { FARM_THEMES } from '../../data/port.js';
import * as G from '../../systems/index.js';
import { actions } from '../dom.js';
import { ico } from '../icons.js';
import { btn, card, pips, section } from '../kit.js';
import { defineSheet, closeAll, sheetOpts } from '../sheets.js';
import { confirmTap } from '../confirm.js';
import { ui } from '../app.js';

function skills() {
    const b = ui.sel.branch || 'agri',
        pts = G.skillPoints();
    return `<div class="card skills-card"><div class="card-head">${ico(['ui', 'skillbook'], 'ico big')}<div class="card-main"><div class="card-title">${pts ? `${pts} point${pts > 1 ? 's' : ''} à placer` : 'Aucun point à placer'}</div>
        <div class="card-sub">Vous gagnez un point à chaque niveau. Les compétences repartent à zéro si vous vendez la ferme.</div></div></div>
        <div class="seg">${Object.entries(SKILLS)
            .map(([id, br]) => `<button class="${id === b ? 'on' : ''}" data-act="branch" data-b="${id}">${ico(br.icon)}<span>${br.name}</span><small>${G.branchSpent(id)}</small></button>`)
            .join('')}</div>
        <div class="tree">${SKILLS[b].list
            .map((sk, k) => {
                const r = G.rank(sk.id),
                    req = G.skillReq(b, k),
                    full = r >= sk.max;
                const can = !full && !req && pts > 0;
                const desc = r ? G.skillDesc(sk, r) + (full ? '.' : `. Prochain rang : ${G.skillDesc(sk, r + 1).toLowerCase()}.`) : G.skillDesc(sk, 1) + '.';
                return `<div class="node${r ? ' learned' : ''}${req ? ' locked' : ''}${sk.cap ? ' cap' : ''}">${ico(sk.icon, 'ico big')}
                <div class="card-main"><div class="card-title">${sk.name}${pips(r, sk.max)}</div><div class="card-sub">${desc}</div>${req ? `<div class="card-sub req">${req}.</div>` : ''}</div>
                ${full ? ico(['ui', 'check']) : btn('Apprendre', { act: 'learn', data: { b, k }, kind: can ? 'green' : '', size: 'sm', disabled: !can })}</div>`;
            })
            .join('')}</div>
        ${G.skillsSpent() ? btn(`Réinitialiser les points · ${fmt(G.respecCost())}${ico(['ui', 'coin'])}`, { act: 'respec', size: 'sm', wide: true }) : ''}</div>`;
}

function challengeCard() {
    const ch = state.challenge && CHALLENGES[state.challenge];
    const done = Object.keys(state.challengesDone).length;
    return card({
        icon: ['ui', 'flag'],
        title: ch ? `Défi en cours : ${ch.name}` : 'Défis de prestige',
        sub: `${ch ? `${ch.desc}. Vendez la ferme pour remporter ${CHALLENGE_BONUS} rubans de plus.` : `Au moment de vendre la ferme, choisissez un défi pour la suivante : réussi, il rapporte ${CHALLENGE_BONUS} rubans de plus.`} ${done}/4 défis réussis.`,
        side: ch ? btn('Abandonner', { act: 'abandon', size: 'sm' }) : '',
    });
}

function prestigeCard() {
    const r = state.prestige.rubans,
        gain = G.rubansGain();
    const can = G.canPrestige();
    return card({
        icon: ['ui', 'ribbon'],
        title: `${r} ruban${r > 1 ? 's' : ''} de concours`,
        sub: `Chaque ruban donne +5 % sur les ventes et +3 % de vitesse, pour toujours. Bonus actuel : +${r * 5} % de ventes, +${r * 3} % de vitesse. ${state.level < PRESTIGE_LVL ? `Vendre la ferme est possible à partir du niveau ${PRESTIGE_LVL}.` : `En vendant maintenant : <b>+${gain} ruban${gain > 1 ? 's' : ''}</b> (selon les pièces gagnées depuis le début de cette ferme).`}`,
        side: btn('Vendre la ferme', { act: 'open', data: { sheet: 'prestige' }, kind: can ? 'red' : '', size: 'sm', disabled: !can }),
    });
}

defineSheet('progress', {
    title: 'Progrès',
    render: () => [
        ['skills', section('Compétences') + skills()],
        ['prestige', section('Prestige') + challengeCard() + prestigeCard()],
    ],
});

// ---------------- vendre la ferme ----------------
defineSheet('prestige', {
    title: 'Vendre la ferme ?',
    open(o) {
        o.ch = '';
        o.theme = state.farmTheme || 'none';
    },
    render(o) {
        const gain = G.prestigeGain();
        const after = state.prestige.rubans + gain;
        return `<p>Vous repartez de zéro sur une nouvelle ferme, avec des rubans de concours qui rendent tout plus rentable.</p>
            <div class="prestige-gain">+${gain}${ico(['ui', 'ribbon'])}</div>
            <p class="card-sub center">${state.challenge ? `Défi « ${CHALLENGES[state.challenge].name} » réussi : ${CHALLENGE_BONUS} rubans en plus. ` : ''}Après : +${after * 5} % de ventes et +${after * 3} % de vitesse.</p>
            <div class="keep-lose"><div class="line ok"><div><b>Vous gardez</b><br>Rubans, succès, amitiés, chien, décorations, village rénové, grange, livre, cave (étagères et cote), statistiques</div></div>
            <div class="line bad"><div><b>Vous perdez</b><br>Pièces, niveau, compétences, champs, serre, animaux, machines, stocks, améliorations</div></div></div>
            <div class="set-title">Défi pour la prochaine ferme (facultatif)</div>
            <div class="choice-list"><button class="choice${o.ch ? '' : ' on'}" data-act="pickChallenge" data-c="">Aucun défi</button>${Object.entries(CHALLENGES)
                .map(
                    ([id, ch]) =>
                        `<button class="choice${o.ch === id ? ' on' : ''}" data-act="pickChallenge" data-c="${id}">${ico(ch.icon)}<span><b>${ch.name}</b>${state.challengesDone[id] ? ' ✓' : ''}<small>${ch.desc}</small></span></button>`,
                )
                .join('')}</div>
            ${
                G.themesOpen()
                    ? `<div class="set-title">Ferme à thème pour la prochaine partie</div><div class="choice-list">${Object.entries(FARM_THEMES)
                          .map(
                              ([id, t]) =>
                                  `<button class="choice${o.theme === id ? ' on' : ''}" data-act="pickTheme" data-t="${id}">${t.icon ? ico(t.icon) : ''}<span><b>${t.name}</b><small>${t.desc}</small></span></button>`,
                          )
                          .join('')}</div>`
                    : ''
            }`;
    },
    foot: () => `<div class="row-btns">${btn('Annuler', { act: 'sheetClose' })}${btn('Vendre', { act: 'doPrestige', kind: 'red' })}</div>`,
});

export function setupProgress() {
    actions({
        branch: (el, d) => (ui.sel.branch = d.b),
        learn: (el, d) => G.learnSkill(d.b, +d.k, el),
        respec: el => confirmTap('respec', el, `Touchez encore : ${fmt(G.respecCost())} pièces`) && G.respecSkills(),
        abandon: el => confirmTap('abandon', el, 'Confirmer ?') && G.abandonChallenge(),
        pickChallenge: (el, d) => (sheetOpts('prestige').ch = d.c),
        pickTheme: (el, d) => (sheetOpts('prestige').theme = d.t),
        doPrestige: () => {
            const o = sheetOpts('prestige');
            closeAll();
            G.doPrestige(o.ch, o.theme);
        },
    });
}
