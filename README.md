# Meuh

Un jeu de ferme pour téléphone, qui s'installe comme une application (PWA) et se joue sans connexion.
Tout se passe sur l'appareil : pas de serveur, pas de compte.

Jouer : https://onclesamu.github.io/meuh/

## Le code

| Dossier | Contenu |
|---|---|
| `src/data` | Le contenu du jeu par domaine : cultures, animaux, machines et recettes, village, cave, fêtes, textes |
| `src/core` | L'état de la partie et sa sauvegarde, l'horloge, le bus d'événements, les formats |
| `src/systems` | Toutes les règles du jeu, sans affichage (testables dans node) |
| `src/art` | Les dessins vectoriels, par famille |
| `src/ui` | L'interface : navigation, vues (un fichier par écran), fenêtres du bas, moments, effets, sons, tutoriel |
| `src/styles` | Les styles, par couche (base, scène, mise en page, composants, puis un fichier par écran) |
| `src/pwa` | Manifeste, icônes et service worker |
| `tools` | Construction, tests, robot d'équilibrage, outils de développement |

À la racine : le site construit (`index.html`, `sw.js`, manifeste, icônes), servi par GitHub Pages.

## Commandes

```
npm run build            # construit dans dist/ (un seul fichier HTML + PWA)
node tools/build.mjs --publish   # construit et copie le site à la racine
node tools/build.mjs --dev       # sans minification, pour déboguer
npm test                 # règles du jeu, reprise d'une sauvegarde 6.2, codes d'export
npm run lint             # ESLint (les systèmes n'ont pas accès au navigateur)
npm run bot -- 60        # un robot joue 60 h simulées et affiche le rythme des niveaux
```

## Principes

- Les règles (`systems`) ne touchent jamais à l'écran : elles annoncent leurs effets sur le bus (`toast`, `sfx`, `burst`, `float`…), que l'interface met en scène.
- L'interface est déclarative : chaque bouton porte `data-act` et ses données ; `refresh()` redessine seulement ce qui a changé.
- Nouvelle donnée dans l'état : l'ajouter dans `newState()` (`src/core/state.js`) ; le chargement complète les anciennes sauvegardes.
- Textes : espaces insécables de la typographie française dans les chaînes.
