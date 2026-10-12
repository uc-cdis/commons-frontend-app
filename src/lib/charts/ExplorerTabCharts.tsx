import React, { useMemo } from 'react';
import { useGetAggsQuery, type HistogramData } from '@gen3/core';
import { BarChart } from './BarChart';
import { CHART_ACCESSIBILITY, type ExplorerTabCharts as TabCharts, type FieldChartDefinition } from './config';
import { toDistribution } from './data';
import { useFieldFilter, useIndexFilters } from './hooks';
import { ModalityCombinationChart } from './ModalityCombinationChart';
import { PieChart } from './PieChart';
import type { ChartStatus } from './types';

type AggsData = Record<string, ReadonlyArray<HistogramData>>;

interface FieldChartProps {
  index: string;
  unit: string;
  def: FieldChartDefinition;
  data: AggsData | undefined;
  status: ChartStatus;
  isSuccess: boolean;
  onRetry: () => void;
  className: string;
}

const FieldChart = ({ index, unit, def, data, status, isSuccess, onRetry, className }: FieldChartProps) => {
  const { selected, toggle, clear } = useFieldFilter(index, def.field);
  const histogram = data?.[def.field];
  const distribution = useMemo(() => toDistribution(histogram), [histogram]);
  // a field the index doesn't have is a configuration error, not "no data"
  const missingField = isSuccess && data !== undefined && !(def.field in data);
  if (missingField) console.error(`[charts] field "${def.field}" not returned for index "${index}"`);
  const props = {
    title: def.title,
    unit,
    distribution,
    status: { ...status, isError: status.isError || missingField },
    selected,
    onSelect: toggle,
    onClearSelection: clear,
    onRetry,
    className,
  };
  return def.type === 'pie' ? (
    <PieChart {...props} />
  ) : (
    <BarChart {...props} orientation={def.orientation} />
  );
};

const spanClass = (width: 'tile' | 'full' | undefined) => (width === 'full' ? 'col-span-full' : '');

/** All custom charts for one Explorer tab, reacting to that tab's cohort filters. */
export const ExplorerTabCharts = ({ tabTitle, index, unit, charts }: TabCharts) => {
  const filters = useIndexFilters(index);
  const fieldDefs = useMemo(
    () => charts.filter((c): c is FieldChartDefinition => c.type === 'bar' || c.type === 'pie'),
    [charts],
  );
  const fields = useMemo(() => fieldDefs.map((c) => c.field), [fieldDefs]);
  // filterSelf: false = each field's buckets ignore that field's own filter (as the
  // facets do), so a chart keeps showing the alternatives around its selection
  const aggs = useGetAggsQuery(
    {
      type: index,
      fields,
      filters,
      accessibility: CHART_ACCESSIBILITY,
      filterSelf: false,
    },
    { skip: fields.length === 0 },
  );
  const status: ChartStatus = {
    isLoading: aggs.isLoading,
    isFetching: aggs.isFetching,
    isError: aggs.isError,
  };
  const data = aggs.data as AggsData | undefined;
  const refetch = aggs.refetch;

  if (charts.length === 0) return null;
  return (
    <section
      aria-label={`${tabTitle} charts`}
      className="mb-3 grid grid-cols-1 gap-3 lg:grid-cols-2 min-[1800px]:grid-cols-4"
    >
      {charts.map((def) =>
        def.type === 'modalityCombinations' ? (
          <ModalityCombinationChart
            key={def.title}
            index={index}
            unit={unit}
            title={def.title}
            idField={def.idField}
            modalities={def.modalities}
            maxColumns={def.maxColumns}
            maxRecords={def.maxRecords}
            notes={def.notes}
            className={spanClass(def.width)}
          />
        ) : (
          <FieldChart
            key={def.field}
            index={index}
            unit={unit}
            def={def}
            data={data}
            status={status}
            isSuccess={aggs.isSuccess}
            onRetry={() => void refetch()}
            className={spanClass(def.width)}
          />
        ),
      )}
    </section>
  );
};
