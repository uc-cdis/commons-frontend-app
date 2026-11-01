"use client";

import { useState } from "react";
import { Box, Stack } from "@mantine/core";
import type { ChatMessage, Timings, ToolCall, ToolResultMessage } from "../../core";
import { AnswerCard } from "./AnswerCard";
import { MarkdownContent } from "./MarkdownContent";
import { ToolCallPanel } from "./ToolCallPanel";
import { hasToolCard, ToolResultCard } from "../tools";
import { argsSummary } from "./argsSummary";
import { groupToolCalls } from "./groupToolCalls";
import { ToolCallGroup } from "./ToolCallGroup";
import { callStatus, groupStatus } from "./toolStatus";

type AssistantChatMessage = Extract<ChatMessage, { role: "assistant" }>;

/** The agent's short reason for the tool calls under it: smaller and greyer than an answer. */
function StepText({ content }: { content: string }) {
  return (
    <Box px="xs" className="chat-step">
      <MarkdownContent content={content} fz="xs" />
    </Box>
  );
}

export interface AssistantMessageProps {
  message: AssistantChatMessage;
  timings: Timings;
  toolResults: ReadonlyMap<string, ToolResultMessage>;
  isRunning: boolean;
  isStreaming: boolean;
}

export function AssistantMessage({
  message,
  timings,
  toolResults,
  isRunning,
  isStreaming,
}: AssistantMessageProps) {
  const [openedCallId, setOpenedCallId] = useState<string | null>(null);
  const toolCalls = message.toolCalls ?? [];
  // text that comes with tool calls is the agent's reason for them: a step, not the answer
  const isStep = toolCalls.length > 0;

  const resultOf = (tc: ToolCall) => toolResults.get(tc.id)?.content ?? null;
  const failedOf = (tc: ToolCall) => toolResults.get(tc.id)?.failed ?? false;
  const panel = (tc: ToolCall, title?: string, index?: number) => (
    <ToolCallPanel
      key={tc.id}
      toolCall={tc}
      title={title}
      index={index}
      result={resultOf(tc)}
      failed={failedOf(tc)}
      isRunning={isRunning}
      durationMs={timings.tools?.[tc.id]}
      isExpanded={openedCallId === tc.id}
      onToggle={() => setOpenedCallId(openedCallId === tc.id ? null : tc.id)}
    />
  );

  return (
    <Stack gap="xs">
      {message.content && isStep && <StepText content={message.content} />}
      {message.content && !isStep && (
        <AnswerCard content={message.content} isStreaming={isStreaming} />
      )}

      {groupToolCalls(toolCalls, hasToolCard).map(({ name, calls }) => {
        if (calls.length > 1) {
          const { status, label } = groupStatus(
            calls.map((tc) => callStatus(resultOf(tc), failedOf(tc), isRunning)),
          );
          return (
            <ToolCallGroup
              key={calls[0].id}
              name={name}
              count={calls.length}
              status={status}
              statusLabel={label}
            >
              {calls.map((tc, i) => panel(tc, argsSummary(tc.args), i + 1))}
            </ToolCallGroup>
          );
        }

        const [tc] = calls;
        return (
          <div key={tc.id} className="chat-tool-group">
            {panel(tc)}
            {!failedOf(tc) && (
              <ToolResultCard toolCall={tc} result={resultOf(tc)} isRunning={isRunning} />
            )}
          </div>
        );
      })}
    </Stack>
  );
}
