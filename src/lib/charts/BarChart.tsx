import React, { useMemo } from 'react';
import { useElementSize } from '@mantine/hooks';
import { fitCategoryLabels, measureText } from './axisLabels';
import { CategoryLegend } from './CategoryLegend';
import { ChartCanvas, type ChartMark } from './ChartCanvas';
import { ChartFrame } from './ChartFrame';
import {
  CategoryTable,
  describe,
  isSelected,
  keysOf,
  suppressionNote,
  tooltipHtml,
  useLegendState,
} from './categoryChart';
import { formatCount, summarise } from './data';
import type { CategoryChartProps, EChartsOption } from './types';
import { paramDataIndex, paramNumber } from './params';
import { CHART_FONT_FAMILY } from './theme';
import { useChartTheme } from './useChartTheme';

export type BarOrientation = 'horizontal' | 'vertical';

interface BarChartProps extends CategoryChartProps {
  orientation?: BarOrientation;
}

// height per category on horizontal bars: room for a thick bar plus a gap
const ROW = 34;
// vertical bars: plot width ≈ chart width minus grid padding and the value axis labels
const VALUE_AXIS_ROOM = 50;
const VERTICAL_HEIGHT = 240;

/**
 * Single-series bar chart. Categories are told apart by position and label, so the
 * bars share one hue; placeholders ("Unknown", "no data") are drawn neutral.
 */
export const BarChart = ({
  title,
  unit,
  distribution,
  status,
  selected,
  onSelect,
  onClearSelection,
  onRetry,
  className,
  orientation = 'vertical',
}: BarChartProps) => {
  const theme = useChartTheme();
  const { tokens } = theme;
  const { hidden, toggle, hovered, setHovered } = useLegendState();
  const horizontal = orientation === 'horizontal';

  const visible = useMemo(
    () => distribution.data.filter((d) => !hidden.has(d.key)),
    [distribution, hidden],
  );
  const anySelected = selected.size > 0;
  const categoryLabels = useMemo(
    () =>
      visible.map((d) =>
        d.count === null ? `${d.label} (suppressed)` : d.label,
      ),
    [visible],
  );
  // vertical bars: category labels horizontal by default, vertical only if they'd collide
  const { ref: sizeRef, width } = useElementSize();
  const labelFit = useMemo(
    () =>
      fitCategoryLabels(
        categoryLabels,
        Math.max(1, width - VALUE_AXIS_ROOM),
        measureText(`${theme.axisLabel.fontSize}px ${CHART_FONT_FAMILY}`),
      ),
    [categoryLabels, width, theme.axisLabel.fontSize],
  );

  const option = useMemo((): EChartsOption => {
    const categoryAxis = {
      type: 'category' as const,
      data: categoryLabels,
      inverse: horizontal, // largest at the top
      axisTick: { show: false },
      axisLine: theme.axisLine,
      axisLabel: {
        ...theme.axisLabel,
        // horizontal bars: one line, truncated (full name in tooltip/table);
        // vertical bars: labels read left to right unless they'd collide, then
        // turn vertical (truncated past a cap)
        width: horizontal ? 130 : labelFit.width,
        overflow: 'truncate' as const,
        rotate: !horizontal && labelFit.vertical ? 90 : 0,
        interval: 0,
      },
    };
    const valueAxis = {
      type: 'value' as const,
      minInterval: 1,
      axisLabel: {
        ...theme.axisLabel,
        formatter: (v: number) => formatCount(v),
      },
      splitLine: theme.splitLine,
    };
    return {
      ...theme.base,
      grid: {
        left: 8,
        right: horizontal ? 48 : 8,
        top: 16,
        // rotated labels: ECharts under-reserves their length by a glyph or two
        bottom: !horizontal && labelFit.vertical ? 20 : 4,
        containLabel: true,
      },
      xAxis: horizontal ? valueAxis : categoryAxis,
      yAxis: horizontal ? categoryAxis : valueAxis,
      tooltip: {
        ...theme.base.tooltip,
        trigger: 'item',
        formatter: (p: unknown) => {
          const d = visible[paramDataIndex(p)];
          return d ? tooltipHtml(d, unit, distribution.total) : '';
        },
      },
      series: [
        {
          type: 'bar',
          ...theme.bar,
          cursor: 'pointer',
          data: visible.map((d) => ({
            value: d.count ?? '-',
            itemStyle: {
              color: d.isPlaceholder ? tokens.placeholder : tokens.series,
              opacity: anySelected && !isSelected(d, selected) ? 0.35 : 1,
              borderRadius: horizontal ? [0, 4, 4, 0] : [4, 4, 0, 0],
            },
          })),
          label: {
            show: true,
            position: horizontal ? 'right' : 'top',
            color: tokens.textMuted,
            fontSize: 11,
            formatter: (p: unknown) => {
              const v = paramNumber(p);
              return v === null ? '' : formatCount(v);
            },
          },
          emphasis: { itemStyle: { color: tokens.focus } },
        },
      ],
    };
  }, [
    visible,
    categoryLabels,
    labelFit,
    horizontal,
    theme,
    tokens,
    anySelected,
    selected,
    unit,
    distribution.total,
  ]);

  const marks = useMemo<ChartMark[]>(
    () =>
      visible.map((d, i) => ({
        seriesIndex: 0,
        dataIndex: i,
        description: describe(d, unit, distribution.total),
        selected: isSelected(d, selected),
      })),
    [visible, unit, distribution.total, selected],
  );

  const hoveredIndex =
    hovered === null ? null : visible.findIndex((d) => d.key === hovered);
  // vertical labels take height from the plot, so the chart grows by their length
  const height = horizontal
    ? Math.max(140, visible.length * ROW + 40)
    : VERTICAL_HEIGHT + (labelFit.vertical ? labelFit.width : 0);
  const selectedLabels = distribution.data
    .filter((d) => selected.has(d.key))
    .map((d) => d.label);
  const extraSelected = [...selected].filter(
    (k) => !distribution.data.some((d) => d.key === k),
  );

  return (
    <ChartFrame
      title={title}
      unit={unit}
      total={distribution.total}
      status={status}
      isEmpty={distribution.data.length === 0}
      selectionLabel={
        anySelected
          ? [...selectedLabels, ...extraSelected].join(', ')
          : undefined
      }
      onClearSelection={onClearSelection}
      onRetry={onRetry}
      className={className}
      notes={[
        ...suppressionNote(distribution),
        ...(hidden.size > 0 ? [`${hidden.size} hidden via the legend.`] : []),
      ]}
      legend={
        <CategoryLegend
          items={distribution.data.map((d) => ({
            key: d.key,
            label: d.label,
            hidden: hidden.has(d.key),
            note: d.count === null ? 'suppressed' : undefined,
          }))}
          onToggle={toggle}
          onHover={setHovered}
        />
      }
      table={
        <CategoryTable
          title={title}
          unit={unit}
          distribution={distribution}
          selected={selected}
          onSelect={onSelect}
        />
      }
    >
      <div ref={sizeRef} className="w-full">
        <ChartCanvas
          option={option}
          height={height}
          label={summarise(title, unit, distribution, selected)}
          marksLabel={`${title} values`}
          marks={marks}
          highlight={
            hoveredIndex !== null && hoveredIndex >= 0 ? hoveredIndex : null
          }
          onActivate={(i) => onSelect(keysOf(visible[i]))}
        />
      </div>
    </ChartFrame>
  );
};
