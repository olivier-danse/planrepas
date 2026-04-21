import { useLiveQuery } from 'dexie-react-hooks';
import { db, upsertMealEntry } from '@/db';
import type { MealEntry, MealStatus, MealSlot } from '@/types';
import { getTwoWeeksRange } from '@/utils/dates';

/**
 * Clé composite pour identifier une cellule du planning.
 */
export function mealKey(date: string, slot: MealSlot, personId: string): string {
  return `${date}|${slot}|${personId}`;
}

/**
 * Hook réactif qui fournit toutes les entrées de repas des 2 semaines.
 * Retourne un Map indexé par clé composite pour un accès O(1).
 */
export function useMealEntries() {
  const { startDate, endDate } = getTwoWeeksRange();

  const entries = useLiveQuery(
    () =>
      db.mealEntries
        .where('date')
        .between(startDate, endDate, true, true)
        .toArray(),
    [startDate, endDate],
    [] as MealEntry[]
  );

  // Index par clé composite pour lookup rapide
  const entriesMap = new Map<string, MealEntry>();
  for (const entry of entries ?? []) {
    const key = mealKey(entry.date, entry.slot, entry.personId);
    entriesMap.set(key, entry);
  }

  /**
   * Obtenir le statut d'une cellule (défaut: 'absent')
   */
  const getStatus = (
    date: string,
    slot: MealSlot,
    personId: string
  ): MealStatus => {
    const entry = entriesMap.get(mealKey(date, slot, personId));
    return entry?.status ?? 'absent';
  };

  /**
   * Mettre à jour le statut d'une cellule
   */
  const setStatus = async (
    date: string,
    slot: MealSlot,
    personId: string,
    status: MealStatus
  ) => {
    await upsertMealEntry(date, slot, personId, status);
  };

  return {
    entries: entries ?? [],
    entriesMap,
    getStatus,
    setStatus,
  };
}
