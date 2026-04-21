import { createClient } from '@supabase/supabase-js';
import type { Person, MealSlot, MealStatus, MealEntry, GroceryDoneMark, AppConfig } from '@/types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ─── Types des lignes Supabase (snake_case) ────────────

interface MealEntryRow {
  id: string;
  date: string;
  slot: string;
  person_id: string;
  status: string;
  updated_at: string;
}

interface GroceryDoneMarkRow {
  id: string;
  date: string;
  marked_at: string;
}

interface AppConfigRow {
  id: number;
  persons: Person[];
  lock_hours_before: number;
}

// ─── Mappers snake_case → camelCase ───────────────────

export function rowToMealEntry(row: MealEntryRow): MealEntry {
  return {
    id: row.id as unknown as number,
    date: row.date,
    slot: row.slot as MealSlot,
    personId: row.person_id,
    status: row.status as MealStatus,
    updatedAt: row.updated_at,
  };
}

export function rowToGroceryDoneMark(row: GroceryDoneMarkRow): GroceryDoneMark {
  return {
    id: row.id as unknown as number,
    date: row.date,
    markedAt: row.marked_at,
  };
}

export function rowToAppConfig(row: AppConfigRow): AppConfig {
  return {
    id: row.id,
    persons: row.persons,
    lockHoursBefore: row.lock_hours_before,
  };
}
