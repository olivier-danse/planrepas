import { useLiveQuery } from 'dexie-react-hooks';
import { db, toggleGroceryDone } from '@/db';
import type { MealSlot } from '@/types';
import {
  getTwoWeeksRange,
  parseDate,
  isMealLocked,
} from '@/utils/dates';

/**
 * Hook réactif pour les marqueurs "courses faites" et le verrouillage.
 *
 * Règles de verrouillage :
 * 1. Par défaut, un repas est verrouillé 24h avant l'heure du repas
 * 2. Si "courses faites" est coché pour un jour, ce jour et tous les jours
 *    précédents sont verrouillés (on ne peut plus modifier)
 * 3. Les jours passés sont toujours verrouillés
 */
export function useLocking(lockHoursBefore: number = 24) {
  const { startDate, endDate } = getTwoWeeksRange();

  const groceryDoneMarks = useLiveQuery(
    () =>
      db.groceryDoneMarks
        .where('date')
        .between(startDate, endDate, true, true)
        .toArray(),
    [startDate, endDate],
    []
  );

  // Set des dates marquées "courses faites"
  const doneSet = new Set(
    (groceryDoneMarks ?? []).map((m) => m.date)
  );

  /**
   * Vérifie si les courses sont faites pour un jour donné.
   */
  const isGroceryDoneForDate = (dateStr: string): boolean => {
    return doneSet.has(dateStr);
  };

  /**
   * Détermine si une cellule est verrouillée.
   * Combine : verrouillage temporel + courses faites + jours passés
   */
  const isCellLocked = (dateStr: string, slot: MealSlot): boolean => {
    const date = parseDate(dateStr);

    // Verrouillage temporel (24h avant par défaut)
    if (isMealLocked(date, slot, lockHoursBefore)) {
      return true;
    }

    // Courses faites pour ce jour → verrouillé
    if (doneSet.has(dateStr)) {
      return true;
    }

    // Si un jour APRÈS celui-ci a "courses faites",
    // alors ce jour-ci est aussi verrouillé (les courses couvrent ce jour)
    // On vérifie si un marqueur existe pour une date >= dateStr
    for (const markedDate of doneSet) {
      if (markedDate >= dateStr) {
        return true;
      }
    }

    return false;
  };

  /**
   * Toggle le marqueur "courses faites" pour un jour.
   */
  const toggleDone = async (dateStr: string) => {
    await toggleGroceryDone(dateStr);
  };

  return {
    isGroceryDoneForDate,
    isCellLocked,
    toggleDone,
    groceryDoneMarks: groceryDoneMarks ?? [],
  };
}
