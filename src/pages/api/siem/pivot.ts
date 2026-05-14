import type { NextApiRequest, NextApiResponse } from 'next';

function getSiemServiceBaseUrl(): string {
  if (process.env.SIEM_SERVICE_URL) {
    return process.env.SIEM_SERVICE_URL;
  }
  if (process.env.SIEM_SERVICE_DNS) {
    return `http://${process.env.SIEM_SERVICE_DNS}:8000`;
  }
  return 'http://siem-service.gen3.svc.cluster.local:8000';
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const upstream = `${getSiemServiceBaseUrl()}/siem/pivot`;
  const response = await fetch(upstream, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      ...(typeof req.headers.authorization === 'string' ? { authorization: req.headers.authorization } : {}),
      ...(typeof req.headers.cookie === 'string' ? { cookie: req.headers.cookie } : {}),
    },
    body: JSON.stringify(req.body ?? {}),
  });

  const text = await response.text();
  let payload: unknown = {};
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = { error: 'Invalid upstream response', raw: text.slice(0, 500) };
    }
  }
  return res.status(response.status).json(payload);
}
