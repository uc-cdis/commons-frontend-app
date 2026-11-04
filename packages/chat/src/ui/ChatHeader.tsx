"use client";

import { useState } from "react";
import { Group, Text, UnstyledButton } from "@mantine/core";
import { IconChevronDown } from "@tabler/icons-react";
import { ChatActionsMenu } from "./ChatActionsMenu";
import { TitleInput } from "./TitleInput";

export interface ChatHeaderProps {
  /** none while the chat is new and unsaved */
  title?: string;
  deleteDisabled: boolean;
  onRename: (title: string) => void;
  onDelete: () => void;
}

export function ChatHeader({ title, deleteDisabled, onRename, onDelete }: ChatHeaderProps) {
  const [editing, setEditing] = useState(false);

  return (
    <Group gap="xs" wrap="nowrap" miw={0} flex={1}>
      <Text size="sm" fw={700} c="var(--chat-title)" style={{ flexShrink: 0 }}>
        Chat
      </Text>
      {title !== undefined && (
        <>
          <Text size="sm" c="var(--chat-muted)" aria-hidden style={{ flexShrink: 0 }}>
            /
          </Text>
          {editing ? (
            <TitleInput title={title} onRename={onRename} onDone={() => setEditing(false)} />
          ) : (
            <ChatActionsMenu
              deleteDisabled={deleteDisabled}
              onRename={() => setEditing(true)}
              onDelete={onDelete}
            >
              <UnstyledButton aria-label={`Actions for ${title}`} title={title} miw={0}>
                <Group gap={4} wrap="nowrap" miw={0}>
                  <Text size="sm" truncate="end">
                    {title}
                  </Text>
                  <IconChevronDown size={16} color="var(--chat-accent)" style={{ flexShrink: 0 }} />
                </Group>
              </UnstyledButton>
            </ChatActionsMenu>
          )}
        </>
      )}
    </Group>
  );
}
