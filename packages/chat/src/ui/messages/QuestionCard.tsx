"use client";

import { Stack, Text } from "@mantine/core";
import { MarkdownContent } from "./MarkdownContent";

/** The agent's question in place of an answer: labelled, its own colour, no Copy. */
export function QuestionCard({ content }: { content: string }) {
  return (
    <Stack className="chat-question" gap="sm">
      <Text size="xs" fw={700} c="var(--chat-accent)" lts="1px">
        NEEDS YOUR INPUT
      </Text>
      <MarkdownContent content={content} />
    </Stack>
  );
}
