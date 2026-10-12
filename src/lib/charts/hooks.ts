import { useCallback, useLayoutEffect, useMemo, useRef } from 'react';
import {
  extractEnumFilterValue,
  selectIndexFilters,
  useCoreSelector,
  type FilterSet,
} from '@gen3/core';
import { useClearFilters, useUpdateFilters } from '@gen3/frontend';

/**
 * A function identity that never changes but always calls the latest `fn`.
 * Needed because the framework's ReactECharts only binds `events` once, so a
 * handler that closes over current filters would otherwise go stale.
 */
export const useStableHandler = <A extends unknown[], R>(
  fn: (...args: A) => R,
): ((...args: A) => R) => {
  const ref = useRef(fn);
  useLayoutEffect(() => {
    ref.current = fn;
  }, [fn]);
  return useCallback((...args: A) => ref.current(...args), []);
};

/** The active cohort filters for one Explorer index (the same selector the tab uses). */
export const useIndexFilters = (index: string): FilterSet =>
  useCoreSelector((state) => selectIndexFilters(state, index));

export interface FieldFilter {
  selected: ReadonlySet<string>;
  /** add the keys to the filter, or remove them if they are all already selected */
  toggle: (keys: ReadonlyArray<string>) => void;
  clear: () => void;
}

/**
 * Click-to-filter for an enum field, through the same hooks the facet panel uses,
 * so a chart click and a facet checkbox are the same cohort change.
 */
export const useFieldFilter = (index: string, field: string): FieldFilter => {
  const filters = useIndexFilters(index);
  const update = useUpdateFilters(index);
  const clearField = useClearFilters(index);
  const op = filters.root[field];
  const selected = useMemo(
    () => new Set(op ? extractEnumFilterValue(op).map(String) : []),
    [op],
  );
  const toggle = useCallback(
    (keys: ReadonlyArray<string>) => {
      const allSelected = keys.every((k) => selected.has(k));
      const next = new Set(selected);
      keys.forEach((k) => (allSelected ? next.delete(k) : next.add(k)));
      if (next.size === 0) clearField(field);
      else update(field, { operator: 'in', field, operands: [...next] });
    },
    [selected, update, clearField, field],
  );
  const clear = useCallback(() => clearField(field), [clearField, field]);
  return { selected, toggle, clear };
};
