// 1.73 : les onglets internes d'une page longue (Brasserie, Cave, Comice, Labo).
// innerTabs('brew', [[id, nom, icône, pastille]], défaut) → { cur, html } ; le choix est retenu (ui.sel['it:brew']).
import { segmented } from './kit.js';
import { ui } from './app.js';
import { actions } from './dom.js';

export function innerTabs(key, tabs, def, strip = false) {
    const want = ui.sel['it:' + key];
    const cur = tabs.some(t => t[0] === want) ? want : def && tabs.some(t => t[0] === def) ? def : tabs[0][0];
    return { cur, html: `<div class="inner-tabs${strip ? ' strip' : ''}" data-key="${key}">${segmented(tabs, cur, 'innerTab')}</div>` };
}

export function setupInnerTabs() {
    actions({
        innerTab: (el, d) => {
            const key = el.closest('.inner-tabs').dataset.key;
            ui.sel['it:' + key] = d.v;
            const v = el.closest('.view');
            if (v) v.scrollTop = 0;
        },
    });
}
