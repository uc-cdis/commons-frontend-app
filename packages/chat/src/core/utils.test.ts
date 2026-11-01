import { describe, expect, it } from "vitest";
import type { Message } from "@copilotkit/react-core/v2";
import { shortenTitle, toChatMessage } from "./utils";

describe("toChatMessage", () => {
  it("reads a tool result sent as a string", () => {
    const message: Message = { id: "r1", role: "tool", toolCallId: "t1", content: '{"count":5}' };
    expect(toChatMessage(message)).toEqual([
      { id: "r1", role: "tool", toolCallId: "t1", content: '{"count":5}', failed: false },
    ]);
  });

  it("reads a tool result sent as parts (ag-ui 1.0) as the same text", () => {
    const message: Message = {
      id: "r1",
      role: "tool",
      toolCallId: "t1",
      content: [
        { type: "text", text: '{"count":' },
        { type: "text", text: "5}" },
      ],
    };
    expect(toChatMessage(message)).toEqual([
      { id: "r1", role: "tool", toolCallId: "t1", content: '{"count":5}', failed: false },
    ]);
  });

  const failedOf = (fields: Partial<Extract<Message, { role: "tool" }>>) => {
    const [message] = toChatMessage({
      id: "r1",
      role: "tool",
      toolCallId: "t1",
      content: "",
      ...fields,
    });
    return message.role === "tool" && message.failed;
  };

  it("marks a result pydantic-ai flagged as failed", () => {
    expect(failedOf({ encryptedValue: '{"pydantic_ai": {"outcome": "failed"}}' })).toBe(true);
  });

  it("marks a result with AG-UI's error field as failed", () => {
    expect(failedOf({ error: "Tool 'create_filter' returned an error" })).toBe(true);
  });

  it("marks pydantic-ai's retry prompt as failed", () => {
    const content = "1 validation error:\n```json\n[]\n```\n\nFix the errors and try again.";
    expect(failedOf({ content })).toBe(true);
  });

  it("leaves other results and other encrypted values alone", () => {
    expect(failedOf({ content: '{"count":5}' })).toBe(false);
    expect(failedOf({ content: "Fix the errors and try again. Then 5 cases." })).toBe(false);
    expect(failedOf({ encryptedValue: '{"pydantic_ai": {"outcome": "denied"}}' })).toBe(false);
    expect(failedOf({ encryptedValue: '{"outcome": "failed"}' })).toBe(false);
    expect(failedOf({ encryptedValue: "opaque provider blob" })).toBe(false);
    expect(failedOf({ encryptedValue: "null" })).toBe(false);
  });

  it("parses finished tool arguments and leaves half-streamed ones empty", () => {
    const message: Message = {
      id: "a1",
      role: "assistant",
      content: "Looking up the field.",
      toolCalls: [
        {
          id: "t1",
          type: "function",
          function: { name: "search_fields", arguments: '{"q":"lung"}' },
        },
        { id: "t2", type: "function", function: { name: "get_cases", arguments: '{"filter_id":' } },
      ],
    };
    expect(toChatMessage(message)).toEqual([
      {
        id: "a1",
        role: "assistant",
        content: "Looking up the field.",
        toolCalls: [
          { id: "t1", name: "search_fields", args: { q: "lung" } },
          { id: "t2", name: "get_cases", args: null },
        ],
      },
    ]);
  });

  const finalResult = {
    id: "t9",
    type: "function" as const,
    function: { name: "final_result", arguments: '{"answer": "51 cases."}' },
  };

  it("drops a message that only holds the agent's final_result call", () => {
    expect(
      toChatMessage({ id: "a1", role: "assistant", content: "", toolCalls: [finalResult] }),
    ).toEqual([]);
  });

  it("keeps the other tool calls beside final_result", () => {
    const message: Message = {
      id: "a1",
      role: "assistant",
      content: "",
      toolCalls: [
        { id: "t1", type: "function", function: { name: "get_cases", arguments: "{}" } },
        finalResult,
      ],
    };
    expect(toChatMessage(message)).toEqual([
      {
        id: "a1",
        role: "assistant",
        content: "",
        toolCalls: [{ id: "t1", name: "get_cases", args: {} }],
      },
    ]);
  });

  it("drops empty user and assistant messages", () => {
    expect(toChatMessage({ id: "u1", role: "user", content: "" })).toEqual([]);
    expect(toChatMessage({ id: "a1", role: "assistant", content: "" })).toEqual([]);
  });
});

describe("shortenTitle", () => {
  it("keeps a title of 80 characters or fewer as it is", () => {
    expect(shortenTitle("  What is the 1-year survival estimate for TCGA-CHOL?  ")).toBe(
      "What is the 1-year survival estimate for TCGA-CHOL?",
    );
    const eighty = "x".repeat(80);
    expect(shortenTitle(eighty)).toBe(eighty);
  });

  it("cuts a longer one at the last whole word and marks the cut", () => {
    expect(
      shortenTitle(
        "What is the prevalence of BRAF SSMs in lung cancer cases of non smoking women over 40?",
      ),
    ).toBe("What is the prevalence of BRAF SSMs in lung cancer cases of non smoking women…");
  });

  it("keeps a last word that ends just before the 80th character", () => {
    const title = `${"x".repeat(39)} ${"y".repeat(39)} zzz`;
    expect(shortenTitle(title)).toBe(`${"x".repeat(39)} ${"y".repeat(39)}…`);
  });

  it("cuts a single long word at 80 characters, the mark included", () => {
    expect(shortenTitle("a".repeat(120))).toBe(`${"a".repeat(79)}…`);
  });
});
