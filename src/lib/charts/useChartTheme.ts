import { useMemo } from 'react';
import { useReducedMotion } from '@mantine/hooks';
import { chartTokens, OKABE_ITO, type ChartTokens } from './theme';

export interface ChartTheme {
  tokens: ChartTokens;
  categorical: ReadonlyArray<string>;
  reducedMotion: boolean;
  /** option fragments every chart shares, so tooltips/axes look the same everywhere */
  base: {
    animation: boolean;
    animationDuration: number;
    animationDurationUpdate: number;
    textStyle: { color: string; fontSize: number };
    tooltip: {
      backgroundColor: string;
      borderColor: string;
      borderWidth: number;
      padding: [number, number];
      textStyle: { color: string; fontSize: number };
      extraCssText: string;
      confine: boolean;
    };
    // decals stay off by default; pies turn them on (see PieChart)
    aria: { enabled: boolean; label: { enabled: boolean } };
  };
  axisLabel: { color: string; fontSize: number };
  axisLine: { lineStyle: { color: string } };
  splitLine: { lineStyle: { color: string; width: number; type: 'solid' } };
}

/** Resolved colours plus the shared interaction/motion settings for every chart. */
export const useChartTheme = (): ChartTheme => {
  const reducedMotion = useReducedMotion() ?? false;
  return useMemo(
    () => ({
      tokens: chartTokens,
      categorical: OKABE_ITO,
      reducedMotion,
      base: {
        animation: !reducedMotion,
        animationDuration: 250,
        animationDurationUpdate: 200,
        textStyle: { color: chartTokens.text, fontSize: 12 },
        tooltip: {
          backgroundColor: chartTokens.surface,
          borderColor: chartTokens.tooltipBorder,
          borderWidth: 1,
          padding: [6, 10],
          textStyle: { color: chartTokens.text, fontSize: 12 },
          extraCssText: `box-shadow: 0 2px 6px ${chartTokens.shadow}; border-radius: 4px;`,
          confine: true,
        },
        // ECharts' own generated aria-label would fight ours; ChartFrame owns a11y
        aria: { enabled: true, label: { enabled: false } },
      },
      axisLabel: { color: chartTokens.textMuted, fontSize: 11 },
      axisLine: { lineStyle: { color: chartTokens.grid } },
      splitLine: { lineStyle: { color: chartTokens.grid, width: 1, type: 'solid' as const } },
    }),
    [reducedMotion],
  );
};
