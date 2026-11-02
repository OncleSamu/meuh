// Les réglages : son, confort, écran et installation, sauvegarde (export, import, copies de secours).
import { state } from '../../core/state.js';
import { dateKey } from '../../core/format.js';
import { today, now } from '../../core/clock.js';
import { toast, emit } from '../../core/bus.js';
import * as G from '../../systems/index.js';
import { actions, esc, QUIET } from '../dom.js';
import { ico } from '../icons.js';
import { btn, toggle, navRow } from '../kit.js';
import { saveNow, stopSaving, refresh } from '../app.js';
import { defineSheet, sheetOpts, closeAll } from '../sheets.js';
import { SoundEngine } from '../sound.js';
import { confirmTap } from '../confirm.js';
import { updateScene } from '../scene.js';
import { installState, installApp } from '../pwa.js';
import { CHANGELOG } from '../../data/changelog.js';
import { innerTabs } from '../innertabs.js';

export const VERSION = '{{VERSION}}';
const TEXT_SIZES = ['Normale', 'Grande', 'Très grande'];
const THEMES = { light: 'Clair', dark: 'Sombre', auto: 'Comme le téléphone' };
const set = state => state.settings;

const group = (title, rows) => `<div class="set-group"><div class="set-title">${title}</div>${rows}</div>`;
const slider = (label, key, act) =>
    `<label class="row slider"><span class="row-main"><span>${label}</span></span><input type="range" min="0" max="100" step="5" value="${Math.round((state.settings[key] === undefined ? (key === 'ambVol' ? 0.6 : 0.8) : state.settings[key]) * 100)}" data-input="${act}" data-key="${key}"></label>`;

function mainPage() {
    const s = set(state);
    const inst = installState();
    const backups = G.readBackups();
    // 1.74.2 : quatre onglets au lieu d'une longue page
    const T = innerTabs(
        'settings',
        [
            ['sound', 'Son', null, 0],
            ['comfort', 'Confort', null, 0],
            ['save', 'Copies', null, 0],
            ['help', 'Aide', null, 0],
        ],
        'sound',
    );
    const t = T.cur;
    const parts =
        t === 'sound'
            ? [
                  group(
                      'Son et sensations',
                      toggle('Musique', s.music, 'setting', { key: 'music' }, 'Une ambiance par saison') +
                          slider('Volume de la musique', 'musicVol', 'volume') +
                          toggle('Effets sonores', s.sfx, 'setting', { key: 'sfx' }) +
                          slider('Volume des effets', 'sfxVol', 'volume') +
                          toggle('Ambiance', s.ambience !== false, 'setting', { key: 'ambience' }, 'Oiseaux, pluie, vent, vagues, selon l’endroit et l’heure') +
                          slider('Volume de l’ambiance', 'ambVol', 'volume') +
                          toggle('Vibrations', s.haptics, 'setting', { key: 'haptics' }),
                  ),
              ]
            : t === 'comfort'
              ? [
                    group(
                        'Confort',
                        toggle('Replanter après la récolte', s.autoReplant, 'setting', { key: 'autoReplant' }) +
                            (state.upgrades.seeder ? toggle('Semoir : planter toute la rangée', s.seeder !== false, 'setting', { key: 'seeder' }) : '') +
                            toggle(
                                'Confirmer les gros achats',
                                s.confirmBuy !== false,
                                'setting',
                                { key: 'confirmBuy' },
                                'Parcelles, verger, prés, serre, machines',
                            ) +
                            toggle('Animations réduites', s.calm, 'setting', { key: 'calm' }) +
                            toggle(
                                'Lucioles la nuit',
                                s.fireflies !== false,
                                'setting',
                                { key: 'fireflies' },
                                'Pur décor : vos récoltes de nuit remplissent le bocal',
                            ) +
                            navRow('Thème', 'theme', null, null, `<b>${THEMES[s.theme || 'light']}</b>`) +
                            navRow('Taille du texte', 'textSize', null, null, `<b>${TEXT_SIZES[s.textSize] || TEXT_SIZES[0]}</b>`) +
                            toggle('Contraste renforcé', !!s.contrast, 'setting', { key: 'contrast' }) +
                            (s.hints && Object.keys(s.hints).length
                                ? navRow(
                                      'Réafficher les astuces',
                                      'hintsReset',
                                      null,
                                      ['ui', 'info'],
                                      '›',
                                      `${Object.keys(s.hints).length} astuce${Object.keys(s.hints).length > 1 ? 's' : ''} masquée${Object.keys(s.hints).length > 1 ? 's' : ''}`,
                                  )
                                : '') +
                            (matchMedia('(hover: hover)').matches
                                ? '<p class="card-sub">Au clavier : 1 à 5 pour les onglets, A pour arroser, R pour récolter ou ramasser, N pour nourrir, V pour tout vendre, Échap pour fermer.</p>'
                                : ''),
                    ),
                    group(
                        'Écran',
                        (document.documentElement.requestFullscreen ? navRow('Plein écran', 'fullscreen') : '') +
                            (inst.standalone
                                ? '<p class="card-sub">Le jeu est installé sur cet appareil.</p>'
                                : navRow('Installer l’appli', 'install', null, null, '›', inst.hint)),
                    ),
                ]
              : t === 'save'
                ? [
                      group(
                          'Sauvegarde',
                          navRow(
                              'Exporter ma ferme',
                              'setPage',
                              { p: 'export' },
                              ['ui', 'share'],
                              '›',
                              s.lastExport ? `Dernier export ${G.backupAgo(s.lastExport)}` : 'Jamais exportée : un code gardé ailleurs protège votre ferme',
                          ) +
                              navRow('Importer une ferme', 'setPage', { p: 'import' }, ['ui', 'download']) +
                              '<div class="set-sub">Copies de secours (touchez deux fois pour revenir en arrière)</div>' +
                              (backups.length
                                  ? backups
                                        .map((b, k) => {
                                            let sum = '';
                                            try {
                                                sum = G.saveSummary(JSON.parse(b.data));
                                            } catch {
                                                sum = '';
                                            }
                                            return navRow(`Copie ${G.backupAgo(b.at)}`, 'restore', { k }, null, '›', sum);
                                        })
                                        .join('')
                                  : '<p class="card-sub">Une copie de votre ferme est gardée automatiquement toutes les 10 minutes de jeu.</p>'),
                      ),
                  ]
                : [
                      group(
                          'Aide',
                          navRow('Mises à jour', 'setPage', { p: 'updates' }, ['ui', 'scroll'], '›', `Version ${VERSION} : ce que chaque version a apporté`) +
                              navRow('Revoir le tutoriel', 'replayTuto') +
                              (state.dog.owned
                                  ? `<div class="rename"><input type="text" maxlength="16" value="${esc(state.dog.name)}" id="rename-dog" aria-label="Nom du chien">${btn('Renommer le chien', { act: 'renameDog', size: 'sm' })}</div>`
                                  : ''),
                      ),
                      btn('Recommencer à zéro', { act: 'resetGame', kind: 'red', wide: true }),
                      `<p class="card-sub center set-foot">Meuh ${VERSION} · fait avec amour, sans serveur ni compte : votre ferme reste sur votre appareil.</p>`,
                  ];
    return T.html + parts.join('');
}

function exportPage(o) {
    return `<p>Gardez ce code en lieu sûr, ou importez-le sur un autre appareil pour y retrouver votre ferme.</p>
        <p class="card-sub">${G.saveSummary(state)}</p>
        <textarea readonly id="export-code">${o.code || 'Préparation…'}</textarea>
        <div class="row-btns">${btn('Copier le code', { act: 'copyExport', kind: 'gold' })}${navigator.share ? btn('Partager', { act: 'shareExport', icon: ['ui', 'share'] }) : ''}</div>
        ${btn('Télécharger un fichier', { act: 'downloadExport', wide: true, icon: ['ui', 'download'] })}`;
}

function importPage(o) {
    return `<p>Collez un code exporté, ou choisissez le fichier téléchargé.</p>
        <textarea id="import-text" placeholder="MEUH1.…" data-input="importText">${o.text ? esc(o.text) : ''}</textarea>
        <label class="btn wide file-btn"><span>Choisir un fichier</span><input type="file" accept=".json,application/json,text/plain" id="import-file"></label>
        <div id="import-preview">${
            o.preview
                ? o.preview.ok
                    ? `<div class="line ok">${ico(['ui', 'check'])}<div><b>Sauvegarde valide</b><div class="card-sub">${o.preview.sum}</div></div></div>${btn('Remplacer ma ferme par celle-ci', { act: 'applyImport', kind: 'red', wide: true })}<p class="card-sub">Votre ferme actuelle est gardée en secours : vous pourrez revenir en arrière depuis les réglages.</p>`
                    : '<div class="line bad"><div>Ce code n’est pas une sauvegarde de Meuh. Vérifiez qu’il a été copié en entier, du début « MEUH » jusqu’au dernier caractère.</div></div>'
                : ''
        }</div>`;
}

function installPage() {
    const local = !location.protocol.startsWith('http');
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    return (
        (local
            ? '<div class="line bad"><div>Le jeu est ouvert comme un fichier. Pour l’installer, ouvrez-le depuis son adresse web (https).</div></div>'
            : '') +
        (ios
            ? '<ol class="steps"><li>Ouvrez cette page dans <b>Safari</b>.</li><li>Touchez le bouton <b>Partager</b> (le carré avec une flèche vers le haut).</li><li>Choisissez <b>Sur l’écran d’accueil</b>, puis <b>Ajouter</b>.</li></ol>'
            : '<ol class="steps"><li>Ouvrez cette page dans <b>Chrome</b>, <b>Edge</b> ou <b>Samsung Internet</b>.</li><li>Touchez le menu <b>⋮</b> en haut à droite.</li><li>Choisissez <b>Installer l’application</b> ou <b>Ajouter à l’écran d’accueil</b>.</li></ol>')
    );
}

// 1.60 : toutes les mises à jour depuis le début ; la plus récente est ouverte
function updatesPage() {
    return `<div class="updates">${CHANGELOG.map(
        (c, k) =>
            `<details class="upd card"${k === 0 ? ' open' : ''}><summary><b>${esc(c.v)}</b>${c.title ? ` · ${esc(c.title)}` : ''}${c.date ? `<small>${esc(c.date)}</small>` : ''}</summary>${c.items.length ? `<ul class="upd-list">${c.items.map(x => `<li>${esc(x)}</li>`).join('')}</ul>` : ''}</details>`,
    ).join('')}</div>`;
}

const PAGES = {
    main: ['Réglages', mainPage],
    export: ['Exporter ma ferme', exportPage],
    import: ['Importer une ferme', importPage],
    install: ['Installer l’appli', installPage],
    updates: ['Mises à jour', updatesPage],
};

defineSheet('settings', {
    cls: 'settings-sheet',
    open(o) {
        o.page = 'main';
        G.tip('theme');
    },
    title: o => (o.page === 'main' ? 'Réglages' : `<button class="back" data-act="setPage" data-p="main">${ico(['ui', 'back'])}</button>${PAGES[o.page][0]}`),
    render: o => PAGES[o.page][1](o),
});

async function buildExport(o) {
    saveNow();
    o.code = await G.packSave(JSON.stringify(state));
    refresh();
}

async function preview(o, text) {
    o.text = text;
    o.json = null;
    if (!text || !text.trim()) o.preview = null;
    else
        try {
            const r = await G.readCode(text);
            o.json = r.json;
            o.preview = { ok: true, sum: G.saveSummary(r.save) };
        } catch {
            o.preview = { ok: false };
        }
    const box = document.getElementById('import-preview');
    if (box) {
        const html = importPage(o);
        const tmp = document.createElement('div');
        tmp.innerHTML = html;
        box.innerHTML = tmp.querySelector('#import-preview').innerHTML;
    }
}

const reload = () => {
    stopSaving();
    location.reload();
};

export function setupSettings() {
    const o = () => sheetOpts('settings');
    actions({
        setting: (el, d) => {
            const s = state.settings;
            // confirmBuy est actif quand il manque (anciennes sauvegardes)
            s[d.key] = d.key === 'confirmBuy' || d.key === 'fireflies' || d.key === 'seeder' || d.key === 'ambience' ? s[d.key] === false : !s[d.key];
            SoundEngine.unlock();
            if (d.key === 'music') SoundEngine.setMusic(s.music);
            if (d.key === 'ambience') SoundEngine.setAmbience(s.ambience !== false);
            if (d.key === 'sfx') {
                SoundEngine.setSfx(s.sfx);
                emit('sfx', 'click');
            }
            updateScene();
        },
        volume: (el, d) => {
            state.settings[d.key] = Math.max(0, Math.min(1, +d.value / 100));
            SoundEngine.unlock();
            SoundEngine.setVolumes();
            return QUIET;
        },
        theme: () => {
            const order = ['light', 'dark', 'auto'];
            state.settings.theme = order[(order.indexOf(state.settings.theme || 'light') + 1) % 3];
            updateScene();
        },
        textSize: () => {
            state.settings.textSize = ((state.settings.textSize || 0) + 1) % 3;
            state.settings.bigText = state.settings.textSize > 0;
            updateScene();
        },
        fullscreen: () => {
            if (document.fullscreenElement) document.exitFullscreen();
            else document.documentElement.requestFullscreen().catch(() => toast('Le plein écran n’est pas disponible ici'));
        },
        install: async () => {
            if (!(await installApp())) o().page = 'install';
        },
        setPage: (el, d) => {
            o().page = d.p;
            if (d.p === 'export') buildExport(o());
            if (d.p === 'import') Object.assign(o(), { text: '', preview: null, json: null });
        },
        copyExport: async () => {
            const code = o().code;
            if (!code) return;
            try {
                await navigator.clipboard.writeText(code);
            } catch {
                const t = document.getElementById('export-code');
                t.removeAttribute('readonly');
                t.select();
                document.execCommand('copy');
                t.setAttribute('readonly', '');
            }
            toast('Code copié : collez-le où vous voulez le garder', ['ui', 'check']);
        },
        shareExport: () =>
            navigator
                .share({ title: 'Ma ferme dans Meuh', text: o().code })
                .then(() => (state.settings.lastExport = now()))
                .catch(() => {}),
        downloadExport: () => {
            const blob = new Blob([JSON.stringify(state)], { type: 'application/json' });
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = `meuh-niveau-${state.level}-${dateKey(today())}.json`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            setTimeout(() => URL.revokeObjectURL(a.href), 2000);
            state.settings.lastExport = now();
        },
        importText: (el, d) => {
            preview(o(), d.value);
            return QUIET;
        },
        applyImport: () => {
            const json = o().json;
            if (!json) return;
            if (!G.replaceSave(json)) return toast('Impossible d’enregistrer la sauvegarde sur cet appareil');
            reload();
        },
        restore: (el, d) => {
            const b = G.readBackups()[+d.k];
            if (!b || !confirmTap('restore' + d.k, el, 'Touchez encore pour restaurer')) return;
            if (G.replaceSave(b.data)) reload();
        },
        resetGame: el => {
            if (!confirmTap('reset', el, 'Touchez encore pour tout effacer')) return;
            G.eraseSave();
            reload();
        },
        replayTuto: () => {
            state.tutorial = { step: 0, done: false };
            closeAll();
        },
        renameDog: () => {
            const i = document.getElementById('rename-dog');
            if (i && G.renameDog(i.value)) i.blur();
        },
    });
    // un fichier choisi : on le lit comme un code collé
    document.addEventListener('change', e => {
        if (e.target.id !== 'import-file') return;
        const f = e.target.files && e.target.files[0];
        if (!f) return;
        const r = new FileReader();
        r.onload = () => {
            const t = document.getElementById('import-text');
            if (t) t.value = r.result;
            preview(o(), r.result);
        };
        r.readAsText(f);
        e.target.value = '';
    });
}
