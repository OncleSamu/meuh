// Ferme | Pêche (1.10) : les coins de pêche, les appâts, la canne et son mini-jeu, les nasses,
// les défis de Marcel, le concours du week-end, le carnet de pêche et le filet en mer.
import { state } from '../../core/state.js';
import { fmt } from '../../core/format.js';
import { toast } from '../../core/bus.js';
import { FISH } from '../../data/meta.js';
import { SPOTS, SPOT_IDS, BAITS, WORMS, FLY_CRAFT, TRAPS, SIZES, SALMON_RUN, POND_UNLOCKS } from '../../data/fishing.js';
import * as G from '../../systems/index.js';
import { byId, blocks, actions, run, $ } from '../dom.js';
import { ico, art } from '../icons.js';
import { btn, timer, hint, coins } from '../kit.js';
import { defineView, currentPath, viewEl, go } from '../app.js';

const MEDAL = { small: 'medalB', nice: 'medalS', trophy: 'medalG' };
const fname = id => FISH[id].name;
const cap = t => t.charAt(0).toUpperCase() + t.slice(1);

// ---------------- en haut : la boîte à vers, les mouches, la canne ----------------
function topRow() {
    const p = state.pond;
    const worm = `<span class="mat big">${ico(['ui', 'worm'])}${p.worms}${p.worms < WORMS.max ? `<small>+1 dans ${timer(G.nextWorm())}</small>` : ''}</span>`;
    const fly = G.baitOpen('fly') ? `<span class="mat big">${ico(['ui', 'fly'])}${p.flies}</span>` : '';
    return `<div class="view-top pond-top"><div class="mats">${worm}${fly}<span class="mat big">${ico(['ui', 'rod'])}${G.rodNow().name.replace('Canne ', '')}</span></div></div>`;
}

// ---------------- les grands moments : remontée des saumons, résultat du concours ----------------
function runBanner() {
    const r = G.runState();
    if (!r) return '';
    const g = G.runReward();
    return `<div class="card pond-banner run">${ico(['item', 'salmon'], 'ico big')}<div class="card-main">
        <div class="card-title">La remontée des saumons !</div>
        <div class="card-sub">Jusqu’au jour ${SALMON_RUN.to} de l’automne, les saumons passent devant le ponton. Une mouche au bout de la ligne, et ils mordent souvent.</div>
        <div class="card-sub"><b>Défi de la remontée :</b> un saumon de plus de ${SALMON_RUN.minKg} kg · ${coins(g.coins)} ${r.claimed ? '· Réussi !' : ''}</div></div>
        ${r.done && !r.claimed ? btn('Récupérer', { act: 'pondRun', kind: 'gold', size: 'sm' }) : btn('Y aller', { act: 'pondGo', data: { id: 'salmon' }, kind: 'blue', size: 'sm', disabled: r.claimed })}</div>`;
}

function contestResult() {
    const c = state.pond.lastContest;
    if (!c || c.seen) return '';
    const me = { name: 'Votre ferme', owner: 'vous', w: c.best, me: true };
    const list = [...c.rivals, me].sort((a, b) => b.w - a.w);
    const pz = G.contestPrize(c.rank);
    return `<div class="card pond-banner contest">${ico(['ui', c.rank === 1 ? 'medalG' : c.rank === 2 ? 'medalS' : c.rank === 3 ? 'medalB' : 'trophy'], 'ico big')}<div class="card-main">
        <div class="card-title">Concours de pêche : ${c.rank === 1 ? 'vous gagnez !' : `vous êtes ${c.rank}e`}</div>
        <div class="card-sub">${cap(G.heaviest(c.id))} du week-end.</div>
        <ol class="podium-list">${list.map(x => `<li class="${x.me ? 'me' : ''}">${x.name} <b>${G.kgText(x.w)}</b></li>`).join('')}</ol>
        <div class="card-sub">${pz.coins ? coins(pz.coins) : ''}${pz.rubans ? ` · ${pz.rubans} ruban${pz.rubans > 1 ? 's' : ''}` : ''} · ${pz.xp} XP</div></div>
        ${btn('Récupérer', { act: 'pondContest', kind: 'gold', size: 'sm' })}</div>`;
}

// ---------------- les coins de pêche ----------------
function spotsRow() {
    const p = state.pond;
    return `<div class="spot-row">${SPOT_IDS.map(id => {
        const open = G.spotOpen(id);
        return `<button class="spot${p.spot === id ? ' on' : ''}${open ? '' : ' locked'}" data-act="pondSpot" data-id="${id}">
            <span class="spot-art">${art('ui', SPOTS[id].icon)}</span><b>${SPOTS[id].name}</b>${open ? '' : `<small>${ico(['ui', 'lock'])}${G.spotLock(id).startsWith('Niveau') ? G.spotLock(id) : id === 'lagoon' ? 'Chantier du bac' : 'Chantier du ponton'}</small>`}</button>`;
    }).join('')}</div>`;
}

// ---------------- les appâts ----------------
function baitRow() {
    const p = state.pond;
    const chips = Object.keys(BAITS)
        .filter(G.baitOpen)
        .map(id => {
            const n = G.baitCount(id);
            return `<button class="bait${p.bait === id ? ' on' : ''}${n ? '' : ' empty'}" data-act="pondBait" data-id="${id}" title="${BAITS[id].hint}">${ico(BAITS[id].icon)}<span>${BAITS[id].name.replace(' (une ablette)', '')}</span><b>${fmt(n)}</b></button>`;
        })
        .join('');
    const craft = G.baitOpen('fly')
        ? `<button class="bait craft" data-act="pondFlies" title="Une plume et une pelote de laine donnent ${FLY_CRAFT.out} mouches">${ico(['ui', 'fly'])}<span>+${FLY_CRAFT.out} mouches</span><small>${ico(['item', 'feather'])}${ico(['item', 'wool'])}</small></button>`
        : '';
    return `<div class="bait-row"><button class="bait${p.bait ? '' : ' on'}" data-act="pondBait" data-id="">${ico(['ui', 'rod'])}<span>Sans appât</span></button>${chips}${craft}</div>`;
}

// ---------------- la canne : ce qui mord ici, le mini-jeu ----------------
const PHASE_BTN = { idle: 'Lancer la ligne', wait: 'Ferrer', bite: 'Ferrer !', reel: 'Ferrer !' };
function rodCard() {
    const p = state.pond,
        f = G.fishing,
        ph = G.fishPhase();
    const table = G.catchTable();
    const quick = p.spot === 'bank' && p.bait === 'worm' && G.baitCount('worm') > 0;
    const last = f.last && ph === 'idle' ? f.last : null;
    const msg = {
        idle: last
            ? `Dernière prise : ${fname(last.id)}${FISH[last.id].junk ? '' : ` de ${G.kgText(last.w)}`}${last.size ? ` · ${SIZES.find(s => s.id === last.size).name}` : ''}${last.perfect ? ' · Parfait !' : ''}`
            : p.bait && G.baitCount(p.bait) && !table.some(r => r.boosted)
              ? `${BAITS[p.bait].name.replace(' (une ablette)', '')} : aucun poisson d’ici n’y mord en ce moment. Essayez un autre coin ou un autre appât.`
              : quick
                ? 'Pêche rapide : avec un ver sur la berge, les petits poissons sortent d’un seul geste.'
                : 'Lancez, attendez que le bouchon plonge, puis ferrez.',
        wait: 'Patience… Ferrez quand le bouchon plonge et que « ! » apparaît.',
        bite: 'Ça mord !',
        reel: FISH[f.id] ? fightText(FISH[f.id].fight) : '',
    }[ph];
    const zone = ph === 'reel' ? `left:${(G.zoneCenter() - f.width / 2) * 100}%;width:${f.width * 100}%` : '';
    return `<div class="card nature-card pond-card">
        <div class="nature-head">${ico(['ui', 'rod'])}<div class="card-main"><div class="card-title">${SPOTS[p.spot].name}</div><div class="card-sub">${msg}</div></div></div>
        <div class="catch-row">${table.map(r => `<span class="catch${r.boosted ? ' boost' : ''}" title="${fname(r.id)}">${ico(['item', r.id])}<b>${r.pct}%</b></span>`).join('') || '<span class="card-sub">Rien ne mord ici en ce moment.</span>'}</div>
        <div class="pond spot-${p.spot}" id="pond" data-phase="${ph}" data-anchor="pond"><div class="ripple r1"></div><div class="ripple r2"></div><div class="lily l1"></div><div class="lily l2"></div><div class="bobber"><span class="excl">!</span></div></div>
        <div class="reel"${ph === 'reel' ? '' : ' hidden'}><div class="reel-zone" id="reel-zone" style="${zone}"></div><div class="reel-cursor" id="reel-cursor"></div></div>
        ${btn(PHASE_BTN[ph], { act: 'fish', kind: ph === 'idle' ? 'blue' : 'gold', wide: true, size: 'lg', cls: 'fish-btn' })}
    </div>`;
}
const fightText = f =>
    ({
        calm: 'Arrêtez le curseur dans la zone verte ! Au cœur de la zone, c’est une prise parfaite.',
        zigzag: 'Il fait des allers-retours ! Arrêtez le curseur dans la zone verte.',
        pull: 'Il tire fort et emmène la zone avec lui ! Visez bien.',
        dart: 'Il donne des coups brusques ! Guettez le bon moment.',
    })[f] || '';

// ---------------- Marcel ----------------
function marcelCard() {
    if (!G.marcelOpen()) return '';
    const m = G.ensureMarcel();
    const r = G.marcelReward();
    const goId = m.kind === 'perfect' ? null : m.id;
    return `<div class="card marcel-card"><div class="avatar sm">${art('villager', 'marcel')}</div><div class="card-main">
        <div class="card-title">Le défi de Marcel</div>
        <div class="card-sub">« ${G.marcelText(m)}. »</div>
        <div class="card-sub">${m.claimed ? 'Réussi ! Un nouveau défi demain.' : `${m.got}/${m.need} · ${coins(r.coins)} · ${r.xp} XP${m.flies ? ` · ${ico(['ui', 'fly'])} mouches` : ''}`}</div></div>
        ${m.done && !m.claimed ? btn('Récupérer', { act: 'pondMarcel', kind: 'gold', size: 'sm' }) : goId && !m.claimed ? btn('Y aller', { act: 'pondGo', data: { id: goId }, kind: 'blue', size: 'sm' }) : ''}</div>`;
}

// ---------------- le concours du week-end ----------------
function contestCard() {
    if (!G.fishContestOpen()) return '';
    const c = state.pond.contest;
    if (!c) {
        const next = G.contestFish(G.fishWeek());
        return `<div class="card contest-card">${ico(['ui', 'trophy'], 'ico big')}<div class="card-main"><div class="card-title">Concours de pêche</div>
            <div class="card-sub">Chaque samedi et dimanche, contre les fermes voisines. Ce week-end : ${G.heaviest(next)}.</div></div></div>`;
    }
    const me = { name: 'Votre ferme', w: c.best, me: true };
    const list = [...G.rivalsOf(c), me].sort((a, b) => b.w - a.w);
    return `<div class="card contest-card on">${ico(['item', c.id], 'ico big')}<div class="card-main">
        <div class="card-title">Concours : ${G.heaviest(c.id)}</div>
        <div class="card-sub">Fin du concours dans ${timer(G.weekendEnd())}. Votre meilleure prise compte.</div>
        <ol class="podium-list">${list.map(x => `<li class="${x.me ? 'me' : ''}">${x.name} <b>${x.w ? G.kgText(x.w) : '—'}</b></li>`).join('')}</ol></div>
        ${btn('Y aller', { act: 'pondGo', data: { id: c.id }, kind: 'blue', size: 'sm' })}</div>`;
}

// ---------------- les nasses ----------------
function trapsCard() {
    if (state.level < TRAPS.lvl) return '';
    const p = state.pond,
        max = G.trapMax(),
        c = TRAPS.cost;
    const rows = p.traps
        .map((t, i) => {
            if (G.trapReady(t))
                return `<div class="trap ready">${ico(['ui', 'trap'])}<span>${SPOTS[t.spot].name}${t.bait ? ` · ${BAITS[t.bait].name.toLowerCase()}` : ''} : pleine !</span>${btn('Relever', { act: 'pondHaul', data: { i }, kind: 'gold', size: 'sm' })}</div>`;
            if (t.start)
                return `<div class="trap">${ico(['ui', 'trap'])}<span>${SPOTS[t.spot].name}${t.bait ? ` · ${BAITS[t.bait].name.toLowerCase()}` : ''} · encore ${timer(t.start + TRAPS.every)}</span></div>`;
            return `<div class="trap idle">${ico(['ui', 'trap'])}<span>Nasse vide</span>${btn(`Poser à ${SPOTS[p.spot].name.replace(/^L[ae] |^Les /, m => m.toLowerCase())}${p.bait && G.baitCount(p.bait) && p.bait !== 'fly' ? ' + ' + BAITS[p.bait].name.toLowerCase().replace(' (une ablette)', '') : ''}`, { act: 'pondSetTrap', data: { i }, kind: 'blue', size: 'sm' })}</div>`;
        })
        .join('');
    const ok = state.money >= c.coins && (state.inventory.wood || 0) >= c.wood && (state.inventory.nail || 0) >= c.nail;
    const buy =
        p.traps.length < max
            ? `<div class="trap buy">${ico(['ui', 'trap'])}<span>Une nasse de plus (${p.traps.length}/${max})</span>${btn(`${fmt(c.coins)}${ico(['ui', 'coin'])} ${c.wood}${ico(['item', 'wood'])} ${c.nail}${ico(['item', 'nail'])}`, { act: 'pondBuyTrap', kind: ok ? 'green' : '', size: 'sm' })}</div>`
            : '';
    const ready = G.trapsReady();
    return `<div class="card traps-card"><div class="nature-head">${ico(['ui', 'trap'])}<div class="card-main"><div class="card-title">Les nasses</div>
        <div class="card-sub">Posées dans un coin de pêche, elles attrapent 2 à 4 poissons toutes les 2 heures, même quand le jeu est fermé. Elles prennent le coin et l’appât choisis plus haut.</div></div>
        ${ready > 1 ? btn('Tout relever', { act: 'pondHaulAll', kind: 'gold', size: 'sm' }) : ''}</div>
        ${rows}${buy}</div>`;
}

// ---------------- le carnet de pêche ----------------
function logCard() {
    const ids = Object.keys(FISH).filter(id => !FISH[id].junk);
    const got = ids.filter(id => G.caught(id) > 0).length;
    const tiles = ids
        .map(id => {
            const n = G.caught(id),
                best = G.bestOf(id);
            if (!n)
                return `<button class="log-tile unknown" data-act="pondGo" data-id="${id}"><span class="log-art">${ico(['item', id])}</span><b>???</b><small>${FISH[id].hint}</small></button>`;
            const size = best ? G.sizeOf(id, best) : null;
            return `<button class="log-tile" data-act="pondGo" data-id="${id}"><span class="log-art">${ico(['item', id])}${size ? `<i class="medal">${ico(['ui', MEDAL[size.id]])}</i>` : ''}</span>
                <b>${fname(id)}</b><small>×${fmt(n)}${best ? ` · ${G.kgText(best)}` : ''}</small><small>${FISH[id].hint}</small></button>`;
        })
        .join('');
    return `<div class="card log-card"><div class="nature-head">${ico(['ui', 'book'])}<div class="card-main"><div class="card-title">Le carnet de pêche · ${got}/${ids.length}</div>
        <div class="card-sub">Record de poids et médaille de taille (bronze : petite prise, argent : belle prise, or : trophée). Une récompense à la 10e et à la 50e prise de chaque espèce. Touchez un poisson pour aller le pêcher.</div></div></div>
        <div class="log-grid">${tiles}</div></div>`;
}

// ---------------- le matériel ----------------
function gearCard() {
    const r = G.rodNext();
    const soon = POND_UNLOCKS.filter(([l]) => l > state.level).slice(0, 2);
    const rodRow = r
        ? `<div class="tool-row">${ico(['ui', 'rod'])}<span>${r.name} : zone de ferrage plus large, poissons plus lourds${state.level < r.lvl ? ` (niveau ${r.lvl})` : ''}</span>
            ${btn(`${fmt(r.cost.coins)}${ico(['ui', 'coin'])} ${r.cost.tools}${ico(['item', 'tools'])}${r.cost.plank ? ` ${r.cost.plank}${ico(['item', 'plank'])}` : ''}`, { act: 'pondRod', kind: state.level >= r.lvl ? 'green' : '', size: 'sm', disabled: state.level < r.lvl })}</div>`
        : `<div class="tool-row">${ico(['ui', 'rod'])}<span>${G.rodNow().name} : la meilleure canne du pays</span></div>`;
    return `<div class="card gear-card">${rodRow}${soon.map(([l, t]) => `<div class="tool-row soon">${ico(['ui', 'lock'])}<span>Niveau ${l} : ${t}</span></div>`).join('')}</div>`;
}

function netCard() {
    if (!G.netOpen()) return '';
    const n = state.net;
    return `<div class="card nature-card net-card">
        <div class="nature-head">${ico(['ui', 'net'])}<div class="card-main"><div class="card-title">Pêche en mer</div>
        <div class="card-sub">${!n.until ? 'Posez le filet, et relevez-le dans 20 minutes : sardines, maquereaux, crevettes, bars, parfois un homard.' : G.netReady() ? 'Le filet est plein, relevez-le !' : `Le filet est en mer : encore ${timer(n.until)}.`}</div></div></div>
        <div class="sea${n.until ? ' out' : ''}">${art('ui', 'net')}</div>
        ${!n.until ? btn('Poser le filet', { act: 'castNet', kind: 'blue', wide: true }) : btn('Relever le filet', { act: 'haulNet', kind: G.netReady() ? 'gold' : '', wide: true, disabled: !G.netReady() })}
    </div>`;
}

function renderPond(el) {
    G.ensurePond();
    blocks(el, [
        ['top', topRow()],
        ['run', runBanner()],
        ['result', contestResult()],
        ['spots', spotsRow()],
        ['bait', baitRow()],
        ['rod', rodCard()],
        ['marcel', marcelCard()],
        ['traps', trapsCard()],
        ['contest', contestCard()],
        ['log', logCard()],
        ['gear', gearCard()],
        ['net', netCard()],
        ['hint', hint('L’étang : la canne pour les gros poissons et les records, les nasses pour les poissons de tous les jours.')],
    ]);
    if (G.fishing.phase !== 'idle') fishLoop();
}
defineView('farm/pond', renderPond);

// le curseur, la zone verte et la touche du poisson, à chaque image
let looping = false;
function fishLoop() {
    if (looping) return;
    looping = true;
    let last = '';
    const step = () => {
        if (currentPath() !== 'farm/pond') {
            looping = false;
            return;
        }
        const ph = G.fishPhase();
        if (ph !== last) {
            last = ph;
            renderPond(viewEl('farm/pond'));
        }
        if (ph === 'reel') {
            const c = byId('reel-cursor');
            if (c) c.style.left = G.reelPos() * 100 + '%';
            const z = byId('reel-zone');
            if (z && G.fishing.fight === 'pull') z.style.left = (G.zoneCenter() - G.fishing.width / 2) * 100 + '%';
        }
        if (ph === 'idle') {
            looping = false;
            renderPond(viewEl('farm/pond'));
            return;
        }
        requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
}

// aller pêcher un poisson : le bon coin et le bon appât en main
export function goFish(id) {
    G.ensurePond();
    const f = FISH[id];
    if (!f) return go('farm/pond');
    const b = G.bestFor(id);
    if (b.spot) state.pond.spot = b.spot;
    if (b.bait) state.pond.bait = b.bait;
    go('farm/pond');
    const where = b.spot ? SPOTS[b.spot].name.toLowerCase() : null;
    if (f.spots && !b.spot) return toast(`${f.name} : ${f.hint.toLowerCase()}. ${G.spotLock(f.spots[0])}`, ['item', id]);
    toast(
        `${f.name} : ${f.hint.toLowerCase()}${where ? ` · ${where}` : ''}${b.bait ? `, avec ${BAITS[b.bait].name.toLowerCase().replace(' (une ablette)', ' (ablette)')}` : ''}`,
        ['item', id],
    );
}

export function setupPond() {
    actions({
        fish: () => {
            G.fishAction($('#pond'));
            fishLoop();
        },
        pondSpot: (el, d) => G.setSpot(d.id),
        pondBait: (el, d) => G.setBait(d.id || null),
        pondFlies: el => G.craftFlies(el),
        pondGo: (el, d) => goFish(d.id),
        pondMarcel: el => G.claimMarcel(el),
        pondRun: el => G.claimRun(el),
        pondContest: el => G.claimContest(el),
        pondBuyTrap: el => G.buyTrap(el),
        pondSetTrap: (el, d) => G.setTrap(+d.i, state.pond.spot, state.pond.bait === 'fly' ? null : state.pond.bait, el),
        pondHaul: (el, d) => G.haulTrap(+d.i, el),
        pondHaulAll: el => G.haulAllTraps(el),
        pondRod: el => G.buyRod(el),
        castNet: el => G.castNet(el),
        haulNet: el => G.haulNet(el),
    });
    // toucher l'étang pendant la pêche, c'est ferrer
    const down = e => {
        if (e.target.closest('#pond') && G.fishing.phase !== 'idle') {
            e.preventDefault();
            run('fish', null);
        }
    };
    byId('view-farm').addEventListener('pointerdown', down);
    byId('view-aside').addEventListener('pointerdown', down);
}
