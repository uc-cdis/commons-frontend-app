import React, { useCallback, useMemo } from 'react';
import { ChartCanvas, type ChartMark, type ClickParams } from './ChartCanvas';
import { escapeHtml } from './categoryChart';
import { formatCount, formatPercent } from './data';
import { paramDataIndex, paramFirstCoordinate, paramNumber, paramSeriesIndex } from './params';
import type { EChartsOption } from './types';
import { useChartTheme } from './useChartTheme';

export interface UpSetColumn {
  id: string;
  label: string;
  value: number;
  /** one per row: is this row a member of the column's set? */
  members: ReadonlyArray<boolean>;
}

interface UpSetChartProps {
  /** set names, top to bottom */
  rows: ReadonlyArray<string>;
  /** size of each set (row), same order as rows */
  setSizes: ReadonlyArray<number>;
  /** intersections, already sorted */
  columns: ReadonlyArray<UpSetColumn>;
  unit: string;
  /** denominator for percentages */
  total: number;
  /** the finding, for screen readers */
  label: string;
  /** names the keyboard widget */
  marksLabel: string;
  /** tooltip line describing what a column's value means */
  valueCaption: string;
  /** tooltip line describing what a set's size means */
  setCaption: (row: string) => string;
  selectedId: string | null;
  onSelect: (columnId: string) => void;
}

const BAR_HEIGHT = 140;
const ROW_HEIGHT = 30;
const GAP = 8;
const TOP = 24;
const SET_WIDTH = 160;
// room left of the set bars for their count labels
const SET_LABEL_ROOM = 40;
const LABEL_WIDTH = 84;
const LEFT = 8 + SET_WIDTH + LABEL_WIDTH;
const MIN_COLUMN_WIDTH = 30;
const DOT = 15;

/** the part of ECharts' custom-series API we use */
interface CoordApi {
  coord: (data: number[]) => number[];
  value: (dimension: number) => unknown;
}

// series order (0 bars, 1 links, 2 non-members, 3 members, 4 set sizes);
// click/tooltip mapping depends on it
const S_INTERSECTIONS = 0;
const S_NON_MEMBERS = 2;
const S_MEMBERS = 3;
const S_SET_SIZES = 4;

/**
 * UpSet plot: intersection sizes as columns, a dot matrix below (filled dot =
 * member, joined by a line; light dot = not a member) and set sizes as bars to the
 * left. Membership reads from dot presence and the connecting line, not colour.
 */
export const UpSetChart = ({
  rows,
  setSizes,
  columns,
  unit,
  total,
  label,
  marksLabel,
  valueCaption,
  setCaption,
  selectedId,
  onSelect,
}: UpSetChartProps) => {
  const theme = useChartTheme();
  const { tokens } = theme;
  const ids = useMemo(() => columns.map((c) => c.id), [columns]);
  const anySelected = selectedId !== null;
  const opacityOf = useCallback(
    (c: UpSetColumn) => (anySelected && c.id !== selectedId ? 0.3 : 1),
    [anySelected, selectedId],
  );

  const matrix = useMemo(() => {
    const members: Array<{ value: [number, number]; itemStyle: { opacity: number } }> = [];
    const nonMembers: Array<{ value: [number, number] }> = [];
    // [column, first member row, last member row, opacity]
    const links: Array<[number, number, number, number]> = [];
    columns.forEach((c, x) => {
      const memberRows = c.members.flatMap((isMember, y) => (isMember ? [y] : []));
      c.members.forEach((isMember, y) => {
        if (isMember) members.push({ value: [x, y], itemStyle: { opacity: opacityOf(c) } });
        else nonMembers.push({ value: [x, y] });
      });
      if (memberRows.length > 1) {
        links.push([x, Math.min(...memberRows), Math.max(...memberRows), opacityOf(c)]);
      }
    });
    return { members, nonMembers, links };
  }, [columns, opacityOf]);

  const columnTooltip = useCallback(
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
  const setTooltip = useCallback(
    (y: number) =>
      rows[y] === undefined
        ? ''
        : [
            `<div style="font-weight:600">${escapeHtml(rows[y])}</div>`,
            `<div><b>${formatCount(setSizes[y] ?? 0)}</b> ${escapeHtml(unit)} · ${formatPercent(
              setSizes[y] ?? 0,
              total,
            )} of ${formatCount(total)}</div>`,
            `<div style="color:${tokens.textMuted}">${escapeHtml(setCaption(rows[y]))}</div>`,
          ].join(''),
    [rows, setSizes, unit, total, tokens.textMuted, setCaption],
  );

  const matrixHeight = rows.length * ROW_HEIGHT;
  const matrixTop = TOP + BAR_HEIGHT + GAP;
  const height = matrixTop + matrixHeight + 44;

  const option = useMemo((): EChartsOption => {
    const columnAxis = {
      type: 'category' as const,
      data: ids,
      axisLabel: { show: false },
      axisTick: { show: false },
      axisLine: { show: false },
    };
    const rowAxis = {
      type: 'category' as const,
      data: [...rows],
      inverse: true,
      axisTick: { show: false },
      axisLine: { show: false },
    };
    return {
      ...theme.base,
      tooltip: {
        ...theme.base.tooltip,
        trigger: 'item',
        formatter: (p: unknown) => {
          const s = paramSeriesIndex(p);
          if (s === S_SET_SIZES) return setTooltip(paramDataIndex(p));
          if (s === S_INTERSECTIONS) return columnTooltip(paramDataIndex(p));
          return columnTooltip(paramFirstCoordinate(p));
        },
      },
      grid: [
        { left: LEFT, right: 16, top: TOP, height: BAR_HEIGHT },
        { left: LEFT, right: 16, top: matrixTop, height: matrixHeight },
        {
          left: 8 + SET_LABEL_ROOM,
          width: SET_WIDTH - SET_LABEL_ROOM - 12,
          top: matrixTop,
          height: matrixHeight,
        },
      ],
      xAxis: [
        { ...columnAxis, gridIndex: 0 },
        { ...columnAxis, gridIndex: 1 },
        {
          type: 'value',
          gridIndex: 2,
          inverse: true, // set bars grow leftwards from the labels
          minInterval: 1,
          splitNumber: 2,
          name: `${unit} per modality`,
          nameLocation: 'middle',
          nameGap: 22,
          nameTextStyle: { color: tokens.textMuted, fontSize: 11 },
          axisLabel: { ...theme.axisLabel, fontSize: 10, formatter: (v: number) => formatCount(v) },
          axisLine: theme.axisLine,
          splitLine: { show: false },
        },
      ],
      yAxis: [
        {
          type: 'value',
          gridIndex: 0,
          minInterval: 1,
          splitNumber: 3,
          name: `${unit} per combination`,
          nameLocation: 'middle',
          nameGap: 44,
          nameTextStyle: { color: tokens.textMuted, fontSize: 11 },
          axisLabel: { ...theme.axisLabel, formatter: (v: number) => formatCount(v) },
          axisLine: theme.axisLine,
          splitLine: theme.splitLine,
        },
        {
          ...rowAxis,
          gridIndex: 1,
          axisLabel: { ...theme.axisLabel, color: tokens.text, fontSize: 12, margin: 12 },
          splitArea: { show: true, areaStyle: { color: [tokens.rowStripe, tokens.surface] } },
        },
        { ...rowAxis, gridIndex: 2, axisLabel: { show: false } },
      ],
      series: [
        {
          type: 'bar',
          xAxisIndex: 0,
          yAxisIndex: 0,
          barMaxWidth: 22,
          cursor: 'pointer',
          data: columns.map((c) => ({
            value: c.value,
            itemStyle: { color: tokens.series, opacity: opacityOf(c), borderRadius: [4, 4, 0, 0] },
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
          // drawn with api.coord, the same mapping the dots use, so the line runs
          // through dot centres exactly (the 'lines' series maps category values
          // slightly differently)
          type: 'custom',
          xAxisIndex: 1,
          yAxisIndex: 1,
          silent: true,
          z: 2,
          data: matrix.links,
          renderItem: (_params: unknown, api: CoordApi) => {
            const v = (d: number) => Number(api.value(d));
            const [x1, y1] = api.coord([v(0), v(1)]);
            const [x2, y2] = api.coord([v(0), v(2)]);
            return {
              type: 'line' as const,
              shape: { x1, y1, x2, y2 },
              style: { stroke: tokens.series, lineWidth: 3, opacity: v(3) },
            };
          },
        },
        {
          type: 'scatter',
          xAxisIndex: 1,
          yAxisIndex: 1,
          cursor: 'pointer',
          symbolSize: DOT,
          z: 1,
          itemStyle: { color: tokens.nonMember },
          emphasis: { disabled: true },
          data: matrix.nonMembers,
        },
        {
          type: 'scatter',
          xAxisIndex: 1,
          yAxisIndex: 1,
          cursor: 'pointer',
          symbolSize: DOT,
          z: 3,
          itemStyle: { color: tokens.series },
          emphasis: { itemStyle: { color: tokens.focus } },
          data: matrix.members,
        },
        {
          type: 'bar',
          xAxisIndex: 2,
          yAxisIndex: 2,
          barMaxWidth: 16,
          data: setSizes.map((v) => ({
            value: v,
            itemStyle: { color: tokens.series, borderRadius: [4, 0, 0, 4] },
          })),
          label: {
            show: true,
            position: 'left',
            color: tokens.textMuted,
            fontSize: 10,
            formatter: (p: unknown) => formatCount(paramNumber(p)),
          },
        },
      ],
    };
  }, [
    ids,
    rows,
    theme,
    tokens,
    unit,
    matrixTop,
    matrixHeight,
    columns,
    opacityOf,
    matrix,
    setSizes,
    setTooltip,
    columnTooltip,
  ]);

  const marks = useMemo<ChartMark[]>(
    () =>
      columns.map((c, i) => ({
        seriesIndex: S_INTERSECTIONS,
        dataIndex: i,
        description: `${c.label}: ${formatCount(c.value)} ${unit}, ${formatPercent(c.value, total)}`,
        selected: c.id === selectedId,
      })),
    [columns, unit, total, selectedId],
  );

  // any element in a column (bar or dot) addresses that column; set bars and links don't
  const markFor = useCallback((p: ClickParams) => {
    if (p.seriesIndex === S_INTERSECTIONS) return p.dataIndex ?? -1;
    if (p.seriesIndex === S_MEMBERS || p.seriesIndex === S_NON_MEMBERS) {
      return paramFirstCoordinate(p);
    }
    return -1;
  }, []);

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

