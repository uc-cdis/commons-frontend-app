'use client';

import React, { useEffect, useRef } from 'react';

type TimelineRow = {
  timestamp: string;
  eventType: 'WAF' | 'Audit' | 'Threat';
  severity: string;
  source: string;
  target: string;
  account: string;
  action: string;
};

type PerspectiveTimelineProps = {
  rows: TimelineRow[];
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

export default function PerspectiveTimeline({ rows }: PerspectiveTimelineProps) {
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

      if (!mounted || !viewerRef.current) {
        return;
      }

      const viewer = viewerRef.current;
      const normalized = rows.map((row) => ({
        ...row,
        timestampLocal: row.timestamp ? new Date(row.timestamp).toLocaleString() : '-',
      }));

      await viewer.load(normalized);
      await viewer.restore({
        plugin: 'Datagrid',
        settings: true,
        columns: ['timestampLocal', 'eventType', 'severity', 'source', 'target', 'account', 'action'],
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
    <div style={{ height: '100%', width: '100%' }}>
      <perspective-viewer
        ref={viewerRef as unknown as React.RefObject<HTMLElement>}
        className="gen3-theme"
        style={{ height: '100%', width: '100%' }}
      />
    </div>
  );
}
