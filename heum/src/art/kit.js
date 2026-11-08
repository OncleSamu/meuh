// Heum — outils de dessin : mêmes gestes que Meuh (contour épais, aplats), palette de terre brûlée.
export const O = '#2e2620';
export const st = (w = 2.5) => `stroke="${O}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;
export const P = (d, f, w) => `<path d="${d}" fill="${f}" ${st(w)}/>`;
export const C = (x, y, r, f, w) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${f}" ${st(w)}/>`;
export const E = (x, y, rx, ry, f, rot = 0, w) =>
    `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${f}" ${st(w)}${rot ? ` transform="rotate(${rot} ${x} ${y})"` : ''}/>`;
export const R = (x, y, w, h, r, f, sw) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${f}" ${st(sw)}/>`;
export const L = (d, w = 2.5, c = O) => `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
export const F = (d, f, o = 1) => `<path d="${d}" fill="${f}" opacity="${o}"/>`;
export const FC = (x, y, r, f, o = 1) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${f}" opacity="${o}"/>`;
export const FE = (x, y, rx, ry, f, o = 1) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${f}" opacity="${o}"/>`;
export const HL = (x, y, rx, ry) => FE(x, y, rx, ry, '#fff', 0.45);
export const SHADOW = (y = 58, rx = 18) => FE(32, y, rx, 3.5, '#000', 0.18);
// une lueur toxique derrière les mutants
export const GLOW = (x = 32, y = 34, r = 26) => `<circle cx="${x}" cy="${y}" r="${r}" fill="url(#hglow)"/>`;
const DEFS = `<defs><radialGradient id="hglow"><stop offset="0" stop-color="#d8ff5a" stop-opacity=".85"/><stop offset="1" stop-color="#d8ff5a" stop-opacity="0"/></radialGradient></defs>`;
export const svg = (body, vb = '0 0 64 64') => `<svg viewBox="${vb}" xmlns="http://www.w3.org/2000/svg">${body.includes('hglow') ? DEFS : ''}${body}</svg>`;
// pour intégrer un dessin dans un autre, à l'échelle s/64
export const sub = (fn, x, y, s) => `<g transform="translate(${x} ${y}) scale(${s / 64})">${fn()}</g>`;
