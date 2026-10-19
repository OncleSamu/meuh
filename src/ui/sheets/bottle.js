// 1.15.3 : la bouteille en grand (millésime, cuvée, étiquette), ouverte en touchant la bouteille en cave.
import * as G from '../../systems/index.js';
import { fmt } from '../../core/format.js';
import { wineBottle, LABEL_STYLES } from '../../art/items2.js';
import { btn, empty } from '../kit.js';
import { defineSheet } from '../sheets.js';
import { renameBtn } from './rename.js';

export const bottleSvg = (l, size = 200) =>
    `<svg class="bottle-big" viewBox="14 0 44 64" width="${size * 0.69}" height="${size}">${wineBottle(l.id, { year: l.vy, vq: l.vq, ls: l.ls, zoom: true })}</svg>`;

defineSheet('bottle', {
    title: o => {
        const l = G.findLot(o.uid);
        return l ? G.lotName(l) : 'Bouteille';
    },
    render(o) {
        const l = G.findLot(o.uid);
        if (!l) return empty('Cette bouteille n’est plus là.');
        const v = G.vintageOf(l);
        const st = LABEL_STYLES[l.ls || 0].name;
        return `<div class="bottle-view">
            ${bottleSvg(l)}
            <div class="bottle-info">
                <div class="bottle-year">${v ? `An ${l.vy}` : ''}</div>
                <div class="card-sub">${v ? v.name : ''} · ${G.rankName(l)}</div>
                <div class="card-sub">${l.n} bouteille${l.n > 1 ? 's' : ''} · vaut ${fmt(G.lotValue(l))}</div>
                <div class="card-sub">Étiquette : ${st}</div>
                <div class="row-btns">${btn('Changer l’étiquette', { act: 'cycleLabel', data: { uid: l.uid }, size: 'sm' })}${renameBtn('lot', l.uid, 'Nommer la cuvée')}</div>
            </div>
        </div>`;
    },
});
