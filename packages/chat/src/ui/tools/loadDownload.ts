export type DownloadFailure = "expired" | "login" | "failed";
export type LoadedDownload = { ok: true; text: string } | { ok: false; reason: DownloadFailure };

export interface LoadDownloadOptions {
  fetchImpl?: (url: string, init?: RequestInit) => Promise<Response>;
  /** aborted when nobody needs the file any more */
  signal?: AbortSignal;
  timeoutMs?: number;
}

/**
 * One of the agent's /download links, through the portal's route. The login cookie goes along on
 * its own: same site, so no token handling here.
 */
export async function loadDownload(
  url: string,
  { fetchImpl = fetch, signal, timeoutMs = 20_000 }: LoadDownloadOptions = {},
): Promise<LoadedDownload> {
  // neither the browser nor the portal gives up on a stalled agent for minutes.
  // a controller, not AbortSignal.any, which older Safari lacks
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  signal?.addEventListener("abort", () => controller.abort(), { once: true });
  try {
    const res = await fetchImpl(url, { credentials: "same-origin", signal: controller.signal });
    // the agent's handles live 3h after their last use; then it answers 404
    if (res.status === 404) return { ok: false, reason: "expired" };
    if (res.status === 401) return { ok: false, reason: "login" };
    if (!res.ok) return { ok: false, reason: "failed" };
    return { ok: true, text: await res.text() };
  } catch (error) {
    if (!signal?.aborted) console.error("[chat-ui:download]", error);
    return { ok: false, reason: "failed" };
  } finally {
    clearTimeout(timer);
  }
}
