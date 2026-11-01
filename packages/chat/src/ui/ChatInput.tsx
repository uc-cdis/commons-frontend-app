"use client";

import { memo, useState } from "react";
import { ActionIcon, Textarea, Tooltip } from "@mantine/core";
import { IconPlayerStopFilled, IconSend } from "@tabler/icons-react";
import { isSubmitEnter } from "./util";

export interface ChatInputProps {
  isRunning: boolean;
  onSend: (text: string) => void;
  onStop: () => void;
  placeholder?: string;
}

// memo: the chat re-renders as answers stream, and each render makes the textarea re-measure
export const ChatInput = memo(function ChatInput({
  isRunning,
  onSend,
  onStop,
  placeholder,
}: ChatInputProps) {
  const [value, setValue] = useState("");

  const send = () => {
    const trimmed = value.trim();
    if (!trimmed || isRunning) return;
    onSend(trimmed);
    setValue("");
  };

  return (
    <Textarea
      size="md"
      autosize
      minRows={1}
      maxRows={6}
      placeholder={placeholder ?? "Type a message"}
      aria-label="Message"
      value={value}
      onChange={(event) => setValue(event.currentTarget.value)}
      onKeyDown={(event) => {
        if (isSubmitEnter(event)) {
          event.preventDefault();
          send();
        }
      }}
      styles={{ input: { paddingBlock: 10, backgroundColor: "var(--chat-panel)" } }}
      rightSectionWidth={60}
      rightSectionPointerEvents="all"
      rightSection={
        isRunning ? (
          <Tooltip label="Stop" withArrow>
            <ActionIcon
              variant="light"
              color="var(--chat-error)"
              size="lg"
              aria-label="Stop"
              onClick={onStop}
            >
              <IconPlayerStopFilled size={16} />
            </ActionIcon>
          </Tooltip>
        ) : (
          <ActionIcon
            variant="filled"
            color="var(--chat-primary)"
            size="lg"
            aria-label="Send"
            onClick={send}
          >
            <IconSend size={18} />
          </ActionIcon>
        )
      }
    />
  );
});
