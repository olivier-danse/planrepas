import Dexie, { type Table } from 'dexie';
import type {
  MealEntry,
  MealNote,
  GroceryDoneMark,
  AppConfig,
} from '@/types';
import { DEFAULT_CONFIG } from '@/types';

export class MealPlannerDB extends Dexie {
  mealEntries!: Table<MealEntry, number>;
  mealNotes!: Table<MealNote, number>;
  groceryDoneMarks!: Table<GroceryDoneMark, number>;
  appConfig!: Table<AppConfig, number>;

  constructor() {
    super('MealPlannerDB');

    this.version(1).stores({
      // Index composites pour requêtes rapides
      mealEntries: '++id, [date+slot+personId], date, personId',
      mealNotes: '++id, [date+slot], date',
      groceryDoneMarks: '++id, &date',
      appConfig: 'id',
    });
  }
}

export const db = new MealPlannerDB();

// ─── Initialisation de la config par défaut ────────────
export async function ensureDefaultConfig(): Promise<AppConfig> {
  const existing = await db.appConfig.get(1);
  if (existing) return existing;

  await db.appConfig.put(DEFAULT_CONFIG);
  return DEFAULT_CONFIG;
}

// ─── Helpers CRUD pour les entrées de repas ────────────
export async function upsertMealEntry(
  date: string,
  slot: string,
  personId: string,
  status: string
): Promise<void> {
  const existing = await db.mealEntries
    .where('[date+slot+personId]')
    .equals([date, slot, personId])
    .first();

  const now = new Date().toISOString();

  if (existing?.id) {
    await db.mealEntries.update(existing.id, {
      status,
      updatedAt: now,
    });
  } else {
    await db.mealEntries.add({
      date,
      slot: slot as MealEntry['slot'],
      personId,
      status: status as MealEntry['status'],
      updatedAt: now,
    });
  }
}

export async function getMealEntriesForRange(
  startDate: string,
  endDate: string
): Promise<MealEntry[]> {
  return db.mealEntries
    .where('date')
    .between(startDate, endDate, true, true)
    .toArray();
}

export async function getNotesForRange(
  startDate: string,
  endDate: string
): Promise<MealNote[]> {
  return db.mealNotes
    .where('date')
    .between(startDate, endDate, true, true)
    .toArray();
}

export async function isGroceryDone(date: string): Promise<boolean> {
  const mark = await db.groceryDoneMarks.where('date').equals(date).first();
  return !!mark;
}

export async function toggleGroceryDone(date: string): Promise<boolean> {
  const existing = await db.groceryDoneMarks.where('date').equals(date).first();
  if (existing?.id) {
    await db.groceryDoneMarks.delete(existing.id);
    return false;
  } else {
    await db.groceryDoneMarks.add({
      date,
      markedAt: new Date().toISOString(),
    });
    return true;
  }
}
