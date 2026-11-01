// Serves the agent's /download links through the portal. The agent checks no logins itself,
// so this route checks them first.
import { agentDownloadPath } from "../core/downloadLinks";

/** Returns the caller's token from their cookie, or null when they aren't logged in. */
export type VerifyToken = (cookie?: string) => Promise<string | null>;

export interface DownloadRequest {
  kind: string;
  handle: string;
  format?: string;
  cookie?: string;
}

export interface DownloadDeps {
  verifyToken: VerifyToken;
  /** the agent's base url, without a trailing slash */
  agentBaseUrl: string;
  /** only ever called with a url string, so tests can pass a plain stand-in */
  fetch?: (url: string, init?: RequestInit) => Promise<Response>;
}

// only what the file is and what to save it as reach the browser
const PASSED_HEADERS = ["content-type", "content-disposition"];

export async function fetchDownload(
  req: DownloadRequest,
  { verifyToken, agentBaseUrl, fetch: fetchImpl = fetch }: DownloadDeps,
): Promise<Response> {
  const token = await verifyToken(req.cookie);
  if (!token) return Response.json({ error: "Authentication required." }, { status: 401 });

  const path = agentDownloadPath(req.kind, req.handle, req.format);
  if (!path) return new Response("Not found", { status: 404 });

  let upstream: Response;
  try {
    upstream = await fetchImpl(`${agentBaseUrl}${path}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (error) {
    console.error("[chat-download] agent unreachable:", error);
    return new Response("The agent is unavailable. Try again later.", { status: 502 });
  }

  // the browser must use the stated type, never guess one (say, html) from the body
  const headers = new Headers({ "X-Content-Type-Options": "nosniff" });
  for (const name of PASSED_HEADERS) {
    const value = upstream.headers.get(name);
    if (value) headers.set(name, value);
  }
  return new Response(upstream.body, { status: upstream.status, headers });
}
