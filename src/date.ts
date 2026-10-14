import type { HoroscopeDay } from './types';

/** Offset in days from "today" for each day option. */
const DAY_OFFSETS: Record<HoroscopeDay, number> = {
  yesterday: -1,
  today: 0,
  tomorrow: 1,
};

/** Formats a date as YYYY-MM-DD using local time (not UTC). */
export function toISODate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

/** Parses YYYY-MM-DD as a local-time date. */
export function parseISODate(iso: string): Date {
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Returns the YYYY-MM-DD date for a day option.
 *
 * @param day - Which day relative to today.
 * @param today - Date treated as today, as a Date or YYYY-MM-DD. Defaults to the local date.
 */
export function resolveDate(day: HoroscopeDay, today: Date | string = new Date()): string {
  const date = typeof today === 'string' ? parseISODate(today) : new Date(today);
  date.setDate(date.getDate() + DAY_OFFSETS[day]);
  return toISODate(date);
}
