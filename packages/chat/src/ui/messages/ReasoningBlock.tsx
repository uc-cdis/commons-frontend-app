import { Box, Text, Collapse, Group, UnstyledButton } from "@mantine/core";
import { useState } from "react";
import { IconChevronDown, IconChevronUp } from "@tabler/icons-react";
import { currentThought, formatDuration } from "../util";

function thinkingLabel(content: string, durationMs: number | undefined, isStreaming: boolean) {
  if (durationMs !== undefined) return `Thought for ${formatDuration(durationMs)}`;
  if (!isStreaming) return "Thought";
  const thought = currentThought(content);
  return thought ? `Thinking: ${thought}` : "Thinking...";
}

export function ReasoningBlock({
  content,
  durationMs,
  isStreaming,
}: {
  content: string;
  durationMs?: number;
  isStreaming: boolean;
}) {
  // folded even while it thinks: opening it, then folding it when done, moved the page under
  // the reader each time. The label says what it's on instead
  const [opened, setOpened] = useState(false);

  return (
    <>
      {/* the whole row: the label changes as it thinks, so the chevron moves */}
      <UnstyledButton onClick={() => setOpened(!opened)} aria-expanded={opened} w="100%">
        <Group gap="xs" c="var(--chat-muted)" wrap="nowrap">
          <Box
            w={11}
            h={11}
            aria-hidden
            style={{ borderRadius: "50%", border: "3px solid currentColor", flexShrink: 0 }}
          />
          <Text size="xs" truncate miw={0}>
            {thinkingLabel(content, durationMs, isStreaming)}
          </Text>
          {opened ? (
            <IconChevronUp size={14} style={{ flexShrink: 0 }} />
          ) : (
            <IconChevronDown size={14} style={{ flexShrink: 0 }} />
          )}
        </Group>
      </UnstyledButton>
      <Collapse expanded={opened}>
        {/* a draft, so not rendered as Markdown (its links would turn live): only its line
            breaks and bold are kept */}
        <Text size="sm" mt="xs" c="var(--chat-muted)" style={{ whiteSpace: "pre-line" }}>
          {content.split(/\*\*(.+?)\*\*/g).map((part, i) =>
            i % 2 ? (
              <Text key={i} span inherit fw={600}>
                {part}
              </Text>
            ) : (
              part
            ),
          )}
        </Text>
      </Collapse>
    </>
  );
}
