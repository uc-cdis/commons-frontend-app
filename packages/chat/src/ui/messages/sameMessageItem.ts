import type { ToolCall } from "../../core";
import type { MessageItemProps } from "./MessageItem";

const toolCallsOf = ({ message }: MessageItemProps): ToolCall[] =>
  (message.role === "assistant" && message.toolCalls) || [];

const sameToolCalls = (a: MessageItemProps, b: MessageItemProps): boolean => {
  const calls = toolCallsOf(a);
  const others = toolCallsOf(b);
  return (
    calls.length === others.length &&
    calls.every((call, i) => {
      const other = others[i];
      const result = a.toolResults.get(call.id);
      const otherResult = b.toolResults.get(other.id);
      return (
        JSON.stringify(call.args) === JSON.stringify(other.args) &&
        result?.content === otherResult?.content &&
        result?.failed === otherResult?.failed
      );
    })
  );
};

// memo's check for a transcript row. every streamed token gives every message a new object and
// a new results map, so compare what the row shows, not identity
export const sameMessageItem = (a: MessageItemProps, b: MessageItemProps): boolean =>
  a.message.id === b.message.id &&
  a.message.content === b.message.content &&
  a.isRunning === b.isRunning &&
  a.isLast === b.isLast &&
  a.timings === b.timings &&
  a.editableMessageId === b.editableMessageId &&
  a.onEdit === b.onEdit &&
  a.onRetry === b.onRetry &&
  sameToolCalls(a, b);
