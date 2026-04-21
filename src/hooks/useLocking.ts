import { useState, useEffect } from 'react';
import { supabase, rowToGroceryDoneMark } from '@/lib/supabase';
import type { MealSlot, GroceryDoneMark } from '@/types';
import { getTwoWeeksRange, parseDate, isMealLocked } from '@/utils/dates';

export function useLocking(lockHoursBefore: number = 24) {
  const { startDate, endDate } = getTwoWeeksRange();
  const [groceryDoneMarks, setGroceryDoneMarks] = useState<GroceryDoneMark[]>([]);

  useEffect(() => {
    // Chargement initial
    supabase
      .from('grocery_done_marks')
      .select('*')
      .gte('date', startDate)
      .lte('date', endDate)
      .then(({ data }) => {
        if (data) setGroceryDoneMarks(data.map(rowToGroceryDoneMark));
      });

    // Subscription temps réel
    const channel = supabase
      .channel('grocery_done_marks')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'grocery_done_marks' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setGroceryDoneMarks((prev) => [...prev, rowToGroceryDoneMark(payload.new as never)]);
          } else if (payload.eventType === 'DELETE') {
            const old = payload.old as { id: string };
            setGroceryDoneMarks((prev) => prev.filter((m) => m.id !== (old.id as unknown as number)));
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [startDate, endDate]);

  const doneSet = new Set(groceryDoneMarks.map((m) => m.date));

  const isGroceryDoneForDate = (dateStr: string): boolean => doneSet.has(dateStr);

  const isCellLocked = (dateStr: string, slot: MealSlot): boolean => {
    const date = parseDate(dateStr);
    if (isMealLocked(date, slot, lockHoursBefore)) return true;
    if (doneSet.has(dateStr)) return true;
    for (const markedDate of doneSet) {
      if (markedDate >= dateStr) return true;
    }
    return false;
  };

  const toggleDone = async (dateStr: string) => {
    const existing = groceryDoneMarks.find((m) => m.date === dateStr);
    if (existing) {
      await supabase.from('grocery_done_marks').delete().eq('date', dateStr);
    } else {
      await supabase.from('grocery_done_marks').insert({ date: dateStr, marked_at: new Date().toISOString() });
    }
  };

  return { isGroceryDoneForDate, isCellLocked, toggleDone, groceryDoneMarks };
}
