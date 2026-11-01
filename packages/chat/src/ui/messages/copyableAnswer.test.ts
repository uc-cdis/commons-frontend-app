import { describe, expect, it } from "vitest";
import { copyableAnswer } from "./copyableAnswer";

const ORIGIN = "https://genomicaicommons.org";

describe("copyableAnswer", () => {
  it("makes the agent's download links absolute, so they still work when pasted elsewhere", () => {
    expect(
      copyableAnswer("[Download GDC manifest (TSV)](/download/manifest/fs_DamwvOAG15xa)", ORIGIN),
    ).toBe(
      "[Download GDC manifest (TSV)](https://genomicaicommons.org/download/manifest/fs_DamwvOAG15xa)",
    );
  });

  it.each([
    ["an external link", "[GDC](https://portal.gdc.cancer.gov/projects/TCGA-CHOL)"],
    ["a footnote", "see [1](#user-content-fn-1)"],
    ["a /download link the portal wouldn't serve", "[x](/download/case-set/cs_1)"],
    ["text that only mentions a path", "files are under /download/manifest/fs_1 for 3 hours"],
  ])("leaves %s as it is", (_case, markdown) => {
    expect(copyableAnswer(markdown, ORIGIN)).toBe(markdown);
  });
});
