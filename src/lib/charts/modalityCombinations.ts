import type { Includes, Operation } from '@gen3/core';

export interface Modality {
  /** the value of the category field, e.g. "wgs" */
  value: string;
  label: string;
}

/** An exact combination: groups (donors) with exactly these modalities and no others. */
export interface Combination {
  /** bit i set ⇔ modalities[i] is a member */
  mask: number;
  members: ReadonlyArray<boolean>;
  label: string;
  count: number;
}

export interface CombinationSummary {
  /** every combination that at least one group has exactly */
  combinations: ReadonlyArray<Combination>;
  /** groups with each modality (the UpSet "set size"), in modality order */
  setSizes: ReadonlyArray<number>;
  /** groups with at least one configured modality; the exact counts sum to this */
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
 * by that exact set. A donor's modalities are only those of the records in the
 * current cohort; nothing is imputed.
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
    if (mask === 0) continue; // only unconfigured modalities: in no column
    const list = ids.get(mask) ?? [];
    list.push(group);
    ids.set(mask, list);
  }
  ids.forEach((list) => list.sort());
  const combinations = [...ids.entries()].map(([mask, list]) => ({
    mask,
    members: modalities.map((_, i) => Boolean(mask & (1 << i))),
    label: combinationLabel(mask, modalities),
    count: list.length,
  }));
  const setSizes = modalities.map((_, i) =>
    combinations.reduce((acc, c) => (c.mask & (1 << i) ? acc + c.count : acc), 0),
  );
  return {
    combinations,
    setSizes,
    groupCount: combinations.reduce((acc, c) => acc + c.count, 0),
    idsByMask: ids,
    otherCategoryRecords,
    ungroupedRecords,
  };
};

/** Row order for the modalities: most groups (donors) first; ties keep config order. */
export const orderBySetSize = (setSizes: ReadonlyArray<number>): number[] =>
  setSizes.map((_, i) => i).sort((a, b) => setSizes[b] - setSizes[a] || a - b);

/** Columns, largest first. */
export const columnsFor = (summary: CombinationSummary): Combination[] =>
  [...summary.combinations].sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));

/** The donors in one exact combination. */
export const idsFor = (summary: CombinationSummary, mask: number): string[] => [
  ...(summary.idsByMask.get(mask) ?? []),
];

/** The cohort filter selecting a combination's donors. */
export const combinationFilter = (groupField: string, ids: ReadonlyArray<string>): Includes => ({
  operator: 'in',
  field: groupField,
  operands: [...ids],
});

/** If the cohort's filter on the group field is exactly one combination's donors, its mask. */
export const selectedCombination = (
  op: Operation | undefined,
  summary: CombinationSummary,
): number | null => {
  if (!op || (op.operator !== 'in' && op.operator !== 'includes')) return null;
  const selected = new Set(op.operands.map(String));
  for (const [mask, list] of summary.idsByMask) {
    if (list.length === selected.size && list.every((id) => selected.has(id))) return mask;
  }
  return null;
};
