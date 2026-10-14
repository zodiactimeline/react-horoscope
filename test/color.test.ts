import { describe, expect, it } from 'vitest';
import { isLightColor } from '../src/color';

describe('isLightColor', () => {
  it('uses dark text only on colours too light for white text', () => {
    expect(isLightColor('#f5f3ff')).toBe(true);
    expect(isLightColor('#fff')).toBe(true);
    expect(isLightColor('#fde047')).toBe(true);
    expect(isLightColor('#1e293b')).toBe(false);
    expect(isLightColor('#000')).toBe(false);
  });

  it('keeps white text on mid-tone colours', () => {
    expect(isLightColor('#0284c7')).toBe(false); // sky
    expect(isLightColor('#0d9488')).toBe(false); // teal
    expect(isLightColor('#16a34a')).toBe(false); // green
    expect(isLightColor('#d97706')).toBe(false); // amber
  });

  it('ignores colours that are not hex codes', () => {
    expect(isLightColor('teal')).toBeUndefined();
    expect(isLightColor('#12345')).toBeUndefined();
  });
});
