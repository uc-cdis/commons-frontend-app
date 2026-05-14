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

async function proxy(req: NextApiRequest, res: NextApiResponse) {
  const upstream = `${getSiemServiceBaseUrl()}/siem/views${typeof req.query.view_id === 'string' ? `/${encodeURIComponent(req.query.view_id)}` : ''}`;
  const response = await fetch(upstream, {
    method: req.method,
    headers: {
      'content-type': 'application/json',
      ...(typeof req.headers.authorization === 'string' ? { authorization: req.headers.authorization } : {}),
      ...(typeof req.headers.cookie === 'string' ? { cookie: req.headers.cookie } : {}),
      ...(typeof req.headers.remote_user === 'string' ? { remote_user: req.headers.remote_user } : {}),
      ...(typeof req.headers['x-auth-request-user'] === 'string'
        ? { 'x-auth-request-user': req.headers['x-auth-request-user'] }
        : {}),
      ...(typeof req.headers['x-forwarded-user'] === 'string'
        ? { 'x-forwarded-user': req.headers['x-forwarded-user'] }
        : {}),
    },
    body: req.method && ['POST', 'PUT'].includes(req.method) ? JSON.stringify(req.body ?? {}) : undefined,
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

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!['GET', 'POST', 'PUT', 'DELETE'].includes(req.method ?? '')) {
    res.setHeader('Allow', 'GET,POST,PUT,DELETE');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  return proxy(req, res);
}