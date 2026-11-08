// Heum — les formats de nombres et de durées (français).
export function fmt(n) {
    n = Math.floor(n);
    if (!Number.isFinite(n)) return '∞';
    if (n >= 1e6) return (n / 1e6).toFixed(1).replace('.0', '').replace('.', ',') + 'M';
    if (n >= 1e4) return (n / 1e3).toFixed(1).replace('.0', '').replace('.', ',') + 'k';
    return n.toLocaleString('fr-FR');
}
export function dur(s) {
    s = Math.max(0, Math.ceil(s));
    const h = Math.floor(s / 3600),
        m = Math.floor((s % 3600) / 60),
        r = s % 60;
    if (h) return `${h} h ${String(m).padStart(2, '0')}`;
    if (m) return `${m} min${r ? ' ' + String(r).padStart(2, '0') : ''}`;
    return `${r} s`;
}
export const pct = x => Math.round(x) + ' %';
