// Animaux | Refuge (1.181) : Le Refuge & Clinique Vétérinaire.
// 4 sous-onglets propres : Soins | Faune | Boutique | Palmarès.

import { fmt } from '../../core/format.js';
import { emit } from '../../core/bus.js';
import {
    REFUGE_LVL,
    WILD_SPECIES,
    WILD_BY_ID,
    WILD_RARITY_LABELS,
    WILD_SPECIES_SPEED_PER,
    REMEDY_BY_ID,
    REFUGE_SHOP,
} from '../../data/refuge.js';
import { ITEMS } from '../../data/items.js';
import * as G from '../../systems/index.js';
import { blocks, actions, esc } from '../dom.js';
import { ico, art } from '../icons.js';
import { btn, hint, section, costRow, timer, segmented } from '../kit.js';
import { defineView } from '../app.js';
import { openVetMini } from '../vetmini.js';

let subTab = 'care'; // 'care' | 'fauna' | 'shop' | 'palmares'

function patientPortrait(p) {
    if (p.kind === 'wild') return art('ui', 'wild_' + p.species);
    return art('animal', p.animalType);
}

function topStrip() {
    const hearts = G.refugeHearts();
    const healed = G.refugeTotalHealed();
    const vitMs = G.refugeVitalityLeftMs();
    const balms = G.refugeBreedBalmCount();
    const claimable = G.refugePalmState().filter(t => t.canClaim).length;

    const pills = [
        `<span class="chip rf-heart-chip">${ico(['ui', 'vetHeart'])}<b>${fmt(hearts)}</b> Cœur${hearts > 1 ? 's' : ''}</span>`,
        `<span class="chip">${ico(['ui', 'refuge'])}${fmt(healed)} soin${healed > 1 ? 's' : ''}</span>`,
        `<span class="chip">${ico(['ui', 'wild_faon'])}${G.refugeWildCountText()} faune</span>`,
        vitMs > 0 ? `<span class="chip rf-buff">${ico(['ui', 'vetHeart'])}Vitalité ${timer(Date.now() + vitMs)}</span>` : '',
        balms > 0 ? `<span class="chip rf-buff">${ico(['ui', 'sparkle'])}${balms} Baume${balms > 1 ? 's' : ''}</span>` : '',
    ]
        .filter(Boolean)
        .join('');

    const tabs = segmented(
        [
            ['care', 'Soins'],
            ['fauna', 'Faune'],
            ['shop', 'Boutique'],
            ['palmares', claimable ? `Palmarès +${claimable}` : 'Palmarès'],
        ],
        subTab,
        'rfSub',
    );
    return `<div class="rf-top-strip">${pills}</div>${tabs}`;
}

function clinicCard() {
    const def = G.refugeDef();
    const next = G.refugeNext();
    const pts = G.refugePatients().length;
    const nextMs = G.refugeNextPatientMs();
    const waitTxt = pts < def.beds && nextMs > 0 ? ` · prochain patient dans ${timer(Date.now() + nextMs)}` : pts >= def.beds ? ' · tous les lits occupés' : '';
    const up = next
        ? `${costRow(G.costParts(next.cost))}${btn(`Agrandir : ${next.beds} lits`, { act: 'rfUp', kind: 'green', size: 'sm', disabled: !G.refugeCanUp() })}`
        : '<small>Sanctuaire au niveau maximum.</small>';
    return `<div class="card rf-head">
        <div class="card-art">${ico(['ui', 'refuge'], 'ico big')}</div>
        <div class="card-main">
            <div class="card-title">${def.name}</div>
            <div class="card-sub">${pts}/${def.beds} lits occupés · niveau ${def.lvl}/3${waitTxt}</div>
            <div class="rf-up">${up}</div>
        </div>
    </div>`;
}

function basketsBlock() {
    const list = G.refugeBaskets();
    if (!list.length) return '';
    return `${section(`Paniers de la faune reconnaissante (${list.length})`)}
        <div class="rf-list">${list
            .map(b => {
                const sp = WILD_BY_ID[b.species];
                const it = ITEMS[b.item];
                return `<div class="card rf-basket">
                    <div class="rf-pic sm">${art('ui', 'wild_' + b.species)}</div>
                    <div class="card-main">
                        <div class="card-title">${sp ? sp.name : 'Visiteur sauvage'}</div>
                        <div class="card-sub">Remerciement : +${b.qty} ${it ? it.name.toLowerCase() : b.item} · +${fmt(b.coins)} pièces</div>
                    </div>
                    ${btn('Récolter', { act: 'rfBasket', data: { id: b.id }, kind: 'gold', size: 'sm' })}
                </div>`;
            })
            .join('')}</div>`;
}

function patientCard(p) {
    const rem = REMEDY_BY_ID[p.remedy];
    const subTag =
        p.kind === 'wild'
            ? `${WILD_RARITY_LABELS[p.rarity] || 'Sauvage'} · ${p.habitat}${!G.refugeSeen()[p.species] ? ' · Nouveau !' : ''}`
            : `${p.title} · adoptable après guérison`;

    let bodyActs = '';
    if (p.phase === 'waiting') {
        const mode = G.canGiveRefugeRemedy(p.uid);
        bodyActs = `<div class="rf-step">
            <div class="card-sub">${ico(rem.icon)}<b>${rem.name}</b> · ${G.remedyCostText(p.remedy)}</div>
            ${btn(mode === 'items' ? 'Donner le remède' : 'Acheter & donner le remède', {
                act: 'rfRemedy',
                data: { uid: p.uid },
                kind: 'gold',
                wide: true,
                size: 'sm',
                disabled: !mode,
            })}
        </div>`;
    } else if (p.phase === 'ready') {
        bodyActs = `<div class="rf-acts">
            ${btn('Soigner (mini-jeu)', { act: 'rfMini', data: { uid: p.uid }, kind: 'green', size: 'sm' })}
            ${btn('Soin calme', { act: 'rfCalm', data: { uid: p.uid }, kind: 'gold', size: 'sm' })}
        </div>`;
    } else {
        const starTxt = `${p.stars} étoile${p.stars > 1 ? 's' : ''}`;
        if (p.kind === 'wild') {
            bodyActs = `<div class="rf-step">
                <div class="card-sub">Guéri (${starTxt}) : prêt à retrouver la vallée !</div>
                ${btn('Relâcher dans la vallée', { act: 'rfRelease', data: { uid: p.uid }, kind: 'green', wide: true, size: 'sm', icon: ['ui', 'vetHeart'] })}
            </div>`;
        } else {
            bodyActs = `<div class="rf-step">
                <div class="card-sub">Guéri (${starTxt})${p.stars >= 3 ? ' · Robe rare à l’adoption !' : ''}</div>
                <div class="rf-acts">
                    ${btn('Adopter au pré', { act: 'rfAdopt', data: { uid: p.uid }, kind: 'green', size: 'sm' })}
                    ${btn('Rendre (+2 Cœurs)', { act: 'rfReturn', data: { uid: p.uid }, kind: 'gold', size: 'sm' })}
                </div>
            </div>`;
        }
    }

    return `<div class="card rf-patient ph-${p.phase}">
        <div class="rf-pat-top">
            <div class="rf-pic">${patientPortrait(p)}</div>
            <div class="card-main">
                <div class="card-sub">${subTag}</div>
                <div class="card-title">${esc(p.name)}</div>
                <div class="card-sub">Symptôme : <b>${p.symptom}</b></div>
            </div>
        </div>
        ${bodyActs}
    </div>`;
}

function careTab() {
    const list = G.refugePatients();
    const cards = list.length
        ? `<div class="rf-list">${list.map(patientCard).join('')}</div>`
        : `<div class="card"><p class="card-sub">Tous les patients sont repartis ! Le prochain arrive bientôt (ou utilisez « Appel de la forêt » en Boutique).</p></div>`;
    return `${clinicCard()}${basketsBlock()}${section(`Patients au Refuge (${list.length}/${G.refugeDef().beds})`)}${cards}
        ${hint('Soignez les animaux blessés avec vos herbes, miels et récoltes (ou via la pharmacie). Le mini-jeu d’auscultation donne jusqu’à +50 % de récompenses et garantit une robe rare si vous adoptez un animal de ferme recueilli.')}`;
}

function faunaTab() {
    const seen = G.refugeSeen();
    const count = G.refugeSpeciesCount();
    const speedPct = (count * WILD_SPECIES_SPEED_PER * 100).toFixed(1).replace('.', ',');
    const grid = WILD_SPECIES.map(sp => {
        const n = seen[sp.id] || 0;
        const ok = n > 0;
        return `<div class="card rf-wild${ok ? ' seen' : ' none'}">
            <div class="rf-wild-pic">${art('ui', 'wild_' + sp.id)}</div>
            <div class="rf-wild-name">${ok ? sp.name : 'Espèce inconnue'}</div>
            <small>${WILD_RARITY_LABELS[sp.rarity]}${ok ? ` · ×${n}` : ''}</small>
            ${ok ? `<small class="rf-hab">${sp.habitat}</small>` : ''}
        </div>`;
    }).join('');
    return `${section(`Carnet de la Faune · ${count}/${WILD_SPECIES.length}`)}
        <div class="card rf-fauna-sum"><div class="card-sub">Bonus permanent actif sur tous vos prés : <b>+${speedPct} % vitesse de production</b> (+1,5 % par espèce découverte). Les espèces relâchées reviennent aussi déposer des paniers de remerciement !</div></div>
        <div class="rf-wild-grid">${grid}</div>`;
}

function shopTab() {
    const hearts = G.refugeHearts();
    const items = REFUGE_SHOP.map(item => {
        const ok = G.canBuyRefugeShop(item.id);
        return `<div class="card rf-shop-card">
            <div class="card-art">${ico(item.icon, 'ico big')}</div>
            <div class="card-main">
                <div class="card-title">${item.name}</div>
                <div class="card-sub">${item.desc}</div>
            </div>
            ${btn(`${item.cost}`, {
                act: 'rfBuy',
                data: { id: item.id },
                icon: ['ui', 'vetHeart'],
                kind: ok ? 'gold' : '',
                size: 'sm',
                disabled: !ok,
            })}
        </div>`;
    }).join('');
    return `${section(`Boutique de Bienveillance · ${fmt(hearts)} Cœur${hearts > 1 ? 's' : ''}`)}
        <div class="rf-list">${items}</div>
        ${hint('Les Cœurs de Bienveillance se gagnent à chaque animal secouru et via les paliers du Palmarès Vétérinaire. Ils sont conservés au Prestige.')}`;
}

function palmaresTab() {
    const palm = G.refugePalmTotals();
    const sp = G.refugeSpeciesCount();
    const tiers = G.refugePalmState();
    const summary = `<div class="card rf-powers">
        <div class="card-title">${ico(['ui', 'vetHeart'])}Protection & bonus actifs</div>
        <ul class="rf-pow-list">
            <li><b>Résistance maladies</b> : -${Math.round(palm.sickResist * 100)} % risque sur toute la ferme${G.refugeVitalityOn() ? ' (immunité totale active !)' : ''}.</li>
            <li><b>Soins au pré</b> : ${G.refugeFreeCure() ? 'gratuits !' : 'tarif normal (gratuits dès le palier 2).'}</li>
            <li><b>Production animale</b> : +${Math.round((sp * WILD_SPECIES_SPEED_PER + palm.speed) * 100)} % vitesse · +${Math.round(palm.qual * 100)} % chance qualité supérieure.</li>
        </ul>
    </div>`;
    const list = tiers
        .map(t => {
            const pct = Math.min(100, Math.round((t.healed / t.need) * 100));
            return `<div class="card rf-tier${t.reached ? ' on' : ''}${t.canClaim ? ' ready' : ''}">
                <div class="rf-tier-head">
                    <div><b>${t.name}</b> <small>(${Math.min(t.healed, t.need)}/${t.need} soins)</small></div>
                    ${
                        t.claimed
                            ? `<span class="chip">${ico(['ui', 'vetHeart'])}Acquis</span>`
                            : t.canClaim
                              ? btn('Réclamer', { act: 'rfClaim', data: { id: t.id }, kind: 'gold', size: 'sm' })
                              : `<span class="chip off">${t.need} soins</span>`
                    }
                </div>
                <div class="rf-tbar"><i style="width:${pct}%"></i></div>
                <div class="card-sub">${t.desc}</div>
                <div class="card-sub">Récompense : +${t.rubans} ruban${t.rubans > 1 ? 's' : ''} · +${t.hearts} Cœurs</div>
            </div>`;
        })
        .join('');
    return `${section('Protection vétérinaire')}${summary}
        ${section('Palmarès Vétérinaire · conservé au Prestige')}<div class="rf-list">${list}</div>`;
}

function renderRefuge(el) {
    if (!G.refugeOpen()) {
        return blocks(el, [
            [
                'closed',
                `<div class="card island-closed"><div class="card-art">${ico(['ui', 'refuge'], 'ico big')}</div><div class="card-title">Le Refuge & Clinique</div><p class="card-sub">S’ouvre au niveau ${REFUGE_LVL} pour recueillir et soigner la faune de la vallée.</p></div>`,
            ],
        ]);
    }
    G.refugeTick();
    const body =
        subTab === 'fauna'
            ? faunaTab()
            : subTab === 'shop'
              ? shopTab()
              : subTab === 'palmares'
                ? palmaresTab()
                : careTab();
    blocks(el, [
        ['top', topStrip()],
        ['body-' + subTab, body],
    ]);
}

defineView('animals/refuge', renderRefuge);

export function setupRefuge() {
    actions({
        rfSub: (el, d) => {
            subTab = d.v;
            emit('changed', 'refuge');
        },
        rfUp: el => G.upgradeRefuge(el),
        rfRemedy: (el, d) => G.giveRefugeRemedy(d.uid, el),
        rfMini: (el, d) => openVetMini(d.uid, el),
        rfCalm: (el, d) => G.finishRefugeCare(d.uid, 0.5, el),
        rfRelease: (el, d) => G.releaseWildPatient(d.uid, el),
        rfAdopt: (el, d) => G.adoptFarmPatient(d.uid, el),
        rfReturn: (el, d) => G.returnFarmPatient(d.uid, el),
        rfBasket: (el, d) => G.collectRefugeBasket(d.id, el),
        rfBuy: (el, d) => G.buyRefugeShop(d.id, el),
        rfClaim: (el, d) => G.claimRefugePalm(d.id, el),
    });
}
