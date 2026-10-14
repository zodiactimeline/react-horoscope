/**
 * White text needs at least this contrast (WCAG's minimum for large text and UI controls).
 * Mid-tone colours such as sky blue or green pass, so they get white text as most design
 * systems use, and only genuinely light colours switch to dark text.
 */
const MIN_WHITE_CONTRAST = 3;

/** Parses `#rgb` or `#rrggbb` into 0–255 channels, or returns undefined for anything else. */
function parseHex(color: string): [number, number, number] | undefined {
  const match = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(color.trim());
  if (!match) return undefined;
  const hex = match[1].length === 3 ? match[1].replace(/./g, '$&$&') : match[1];
  return [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16)) as [number, number, number];
}

/** WCAG relative luminance of an sRGB colour. */
function luminance([r, g, b]: [number, number, number]): number {
  const [lr, lg, lb] = [r, g, b].map((channel) => {
    const c = channel / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * lr + 0.7152 * lg + 0.0722 * lb;
}

/** WCAG contrast ratio between two luminances. */
function contrast(a: number, b: number): number {
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

/**
 * Whether the hex background is too light for white text, so dark text should be used on it.
 * Returns undefined when the colour is not a hex code.
 */
export function isLightColor(background: string): boolean | undefined {
  const rgb = parseHex(background);
  if (!rgb) return undefined;
  const white = 1;
  return contrast(luminance(rgb), white) < MIN_WHITE_CONTRAST;
}
