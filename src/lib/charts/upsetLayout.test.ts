import { describe, expect, it } from '@jest/globals';
import { upsetLayout } from './upsetLayout';

describe('upsetLayout', () => {
  it.each([1600, 1200, 900, 700, 500, 390, 320])(
    'fits all 20 columns, with dots that do not touch, at %ipx',
    (width) => {
      const l = upsetLayout(width, 20);
      // every column lies inside the chart width
      expect(l.left + 20 * l.band + l.right).toBeLessThanOrEqual(width + 0.001);
      // dots stay inside their slot with a gap, and stay visible
      expect(2 * l.dotRadius).toBeLessThan(l.band);
      expect(l.dotRadius).toBeGreaterThanOrEqual(2.5);
      expect(l.linkWidth).toBeLessThanOrEqual(2 * l.dotRadius);
    },
  );

  it('keeps the full-size look on wide screens', () => {
    const l = upsetLayout(1600, 20);
    expect(l.dotRadius).toBe(7.5);
    expect(l.linkWidth).toBe(3);
    expect(l.countFontSize).toBe(11);
  });

  it('shrinks count labels on narrow screens, never below 8px', () => {
    expect(upsetLayout(700, 20).countFontSize).toBeLessThan(11);
    expect(upsetLayout(320, 20).countFontSize).toBe(8);
  });

  it('handles few columns', () => {
    const l = upsetLayout(1200, 1);
    expect(l.dotRadius).toBe(7.5);
    expect(l.left + l.band + l.right).toBeLessThanOrEqual(1200);
  });
});
