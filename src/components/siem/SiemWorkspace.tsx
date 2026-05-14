'use client';

import React, { useEffect, useRef, useState } from 'react';

type UnifiedEvent = {
  timestamp: string;
  eventType: string;
  severity: string;
  source: string;
  target: string;
  account: string;
  action: string;
};

type SiemWorkspaceProps = {
  rows: UnifiedEvent[];
  workspaceConfig?: Record<string, unknown>;
};

type PSPWorkspaceElement = HTMLElement & {
  tables: Map<string, unknown>;
  restore: (config: unknown) => Promise<void>;
  flush: () => Promise<void>;
};

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'perspective-workspace': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      >;
    }
  }
}

export default function SiemWorkspace({ rows, workspaceConfig }: SiemWorkspaceProps) {
  const wsRef = useRef<PSPWorkspaceElement | null>(null);
  const [initError, setInitError] = useState<string | null>(null);

  const defaultWorkspaceConfig: Record<string, unknown> = {
    sizes: [0, 1],
    master: {
      widgets: [],
      sizes: [],
    },
    detail: {
      main: {
        type: 'split-area',
        orientation: 'vertical',
        sizes: [0.35, 0.65],
        children: [
          { type: 'tab-area', widgets: ['v0'], currentIndex: 0 },
          { type: 'tab-area', widgets: ['v1'], currentIndex: 0 },
        ],
      },
      sizes: [1],
    },
    viewers: {
      v0: {
        title: 'Event Velocity',
        table: 'events',
        plugin: 'Y Line',
        group_by: ['timeSlot'],
        split_by: ['eventType'],
        aggregates: { count: 'sum' },
        columns: ['count'],
        settings: true,
      },
      v1: {
        title: 'Event Log',
        table: 'events',
        plugin: 'Datagrid',
        columns: ['timestampLocal', 'eventType', 'severity', 'source', 'target', 'account', 'action'],
        sort: [['timestampLocal', 'desc']],
        settings: true,
      },
    },
  };

  useEffect(() => {
    let mounted = true;

    async function init() {
      try {
        setInitError(null);

        const [perspMod] = await Promise.all([
          import('@finos/perspective/dist/esm/perspective.inline.js'),
          import('@finos/perspective-viewer/dist/esm/perspective-viewer.inline.js'),
          import('@finos/perspective-viewer-datagrid'),
          import('@finos/perspective-viewer-d3fc'),
          import('@finos/perspective-workspace'),
        ]);

        if (!mounted || !wsRef.current) return;

        const workspace = wsRef.current;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const perspective = (perspMod as any).default ?? perspMod;

        // Enrich rows with derived fields used by both views.
        const tableData = rows.map((row) => ({
          ...row,
          name: (row as Record<string, unknown>).name ?? row.source ?? '-',
          src_ip: (row as Record<string, unknown>).src_ip ?? row.source ?? '-',
          event_source: (row as Record<string, unknown>).event_source ?? '-',
          rule_id: (row as Record<string, unknown>).rule_id ?? '-',
          pattern_type: (row as Record<string, unknown>).pattern_type ?? '-',
          sourceIndex: (row as Record<string, unknown>).sourceIndex ?? '-',
          timestampLocal: row.timestamp
            ? new Date(row.timestamp).toLocaleString()
            : '-',
          count: 1,
          // Minute-granularity bucket  "YYYY-MM-DD HH:mm"  → readable X-axis labels
          timeSlot: row.timestamp
            ? new Date(row.timestamp).toISOString().slice(0, 16).replace('T', ' ')
            : '?',
        }));

        const worker = await perspective.worker();
        const schema = {
          timestamp: 'string',
          eventType: 'string',
          severity: 'string',
          source: 'string',
          target: 'string',
          account: 'string',
          action: 'string',
          name: 'string',
          src_ip: 'string',
          event_source: 'string',
          rule_id: 'string',
          pattern_type: 'string',
          sourceIndex: 'string',
          timestampLocal: 'string',
          timeSlot: 'string',
          count: 'integer',
        } as const;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const table = await worker.table(schema as any);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await table.update(tableData as any);
        workspace.tables.set('events', table);

        await workspace.restore(workspaceConfig ?? defaultWorkspaceConfig);
        await workspace.flush();
      } catch (error: unknown) {
        const message =
          error instanceof Error
            ? error.message
            : 'Failed to initialize Perspective workspace';
        console.error('[SIEM] Perspective workspace init failed:', error);
        if (mounted) {
          setInitError(message);
        }
      }
    }

    init();

    return () => {
      mounted = false;
    };
  }, [rows, workspaceConfig]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <perspective-workspace
        ref={wsRef as unknown as React.RefObject<HTMLElement>}
        style={{ display: 'block', width: '100%', height: '100%' }}
      />
      {initError ? (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            padding: '20px',
            color: '#a4343a',
            background: 'rgba(253, 252, 251, 0.92)',
            fontSize: '14px',
          }}
        >
          Perspective workspace failed to initialize: {initError}
        </div>
      ) : null}
    </div>
  );
}
