// Meuh : le démarrage. Les règles du jeu (systems) tournent toutes seules ; l'interface (ui) les montre.
import { state } from './core/state.js';
import { now } from './core/clock.js';
import { setView } from './core/view.js';
import { emit } from './core/bus.js';
import * as G from './systems/index.js';
import { actions } from './ui/dom.js';
import { setupApp, refresh, saveNow, tabEl } from './ui/app.js';
import { setupSound } from './ui/sound.js';
import { setupFx } from './ui/fx.js';
import { setupSheets } from './ui/sheets.js';
import { setupMoments, pushMoment, closeMoment } from './ui/moments.js';
import { setupToolbar } from './ui/toolbar.js';
import { updateScene } from './ui/scene.js';
import { setupFarm, wanderDog } from './ui/views/farm.js';
import { setupNature } from './ui/views/nature.js';
import { setupPond } from './ui/views/pond.js';
import { setupOrchard } from './ui/views/orchard.js';
import { setupIsland } from './ui/views/island.js';
import { setupLab } from './ui/views/lab.js';
import { setupHaras } from './ui/views/haras.js';
import { setupShow } from './ui/views/show.js';
import { setupStud } from './ui/views/stud.js';
import { setupCompanions } from './ui/views/companions.js';
import { setupAnimals, wanderAnimals } from './ui/views/animals.js';
import { setupWorkshop } from './ui/views/workshop.js';
import { setupCave } from './ui/views/cave.js';
import { setupChateau } from './ui/views/chateau.js';
import { setupCup } from './ui/views/cup.js';
import { setupBrewery } from './ui/views/brewery.js';
import { setupCounter } from './ui/views/counter.js';
import { setupOrders } from './ui/views/orders.js';
import { setupDefis } from './ui/views/defis.js';
import { setupVillage } from './ui/views/village.js';
import { setupMarket } from './ui/views/market.js';
import { setupMenu } from './ui/sheets/menu.js';
import { setupVault } from './ui/sheets/vault.js';
import { setupHouse } from './ui/sheets/house.js';
import { setupUpgrades } from './ui/sheets/upgrades.js';
import { setupProgress } from './ui/sheets/progress.js';
import { setupBook } from './ui/sheets/book.js';
import { setupInfo } from './ui/sheets/info.js';
import { setupSettings } from './ui/sheets/settings.js';
import { setupRename } from './ui/sheets/rename.js';
import { setupNight, updateNight } from './ui/night.js';
import { setupAskBuy } from './ui/sheets/askbuy.js';
import { setupNavigate } from './ui/navigate.js';
import { setupTutorial, tutoTick } from './ui/tutorial.js';
import { setupPwa, remindTick } from './ui/pwa.js';

function start() {
    G.loadGame();
    // ce qui s'est passé pendant l'absence, sans messages
    const away = G.offlineProgress();
    G.ensureQuests();
    G.checkNewAchievements();

    setupSound();
    setupFx({ sfx: name => emit('sfx', name), tabEl });
    setupSheets();
    setupApp();
    setupMoments(refresh);
    setupToolbar();
    setupFarm();
    setupNature();
    setupPond();
    setupOrchard();
    setupIsland();
    setupLab();
    setupHaras();
    setupShow();
    setupStud();
    setupCompanions();
    setupAnimals();
    setupWorkshop();
    setupCave();
    setupChateau();
    setupCup();
    setupBrewery();
    setupCounter();
    setupOrders();
    setupDefis();
    setupVillage();
    setupMarket();
    setupMenu();
    setupVault();
    setupHouse();
    setupUpgrades();
    setupProgress();
    setupBook();
    setupInfo();
    setupSettings();
    setupRename();
    setupNight();
    setupAskBuy();
    setupNavigate();
    setupTutorial();
    actions({
        claimDaily: el => {
            G.claimDaily(el);
            setTimeout(closeMoment, 600);
        },
    });

    setView({ started: true, hidden: document.hidden });
    updateScene();
    refresh();
    // 1.44 : la sauvegarde était abîmée
    if (G.loadIssue && G.loadIssue.restored)
        pushMoment('notice', {
            icon: ['ui', 'download'],
            title: 'Ferme restaurée',
            text: [
                `La sauvegarde de cet appareil était abîmée. Votre ferme a été reprise depuis sa copie de secours (${G.backupAgo(G.loadIssue.restored)}).`,
                'Les dernières minutes de jeu ont pu être perdues.',
            ],
        });
    else if (G.loadIssue && G.loadIssue.lost)
        pushMoment('notice', {
            icon: ['ui', 'download'],
            title: 'Sauvegarde illisible',
            text: [
                'La sauvegarde de cet appareil était abîmée et aucune copie de secours n’a pu la remplacer : une nouvelle ferme commence.',
                'Si vous avez exporté votre ferme, importez-la depuis les Réglages.',
            ],
        });
    if (away && away.lines.length && away.elapsed >= 300) pushMoment('offline', away);
    // 1.44 : demande au navigateur de ne pas effacer la ferme quand le téléphone manque de place
    try {
        if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});
    } catch {
        // indisponible
    }
    const daily = G.dailyDue();
    if (daily) pushMoment('daily', daily);
    // la seconde de jeu
    // 1.37.1 : le jeu suit l'heure réelle. Un onglet ou une appli en arrière-plan voit ses minuteries gelées ou ralenties :
    // au retour, le temps manqué se rattrape comme une absence (au lieu d'être perdu seconde après seconde).
    let lastRun = now();
    const secondOfGame = () => {
        const t = now(),
            gap = Math.floor((t - lastRun) / 1000);
        if (t < lastRun) lastRun = t; // l'horloge du téléphone a reculé
        if (gap < 1) return;
        if (gap <= 300) {
            // quelques secondes ou minutes manquées : on les rejoue une par une, comme si l'écran était resté allumé
            lastRun += gap * 1000; // le reste de la seconde se reporte
            for (let k = 0; k < gap; k++) G.gameTick();
        } else {
            // plus long : le calcul d'absence (comme à l'ouverture du jeu)
            lastRun = t;
            state.lastSaved = t - gap * 1000;
            const back = G.offlineProgress();
            if (back && back.lines.length && back.elapsed >= 300) pushMoment('offline', back);
            state.lastSaved = t;
        }
        // 1.44 : écran caché, le jeu avance mais ne se redessine pas (la batterie) ; tout se remet à jour au retour
        if (!document.hidden) {
            updateScene();
            refresh();
            updateNight();
        }
        remindTick();
    };
    setInterval(secondOfGame, 1000);
    document.addEventListener('visibilitychange', () => !document.hidden && secondOfGame());
    setInterval(saveNow, 5000);
    const shown = fn => () => !document.hidden && fn();
    setInterval(shown(wanderAnimals), 1600);
    setInterval(shown(wanderDog), 2200);
    setInterval(shown(tutoTick), 250);
    addEventListener('resize', () => {
        updateScene();
        tutoTick();
    });
    setupPwa();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
else start();
