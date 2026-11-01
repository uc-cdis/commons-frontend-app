import { describe, expect, it, vi } from "vitest";
import type { AgentSubscriber, Message } from "@copilotkit/react-core/v2";
import { clearStopNoteOnSuccess, saveOrDropTurn, truncateToLastUser } from "./runEndings";

const q1: Message = { id: "u1", role: "user", content: "first question" };
const a1: Message = { id: "a1", role: "assistant", content: "first answer" };
const q2: Message = { id: "u2", role: "user", content: "second question" };
// half a turn: a reason and a tool call that never got its result
const halfTurn: Message = {
  id: "a2",
  role: "assistant",
  content: "Looking up the field for lung cancer.",
  toolCalls: [{ id: "t1", type: "function", function: { name: "search_fields", arguments: "{}" } }],
};
const chat = [q1, a1, q2, halfTurn];

type Finished = Parameters<NonNullable<AgentSubscriber["onRunFinishedEvent"]>>[0];
type Errored = Parameters<NonNullable<AgentSubscriber["onRunErrorEvent"]>>[0];
type Failed = Parameters<NonNullable<AgentSubscriber["onRunFailed"]>>[0];

// the handlers only read `outcome` and `messages`; the rest of the params is filler
const params = <T>(extra: Partial<T>): T => ({ messages: chat, state: {}, ...extra }) as T;

describe("truncateToLastUser", () => {
  it("keeps everything up to and including the last question", () => {
    expect(truncateToLastUser(chat)).toEqual([q1, a1, q2]);
  });

  it("keeps the whole chat when the last message is a question", () => {
    expect(truncateToLastUser([q1, a1, q2])).toEqual([q1, a1, q2]);
  });

  it("returns nothing when there is no question", () => {
    expect(truncateToLastUser([a1, halfTurn])).toEqual([]);
    expect(truncateToLastUser([])).toEqual([]);
  });

  it("leaves the input alone", () => {
    const input = [...chat];
    truncateToLastUser(input);
    expect(input).toEqual(chat);
  });
});

describe("saveOrDropTurn", () => {
  it("saves a successful finish and changes nothing", () => {
    const save = vi.fn();
    const result = saveOrDropTurn(save).onRunFinishedEvent?.(
      params<Finished>({ outcome: "success", pendingToolCallIds: [] }),
    );
    expect(save).toHaveBeenCalledOnce();
    expect(result).toBeUndefined();
  });

  it.each(["cancelled", "interrupt"] as const)("drops a %s finish without saving", (outcome) => {
    const save = vi.fn();
    const extra = outcome === "interrupt" ? { outcome, interrupts: [] } : { outcome };
    const result = saveOrDropTurn(save).onRunFinishedEvent?.(params<Finished>(extra));
    expect(save).not.toHaveBeenCalled();
    expect(result).toEqual({ messages: [q1, a1, q2] });
  });

  it("drops the half turn on a run error, which is also how Stop arrives", () => {
    const save = vi.fn();
    const result = saveOrDropTurn(save).onRunErrorEvent?.(
      params<Errored>({
        event: { type: "RUN_ERROR", message: "Request aborted", code: "abort" } as Errored["event"],
      }),
    );
    expect(save).not.toHaveBeenCalled();
    expect(result).toEqual({ messages: [q1, a1, q2] });
  });

  it("drops the half turn when the connection fails with no error event", () => {
    const save = vi.fn();
    const result = saveOrDropTurn(save).onRunFailed?.(
      params<Failed>({ error: new Error("network") }),
    );
    expect(save).not.toHaveBeenCalled();
    expect(result).toEqual({ messages: [q1, a1, q2] });
  });
});

describe("clearStopNoteOnSuccess", () => {
  it("clears the stop note when a run finishes with success", () => {
    const clear = vi.fn();
    clearStopNoteOnSuccess(clear).onRunFinishedEvent?.(
      params<Finished>({ outcome: "success", pendingToolCallIds: [] }),
    );
    expect(clear).toHaveBeenCalledOnce();
  });

  it("keeps the stop note when a stop ends as a cancelled finish", () => {
    const clear = vi.fn();
    clearStopNoteOnSuccess(clear).onRunFinishedEvent?.(params<Finished>({ outcome: "cancelled" }));
    expect(clear).not.toHaveBeenCalled();
  });
});
