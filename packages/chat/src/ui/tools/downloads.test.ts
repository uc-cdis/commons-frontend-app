import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { findDownload } from "./downloads";

// real tool results, captured from the live agent
const fixture = (name: string) =>
  readFileSync(new URL(`./__fixtures__/${name}`, import.meta.url), "utf8");

describe("findDownload", () => {
  it("finds the curve as JSON and CSV in a real get_survival_data result", () => {
    expect(findDownload(fixture("get_survival_data.json"), "survival")).toEqual({
      kind: "survival",
      url: "/download/survival/cs_QC9thrad-x0F",
      csvUrl: "/download/survival/cs_QC9thrad-x0F?format=csv",
    });
  });

  it("finds the manifest in a real get_file_manifest result", () => {
    expect(findDownload(fixture("get_file_manifest.json"), "manifest")).toEqual({
      kind: "manifest",
      url: "/download/manifest/fs_DamwvOAG15xa",
    });
  });

  it("finds the filter in a real create_filter result", () => {
    expect(findDownload(fixture("create_filter.json"), "filter")).toEqual({
      kind: "filter",
      url: "/download/filter/flt_5RjmYszWqJkw",
    });
  });

  it("finds nothing of a kind the result doesn't have, or when there's no result yet", () => {
    expect(findDownload(fixture("get_survival_data.json"), "manifest")).toBeUndefined();
    expect(findDownload(null, "survival")).toBeUndefined();
  });

  it.each([
    ["on another website", "https://example.com/download/filter/flt_1"],
    ["of a kind the portal doesn't serve", "/download/case-set/cs_1"],
    ["of another kind than its field", "/download/manifest/fs_1"],
    ["with a handle the portal wouldn't accept", "/download/filter/../secret"],
  ])("refuses a link %s, so a result can't point the browser elsewhere", (_case, url) => {
    expect(
      findDownload(JSON.stringify({ filter: { download_url: url } }), "filter"),
    ).toBeUndefined();
  });

  it("keeps a curve whose CSV link is unusable, without the CSV", () => {
    const result = JSON.stringify({
      full_curve: {
        download_url: "/download/survival/cs_1",
        download_url_csv: "/download/survival/cs_1?format=xlsx",
      },
    });
    expect(findDownload(result, "survival")).toEqual({
      kind: "survival",
      url: "/download/survival/cs_1",
    });
  });

  it("finds nothing in a result that isn't JSON, like a failed tool's message", () => {
    expect(findDownload("Error: GDC API timed out", "filter")).toBeUndefined();
  });
});
