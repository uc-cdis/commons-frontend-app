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

type PerspectiveChartPanelProps = {
  rows: UnifiedEvent[];
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

export default function PerspectiveChartPanel({ rows }: PerspectiveChartPanelProps) {
  const viewerRef = useRef<PerspectiveViewerElement | null>(null);

  useEffect(() => {
    let mounted = true;

    async function init() {
      await Promise.all([
        import('@finos/perspective'),
        import('@finos/perspective-viewer'),
        import('@finos/perspective-viewer-datagrid'),
        import('@finos/perspective-viewer-d3fc'),
      ]);

      if (!mounted || !viewerRef.current) return;

      const viewer = viewerRef.current;
      const normalized = rows.map((row) => ({
        ...row,
        timestampLocal: row.timestamp ? new Date(row.timestamp).toLocaleString() : '-',
        count: 1,
      }));

      await viewer.load(normalized);
      await viewer.restore({
        plugin: 'Y Bar',
        settings: false,
        group_by: ['eventType'],
        aggregates: { count: 'sum' },
        columns: ['count'],
        sort: [],
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
    <div style={{ height: '100%', width: '100%' }}>
      <perspective-viewer
        ref={viewerRef as unknown as React.RefObject<HTMLElement>}
        className="gen3-theme"
        style={{ height: '100%', width: '100%' }}
      />
    </div>
  );
}
