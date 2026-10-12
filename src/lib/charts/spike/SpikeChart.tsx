// SPIKE ONLY — throwaway component used to compare integration routes.
import React, { useLayoutEffect, useMemo, useRef } from 'react';
import { ReactECharts, useUpdateFilters } from '@gen3/frontend';
import {
  Accessibility,
  useCoreSelector,
  selectIndexFilters,
  useGetAggsQuery,
  type HistogramData,
} from '@gen3/core';

interface SpikeChartProps {
  index: string;
  field: string;
  title: string;
  route: string;
}

export const SpikeChart = ({ index, field, title, route }: SpikeChartProps) => {
  const filters = useCoreSelector((s) => selectIndexFilters(s, index));
  const fields = useMemo(() => [field], [field]);
  const { data, isFetching, isError } = useGetAggsQuery({
    type: index,
    fields,
    filters,
    accessibility: Accessibility.ALL, // spike only: anonymous sees 0 under ACCESSIBLE
    filterSelf: true,
  });
  const update = useUpdateFilters(index);
  const updateRef = useRef(update);
  useLayoutEffect(() => {
    updateRef.current = update;
  }, [update]);

  const rows = (data?.[field] ?? []) as HistogramData[];
  const option = {
    xAxis: { type: 'category' as const, data: rows.map((r) => String(r.key)) },
    yAxis: { type: 'value' as const },
    tooltip: {},
    series: [{ type: 'bar' as const, data: rows.map((r) => r.count) }],
  };
  const events = useMemo(
    () => ({
      click: (e: { name: string }) =>
        updateRef.current(field, {
          operator: 'in',
          field,
          operands: [e.name],
        }),
    }),
    [field],
  );
  return (
    <div data-spike-route={route} className="w-full h-64 bg-base-max rounded p-2">
      <div className="font-bold">
        [{route}] {title} {isFetching ? '(fetching)' : ''} {isError ? '(error)' : ''}
      </div>
      <ReactECharts option={option} events={events} style={{ height: 200 }} />
    </div>
  );
};
