import { describe, expect, it } from "vitest";
import { callStatus, groupStatus } from "./toolStatus";

describe("callStatus", () => {
  it.each([
    ["a failed call, even with a result", "Error: GDC returned 500", true, false, "error"],
    ["a call with its result", '{"count":51}', false, true, "completed"],
    ["a call still waiting while the run goes on", null, false, true, "running"],
    ["a call the run ended without", null, false, false, "missing"],
  ] as const)("reads %s", (_case, result, failed, isRunning, status) => {
    expect(callStatus(result, failed, isRunning)).toBe(status);
  });
});

describe("groupStatus", () => {
  it("is Completed when every call completed", () => {
    expect(groupStatus(["completed", "completed"])).toEqual({ status: "completed" });
  });

  it("is Running while any call is, even next to an error", () => {
    expect(groupStatus(["completed", "error", "running"])).toEqual({ status: "running" });
  });

  it.each([
    [["completed", "error"], "1 error"],
    [["error", "completed", "error"], "2 errors"],
    [["error", "missing"], "1 error"],
  ] as const)("counts the errors in %o", (statuses, label) => {
    expect(groupStatus([...statuses])).toEqual({ status: "error", label });
  });

  it("is No result when the run ended before a call answered", () => {
    expect(groupStatus(["completed", "missing"])).toEqual({ status: "missing" });
  });
});
