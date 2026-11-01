import { Box, Text, Collapse, Group, UnstyledButton } from "@mantine/core";
import { useState } from "react";
import { IconChevronDown, IconChevronUp } from "@tabler/icons-react";
import { formatDuration } from "../util";

export function ReasoningBlock({
  content,
  durationMs,
  isStreaming,
}: {
  content: string;
  durationMs?: number;
  isStreaming: boolean;
}) {
  // open while it thinks, closed once it's done; a click overrides either way
  const [userOpened, setUserOpened] = useState<boolean | null>(null);
  const opened = userOpened ?? isStreaming;

  const label =
    durationMs !== undefined
      ? `Thought for ${formatDuration(durationMs)}`
      : isStreaming
        ? "Thinking..."
        : "Thought";

  return (
    <>
      <UnstyledButton onClick={() => setUserOpened(!opened)} aria-expanded={opened} w="fit-content">
        <Group gap="xs" c="var(--chat-muted)">
          <Box
            w={11}
            h={11}
            aria-hidden
            style={{ borderRadius: "50%", border: "3px solid currentColor", flexShrink: 0 }}
          />
          <Text size="xs">{label}</Text>
          {opened ? <IconChevronUp size={14} /> : <IconChevronDown size={14} />}
        </Group>
      </UnstyledButton>
      <Collapse expanded={opened}>
        <Text size="sm" mt="xs" c="var(--chat-muted)">
          {content}
        </Text>
      </Collapse>
    </>
  );
}
