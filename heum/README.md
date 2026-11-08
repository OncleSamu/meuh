# Heum — V1

Le troisième monde de la ferme : un îlot cultivable dans les terres mortes. Le joueur pilote la **Contamination** pour faire muter ses cultures sans perdre ses récoltes.

Heum vit à part dans ce dossier : il ne touche pas au code de Meuh, et Meuh n'a aucun lien vers lui pour l'instant.

- Jouer : https://onclesamu.github.io/meuh/heum/ (adresse non liée depuis Meuh)
- Sauvegarde : clé `heumSave` du téléphone, séparée de celle de Meuh

## Le dossier

- `src/core` : bus d'événements, horloge, hasard, état et sauvegarde
- `src/data` : cultures et mutants, paliers, bêtes, ferraille, machines, bunker, régions, niveaux
- `src/systems` : les règles (Contamination, Parcelles, Ménagerie, Recyclage, Bunker, Caravanes, le cœur qui bat)
- `src/art` : les dessins SVG
- `src/ui` : la coque et les cinq onglets
- `src/styles` : les feuilles de style
- `tools/build.mjs` : assemble `dist/index.html` (essai) ou `index.html` (`--publish`)
- `tools/test` : les tests (`node --test heum/tools/test/*.test.mjs`)

## Ce que contient la V1 (niveaux 1 à 8)

- Jauge de Contamination à quatre paliers (Saine, Mutagène, Instable, Critique), qui redescend seule ; engrais toxique (niveau 6) pour la monter, Épurateur (niveau 3) et chèvres pour la baisser.
- Parcelles 3 × 3 : rutabaga, lentilles, sorgho, courge, panais. Mutants : rutabaga lumineux, courge carapace. Rebelles en palier Instable (ils ne se propagent que pendant qu'on joue). Palier Critique : déchet radioactif.
- Ménagerie : poule sentinelle, chèvre qui nettoie, Charge toxique (produit ordinaire, mutagène, puis arrêt).
- Recyclage : épave à fouiller, Trieur, Épurateur, Fourneau-Réacteur (conserves, engrais toxique).
- Bunker : un étage en coupe, trois habitants (Armand, Lison, Basile), vivres et air pur ; nourris, ils donnent trois bonus.
- Caravanes : un convoi par heure (prix +60 % sur ce qu'il réclame), la radio annonce les trois suivants, marchands ambulants, Troqueurs (niveau 5).
- Hors ligne : tout est neutre, rien ne se propage ni ne se perd.
