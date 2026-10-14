import { describe, expect, it } from 'vitest';
import { resolveDate } from '../src/date';

describe('resolveDate', () => {
  it('shifts across month and year boundaries', () => {
    expect(resolveDate('tomorrow', '2026-12-31')).toBe('2027-01-01');
    expect(resolveDate('yesterday', '2026-03-01')).toBe('2026-02-28');
    expect(resolveDate('today', new Date(2026, 9, 14))).toBe('2026-10-14');
  });
});
