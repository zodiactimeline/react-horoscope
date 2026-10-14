import { resolveDate } from './date';
import type { HoroscopeDay, HoroscopeEntry, ZodiacSign } from './types';
import { useHoroscopeFeed, type HoroscopeFeedState } from './useHoroscopeFeed';

export interface UseHoroscopeOptions {
  /** Which day to return. Defaults to `today`. */
  day?: HoroscopeDay;
  /** Date treated as "today", as a Date or YYYY-MM-DD. Defaults to the visitor's local date. */
  date?: Date | string;
}

export interface UseHoroscopeResult extends Omit<HoroscopeFeedState, 'feed'> {
  /** The reading, once loaded. Undefined while loading, on error, or if the day is not in the feed. */
  horoscope?: HoroscopeEntry;
  /** The requested day as YYYY-MM-DD. */
  date: string;
}

/**
 * Returns one sign's horoscope for yesterday, today or tomorrow, without any UI.
 *
 * Shares the single cached feed request with every other hook and component on the page.
 *
 * @param sign - Sign to read. Pass `undefined` when no sign is chosen yet.
 *
 * @example
 * const { horoscope, status } = useHoroscope('leo', { day: 'tomorrow' });
 */
export function useHoroscope(sign: ZodiacSign | undefined, options: UseHoroscopeOptions = {}): UseHoroscopeResult {
  const { feed, ...state } = useHoroscopeFeed();
  const date = resolveDate(options.day ?? 'today', options.date);
  const horoscope = feed?.entries.find((entry) => entry.sign === sign && entry.date === date);

  return { ...state, horoscope, date };
}
