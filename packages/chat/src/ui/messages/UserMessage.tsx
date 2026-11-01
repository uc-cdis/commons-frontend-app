"use client";

import { useState } from "react";
import { Button, Group, Stack, Textarea } from "@mantine/core";
import { IconPencil, IconRefresh } from "@tabler/icons-react";
import type { ChatMessage } from "../../core";
import { CopyAction } from "./CopyAction";
import { TextAction } from "./TextAction";
import { UserBubble } from "./UserBubble";
import { RunStatusBanner } from "./RunStatusBanner";
import { isSubmitEnter } from "../util";

type UserChatMessage = Extract<ChatMessage, { role: "user" }>;

export interface UserMessageProps {
  message: UserChatMessage;
  durationMs?: number;
  canRewind: boolean;
  onEdit: (text: string) => void;
  onRetry: () => void;
}

export function UserMessage({ message, durationMs, canRewind, onEdit, onRetry }: UserMessageProps) {
  const [draft, setDraft] = useState<string | null>(null);
  // a newer question went out, so this edit has nothing left to replace
  if (draft !== null && !canRewind) setDraft(null);
  const editing = draft !== null;

  const startEditing = () => setDraft(message.content);
  const cancelEditing = () => setDraft(null);

  const commit = () => {
    const trimmed = draft?.trim() ?? "";
    if (trimmed && trimmed !== message.content) onEdit(trimmed);
    setDraft(null);
  };

  if (editing) {
    return (
      <Stack gap="xs" w="100%" maw="80%" style={{ alignSelf: "flex-end" }}>
        <Textarea
          size="md"
          autosize
          /* oxlint-disable-next-line jsx-a11y/no-autofocus */
          autoFocus
          minRows={1}
          maxRows={8}
          value={draft ?? ""}
          aria-label="Edit message"
          onChange={(event) => setDraft(event.currentTarget.value)}
          onKeyDown={(event) => {
            if (isSubmitEnter(event)) {
              event.preventDefault();
              commit();
            }
            if (event.key === "Escape") cancelEditing();
          }}
        />
        <Group justify="flex-end" gap="xs">
          <Button size="xs" variant="subtle" color="var(--chat-action)" onClick={cancelEditing}>
            Cancel
          </Button>
          <Button size="xs" color="var(--chat-primary)" onClick={commit} disabled={!draft.trim()}>
            Send
          </Button>
        </Group>
      </Stack>
    );
  }

  return (
    <>
      <UserBubble message={message} />

      <Group justify="space-between" gap="xs" wrap="nowrap" align="center">
        <div>
          {durationMs !== undefined && (
            <RunStatusBanner isRunning={false} durationMs={durationMs} />
          )}
        </div>

        <Group gap={4} wrap="nowrap">
          <CopyAction value={message.content} label="Copy message" />

          {canRewind && (
            <>
              <TextAction
                icon={<IconPencil size={14} />}
                label="Edit"
                ariaLabel="Edit message"
                onClick={startEditing}
              />
              <TextAction
                icon={<IconRefresh size={14} />}
                label="Retry"
                ariaLabel="Retry this message"
                onClick={onRetry}
              />
            </>
          )}
        </Group>
      </Group>
    </>
  );
}
