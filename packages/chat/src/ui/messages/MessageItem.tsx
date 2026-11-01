"use client";

import { memo } from "react";
import type { ChatMessage, Timings, ToolResultMessage } from "../../core";
import { ReasoningBlock } from "./ReasoningBlock";
import { AssistantMessage } from "./AssistantMessage";
import { UserMessage } from "./UserMessage";
import { sameMessageItem } from "./sameMessageItem";

export interface MessageItemProps {
  message: ChatMessage;
  timings: Timings;
  toolResults: ReadonlyMap<string, ToolResultMessage>;
  editableMessageId: string | null;
  isRunning: boolean;
  /** Last in the list. Only the tail can be mid-stream. */
  isLast: boolean;
  onEdit: (text: string) => void;
  onRetry: () => void;
}

function MessageItemImpl({
  message,
  timings,
  toolResults,
  editableMessageId,
  isRunning,
  isLast,
  onEdit,
  onRetry,
}: MessageItemProps) {
  const isStreaming = isRunning && isLast;

  if (message.role === "user") {
    return (
      <UserMessage
        message={message}
        durationMs={timings.turns?.[message.id]}
        canRewind={message.id === editableMessageId}
        onEdit={onEdit}
        onRetry={onRetry}
      />
    );
  }

  if (message.role === "reasoning") {
    return (
      <ReasoningBlock
        content={message.content}
        durationMs={timings.reasoning?.[message.id]}
        isStreaming={isStreaming}
      />
    );
  }

  // Tool results render inside their assistant message's ToolCallPanel.
  if (message.role === "tool") return null;

  return (
    <AssistantMessage
      message={message}
      timings={timings}
      toolResults={toolResults}
      isRunning={isRunning}
      isStreaming={isStreaming}
    />
  );
}

export const MessageItem = memo(MessageItemImpl, sameMessageItem);
