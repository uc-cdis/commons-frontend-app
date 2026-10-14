import React, { useCallback, useMemo } from 'react';
import { useGetRawDataAndTotalCountsQuery, type FilterSet } from '@gen3/core';
import { useClearFilters, useUpdateFilters } from '@gen3/frontend';
import { ChartFrame, DataTable } from './ChartFrame';
import { CHART_ACCESSIBILITY } from './config';
import { formatCount, formatPercent } from './data';
import { useIndexFilters } from './hooks';
import {
  columnsFor,
  combinationFilter,
  idsFor,
  orderBySetSize,
  selectedCombination,
  summariseCombinations,
  type Modality,
} from './modalityCombinations';
import { UpSetChart } from './UpSetChart';

export interface ModalityCombinationChartProps {
  /** the tab's index; one record per assay */
  index: string;
  title: string;
  /** plural noun for what is counted, e.g. "donors" */
  unit: string;
  /** the record field that identifies who is counted, e.g. donor_id */
  groupField: string;
  /** the record field holding the modality */
  categoryField: string;
  modalities: ReadonlyArray<Modality>;
  /** visible columns; the rest are counted in the note and listed in the table */
  maxColumns?: number;
  /** raw-record page size; if the cohort is larger the chart says it is incomplete */
  maxRecords?: number;
  notes?: ReadonlyArray<string>;
  className?: string;
}

const SUBTITLE =
  'Each donor is counted once, in the column matching exactly the modalities of their assays in this cohort. Bars on the left: donors with each modality.';

const isRecordArray = (v: unknown): v is Array<Record<string, unknown>> =>
  Array.isArray(v) && v.every((r) => typeof r === 'object' && r !== null);

/** Pull records and the server-side total out of a raw Guppy response. */
const parseRaw = (raw: unknown, index: string) => {
  const data = (raw as { data?: Record<string, unknown> } | undefined)?.data;
  const records = isRecordArray(data?.[index]) ? data[index] : [];
  const agg = data?._aggregation as Record<string, { _totalCount?: number }> | undefined;
  const total = agg?.[index]?._totalCount;
  return { records, total: typeof total === 'number' ? total : records.length };
};

/**
 * Donors per exact combination of assay modalities, as an UpSet plot. Built from
 * the tab's own assay records, so it follows that tab's cohort filters.
 */
export const ModalityCombinationChart = ({
  index,
  title,
  unit,
  groupField,
  categoryField,
  modalities,
  maxColumns = 20,
  maxRecords = 10000,
  notes: configNotes = [],
  className,
}: ModalityCombinationChartProps) => {
  const filters = useIndexFilters(index);
  const updateFilter = useUpdateFilters(index);
  const clearFilter = useClearFilters(index);

  // Like a facet, ignore this chart's own filter when counting, so a selected
  // combination is shown among the alternatives.
  const queryFilters = useMemo<FilterSet>(
    () => ({
      mode: filters.mode,
      root: Object.fromEntries(Object.entries(filters.root).filter(([f]) => f !== groupField)),
    }),
    [filters, groupField],
  );
  const fields = useMemo(() => [groupField, categoryField], [groupField, categoryField]);
  const query = useGetRawDataAndTotalCountsQuery({
    type: index,
    fields,
    filters: queryFilters,
    accessibility: CHART_ACCESSIBILITY,
    offset: 0,
    size: maxRecords,
  });

  const { records, total } = useMemo(() => parseRaw(query.data, index), [query.data, index]);
  const summary = useMemo(
    () => summariseCombinations(records, groupField, categoryField, modalities),
    [records, groupField, categoryField, modalities],
  );
  const allColumns = useMemo(() => columnsFor(summary), [summary]);
  const shown = allColumns.slice(0, maxColumns);
  // rows (modalities) ordered by donor count, largest first
  const rowOrder = useMemo(() => orderBySetSize(summary.setSizes), [summary.setSizes]);
  const selected = selectedCombination(filters.root[groupField], summary);
  const truncated = records.length < total;
  const donors = summary.groupCount;

  const apply = useCallback(
    (mask: number) => {
      if (selected === mask) clearFilter(groupField);
      else updateFilter(groupField, combinationFilter(groupField, idsFor(summary, mask)));
    },
    [selected, clearFilter, updateFilter, groupField, summary],
  );
  const clear = useCallback(() => clearFilter(groupField), [clearFilter, groupField]);

  const coveredDonors = shown.reduce((acc, c) => acc + c.count, 0);
  const top = allColumns
    .slice(0, 3)
    .map((c) => `${c.label} ${formatCount(c.count)} (${formatPercent(c.count, donors)})`)
    .join(', ');
  const label =
    donors === 0
      ? `${title}: no ${unit} match the current filters.`
      : `${title}: ${formatCount(donors)} ${unit} across ${allColumns.length} exact combinations. Most common: ${top}.`;

  const notes = [
    ...(truncated
      ? [
          `Incomplete: only the first ${formatCount(records.length)} of ${formatCount(
            total,
          )} assays were fetched, so these counts undercount. Narrow the cohort to see exact counts.`,
        ]
      : []),
    `Showing ${shown.length} of ${allColumns.length} non-empty combinations, covering ${formatCount(
      coveredDonors,
    )} of ${formatCount(donors)} ${unit}. Combinations with no ${unit} are omitted; the columns sum to ${formatCount(
      donors,
    )} ${unit}.`,
    ...(summary.otherCategoryRecords > 0
      ? [
          `${formatCount(summary.otherCategoryRecords)} assays have a modality outside the six shown and are not counted.`,
        ]
      : []),
    ...(summary.ungroupedRecords > 0
      ? [`${formatCount(summary.ungroupedRecords)} assays have no ${groupField} and are not counted.`]
      : []),
    ...configNotes,
  ];

  const selectionLabel =
    selected !== null
      ? `${summary.combinations.find((c) => c.mask === selected)?.label ?? ''} (${formatCount(
          idsFor(summary, selected).length,
        )} ${unit})`
      : filters.root[groupField]
        ? `${groupField} filter set elsewhere`
        : undefined;

  return (
    <ChartFrame
      title={title}
      unit={unit}
      total={query.isSuccess ? donors : undefined}
      status={query}
      isEmpty={donors === 0}
      onRetry={() => void query.refetch()}
      selectionLabel={selectionLabel}
      onClearSelection={clear}
      subtitle={SUBTITLE}
      className={className}
      notes={notes}
      table={
        <DataTable
          caption={`${title}: ${unit} with exactly these modalities`}
          headers={['Combination', unit.charAt(0).toUpperCase() + unit.slice(1), 'Share']}
          rows={allColumns.map((c) => ({
            key: String(c.mask),
            cells: [c.label, formatCount(c.count), formatPercent(c.count, donors)],
            selected: selected === c.mask,
            onToggle: () => apply(c.mask),
          }))}
        />
      }
    >
      <UpSetChart
        rows={rowOrder.map((i) => modalities[i].label)}
        setSizes={rowOrder.map((i) => summary.setSizes[i])}
        columns={shown.map((c) => ({
          id: String(c.mask),
          label: c.label,
          value: c.count,
          members: rowOrder.map((i) => c.members[i]),
        }))}
        unit={unit}
        total={donors}
        label={label}
        marksLabel={`${title} columns`}
        valueCaption={`${unit} with exactly these modalities and no others`}
        setCaption={(row) => `${unit} with ${row}, alone or with other modalities`}
        selectedId={selected === null ? null : String(selected)}
        onSelect={(id) => apply(Number(id))}
      />
    </ChartFrame>
  );
};
