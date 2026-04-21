import { DAYS_FR, DAYS_FR_SHORT } from '@/types';

/**
 * Retourne la date du lundi de la semaine contenant `date`.
 */
export function getMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  // getDay(): 0=dimanche → on recule de 6, sinon de (day-1)
  const diff = day === 0 ? 6 : day - 1;
  d.setDate(d.getDate() - diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Génère les 14 jours (2 semaines glissantes) à partir d'aujourd'hui.
 * Commence au lundi de la semaine en cours.
 */
export function getTwoWeeksDays(today: Date = new Date()): Date[] {
  const monday = getMonday(today);
  const days: Date[] = [];
  for (let i = 0; i < 14; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    days.push(d);
  }
  return days;
}

/**
 * Formate une date en chaîne ISO "YYYY-MM-DD".
 */
export function toDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Parse une chaîne "YYYY-MM-DD" en Date locale (minuit).
 */
export function parseDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/**
 * Nom du jour en français.
 */
export function getDayName(date: Date): string {
  return DAYS_FR[date.getDay()];
}

/**
 * Nom du jour abrégé en français.
 */
export function getDayNameShort(date: Date): string {
  return DAYS_FR_SHORT[date.getDay()];
}

/**
 * Formate une date en "Lun 15/01".
 */
export function formatDayShort(date: Date): string {
  const dayName = getDayNameShort(date);
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  return `${dayName} ${d}/${m}`;
}

/**
 * Formate une date en "Lundi 15 janvier".
 */
export function formatDayLong(date: Date): string {
  const months = [
    'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
    'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre',
  ];
  return `${getDayName(date)} ${date.getDate()} ${months[date.getMonth()]}`;
}

/**
 * Vérifie si une date est aujourd'hui.
 */
export function isToday(date: Date): boolean {
  const now = new Date();
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
}

/**
 * Vérifie si une date est dans le passé (avant aujourd'hui).
 */
export function isPast(date: Date): boolean {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d < now;
}

/**
 * Vérifie si un repas est verrouillé (dans les N heures à venir).
 * Midi = 12h, Soir = 19h.
 */
export function isMealLocked(
  date: Date,
  slot: 'midi' | 'soir',
  lockHoursBefore: number = 24
): boolean {
  const mealTime = new Date(date);
  mealTime.setHours(slot === 'midi' ? 12 : 19, 0, 0, 0);

  const now = new Date();
  const lockTime = new Date(mealTime);
  lockTime.setHours(lockTime.getHours() - lockHoursBefore);

  return now >= lockTime;
}

/**
 * Retourne le numéro de semaine ISO.
 */
export function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

/**
 * Retourne la plage de dates en chaîne ISO pour les 2 semaines glissantes.
 */
export function getTwoWeeksRange(today: Date = new Date()): {
  startDate: string;
  endDate: string;
} {
  const days = getTwoWeeksDays(today);
  return {
    startDate: toDateString(days[0]),
    endDate: toDateString(days[days.length - 1]),
  };
}
