# CLAUDE.md — PlanRepas PWA

> Fichier de référence pour Claude Code. Contient l'architecture, les conventions, les commandes et le contexte métier du projet.

---

## Vue d'ensemble du projet

**PlanRepas** est une Progressive Web App (PWA) permettant à un foyer de gérer collaborativement la présence aux repas (midi/soir, 2 semaines glissantes) et de générer automatiquement une liste de courses catégorisée.

- **Type** : PWA installable (iOS, Android, Windows, macOS)
- **Langue de l'UI** : Français
- **Utilisateurs** : foyers / colocations (usage domestique, non commercial)
- **Version courante des specs** : v4.0

---

## Stack technique

| Couche | Choix retenu | Alternatives possibles |
|---|---|---|
| Framework UI | **React 18 + TypeScript** | Vue 3, Svelte — *à confirmer* |
| Build tool | **Vite** (avec plugin `vite-plugin-pwa`) | CRA (déprécié), Next.js |
| CSS | **Tailwind CSS v3** | CSS Modules, styled-components |
| Stockage local | **IndexedDB** via `idb` (wrapper typé) | Dexie.js — *alternative recommandée si ORM souhaité* |
| Service Worker | **Workbox** (via vite-plugin-pwa) | SW manuel |
| Tests unitaires | **Vitest** + **@testing-library/react** | Jest |
| Tests E2E | **Playwright** | Cypress |
| Lint / Format | **ESLint** + **Prettier** | — |
| CI/CD | **GitHub Actions** | — |
| Hébergement | **GitHub Pages** ou **Vercel** — *à confirmer* | Netlify, Cloudflare Pages |
| Authentification Drive | **Google Identity Services** (OAuth 2.0) | — |
| API Drive | **Google Drive REST API v3** | — |

> ⚠️ **Décisions en attente** (voir section « Points à confirmer »)

---

## Structure du dépôt

```
planrepas/
├── public/
│   ├── manifest.json          # PWA manifest
│   ├── icons/                 # Icônes PWA (192, 512px)
│   └── favicon.ico
├── src/
│   ├── components/
│   │   ├── planning/          # Grille planning, cellules, select
│   │   ├── courses/           # Synthèse courses, checklist
│   │   ├── note/              # Popup note (items + catégories)
│   │   ├── settings/          # Réglages, gestion personnes
│   │   └── shared/            # Nav bar, modals, boutons communs
│   ├── hooks/                 # Custom hooks React (useDB, usePlanning…)
│   ├── lib/
│   │   ├── db.ts              # Couche IndexedDB (idb)
│   │   ├── drive.ts           # Intégration Google Drive
│   │   ├── dates.ts           # Utilitaires dates (semaines glissantes)
│   │   └── locking.ts         # Logique de verrouillage automatique/manuel
│   ├── store/                 # État global (Zustand ou Context — à confirmer)
│   ├── types/                 # Types TypeScript partagés
│   ├── App.tsx
│   ├── main.tsx
│   └── sw.ts                  # Service worker Workbox (entry point)
├── tests/
│   ├── unit/                  # Tests Vitest
│   └── e2e/                   # Tests Playwright
├── .github/
│   └── workflows/
│       ├── ci.yml             # Lint + tests sur PR
│       └── deploy.yml         # Déploiement sur merge main
├── CLAUDE.md                  # Ce fichier
├── README.md
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## Modèle de données (IndexedDB)

```typescript
// Stores IndexedDB
Person    { id: string; name: string; order: number }

MealEntry {
  date: string;           // ISO "YYYY-MM-DD"
  slot: 'midi' | 'soir';
  personId: string;
  status: 'present' | 'absent' | 'gamelle';
}

NoteItem  {
  id: string;             // UUID
  date: string;           // ISO "YYYY-MM-DD"
  slot: 'midi' | 'soir';
  text: string;
  category: CategoryKey;
  checked: boolean;
}

Settings  {
  defaultStatus: 'present' | 'absent' | 'gamelle';  // défaut : 'absent'
  lockHours: number;                                  // défaut : 24
  driveFolderId: string | null;
  coursesFaitesUntil: string | null;                  // ISO date ou null
  autoArchive: boolean;
}
```

### Catégories (enum)

```typescript
type CategoryKey =
  | 'boucherie'    // Boucherie / poissonnerie / traiteur
  | 'frais'        // Produits frais / surgelés
  | 'conserves'    // Conserves / féculents
  | 'gateaux'      // Gâteaux / brioche / céréales
  | 'divers';      // Divers
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

# Tests unitaires en mode watch
npm run test:watch

# Tests E2E (Playwright)
npm run test:e2e

# Lint
npm run lint

# Format
npm run format

# Vérification TypeScript
npm run typecheck
```

---

## Règles de développement

### Conventions de code
- **TypeScript strict** activé (`strict: true` dans `tsconfig.json`)
- Pas de `any` explicite — utiliser des types précis ou `unknown`
- Composants React en **function components** uniquement
- Chaque composant dans son propre fichier `.tsx`
- Exports nommés préférés aux exports par défaut (sauf `App.tsx` et pages)

### Conventions de nommage
- Composants : `PascalCase` (`PlanningGrid.tsx`)
- Hooks : `camelCase` préfixé `use` (`usePlanning.ts`)
- Types / interfaces : `PascalCase` (`MealEntry`, `NoteItem`)
- Constantes globales : `SCREAMING_SNAKE_CASE`
- Fichiers CSS / styles : co-localisés avec leur composant si nécessaire

### Gestion des dates
- Toutes les dates sont manipulées en **ISO 8601** (`YYYY-MM-DD`) en interne
- L'affichage utilise `Intl.DateTimeFormat` avec `locale: 'fr-FR'`
- **Ne jamais stocker d'objets `Date`** dans IndexedDB ou le state global
- La semaine commence le **lundi** (standard européen)

### Verrouillage des repas
- Un repas est verrouillé si : `date < today + lockHours` OU `date <= coursesFaitesUntil`
- Les cellules verrouillées affichent le `<select>` désactivé (`disabled`) avec fond gris
- La logique de verrouillage est centralisée dans `src/lib/locking.ts`

### Offline-first
- **IndexedDB est la source de vérité** — jamais de state en mémoire seul
- Le service worker met en cache toutes les ressources statiques (Workbox `generateSW`)
- La synchronisation Drive est **non bloquante** et uniquement opportuniste (quand online)

### Google Drive
- L'archivage exporte les semaines passées au format **JSON** dans le dossier Drive configuré
- Nommage des fichiers : `planrepas-YYYY-Www.json` (ex. `planrepas-2025-W16.json`)
- La connexion OAuth utilise le scope minimal : `https://www.googleapis.com/auth/drive.file`
- En cas d'échec de sync, afficher une notification non bloquante (pas de crash)

---

## Tests

### Stratégie
- **Tests unitaires (Vitest)** : logique métier pure (dates, verrouillage, catégories, filtrage courses)
- **Tests d'intégration (Vitest + Testing Library)** : composants avec mocks IndexedDB
- **Tests E2E (Playwright)** : parcours utilisateur complets (planning → note → courses)

### Couverture cible
| Zone | Cible |
|---|---|
| `src/lib/` | ≥ 90 % |
| `src/hooks/` | ≥ 80 % |
| `src/components/` | ≥ 70 % |
| E2E (parcours critiques) | 5 scénarios clés |

### Scénarios E2E prioritaires
1. Saisie d'une présence + vérification persistance (reload)
2. Ajout d'une note avec 2 items de catégories différentes → vérification dans synthèse
3. Verrouillage automatique à J-24h
4. Activation "courses faites" → vérification blocage cellules
5. Synthèse courses : cocher un item → purger → vérification disparition

---

## CI/CD (GitHub Actions)

### `ci.yml` — déclenché sur chaque PR vers `main`
```
lint → typecheck → test (unit + integration) → build
```

### `deploy.yml` — déclenché sur merge vers `main`
```
build → deploy vers [GitHub Pages / Vercel]  ← À CONFIRMER
```

---

## Points à confirmer ⚠️

Ces décisions n'ont pas encore été tranchées dans les specs. **Choisir une option avant de démarrer le développement.**

### 1. Hébergement
- **Option A — GitHub Pages** : gratuit, simple, idéal si domaine `github.io` suffit. Contrainte : build statique uniquement (✅ compatible PWA).
- **Option B — Vercel** : déploiement automatique, aperçu par PR, domaine personnalisé gratuit.
- **Option C — Netlify** : similaire à Vercel, bonne réputation PWA.
- *Recommandation : **Vercel** pour la facilité des previews de PR.*

### 2. Gestion d'état global
- **Option A — Zustand** : léger, sans boilerplate, idéal pour un projet de cette taille.
- **Option B — React Context + useReducer** : zéro dépendance, suffisant pour 4 écrans.
- *Recommandation : **Zustand** si l'app est amenée à évoluer.*

### 3. Google OAuth — Client ID
- Un **Google Cloud project** doit être créé avec les APIs `Google Drive` et `Google Identity` activées.
- Le `CLIENT_ID` OAuth doit être fourni et stocké dans une variable d'environnement `VITE_GOOGLE_CLIENT_ID`.
- Les origines autorisées doivent inclure l'URL de production et `localhost:5173`.
- *Action requise : créer le projet GCP et fournir le Client ID.*

### 4. Domaine / URL de production
- Nécessaire pour configurer les origines OAuth Google et le manifest PWA (`start_url`).
- *À définir avant le premier déploiement.*

### 5. Partage multi-appareils
- Les specs mentionnent un Drive **partagé** : les données de planning sont-elles **partagées en temps réel** entre appareils, ou uniquement archivées ?
- Si partage temps réel souhaité → étude d'une solution complémentaire (Firebase Firestore, Supabase, ou Google Sheets comme backend).
- *Actuellement les specs décrivent uniquement un archivage (pas de sync bidirectionnelle).*

### 6. Icônes et identité visuelle
- Pas d'assets graphiques fournis dans les specs.
- *Générer des icônes PWA (192×192, 512×512, maskable) et définir la couleur de thème (`theme_color`) avant le build.*

---

## Données initiales

À la première ouverture de l'app (IndexedDB vide) :

```typescript
persons: [
  { id: 'amande', name: 'Amande', order: 0 },
  { id: 'isma',   name: 'Isma',   order: 1 },
]
settings: {
  defaultStatus: 'absent',
  lockHours: 24,
  driveFolderId: null,
  coursesFaitesUntil: null,
  autoArchive: true,
}
// Toutes les MealEntry initialisées à 'absent'
// Aucune NoteItem
```

---

## Références

- Specs fonctionnelles complètes : `PlanRepas-Maquette.md` (dans le dépôt)
- [Vite PWA Plugin](https://vite-pwa-org.netlify.app/)
- [Workbox](https://developer.chrome.com/docs/workbox/)
- [idb — IndexedDB wrapper](https://github.com/jakearchibald/idb)
- [Google Drive API v3](https://developers.google.com/drive/api/v3/reference)
- [Google Identity Services](https://developers.google.com/identity/gsi/web)
