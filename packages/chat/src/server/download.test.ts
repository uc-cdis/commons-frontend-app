import { describe, expect, it, vi } from "vitest";
import { fetchDownload } from "./download";

const AGENT = "http://gdc-agent";
const loggedIn = async () => "token-123";
const loggedOut = async () => null;

/** A stand-in for the agent's /download route. */
function agentReplying(body: string, init: ResponseInit) {
  return vi.fn(async (_url: string, _init?: RequestInit) => new Response(body, init));
}

const tsv = "id\tfile_name\n1\ta.bam\n";
const savedAs = { "content-disposition": 'attachment; filename="manifest-fs_1.tsv"' };

describe("fetchDownload", () => {
  it("refuses with 401 when there is no login, without calling the agent", async () => {
    const fetch = agentReplying(tsv, { status: 200 });
    const res = await fetchDownload(
      { kind: "manifest", handle: "fs_1" },
      { verifyToken: loggedOut, agentBaseUrl: AGENT, fetch },
    );
    expect(res.status).toBe(401);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("refuses with 404 when the link isn't one the agent serves", async () => {
    const fetch = agentReplying(tsv, { status: 200 });
    const res = await fetchDownload(
      { kind: "manifest", handle: "fs_1", format: "csv" },
      { verifyToken: loggedIn, agentBaseUrl: AGENT, fetch },
    );
    expect(res.status).toBe(404);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("asks the agent for the file and passes on the user's token", async () => {
    const fetch = agentReplying(tsv, { status: 200 });
    await fetchDownload(
      { kind: "survival", handle: "cs_1", format: "csv" },
      { verifyToken: loggedIn, agentBaseUrl: AGENT, fetch },
    );
    expect(fetch).toHaveBeenCalledOnce();
    const [url, init] = fetch.mock.calls[0];
    expect(url).toBe("http://gdc-agent/download/survival/cs_1?format=csv");
    expect(new Headers(init?.headers).get("authorization")).toBe("Bearer token-123");
  });

  it("passes the file through with what to save it as, and nothing else", async () => {
    const fetch = agentReplying(tsv, {
      status: 200,
      headers: { "content-type": "text/tab-separated-values", ...savedAs, "set-cookie": "x=1" },
    });
    const res = await fetchDownload(
      { kind: "manifest", handle: "fs_1" },
      { verifyToken: loggedIn, agentBaseUrl: AGENT, fetch },
    );
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toBe("text/tab-separated-values");
    expect(res.headers.get("content-disposition")).toBe(savedAs["content-disposition"]);
    expect(res.headers.get("set-cookie")).toBeNull();
    // the browser must trust the stated type, never guess one (e.g. html) from the body
    expect(res.headers.get("x-content-type-options")).toBe("nosniff");
    expect(await res.text()).toBe(tsv);
  });

  it("passes on the agent's 404 when a handle has expired", async () => {
    const expired = "No survival data has been computed for cs_1, or it has expired.";
    const fetch = agentReplying(expired, {
      status: 404,
      headers: { "content-type": "text/plain" },
    });
    const res = await fetchDownload(
      { kind: "survival", handle: "cs_1" },
      { verifyToken: loggedIn, agentBaseUrl: AGENT, fetch },
    );
    expect(res.status).toBe(404);
    expect(await res.text()).toBe(expired);
  });

  it("answers 502 when the agent can't be reached", async () => {
    const fetch = vi.fn(async () => {
      throw new TypeError("fetch failed");
    });
    const res = await fetchDownload(
      { kind: "filter", handle: "flt_1" },
      { verifyToken: loggedIn, agentBaseUrl: AGENT, fetch },
    );
    expect(res.status).toBe(502);
  });
});
