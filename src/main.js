// Meuh : le démarrage. Les règles du jeu (systems) tournent toutes seules ; l'interface (ui) les montre.
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
import { setupAnimals, wanderAnimals } from './ui/views/animals.js';
import { setupWorkshop } from './ui/views/workshop.js';
import { setupCave } from './ui/views/cave.js';
import { setupBrewery } from './ui/views/brewery.js';
import { setupCounter } from './ui/views/counter.js';
import { setupOrders } from './ui/views/orders.js';
import { setupDefis } from './ui/views/defis.js';
import { setupVillage } from './ui/views/village.js';
import { setupMarket } from './ui/views/market.js';
import { setupMenu } from './ui/sheets/menu.js';
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
    setupAnimals();
    setupWorkshop();
    setupCave();
    setupBrewery();
    setupCounter();
    setupOrders();
    setupDefis();
    setupVillage();
    setupMarket();
    setupMenu();
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
    if (away && away.lines.length && away.elapsed >= 300) pushMoment('offline', away);
    const daily = G.dailyDue();
    if (daily) pushMoment('daily', daily);
    // la seconde de jeu
    setInterval(() => {
        G.gameTick();
        updateScene();
        refresh();
        updateNight();
        remindTick();
    }, 1000);
    setInterval(saveNow, 5000);
    setInterval(wanderAnimals, 1600);
    setInterval(wanderDog, 2200);
    setInterval(tutoTick, 250);
    addEventListener('resize', () => {
        updateScene();
        tutoTick();
    });
    setupPwa();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
else start();
