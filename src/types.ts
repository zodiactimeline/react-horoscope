/** Lowercase sign identifier, matching the feed's `zt:sign` value. */
export type ZodiacSign =
  | 'aries'
  | 'taurus'
  | 'gemini'
  | 'cancer'
  | 'leo'
  | 'virgo'
  | 'libra'
  | 'scorpio'
  | 'sagittarius'
  | 'capricorn'
  | 'aquarius'
  | 'pisces';

/** Day to show, relative to the visitor's "today". */
export type HoroscopeDay = 'yesterday' | 'today' | 'tomorrow';

/** Classical element of a sign, used for its colour. */
export type ZodiacElement = 'fire' | 'earth' | 'air' | 'water';

/** Display details for one zodiac sign. */
export interface SignInfo {
  id: ZodiacSign;
  element: ZodiacElement;
  /** Display name, e.g. "Aries". */
  name: string;
  /** Unicode zodiac symbol in text presentation. */
  symbol: string;
  /** Approximate sun-sign date range, e.g. "Mar 21 – Apr 19". */
  dates: string;
}

/** One daily reading for one sign, taken from a feed `<item>`. */
export interface HoroscopeEntry {
  sign: ZodiacSign;
  /** Calendar date in YYYY-MM-DD format. */
  date: string;
  /** Item title, e.g. "Leo · October 13, 2026". */
  title: string;
  /** Page for this sign and day on Zodiac Timeline. */
  link: string;
  /** The reading split into paragraphs. */
  paragraphs: string[];
  /** Overall score out of 10. */
  score: number;
}

/** Parsed feed: all 12 signs across the feed's five-day window. */
export interface HoroscopeFeed {
  /** The feed's `lastBuildDate` (RFC 822 date string). */
  updated: string;
  entries: HoroscopeEntry[];
}
