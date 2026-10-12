import { describe, expect, it } from '@jest/globals';
import { chartTokens, contrast, inkOn, VIRIDIS_DARK_HALF } from './theme';

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
    ['nonMember', chartTokens.nonMember],
    ['focus', chartTokens.focus],
    ...VIRIDIS_DARK_HALF.map((c, i) => [`viridis[${i}]`, c] as [string, string]),
  ])('%s is ≥ 3:1 (non-text marks)', (_, colour) => {
    expect(contrast(colour, surface)).toBeGreaterThanOrEqual(3);
  });

  it('picks label ink with ≥ 4.5:1 on any viridis step', () => {
    VIRIDIS_DARK_HALF.forEach((c) => expect(contrast(inkOn(c), c)).toBeGreaterThanOrEqual(4.5));
  });
});
