// Les fonds des cartes du village, du hameau, du port, de l'alpage et du domaine.
export const MAP_BG = {
    village: `<svg class="vmap-bg" viewBox="0 0 160 110" preserveAspectRatio="none" aria-hidden="true">
    <rect width="160" height="110" fill="#9bd96f"/>
    <path d="M0 18 Q40 22 80 18 T160 20" stroke="#8b6a4a" stroke-width="2.4" fill="none" stroke-dasharray="1.2 2.4"/>
    <path d="M0 16 Q40 20 80 16 T160 18 M0 20 Q40 24 80 20 T160 22" stroke="#6d6457" stroke-width=".8" fill="none"/>
    <path d="M24 34 Q50 52 80 58 Q110 60 132 38 M80 58 L80 22 M80 58 Q60 75 42 76 M80 58 Q100 76 118 76" stroke="#f2d6a2" stroke-width="7" fill="none" stroke-linecap="round"/>
    <path d="M118 110 Q130 92 160 88 L160 110Z" fill="#5aa9e6"/>
    <path d="M128 102 Q136 97 146 98" stroke="#bfe6fb" stroke-width="1" fill="none"/>
    <g fill="#6cc04a"><circle cx="6" cy="60" r="5"/><circle cx="10" cy="98" r="6"/><circle cx="152" cy="56" r="5"/><circle cx="98" cy="100" r="4"/><circle cx="62" cy="98" r="5"/></g>
</svg>`,
    hamlet: `<svg class="vmap-bg" viewBox="0 0 160 110" preserveAspectRatio="none" aria-hidden="true">
    <rect width="160" height="110" fill="#a7d978"/>
    <path d="M0 62 Q30 50 60 60 Q90 70 120 58 Q140 50 160 54 L160 68 Q140 64 120 72 Q90 84 60 74 Q30 64 0 76Z" fill="#5aa9e6"/>
    <path d="M10 68 Q20 65 30 67 M96 72 Q106 69 116 70" stroke="#bfe6fb" stroke-width="1" fill="none"/>
    <path d="M36 0 Q34 30 34 60 M34 80 Q40 92 80 96 Q110 98 128 90 M80 96 L80 44 Q80 36 30 30 M80 44 Q110 40 130 36" stroke="#f2d6a2" stroke-width="6" fill="none" stroke-linecap="round"/>
    <path d="M0 18 Q20 6 46 14 Q70 2 100 10 Q130 0 160 12 L160 0 L0 0Z" fill="#8cc760"/>
    <g fill="#6cc04a"><circle cx="8" cy="40" r="5"/><circle cx="150" cy="96" r="6"/><circle cx="64" cy="22" r="4"/><circle cx="118" cy="100" r="5"/><circle cx="150" cy="24" r="4"/></g>
</svg>`,
    port: `<svg class="vmap-bg" viewBox="0 0 160 110" preserveAspectRatio="none" aria-hidden="true">
    <rect width="160" height="110" fill="#5aa9e6"/>
    <path d="M0 0 L160 0 L160 46 Q120 52 90 44 Q60 36 30 46 Q12 52 0 48Z" fill="#e9d6a8"/>
    <path d="M0 0 L160 0 L160 30 Q120 36 80 28 Q40 20 0 30Z" fill="#9bd96f"/>
    <path d="M10 70 Q20 67 30 69 M70 82 Q80 79 90 81 M120 64 Q130 61 140 63 M40 96 Q50 93 60 95" stroke="#bfe6fb" stroke-width="1" fill="none"/>
    <path d="M70 46 L70 76 L100 76 L100 70 L76 70 L76 46Z" fill="#a8693a" opacity=".9"/>
</svg>`,
    alpine: `<svg class="vmap-bg" viewBox="0 0 160 110" preserveAspectRatio="none" aria-hidden="true">
    <rect width="160" height="110" fill="#bfe6fb"/>
    <path d="M0 50 L30 14 L52 38 L78 6 L104 34 L128 12 L160 44 L160 110 L0 110Z" fill="#8f9aa6"/>
    <path d="M24 22 L30 14 L36 22 L33 20 L30 24 L27 20Z M72 14 L78 6 L84 14 L81 12 L78 16 L75 12Z M122 20 L128 12 L134 20 L131 18 L128 22 L125 18Z" fill="#fff"/>
    <path d="M0 58 Q40 40 80 52 Q120 62 160 48 L160 110 L0 110Z" fill="#9bd96f"/>
    <path d="M20 100 Q50 80 80 92 Q110 100 140 84" stroke="#f2d6a2" stroke-width="5" fill="none" stroke-linecap="round"/>
    <g fill="#3f8f2e"><path d="M8 72 L12 62 L16 72Z"/><path d="M140 70 L144 60 L148 70Z"/><path d="M110 104 L114 94 L118 104Z"/></g>
</svg>`,
    domaine: `<svg class="vmap-bg" viewBox="0 0 160 110" preserveAspectRatio="none" aria-hidden="true">
    <rect width="160" height="110" fill="#bfe6fb"/>
    <path d="M0 40 Q40 18 80 30 Q120 42 160 22 L160 110 L0 110Z" fill="#b7d97a"/>
    <path d="M0 62 Q50 44 100 56 Q130 62 160 50 L160 110 L0 110Z" fill="#9bd96f"/>
    <g stroke="#5e8f2e" stroke-width="1.6" stroke-linecap="round" fill="none" opacity=".75">
        <path d="M6 48 Q40 30 76 40"/><path d="M8 54 Q42 36 78 46"/><path d="M96 40 Q128 30 156 26"/><path d="M98 46 Q130 36 158 32"/>
    </g>
    <g fill="#7a3f8f" opacity=".8"><circle cx="20" cy="44" r="1.3"/><circle cx="44" cy="38" r="1.3"/><circle cx="62" cy="42" r="1.3"/><circle cx="118" cy="36" r="1.3"/><circle cx="140" cy="30" r="1.3"/></g>
    <path d="M10 104 Q60 82 90 92 Q120 100 150 80" stroke="#f2d6a2" stroke-width="5" fill="none" stroke-linecap="round"/>
    <path d="M40 18 Q52 6 64 18Z" fill="#e9e2d0" opacity=".8"/>
</svg>`,
    island: `<svg class="vmap-bg" viewBox="0 0 160 110" preserveAspectRatio="none" aria-hidden="true">
    <rect width="160" height="110" fill="#4fb3d9"/>
    <path d="M6 20 Q16 17 26 20 M120 14 Q130 11 140 14 M136 96 Q146 93 156 96 M60 104 Q70 101 80 104" stroke="#bfe6fb" stroke-width="1" fill="none"/>
    <path d="M18 64 Q10 40 34 26 Q60 10 100 14 Q140 18 150 46 Q156 78 124 92 Q90 104 54 98 Q22 92 18 64Z" fill="#f2dfa8"/>
    <path d="M30 60 Q26 42 44 32 Q66 20 98 24 Q130 28 138 50 Q142 74 116 84 Q88 92 58 88 Q34 82 30 60Z" fill="#7fcf5a"/>
    <path d="M24 70 Q50 64 80 70 Q110 76 136 66" stroke="#f2d6a2" stroke-width="5" fill="none" stroke-linecap="round"/>
    <g fill="#3f8f2e"><circle cx="46" cy="44" r="5"/><circle cx="112" cy="40" r="6"/><circle cx="96" cy="58" r="4"/><circle cx="62" cy="58" r="5"/></g>
    <g stroke="#8b5a2b" stroke-width="1.6" fill="none"><path d="M42 40 L44 52"/><path d="M110 34 L112 48"/></g>
    <path d="M0 74 L18 72 L18 78 L0 80Z" fill="#a8693a"/>
</svg>`,
};
