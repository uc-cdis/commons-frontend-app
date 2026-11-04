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
      <Box className="chat-answer">
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
