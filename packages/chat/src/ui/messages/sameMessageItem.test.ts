import { describe, expect, it } from "vitest";
import type { ChatMessage, Timings, ToolResultMessage } from "../../core";
import type { MessageItemProps } from "./MessageItem";
import { sameMessageItem } from "./sameMessageItem";

const onEdit = () => {};
const onRetry = () => {};
const timings: Timings = { turns: {}, tools: {}, reasoning: {} };

const answer = (content: string, args = '{"project":"TCGA-CHOL"}'): ChatMessage => ({
  id: "a1",
  role: "assistant",
  content,
  toolCalls: [{ id: "tc1", name: "get_cases", args: JSON.parse(args) }],
});
const result = (toolCallId: string, content: string, failed = false): ToolResultMessage => ({
  id: `r-${toolCallId}`,
  role: "tool",
  toolCallId,
  content,
  failed,
});

/** A row's props as MessageList builds them: new objects on every streamed token. */
function props(overrides: Partial<MessageItemProps> = {}): MessageItemProps {
  return {
    message: answer("Found 51 cases."),
    timings,
    toolResults: new Map([["tc1", result("tc1", '{"count":51}')]]),
    editableMessageId: null,
    isRunning: true,
    isLast: false,
    onEdit,
    onRetry,
    ...overrides,
  };
}

describe("sameMessageItem", () => {
  it("skips a row whose message is unchanged, though every object is new", () => {
    expect(sameMessageItem(props(), props())).toBe(true);
  });

  it("skips a row when a result lands for another message's tool call", () => {
    const later = new Map([
      ["tc1", result("tc1", '{"count":51}')],
      ["tc9", result("tc9", "{}")],
    ]);
    expect(sameMessageItem(props(), props({ toolResults: later }))).toBe(true);
  });

  it.each<[string, Partial<MessageItemProps>]>([
    ["its text grows", { message: answer("Found 51 cases. Next") }],
    [
      "it is another message with the same text",
      { message: { ...answer("Found 51 cases."), id: "a2" } },
    ],
    [
      "its tool call's arguments grow",
      { message: answer("Found 51 cases.", '{"project":"TCGA-CHOL","x":1}') },
    ],
    [
      "it gets another tool call",
      {
        message: {
          ...answer("Found 51 cases."),
          toolCalls: [
            { id: "tc1", name: "get_cases", args: { project: "TCGA-CHOL" } },
            { id: "tc2", name: "search_files", args: null },
          ],
        } as ChatMessage,
      },
    ],
    ["its tool result changes", { toolResults: new Map([["tc1", result("tc1", '{"count":52}')]]) }],
    [
      "its tool call fails",
      { toolResults: new Map([["tc1", result("tc1", '{"count":51}', true)]]) },
    ],
    ["its tool result is still missing", { toolResults: new Map() }],
    ["it becomes the last message", { isLast: true }],
    ["the run ends", { isRunning: false }],
    ["a duration arrives", { timings: { turns: {}, tools: { tc1: 412 }, reasoning: {} } }],
    ["the editable question changes", { editableMessageId: "u1" }],
    ["Edit's handler changes", { onEdit: () => {} }],
    ["Retry's handler changes", { onRetry: () => {} }],
  ])("redraws the row when %s", (_case, change) => {
    expect(sameMessageItem(props(), props(change))).toBe(false);
  });
});
