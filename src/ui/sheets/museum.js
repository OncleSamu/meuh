// 1.172 : Le Musée de la vallée (accessible dans Menu › Collections › Musée) —
// 4 ailes (32 pièces), atelier de géodes, vente des doublons, paliers et bonus permanents.
import { state } from '../../core/state.js';
import { fmt } from '../../core/format.js';
import { ITEMS } from '../../data/items.js';
import { GEODES, GEODE_IDS } from '../../data/mine.js';
import { MUSEUM_LVL, MUSEUM_WINGS, MUSEUM_RARITIES, MUSEUM_EXHIBITS, MUSEUM_EXHIBIT_IDS, MUSEUM_BY_WING, MUSEUM_MILESTONES, MUSEUM_SHOP_GEODE } from '../../data/museum.js';
import * as G from '../../systems/index.js';
import { actions } from '../dom.js';
import { ico, art } from '../icons.js';
import { btn, bar, segmented, section, timer } from '../kit.js';
import { ui, go } from '../app.js';
import { defineSheet, closeAll } from '../sheets.js';

function curatorCard() {
    const done = G.museumDonatedCount(),
        tot = MUSEUM_EXHIBIT_IDS.length;
    const ready = G.museumDonateReady();
    const quote = ready
        ? `Splendide ! Vous avez ${ready} nouvelle${ready > 1 ? 's' : ''} pièce${ready > 1 ? 's' : ''} à exposer dans nos vitrines !`
        : done >= tot
          ? 'Toutes nos vitrines brillent de mille feux ! Le Musée de la vallée est entré dans l’histoire.'
          : done > 0
            ? 'Chaque fossile, cristal ou relique éclaire le passé de notre vallée. Continuez d’explorer la mine !'
            : 'Bienvenue au Musée ! Explorez la mine souterraine (Ferme › Nature) pour déterrer vos premières pièces et géodes.';
    return `<div class="card ms-curator">
        <span class="ms-curator-art">${art('ui', 'curatorAnatole')}</span>
        <div class="card-main">
            <div class="card-title">Professeur Anatole · ${done} / ${tot} pièces</div>
            <p class="card-sub">${quote}</p>
            ${bar(done / tot, 'thin')}
            <div class="actions wrap ap-acts">
                ${ready ? btn(`Tout donner (${ready})`, { act: 'msDonateAll', kind: 'green', size: 'sm', icon: ['ui', 'museum'] }) : ''}
                ${btn('Aller à la mine', { act: 'msGoMine', kind: 'gold', size: 'sm', icon: ['ui', 'mineDeep'] })}
            </div>
        </div>
    </div>`;
}

function wingsTab() {
    const curWing = MUSEUM_WINGS.some(w => w.id === ui.sel.msWing) ? ui.sel.msWing : MUSEUM_WINGS[0].id;
    const wDef = MUSEUM_WINGS.find(w => w.id === curWing);
    const wingBtns = `<div class="ms-wings">${MUSEUM_WINGS.map(w => {
        const n = G.museumWingCount(w.id),
            tot = MUSEUM_BY_WING[w.id].length;
        const pct = G.museumWingBonusPct(w.id);
        const readyInWing = MUSEUM_BY_WING[w.id].filter(id => !G.museumHasDonated(id) && G.museumBagCount(id) > 0).length;
        return `<button class="ms-wing-btn${w.id === curWing ? ' on' : ''}" data-act="msWing" data-id="${w.id}">
            ${ico(['ui', w.icon], 'ico big')}<div><b>${w.name}</b><small>${n}/${tot}${pct ? ` · +${pct}%` : ''}</small></div>
            ${readyInWing ? `<span class="ms-tag">+${readyInWing}</span>` : ''}</button>`;
    }).join('')}</div>`;

    const ids = MUSEUM_BY_WING[curWing];
    const grid = `<div class="ms-grid">${ids
        .map(id => {
            const ex = MUSEUM_EXHIBITS[id];
            const donated = G.museumHasDonated(id);
            const bag = G.museumBagCount(id);
            const ready = !donated && bag > 0;
            const known = donated || bag > 0;
            const rar = MUSEUM_RARITIES[ex.rarity];
            const cls = `ms-case${donated ? ' donated' : ''}${ready ? ' ready' : ''}${!known ? ' unknown' : ''}`;
            return `<button class="${cls}" data-act="msPick" data-id="${id}">
                <span class="ms-rar" style="background:${rar.color}">${ex.rarity}</span>
                ${ready ? '<span class="ms-tag">Donner</span>' : bag > 0 ? `<span class="ms-tag">×${bag}</span>` : ''}
                <span class="ms-case-art">${art('ui', id)}</span>
                <b>${known ? ex.name : '???'}</b>
                <small>${donated ? 'Exposé' : ready ? 'En poche !' : ex.source.split('·')[0].trim()}</small>
            </button>`;
        })
        .join('')}</div>`;

    const selId = ui.sel.msEx && MUSEUM_EXHIBITS[ui.sel.msEx] && MUSEUM_EXHIBITS[ui.sel.msEx].wing === curWing ? ui.sel.msEx : null;
    let detail = '';
    if (selId) {
        const ex = MUSEUM_EXHIBITS[selId];
        const donated = G.museumHasDonated(selId),
            bag = G.museumBagCount(selId),
            known = donated || bag > 0;
        const rar = MUSEUM_RARITIES[ex.rarity];
        detail = `<div class="card ms-detail"><div class="card-head">
            <span class="oa-up-art" style="${known ? '' : 'filter:brightness(0) opacity(.25)'}">${art('ui', selId)}</span>
            <div class="card-main">
                <div class="card-title">${known ? ex.name : 'Pièce non découverte'} <span class="chip" style="background:${rar.color};color:#fff">${rar.name}</span></div>
                <div class="card-sub"><b>Où la trouver :</b> ${ex.source}</div>
                <p class="card-sub">${known ? `« ${ex.note} » — Prof. Anatole` : 'Creusez la mine ou ouvrez des géodes pour la découvrir.'}</p>
                <div class="actions wrap ap-acts">
                    ${!donated && bag > 0 ? btn(`Donner au Musée (+${ex.xp} XP)`, { act: 'msDonate', data: { id: selId }, kind: 'green', size: 'sm', icon: ['ui', 'museum'] }) : ''}
                    ${donated ? `<span class="chip ok">Exposé · doublon vaut ${fmt(ex.sell)} p.</span>` : ''}
                </div>
            </div>
        </div></div>`;
    }

    const wingBonus = G.museumWingBonusPct(curWing);
    const wingHead = `<p class="card-sub center"><b>${wDef.name}</b> — ${wDef.desc} Bonus : <b>+${wingBonus}%</b> ${wDef.bonusName.toLowerCase()} (palier à 4 : +${wDef.halfPct}%, complet à 8 : +${wDef.fullPct}%).</p>`;
    return wingBtns + wingHead + grid + detail;
}

function geodesTab() {
    const M = G.ensureMuseum();
    const bag = (state.mineDeep && state.mineDeep.geodes) || {};
    const rows = GEODE_IDS.map(id => {
        const g = GEODES[id];
        const n = bag[id] || 0;
        const can = n > 0 && state.money >= g.crackCost;
        return `<div class="ms-geode-row${n ? '' : ' empty'}">
            <span class="ms-geode-art">${art('ui', g.icon)}</span>
            <div class="card-main">
                <div class="card-title">${g.name} · <b>${n}</b></div>
                <div class="card-sub">${g.desc}</div>
                <div class="actions wrap ap-acts">
                    ${btn(`Ouvrir (${fmt(g.crackCost)} p.)`, { act: 'msCrack', data: { id }, kind: can ? 'gold' : '', size: 'sm', disabled: !can })}
                    ${n > 1 ? btn(`Tout ouvrir (${n})`, { act: 'msCrackAll', data: { id }, kind: can ? 'green' : '', size: 'sm', disabled: !can }) : ''}
                </div>
            </div>
        </div>`;
    }).join('');

    const last = M.lastCrack
        ? `<div class="card"><div class="card-head"><span class="oa-up-art">${art(M.lastCrack.icon[0], M.lastCrack.icon[1])}</span><div class="card-main"><div class="card-title">Dernière ouverture : ${M.lastCrack.name}${M.lastCrack.qty ? ` ×${M.lastCrack.qty}` : ''}</div><div class="card-sub">${M.lastCrack.kind === 'specimen' ? (M.lastCrack.isNew ? 'Nouveau spécimen à exposer dans les vitrines !' : 'Déjà au Musée : revendable ci-dessous.') : 'Ajouté directement dans votre grange !'}</div></div></div></div>`
        : '';

    const dupes = G.museumDupeList();
    const dupeVal = G.museumDupeValue();
    const dupeCard = `<div class="card"><div class="card-title">Doublons en poche</div>
        <div class="card-sub">${dupes.length ? `${dupes.reduce((a, x) => a + x.n, 0)} spécimen(s) en double d’une valeur totale de <b>${fmt(dupeVal)} pièces</b>.` : 'Aucun doublon à revendre pour l’instant.'}</div>
        ${dupes.length ? `<div class="actions wrap ap-acts">${btn(`Vendre les doublons (+${fmt(dupeVal)} p.)`, { act: 'msSellDupes', kind: 'gold', size: 'sm', icon: ['ui', 'coin'] })}</div>` : ''}</div>`;

    const shopId = G.museumShopGeodeId();
    const shopDef = GEODES[shopId];
    const shopPrice = MUSEUM_SHOP_GEODE.prices[shopId];
    const shopLeft = G.museumShopLeft();
    const shopCard = `<div class="card"><div class="card-head"><span class="oa-up-art">${art('ui', shopDef.icon)}</span><div class="card-main">
        <div class="card-title">Géode mystère du jour · ${shopDef.name}</div>
        <div class="card-sub">Une géode de votre strate maximale disponible chaque jour chez Anatole.</div>
        <div class="actions wrap ap-acts">${btn(shopLeft ? `Acheter (${fmt(shopPrice)} p.)` : 'Déjà prise aujourd’hui', { act: 'msBuyGeode', kind: shopLeft && state.money >= shopPrice ? 'green' : '', size: 'sm', icon: ['ui', 'coin'], disabled: !shopLeft || state.money < shopPrice })}</div>
    </div></div></div>`;

    const totalGeodes = GEODE_IDS.reduce((a, id) => a + (bag[id] || 0), 0);
    const totalCost = GEODE_IDS.reduce((a, id) => a + (bag[id] || 0) * GEODES[id].crackCost, 0);
    const crackAllTop =
        totalGeodes > 1
            ? `<div class="actions wrap ap-acts" style="margin:6px 0 10px">${btn(`Tout casser (${totalGeodes} géodes · ${fmt(totalCost)} p.)`, { act: 'msCrackEvery', kind: 'green', wide: true, icon: ['ui', 'geodeCrystal'] })}</div>`
            : '';

    return last + section('Atelier de géodes', `<small class="o-count small">${M.geodesCracked || 0} ouvertes</small>`) + crackAllTop + rows + dupeCard + shopCard;
}

function bonusesTab() {
    const M = G.ensureMuseum();
    const done = G.museumDonatedCount();
    const bonusRows = MUSEUM_WINGS.map(w => {
        const n = G.museumWingCount(w.id),
            tot = MUSEUM_BY_WING[w.id].length,
            pct = G.museumWingBonusPct(w.id);
        return `<div class="ms-bonus-row">
            <span>${ico(['ui', w.icon])} <b>${w.name}</b> <small>(${n}/${tot})</small><br><small>${w.bonusName}</small></span>
            <span class="chip${pct ? ' ok' : ''}">+${pct} %</span>
        </div>`;
    }).join('');

    const miles = MUSEUM_MILESTONES.map(m => {
        const claimed = !!(M.claimed && M.claimed[m.at]);
        const ready = done >= m.at && !claimed;
        const rew = [`${fmt(m.coins)} p.`, `+${fmt(m.xp)} XP`, m.rubans ? `+${m.rubans} ruban${m.rubans > 1 ? 's' : ''}` : '', m.deco ? '1 déco rare' : '']
            .filter(Boolean)
            .join(' · ');
        return `<div class="ms-mile${claimed ? ' done' : ''}${ready ? ' ready' : ''}">
            ${ico(['ui', m.deco || 'museum'], 'ico big')}
            <div class="card-main"><b>${m.at} pièces · ${m.label}</b><div class="card-sub">${rew}</div></div>
            ${claimed ? '<span class="chip">Reçu</span>' : ready ? btn('Prendre', { act: 'msClaim', data: { at: m.at }, kind: 'green', size: 'sm' }) : `<span class="chip">${done}/${m.at}</span>`}
        </div>`;
    }).join('');

    return section('Bonus permanents des ailes') + `<div class="card">${bonusRows}</div>` + section('Paliers de récompenses') + miles;
}

function expedTab() {
    const M = G.ensureMuseum();
    if (!G.museumExpedOpen()) {
        return `<div class="card"><p class="card-sub">La <b>Grande Aile des Expéditions</b> s’ouvre dès que vous avez donné au moins <b>${G.MUSEUM_EXPED_MIN} pièces</b> au Musée (${G.museumDonatedCount()}/${G.MUSEUM_EXPED_MIN}). Anatole vous y confiera des missions répétables pour valoriser vos minerais et géodes en trop !</p></div>`;
    }
    const active = G.museumExpedState();
    const activeCard = active
        ? (() => {
              const def = G.MUSEUM_EXPEDITIONS.find(x => x.id === active.id);
              const ready = G.museumExpedReady();
              return `<div class="card ms-last">
                  ${ico(['ui', 'museum'], 'ico big')}
                  <div class="card-main">
                      <b>${def ? def.name : 'Expédition en cours'}${ready ? ' · Terminée !' : ''}</b>
                      <div class="card-sub">${ready ? 'Anatole est rentré avec le butin !' : `Retour dans ${timer(active.back, 'b')}`}</div>
                  </div>
                  ${ready ? btn('Récolter', { act: 'msClaimExped', kind: 'gold', size: 'sm', icon: ['ui', 'star'] }) : ''}
              </div>`;
          })()
        : '';
    const rows = G.MUSEUM_EXPEDITIONS.map(e => {
        const can = G.museumCanStartExped(e.id);
        const costParts = Object.entries(e.cost).map(([k, n]) => `${ITEMS[k]?.name || k} ×${n} (${state.inventory[k] || 0})`);
        if (e.geode && GEODES[e.geode]) {
            const haveG = (state.mineDeep && state.mineDeep.geodes && state.mineDeep.geodes[e.geode]) || 0;
            costParts.push(`${GEODES[e.geode].name} ×1 (${haveG})`);
        }
        const rewards = [`${fmt(e.coins)} p.`, `+${fmt(e.xp)} XP`, `+${e.renom} Renom`, `+${e.gemQty} gemmes`];
        if (e.packs) rewards.push(`+${e.packs} booster${e.packs > 1 ? 's' : ''} MeuhCG`);
        if (e.rubanChance) rewards.push('25 % chance Ruban');
        return `<div class="ms-mile${can ? ' ready' : ''}">
            ${ico(['ui', e.geode || 'museum'], 'ico big')}
            <div class="card-main">
                <b>${e.name} · ${e.time / 3600} h</b>
                <div class="card-sub">${e.desc}</div>
                <div class="card-sub">Coût : ${costParts.join(' · ')}</div>
                <div class="card-sub">Gain : ${rewards.join(' · ')}</div>
            </div>
            ${btn('Lancer', { act: 'msStartExped', data: { id: e.id }, kind: can ? 'green' : '', size: 'sm', disabled: !can })}
        </div>`;
    }).join('');
    return activeCard + section('Grande Aile des Expéditions', `<small class="o-count small">${M.expedDone || 0} réussie${(M.expedDone || 0) > 1 ? 's' : ''}</small>`) + rows;
}

defineSheet('museum', {
    title: `${ico(['ui', 'museum'])}Le Musée de la vallée`,
    cls: 'ms-sheet',
    render() {
        G.ensureMuseum();
        if (!G.museumOpen()) {
            return `<div class="card ms-curator"><span class="ms-curator-art">${art('ui', 'curatorAnatole')}</span><div class="card-main"><div class="card-title">Bientôt ouvert !</div><p class="card-sub">Le Musée de la vallée ouvre ses portes au niveau ${MUSEUM_LVL}, en même temps que la mine souterraine.</p></div></div>`;
        }
        const tab = ['wings', 'geodes', 'exped', 'bonuses'].includes(ui.sel.msTab) ? ui.sel.msTab : 'wings';
        const tabs = segmented(
            [
                ['wings', 'Vitrines', ['ui', 'museum'], G.museumDonateReady()],
                ['geodes', 'Géodes', ['ui', 'geodeAmethyst'], G.museumGeodeTotal()],
                ['exped', 'Expéditions', ['ui', 'pickaxe'], G.museumExpedReady() ? 1 : 0],
                ['bonuses', 'Paliers', ['ui', 'star'], G.museumClaimableMilestones().length],
            ],
            tab,
            'msTab',
        );
        return curatorCard() + tabs + (tab === 'geodes' ? geodesTab() : tab === 'exped' ? expedTab() : tab === 'bonuses' ? bonusesTab() : wingsTab());
    },
});

export function setupMuseum() {
    actions({
        msTab: (el, d) => {
            ui.sel.msTab = d.v;
        },
        msWing: (el, d) => {
            ui.sel.msWing = d.id;
            ui.sel.msEx = null;
        },
        msPick: (el, d) => {
            ui.sel.msEx = ui.sel.msEx === d.id ? null : d.id;
        },
        msDonate: (el, d) => G.museumDonate(d.id, el),
        msDonateAll: el => G.museumDonateAll(el),
        msCrack: (el, d) => G.museumCrackGeode(d.id, el),
        msCrackAll: (el, d) => G.museumCrackAllGeodes(d.id, el),
        msCrackEvery: el => G.museumCrackEveryGeode(el),
        msSellDupes: el => G.museumSellDupes(el),
        msBuyGeode: el => G.museumBuyGeode(el),
        msClaim: (el, d) => G.museumClaimMilestone(+d.at, el),
        msStartExped: (el, d) => G.museumStartExped(d.id, el),
        msClaimExped: el => G.museumClaimExped(el),
        msGoMine: () => {
            ui.sel.natTab = 'deep';
            closeAll();
            go('farm/nature');
        },
    });
}
