import React, { useCallback, useMemo, useState } from 'react';
import { DataTable, type DataTableRow } from './ChartFrame';
import { formatCount, formatPercent, OTHER_KEY } from './data';
import type { CategoryDatum, Distribution } from './types';

export const escapeHtml = (s: string): string =>
  s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

/** The one tooltip format every chart uses: category, count, share of the total. */
export const tooltipHtml = (d: CategoryDatum, unit: string, total: number): string => {
  const head = `<div style="font-weight:600">${escapeHtml(d.label)}</div>`;
  const value =
    d.count === null
      ? `<div>Count suppressed (small number)</div>`
      : `<div><b>${formatCount(d.count)}</b> ${escapeHtml(unit)} · ${formatPercent(
          d.count,
          total,
        )} of ${formatCount(total)}</div>`;
  const members = d.members
    ? `<div style="margin-top:4px">${d.members
        .map((m) => `${escapeHtml(m.label)}: ${formatCount(m.count)}`)
        .join('<br/>')}</div>`
    : '';
  return head + value + members;
};

export const describe = (d: CategoryDatum, unit: string, total: number): string =>
  d.count === null
    ? `${d.label}: count suppressed`
    : `${d.label}: ${formatCount(d.count)} ${unit}, ${formatPercent(d.count, total)}`;

/** The filter keys a datum stands for ("Other" stands for its members). */
export const keysOf = (d: CategoryDatum): string[] =>
  d.key === OTHER_KEY && d.members ? d.members.map((m) => m.key) : [d.key];

export const isSelected = (d: CategoryDatum, selected: ReadonlySet<string>): boolean =>
  keysOf(d).every((k) => selected.has(k));

/** Legend hide/show and hover state, local to one chart. */
export const useLegendState = () => {
  const [hidden, setHidden] = useState<ReadonlySet<string>>(new Set());
  const [hovered, setHovered] = useState<string | null>(null);
  const toggle = useCallback(
    (key: string) =>
      setHidden((prev) => {
        const next = new Set(prev);
        if (next.has(key)) next.delete(key);
        else next.add(key);
        return next;
      }),
    [],
  );
  return { hidden, toggle, hovered, setHovered };
};

/**
 * Colour follows the category, not its rank: a key keeps the palette slot it was
 * first given for the life of the chart, so filtering never repaints survivors.
 */
export const useStableSlots = (keys: ReadonlyArray<string>, size: number) => {
  // assignments are idempotent: a key, once given a slot, keeps it
  const [map] = useState(() => new Map<string, number>());
  return useMemo(() => {
    const free = () => {
      const used = new Set(map.values());
      for (let i = 0; i < size; i += 1) if (!used.has(i)) return i;
      return -1;
    };
    keys.forEach((k) => {
      if (map.has(k)) return;
      let slot = free();
      if (slot < 0) {
        // palette exhausted by keys no longer shown: drop those, keep visible ones
        [...map.keys()].filter((old) => !keys.includes(old)).forEach((old) => map.delete(old));
        slot = free();
      }
      map.set(k, Math.max(slot, 0));
    });
    return new Map(map);
  }, [map, keys, size]);
};

interface CategoryTableProps {
  title: string;
  unit: string;
  distribution: Distribution;
  selected: ReadonlySet<string>;
  onSelect: (keys: ReadonlyArray<string>) => void;
}

export const CategoryTable = ({
  title,
  unit,
  distribution,
  selected,
  onSelect,
}: CategoryTableProps) => {
  const rows: DataTableRow[] = distribution.data.map((d) => ({
    key: d.key,
    cells: [d.label, formatCount(d.count), formatPercent(d.count, distribution.total)],
    selected: isSelected(d, selected),
    onToggle: () => onSelect(keysOf(d)),
  }));
  return (
    <DataTable
      caption={`${title}: ${unit} per category`}
      headers={['Category', unit.charAt(0).toUpperCase() + unit.slice(1), 'Share']}
      rows={rows}
    />
  );
};

export const suppressionNote = (d: Distribution): string[] =>
  d.suppressedCount > 0
    ? [
        `${d.suppressedCount} ${
          d.suppressedCount === 1 ? 'category has a' : 'categories have'
        } small count${d.suppressedCount === 1 ? '' : 's'} suppressed by the server; ${
          d.suppressedCount === 1 ? 'it is' : 'they are'
        } listed but not drawn or included in percentages.`,
      ]
    : [];
