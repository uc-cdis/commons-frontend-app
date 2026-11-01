import { describe, expect, it } from "vitest";
import { readParagraph, type MarkdownNode } from "./markdownParagraph";

const text = (value: string): MarkdownNode => ({ type: "text", value });
const el = (tagName: string, children: MarkdownNode[], properties = {}): MarkdownNode => ({
  type: "element",
  tagName,
  properties,
  children,
});
const link = (href: string, label: string) => el("a", [text(label)], { href });
// a paragraph as react-markdown hands it over; offset 0 is the answer's first line
const p = (children: MarkdownNode[], offset = 120): MarkdownNode => ({
  ...el("p", children),
  position: { start: { offset } },
});

describe("readParagraph", () => {
  it("makes a paragraph holding only an agent download link a button", () => {
    const node = p([link("/download/filter/flt_x", "Download cohort filter (JSON)")]);
    expect(readParagraph(node)).toEqual({
      kind: "download",
      href: "/download/filter/flt_x",
      label: "Download cohort filter (JSON)",
    });
  });

  it("reads the label through nested formatting and ignores blank text around the link", () => {
    const node = p([
      text("\n"),
      el("a", [text("Download "), el("em", [text("survival curve")]), text(" (CSV)")], {
        href: "/download/survival/cs_x?format=csv",
      }),
      text(" "),
    ]);
    expect(readParagraph(node)).toMatchObject({
      kind: "download",
      label: "Download survival curve (CSV)",
    });
  });

  it("leaves a link inside a sentence, a link elsewhere and two links as text", () => {
    const filter = link("/download/filter/flt_x", "the filter");
    expect(readParagraph(p([text("Save "), filter, text(" for later.")]))).toEqual({
      kind: "text",
    });
    expect(readParagraph(p([link("https://portal.gdc.cancer.gov", "GDC portal")]))).toEqual({
      kind: "text",
    });
    expect(readParagraph(p([filter, text(" · "), filter]))).toEqual({ kind: "text" });
  });

  it("makes the first line the headline when it is only bold text", () => {
    expect(readParagraph(p([el("strong", [text("51 cases match.")])], 0))).toEqual({
      kind: "headline",
    });
  });

  it("finds no headline in bold followed by text, or in a bold line further down", () => {
    const bold = el("strong", [text("Note:")]);
    expect(readParagraph(p([bold, text(" the files are controlled.")], 0))).toEqual({
      kind: "text",
    });
    expect(readParagraph(p([el("strong", [text("51 cases match.")])], 120))).toEqual({
      kind: "text",
    });
  });

  it("treats a missing node as text", () => {
    expect(readParagraph(undefined)).toEqual({ kind: "text" });
  });
});
