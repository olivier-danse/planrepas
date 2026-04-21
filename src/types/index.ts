// ─── Statuts de présence ───────────────────────────────
export type MealStatus = 'absent' | 'present' | 'gamelle';

// ─── Créneaux repas ────────────────────────────────────
export type MealSlot = 'midi' | 'soir';

// ─── Catégories de courses ─────────────────────────────
export type GroceryCategory =
  | 'boucherie-poissonnerie-traiteur'
  | 'produits-frais-surgeles'
  | 'conserves-feculents'
  | 'gateaux-brioche-cereales'
  | 'divers';

export const GROCERY_CATEGORIES: Record<GroceryCategory, string> = {
  'boucherie-poissonnerie-traiteur': 'Boucherie / Poissonnerie / Traiteur',
  'produits-frais-surgeles': 'Produits frais / Surgelés',
  'conserves-feculents': 'Conserves / Féculents',
  'gateaux-brioche-cereales': 'Gâteaux / Brioche / Céréales',
  'divers': 'Divers',
};

// ─── Personnes ─────────────────────────────────────────
export interface Person {
  id: string;
  name: string;
  color: string; // couleur associée pour la grille
  order: number;
}

// ─── Entrée de repas (1 cellule de la grille) ──────────
export interface MealEntry {
  id?: number; // auto-increment IndexedDB
  date: string; // format ISO "2025-01-15"
  slot: MealSlot;
  personId: string;
  status: MealStatus;
  updatedAt: string; // ISO datetime
}

// ─── Note associée à un repas ──────────────────────────
export interface MealNote {
  id?: number;
  date: string;
  slot: MealSlot;
  text: string;
  items: GroceryItem[];
  createdAt: string;
  updatedAt: string;
}

// ─── Article de courses ────────────────────────────────
export interface GroceryItem {
  id: string;
  label: string;
  category: GroceryCategory;
  checked: boolean;
}

// ─── Marqueur "courses faites" par jour ────────────────
export interface GroceryDoneMark {
  id?: number;
  date: string; // le jour marqué
  markedAt: string; // quand le marqueur a été posé
}

// ─── Configuration de l'application ────────────────────
export interface AppConfig {
  id: number; // toujours 1 (singleton)
  persons: Person[];
  lockHoursBefore: number; // heures avant le repas pour verrouiller (défaut: 24)
  googleDriveFolderId?: string;
  lastSyncAt?: string;
}

// ─── Constantes par défaut ─────────────────────────────
export const DEFAULT_PERSONS: Person[] = [
  { id: 'amande', name: 'Amande', color: '#e07a5f', order: 0 },
  { id: 'isma', name: 'Isma', color: '#3d5a80', order: 1 },
];

export const DEFAULT_CONFIG: AppConfig = {
  id: 1,
  persons: DEFAULT_PERSONS,
  lockHoursBefore: 24,
};

export const MEAL_STATUS_LABELS: Record<MealStatus, string> = {
  absent: 'Absent',
  present: 'Présent',
  gamelle: 'Gamelle',
};

export const MEAL_STATUS_ICONS: Record<MealStatus, string> = {
  absent: '✕',
  present: '✓',
  gamelle: '◉',
};

export const SLOT_LABELS: Record<MealSlot, string> = {
  midi: 'Midi',
  soir: 'Soir',
};

export const DAYS_FR = [
  'Dimanche', 'Lundi', 'Mardi', 'Mercredi',
  'Jeudi', 'Vendredi', 'Samedi',
] as const;

export const DAYS_FR_SHORT = [
  'Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam',
] as const;
