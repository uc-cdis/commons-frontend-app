import type { Includes, Operation } from '@gen3/core';

export interface Modality {
  /** the value of the category field, e.g. "wgs" */
  value: string;
  label: string;
}

/** exclusive = donors with exactly these modalities; inclusive = at least these */
export type CombinationMode = 'exclusive' | 'inclusive';

export interface Combination {
  /** bit i set ⇔ modalities[i] is a member */
  mask: number;
  members: ReadonlyArray<boolean>;
  label: string;
  /** groups (donors) whose modality set is exactly this one */
  exclusive: number;
  /** groups whose modality set contains this one */
  inclusive: number;
}

export interface CombinationSummary {
  /** every combination that at least one group has exactly */
  combinations: ReadonlyArray<Combination>;
  /** distinct groups (donors) seen */
  groupCount: number;
  /** group ids per exact mask, for building and recognising filters */
  idsByMask: ReadonlyMap<number, ReadonlyArray<string>>;
  /** records whose category isn't one of the configured modalities */
  otherCategoryRecords: number;
  /** records with no group id; they can't be attributed to a donor */
  ungroupedRecords: number;
}

export const combinationLabel = (mask: number, modalities: ReadonlyArray<Modality>) =>
  modalities
    .filter((_, i) => mask & (1 << i))
    .map((m) => m.label)
    .join(' + ');

/**
 * Group per-assay records into each donor's set of modalities, then bucket donors
 * by that set. A donor's modalities are only those of the records in the current
 * cohort; nothing is imputed.
 */
export const summariseCombinations = (
  records: ReadonlyArray<Record<string, unknown>>,
  groupField: string,
  categoryField: string,
  modalities: ReadonlyArray<Modality>,
): CombinationSummary => {
  const bit = new Map(modalities.map((m, i) => [m.value, 1 << i]));
  const maskByGroup = new Map<string, number>();
  let otherCategoryRecords = 0;
  let ungroupedRecords = 0;
  for (const record of records) {
    const group = record[groupField];
    if (typeof group !== 'string' || group === '') {
      ungroupedRecords += 1;
      continue;
    }
    const b = bit.get(String(record[categoryField]));
    if (b === undefined) otherCategoryRecords += 1;
    maskByGroup.set(group, (maskByGroup.get(group) ?? 0) | (b ?? 0));
  }

  const ids = new Map<number, string[]>();
  for (const [group, mask] of maskByGroup) {
    if (mask === 0) continue; // only unconfigured modalities: not in any column
    const list = ids.get(mask) ?? [];
    list.push(group);
    ids.set(mask, list);
  }
  const observed = [...ids.entries()].map(([mask, list]) => [mask, list.length] as const);
  const combinations = observed.map(([mask, exclusive]) => ({
    mask,
    members: modalities.map((_, i) => Boolean(mask & (1 << i))),
    label: combinationLabel(mask, modalities),
    exclusive,
    inclusive: observed.reduce((acc, [other, n]) => ((other & mask) === mask ? acc + n : acc), 0),
  }));
  ids.forEach((list) => list.sort());
  return {
    combinations,
    groupCount: maskByGroup.size,
    idsByMask: ids,
    otherCategoryRecords,
    ungroupedRecords,
  };
};

/** Columns for one mode, largest first. */
export const columnsFor = (summary: CombinationSummary, mode: CombinationMode): Combination[] =>
  [...summary.combinations].sort((a, b) => b[mode] - a[mode] || a.label.localeCompare(b.label));

/** The donors a column stands for in the given mode. */
export const idsFor = (
  summary: CombinationSummary,
  mask: number,
  mode: CombinationMode,
): string[] =>
  mode === 'exclusive'
    ? [...(summary.idsByMask.get(mask) ?? [])]
    : [...summary.idsByMask.entries()]
        .filter(([other]) => (other & mask) === mask)
        .flatMap(([, list]) => list)
        .sort();

/** The cohort filter selecting a column's donors. */
export const combinationFilter = (groupField: string, ids: ReadonlyArray<string>): Includes => ({
  operator: 'in',
  field: groupField,
  operands: [...ids],
});

const sameSet = (a: ReadonlyArray<string | number>, b: ReadonlyArray<string>) => {
  if (a.length !== b.length) return false;
  const set = new Set(a.map(String));
  return b.every((x) => set.has(x));
};

/**
 * If the cohort's filter on the group field is exactly one column's donors, return
 * that column (exclusive match preferred); otherwise null.
 */
export const selectedCombination = (
  op: Operation | undefined,
  summary: CombinationSummary,
): { mask: number; mode: CombinationMode } | null => {
  if (!op || (op.operator !== 'in' && op.operator !== 'includes')) return null;
  for (const mode of ['exclusive', 'inclusive'] as const) {
    for (const c of summary.combinations) {
      if (sameSet(op.operands, idsFor(summary, c.mask, mode))) return { mask: c.mask, mode };
    }
  }
  return null;
};
