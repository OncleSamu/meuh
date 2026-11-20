// 1.150 : Dessins SVG de La Grande Table Étoilée (icône cloche étoilée + scène de salle illustrée selon le style et les étoiles).
import { GTABLE_STYLES } from '../data/gtable.js';

const O = '#3a2618';

// Icône UI 64x64 : cloche gastronomique en argent + étoile d'or au sommet
export function gtableUiIcon() {
    return `<ellipse cx="32" cy="54" rx="24" ry="4.5" fill="rgba(58,38,24,0.18)"/>
        <path d="M8 47 H56 C56 51 48 53 32 53 C16 53 8 51 8 47 Z" fill="#f2c14e" stroke="${O}" stroke-width="2.4" stroke-linejoin="round"/>
        <path d="M12 47 C12 28 21 20 32 20 C43 20 52 28 52 47 Z" fill="#ebeef2" stroke="${O}" stroke-width="2.5" stroke-linejoin="round"/>
        <path d="M18 44 C19 32 24 25 30 24" fill="none" stroke="#ffffff" stroke-width="3.2" stroke-linecap="round" opacity="0.85"/>
        <circle cx="32" cy="18" r="3.4" fill="#f2c14e" stroke="${O}" stroke-width="2"/>
        <path d="M32 3 L34.6 8.8 L41 9.5 L36.2 13.7 L37.6 19.8 L32 16.5 L26.4 19.8 L27.8 13.7 L23 9.5 L29.4 8.8 Z" fill="#ffd23f" stroke="${O}" stroke-width="2" stroke-linejoin="round"/>`;
}

// Illustration panoramique de la salle (260x104) qui évolue avec le style, les étoiles et le parfum d'ambiance
export function gtableRoomSvg({ style = 'vichy', stars = 0, bib = false, open = false, scented = false } = {}) {
    const st = GTABLE_STYLES.find(s => s.id === style) || GTABLE_STYLES[0];
    const darkWall = style === 'velours' || style === 'cristal';
    const winSky = open ? '#24355a' : '#9ad8f8';
    const starColor = '#ffd23f';

    const starsRow = stars > 0
        ? Array.from({ length: stars }, (_, i) => {
              const cx = 130 + (i - (stars - 1) / 2) * 20;
              return `<path d="M${cx} 9 l2.2 4.8 5.2.6-3.8 3.4 1.1 5.1L${cx} 20.3 125.3 22.9z" fill="${starColor}" stroke="${O}" stroke-width="1.4"/>`.replace(
                  '125.3 22.9',
                  `${(cx - 4.7).toFixed(1)} 22.9 l1.1-5.1-3.8-3.4 5.2-.6`,
              );
          }).join('')
        : bib
          ? `<rect x="106" y="10" width="48" height="15" rx="7.5" fill="#d9483b" stroke="${O}" stroke-width="1.6"/><text x="130" y="21" text-anchor="middle" font-family="Nunito,sans-serif" font-size="9" font-weight="900" fill="#fff">BIB</text>`
          : '';

    const candleGlow = open
        ? `<circle cx="72" cy="60" r="16" fill="#ffd86b" opacity="0.28"/><circle cx="130" cy="60" r="18" fill="#ffd86b" opacity="0.32"/><circle cx="188" cy="60" r="16" fill="#ffd86b" opacity="0.28"/>`
        : '';

    const tableDraw = cx => `<g transform="translate(${cx} 68)">
        <ellipse cx="0" cy="22" rx="22" ry="4" fill="rgba(58,38,24,0.2)"/>
        <rect x="-3" y="8" width="6" height="14" fill="#6b4222" stroke="${O}" stroke-width="1.5"/>
        <path d="M-21 2 Q0 -4 21 2 L19 14 Q0 18 -19 14 Z" fill="${st.cloth}" stroke="${O}" stroke-width="2" stroke-linejoin="round"/>
        <path d="M-19 2 Q0 -3 19 2 Q0 6 -19 2 Z" fill="${st.cloth2}" stroke="${O}" stroke-width="1.4"/>
        <ellipse cx="-8" cy="1" rx="4.5" ry="2" fill="#fff" stroke="${O}" stroke-width="1.2"/>
        <ellipse cx="8" cy="1" rx="4.5" ry="2" fill="#fff" stroke="${O}" stroke-width="1.2"/>
        <rect x="-1.5" y="-6" width="3" height="7" rx="1" fill="#fff7dc" stroke="${O}" stroke-width="1.1"/>
        ${open ? '<circle cx="0" cy="-8.5" r="2.6" fill="#ffd23f"/>' : ''}
    </g>`;

    const scentWisps = scented
        ? `<g fill="none" stroke="#e4a6f7" stroke-width="1.8" stroke-linecap="round" opacity="0.72">
            <path d="M40 46 Q45 38 40 30 Q35 22 41 15"/>
            <path d="M220 46 Q215 38 220 30 Q225 22 219 15"/>
        </g>`
        : '';

    return `<svg class="gt-room-svg" viewBox="0 0 260 104" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect width="260" height="68" fill="${st.wall}"/>
        <rect y="68" width="260" height="36" fill="${darkWall ? '#5a3a24' : '#c99762'}"/>
        <line x1="0" y1="68" x2="260" y2="68" stroke="${O}" stroke-width="2.2"/>
        <!-- Fenêtres donnant sur la vallée -->
        <rect x="20" y="14" width="44" height="36" rx="6" fill="${winSky}" stroke="${O}" stroke-width="2"/>
        <path d="M20 42 Q36 34 64 40 L64 50 L20 50 Z" fill="${open ? '#2b4a3a' : '#7ec458'}"/>
        <path d="M42 14 V50 M20 32 H64" stroke="${O}" stroke-width="1.6"/>
        <rect x="196" y="14" width="44" height="36" rx="6" fill="${winSky}" stroke="${O}" stroke-width="2"/>
        <path d="M196 42 Q216 34 240 40 L240 50 L196 50 Z" fill="${open ? '#2b4a3a' : '#7ec458'}"/>
        <path d="M218 14 V50 M196 32 H240" stroke="${O}" stroke-width="1.6"/>
        <!-- Cadre central & distinctions -->
        <rect x="92" y="7" width="76" height="22" rx="8" fill="${darkWall ? '#2d1c22' : '#fff8e4'}" stroke="${st.accent}" stroke-width="2"/>
        ${starsRow || `<text x="130" y="21" text-anchor="middle" font-family="Nunito,sans-serif" font-size="9.5" font-weight="900" fill="${darkWall ? '#f6e7c8' : O}">LA TABLE</text>`}
        <!-- Lustre -->
        <path d="M130 29 V39 M112 39 H148" stroke="${st.accent}" stroke-width="2.2" stroke-linecap="round"/>
        <circle cx="114" cy="41" r="3" fill="#ffe68a" stroke="${O}" stroke-width="1.2"/>
        <circle cx="130" cy="42" r="3.4" fill="#ffe68a" stroke="${O}" stroke-width="1.2"/>
        <circle cx="146" cy="41" r="3" fill="#ffe68a" stroke="${O}" stroke-width="1.2"/>
        ${candleGlow}
        ${scentWisps}
        ${tableDraw(72)}
        ${tableDraw(130)}
        ${tableDraw(188)}
    </svg>`;
}
