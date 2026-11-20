// Génère proto-domaine/index.html en embarquant les VRAIS sprites SVG de src/art/
// sans modifier aucun fichier du jeu Meuh.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SPR } from '../src/art/index.js';
import { SPRITES as CAMP } from '../src/art/camping.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const clean = s => String(s || '').replace(/\s+/g, ' ').trim();

// Extraction des VRAIS sprites SVG de Meuh
const ART = {
  // Maisons évolutives × 3 palettes de toit
  fh_1_red: clean(SPR.farmhouse(1, '#c8453a')),
  fh_3_red: clean(SPR.farmhouse(3, '#c8453a')),
  fh_5_red: clean(SPR.farmhouse(5, '#c8453a')),
  fh_1_slate: clean(SPR.farmhouse(1, '#4e6785')),
  fh_3_slate: clean(SPR.farmhouse(3, '#4e6785')),
  fh_5_slate: clean(SPR.farmhouse(5, '#4e6785')),
  fh_1_lav: clean(SPR.farmhouse(1, '#8b63b3')),
  fh_3_lav: clean(SPR.farmhouse(3, '#8b63b3')),
  fh_5_lav: clean(SPR.farmhouse(5, '#8b63b3')),

  // Bâtiments réels de Meuh
  b_station: clean(SPR.building('station', 2)),
  b_townhall: clean(SPR.building('townhall', 2)),
  b_lighthouse: clean(SPR.building('lighthouse', 2)),
  b_windmill: clean(SPR.building('windmill', 2)),
  b_chai: clean(SPR.building('chai', 2)),
  b_stud: clean(SPR.building('stud', 2)),
  b_pontoon: clean(SPR.building('pontoon', 2)),
  b_fountain: clean(SPR.building('fountain', 2)),

  // Machines & camping réels
  m_bakery: clean(SPR.machine('bakery')),
  m_counter: clean(SPR.machine('counter')),
  m_perfumery: clean(SPR.machine('perfumery')),
  m_mill: clean(SPR.machine('mill')),
  c_tent: clean(CAMP.tent('#e2582f')),
  c_tree1: clean(CAMP.tree('#4aa860')),
  c_tree2: clean(CAMP.tree('#66be56')),
  c_treeAut: clean(CAMP.tree('#e8792a')),
  c_treeWin: clean(CAMP.tree('#dfeaf0')),

  // Transports réels
  v_loco: clean(SPR.loco()),
  v_wagon1: clean(SPR.wagon('#c8453a')),
  v_wagon2: clean(SPR.wagon('#3f6fb5')),

  // Animaux & villageois réels
  a_cow: clean(SPR.animal('cow')),
  a_chicken: clean(SPR.animal('chicken')),
  a_horse: clean(SPR.animal('horse')),
  a_bees: clean(SPR.animal('bees')),
  p_odette: clean(SPR.villager('odette')),
  p_gaston: clean(SPR.villager('gaston')),

  // Cultures & arbres réels (plusieurs stades!)
  pl_wheat0: clean(SPR.plant('wheat', 0)),
  pl_wheat1: clean(SPR.plant('wheat', 1)),
  pl_wheat3: clean(SPR.plant('wheat', 3)),
  pl_straw3: clean(SPR.plant('strawberry', 3)),
  pl_sun3: clean(SPR.plant('sunflower', 3)),
  pl_apple3: clean(SPR.plant('apple', 3)),
  pl_apple1: clean(SPR.plant('apple', 1)),
  pl_cherry3: clean(SPR.plant('cherry', 3)),

  // Objets réels (bulles, vol vers la grange, barres)
  i_wheat: clean(SPR.item('wheat')),
  i_strawberry: clean(SPR.item('strawberry')),
  i_sunflower: clean(SPR.item('sunflower')),
  i_apple: clean(SPR.item('apple')),
  i_cherry: clean(SPR.item('cherry')),
  i_honey: clean(SPR.item('honey')),
  i_milk: clean(SPR.item('milk')),
  i_egg: clean(SPR.item('egg')),
  i_bread: clean(SPR.item('bread')),
  i_cheese: clean(SPR.item('cheese')),
  i_pineapple: clean(SPR.item('pineapple')),
  i_coconut: clean(SPR.item('coconut')),
  i_wood: clean(SPR.item('wood')),
  i_lavender: clean(SPR.item('lavender')),
  i_trout: clean(SPR.item('trout')),
  i_cake: clean(SPR.item('strawberryCake')),

  // UI & Décos réelles de Meuh
  u_star: clean(SPR.ui('star')),
  u_coin: clean(SPR.ui('coin')),
  u_barn: clean(SPR.ui('barn')),
  u_house: clean(SPR.ui('house')),
  u_dog: clean(SPR.ui('dog')),
  u_greenhouse: clean(SPR.ui('greenhouse')),
  u_basket: clean(SPR.ui('basket')),
  u_scroll: clean(SPR.ui('scroll')),
  u_stall: clean(SPR.ui('stall')),
  u_village: clean(SPR.ui('village')),
  u_tent: clean(SPR.ui('tent')),
  u_rod: clean(SPR.ui('rod')),
  u_perfume: clean(SPR.ui('perfume')),
  u_cave: clean(SPR.ui('cave')),
  u_beer: clean(SPR.ui('beer')),
  u_boat: clean(SPR.ui('boat')),
  u_plane: clean(SPR.ui('plane')),
  u_train: clean(SPR.ui('trainIcon')),
  u_drop: clean(SPR.ui('drop')),
  u_seedPack: clean(SPR.ui('seedPack')),
  u_sparkle: clean(SPR.ui('sparkle')),
  u_heart: clean(SPR.ui('heart')),
  u_trophy: clean(SPR.ui('trophy')),
  u_camera: clean(SPR.ui('camera')),
  u_flowerArch: clean(SPR.ui('flowerArch')),
  u_perfumeFountain: clean(SPR.ui('perfumeFountain')),
  u_appleCart: clean(SPR.ui('appleCart')),
  u_birdhouse: clean(SPR.ui('birdhouse')),
  u_wishStar: clean(SPR.ui('wishStar')),
  u_flowers: clean(SPR.ui('flowers')),
  u_oaVoyages: clean(SPR.ui('oaVoyages')),
  u_hEcuries: clean(SPR.ui('hEcuries')),
  u_sun: clean(SPR.ui('w_sun')),
};

const html = `<!DOCTYPE html>
<html lang="fr" class="season-printemps">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
<title>Meuh — Vue du Domaine (Version Meuh authentique)</title>
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Nunito:wght@700;800;900&display=swap" rel="stylesheet" />
<style>
  /* ============ TOKENS OFFICIELS DE MEUH (00-base.css & 30-components.css) ============ */
  :root {
    --ink: #3a2618;
    --ink-soft: rgba(58, 38, 24, 0.72);
    --wood: #a8693a;
    --wood-d: #7a4a2a;
    --wood-l: #e8c38c;
    --wood-ll: #f5deb3;
    --paper: #fbecc9;
    --paper-l: #fff7e0;
    --leaf: #6cc04a;
    --leaf-l: #8fd65f;
    --leaf-d: #3f8f2e;
    --gold: #f2c14e;
    --gold-d: #c9952a;
    --red: #c8453a;
    --red-l: #ef8a7e;
    --water: #4fb3f6;
    --blue-l: #8fd0f7;
    --xp: #5aa9e6;
    --pink: #f59ab1;
    --display: 'Nunito', ui-rounded, 'SF Pro Rounded', system-ui, -apple-system, 'Segoe UI', sans-serif;

    /* Palette du ciel & terrain (identique à 10-scene.css & 70-village.css) */
    --sky-top: #65bceb;
    --sky-bot: #cceffd;
    --h1: #b9e59a;
    --h2: #93d46a;
    --h3: #7ec457;
    --meadow-1: #96d468;
    --meadow-2: #81c456;
    --meadow-3: #6fb249;
    --path-c: #f2d6a2;
    --path-edge: #caa56a;
    --water-1: #4fa9e6;
    --water-2: #8ad3fa;
    --night-op: 0;
    --stars-op: 0;
    --sun-op: 1;
    --moon-op: 0;
    --glow-op: 0;
    --snow-op: 0;
  }

  /* Heures du jour (calées sur SKY de Meuh) */
  [data-time="morning"] {
    --sky-top: #74b7ea;
    --sky-bot: #fbd6a7;
    --night-op: 0.04;
    --glow-op: 0.25;
  }
  [data-time="noon"] {
    --sky-top: #5cb5eb;
    --sky-bot: #c8ecfc;
    --night-op: 0;
    --glow-op: 0;
  }
  [data-time="evening"] {
    --sky-top: #555296;
    --sky-bot: #f29a72;
    --h1: #9ca577;
    --h2: #7e9b5c;
    --night-op: 0.16;
    --stars-op: 0.45;
    --sun-op: 0.88;
    --moon-op: 0.35;
    --glow-op: 0.78;
  }
  [data-time="night"] {
    --sky-top: #182348;
    --sky-bot: #2c4173;
    --h1: #3b5850;
    --h2: #315342;
    --h3: #2a4a39;
    --meadow-1: #3c694a;
    --meadow-2: #325a3f;
    --meadow-3: #2a4d35;
    --path-c: #a69577;
    --path-edge: #7b6c54;
    --water-1: #234973;
    --water-2: #366a9e;
    --night-op: 0.34;
    --stars-op: 1;
    --sun-op: 0;
    --moon-op: 1;
    --glow-op: 1;
  }

  /* Saisons (couleurs exactes de 70-village.css !) */
  [data-season="spring"] {
    --h1: #b9e59a; --h2: #93d46a; --h3: #7ec457;
    --meadow-1: #9bd96f; --meadow-2: #86c95b; --meadow-3: #72b64c;
  }
  [data-season="summer"] {
    --h1: #aadf82; --h2: #87cc5b; --h3: #73ba4b;
    --meadow-1: #90d161; --meadow-2: #7bc04f; --meadow-3: #68ac41;
  }
  [data-season="autumn"] {
    --h1: #e3c27a; --h2: #c9a24e; --h3: #a9b84e;
    --meadow-1: #b9c85e; --meadow-2: #a5b44e; --meadow-3: #909e41;
  }
  [data-season="autumn"][data-time="night"] {
    --h1: #5a523e; --h2: #4e4934; --h3: #41452e;
    --meadow-1: #4f5436; --meadow-2: #43482d; --meadow-3: #373c25;
  }
  [data-season="winter"] {
    --h1: #eef5f9; --h2: #e1edf3; --h3: #d3e4ec;
    --meadow-1: #e4efe6; --meadow-2: #d6e6dc; --meadow-3: #c5dcc6;
    --path-c: #dfd2be; --path-edge: #b4a58f;
    --snow-op: 1;
  }
  [data-season="winter"][data-time="night"] {
    --h1: #566d85; --h2: #4e657d; --h3: #455b73;
    --meadow-1: #5a7188; --meadow-2: #4e657d; --meadow-3: #435970;
    --path-c: #7c8591;
  }

  /* Styles de chemin */
  [data-path="sand"]   { --path-c: #f2d6a2; --path-edge: #caa56a; }
  [data-path="cobble"] { --path-c: #d9d1c3; --path-edge: #9f9584; }
  [data-path="brick"]  { --path-c: #ebbfa4; --path-edge: #bd8366; }

  .calm *, .calm *::before, .calm *::after {
    animation-duration: 0.001ms !important;
    animation-iteration-count: 1 !important;
  }

  * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
  html, body {
    margin: 0;
    padding: 0;
    font-family: var(--display);
    color: var(--ink);
    background: var(--background, #ece2c9);
    min-height: 100%;
  }

  /* Icônes SVG Meuh */
  .ico { display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .ico > svg { width: 100%; height: 100%; display: block; }

  /* ============ BOUTONS AUTHENTIQUES MEUH (30-components.css) ============ */
  .btn {
    --b: var(--wood-ll);
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
    min-height: 38px;
    padding: 6px 12px;
    font-family: var(--display);
    font-weight: 900;
    font-size: 0.9rem;
    line-height: 1.1;
    color: var(--ink);
    background: linear-gradient(rgba(255, 255, 255, 0.45), rgba(255, 255, 255, 0) 55%), var(--b);
    border: 2.5px solid var(--ink);
    border-radius: 13px;
    box-shadow:
      0 4px 0 var(--ink),
      inset 0 -3px 0 rgba(0, 0, 0, 0.1),
      inset 0 2px 0 rgba(255, 255, 255, 0.55);
    cursor: pointer;
    transition: transform 0.06s, box-shadow 0.06s;
    white-space: nowrap;
  }
  .btn:active {
    transform: translateY(3px);
    box-shadow: 0 1px 0 var(--ink), inset 0 2px 0 rgba(0, 0, 0, 0.08);
  }
  .btn.sm {
    min-height: 32px;
    padding: 4px 9px;
    font-size: 0.8rem;
    border-radius: 11px;
    box-shadow:
      0 3px 0 var(--ink),
      inset 0 -2px 0 rgba(0, 0, 0, 0.1),
      inset 0 2px 0 rgba(255, 255, 255, 0.55);
  }
  .btn.sm:active { transform: translateY(2px); box-shadow: 0 1px 0 var(--ink); }
  .btn.green { --b: var(--leaf-l); }
  .btn.gold { --b: var(--gold); }
  .btn.blue { --b: var(--blue-l); }
  .btn.on { --b: #ffe48a; }
  .btn .ico { width: 1.3em; height: 1.3em; }

  /* ============ CADRE EXTÉRIEUR (BARRE DE TEST UNIQUEMENT) ============ */
  .studio {
    max-width: 1140px;
    margin: 0 auto;
    padding: 10px 10px 24px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
  }
  .studio-bar {
    width: 100%;
    background: var(--paper-l);
    border: 2.5px solid var(--ink);
    border-radius: 16px;
    padding: 8px 10px;
    box-shadow: 0 4px 0 rgba(58, 38, 24, 0.25);
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 6px 9px;
    color: var(--ink);
  }
  .studio-title {
    font-weight: 900;
    font-size: 13px;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    margin-right: auto;
  }
  .studio-title .ico { width: 22px; height: 22px; }
  .studio-tag {
    font-size: 10.5px;
    font-weight: 900;
    background: var(--gold);
    border: 1.8px solid var(--ink);
    border-radius: 99px;
    padding: 1px 8px;
  }
  .seg-ctrl {
    display: inline-flex;
    gap: 2px;
    background: var(--paper);
    border: 2px solid var(--ink);
    border-radius: 11px;
    padding: 2px;
  }
  .seg-ctrl button {
    border: none;
    background: transparent;
    color: var(--ink);
    font-family: var(--display);
    font-size: 11.5px;
    font-weight: 800;
    padding: 4px 7px;
    border-radius: 8px;
    cursor: pointer;
    white-space: nowrap;
  }
  .seg-ctrl button.on {
    background: #fffdf6;
    box-shadow: inset 0 0 0 1.5px var(--wood);
    color: var(--ink);
  }

  /* ============ CADRE JEU MEUH (TÉLÉPHONE OU LARGE) ============ */
  .stage { width: 100%; display: flex; justify-content: center; }
  .device {
    position: relative;
    width: 100%;
    max-width: 416px;
    height: 760px;
    background: linear-gradient(to bottom, var(--sky-top), var(--sky-bot) 38%, var(--meadow-3) 38%);
    border: 3px solid var(--ink);
    border-radius: 28px;
    overflow: hidden;
    box-shadow: 0 20px 48px rgba(58, 38, 24, 0.25), 0 0 0 6px rgba(255, 247, 224, 0.72);
    display: flex;
    flex-direction: column;
    transition: max-width 0.35s cubic-bezier(.22,1,.36,1), border-radius 0.3s;
  }
  .device.wide { max-width: 960px; height: 730px; border-radius: 22px; }

  /* ============ HUD OFFICIEL MEUH (FLOTTANT SUR LE CIEL !) ============ */
  .meuh-hud {
    position: relative;
    z-index: 22;
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 10px 4px;
    background: linear-gradient(to bottom, var(--sky-top), rgba(255,255,255,0));
    transition: opacity 0.28s, transform 0.28s;
  }
  .postcard .meuh-hud,
  .postcard .tour-strip,
  .postcard #tabs,
  .postcard .deco-panel {
    opacity: 0;
    pointer-events: none;
    transform: translateY(-10px);
  }
  .postcard #tabs { transform: translateY(18px); }

  .lvl {
    flex: 1;
    min-width: 0;
    display: flex;
    align-items: center;
  }
  .lvl-star {
    position: relative;
    z-index: 2;
    width: 42px;
    height: 42px;
    flex-shrink: 0;
    filter: drop-shadow(0 3px 0 rgba(58, 38, 24, 0.42));
  }
  .lvl-star .ico { width: 100%; height: 100%; }
  .lvl-star b {
    position: absolute;
    inset: 3px 0 0;
    display: grid;
    place-items: center;
    font-size: 0.92rem;
    font-weight: 900;
    color: var(--ink);
  }
  .xp-bar {
    position: relative;
    flex: 1;
    height: 21px;
    min-width: 38px;
    margin-left: -13px;
    background: #6b5442;
    box-shadow: inset 0 3px 0 rgba(0, 0, 0, 0.2);
    border: 2.5px solid var(--ink);
    border-radius: 0 12px 12px 0;
    overflow: hidden;
  }
  .xp-bar > i {
    position: absolute;
    inset: 0 auto 0 0;
    width: 68%;
    background: linear-gradient(#bfe6fb 0 22%, #8fd0f7 22%, var(--xp));
    border-right: 2px solid var(--ink);
  }
  .xp-bar > small {
    position: absolute;
    inset: 0;
    display: grid;
    place-items: center;
    padding-left: 11px;
    font-size: 0.68rem;
    font-weight: 900;
    color: #fff;
    text-shadow:
      1.5px 0 0 var(--ink), -1.5px 0 0 var(--ink),
      0 1.5px 0 var(--ink), 0 -1.5px 0 var(--ink),
      1px 1px 0 var(--ink), -1px -1px 0 var(--ink);
  }

  .meuh-pill {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    height: 35px;
    padding: 0 9px 0 4px;
    background: var(--wood-ll);
    border: 2.5px solid var(--ink);
    border-radius: 20px;
    box-shadow: 0 3px 0 var(--wood-d);
    white-space: nowrap;
    flex-shrink: 0;
    font-weight: 900;
    font-variant-numeric: tabular-nums;
    font-size: 0.92rem;
    transition: transform 0.16s cubic-bezier(.34,1.56,.64,1);
  }
  .meuh-pill .ico { width: 24px; height: 24px; }
  .meuh-pill.barn { font-size: 0.8rem; }
  .meuh-pill.bump { transform: scale(1.14); background: #ffe99e; }

  .hud-tools {
    display: flex;
    gap: 4px;
    flex-shrink: 0;
  }
  .tool-sq {
    width: 34px;
    height: 34px;
    padding: 4px;
    border-radius: 11px;
    border: 2.5px solid var(--ink);
    background: linear-gradient(rgba(255,255,255,.45), transparent 55%), var(--paper-l);
    box-shadow: 0 3px 0 var(--ink);
    display: grid;
    place-items: center;
    cursor: pointer;
    transition: transform 0.06s, box-shadow 0.06s;
  }
  .tool-sq .ico { width: 21px; height: 21px; }
  .tool-sq.on { background: linear-gradient(rgba(255,255,255,.4), transparent 55%), var(--gold); }
  .tool-sq:active { transform: translateY(2px); box-shadow: 0 1px 0 var(--ink); }

  /* ============ BANDEAU TOURNÉE RAPIDE (STYLE MEUH) ============ */
  .tour-strip {
    position: relative;
    z-index: 20;
    padding: 4px 10px 6px;
    display: flex;
    align-items: center;
    gap: 6px;
    overflow-x: auto;
    scrollbar-width: none;
    transition: opacity 0.25s, transform 0.25s;
  }
  .tour-strip::-webkit-scrollbar { display: none; }
  .tour-chip {
    flex: 0 0 auto;
    display: inline-flex;
    align-items: center;
    gap: 4px;
    height: 31px;
    padding: 2px 9px 2px 5px;
    background: linear-gradient(#fffbf0, #f6e2b6);
    border: 2px solid var(--ink);
    border-radius: 99px;
    box-shadow: 0 3px 0 rgba(58, 38, 24, 0.42), inset 0 1.5px 0 #fff;
    font-family: var(--display);
    font-size: 0.78rem;
    font-weight: 900;
    color: var(--ink);
    cursor: pointer;
    white-space: nowrap;
    transition: transform 0.06s;
  }
  .tour-chip .ico { width: 20px; height: 20px; }
  .tour-chip.urgent { background: linear-gradient(#fff2b8, #ffd56b); }
  .tour-chip:active { transform: translateY(2px); box-shadow: 0 1px 0 rgba(58,38,24,.42); }
  .tour-calm {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 12px;
    background: linear-gradient(#fffbf0, #f5e5be);
    border: 2px solid var(--ink);
    border-radius: 99px;
    box-shadow: 0 3px 0 rgba(58, 38, 24, 0.35);
    font-size: 0.8rem;
    font-weight: 900;
    color: var(--leaf-d);
    white-space: nowrap;
  }
  .tour-calm .ico { width: 18px; height: 18px; }

  /* ============ PANNEAU DÉCORER (STYLE CARTE MEUH) ============ */
  .deco-panel {
    display: none;
    position: relative;
    z-index: 20;
    margin: 0 10px 6px;
    padding: 8px 10px;
    background: var(--paper-l);
    border: 2.5px solid var(--ink);
    border-radius: 15px;
    box-shadow: 0 4px 0 rgba(58, 38, 24, 0.35);
    gap: 6px 10px;
    flex-wrap: wrap;
    align-items: center;
    font-size: 0.78rem;
    font-weight: 900;
  }
  .decorating .deco-panel { display: flex; }
  .deco-panel .seg {
    display: inline-flex;
    gap: 2px;
    background: var(--paper);
    border: 2px solid var(--ink);
    border-radius: 10px;
    padding: 2px;
  }
  .deco-panel .seg button {
    border: none;
    background: transparent;
    color: var(--ink);
    font-family: var(--display);
    font-size: 0.74rem;
    font-weight: 900;
    padding: 3px 8px;
    border-radius: 7px;
    cursor: pointer;
  }
  .deco-panel .seg button.on { background: var(--gold); box-shadow: inset 0 0 0 1.5px var(--ink); }
  .deco-note { width: 100%; font-size: 0.74rem; color: var(--ink-soft); font-weight: 800; }

  /* ============ SCÈNE SCROLLABLE DU DOMAINE ============ */
  .viewport {
    position: relative;
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    overflow-x: hidden;
    scroll-behavior: smooth;
    -webkit-overflow-scrolling: touch;
  }
  .world {
    position: relative;
    width: 100%;
    aspect-ratio: 420 / 820;
    min-height: 100%;
    user-select: none;
    overflow: hidden;
  }
  .device.wide .world { aspect-ratio: 960 / 610; }
  .bg-svg { position: absolute; inset: 0; width: 100%; height: 100%; display: block; }

  /* ============ ANIMATIONS DOUCES ============ */
  @keyframes cloudDrift { 0% { transform: translateX(-55px); } 100% { transform: translateX(1020px); } }
  @keyframes bob { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-3px); } }
  @keyframes cmbob { 50% { transform: translate(-50%, -4px); } }
  @keyframes popHit {
    0% { transform: translate(-50%, -50%) scale(1); }
    35% { transform: translate(-50%, -50%) scale(1.12, 0.9); }
    70% { transform: translate(-50%, -50%) scale(0.96, 1.05); }
    100% { transform: translate(-50%, -50%) scale(1); }
  }
  @keyframes smokeRise {
    0% { transform: translateY(0) scale(0.55); opacity: 0; }
    25% { opacity: 0.78; }
    100% { transform: translateY(-20px) translateX(6px) scale(1.35); opacity: 0; }
  }
  @keyframes waterShimmer { 0%, 100% { transform: translateX(0); opacity: 0.5; } 50% { transform: translateX(6px); opacity: 0.9; } }
  @keyframes ripple { 0% { transform: scale(0.4); opacity: 0.9; } 100% { transform: scale(1.9); opacity: 0; } }
  @keyframes firefly {
    0%, 100% { transform: translate(0, 0); opacity: 0.12; }
    42% { transform: translate(10px, -12px); opacity: 0.96; }
    78% { transform: translate(-7px, -4px); opacity: 0.55; }
  }
  @keyframes rainFall {
    0% { transform: translateY(-20px) translateX(6px); opacity: 0; }
    15% { opacity: 0.72; }
    100% { transform: translateY(120px) translateX(-16px); opacity: 0; }
  }
  @keyframes snowFall {
    0% { transform: translateY(-10px) translateX(0); opacity: 0; }
    20% { opacity: 0.95; }
    100% { transform: translateY(130px) translateX(20px); opacity: 0; }
  }
  @keyframes trainLeave { 0% { transform: translateX(0); opacity: 1; } 100% { transform: translateX(-170px); opacity: 0; } }
  @keyframes trainArrive { 0% { transform: translateX(-150px); opacity: 0; } 22% { opacity: 1; } 100% { transform: translateX(0); opacity: 1; } }
  @keyframes planeFly { 0% { transform: translateX(-90px) translateY(14px); opacity: 0; } 8% { opacity: 1; } 92% { opacity: 1; } 100% { transform: translateX(1040px) translateY(-18px); opacity: 0; } }
  @keyframes pulseRing { 0% { transform: translate(-50%, -50%) scale(0.65); opacity: 0.92; } 100% { transform: translate(-50%, -50%) scale(1.65); opacity: 0; } }
  @keyframes twinkle { 0%, 100% { opacity: 0.3; } 50% { opacity: 1; } }

  .cloud-a { animation: cloudDrift 58s linear infinite; }
  .cloud-b { animation: cloudDrift 78s linear -28s infinite; }
  .cloud-c { animation: cloudDrift 64s linear -12s infinite; }
  .water-line { animation: waterShimmer 3.2s ease-in-out infinite; }
  .ripple-ring { transform-box: fill-box; transform-origin: center; animation: ripple 2.1s ease-out infinite; }
  .star { animation: twinkle 2.8s ease-in-out infinite; }
  .star.s2 { animation-delay: 1.1s; }
  .star.s3 { animation-delay: 2s; }
  .bob-a { animation: bob 3.1s ease-in-out infinite; }
  .bob-b { animation: bob 2.7s ease-in-out 0.9s infinite; }
  .smoke-a { animation: smokeRise 2.8s ease-out infinite; }
  .smoke-b { animation: smokeRise 2.8s ease-out 1.4s infinite; }

  /* Avion cargo réel Meuh */
  .sky-plane {
    position: absolute;
    top: 4%;
    left: 0;
    width: 44px;
    height: 44px;
    z-index: 4;
    pointer-events: none;
    animation: planeFly 26s linear 3s infinite;
    filter: drop-shadow(0 10px 4px rgba(58, 38, 24, 0.16));
  }

  /* ============ HOTSPOTS DU DOMAINE (STYLE CAMPMAP.JS SUBLIMÉ) ============ */
  .spot {
    position: absolute;
    transform: translate(-50%, -50%);
    cursor: pointer;
    z-index: 6;
    display: flex;
    flex-direction: column;
    align-items: center;
    background: none;
    border: none;
    padding: 0;
    font-family: var(--display);
    transition: filter 0.2s ease;
  }
  .spot:hover { z-index: 13; filter: brightness(1.04); }
  .spot.hit { animation: popHit 0.4s cubic-bezier(.34,1.56,.64,1); }
  .spot.spotlight::after {
    content: '';
    position: absolute;
    left: 50%; top: 52%;
    width: 98px; height: 98px;
    border-radius: 50%;
    border: 4px solid #fff2b0;
    pointer-events: none;
    animation: pulseRing 0.9s ease-out 2;
  }
  .spot-art {
    position: relative;
    width: 100%;
    display: flex;
    align-items: flex-end;
    justify-content: center;
  }
  .spot-art svg {
    width: 100%;
    height: auto;
    display: block;
    filter: drop-shadow(0 3px 0 rgba(58, 38, 24, 0.2));
  }

  /* Composites multi-sprites (ex: Champs = parcelles + serre, Gare = bâtiment + train, Pré = écuries + animaux) */
  .comp-train {
    position: absolute;
    right: -28%;
    bottom: 2%;
    width: 72%;
    display: flex;
    align-items: flex-end;
    pointer-events: none;
  }
  .comp-train .loco { width: 58%; margin-right: -12%; z-index: 2; }
  .comp-train .wag { width: 48%; }
  .comp-train.departing { animation: trainLeave 1.35s cubic-bezier(.55,.06,.68,.19) forwards; }
  .comp-train.arriving { animation: trainArrive 1.4s cubic-bezier(.22,1,.36,1) forwards; }

  .comp-village {
    position: relative;
    width: 100%;
    display: flex;
    align-items: flex-end;
    justify-content: center;
  }
  .comp-village .main { width: 66%; }
  .comp-village .side { width: 44%; margin-left: -12%; margin-bottom: 2%; }

  .comp-port {
    position: relative;
    width: 100%;
    display: flex;
    align-items: flex-end;
    justify-content: center;
  }
  .comp-port .main { width: 58%; }
  .comp-port .boat { width: 56%; margin-left: -14%; margin-bottom: -4%; }

  .comp-workshop {
    position: relative;
    width: 100%;
    display: flex;
    align-items: flex-end;
    justify-content: center;
  }
  .comp-workshop .main { width: 62%; }
  .comp-workshop .side { width: 48%; margin-left: -12%; margin-bottom: 2%; }

  .comp-fields {
    position: relative;
    width: 100%;
    padding: 12% 6% 8%;
    background: linear-gradient(180deg, #b57a44, #9c6434);
    border: 2.5px solid var(--ink);
    border-radius: 14px;
    box-shadow: inset 0 -4px 0 rgba(58, 38, 24, 0.2), 0 4px 0 rgba(58, 38, 24, 0.3);
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 2px;
  }
  .comp-fields .plot-cell {
    background: rgba(58, 38, 24, 0.14);
    border-radius: 6px;
    aspect-ratio: 1;
    display: grid;
    place-items: center;
    padding: 1px;
  }
  .comp-fields .gh-corner {
    position: absolute;
    right: -12%;
    top: -32%;
    width: 44%;
    filter: drop-shadow(0 3px 0 rgba(58, 38, 24, 0.22));
  }

  .comp-orchard {
    position: relative;
    width: 100%;
    display: flex;
    align-items: flex-end;
    justify-content: center;
  }
  .comp-orchard .t1 { width: 54%; }
  .comp-orchard .t2 { width: 50%; margin-left: -14%; }
  .comp-orchard .hive { width: 32%; margin-left: -10%; margin-bottom: 4%; }

  .comp-pasture {
    position: relative;
    width: 100%;
    padding: 10% 4% 4%;
    border: 2.5px solid #8b5a2b;
    border-radius: 16px;
    background: rgba(143, 214, 95, 0.28);
    box-shadow: inset 0 0 0 2px rgba(255, 244, 210, 0.35), 0 3px 0 rgba(58, 38, 24, 0.22);
    display: flex;
    align-items: flex-end;
    justify-content: space-around;
  }
  .comp-pasture .stud-bg {
    position: absolute;
    right: 2%;
    top: -38%;
    width: 46%;
    z-index: 1;
  }
  .comp-pasture .cow { width: 42%; z-index: 2; }
  .comp-pasture .hen { width: 26%; z-index: 3; margin-left: -8%; }
  .comp-pasture .horse { width: 40%; z-index: 2; }

  .comp-pond {
    position: relative;
    width: 100%;
    display: flex;
    align-items: flex-end;
    justify-content: center;
  }
  .comp-pond .main { width: 88%; }

  /* Fumée douce d'atelier actif */
  .chimney-smoke {
    position: absolute;
    top: -10%;
    right: 20%;
    width: 18px;
    height: 18px;
    pointer-events: none;
  }
  .chimney-smoke i {
    position: absolute;
    inset: 3px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.85);
    border: 1.5px solid rgba(58, 38, 24, 0.22);
  }

  /* Halo chaud nuit (comme cm-glow de campmap.js) */
  .cm-glow {
    position: absolute;
    left: 50%; top: 54%;
    width: 76%; height: 54%;
    transform: translate(-50%, -50%);
    border-radius: 50%;
    background: radial-gradient(circle, rgba(255, 214, 96, 0.72) 0%, rgba(255, 190, 64, 0) 72%);
    opacity: var(--glow-op);
    transition: opacity 0.6s ease;
    pointer-events: none;
    mix-blend-mode: screen;
  }

  /* Étiquette très discrète (masquée en Focus ou Carte postale) */
  .spot-name {
    margin-top: 1px;
    font-size: 10.5px;
    font-weight: 900;
    color: var(--ink);
    background: rgba(255, 247, 224, 0.86);
    border: 1.8px solid var(--ink);
    border-radius: 99px;
    padding: 0 7px;
    line-height: 1.38;
    white-space: nowrap;
    box-shadow: 0 2px 0 rgba(58, 38, 24, 0.35);
    transition: opacity 0.2s;
  }
  .focus-mode .spot:not(.has-bub) .spot-name { opacity: 0; }
  .focus-mode .spot:not(.has-bub) { filter: saturate(0.78) opacity(0.88); }
  .postcard .spot-name, .postcard .cm-bub, .postcard .deco-plus, .postcard .walker-bub { opacity: 0; pointer-events: none; }

  /* ============ BULLE D'ACTION OFFICIELLE MEUH (.cm-bub.ready) ============ */
  .cm-bub {
    position: absolute;
    left: 50%;
    top: -16px;
    transform: translate(-50%, 0);
    z-index: 16;
    min-width: 38px;
    height: 36px;
    padding: 3px 8px 3px 4px;
    border-radius: 99px;
    background: linear-gradient(#fffbe0, #fff099);
    border: 2.5px solid var(--ink);
    box-shadow: 0 3px 0 var(--ink), inset 0 1.5px 0 #fff;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 3px;
    font-size: 11.5px;
    font-weight: 900;
    color: var(--ink);
    cursor: pointer;
    animation: cmbob 1.5s ease-in-out infinite;
    white-space: nowrap;
  }
  .cm-bub.care { background: linear-gradient(#fff2fc, #f0c2f2); }
  .cm-bub.plant { background: linear-gradient(#ecfbff, #b8e6ff); }
  .cm-bub.ready { background: linear-gradient(#f5ffe6, #c6ef97); }
  .cm-bub .ico { width: 24px; height: 24px; }
  .cm-bub:active { transform: translate(-50%, 2px); box-shadow: 0 1px 0 var(--ink); }

  /* ============ POPOVER RAPIDE (SOIN PARFUM EN 1 TAP) ============ */
  .quick-pop {
    position: absolute;
    z-index: 26;
    transform: translate(-50%, -100%);
    background: var(--paper-l);
    border: 2.5px solid var(--ink);
    border-radius: 16px;
    padding: 9px;
    box-shadow: 0 6px 0 rgba(58, 38, 24, 0.38), 0 14px 28px rgba(58, 38, 24, 0.25);
    display: none;
    flex-direction: column;
    gap: 7px;
    width: 234px;
    color: var(--ink);
  }
  .quick-pop.open { display: flex; }
  .qp-head {
    font-size: 12.5px;
    font-weight: 900;
    display: flex;
    align-items: center;
    gap: 5px;
  }
  .qp-head .ico { width: 20px; height: 20px; }
  .qp-close {
    margin-left: auto;
    border: 2px solid var(--ink);
    background: var(--paper);
    color: var(--ink);
    width: 24px;
    height: 24px;
    border-radius: 50%;
    font-weight: 900;
    cursor: pointer;
    display: grid;
    place-items: center;
    line-height: 1;
  }
  .qp-btns { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
  .qp-opt {
    border: 2px solid var(--ink);
    background: linear-gradient(rgba(255,255,255,.45), transparent 50%), var(--paper);
    border-radius: 12px;
    padding: 6px 5px;
    box-shadow: 0 3px 0 var(--ink);
    cursor: pointer;
    font-family: var(--display);
    color: var(--ink);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
  }
  .qp-opt.deep { background: linear-gradient(rgba(255,255,255,.45), transparent 50%), #f0d8fa; }
  .qp-opt .ico { width: 22px; height: 22px; }
  .qp-opt strong { font-size: 11.5px; }
  .qp-opt span { font-size: 10px; color: var(--ink-soft); font-weight: 800; }
  .qp-opt:active { transform: translateY(2px); box-shadow: 0 1px 0 var(--ink); }

  /* ============ PERSONNAGES QUI MARCHENT (FILOU + MAMIE ODETTE) ============ */
  .walker {
    position: absolute;
    z-index: 12;
    transform: translate(-50%, -50%);
    transition: left 3.8s ease-in-out, top 3.8s ease-in-out;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .walker .ico { width: 100%; height: auto; filter: drop-shadow(0 3px 0 rgba(58,38,24,.22)); }
  .walker-bub {
    position: absolute;
    top: -26px;
    left: 50%;
    transform: translateX(-50%);
    background: linear-gradient(#fffbe0, #fff099);
    border: 2.2px solid var(--ink);
    border-radius: 99px;
    padding: 2px 7px 2px 4px;
    display: inline-flex;
    align-items: center;
    gap: 3px;
    font-size: 10.5px;
    font-weight: 900;
    color: var(--ink);
    box-shadow: 0 2.5px 0 var(--ink);
    white-space: nowrap;
    animation: cmbob 1.6s ease-in-out infinite;
  }
  .walker-bub .ico { width: 18px; height: 18px; filter: none; }

  /* ============ EMPLACEMENTS DÉCO PERSONNALISABLES ============ */
  .deco-slot {
    position: absolute;
    z-index: 8;
    transform: translate(-50%, -50%);
    width: 12%;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .device.wide .deco-slot { width: 6.5%; }
  .deco-slot .ico { width: 100%; height: auto; filter: drop-shadow(0 3px 0 rgba(58,38,24,.2)); }
  .deco-plus {
    display: none;
    width: 30px; height: 30px;
    border-radius: 50%;
    border: 2.5px dashed var(--ink);
    background: var(--paper-l);
    color: var(--ink);
    font-size: 18px;
    font-weight: 900;
    place-items: center;
    box-shadow: 0 3px 0 rgba(58,38,24,.28);
  }
  .decorating .deco-slot.empty .deco-plus { display: grid; }
  .decorating .deco-slot:not(.empty) {
    outline: 2.5px dashed var(--gold);
    border-radius: 50%;
    background: rgba(255, 246, 200, 0.4);
  }

  /* ============ ATMOSPHÈRE & JUICE ============ */
  .fx-layer { position: absolute; inset: 0; pointer-events: none; z-index: 17; overflow: hidden; }
  .night-overlay {
    position: absolute; inset: 0;
    background: radial-gradient(circle at 50% 48%, rgba(20, 32, 68, 0.1), rgba(14, 22, 52, 0.65));
    opacity: var(--night-op);
    transition: opacity 0.6s ease;
    pointer-events: none;
    z-index: 15;
  }
  .firefly {
    position: absolute; width: 6px; height: 6px; border-radius: 50%;
    background: #ffe875; box-shadow: 0 0 10px 3px rgba(255, 232, 117, 0.85);
    opacity: 0; animation: firefly 4.2s ease-in-out infinite;
  }
  [data-time="night"] .firefly, [data-time="evening"] .firefly { display: block; }
  [data-time="morning"] .firefly, [data-time="noon"] .firefly { display: none; }

  .weather-drop { position: absolute; pointer-events: none; }
  .weather-drop.rain {
    width: 2px; height: 17px; border-radius: 2px;
    background: linear-gradient(180deg, rgba(210, 236, 255, 0), rgba(190, 226, 255, 0.86));
    animation: rainFall 0.85s linear infinite;
  }
  .weather-drop.snow {
    width: 6px; height: 6px; border-radius: 50%;
    background: rgba(255, 255, 255, 0.94); box-shadow: 0 0 4px rgba(255, 255, 255, 0.8);
    animation: snowFall 4.2s linear infinite;
  }
  .weather-drop.petal { width: 8px; height: 5px; border-radius: 60% 40%; background: #ffb7cf; animation: snowFall 5.6s ease-in-out infinite; }
  .weather-drop.leaf { width: 9px; height: 6px; border-radius: 65% 35%; background: #e8792a; animation: snowFall 5.2s ease-in-out infinite; }

  .fly-item {
    position: fixed; z-index: 999; pointer-events: none;
    width: 30px; height: 30px;
    filter: drop-shadow(0 3px 0 rgba(58, 38, 24, 0.28));
  }
  .fly-item svg { width: 100%; height: 100%; display: block; }
  .burst-spark {
    position: fixed; z-index: 998; pointer-events: none;
    width: 9px; height: 9px; border-radius: 50%;
    background: #ffd95e; border: 1.5px solid var(--ink);
    transition: transform 0.48s cubic-bezier(.16,.84,.44,1), opacity 0.48s ease;
  }
  .float-txt {
    position: fixed; z-index: 999; pointer-events: none;
    display: inline-flex; align-items: center; gap: 4px;
    font-family: var(--display); font-size: 13px; font-weight: 900; color: #fff;
    background: var(--ink); padding: 3px 10px; border-radius: 99px;
    border: 2px solid var(--paper-l);
    transform: translate(-50%, 0); transition: transform 0.85s ease-out, opacity 0.85s ease-out;
  }
  .float-txt .ico { width: 16px; height: 16px; }

  .combo-pill {
    position: absolute; top: 96px; right: 12px; z-index: 24;
    background: linear-gradient(#ffe48a, var(--gold)); color: var(--ink);
    border: 2.5px solid var(--ink); border-radius: 99px; padding: 3px 10px;
    font-size: 12px; font-weight: 900; box-shadow: 0 3px 0 var(--ink);
    display: inline-flex; align-items: center; gap: 4px;
    opacity: 0; transform: scale(0.75);
    transition: opacity 0.2s, transform 0.22s cubic-bezier(.34,1.56,.64,1); pointer-events: none;
  }
  .combo-pill .ico { width: 16px; height: 16px; }
  .combo-pill.show { opacity: 1; transform: scale(1); }

  /* ============ FEUILLE DU BAS AUTHENTIQUE MEUH ============ */
  .sheet-bg {
    position: absolute; inset: 0; background: rgba(34, 22, 12, 0.45); z-index: 30;
    opacity: 0; pointer-events: none; transition: opacity 0.2s ease;
    display: flex; align-items: flex-end; justify-content: center;
  }
  .sheet-bg.open { opacity: 1; pointer-events: auto; }
  .sheet {
    width: 100%; max-width: 470px;
    background: var(--paper-l); color: var(--ink);
    border-top: 3px solid var(--ink);
    border-radius: 22px 22px 0 0;
    padding: 12px 15px 16px;
    transform: translateY(100%);
    transition: transform 0.24s cubic-bezier(.22,1,.36,1);
    box-shadow: 0 -10px 28px rgba(58, 38, 24, 0.28);
  }
  .sheet-bg.open .sheet { transform: translateY(0); }
  .sheet-handle { width: 42px; height: 4px; border-radius: 99px; background: rgba(58, 38, 24, 0.25); margin: 0 auto 10px; }
  .sheet-head { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
  .sheet-ico {
    width: 48px; height: 48px; border-radius: 14px;
    background: var(--paper); border: 2.5px solid var(--ink);
    box-shadow: 0 3px 0 rgba(58,38,24,.28);
    padding: 5px; display: grid; place-items: center; flex-shrink: 0;
  }
  .sheet-ico svg { width: 100%; height: 100%; }
  .sheet-title { font-size: 1.06rem; font-weight: 900; margin: 0; }
  .sheet-path { font-size: 0.78rem; font-weight: 800; color: var(--ink-soft); }
  .sheet-tags { display: flex; flex-wrap: wrap; gap: 5px; margin-bottom: 8px; }
  .sheet-tag {
    font-size: 0.73rem; font-weight: 900; background: var(--wood-ll);
    border: 1.8px solid var(--ink); border-radius: 99px; padding: 2px 9px;
  }
  .sheet-desc {
    font-size: 0.85rem; line-height: 1.45; margin: 4px 0 12px;
    background: #fff; border: 2px solid var(--wood-l); border-radius: 13px; padding: 9px 11px;
    font-weight: 700;
  }
  .sheet-actions { display: flex; gap: 8px; }
  .sheet-actions .btn { flex: 1; }
  .deco-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 7px; margin: 8px 0 12px; }
  .deco-choice {
    border: 2.2px solid var(--ink); background: var(--paper); border-radius: 12px;
    padding: 7px 4px; cursor: pointer; font-family: var(--display); color: var(--ink);
    display: flex; flex-direction: column; align-items: center; gap: 3px;
    font-size: 0.7rem; font-weight: 900;
    box-shadow: 0 3px 0 rgba(58,38,24,.35);
  }
  .deco-choice .ico { width: 30px; height: 30px; }
  .deco-choice.on { background: #e3fad0; box-shadow: 0 3px 0 var(--leaf-d); }

  /* ============ ONGLETS DU BAS OFFICIELS MEUH (20-layout.css) ============ */
  #tabs {
    position: relative;
    z-index: 22;
    display: flex;
    gap: 4px;
    padding: 6px 8px 7px;
    background: linear-gradient(rgba(255, 255, 255, 0.22), transparent 24px), var(--wood);
    border-top: 3px solid var(--ink);
    box-shadow: 0 -4px 12px rgba(58, 38, 24, 0.18);
    transition: opacity 0.25s, transform 0.25s;
  }
  .tab {
    position: relative;
    flex: 1 1 0;
    min-width: 0;
    border: none;
    background: transparent;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1px;
    padding: 4px 2px 3px;
    border-radius: 13px;
    color: #fff4dc;
    font-family: var(--display);
    cursor: pointer;
    transition: transform 0.12s, background 0.12s;
  }
  .tab-ico {
    width: 30px;
    height: 30px;
    filter: drop-shadow(0 2px 0 rgba(0, 0, 0, 0.28));
    transition: transform 0.15s;
  }
  .tab-ico .ico { width: 100%; height: 100%; }
  .tab-name {
    font-size: 0.68rem;
    font-weight: 900;
    letter-spacing: 0.01em;
    text-shadow: 0 1px 0 rgba(0, 0, 0, 0.38);
  }
  .tab.on {
    background: linear-gradient(#ffe48a, var(--gold));
    color: var(--ink);
    border: 2.5px solid var(--ink);
    box-shadow: 0 3px 0 var(--gold-d);
    transform: translateY(-6px);
    padding: 2px 2px 1px;
  }
  .tab.on .tab-name { text-shadow: none; }
  .tab.on .tab-ico { transform: scale(1.08); }
  .tab .dot {
    position: absolute;
    top: -4px;
    right: calc(50% - 25px);
    min-width: 18px;
    height: 18px;
    padding: 0 4px;
    border-radius: 99px;
    background: var(--red);
    color: #fff;
    border: 2px solid var(--ink);
    font-size: 0.68rem;
    font-weight: 900;
    display: grid;
    place-items: center;
    box-shadow: 0 2px 0 rgba(58, 38, 24, 0.4);
  }

  .exit-postcard {
    position: absolute; bottom: 16px; left: 50%; transform: translateX(-50%);
    z-index: 25; display: none;
  }
  .postcard .exit-postcard { display: inline-flex; }

  .toast {
    position: absolute; bottom: 76px; left: 50%;
    transform: translateX(-50%) translateY(12px);
    background: var(--ink); color: var(--paper-l);
    border: 2px solid var(--wood-l);
    font-size: 0.8rem; font-weight: 900; padding: 7px 14px; border-radius: 99px;
    z-index: 28; opacity: 0; pointer-events: none;
    transition: opacity 0.2s, transform 0.2s; white-space: nowrap;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
  }
  .toast.show { opacity: 1; transform: translateX(-50%) translateY(0); }
</style>
</head>
<body>
<div class="studio">
  <!-- Barre de réglages extérieure (ne fait PAS partie du jeu) -->
  <div class="studio-bar" aria-label="Réglages de test">
    <div class="studio-title">
      <span class="ico">${ART.u_house}</span>
      <span>Meuh · Vue du Domaine</span>
      <span class="studio-tag">100 % vrais sprites src/art/</span>
    </div>
    <div class="seg-ctrl" data-ctrl="layout">
      <button class="on" data-val="phone">Téléphone</button>
      <button data-val="wide">Grand écran</button>
    </div>
    <div class="seg-ctrl" data-ctrl="time">
      <button data-val="morning">Aube</button>
      <button class="on" data-val="noon">Jour</button>
      <button data-val="evening">Soir</button>
      <button data-val="night">Nuit</button>
    </div>
    <div class="seg-ctrl" data-ctrl="season">
      <button class="on" data-val="spring">Printemps</button>
      <button data-val="summer">Été</button>
      <button data-val="autumn">Automne</button>
      <button data-val="winter">Hiver</button>
    </div>
    <div class="seg-ctrl" data-ctrl="weather">
      <button class="on" data-val="clear">Clair</button>
      <button data-val="rain">Pluie</button>
    </div>
    <div class="seg-ctrl" data-ctrl="stage">
      <button data-val="early">Niv. 3</button>
      <button data-val="mid">Niv. 25</button>
      <button class="on" data-val="full">Niv. 60</button>
    </div>
    <div class="seg-ctrl">
      <button class="on" id="btnLive">Vie auto</button>
      <button id="btnCalm">Calme</button>
      <button class="on" id="btnSound">Son</button>
      <button id="btnReset">Remettre</button>
    </div>
  </div>

  <!-- LE JEU TEL QU'IL SERAIT DANS MEUH -->
  <div class="stage">
    <div class="device" id="device" data-time="noon" data-season="spring" data-path="sand">
      <!-- En-tête officiel Meuh flottant sur le ciel -->
      <header class="meuh-hud">
        <div class="lvl">
          <div class="lvl-star"><span class="ico">${ART.u_star}</span><b id="lvlVal">60</b></div>
          <div class="xp-bar"><i></i><small>68 %</small></div>
        </div>
        <div class="meuh-pill coins" id="pillCoins"><span class="ico">${ART.u_coin}</span><b id="coinsVal">12 450</b></div>
        <div class="meuh-pill barn" id="pillBarn"><span class="ico">${ART.u_barn}</span><b id="barnVal">148/220</b></div>
        <div class="hud-tools">
          <button class="tool-sq" id="btnFocus" title="Mode Focus : ne montrer que les bâtiments actifs"><span class="ico">${ART.u_sparkle}</span></button>
          <button class="tool-sq" id="btnDeco" title="Personnaliser la maison, le chemin et les décos"><span class="ico">${ART.u_flowers}</span></button>
          <button class="tool-sq" id="btnPostcard" title="Mode Carte postale"><span class="ico">${ART.u_camera}</span></button>
        </div>
      </header>

      <!-- Barre Personnalisation -->
      <div class="deco-panel" id="decoBar">
        <span>Toit :</span>
        <div class="seg" data-style="roof">
          <button class="on" data-val="red">Tuile</button>
          <button data-val="slate">Ardoise</button>
          <button data-val="lav">Lavande</button>
        </div>
        <span>Chemin :</span>
        <div class="seg" data-style="path">
          <button class="on" data-val="sand">Sable</button>
          <button data-val="cobble">Pavés</button>
          <button data-val="brick">Tomette</button>
        </div>
        <div class="deco-note">Touche un cercle « + » ou une déco sur le domaine pour placer tes trophées Meuh.</div>
      </div>

      <!-- Barre Tournée rapide -->
      <div class="tour-strip" id="tourBar"></div>

      <!-- Combo -->
      <div class="combo-pill" id="comboPill"><span class="ico">${ART.u_star}</span><span id="comboTxt">Tournée ×3</span></div>

      <!-- Paysage vivant du Domaine -->
      <div class="viewport" id="viewport">
        <div class="world" id="world">
          <svg class="bg-svg" id="bgSvg" viewBox="0 0 420 820" preserveAspectRatio="none" aria-hidden="true"></svg>
          <div class="sky-plane" id="skyPlane"><span class="ico">${ART.u_plane}</span></div>
          <div id="decoLayer"></div>
          <div id="spotsLayer"></div>
          <div id="walkersLayer"></div>
          <div class="quick-pop" id="quickPop"></div>
          <div class="night-overlay"></div>
          <div class="fx-layer" id="fxLayer"></div>
        </div>
      </div>

      <button class="btn gold sm exit-postcard" id="btnExitPostcard"><span class="ico">${ART.u_camera}</span><span>Réafficher le jeu</span></button>
      <div class="toast" id="toast"></div>

      <!-- Fiche bâtiment / déco -->
      <div class="sheet-bg" id="sheetBg">
        <div class="sheet" role="dialog" aria-modal="true" id="sheetBox"></div>
      </div>

      <!-- Barre d'onglets officielle en bois de Meuh -->
      <nav id="tabs" aria-label="Navigation principale">
        <button class="tab on" data-tab="domaine">
          <span class="tab-ico"><span class="ico">${ART.u_house}</span></span>
          <span class="tab-name">Domaine</span>
        </button>
        <button class="tab" data-tab="farm">
          <span class="tab-ico"><span class="ico">${ART.i_wheat}</span></span>
          <span class="tab-name">Ferme</span>
          <span class="dot" id="dot-farm">0</span>
        </button>
        <button class="tab" data-tab="animals">
          <span class="tab-ico"><span class="ico">${ART.a_chicken}</span></span>
          <span class="tab-name">Animaux</span>
          <span class="dot" id="dot-animals">0</span>
        </button>
        <button class="tab" data-tab="machines">
          <span class="tab-ico"><span class="ico">${ART.m_bakery}</span></span>
          <span class="tab-name">Atelier</span>
          <span class="dot" id="dot-machines">0</span>
        </button>
        <button class="tab" data-tab="village">
          <span class="tab-ico"><span class="ico">${ART.p_gaston}</span></span>
          <span class="tab-name">Village</span>
          <span class="dot" id="dot-village">0</span>
        </button>
        <button class="tab" data-tab="market">
          <span class="tab-ico"><span class="ico">${ART.u_stall}</span></span>
          <span class="tab-name">Marché</span>
        </button>
      </nav>
    </div>
  </div>
</div>

<script>
(() => {
  const ART = ${JSON.stringify(ART)};
  const ico = (k, cls = '') => \`<span class="ico \${cls}">\${ART[k] || ''}</span>\`;

  // ---------------- AUDIO DOUX PENTATONIQUE ----------------
  let audioCtx = null, soundOn = true, comboCount = 0, comboTimer = 0;
  const PENTA = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5, 1174.66, 1318.5];
  function getCtx() {
    if (!soundOn) return null;
    try {
      audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
      if (audioCtx.state === 'suspended') audioCtx.resume();
      return audioCtx;
    } catch { return null; }
  }
  function tone(freq, dur, type = 'triangle', vol = 0.075, delay = 0, slideTo = null) {
    const ctx = getCtx();
    if (!ctx) return;
    const t0 = ctx.currentTime + delay;
    const osc = ctx.createOscillator(), g = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur * 0.7);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol, t0 + 0.014);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g).connect(ctx.destination);
    osc.start(t0); osc.stop(t0 + dur + 0.02);
  }
  function playSfx(kind) {
    if (kind === 'open') return tone(440, 0.12, 'sine', 0.04);
    if (kind === 'coin') { tone(987.77, 0.15, 'sine', 0.06, 0); tone(1318.5, 0.24, 'triangle', 0.07, 0.07); return; }
    if (kind === 'train') {
      tone(440, 0.25, 'triangle', 0.055, 0, 446); tone(554.37, 0.25, 'sine', 0.045, 0, 560);
      tone(440, 0.36, 'triangle', 0.055, 0.28, 434); tone(554.37, 0.36, 'sine', 0.045, 0.28, 548);
      return;
    }
    if (kind === 'dog') { tone(620, 0.09, 'triangle', 0.06, 0, 760); tone(740, 0.12, 'triangle', 0.06, 0.1, 880); return; }
    if (kind === 'plant') return tone(392, 0.12, 'sine', 0.05, 0, 494);
    if (kind === 'perfume') { tone(659.25, 0.2, 'sine', 0.055, 0); tone(880, 0.26, 'sine', 0.055, 0.08); tone(1318.5, 0.34, 'triangle', 0.05, 0.16); return; }
    const f = PENTA[comboCount % PENTA.length];
    tone(f, 0.3, 'triangle', 0.075, 0, f * 1.015);
    tone(f * 2, 0.2, 'sine', 0.025, 0.02);
  }
  function bumpCombo() {
    comboCount++;
    clearTimeout(comboTimer);
    const pill = document.getElementById('comboPill');
    if (comboCount >= 3) {
      document.getElementById('comboTxt').textContent = comboCount >= 6 ? \`Tournée royale ×\${comboCount}\` : \`Belle tournée ×\${comboCount}\`;
      pill.classList.add('show');
    }
    comboTimer = setTimeout(() => { comboCount = 0; pill.classList.remove('show'); }, 2500);
  }

  // ---------------- DÉCOS RÉELLES MEUH ----------------
  const DECOS = [
    { id: 'none', name: 'Libre', art: 'u_seedPack', empty: true },
    { id: 'fountain', name: 'Fontaine', art: 'b_fountain' },
    { id: 'arch', name: 'Arche fleurie', art: 'u_flowerArch' },
    { id: 'pfFountain', name: 'Fontaine parfum', art: 'u_perfumeFountain' },
    { id: 'trophy', name: 'Trophée', art: 'u_trophy' },
    { id: 'cart', name: 'Charrette', art: 'u_appleCart' },
    { id: 'birdhouse', name: 'Nichoir', art: 'u_birdhouse' },
    { id: 'wish', name: 'Étoile', art: 'u_wishStar' },
  ];

  // ---------------- ZONES DU DOMAINE (VRAIS SPRITES MEUH) ----------------
  const makeZones = () => [
    {
      id: 'station', name: 'Gare & Train', tab: 'village', path: 'Village › Commandes', ico: 'u_train',
      unlock: 'early', posP: [22, 18], posW: [17, 20], wP: 26, wW: 14, trainState: 'here',
      meta: ['Train régional', '3 wagons prêts', '+420 pièces'],
      bubble: { ico: 'u_train', label: '3', cls: 'gold', urgent: true, gainCoins: 420, gainBarn: 0, fly: ['i_bread','u_coin','u_coin'], sfx: 'train', msg: 'Train expédié ! +420 pièces' },
      desc: 'Le train régional est à quai avec ses wagons. Touche la bulle pour charger et faire partir le train sur les rails.',
      render: z => \`
        <div class="spot-art">
          \${ART.b_station}
          \${z.trainState !== 'gone' ? \`<div class="comp-train \${z.trainState === 'departing' ? 'departing' : z.trainState === 'arriving' ? 'arriving' : ''}"><span class="loco">\${ART.v_loco}</span><span class="wag">\${ART.v_wagon1}</span></div>\` : ''}
        </div>\`
    },
    {
      id: 'village', name: 'Village', tab: 'village', path: 'Village › Place & Camping', ico: 'u_village',
      unlock: 'mid', posP: [54, 17], posW: [50, 18], wP: 26, wW: 14,
      meta: ['Mairie & habitants', 'Camping de la vallée', 'Famille'],
      bubble: { ico: 'u_basket', label: 'Mamie', cls: 'gold', gainCoins: 280, gainBarn: 1, fly: ['u_basket','u_heart','u_coin'], sfx: 'coin', msg: 'Commande livrée au village ! +280 pièces' },
      desc: 'La place du village, le Camping et ta Famille t’attendent juste au bout du chemin.',
      render: () => \`<div class="spot-art comp-village"><span class="main">\${ART.b_townhall}</span><span class="side">\${ART.c_tent}</span></div>\`
    },
    {
      id: 'port', name: 'Voyages', tab: 'farm', path: 'Ferme › Voyages (Île, Oasis, Nord)', ico: 'u_oaVoyages',
      unlock: 'full', posP: [84, 21], posW: [84, 21], wP: 24, wW: 13.5,
      meta: ['Île tropicale', 'Oasis', 'Grand Nord'],
      bubble: { ico: 'i_pineapple', label: '4', cls: 'ready', gainCoins: 0, gainBarn: 4, fly: ['i_pineapple','i_coconut','i_wood'], sfx: 'harvest', msg: '+4 récoltes ramenées de l’île !' },
      desc: 'L’Île, l’Oasis et le Grand Nord depuis le quai du phare. L’avion cargo survole aussi le domaine.',
      render: () => \`<div class="spot-art comp-port"><span class="main">\${ART.b_lighthouse}</span><span class="boat bob-a">\${ART.u_boat}</span></div>\`
    },
    {
      id: 'house', name: 'Maison', tab: 'farm', path: 'Ferme › Maison', ico: 'u_house',
      unlock: 'early', posP: [50, 40], posW: [49, 43], wP: 28, wW: 15, glow: true,
      meta: ['Maison évolutive', 'Toit personnalisable', 'Gazette du matin'],
      bubble: { ico: 'u_scroll', label: 'Gazette', cls: 'gold', gainCoins: 120, gainBarn: 0, fly: ['u_scroll','u_coin'], sfx: 'coin', msg: 'Gazette de la Vallée lue ! +120 pièces' },
      desc: 'Ta vraie maison Meuh évolue avec ton niveau (essaie Niv. 3 → 25 → 60) et reflète ta couleur de toit.',
      render: () => {
        const lvl = app.stage === 'early' ? '1' : app.stage === 'mid' ? '3' : '5';
        return \`<div class="spot-art">\${ART['fh_' + lvl + '_' + app.roof]}</div>\`;
      }
    },
    {
      id: 'barn', name: 'Grange', tab: 'market', path: 'Marché › Grange & Coffre', ico: 'u_barn',
      unlock: 'early', posP: [18, 42], posW: [21, 45], wP: 22, wW: 12,
      meta: ['Réserves de la ferme', 'Coffre', 'Ventes'],
      bubble: null,
      desc: 'Toutes tes récoltes volent ici. Ouvre la grange, les ventes ou le coffre en un geste.',
      render: () => \`<div class="spot-art">\${ART.u_barn}</div>\`
    },
    {
      id: 'workshop', name: 'Ateliers', tab: 'machines', path: 'Atelier › Production', ico: 'm_bakery',
      unlock: 'early', posP: [82, 42], posW: [77, 43], wP: 27, wW: 14.5, glow: true,
      meta: ['Moulin & Four à pain', '5 produits prêts'],
      bubble: { ico: 'i_bread', label: '5', cls: 'ready', gainCoins: 0, gainBarn: 5, fly: ['i_bread','i_cheese','i_bread'], sfx: 'harvest', msg: '+5 produits sortis des ateliers !' },
      desc: 'Tes machines travaillent dans la cour. Touche la bulle pour tout récolter sans quitter le domaine.',
      render: z => \`
        <div class="spot-art comp-workshop">
          <span class="main">\${ART.b_windmill}</span>
          <span class="side">\${ART.m_bakery}</span>
          \${z.bubble ? '<span class="chimney-smoke"><i class="smoke-a"></i><i class="smoke-b"></i></span>' : ''}
        </div>\`
    },
    {
      id: 'counter', name: 'Comptoir', tab: 'machines', path: 'Atelier › Comptoir', ico: 'm_counter',
      unlock: 'mid', posP: [30, 56], posW: [35, 58], wP: 20, wW: 10.5,
      meta: ['Ventes directes', 'Caisse prête'],
      bubble: { ico: 'u_coin', label: '+310', cls: 'gold', gainCoins: 310, gainBarn: 0, fly: ['u_coin','u_coin','u_coin'], sfx: 'coin', msg: 'Caisse du comptoir encaissée ! +310 pièces' },
      desc: 'Encaisse les ventes du comptoir directement depuis la cour en un seul tap.',
      render: () => \`<div class="spot-art">\${ART.m_counter}</div>\`
    },
    {
      id: 'perfume', name: 'Parfumerie', tab: 'machines', path: 'Atelier › Parfums', ico: 'u_perfume',
      unlock: 'full', posP: [69, 55], posW: [64, 57], wP: 21, wW: 11, glow: true,
      meta: ['Ambre d’Été en cours', 'Soin d’étape prêt'],
      bubble: { ico: 'u_perfume', label: 'Soin', cls: 'care', urgent: true, popover: 'perfume' },
      desc: 'Touche la bulle pour appliquer le geste rapide ou le soin approfondi directement depuis la carte.',
      render: () => \`<div class="spot-art">\${ART.m_perfumery}</div>\`
    },
    {
      id: 'cave', name: 'Cave & Brasserie', tab: 'machines', path: 'Atelier › Cave & Brasserie', ico: 'u_cave',
      unlock: 'mid', posP: [86, 66], posW: [86, 61], wP: 23, wW: 12.5,
      meta: ['2 fûts prêts', 'Coteau viticole'],
      bubble: { ico: 'u_beer', label: '2', cls: 'ready', gainCoins: 0, gainBarn: 2, fly: ['u_cave','u_beer'], sfx: 'harvest', msg: '+2 cuvées mises en bouteille !' },
      desc: 'Cave à vins et brasserie d’abbaye nichées au flanc du coteau.',
      render: () => \`<div class="spot-art">\${ART.b_chai}</div>\`
    },
    {
      id: 'fields', name: 'Champs & Serre', tab: 'farm', path: 'Ferme › Champ', ico: 'i_wheat',
      unlock: 'early', posP: [27, 72], posW: [21, 75], wP: 34, wW: 18, fieldPhase: 'ready',
      meta: ['6 parcelles', 'Serre vitrée'],
      bubble: { ico: 'i_wheat', label: '6', cls: 'ready', gainCoins: 0, gainBarn: 6, fly: ['i_wheat','i_strawberry','i_sunflower'], sfx: 'harvest', msg: '6 parcelles récoltées ! Tu peux ressemer sur place.' },
      desc: 'Tes vraies cultures Meuh mûrissent dans le terrain. Après récolte, une bulle bleue permet de ressemer en un tap.',
      render: z => {
        const p = z.fieldPhase;
        const cells = p === 'ready'
          ? [ART.pl_wheat3, ART.pl_straw3, ART.pl_sun3, ART.pl_wheat3, ART.pl_straw3, ART.pl_wheat3]
          : p === 'growing'
            ? [ART.pl_wheat1, ART.pl_wheat0, ART.pl_wheat1, ART.pl_wheat0, ART.pl_wheat1, ART.pl_wheat0]
            : ['', '', '', '', '', ''];
        return \`
          <div class="spot-art">
            <div class="comp-fields">
              \${cells.map(c => \`<span class="plot-cell">\${c}</span>\`).join('')}
              <span class="gh-corner">\${ART.u_greenhouse}</span>
            </div>
          </div>\`;
      }
    },
    {
      id: 'orchard', name: 'Verger & Ruches', tab: 'farm', path: 'Ferme › Verger', ico: 'i_apple',
      unlock: 'mid', posP: [64, 74], posW: [46, 78], wP: 28, wW: 15,
      meta: ['Arbres fruitiers', 'Miel prêt'],
      bubble: { ico: 'i_honey', label: '4', cls: 'ready', gainCoins: 0, gainBarn: 4, fly: ['i_apple','i_honey','i_cherry'], sfx: 'harvest', msg: 'Fruits du verger et miel récoltés !' },
      desc: 'Pommiers, cerisiers et ruches au sud de la cour.',
      render: z => \`
        <div class="spot-art comp-orchard">
          <span class="t1">\${z.bubble ? ART.pl_apple3 : ART.pl_apple1}</span>
          <span class="t2">\${ART.pl_cherry3}</span>
          <span class="hive bob-b">\${ART.a_bees}</span>
        </div>\`
    },
    {
      id: 'pasture', name: 'Prés & Haras', tab: 'animals', path: 'Animaux › Prés & Haras', ico: 'u_hEcuries',
      unlock: 'early', posP: [30, 89], posW: [71, 80], wP: 34, wW: 18,
      meta: ['Vache, poules & cheval', 'Écuries du Haras'],
      bubble: { ico: 'i_milk', label: '4', cls: 'ready', gainCoins: 0, gainBarn: 4, fly: ['i_milk','i_egg','i_cheese'], sfx: 'harvest', msg: 'Lait frais et œufs ramassés !' },
      desc: 'Tes vrais animaux Meuh pâturent devant les écuries du Haras.',
      render: () => \`
        <div class="spot-art comp-pasture">
          <span class="stud-bg">\${ART.b_stud}</span>
          <span class="cow bob-a">\${ART.a_cow}</span>
          <span class="hen bob-b">\${ART.a_chicken}</span>
          <span class="horse bob-a">\${ART.a_horse}</span>
        </div>\`
    },
    {
      id: 'pond', name: 'Étang & Forêt', tab: 'farm', path: 'Ferme › Pêche & Nature', ico: 'u_rod',
      unlock: 'mid', posP: [76, 89], posW: [89, 83], wP: 26, wW: 14,
      meta: ['Ligne tendue', 'Bois de forêt'],
      bubble: { ico: 'i_trout', label: 'Prise', cls: 'ready', gainCoins: 0, gainBarn: 2, fly: ['i_trout','i_wood'], sfx: 'harvest', msg: 'Belle truite ramenée de l’étang !' },
      desc: 'Le ponton de pêche et la lisière du bois, prêts en un geste.',
      render: () => \`<div class="spot-art comp-pond"><span class="main">\${ART.b_pontoon}</span></div>\`
    }
  ];

  // ---------------- ÉTAT ----------------
  const app = {
    layout: 'phone', time: 'noon', season: 'spring', weather: 'clear', stage: 'full',
    roof: 'red', pathStyle: 'sand', live: true, calm: false, focus: false, decorating: false, postcard: false,
    coins: 12450, barn: 148,
    zones: makeZones(),
    decoSlots: [
      { id: 0, posP: [36, 46], posW: [36, 45], deco: 'fountain' },
      { id: 1, posP: [64, 46], posW: [61, 45], deco: 'arch' },
      { id: 2, posP: [49, 64], posW: [49, 63], deco: 'pfFountain' },
      { id: 3, posP: [14, 59], posW: [12, 60], deco: 'none' },
      { id: 4, posP: [50, 82], posW: [58, 70], deco: 'trophy' },
    ],
    dog: { xP: 56, yP: 48, xW: 54, yW: 51, hasTreasure: true },
    visitor: { active: true, name: 'Mamie Odette', wantIco: 'i_cake', gain: 190, xP: 45, yP: 53, xW: 44, yW: 55 },
  };
  const STAGE_ORDER = { early: 1, mid: 2, full: 3 };
  const unlocked = z => STAGE_ORDER[z.unlock] <= STAGE_ORDER[app.stage];

  // ---------------- DÉCOR PAYSAGER (TRAIT #3a2618 MEUH) ----------------
  function renderBackground() {
    const wide = app.layout === 'wide';
    const svg = document.getElementById('bgSvg');
    const W = wide ? 960 : 420, H = wide ? 610 : 820;
    svg.setAttribute('viewBox', \`0 0 \${W} \${H}\`);
    const skyH = wide ? 128 : 150;
    const O = '#3a2618';

    // Arbres sauvages dans les zones non encore débloquées (vrai style rond Meuh!)
    const treeTop = app.season === 'autumn' ? '#e8792a' : app.season === 'winter' ? '#dfeaf0' : '#56b566';
    const treeTop2 = app.season === 'autumn' ? '#f0b23a' : app.season === 'winter' ? '#eef6fa' : app.season === 'spring' ? '#f5a8c4' : '#3f9a58';

    const wildWoods = app.zones.filter(z => !unlocked(z)).map(z => {
      const [px, py] = wide ? z.posW : z.posP;
      const cx = (px / 100) * W, cy = (py / 100) * H;
      return \`
        <g>
          <ellipse cx="\${cx}" cy="\${cy + 18}" rx="30" ry="6" fill="rgba(58,38,24,.15)"/>
          <rect x="\${cx - 17}" y="\${cy + 1}" width="7" height="17" rx="2" fill="#8b5a32" stroke="\${O}" stroke-width="2"/>
          <circle cx="\${cx - 13}" cy="\${cy - 7}" r="14.5" fill="\${treeTop}" stroke="\${O}" stroke-width="2.2"/>
          <rect x="\${cx + 8}" y="\${cy + 3}" width="7" height="15" rx="2" fill="#8b5a32" stroke="\${O}" stroke-width="2"/>
          <circle cx="\${cx + 12}" cy="\${cy - 4}" r="13.5" fill="\${treeTop2}" stroke="\${O}" stroke-width="2.2"/>
          <circle cx="\${cx}" cy="\${cy - 13}" r="12.5" fill="\${treeTop}" stroke="\${O}" stroke-width="2.2"/>
        </g>\`;
    }).join('');

    const sunX = wide ? W * 0.72 : 318;
    const sunY = app.time === 'evening' ? 62 : app.time === 'morning' ? 48 : 34;

    svg.innerHTML = \`
      <defs>
        <linearGradient id="skyG" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="var(--sky-top)"/>
          <stop offset="100%" stop-color="var(--sky-bot)"/>
        </linearGradient>
        <linearGradient id="meadowG" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="var(--meadow-1)"/>
          <stop offset="55%" stop-color="var(--meadow-2)"/>
          <stop offset="100%" stop-color="var(--meadow-3)"/>
        </linearGradient>
      </defs>

      <!-- Ciel officiel Meuh -->
      <rect width="\${W}" height="\${skyH + 45}" fill="url(#skyG)"/>

      <!-- Étoiles -->
      <g style="opacity:var(--stars-op)" fill="#fff">
        <circle class="star" cx="\${W*0.10}" cy="22" r="1.7"/><circle class="star s2" cx="\${W*0.24}" cy="38" r="1.4"/>
        <circle class="star s3" cx="\${W*0.41}" cy="18" r="1.9"/><circle class="star" cx="\${W*0.58}" cy="31" r="1.5"/>
        <circle class="star s2" cx="\${W*0.74}" cy="20" r="1.8"/><circle class="star s3" cx="\${W*0.88}" cy="40" r="1.5"/>
      </g>

      <!-- Soleil & Lune (identiques à 10-scene.css) -->
      <g style="opacity:var(--sun-op)">
        <circle cx="\${sunX}" cy="\${sunY}" r="32" fill="rgba(255,210,63,.32)"/>
        <circle cx="\${sunX}" cy="\${sunY}" r="20" fill="#ffd23f"/>
        <circle cx="\${sunX}" cy="\${sunY}" r="14" fill="#fff6b0"/>
      </g>
      <g style="opacity:var(--moon-op)">
        <circle cx="\${wide ? W*0.76 : 340}" cy="38" r="18" fill="#fffbe8"/>
        <circle cx="\${wide ? W*0.76 + 7 : 347}" cy="34" r="15" fill="var(--sky-top)"/>
      </g>

      <!-- Nuages Meuh -->
      <g fill="#fff" opacity="\${app.time==='night' ? 0.16 : 0.9}">
        <g class="cloud-a"><ellipse cx="42" cy="44" rx="28" ry="11"/><ellipse cx="62" cy="39" rx="19" ry="13"/><ellipse cx="22" cy="46" rx="16" ry="8"/></g>
        <g class="cloud-b"><ellipse cx="195" cy="27" rx="24" ry="9.5"/><ellipse cx="212" cy="24" rx="16" ry="11"/></g>
        <g class="cloud-c"><ellipse cx="325" cy="58" rx="24" ry="9"/><ellipse cx="342" cy="54" rx="16" ry="10"/></g>
      </g>

      <!-- Les 3 collines officielles de Meuh (#hills h1, h2, h3) -->
      <path d="M0 \${skyH - 8} Q\${W*0.24} \${skyH - 48} \${W*0.52} \${skyH - 14} T\${W} \${skyH - 22} L\${W} \${H} L0 \${H}Z" fill="var(--h1)"/>
      <path d="M0 \${skyH + 16} Q\${W*0.32} \${skyH - 22} \${W*0.64} \${skyH + 10} T\${W} \${skyH - 2} L\${W} \${H} L0 \${H}Z" fill="var(--h2)"/>
      <path d="M0 \${skyH + 34} Q\${W*0.48} \${skyH + 16} \${W} \${skyH + 30} L\${W} \${H} L0 \${H}Z" fill="url(#meadowG)"/>

      <!-- Anse du Port + Ruisseau qui rejoint l'Étang -->
      <path d="M\${W*0.66} \${skyH + 8} Q\${W*0.78} \${skyH + 40} \${W} \${skyH + 56} L\${W} \${skyH - 6} Q\${W*0.84} \${skyH - 4} \${W*0.66} \${skyH + 8}Z" fill="var(--water-1)" stroke="\${O}" stroke-width="2"/>
      <path d="M\${W*0.92} \${skyH + 48} Q\${W*0.97} \${H*0.54} \${W*0.90} \${H*0.74} Q\${W*0.85} \${H*0.84} \${W*0.76} \${H*0.89}"
            fill="none" stroke="var(--water-1)" stroke-width="\${wide ? 18 : 13}" stroke-linecap="round"/>
      <!-- Mare de l'étang -->
      <ellipse cx="\${wide ? W*0.89 : W*0.76}" cy="\${wide ? H*0.86 : H*0.90}" rx="\${wide ? 56 : 54}" ry="\${wide ? 26 : 24}" fill="var(--water-1)" stroke="\${O}" stroke-width="2.2"/>
      <ellipse cx="\${wide ? W*0.89 : W*0.76}" cy="\${wide ? H*0.855 : H*0.895}" rx="\${wide ? 42 : 40}" ry="\${wide ? 16 : 14}" fill="var(--water-2)" opacity=".55"/>
      <path class="water-line" d="M\${W*0.75} \${skyH + 18} Q\${W*0.84} \${skyH + 15} \${W*0.92} \${skyH + 19}" fill="none" stroke="#d9f3ff" stroke-width="2" stroke-linecap="round"/>

      <!-- Voie ferrée (style maps.js de Meuh) -->
      <path d="M0 \${skyH + 10} Q\${W*0.18} \${skyH + 22} \${W*0.39} \${skyH + 6}" fill="none" stroke="#8b6a4a" stroke-width="7" stroke-dasharray="3 5"/>
      <path d="M0 \${skyH + 8} Q\${W*0.18} \${skyH + 20} \${W*0.39} \${skyH + 4} M0 \${skyH + 12} Q\${W*0.18} \${skyH + 24} \${W*0.39} \${skyH + 8}" fill="none" stroke="#5d5248" stroke-width="1.6"/>

      <!-- Rangs de vignes du coteau (derrière la Cave) -->
      <g stroke="#5e8f2e" stroke-width="2.2" stroke-linecap="round" fill="none" opacity="\${app.season==='winter' ? 0.35 : 0.72}">
        <path d="M\${W*0.76} \${H*0.60} Q\${W*0.86} \${H*0.58} \${W*0.96} \${H*0.59}"/>
        <path d="M\${W*0.77} \${H*0.63} Q\${W*0.87} \${H*0.61} \${W*0.97} \${H*0.62}"/>
      </g>

      <!-- Chemins sablonneux / pavés ancrés dans le domaine -->
      <g fill="none" stroke-linecap="round" stroke-linejoin="round">
        <path d="M\${W*0.52} \${skyH + 8} Q\${W*0.48} \${H*0.34} \${W*0.50} \${H*0.48} Q\${W*0.50} \${H*0.63} \${W*0.47} \${H*0.77}
                 M\${W*0.19} \${H*0.46} Q\${W*0.48} \${H*0.50} \${W*0.82} \${H*0.46}
                 M\${W*0.50} \${H*0.58} Q\${W*0.34} \${H*0.66} \${W*0.28} \${H*0.73}
                 M\${W*0.50} \${H*0.60} Q\${W*0.68} \${H*0.67} \${W*0.76} \${H*0.74}"
              stroke="var(--path-edge)" stroke-width="\${wide ? 30 : 24}"/>
        <path d="M\${W*0.52} \${skyH + 8} Q\${W*0.48} \${H*0.34} \${W*0.50} \${H*0.48} Q\${W*0.50} \${H*0.63} \${W*0.47} \${H*0.77}
                 M\${W*0.19} \${H*0.46} Q\${W*0.48} \${H*0.50} \${W*0.82} \${H*0.46}
                 M\${W*0.50} \${H*0.58} Q\${W*0.34} \${H*0.66} \${W*0.28} \${H*0.73}
                 M\${W*0.50} \${H*0.60} Q\${W*0.68} \${H*0.67} \${W*0.76} \${H*0.74}"
              stroke="var(--path-c)" stroke-width="\${wide ? 22 : 17}"/>
      </g>
      \${app.pathStyle === 'cobble' ? \`
      <g stroke="rgba(58,38,24,.26)" stroke-width="2.5" stroke-dasharray="2 9" stroke-linecap="round" fill="none">
        <path d="M\${W*0.52} \${skyH + 14} Q\${W*0.48} \${H*0.34} \${W*0.50} \${H*0.48} Q\${W*0.50} \${H*0.63} \${W*0.47} \${H*0.77}"/>
        <path d="M\${W*0.21} \${H*0.46} Q\${W*0.48} \${H*0.50} \${W*0.80} \${H*0.46}"/>
      </g>\` : ''}

      <!-- Clôture bois de la cour (ancrage Meuh) -->
      <g stroke="#8b5a32" stroke-width="2.6" stroke-linecap="round">
        <path d="M\${W*0.26} \${H*0.34} H\${W*0.42} M\${W*0.58} \${H*0.34} H\${W*0.74}"/>
        <path d="M\${W*0.28} \${H*0.325} V\${H*0.355} M\${W*0.35} \${H*0.325} V\${H*0.355} M\${W*0.41} \${H*0.325} V\${H*0.355}"/>
        <path d="M\${W*0.59} \${H*0.325} V\${H*0.355} M\${W*0.66} \${H*0.325} V\${H*0.355} M\${W*0.73} \${H*0.325} V\${H*0.355}"/>
      </g>

      <!-- Bosquets & haies de lisière au trait #3a2618 -->
      <g stroke="\${O}" stroke-width="2">
        <circle cx="\${W*0.03}" cy="\${H*0.31}" r="18" fill="\${treeTop}"/>
        <circle cx="\${W*0.07}" cy="\${H*0.34}" r="13" fill="\${treeTop2}"/>
        <circle cx="\${W*0.97}" cy="\${H*0.35}" r="17" fill="\${treeTop}"/>
        <circle cx="\${W*0.93}" cy="\${H*0.38}" r="12" fill="\${treeTop2}"/>
        <circle cx="\${W*0.04}" cy="\${H*0.60}" r="16" fill="\${treeTop}"/>
        <circle cx="\${W*0.97}" cy="\${H*0.55}" r="15" fill="\${treeTop2}"/>
        <circle cx="\${W*0.04}" cy="\${H*0.95}" r="18" fill="\${treeTop}"/>
        <circle cx="\${W*0.96}" cy="\${H*0.95}" r="18" fill="\${treeTop}"/>
      </g>

      <!-- Petites fleurs sur la prairie -->
      <g opacity="\${app.season==='winter' ? 0 : 0.9}">
        <circle cx="\${W*0.37}" cy="\${H*0.31}" r="2.8" fill="#fff7c2" stroke="\${O}" stroke-width="1"/>
        <circle cx="\${W*0.40}" cy="\${H*0.325}" r="2.4" fill="#f59ab1" stroke="\${O}" stroke-width="1"/>
        <circle cx="\${W*0.63}" cy="\${H*0.315}" r="2.6" fill="#fff7c2" stroke="\${O}" stroke-width="1"/>
        <circle cx="\${W*0.14}" cy="\${H*0.54}" r="2.7" fill="#ffd23f" stroke="\${O}" stroke-width="1"/>
        <circle cx="\${W*0.52}" cy="\${H*0.86}" r="2.6" fill="#f59ab1" stroke="\${O}" stroke-width="1"/>
      </g>

      \${wildWoods}
    \`;
  }

  function renderAtmosphere() {
    const layer = document.getElementById('fxLayer');
    const items = [];
    for (let i = 0; i < 12; i++) {
      items.push(\`<span class="firefly" style="left:\${9 + ((i*23)%83)}%;top:\${25 + ((i*19)%67)}%;animation-delay:\${(i*0.42).toFixed(2)}s"></span>\`);
    }
    if (app.weather === 'rain') {
      for (let i = 0; i < 30; i++) items.push(\`<span class="weather-drop rain" style="left:\${(i*3.4)%100}%;top:\${(i*13)%90}%;animation-delay:\${(i*0.1).toFixed(2)}s"></span>\`);
    } else if (app.season === 'winter') {
      for (let i = 0; i < 24; i++) items.push(\`<span class="weather-drop snow" style="left:\${(i*4.3)%100}%;top:\${(i*17)%90}%;animation-delay:\${(i*0.28).toFixed(2)}s"></span>\`);
    } else if (app.season === 'spring') {
      for (let i = 0; i < 10; i++) items.push(\`<span class="weather-drop petal" style="left:\${(i*10.5)%96}%;top:\${(i*19)%85}%;animation-delay:\${(i*0.58).toFixed(2)}s"></span>\`);
    } else if (app.season === 'autumn') {
      for (let i = 0; i < 10; i++) items.push(\`<span class="weather-drop leaf" style="left:\${(i*10.2)%96}%;top:\${(i*17)%85}%;animation-delay:\${(i*0.52).toFixed(2)}s"></span>\`);
    }
    layer.innerHTML = items.join('');
    document.getElementById('skyPlane').style.display = app.stage === 'full' ? '' : 'none';
  }

  function renderDecos() {
    const wide = app.layout === 'wide';
    document.getElementById('decoLayer').innerHTML = app.decoSlots.map(s => {
      const [x, y] = wide ? s.posW : s.posP;
      const d = DECOS.find(k => k.id === s.deco) || DECOS[0];
      return \`
        <div class="deco-slot \${d.empty ? 'empty' : ''}" data-deco-slot="\${s.id}" style="left:\${x}%;top:\${y}%" title="\${d.name}">
          \${d.empty ? '<span class="deco-plus">+</span>' : ico(d.art)}
        </div>\`;
    }).join('');
  }

  function renderWalkers() {
    const wide = app.layout === 'wide';
    const dx = wide ? app.dog.xW : app.dog.xP, dy = wide ? app.dog.yW : app.dog.yP;
    const vx = wide ? app.visitor.xW : app.visitor.xP, vy = wide ? app.visitor.yW : app.visitor.yP;
    document.getElementById('walkersLayer').innerHTML = \`
      <div class="walker" id="walkerDog" style="left:\${dx}%;top:\${dy}%;width:\${wide ? '5.2%' : '10.5%'}" title="Filou">
        \${app.dog.hasTreasure ? \`<span class="walker-bub">\${ico('u_coin')}<span>Trésor !</span></span>\` : ''}
        \${ico('u_dog', 'bob-b')}
      </div>
      \${app.visitor.active && app.stage !== 'early' ? \`
      <div class="walker" id="walkerVis" style="left:\${vx}%;top:\${vy}%;width:\${wide ? '5%' : '10%'}" title="\${app.visitor.name}">
        <span class="walker-bub">\${ico(app.visitor.wantIco)}<span>\${app.visitor.name.split(' ')[0]}</span></span>
        \${ico('p_odette')}
      </div>\` : ''}
    \`;
  }

  function renderSpots() {
    const wide = app.layout === 'wide';
    document.getElementById('spotsLayer').innerHTML = app.zones.filter(unlocked).map(z => {
      const [x, y] = wide ? z.posW : z.posP;
      const w = wide ? z.wW : z.wP;
      const b = z.bubble;
      const bubHtml = b
        ? \`<span class="cm-bub \${b.cls}" data-bub="\${z.id}">\${ico(b.ico)}<span>\${b.label}</span></span>\`
        : '';
      return \`
        <div class="spot \${b ? 'has-bub' : ''}" id="spot-\${z.id}" data-zone="\${z.id}" style="left:\${x}%;top:\${y}%;width:\${w}%" role="button" tabindex="0" aria-label="\${z.name}">
          \${z.glow ? '<span class="cm-glow"></span>' : ''}
          \${bubHtml}
          \${z.render(z)}
          <span class="spot-name">\${z.name}</span>
        </div>\`;
    }).join('');
  }

  function pendingDirect() { return app.zones.filter(z => unlocked(z) && z.bubble); }

  function renderTourBar() {
    const bar = document.getElementById('tourBar');
    const pending = pendingDirect();
    const extra = (app.dog.hasTreasure ? 1 : 0) + (app.visitor.active && app.stage !== 'early' ? 1 : 0);
    const total = pending.length + extra;

    if (!total) {
      bar.innerHTML = \`<div class="tour-calm">\${ico('u_sun')}<span>Tout est à jour sur le domaine — profite du calme</span></div>\`;
    } else {
      const allBtn = total >= 2
        ? \`<button class="btn sm green" id="btnHarvestAll">\${ico('u_sparkle')}<span>Tout faire (\${total})</span></button>\`
        : '';
      const chips = pending.map(z =>
        \`<button class="tour-chip \${z.bubble.urgent ? 'urgent' : ''}" data-focus="\${z.id}">\${ico(z.bubble.ico)}<span>\${z.name}</span></button>\`
      );
      if (app.dog.hasTreasure) chips.unshift(\`<button class="tour-chip urgent" data-focus-dog="1">\${ico('u_dog')}<span>Filou</span></button>\`);
      if (app.visitor.active && app.stage !== 'early') chips.push(\`<button class="tour-chip" data-focus-vis="1">\${ico('p_odette')}<span>Odette</span></button>\`);
      bar.innerHTML = allBtn + chips.join('');
    }

    const counts = { farm: 0, animals: 0, machines: 0, village: 0 };
    pending.forEach(z => { if (counts[z.tab] != null) counts[z.tab]++; });
    if (app.dog.hasTreasure) counts.farm++;
    if (app.visitor.active && app.stage !== 'early') counts.village++;
    Object.entries(counts).forEach(([k, v]) => {
      const el = document.getElementById('dot-' + k);
      if (!el) return;
      el.textContent = v;
      el.style.display = v > 0 ? 'grid' : 'none';
    });
  }

  function updateHud() {
    document.getElementById('coinsVal').textContent = app.coins.toLocaleString('fr-FR');
    document.getElementById('barnVal').textContent = \`\${app.barn}/220\`;
    document.getElementById('lvlVal').textContent = app.stage === 'early' ? '3' : app.stage === 'mid' ? '25' : '60';
  }

  function bumpPill(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.remove('bump');
    void el.offsetWidth;
    el.classList.add('bump');
    setTimeout(() => el.classList.remove('bump'), 220);
  }

  let toastT = 0;
  function showToast(msg) {
    const el = document.getElementById('toast');
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(toastT);
    toastT = setTimeout(() => el.classList.remove('show'), 2300);
  }

  function burstSparks(fromEl, color = '#ffd95e') {
    if (!fromEl || app.calm) return;
    const r = fromEl.getBoundingClientRect();
    const cx = r.left + r.width / 2, cy = r.top + r.height * 0.4;
    for (let i = 0; i < 8; i++) {
      const sp = document.createElement('span');
      sp.className = 'burst-spark';
      sp.style.left = cx + 'px'; sp.style.top = cy + 'px'; sp.style.background = color;
      document.body.appendChild(sp);
      const ang = (Math.PI * 2 * i) / 8 + Math.random() * 0.3;
      const dist = 24 + Math.random() * 24;
      requestAnimationFrame(() => { sp.style.transform = \`translate(\${Math.cos(ang)*dist}px, \${Math.sin(ang)*dist}px) scale(0.2)\`; sp.style.opacity = '0'; });
      setTimeout(() => sp.remove(), 520);
    }
  }

  function flyBezier(fromEl, toEl, artKeys) {
    if (!fromEl || !toEl || app.calm) return;
    const a = fromEl.getBoundingClientRect(), b = toEl.getBoundingClientRect();
    const sx = a.left + a.width / 2, sy = a.top + a.height * 0.35;
    const tx = b.left + b.width / 2, ty = b.top + b.height / 2;

    artKeys.forEach((k, idx) => {
      const node = document.createElement('span');
      node.className = 'fly-item';
      node.innerHTML = ART[k] || '';
      node.style.left = sx + 'px'; node.style.top = sy + 'px';
      document.body.appendChild(node);

      const ctrlX = (sx + tx) / 2 + (idx - (artKeys.length - 1) / 2) * 55;
      const ctrlY = Math.min(sy, ty) - 70 - idx * 14;
      const start = performance.now() + idx * 65, dur = 620;
      function step(now) {
        const p = (now - start) / dur;
        if (p < 0) return requestAnimationFrame(step);
        if (p >= 1) return node.remove();
        const t = 1 - Math.pow(1 - p, 2.2);
        const x = (1 - t) * (1 - t) * sx + 2 * (1 - t) * t * ctrlX + t * t * tx;
        const y = (1 - t) * (1 - t) * sy + 2 * (1 - t) * t * ctrlY + t * t * ty;
        const sc = p < 0.25 ? 0.7 + p * 2.1 : 1.22 - p * 0.65;
        node.style.left = x + 'px'; node.style.top = y + 'px';
        node.style.transform = \`translate(-50%,-50%) scale(\${sc.toFixed(2)})\`;
        node.style.opacity = p > 0.8 ? String(1 - (p - 0.8) * 4.2) : '1';
        requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
  }

  function floatMsg(fromEl, text, artKey) {
    if (!fromEl) return;
    const r = fromEl.getBoundingClientRect();
    const el = document.createElement('div');
    el.className = 'float-txt';
    el.innerHTML = (artKey ? ico(artKey) : '') + \`<span>\${text}</span>\`;
    el.style.left = (r.left + r.width / 2) + 'px';
    el.style.top = (r.top + 8) + 'px';
    document.body.appendChild(el);
    requestAnimationFrame(() => { el.style.transform = 'translate(-50%, -40px)'; el.style.opacity = '0'; });
    setTimeout(() => el.remove(), 920);
  }

  function openPerfumePopover() {
    const pop = document.getElementById('quickPop');
    const spot = document.getElementById('spot-perfume');
    if (!spot) return;
    pop.style.left = \`clamp(124px, \${spot.style.left}, calc(100% - 124px))\`;
    pop.style.top = \`calc(\${spot.style.top} - 34px)\`;
    pop.innerHTML = \`
      <div class="qp-head">
        \${ico('u_perfume')}<span>Soin · Ambre d’Été</span>
        <button class="qp-close" id="qpClose" aria-label="Fermer">×</button>
      </div>
      <div class="qp-btns">
        <button class="qp-opt" data-pf="quick">\${ico('u_drop')}<strong>Geste rapide</strong><span>Gratuit · +6 %</span></button>
        <button class="qp-opt deep" data-pf="deep">\${ico('i_lavender')}<strong>Approfondi</strong><span>1 essence · +18 %</span></button>
      </div>\`;
    pop.classList.add('open');
    playSfx('open');
  }
  function closePopover() { document.getElementById('quickPop').classList.remove('open'); }

  function doZoneAction(id, silentToast = false, opts = {}) {
    const z = app.zones.find(x => x.id === id);
    if (!z || !z.bubble) return;
    if (z.bubble.popover === 'perfume' && !opts.perfumeChoice && !opts.auto) return openPerfumePopover();

    const b = z.bubble;
    const spotEl = document.getElementById('spot-' + id);

    if (id === 'fields' && b.isPlant) {
      z.fieldPhase = 'growing';
      z.bubble = null;
      playSfx('plant');
      burstSparks(spotEl, '#8fd65f');
      floatMsg(spotEl, 'Semé !', 'u_seedPack');
      if (!silentToast) showToast('6 parcelles ressemées sur place — elles repoussent !');
      renderSpots(); renderTourBar();
      setTimeout(() => {
        if (z.fieldPhase === 'growing') {
          z.fieldPhase = 'ready';
          z.bubble = { ico: 'i_wheat', label: '6', cls: 'ready', gainCoins: 0, gainBarn: 6, fly: ['i_wheat','i_strawberry','i_sunflower'], sfx: 'harvest', msg: '6 parcelles récoltées !' };
          renderSpots(); renderTourBar();
        }
      }, 6500);
      return;
    }

    if (id === 'perfume') {
      const deep = opts.perfumeChoice !== 'quick';
      z.bubble = null;
      app.barn += 1;
      bumpCombo();
      playSfx('perfume');
      burstSparks(spotEl, '#e5a4f7');
      flyBezier(spotEl, document.getElementById('pillBarn'), ['u_perfume','i_lavender','u_sparkle']);
      floatMsg(spotEl, deep ? 'Grand Sillage +18 %' : '+6 %', 'u_perfume');
      if (!silentToast) showToast(deep ? 'Soin approfondi appliqué : Grand Sillage (+18 %) !' : 'Geste rapide appliqué (+6 %)');
      updateHud(); renderSpots(); renderTourBar();
      return;
    }

    if (id === 'station') {
      z.bubble = null;
      z.trainState = 'departing';
      app.coins += b.gainCoins;
      bumpCombo();
      playSfx('train');
      burstSparks(spotEl, '#f2c14e');
      flyBezier(spotEl, document.getElementById('pillCoins'), b.fly);
      floatMsg(spotEl, \`+\${b.gainCoins}\`, 'u_coin');
      if (!silentToast) showToast(b.msg);
      updateHud(); renderSpots(); renderTourBar();
      setTimeout(() => bumpPill('pillCoins'), 420);
      setTimeout(() => { z.trainState = 'gone'; renderSpots(); }, 1350);
      setTimeout(() => {
        if (!app.live) return;
        z.trainState = 'arriving';
        z.bubble = { ico: 'u_train', label: '3', cls: 'gold', urgent: true, gainCoins: 420, gainBarn: 0, fly: ['i_bread','u_coin','u_coin'], sfx: 'train', msg: 'Train expédié ! +420 pièces' };
        renderSpots(); renderTourBar();
        setTimeout(() => { z.trainState = 'here'; renderSpots(); }, 1400);
      }, 9000);
      return;
    }

    z.bubble = null;
    if (id === 'fields') {
      z.fieldPhase = 'bare';
      setTimeout(() => {
        if (z.fieldPhase === 'bare') {
          z.bubble = { ico: 'u_seedPack', label: 'Semer', cls: 'plant', isPlant: true };
          renderSpots(); renderTourBar();
        }
      }, 550);
    }

    app.coins += b.gainCoins || 0;
    app.barn += b.gainBarn || 0;
    bumpCombo();
    playSfx(b.sfx || 'harvest');
    burstSparks(spotEl, b.gainCoins ? '#f2c14e' : '#8fd65f');

    const targetEl = b.gainCoins > 0 ? document.getElementById('pillCoins') : document.getElementById('pillBarn');
    flyBezier(spotEl, targetEl, b.fly || [b.ico]);
    floatMsg(spotEl, b.gainCoins ? \`+\${b.gainCoins}\` : \`+\${b.gainBarn}\`, b.gainCoins ? 'u_coin' : b.ico);
    if (!silentToast) showToast(b.msg);

    updateHud(); renderSpots(); renderTourBar();
    const freshSpot = document.getElementById('spot-' + id);
    if (freshSpot) { freshSpot.classList.add('hit'); setTimeout(() => freshSpot.classList.remove('hit'), 450); }
    setTimeout(() => bumpPill(b.gainCoins > 0 ? 'pillCoins' : 'pillBarn'), 450);
  }

  function doDogAction(silent = false) {
    const el = document.getElementById('walkerDog');
    if (app.dog.hasTreasure) {
      app.dog.hasTreasure = false; app.coins += 150; bumpCombo(); playSfx('dog');
      burstSparks(el, '#f59ab1');
      flyBezier(el, document.getElementById('pillCoins'), ['u_coin','u_heart']);
      floatMsg(el, '+150', 'u_coin');
      if (!silent) showToast('Filou a trouvé un trésor ! +150 pièces');
      updateHud(); renderWalkers(); renderTourBar();
      setTimeout(() => bumpPill('pillCoins'), 420);
    } else {
      playSfx('dog'); burstSparks(el, '#f59ab1'); floatMsg(el, 'Wouf !', 'u_heart');
    }
  }

  function doVisitorAction(silent = false) {
    if (!app.visitor.active) return;
    const el = document.getElementById('walkerVis');
    app.visitor.active = false; app.coins += app.visitor.gain; bumpCombo(); playSfx('coin');
    burstSparks(el, '#f2c14e');
    flyBezier(el, document.getElementById('pillCoins'), ['i_cake','u_heart','u_coin']);
    floatMsg(el, \`+\${app.visitor.gain}\`, 'u_coin');
    if (!silent) showToast(\`\${app.visitor.name} te remercie ! +\${app.visitor.gain} pièces\`);
    updateHud(); renderWalkers(); renderTourBar();
    setTimeout(() => bumpPill('pillCoins'), 420);
  }

  function openZoneSheet(id) {
    const z = app.zones.find(x => x.id === id);
    if (!z) return;
    closePopover(); playSfx('open');
    const box = document.getElementById('sheetBox');
    box.innerHTML = \`
      <div class="sheet-handle"></div>
      <div class="sheet-head">
        <div class="sheet-ico">\${ART[z.ico] || ''}</div>
        <div>
          <h3 class="sheet-title">\${z.name}</h3>
          <div class="sheet-path">\${z.path}</div>
        </div>
      </div>
      <div class="sheet-tags">\${(z.meta || []).map(m => \`<span class="sheet-tag">\${m}</span>\`).join('')}</div>
      <div class="sheet-desc">\${z.desc}</div>
      <div class="sheet-actions">
        \${z.bubble ? \`<button class="btn green" id="shAct">\${ico(z.bubble.ico)}<span>\${z.bubble.label === '3' ? 'Expédier' : z.bubble.label} maintenant</span></button>\` : ''}
        <button class="btn" id="shOpen">Ouvrir « \${z.path.split('›').pop().trim()} »</button>
      </div>\`;
    document.getElementById('sheetBg').classList.add('open');
    const actBtn = document.getElementById('shAct');
    if (actBtn) actBtn.onclick = () => { closeSheet(); doZoneAction(id); };
    document.getElementById('shOpen').onclick = () => { closeSheet(); showToast(\`Ouvre « \${z.path} » dans Meuh\`); };
  }

  function openDecoSheet(slotId) {
    const slot = app.decoSlots.find(s => s.id === slotId);
    if (!slot) return;
    playSfx('open');
    const box = document.getElementById('sheetBox');
    box.innerHTML = \`
      <div class="sheet-handle"></div>
      <div class="sheet-head">
        <div class="sheet-ico">\${ART.u_flowers}</div>
        <div>
          <h3 class="sheet-title">Décorer cet emplacement</h3>
          <div class="sheet-path">Trophées & décos gagnés dans Meuh</div>
        </div>
      </div>
      <div class="deco-grid">
        \${DECOS.map(d => \`
          <button class="deco-choice \${slot.deco === d.id ? 'on' : ''}" data-pick-deco="\${d.id}">
            \${ico(d.art)}<span>\${d.name}</span>
          </button>\`).join('')}
      </div>
      <div class="sheet-actions"><button class="btn" id="shClose">Fermer</button></div>\`;
    document.getElementById('sheetBg').classList.add('open');
    box.querySelectorAll('[data-pick-deco]').forEach(btn => {
      btn.onclick = () => {
        slot.deco = btn.dataset.pickDeco;
        playSfx('plant'); renderDecos(); closeSheet();
        const picked = DECOS.find(x => x.id === slot.deco);
        showToast(picked.empty ? 'Emplacement libéré' : \`\${picked.name} posé(e) sur le domaine !\`);
      };
    });
    document.getElementById('shClose').onclick = closeSheet;
  }

  function closeSheet() { document.getElementById('sheetBg').classList.remove('open'); }

  function renderAll() {
    const dev = document.getElementById('device');
    dev.dataset.time = app.time;
    dev.dataset.season = app.season;
    dev.dataset.path = app.pathStyle;
    dev.classList.toggle('wide', app.layout === 'wide');
    dev.classList.toggle('postcard', app.postcard);
    dev.classList.toggle('calm', app.calm);
    dev.classList.toggle('focus-mode', app.focus);
    dev.classList.toggle('decorating', app.decorating);
    document.getElementById('btnFocus').classList.toggle('on', app.focus);
    document.getElementById('btnDeco').classList.toggle('on', app.decorating);
    updateHud(); renderBackground(); renderDecos(); renderSpots(); renderWalkers(); renderTourBar(); renderAtmosphere();
  }

  const DOG_P = [[56, 48], [41, 49], [60, 58], [46, 62], [35, 48]];
  const DOG_W = [[54, 51], [42, 52], [58, 60], [45, 64], [38, 49]];
  let dogStep = 0;
  setInterval(() => {
    if (app.calm) return;
    dogStep = (dogStep + 1) % DOG_P.length;
    app.dog.xP = DOG_P[dogStep][0]; app.dog.yP = DOG_P[dogStep][1];
    app.dog.xW = DOG_W[dogStep][0]; app.dog.yW = DOG_W[dogStep][1];
    const el = document.getElementById('walkerDog');
    if (el) { el.style.left = (app.layout === 'wide' ? app.dog.xW : app.dog.xP) + '%'; el.style.top = (app.layout === 'wide' ? app.dog.yW : app.dog.yP) + '%'; }
  }, 4600);

  setInterval(() => {
    if (!app.live) return;
    const calmZones = app.zones.filter(z => unlocked(z) && !z.bubble && z.id !== 'barn' && z.id !== 'station' && z.id !== 'fields');
    if (!calmZones.length) return;
    const pick = calmZones[Math.floor(Math.random() * calmZones.length)];
    const fresh = makeZones().find(x => x.id === pick.id);
    if (fresh && fresh.bubble) { pick.bubble = { ...fresh.bubble }; renderSpots(); renderTourBar(); }
  }, 11000);

  // ---------------- ÉVÉNEMENTS ----------------
  document.querySelectorAll('.seg-ctrl[data-ctrl]').forEach(grp => {
    const key = grp.dataset.ctrl;
    grp.addEventListener('click', e => {
      const btn = e.target.closest('button');
      if (!btn) return;
      app[key] = btn.dataset.val;
      grp.querySelectorAll('button').forEach(b => b.classList.toggle('on', b === btn));
      closePopover(); renderAll();
    });
  });

  document.getElementById('btnLive').addEventListener('click', e => { app.live = !app.live; e.currentTarget.classList.toggle('on', app.live); });
  document.getElementById('btnCalm').addEventListener('click', e => { app.calm = !app.calm; e.currentTarget.classList.toggle('on', app.calm); renderAll(); });
  document.getElementById('btnSound').addEventListener('click', e => { soundOn = !soundOn; e.currentTarget.classList.toggle('on', soundOn); });
  document.getElementById('btnReset').addEventListener('click', () => {
    app.zones = makeZones(); app.dog.hasTreasure = true; app.visitor.active = true;
    closePopover(); renderAll(); showToast('Toutes les bulles sont de retour !');
  });

  document.getElementById('btnFocus').addEventListener('click', () => {
    app.focus = !app.focus; renderAll();
    showToast(app.focus ? 'Mode Focus : seuls les bâtiments actifs ressortent' : 'Affichage complet');
  });
  document.getElementById('btnDeco').addEventListener('click', () => {
    app.decorating = !app.decorating; closePopover(); renderAll();
    if (app.decorating) showToast('Touche un « + » ou une déco sur le domaine !');
  });
  document.getElementById('decoBar').addEventListener('click', e => {
    const seg = e.target.closest('.seg'), btn = e.target.closest('button');
    if (!seg || !btn) return;
    if (seg.dataset.style === 'roof') app.roof = btn.dataset.val;
    if (seg.dataset.style === 'path') app.pathStyle = btn.dataset.val;
    seg.querySelectorAll('button').forEach(b => b.classList.toggle('on', b === btn));
    playSfx('plant'); renderAll();
  });
  document.getElementById('btnPostcard').addEventListener('click', () => { app.postcard = true; closePopover(); renderAll(); });
  document.getElementById('btnExitPostcard').addEventListener('click', () => { app.postcard = false; renderAll(); });

  document.getElementById('decoLayer').addEventListener('click', e => {
    const sl = e.target.closest('[data-deco-slot]');
    if (!sl) return;
    if (!app.decorating) return showToast('Touche le bouton fleurs en haut pour personnaliser tes décos');
    openDecoSheet(Number(sl.dataset.decoSlot));
  });

  document.getElementById('spotsLayer').addEventListener('click', e => {
    const bub = e.target.closest('[data-bub]');
    if (bub) { e.stopPropagation(); return doZoneAction(bub.dataset.bub); }
    const sp = e.target.closest('[data-zone]');
    if (sp) openZoneSheet(sp.dataset.zone);
  });

  document.getElementById('walkersLayer').addEventListener('click', e => {
    if (e.target.closest('#walkerDog')) return doDogAction();
    if (e.target.closest('#walkerVis')) return doVisitorAction();
  });

  document.getElementById('quickPop').addEventListener('click', e => {
    if (e.target.closest('#qpClose')) return closePopover();
    const opt = e.target.closest('[data-pf]');
    if (!opt) return;
    closePopover();
    doZoneAction('perfume', false, { perfumeChoice: opt.dataset.pf });
  });

  document.getElementById('tourBar').addEventListener('click', e => {
    if (e.target.closest('#btnHarvestAll')) {
      closePopover();
      const ids = pendingDirect().map(z => z.id);
      let step = 0;
      if (app.dog.hasTreasure) setTimeout(() => doDogAction(true), step++ * 165);
      ids.forEach(id => setTimeout(() => doZoneAction(id, true, { auto: true, perfumeChoice: 'deep' }), step++ * 165));
      if (app.visitor.active && app.stage !== 'early') setTimeout(() => doVisitorAction(true), step++ * 165);
      setTimeout(() => showToast(\`Tournée express terminée (\${step} actions) !\`), step * 165 + 140);
      return;
    }
    if (e.target.closest('[data-focus-dog]')) return document.getElementById('walkerDog')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    if (e.target.closest('[data-focus-vis]')) return document.getElementById('walkerVis')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    const chip = e.target.closest('[data-focus]');
    if (!chip) return;
    const spot = document.getElementById('spot-' + chip.dataset.focus);
    if (spot) {
      spot.scrollIntoView({ behavior: 'smooth', block: 'center' });
      spot.classList.remove('spotlight'); void spot.offsetWidth; spot.classList.add('spotlight');
      setTimeout(() => spot.classList.remove('spotlight'), 1900);
    }
  });

  document.getElementById('sheetBg').addEventListener('click', e => { if (e.target.id === 'sheetBg') closeSheet(); });
  document.getElementById('tabs').addEventListener('click', e => {
    const t = e.target.closest('.tab');
    if (!t || t.dataset.tab === 'domaine') return;
    showToast(\`Onglet classique « \${t.querySelector('.tab-name').textContent} » toujours accessible en 1 tap\`);
  });

  renderAll();
})();
</script>
</body>
</html>`;

const outPath = path.join(__dirname, 'index.html');
fs.writeFileSync(outPath, html, 'utf8');
console.log('Generated', outPath, '—', Object.keys(ART).length, 'real Meuh SVG sprites,', html.length, 'bytes');
