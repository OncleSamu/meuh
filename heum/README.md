# Heum — V2

Le troisième monde de la ferme : un îlot cultivable dans les terres mortes. Le joueur pilote la **Contamination** pour faire muter ses cultures sans perdre ses récoltes.

**Décision (8 novembre 2026)** : Heum est un jeu complet et indépendant, pour le joueur qui a fini Meuh et veut recommencer une toute nouvelle partie. Aucun lien de jeu entre les deux (pas de bonus partagé, pas d'objet qui passe d'un monde à l'autre). Le seul lien, à terme : un portail dans Meuh, visible en fin de partie, qui ouvre Heum (et un portail retour). Chaque monde garde sa sauvegarde. Heum doit donc tenir seul : sa propre progression jusqu'au niveau 64, une histoire, une fin.

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

## Ce qu'ajoute la V2 (niveaux 4 à 13)

- Événement du jour (niveau 4) : un événement de Contamination annoncé, trois choix, une fois par jour ; sans réponse, il ne se passe rien.
- Établi (niveau 9) : voile (−20 sur une parcelle) puis concentrateur (+25, niveau 12). Chaque parcelle a donc son propre palier ; l'équipement se pose et se retire depuis le volet de semis.
- Deuxième étage du Bunker (niveau 10 : 600 pièces, 15 métal, 6 composite) : Victor (labo), Firmin (atelier : machines 15 % plus rapides), Odette (salle des cartes). Les habitants mangent deux fois plus.
- Labo de Victor : 5 mutants et 2 électroniques, 5 minutes → graine stable. Elle pousse toujours mutant et ne tourne jamais Rebelle.
- Expéditions d'Odette : les fossés (15 min), la vieille usine (1 h), la ville morte (4 h). Elles continuent hors ligne et rapportent matériel, pièces et parfois un spécimen mutant.
- Contrôle sanitaire (niveau 10) : la Cité-filtre paie moitié prix les produits chauds ; les Antennes et la Rouille les paient 30 % de plus.
- Niveau 11 : chou-kale (mutant : chou-éponge, chaque récolte baisse la jauge de 8), cochon (change un déchet radioactif en engrais toxique), étable filtrée (purge la Charge d'une bête pour 1 électronique).
- Convoi blindé (niveau 12) : un gros contrat au compte exact en six heures, payé 2,5 fois ; manqué, un autre le remplace sans pénalité.
- Niveau 13 : mûres (mutant : mûre ardente) et conserves explosives.

## Ce qu'ajoute la 0.3 (fondations et cœur)

**Direction décidée** : Heum est un jeu à part, sans lien avec le code de Meuh ; seul un portail (en fin de partie dans Meuh, et retour) les reliera. But : « l'Arche », collectionner des graines mutantes fixées ; titre « Gardien de l'Arche » au niveau 64. Compter 40 à 60 h de jeu actif. Habitants allégés (3 stats, pas de naissances).

- **Sauvegarde solide** : version de format et migrations, copie de secours (`heumSave.bak`), refus d'écraser une sauvegarde illisible, export / import en fichier depuis le menu.
- **Appli installable** : manifeste, icônes, service worker hors ligne (préfixe `heum-`).
- **Hors ligne** : la jauge de contamination est figée quand on n'est pas là (pas de baisse, pas de Rebelles). Le temps de fond (onglet caché) est rattrapé au retour.
- **Charge des produits** : chaque récolte garde la charge de la jauge de sa parcelle ; les animaux et les produits transformés la transmettent ; les contrôles sanitaires des régions la lisent.
- **Équilibrage** : baisse de la jauge 1 point / 4 min, déchet 8 pièces, coût de l'arrachage, Rebelles 25 %, échelle de valeur des cultures.
- **Outil** : `node heum/tools/bot.mjs [heures] [passage] [mut|crit]`, robot joueur pour mesurer le rythme (12 h en jeu continu : niveau 27, 228 mutants ; stratégie Critique : ruineuse).

## Ce qu'ajoute la 0.4 (les habitants)

- **Six habitants nommés**, trois statistiques chacun : Mains, Esprit, Résistance. Armand, Lison et Basile au premier étage ; Victor, Firmin et Odette arrivent en creusant le deuxième.
- **Affectation libre** : on tape un habitant, on choisit sa salle (une personne par salle ; deux habitants qui se croisent échangent leur place). Le rendement d'une salle dépend de la statistique qui la commande (0,1 + 0,3 × la stat : 2 → 70 %, 3 → 100 %, 5 → 160 %). Cuisine, Générateur, Fouille de l'épave, Infirmerie, puis Labo, Atelier et Salle des cartes.
- **Niveaux** : en travaillant (vivres, pas d'incident, pas KO), un habitant monte jusqu'au niveau 6 et gagne un point dans la statistique de sa salle (plafond 5). Cela continue hors ligne.
- **KO, jamais la mort** : au-delà de 55 % de Contamination, un habitant peut s'évanouir (moins si sa Résistance est haute) ; il est remis sur pied avec le temps, plus vite avec quelqu'un à l'infirmerie. Seulement en jeu, jamais hors ligne.
- **Incidents** (panne, infiltration d'air, rongeurs) : un à la fois, en jeu seulement, la salle s'arrête jusqu'à ce qu'on la répare avec 1 électronique, 1 plastique ou 2 ferrailles.
- **Journal du Bunker** : niveaux, KO, incidents, arrivées.
- Sauvegarde passée en version 3 (migration automatique : les anciennes parties reçoivent leurs habitants).
- Pas encore : le troisième étage et les salles fusionnées (reportés), les naissances (abandonnées).
