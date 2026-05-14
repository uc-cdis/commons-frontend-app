'use client';

import React, { useEffect, useRef } from 'react';

type Bucket = {
  key: string;
  count: number;
};

type PerspectiveTopTableProps = {
  rows: Bucket[];
  title: string;
  height?: number;
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

export default function PerspectiveTopTable({ rows, title, height = 260 }: PerspectiveTopTableProps) {
  const viewerRef = useRef<PerspectiveViewerElement | null>(null);

  useEffect(() => {
    let mounted = true;

    async function init() {
      await Promise.all([
        import('@finos/perspective'),
        import('@finos/perspective-viewer'),
        import('@finos/perspective-viewer-datagrid'),
      ]);

      if (!mounted || !viewerRef.current) {
        return;
      }

      const viewer = viewerRef.current;
      const normalized = rows.map((row) => ({
        label: row.key || '-',
        count: Number(row.count || 0),
      }));

      if (normalized.length === 0) {
        return;
      }

      await viewer.load(normalized);
      await viewer.restore({
        plugin: 'Datagrid',
        settings: false,
        columns: ['label', 'count'],
        sort: [['count', 'desc']],
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
    <div>
      <h4 style={{ marginBottom: '0.75rem' }}>{title}</h4>
      <div
        style={{
          height: `${height}px`,
          width: '100%',
          border: '1px solid #e9ecef',
          borderRadius: 8,
          overflow: 'hidden',
          backgroundColor: '#fff',
        }}
      >
        {rows.length > 0 ? (
          <perspective-viewer ref={viewerRef as unknown as React.RefObject<HTMLElement>} style={{ height: '100%', width: '100%' }} />
        ) : (
          <div
            style={{
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#868e96',
              fontSize: '0.95rem',
            }}
          >
            No data available yet.
          </div>
        )}
      </div>
    </div>
  );
}
