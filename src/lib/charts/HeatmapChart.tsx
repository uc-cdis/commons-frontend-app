import React, { useCallback, useMemo } from 'react';
import { ChartCanvas, type ChartMark, type ClickParams } from './ChartCanvas';
import { escapeHtml } from './categoryChart';
import { formatCount, formatPercent } from './data';
import type { EChartsOption } from './types';
import {
  paramDataIndex,
  paramFirstCoordinate,
  paramNumber,
  paramSeriesIndex,
} from './params';
import { useChartTheme } from './useChartTheme';

export interface MembershipColumn {
  id: string;
  label: string;
  value: number;
  /** one per row: is this row a member of the column's set? */
  members: ReadonlyArray<boolean>;
  /** false when the column can't be turned into a cohort filter */
  activatable?: boolean;
}

interface HeatmapChartProps {
  rows: ReadonlyArray<string>;
  columns: ReadonlyArray<MembershipColumn>;
  unit: string;
  /** denominator for percentages */
  total: number;
  /** the finding, for screen readers */
  label: string;
  /** names the keyboard widget, e.g. "Combinations" */
  marksLabel: string;
  /** tooltip line describing what a column's value means */
  valueCaption: string;
  selectedId: string | null;
  onSelect: (columnId: string) => void;
}

const BAR_HEIGHT = 110;
const ROW_HEIGHT = 26;
const LEFT = 84;
const MIN_COLUMN_WIDTH = 28;

/**
 * Set-membership heatmap in the UpSet layout: a column per set, a count bar above
 * it, and a matrix below where a filled square marks membership and a small dot
 * marks non-membership. Membership reads from shape and presence; the sequential
 * fill is a second encoding of the column's count, never the only one.
 */
export const HeatmapChart = ({
  rows,
  columns,
  unit,
  total,
  label,
  marksLabel,
  valueCaption,
  selectedId,
  onSelect,
}: HeatmapChartProps) => {
  const theme = useChartTheme();
  const { tokens, sequential } = theme;
  const ids = useMemo(() => columns.map((c) => c.id), [columns]);
  const anySelected = selectedId !== null;
  const dim = useCallback(
    (c: MembershipColumn) => (anySelected && c.id !== selectedId ? 0.3 : 1),
    [anySelected, selectedId],
  );

  const { cells, dots } = useMemo(() => {
    const cellData: Array<{
      value: [number, number, number];
      itemStyle: { opacity: number };
    }> = [];
    const dotData: Array<{
      value: [number, number];
      itemStyle: { opacity: number };
    }> = [];
    columns.forEach((c, x) =>
      c.members.forEach((isMember, y) => {
        if (isMember)
          cellData.push({
            value: [x, y, c.value],
            itemStyle: { opacity: dim(c) },
          });
        else dotData.push({ value: [x, y], itemStyle: { opacity: dim(c) } });
      }),
    );
    return { cells: cellData, dots: dotData };
  }, [columns, dim]);

  const tooltip = useCallback(
    (x: number) => {
      const c = columns[x];
      if (!c) return '';
      return [
        `<div style="font-weight:600">${escapeHtml(c.label)}</div>`,
        `<div><b>${formatCount(c.value)}</b> ${escapeHtml(unit)} · ${formatPercent(
          c.value,
          total,
        )} of ${formatCount(total)}</div>`,
        `<div style="color:${tokens.textMuted}">${escapeHtml(valueCaption)}</div>`,
      ].join('');
    },
    [columns, unit, total, tokens.textMuted, valueCaption],
  );

  // colour range from cells only: a column with no members ("No assays") has no cells
  const max = Math.max(1, ...cells.map((c) => c.value[2]));
  const matrixHeight = rows.length * ROW_HEIGHT;
  const height = 16 + BAR_HEIGHT + 12 + matrixHeight + 56;

  const option = useMemo((): EChartsOption => {
    const hiddenAxis = {
      type: 'category' as const,
      data: ids,
      axisLabel: { show: false },
      axisTick: { show: false },
      axisLine: { show: false },
    };
    return {
      ...theme.base,
      tooltip: {
        ...theme.base.tooltip,
        trigger: 'item',
        formatter: (p: unknown) =>
          tooltip(
            paramSeriesIndex(p) === 0
              ? paramDataIndex(p)
              : paramFirstCoordinate(p),
          ),
      },
      grid: [
        { left: LEFT, right: 16, top: 16, height: BAR_HEIGHT },
        {
          left: LEFT,
          right: 16,
          top: 16 + BAR_HEIGHT + 12,
          height: matrixHeight,
        },
      ],
      xAxis: [
        { ...hiddenAxis, gridIndex: 0 },
        { ...hiddenAxis, gridIndex: 1, splitArea: { show: false } },
      ],
      yAxis: [
        {
          type: 'value',
          gridIndex: 0,
          minInterval: 1,
          splitNumber: 3,
          axisLabel: {
            ...theme.axisLabel,
            formatter: (v: number) => formatCount(v),
          },
          splitLine: theme.splitLine,
        },
        {
          type: 'category',
          gridIndex: 1,
          data: [...rows],
          inverse: true,
          axisTick: { show: false },
          axisLine: { show: false },
          axisLabel: { ...theme.axisLabel, color: tokens.text },
        },
      ],
      visualMap: {
        type: 'continuous',
        seriesIndex: 1,
        min: 0,
        max,
        calculable: true,
        orient: 'horizontal',
        left: LEFT,
        bottom: 4,
        itemHeight: 140,
        itemWidth: 10,
        text: [`more ${unit}`, `fewer`],
        textStyle: { color: tokens.textMuted, fontSize: 11 },
        // low → high count runs light → dark
        inRange: { color: [...sequential].reverse() },
      },
      series: [
        {
          type: 'bar',
          xAxisIndex: 0,
          yAxisIndex: 0,
          barMaxWidth: 24,
          cursor: 'pointer',
          data: columns.map((c) => ({
            value: c.value,
            itemStyle: {
              color: tokens.series,
              opacity: dim(c),
              borderRadius: [4, 4, 0, 0],
            },
          })),
          label: {
            show: true,
            position: 'top',
            color: tokens.textMuted,
            fontSize: 11,
            formatter: (p: unknown) => formatCount(paramNumber(p)),
          },
          emphasis: { itemStyle: { color: tokens.focus } },
        },
        {
          type: 'heatmap',
          xAxisIndex: 1,
          yAxisIndex: 1,
          cursor: 'pointer',
          data: cells,
          // surface gap between cells, not a drawn border
          itemStyle: {
            borderColor: tokens.surface,
            borderWidth: 2,
            borderRadius: 3,
          },
          emphasis: {
            itemStyle: { borderColor: tokens.focus, borderWidth: 2 },
          },
        },
        {
          type: 'scatter',
          xAxisIndex: 1,
          yAxisIndex: 1,
          cursor: 'pointer',
          symbol: 'circle',
          symbolSize: 6,
          data: dots,
          itemStyle: { color: tokens.nonMember },
        },
      ],
    };
  }, [
    ids,
    theme,
    tooltip,
    rows,
    matrixHeight,
    tokens,
    max,
    unit,
    sequential,
    columns,
    dim,
    cells,
    dots,
  ]);

  const marks = useMemo<ChartMark[]>(
    () =>
      columns.map((c, i) => ({
        seriesIndex: 0,
        dataIndex: i,
        description: `${c.label}: ${formatCount(c.value)} ${unit}, ${formatPercent(c.value, total)}`,
        selected: c.id === selectedId,
        activatable: c.activatable !== false,
      })),
    [columns, unit, total, selectedId],
  );

  // any element in a column (bar, cell, dot) addresses that column
  const markFor = useCallback(
    (p: ClickParams) =>
      p.seriesIndex === 0
        ? (p.dataIndex ?? -1)
        : Array.isArray(p.value)
          ? Number(p.value[0])
          : -1,
    [],
  );

  // on narrow screens scroll sideways rather than squeeze columns below legibility
  const minWidth = LEFT + 16 + columns.length * MIN_COLUMN_WIDTH;
  return (
    <div className="overflow-x-auto">
      <div style={{ minWidth }}>
        <ChartCanvas
          option={option}
          height={height}
          label={label}
          marksLabel={marksLabel}
          marks={marks}
          markFor={markFor}
          onActivate={(i) => onSelect(columns[i].id)}
        />
      </div>
    </div>
  );
};
