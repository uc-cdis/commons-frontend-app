/** The chat agent's root url, e.g. http://gdc-agent. The chat routes add their own paths to it. */
export function getAgentBaseUrl(): string {
  const url = process.env.GEN3_AGENT_BASE_URL;
  // a missing url fails only the chat routes, at their first request, with this message
  if (!url) throw new Error("GEN3_AGENT_BASE_URL is not configured");
  return url;
}
