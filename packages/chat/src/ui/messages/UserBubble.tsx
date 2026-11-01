import { Paper, Text } from "@mantine/core";
import type { ChatMessage } from "../../core";

export interface UserBubbleProps {
  message: ChatMessage;
}

export function UserBubble({ message }: UserBubbleProps) {
  return (
    <Paper
      px="md"
      py="sm"
      maw="80%"
      bg="var(--chat-accent)"
      c="white"
      style={{
        alignSelf: "flex-end",
        // the mockup's speech-bubble tail: the corner toward the sender is near square
        borderRadius:
          "var(--mantine-radius-lg) var(--mantine-radius-lg) var(--mantine-radius-xs) var(--mantine-radius-lg)",
      }}
    >
      <Text size="md" style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
        {message.content}
      </Text>
    </Paper>
  );
}
