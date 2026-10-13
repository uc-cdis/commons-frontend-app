import React, { useCallback, useMemo, useState } from 'react';
import { SegmentedControl } from '@mantine/core';
import { useGetRawDataAndTotalCountsQuery, type FilterSet } from '@gen3/core';
import { useClearFilters, useUpdateFilters } from '@gen3/frontend';
import { ChartFrame, DataTable } from './ChartFrame';
import { CHART_ACCESSIBILITY } from './config';
import { formatCount, formatPercent } from './data';
import { HeatmapChart } from './HeatmapChart';
import { useIndexFilters } from './hooks';
import {
  columnsFor,
  combinationFilter,
  idsFor,
  selectedCombination,
  summariseCombinations,
  type CombinationMode,
  type Modality,
} from './modalityCombinations';

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

const MODE_COPY: Record<CombinationMode, { control: string; subtitle: string; value: string }> = {
  exclusive: {
    control: 'Exactly these',
    subtitle:
      'Exact combinations: each donor is counted once, in the column matching exactly the modalities of their assays in this cohort.',
    value: 'donors with exactly these modalities and no others',
  },
  inclusive: {
    control: 'At least these',
    subtitle:
      'Overlapping: a donor counts in every column whose modalities they have, so columns do not sum to the total.',
    value: 'donors with at least these modalities (and possibly others)',
  },
};

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
 * Donors per combination of assay modalities (UpSet semantics, drawn as a heatmap).
 * Built from the tab's own assay records, so it follows that tab's cohort filters.
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
  const [mode, setMode] = useState<CombinationMode>('exclusive');

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
  const allColumns = useMemo(() => columnsFor(summary, mode), [summary, mode]);
  const shown = allColumns.slice(0, maxColumns);
  const selection = selectedCombination(filters.root[groupField], summary);
  const truncated = records.length < total;
  const donorsInColumns = summary.combinations.reduce((acc, c) => acc + c.exclusive, 0);

  const apply = useCallback(
    (mask: number) => {
      if (selection?.mask === mask && selection.mode === mode) {
        clearFilter(groupField);
      } else {
        updateFilter(groupField, combinationFilter(groupField, idsFor(summary, mask, mode)));
      }
    },
    [selection, mode, clearFilter, updateFilter, groupField, summary],
  );
  const clear = useCallback(() => clearFilter(groupField), [clearFilter, groupField]);

  const columns = shown.map((c) => ({
    id: String(c.mask),
    label: c.label,
    value: c[mode],
    members: c.members,
  }));

  const coveredDonors = shown.reduce((acc, c) => acc + c.exclusive, 0);
  const top = allColumns
    .slice(0, 3)
    .map((c) => `${c.label} ${formatCount(c[mode])} (${formatPercent(c[mode], donorsInColumns)})`)
    .join(', ');
  const label =
    donorsInColumns === 0
      ? `${title}: no ${unit} match the current filters.`
      : `${title}, ${mode === 'exclusive' ? 'exact combinations' : 'at least these modalities'}: ${formatCount(
          donorsInColumns,
        )} ${unit} across ${allColumns.length} combinations. Most common: ${top}.`;

  const notes = [
    ...(truncated
      ? [
          `Incomplete: only the first ${formatCount(records.length)} of ${formatCount(
            total,
          )} assays were fetched, so these counts undercount. Narrow the cohort to see exact counts.`,
        ]
      : []),
    `Showing ${shown.length} of ${allColumns.length} non-empty combinations${
      mode === 'exclusive'
        ? `, covering ${formatCount(coveredDonors)} of ${formatCount(donorsInColumns)} ${unit}`
        : ''
    }. Combinations with no ${unit} are omitted.`,
    mode === 'exclusive'
      ? `Exact combinations sum to ${formatCount(donorsInColumns)} ${unit}, the distinct ${unit} with assays in this cohort.`
      : 'Columns overlap and do not sum to the total.',
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

  const selectionLabel = selection
    ? `${MODE_COPY[selection.mode].control.toLowerCase()}: ${
        summary.combinations.find((c) => c.mask === selection.mask)?.label ?? ''
      } (${formatCount(idsFor(summary, selection.mask, selection.mode).length)} ${unit})`
    : filters.root[groupField]
      ? `${groupField} filter set elsewhere`
      : undefined;

  return (
    <ChartFrame
      title={title}
      unit={unit}
      total={query.isSuccess ? donorsInColumns : undefined}
      status={query}
      isEmpty={donorsInColumns === 0}
      onRetry={() => void query.refetch()}
      selectionLabel={selectionLabel}
      onClearSelection={clear}
      subtitle={MODE_COPY[mode].subtitle}
      className={className}
      controls={
        <SegmentedControl
          size="xs"
          color="primary"
          value={mode}
          onChange={(v) => setMode(v === 'inclusive' ? 'inclusive' : 'exclusive')}
          aria-label="Count donors with"
          data={(['exclusive', 'inclusive'] as const).map((m) => ({
            value: m,
            label: MODE_COPY[m].control,
          }))}
        />
      }
      notes={notes}
      table={
        <DataTable
          caption={`${title}: ${MODE_COPY[mode].value}`}
          headers={['Combination', unit.charAt(0).toUpperCase() + unit.slice(1), 'Share']}
          rows={allColumns.map((c) => ({
            key: String(c.mask),
            cells: [c.label, formatCount(c[mode]), formatPercent(c[mode], donorsInColumns)],
            selected: selection?.mask === c.mask && selection.mode === mode,
            onToggle: () => apply(c.mask),
          }))}
        />
      }
    >
      <HeatmapChart
        rows={modalities.map((m) => m.label)}
        columns={columns}
        unit={unit}
        total={donorsInColumns}
        label={label}
        marksLabel={`${title} columns`}
        valueCaption={MODE_COPY[mode].value}
        selectedId={selection && selection.mode === mode ? String(selection.mask) : null}
        onSelect={(id) => apply(Number(id))}
      />
    </ChartFrame>
  );
};
