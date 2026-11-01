import { describe, expect, it, vi } from "vitest";
import { loadDownload } from "./loadDownload";

/** A stand-in for the portal's /download route. */
function portalReplying(body: string, init: ResponseInit) {
  return vi.fn(async (_url: string, _init?: RequestInit) => new Response(body, init));
}

const CURVE = "/download/survival/cs_QC9thrad-x0F";

describe("loadDownload", () => {
  it("returns the file, asking the portal with just the login cookie", async () => {
    const fetch = portalReplying('{"results":[]}', { status: 200 });
    expect(await loadDownload(CURVE, { fetchImpl: fetch })).toEqual({
      ok: true,
      text: '{"results":[]}',
    });
    const [url, init] = fetch.mock.calls[0];
    expect(url).toBe(CURVE);
    expect(init?.credentials).toBe("same-origin");
    expect(new Headers(init?.headers).has("authorization")).toBe(false);
  });

  it("says the link expired when the portal passes on the agent's 404", async () => {
    const fetch = portalReplying("cs_QC9thrad-x0F has expired. Run the tool again.", {
      status: 404,
    });
    expect(await loadDownload(CURVE, { fetchImpl: fetch })).toEqual({
      ok: false,
      reason: "expired",
    });
  });

  it("says the login ended when the portal answers 401", async () => {
    const fetch = portalReplying('{"error":"Authentication required."}', { status: 401 });
    expect(await loadDownload(CURVE, { fetchImpl: fetch })).toEqual({ ok: false, reason: "login" });
  });

  it.each([
    ["the agent is down (502)", portalReplying("The agent is unavailable.", { status: 502 })],
    ["the portal errors (500)", portalReplying('{"error":"Download failed."}', { status: 500 })],
    [
      "the network drops",
      vi.fn(async () => {
        throw new TypeError("Failed to fetch");
      }),
    ],
  ])("reports a failure, rather than throwing, when %s", async (_case, fetch) => {
    expect(await loadDownload(CURVE, { fetchImpl: fetch })).toEqual({
      ok: false,
      reason: "failed",
    });
  });

  // stands in for a stalled agent: answers only by failing once the request is aborted
  const stalled = () =>
    vi.fn(
      (_url: string, init?: RequestInit) =>
        new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener("abort", () => reject(init.signal?.reason));
        }),
    );

  it("gives up and reports a failure when the portal doesn't answer in time", async () => {
    expect(await loadDownload(CURVE, { fetchImpl: stalled(), timeoutMs: 20 })).toEqual({
      ok: false,
      reason: "failed",
    });
  });

  it("stops waiting when the card goes away, without logging an error", async () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    const controller = new AbortController();
    const loading = loadDownload(CURVE, { fetchImpl: stalled(), signal: controller.signal });
    controller.abort();
    expect(await loading).toEqual({ ok: false, reason: "failed" });
    expect(error).not.toHaveBeenCalled();
    error.mockRestore();
  });
});
