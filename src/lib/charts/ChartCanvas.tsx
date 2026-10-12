import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import { ReactECharts, type ReactEChartsProps } from '@gen3/frontend';
import type { EChartsOption } from './types';
import { useStableHandler } from './hooks';

/** One keyboard/pointer-addressable mark in the chart. */
export interface ChartMark {
  seriesIndex: number;
  dataIndex: number;
  /** what a screen reader hears when this mark has focus */
  description: string;
  /** whether this mark is part of the chart's current cohort filter */
  selected?: boolean;
  /** false for marks that can't become a filter */
  activatable?: boolean;
}

export interface ClickParams {
  seriesIndex?: number;
  dataIndex?: number;
  value?: unknown;
}

interface ChartCanvasProps {
  option: EChartsOption;
  height: number;
  /** the finding, stated as a sentence; required so no chart ships unlabelled */
  label: string;
  /** names the keyboard widget, e.g. "Menopausal Status values" */
  marksLabel: string;
  marks: ReadonlyArray<ChartMark>;
  onActivate?: (markIndex: number) => void;
  /** a mark to highlight from outside (legend hover/focus) */
  highlight?: number | null;
  /** map a click on any element to a mark (e.g. a heatmap cell to its column) */
  markFor?: (params: ClickParams) => number;
}

type EChartsHandleRef = NonNullable<ReactEChartsProps['ref']>;

// notMerge so data that disappears after a filter change really leaves the chart
const SETTINGS = { notMerge: true };

/**
 * Wraps the framework's ReactECharts with the chart layer's accessibility contract:
 * - the chart is role="img" with a label stating the finding;
 * - a listbox overlays it for keyboards: arrows move between marks (the focused
 *   mark is highlighted and its tooltip shown), Enter/Space toggles it in the cohort
 *   filter, Escape leaves; options mirror the marks so screen readers hear each one.
 * The overlay ignores the pointer, so mouse hover and click reach the canvas.
 */
export const ChartCanvas = ({
  option,
  height,
  label,
  marksLabel,
  marks,
  onActivate,
  highlight = null,
  markFor,
}: ChartCanvasProps) => {
  const chartRef: EChartsHandleRef = useRef(null);
  const idPrefix = useId();
  const [focused, setFocused] = useState<number | null>(null);
  // focus survives data changes only while it still points at a mark
  const focusedIndex = focused !== null && focused < marks.length ? focused : null;

  const activate = useStableHandler((params: ClickParams) => {
    const i = markFor
      ? markFor(params)
      : marks.findIndex(
          (m) => m.seriesIndex === params.seriesIndex && m.dataIndex === params.dataIndex,
        );
    if (i >= 0 && marks[i] && marks[i].activatable !== false) onActivate?.(i);
  });
  // stable identity: the wrapper binds events once (see useStableHandler)
  const events = useMemo(() => ({ click: activate }), [activate]);

  const target = focusedIndex ?? highlight;
  useEffect(() => {
    const chart = chartRef.current?.getEchartsInstance();
    const mark = target === null ? undefined : marks[target];
    if (!chart || !mark) return undefined;
    const at = { seriesIndex: mark.seriesIndex, dataIndex: mark.dataIndex };
    chart.dispatchAction({ type: 'highlight', ...at });
    if (focusedIndex !== null) chart.dispatchAction({ type: 'showTip', ...at });
    return () => {
      chart.dispatchAction({ type: 'downplay', ...at });
      chart.dispatchAction({ type: 'hideTip' });
    };
  }, [target, focusedIndex, marks]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (marks.length === 0) return;
    const last = marks.length - 1;
    const cur = focusedIndex ?? -1;
    const move = (i: number) => {
      e.preventDefault();
      setFocused(Math.max(0, Math.min(last, i)));
    };
    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        move(cur + 1);
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        move(cur < 0 ? 0 : cur - 1);
        break;
      case 'Home':
        move(0);
        break;
      case 'End':
        move(last);
        break;
      case 'Enter':
      case ' ':
        if (focusedIndex !== null && marks[focusedIndex].activatable !== false) {
          e.preventDefault();
          onActivate?.(focusedIndex);
        }
        break;
      case 'Escape':
        setFocused(null);
        break;
      default:
        break;
    }
  };

  const optionId = (i: number) => `${idPrefix}-mark-${i}`;
  return (
    <div className="relative" style={{ height }}>
      <div role="img" aria-label={label} style={{ height }}>
        <ReactECharts
          option={option}
          settings={SETTINGS}
          events={events}
          ref={chartRef}
          theme="gen3"
          style={{ height }}
        />
      </div>
      <div
        role="listbox"
        tabIndex={0}
        aria-label={`${marksLabel}. Arrow keys move between values; Enter adds or removes the value from the cohort filter.`}
        aria-multiselectable="true"
        aria-activedescendant={focusedIndex === null ? undefined : optionId(focusedIndex)}
        onKeyDown={onKeyDown}
        onBlur={() => setFocused(null)}
        className="pointer-events-none absolute inset-0 rounded outline-none focus-visible:ring-2 focus-visible:ring-accent-dark"
      >
        {marks.map((m, i) => (
          <div
            key={optionId(i)}
            id={optionId(i)}
            role="option"
            aria-selected={m.selected ?? false}
            aria-disabled={m.activatable === false}
            className="sr-only"
          >
            {m.description}
            {m.activatable === false ? ' (cannot be used as a filter)' : ''}
          </div>
        ))}
      </div>
    </div>
  );
};
