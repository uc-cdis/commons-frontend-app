import type { HistogramData } from '@gen3/core';
import type { CategoryDatum, Distribution } from './types';

const PLACEHOLDER = /^(unknown|n\/?a|no data|not reported|missing|none)$/i;

export const isPlaceholderKey = (key: string): boolean => PLACEHOLDER.test(key.trim());

const toLabel = (key: string): string => (key === 'no data' ? 'No data' : key);

/**
 * Clean a Guppy histogram for charting:
 * - a count of -1 means the server suppressed a small cell: keep the category
 *   (so the reader knows it exists) but never plot or sum it;
 * - empty-string keys are dropped (the framework does the same);
 * - placeholder categories ("Unknown", "no data", …) sort after real ones.
 */
export const toDistribution = (
  histogram: ReadonlyArray<HistogramData> | undefined,
): Distribution => {
  const data: CategoryDatum[] = (histogram ?? [])
    .filter((h) => typeof h.key === 'string' && h.key !== '')
    .map((h) => {
      const key = String(h.key);
      return {
        key,
        label: toLabel(key),
        count: h.count < 0 ? null : h.count,
        isPlaceholder: isPlaceholderKey(key),
      };
    })
    .sort((a, b) => {
      if (a.isPlaceholder !== b.isPlaceholder) return a.isPlaceholder ? 1 : -1;
      return (b.count ?? -1) - (a.count ?? -1) || a.label.localeCompare(b.label);
    });
  const total = data.reduce((acc, d) => acc + (d.count ?? 0), 0);
  const suppressedCount = data.filter((d) => d.count === null).length;
  return { data, total, suppressedCount };
};

export const OTHER_KEY = '__other__';

/**
 * Keep at most `max` categories: the largest `max - 1` real categories stay, the
 * real tail is folded into one "Other" bucket that remembers its members, and
 * placeholders stay separate (they are drawn neutral and cost no palette slot).
 */
export const groupTail = (
  distribution: Distribution,
  max: number,
): Distribution => {
  const real = distribution.data.filter((d) => !d.isPlaceholder);
  if (real.length <= max) return distribution;
  const keep = real.slice(0, max - 1);
  const tail = real.slice(max - 1);
  const tailCounts = tail.map((d) => d.count);
  const other: CategoryDatum = {
    key: OTHER_KEY,
    label: `Other (${tail.length})`,
    count: tailCounts.every((c) => c === null)
      ? null
      : tailCounts.reduce<number>((a, c) => a + (c ?? 0), 0),
    isPlaceholder: false,
    members: tail,
  };
  return {
    ...distribution,
    data: [...keep, other, ...distribution.data.filter((d) => d.isPlaceholder)],
  };
};

const integer = new Intl.NumberFormat('en-AU');

export const formatCount = (n: number | null): string =>
  n === null ? 'suppressed' : integer.format(n);

export const formatPercent = (n: number | null, total: number): string => {
  if (n === null || total <= 0) return '–';
  const p = (100 * n) / total;
  return `${p < 1 && p > 0 ? p.toFixed(1) : Math.round(p)}%`;
};

/**
 * The sentence a screen reader hears for a category chart: it states the finding,
 * not the chart type alone.
 */
export const summarise = (
  title: string,
  unit: string,
  { data, total, suppressedCount }: Distribution,
  selected: ReadonlySet<string>,
): string => {
  if (total === 0 && suppressedCount === 0) {
    return `${title}: no ${unit} match the current filters.`;
  }
  const ranked = data
    .filter((d) => d.count !== null)
    .sort((a, b) => (b.count ?? 0) - (a.count ?? 0));
  const top = ranked
    .slice(0, 3)
    .map((d) => `${d.label} ${formatCount(d.count)} (${formatPercent(d.count, total)})`)
    .join(', ');
  const parts = [
    `${title}: ${integer.format(total)} ${unit} across ${data.length} ${
      data.length === 1 ? 'category' : 'categories'
    }.`,
    ranked.length > 0 ? `Largest: ${top}.` : '',
    suppressedCount > 0
      ? `${suppressedCount} small ${suppressedCount === 1 ? 'count is' : 'counts are'} suppressed by the server.`
      : '',
    selected.size > 0 ? `Filtered to ${[...selected].join(', ')}.` : '',
  ];
  return parts.filter(Boolean).join(' ');
};
