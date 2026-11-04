// The agent checks no logins itself, so every call here checks one first and goes as that user.

/** Returns the caller's token from their cookie, or null when they aren't logged in. */
export type VerifyToken = (cookie?: string) => Promise<string | null>;

export interface AgentDeps {
  verifyToken: VerifyToken;
  /** the agent's base url, without a trailing slash */
  agentBaseUrl: string;
  /** only ever called with a url string, so tests can pass a plain stand-in */
  fetch?: (url: string, init?: RequestInit) => Promise<Response>;
}

export const agentUnavailable = (): Response =>
  new Response("The agent is unavailable. Try again later.", { status: 502 });

/**
 * GETs `path` from the agent as the caller; `refused` is the 401 or 502 to answer instead.
 * `timeoutMs` also cuts off the body, so downloads pass none.
 */
export async function callAgent(
  cookie: string | undefined,
  path: string,
  { verifyToken, agentBaseUrl, fetch: fetchImpl = fetch }: AgentDeps,
  timeoutMs?: number,
): Promise<{ upstream: Response } | { refused: Response }> {
  const token = await verifyToken(cookie);
  if (!token)
    return { refused: Response.json({ error: "Authentication required." }, { status: 401 }) };

  try {
    const upstream = await fetchImpl(`${agentBaseUrl}${path}`, {
      headers: { Authorization: `Bearer ${token}` },
      // started after the login check, so only the agent's time counts
      signal: timeoutMs ? AbortSignal.timeout(timeoutMs) : undefined,
    });
    return { upstream };
  } catch (error) {
    console.error(`[chat-server] agent unreachable for ${path}:`, error);
    return { refused: agentUnavailable() };
  }
}
