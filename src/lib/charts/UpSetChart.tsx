import React, { useCallback, useMemo } from 'react';
import { ChartCanvas, type ChartMark, type ClickParams } from './ChartCanvas';
import { escapeHtml } from './categoryChart';
import { formatCount, formatPercent } from './data';
import { paramDataIndex, paramNumber, paramSeriesIndex } from './params';
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
const DOT_RADIUS = 7.5;
const LINK_WIDTH = 3;

// series order; click/tooltip mapping depends on it
const S_INTERSECTIONS = 0;
const S_MATRIX = 1;
const S_SET_SIZES = 2;

/** the part of ECharts' custom-series API we use */
interface CoordApi {
  coord: (data: number[]) => number[];
  value: (dimension: number) => unknown;
}

/**
 * UpSet plot: intersection sizes as columns, a dot matrix below (filled dot =
 * member, joined by a line; light dot = not a member) and set sizes as bars to the
 * left. Membership reads from dot presence and the connecting line, not colour.
 *
 * The whole matrix is one custom series that draws each column as a group, in a
 * fixed order (guide dots, then the line, then member dots) and with fully opaque
 * fills: a column's line and dots are always exactly one colour.
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
  // Dim unselected columns with a solid, lighter colour, never transparency.
  const colorOf = useCallback(
    (c: UpSetColumn | undefined) =>
      anySelected && c?.id !== selectedId ? tokens.seriesMuted : tokens.series,
    [anySelected, selectedId, tokens],
  );

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

  const renderColumn = useCallback(
    (_params: unknown, api: CoordApi) => {
      const x = Number(api.value(0));
      const column = columns[x];
      const fill = colorOf(column);
      const centres = rows.map((_, y) => api.coord([x, y]));
      const memberRows = rows.flatMap((_, y) => (column?.members[y] ? [y] : []));
      const dot = (y: number, color: string) => ({
        type: 'circle' as const,
        shape: { cx: centres[y][0], cy: centres[y][1], r: DOT_RADIUS },
        style: { fill: color, opacity: 1 },
        // hover must not restyle: emphasis is identical to normal
        emphasis: { style: { fill: color, opacity: 1 } },
      });
      const first = memberRows[0];
      const last = memberRows[memberRows.length - 1];
      return {
        type: 'group' as const,
        children: [
          ...rows.flatMap((_, y) => (column?.members[y] ? [] : [dot(y, tokens.nonMember)])),
          ...(memberRows.length > 1
            ? [
                {
                  type: 'line' as const,
                  shape: {
                    x1: centres[first][0],
                    y1: centres[first][1],
                    x2: centres[last][0],
                    y2: centres[last][1],
                  },
                  style: { stroke: fill, lineWidth: LINK_WIDTH, opacity: 1 },
                  emphasis: { style: { stroke: fill, lineWidth: LINK_WIDTH, opacity: 1 } },
                },
              ]
            : []),
          ...memberRows.map((y) => dot(y, fill)),
        ],
      };
    },
    [columns, rows, colorOf, tokens.nonMember],
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
        formatter: (p: unknown) =>
          paramSeriesIndex(p) === S_SET_SIZES
            ? setTooltip(paramDataIndex(p))
            : columnTooltip(paramDataIndex(p)),
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
            itemStyle: { color: colorOf(c), opacity: 1, borderRadius: [4, 4, 0, 0] },
          })),
          label: {
            show: true,
            position: 'top',
            color: tokens.textMuted,
            fontSize: 11,
            formatter: (p: unknown) => formatCount(paramNumber(p)),
          },
          // a column's bar, dots and line always share one colour: no hover/focus
          // recolouring or lightening (focus shows via tooltip and focus ring)
          emphasis: { disabled: true },
        },
        {
          type: 'custom',
          xAxisIndex: 1,
          yAxisIndex: 1,
          cursor: 'pointer',
          // one item per column: [column index, row 0 (positions the item)]
          encode: { x: 0, y: 1 },
          data: columns.map((_, x) => [x, 0]),
          renderItem: renderColumn,
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
          emphasis: { disabled: true },
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
    colorOf,
    renderColumn,
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

  // a column's bar or anywhere in its matrix group addresses that column
  const markFor = useCallback((p: ClickParams) => {
    if (p.seriesIndex === S_INTERSECTIONS || p.seriesIndex === S_MATRIX) {
      return p.dataIndex ?? -1;
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
