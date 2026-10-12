import type { Intersection, Operation } from '@gen3/core';

export interface Modality {
  field: string;
  label: string;
}

/** exclusive = donors with exactly these modalities; inclusive = at least these */
export type CombinationMode = 'exclusive' | 'inclusive';

export interface Combination {
  /** bit i set ⇔ modalities[i] is a member */
  mask: number;
  members: ReadonlyArray<boolean>;
  label: string;
  /** donors whose modality set is exactly this one */
  exclusive: number;
  /** donors whose modality set contains this one */
  inclusive: number;
}

export interface CombinationSummary {
  /** every non-empty-count combination; mask 0 ("No assays") included if present */
  combinations: ReadonlyArray<Combination>;
  donorCount: number;
  /**
   * donors with some modality counts present and others missing. The server can
   * only filter "has no X" as `X <= 0`, which misses a missing X, so if any such
   * donor exists, click-to-filter on exclusive combinations would be wrong.
   */
  partiallyMissing: number;
}

export const NO_ASSAYS_LABEL = 'No assays';

export const combinationLabel = (mask: number, modalities: ReadonlyArray<Modality>) =>
  mask === 0
    ? NO_ASSAYS_LABEL
    : modalities
        .filter((_, i) => mask & (1 << i))
        .map((m) => m.label)
        .join(' + ');

const asCount = (v: unknown): number | null =>
  typeof v === 'number' && Number.isFinite(v) ? v : null;

/**
 * Bucket donors into modality combinations. Counts are counts, not booleans:
 * "has WGS" means wgs_count > 0. A missing count means the donor has no assay
 * records of that modality (the ETL only emits the rollup when children exist),
 * so it is treated as "not a member", never imputed.
 */
export const summariseCombinations = (
  records: ReadonlyArray<Record<string, unknown>>,
  modalities: ReadonlyArray<Modality>,
): CombinationSummary => {
  const byMask = new Map<number, number>();
  let partiallyMissing = 0;
  for (const record of records) {
    let mask = 0;
    let present = 0;
    modalities.forEach((m, i) => {
      const c = asCount(record[m.field]);
      if (c !== null) present += 1;
      if (c !== null && c > 0) mask |= 1 << i;
    });
    if (present > 0 && present < modalities.length) partiallyMissing += 1;
    byMask.set(mask, (byMask.get(mask) ?? 0) + 1);
  }
  const observed = [...byMask.entries()];
  const combinations = observed.map(([mask, exclusive]) => ({
    mask,
    members: modalities.map((_, i) => Boolean(mask & (1 << i))),
    label: combinationLabel(mask, modalities),
    exclusive,
    inclusive: observed.reduce(
      (acc, [other, n]) => ((other & mask) === mask ? acc + n : acc),
      0,
    ),
  }));
  return { combinations, donorCount: records.length, partiallyMissing };
};

/**
 * Columns for one mode, largest first. Inclusive mode drops "No assays": "at least
 * no modalities" is every donor and says nothing.
 */
export const columnsFor = (
  summary: CombinationSummary,
  mode: CombinationMode,
): Combination[] =>
  summary.combinations
    .filter((c) => (mode === 'inclusive' ? c.mask !== 0 : c.exclusive > 0))
    .sort((a, b) => b[mode] - a[mode] || a.label.localeCompare(b.label));

// Each condition sits in its own Intersection, the same shape the framework's range
// facets emit. Guppy rejects a bare AND of range conditions on different fields.
const range = (field: string, operator: '>=' | '<=', operand: number): Intersection => ({
  operator: 'and',
  operands: [{ operator, field, operand }],
});

/** Cohort filter entries (field → operation) that select one combination. */
export const combinationFilter = (
  mask: number,
  modalities: ReadonlyArray<Modality>,
  mode: CombinationMode,
): Record<string, Operation> => {
  const root: Record<string, Operation> = {};
  modalities.forEach((m, i) => {
    if (mask & (1 << i)) root[m.field] = range(m.field, '>=', 1);
    else if (mode === 'exclusive') root[m.field] = range(m.field, '<=', 0);
  });
  return root;
};

const singleRange = (op: Operation | undefined): '>=1' | '<=0' | null => {
  if (!op || op.operator !== 'and' || op.operands.length !== 1) return null;
  const inner = op.operands[0];
  if (inner.operator === '>=' && inner.operand === 1) return '>=1';
  if (inner.operator === '<=' && inner.operand === 0) return '<=0';
  return null;
};

/**
 * If the cohort's filters on the modality fields are exactly what this chart writes
 * for some combination, return that selection; otherwise null.
 */
export const selectedCombination = (
  root: Readonly<Record<string, Operation>>,
  modalities: ReadonlyArray<Modality>,
): { mask: number; mode: CombinationMode } | null => {
  let mask = 0;
  let hasExclusions = false;
  let any = false;
  for (const [i, m] of modalities.entries()) {
    const op = root[m.field];
    if (op === undefined) continue;
    const kind = singleRange(op);
    if (kind === null) return null; // someone else's filter on this field
    any = true;
    if (kind === '>=1') mask |= 1 << i;
    else hasExclusions = true;
  }
  if (!any || mask === 0) return null;
  const mode: CombinationMode = hasExclusions ? 'exclusive' : 'inclusive';
  if (mode === 'exclusive') {
    // exclusive selections constrain every modality
    const constrained = modalities.every((m) => root[m.field] !== undefined);
    if (!constrained) return null;
  }
  return { mask, mode };
};
