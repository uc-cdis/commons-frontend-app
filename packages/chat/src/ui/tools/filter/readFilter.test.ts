import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { readFilter } from "./readFilter";

const fixture = readFileSync(
  new URL("../__fixtures__/create_filter.json", import.meta.url),
  "utf8",
);

describe("readFilter", () => {
  it("reads the scope and the number of conditions of a create_filter result", () => {
    expect(readFilter(fixture)).toEqual({ scope: "cases", conditions: 1 });
  });

  it("counts every condition", () => {
    const result = JSON.stringify({ scope: "files", clauses: [{}, {}, {}] });
    expect(readFilter(result)).toEqual({ scope: "files", conditions: 3 });
  });

  it("leaves the scope empty when the result has none", () => {
    expect(readFilter(JSON.stringify({ clauses: [{}] }))).toEqual({ scope: "", conditions: 1 });
  });

  it.each([
    ["not JSON", "Error: no such field"],
    ["no clauses", JSON.stringify({ scope: "cases" })],
  ])("gives nothing for a result that is %s", (_case, result) => {
    expect(readFilter(result)).toBeNull();
  });
});
