import React, { useCallback, useMemo, useState } from 'react';
import { SegmentedControl } from '@mantine/core';
import {
  setCohortFilter,
  useCoreDispatch,
  useGetRawDataAndTotalCountsQuery,
  type FilterSet,
} from '@gen3/core';
import { ChartFrame, DataTable } from './ChartFrame';
import { CHART_ACCESSIBILITY } from './config';
import { formatCount, formatPercent } from './data';
import { HeatmapChart } from './HeatmapChart';
import { useIndexFilters } from './hooks';
import {
  columnsFor,
  combinationFilter,
  selectedCombination,
  summariseCombinations,
  type CombinationMode,
  type Modality,
} from './modalityCombinations';

export interface ModalityCombinationChartProps {
  index: string;
  title: string;
  unit: string;
  idField: string;
  modalities: ReadonlyArray<Modality>;
  /** visible columns; the rest are counted in the note and listed in the table */
  maxColumns?: number;
  /** raw-record page size; if the cohort is larger the chart says it is incomplete */
  maxRecords?: number;
  /** extra caption notes from config */
  notes?: ReadonlyArray<string>;
  className?: string;
}

const MODE_COPY: Record<CombinationMode, { control: string; subtitle: string; value: string }> = {
  exclusive: {
    control: 'Exactly these',
    subtitle:
      'Exact combinations: each donor is counted once, in the column matching exactly the modalities they have.',
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

export const ModalityCombinationChart = ({
  index,
  title,
  unit,
  idField,
  modalities,
  maxColumns = 20,
  maxRecords = 5000,
  notes: configNotes = [],
  className,
}: ModalityCombinationChartProps) => {
  const dispatch = useCoreDispatch();
  const filters = useIndexFilters(index);
  const [mode, setMode] = useState<CombinationMode>('exclusive');
  const modalityFields = useMemo(() => modalities.map((m) => m.field), [modalities]);

  // Like a facet, this chart ignores its own fields when counting, so a selected
  // combination is shown in the context of the alternatives.
  const queryFilters = useMemo<FilterSet>(
    () => ({
      mode: filters.mode,
      root: Object.fromEntries(
        Object.entries(filters.root).filter(([f]) => !modalityFields.includes(f)),
      ),
    }),
    [filters, modalityFields],
  );
  const fields = useMemo(() => [idField, ...modalityFields], [idField, modalityFields]);
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
    () => summariseCombinations(records, modalities),
    [records, modalities],
  );
  const allColumns = useMemo(() => columnsFor(summary, mode), [summary, mode]);
  const shown = allColumns.slice(0, maxColumns);
  const selection = selectedCombination(filters.root, modalities);
  const truncated = records.length < total;
  // "has no X" can only be sent to the server as X <= 0, which misses donors whose
  // X is missing; only offer exact-combination filters when no donor is in that state
  const canFilterExact = summary.partiallyMissing === 0;

  const apply = useCallback(
    (mask: number) => {
      const others = Object.fromEntries(
        Object.entries(filters.root).filter(([f]) => !modalityFields.includes(f)),
      );
      const isSame = selection?.mask === mask;
      dispatch(
        setCohortFilter({
          index,
          filters: {
            mode: filters.mode,
            root: isSame ? others : { ...others, ...combinationFilter(mask, modalities, mode) },
          },
        }),
      );
    },
    [dispatch, filters, index, modalities, modalityFields, mode, selection],
  );
  const clear = useCallback(() => {
    if (selection) apply(selection.mask);
  }, [apply, selection]);

  const activatable = (mask: number) =>
    mask !== 0 && (mode === 'inclusive' || canFilterExact);

  const columns = shown.map((c) => ({
    id: String(c.mask),
    label: c.label,
    value: c[mode],
    members: c.members,
    activatable: activatable(c.mask),
  }));

  const coveredDonors = shown.reduce((acc, c) => acc + c.exclusive, 0);
  const noAssays = summary.combinations.find((c) => c.mask === 0)?.exclusive ?? 0;
  const top = allColumns
    .slice(0, 3)
    .map((c) => `${c.label} ${formatCount(c[mode])} (${formatPercent(c[mode], summary.donorCount)})`)
    .join(', ');
  const nonEmpty = allColumns.length;
  const label =
    summary.donorCount === 0
      ? `${title}: no ${unit} match the current filters.`
      : `${title}, ${mode === 'exclusive' ? 'exact combinations' : 'at least these modalities'}: ${formatCount(
          summary.donorCount,
        )} ${unit} across ${nonEmpty} combinations. Most common: ${top}.`;

  const notes = [
    `Showing ${shown.length} of ${nonEmpty} non-empty combinations${
      mode === 'exclusive'
        ? `, covering ${formatCount(coveredDonors)} of ${formatCount(summary.donorCount)} ${unit}`
        : ''
    }. Combinations with no ${unit} are omitted.`,
    mode === 'exclusive'
      ? `Exact combinations sum to ${formatCount(summary.donorCount)} ${unit}.`
      : 'Columns overlap and do not sum to the total.',
    ...(noAssays > 0 && mode === 'exclusive'
      ? [
          `${formatCount(noAssays)} ${unit} have no assay records ("No assays"); this column can't be used as a filter.`,
        ]
      : []),
    ...(!canFilterExact && mode === 'exclusive'
      ? [
          `${summary.partiallyMissing} ${unit} have some modality counts missing, so exact combinations can't be filtered precisely; switch to "At least these" to filter.`,
        ]
      : []),
    ...configNotes,
  ];

  const selectionLabel = selection
    ? `${MODE_COPY[selection.mode].control.toLowerCase()}: ${
        summary.combinations.find((c) => c.mask === selection.mask)?.label ??
        modalities.filter((_, i) => selection.mask & (1 << i)).map((m) => m.label).join(' + ')
      }`
    : undefined;

  return (
    <ChartFrame
      title={title}
      unit={unit}
      total={query.isSuccess ? summary.donorCount : undefined}
      status={query}
      isEmpty={summary.donorCount === 0}
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
      notes={[
        ...(truncated
          ? [
              `Incomplete: only the first ${formatCount(records.length)} of ${formatCount(
                total,
              )} ${unit} were fetched, so these counts undercount. Narrow the cohort to see exact counts.`,
            ]
          : []),
        ...notes,
      ]}
      table={
        <DataTable
          caption={`${title}: ${MODE_COPY[mode].value}`}
          headers={['Combination', unit.charAt(0).toUpperCase() + unit.slice(1), 'Share']}
          rows={allColumns.map((c) => ({
            key: String(c.mask),
            cells: [c.label, formatCount(c[mode]), formatPercent(c[mode], summary.donorCount)],
            selected: selection?.mask === c.mask,
            onToggle: activatable(c.mask) ? () => apply(c.mask) : undefined,
          }))}
        />
      }
    >
      <HeatmapChart
        rows={modalities.map((m) => m.label)}
        columns={columns}
        unit={unit}
        total={summary.donorCount}
        label={label}
        marksLabel={`${title} columns`}
        valueCaption={MODE_COPY[mode].value}
        selectedId={selection ? String(selection.mask) : null}
        onSelect={(id) => apply(Number(id))}
      />
    </ChartFrame>
  );
};
