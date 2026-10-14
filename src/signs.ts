import type { SignInfo } from './types';

/**
 * The 12 zodiac signs in traditional order.
 *
 * Symbols are followed by U+FE0E (text presentation selector) so they render
 * as plain, stylable text glyphs instead of colour emoji.
 */
export const SIGNS: readonly SignInfo[] = [
  { id: 'aries', element: 'fire', name: 'Aries', symbol: '\u2648\uFE0E', dates: 'Mar 21 – Apr 19' },
  { id: 'taurus', element: 'earth', name: 'Taurus', symbol: '\u2649\uFE0E', dates: 'Apr 20 – May 20' },
  { id: 'gemini', element: 'air', name: 'Gemini', symbol: '\u264A\uFE0E', dates: 'May 21 – Jun 20' },
  { id: 'cancer', element: 'water', name: 'Cancer', symbol: '\u264B\uFE0E', dates: 'Jun 21 – Jul 22' },
  { id: 'leo', element: 'fire', name: 'Leo', symbol: '\u264C\uFE0E', dates: 'Jul 23 – Aug 22' },
  { id: 'virgo', element: 'earth', name: 'Virgo', symbol: '\u264D\uFE0E', dates: 'Aug 23 – Sep 22' },
  { id: 'libra', element: 'air', name: 'Libra', symbol: '\u264E\uFE0E', dates: 'Sep 23 – Oct 22' },
  { id: 'scorpio', element: 'water', name: 'Scorpio', symbol: '\u264F\uFE0E', dates: 'Oct 23 – Nov 21' },
  { id: 'sagittarius', element: 'fire', name: 'Sagittarius', symbol: '\u2650\uFE0E', dates: 'Nov 22 – Dec 21' },
  { id: 'capricorn', element: 'earth', name: 'Capricorn', symbol: '\u2651\uFE0E', dates: 'Dec 22 – Jan 19' },
  { id: 'aquarius', element: 'air', name: 'Aquarius', symbol: '\u2652\uFE0E', dates: 'Jan 20 – Feb 18' },
  { id: 'pisces', element: 'water', name: 'Pisces', symbol: '\u2653\uFE0E', dates: 'Feb 19 – Mar 20' },
];
