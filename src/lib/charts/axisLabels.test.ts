import { describe, expect, it } from '@jest/globals';
import { fitCategoryLabels } from './axisLabels';

// 7px per character: deterministic stand-in for canvas measureText
const measure = (t: string) => t.length * 7;

describe('fitCategoryLabels', () => {
  it('keeps labels horizontal when they fit', () => {
    // 6 short labels in 600px: 100px slots, longest "chromium" = 56px
    const fit = fitCategoryLabels(['chromium', 'wgs', 'snp', 'wts', 'visium', 'xenium'], 600, measure);
    expect(fit.vertical).toBe(false);
    expect(fit.width).toBe(94);
  });

  it('goes vertical when the longest label would collide', () => {
    // "Peri-menopausal (suppressed)" = 196px (+ slack) > 120px slot
    const fit = fitCategoryLabels(
      ['Post-menopausal', 'Pre-menopausal', 'Peri-menopausal (suppressed)', 'Unknown', 'N/A'],
      600,
      measure,
    );
    expect(fit.vertical).toBe(true);
    expect(fit.width).toBe(170); // capped; longer labels truncate
  });

  it('switches orientation as the chart narrows', () => {
    const labels = ['ERpos_HER2neg', 'ERneg_HER2neg', 'HER2pos_ERneg', 'HER2pos_ERpos', 'No data'];
    expect(fitCategoryLabels(labels, 600, measure).vertical).toBe(false); // 99px in 120px slots
    expect(fitCategoryLabels(labels, 400, measure).vertical).toBe(true); // 99px in 80px slots
  });

  it('handles no labels', () => {
    expect(fitCategoryLabels([], 300, measure).vertical).toBe(false);
  });
});
