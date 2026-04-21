import { useMemo } from 'react';
import {
  getTwoWeeksDays,
  toDateString,
  getWeekNumber,
  formatDayShort,
  isToday,
  isPast,
} from '@/utils/dates';

export interface DayInfo {
  date: Date;
  dateStr: string;
  label: string; // "Lun 14/04"
  weekNumber: number;
  isToday: boolean;
  isPast: boolean;
  isWeekend: boolean;
  dayOfWeek: number; // 0=dimanche...6=samedi
}

export interface WeekGroup {
  weekNumber: number;
  label: string; // "Sem. 16"
  days: DayInfo[];
}

/**
 * Hook qui génère la structure des 2 semaines glissantes.
 * Recalcule uniquement quand la date du jour change.
 */
export function useWeeks(): {
  days: DayInfo[];
  weeks: WeekGroup[];
} {
  const todayStr = toDateString(new Date());

  return useMemo(() => {
    const rawDays = getTwoWeeksDays();

    const days: DayInfo[] = rawDays.map((date) => {
      const dow = date.getDay();
      return {
        date,
        dateStr: toDateString(date),
        label: formatDayShort(date),
        weekNumber: getWeekNumber(date),
        isToday: isToday(date),
        isPast: isPast(date),
        isWeekend: dow === 0 || dow === 6,
        dayOfWeek: dow,
      };
    });

    // Regrouper par semaine
    const weekMap = new Map<number, DayInfo[]>();
    for (const day of days) {
      if (!weekMap.has(day.weekNumber)) {
        weekMap.set(day.weekNumber, []);
      }
      weekMap.get(day.weekNumber)!.push(day);
    }

    const weeks: WeekGroup[] = Array.from(weekMap.entries()).map(
      ([weekNumber, weekDays]) => ({
        weekNumber,
        label: `Sem. ${weekNumber}`,
        days: weekDays,
      })
    );

    return { days, weeks };
  }, [todayStr]);
}
