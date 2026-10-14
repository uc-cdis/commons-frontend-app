/**
 * Category labels under vertical bars: horizontal by default, vertical only when
 * the longest label would not fit in its bar's slot.
 */
export interface CategoryLabelFit {
  vertical: boolean;
  /** max label length in px (along the text direction) */
  width: number;
}

/** gap kept between neighbouring horizontal labels */
const LABEL_GAP = 6;
/** vertical labels are capped (and truncated) so the plot keeps most of the height */
const MAX_VERTICAL = 170;
/** canvas measurement can run a few px short of what ECharts draws */
const MEASURE_SLACK = 8;

export const fitCategoryLabels = (
  labels: ReadonlyArray<string>,
  plotWidth: number,
  measure: (text: string) => number,
): CategoryLabelFit => {
  if (labels.length === 0) return { vertical: false, width: plotWidth };
  const slot = plotWidth / labels.length;
  const longest = Math.max(...labels.map(measure)) + MEASURE_SLACK;
  return longest + LABEL_GAP <= slot
    ? { vertical: false, width: Math.max(1, slot - LABEL_GAP) }
    : { vertical: true, width: Math.min(MAX_VERTICAL, Math.ceil(longest)) };
};

let context: CanvasRenderingContext2D | null | undefined;

/** Text width in px for the given CSS font, via canvas; falls back to an estimate. */
export const measureText =
  (font: string) =>
  (text: string): number => {
    if (context === undefined) {
      context =
        typeof document === 'undefined'
          ? null
          : document.createElement('canvas').getContext('2d');
    }
    if (!context) return text.length * 6.5;
    context.font = font;
    return context.measureText(text).width;
  };
