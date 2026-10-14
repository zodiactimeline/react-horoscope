import { SIGNS } from './signs';
import type { HoroscopeApiResponse, HoroscopeEntry, ZodiacSign } from './types';

/** Zodiac Timeline Horoscope API endpoint (RSS 2.0 XML, updated daily). */
export const HOROSCOPE_API_URL = 'https://zodiactimeline.com/feed.xml';

/** XML namespace of the response's custom `zt:` elements. */
const ZT_NS = 'https://zodiactimeline.com/feed';

/** Narrows a response value to one of the 12 sign ids. */
function isZodiacSign(value: string): value is ZodiacSign {
  return SIGNS.some((sign) => sign.id === value);
}

/** Trimmed text of the first matching descendant, or an empty string. */
function childText(parent: Element, tag: string, namespace?: string): string {
  const el = namespace
    ? parent.getElementsByTagNameNS(namespace, tag)[0]
    : parent.getElementsByTagName(tag)[0];
  return el?.textContent?.trim() ?? '';
}

/**
 * Parses a Zodiac Timeline Horoscope API response with the browser's built-in DOMParser.
 *
 * Runs in the browser only (DOMParser is not available in Node without a DOM).
 *
 * @param xml - Raw response XML.
 * @throws If the input is not well-formed XML.
 */
export function parseHoroscopeApiResponse(xml: string): HoroscopeApiResponse {
  const doc = new DOMParser().parseFromString(xml, 'application/xml');
  if (doc.getElementsByTagName('parsererror').length > 0) {
    throw new Error('Horoscope API response is not valid XML');
  }

  const entries: HoroscopeEntry[] = [];
  for (const item of Array.from(doc.getElementsByTagName('item'))) {
    const sign = childText(item, 'sign', ZT_NS);
    // Skip anything that is not one of the 12 signs.
    if (!isZodiacSign(sign)) continue;

    entries.push({
      sign,
      date: childText(item, 'date', ZT_NS),
      title: childText(item, 'title'),
      link: childText(item, 'link'),
      paragraphs: childText(item, 'description')
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean),
      score: Number(childText(item, 'score', ZT_NS)),
    });
  }

  return { updated: childText(doc.documentElement, 'lastBuildDate'), entries };
}

/** Shared in-flight or completed request for the current page load. */
let request: Promise<HoroscopeApiResponse> | undefined;

/**
 * Fetches the Horoscope API once per page load. Every caller shares the same request;
 * a failed request is discarded so the next call tries again.
 */
export function fetchHoroscopeApi(): Promise<HoroscopeApiResponse> {
  if (!request) {
    request = fetch(HOROSCOPE_API_URL)
      .then((res) => {
        if (!res.ok) throw new Error(`Horoscope API request failed (${res.status})`);
        return res.text();
      })
      .then(parseHoroscopeApiResponse);
    request.catch(() => {
      request = undefined;
    });
  }
  return request;
}
