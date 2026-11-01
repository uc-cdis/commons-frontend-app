"use client";

import { useMemo } from "react";
import { Box, Group, Stack } from "@mantine/core";
import { CopyAction } from "./CopyAction";
import { MarkdownContent } from "./MarkdownContent";
import { copyableAnswer } from "./copyableAnswer";

export function AnswerCard({ content, isStreaming }: { content: string; isStreaming: boolean }) {
  const copyText = useMemo(
    () => copyableAnswer(content, typeof window === "undefined" ? "" : window.location.origin),
    [content],
  );

  return (
    <Stack gap="xs">
      {/* text streams in before it's clear whether it's the answer or a step's reason (that shows
          once a tool call arrives), so the frame and Copy wait until it's done */}
      <Box className="chat-answer" data-streaming={isStreaming || undefined}>
        <MarkdownContent content={content} />
      </Box>
      {!isStreaming && (
        <Group gap={4}>
          <CopyAction value={copyText} label="Copy answer" />
        </Group>
      )}
    </Stack>
  );
}
