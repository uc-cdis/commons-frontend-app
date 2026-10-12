import React, { useCallback, useMemo } from 'react';
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
  useStableSlots,
} from './categoryChart';
import { formatPercent, groupTail, OTHER_KEY, summarise } from './data';
import { DECAL_PATTERNS, decalInkFor, MAX_CATEGORICAL } from './theme';
import type { CategoryChartProps, CategoryDatum, EChartsOption } from './types';
import { paramDataIndex } from './params';
import { useChartTheme } from './useChartTheme';

/**
 * Full pie for low-cardinality fields. Slices carry hue (Okabe–Ito), texture and a
 * direct label, so identity never rests on colour alone. Beyond eight real
 * categories the tail folds into "Other"; placeholders are neutral and untextured.
 */
export const PieChart = ({
  title,
  unit,
  distribution,
  status,
  selected,
  onSelect,
  onClearSelection,
  onRetry,
  className,
}: CategoryChartProps) => {
  const theme = useChartTheme();
  const { tokens, categorical } = theme;
  const { hidden, toggle, hovered, setHovered } = useLegendState();

  const grouped = useMemo(() => groupTail(distribution, MAX_CATEGORICAL), [distribution]);
  const realKeys = useMemo(
    () => grouped.data.filter((d) => !d.isPlaceholder).map((d) => d.key),
    [grouped],
  );
  const slots = useStableSlots(realKeys, MAX_CATEGORICAL);

  const colorOf = useCallback(
    (d: CategoryDatum): string =>
      d.isPlaceholder ? tokens.placeholder : categorical[slots.get(d.key) ?? 0],
    [slots, tokens, categorical],
  );
  const decalOf = useCallback(
    (d: CategoryDatum) => {
      const pattern = d.isPlaceholder ? null : DECAL_PATTERNS[slots.get(d.key) ?? 0];
      return pattern
        ? { ...pattern, color: decalInkFor(colorOf(d)) }
        : { symbol: 'none' as const };
    },
    [slots, colorOf],
  );

  // suppressed counts can't size a slice; they stay in the legend and table
  const drawn = useMemo(
    () => grouped.data.filter((d) => !hidden.has(d.key) && d.count !== null && d.count > 0),
    [grouped, hidden],
  );
  const anySelected = selected.size > 0;

  const option = useMemo(
    (): EChartsOption => ({
      ...theme.base,
      tooltip: {
        ...theme.base.tooltip,
        trigger: 'item',
        formatter: (p: unknown) => {
          const d = drawn[paramDataIndex(p)];
          return d ? tooltipHtml(d, unit, distribution.total) : '';
        },
      },
      series: [
        {
          type: 'pie',
          radius: ['0%', '58%'],
          center: ['50%', '52%'],
          cursor: 'pointer',
          selectedMode: 'multiple',
          selectedOffset: 8,
          avoidLabelOverlap: true,
          // surface gap between slices instead of a drawn border
          itemStyle: { borderColor: tokens.surface, borderWidth: 2 },
          label: {
            show: true,
            color: tokens.text,
            fontSize: 11,
            width: 96,
            overflow: 'break',
            formatter: (p: unknown) => {
              const d = drawn[paramDataIndex(p)];
              return d ? `${d.label}\n${formatPercent(d.count, distribution.total)}` : '';
            },
          },
          labelLine: { lineStyle: { color: tokens.grid }, length: 8, length2: 8 },
          emphasis: { scale: true, scaleSize: 6 },
          data: drawn.map((d) => ({
            name: d.label,
            value: d.count ?? 0, // drawn excludes suppressed (null) counts
            selected: anySelected && isSelected(d, selected),
            itemStyle: {
              color: colorOf(d),
              decal: decalOf(d),
              opacity: anySelected && !isSelected(d, selected) ? 0.35 : 1,
            },
          })),
        },
      ],
    }),
    [drawn, theme, tokens, colorOf, decalOf, anySelected, selected, unit, distribution.total],
  );

  const marks = useMemo<ChartMark[]>(
    () =>
      drawn.map((d, i) => ({
        seriesIndex: 0,
        dataIndex: i,
        description: describe(d, unit, distribution.total),
        selected: isSelected(d, selected),
      })),
    [drawn, unit, distribution.total, selected],
  );
  const hoveredIndex = hovered === null ? -1 : drawn.findIndex((d) => d.key === hovered);
  const selectedLabels = grouped.data
    .flatMap((d) => (d.members ? d.members : [d]))
    .filter((d) => selected.has(d.key))
    .map((d) => d.label);
  const extraSelected = [...selected].filter(
    (k) => !distribution.data.some((d) => d.key === k),
  );
  const other = grouped.data.find((d) => d.key === OTHER_KEY);

  return (
    <ChartFrame
      title={title}
      unit={unit}
      total={distribution.total}
      status={status}
      isEmpty={distribution.data.length === 0}
      selectionLabel={anySelected ? [...selectedLabels, ...extraSelected].join(', ') : undefined}
      onClearSelection={onClearSelection}
      onRetry={onRetry}
      className={className}
      notes={[
        ...suppressionNote(distribution),
        ...(other ? [`"Other" groups ${other.members?.length ?? 0} smaller categories.`] : []),
        ...(hidden.size > 0 ? [`${hidden.size} hidden via the legend.`] : []),
      ]}
      legend={
        <CategoryLegend
          items={grouped.data.map((d) => ({
            key: d.key,
            label: d.label,
            color: d.count === null ? undefined : colorOf(d),
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
      <ChartCanvas
        option={option}
        height={240}
        label={summarise(title, unit, distribution, selected)}
        marksLabel={`${title} values`}
        marks={marks}
        highlight={hoveredIndex >= 0 ? hoveredIndex : null}
        onActivate={(i) => onSelect(keysOf(drawn[i]))}
      />
    </ChartFrame>
  );
};
