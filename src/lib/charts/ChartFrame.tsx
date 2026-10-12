import React, { useId, type ReactNode } from 'react';
import { Button, Card, Group, LoadingOverlay, Skeleton, Text } from '@mantine/core';
import { formatCount } from './data';
import type { ChartStatus } from './types';

export interface DataTableRow {
  key: string;
  cells: ReadonlyArray<ReactNode>;
  selected?: boolean;
  /** omit for rows that can't be filtered on */
  onToggle?: () => void;
}

interface DataTableProps {
  caption: string;
  headers: ReadonlyArray<string>;
  rows: ReadonlyArray<DataTableRow>;
}

/**
 * The text fallback every chart carries: same numbers as the chart, with a filter
 * toggle per row so click-to-filter never depends on the canvas.
 */
export const DataTable = ({ caption, headers, rows }: DataTableProps) => (
  <details className="mt-2 text-sm">
    <summary className="cursor-pointer text-base-darkest hover:underline">
      Show data table
    </summary>
    <table className="mt-2 w-full border-collapse">
      <caption className="sr-only">{caption}</caption>
      <thead>
        <tr className="border-b border-base-dark text-left">
          {headers.map((h) => (
            <th key={h} scope="col" className="py-1 pr-2 font-semibold">
              {h}
            </th>
          ))}
          <th scope="col" className="py-1">
            <span className="sr-only">Filter</span>
          </th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.key} className="border-b border-base-lighter">
            {row.cells.map((cell, i) => (
              <td
                key={headers[i] ?? i}
                className={`py-1 pr-2 ${i > 0 ? 'tabular-nums' : ''}`}
              >
                {cell}
              </td>
            ))}
            <td className="py-1 text-right">
              {row.onToggle ? (
                <Button
                  size="compact-xs"
                  variant={row.selected ? 'filled' : 'subtle'}
                  color="primary"
                  aria-pressed={row.selected ?? false}
                  onClick={row.onToggle}
                >
                  {row.selected ? 'Remove filter' : 'Filter'}
                </Button>
              ) : null}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </details>
);

interface ChartFrameProps {
  title: string;
  /** plural noun, e.g. "donors" */
  unit: string;
  /** the denominator shown as "n = …"; undefined while unknown */
  total?: number;
  status: ChartStatus;
  isEmpty: boolean;
  /** e.g. "Menopausal Status is Post-menopausal"; shown while this chart filters the cohort */
  selectionLabel?: string;
  onClearSelection?: () => void;
  onRetry?: () => void;
  subtitle?: ReactNode;
  controls?: ReactNode;
  legend?: ReactNode;
  /** caption notes: suppression, truncation, what's excluded */
  notes?: ReadonlyArray<string>;
  table?: ReactNode;
  className?: string;
  children: ReactNode;
}

/**
 * Card chrome shared by every chart: title, count, selection banner and identical
 * loading / error / empty handling. Chart bodies render only when there is data.
 */
export const ChartFrame = ({
  title,
  unit,
  total,
  status,
  isEmpty,
  selectionLabel,
  onClearSelection,
  onRetry,
  subtitle,
  controls,
  legend,
  notes = [],
  table,
  className = '',
  children,
}: ChartFrameProps) => {
  const titleId = useId();
  const { isLoading, isFetching, isError } = status;
  let body: ReactNode;
  if (isError) {
    body = (
      <div role="alert" className="flex flex-col items-start gap-2 py-6">
        <Text size="sm">This chart couldn&apos;t load its data.</Text>
        {onRetry ? (
          <Button size="compact-sm" variant="outline" color="primary" onClick={onRetry}>
            Try again
          </Button>
        ) : null}
      </div>
    );
  } else if (isLoading) {
    body = (
      <div role="status" aria-busy="true" aria-label={`Loading ${title}`} className="py-2">
        <Skeleton height={14} width="60%" mb="sm" />
        <Skeleton height={140} />
      </div>
    );
  } else if (isEmpty) {
    body = (
      <Text size="sm" className="py-6 text-base-darkest">
        No {unit} you can access match the current filters.
      </Text>
    );
  } else {
    body = (
      <>
        {children}
        {legend}
        {notes.length > 0 ? (
          <ul className="mt-2 list-none p-0 text-xs text-base-darkest">
            {notes.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
        ) : null}
        {table}
      </>
    );
  }

  return (
    <Card
      component="section"
      aria-labelledby={titleId}
      aria-busy={isFetching}
      withBorder
      radius="md"
      padding="md"
      className={`relative h-full ${className}`}
    >
      <Group justify="space-between" align="flex-start" wrap="nowrap" gap="xs">
        <div>
          <Text component="h3" id={titleId} fw={700} size="md">
            {title}
          </Text>
          {subtitle ? (
            <Text size="xs" className="text-base-darkest">
              {subtitle}
            </Text>
          ) : null}
        </div>
        <Text size="xs" className="shrink-0 tabular-nums text-base-darkest" aria-live="polite">
          {total === undefined || isError ? '' : `n = ${formatCount(total)} ${unit}`}
        </Text>
      </Group>
      {controls ? <div className="mt-2">{controls}</div> : null}
      {selectionLabel ? (
        <output className="mt-2 flex items-center gap-2 rounded bg-primary-max px-2 py-1">
          <Text size="xs" className="grow">
            Filtering cohort: <strong>{selectionLabel}</strong>
          </Text>
          {onClearSelection ? (
            <Button
              size="compact-xs"
              variant="subtle"
              color="primary"
              onClick={onClearSelection}
              aria-label={`Clear ${title} filter`}
            >
              Clear
            </Button>
          ) : null}
        </output>
      ) : null}
      <div className="relative mt-2">
        <LoadingOverlay
          visible={isFetching && !isLoading}
          zIndex={2}
          overlayProps={{ blur: 0, backgroundOpacity: 0.4 }}
          loaderProps={{ size: 'sm' }}
        />
        {body}
      </div>
    </Card>
  );
};
