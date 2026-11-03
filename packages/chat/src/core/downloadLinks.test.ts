import { describe, expect, it } from "vitest";
import { agentDownloadKind, agentDownloadPath, isAgentDownloadLink } from "./downloadLinks";

describe("agentDownloadPath", () => {
  it.each(["filter", "case-set", "survival", "manifest", "a-kind-added-later"])(
    "allows a %s download",
    (kind) => {
      expect(agentDownloadPath(kind, "abc_12-x", undefined)).toBe(`/download/${kind}/abc_12-x`);
    },
  );

  it("passes the format on, leaving the agent to say which formats exist", () => {
    expect(agentDownloadPath("survival", "cs_1", "csv")).toBe("/download/survival/cs_1?format=csv");
    expect(agentDownloadPath("case-set", "cs_1", "txt")).toBe("/download/case-set/cs_1?format=txt");
  });

  it.each(["", "../secret", "a b", "a/b", "a%2Fb", "cs_1?x=1", "cs.1"])(
    "refuses %j as a kind, a handle or a format",
    (part) => {
      expect(agentDownloadPath(part, "cs_1", undefined)).toBeNull();
      expect(agentDownloadPath("survival", part, undefined)).toBeNull();
      expect(agentDownloadPath("survival", "cs_1", part)).toBeNull();
    },
  );
});

describe("agentDownloadKind", () => {
  it.each([
    ["/download/filter/flt_abc", "filter"],
    ["/download/survival/cs_abc?format=csv", "survival"],
    ["/download/manifest/fs_abc", "manifest"],
    ["/download/case-set/cs_abc?format=txt", "case-set"],
  ])("reads %s as %s", (href, kind) => {
    expect(agentDownloadKind(href)).toBe(kind);
  });

  it("is null for anything but an agent download link", () => {
    expect(agentDownloadKind(undefined)).toBeNull();
    expect(agentDownloadKind("https://evil.example/download/filter/flt_abc")).toBeNull();
    expect(agentDownloadKind("/download/manifest/../../etc")).toBeNull();
  });
});

describe("isAgentDownloadLink", () => {
  it("matches the links the agent writes into answers", () => {
    expect(isAgentDownloadLink("/download/manifest/fs_abc")).toBe(true);
    expect(isAgentDownloadLink("/download/survival/cs_abc?format=csv")).toBe(true);
    expect(isAgentDownloadLink("/download/filter/flt_abc")).toBe(true);
    expect(isAgentDownloadLink("/download/case-set/cs_abc?format=txt")).toBe(true);
  });

  it("ignores everything else", () => {
    expect(isAgentDownloadLink(undefined)).toBe(false);
    expect(isAgentDownloadLink("https://portal.gdc.cancer.gov/projects")).toBe(false);
    expect(isAgentDownloadLink("https://evil.example/download/manifest/fs_abc")).toBe(false);
    expect(isAgentDownloadLink("/download/survival/cs_abc?format=csv&x=1")).toBe(false);
    expect(isAgentDownloadLink("/download/survival/cs_abc?format=")).toBe(false);
    expect(isAgentDownloadLink("/download/a/b/c")).toBe(false);
    expect(isAgentDownloadLink("/download/manifest/../../etc")).toBe(false);
  });
});
