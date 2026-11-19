# Architecture de Meuh

Guide rapide pour s’orienter dans le code source de Meuh, ajouter du contenu ou équilibrer les niveaux sans se perdre.

## Vue d’ensemble des dossiers

```
src/
├── core/        # État global (state.js), horloge (clock.js), bus d’événements (bus.js), vue active
├── data/        # Données statiques du jeu (produits, machines, animaux, contrées, niveaux)
│   ├── levels.js         ← SOURCE DE VÉRITÉ UNIQUE des niveaux de déblocage (1 à 80)
│   ├── legacy-levels.js  ← Archive des anciens seuils (uniquement pour la migration d’anciennes sauvegardes)
│   ├── lv80.js           ← Convertisseur mathématique d’échelle 64 ↔ 80 (utilisé par ecoLvl / scaleLvl)
│   ├── items.js          ← Registre ITEMS (1 136 produits : cultures, arbres, élevage, artisanat, matériaux)
│   ├── machines.js       ← Registres MACHINES (48 ateliers) et RECIPES (882 recettes)
│   ├── animals.js        ← Registre ANIMALS (29 espèces) et constantes d’élevage
│   ├── farm.js           ← Parcelles, sols, qualité, DECOS, UPGRADES
│   ├── ajouts/           ← Extensions thématiques (cultures, arbres, île, poissons, cave, château, pizzeria, oasis, Nord…)
│   └── *.js              ← Modules dédiés : abbey.js, cave.js, genetics.js, haras.js, honey.js, island.js, oasis.js, nord.js, paquets.js, village.js…
├── art/         # Tous les dessins SVG procéduraux (zéro image externe)
│   ├── kit.js            ← Primitives SVG (P, E, C, L, R, SHADOW, HL) et registres items/animals/machines/ui/people
│   ├── index.js          ← Point d’entrée SPR (importe socle → refontes → extensions → retouches)
│   └── retouches/        ← Surcharges visuelles chargées en dernier
├── systems/     # Logique métier et simulation (farm, workshop, orders, genetics, brewery, cave, haras, player…)
├── ui/          # Rendu DOM sans framework (views/, sheets/, genlook.js, brew.js, icons.js)
└── styles/      # Feuilles CSS numérotées (assemblées dans l’ordre par tools/css.mjs)

tools/
├── build.mjs            # Assemble dist/index.html (ou --publish à la racine) et sw.js
├── codex.mjs            # Génère dist/codex.html (ou --publish vers tools/codex.html : encyclopédie autonome)
├── dev/check-all.mjs    # Garde-fou complet (levels.js, sync inline, recettes, saveurs, sprites SVG)
├── dev/check-econ.mjs   # Audit de rentabilité économique (pièces/min, marges, XP/min, goulots, anomalies)
├── dev/check-levels.mjs # Vérifie les invariants de src/data/levels.js et affiche la feuille de route 1..80
├── dev/audit.mjs        # Simule 72 h sur une ferme niv. 80 pour détecter NaN/infinis/négatifs
└── test/                # 100+ suites de tests Node (npm test)

.github/workflows/
└── ci.yml               # Intégration continue : check, econ --strict, lint, test, build et codex
```

## Comment fonctionnent les niveaux (1 à 80)

Auparavant, les niveaux étaient réécrits au chargement par cinq passes successives (`levels14` → `levels18` → `levels60` → `levels64` → `applyLevels80`). Désormais :

1. **Un seul fichier fait foi : [`src/data/levels.js`](src/data/levels.js)** (exporte `LEVELS` et `applyLevels`).
   - `items.js`, `animals.js`, `farm.js` et `machines.js` ont tous leurs niveaux inline alignés sur `levels.js` et appellent chacun `applyLevels(...)` à la fin de leur propre module : l’ordre d’import n’a plus aucun effet de bord caché.
2. **Les anciens seuils de migration sont isolés dans [`src/data/legacy-levels.js`](src/data/legacy-levels.js)** (`lvOld`, `lv17`, `lv135`, `lv155`, `lv108`).
   - Ils servent uniquement à `migrateLevels*()` (`src/systems/player.js`, `src/systems/game.js`) pour qu’une ancienne sauvegarde garde ce qu’elle avait ouvert (`state.lvKeep`).
3. **Pour modifier un niveau**, il suffit d’éditer `src/data/levels.js` puis de lancer :
   ```bash
   npm run check
   ```

## Plan de production (`src/systems/plan.js` + `src/ui/sheets/plan.js`)

- **Commandes en 1 clic** : bouton *Planifier* sur le train, la montgolfière, le bateau de livraison, les chantiers du village et les commandes de villageois (déduit le stock existant et signale les produits bruts manquants).
- **Bières maison & hydromels** : planification de plusieurs brassins en chaîne (malterie + ingrédients d’atelier + enchaînement automatique des cuves de l’abbaye).
- **Multi-plats / multi-bières** : débloqué progressivement au Domaine via le **Tableau d’intendance** (`PLAN_UPGRADE` dans `src/data/domaine.js` : 2, 3, 5 puis 8 produits simultanés dans un même plan à chaîne commune).

## Où ajouter un nouveau contenu ?

| Ce que tu ajoutes | Fichiers à toucher |
|---|---|
| Une culture ou un arbre | `src/data/items.js` (ou `src/data/ajouts/`), son niveau dans `src/data/levels.js`, ses notes dans `FLAVORS` (`src/data/genetics.js`), son dessin dans `src/art/` |
| Une recette d’atelier | `src/data/items.js` (produit) + `src/data/machines.js` (recette) + son niveau dans `src/data/levels.js` + son dessin dans `src/art/` |
| Une machine / un atelier | `src/data/machines.js` + son niveau dans `src/data/levels.js` + son dessin dans `src/art/machines.js` (ou dossier dédié) |
| Un sprite / une retouche | Ajouter ou surcharger la fonction dans `src/art/` et vérifier l’ordre d’import dans `src/art/index.js` |

## Checklist de mise à jour (documentation en jeu)

À chaque ajout ou modification visible par le joueur, vérifier systématiquement :

1. **Version & Notes de mise à jour** : incrémenter `VERSION` et ajouter l’entrée correspondante en tête de [`src/data/changelog.js`](src/data/changelog.js) (vérifié automatiquement par `npm run check`).
2. **Barre des niveaux** : mettre à jour `unlocksAt()` dans [`src/systems/player.js`](src/systems/player.js) si une nouveauté se débloque à un niveau donné.
3. **Guide du fermier** : mettre à jour les pages concernées dans [`src/data/guide.js`](src/data/guide.js).
4. **Livre de la ferme & Statistiques** : vérifier le classement des nouveaux produits dans [`src/systems/book.js`](src/systems/book.js) et ajouter les compteurs utiles dans `farmStats()`.
5. **Carnets & Astuces** : ajouter les anecdotes de Mamie ([`src/data/carnet.js`](src/data/carnet.js)) pour toute nouvelle recette, les saveurs ([`src/data/genetics.js`](src/data/genetics.js)) pour toute nouvelle plante, et les astuces ([`src/data/texts.js`](src/data/texts.js)) si besoin.
6. **Publication** : lancer `npm run check && npm run econ -- --strict && npm run lint && npm test`, puis `node tools/build.mjs --publish` et `node tools/codex.mjs --publish`.

## Commandes utiles

```bash
npm run check                             # Garde-fou global en 1 s (niveaux, sync inline, recettes, saveurs, sprites)
npm run econ                              # Audit de rentabilité économique (--json, --top N, --machine id, --strict)
npm run lint                              # Vérification ESLint (src et tools)
npm test                                  # Lancer toute la suite de tests (700+ tests)
npm run build                             # Générer dist/Meuh <version>.html (--publish pour la racine GitHub Pages)
npm run codex                             # Générer dist/codex.html (--publish pour tools/codex.html)
node tools/dev/check-levels.mjs --roadmap # Voir tout ce qui se débloque du niveau 1 au 80
node tools/dev/check-levels.mjs --level 40
node tools/dev/audit.mjs                  # Audit de simulation sur 72 h
```

