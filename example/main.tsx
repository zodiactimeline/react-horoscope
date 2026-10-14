import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Horoscope, type HoroscopeProps } from 'react-horoscope';
import 'react-horoscope/styles.css';
import './app.css';

type Theme = NonNullable<HoroscopeProps['theme']>;
type Columns = NonNullable<HoroscopeProps['columns']>;
type Variant = NonNullable<HoroscopeProps['variant']>;
type ButtonLayout = NonNullable<HoroscopeProps['buttonLayout']>;

const COLUMN_OPTIONS: Columns[] = [2, 3, 4, 6, 'auto'];

const BUTTON_COLOR_OPTIONS = [
  { label: 'default', value: 'default' },
  { label: '#ffffff (white)', value: '#ffffff' },
  { label: '#f8fafc (snow)', value: '#f8fafc' },
  { label: '#f5f5f4 (stone)', value: '#f5f5f4' },
  { label: '#fdf8f0 (cream)', value: '#fdf8f0' },
  { label: '#f5f3ff (lavender)', value: '#f5f3ff' },
  { label: '#eff6ff (ice blue)', value: '#eff6ff' },
  { label: '#ecfdf5 (mint)', value: '#ecfdf5' },
  { label: '#fff7ed (peach)', value: '#fff7ed' },
  { label: '#fdf2f8 (blush)', value: '#fdf2f8' },
  { label: '#1e1b2e (midnight)', value: '#1e1b2e' },
  { label: '#1e293b (navy)', value: '#1e293b' },
  { label: '#18181b (charcoal)', value: '#18181b' },
];

const COLOR_OPTIONS = [
  { label: 'default', value: 'default' },
  { label: '#6a48f0 (violet)', value: '#6a48f0' },
  { label: '#4f46e5 (indigo)', value: '#4f46e5' },
  { label: '#2563eb (blue)', value: '#2563eb' },
  { label: '#0284c7 (sky)', value: '#0284c7' },
  { label: '#0d9488 (teal)', value: '#0d9488' },
  { label: '#16a34a (green)', value: '#16a34a' },
  { label: '#65a30d (olive)', value: '#65a30d' },
  { label: '#d97706 (amber)', value: '#d97706' },
  { label: '#ea580c (orange)', value: '#ea580c' },
  { label: '#dc2626 (red)', value: '#dc2626' },
  { label: '#db2777 (pink)', value: '#db2777' },
  { label: '#475569 (slate)', value: '#475569' },
];

function App() {
  const [theme, setTheme] = useState<Theme>('light');
  const [columns, setColumns] = useState<Columns>(3);
  const [variant, setVariant] = useState<Variant>('cards');
  const [buttonLayout, setButtonLayout] = useState<ButtonLayout>('auto');
  const [accentColor, setAccentColor] = useState('default');
  const [buttonColor, setButtonColor] = useState('default');
  const [signColor, setSignColor] = useState('default');
  const [rounded, setRounded] = useState(true);
  const [showScore, setShowScore] = useState(true);
  const [showDateRanges, setShowDateRanges] = useState(true);
  const [showReadMore, setShowReadMore] = useState(false);

  return (
    <main className={`demo demo--${theme}`}>
      <header className="demo-header">
        <h1>react-horoscope</h1>
        <p>
          Daily horoscopes for all 12 zodiac signs, powered by the free{' '}
          <a href="https://zodiactimeline.com/horoscope-api/" target="_blank" rel="noopener">Zodiac Timeline Horoscope API</a>.
        </p>
        <pre className="demo-code">
          <code>npm install react-horoscope</code>
        </pre>
      </header>

      <fieldset className="demo-options">
        <legend>Props</legend>
        <label>
          theme{' '}
          <select value={theme} onChange={(e) => setTheme(e.target.value as Theme)}>
            <option value="light">light</option>
            <option value="dark">dark</option>
            <option value="auto">auto</option>
          </select>
        </label>
        <label>
          columns{' '}
          <select
            value={columns}
            onChange={(e) => setColumns(e.target.value === 'auto' ? 'auto' : (Number(e.target.value) as Columns))}
          >
            {COLUMN_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
        <label>
          variant{' '}
          <select value={variant} onChange={(e) => setVariant(e.target.value as Variant)}>
            <option value="cards">cards</option>
            <option value="tiles">tiles</option>
          </select>
        </label>
        <label>
          buttonLayout{' '}
          <select value={buttonLayout} onChange={(e) => setButtonLayout(e.target.value as ButtonLayout)}>
            <option value="auto">auto</option>
            <option value="horizontal">horizontal</option>
            <option value="vertical">vertical</option>
          </select>
        </label>
        <label>
          accentColor{' '}
          <select value={accentColor} onChange={(e) => setAccentColor(e.target.value)}>
            {COLOR_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          buttonColor{' '}
          <select value={buttonColor} onChange={(e) => setButtonColor(e.target.value)}>
            {BUTTON_COLOR_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          signColor{' '}
          <select value={signColor} onChange={(e) => setSignColor(e.target.value)}>
            {COLOR_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          <input type="checkbox" checked={rounded} onChange={(e) => setRounded(e.target.checked)} /> rounded
        </label>
        <label>
          <input type="checkbox" checked={showScore} onChange={(e) => setShowScore(e.target.checked)} /> showScore
        </label>
        <label>
          <input type="checkbox" checked={showDateRanges} onChange={(e) => setShowDateRanges(e.target.checked)} />{' '}
          showDateRanges
        </label>
        <label>
          <input type="checkbox" checked={showReadMore} onChange={(e) => setShowReadMore(e.target.checked)} />{' '}
          showReadMore
        </label>
      </fieldset>

      <Horoscope
        theme={theme}
        columns={columns}
        variant={variant}
        buttonLayout={buttonLayout}
        accentColor={accentColor}
        buttonColor={buttonColor}
        signColor={signColor}
        rounded={rounded}
        showScore={showScore}
        showDateRanges={showDateRanges}
        showReadMore={showReadMore}
      />

      <footer className="demo-footer">
        <a href="https://github.com/zodiactimeline/react-horoscope">GitHub</a> ·{' '}
        <a href="https://www.npmjs.com/package/react-horoscope">npm</a> · MIT License
      </footer>
    </main>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
