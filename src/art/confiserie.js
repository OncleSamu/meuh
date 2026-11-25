// 1.178 : Dessins SVG vectoriels 100 % maison pour l'Atelier Confiserie (0 émoji).
// 9 silhouettes (Tablette, Truffe, Rocher, Papillote, Pavé, Pot, Berlingot, Sucette, Pastille) + icône UI confiserie.

const INK = '#3a2618';

export function confUiIcon() {
    // Berlingot rayé rose + carré de chocolat brillant + caramel doré
    return (
        `<ellipse cx="32" cy="56" rx="22" ry="4" fill="${INK}" opacity=".16"/>` +
        // Carré de chocolat à gauche
        `<rect x="8" y="22" width="24" height="24" rx="4" fill="#5a311e" stroke="${INK}" stroke-width="2.4"/>` +
        `<rect x="13" y="27" width="14" height="14" rx="2" fill="#7a462c" stroke="${INK}" stroke-width="1.4"/>` +
        `<path d="M14 28 L20 28 L14 34Z" fill="#fff" opacity=".28"/>` +
        // Berlingot rayé à droite
        `<path d="M36 16 L54 24 L48 48 L28 42Z" fill="#f26a8d" stroke="${INK}" stroke-width="2.4" stroke-linejoin="round"/>` +
        `<path d="M33 26 L51 32 M30 35 L49 41" stroke="#fff7e6" stroke-width="3.2" stroke-linecap="round"/>` +
        `<path d="M36 16 L54 24 L48 48 L28 42Z" fill="none" stroke="${INK}" stroke-width="2.4" stroke-linejoin="round"/>` +
        // Caramel papillote devant
        `<path d="M16 46 L10 42 L10 52 L16 48Z M44 46 L50 42 L50 52 L44 48Z" fill="#f5c451" stroke="${INK}" stroke-width="1.8" stroke-linejoin="round"/>` +
        `<rect x="16" y="40" width="28" height="14" rx="5" fill="#d98324" stroke="${INK}" stroke-width="2.2"/>` +
        `<path d="M20 44 L36 44" stroke="#fff4d6" stroke-width="2.2" stroke-linecap="round" opacity=".7"/>`
    );
}

export function confSvg(c = {}) {
    const shape = c.shape || (c.kind === 'caramel' ? 'papillote' : c.kind === 'berlingot' ? 'berlingot' : 'tablette');
    const col = c.baseCol || '#5a311e';
    const col2 = c.baseCol2 || '#3a1b0e';
    const acc = c.accentCol || '#f5c842';
    const classic = !!c.classic;
    const mirror = !!c.mirror;
    let body = `<ellipse cx="32" cy="57" rx="20" ry="3.5" fill="${INK}" opacity=".16"/>`;

    if (shape === 'tablette') {
        body +=
            `<rect x="14" y="10" width="36" height="44" rx="5" fill="${col}" stroke="${INK}" stroke-width="2.6"/>` +
            `<rect x="18" y="14" width="12" height="11" rx="2" fill="${col2}" opacity=".45" stroke="${INK}" stroke-width="1.3"/>` +
            `<rect x="34" y="14" width="12" height="11" rx="2" fill="${col2}" opacity=".45" stroke="${INK}" stroke-width="1.3"/>` +
            `<rect x="18" y="28" width="12" height="11" rx="2" fill="${col2}" opacity=".45" stroke="${INK}" stroke-width="1.3"/>` +
            `<rect x="34" y="28" width="12" height="11" rx="2" fill="${col2}" opacity=".45" stroke="${INK}" stroke-width="1.3"/>` +
            `<rect x="18" y="42" width="28" height="8" rx="2" fill="${acc}" opacity=".9" stroke="${INK}" stroke-width="1.3"/>` +
            `<circle cx="24" cy="19" r="2.2" fill="${acc}"/><circle cx="40" cy="33" r="2.2" fill="${acc}"/>`;
    } else if (shape === 'truffe') {
        body +=
            `<circle cx="23" cy="40" r="13" fill="${col2}" stroke="${INK}" stroke-width="2.4"/>` +
            `<circle cx="41" cy="40" r="13" fill="${col}" stroke="${INK}" stroke-width="2.4"/>` +
            `<circle cx="32" cy="25" r="14" fill="${col}" stroke="${INK}" stroke-width="2.5"/>` +
            `<path d="M23 23 Q32 16 41 23" fill="none" stroke="${acc}" stroke-width="3" stroke-linecap="round"/>` +
            `<circle cx="27" cy="28" r="1.8" fill="${acc}"/><circle cx="36" cy="27" r="1.8" fill="${acc}"/><circle cx="32" cy="20" r="1.6" fill="#fff" opacity=".65"/>`;
    } else if (shape === 'rocher') {
        body +=
            `<path d="M16 48 Q12 34 20 22 Q28 12 38 16 Q50 22 49 38 Q48 50 32 51 Q18 51 16 48Z" fill="${col}" stroke="${INK}" stroke-width="2.6"/>` +
            `<polygon points="24,25 29,22 28,28" fill="${acc}" stroke="${INK}" stroke-width="1.1"/>` +
            `<polygon points="36,24 42,27 37,31" fill="${acc}" stroke="${INK}" stroke-width="1.1"/>` +
            `<polygon points="25,38 31,35 30,42" fill="${acc}" stroke="${INK}" stroke-width="1.1"/>` +
            `<polygon points="37,39 43,36 42,43" fill="${acc}" stroke="${INK}" stroke-width="1.1"/>` +
            `<circle cx="32" cy="31" r="2.6" fill="${acc}" stroke="${INK}" stroke-width="1"/>`;
    } else if (shape === 'papillote') {
        body +=
            `<path d="M16 28 L6 19 L9 32 L6 45 L16 36Z" fill="${acc}" stroke="${INK}" stroke-width="2.2" stroke-linejoin="round"/>` +
            `<path d="M48 28 L58 19 L55 32 L58 45 L48 36Z" fill="${acc}" stroke="${INK}" stroke-width="2.2" stroke-linejoin="round"/>` +
            `<rect x="15" y="19" width="34" height="26" rx="9" fill="${col}" stroke="${INK}" stroke-width="2.6"/>` +
            `<path d="M20 25 L44 25" stroke="#fff7e2" stroke-width="2.6" stroke-linecap="round" opacity=".65"/>` +
            `<path d="M24 38 L40 38" stroke="${acc}" stroke-width="2.6" stroke-linecap="round"/>`;
    } else if (shape === 'pave') {
        body +=
            `<polygon points="12,30 32,16 52,30 32,44" fill="${col}" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/>` +
            `<polygon points="12,30 32,44 32,54 12,40" fill="${col2}" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/>` +
            `<polygon points="52,30 32,44 32,54 52,40" fill="${col}" opacity=".85" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/>` +
            `<circle cx="28" cy="27" r="2.2" fill="#fffdf6"/><circle cx="36" cy="30" r="1.8" fill="#fffdf6"/><circle cx="32" cy="23" r="2" fill="${acc}"/>`;
    } else if (shape === 'pot') {
        body +=
            `<rect x="16" y="20" width="32" height="33" rx="8" fill="${col}" stroke="${INK}" stroke-width="2.6"/>` +
            `<rect x="19" y="12" width="26" height="8" rx="3" fill="${acc}" stroke="${INK}" stroke-width="2.4"/>` +
            `<rect x="21" y="29" width="22" height="14" rx="4" fill="#fff8e6" stroke="${INK}" stroke-width="1.6"/>` +
            `<circle cx="32" cy="36" r="4.2" fill="${acc}"/>` +
            `<path d="M21 23 L21 48" stroke="#fff" stroke-width="2.4" stroke-linecap="round" opacity=".35"/>`;
    } else if (shape === 'sucette') {
        body +=
            `<path d="M32 39 L32 56" stroke="#f7eed9" stroke-width="4.5" stroke-linecap="round"/>` +
            `<path d="M32 39 L32 56" stroke="${INK}" stroke-width="1.8" stroke-linecap="round" opacity=".5"/>` +
            `<circle cx="32" cy="25" r="17" fill="${col}" stroke="${INK}" stroke-width="2.6"/>` +
            `<path d="M32 25 C32 20 39 20 39 26 C39 33 25 34 24 25 C23 16 42 14 44 26" fill="none" stroke="${acc}" stroke-width="3.4" stroke-linecap="round"/>` +
            `<path d="M22 17 Q27 13 33 14" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" opacity=".7"/>`;
    } else if (shape === 'pastille') {
        body +=
            `<circle cx="23" cy="39" r="12" fill="${acc}" stroke="${INK}" stroke-width="2.3"/>` +
            `<circle cx="41" cy="38" r="12" fill="${col2}" stroke="${INK}" stroke-width="2.3"/>` +
            `<circle cx="32" cy="24" r="13" fill="${col}" stroke="${INK}" stroke-width="2.5"/>` +
            `<circle cx="32" cy="24" r="7" fill="none" stroke="#fff8e8" stroke-width="2" stroke-dasharray="3 3"/>` +
            `<circle cx="27" cy="19" r="2.2" fill="#fff" opacity=".7"/>`;
    } else {
        // berlingot rayé bicolore
        body +=
            `<path d="M32 10 L52 38 Q53 48 42 50 L22 50 Q11 48 12 38Z" fill="${col}" stroke="${INK}" stroke-width="2.6" stroke-linejoin="round"/>` +
            `<path d="M22 25 L43 27 M17 34 L48 36 M15 43 L49 44" stroke="${acc}" stroke-width="3.6" stroke-linecap="round"/>` +
            `<path d="M28 16 L36 16" stroke="#fff" stroke-width="2.4" stroke-linecap="round" opacity=".75"/>` +
            `<path d="M32 10 L52 38 Q53 48 42 50 L22 50 Q11 48 12 38Z" fill="none" stroke="${INK}" stroke-width="2.6" stroke-linejoin="round"/>`;
    }

    // Reflet miroir (3★ au mini-jeu)
    if (mirror) {
        body +=
            `<path d="M47 13 L49 17 L53 19 L49 21 L47 25 L45 21 L41 19 L45 17Z" fill="#fff7b8" stroke="${INK}" stroke-width="1.2"/>` +
            `<circle cx="16" cy="16" r="2.2" fill="#fff7b8"/>`;
    }
    // Bande / sceau doré pour les Grands Classiques
    if (classic) {
        body += `<circle cx="50" cy="48" r="8" fill="#f5b700" stroke="${INK}" stroke-width="2"/><path d="M50 43.5 L51.4 46.6 L54.8 47 L52.2 49.2 L53 52.5 L50 50.8 L47 52.5 L47.8 49.2 L45.2 47 L48.6 46.6Z" fill="#fff9d6"/>`;
    }

    return `<svg viewBox="0 0 64 64" class="spr conf-spr" aria-hidden="true">${body}</svg>`;
}
