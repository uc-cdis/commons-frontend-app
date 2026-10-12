// ECharts hands formatters a wide union (CallbackDataParams | CallbackDataParams[] | …).
// Callbacks take `unknown` and narrow here, so no option needs a cast.

const asRecord = (p: unknown): Record<string, unknown> | null =>
  typeof p === 'object' && p !== null && !Array.isArray(p) ? (p as Record<string, unknown>) : null;

export const paramDataIndex = (p: unknown): number => {
  const v = asRecord(p)?.dataIndex;
  return typeof v === 'number' ? v : -1;
};

export const paramSeriesIndex = (p: unknown): number => {
  const v = asRecord(p)?.seriesIndex;
  return typeof v === 'number' ? v : -1;
};

/** The numeric value of a point, or the first coordinate of an array value. */
export const paramNumber = (p: unknown): number | null => {
  const v = asRecord(p)?.value;
  return typeof v === 'number' ? v : null;
};

export const paramFirstCoordinate = (p: unknown): number => {
  const v = asRecord(p)?.value;
  return Array.isArray(v) && typeof v[0] === 'number' ? v[0] : -1;
};
