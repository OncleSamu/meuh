// Les formats de nombres, de durées et de textes (français).

export function fmt(n) {
    n = Math.floor(n);
    if (!Number.isFinite(n)) return '∞';
    // 1.59 : au-delà de mille milliards, les milliards restent groupés (« 12 400 Md »), jamais en écriture scientifique
    if (n >= 1e12) return n >= 1e21 ? '∞' : Math.round(n / 1e9).toLocaleString('fr-FR') + ' Md';
    if (n >= 1e9)
        return (
            (n / 1e9)
                .toFixed(n >= 1e10 ? 0 : 1)
                .replace('.0', '')
                .replace('.', ',') + ' Md'
        );
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
    if (h >= 48) return `${Math.floor(h / 24)} j ${h % 24} h`;
    // 1.59 : pas de « 45 min 00 » ni de « 2 h 00 » : une durée ronde s'écrit ronde
    if (h > 0) return m ? `${h} h ${String(m).padStart(2, '0')}` : `${h} h`;
    if (m > 0) return r ? `${m} min ${String(r).padStart(2, '0')}` : `${m} min`;
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

// pluriel d'un nom de produit : « pomme de terre » → « pommes de terre », « patate douce » → « patates douces »
// (le nom et ses adjectifs jusqu'au premier « de », « d' », « à », « au », « aux », « en »)
const plWord = w => {
    if (/[sxz]$/i.test(w) || w.includes('-')) return w;
    if (/^bleu$/i.test(w)) return w + 's';
    if (/^chou$/i.test(w)) return w + 'x';
    if (/(eau|au|eu)$/i.test(w)) return w + 'x';
    if (/al$/i.test(w)) return w.slice(0, -2) + 'aux';
    return w + 's';
};
export function pluralFr(name) {
    const words = name.split(' ');
    let stop = false;
    return words
        .map((w, k) => {
            if (stop || (k > 0 && /^(de|du|des|à|au|aux|en|d[’'].*)$/i.test(w)) || /^d[’']/i.test(w)) {
                stop = true;
                return w;
            }
            return plWord(w);
        })
        .join(' ');
}
// « 5 oignons », « 1 pomme de terre » (en minuscules, comme dans une phrase)
export const qtyName = (n, name) => `${fmt(n)} ${(n > 1 ? pluralFr(name) : name).toLowerCase()}`;
