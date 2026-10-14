# react-horoscope

Lightweight React component for daily horoscopes of all 12 zodiac signs, powered by the free [Zodiac Timeline](https://zodiactimeline.com) horoscope feed.

[Live demo](https://zodiactimeline.github.io/react-horoscope/) · [Feed documentation](https://zodiactimeline.com/horoscope-rss-feed/) · [zodiactimeline.com](https://zodiactimeline.com)

- A grid of all 12 signs (3 × 4 by default), drawn with Unicode zodiac symbols. It uses no images or icon fonts.
- A page for each sign that opens on **Today**, with **Yesterday** and **Tomorrow** one tap away, based on the visitor's local date.
- Hooks for building your own UI with no markup from the library.
- A daily score out of 10 for each sign.
- No runtime dependencies and about 6 KB gzipped (JS + CSS).
- One network request per page load, shared by every instance.
- Colourful signs or your own single colour, with card or tile layouts and rounded or square corners.
- Light theme by default, plus dark and system-following themes, with every colour and size customisable through CSS variables.
- No inline scripts, and no inline styles unless you pass a colour to `accentColor`, `buttonColor` or `signColor`, so it works with a strict Content Security Policy.
- Written in TypeScript and ships ESM and CommonJS builds.

## Install

```bash
npm install react-horoscope
```

Requires React 17 or later.

## Usage

```tsx
import { Horoscope } from 'react-horoscope';
import 'react-horoscope/styles.css';

export default function App() {
  return <Horoscope />;
}
```

It works in two views:

1. **All signs:** a grid of the 12 signs, 3 columns by 4 rows by default.
2. **Sign page:** choosing a sign replaces the grid with that sign's page. It opens on today's reading, with tabs for yesterday and tomorrow. **⇄ Change sign**, at the bottom next to the credit, returns to the grid.

Focus moves to the sign's name when a page opens and back to the sign's card when you return, so keyboard and screen reader users keep their place. If a day is not in the feed (for example a `date` outside its window), the page says so instead of showing a reading.

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `columns` | `2 \| 3 \| 4 \| 6 \| 'auto'` | `3` | Columns in the sign grid. `auto` picks 3, 4 or 6 from the available width. |
| `variant` | `'cards' \| 'tiles'` | `'cards'` | `cards` shows separate cards with a small gap. `tiles` joins the signs into one panel with hairline dividers and no gaps. |
| `buttonLayout` | `'auto' \| 'horizontal' \| 'vertical'` | `'auto'` | Layout inside each sign button. `horizontal`: symbol left, text right. `vertical`: symbol on top, text below. `auto`: horizontal when the button is wide enough, vertical when it is narrow. |
| `accentColor` | `'default' \| string` | `'default'` | Highlight colour: selected day tab, Change sign, links and focus ring. `default` is violet. |
| `buttonColor` | `'default' \| string` | `'default'` | Resting background of the sign buttons and the day tab bar. `default` is no background. |
| `signColor` | `'default' \| string` | `'default'` | Zodiac symbols, score bar and reading border. `default` gives each sign its built-in colour; any colour applies to every sign. |
| `rounded` | `boolean` | `true` | Rounded corners on cards, tabs and buttons. `false` gives square corners. |
| `theme` | `'light' \| 'dark' \| 'auto'` | `'light'` | Colour scheme. Use `dark` on dark sites. `auto` follows the visitor's operating system setting, so only use it if your whole site does the same; otherwise the component can turn dark on a light page. |
| `showScore` | `boolean` | `true` | Show the day's score out of 10. |
| `showDateRanges` | `boolean` | `true` | Show each sign's date range on the grid and the sign page. |
| `showReadMore` | `boolean` | `false` | Show a link to the full reading on Zodiac Timeline. |
| `defaultSign` | `ZodiacSign` | — | Sign page to open on first render. By default the grid is shown. |
| `sign` | `ZodiacSign \| null` | — | Controls the open sign (`null` shows the grid), for example to sync it with the URL. Leave it out to let the component manage it. |
| `onSignChange` | `(sign: ZodiacSign \| null) => void` | — | Called when the visitor opens a sign, or with `null` when they go back to the grid. |
| `onDayChange` | `(day: 'yesterday' \| 'today' \| 'tomorrow') => void` | — | Called when the visitor picks a day tab. |
| `date` | `Date \| string` | visitor's local date | Date treated as "today", as a `Date` or `YYYY-MM-DD`. |
| `className` | `string` | — | Extra class name for the root element, for your own CSS overrides. |
| `onError` | `(error: Error) => void` | — | Called when the feed cannot be loaded. |

`ZodiacSign` is one of `aries`, `taurus`, `gemini`, `cancer`, `leo`, `virgo`, `libra`, `scorpio`, `sagittarius`, `capricorn`, `aquarius` or `pisces`.

```tsx
// Compact panel with square corners and your brand colour
<Horoscope variant="tiles" rounded={false} signColor="#d9480f" />

// Responsive grid in dark mode
<Horoscope columns="auto" theme="dark" />
```

### Linking to a sign (controlled)

Pass `sign` and `onSignChange` to keep the open sign in your router, so each sign gets its own URL (useful for sharing and SEO). Any newly opened sign starts on today.

```tsx
import { Horoscope, SIGNS, type ZodiacSign } from 'react-horoscope';

// e.g. /horoscope and /horoscope/leo (React Router shown; any router works the same way)
function HoroscopePage() {
  const { sign } = useParams();
  const navigate = useNavigate();
  // Unknown values in the URL fall back to the grid.
  const current = SIGNS.find((s) => s.id === sign)?.id ?? null;

  return (
    <Horoscope
      sign={current}
      onSignChange={(next: ZodiacSign | null) => navigate(next ? `/horoscope/${next}` : '/horoscope')}
    />
  );
}
```

The same callbacks work for analytics without taking control:

```tsx
<Horoscope onSignChange={(s) => s && track('sign_open', s)} onDayChange={(d) => track('day', d)} />
```

## Styling and colours

Colour has four parts, each set by one prop:

| Prop | Colours | Default |
| --- | --- | --- |
| `theme` | Background, text and borders | `light` |
| `accentColor` | Selected day tab, Change sign, links, focus ring | violet |
| `buttonColor` | Resting background of the sign buttons and the day tab bar | none |
| `signColor` | Zodiac symbols, score bar, reading border | built-in colour per sign |

```tsx
// Brand orange highlights, soft cream buttons, one colour for every sign
<Horoscope accentColor="#d9480f" buttonColor="#fdf8f0" signColor="#d9480f" />
```

When `accentColor` or `buttonColor` is a hex code (`#rgb` or `#rrggbb`), the text on it switches to dark or light automatically so it stays readable in any theme. For example, a light button colour on the dark theme gets dark text. Other colour formats, such as `teal` or `rgb()`, work too but keep the theme's text colours. Links (Read more, Change sign's text) use `accentColor` directly on the page background, so pick one that reads well there.

For finer control, everything is also a CSS variable: set them on your own class and pass it with `className`.

```tsx
<Horoscope className="my-horoscope" />
```

```css
.my-horoscope {
  --rh-radius: 4px;
  --rh-font: 'Inter', sans-serif;
}
```

**Change the built-in colours** (with `signColor="default"`). Signs share colours in four groups: `--rh-fire` (Aries, Leo, Sagittarius), `--rh-earth` (Taurus, Virgo, Capricorn), `--rh-air` (Gemini, Libra, Aquarius) and `--rh-water` (Cancer, Scorpio, Pisces).

```css
.my-horoscope {
  --rh-fire: #e03131;
}
```

**Give a single sign its own colour:**

```css
.my-horoscope [data-sign='leo'] {
  --rh-sign: #d4a017;
}
```

| Variable | Purpose |
| --- | --- |
| `--rh-accent` | Highlight colour (set by `accentColor`): selected day tab, Change sign, links, focus ring |
| `--rh-accent-text` | Text on accent backgrounds |
| `--rh-fire`, `--rh-earth`, `--rh-air`, `--rh-water` | Built-in sign colours for symbols, the score bar and the reading's top border |
| `--rh-sign` | Resolved colour of one sign; override per sign with `[data-sign='…']`. Symbol circles and hover backgrounds use a light tint of it automatically. |
| `--rh-surface` | Reading background |
| `--rh-button` | Resting button background (set by `buttonColor`; none by default) |
| `--rh-bg` | Component background (transparent by default) |
| `--rh-text` | Main text colour |
| `--rh-muted` | Secondary text colour |
| `--rh-border` | Borders and tile dividers |
| `--rh-radius` | Corner radius (`rounded={false}` sets it to 0) |
| `--rh-gap` | Space between cards (`variant="cards"`) |
| `--rh-font` | Font family (inherits by default) |

Light and dark values are built in. If you override colours and also support dark mode, set your dark values inside your own `prefers-color-scheme: dark` rule, or on `.rh--dark` when using `theme="dark"`.

**Layout:**
- With the default `buttonLayout="auto"`, sign buttons switch between a vertical layout (symbol on top) and a horizontal one (symbol left, text right) depending on how wide each cell is, so any `columns` value fits. Set `horizontal` or `vertical` to fix one layout; text that cannot fit is truncated with an ellipsis.
- With `columns="auto"`, the grid picks 3, 4 or 6 columns from the component's own width, using CSS container queries. In that mode, inside a flex or grid layout, give the component a width (for example `flex: 1` or `width: 100%`) so it does not shrink to its content.

All elements use `rh-` class names (`rh-grid`, `rh-sign`, `rh-symbol`, `rh-detail`, `rh-days`, `rh-reading` and so on), so you can also restyle them directly.

## Hooks (no UI)

Use the hooks to build your own markup and styles. They need no stylesheet, and they share the same single feed request as the component.

### `useHoroscope(sign, options?)`

Returns one sign's reading for yesterday, today or tomorrow.

```tsx
import { useHoroscope } from 'react-horoscope';

function LeoTomorrow() {
  const { horoscope, status, retry } = useHoroscope('leo', { day: 'tomorrow' });

  if (status === 'loading') return <p>Loading…</p>;
  if (status === 'error') return <button onClick={retry}>Retry</button>;
  if (!horoscope) return <p>Not available yet.</p>;

  return (
    <div>
      <p>Score: {horoscope.score}/10</p>
      {horoscope.paragraphs.map((text, i) => (
        <p key={i}>{text}</p>
      ))}
      <p>
        Powered by <a href="https://zodiactimeline.com">Zodiac Timeline</a>
      </p>
    </div>
  );
}
```

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `day` | `'yesterday' \| 'today' \| 'tomorrow'` | `'today'` | Which day to return. |
| `date` | `Date \| string` | visitor's local date | Date treated as "today". |

The hook returns `{ horoscope, date, status, error, retry }`:
- `horoscope` is the `HoroscopeEntry`, or `undefined` while loading, on error, or when the day is not in the feed.
- `date` is the requested day as `YYYY-MM-DD`.
- `status` is `'loading'`, `'success'` or `'error'`.

Pass `undefined` as the sign when none is chosen yet.

### `useHoroscopeFeed()`

Returns the whole feed as `{ feed, status, error, retry }`, where `feed.entries` holds every sign across all five days in the feed. Use it for custom layouts such as a list of every sign's reading for today.

### Data

Each `HoroscopeEntry` has `sign`, `date` (`YYYY-MM-DD`), `title`, `link` (its page on Zodiac Timeline), `paragraphs` and `score` (out of 10).

| Export | Description |
| --- | --- |
| `Horoscope` | The ready-made component. |
| `useHoroscope(sign, options?)` | One sign and day. |
| `useHoroscopeFeed()` | The whole parsed feed. |
| `fetchHoroscopeFeed()` | Fetches and parses the feed outside React. Calls share one request per page load. |
| `parseHoroscopeFeed(xml)` | Parses feed XML with the browser's built-in `DOMParser`. |
| `SIGNS` | ID, name, element, symbol and date range of each sign, in zodiac order. |
| `FEED_URL` | `https://zodiactimeline.com/feed.xml` |

Types: `HoroscopeProps`, `UseHoroscopeOptions`, `UseHoroscopeResult`, `HoroscopeFeedState`, `HoroscopeEntry`, `HoroscopeFeed`, `HoroscopeDay`, `SignInfo`, `ZodiacElement` and `ZodiacSign`.

## About the feed

The [Zodiac Timeline horoscope feed](https://zodiactimeline.com/horoscope-rss-feed/) is free and needs no API key. It covers all 12 signs across five days (two days back, today and two days ahead) and updates daily just after midnight UTC. That window lets every visitor see yesterday, today and tomorrow in their own time zone.

## Credit

The feed is free to use with visible credit to Zodiac Timeline. The component always shows a "Powered by Zodiac Timeline" link. If you build your own UI with the hooks, show the credit yourself:

```html
<a href="https://zodiactimeline.com">Zodiac Timeline</a>
```

## Development

```bash
npm install
npm run dev        # demo app at http://localhost:5173
npm test           # unit tests
npm run typecheck
npm run build      # library output in dist/
```

## License

[MIT](LICENSE) © Zodiac Timeline
