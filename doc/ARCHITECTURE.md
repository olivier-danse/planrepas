# MealPlan — Document d'architecture technique

> Version : 1.1-dev (étapes 1 à 3 + migration Supabase + page Synthèse)
> Dernière mise à jour : 21 avril 2026

---

## 1. Vue d'ensemble du projet

**MealPlan** est une Progressive Web App (PWA) offline-first permettant à un foyer de gérer la présence aux repas sur 2 semaines glissantes et de générer automatiquement des listes de courses.

### 1.1 Stack technique

| Couche | Technologie | Version | Rôle |
|--------|------------|---------|------|
| Framework UI | React | 18.3 | Composants, hooks, rendu |
| Bundler | Vite | 5.3 | Build, HMR, optimisation |
| Langage | TypeScript | 5.5 | Typage strict |
| Routing | react-router-dom | 6.23 | Navigation SPA |
| Base de données | Supabase (PostgreSQL) | — | Persistance cloud + sync temps réel |
| Réactivité DB | Supabase Realtime | — | Subscriptions postgres_changes → re-render auto |
| PWA | vite-plugin-pwa + Workbox | 0.20 / 7.1 | Service Worker, cache, manifest |
| CI/CD | GitHub Actions | — | Build + deploy automatique |
| Hébergement | GitHub Pages | — | https://olivier-danse.github.io/planrepas/ |

### 1.2 Typographie et design

| Usage | Police | Source |
|-------|--------|--------|
| Titres (display) | Fraunces | Google Fonts |
| Corps (body) | DM Sans | Google Fonts |

Direction esthétique : **Warm minimal** — tons terreux (terre de Sienne, lin, olive), dark mode bleu nuit, géométrie douce.

---

## 2. Arborescence du projet

```
meal-planner/
├── .github/
│   └── workflows/
│       └── deploy.yml              # CI/CD GitHub Actions → GitHub Pages
├── public/
│   └── icons/                      # Icônes PWA (192, 512, apple-touch)
├── src/
│   ├── components/                 # Composants React
│   │   ├── AppHeader.tsx           # Header sticky + navigation
│   │   ├── GroceryDoneToggle.tsx   # Bouton "courses faites" par jour
│   │   ├── GroceryDoneToggle.css
│   │   ├── NoteButton.tsx          # Bouton note par repas (midi/soir)
│   │   ├── NoteButton.css
│   │   ├── PlanningGrid.tsx        # ★ Grille principale du planning
│   │   ├── PlanningGrid.css
│   │   ├── StatusSelect.tsx        # Dropdown Absent/Présent/Gamelle
│   │   └── StatusSelect.css
│   ├── hooks/                      # Custom hooks React
│   │   ├── useAppConfig.ts         # Config (personnes, verrouillage)
│   │   ├── useInstallPrompt.ts     # Prompt d'installation PWA
│   │   ├── useLocking.ts           # Logique de verrouillage combinée
│   │   ├── useMealEntries.ts       # CRUD entrées de repas
│   │   ├── useOnlineStatus.ts      # Détection online/offline
│   │   └── useWeeks.ts             # Structure 2 semaines glissantes
│   ├── pages/                      # Pages (routes)
│   │   ├── PlanningPage.tsx        # Page planning (route /)
│   │   └── ShoppingListPage.tsx    # Page courses (route /courses)
│   ├── styles/
│   │   └── global.css              # Design tokens, reset, app shell
│   ├── types/
│   │   └── index.ts                # Types TS + constantes
│   ├── utils/
│   │   └── dates.ts                # Utilitaires date (FR, semaines, verrouillage)
│   ├── db.ts                       # Schéma IndexedDB (Dexie) + helpers CRUD
│   ├── App.tsx                     # Router principal
│   └── main.tsx                    # Point d'entrée React
├── index.html                      # HTML avec meta PWA + fonts
├── package.json
├── tsconfig.json
├── vite.config.ts                  # Vite + PWA plugin + code splitting
├── vite-env.d.ts
└── .gitignore
```

---

## 3. Modèle de données

### 3.1 Schéma IndexedDB (Dexie)

```
MealPlannerDB v1
├── mealEntries    [++id, [date+slot+personId], date, personId]
├── mealNotes      [++id, [date+slot], date]
├── groceryDoneMarks [++id, &date]
└── appConfig      [id]    ← singleton (id=1)
```

### 3.2 Types TypeScript

```typescript
// ─── Énumérations ───────────────────────────────────
MealStatus   = 'absent' | 'present' | 'gamelle'
MealSlot     = 'midi' | 'soir'
GroceryCategory = 'boucherie-poissonnerie-traiteur'
               | 'produits-frais-surgeles'
               | 'conserves-feculents'
               | 'gateaux-brioche-cereales'
               | 'divers'

// ─── Entités ────────────────────────────────────────
Person {
  id: string          // "amande", "isma"
  name: string        // "Amande", "Isma"
  color: string       // "#e07a5f"
  order: number       // 0, 1, ...
}

MealEntry {
  id?: number         // auto-increment
  date: string        // "2026-04-20"
  slot: MealSlot
  personId: string
  status: MealStatus
  updatedAt: string   // ISO datetime
}

MealNote {
  id?: number
  date: string
  slot: MealSlot
  text: string
  items: GroceryItem[]
  createdAt: string
  updatedAt: string
}

GroceryItem {
  id: string
  label: string
  category: GroceryCategory
  checked: boolean
}

GroceryDoneMark {
  id?: number
  date: string        // jour marqué
  markedAt: string
}

AppConfig {
  id: 1               // singleton
  persons: Person[]
  lockHoursBefore: number  // défaut: 24
  googleDriveFolderId?: string
  lastSyncAt?: string
}
```

### 3.3 Valeurs par défaut

- Personnes initiales : `Amande` (#e07a5f) et `Isma` (#3d5a80)
- Statut par défaut de chaque cellule : `absent`
- Verrouillage automatique : 24h avant le repas
- Heure repas midi : 12h00 / soir : 19h00

---

## 4. Architecture des composants

### 4.1 Arbre de rendu

```
<App>
  <BrowserRouter basename="/meal-planner">
    <AppHeader />                    ← nav sticky + bannière offline
    <main>
      <Routes>
        <Route "/" → PlanningPage>
          <PlanningGrid>             ← ★ composant central
            ┌─ WeekSection (×2)
            │  ├─ grid-header        ← noms des personnes
            │  └─ DayGroup (×7)
            │     ├─ day-label + GroceryDoneToggle
            │     └─ SlotRow (×2 : midi, soir)
            │        ├─ StatusSelect (×N personnes)
            │        └─ NoteButton
        <Route "/courses" → ShoppingListPage>
          └─ (placeholder — étape 5)
```

### 4.2 Graphe de dépendances des hooks

```
PlanningGrid.tsx
  ├── useWeeks()           → structure des 14 jours
  ├── useAppConfig()       → personnes + config verrouillage
  │     └── db.appConfig   → IndexedDB (LiveQuery)
  ├── useMealEntries()     → statuts de chaque cellule
  │     └── db.mealEntries → IndexedDB (LiveQuery)
  └── useLocking()         → verrouillage combiné
        └── db.groceryDoneMarks → IndexedDB (LiveQuery)

AppHeader.tsx
  ├── useOnlineStatus()    → navigator.onLine
  └── useInstallPrompt()   → beforeinstallprompt event
```

### 4.3 Flux de données (lecture)

```
IndexedDB (Dexie)
    │
    ▼ LiveQuery (réactivité automatique)
Custom Hooks (useAppConfig, useMealEntries, useLocking, useWeeks)
    │
    ▼ retour objet avec getters
Composants React (PlanningGrid → StatusSelect)
    │
    ▼ rendu JSX
DOM
```

### 4.4 Flux de données (écriture)

```
Utilisateur: change le <select>
    │
    ▼ onChange
StatusSelect → appelle props.onChange(newStatus)
    │
    ▼
PlanningGrid → appelle setStatus(date, slot, personId, status)
    │
    ▼
useMealEntries.setStatus → appelle upsertMealEntry (db.ts)
    │
    ▼
IndexedDB: insert ou update via index composite [date+slot+personId]
    │
    ▼ LiveQuery détecte le changement
Re-render automatique de tous les composants abonnés
```

---

## 5. Logique de verrouillage

Trois mécanismes indépendants, combinés par un OR logique :

| Mécanisme | Condition | Déclenchement |
|-----------|-----------|---------------|
| **Temporel** | `maintenant ≥ heureRepas - lockHoursBefore` | Automatique, recalculé à chaque render |
| **Courses faites** | Le jour a un `GroceryDoneMark` | Manuel via `GroceryDoneToggle` |
| **Propagation** | Un jour APRÈS celui-ci est marqué "courses faites" | Automatique (boucle sur le Set) |

```
isCellLocked(date, slot) =
    isMealLocked(date, slot, 24h)          // temporel
  ∨ groceryDoneMarks.has(date)             // courses faites pour ce jour
  ∨ ∃ markedDate ∈ groceryDoneMarks : markedDate ≥ date  // propagation
```

Quand une cellule est verrouillée :
- Le `<select>` est remplacé par un affichage statique avec icône cadenas
- Les cellules sont visuellement grisées (opacity + hachures pour courses faites)

---

## 6. Gestion des dates

### 6.1 Semaines glissantes

```
getMonday(today) → lundi de la semaine en cours
getTwoWeeksDays() → 14 Date[] consécutifs (lun → dim × 2)
getTwoWeeksRange() → { startDate, endDate } en ISO strings
```

Le calcul s'appuie sur `getDay()` avec correction dimanche (0→6).

### 6.2 Formats d'affichage

| Fonction | Exemple |
|----------|---------|
| `toDateString(date)` | `"2026-04-20"` |
| `formatDayShort(date)` | `"Lun 20/04"` |
| `formatDayLong(date)` | `"Lundi 20 avril"` |
| `getWeekNumber(date)` | `17` |

### 6.3 Verrouillage temporel

```
heureRepas = date + (midi ? 12:00 : 19:00)
heureLimite = heureRepas - lockHoursBefore
verrouillé = maintenant ≥ heureLimite
```

---

## 7. PWA et mode offline

### 7.1 Service Worker (Workbox via vite-plugin-pwa)

| Stratégie | Cible | Durée cache |
|-----------|-------|-------------|
| Precache | JS, CSS, HTML, images | Invalidé au build |
| CacheFirst | Google Fonts (styles) | 1 an |
| CacheFirst | Google Fonts (fichiers woff2) | 1 an |

### 7.2 Manifest

```json
{
  "name": "Meal Planner — Planning Repas",
  "short_name": "MealPlan",
  "display": "standalone",
  "orientation": "any",
  "theme_color": "#1a1a2e",
  "start_url": "/meal-planner/"
}
```

### 7.3 Données offline

Toutes les données sont dans IndexedDB (pas de localStorage). Aucune requête réseau n'est nécessaire pour le fonctionnement courant. Le réseau n'est utilisé que pour :
- La première installation
- Les mises à jour du Service Worker
- L'archivage Google Drive (étape 6)

---

## 8. Routing

| Route | Page | Composant |
|-------|------|-----------|
| `/` | Planning | `PlanningPage` → `PlanningGrid` |
| `/courses` | Liste de courses | `ShoppingListPage` (placeholder) |

Navigation via `react-router-dom` avec `BrowserRouter` et `basename="/meal-planner"` pour GitHub Pages.

---

## 9. Design system (CSS custom properties)

### 9.1 Couleurs principales

| Variable | Light | Dark | Usage |
|----------|-------|------|-------|
| `--mp-bg` | `#faf8f5` | `#1a1a2e` | Fond de page |
| `--mp-bg-card` | `#ffffff` | `#23233d` | Cartes, grille |
| `--mp-text` | `#2c2416` | `#e8e4de` | Texte principal |
| `--mp-accent` | `#e07a5f` | `#e8926e` | Accent (CTA, aujourd'hui) |
| `--mp-present` | `#588157` | `#81c784` | Statut Présent |
| `--mp-gamelle` | `#3d5a80` | `#64b5f6` | Statut Gamelle |
| `--mp-absent` | `#b0a090` | — | Statut Absent |

### 9.2 Radius et ombres

```
--mp-radius-sm: 6px    → select, boutons
--mp-radius-md: 10px   → éléments interactifs
--mp-radius-lg: 16px   → cartes, grille
--mp-shadow-sm: 0 1px 3px rgba(44,36,22,0.06)
--mp-shadow-md: 0 4px 12px rgba(44,36,22,0.08)
```

---

## 10. Responsive design

| Breakpoint | Comportement |
|------------|-------------|
| < 600px (mobile) | Grille empilée verticalement, header par jour pleine largeur, header colonnes masqué |
| 601–900px (tablette) | Grille flex compacte, colonnes jour réduites |
| > 900px (desktop) | Layout complet avec header sticky, max-width 960px |

---

## 11. CI/CD

```yaml
Déclencheur: push sur main
Pipeline:
  1. checkout
  2. setup Node 20
  3. npm ci
  4. npm run build (tsc + vite)
  5. upload artifact (dist/)
  6. deploy GitHub Pages
```

---

## 12. Avancement par étape

| Étape | Intitulé | Statut | Fichiers clés |
|-------|----------|--------|---------------|
| 1 | Scaffolding et architecture PWA | ✅ Fait | package.json, vite.config.ts, index.html, global.css, deploy.yml |
| 2 | Modèle de données et hooks | ✅ Fait | types/index.ts, db.ts, useAppConfig, useMealEntries, useLocking, useWeeks |
| 3 | Grille de planning | ✅ Fait | PlanningGrid, StatusSelect, GroceryDoneToggle, NoteButton, PlanningPage |
| — | Migration Supabase (sync temps réel) | ✅ Fait | lib/supabase.ts, hooks réécrits, supabase-setup.sql |
| — | Page Synthèse (tableau imprimable) | ✅ Fait | SynthesisPage.tsx, SynthesisPage.css, route /synthese |
| 4 | Verrouillage avancé (UI config) | ⬜ À faire | Affiner useLocking, UI de sélection de plage, configuration du délai |
| 5 | Notes de repas et liste de courses | ⬜ À faire | NoteModal, NoteForm, ShoppingList, useShoppingList, categories |
| 6 | Archivage Google Drive | ⬜ À faire | googleAuth, driveSync, archiveWeek, SyncStatus, SettingsPage |
| 7 | Tests, polish et déploiement | ⬜ À faire | *.test.ts, e2e/, Lighthouse, CI optimisé |

---

## 13. Points d'attention pour les étapes suivantes

### Étape 4 — Verrouillage avancé
- Le hook `useLocking.ts` est fonctionnel mais la propagation ("courses faites" verrouille les jours antérieurs) pourrait être affinée avec un sélecteur de plage de dates plutôt qu'un toggle jour par jour
- Le `lockHoursBefore` est configurable dans `AppConfig` mais pas encore exposé dans une UI de réglages

### Étape 5 — Notes et courses
- `NoteButton` est connecté mais le `onClick` est un TODO
- `MealNote.items` stocke un tableau de `GroceryItem`, chacun avec sa catégorie
- La page `ShoppingListPage` est un placeholder, à remplacer par l'agrégation réelle
- Filtre des notes : seules celles dont `date ≥ aujourd'hui` apparaissent dans la synthèse

### Étape 6 — Google Drive
- L'authentification OAuth2 nécessitera un Google Cloud Project avec l'API Drive activée
- Le format d'export envisagé est JSON (une archive par semaine)
- La synchro est unidirectionnelle pour la v1 : app → Drive

### Étape 7 — Tests
- Logique pure à tester en priorité : `dates.ts` (calculs semaines), `useLocking` (règles combinées)
- Tests d'intégration Playwright : parcours complet (modifier statut → vérifier verrouillage → ajouter note → voir synthèse)
- Audit Lighthouse pour le score PWA

---

*Document généré automatiquement à partir de l'état du code source.*
