import { describe, expect, it } from "vitest";
import type { ToolCall } from "../../core";
import { groupToolCalls } from "./groupToolCalls";

const call = (name: string, i: number): ToolCall => ({ id: `tc${i}`, name, args: null });
const steps = (...names: string[]) => names.map(call);
const hasCard = (name: string) => name === "create_filter";
const shape = (calls: ToolCall[]) =>
  groupToolCalls(calls, hasCard).map((group) => [group.name, group.calls.map((c) => c.id)]);

describe("groupToolCalls", () => {
  it("puts a step's repeated calls to one tool in one group, in order", () => {
    expect(shape(steps("search_fields", "search_fields", "search_fields"))).toEqual([
      ["search_fields", ["tc0", "tc1", "tc2"]],
    ]);
  });

  it("groups only neighbours, so another tool in between splits them", () => {
    expect(shape(steps("search_fields", "search_fields", "get_cases", "search_fields"))).toEqual([
      ["search_fields", ["tc0", "tc1"]],
      ["get_cases", ["tc2"]],
      ["search_fields", ["tc3"]],
    ]);
  });

  it("never groups a tool that has a card, so each card stays in view", () => {
    expect(shape(steps("create_filter", "create_filter"))).toEqual([
      ["create_filter", ["tc0"]],
      ["create_filter", ["tc1"]],
    ]);
  });

  it("gives nothing for a step without tool calls", () => {
    expect(shape([])).toEqual([]);
  });
});
