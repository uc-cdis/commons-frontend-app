// only the shape is checked: the agent decides which kinds and formats exist, and parts
// without / . % ? & # can't reach anything but its /download/<kind>/<handle> route
const PART = /^[A-Za-z0-9_-]+$/;

export function agentDownloadPath(
  kind: string,
  handle: string,
  format: string | undefined,
): string | null {
  if (!PART.test(kind) || !PART.test(handle)) return null;
  if (format === undefined) return `/download/${kind}/${handle}`;
  return PART.test(format) ? `/download/${kind}/${handle}?format=${format}` : null;
}

export function agentDownloadKind(href: string | undefined): string | null {
  const match = href?.match(/^\/download\/([^/?#]+)\/([^/?#]+)(?:\?format=([^&#]*))?$/);
  return match && agentDownloadPath(match[1], match[2], match[3]) !== null ? match[1] : null;
}

export function isAgentDownloadLink(href: string | undefined): boolean {
  return agentDownloadKind(href) !== null;
}
