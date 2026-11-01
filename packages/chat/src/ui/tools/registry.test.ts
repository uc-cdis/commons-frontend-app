import { describe, expect, it } from "vitest";
import { CARD_DOWNLOADS } from "./downloads";
import { cardRenderers, hasToolCard } from "./registry";

describe("cardRenderers", () => {
  it("keeps only the survival card while downloads live in the answer", () => {
    expect(Object.keys(cardRenderers(false))).toEqual(["get_survival_data"]);
  });

  it("brings back the filter and manifest cards with card downloads on", () => {
    expect(Object.keys(cardRenderers(true)).sort()).toEqual([
      "create_filter",
      "get_file_manifest",
      "get_survival_data",
    ]);
  });

  it("follows the switch", () => {
    expect(hasToolCard("create_filter")).toBe(CARD_DOWNLOADS);
    expect(hasToolCard("get_file_manifest")).toBe(CARD_DOWNLOADS);
    expect(hasToolCard("get_survival_data")).toBe(true);
  });
});
