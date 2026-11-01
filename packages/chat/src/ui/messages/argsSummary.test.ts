import { describe, expect, it } from "vitest";
import { argsSummary } from "./argsSummary";

describe("argsSummary", () => {
  it.each([
    ["one argument", { query: "TCGA-CHOL" }, "query: TCGA-CHOL"],
    [
      "several, in order",
      { query: "RNA-seq", field: "files.experimental_strategy" },
      "query: RNA-seq · field: files.experimental_strategy",
    ],
    ["numbers and true/false", { limit: 10, exact: true }, "limit: 10 · exact: true"],
    [
      "lists and objects, which it leaves out",
      { scope: "cases", clauses: [{ field: "cases.project.project_id" }], filter: {} },
      "scope: cases",
    ],
    ["only lists", { values: ["a", "b"] }, ""],
    ["no arguments yet, while they stream", null, ""],
  ])("reads %s", (_case, args, line) => {
    expect(argsSummary(args)).toBe(line);
  });
});
