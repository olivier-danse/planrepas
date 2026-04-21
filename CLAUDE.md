# CLAUDE.md — PlanRepas PWA

> Fichier de référence pour Claude Code. Contient l'architecture, les conventions, les commandes et le contexte métier du projet.

---

## Vue d'ensemble du projet

**PlanRepas** est une Progressive Web App (PWA) permettant à un foyer de gérer collaborativement la présence aux repas (midi/soir, 2 semaines glissantes) et de générer automatiquement une liste de courses catégorisée.

- **Type** : PWA installable (iOS, Android, Windows, macOS)
- **Langue de l'UI** : Français
- **Utilisateurs** : foyer domestique (Amande + Isma)
- **Repo** : https://github.com/olivier-danse/planrepas
- **App déployée** : https://olivier-danse.github.io/planrepas/
- **Code local** : `C:\Dev\planrepas`

---

## Stack technique

| Couche | Choix retenu |
|---|---|
| Framework UI | **React 18 + TypeScript** (strict) |
| Build tool | **Vite 5** + `vite-plugin-pwa` |
| CSS | **CSS custom properties** (`--mp-*`) — pas de Tailwind |
| Base de données | **Supabase** (PostgreSQL cloud + réactivité temps réel) |
| Sync temps réel | **Supabase Realtime** (subscriptions postgres_changes) |
| Service Worker | **Workbox** via vite-plugin-pwa |
| Routing | **react-router-dom v6** |
| CI/CD | **GitHub Actions** → deploy sur push `main` |
| Hébergement | **GitHub Pages** (`/planrepas/`) |

---

## Infrastructure

### Supabase
- **Projet** : `cvmnzojzqresziczkjlg`
- **URL** : `https://cvmnzojzqresziczkjlg.supabase.co`
- **Script de setup** : `supabase-setup.sql` à la racine du repo
- **RLS** : désactivé (app domestique, pas d'authentification)
- **Réplication temps réel** : activée sur `meal_entries`, `grocery_done_marks`, `app_config`

### Variables d'environnement
- `.env.local` (local, ignoré par git) : `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
- GitHub Secrets (pour le build CI) : `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`

---

## Structure du dépôt

```
C:\Dev\planrepas\
├── .github/
│   └── workflows/
│       └── deploy.yml          # Build + deploy GitHub Pages sur push main
├── doc/
│   ├── ARCHITECTURE.md         # Architecture technique détaillée
│   └── PlanRepas-Maquette.md   # Specs fonctionnelles
├── public/
│   └── icons/                  # Icônes PWA
├── src/
│   ├── components/
│   │   ├── AppHeader.tsx        # Header sticky + navigation (Planning / Synthèse / Courses)
│   │   ├── GroceryDoneToggle.tsx
│   │   ├── NoteButton.tsx
│   │   ├── PlanningGrid.tsx     # Grille principale du planning
│   │   └── StatusSelect.tsx
│   ├── hooks/
│   │   ├── useAppConfig.ts      # Config (personnes) — Supabase + realtime
│   │   ├── useInstallPrompt.ts
│   │   ├── useLocking.ts        # Verrouillage + courses faites — Supabase + realtime
│   │   ├── useMealEntries.ts    # CRUD entrées repas — Supabase + realtime
│   │   ├── useOnlineStatus.ts
│   │   └── useWeeks.ts          # Structure 2 semaines glissantes
│   ├── lib/
│   │   └── supabase.ts          # Client Supabase + mappers snake_case↔camelCase
│   ├── pages/
│   │   ├── PlanningPage.tsx     # Route /
│   │   ├── ShoppingListPage.tsx # Route /courses (placeholder étape 5)
│   │   └── SynthesisPage.tsx    # Route /synthese — tableau synthèse imprimable
│   ├── styles/
│   │   └── global.css           # Design tokens, reset, app shell
│   ├── types/
│   │   └── index.ts             # Types TS + constantes
│   ├── utils/
│   │   └── dates.ts             # Utilitaires date (semaines, verrouillage)
│   ├── db.ts                    # Schéma Dexie (héritage — non utilisé par les hooks)
│   ├── App.tsx
│   └── main.tsx
├── supabase-setup.sql           # Script SQL initial Supabase
├── .env.local                   # Credentials locaux (ignoré par git)
├── CLAUDE.md
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## Modèle de données (Supabase)

```sql
meal_entries      (id uuid PK, date text, slot text, person_id text, status text, updated_at timestamptz)
                  UNIQUE(date, slot, person_id)

grocery_done_marks (id uuid PK, date text UNIQUE, marked_at timestamptz)

app_config        (id int PK=1, persons jsonb, lock_hours_before int=24)
```

### Types TypeScript correspondants

```typescript
MealStatus  = 'absent' | 'present' | 'gamelle'
MealSlot    = 'midi' | 'soir'

Person      { id: string; name: string; color: string; order: number }
MealEntry   { id?: number; date: string; slot: MealSlot; personId: string; status: MealStatus; updatedAt: string }
GroceryDoneMark { id?: number; date: string; markedAt: string }
AppConfig   { id: 1; persons: Person[]; lockHoursBefore: number }
```

### Catégories de courses

```typescript
type GroceryCategory =
  | 'boucherie-poissonnerie-traiteur'
  | 'produits-frais-surgeles'
  | 'conserves-feculents'
  | 'gateaux-brioche-cereales'
  | 'divers'
```

---

## Commandes du projet

```bash
# Installation
npm install

# Développement local (hot reload)
npm run dev

# Build de production
npm run build

# Preview du build (avec SW actif)
npm run preview

# Tests unitaires
npm run test

# Tests E2E (Playwright)
npm run test:e2e

# Lint
npm run lint

# Déploiement manuel
npm run deploy
```

---

## Règles de développement

### Conventions de code
- **TypeScript strict** activé (`strict: true`)
- Pas de `any` explicite — utiliser des types précis ou `unknown`
- Composants React en **function components** uniquement
- Chaque composant dans son propre fichier `.tsx`
- Exports nommés préférés aux exports par défaut (sauf `App.tsx`)

### Conventions de nommage
- Composants : `PascalCase` (`PlanningGrid.tsx`)
- Hooks : `camelCase` préfixé `use` (`useMealEntries.ts`)
- Types / interfaces : `PascalCase`
- Constantes globales : `SCREAMING_SNAKE_CASE`
- CSS co-localisé avec son composant

### Supabase — règles
- Les colonnes Supabase sont en `snake_case` ; les mappers dans `src/lib/supabase.ts` font la conversion vers `camelCase`
- Ne jamais appeler Supabase directement dans les composants — toujours passer par les hooks
- Les hooks utilisent `useState` + `useEffect` + subscription realtime (pattern uniforme)

### Gestion des dates
- Toutes les dates en **ISO 8601** (`YYYY-MM-DD`) en interne
- Affichage via fonctions de `src/utils/dates.ts`
- **Ne jamais stocker d'objets `Date`** dans Supabase ou le state — uniquement des strings ISO
- La semaine commence le **lundi**

### Verrouillage des repas
- Centralisé dans `useLocking.ts`
- Trois mécanismes combinés par OR : temporel (24h avant) + courses faites + propagation
- Les cellules verrouillées affichent un affichage statique (pas de `<select>`)

---

## Routes

| Route | Page | Description |
|-------|------|-------------|
| `/` | `PlanningPage` | Grille éditable 2 semaines |
| `/synthese` | `SynthesisPage` | Tableau synthèse présences (lecture + impression) |
| `/courses` | `ShoppingListPage` | Liste de courses par catégorie (étape 5) |

---

## Avancement

| Étape | Intitulé | Statut |
|-------|----------|--------|
| 1 | Scaffolding PWA | ✅ |
| 2 | Modèle de données + hooks | ✅ |
| 3 | Grille de planning | ✅ |
| — | Migration Supabase (sync temps réel) | ✅ |
| — | Page Synthèse (tableau imprimable) | ✅ |
| 4 | Verrouillage avancé (UI config) | ⬜ |
| 5 | Notes de repas + liste de courses | ⬜ |
| 6 | Archivage Google Drive | ⬜ |
| 7 | Tests, polish, déploiement | ⬜ |

---

## Données initiales (Supabase)

```typescript
app_config: {
  id: 1,
  persons: [
    { id: 'amande', name: 'Amande', color: '#e07a5f', order: 0 },
    { id: 'isma',   name: 'Isma',   color: '#3d5a80', order: 1 },
  ],
  lockHoursBefore: 24,
}
// meal_entries vides par défaut (statut implicite = 'absent')
// grocery_done_marks vide
```

---

## Références

- Specs fonctionnelles : `doc/PlanRepas-Maquette.md`
- Architecture détaillée : `doc/ARCHITECTURE.md`
- [Supabase JS Client](https://supabase.com/docs/reference/javascript)
- [Vite PWA Plugin](https://vite-pwa-org.netlify.app/)
- [Workbox](https://developer.chrome.com/docs/workbox/)
