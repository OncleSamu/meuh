# Prototype isolé — Vue du Domaine (100 % vibe Meuh)

Version authentique de ce qui serait ajouté à Meuh, toujours 100 % isolée dans `proto-domaine/` (aucun fichier de `src/`, `index.html`, `VERSION` ou `tools/` n'est modifié).

- **Assets réels** : `build.mjs` embarque directement 92 vrais sprites SVG de `src/art/` (maisons évolutives + 3 toits, bâtiments du village/domaine, machines, train, animaux, cultures à plusieurs stades, Mamie Odette, Filou, décos/trophées et toutes les icônes HUD/onglets — zéro emoji dans le jeu).
- **DA officielle Meuh** : police Nunito, HUD flottant sur le ciel (`.lvl-star`, `.xp-bar`, `.pill`), barre d'onglets en bois verni `#a8693a` avec onglet actif doré relevé, boutons BD `#3a2618` et palettes saisonnières exactes de `src/styles/70-village.css`.
- **Régénérer** : `node proto-domaine/build.mjs`
- **Supprimer proprement** : `git rm -r proto-domaine`
