"use client";

import { Collapse, Paper, Stack, Text } from "@mantine/core";
import type { ToolCall } from "../../core";
import { JsonCode } from "./JsonCode";
import { ToolHeader } from "./ToolHeader";
import { callStatus } from "./toolStatus";

export interface ToolCallPanelProps {
  toolCall: ToolCall;
  title?: string;
  index?: number;
  result: string | null;
  failed: boolean;
  /** A call with no result is only pending while a run is in flight. */
  isRunning: boolean;
  durationMs?: number;
  isExpanded: boolean;
  onToggle: () => void;
}

export function ToolCallPanel({
  toolCall,
  title,
  index,
  result,
  failed,
  isRunning,
  durationMs,
  isExpanded,
  onToggle,
}: ToolCallPanelProps) {
  return (
    <Paper className="chat-tool-panel" radius="sm" bg="var(--mantine-color-default)">
      <ToolHeader
        name={title || toolCall.name}
        index={index}
        durationMs={durationMs}
        status={callStatus(result, failed, isRunning)}
        isExpanded={isExpanded}
        onToggle={onToggle}
      />

      <Collapse expanded={isExpanded}>
        <Stack p="sm" gap="xs" className="chat-tool-body">
          <Text size="xs" fw={700} c="var(--chat-muted)">
            ARGUMENTS
          </Text>
          {toolCall.args ? (
            <JsonCode text={JSON.stringify(toolCall.args)} />
          ) : (
            <Text size="xs" c="var(--chat-muted)">
              Waiting for arguments…
            </Text>
          )}

          {result ? (
            <>
              <Text size="xs" fw={700} c="var(--chat-muted)" mt="xs">
                {failed ? "ERROR" : "RESULT"}
              </Text>
              <JsonCode text={result} />
            </>
          ) : (
            !isRunning && (
              <Text size="xs" c="var(--chat-muted)" mt="xs">
                The run ended without a result for this call.
              </Text>
            )
          )}
        </Stack>
      </Collapse>
    </Paper>
  );
}
