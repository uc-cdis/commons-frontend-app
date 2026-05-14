/**
 * MDS-compatible metadata endpoint for Discovery page.
 *
 * The Discovery page's default loader (useLoadAllMDSData) calls:
 *   GET /mds/metadata?data=True&_guid_type=discovery_metadata&limit=10000&offset=0
 * and expects a response shaped like a flat object:
 *   { "<guid>": { "gen3_discovery": { ...fields... } } }
 *
 * This route resolves auth via Arborist (same as guppy-compat-service) and
 * then fetches audit events from the gen3 search service with appropriate
 * X-Auth-Resource-Paths headers so RLS allows the rows through.
 */
import type { NextApiRequest, NextApiResponse } from 'next';

const SEARCH_BASE = (process.env.GEN3_SEARCH_SERVICE ?? 'http://search-auth-proxy.qa-vectis.svc.cluster.local:8000').replace(/\/$/, '');
const ARBORIST_URL = (process.env.GEN3_ARBORIST_SERVICE ?? 'http://arborist-service.gen3.svc.cluster.local').replace(/\/$/, '');
const SIEM_RESOURCE = '/programs/vectis/projects/siem';
const SIEM_PII_RESOURCE = '/programs/vectis/projects/siem_pii';
const SEARCH_FIELDS = [
  'submitter_id',
  'timestamp',
  'src_ip',
  'user_id',
  'resource',
  'action_name',
  'event_source',
  'result',
  'event_type',
  'cloud_region',
  'cloud_account_id',
  'http_user_agent',
];

interface AuditEventRow {
  submitter_id?: string;
  timestamp?: string;
  src_ip?: string;
  user_id?: string;
  resource?: string;
  action_name?: string;
  event_source?: string;
  result?: string;
  event_type?: string;
  cloud_region?: string;
  cloud_account_id?: string;
  http_user_agent?: string;
}

interface SearchResponse {
  rows?: AuditEventRow[];
  total?: number;
}

function extractToken(req: NextApiRequest): string | null {
  const auth = req.headers.authorization ?? '';
  if (auth.toLowerCase().startsWith('bearer ')) return auth.slice(7).trim();
  const cookies = req.headers.cookie ?? '';
  for (const name of ['access_token', 'credentials_token']) {
    const match = cookies.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
    if (match) {
      const val = decodeURIComponent(match[1]).trim();
      return val.toLowerCase().startsWith('bearer ') ? val.slice(7).trim() : val;
    }
  }
  return null;
}

async function resolveAuthHeaders(req: NextApiRequest): Promise<Record<string, string>> {
  const token = extractToken(req);
  if (!token) return {};
  try {
    const resp = await fetch(`${ARBORIST_URL}/auth/resources`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!resp.ok) return {};
    const payload = await resp.json() as Record<string, unknown>;
    const resources: string[] = Array.isArray(payload['resources']) ? payload['resources'] as string[] : [];
    const allowed = resources.filter((r) => typeof r === 'string' && r.startsWith(SIEM_RESOURCE));
    if (allowed.length === 0) return {};
    const headers: Record<string, string> = { 'X-Auth-Resource-Paths': allowed.join(',') };
    if (allowed.includes(SIEM_PII_RESOURCE)) headers['X-Auth-Unmask'] = 'true';
    return headers;
  } catch {
    return {};
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'GET') {
    res.status(405).end();
    return;
  }

  try {
    const authHeaders = await resolveAuthHeaders(req);

    const searchRes = await fetch(
      `${SEARCH_BASE}/search/audit_event/query`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({
          select: SEARCH_FIELDS,
          page: { limit: 1000, offset: 0 },
        }),
      },
    );

    if (!searchRes.ok) {
      console.error('[mds/metadata] search returned', searchRes.status);
      res.status(502).json({ error: 'Search service unavailable' });
      return;
    }

    const searchData: SearchResponse = await searchRes.json();
    const rows = searchData.rows ?? [];

    const data: Record<string, unknown> = {};
    for (const row of rows) {
      const guid = row.submitter_id ?? '';
      if (!guid) continue;
      const summary = [
        row.action_name,
        row.result,
        row.src_ip,
        row.cloud_region,
        row.timestamp,
      ]
        .filter(Boolean)
        .join(' | ');
      data[guid] = {
        gen3_discovery: {
          _hdp_uid: guid,
          _unique_id: guid,
          // SIEM-useful display fields
          timestamp: row.timestamp ?? 'n/a',
          src_ip: row.src_ip ?? 'n/a',
          principal: row.user_id ?? 'n/a',
          resource: row.resource ?? 'n/a',
          action: row.action_name ?? 'n/a',
          log_source: row.event_source ?? 'n/a',
          outcome: row.result ?? 'n/a',
          event_type: row.event_type ?? 'n/a',
          cloud_account: row.cloud_account_id ?? 'n/a',
          cloud_region: row.cloud_region ?? 'n/a',
          user_agent: row.http_user_agent ?? 'n/a',
          summary: summary || 'No summary available.',
          authz: [],
          tags: [],
          data_availability: 'available',
        },
      };
    }

    res.status(200).json(data);
  } catch (err) {
    console.error('[mds/metadata] error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}
