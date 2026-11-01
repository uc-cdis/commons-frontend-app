// The agent links its results as /download/<kind>/<handle>[?format=csv]. These rules mirror
// its own checks (gdc-mcp-demo agent/downloads.py), so a bad link never reaches it.
export const DOWNLOAD_KINDS = ["filter", "survival", "manifest"] as const;
export type DownloadKind = (typeof DOWNLOAD_KINDS)[number];
const HANDLE = /^[A-Za-z0-9_-]+$/;

/** The agent's path for a download, or null when the agent wouldn't serve it. */
export function agentDownloadPath(
  kind: string,
  handle: string,
  format: string | undefined,
): string | null {
  if (!(DOWNLOAD_KINDS as readonly string[]).includes(kind) || !HANDLE.test(handle)) return null;
  const csv = format === "csv";
  // only survival curves come as csv
  if (csv && kind !== "survival") return null;
  return `/download/${kind}/${handle}${csv ? "?format=csv" : ""}`;
}

/** True for a download link as the agent writes it into an answer. */
export function isAgentDownloadLink(href: string | undefined): boolean {
  const match = href?.match(/^\/download\/([^/?#]+)\/([^/?#]+)(?:\?format=([^&#]*))?$/);
  return !!match && agentDownloadPath(match[1], match[2], match[3]) !== null;
}
