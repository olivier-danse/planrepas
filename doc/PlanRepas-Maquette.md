# PlanRepas — Spécifications fonctionnelles et maquette

> Application PWA de gestion du planning de présence aux repas de la semaine, avec génération automatique de listes de courses.

---

## Changelog

### v1.0 — Maquette initiale
- Définition de la structure de l'application : planning + liste de courses
- Vue sur 2 semaines glissantes (midi et soir, tous les jours)
- Trois options par repas : Présent, Absent (par défaut), Gamelle
- Verrouillage automatique des repas à J-24h
- Marqueur "courses faites" pour bloquer un ensemble de jours
- Fonctionnement offline (PWA)
- Archivage des semaines passées sur Google Drive partagé
- Notes de courses par repas (popup) — texte libre
- Écran de synthèse des courses en checklist

### v2.0 — Gestion multi-personnes
- Ajout de la notion de colonnes par personne (nombre configurable)
- Configuration initiale avec deux personnes : `Amande` et `Isma`
- Les options (Présent / Absent / Gamelle) deviennent une **liste déroulante (`<select>`)** par personne et par repas
- Ajout d'un écran **Réglages** pour gérer dynamiquement la liste des personnes
- Refonte de la grille d'affichage : un jour → une ligne midi + une ligne soir, chaque ligne affichant une cellule par personne

### v3.0 — Catégorisation des courses
- Ajout de 5 catégories pour classer les courses :
  - `Boucherie / poissonnerie / traiteur`
  - `Produits frais / surgelés`
  - `Conserves / féculents`
  - `Gâteaux / brioche / céréales`
  - `Divers`
- L'écran de synthèse des courses regroupe désormais les items par catégorie
- Code couleur distinct par catégorie, avec compteur de progression (coché / total) par rayon

### v4.0 — Catégorie par item (version courante)
- Chaque note d'un repas peut contenir plusieurs items (articles)
- **Chaque item est saisi individuellement et se voit associer sa propre catégorie**
- Le popup de note affiche une liste de lignes `[texte libre + liste déroulante de catégorie]`
- Bouton `+ Ajouter un article` pour ajouter une ligne
- La synthèse des courses éclate chaque item dans sa catégorie respective (un repas avec 4 items classés dans 3 catégories alimentera 3 sections différentes de la synthèse)

---

## 1. Vue d'ensemble

PlanRepas est une Progressive Web App (PWA) installable sur iOS, Android, Windows et macOS, qui permet à un foyer de plusieurs personnes de gérer collaborativement la présence aux repas et de générer automatiquement la liste des courses à partir des menus prévus.

### 1.1 Utilisateurs cibles
Foyers, colocations, ou familles souhaitant coordonner les repas sur les deux prochaines semaines.

### 1.2 Navigation principale
Trois onglets accessibles depuis la barre de navigation inférieure :
- `Planning` — écran principal, saisie des présences
- `Courses` — synthèse consolidée des courses à faire
- `Réglages` — gestion des personnes, archivage, connexion Drive

---

## 2. Écran 1 — Planning des repas

### 2.1 Structure
- Barre de titre avec le logo `PlanRepas`
- Deux icônes en haut à droite :
  - `🔒` Activation du marqueur "courses faites" (verrouillage manuel d'une plage de jours)
  - `☁` Forcer l'archivage vers Google Drive
- Onglets de semaine : `Semaine N` et `Semaine N+1` (semaines glissantes, recalculées à partir de la date du jour)
- Légende compacte rappelant le code couleur : Présent (vert), Absent (rouge), Gamelle (ambre), Verrouillé (gris)

### 2.2 Bandeau de semaine
Affiche la plage de dates (ex. `Lundi 14 — Dimanche 20 avr.`) et, si le verrouillage "courses faites" est actif, un badge `🔒 Courses faites` indiquant jusqu'à quelle date les repas sont figés.

### 2.3 Ligne par jour
Chaque jour affiche :
- Le nom du jour et sa date (ex. `Mercredi — 16 avril`)
- Une ligne d'en-tête avec les noms des personnes (colonnes)
- Deux sous-lignes : `Midi` et `Soir`

### 2.4 Cellule par personne × repas
Chaque cellule est une liste déroulante (`<select>`) avec les trois options :
- `Présent` (fond vert clair)
- `Absent` (fond rouge clair) — valeur par défaut
- `Gamelle` (fond ambre clair)

La couleur de fond de la cellule reflète la valeur sélectionnée.

### 2.5 Bouton note par repas
À droite de chaque ligne (midi ou soir), un bouton crayon `✎` permet d'ouvrir le popup de note pour ce repas :
- Gris si aucune note
- Ambre si une note existe

### 2.6 Verrouillage
Deux mécanismes :
- **Automatique** : tout repas dont la date est à moins de 24 heures est automatiquement verrouillé (le `<select>` devient non-modifiable, grisé)
- **Manuel** : le marqueur "courses faites" verrouille explicitement une plage de jours (typiquement les jours dont on vient d'acheter les courses)

Les cellules verrouillées conservent leur valeur, mais ne peuvent plus être modifiées.

---

## 3. Écran 2 — Popup de note (courses par repas)

### 3.1 Déclenchement
Clic sur le bouton crayon `✎` d'une ligne midi ou soir. Le popup est lié à un repas unique (date + créneau), et non à une personne.

### 3.2 Contenu
- Titre : `Note — [Jour] [Date] [Créneau]` (ex. `Note — Mercredi 16 avr. midi`)
- Liste verticale d'items. Chaque item est composé de :
  - Un champ texte libre pour décrire l'article (ex. `Poulet fermier x1`)
  - Une liste déroulante de catégorie parmi les 5 catégories définies
- Bouton `+ Ajouter un article` pour insérer une nouvelle ligne
- Bouton `🗑` par ligne pour supprimer un item
- Boutons d'action en bas : `Annuler` et `Enregistrer`

### 3.3 Catégories disponibles
1. `Boucherie / poissonnerie / traiteur`
2. `Produits frais / surgelés`
3. `Conserves / féculents`
4. `Gâteaux / brioche / céréales`
5. `Divers`

### 3.4 Règle de persistance
Les items sont sauvegardés localement (IndexedDB) dès validation. Chaque item porte :
- Un identifiant unique
- Une référence au repas (date + créneau)
- Son texte
- Sa catégorie
- Un booléen `checked` (pour la checklist de synthèse)

---

## 4. Écran 3 — Synthèse des courses

### 4.1 Principe
Agrégation en temps réel de tous les items issus des notes des repas dont la date **n'est pas échue** (date du repas ≥ aujourd'hui). Les notes des repas passés sont exclues.

### 4.2 Structure par catégorie
Les items sont regroupés par catégorie, dans l'ordre suivant :
1. Boucherie / poissonnerie / traiteur
2. Produits frais / surgelés
3. Conserves / féculents
4. Gâteaux / brioche / céréales
5. Divers

Chaque section affiche :
- Une icône et un nom de catégorie avec code couleur dédié
- Un compteur `X/Y` (items cochés sur total)
- La liste des items de cette catégorie

### 4.3 Item de liste
Chaque item affiche :
- Une case à cocher (`checkbox`)
- Le texte libre de l'article
- La source : `[Jour abr.] [Créneau]` (ex. `Mer. midi`)

Un item coché apparaît barré et estompé. L'état coché est sauvegardé localement et persiste tant que l'item est actif.

### 4.4 Actions possibles
- Cocher / décocher un item
- Action globale `Tout réinitialiser` (décocher toute la liste)
- Action globale `Purger les items cochés` (supprimer définitivement les items déjà achetés)

---

## 5. Écran 4 — Réglages

### 5.1 Gestion des personnes
- Liste visuelle des personnes sous forme de pills
- Chaque pill affiche le nom et une croix `✕` pour supprimer
- Bouton `+ Ajouter` ouvrant un champ de saisie pour ajouter une personne
- Le nombre de personnes est configurable sans limite
- Valeurs initiales : `Amande` et `Isma`

### 5.2 Google Drive
- Connexion / déconnexion à un compte Google
- Sélection du dossier cible sur le Drive partagé
- Affichage du statut : `Connecté` / `Non connecté`

### 5.3 Options avancées
- Option par défaut pour les nouveaux repas (par défaut : `Absent`)
- Archivage automatique en fin de semaine : activé/désactivé
- Délai de verrouillage automatique (par défaut 24h, configurable)

---

## 6. Comportements transverses

### 6.1 Mode offline
L'application fonctionne intégralement sans connexion. Toutes les données (planning, notes, état des checklists, configuration) sont stockées dans IndexedDB. Le service worker met en cache l'ensemble des ressources statiques et assure le fonctionnement hors ligne dès la première visite.

### 6.2 Synchronisation
Quand une connexion est disponible :
- Les semaines passées (au-delà de la fenêtre glissante de 2 semaines) sont exportées automatiquement au format JSON vers le dossier Drive partagé
- Les archives Drive servent d'historique long terme et de sauvegarde entre appareils

### 6.3 Semaines glissantes
La vue affiche toujours la semaine en cours et la suivante. Le lundi de chaque semaine, la fenêtre avance d'une semaine et la semaine précédente est archivée (si connecté à Drive) puis retirée de la vue.

### 6.4 Données par défaut
À la première ouverture :
- Deux personnes créées : `Amande` et `Isma`
- Toutes les cases `Absent`
- Aucune note
- Pas de verrouillage manuel actif

---

## 7. Modèle de données (résumé)

```
Person { id, name, order }
MealEntry { date, slot (midi|soir), personId, status (present|absent|gamelle) }
NoteItem { id, date, slot, text, category, checked }
Settings { defaultStatus, lockHours, driveFolderId, coursesFaitesUntil }
```

---

## 8. Aperçu visuel

Les trois écrans principaux :

- **Planning** : grille 2 semaines × 7 jours × 2 repas × N personnes, avec `<select>` coloré par cellule
- **Popup note** : liste d'items `[texte + catégorie]` avec ajout/suppression dynamique
- **Synthèse courses** : checklist regroupée par catégorie avec compteurs et source de chaque item
- **Réglages** : gestion des personnes, connexion Drive, options

---

*Document préparé pour validation avant démarrage du développement. Phase suivante : initialisation du projet PWA (structure, service worker, IndexedDB, navigation).*
