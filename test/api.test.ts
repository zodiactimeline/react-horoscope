import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const xml = readFileSync(join(import.meta.dirname, 'horoscope-api.xml'), 'utf8');

describe('parseHoroscopeApiResponse', () => {
  it('reads every item with its Zodiac Timeline fields', async () => {
    const { parseHoroscopeApiResponse } = await import('../src/api');
    const data = parseHoroscopeApiResponse(xml);

    expect(data.entries).toHaveLength(60);
    expect(new Set(data.entries.map((e) => e.sign)).size).toBe(12);
    expect(data.updated).toMatch(/2026/);

    const entry = data.entries[0];
    expect(entry.sign).toBe('aries');
    expect(entry.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(entry.link).toContain('https://zodiactimeline.com/aries/');
    expect(entry.paragraphs.length).toBeGreaterThan(1);
    expect(entry.score).toBeGreaterThanOrEqual(0);
    expect(entry.score).toBeLessThanOrEqual(10);
  });

  it('rejects invalid XML', async () => {
    const { parseHoroscopeApiResponse } = await import('../src/api');
    expect(() => parseHoroscopeApiResponse('<rss><channel>')).toThrow();
  });
});

describe('fetchHoroscopeApi', () => {
  beforeEach(() => {
    // Fresh module per test so each starts with an empty request cache.
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('requests the Horoscope API only once', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, text: async () => xml });
    vi.stubGlobal('fetch', fetchMock);
    const { fetchHoroscopeApi } = await import('../src/api');

    const [a, b] = await Promise.all([fetchHoroscopeApi(), fetchHoroscopeApi()]);
    await fetchHoroscopeApi();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(a).toBe(b);
  });

  it('tries again after a failed request', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: false, status: 503 })
      .mockResolvedValueOnce({ ok: true, text: async () => xml });
    vi.stubGlobal('fetch', fetchMock);
    const { fetchHoroscopeApi } = await import('../src/api');

    await expect(fetchHoroscopeApi()).rejects.toThrow('503');
    await expect(fetchHoroscopeApi()).resolves.toHaveProperty('entries');
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
