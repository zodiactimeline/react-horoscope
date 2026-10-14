import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { cleanup, fireEvent, render, renderHook, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { Horoscope, useHoroscope } from '../src';

const xml = readFileSync(join(import.meta.dirname, 'horoscope-api.xml'), 'utf8');
const fetchMock = vi.fn().mockResolvedValue({ ok: true, text: async () => xml });

// The fixture covers 2026-10-12 to 2026-10-16, so "today" is pinned to its middle day.
const TODAY = '2026-10-14';

beforeAll(() => {
  vi.stubGlobal('fetch', fetchMock);
});

afterEach(cleanup);

describe('Horoscope', () => {
  it('starts with a 3-column grid of the 12 signs and the credit', () => {
    render(<Horoscope date={TODAY} />);

    expect(screen.getAllByRole('listitem')).toHaveLength(12);
    expect(screen.getByRole('list').className).toBe('rh-grid rh-grid--cards rh-cols-3 rh-layout-auto');
    expect(screen.getByRole('link', { name: 'Zodiac Timeline' })).toHaveProperty(
      'href',
      'https://zodiactimeline.com/',
    );
  });

  it('applies the layout and style props as classes', () => {
    const { container } = render(
      <Horoscope
        date={TODAY}
        columns="auto"
        variant="tiles"
        buttonLayout="vertical"
        accentColor="#fde047"
        buttonColor="#f5f3ff"
        signColor="#d9480f"
        rounded={false}
        theme="dark"
      />,
    );
    const root = container.firstElementChild as HTMLElement;

    expect(screen.getByRole('list').className).toBe('rh-grid rh-grid--tiles rh-cols-auto rh-layout-vertical');
    // Light accent and light buttons on a dark theme: both get dark text.
    expect(root.className).toBe('rh rh--dark rh--square rh--light-accent rh--light-buttons rh--responsive');
    expect(root.style.getPropertyValue('--rh-accent-color')).toBe('#fde047');
    expect(root.style.getPropertyValue('--rh-sign-color')).toBe('#d9480f');
    expect(root.style.getPropertyValue('--rh-button-color')).toBe('#f5f3ff');
  });

  it('uses the default sign colours without inline styles', () => {
    const { container } = render(<Horoscope date={TODAY} />);

    const root = container.firstElementChild as HTMLElement;

    expect(root.className).toBe('rh rh--light rh--default-colors');
    expect(root.getAttribute('style')).toBeNull();
  });

  it('opens a sign on today, switches days and returns to the grid', async () => {
    render(<Horoscope date={TODAY} />);

    fireEvent.click(screen.getByRole('button', { name: /Leo/ }));
    expect(screen.queryByRole('list')).toBeNull();
    expect(screen.getByRole('heading', { name: 'Leo' })).toBe(document.activeElement);
    expect(screen.getByRole('button', { name: 'Today' }).getAttribute('aria-pressed')).toBe('true');

    await screen.findByRole('article');
    expect(document.querySelector('time')?.getAttribute('datetime')).toBe('2026-10-14');
    expect(screen.getByText(/\/10$/)).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Yesterday' }));
    expect(document.querySelector('time')?.getAttribute('datetime')).toBe('2026-10-13');

    fireEvent.click(screen.getByRole('button', { name: 'Tomorrow' }));
    expect(document.querySelector('time')?.getAttribute('datetime')).toBe('2026-10-15');

    fireEvent.click(screen.getByRole('button', { name: 'Change sign' }));
    expect(screen.getAllByRole('listitem')).toHaveLength(12);
    expect(screen.getByRole('button', { name: /Leo/ })).toBe(document.activeElement);

    // Opening another sign starts on today again.
    fireEvent.click(screen.getByRole('button', { name: /Virgo/ }));
    expect(screen.getByRole('button', { name: 'Today' }).getAttribute('aria-pressed')).toBe('true');
  });

  it('reports sign and day changes', () => {
    const onSignChange = vi.fn();
    const onDayChange = vi.fn();
    render(<Horoscope date={TODAY} onSignChange={onSignChange} onDayChange={onDayChange} />);

    fireEvent.click(screen.getByRole('button', { name: /Leo/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Tomorrow' }));
    fireEvent.click(screen.getByRole('button', { name: 'Change sign' }));

    expect(onSignChange.mock.calls).toEqual([['leo'], [null]]);
    expect(onDayChange.mock.calls).toEqual([['tomorrow']]);
  });

  it('follows the sign prop when controlled', () => {
    const onSignChange = vi.fn();
    const { rerender } = render(<Horoscope date={TODAY} sign="leo" onSignChange={onSignChange} />);
    expect(screen.getByRole('heading', { name: 'Leo' })).toBeTruthy();

    // The parent decides: clicking "Change sign" only reports the change.
    fireEvent.click(screen.getByRole('button', { name: 'Change sign' }));
    expect(onSignChange).toHaveBeenCalledWith(null);
    expect(screen.getByRole('heading', { name: 'Leo' })).toBeTruthy();

    // A new sign from the parent opens on today.
    fireEvent.click(screen.getByRole('button', { name: 'Tomorrow' }));
    rerender(<Horoscope date={TODAY} sign="virgo" onSignChange={onSignChange} />);
    expect(screen.getByRole('heading', { name: 'Virgo' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Today' }).getAttribute('aria-pressed')).toBe('true');

    rerender(<Horoscope date={TODAY} sign={null} onSignChange={onSignChange} />);
    expect(screen.getAllByRole('listitem')).toHaveLength(12);
  });

  it('shares one request across components and day changes', async () => {
    // Load a fresh copy of the library so its request cache starts empty.
    vi.resetModules();
    fetchMock.mockClear();
    const { Horoscope: FreshHoroscope } = await import('../src');

    render(
      <>
        <FreshHoroscope date={TODAY} defaultSign="leo" />
        <FreshHoroscope date={TODAY} defaultSign="virgo" />
      </>,
    );
    await screen.findAllByRole('article');
    fireEvent.click(screen.getAllByRole('button', { name: 'Tomorrow' })[0]);
    fireEvent.click(screen.getAllByRole('button', { name: 'Yesterday' })[1]);

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('reports a failed load once and recovers on retry', async () => {
    vi.resetModules();
    fetchMock.mockResolvedValueOnce({ ok: false, status: 503 });
    const { Horoscope: FreshHoroscope } = await import('../src');
    const onError = vi.fn();

    const { rerender } = render(<FreshHoroscope date={TODAY} defaultSign="leo" onError={onError} />);
    await screen.findByRole('alert');
    // A new callback on re-render must not report the same error again.
    rerender(<FreshHoroscope date={TODAY} defaultSign="leo" onError={(e) => onError(e)} />);
    expect(onError).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(await screen.findByRole('article')).toBeTruthy();
  });

  it('says when a day is outside the API window', async () => {
    render(<Horoscope date="2030-01-01" defaultSign="leo" />);

    expect(await screen.findByText('This horoscope is not available yet.')).toBeTruthy();
  });

  it('respects the display props', async () => {
    render(<Horoscope date={TODAY} defaultSign="aries" showScore={false} showDateRanges={false} showReadMore />);

    expect(await screen.findByRole('link', { name: 'Read more on Zodiac Timeline' })).toHaveProperty(
      'href',
      'https://zodiactimeline.com/aries/2026-10-14/',
    );
    expect(screen.queryByText(/\/10$/)).toBeNull();
    expect(screen.queryByText('Mar 21 – Apr 19')).toBeNull();
  });
});

describe('useHoroscope', () => {
  it('returns one sign and day without any UI', async () => {
    const { result } = renderHook(() => useHoroscope('leo', { day: 'tomorrow', date: TODAY }));

    expect(result.current.date).toBe('2026-10-15');
    await waitFor(() => expect(result.current.status).toBe('success'));
    expect(result.current.horoscope?.sign).toBe('leo');
    expect(result.current.horoscope?.date).toBe('2026-10-15');
  });

  it('shares one request with the component on the same page', async () => {
    vi.resetModules();
    fetchMock.mockClear();
    const lib = await import('../src');

    function LeoScore() {
      const { horoscope } = lib.useHoroscope('leo', { date: TODAY });
      return <p>Leo score {horoscope?.score}</p>;
    }

    render(
      <>
        <lib.Horoscope date={TODAY} defaultSign="virgo" />
        <LeoScore />
      </>,
    );
    await screen.findByRole('article');
    await screen.findByText(/^Leo score \d/);

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('defaults to today', () => {
    const { result } = renderHook(() => useHoroscope('leo', { date: TODAY }));

    expect(result.current.date).toBe(TODAY);
  });
});
