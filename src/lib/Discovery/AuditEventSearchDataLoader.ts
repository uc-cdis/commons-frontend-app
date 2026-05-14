import { useEffect, useMemo, useState } from 'react';

import type { JSONObject } from '@gen3/core';
import type {
  DiscoverDataHookResponse,
  DiscoveryTableDataHook,
} from '@gen3/frontend/dist/dts/features/Discovery/types';

type AuditEventRow = {
  submitter_id?: string;
  timestamp?: string;
  action_name?: string;
  event_source?: string;
  result?: string;
  cloud_account_id?: string;
  cloud_region?: string;
};

type SearchResponse = {
  rows?: AuditEventRow[];
};

const EMPTY_STATUS = {
  isFetching: false,
  isLoading: false,
  isUninitialized: true,
  isSuccess: false,
  isError: false,
};

const mapAuditEvent = (row: AuditEventRow): JSONObject => ({
  _hdp_uid: row.submitter_id ?? '',
  _unique_id: row.submitter_id ?? 'n/a',
  full_name: row.action_name ?? 'n/a',
  study_title: row.event_source ?? 'n/a',
  source: row.cloud_account_id ?? 'n/a',
  event_name: row.result ?? row.action_name ?? 'n/a',
  event_time: row.timestamp ?? 'n/a',
  study_description: [
    row.action_name,
    row.result,
    row.cloud_region,
    row.timestamp,
  ]
    .filter(Boolean)
    .join(' | ') || 'No event summary available.',
  authz: [],
  tags: [],
  data_availability: 'available',
});

const includesKeyword = (value: unknown, keyword: string) =>
  typeof value === 'string' && value.toLowerCase().includes(keyword);

export const useAuditEventSearchData: DiscoveryTableDataHook = ({
  pagination,
  searchTerms,
}): DiscoverDataHookResponse => {
  const [rows, setRows] = useState<JSONObject[]>([]);
  const [dataRequestStatus, setDataRequestStatus] = useState(EMPTY_STATUS);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setDataRequestStatus({
        isFetching: true,
        isLoading: true,
        isUninitialized: false,
        isSuccess: false,
        isError: false,
      });

      try {
        const response = await fetch('/search/audit_event/query', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': 'true',
          },
          body: JSON.stringify({
            select: [
              'submitter_id',
              'timestamp',
              'action_name',
              'event_source',
              'result',
              'cloud_account_id',
              'cloud_region',
            ],
            page: { limit: 1000, offset: 0 },
          }),
        });

        if (!response.ok) {
          throw new Error(`Search request failed with status ${response.status}`);
        }

        const data = ((await response.json()) as SearchResponse).rows ?? [];

        if (!cancelled) {
          setRows(data.map(mapAuditEvent));
          setDataRequestStatus({
            isFetching: false,
            isLoading: false,
            isUninitialized: false,
            isSuccess: true,
            isError: false,
          });
        }
      } catch {
        if (!cancelled) {
          setRows([]);
          setDataRequestStatus({
            isFetching: false,
            isLoading: false,
            isUninitialized: false,
            isSuccess: false,
            isError: true,
          });
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredRows = useMemo(() => {
    const keywords = (searchTerms.keyword.keywords ?? [])
      .map((keyword) => keyword.trim().toLowerCase())
      .filter(Boolean);

    if (keywords.length === 0) {
      return rows;
    }

    return rows.filter((row) =>
      keywords.every(
        (keyword) =>
          includesKeyword(row._unique_id, keyword) ||
          includesKeyword(row.full_name, keyword) ||
          includesKeyword(row.study_title, keyword) ||
          includesKeyword(row.source, keyword) ||
          includesKeyword(row.event_name, keyword) ||
          includesKeyword(row.study_description, keyword),
      ),
    );
  }, [rows, searchTerms.keyword.keywords]);

  const data = useMemo(
    () =>
      filteredRows.slice(
        pagination.offset,
        pagination.offset + pagination.pageSize,
      ),
    [filteredRows, pagination.offset, pagination.pageSize],
  );

  return {
    data,
    hits: filteredRows.length,
    advancedSearchFilterValues: [],
    dataRequestStatus,
    summaryStatistics: [
      {
        name: 'Events',
        field: '_unique_id',
        type: 'count',
        value: filteredRows.length,
      },
    ],
    charts: {},
    suggestions: [],
    clearSearch: undefined,
  };
};