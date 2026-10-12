// Les formats de nombres, de durées et de textes (français).

export function fmt(n) {
    n = Math.floor(n);
    if (n >= 1e6)
        return (
            (n / 1e6)
                .toFixed(n >= 1e7 ? 0 : 1)
                .replace('.0', '')
                .replace('.', ',') + 'M'
        );
    if (n >= 1e4)
        return (
            (n / 1e3)
                .toFixed(n >= 1e5 ? 0 : 1)
                .replace('.0', '')
                .replace('.', ',') + 'k'
        );
    return n.toLocaleString('fr-FR');
}

// format court pour les petites places (barre d'expérience) : 1,2k dès 1 000
export const fmtK = n => (n >= 1000 && n < 1e4 ? (Math.floor(n / 100) / 10).toFixed(1).replace('.0', '').replace('.', ',') + 'k' : fmt(n));

export function formatDuration(s) {
    s = Math.max(0, Math.ceil(s));
    const h = Math.floor(s / 3600),
        m = Math.floor((s % 3600) / 60),
        r = s % 60;
    if (h > 0) return `${h} h ${String(m).padStart(2, '0')}`;
    if (m > 0) return `${m} min ${String(r).padStart(2, '0')}`;
    return `${r} s`;
}

export const fmtTime = s => {
    const h = Math.floor(s / 3600),
        m = Math.floor((s % 3600) / 60);
    return h ? `${h} h ${String(m).padStart(2, '0')}` : `${m} min`;
};

export const dateKey = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

// « s » si pluriel
export const s = n => (n > 1 ? 's' : '');

// textes à trous des données : {n} nombre formaté, {s} pluriel, {x} valeur
export const fill = (text, n, x) =>
    text
        .replace(/\{n\}/g, fmt(n))
        .replace(/\{s\}/g, n > 1 ? 's' : '')
        .replace(/\{x\}/g, x);

export const pct = (x, digits = 0) => `${(x * 100).toFixed(digits).replace('.', ',')} %`;
// prix arrondi à 5 pièces, jamais moins de 5
export const round5 = n => Math.max(5, Math.round(n / 5) * 5);
export const pickRand = list => list[Math.floor(Math.random() * list.length)];
