import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { isLightColor } from './color';
import { parseISODate } from './date';
import { SIGNS } from './signs';
import type { HoroscopeDay, HoroscopeEntry, ZodiacElement, ZodiacSign } from './types';
import { useHoroscope } from './useHoroscope';

/** `'default'` or any colour code. `(string & {})` keeps `'default'` in editor autocomplete. */
type ColorOption = 'default' | (string & {});

export interface HoroscopeProps {
  /**
   * Open sign, for controlled use (e.g. synced with the URL). `null` shows the grid.
   * Leave undefined to let the component manage it.
   */
  sign?: ZodiacSign | null;
  /** Sign to open on first render when `sign` is not controlled. By default the grid is shown. */
  defaultSign?: ZodiacSign;
  /** Called when the visitor opens a sign, or `null` when they return to the grid. */
  onSignChange?: (sign: ZodiacSign | null) => void;
  /** Called when the visitor picks Yesterday, Today or Tomorrow. */
  onDayChange?: (day: HoroscopeDay) => void;
  /** Date treated as "today", as a Date or YYYY-MM-DD. Defaults to the visitor's local date. */
  date?: Date | string;
  /** Number of columns in the sign grid. `auto` uses 3, 4 or 6 depending on the available width. */
  columns?: 2 | 3 | 4 | 6 | 'auto';
  /** `cards` shows separate cards; `tiles` joins the signs into one panel with no gaps. */
  variant?: 'cards' | 'tiles';
  /**
   * Layout inside each sign button. `horizontal`: symbol left, text right. `vertical`: symbol on
   * top, text below. `auto`: horizontal when the button is wide enough, vertical when it is narrow.
   */
  buttonLayout?: 'auto' | 'horizontal' | 'vertical';
  /**
   * Highlight colour: selected day tab, Change sign, links and focus ring. `default` is the theme's
   * violet. With a hex code (e.g. `#d9480f`), text on it switches to dark or light to stay readable.
   */
  accentColor?: ColorOption;
  /**
   * Resting background of the sign buttons and the day tab bar. `default` is no background. With
   * a hex code (e.g. `#f5f3ff`), text and symbols on it switch to dark or light to stay readable.
   */
  buttonColor?: ColorOption;
  /** Zodiac symbols, score bar and reading border. `default` is each sign's built-in colour; any CSS colour applies to every sign. */
  signColor?: ColorOption;
  /** Rounded corners on cards, tabs and buttons. Set to `false` for square corners. */
  rounded?: boolean;
  /** Show the day's score out of 10. */
  showScore?: boolean;
  /** Show each sign's date range. */
  showDateRanges?: boolean;
  /** Show a link to the full reading on Zodiac Timeline. */
  showReadMore?: boolean;
  /**
   * Colour scheme. Defaults to `light`. `auto` follows the visitor's operating system setting,
   * so use it only when the whole site does the same.
   */
  theme?: 'light' | 'dark' | 'auto';
  className?: string;
  /** Called when the Horoscope API cannot be loaded. */
  onError?: (error: Error) => void;
}

const ELEMENT_LABELS: Record<ZodiacElement, string> = {
  fire: 'Fire sign',
  earth: 'Earth sign',
  air: 'Air sign',
  water: 'Water sign',
};

const DAYS: { key: HoroscopeDay; label: string }[] = [
  { key: 'yesterday', label: 'Yesterday' },
  { key: 'today', label: 'Today' },
  { key: 'tomorrow', label: 'Tomorrow' },
];

/**
 * Daily horoscopes for all 12 zodiac signs, powered by the free Zodiac Timeline Horoscope API.
 *
 * Opens on a grid of the 12 signs. Choosing a sign shows its page with Today's
 * reading and tabs for Yesterday and Tomorrow; "Change sign" at the bottom returns to the grid.
 * Import `react-horoscope/styles.css` for the default look.
 *
 * @example
 * <Horoscope columns={4} variant="tiles" rounded={false} />
 */
export function Horoscope({
  sign: signProp,
  defaultSign,
  onSignChange,
  onDayChange,
  date,
  columns = 3,
  variant = 'cards',
  buttonLayout = 'auto',
  accentColor = 'default',
  buttonColor = 'default',
  signColor = 'default',
  rounded = true,
  showScore = true,
  showDateRanges = true,
  showReadMore = false,
  theme = 'light',
  className,
  onError,
}: HoroscopeProps) {
  const isControlled = signProp !== undefined;
  const [internalSign, setInternalSign] = useState<ZodiacSign | null>(defaultSign ?? null);
  const sign = isControlled ? signProp : internalSign;

  // Every newly opened sign starts on today, whether the visitor or the parent changed it.
  const [day, setDay] = useState<HoroscopeDay>('today');
  const [daySign, setDaySign] = useState(sign);
  if (sign !== daySign) {
    setDaySign(sign);
    setDay('today');
  }

  const { horoscope, status, error, retry } = useHoroscope(sign ?? undefined, { day, date });

  // Keep the latest callback so a new function on each render does not re-report the same error.
  const onErrorRef = useRef(onError);
  useEffect(() => {
    onErrorRef.current = onError;
  });

  // Report each failure once; a failed retry produces a new error object.
  useEffect(() => {
    if (error) onErrorRef.current?.(error);
  }, [error]);

  // Move focus with the view change so keyboard and screen reader users keep their place.
  // Skipped until the visitor navigates, so the component never steals focus on page load.
  const headingRef = useRef<HTMLHeadingElement>(null);
  const gridRef = useRef<HTMLUListElement>(null);
  const lastSign = useRef(sign);
  const hasNavigated = useRef(false);

  useEffect(() => {
    if (hasNavigated.current) {
      if (sign) {
        headingRef.current?.focus();
      } else {
        gridRef.current?.querySelector<HTMLButtonElement>(`[data-sign="${lastSign.current}"]`)?.focus();
      }
    }
    if (sign) lastSign.current = sign;
  }, [sign]);

  function changeSign(next: ZodiacSign | null) {
    hasNavigated.current = true;
    if (!isControlled) setInternalSign(next);
    onSignChange?.(next);
  }

  function changeDay(next: HoroscopeDay) {
    setDay(next);
    onDayChange?.(next);
  }

  const selected = SIGNS.find((s) => s.id === sign);
  const rootClass = [
    'rh',
    `rh--${theme}`,
    signColor === 'default' && 'rh--default-colors',
    !rounded && 'rh--square',
    tone(accentColor, 'rh--light-accent', 'rh--dark-accent'),
    tone(buttonColor, 'rh--light-buttons', 'rh--dark-buttons'),
    columns === 'auto' && 'rh--responsive',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <section
      className={rootClass}
      style={customColors({
        '--rh-accent-color': accentColor,
        '--rh-button-color': buttonColor,
        '--rh-sign-color': signColor,
      })}
      aria-label="Daily horoscope"
    >
      {selected ? (
        <div className="rh-detail" data-sign={selected.id}>
          <header className="rh-detail-header">
            <span className="rh-symbol" aria-hidden="true">
              {selected.symbol}
            </span>
            <div>
              <h2 className="rh-detail-name" ref={headingRef} tabIndex={-1}>
                {selected.name}
              </h2>
              <p className="rh-detail-meta">
                {ELEMENT_LABELS[selected.element]}
                {showDateRanges && ` · ${selected.dates}`}
              </p>
            </div>
          </header>

          <div className="rh-days" role="group" aria-label="Day">
            {DAYS.map((d) => (
              <button
                key={d.key}
                type="button"
                className="rh-day"
                aria-pressed={d.key === day}
                onClick={() => changeDay(d.key)}
              >
                {d.label}
              </button>
            ))}
          </div>

          <div aria-live="polite">
            {status === 'loading' && <p className="rh-status">Loading…</p>}

            {status === 'error' && (
              <div className="rh-status" role="alert">
                <p>Horoscopes could not be loaded.</p>
                <button type="button" className="rh-retry" onClick={retry}>
                  Retry
                </button>
              </div>
            )}

            {status === 'success' &&
              (horoscope ? (
                <Reading entry={horoscope} showScore={showScore} showReadMore={showReadMore} />
              ) : (
                <p className="rh-status">This horoscope is not available yet.</p>
              ))}
          </div>
        </div>
      ) : (
        <ul className={`rh-grid rh-grid--${variant} rh-cols-${columns} rh-layout-${buttonLayout}`} ref={gridRef}>
          {SIGNS.map((s) => (
            <li key={s.id} className="rh-cell">
              <button type="button" className="rh-sign" data-sign={s.id} onClick={() => changeSign(s.id)}>
                <span className="rh-symbol" aria-hidden="true">
                  {s.symbol}
                </span>
                <span className="rh-sign-text">
                  <span className="rh-name">{s.name}</span>
                  {showDateRanges && <span className="rh-range">{s.dates}</span>}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="rh-footer">
        {selected && (
          <button type="button" className="rh-change" onClick={() => changeSign(null)}>
            <span aria-hidden="true">{'\u21C4'}</span>
            Change sign
          </button>
        )}
        {/* Attribution required by the Zodiac Timeline Horoscope API terms. */}
        <p className="rh-credit">
          Powered by{' '}
          <a href="https://zodiactimeline.com" target="_blank" rel="noopener">
            Zodiac Timeline
          </a>
        </p>
      </div>
    </section>
  );
}

/**
 * Class that tells the stylesheet whether a custom hex colour is light or dark, so text on it
 * stays readable whatever the theme. Nothing for `default` or colours that are not hex codes.
 */
function tone(color: string, lightClass: string, darkClass: string): string | undefined {
  if (color === 'default') return undefined;
  const light = isLightColor(color);
  if (light === undefined) return undefined;
  return light ? lightClass : darkClass;
}

/** Inline CSS variables for the colours that are not `default`, or undefined when all are. */
function customColors(colors: Record<string, string>): CSSProperties | undefined {
  const custom = Object.entries(colors).filter(([, value]) => value !== 'default');
  return custom.length > 0 ? (Object.fromEntries(custom) as CSSProperties) : undefined;
}

interface ReadingProps {
  entry: HoroscopeEntry;
  showScore: boolean;
  showReadMore: boolean;
}

/** The reading for one sign and day. */
function Reading({ entry, showScore, showReadMore }: ReadingProps) {
  const formattedDate = parseISODate(entry.date).toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <article className="rh-reading">
      <div className="rh-reading-meta">
        <p className="rh-date">
          <time dateTime={entry.date}>{formattedDate}</time>
        </p>
        {showScore && (
          <p className="rh-score">
            <span className="rh-score-label">Score</span>
            {/* Visual only; the text value below is what assistive technology reads. */}
            <meter className="rh-meter" min={0} max={10} value={entry.score} aria-hidden="true" />
            <span className="rh-score-value">{entry.score}/10</span>
          </p>
        )}
      </div>
      {entry.paragraphs.map((paragraph, i) => (
        <p key={i} className="rh-text">
          {paragraph}
        </p>
      ))}
      {showReadMore && (
        <a className="rh-more" href={entry.link} target="_blank" rel="noopener">
          Read more on Zodiac Timeline
        </a>
      )}
    </article>
  );
}
