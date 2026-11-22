// 1.154 : Interface plein écran de BEUH — le deuxième Meuh underground caché en easter egg.
import { fmt, formatDuration } from '../core/format.js';
import { toast } from '../core/bus.js';
import * as G from '../systems/index.js';
import {
    BEUH_FRONT_IDS,
    BEUH_FRONTS,
    BEUH_MAX_LVL,
    BEUH_MAX_PLOTS,
    BEUH_RECIPE_IDS,
    BEUH_RECIPES,
    BEUH_STATION_IDS,
    BEUH_STATIONS,
    BEUH_STRAIN_IDS,
    BEUH_STRAINS,
    BEUH_UPGRADE_IDS,
    BEUH_UPGRADES,
    beuhPlotCost,
    beuhXpReq,
} from '../data/beuh.js';
import { beuhEmptyPotSvg, beuhIconSvg, beuhLogoSvg, beuhPlantSvg } from '../art/beuh.js';
import { habitantArt } from '../art/habitants.js';
import { actions, esc, patch } from './dom.js';
import { closeAll } from './sheets.js';

let open = false;
let tab = 'cave'; // cave | labo | street | fronts | market
let knocks = 0;

export const isBeuhOpen = () => open;

function ensureRoot() {
    let el = document.getElementById('beuh-app');
    if (!el) {
        el = document.createElement('div');
        el.id = 'beuh-app';
        el.hidden = true;
        document.body.appendChild(el);
    }
    return el;
}

export function openBeuh() {
    G.beuhUnlock();
    closeAll();
    open = true;
    renderBeuh();
}

export function closeBeuh() {
    open = false;
    const el = document.getElementById('beuh-app');
    if (el) el.hidden = true;
}

function renderCave(B) {
    const unlockedStrains = BEUH_STRAIN_IDS.filter(id => BEUH_STRAINS[id].lvl <= B.lvl);
    const sel = BEUH_STRAINS[B.selStrain] || BEUH_STRAINS.rondpoint;
    const readyN = B.plots.filter(p => p.ready).length;
    const dryN = B.plots.filter(p => p.strain && !p.ready && !p.watered).length;
    const emptyN = B.plots.filter(p => !p.strain).length;
    const plotCost = B.plots.length < BEUH_MAX_PLOTS ? beuhPlotCost(B.plots.length) : 0;

    const pills = unlockedStrains
        .map(id => {
            const s = BEUH_STRAINS[id];
            const n = B.seeds[id] || 0;
            return `<button class="beuh-pill${B.selStrain === id ? ' on' : ''}" data-act="beuhSel" data-id="${id}">${beuhIconSvg(id)}<span>${esc(s.name)}</span><small>(${n})</small></button>`;
        })
        .join('');

    const plotsHtml = B.plots
        .map((p, i) => {
            if (!p.strain) {
                return `<button class="beuh-plot" data-act="beuhPlotTap" data-i="${i}">${beuhEmptyPotSvg()}<b>Pot vide</b><small>Planter (${fmt(sel.seedCost)} 💵)</small></button>`;
            }
            const s = BEUH_STRAINS[p.strain];
            const pct = Math.min(1, p.progress / s.time);
            const st = p.ready ? 2 : pct >= 0.45 ? 1 : 0;
            const left = Math.max(0, Math.ceil((s.time - p.progress) / G.beuhGrowSpeed(p.watered)));
            return `<button class="beuh-plot${p.ready ? ' ready' : p.watered ? ' watered' : ''}" data-act="beuhPlotTap" data-i="${i}">
                ${beuhPlantSvg(p.strain, st)}
                <b>${esc(s.name)}</b>
                ${p.ready ? '<small style="color:#4ade80;font-weight:800">PRÊT · Récolter</small>' : `<small>${p.watered ? '💧 ×1,5 · ' : 'Arroser · '}${formatDuration(left)}</small><div class="beuh-prog"><i style="width:${(pct * 100).toFixed(0)}%"></i></div>`}
            </button>`;
        })
        .join('');

    return `
        <div class="beuh-card">
            <div class="beuh-card-h">
                <h3>🌿 Variété active : ${esc(sel.name)}</h3>
                <span class="beuh-muted">Graines : ${B.seeds[sel.id] || 0}</span>
            </div>
            <div class="beuh-pills">${pills}</div>
            <p class="beuh-muted" style="margin:6px 0 8px">${esc(sel.desc)} · Vente ~${fmt(sel.sell)} 💵</p>
            <div class="beuh-row-btns">
                ${readyN ? `<button class="beuh-btn green" data-act="beuhHarvestAll">✂️ Tout récolter (${readyN})</button>` : ''}
                ${dryN ? `<button class="beuh-btn blue" data-act="beuhWaterAll">💧 Tout arroser (${dryN})</button>` : ''}
                ${emptyN ? `<button class="beuh-btn purple" data-act="beuhPlantAll">🌱 Tout planter (${emptyN})</button>` : ''}
                <button class="beuh-btn" data-act="beuhBuySeed" data-id="${sel.id}" data-q="5">+5 graines (${fmt(sel.seedCost * 5)} 💵)</button>
            </div>
        </div>
        <div class="beuh-card">
            <div class="beuh-card-h">
                <h3>Cave secrète (${B.plots.length}/${BEUH_MAX_PLOTS} pots)</h3>
                ${plotCost ? `<button class="beuh-btn" data-act="beuhExpand" ${B.dirty + B.clean < plotCost ? 'disabled' : ''}>+1 pot (${fmt(plotCost)} 💵)</button>` : '<span class="beuh-muted">Cave pleine</span>'}
            </div>
            <div class="beuh-grid">${plotsHtml}</div>
        </div>`;
}

function renderLabo(B) {
    const cards = BEUH_STATION_IDS.map(sid => {
        const stDef = BEUH_STATIONS[sid];
        const owned = B.stations[sid];
        if (!owned) {
            const locked = B.lvl < stDef.lvl;
            const canBuy = !locked && B.dirty + B.clean >= stDef.cost;
            return `<div class="beuh-item-row">
                ${beuhIconSvg(sid)}
                <div class="beuh-item-main">
                    <b>${esc(stDef.name)}</b>
                    <small>${esc(stDef.desc)} · ${locked ? `Rang ${stDef.lvl} requis` : `${fmt(stDef.cost)} 💵`}</small>
                </div>
                <button class="beuh-btn purple" data-act="beuhBuyStation" data-id="${sid}" ${canBuy ? '' : 'disabled'}>${locked ? `Niv. ${stDef.lvl}` : 'Installer'}</button>
            </div>`;
        }
        const recs = BEUH_RECIPE_IDS.map(id => BEUH_RECIPES[id]).filter(r => r.station === sid);
        const job = owned.job;
        const jobDef = job ? BEUH_RECIPES[job.id] : null;
        const jobHtml = jobDef
            ? `<div style="margin:6px 0">
                <div class="beuh-card-h" style="margin-bottom:4px"><span>En cours : <b>${esc(jobDef.name)}</b></span><small class="beuh-muted">${formatDuration(Math.max(0, Math.ceil(jobDef.time - job.progress)))}</small></div>
                <div class="beuh-prog"><i style="width:${Math.min(100, (job.progress / jobDef.time) * 100).toFixed(0)}%"></i></div>
              </div>`
            : '';
        const readyHtml = owned.ready.length
            ? `<button class="beuh-btn green" style="width:100%;margin-bottom:8px" data-act="beuhCollect" data-id="${sid}">✨ Récupérer (${owned.ready.length} prêt${owned.ready.length > 1 ? 's' : ''})</button>`
            : '';
        const recHtml = recs
            .map(r => {
                const locked = B.lvl < r.lvl;
                const ingText = Object.entries(r.ing)
                    .map(([k, q]) => {
                        const info = G.beuhItemInfo(k);
                        const have = B.inv[k] || 0;
                        return `<span style="color:${have >= q ? '#86efac' : '#fda4af'}">${esc(info ? info.name : k)} ${have}/${q}</span>`;
                    })
                    .join(' · ');
                const ok = !locked && G.beuhCanCraft(r.id);
                return `<div class="beuh-item-row" style="margin-top:6px">
                    ${beuhIconSvg(r.id)}
                    <div class="beuh-item-main">
                        <b>${esc(r.name)} <small class="beuh-muted">(${fmt(r.sell)} 💵 · ${formatDuration(r.time)})</small></b>
                        <small>${locked ? `Rang ${r.lvl} requis` : ingText}</small>
                    </div>
                    <button class="beuh-btn green" data-act="beuhCraft" data-id="${r.id}" ${ok ? '' : 'disabled'}>${locked ? `Niv. ${r.lvl}` : 'Lancer'}</button>
                </div>`;
            })
            .join('');
        return `<div class="beuh-card">
            <div class="beuh-card-h">
                <div style="display:flex;align-items:center;gap:8px">${beuhIconSvg(sid).replace('<svg ', '<svg style="width:28px;height:28px" ')}<h3>${esc(stDef.name)}</h3></div>
                <span class="beuh-muted">${esc(stDef.desc)}</span>
            </div>
            ${readyHtml}${jobHtml}${recHtml}
        </div>`;
    }).join('');
    return `<div class="beuh-list">${cards}</div>`;
}

function renderStreet(B) {
    const layCost = Math.max(60, Math.round(B.lvl * 45));
    const clientsHtml = B.clients
        .map((c, i) => {
            const info = G.beuhItemInfo(c.item);
            const have = B.inv[c.item] || 0;
            const can = have >= c.qty;
            return `<div class="beuh-card">
                <div style="display:flex;gap:10px;align-items:center">
                    <div class="beuh-avatar${c.shady ? ' shady' : ''}"><svg viewBox="0 0 64 64">${habitantArt(c.look)}</svg></div>
                    <div class="beuh-item-main">
                        <b>${esc(c.name)} ${c.shady ? '<span style="color:#fb7185;font-size:11px">· ⚠️ Louche</span>' : ''}</b>
                        <small>${esc(c.sub)}</small>
                        <small style="color:#e6f4ea;margin-top:4px">Demande : <b>${esc(info ? info.name : c.item)} ×${c.qty}</b> (stock : ${have})</small>
                        <small style="color:#4ade80">Paie : <b>${fmt(c.pay)} 💵</b> · +${c.heat}% chaleur</small>
                    </div>
                </div>
                <div class="beuh-row-btns" style="margin-top:8px">
                    <button class="beuh-btn green" data-act="beuhSell" data-i="${i}" ${can ? '' : 'disabled'}>💵 Vendre</button>
                    <button class="beuh-btn purple" data-act="beuhNeg" data-i="${i}" ${can ? '' : 'disabled'}>🎲 Négocier +25%</button>
                    <button class="beuh-btn" data-act="beuhSkip" data-i="${i}">Écarter</button>
                </div>
            </div>`;
        })
        .join('');

    return `
        <div class="beuh-card">
            <div class="beuh-card-h">
                <h3>🚨 Indice de patrouille : ${Math.round(B.heat)} %</h3>
                <button class="beuh-btn blue" data-act="beuhLayLow" ${B.heat > 5 && B.clean >= layCost ? '' : 'disabled'}>🤫 Profil bas (${fmt(layCost)} 💶)</button>
            </div>
            <div class="beuh-prog"><i style="width:${Math.min(100, B.heat).toFixed(0)}%;background:linear-gradient(90deg,#fbbf24,#f43f5e)"></i></div>
            <p class="beuh-muted" style="margin:6px 0 0">À 100 %, une descente saisit une part du cash sale non blanchi (votre cash propre 💶 est toujours protégé). Méfiez-vous des clients trop polis…</p>
        </div>
        <div class="beuh-list">${clientsHtml}</div>`;
}

function renderFronts(B) {
    const rateMin = Math.round(G.beuhLaunderRate() * 60);
    const list = BEUH_FRONT_IDS.map(id => {
        const f = BEUH_FRONTS[id];
        const lvl = G.beuhFrontLvl(id);
        const cost = G.beuhFrontCost(id);
        const locked = B.lvl < f.lvl;
        const payDirty = id === 'laverie' && lvl === 0;
        const can = !locked && (payDirty ? B.dirty + B.clean >= cost : B.clean >= cost);
        return `<div class="beuh-item-row">
            ${beuhIconSvg(id)}
            <div class="beuh-item-main">
                <b>${esc(f.name)}${lvl ? ` <span style="color:#38bdf8">niv. ${lvl}</span>` : ''}</b>
                <small>${esc(f.tagline)}</small>
                <small style="color:#7dd3fc">Blanchit ${fmt(f.rate * 60 * Math.max(1, lvl))} 💵/min → +${Math.round((f.bonus - 1) * 100)} % bonus propre</small>
            </div>
            <button class="beuh-btn ${payDirty ? 'green' : 'blue'}" data-act="beuhBuyFront" data-id="${id}" ${can ? '' : 'disabled'}>${locked ? `Niv. ${f.lvl}` : `${lvl ? 'Améliorer' : 'Ouvrir'} (${fmt(cost)} ${payDirty ? '💵' : '💶'})`}</button>
        </div>`;
    }).join('');
    return `
        <div class="beuh-card">
            <div class="beuh-card-h">
                <h3>🧼 Blanchiment actif : ${fmt(rateMin)} 💵/min</h3>
                <span class="beuh-muted">Total blanchi : ${fmt(Math.round(B.stats.laundered || 0))} 💶</span>
            </div>
            <p class="beuh-muted" style="margin:0">Vos façades convertissent automatiquement votre cash sale (💵) en cash propre (💶) intouchable par les patrouilles.</p>
        </div>
        <div class="beuh-list">${list}</div>`;
}

function renderMarket(B) {
    const ups = BEUH_UPGRADE_IDS.map(id => {
        const u = BEUH_UPGRADES[id];
        const lvl = G.beuhUpLvl(id);
        const cost = G.beuhUpCost(id);
        const maxed = lvl >= u.maxLvl;
        const sym = u.currency === 'clean' ? '💶' : '💵';
        const can = !maxed && (u.currency === 'clean' ? B.clean >= cost : B.dirty + B.clean >= cost);
        return `<div class="beuh-item-row">
            <div class="beuh-item-main">
                <b>${esc(u.name)} <span style="color:#c084fc">${lvl}/${u.maxLvl}</span></b>
                <small>${esc(u.desc)}</small>
            </div>
            <button class="beuh-btn ${u.currency === 'clean' ? 'blue' : 'green'}" data-act="beuhBuyUp" data-id="${id}" ${can ? '' : 'disabled'}>${maxed ? 'Max' : `${fmt(cost)} ${sym}`}</button>
        </div>`;
    }).join('');

    const stockKeys = Object.keys(B.inv).filter(k => (B.inv[k] || 0) > 0);
    const stockHtml = stockKeys.length
        ? stockKeys
              .map(k => {
                  const info = G.beuhItemInfo(k);
                  const q = B.inv[k];
                  const quickPrice = Math.round((info ? info.sell : 50) * 0.78);
                  return `<div class="beuh-item-row">
                      ${beuhIconSvg(k)}
                      <div class="beuh-item-main">
                          <b>${esc(info ? info.name : k)} ×${fmt(q)}</b>
                          <small>Revente gros immédiate : ${fmt(quickPrice)} 💵/u</small>
                      </div>
                      <button class="beuh-btn" data-act="beuhQuickSell" data-id="${k}" data-q="${q}">Vendre tout</button>
                  </div>`;
              })
              .join('')
        : '<p class="beuh-muted" style="text-align:center;margin:6px 0">Stock vide : récoltez dans la Planque ou fabriquez dans l’Atelier.</p>';

    return `
        <div class="beuh-card">
            <div class="beuh-card-h"><h3>⚡ Équipement de la cave</h3></div>
            <div class="beuh-list">${ups}</div>
        </div>
        <div class="beuh-card">
            <div class="beuh-card-h"><h3>📦 Stock du sous-sol (revente gros)</h3><span class="beuh-muted">Récoltes : ${fmt(B.stats.harvested || 0)} · Ventes : ${fmt(B.stats.sold || 0)}</span></div>
            <div class="beuh-list">${stockHtml}</div>
        </div>`;
}

export function renderBeuh() {
    if (!open || !G.beuhUnlocked()) return;
    const root = ensureRoot();
    root.hidden = false;
    const B = G.ensureBeuh();
    const xpPct = B.lvl >= BEUH_MAX_LVL ? 100 : Math.min(100, (B.xp / beuhXpReq(B.lvl)) * 100);
    const readyPlots = B.plots.filter(p => p.ready).length;
    const readyCrafts = Object.values(B.stations).reduce((n, st) => n + ((st && st.ready && st.ready.length) || 0), 0);
    const readySales = B.clients.filter(c => !c.shady && (B.inv[c.item] || 0) >= c.qty).length;

    const prevBody = root.querySelector('.beuh-body');
    const prevScroll = prevBody ? prevBody.scrollTop : 0;

    const bodyHtml =
        tab === 'cave'
            ? renderCave(B)
            : tab === 'labo'
              ? renderLabo(B)
              : tab === 'street'
                ? renderStreet(B)
                : tab === 'fronts'
                  ? renderFronts(B)
                  : renderMarket(B);

    const html = `
        <header class="beuh-hdr">
            <div class="beuh-top">
                <div class="beuh-brand">
                    <div class="beuh-logo">${beuhLogoSvg()}</div>
                    <div>
                        <div class="beuh-title">BEUH</div>
                        <div class="beuh-sub">Le Sous-Sol · Rang ${B.lvl}/${BEUH_MAX_LVL}</div>
                    </div>
                </div>
                <button class="beuh-exit" data-act="beuhExit">☀️ Remonter à Meuh</button>
            </div>
            <div class="beuh-xp"><i style="width:${xpPct.toFixed(1)}%"></i></div>
            <div class="beuh-stats">
                <div class="beuh-stat dirty">${beuhIconSvg('dirty')}<div><b>${fmt(Math.floor(B.dirty))} 💵</b><small>Cash sale</small></div></div>
                <div class="beuh-stat clean">${beuhIconSvg('clean')}<div><b>${fmt(Math.floor(B.clean))} 💶</b><small>Cash propre</small></div></div>
                <div class="beuh-stat heat${B.heat >= 70 ? ' hot' : ''}">${beuhIconSvg('heat')}<div><b>${Math.round(B.heat)} %</b><small>Police</small></div></div>
            </div>
        </header>
        ${B.lastNotice ? `<div class="beuh-notice">${esc(B.lastNotice)}</div>` : ''}
        <main class="beuh-body">${bodyHtml}</main>
        <nav class="beuh-nav">
            <button class="${tab === 'cave' ? 'on' : ''}" data-act="beuhTab" data-t="cave">🌿<span>Planque</span>${readyPlots ? `<i class="beuh-badge">${readyPlots}</i>` : ''}</button>
            <button class="${tab === 'labo' ? 'on' : ''}" data-act="beuhTab" data-t="labo">⚗️<span>Atelier</span>${readyCrafts ? `<i class="beuh-badge">${readyCrafts}</i>` : ''}</button>
            <button class="${tab === 'street' ? 'on' : ''}" data-act="beuhTab" data-t="street">🕶️<span>La Rue</span>${readySales ? `<i class="beuh-badge">${readySales}</i>` : ''}</button>
            <button class="${tab === 'fronts' ? 'on' : ''}" data-act="beuhTab" data-t="fronts">🧼<span>Façades</span></button>
            <button class="${tab === 'market' ? 'on' : ''}" data-act="beuhTab" data-t="market">🛒<span>Noir</span></button>
        </nav>`;

    patch(root, html);
    const nextBody = root.querySelector('.beuh-body');
    if (nextBody && prevBody) nextBody.scrollTop = prevScroll;
}

export function setupBeuh() {
    actions({
        // Easter egg caché sur le numéro de version dans Réglages > Aide
        beuhKnock: () => {
            if (G.beuhUnlocked()) {
                openBeuh();
                return;
            }
            const need = G.beuhEndgame() ? 3 : 7;
            knocks++;
            const left = need - knocks;
            if (left > 0) {
                const msg =
                    left === 1
                        ? 'Un verrou claque sous le plancher de la grange… encore 1 coup !'
                        : `Quelque chose résonne sous la grange… (${knocks}/${need})`;
                toast(msg, ['ui', 'info']);
            } else {
                knocks = 0;
                openBeuh();
            }
        },
        beuhOpen: () => openBeuh(),
        beuhExit: () => closeBeuh(),
        beuhTab: (el, d) => {
            tab = d.t || 'cave';
            renderBeuh();
        },
        beuhSel: (el, d) => {
            G.beuhSelectStrain(d.id);
            renderBeuh();
        },
        beuhPlotTap: (el, d) => {
            const B = G.ensureBeuh();
            const i = +d.i;
            const p = B.plots[i];
            if (!p) return;
            if (!p.strain) G.beuhPlant(i);
            else if (p.ready) G.beuhHarvest(i);
            else if (!p.watered) G.beuhWater(i);
            renderBeuh();
        },
        beuhPlantAll: () => {
            G.beuhPlantAll();
            renderBeuh();
        },
        beuhWaterAll: () => {
            G.beuhWaterAll();
            renderBeuh();
        },
        beuhHarvestAll: () => {
            G.beuhHarvestAll();
            renderBeuh();
        },
        beuhBuySeed: (el, d) => {
            G.beuhBuySeed(d.id, +(d.q || 5));
            renderBeuh();
        },
        beuhExpand: () => {
            G.beuhExpandPlot();
            renderBeuh();
        },
        beuhBuyStation: (el, d) => {
            G.beuhBuyStation(d.id);
            renderBeuh();
        },
        beuhCraft: (el, d) => {
            G.beuhStartCraft(d.id);
            renderBeuh();
        },
        beuhCollect: (el, d) => {
            G.beuhCollectCraft(d.id);
            renderBeuh();
        },
        beuhSell: (el, d) => {
            G.beuhSellClient(+d.i, false);
            renderBeuh();
        },
        beuhNeg: (el, d) => {
            G.beuhSellClient(+d.i, true);
            renderBeuh();
        },
        beuhSkip: (el, d) => {
            G.beuhDismissClient(+d.i);
            renderBeuh();
        },
        beuhLayLow: () => {
            G.beuhLayLow();
            renderBeuh();
        },
        beuhBuyFront: (el, d) => {
            G.beuhBuyFront(d.id);
            renderBeuh();
        },
        beuhBuyUp: (el, d) => {
            G.beuhBuyUpgrade(d.id);
            renderBeuh();
        },
        beuhQuickSell: (el, d) => {
            G.beuhQuickSell(d.id, +(d.q || 1));
            renderBeuh();
        },
    });
    // raccourci clavier Échap pour remonter à la ferme quand on est dans BEUH
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && open) closeBeuh();
    });
}
