// Les cultures compagnes (1.25) : la carte sous le champ (conseil de Mamie, associations du moment) et le carnet du potager.
import { state } from '../../core/state.js';
import { fmt } from '../../core/format.js';
import { ASSOCS, COMP_LVL, FX_TEXT, isBad } from '../../data/companions.js';
import * as G from '../../systems/index.js';
import { actions, esc } from '../dom.js';
import { ico, art } from '../icons.js';
import { btn, segmented } from '../kit.js';
import { plantRobesTab } from '../sheets/herdbook.js';
import { defineSheet } from '../sheets.js';

const FX_ICON = { p: 'cpPousse', q: 'cpQualite', r: 'cpRecolte', n: 'cpNuisibles', t: 'cpTrio', mp: 'cpMalus', mq: 'cpMalus', mn: 'cpMalus' };
// les dessins d'une association : une culture (ou la première d'une famille) de chaque côté
const side = l => (l === '*' ? `<i class="cp-any">+</i>` : ico(['item', l[0]]));
const pics = a => side(a.a) + side(a.b) + (a.c ? side(a.c) : '');

export function compCard() {
    if (!G.compOpen()) return null;
    const d = G.mamieDefi();
    const a = d && ASSOCS.find(x => x.id === d.id);
    const mamie = a
        ? `<div class="cp-mamie"><span class="cp-av">${art('villager', 'odette')}</span><div class="card-main"><div class="card-title">Le conseil de Mamie</div>
            <div class="card-sub">« Essaie donc l’association “${esc(a.name.toLowerCase())}” : tu verras la différence ! »</div>
            <div class="cp-prog"><span class="cp-pics">${pics(a)}</span><i><u style="width:${Math.round((d.got / d.need) * 100)}%"></u></i><b>${d.got}/${d.need}</b></div>
            <small>Récoltez ${d.need} parcelles qui profitent de cette association.</small></div>
            ${d.claimed ? `<span class="chip">${ico(['ui', 'check'])}Fait</span>` : btn('Récompense', { act: 'claimMamie', kind: 'green', size: 'sm', disabled: !d.done })}</div>`
        : '';
    return mamie ? `<div class="card cp-card">${mamie}</div>` : null;
}

defineSheet('companions', {
    title: 'Le carnet du potager',
    // 1.47 : deux onglets, comme le carnet de l'élevage : les associations et les variétés du labo
    render(o) {
        const tabs = G.plantLabOpen()
            ? segmented(
                  [
                      ['assoc', 'Les associations', ['ui', 'cpCarnet']],
                      ['vars', 'Les variétés', ['ui', 'flowers']],
                  ],
                  o.tab === 'vars' ? 'vars' : 'assoc',
                  'pbTab',
              )
            : '';
        if (tabs && o.tab === 'vars') return tabs + plantRobesTab('crop', o);
        return tabs + assocTab();
    },
});
function assocTab() {
    {
        const c = G.ensureComp();
        const t = G.compNextTier();
        const head = `<p class="card-sub center">Des cultures voisines (gauche, droite, dessus, dessous) s’aident ou se gênent. Une association se découvre en récoltant une parcelle qui en profite… ou qui en souffre.</p>
            <div class="cp-tier">${t ? `<span>Prochaine récompense à <b>${t.n}</b> associations : ${fmt(t.coins)}${ico(['ui', 'coin'])}${t.fert ? ` · ${t.fert}${ico(['item', 'fertilizer'])}` : ''}${t.seeds ? ` · ${t.seeds}${ico(['seed', 'saffron'])}` : ''}${t.ruban ? ` · ${t.ruban}${ico(['ui', 'ribbon'])}` : ''}</span>${btn('Réclamer', { act: 'claimComp', kind: 'green', size: 'sm', disabled: !G.tierReady() })}` : `<span>Carnet complet : bravo !</span>`}</div>`;
        const rows = ASSOCS.map(a => {
            const seen = !!c.seen[a.id],
                lv = G.assocLvl(a);
            if (!seen)
                return `<div class="cp-row unseen"><span class="cp-pics">?</span><div class="cp-txt"><b>Association à découvrir</b><small>${state.level >= lv ? 'Possible dès maintenant' : `Niveau ${lv}`}</small></div></div>`;
            return `<div class="cp-row${isBad(a) ? ' bad' : ''}"><span class="cp-pics">${pics(a)}</span><div class="cp-txt"><b>${esc(a.name)}</b><small>${FX_TEXT[a.fx]}${a.to === 'b' ? ' (pour la voisine)' : ''} · ${esc(a.why)}</small></div><i class="cp-fx">${art('ui', FX_ICON[a.fx])}</i></div>`;
        }).join('');
        return (
            head +
            `<div class="cp-list">${rows}</div><p class="card-sub center">Légumineuses : petits pois, haricots, lentilles, soja. Céréales : blé, maïs, orge, riz, sarrasin. Alliacées : ail, oignon, poireau. Ouvert dès le niveau ${COMP_LVL}, dans le champ et dans la serre ; les bonus d’une parcelle sont plafonnés.</p>`
        );
    }
}

export function setupCompanions() {
    actions({
        claimComp: () => G.claimTier(),
        claimMamie: el => G.claimMamie(el),
    });
}
