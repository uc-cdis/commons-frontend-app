import { describe, expect, it } from '@jest/globals';
import { chartTokens, contrast } from './theme';

const { surface } = chartTokens;

describe('chart colours meet WCAG AA against the card', () => {
  it.each([
    ['text', chartTokens.text],
    ['textMuted', chartTokens.textMuted],
  ])('%s is ≥ 4.5:1 (text)', (_, colour) => {
    expect(contrast(colour, surface)).toBeGreaterThanOrEqual(4.5);
  });

  it.each([
    ['series', chartTokens.series],
    ['placeholder', chartTokens.placeholder],
    ['focus', chartTokens.focus],
  ])('%s is ≥ 3:1 (non-text marks)', (_, colour) => {
    expect(contrast(colour, surface)).toBeGreaterThanOrEqual(3);
  });

  it('UpSet member dots stay ≥ 3:1 on a striped row', () => {
    expect(contrast(chartTokens.series, chartTokens.rowStripe)).toBeGreaterThanOrEqual(3);
  });
});
