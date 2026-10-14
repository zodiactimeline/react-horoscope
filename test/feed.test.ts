import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const xml = readFileSync(join(import.meta.dirname, 'feed.xml'), 'utf8');

describe('parseHoroscopeFeed', () => {
  it('reads every item with its Zodiac Timeline fields', async () => {
    const { parseHoroscopeFeed } = await import('../src/feed');
    const feed = parseHoroscopeFeed(xml);

    expect(feed.entries).toHaveLength(60);
    expect(new Set(feed.entries.map((e) => e.sign)).size).toBe(12);
    expect(feed.updated).toMatch(/2026/);

    const entry = feed.entries[0];
    expect(entry.sign).toBe('aries');
    expect(entry.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(entry.link).toContain('https://zodiactimeline.com/aries/');
    expect(entry.paragraphs.length).toBeGreaterThan(1);
    expect(entry.score).toBeGreaterThanOrEqual(0);
    expect(entry.score).toBeLessThanOrEqual(10);
  });

  it('rejects invalid XML', async () => {
    const { parseHoroscopeFeed } = await import('../src/feed');
    expect(() => parseHoroscopeFeed('<rss><channel>')).toThrow();
  });
});

describe('fetchHoroscopeFeed', () => {
  beforeEach(() => {
    // Fresh module per test so each starts with an empty request cache.
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('requests the feed only once', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, text: async () => xml });
    vi.stubGlobal('fetch', fetchMock);
    const { fetchHoroscopeFeed } = await import('../src/feed');

    const [a, b] = await Promise.all([fetchHoroscopeFeed(), fetchHoroscopeFeed()]);
    await fetchHoroscopeFeed();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(a).toBe(b);
  });

  it('tries again after a failed request', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: false, status: 503 })
      .mockResolvedValueOnce({ ok: true, text: async () => xml });
    vi.stubGlobal('fetch', fetchMock);
    const { fetchHoroscopeFeed } = await import('../src/feed');

    await expect(fetchHoroscopeFeed()).rejects.toThrow('503');
    await expect(fetchHoroscopeFeed()).resolves.toHaveProperty('entries');
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
