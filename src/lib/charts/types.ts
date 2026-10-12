import type { ReactEChartsProps } from '@gen3/frontend';

export type EChartsOption = ReactEChartsProps['option'];

/** One category of a single-field distribution, after cleaning. */
export interface CategoryDatum {
  key: string;
  label: string;
  /** null when the server suppressed a small count (Guppy returns -1). */
  count: number | null;
  /** "Unknown", "N/A", "no data", … drawn in a neutral, never a palette hue. */
  isPlaceholder: boolean;
  /** for a grouped "Other" bucket: the categories folded into it */
  members?: ReadonlyArray<CategoryDatum>;
}

export interface Distribution {
  data: ReadonlyArray<CategoryDatum>;
  /** sum of the non-suppressed counts: the denominator for percentages */
  total: number;
  suppressedCount: number;
}

/** State shared by every chart; ChartFrame renders it consistently. */
export interface ChartStatus {
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
}

/** Props shared by the category charts (BarChart, PieChart). */
export interface CategoryChartProps {
  title: string;
  /** plural noun for the counted entity, e.g. "donors" */
  unit: string;
  distribution: Distribution;
  status: ChartStatus;
  /** keys currently in this chart's own cohort filter */
  selected: ReadonlySet<string>;
  /** toggle these keys in the cohort filter */
  onSelect: (keys: ReadonlyArray<string>) => void;
  onClearSelection: () => void;
  onRetry?: () => void;
  className?: string;
}
