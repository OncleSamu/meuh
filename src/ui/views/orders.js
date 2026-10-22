// Village | Commandes : fête de saison, tableau des commandes, acheteur pressé, train, montgolfière, cargo.
import { state, scaleLvl } from '../../core/state.js';
import { fmt, formatDuration, qtyName } from '../../core/format.js';
import { EVENTS } from '../../data/world.js';
import { VILLAGERS } from '../../data/village.js';
import * as G from '../../systems/index.js';
import { PLANT_TRAITS } from '../../data/genetics.js';
import { blocks, actions, esc } from '../dom.js';
import { ITEMS } from '../../data/items.js';
import { ico, art, SPR } from '../icons.js';
import { btn, bar, timer, hint } from '../kit.js';
import { defineView } from '../app.js';
import { defineSheet, openSheet, closeSheet } from '../sheets.js';
import { itemLine, rewardHtml } from './common.js';
import { confirmTap } from '../confirm.js';
import { foldCard, toggleFold } from '../fold.js';
import { defiCard } from './defis.js';
import { rareCard, holidayCard, contractCard, farmSeasonCard, neighborsCard } from './village.js';

// ---------------- la fête de saison ----------------
function eventCard() {
    G.clampAllQuality();
    const e = state.event;
    if (!e || e.ended) {
        const n = G.nextFete(),
            next = n.season;
        return `<div class="card event-card idle" title="${EVENTS[next.id].effect}"><div class="card-ico">${ico(G.eventIcon(next.id), 'ico')}</div><div class="card-main"><div class="card-title">${EVENTS[next.id].name}</div><div class="card-sub">Prochaine fête dans <b>${formatDuration(n.secs)}</b></div></div></div>`;
    }
    const ev = EVENTS[e.season];
    const allClaimed = e.goals.every(x => x.claimed);
    return `<div class="card event-card live">
        <div class="card-head">${ico(G.eventIcon(e.season), 'ico big')}<div class="card-main"><div class="card-title">${ev.name}</div><div class="card-sub">${ev.effect}</div></div>
            <span class="timer-pill">${ico(['ui', 'clock'])}<span>${formatDuration(G.eventEndsIn())}</span></span></div>
        <div class="goals">${e.goals
            .map((x, k) => {
                const done = x.prog >= x.target;
                const can = G.goalCanGive(x);
                const side = x.claimed
                    ? ico(['ui', 'check'])
                    : done
                      ? btn('Réclamer', { act: 'claimGoal', data: { k }, kind: 'gold', size: 'sm' })
                      : x.type === 'deliver' || x.type === 'gold'
                        ? btn('Apporter', { act: 'giveGoal', data: { k }, kind: can ? 'green' : '', size: 'sm', disabled: !can })
                        : '';
                return `<div class="goal-row${x.claimed ? ' claimed' : ''}">${ico(G.goalIcon(x), 'ico big')}
                <div class="card-main"><div class="goal-t">${G.goalText(x)}</div>${bar(x.prog / x.target)}<div class="card-sub">${fmt(x.prog)} / ${fmt(x.target)}</div></div>${side}</div>`;
            })
            .join('')}</div>
        ${e.rewarded ? '<div class="card-sub center">Trophée remporté, bravo !</div>' : btn('Remporter le trophée', { act: 'claimEvent', kind: allClaimed ? 'gold' : '', wide: true, icon: ['ui', 'trophy'], disabled: !allClaimed })}
    </div>`;
}

// ---------------- le tableau des commandes ----------------
// 1.27.1 : les commandes des villageois, repliables comme l'Agenda
function boardCard() {
    G.ensureQuests();
    const open = state.quests.filter(q => G.isOpen(q)),
        ready = open.filter(q => G.checkQuestReady(q)).length;
    const sum = ready ? `${ready} prête${ready > 1 ? 's' : ''} sur ${open.length}` : `${open.length} commande${open.length > 1 ? 's' : ''} · aucune prête`;
    return foldCard('board', ['ui', 'scroll'], 'Villageois', sum, board(), ready > 0);
}

function board() {
    G.ensureQuests();
    const qs = state.quests;
    const tickets = qs
        .map((q, i) => {
            if (!G.isOpen(q)) return `<div class="ticket empty">${ico(['ui', 'clock'])}${timer(q.wait)}</div>`;
            const ready = G.checkQuestReady(q);
            return `<button class="ticket${ready ? ' ready' : ''}${q.pinned ? ' pinned' : ''}" data-act="open" data-sheet="order" data-i="${i}" data-anchor="order:${i}">${q.pinned ? `<i class="t-pin">${art('ui', 'pin')}</i>` : ''}
                <span class="t-who">${art('villager', q.vid)}</span>
                <span class="t-items">${q.items.map(x => `<span class="${state.inventory[x.id] >= x.qty ? 'ok' : ''}">${ico(['item', x.id])}<b>${x.qty}</b></span>`).join('')}</span>
                <span class="t-rew">${fmt(q.gold)}${ico(['ui', 'coin'])}${q.mat ? ico(['item', q.mat]) : ''}</span>
            </button>`;
        })
        .join('');
    return `<div class="order-board">${tickets}</div>`;
}

defineSheet('order', {
    title: o => {
        const q = state.quests[o.i];
        return G.isOpen(q) ? `Commande de ${VILLAGERS[q.vid].name}` : 'Commande livrée';
    },
    render: o => detail(+o.i) || '<p class="empty">Cette commande n’est plus au tableau.</p>',
});

function detail(i) {
    const q = state.quests[i];
    if (!G.isOpen(q)) return null;
    const v = VILLAGERS[q.vid];
    const ok = G.checkQuestReady(q);
    return `<div class="card order-detail">
        <div class="card-head"><div class="avatar sm">${art('villager', q.vid)}</div><div class="card-main"><div class="card-title">${v.name}</div><div class="card-sub">${v.role}</div></div></div>
        <div class="olines">${q.items.map(x => itemLine(x)).join('')}</div>
        <div class="od-foot">${rewardHtml(q.gold, q.xp, q.mat ? [q.mat] : [])}</div>
        <div class="row-btns">${btn(q.pinned ? 'Détacher' : 'Épingler', { act: 'pin', data: { i }, size: 'sm', icon: ['ui', 'pin'], cls: q.pinned ? 'on' : '' })}${btn('Jeter', { act: 'trash', data: { i }, size: 'sm', icon: ['ui', 'shovel'] })}${btn('Livrer', { act: 'deliver', data: { i }, kind: ok ? 'green' : '', disabled: !ok, anchor: 'deliver' })}</div>
    </div>`;
}

function express() {
    const inc = state.incident;
    if (!inc || inc.type !== 'express') return null;
    const ok = G.hasAll(inc.items);
    return `<div class="card express-card">
        <div class="card-head">${ico(['ui', 'express'], 'ico big')}<div class="card-main"><div class="card-title">Acheteur pressé · prix triple</div><div class="card-sub">Il repart dans ${timer(inc.until, 'b')}</div></div></div>
        <div class="olines">${inc.items.map(x => itemLine(x)).join('')}</div>
        <div class="od-foot">${rewardHtml(inc.gold, inc.xp)}${btn('Livrer', { act: 'express', kind: ok ? 'green' : '', disabled: !ok })}</div>
    </div>`;
}

// ---------------- la commande du chef : un goût précis (station de recherche) ----------------
export function chefCard() {
    const c = state.genetics && state.genetics.chef;
    if (!c || !c.base || !G.plantLabOpen()) return null;
    const need = Object.entries(c.need)
        .map(([k, n]) => {
            const t = PLANT_TRAITS.find(x => x.id === k);
            return `<span class="chip">${ico(t.icon)}${t.name.toLowerCase()} ${n}</span>`;
        })
        .join('');
    const ok = G.varieties().filter(v => G.chefMatches(v));
    const ready = ok.find(v => (state.genetics.stock[v.id] || 0) >= c.qty);
    return `<div class="card express-card chef-card">
        <div class="card-head">${ico(['villager', 'gaston'], 'ico big')}<div class="card-main"><div class="card-title">Le chef cherche un goût</div>
        <div class="card-sub">${qtyName(c.qty, ITEMS[c.base].name)} d’une variété qui a au moins :</div></div><span class="timer-pill">${ico(['ui', 'clock'])}${timer(c.until)}</span></div>
        <div class="lab-ranges">${need}</div>
        <p class="card-sub">${ready ? `« ${esc(G.varName(ready))} » convient, et vous en avez assez.` : ok.length ? `« ${esc(G.varName(ok[0]))} » convient : récoltez-en ${c.qty}.` : 'Aucune de vos variétés ne convient encore : croisez au labo !'}</p>
        <div class="od-foot">${rewardHtml(c.gold, Math.floor(150 + scaleLvl() * 8))}${
            ready || (state.genetics.goal && state.genetics.goal.from === 'chef')
                ? ''
                : btn('Viser ce goût', { act: 'aimGoal', data: { from: 'chef' }, size: 'sm', icon: ['ui', 'flowers'] })
        }${btn('Livrer', { act: 'chef', data: { id: ready ? ready.id : '' }, kind: ready ? 'green' : '', disabled: !ready })}</div>
    </div>`;
}

// ---------------- le train ----------------
const WAGON_COLORS = ['#8b5a2b', '#3f8f2e', '#3f6fb5'];
function train() {
    const t = state.truck;
    if (!G.trainOpen())
        return `<div class="card locked">${ico(['ui', 'trainIcon'], 'ico big')}<div class="card-main"><div class="card-title">Train de marchandises</div><div class="card-sub">Rénovez la gare du village (volet Village) pour qu’il s’arrête à la ferme.</div></div></div>`;
    if (t.status !== 'here')
        return `<div class="card away">${ico(['ui', 'trainIcon'], 'ico big')}<div class="card-main"><div class="card-title">Train de marchandises</div><div class="card-sub">Prochain passage dans ${timer(t.arriveAt, 'b')}</div></div></div>`;
    const wagons = t.slots
        .map((sl, k) => {
            const have = state.inventory[sl.id],
                ok = have >= sl.qty;
            return `<div class="wagon${sl.loaded ? ' loaded' : ''}" data-anchor="wagon:${k}">
                ${sl.loaded ? `<div class="wagon-load"><div class="crate">${art('ui', 'crate')}</div></div>` : `<button class="wagon-load go" data-act="produce" data-id="${sl.id}" aria-label="Aller produire">${ico(['item', sl.id])}<b>×${sl.qty}</b></button>`}
                <div class="wagon-spr">${SPR.wagon(WAGON_COLORS[k])}</div>
                <div class="wagon-info">${
                    sl.loaded
                        ? ico(['ui', 'check'])
                        : `<span class="slot-have${ok ? ' ok' : ''}">${have} en stock</span><span class="wagon-rew">${fmt(sl.gold)}${ico(['ui', 'coin'])}${sl.mat ? ico(['item', sl.mat]) : ''}</span>
                    ${btn('Charger', { act: 'loadWagon', data: { k }, kind: ok ? 'green' : '', size: 'sm', disabled: !ok })}`
                }</div></div>`;
        })
        .join('');
    return `<div class="card truck-card here">
        <div class="card-head"><div class="card-main"><div class="card-title">Train de marchandises</div></div><span class="timer-pill">${ico(['ui', 'clock'])}${timer(t.expiresAt)}</span></div>
        <div class="rails"><div class="train-row">${wagons}<div class="loco">${SPR.loco()}</div></div></div>
        <div class="truck-reward"><span>Train complet : bonus</span>${rewardHtml(t.gold, t.xp)}${ico(['ui', 'barn'])}</div>
    </div>`;
}

// ---------------- 1.8 : l'avion-cargo ----------------
function cargoCard() {
    if (!G.cargoOpen()) return null;
    const c = state.cargo;
    if (!G.cargoHere() || !c || !c.holds.length)
        return `<div class="card away">${ico(['ui', 'plane'], 'ico big')}<div class="card-main"><div class="card-title">Avion-cargo</div><div class="card-sub">Prochain atterrissage dans ${timer(G.cargoArrive(), 'b')} · il vient toutes les 48 heures et reste 24 heures, même jeu fermé</div></div></div>`;
    const holds = c.holds
        .map((h, i) => {
            const have = state.inventory[h.id] || 0,
                left = h.qty - h.got,
                full = left <= 0;
            return `<div class="hold${full ? ' full' : ''}"><button class="hold-item" data-act="produce" data-id="${h.id}" aria-label="Aller produire">${ico(['item', h.id], 'ico big')}</button>
                <div class="hold-main"><b>${ITEMS[h.id].name}</b>${bar(h.got / h.qty)}<small>${fmt(h.got)} / ${fmt(h.qty)}${full ? '' : ` · ${fmt(have)} en stock${have ? ` · ${fmt(G.holdPay(h, Math.min(have, left)))}${ico(['ui', 'coin'])}` : ''}`}</small></div>
                ${full ? ico(['ui', 'check'], 'ico tick') : btn(have ? `Charger ${fmt(Math.min(have, left))}` : 'Produire', { act: have ? 'loadHold' : 'produce', data: have ? { i } : { id: h.id }, kind: have ? 'green' : '', size: 'sm' })}</div>`;
        })
        .join('');
    return `<div class="card cargo-card here"><div class="card-head">${ico(['ui', 'plane'], 'ico big')}<div class="card-main"><div class="card-title">Avion-cargo</div>
        <div class="card-sub">${c.done ? 'Soutes pleines : merci ! Il repartira à l’heure.' : 'D’énormes soutes : chaque unité chargée est payée tout de suite, l’avion plein donne un gros bonus.'}</div></div>
        <span class="timer-pill" title="Temps réel">${ico(['ui', 'clock'])}${timer(G.cargoLeave())}</span></div>
        <div class="holds">${holds}</div>
        ${c.done ? '' : `<div class="truck-reward"><span>Avion plein : bonus</span>${rewardHtml(G.cargoBonus(), G.cargoBonusXp())}${ico(['item', 'plank'])}${ico(['item', 'nail'])}${ico(['item', 'paint'])}</div>`}</div>`;
}

// ---------------- 1.19.2 : l'Agenda ----------------
const agendaRow = e =>
    `<div class="agenda-row${e.here ? ' here' : ''}">${ico(e.icon, 'ico big')}<div class="card-main"><b>${e.title}</b><small>${e.note}</small></div>
    <span class="timer-pill" title="Temps réel">${e.here ? 'reste ' : 'dans '}${timer(e.at)}</span></div>`;
// replié par défaut : une seule ligne fine ; un toucher déplie toute la liste (le choix est retenu sur cet appareil)
const agendaOpen = () => {
    try {
        return localStorage.getItem('meuhAgenda') === '1';
    } catch {
        return false;
    }
};
function agendaCard() {
    const list = G.agenda();
    if (list.length < 2) return null;
    const open = agendaOpen(),
        first = list[0];
    const head = `<button class="agenda-bar" data-act="agendaToggle" aria-expanded="${open}" aria-label="Agenda : ${open ? 'replier' : 'déplier'}">${ico(['ui', 'calendar'])}<b>Agenda</b>
        ${open ? '<span class="agenda-sum">Ce qui est là, ce qui arrive</span>' : `<span class="agenda-sum">${first.here ? 'là : ' : 'bientôt : '}${first.title} · ${timer(first.at)}</span>`}<i class="agenda-chev${open ? ' up' : ''}" aria-hidden="true">▾</i></button>`;
    return `<div class="card agenda-card${open ? ' open' : ''}">${head}${open ? `<div class="agenda-list">${list.map(agendaRow).join('')}</div>` : ''}</div>`;
}

// ---------------- 1.19.1 : Armand, chef du Grand Hôtel ----------------
const portrait = ico(['villager', 'armand'], 'ico big');
function armandCard() {
    if (!G.armandOpen()) return null;
    const slots = G.armandSlots(),
        here = G.armandHere();
    const fidStars = id => '★'.repeat(G.armandFid(id)) + '☆'.repeat(5 - G.armandFid(id));
    const rows = Array.from({ length: slots }, (_, i) => {
        const f = G.armandFlagship(i),
            o = G.armandOrder(i);
        const pick = btn(f ? 'Changer' : 'Choisir', { act: 'armandPick', data: { slot: i }, size: 'sm', disabled: !G.armandCanChange(i) });
        if (!here || !o)
            return `<div class="hold">${f ? ico(['item', f], 'ico big') : ico(['ui', 'star'], 'ico big')}<div class="hold-main"><b>${f ? ITEMS[f].name : 'Place libre'}</b>
                <small>${f ? `fidélité ${fidStars(f)}` : 'Choisissez un produit phare'}</small></div>${pick}</div>`;
        const have = state.inventory[o.id] || 0,
            n = Math.min(have, o.qty - o.got);
        return `<div class="hold${o.done ? ' full' : ''}"><button class="hold-item" data-act="produce" data-id="${o.id}" aria-label="Aller produire">${ico(['item', o.id], 'ico big')}</button>
            <div class="hold-main"><b>${ITEMS[o.id].name} · ${fmt(o.qty)}</b>${bar(o.got / o.qty)}<small>${fmt(o.got)} / ${fmt(o.qty)}${o.done ? ' · terminée' : ` · ${fmt(G.armandPay(o, 1))} pièces l’unité · ${fmt(have)} en stock`} · fidélité ${fidStars(o.id)}</small></div>
            ${o.done ? ico(['ui', 'check'], 'ico tick') : btn(have ? `Livrer ${fmt(n)}` : 'Produire', { act: have ? 'armandGive' : 'produce', data: have ? { slot: i } : { id: o.id }, kind: have ? 'green' : '', size: 'sm' })}</div>`;
    }).join('');
    const sub = here
        ? 'Il passe en cuisine : chaque unité livrée est payée tout de suite, au prix fixé, quel que soit le marché. Commande finie : bonus et matériaux rares.'
        : 'Dites-lui votre produit phare : il vous en commandera des quantités énormes. Il passe une fois par semaine et reste trois jours.';
    const when = here
        ? `<span class="timer-pill" title="Temps réel">${ico(['ui', 'clock'])}${timer(G.armandLeave())}</span>`
        : `<span class="timer-pill" title="Temps réel">${ico(['ui', 'clock'])}dans ${timer(G.armandArrive(), 'b')}</span>`;
    return `<div class="card armand-card${here ? ' here' : ' away'}"><div class="card-head">${portrait}<div class="card-main"><div class="card-title">Armand, chef du Grand Hôtel</div>
        <div class="card-sub">${sub}</div></div>${when}</div><div class="holds">${rows}</div></div>`;
}
defineSheet('armandPick', {
    cls: 'armand-sheet',
    title: () => 'Produit phare d’Armand',
    render(o) {
        const slot = (o && o.slot) || 0;
        const list = G.armandCandidates();
        const f = G.armandFlagship(slot);
        const taken = i => [...Array(G.armandSlots()).keys()].some(k => k !== slot && G.armandFlagship(k) === i);
        const rows = list
            .filter(id => !taken(id))
            .map(
                id => `<div class="hold${id === f ? ' full' : ''}">${ico(['item', id], 'ico big')}<div class="hold-main"><b>${ITEMS[id].name}</b>
                <small>${fmt(G.armandQty(id))} unités · ${fmt(G.armandPay({ id }, 1))} pièces l’unité · fidélité ${G.armandFid(id)}/5</small></div>
                ${id === f ? ico(['ui', 'check'], 'ico tick') : btn('Choisir', { act: 'armandSet', data: { id, slot }, kind: 'green', size: 'sm' })}</div>`,
            )
            .join('');
        return `<div class="armand-pick"><p class="card-sub">Armand ne commande que ce que vous maîtrisez (au moins une étoile). Sa commande grossit avec la maîtrise et la fidélité, de ${fmt(60)} à ${fmt(1200)} unités.</p>
            <div class="holds">${rows || '<p class="card-sub center">Aucun produit disponible : gagnez une étoile de maîtrise (livre des produits).</p>'}</div></div>`;
    },
});

function delivery(kind) {
    const isBoat = kind === 'boat';
    const open = isBoat ? G.boatOpen() : G.balloonOpen();
    if (!open) return null;
    const b = isBoat ? state.boat : state.balloon;
    const name = isBoat ? 'Bateau de livraison' : 'Montgolfière';
    if (b.status !== 'here')
        return `<div class="card away">${ico(['ui', isBoat ? 'boat' : 'balloon'], 'ico big')}<div class="card-main"><div class="card-title">${name}</div><div class="card-sub">${isBoat ? 'Le cargo revient' : 'Elle revient'} dans ${timer(b.arriveAt, 'b')}</div></div></div>`;
    const ok = G.hasAll(b.items);
    return `<div class="card delivery-card here">
        <div class="delivery-art">${isBoat ? art('ui', 'boat') : SPR.balloon()}</div>
        <div class="card-main">
            <div class="card-head"><div class="card-title">${name}</div><span class="timer-pill">${ico(['ui', 'clock'])}${timer(b.expiresAt)}</span></div>
            <div class="olines">${b.items.map(x => itemLine(x)).join('')}</div>
            <div class="od-foot">${rewardHtml(b.gold, b.xp, b.mats)}${btn(isBoat ? 'Charger' : 'Livrer', { act: isBoat ? 'sendBoat' : 'sendBalloon', kind: ok ? 'green' : '', disabled: !ok })}</div>
        </div></div>`;
}

function renderOrders(el) {
    blocks(el, [
        ['agenda', agendaCard()],
        ['defi', defiCard()],
        ['event', eventCard()],
        ['express', express()],
        ['chef', chefCard()],
        ['board', boardCard()],
        ['train', train()],
        ['cargo', cargoCard()],
        ['armand', armandCard()],
        ['balloon', delivery('balloon')],
        ['boat', delivery('boat')],
        // 1.9 : venus du volet Village
        ['rare', rareCard()],
        ['holiday', holidayCard()],
        ['contract', contractCard()],
        ['fseason', farmSeasonCard()],
        ['neighbors', neighborsCard()],
        ['hint', hint('Touchez une ligne rouge pour aller produire ce qui manque.')],
    ]);
}
defineView('village/orders', renderOrders);

export function setupOrders() {
    actions({
        deliver: (el, d) => G.turnInQuest(+d.i, el) && closeSheet('order'),
        trash: (el, d) => confirmTap('trash' + d.i, el, 'Jeter ?') && G.trashQuest(+d.i) && closeSheet('order'),
        pin: (el, d) => G.togglePin(+d.i),
        express: el => G.deliverExpress(el),
        loadHold: (el, d) => G.loadHold(+d.i, el),
        foldToggle: (el, d) => toggleFold(d.id),
        agendaToggle: () => {
            try {
                localStorage.setItem('meuhAgenda', agendaOpen() ? '0' : '1');
            } catch {
                /* tant pis : le choix n'est pas retenu */
            }
        },
        armandGive: (el, d) => G.deliverArmand(el, +d.slot || 0),
        armandPick: (el, d) => openSheet('armandPick', { slot: +d.slot || 0 }),
        armandSet: (el, d) => G.setFlagship(d.id, +d.slot || 0) && closeSheet('armandPick'),
        chef: (el, d) => G.deliverChef(d.id, el),
        loadWagon: (el, d) => G.loadSlot(+d.k, el.closest('[data-anchor]')),
        sendBalloon: el => G.sendBalloon(el),
        sendBoat: el => G.sendBoat(el),
        claimGoal: (el, d) => G.claimGoal(+d.k, el),
        giveGoal: (el, d) => G.contributeGoal(+d.k, el),
        claimEvent: el => G.claimEvent(el),
    });
}
