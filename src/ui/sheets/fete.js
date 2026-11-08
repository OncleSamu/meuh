// 1.100 (étape 4) : la fête de la vallée, le bilan de la partie et le générique (une seule fenêtre, trois pages).
import { state } from '../../core/state.js';
import { fmt, formatDuration } from '../../core/format.js';
import { FETE } from '../../data/fete.js';
import * as G from '../../systems/index.js';
import { esc } from '../dom.js';
import { ico, art } from '../icons.js';
import { empty } from '../kit.js';
import { defineSheet } from '../sheets.js';

const TITLES = { scene: FETE.title, bilan: 'Le bilan de la partie', credits: 'Le générique' };
const row = (label, v) => `<div class="od-line"><span><b>${label}</b></span><b>${v}</b></div>`;
function bilanPage() {
    const b = (state.fete && state.fete.bilan) || G.valleeBilan();
    const brand = b.brand ? row('Votre marque', esc(b.brand)) : '';
    return `<div class="card camp-card"><div class="card-title">Toute la partie</div>
        ${row('Jours à la ferme', fmt(b.day))}${row('Niveau', b.level)}${row('Temps de jeu', formatDuration(b.playSec))}
        ${row('Récoltes', fmt(b.harvested))}${row('Produits fabriqués', fmt(b.crafted))}${row('Commandes livrées', fmt(b.orders))}
        ${row('Chapitres de l’histoire terminés', b.chapters)}</div>
        <div class="card camp-card"><div class="card-title">Le camping et la Maison</div>
        ${row('Campeurs accueillis', fmt(b.guests))}${row('Campeurs repartis ravis', fmt(b.happy))}${row('Résidents installés', b.residents)}${row('Amis à dix cœurs', b.friends)}
        ${row('Coffrets vendus', fmt(b.coffrets))}${brand}</div>`;
}
const face = (look, name, sub) => `<div class="credit"><span class="credit-av">${art('villager', look)}</span><span><b>${esc(name)}</b>${sub ? `<small>${esc(sub)}</small>` : ''}</span></div>`;
function creditsPage() {
    const c = G.valleeCredits();
    const cast = state.fete && state.fete.cast && state.fete.cast.length ? state.fete.cast : c.residents;
    return `<div class="credits"><p class="card-sub center">Une ferme, une vallée.</p>
        <h3>Les habitants de la vallée</h3>${c.villagers.map(v => face(v.id, v.name, v.role)).join('')}
        ${cast.length ? `<h3>Les campeurs devenus voisins</h3>${cast.map(r => face(r.look, r.name, r.job)).join('')}` : ''}
        ${c.passers.length ? `<h3>Les campeurs de passage</h3>${c.passers.map(p => face(p.look, p.name)).join('')}` : ''}
        ${c.brand ? `<h3>La Maison</h3><p class="card-sub center">${esc(c.brand)}</p>` : ''}
        <h3>Merci d’avoir joué</h3><p class="card-sub center">La vallée est à vous. Le jeu continue.</p></div>`;
}
defineSheet('fete', {
    title: o => TITLES[o.page] || FETE.title,
    render(o) {
        if (!G.valleeDone()) return empty('La fête n’a pas encore eu lieu.');
        if (o.page === 'bilan') return bilanPage();
        if (o.page === 'credits') return creditsPage();
        return `<div class="fete-scene">${ico(['ui', 'heart'], 'ico huge')}${FETE.scene.map(t => `<p>${t}</p>`).join('')}</div>`;
    },
});
