import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchModels } from "./models";

// the login check, the token and an unreachable agent are callAgent's, tested through downloads
const deps = (fetch: (url: string, init?: RequestInit) => Promise<Response>) => ({
  verifyToken: async () => "token-123",
  agentBaseUrl: "http://gdc-agent",
  fetch,
});

/** A stand-in for the agent's /endpoint/health. */
function agentReplying(body: string | object, init?: ResponseInit) {
  return vi.fn(async (_url: string, _init?: RequestInit) =>
    typeof body === "string" ? new Response(body, init) : Response.json(body, init),
  );
}

afterEach(() => vi.restoreAllMocks());

describe("fetchModels", () => {
  it("asks the agent's health route, giving it 10 seconds", async () => {
    const timeout = vi.spyOn(AbortSignal, "timeout");
    const fetch = agentReplying({ backends: ["Muse"] });
    await fetchModels("cookie", deps(fetch));
    expect(fetch.mock.calls[0][0]).toBe("http://gdc-agent/endpoint/health");
    expect(timeout).toHaveBeenCalledWith(10_000);
  });

  it("returns the agent's model names, in its order", async () => {
    const fetch = agentReplying({ status: "ok", backends: ["Muse", "Haiku"] });
    const res = await fetchModels("cookie", deps(fetch));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ models: ["Muse", "Haiku"] });
  });

  it("returns no names when the agent lists none", async () => {
    const res = await fetchModels("cookie", deps(agentReplying({ status: "ok" })));
    expect(await res.json()).toEqual({ models: [] });
  });

  it.each([
    ["the agent fails", agentReplying({ detail: "boom" }, { status: 500 })],
    [
      "the agent's error reply breaks off",
      vi.fn(async () => {
        const broken = new ReadableStream({ start: (c) => c.error(new Error("terminated")) });
        return new Response(broken, { status: 503 });
      }),
    ],
    ["the agent doesn't send JSON", agentReplying("<html>")],
  ])("answers 502 when %s", async (_case, fetch) => {
    expect((await fetchModels("cookie", deps(fetch))).status).toBe(502);
  });
});
