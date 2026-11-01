import { describe, expect, it } from "vitest";
import { agentDownloadPath, isAgentDownloadLink } from "./downloadLinks";

describe("agentDownloadPath", () => {
  it.each(["filter", "survival", "manifest"])("allows a %s download", (kind) => {
    expect(agentDownloadPath(kind, "abc_12-x", undefined)).toBe(`/download/${kind}/abc_12-x`);
  });

  it("asks for the survival csv only when format is csv", () => {
    expect(agentDownloadPath("survival", "cs_1", "csv")).toBe("/download/survival/cs_1?format=csv");
    expect(agentDownloadPath("survival", "cs_1", "json")).toBe("/download/survival/cs_1");
  });

  it("refuses a csv of anything but survival, like the agent does", () => {
    expect(agentDownloadPath("manifest", "fs_1", "csv")).toBeNull();
    expect(agentDownloadPath("filter", "flt_1", "csv")).toBeNull();
  });

  it("refuses kinds the agent doesn't serve", () => {
    expect(agentDownloadPath("case-set", "cs_1", undefined)).toBeNull();
    expect(agentDownloadPath("", "cs_1", undefined)).toBeNull();
  });

  it.each(["", "../secret", "a b", "a/b", "cs_1?x=1", "cs.1"])(
    "refuses the handle %j",
    (handle) => {
      expect(agentDownloadPath("survival", handle, undefined)).toBeNull();
    },
  );
});

describe("isAgentDownloadLink", () => {
  it("matches the links the agent writes into answers", () => {
    expect(isAgentDownloadLink("/download/manifest/fs_abc")).toBe(true);
    expect(isAgentDownloadLink("/download/survival/cs_abc?format=csv")).toBe(true);
    expect(isAgentDownloadLink("/download/filter/flt_abc")).toBe(true);
  });

  it("ignores everything else", () => {
    expect(isAgentDownloadLink(undefined)).toBe(false);
    expect(isAgentDownloadLink("https://portal.gdc.cancer.gov/projects")).toBe(false);
    expect(isAgentDownloadLink("https://evil.example/download/manifest/fs_abc")).toBe(false);
    expect(isAgentDownloadLink("/download/case-set/cs_abc")).toBe(false);
    expect(isAgentDownloadLink("/download/manifest/fs_abc?format=csv")).toBe(false);
    expect(isAgentDownloadLink("/download/manifest/../../etc")).toBe(false);
  });
});
