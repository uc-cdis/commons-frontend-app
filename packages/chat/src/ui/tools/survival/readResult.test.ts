import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { readSurvivalSummary } from "./readResult";

// a real get_survival_data result, captured from the live agent
const realResult = readFileSync(
  new URL("../__fixtures__/get_survival_data.json", import.meta.url),
  "utf8",
);

describe("readSurvivalSummary", () => {
  it("reads the donors and the 1 to 5 year estimates from a real result", () => {
    expect(readSurvivalSummary(realResult)).toEqual({
      donors: 48,
      estimates: [
        { years: 1, value: 0.826 },
        { years: 2, value: 0.629 },
        { years: 3, value: 0.536 },
        { years: 4, value: 0.449 },
        { years: 5, value: 0.449 },
      ],
    });
  });

  it("reads whichever years the agent sends, in order, and skips values that aren't numbers", () => {
    const result = JSON.stringify({
      overall_survival: [
        { donors: 10, "10_year_survival": 0.2, "1_year_survival": 0.9, "3_year_survival": "n/a" },
      ],
    });
    expect(readSurvivalSummary(result)?.estimates).toEqual([
      { years: 1, value: 0.9 },
      { years: 10, value: 0.2 },
    ]);
  });

  it.each([
    ["not JSON", "Error: GDC API timed out"],
    ["no overall_survival", JSON.stringify({ case_set_id: "cs_1" })],
    ["an empty overall_survival", JSON.stringify({ overall_survival: [] })],
    ["donors that aren't a number", JSON.stringify({ overall_survival: [{ donors: "48" }] })],
  ])("returns null for a result with %s, rather than throwing", (_case, result) => {
    expect(readSurvivalSummary(result)).toBeNull();
  });
});
