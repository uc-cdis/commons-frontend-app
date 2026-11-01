"use client";

import { useMemo } from "react";
import { Box, ScrollArea, Stack, Text, Transition } from "@mantine/core";
import { useIsomorphicEffect } from "@mantine/hooks";
import type { ChatMessage, Timings, ToolResultMessage } from "../../core";
import { MessageItem } from "./MessageItem";
import { RunStatusBanner } from "./RunStatusBanner";
import { JumpToLatest } from "./JumpToLatest";
import { useStickToBottom } from "./useStickToBottom";
import { CHAT_MAX_WIDTH } from "../util";

export interface MessageListProps {
  messages: ChatMessage[];
  isRunning: boolean;
  timings: Timings;
  stopped: boolean;
  chatId: string;
  editableMessageId: string | null;
  onRetry: () => void;
  onEdit: (text: string) => void;
}

export function MessageList({
  messages,
  isRunning,
  timings,
  stopped,
  chatId,
  editableMessageId,
  onRetry,
  onEdit,
}: MessageListProps) {
  const { viewportRef, contentRef, onScrollPositionChange, following, scrollToBottom } =
    useStickToBottom();

  const lastMessage = messages[messages.length - 1];
  const promptId = lastMessage?.role === "user" ? lastMessage.id : null;

  // Two things override the user's scroll position: their own prompt and switching
  // conversations.
  useIsomorphicEffect(() => {
    scrollToBottom("auto");
  }, [chatId]);

  useIsomorphicEffect(() => {
    if (promptId) scrollToBottom("auto");
  }, [promptId]);

  const lastMessageId = lastMessage?.id ?? null;

  const toolResults = useMemo(() => {
    const map = new Map<string, ToolResultMessage>();
    for (const m of messages) {
      if (m.role === "tool") map.set(m.toolCallId, m);
    }
    return map;
  }, [messages]);

  return (
    <Box pos="relative" style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
      <ScrollArea
        flex={1}
        mih={0}
        type="auto"
        viewportRef={viewportRef}
        onScrollPositionChange={onScrollPositionChange}
      >
        <Stack ref={contentRef} gap="md" px="lg" py="md" maw={CHAT_MAX_WIDTH} mx="auto" w="100%">
          {messages.map((message) => (
            <MessageItem
              key={message.id}
              message={message}
              timings={timings}
              toolResults={toolResults}
              editableMessageId={editableMessageId}
              isRunning={isRunning}
              isLast={message.id === lastMessageId}
              onEdit={onEdit}
              onRetry={onRetry}
            />
          ))}

          {isRunning && <RunStatusBanner isRunning durationMs={null} />}

          {!isRunning && stopped && (
            <Text size="xs" c="var(--chat-muted)">
              You stopped this response.
            </Text>
          )}
        </Stack>
      </ScrollArea>

      <Transition mounted={!following} transition="fade-up" duration={150}>
        {(style) => <JumpToLatest style={style} onClick={() => scrollToBottom()} />}
      </Transition>
    </Box>
  );
}
