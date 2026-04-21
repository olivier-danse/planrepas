import { useState, useEffect } from 'react';
import { supabase, rowToMealEntry } from '@/lib/supabase';
import type { MealEntry, MealStatus, MealSlot } from '@/types';
import { getTwoWeeksRange } from '@/utils/dates';

export function mealKey(date: string, slot: MealSlot, personId: string): string {
  return `${date}|${slot}|${personId}`;
}

export function useMealEntries() {
  const { startDate, endDate } = getTwoWeeksRange();
  const [entries, setEntries] = useState<MealEntry[]>([]);

  useEffect(() => {
    // Chargement initial
    supabase
      .from('meal_entries')
      .select('*')
      .gte('date', startDate)
      .lte('date', endDate)
      .then(({ data }) => {
        if (data) setEntries(data.map(rowToMealEntry));
      });

    // Subscription temps réel
    const channel = supabase
      .channel('meal_entries')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'meal_entries' },
        (payload) => {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const entry = rowToMealEntry(payload.new as never);
            setEntries((prev) => {
              const key = mealKey(entry.date, entry.slot, entry.personId);
              const idx = prev.findIndex(
                (e) => mealKey(e.date, e.slot, e.personId) === key
              );
              if (idx >= 0) {
                const updated = [...prev];
                updated[idx] = entry;
                return updated;
              }
              return [...prev, entry];
            });
          } else if (payload.eventType === 'DELETE') {
            const old = payload.old as { id: string };
            setEntries((prev) => prev.filter((e) => e.id !== (old.id as unknown as number)));
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [startDate, endDate]);

  const entriesMap = new Map<string, MealEntry>();
  for (const entry of entries) {
    entriesMap.set(mealKey(entry.date, entry.slot, entry.personId), entry);
  }

  const getStatus = (date: string, slot: MealSlot, personId: string): MealStatus =>
    entriesMap.get(mealKey(date, slot, personId))?.status ?? 'absent';

  const setStatus = async (date: string, slot: MealSlot, personId: string, status: MealStatus) => {
    await supabase.from('meal_entries').upsert(
      { date, slot, person_id: personId, status, updated_at: new Date().toISOString() },
      { onConflict: 'date,slot,person_id' }
    );
  };

  return { entries, entriesMap, getStatus, setStatus };
}
