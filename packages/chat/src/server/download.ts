import { agentDownloadPath } from "../core/downloadLinks";
import { callAgent, type AgentDeps } from "./agent";

export interface DownloadRequest {
  kind: string;
  handle: string;
  format?: string;
  cookie?: string;
}

// only what the file is and what to save it as reach the browser
const PASSED_HEADERS = ["content-type", "content-disposition"];

export async function fetchDownload(req: DownloadRequest, deps: AgentDeps): Promise<Response> {
  const path = agentDownloadPath(req.kind, req.handle, req.format);
  if (!path) return new Response("Not found", { status: 404 });

  const call = await callAgent(req.cookie, path, deps);
  if ("refused" in call) return call.refused;

  // the browser must use the stated type, never guess one (say, html) from the body
  const headers = new Headers({ "X-Content-Type-Options": "nosniff" });
  for (const name of PASSED_HEADERS) {
    const value = call.upstream.headers.get(name);
    if (value) headers.set(name, value);
  }
  return new Response(call.upstream.body, { status: call.upstream.status, headers });
}
