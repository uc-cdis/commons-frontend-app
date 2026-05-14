'use client';

import React, { useEffect, useRef } from 'react';

type UnifiedEvent = {
  timestamp: string;
  eventType: string;
  severity: string;
  source: string;
  target: string;
  account: string;
  action: string;
};

type PerspectiveCrossTableProps = {
  rows: UnifiedEvent[];
  height?: string;
};

type PerspectiveViewerElement = HTMLElement & {
  load: (data: unknown) => Promise<void>;
  restore: (config: unknown) => Promise<void>;
  delete?: () => Promise<void>;
};

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'perspective-viewer': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    }
  }
}

export default function PerspectiveCrossTable({
  rows,
  height = 'calc(100vh - 360px)',
}: PerspectiveCrossTableProps) {
  const viewerRef = useRef<PerspectiveViewerElement | null>(null);

  const toPrimitive = (value: unknown): string | number | boolean | null => {
    if (
      value === null ||
      typeof value === 'string' ||
      typeof value === 'number' ||
      typeof value === 'boolean'
    ) {
      return value;
    }
    if (value === undefined) {
      return '-';
    }
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  };

  useEffect(() => {
    let mounted = true;

    async function init() {
      await Promise.all([
        import('@finos/perspective/dist/esm/perspective.inline.js'),
        import('@finos/perspective-viewer/dist/esm/perspective-viewer.inline.js'),
        import('@finos/perspective-viewer-datagrid'),
        import('@finos/perspective-viewer-d3fc'),
      ]);

      if (!mounted || !viewerRef.current) return;

      const viewer = viewerRef.current;
      const normalized = rows.map((row) => {
        const entry = Object.fromEntries(
          Object.entries(row as Record<string, unknown>).map(([key, value]) => [
            key,
            toPrimitive(value),
          ])
        );

        return {
          ...entry,
          timestampLocal: row.timestamp ? new Date(row.timestamp).toLocaleString() : '-',
        };
      });

      await viewer.load(normalized);
      await viewer.restore({
        plugin: 'Datagrid',
        settings: true,
        columns: [
          'timestampLocal',
          'eventType',
          'severity',
          'sourceIndex',
          'src_ip',
          'source',
          'target',
          'account',
          'action',
          'event_source',
          'rule_id',
          'pattern_type',
          'drsUri',
        ],
        sort: [['timestampLocal', 'desc']],
      });
    }

    init();

    return () => {
      mounted = false;
      if (viewerRef.current?.delete) {
        viewerRef.current.delete();
      }
    };
  }, [rows]);

  return (
    <div style={{ height, width: '100%' }}>
      <perspective-viewer
        ref={viewerRef as unknown as React.RefObject<HTMLElement>}
        className="gen3-theme"
        style={{ height: '100%', width: '100%' }}
      />
    </div>
  );
}
